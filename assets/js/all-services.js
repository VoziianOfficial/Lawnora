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

    function initNavigatorDrag() {
        const nav = document.querySelector(".service-navigator__bar");
        if (!nav) return;

        let isDown = false;
        let startX = 0;
        let scrollLeft = 0;

        nav.addEventListener("pointerdown", (event) => {
            isDown = true;
            nav.classList.add("is-dragging");
            startX = event.pageX - nav.offsetLeft;
            scrollLeft = nav.scrollLeft;
            nav.setPointerCapture(event.pointerId);
        });

        nav.addEventListener("pointermove", (event) => {
            if (!isDown) return;

            const x = event.pageX - nav.offsetLeft;
            const walk = (x - startX) * 1.4;
            nav.scrollLeft = scrollLeft - walk;
        });

        function stopDrag(event) {
            if (!isDown) return;

            isDown = false;
            nav.classList.remove("is-dragging");

            if (event && event.pointerId && nav.hasPointerCapture(event.pointerId)) {
                nav.releasePointerCapture(event.pointerId);
            }
        }

        nav.addEventListener("pointerup", stopDrag);
        nav.addEventListener("pointerleave", stopDrag);
        nav.addEventListener("pointercancel", stopDrag);
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


    function initAllServices() {
        initServicesHeroParallax();
        initServicePreviewSwiper();
        initServiceCardKeyboardState();
        initMatrixMobileLabels();
        initNavigatorDrag();
        initCardMouseGlow();
        initQuestionSlider();
        refreshIcons();
    }

    ready(initAllServices);
})();