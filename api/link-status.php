<?php
header('Content-Type: application/json; charset=UTF-8');

const ONEBLOG_LINK_STATUS_TTL = 86400;

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
    @file_put_contents(oneblog_cache_path(), json_encode($cache, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
}

function oneblog_normalize_url($url) {
    $url = trim((string) $url);
    if ($url === '') return '';
    if (strpos($url, '//') === 0) return 'https:' . $url;
    if (!preg_match('#^https?://#i', $url)) return 'https://' . $url;
    return $url;
}

function oneblog_read_urls() {
    $urls = $_POST['urls'] ?? ($_GET['urls'] ?? []);
    if (!empty($_REQUEST['url'])) $urls[] = $_REQUEST['url'];
    if (!is_array($urls)) $urls = [$urls];

    $urls = array_values(array_unique(array_filter(array_map('oneblog_normalize_url', $urls))));
    return array_slice($urls, 0, 30);
}

function oneblog_is_online_code($code) {
    $code = (int) $code;
    return $code >= 200 && $code < 400;
}

function oneblog_curl_time($ch) {
    return (int) round(((float) curl_getinfo($ch, CURLINFO_NAMELOOKUP_TIME)) * 1000) . ' ms';
}

function oneblog_curl_options($url, $isHead) {
    return [
        CURLOPT_URL => $url,
        CURLOPT_TIMEOUT => 8,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_NOBODY => $isHead,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 3,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_USERAGENT => 'LinkCheck/1.0',
    ];
}

function oneblog_check_once($url, $isHead) {
    $ch = curl_init();
    curl_setopt_array($ch, oneblog_curl_options($url, $isHead));
    curl_exec($ch);

    $result = [
        'code' => (int) curl_getinfo($ch, CURLINFO_HTTP_CODE),
        'time' => oneblog_curl_time($ch),
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
            'time' => oneblog_curl_time($ch),
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
    if (!$host) return ['ok' => false, 'time' => '0 ms'];

    $start = microtime(true);
    $port = !empty($parts['port']) ? (int) $parts['port'] : 443;
    $fp = @stream_socket_client('ssl://' . $host . ':' . $port, $errno, $error, 6, STREAM_CLIENT_CONNECT);
    $time = (int) round((microtime(true) - $start) * 1000) . ' ms';

    if ($fp) {
        fclose($fp);
        return ['ok' => true, 'time' => $time];
    }

    return ['ok' => false, 'time' => $time];
}

function oneblog_build_result($url, $checks) {
    $final = end($checks) ?: ['code' => 0, 'time' => '0 ms'];
    $online = oneblog_is_online_code($final['code']);

    if (!$online && (int) $final['code'] === 0) {
        $handshake = oneblog_https_handshake($url);
        if ($handshake['ok']) {
            $online = true;
            $final['time'] = $handshake['time'];
        }
    }

    return [
        'status' => $online ? 'ok' : 'error',
        'time' => $final['time'],
        'checked_at' => time(),
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

foreach ($urls as $url) {
    $key = md5($url);
    $cached = $cache[$key] ?? null;

    if (is_array($cached) && ($now - (int) ($cached['checked_at'] ?? 0)) < ONEBLOG_LINK_STATUS_TTL) {
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
        $head = $headResults[$url] ?? ['code' => 0, 'time' => '0 ms'];
        $checksByUrl[$url] = [$head];
        if ($head['code'] === 0 || in_array($head['code'], [403, 405], true)) {
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

oneblog_save_cache($cache);

$times = [];
foreach ($urls as $url) {
    $times[$url] = $cache[md5($url)]['time'] ?? '';
}

oneblog_json(['success' => true, 'items' => $items, 'times' => $times]);