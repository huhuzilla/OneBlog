<?php
/**
 *
 * 一款简约文艺的文字博客主题：那些物质的东西，都会随着时间慢慢销蚀，而我们写下的文字，最趋近于永恒。唯愿不忘初心，坚持把自己的博客写下去。本主题作者是一名律师，工作越来越忙，主题事宜请先仔细查阅官方文档，也可在QQ交流群939170079咨询博友。
 * 官网：<a href="https://onenote.io">onenote.io</a>
 * 文档：<a href="https://docs.oneblog.net">docs.oneblog.net</a>
 * 
 * @package OneBlog
 * @author 彼岸临窗
 * @version 3.6.5
 * @link https://onenote.io
 */
if (!defined('__TYPECHO_ROOT_DIR__')) exit;

$this->need('header.php'); ?>
<div class="main">
<?php $this->need('module/head.php');
if ($this->is('index')){
    //首页显示banner
    if ($this->options->switch == 'on') {
        $defaultThumb = Helper::options()->themeUrl . '/static/img/bg.jpg';
        $defaultPost = [
            'link' => 'https://oneblog.net',
            'title' => '请填写文章cid',
            'thumb' => $defaultThumb,
        ];
        $posts = [];
        $rawData = get_banner_data($this->options);
    
        foreach ($rawData as $row) {
            $post = Typecho_Widget::widget('Widget_Abstract_Contents');
            $post->push($row);
            $thumbnailRaw = showThumbnail($post) ?: $defaultThumb;
    
            // 如果有缩略图处理参数
            if ($thumbnailRaw !== $defaultThumb && $this->options->imgSmall) {
                $thumbnail = $thumbnailRaw . $this->options->imgSmall;
            } else {
                $thumbnail = $thumbnailRaw;
            }
    
            $posts[] = [
                'link' => $post->permalink,
                'title' => $post->hidden ? '密码保护：' . $post->row['title'] : $post->row['title'],
                'thumb' => $thumbnail,
            ];
        }
    
        // 如果数量不足3，用默认占位
        for ($i = count($posts); $i < 3; $i++) {
            $posts[] = $defaultPost;
        }?>
        
        
        <!-- 骨架屏 -->
        <div id="banner-skeleton">
            <!-- 移动端骨架屏 -->
            <div class="banner-skeleton-mobile m">
                <div class="skeleton-banner-thumb-mobile skeleton-thumb-relative">
                    <div class="skeleton-banner-indicator">
                        <span class="skeleton-dot"></span>
                        <span class="skeleton-dot"></span>
                        <span class="skeleton-dot"></span>
                    </div>
                </div>
            </div>
            <!-- PC端骨架屏 -->
            <div class="banner-skeleton-pc">
                <div class="skeleton-banner-item-main">
                    <div class="skeleton-banner-thumb-main"></div>
                </div>
                <div class="skeleton-banner-item-side">
                    <div class="skeleton-banner-thumb-side"></div>
                    <div class="skeleton-banner-thumb-side"></div>
                </div>
            </div>
        </div>
        
        <!-- 根据设备类型自动生成banner内容 -->
        <div class="banner-container blur"></div>
        
        <script id="banner-json" type="application/json">
          <?= json_encode($posts, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); ?>
        </script>
<?php }
}elseif($this->is('tag')){ ?>
    <div class="category-header m blur" style="background-image: url('<?php $this->options->Tagbg();?>');">
        <div class="category-info">
            <h1># <?php $this->archiveTitle('%s', '', ''); ?></h1>
        </div>
    </div>
<?php }elseif($this->is('category')){?>
    <div class="category-header m blur" style="background-image: url('<?php $info = CatInfo($this->getDescription()); echo $info['img']; ?>');">
        <div class="category-info">
            <h1><?php $this->archiveTitle('%s', '', ''); ?></h1>
            <span><?php echo $info['info']; ?></span>
        </div>
    </div>
<?php }elseif($this->is('search') and $this->have()){?>
    <div class="search-title m blur">
        <span>「<?php $this->archiveTitle('%s', '', ''); ?>」</span>相关的<?php echo $this->getTotal().'篇文章';?>
    </div>
<?php }?>
<?php if ($this->have()): ?>
    <!--文章列表-->
    <div id="posts" class="blur">
        <?php while($this->next()): ?>
        <a href="<?php $this->permalink() ?>" class="post" >
            <h1 class="animate__animated animate__fadeInUp">
                <?php echo $this->hidden ? '密码保护：' . $this->row['title'] : $this->row['title'];?>
            </h1>
            <div class="post_preview animate__animated animate__fadeInUp">
                <p><?php $this->excerpt(80,'...'); ?></p>
                <?php if(showThumbnail($this)):?>
                <div class="post_img lazy-load" data-src="<?php echo showThumbnail($this) . ($this->options->imgSmall ?: ''); ?>">
                </div>
                <?php endif;?>
            </div>
            <div class="post_meta animate__animated animate__fadeInUp">
                <span><?php echo time_ago($this->date); ?></span>
                <span><?php get_post_view($this) ?>&nbsp;阅读</span>
                <span><?php $this->commentsNum('0 评论', '1 评论', '%d 评论'); ?></span>
            </div>
        </a>
        <?php endwhile; ?>
    </div>
    <!--点击无限加载-->
    <div class="load blur" id="loadmore">
         <?php $this->pageLink('点击查看更多','next'); ?>
    </div>
<?php else: ?>
    <div class="nodata blur">
        <img src='<?php $this->options->themeUrl('static/img/nodata.svg'); ?>'></img>
        <span>暂无相关内容</span>
        <a href="<?php $this->options->siteUrl(); ?>">返回首页</a>
    </div>
<?php endif; ?>
</div>
<!--返回顶部-->
<a id="gototop" class="hidden pc"><i class="iconfont icon-up"></i></a>
    


<?php $this->need('footer.php'); ?>
