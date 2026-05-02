/**
 * Updated: 2026-5-1
 * Author: ©彼岸临窗 onenote.io
 *
 * 注释含命名规范，开源不易，如需引用请注明来源:彼岸临窗 https://onenote.io。
 * 本主题已取得软件著作权（登记号：2025SR0334142）和外观设计专利（专利号：第7121519号），请严格遵循GPL-2.0协议使用本主题及源码。
 */
 
/**核心依赖请勿改动或删除 否则会出现各种异常**/
const _0x5a1b=['T25lQmxvZw==','aHR0cHM6Ly9kb2NzLm9uZW5vdGUuaW8=','Y29weXJpZ2h0LXBj','Y29weXJpZ2h0LW0=','aHJlZg==','dGV4dENvbnRlbnQ=','dHJpbQ==','PGRpdiBjbGFzcz0iY29weXJpZ2h0LWluZm8iPuW8gOa6kOS4jeaYk++8jOivt+WwiumHjeS9nOiAheeJiOadg++8jOS/neeVmeWfuuacrOeahOeJiOadg+S/oeaBr+OAgjwvZGl2Pg==','bG9hZA=='];const _0x2f9c=function(_0x5a1b3a,_0x2f9c42){_0x5a1b3a=_0x5a1b3a-0x0;let _0x3c8d9f=_0x5a1b[_0x5a1b3a];if(_0x2f9c['init']===undefined){(function(){const _0x1='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';window['atob']||(window['atob']=function(_0x2){const _0x3=String(_0x2)['replace'](/=+$/,'');let _0x4='';for(let _0x5=0x0,_0x6,_0x7,_0x8=0x0;_0x7=_0x3['charAt'](_0x8++);~_0x7&&(_0x6=_0x5%0x4?_0x6*0x40+_0x7:_0x7,_0x5++%0x4)?_0x4+=String['fromCharCode'](0xff&_0x6>>(-0x2*_0x5&0x6)):0x0){_0x7=_0x1['indexOf'](_0x7);}return _0x4;});}());_0x2f9c['decode']=function(_0x9){const _0xa=atob(_0x9);let _0xb='';for(let _0xc=0x0;_0xc<_0xa['length'];_0xc++){_0xb+='%'+('00'+_0xa['charCodeAt'](_0xc)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0xb);};_0x2f9c['cache']={};_0x2f9c['init']=true;}const _0xd=_0x2f9c['cache'][_0x5a1b3a];if(_0xd===undefined){_0x3c8d9f=_0x2f9c['decode'](_0x3c8d9f);_0x2f9c['cache'][_0x5a1b3a]=_0x3c8d9f;}else{_0x3c8d9f=_0xd;}return _0x3c8d9f;};function base(){const _0xtext=_0x2f9c('0x0');const _0xhref=_0x2f9c('0x1');const _0xids=[_0x2f9c('0x2'),_0x2f9c('0x3')];let _0xok=true;for(const _0xid of _0xids){const _0xel=document['getElementById'](_0xid);if(!_0xel){_0xok=false;break;}const _0xh=_0xel['getAttribute'](_0x2f9c('0x4'));const _0xt=_0xel[_0x2f9c('0x5')][_0x2f9c('0x6')]();if(!_0xh||!_0xt||_0xh!==_0xhref||_0xt!==_0xtext){_0xok=false;break;}}if(!_0xok){document['body']['innerHTML']=_0x2f9c('0x7');}}window['addEventListener'](_0x2f9c('0x8'),base);
 
//自动显示与隐藏顶部菜单，给阅读区域留出更大空间
(function () {
    if (window.innerWidth < 768) {
    var topMenu = document.querySelector(".header");
    if (!topMenu) return; 
    var lastScrollTop = 50;
    function throttle(func, delay) {
        var lastTime = 0;
        return function () {
            var now = Date.now();
            if (now - lastTime >= delay) {
                func.apply(this, arguments);
                lastTime = now;
            }
        };
    }
    function handleScroll() {
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > 50 && scrollTop > lastScrollTop) {
            topMenu.classList.add("hide");
        } else {
            topMenu.classList.remove("hide");
        }
        lastScrollTop = scrollTop <= 50 ? 50 : scrollTop;
    }
    window.addEventListener("scroll", throttle(handleScroll, 100), false);
    }
})(); 


/*自定义菜单效果*/
const $menu = $(".menu");
const $openBtn = $(".icon-nav");
const $body = $("body");
const $header = $(".header");
const $commonElements = $(".blur");
const searchLayer = $('.search-layer');
const $main = $(".main");

function showNativeMenu() {
  if (!$main.length) return;
  const mainRect = $main[0].getBoundingClientRect();
  const scrollTop = $(window).scrollTop();
  const menuTop = mainRect.top + scrollTop;
  const menuLeft = mainRect.right + 10;
  $menu.css({ left: menuLeft, top: menuTop }).addClass('active');
  setTimeout(() => {
    $(document).on('click.menu', hideNativeMenu);
  }, 10);
  $('.menu > li').each(function(idx) {
      $(this)
        .addClass('animate__animated fadeInLeftShort')
        .css('animation-delay', (idx * 0.09) + 's');
    });
}

function hideNativeMenu() {
  $menu.removeClass('active');
  $(document).off('click.menu');
  $('.menu > li').each(function(){
  $(this)
    .removeClass('animate__animated fadeInLeftShort')
    .css('animation-delay', '');
});
}

// 切换移动菜单状态
function toggleMenuState(isOpen) {
    $menu.toggleClass("active", isOpen);
    $body.toggleClass("noscroll", isOpen);
    $commonElements.add($header).toggleClass("no-scroll", isOpen);
}

// 搜索框功能
function openSearch() {
    hideNativeMenu();//打开搜索框需要关闭菜单
    searchLayer.fadeIn(200).addClass('search-active');
    if (window.innerWidth < 768) {
        $body.addClass('noscroll');
        $commonElements.addClass('no-scroll');
        $header.addClass('bottom-line');
    }
}

function closeSearch() {
    searchLayer.removeClass('search-active').fadeOut(200);
    if (window.innerWidth < 768) {
        $body.removeClass('noscroll');
        $commonElements.removeClass('no-scroll');
        $header.removeClass('bottom-line');
    }
}

function closeSearchIfOpen() {
    if (searchLayer.hasClass('search-active')) {
        closeSearch();
        return true;
    }
    return false;
}

// 菜单按钮点击事件
$('.icon-nav').on('click', function (e) {
    e.stopPropagation();
    
    if (window.innerWidth >= 768) {
        // PC端 - 使用现有菜单容器
        showNativeMenu();
    } else {
        // 移动端逻辑
        const wasSearchOpen = closeSearchIfOpen();
        const isMenuOpen = $menu.hasClass("active");
        
        if (wasSearchOpen && !isMenuOpen) {
            setTimeout(() => toggleMenuState(true), 10);
        } else {
            toggleMenuState(!isMenuOpen);
        }
    }
});

// 事件委托处理
$(document)
    .on("click", ".menu", function(e) {
        e.stopPropagation();
    })
    .on("click", "#close", function(e) {
        e.stopPropagation();
        toggleMenuState(false);
    })
    .on("click", ".close-search", function(e) {
        e.stopPropagation();
        closeSearch();
    })
    .on("click", function(e) {
        // 移动端菜单关闭
        if ($menu.hasClass("active") && !$(e.target).closest('.menu, .icon-nav').length) {
            toggleMenuState(false);
        }
        
        // PC端菜单关闭
        if ($menu.hasClass('active') && !$(e.target).closest('.menu, .icon-nav').length) {
            hideNativeMenu();
        }
        
        // 搜索框关闭
        if (searchLayer.hasClass('search-active') && !$(e.target).closest('.search-layer, #search-btn').length) {
            closeSearch();
        }
    });

// 搜索按钮
$('#search-btn').on('click', function(e) {
    e.stopPropagation();
    searchLayer.hasClass('search-active') ? closeSearch() : openSearch();
});

// ESC键处理
$(document).keyup(function(e) {
    if (e.key === 'Escape') {
        closeSearch();
        
        if (window.innerWidth < 768) {
            if ($menu.hasClass("active")) {
                toggleMenuState(false);
            }
        } else {
            if ($menu.hasClass('active')) {
                hideNativeMenu();
            }
        }
    }
});
/** 顶部菜单结束 **/

/**首页轮播图初始化**/
function renderBanner(options = {}) {
  const {
    bannerSwitch = 'on',
    jsonId = 'banner-json',
    containerSelector = '.banner-container'
  } = options;

  const isMobile = window.innerWidth < 768;
  const isHome = location.pathname === '/' || location.pathname === '/index';

  if (bannerSwitch !== 'on' || !isHome) return;

  const jsonEl = document.getElementById(jsonId);
  if (!jsonEl) return;

  let posts = [];
  try {
    posts = JSON.parse(jsonEl.textContent);
  } catch (e) {
    console.error('无效的 banner JSON', e);
    return;
  }
  if (!posts.length) return;

  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.innerHTML = ''; // 清空容器

  // 移除骨架屏
  const skeleton = document.getElementById('banner-skeleton');
  if (skeleton) skeleton.remove();


  if (isMobile) {
    // 生成移动端 swiper
    container.innerHTML = `
      <div class="swiper m">
        <div class="swiper-wrapper">
          ${posts.slice(0, 3).map(post => `
            <div class="swiper-slide">
              <a href="${post.link}" title="${post.title}" style="background-image:url('${post.thumb}')">
                <h1>${post.title}</h1>
              </a>
            </div>
          `).join('')}
        </div>
        <div class="swiper-pagination m"></div>
      </div>
    `;

    if (typeof Swiper !== 'undefined') {
      new Swiper('.swiper', {
        autoplay: true,
        loop: true,
        pagination: {
          el: '.swiper-pagination',
          type: 'custom',
          renderCustom: function (swiper, current, total) {
            return Array.from({ length: total }).map((_, i) =>
              `<span class="swiper-pagination-bullet${i + 1 === current ? ' swiper-pagination-bullet-active' : ''}"></span>`
            ).join('');
          }
        }
      });
    }
  } else {
    // 生成 PC 端 banner
    const banner = document.createElement('div');
    banner.className = 'banner pc';

    const item1 = document.createElement('div');
    item1.className = 'banner-item';
    item1.innerHTML = `
      <a href="${posts[0].link}" title="${posts[0].title}">
        <div class="banner-thumb lazy-load" data-src="${posts[0].thumb}">
          <div class="banner-title"><h1>${posts[0].title}</h1></div>
        </div>
      </a>
    `;

    const item2 = document.createElement('div');
    item2.className = 'banner-item';
    for (let i = 1; i <= 2; i++) {
      if (!posts[i]) continue;
      item2.innerHTML += `
        <a href="${posts[i].link}" title="${posts[i].title}">
          <div class="banner-thumb lazy-load" data-src="${posts[i].thumb}">
            <div class="banner-title"><h1>${posts[i].title}</h1></div>
          </div>
        </a>
      `;
    }
    banner.appendChild(item1);
    banner.appendChild(item2);
    container.appendChild(banner);

    // 调用懒加载函数，如有需要
    if (typeof initLazyLoad === 'function') {
      initLazyLoad();
    }
  }
}

// 懒加载逻辑
function initLazyLoad() {
    const lazyImages = Array.from(document.querySelectorAll('.lazy-load:not(.loaded):not(.failed)'));
    let loading = false;

    // 队列中第一个进入视口的图片加载
    function tryLoadNext() {
        if (loading) return;
        const next = lazyImages.find(img => img.classList.contains('in-view') && !img.classList.contains('loaded') && !img.classList.contains('failed'));
        if (!next) return;
        loading = true;
        const src = next.getAttribute('data-src');
        const tempImg = new Image();
        tempImg.src = src;
        tempImg.onload = () => {
            if (next.tagName.toLowerCase() === 'img') {
                next.src = src;
            } else {
                next.style.backgroundImage = `url('${src}')`;
            }
            next.classList.add('loaded');
            loading = false;
            tryLoadNext();
        };
        tempImg.onerror = () => {
            if (next.tagName.toLowerCase() === 'img') {
                next.src = '/usr/themes/OneBlog/static/img/error.jpg'; 
            } else {
                next.style.backgroundImage = `url('/usr/themes/OneBlog/static/img/error.jpg')`;
            }
            next.classList.add('failed');
            loading = false;
            tryLoadNext();
        };
    }

    // 只标记进入视口，不立即加载
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                tryLoadNext();
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.1
    });

    lazyImages.forEach(img => io.observe(img));
}

//加载更多
jQuery(document).ready(function($) {
    // 初始化懒加载
    initLazyLoad();
    let isLoading = false;
    function loadNextPage() {
        if (isLoading) return;
        var $next = $('.next');
        var href = $next.attr('href');
        if (!href) return;
        isLoading = true;
        $next.addClass('loading').text('正在努力加载…');
        $.ajax({
            url: href,
            type: 'get',
            error: function(request) {
                console.error('加载失败:', request);
                $next.removeClass('loading').text('点击查看更多');
                isLoading = false;
            },
            success: function(data) {
                $next.removeClass('loading').text('点击查看更多');
                // 提取新文章内容
                var $res = $(data).find('.post,.photo');
                $('#posts,#photos').append($res.fadeIn(300));

                // 替换下一页链接或结束提示
                var newhref = $(data).find('.next').attr('href');
                if (newhref) {
                    $next.attr('href', newhref);
                } else {
                    $next.remove();
                    document.getElementById("loadmore").innerHTML = "—&nbsp;&nbsp;&nbsp;暂无更多内容&nbsp;&nbsp;&nbsp;—";
                }

                initLazyLoad();
                
                $res.each(function() {
                    applyExcerptTruncate(this); // 仅对新增元素处理
                });
                
                isLoading = false;
            }
        });
    }

    // PC 端点击加载
    $('.next').click(function(e) {
        e.preventDefault();
        loadNextPage();
    });

    // 移动端自动触底加载
    if ($(window).width() < 768) {
        $(window).on('scroll', function() {
            if (isLoading) return;
            // 距离底部 100px 内触发加载
            if ($(window).scrollTop() + $(window).height() + 100 >= $(document).height()) {
                loadNextPage();
            }
        });
    }
});


/*返回顶部,按钮在页面最底部固定浮动*/
$(document).ready(function(){
    // 判断是否为移动端（屏幕宽度 < 768px）
    var isMobile = window.innerWidth < 768;
    if (isMobile) return; // 移动端不执行返回顶部逻辑
    
    $(window).scroll(function(){
        var scroTop = $(window).scrollTop();
        var awayBtm = $(document).height() - $(window).scrollTop() - $(window).height();
        var minAwayBtm = 270;

        if(scroTop > 400){
            $('#gototop').fadeIn(500);
            $('#gototop').removeClass('hidden');
        } else {
            $('#gototop').fadeOut(500);
        }

        if (awayBtm <= minAwayBtm){
            $('#gototop').addClass('newtotop');
        } else {
            $('#gototop').removeClass('newtotop');
        }
    });

    $('#gototop').click(function(){
        $('html,body').animate({scrollTop: 0}, 'fast');
    });
});

// 摘要截取函数：移动端显示40字符摘要
function applyExcerptTruncate(context = document) {
    if (window.innerWidth > 768) return; // 只在移动端执行
    context.querySelectorAll('.post_preview p').forEach(el => {
        let text = el.getAttribute('data-full') || el.textContent.trim();
        // 首次设置 data-full 保证加载更多时不重复截断
        if (!el.getAttribute('data-full')) {
            el.setAttribute('data-full', text);
        }
        if (text.length > 40) {
            el.textContent = text.slice(0, 40) + '...';
        } else {
            el.textContent = text;
        }
    });
}


// 首次加载时执行
document.addEventListener('DOMContentLoaded', function () {
    renderBanner({
      bannerSwitch: typeof bannerSwitch !== 'undefined' ? bannerSwitch : 'on'
    });
    applyExcerptTruncate();
    finishLoading(1000);
});


/** 用户登录弹框 **/
document.addEventListener('DOMContentLoaded', function() {
    var loginButton = document.getElementById('login-button');
    if (!loginButton) {
        return; 
    }
    var maxAttempts = 5; // 最大尝试次数
    var lockoutMinutes = 180; // 锁定时间，以分钟为单位
    loginButton.addEventListener('click', openLoginPopup);
    function openLoginPopup() {
        if (isLockedOut()) {
            layer.msg(`登录过于频繁，请稍后再试！`);
            return;
        } else {
            clearLoginAttempts(); 
        }
        layer.open({
            type: 1,
            title: ' ',
            area: ['320px', 'auto'],
            skin: 'layui-memos',
            shadeClose: true,
            closeBtn: 1,
            content: `
                <form class="memos-form" id="login-form" method="post">
                    <h3>登录</h3>
                    <div class="flex-column">
                        <label for="name">账号</label>
                        <div class="inputForm">
                            <i class="iconfont icon-zhanghao"></i>
                            <input required class="input" type="text" name="name" id="name" placeholder="请输入账号" />
                        </div>
                    </div>
                    <div class="flex-column">
                        <label for="password">密码</label>
                        <div class="inputForm">
                            <i class="iconfont icon-mima"></i>
                            <input required class="input" type="password" name="password" id="password" placeholder="请输入密码" />
                            <i class="iconfont icon-eye" id="toggle-password"></i>
                        </div>
                    </div>
                    <button type="submit" id="submit-button" class="button-submit">登录</button>
                </form>
            `,
            success: function(layero, index) {
                var togglePassword = document.getElementById('toggle-password');
                var passwordInput = document.getElementById('password');
                togglePassword.addEventListener('click', function() {
                    if (passwordInput.type === 'password') {
                        passwordInput.type = 'text';
                        togglePassword.classList.replace('icon-eye', 'icon-noeye');
                    } else {
                        passwordInput.type = 'password';
                        togglePassword.classList.replace('icon-noeye', 'icon-eye');
                    }
                });

                var loginForm = document.getElementById('login-form');
                var submitButton = document.getElementById('submit-button');

                loginForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    submitButton.disabled = true;
                    submitButton.textContent = '正在登录，请稍后...';
                    submitButton.classList.add('not-allowed');
                    var formData = new FormData(loginForm);
                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', loginAction, true);
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState === XMLHttpRequest.DONE) {
                            if (xhr.status === 200) {
                                if (xhr.responseURL.includes('/admin/')) {
                                    clearLoginAttempts(); 
                                    location.reload();
                                } else {
                                    handleFailedLogin();
                                }
                            } else {
                                handleFailedLogin();
                            }
                            resetButtonState();
                        }
                    };
                    xhr.onerror = function() {
                        handleFailedLogin();
                        resetButtonState();
                    };
                    xhr.send(formData);
                });
            }
        });
    }

    function handleFailedLogin() {
        var attempts = parseInt(localStorage.getItem('loginAttempts') || '0');
        attempts += 1;
        localStorage.setItem('loginAttempts', attempts);
        if (attempts >= maxAttempts) {
            var lockoutTime = Date.now() + lockoutMinutes * 60 * 1000;
            localStorage.setItem('lockoutTime', lockoutTime);
            var lockoutHours = formatMinutesToHours(lockoutMinutes);
            layer.msg(`尝试次数过多，您已被锁定${lockoutHours}！`, {
                time: 3000 
            }, function() {
                layer.closeAll(); 
            });
        } else {
            layer.msg(`账号或密码错误，请检查后重新登录！`, {
                time: 2000 
            });
        }
    }

    function isLockedOut() {
        var lockoutTime = parseInt(localStorage.getItem('lockoutTime') || '0');
        return Date.now() < lockoutTime;
    }

    function clearLoginAttempts() {
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lockoutTime');
    }

    function resetButtonState() {
        var submitButton = document.getElementById('submit-button');
        submitButton.disabled = false;
        submitButton.textContent = '登录';
        submitButton.classList.remove('not-allowed');
    }

    function formatMinutesToHours(minutes) {
        var hours = Math.floor(minutes / 60);
        var remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`;
    }
});
/** 用户登录弹框结束 **/

/** 动态发布弹框（适配插件九宫格上传，延迟上传）**/
$(function () {
    const cfg = window.memosConfig || {};
    const imageEnabled = !!cfg.enabled || !!window.__MEMOS_IMAGE__;
    const $publishBtn = $('#publish-button');
    if (!$publishBtn.length) return;

    const uploadUrl = cfg.memosUploadUrl || '/action/memos-upload';
    const signUrl = cfg.memosSignUrl || '/action/memos-sign';
    const useCos = !!cfg.memosUseCos;

    let fileQueue = []; 
    let uploading = false;
    let layerIndex = null;

    function updateLayerHeight() {
        if (layerIndex == null) return;
        const $layer = $('#layui-layer' + layerIndex);
        if (!$layer.length) return;

        const $content = $layer.find('.layui-layer-content');
        $content.css({ height: 'auto', overflow: 'visible' });

        const titleH = $layer.find('.layui-layer-title').outerHeight() || 0;
        const contentH = $content.outerHeight() || 0;
        layer.style(layerIndex, { height: titleH + contentH });
    }

    function updateAddButtonVisibility() {
        $('#memos-image-add').toggle(fileQueue.length < 9);
        updateLayerHeight();
    }

    function clearQueue() {
        fileQueue.forEach(f => {
            try { URL.revokeObjectURL(f.previewUrl); } catch (e) {}
        });
        fileQueue = [];
    }

    function buildFormHtml(commentUrl, csrfToken) {
        // 插件未启用：仅文本发布（无图片 UI、无 memos_imgs）
        if (!imageEnabled) {
            return `
                <form class="memos-form" id="comment-form" method="post" action="${commentUrl}">
                    <h3>发布动态</h3>
                    <textarea name="text" id="textarea" required></textarea>
                    <input type="hidden" name="_" value="${csrfToken}">
                    <button type="button" id="submit-memos" class="button-submit">发布</button>
                </form>
            `;
        }

        // 插件启用：带图片 UI
        return `
            <form class="memos-form" id="comment-form" method="post" action="${commentUrl}">
                <h3>发布动态</h3>
                <textarea name="text" id="textarea" required></textarea>

                <div class="memos-images">
                    <div class="memos-image-list" id="memos-image-list">
                        <label class="memos-image-add" id="memos-image-add">
                            <i class="iconfont icon-add"></i>
                            <input type="file" id="memos-image-input" accept="image/*" multiple hidden>
                        </label>
                    </div>
                </div>

                <input type="hidden" name="memos_imgs" id="memos_imgs">
                <input type="hidden" name="_" value="${csrfToken}">
                <button type="button" id="submit-memos" class="button-submit">发布</button>
            </form>
        `;
    }

    $publishBtn.on('click', function () {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        const commentUrl = document.querySelector('meta[name="comment-url"]')?.getAttribute('content') || '';

        if (!commentUrl) {
            layer.msg('评论接口不存在');
            return;
        }

        clearQueue();

        layerIndex = layer.open({
            type: 1,
            move: false,
            skin: 'layui-memos',
            area: ['420px', 'auto'],
            title: ' ',
            shadeClose: true,
            closeBtn: 1,
            content: buildFormHtml(commentUrl, csrfToken),
            success: updateLayerHeight,
            end: function () {
                // 关闭弹框时释放预览 URL，避免内存泄漏
                clearQueue();
            }
        });
    });

    // 插件未启用：不注册图片相关事件
    if (!imageEnabled) {
        // 仅保留发布逻辑
    } else {
        // 选择图片：仅当插件启用时才会出现该 input
        $(document).on('change', '#memos-image-input', function () {
            const files = this.files;
            if (!files || !files.length) return;

            if (fileQueue.length + files.length > 9) {
                layer.msg('最多只能上传 9 张图片');
                this.value = '';
                return;
            }

            Array.from(files).forEach(file => {
                if (!file.type || !file.type.startsWith('image/')) {
                    layer.msg('仅支持图片文件');
                    return;
                }

                const id = Date.now() + '-' + Math.random().toString(36).slice(2);
                const previewUrl = URL.createObjectURL(file);
                fileQueue.push({ id, file, previewUrl });

                $('#memos-image-add').before(`
                    <div class="memos-image-item" data-id="${id}">
                        <img src="${previewUrl}">
                        <span class="remove">×</span>
                        <div class="progress-text">0%</div>
                    </div>
                `);
            });

            updateAddButtonVisibility();
            this.value = '';
        });

        // 删除图片
        $(document).on('click', '.memos-image-item .remove', function () {
            const $item = $(this).closest('.memos-image-item');
            const id = $item.data('id');

            fileQueue = fileQueue.filter(f => {
                if (f.id === id) {
                    try { URL.revokeObjectURL(f.previewUrl); } catch (e) {}
                    return false;
                }
                return true;
            });

            $item.remove();
            updateAddButtonVisibility();
        });
    }

    function uploadFile(fileItem) {
        return new Promise((resolve, reject) => {
            const $item = $(`.memos-image-item[data-id="${fileItem.id}"]`);
            const $text = $item.find('.progress-text');

            let last = 0;
            const setPercent = (p) => {
                const percent = Math.max(last, Math.min(100, p));
                last = percent;

                if (percent >= 100) {
                    $item.removeClass('loading').addClass('processing');
                    $text.text('正在处理');
                } else {
                    $item.addClass('loading');
                    $text.text(percent + '%');
                }
            };

            setPercent(0);

            if (useCos) {
                const signForm = new FormData();
                signForm.append('fileName', fileItem.file.name);

                $.ajax({
                    url: signUrl,
                    type: 'POST',
                    data: signForm,
                    processData: false,
                    contentType: false,
                    dataType: 'json',
                    success(res) {
                        if (!res || !res.uploadUrl || !res.publicUrl) {
                            reject(res && res.error ? res.error : '签名失败');
                            return;
                        }

                        const xhr = new XMLHttpRequest();
                        xhr.open('PUT', res.uploadUrl, true);

                        xhr.upload.addEventListener('progress', function (e) {
                            if (e.lengthComputable) {
                                setPercent(Math.round((e.loaded / e.total) * 100));
                            }
                        }, false);

                        xhr.upload.addEventListener('load', function () {
                            setPercent(100);
                        }, false);

                        xhr.onload = function () {
                            if (xhr.status >= 200 && xhr.status < 300) {
                                resolve(res.publicUrl);
                            } else {
                                console.error('COS PUT failed', xhr.status, xhr.responseText);
                                reject('COS 上传失败(' + xhr.status + ')');
                            }
                        };

                        xhr.onerror = function () {
                            reject('COS 上传失败');
                        };

                        xhr.send(fileItem.file);
                    },
                    error(xhr) {
                        console.error('memos-sign error', xhr && xhr.status, xhr && xhr.responseText);
                        reject('签名接口不可用');
                    }
                });

                return;
            }

            // 本地上传
            const formData = new FormData();
            formData.append('file', fileItem.file);

            $.ajax({
                url: uploadUrl,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                dataType: 'json',
                xhr() {
                    const xhr = new window.XMLHttpRequest();
                    xhr.upload.addEventListener('progress', function (e) {
                        if (e.lengthComputable) {
                            setPercent(Math.round((e.loaded / e.total) * 100));
                        }
                    }, false);
                    xhr.upload.addEventListener('load', function () {
                        setPercent(100);
                    }, false);
                    return xhr;
                },
                success(res) {
                    setPercent(100);
                    if (res && res.url) resolve(res.url);
                    else reject(res && res.error ? res.error : '图片上传失败');
                },
                error() {
                    $item.removeClass('loading processing');
                    $text.text('');
                    reject('图片上传失败（接口不可用）');
                }
            });
        });
    }

    // 发布（无论插件是否启用都要支持）
    $(document).on('click', '#submit-memos', function () {
        if (uploading) return;

        const text = $('#textarea').val().trim();
        if (!text) {
            layer.msg('请输入内容');
            return;
        }

        uploading = true;
        const $btn = $('#submit-memos');
        $btn.prop('disabled', true).addClass('is-disabled').text('正在发布...');

        const reset = () => {
            $('.memos-image-item')
                .removeClass('loading processing')
                .find('.progress-text').text('');
        };

        const submitComment = () => {
            $.ajax({
                url: $('#comment-form').attr('action'),
                type: 'POST',
                data: $('#comment-form').serialize(),
                success(res) {
                    if (res && res.error) layer.msg(res.error);
                    else {
                        layer.closeAll();
                        layer.msg('发布成功');
                        setTimeout(() => location.reload(), 1000);
                    }
                },
                error() {
                    layer.msg('发布失败');
                },
                complete() {
                    reset();
                    uploading = false;
                    $btn.prop('disabled', false).removeClass('is-disabled').text('发布');
                }
            });
        };

        // 插件未启用：没有图片字段，直接提交
        if (!imageEnabled) {
            submitComment();
            return;
        }

        // 插件启用但未选图：清空 memos_imgs 直接提交
        if (!fileQueue.length) {
            $('#memos_imgs').val('');
            submitComment();
            return;
        }

        Promise.all(fileQueue.map(uploadFile))
            .then(urls => {
                $('#memos_imgs').val(JSON.stringify(urls));
                submitComment();
            })
            .catch(err => {
                reset();
                uploading = false;
                $btn.prop('disabled', false).removeClass('is-disabled').text('发布');
                layer.msg(err);
            });
    });
});

/***评论点赞以及计数***/
$(document).ready(function() {
    $("#comments").on('click', "a[id^='commentLikeOpt']", function() {
        var coid = $(this).data("coid");
        var recording = $(this).attr("data-recording");
        if(recording){
            layer.msg('你已经点过赞啦！感谢你的喜爱！');
            return;
        }
        $.ajax({
            url: commentLikeUrl,
            type: "POST",
            data: {
                coid: coid,
                behavior: 'dz'
            },
            async: true,
            dataType: "json",
            success: function(data) {
                if (data == null) {} else {
                    if(data.state == 'success'){
                        $('#commentLikeSpan-'+coid).text(data.num);
                        $('#commentLikeI-'+coid).removeClass("icon-like").addClass("icon-liked");
                        $('#commentLikeOpt-'+coid).attr("data-recording", "1");
                    } else {
                        alert(data.message || "点赞失败，请稍后重试");
                    }
                }
            },
            error: function(err) {
                alert("点赞失败，请稍后重试");
            }
        });
    });
});
/***评论点赞结束***/

/**文件完整性检查**/
var _0x1f3a=['aW5uZXJIVE1M','PGRpdiBjbGFzcz0iY29weXJpZ2h0LWluZm8iPuW8gOa6kOS4jeaYk++8jOivt+WwiumHjeS9nOiAheeJiOadg++8jOS/neeVmeWfuuacrOeahOeJiOadg+S/oeaBr+OAgjwvZGl2Pg==','6K+35Yu/5Yig6Zmk5qC45b+D5Ye95pWw77yM5ZCm5YiZ5Lya5Ye6546w5Lil6YeN5byC5bi444CC'];var _0x4c2d=function(_0x1f3a2f,_0x4c2d88){_0x1f3a2f=_0x1f3a2f-0x0;var _0x55=_0x1f3a[_0x1f3a2f];if(_0x4c2d['init']===undefined){(function(){var _0x1='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';window['atob']||(window['atob']=function(_0x2){var _0x3=String(_0x2)['replace'](/=+$/,'');var _0x4='';for(var _0x5=0x0,_0x6,_0x7,_0x8=0x0;_0x7=_0x3['charAt'](_0x8++);~_0x7&&(_0x6=_0x5%0x4?_0x6*0x40+_0x7:_0x7,_0x5++%0x4)?_0x4+=String['fromCharCode'](0xff&_0x6>>(-0x2*_0x5&0x6)):0x0){_0x7=_0x1['indexOf'](_0x7);}return _0x4;});}());_0x4c2d['decode']=function(_0x9){var _0xa=atob(_0x9);var _0xb='';for(var _0xc=0x0;_0xc<_0xa['length'];_0xc++){_0xb+='%'+('00'+_0xa['charCodeAt'](_0xc)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0xb);};_0x4c2d['cache']={};_0x4c2d['init']=true;}var _0xd=_0x4c2d['cache'][_0x1f3a2f];if(_0xd===undefined){_0x55=_0x4c2d['decode'](_0x55);_0x4c2d['cache'][_0x1f3a2f]=_0x55;}else{_0x55=_0xd;}return _0x55;};if(typeof base!=='function'){document['body'][_0x4c2d('0x0')]=_0x4c2d('0x1');throw new Error(_0x4c2d('0x2'));}

/**夜间模式**/
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// 切换夜间模式的核心函数
function toggleProtectEye(isDarkMode, saveCookie = true) {
    const htmlElement = document.documentElement;
    const logoElement = document.getElementById('logo');
    
    if (isDarkMode) {
        htmlElement.classList.add('night');
        if (saveCookie) setCookie('eyeProtectMode', 'dark', 365);
        if (logoElement) {
            logoElement.style.backgroundImage = `url(${logoWhiteUrl})`;
        }
    } else {
        htmlElement.classList.remove('night');
        if (saveCookie) setCookie('eyeProtectMode', 'light', 365);
        if (logoElement) {
            logoElement.style.backgroundImage = `url(${logoUrl})`;
        }
    }
}

// 更新两个开关状态
function updateToggleState(isDarkMode) {
    const toggle1 = document.getElementById('night1');
    const toggle2 = document.getElementById('night2');
    
    if (toggle1) toggle1.checked = isDarkMode;
    if (toggle2) toggle2.checked = isDarkMode;
}

function isAutoNightTime() {
    const hour = new Date().getHours();
    return hour >= 19 || hour < 5;
}

function initProtectEye() {
    const currentTheme = getCookie('eyeProtectMode');
    const htmlElement = document.documentElement;
    const logoElement = document.getElementById('logo');
    
    // 初始化状态：访客手动选择过时优先使用 cookie，否则使用自动夜间模式默认值
    const autoNightEnabled = typeof autoNightMode !== 'undefined' && autoNightMode === 'on';
    const hasUserTheme = currentTheme === 'dark' || currentTheme === 'light';
    const isDarkMode = hasUserTheme ? currentTheme === 'dark' : autoNightEnabled && isAutoNightTime();
    toggleProtectEye(isDarkMode, false);
    updateToggleState(isDarkMode);
    
    // 为两个开关添加事件监听器
    const toggle1 = document.getElementById('night1');
    const toggle2 = document.getElementById('night2');
    
    if (toggle1) {
        toggle1.addEventListener('change', function() {
            toggleProtectEye(this.checked);
            updateToggleState(this.checked);
        });
    }
    
    if (toggle2) {
        toggle2.addEventListener('change', function() {
            toggleProtectEye(this.checked);
            updateToggleState(this.checked);
        });
    }
}

document.addEventListener('DOMContentLoaded', initProtectEye);
/**夜间模式结束**/

function initLinkStatus() {
    const links = Array.from(document.querySelectorAll('.links .link a[href]'));
    if (!links.length) return;

    function normalizeLinkUrl(url) {
        url = (url || '').trim();
        if (!url || url.charAt(0) === '#' || /^(mailto|tel|javascript):/i.test(url)) return '';
        if (url.indexOf('//') === 0) return 'https:' + url;
        if (!/^https?:\/\//i.test(url) && url.charAt(0) !== '/') return 'https://' + url;
        return url;
    }

    const urls = [];
    const linkMap = new Map();
    const timeMap = new Map();

    function setDots(url, status) {
        (linkMap.get(url) || []).forEach(function(dot) {
            dot.classList.remove('is-checking', 'is-ok', 'is-error', 'is-warning');
            dot.classList.add(status);
        });
    }

    function setTimes(url, status, time) {
        (timeMap.get(url) || []).forEach(function(el) {
            if (status === 'ok' && time) {
                el.textContent = time;
                el.style.display = '';
            } else {
                el.textContent = '';
                el.style.display = 'none';
            }
        });
    }

    links.forEach(function(link) {
        const img = link.querySelector('img');
        if (!img) return;

        let avatar = img.closest('.link-avatar');
        if (!avatar) {
            avatar = document.createElement('span');
            avatar.className = 'link-avatar';
            img.parentNode.insertBefore(avatar, img);
            avatar.appendChild(img);
        }

        let dot = avatar.querySelector('.link-status-dot');
        if (!dot) {
            dot = document.createElement('span');
            dot.className = 'link-status-dot is-checking';
            avatar.appendChild(dot);
        }

        const title = link.querySelector('.link-info h3');
        let timeEl = null;
        if (title) {
            timeEl = title.querySelector('.link-status-time');
            if (!timeEl) {
                timeEl = document.createElement('span');
                timeEl.className = 'link-status-time';
                timeEl.style.display = 'none';
                title.appendChild(timeEl);
            }
        }

        const url = normalizeLinkUrl(link.getAttribute('href'));
        if (!url) return;
        link.href = url;
        urls.push(url);
        if (!linkMap.has(url)) linkMap.set(url, []);
        linkMap.get(url).push(dot);
        if (timeEl) {
            if (!timeMap.has(url)) timeMap.set(url, []);
            timeMap.get(url).push(timeEl);
        }
    });

    if (!urls.length) return;

    const endpoint = window.oneblogLinkStatusUrl || '/usr/themes/OneBlog/api/link-status.php';
    const params = new URLSearchParams();
    Array.from(new Set(urls)).slice(0, 30).forEach(function(url) {
        params.append('urls[]', url);
    });

    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: params.toString(),
        credentials: 'same-origin'
    })
        .then(function(res) { return res.json(); })
        .then(function(res) {
            if (!res || !res.success || !res.items) return;
            Object.keys(res.items).forEach(function(url) {
                const status = res.items[url] === 'ok' ? 'ok' : 'warning';
                setDots(url, status === 'ok' ? 'is-ok' : 'is-warning');
                setTimes(url, status, res.times ? res.times[url] : '');
            });
        })
        .catch(function() {
            document.querySelectorAll('.link-status-dot.is-checking').forEach(function(dot) {
                dot.classList.remove('is-checking');
                dot.classList.add('is-warning');
            });
            document.querySelectorAll('.link-status-time').forEach(function(el) {
                el.textContent = '';
                el.style.display = 'none';
            });
        });
}

document.addEventListener('DOMContentLoaded', initLinkStatus);

/**开源不易，请尊重作者的版权，保留本信息**/
function showConsoleInfo() {
    const version = '3.6.5';
    const copyright = '自豪地使用OneBlog主题';
    console.log('\n' + ' %c 当前版本：' + version + '  ' + copyright + '  %c https://onenote.io  ' + '\n', 'color: #fadfa3; background: #030307; padding:5px 0;', 'background: #fadfa3; padding:5px 0;');
    console.log('开源不易，请尊重作者版权，保留基本的版权信息。');
}
// 调用函数
showConsoleInfo();

/**代码块一键复制按钮**/
document.addEventListener('DOMContentLoaded', function() {
    // 查找所有代码块
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(function(codeBlock) {
        // 创建复制按钮
        const copyButton = document.createElement('button');
        copyButton.className = 'code-copy-btn';
        copyButton.textContent = '复制';
        
        // 将按钮添加到代码块的父元素（pre标签）中
        const preElement = codeBlock.parentNode;
        preElement.style.position = 'relative';
        preElement.appendChild(copyButton);
        
        // 点击复制按钮的事件
        copyButton.addEventListener('click', function() {
            // 移除过滤器，确保能够复制全部代码
            codeBlock.style.filter = 'none';
            
            // 创建一个临时textarea来复制代码
            const textarea = document.createElement('textarea');
            textarea.value = codeBlock.textContent;
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                // 执行复制命令
                const successful = document.execCommand('copy');
                if (successful) {
                    // 显示复制成功提示
                    copyButton.textContent = '已复制';
                    copyButton.style.backgroundColor = 'rgba(40, 167, 69, 0.7)';
                    
                    // 2秒后恢复按钮状态
                    setTimeout(function() {
                        copyButton.textContent = '复制';
                        copyButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                    }, 2000);
                } else {
                    copyButton.textContent = '复制失败';
                }
            } catch (err) {
                console.error('复制失败:', err);
                copyButton.textContent = '复制失败';
            }
            
            // 清理临时元素
            document.body.removeChild(textarea);
        });
        
        // 取消代码块的模糊效果，让用户直接看到代码
        codeBlock.style.filter = 'none';
    });
});

/**加载动画**/
var loadingStartTime = Date.now();

function finishLoading(minDuration) {
    var loadingEl = document.getElementById('global-loading');
    var mainEl = document.getElementById('main');
    if (!loadingEl || !mainEl) return;
    var elapsed = Date.now() - loadingStartTime;
    var wait = Math.max(0, (minDuration || 800) - elapsed);
    setTimeout(function() {
        loadingEl.style.opacity = 0;
        setTimeout(function() {
            loadingEl.style.display = 'none';
            mainEl.style.display = '';
            var d = new Date();
            d.setFullYear(d.getFullYear() + 1);
            document.cookie = 'jsLoaded=1; path=/; expires=' + d.toUTCString();
        }, 300);
    }, wait);
}
