"use strict";

(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback, { once: true });
            return;
        }

        callback();
    }

    function refreshIcons() {
        if (window.LawnoraUtils && typeof window.LawnoraUtils.refreshIcons === "function") {
            window.LawnoraUtils.refreshIcons();
            return;
        }

        if (window.lucide && typeof window.lucide.createIcons === "function") {
            window.lucide.createIcons();
        }
    }

    function initServicesHeroParallax() {
        const heroImage = document.querySelector(".services-hero__image");
        if (!heroImage) return;

        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced) return;

        let ticking = false;

        function update() {
            const scroll = window.scrollY || 0;
            const offset = Math.min(42, scroll * 0.08);
            heroImage.style.translate = `0 ${offset}px`;
            ticking = false;
        }

        window.addEventListener(
            "scroll",
            () => {
                if (ticking) return;
                ticking = true;
                window.requestAnimationFrame(update);
            },
            { passive: true }
        );
    }

    function initServicePreviewSwiper() {
        const swiperEl = document.querySelector("[data-services-preview-swiper]");
        if (!swiperEl || !window.Swiper) return;

        const thumbs = Array.from(document.querySelectorAll("[data-slide-to]"));

        const swiper = new Swiper(swiperEl, {
            slidesPerView: 1,
            speed: 760,
            loop: false,
            grabCursor: true,
            autoHeight: false,
            navigation: {
                nextEl: "[data-services-preview-next]",
                prevEl: "[data-services-preview-prev]"
            },
            keyboard: {
                enabled: true,
                onlyInViewport: true
            },
            on: {
                init(instance) {
                    updateThumbs(instance.realIndex || instance.activeIndex || 0);
                },
                slideChange(instance) {
                    updateThumbs(instance.realIndex || instance.activeIndex || 0);
                }
            }
        });

        function updateThumbs(activeIndex) {
            thumbs.forEach((thumb) => {
                const index = Number(thumb.getAttribute("data-slide-to"));
                const isActive = index === activeIndex;

                thumb.classList.toggle("is-active", isActive);
                thumb.setAttribute("aria-pressed", String(isActive));
            });
        }

        thumbs.forEach((thumb) => {
            thumb.addEventListener("click", () => {
                const index = Number(thumb.getAttribute("data-slide-to"));
                if (Number.isNaN(index)) return;

                swiper.slideTo(index);
                updateThumbs(index);
            });
        });
    }

    function initServiceCardKeyboardState() {
        document.querySelectorAll(".services-grid__card").forEach((card) => {
            card.addEventListener("focus", () => {
                card.classList.add("is-focused");
            });

            card.addEventListener("blur", () => {
                card.classList.remove("is-focused");
            });
        });
    }

    function initMatrixMobileLabels() {
        const rows = document.querySelectorAll(".services-matrix__row");

        rows.forEach((row) => {
            const cells = row.querySelectorAll(":scope > span");

            if (cells[0]) cells[0].setAttribute("data-label", "Category");
            if (cells[1]) cells[1].setAttribute("data-label", "Common request details");
            if (cells[2]) cells[2].setAttribute("data-label", "What provider confirms");
        });
    }

    function initServiceNavigator() {
        const nav = document.querySelector("[data-scroll-nav]");
        if (!nav) return;

        const links = Array.from(nav.querySelectorAll(".service-navigator__pill[href]"));

        let pointerDown = false;
        let startX = 0;
        let scrollLeft = 0;
        let didDrag = false;

        function getOffset() {
            const header = document.querySelector(".site-header");
            const headerHeight = header ? header.offsetHeight : 0;
            const navHeight = nav.offsetHeight || 0;

            return headerHeight + navHeight + 28;
        }

        function getHashTarget(hash) {
            if (!hash || !hash.startsWith("#")) return null;

            const id = decodeURIComponent(hash.slice(1));
            if (!id) return null;

            return document.getElementById(id);
        }

        function setActive(activeLink) {
            links.forEach((link) => {
                const isActive = link === activeLink;

                link.classList.toggle("is-active", isActive);

                if (isActive) {
                    link.setAttribute("aria-current", "true");
                } else {
                    link.removeAttribute("aria-current");
                }
            });
        }

        function scrollToTarget(target, link) {
            const top = target.getBoundingClientRect().top + window.pageYOffset - getOffset();

            window.scrollTo({
                top: Math.max(0, top),
                behavior: "smooth"
            });

            setActive(link);

            if (link.hash) {
                window.history.pushState(null, "", link.hash);
            }

            if (window.AOS && typeof window.AOS.refreshHard === "function") {
                window.setTimeout(() => window.AOS.refreshHard(), 420);
            }
        }

        /* click navigation */
        nav.addEventListener(
            "click",
            (event) => {
                const link = event.target.closest(".service-navigator__pill[href]");
                if (!link || !nav.contains(link)) return;

                if (didDrag) {
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                }

                const href = link.getAttribute("href");

                /* внешние ссылки типа contact.html#request-form не трогаем */
                if (!href || !href.startsWith("#")) return;

                const target = getHashTarget(href);
                if (!target) return;

                event.preventDefault();
                scrollToTarget(target, link);
            },
            true
        );

        /* horizontal drag только если реально тянем */
        nav.addEventListener("pointerdown", (event) => {
            pointerDown = true;
            didDrag = false;
            startX = event.clientX;
            scrollLeft = nav.scrollLeft;
        });

        nav.addEventListener("pointermove", (event) => {
            if (!pointerDown) return;

            const distance = event.clientX - startX;

            if (Math.abs(distance) < 10) return;

            didDrag = true;
            nav.classList.add("is-dragging");
            nav.scrollLeft = scrollLeft - distance;
        });

        function stopPointer() {
            pointerDown = false;
            nav.classList.remove("is-dragging");

            window.setTimeout(() => {
                didDrag = false;
            }, 80);
        }

        nav.addEventListener("pointerup", stopPointer);
        nav.addEventListener("pointercancel", stopPointer);
        nav.addEventListener("pointerleave", stopPointer);

        /* active state on scroll */
        const observedItems = links
            .map((link) => {
                const href = link.getAttribute("href");

                return {
                    link,
                    target: href && href.startsWith("#") ? getHashTarget(href) : null
                };
            })
            .filter((item) => item.target);

        if ("IntersectionObserver" in window && observedItems.length) {
            const observer = new IntersectionObserver(
                (entries) => {
                    const visible = entries
                        .filter((entry) => entry.isIntersecting)
                        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

                    if (!visible) return;

                    const current = observedItems.find((item) => item.target === visible.target);
                    if (!current) return;

                    setActive(current.link);
                },
                {
                    root: null,
                    threshold: [0.12, 0.25, 0.45],
                    rootMargin: "-38% 0px -48% 0px"
                }
            );

            observedItems.forEach((item) => observer.observe(item.target));
        }
    }

    function initCardMouseGlow() {
        const cards = document.querySelectorAll(".services-grid__card, .services-choose__panel");
        if (!cards.length) return;

        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced) return;

        cards.forEach((card) => {
            card.addEventListener("mousemove", (event) => {
                const rect = card.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / rect.width) * 100;
                const y = ((event.clientY - rect.top) / rect.height) * 100;

                card.style.setProperty("--mouse-x", `${x}%`);
                card.style.setProperty("--mouse-y", `${y}%`);
            });
        });
    }

    function initQuestionSlider() {
        const sliders = document.querySelectorAll("[data-question-slider]");
        if (!sliders.length) return;

        sliders.forEach((slider) => {
            if (slider.dataset.questionSliderReady === "true") return;
            slider.dataset.questionSliderReady = "true";

            const slides = Array.from(slider.querySelectorAll("[data-question-slide]"));
            if (!slides.length) return;

            let isAnimating = false;

            function setActiveSlide(activeSlide) {
                slides.forEach((item) => {
                    const itemButton = item.querySelector("button");
                    const isActive = item === activeSlide;

                    item.classList.toggle("is-active", isActive);

                    if (itemButton) {
                        itemButton.setAttribute("aria-expanded", isActive ? "true" : "false");
                    }
                });
            }

            slides.forEach((slide) => {
                const button = slide.querySelector("button");
                if (!button) return;

                button.addEventListener("click", () => {
                    if (slide.classList.contains("is-active") || isAnimating) return;

                    isAnimating = true;
                    slider.classList.add("is-switching");

                    window.requestAnimationFrame(() => {
                        setActiveSlide(slide);
                    });

                    window.setTimeout(() => {
                        isAnimating = false;
                        slider.classList.remove("is-switching");
                    }, 1120);

                    refreshIcons();
                });
            });
        });
    }

    function initServicesNoteSlider() {
        const sliders = document.querySelectorAll("[data-note-slider]");
        if (!sliders.length) return;

        sliders.forEach((slider) => {
            if (slider.dataset.noteSliderReady === "true") return;
            slider.dataset.noteSliderReady = "true";

            const slides = Array.from(slider.querySelectorAll("[data-note-slide]"));
            const images = Array.from(slider.querySelectorAll("[data-note-bg]"));
            const dots = Array.from(slider.querySelectorAll("[data-note-dot]"));

            if (!slides.length || !images.length) return;

            let activeIndex = 0;
            let timer = null;
            const delay = 5200;

            function setActive(index) {
                activeIndex = (index + slides.length) % slides.length;

                slides.forEach((slide, slideIndex) => {
                    slide.classList.toggle("is-active", slideIndex === activeIndex);
                });

                images.forEach((image, imageIndex) => {
                    image.classList.toggle("is-active", imageIndex === activeIndex);
                });

                dots.forEach((dot, dotIndex) => {
                    dot.classList.toggle("is-active", dotIndex === activeIndex);
                });
            }

            function startAuto() {
                stopAuto();

                timer = window.setInterval(() => {
                    setActive(activeIndex + 1);
                }, delay);
            }

            function stopAuto() {
                if (!timer) return;
                window.clearInterval(timer);
                timer = null;
            }

            dots.forEach((dot) => {
                dot.addEventListener("click", () => {
                    const index = Number(dot.getAttribute("data-note-dot"));
                    if (Number.isNaN(index)) return;

                    setActive(index);
                    startAuto();
                });
            });

            slider.addEventListener("mouseenter", stopAuto);
            slider.addEventListener("mouseleave", startAuto);

            setActive(0);
            startAuto();
        });
    }


    function initAllServices() {
        initServicesHeroParallax();
        initServicePreviewSwiper();
        initServiceCardKeyboardState();
        initMatrixMobileLabels();
        initServiceNavigator();
        initCardMouseGlow();
        initQuestionSlider();
        initServicesNoteSlider();
        refreshIcons();
    }

    ready(initAllServices);
})();