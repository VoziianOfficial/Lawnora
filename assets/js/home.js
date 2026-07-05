"use strict";

(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback, { once: true });
            return;
        }

        callback();
    }

    function getUtils() {
        return window.LawnoraUtils || {};
    }

    function refreshIcons() {
        const utils = getUtils();

        if (typeof utils.refreshIcons === "function") {
            utils.refreshIcons();
            return;
        }

        if (window.lucide && typeof window.lucide.createIcons === "function") {
            window.lucide.createIcons();
        }
    }

    function initHomeServiceSelector() {
        const root = document.querySelector("[data-home-selector]");
        if (!root) return;

        const utils = getUtils();
        const buttons = Array.from(root.querySelectorAll("[data-home-service-button]"));
        const preview = root.querySelector("[data-home-service-preview]");
        const previewImage = root.querySelector("[data-home-preview-image]");
        const previewIcon = root.querySelector("[data-home-preview-icon]");
        const previewTitle = root.querySelector("[data-home-preview-title]");
        const previewText = root.querySelector("[data-home-preview-text]");
        const previewLink = root.querySelector("[data-home-preview-link]");

        if (!buttons.length || !preview) return;

        function activateService(serviceId) {
            const service =
                typeof utils.getServiceById === "function"
                    ? utils.getServiceById(serviceId)
                    : null;

            if (!service) return;

            buttons.forEach((button) => {
                const isActive = button.getAttribute("data-home-service-button") === serviceId;
                button.classList.toggle("is-active", isActive);
                button.setAttribute("aria-selected", String(isActive));
            });

            preview.classList.add("is-changing");

            window.setTimeout(() => {
                if (previewImage) {
                    previewImage.src = service.image;
                    previewImage.alt = `${service.title} preview`;
                }

                if (previewIcon) {
                    previewIcon.setAttribute("data-lucide", service.icon || "leaf");
                }

                if (previewTitle) {
                    previewTitle.textContent = service.title;
                }

                if (previewText) {
                    previewText.textContent = service.description;
                }

                if (previewLink) {
                    previewLink.href = service.url;
                }

                refreshIcons();
            }, 120);

            window.setTimeout(() => {
                preview.classList.remove("is-changing");
            }, 420);
        }

        buttons.forEach((button) => {
            const serviceId = button.getAttribute("data-home-service-button");

            button.addEventListener("click", () => activateService(serviceId));
            button.addEventListener("mouseenter", () => activateService(serviceId));
        });
    }

    function initFitImageSwitcher() {
        const imageWrap = document.querySelector(".home-fit__image");
        const image = document.querySelector("[data-fit-image]");
        const triggers = document.querySelectorAll("[data-fit-trigger]");

        if (!imageWrap || !image || !triggers.length) return;

        triggers.forEach((trigger) => {
            trigger.addEventListener("click", () => {
                const nextImage = trigger.getAttribute("data-fit-trigger");
                if (!nextImage || image.getAttribute("src") === nextImage) return;

                imageWrap.classList.add("is-changing");

                window.setTimeout(() => {
                    image.src = nextImage;
                }, 130);

                window.setTimeout(() => {
                    imageWrap.classList.remove("is-changing");
                }, 420);
            });
        });
    }

    function initProcessSwiper() {
        const swiperEl = document.querySelector("[data-process-swiper]");
        if (!swiperEl || !window.Swiper) return;

        const progress = document.querySelector("[data-process-progress]");
        const utils = getUtils();

        const swiper = new Swiper(swiperEl, {
            slidesPerView: 1,
            spaceBetween: 18,
            speed: 720,
            loop: false,
            grabCursor: true,
            watchSlidesProgress: true,
            navigation: {
                nextEl: "[data-process-next]",
                prevEl: "[data-process-prev]"
            },
            breakpoints: {
                760: {
                    slidesPerView: 1.25,
                    spaceBetween: 18
                },
                980: {
                    slidesPerView: 1.45,
                    spaceBetween: 20
                },
                1180: {
                    slidesPerView: 1.65,
                    spaceBetween: 22
                }
            },
            on: {
                init(instance) {
                    if (typeof utils.updateSliderProgress === "function") {
                        utils.updateSliderProgress(instance, progress);
                    }
                },
                slideChange(instance) {
                    if (typeof utils.updateSliderProgress === "function") {
                        utils.updateSliderProgress(instance, progress);
                    }
                }
            }
        });
    }

    function initStorySwiper() {
        const swiperEl = document.querySelector("[data-story-swiper]");
        if (!swiperEl || !window.Swiper) return;

        new Swiper(swiperEl, {
            slidesPerView: 1,
            effect: "fade",
            fadeEffect: {
                crossFade: true
            },
            speed: 900,
            loop: true,
            grabCursor: true,
            autoplay: {
                delay: 5200,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            },
            pagination: {
                el: "[data-story-dots]",
                clickable: true
            },
            navigation: {
                nextEl: "[data-story-next]",
                prevEl: "[data-story-prev]"
            },
            keyboard: {
                enabled: true,
                onlyInViewport: true
            }
        });
    }

    function initHeroParallaxSoftness() {
        const heroImage = document.querySelector(".home-hero__image");
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

    function initCardKeyboardOpen() {
        document.querySelectorAll("[data-reveal-card]").forEach((card) => {
            if (!card.hasAttribute("role")) {
                card.setAttribute("role", "button");
            }

            if (!card.hasAttribute("aria-label")) {
                const title = card.querySelector("h3")?.textContent?.trim() || "Open card detail";
                card.setAttribute("aria-label", title);
            }
        });
    }

    function initHome() {
        initHomeServiceSelector();
        initFitImageSwitcher();
        initProcessSwiper();
        initStorySwiper();
        initHeroParallaxSoftness();
        initCardKeyboardOpen();
        refreshIcons();
    }

    ready(initHome);
})();