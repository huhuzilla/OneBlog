<?php
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

const ONEBLOG_LINK_STATUS_TTL = 86400;
const ONEBLOG_LINK_STATUS_CACHE_VERSION = 2;

function oneblog_json($data) {
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function oneblog_cache_path() {
    $uploadDir = dirname(__DIR__, 3) . '/uploads';
    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, 0755, true);
    }

    return is_writable($uploadDir)
        ? $uploadDir . '/oneblog-link-status.json'
        : __DIR__ . '/oneblog-link-status.json';
}

function oneblog_load_cache() {
    $path = oneblog_cache_path();
    if (!is_file($path)) return [];

    $data = json_decode((string) @file_get_contents($path), true);
    return is_array($data) ? $data : [];
}

function oneblog_save_cache($cache) {
    $path = oneblog_cache_path();
    $dir = dirname($path);
    if (!is_dir($dir) || !is_writable($dir)) return false;

    $lockPath = $path . '.lock';
    $lock = @fopen($lockPath, 'c');
    if (!$lock) return false;

    $ok = false;
    if (@flock($lock, LOCK_EX)) {
        $tmp = tempnam($dir, 'oneblog-link-status-');
        if ($tmp !== false) {
            $json = json_encode($cache, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            if ($json !== false && @file_put_contents($tmp, $json, LOCK_EX) !== false) {
                $ok = @rename($tmp, $path);
            }
            if (!$ok && is_file($tmp)) {
                @unlink($tmp);
            }
        }
        @flock($lock, LOCK_UN);
    }
    @fclose($lock);

    return $ok;
}

function oneblog_prune_cache($cache, $now) {
    $maxAge = ONEBLOG_LINK_STATUS_TTL * 7;
    foreach ($cache as $key => $cached) {
        if (
            !is_array($cached)
            || (int) ($cached['version'] ?? 0) !== ONEBLOG_LINK_STATUS_CACHE_VERSION
            || ($now - (int) ($cached['checked_at'] ?? 0)) > $maxAge
        ) {
            unset($cache[$key]);
        }
    }
    return $cache;
}

function oneblog_normalize_url($url) {
    $url = trim((string) $url);
    if ($url === '') return '';
    if (strpos($url, '//') === 0) return 'https:' . $url;
    if (!preg_match('#^https?://#i', $url)) return 'https://' . $url;
    return $url;
}

function oneblog_is_public_ip($ip) {
    if (!filter_var($ip, FILTER_VALIDATE_IP)) return false;

    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
        return (bool) filter_var(
            $ip,
            FILTER_VALIDATE_IP,
            FILTER_FLAG_IPV4 | FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
        );
    }

    return (bool) filter_var(
        $ip,
        FILTER_VALIDATE_IP,
        FILTER_FLAG_IPV6 | FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
    );
}

function oneblog_is_public_url($url) {
    $parts = parse_url($url);
    if (!$parts || empty($parts['scheme']) || empty($parts['host'])) return false;

    $scheme = strtolower($parts['scheme']);
    if (!in_array($scheme, ['http', 'https'], true)) return false;
    if (!empty($parts['user']) || !empty($parts['pass'])) return false;

    $port = isset($parts['port']) ? (int) $parts['port'] : ($scheme === 'https' ? 443 : 80);
    if (!in_array($port, [80, 443], true)) return false;

    $host = trim($parts['host'], '[]');
    if (filter_var($host, FILTER_VALIDATE_IP)) {
        return oneblog_is_public_ip($host);
    }

    $records = oneblog_dns_records($host);
    if (!$records) return false;

    foreach ($records as $record) {
        $ip = $record['ip'] ?? ($record['ipv6'] ?? '');
        if (!$ip || !oneblog_is_public_ip($ip)) {
            return false;
        }
    }

    return true;
}

function oneblog_resolve_public_ips($url) {
    $parts = parse_url($url);
    if (!$parts || empty($parts['host'])) return [];

    $host = trim($parts['host'], '[]');
    if (filter_var($host, FILTER_VALIDATE_IP)) {
        return oneblog_is_public_ip($host) ? [$host] : [];
    }

    $records = oneblog_dns_records($host);
    if (!$records) return [];

    $ips = [];
    foreach ($records as $record) {
        $ip = $record['ip'] ?? ($record['ipv6'] ?? '');
        if (!$ip || !oneblog_is_public_ip($ip)) {
            return [];
        }
        $ips[] = $ip;
    }

    return array_values(array_unique($ips));
}

function oneblog_dns_records($host) {
    static $cache = [];
    $key = strtolower($host);
    if (array_key_exists($key, $cache)) {
        return $cache[$key];
    }

    $records = @dns_get_record($host, DNS_A + DNS_AAAA);
    return $cache[$key] = is_array($records) ? $records : [];
}

function oneblog_read_urls() {
    $urls = $_POST['urls'] ?? ($_GET['urls'] ?? []);
    if (!empty($_REQUEST['url'])) $urls[] = $_REQUEST['url'];
    if (!is_array($urls)) $urls = [$urls];

    $urls = array_values(array_unique(array_filter(array_map('oneblog_normalize_url', $urls))));
    $urls = array_values(array_filter($urls, 'oneblog_is_public_url'));
    return array_slice($urls, 0, 30);
}

function oneblog_is_online_code($code) {
    $code = (int) $code;
    if ($code === 0) return false;

    if (in_array($code, [401, 403, 429], true)) {
        return true;
    }

    return $code >= 200 && $code < 500 && $code !== 404;
}

function oneblog_curl_options($url, $isHead) {
    $options = [
        CURLOPT_URL => $url,
        CURLOPT_TIMEOUT => 8,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_NOBODY => $isHead,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_USERAGENT => 'Oneblog-LinkChecker',
    ];

    if (defined('CURLOPT_RESOLVE')) {
        $parts = parse_url($url);
        $host = $parts['host'] ?? '';
        $scheme = strtolower($parts['scheme'] ?? 'http');
        $port = !empty($parts['port']) ? (int) $parts['port'] : ($scheme === 'https' ? 443 : 80);
        if ($host) {
            $resolve = [];
            foreach (oneblog_resolve_public_ips($url) as $ip) {
                $resolve[] = $host . ':' . $port . ':' . $ip;
            }
            if ($resolve) {
                $options[CURLOPT_RESOLVE] = $resolve;
            }
        }
    }

    return $options;
}

function oneblog_check_once($url, $isHead) {
    $ch = curl_init();
    curl_setopt_array($ch, oneblog_curl_options($url, $isHead));
    curl_exec($ch);

    $result = [
        'code' => (int) curl_getinfo($ch, CURLINFO_HTTP_CODE),
    ];

    curl_close($ch);
    return $result;
}

function oneblog_check_multi($urls, $isHead) {
    if (!$urls) return [];
    if (!function_exists('curl_multi_init')) {
        $results = [];
        foreach ($urls as $url) {
            $results[$url] = oneblog_check_once($url, $isHead);
        }
        return $results;
    }

    $mh = curl_multi_init();
    $channels = [];

    foreach ($urls as $url) {
        $ch = curl_init();
        curl_setopt_array($ch, oneblog_curl_options($url, $isHead));
        curl_multi_add_handle($mh, $ch);
        $channels[$url] = $ch;
    }

    do {
        $status = curl_multi_exec($mh, $active);
        if ($active) curl_multi_select($mh, 0.5);
    } while ($active && $status === CURLM_OK);

    $results = [];
    foreach ($channels as $url => $ch) {
        $results[$url] = [
            'code' => (int) curl_getinfo($ch, CURLINFO_HTTP_CODE),
        ];
        curl_multi_remove_handle($mh, $ch);
        curl_close($ch);
    }

    curl_multi_close($mh);
    return $results;
}

function oneblog_https_handshake($url) {
    $parts = parse_url($url);
    $host = $parts['host'] ?? '';
    if (!$host) return false;

    $port = !empty($parts['port']) ? (int) $parts['port'] : 443;
    $ips = oneblog_resolve_public_ips($url);
    if (!$ips) return false;

    $context = stream_context_create([
        'ssl' => [
            'peer_name' => $host,
            'verify_peer' => false,
            'verify_peer_name' => false,
        ],
    ]);
    $fp = @stream_socket_client('ssl://' . $ips[0] . ':' . $port, $errno, $error, 6, STREAM_CLIENT_CONNECT, $context);

    if ($fp) {
        fclose($fp);
        return true;
    }

    return false;
}

function oneblog_build_result($url, $checks) {
    $final = end($checks) ?: ['code' => 0];
    $online = oneblog_is_online_code($final['code']);

    if (!$online && (int) $final['code'] === 0) {
        if (oneblog_https_handshake($url)) {
            $online = true;
        }
    }

    return [
        'status' => $online ? 'ok' : 'error',
        'checked_at' => time(),
        'version' => ONEBLOG_LINK_STATUS_CACHE_VERSION,
        'url' => $url,
    ];
}

$urls = oneblog_read_urls();
if (!$urls) {
    oneblog_json(['success' => false, 'message' => 'No url provided']);
}

$cache = oneblog_load_cache();
$items = [];
$needCheck = [];
$now = time();
$cache = oneblog_prune_cache($cache, $now);

foreach ($urls as $url) {
    $key = md5($url);
    $cached = $cache[$key] ?? null;

    if (
        is_array($cached)
        && (int) ($cached['version'] ?? 0) === ONEBLOG_LINK_STATUS_CACHE_VERSION
        && ($now - (int) ($cached['checked_at'] ?? 0)) < ONEBLOG_LINK_STATUS_TTL
    ) {
        $items[$url] = $cached['status'];
    } else {
        $needCheck[] = $url;
    }
}

if ($needCheck) {
    $headResults = oneblog_check_multi($needCheck, true);
    $checksByUrl = [];
    $needGet = [];

    foreach ($needCheck as $url) {
        $head = $headResults[$url] ?? ['code' => 0];
        $checksByUrl[$url] = [$head];
        if ($head['code'] === 0 || $head['code'] === 405) {
            $needGet[] = $url;
        }
    }

    $getResults = oneblog_check_multi($needGet, false);
    foreach ($needGet as $url) {
        if (!empty($getResults[$url])) {
            $checksByUrl[$url][] = $getResults[$url];
        }
    }

    foreach ($needCheck as $url) {
        $result = oneblog_build_result($url, $checksByUrl[$url] ?? []);
        $cache[md5($url)] = $result;
        $items[$url] = $result['status'];
    }
}

foreach ($cache as &$cached) {
    if (is_array($cached)) {
        unset($cached['time']);
    }
}
unset($cached);

oneblog_save_cache($cache);

oneblog_json(['success' => true, 'items' => $items]);
