<?php
/**
 * 微语页面
 *
 * @package custom
 */

if (!defined('__TYPECHO_ROOT_DIR__')) exit;
$this->need('header.php');
$export = Typecho_Plugin::export();
$memosImageEnabled = isset($export['activated']['MemosImage']);
ob_start();
$this->commentUrl();
$oneblogCommentUrl = ob_get_clean();
ob_start();
$this->options->loginAction();
$oneblogLoginAction = ob_get_clean();
ob_start();
Helper::options()->index('?commentLike=dz');
$oneblogCommentLikeUrl = ob_get_clean();
?>
<meta name="csrf-token" content="<?php echo htmlspecialchars(Helper::security()->getToken($this->request->getRequestUrl()), ENT_QUOTES, 'UTF-8'); ?>">
<meta name="comment-url" content="<?php echo htmlspecialchars($oneblogCommentUrl, ENT_QUOTES, 'UTF-8'); ?>">

<div class="main">
<?php $this->need('module/head2.php'); ?>

<div class="page_thumb blur">
    <div class="post_bg lazy-load"
         data-src="<?php echo htmlspecialchars($this->fields->thumb ? $this->fields->thumb : Helper::options()->themeUrl . '/static/img/memos.jpg', ENT_QUOTES, 'UTF-8'); ?>">
    </div>

    <div class="pc">
        <i class="iconfont icon-nav menu-button"></i>
        <div class="page-head">
            <?php if ($this->options->logoStyle == 'text') : ?>
                <h1>
                    <a href="<?php $this->options->siteUrl(); ?>"><?php $this->options->title(); ?></a>
                    <span class="soul">生活志</span>
                </h1>
            <?php else : ?>
                <a class="logo" href="<?php $this->options->siteUrl(); ?>">
                    <img src="<?php echo htmlspecialchars($this->options->logoWhite ?: Helper::options()->themeUrl . '/static/img/logoWhite.svg', ENT_QUOTES, 'UTF-8'); ?>">
                </a>
            <?php endif; ?>
        </div>
    </div>

    <div class="m">
        <h1 class="page-head">
            <?php $this->archiveTitle(' &raquo; ', ''); ?>
            <span>A fleeting inspiration</span>
        </h1>
    </div>

    <div class="memos-btn">
        <?php if ($this->user->hasLogin()) : ?>
            <button id="publish-button">发布</button>
        <?php else : ?>
            <button id="login-button">登录</button>
        <?php endif; ?>
    </div>
</div>

<!-- 微语列表 -->
<div id="comments" class="memos padding animate__animated animate__fadeIn blur">
    <?php $this->comments()->to($comments); ?>
    <?php if ($comments->have()) : ?>
        <ul class="comment-list">
            <?php while ($comments->next()) : ?>
                <?php MemosList($comments, $this->user); ?>
            <?php endwhile; ?>
        </ul>

        <?php $comments->pageNav('', ''); ?>

        <div class="load" id="load-more-comments">加载更多动态</div>

        <div id="loading-spinner" style="display: none;">
            <div class="spinner"></div><span>加载中...</span>
        </div>

        <div class="load" id="no-more" style="display: none;">
            —&nbsp;已加载全部数据&nbsp;—
        </div>
    <?php endif; ?>
</div>

<a id="gototop" class="hidden"><i class="iconfont icon-up"></i></a>
</div>

<script>
    var loginAction = <?php echo json_encode($oneblogLoginAction, JSON_UNESCAPED_SLASHES); ?>;
    var commentLikeUrl = <?php echo json_encode($oneblogCommentLikeUrl, JSON_UNESCAPED_SLASHES); ?>;
    <?php if ($memosImageEnabled) : ?>
    <?php $plugin = $this->options->plugin('MemosImage'); ?>
    <?php
    ob_start();
    Helper::options()->index('/action/memos-upload');
    $oneblogMemosUploadUrl = ob_get_clean();
    ob_start();
    Helper::options()->index('/action/memos-sign');
    $oneblogMemosSignUrl = ob_get_clean();
    ?>
    window.memosConfig = Object.assign({}, window.memosConfig || {}, {
        enabled: true,
        memosUseCos: <?php echo json_encode(($plugin->uploadMode ?: 'local') === 'cos'); ?>,
        memosUploadUrl: <?php echo json_encode($oneblogMemosUploadUrl, JSON_UNESCAPED_SLASHES); ?>,
        memosSignUrl: <?php echo json_encode($oneblogMemosSignUrl, JSON_UNESCAPED_SLASHES); ?>
    });
    <?php endif; ?>
</script>

<?php $this->need('footer.php'); ?>
