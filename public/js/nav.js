(function () {
    var navbar = document.getElementById('navbar');
    var toggle = document.getElementById('navToggle');
    var links = document.getElementById('navLinks');
    var overlay = document.getElementById('navOverlay');

    if (!navbar) return;

    window.addEventListener('scroll', function () {
        navbar.classList.toggle('scrolled', window.scrollY > 8);
    }, { passive: true });

    function setOpen(open) {
        if (!links || !toggle) return;
        links.classList.toggle('open', open);
        toggle.classList.toggle('active', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        if (overlay) overlay.classList.toggle('open', open);
        document.body.classList.toggle('nav-open', open);

        if (open) {
            var firstLink = links.querySelector('.nav-link:not(.nav-link--cart)');
            if (firstLink) firstLink.focus();
        } else {
            toggle.focus();
        }
    }

    function closeNav() { setOpen(false); }

    if (toggle && links) {
        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            setOpen(!links.classList.contains('open'));
        });

        links.querySelectorAll('.nav-link').forEach(function (link) {
            link.addEventListener('click', closeNav);
        });

        if (overlay) {
            overlay.addEventListener('click', closeNav);
        }

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeNav();
        });
    }
})();
