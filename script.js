(function () {
    "use strict";

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var header = document.getElementById("site-header");
    var navToggle = document.getElementById("nav-toggle");
    var navMenu = document.getElementById("nav-menu");
    var progressBar = document.getElementById("progress-bar");
    var year = document.getElementById("year");

    if (year) year.textContent = new Date().getFullYear();

    /* ---------- Header + scroll progress ---------- */

    var ticking = false;

    function onScroll() {
        var y = window.scrollY || document.documentElement.scrollTop;

        if (header) header.classList.toggle("is-scrolled", y > 12);

        if (progressBar) {
            var doc = document.documentElement;
            var max = doc.scrollHeight - window.innerHeight;
            var ratio = max > 0 ? Math.min(y / max, 1) : 0;
            progressBar.style.transform = "scaleX(" + ratio + ")";
        }

        ticking = false;
    }

    window.addEventListener("scroll", function () {
        if (!ticking) {
            window.requestAnimationFrame(onScroll);
            ticking = true;
        }
    }, { passive: true });

    onScroll();

    /* ---------- Reveal on scroll ---------- */

    var revealItems = document.querySelectorAll(".reveal");

    if (reduceMotion || !("IntersectionObserver" in window)) {
        revealItems.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

        revealItems.forEach(function (el) { revealObserver.observe(el); });
    }

    /* ---------- Active navigation ---------- */

    var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
    var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));

    if ("IntersectionObserver" in window && navLinks.length) {
        var sectionObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var id = entry.target.getAttribute("id");
                navLinks.forEach(function (link) {
                    var isActive = link.getAttribute("href") === "#" + id;
                    link.classList.toggle("is-active", isActive);
                    if (isActive) {
                        link.setAttribute("aria-current", "true");
                    } else {
                        link.removeAttribute("aria-current");
                    }
                });
            });
        }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

        sections.forEach(function (section) { sectionObserver.observe(section); });
    }

    /* ---------- Mobile navigation ---------- */

    function closeMenu() {
        if (!navToggle || !navMenu) return;
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open navigation menu");
        navMenu.classList.remove("is-open");
        document.body.classList.remove("menu-open");
    }

    function openMenu() {
        if (!navToggle || !navMenu) return;
        navToggle.setAttribute("aria-expanded", "true");
        navToggle.setAttribute("aria-label", "Close navigation menu");
        navMenu.classList.add("is-open");
        document.body.classList.add("menu-open");
    }

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", function () {
            var isOpen = navToggle.getAttribute("aria-expanded") === "true";
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        navMenu.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", closeMenu);
        });

        document.addEventListener("click", function (event) {
            if (!navMenu.classList.contains("is-open")) return;
            if (navToggle.contains(event.target) || navMenu.contains(event.target)) return;
            closeMenu();
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") closeMenu();
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth > 940) closeMenu();
        });
    }

    /* ---------- Copy email ---------- */

    var copyButton = document.getElementById("copy-email");
    var copyStatus = document.getElementById("copy-status");

    if (copyButton) {
        copyButton.addEventListener("click", function () {
            var email = copyButton.getAttribute("data-email") || "ayu007n@gmail.com";

            function done() {
                copyButton.classList.add("is-copied");
                var label = copyButton.querySelector(".copy-label");
                if (label) label.textContent = "Copied";
                if (copyStatus) copyStatus.textContent = email + " copied to clipboard";
                window.setTimeout(function () {
                    copyButton.classList.remove("is-copied");
                    if (label) label.textContent = "Copy email";
                    if (copyStatus) copyStatus.textContent = "";
                }, 2400);
            }

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(email).then(done, function () {
                    fallbackCopy(email, done);
                });
            } else {
                fallbackCopy(email, done);
            }
        });
    }

    function fallbackCopy(text, done) {
        var field = document.createElement("textarea");
        field.value = text;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        try {
            document.execCommand("copy");
            done();
        } catch (error) {
            if (copyStatus) copyStatus.textContent = "Copy failed — email: " + text;
        }
        document.body.removeChild(field);
    }

    /* ---------- Pointer spotlight ---------- */

    var spotlightCards = document.querySelectorAll(".spotlight");

    if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
        spotlightCards.forEach(function (card) {
            card.addEventListener("pointermove", function (event) {
                var rect = card.getBoundingClientRect();
                card.style.setProperty("--mx", (event.clientX - rect.left) + "px");
                card.style.setProperty("--my", (event.clientY - rect.top) + "px");
            });
        });
    }
})();
