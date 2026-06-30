(function () {
    window.SubtlUI = {
        toast: function (message, type) {
            type = type || 'success';
            var existing = document.querySelector('.subtl-toast');
            if (existing) existing.remove();

            var el = document.createElement('div');
            el.className = 'subtl-toast subtl-toast--' + type;
            el.textContent = message;
            document.body.appendChild(el);

            requestAnimationFrame(function () {
                el.classList.add('subtl-toast--visible');
            });

            setTimeout(function () {
                el.classList.remove('subtl-toast--visible');
                setTimeout(function () { el.remove(); }, 300);
            }, 3500);
        },

        setBtnLoading: function (btn, loading) {
            if (!btn) return;
            btn.disabled = loading;
            btn.classList.toggle('is-loading', loading);
        },
    };

    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(function () {
            document.querySelectorAll('.flash-box').forEach(function (box) {
                box.remove();
            });
        }, 4000);
    });
})();
