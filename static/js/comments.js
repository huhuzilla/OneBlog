/**
 * Updated: 2025-10-09
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
            const author = this.getAttribute('data-author');
            document.getElementById('reply-target').textContent = author;
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

//极验验证
document.addEventListener('DOMContentLoaded', function () {
    var commentList = document.querySelector('.comment-list');
    if (!commentList) return;
    
    var captchaIdInput = document.getElementById('geetest-captcha-id');
    var submitBtn = document.getElementById('geetest-submit-btn');
    var commentForm = document.getElementById('comment-form');
    if (!submitBtn || !commentForm) return;

    var authorInput = commentForm.querySelector('input[name="author"]');
    var mailInput = commentForm.querySelector('input[name="mail"]');
    var textarea = document.getElementById('textarea');
    var richEditor = document.getElementById('rich-editor');
    var isLoggedIn = !(authorInput && mailInput);

    // 只要极验ID有值就启用极验，否则直接提交
    var geetestEnabled = captchaIdInput && captchaIdInput.value;
    var gtReady = false;
    var captchaObj = null;

    if (!isLoggedIn && geetestEnabled) {
        window.initGeetest4({
            captchaId: captchaIdInput.value,
            product: 'bind',
            riskType: 'slide',
            hideSuccess: true // 关键：关闭验证成功弹窗
        }, function (obj) {
            captchaObj = obj;
            obj.onReady(function () { gtReady = true; });
            obj.onSuccess(function () {
                var result = obj.getValidate();
                ['lot_number', 'captcha_output', 'pass_token', 'gen_time'].forEach(function (k) {
                    var input = commentForm.querySelector('[name="' + k + '"]');
                    if (!input) {
                        input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = k;
                        commentForm.appendChild(input);
                    }
                    input.value = result[k];
                });
                commentForm.submit();
            });
        });
    }

    submitBtn.addEventListener('click', function (e) {
        if (richEditor && textarea) textarea.value = richEditor.innerHTML.trim();
        e.preventDefault();

        // 已登录用户，内容校验后直接提交
        if (isLoggedIn) {
            if (!textarea.value.trim()) {
                layer && layer.msg ? layer.msg('评论内容不能为空') : alert('评论内容不能为空');
                return false;
            }
            commentForm.submit();
            return false;
        }

        // 未登录用户，先校验基本字段
        var author = authorInput ? authorInput.value.trim() : "";
        var mail = mailInput ? mailInput.value.trim() : "";
        var text = textarea.value.trim();
        if (!author) {
            layer && layer.msg ? layer.msg('昵称不能为空') : alert('昵称不能为空');
            if (authorInput) authorInput.focus();
            return false;
        }
        if (!/^[\w\.-]+@[\w\.-]+\.\w+$/.test(mail)) {
            layer && layer.msg ? layer.msg('请填写正确的邮箱') : alert('请填写正确的邮箱');
            if (mailInput) mailInput.focus();
            return false;
        }
        if (!text) {
            layer && layer.msg ? layer.msg('评论内容不能为空') : alert('评论内容不能为空');
            if (richEditor) richEditor.focus();
            return false;
        }

        // 启用极验时，弹窗验证
        if (geetestEnabled) {
            if (captchaObj && gtReady) {
                captchaObj.showCaptcha();
            } else {
                layer && layer.msg ? layer.msg('极验服务加载中，请稍候重试') : alert('极验服务加载中，请稍候重试');
            }
            return false;
        }

        // 未启用极验，直接提交
        commentForm.submit();
        return false;
    });
});