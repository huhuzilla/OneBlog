/**
 * Updated: 2026-01-21
 * Author: ©彼岸临窗 oneblog.net
 *
 * 注释含命名规范，开源不易，如需引用请注明来源:彼岸临窗 https://oneblog.net。
 * 本主题已取得软件著作权（登记号：2025SR0334142）和外观设计专利（专利号：第7121519号），请严格遵循GPL-2.0协议使用本主题及源码。
 */
document.addEventListener('DOMContentLoaded', function () {
    var commentList = document.querySelector('.comment-list');
    if (!commentList) return;

    var isLoading = false;
    var noMoreComments = false;
    var loadingSpinner = document.getElementById('loading-spinner');
    var noMoreElement = document.getElementById('no-more');
    var loadMoreBtn = document.getElementById('load-more-comments');

    var isMobile = window.innerWidth <= 768;

    // 如果是PC端，则显示加载按钮
    if (!isMobile && loadMoreBtn) {
        loadMoreBtn.style.display = 'flex';
        loadMoreBtn.addEventListener('click', loadMoreComments);
    }

    function loadMoreComments() {
        if (isLoading || noMoreComments) return;

        var nextPageUrl = document.querySelector('.page-navigator .next a')?.getAttribute('href');
        if (!nextPageUrl) {
            noMoreComments = true;
            noMoreElement.style.display = 'flex';
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            return;
        }

        isLoading = true;

        // 开始加载：显示动画，隐藏按钮
        if (loadingSpinner) loadingSpinner.style.display = 'flex';
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';

        setTimeout(function () {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', nextPageUrl, true);
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 400) {
                    var tempDiv = document.createElement('div');
                    tempDiv.innerHTML = xhr.responseText;

                    var newComments = tempDiv.querySelector('.comment-list').innerHTML;
                    commentList.insertAdjacentHTML('beforeend', newComments);

                    var newNav = tempDiv.querySelector('.page-navigator')?.innerHTML;
                    if (newNav) {
                        document.querySelector('.page-navigator').innerHTML = newNav;
                    }

                    var hasNext = tempDiv.querySelector('.page-navigator .next a');
                    if (!hasNext) {
                        noMoreComments = true;
                        noMoreElement.style.display = 'flex';
                        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
                    } else {
                        if (loadMoreBtn) loadMoreBtn.style.display = 'flex';
                    }

                } else {
                    console.error('Request failed: ' + xhr.statusText);
                    if (loadMoreBtn) loadMoreBtn.style.display = 'flex';
                }

                isLoading = false;
                if (loadingSpinner) loadingSpinner.style.display = 'none';
            };

            xhr.onerror = function () {
                console.error('Request failed');
                isLoading = false;
                if (loadingSpinner) loadingSpinner.style.display = 'none';
                if (loadMoreBtn) loadMoreBtn.style.display = 'flex';
            };

            xhr.send();
        }, 500);
    }

    // 移动端采用滚动自动加载
    if (isMobile) {
        window.addEventListener('scroll', function () {
            if (isLoading || noMoreComments) return;

            var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            var scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
            var clientHeight = document.documentElement.clientHeight || document.body.clientHeight;

            if (scrollTop + clientHeight >= scrollHeight - 200) {
                loadMoreComments();
            }
        });
    }

    // 初始检查是否还有下一页
    var initialNextPageUrl = document.querySelector('.page-navigator .next a')?.getAttribute('href');
    if (!initialNextPageUrl) {
        noMoreComments = true;
        noMoreElement.style.display = 'flex';
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    }
});


/** 回复时替换表单标题 20250602**/
document.addEventListener('DOMContentLoaded', function() {
    var commentList = document.querySelector('.comment-list');
    if (!commentList) return; // 如果当前页面不存在评论，则不执行该JS
    // 点击回复时
    document.querySelectorAll('.comment-reply').forEach(function(replyBtn) {
        replyBtn.addEventListener('click', function() {
            document.getElementById('reply-target').textContent = this.getAttribute('data-author');
            document.getElementById('default-title').style.display = 'none';
            document.getElementById('reply-title').style.display = '';
        });
    });

    // 点击取消回复时
    document.querySelector('.cancel-comment-reply a')?.addEventListener('click', function() {
        document.getElementById('reply-title').style.display = 'none';
        document.getElementById('default-title').style.display = '';
    });
});

/** 新增 Cloudflare Turnstile 验证 20260115 ,可选择极验或CF验证或关闭验证**/
/** Cloudflare Turnstile / Geetest Ajax 评论提交（最终增强版） **/
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('comment-form');
    const submitBtn = document.getElementById('geetest-submit-btn');
    if (!form || !submitBtn) return;

    const textarea = document.getElementById('textarea');
    const richEditor = document.getElementById('rich-editor');
    const cfSiteKeyInput = document.getElementById('cf-sitekey');
    const geetestIdInput = document.getElementById('geetest-captcha-id');

    const cfEnabled = cfSiteKeyInput && cfSiteKeyInput.value;
    const geetestEnabled = !cfEnabled && geetestIdInput && geetestIdInput.value;

    let hasSubmitted = false;
    let captchaObj = null;
    let gtReady = false;

    const originText = submitBtn.innerText;

    /* ===== 夜间模式 ===== */
    function isNightMode() {
        return document.documentElement.classList.contains('night');
    }

    /* ===== 按钮状态控制 ===== */
    function setBtn(text, loading = false) {
        submitBtn.innerHTML = '<span class="oneblog-blank"></span>' + text;
        submitBtn.disabled = true;
        submitBtn.classList.toggle('is-loading', loading);
    }


    function resetBtn() {
        submitBtn.innerText = originText;
        submitBtn.disabled = false;
        submitBtn.classList.remove('is-loading');
    }

    /* ===== Ajax 提交 ===== */
    function ajaxSubmit() {
        setBtn('提交中...', true);

        const data = new FormData(form);

        fetch(form.action, {
            method: 'POST',
            body: data,
            credentials: 'same-origin',
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(res => {
            if (res.status === 302 || res.redirected) return { success: true };

            const ct = res.headers.get('content-type') || '';
            if (ct.includes('application/json')) return res.json();

            return { success: true };
        })
        .then(json => {
            if (json.success) {
                layer.msg('提交成功，请等待审核', { time: 1000 });
                setTimeout(() => location.reload(), 2000);
            } else {
                layer.msg(json.message || '提交失败');
                hasSubmitted = false;
                resetBtn();
            }
        })
        .catch(() => {
            layer.msg('网络错误，请稍后再试');
            hasSubmitted = false;
            resetBtn();
        });
    }

    /* ===== Cloudflare Turnstile ===== */
    function renderCF() {
        setBtn('等待验证...', true);

        let wrap = document.getElementById('cf-rich-wrap');
        if (!wrap) {
            wrap = document.createElement('div');
            wrap.id = 'cf-rich-wrap';
            richEditor.after(wrap);
        } else {
            wrap.innerHTML = '';
        }

        turnstile.render(wrap, {
            sitekey: cfSiteKeyInput.value,
            size: 'flexible',
            theme: isNightMode() ? 'dark' : 'light',
            callback: function (token) {
                let input = form.querySelector('[name="cf_token"]');
                if (!input) {
                    input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = 'cf_token';
                    form.appendChild(input);
                }
                input.value = token;
                ajaxSubmit();
            }
        });
    }

    /* ===== Geetest ===== */
    if (geetestEnabled) {
        window.initGeetest4({
            captchaId: geetestIdInput.value,
            product: 'bind'
        }, function (obj) {
            captchaObj = obj;
            obj.onReady(() => gtReady = true);
            obj.onSuccess(function () {
                setBtn('提交中...', true);

                const result = obj.getValidate();
                Object.keys(result).forEach(k => {
                    let i = form.querySelector(`[name="${k}"]`);
                    if (!i) {
                        i = document.createElement('input');
                        i.type = 'hidden';
                        i.name = k;
                        form.appendChild(i);
                    }
                    i.value = result[k];
                });

                ajaxSubmit();
            });
        });
    }

    /* ===== 提交入口 ===== */
    submitBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (hasSubmitted) return;
        hasSubmitted = true;

        if (!textarea.value.trim()) {
            layer.msg('评论内容不能为空');
            hasSubmitted = false;
            resetBtn();
            return;
        }

        if (cfEnabled) {
            renderCF();
            return;
        }

        if (geetestEnabled) {
            if (!captchaObj || !gtReady) {
                layer.msg('验证组件加载中');
                hasSubmitted = false;
                resetBtn();
                return;
            }
            setBtn('等待验证...', true);
            captchaObj.showCaptcha();
            return;
        }

        ajaxSubmit();
    });
});

