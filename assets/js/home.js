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

        const wrapper = swiperEl.querySelector(".swiper-wrapper");
        if (!wrapper) return;

        const progress = document.querySelector("[data-process-progress]");
        const utils = getUtils();

        
        if (!swiperEl.hasAttribute("data-loop-prepared")) {
            const originalSlides = Array.from(wrapper.children);

            while (wrapper.children.length < 12) {
                originalSlides.forEach((slide) => {
                    const clone = slide.cloneNode(true);
                    clone.setAttribute("aria-hidden", "true");
                    clone.classList.add("home-process__slide--clone");
                    wrapper.appendChild(clone);
                });
            }

            swiperEl.setAttribute("data-loop-prepared", "true");
        }

        const swiper = new Swiper(swiperEl, {
            slidesPerView: 1,
            slidesPerGroup: 1,
            spaceBetween: 18,
            speed: 720,
            loop: true,
            loopAdditionalSlides: 1,
            watchOverflow: false,
            grabCursor: true,
            watchSlidesProgress: true,
            navigation: {
                nextEl: "[data-process-next]",
                prevEl: "[data-process-prev]"
            },
            breakpoints: {
                760: {
                    slidesPerView: 1.15,
                    slidesPerGroup: 1,
                    spaceBetween: 18
                },
                980: {
                    slidesPerView: 1.3,
                    slidesPerGroup: 1,
                    spaceBetween: 20
                },
                1180: {
                    slidesPerView: 1.45,
                    slidesPerGroup: 1,
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

    function initPopularShowcase() {
        const root = document.querySelector("[data-home-popular-showcase]");
        if (!root) return;

        const utils = getUtils();
        const services =
            window.LAWNORA_CONFIG && Array.isArray(window.LAWNORA_CONFIG.services)
                ? window.LAWNORA_CONFIG.services
                : [];

        if (!services.length) return;

        const backgrounds = Array.from(root.querySelectorAll("[data-showcase-bg]"));
        const title = root.querySelector("[data-showcase-title]");
        const text = root.querySelector("[data-showcase-text]");
        const detail = root.querySelector("[data-showcase-detail]");
        const link = root.querySelector("[data-showcase-link]");
        const icon = root.querySelector("[data-showcase-icon]");
        const count = root.querySelector("[data-showcase-count]");
        const smallItems = root.querySelectorAll("[data-showcase-small]");
        const nextButton = root.querySelector("[data-showcase-next]");
        const prevButton = root.querySelector("[data-showcase-prev]");

        let activeIndex = 0;
        let timer = null;
        let isAnimating = false;
        let touchStartX = 0;

        backgrounds.forEach((background) => {
            const serviceId = background.getAttribute("data-showcase-bg");
            const service =
                typeof utils.getServiceById === "function"
                    ? utils.getServiceById(serviceId)
                    : services.find((item) => item.id === serviceId);

            if (!service || !service.image) return;

            background.style.backgroundImage = `url("${service.image}")`;
        });

        function getService(index) {
            return services[index] || services[0];
        }

        function updateContent(service, index) {
            backgrounds.forEach((background) => {
                const isActive = background.getAttribute("data-showcase-bg") === service.id;
                background.classList.toggle("is-active", isActive);
            });

            if (title) {
                title.textContent = service.title || "Lawn Care Category";
            }

            if (text) {
                text.textContent =
                    service.description ||
                    "Review this lawn care category before submitting your request.";
            }

            if (detail) {
                detail.textContent =
                    service.usefulWhen ||
                    service.compareFor ||
                    "Use this category to organize details before comparing available provider options.";
            }

            if (link) {
                link.href = service.url || "all-services.html";
            }

            if (icon) {
                icon.setAttribute("data-lucide", service.icon || "leaf");
            }

            if (count) {
                count.textContent = `${String(index + 1).padStart(2, "0")} / ${String(services.length).padStart(2, "0")}`;
            }

            smallItems.forEach((item) => {
                item.textContent = service.shortTitle || "Lawn care category";
            });

            refreshIcons();
        }

        function goTo(index, direction = "next") {
            if (isAnimating) return;

            const nextIndex = (index + services.length) % services.length;
            const service = getService(nextIndex);

            isAnimating = true;
            activeIndex = nextIndex;

            root.classList.remove("is-turning-next", "is-turning-prev");
            root.classList.add("is-changing", direction === "prev" ? "is-turning-prev" : "is-turning-next");

            window.setTimeout(() => {
                updateContent(service, activeIndex);
            }, 260);

            window.setTimeout(() => {
                root.classList.remove("is-changing", "is-turning-next", "is-turning-prev");
                isAnimating = false;
            }, 760);
        }

        function nextSlide() {
            goTo(activeIndex + 1, "next");
        }

        function prevSlide() {
            goTo(activeIndex - 1, "prev");
        }

        function restartTimer() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(nextSlide, 3800);
        }

        updateContent(getService(activeIndex), activeIndex);
        restartTimer();

        if (nextButton) {
            nextButton.addEventListener("click", () => {
                nextSlide();
                restartTimer();
            });
        }

        if (prevButton) {
            prevButton.addEventListener("click", () => {
                prevSlide();
                restartTimer();
            });
        }

        root.addEventListener(
            "touchstart",
            (event) => {
                touchStartX = event.touches[0].clientX;
            },
            { passive: true }
        );

        root.addEventListener(
            "touchend",
            (event) => {
                const touchEndX = event.changedTouches[0].clientX;
                const diff = touchStartX - touchEndX;

                if (Math.abs(diff) < 40) return;

                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }

                restartTimer();
            },
            { passive: true }
        );

        root.addEventListener("keydown", (event) => {
            if (event.key === "ArrowRight") {
                nextSlide();
                restartTimer();
            }

            if (event.key === "ArrowLeft") {
                prevSlide();
                restartTimer();
            }
        });

        document.addEventListener("visibilitychange", () => {
            if (document.hidden && timer) {
                window.clearInterval(timer);
                timer = null;
                return;
            }

            if (!document.hidden && !timer) {
                restartTimer();
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
        initPopularShowcase();
    }

    ready(initHome);
})();