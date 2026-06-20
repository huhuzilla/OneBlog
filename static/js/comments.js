/**
 * Updated: 2026-01-22
 * Author: ©彼岸临窗 onenote.io
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

    function finishLoading(showButton) {
        isLoading = false;
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        if (showButton && loadMoreBtn && !noMoreComments) loadMoreBtn.style.display = 'flex';
    }

    function checkNoMore() {
        var hasNext = document.querySelector('.page-navigator .next a');
        if (!hasNext) {
            noMoreComments = true;
            if (noMoreElement) noMoreElement.style.display = 'flex';
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        }
        return ! hasNext;
    }

    function loadMoreComments() {
        if (isLoading || noMoreComments) return;
        var nextPageUrl = document.querySelector('.page-navigator .next a')?.getAttribute('href');
        if (!nextPageUrl) return checkNoMore();

        isLoading = true;
        if (loadingSpinner) loadingSpinner.style.display = 'flex';
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';

        setTimeout(function () {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', nextPageUrl, true);
            xhr.onload = function () {
                if (xhr.status >= 200 && xhr.status < 400) {
                    var tempDiv = document.createElement('div');
                    tempDiv.innerHTML = xhr.responseText;
                    var newCommentList = tempDiv.querySelector('.comment-list');
                    if (!newCommentList) {
                        finishLoading(true);
                        return;
                    }
                    commentList.insertAdjacentHTML('beforeend', newCommentList.innerHTML);
                    // 重新观察视图区域的图片数据
                    if (typeof initLazyLoad === 'function') {
                        initLazyLoad(commentList);
                    }
                    var currentNav = document.querySelector('.page-navigator');
                    var newNav = tempDiv.querySelector('.page-navigator');
                    if (currentNav && newNav) currentNav.innerHTML = newNav.innerHTML;
                    if (! checkNoMore() && loadMoreBtn) loadMoreBtn.style.display = 'flex';
                } else if (loadMoreBtn) {
                    loadMoreBtn.style.display = 'flex';
                }
                finishLoading(false);
            };
            xhr.onerror = function () {
                finishLoading(true);
            };
            xhr.send();
        }, 500);
    }

    if (! isMobile && loadMoreBtn) {
        loadMoreBtn.style.display = 'flex';
        loadMoreBtn.addEventListener('click', loadMoreComments);
    }

    if (isMobile) {
        window.addEventListener('scroll', function () {
            if (isLoading || noMoreComments) return;
            var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            var scrollHeight = document.documentElement.scrollHeight || document.body. scrollHeight;
            var clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
            if (scrollTop + clientHeight >= scrollHeight - 200) loadMoreComments();
        });
    }

    checkNoMore();
});

/** 回复标题切换 **/
document.addEventListener('DOMContentLoaded', function() {
    if (! document.querySelector('.comment-list')) return;

    document.addEventListener('click', function(e) {
        var replyBtn = e.target.closest('.comment-reply');
        if (replyBtn) {
            document.getElementById('reply-target').textContent = replyBtn.getAttribute('data-author');
            document.getElementById('default-title').style.display = 'none';
            document.getElementById('reply-title').style.display = '';
        }
    });

    document.querySelector('.cancel-comment-reply a')?.addEventListener('click', function() {
        document.getElementById('reply-title').style.display = 'none';
        document.getElementById('default-title').style.display = '';
    });
});

/** Ajax 评论提交 **/
document.addEventListener('DOMContentLoaded', function () {
    const form = document. getElementById('comment-form');
    const submitBtn = document.getElementById('geetest-submit-btn');
    if (! form || !submitBtn) return;

    const textarea = document.getElementById('textarea');
    const richEditor = document.getElementById('rich-editor');
    const cfSiteKey = document.getElementById('cf-sitekey')?.value;
    const geetestId = document.getElementById('geetest-captcha-id')?.value;

    let submitting = false;
    let captchaObj = null;
    let gtReady = false;
    const originText = submitBtn.innerText;

    function setBtn(text, loading) {
        submitBtn.innerHTML = '<span class="oneblog-blank"></span>' + text;
        submitBtn.disabled = true;
        submitBtn.classList. toggle('is-loading', loading);
    }

    function resetBtn() {
        submitBtn.innerText = originText;
        submitBtn.disabled = false;
        submitBtn.classList.remove('is-loading');
        submitting = false;
    }

    function extractText(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        div.querySelectorAll('script,style,noscript').forEach(el => el.remove());
        for (const sel of ['.container h1', '.container p', 'body h1', 'body p', 'pre']) {
            const el = div. querySelector(sel);
            const txt = el?. textContent?. trim();
            if (txt && txt.length < 300) return txt;
        }
        let text = (div.textContent || '').replace(/\s+/g, ' ').trim();
        return text. length > 150 ? text.substring(0, 150) + '...' : text;
    }

    // 局部刷新评论列表
    function reloadComments(newCoid) {
        fetch(location.href, { credentials: 'same-origin' })
        .then(res => res. text())
        .then(html => {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            
            const newList = doc.querySelector('.comment-list');
            const oldList = document.querySelector('.comment-list');
            
            if (newList) {
                if (oldList) {
                    oldList.innerHTML = newList.innerHTML;
                } else {
                    // 原本无评论，插入新列表
                    const respond = document.querySelector('.respond');
                    if (respond) {
                        respond. insertAdjacentHTML('afterend', '<ol class="comment-list">' + newList.innerHTML + '</ol>');
                    }
                }
            }
            
            // 更新分页
            const newNav = doc.querySelector('.page-navigator');
            const oldNav = document.querySelector('.page-navigator');
            if (newNav && oldNav) oldNav.innerHTML = newNav.innerHTML;
            
            // 滚动到新评论并高亮
            if (newCoid) {
                setTimeout(() => {
                    const el = document.getElementById('comment-' + newCoid);
                    if (el) {
                        el.classList.add('comment-new');
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        setTimeout(() => el.classList.remove('comment-new'), 3000);
                    }
                }, 100);
            }
        })
        .catch(() => location.reload());
    }

    function ajaxSubmit() {
        setBtn('提交中...', true);

        fetch(form. action, {
            method: 'POST',
            body: new FormData(form),
            credentials: 'same-origin',
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(res => res. text().then(text => ({ status: res.status, text })))
        .then(({ status, text }) => {
            let json = null;
            try { json = JSON.parse(text); } catch (e) {}

            if (status >= 400) {
                layer.msg(json?.message || extractText(text) || '请求失败(' + status + ')', { time: 3000 });
                resetBtn();
                return;
            }

            if (json && json.success) {
                layer.msg(json.message || '评论提交成功', { time: 2000 });
                textarea.value = '';
                if (richEditor) richEditor.innerHTML = '';
                document.querySelector('.cancel-comment-reply a')?.click();
                reloadComments(json.coid);
                resetBtn();
                return;
            }

            if (json && ! json.success) {
                layer.msg(json.message || '提交失败', { time:  3000 });
                resetBtn();
                return;
            }

            const keywords = ['失败', '错误', '禁止', '拒绝', '不允许', '太快', '垃圾', '不合规','error', 'fail', 'spam'];
            if (keywords.some(k => text.toLowerCase().includes(k))) {
                layer.msg(extractText(text) || '提交失败', { time:  3000 });
            } else {
                layer.msg('提交状态未知，正在刷新...', { time: 1500 });
                setTimeout(() => location.reload(), 1800);
            }
            resetBtn();
        })
        .catch(() => {
            layer.msg('网络错误，请稍后重试', { time: 3000 });
            resetBtn();
        });
    }

    function renderCF() {
        setBtn('等待验证...', true);
        let wrap = document.getElementById('cf-rich-wrap');
        if (!wrap) {
            wrap = document. createElement('div');
            wrap.id = 'cf-rich-wrap';
            richEditor.after(wrap);
        } else {
            wrap.innerHTML = '';
        }
        turnstile.render(wrap, {
            sitekey: cfSiteKey,
            size: 'flexible',
            theme: document. documentElement.classList.contains('night') ? 'dark' : 'light',
            callback: token => {
                let input = form.querySelector('[name="cf_token"]');
                if (! input) {
                    input = document.createElement('input');
                    input. type = 'hidden';
                    input.name = 'cf_token';
                    form. appendChild(input);
                }
                input.value = token;
                setTimeout(() => {
                        if (wrap) {
                            wrap.remove();
                        }
                    }, 2000);
                ajaxSubmit();
            },
            'error-callback': () => {
                layer.msg('验证加载失败，请刷新重试');
                resetBtn();
            }
        });
    }

    if (geetestId && !cfSiteKey) {
        window.initGeetest4({ captchaId: geetestId, product: 'bind' }, obj => {
            captchaObj = obj;
            obj.onReady(() => gtReady = true);
            obj.onSuccess(() => {
                setBtn('提交中...', true);
                const result = obj.getValidate();
                Object.keys(result).forEach(k => {
                    let input = form.querySelector(`[name="${k}"]`);
                    if (! input) {
                        input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = k;
                        form.appendChild(input);
                    }
                    input.value = result[k];
                });
                ajaxSubmit();
            });
            obj.onError(() => {
                layer.msg('验证组件出错，请刷新重试');
                resetBtn();
            });
        });
    }

    submitBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (submitting) return;
        submitting = true;

        if (! textarea.value.trim()) {
            layer.msg('评论内容不能为空');
            resetBtn();
            return;
        }

        if (cfSiteKey) {
            renderCF();
        } else if (geetestId) {
            if (! captchaObj || !gtReady) {
                layer. msg('验证组件加载中，请稍后');
                resetBtn();
                return;
            }
            setBtn('等待验证...', true);
            captchaObj.showCaptcha();
        } else {
            ajaxSubmit();
        }
    });
});
