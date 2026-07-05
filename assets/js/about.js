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

    function initAboutHeroParallax() {
        const heroImage = document.querySelector(".about-hero__image");
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

    function initScenarioPanelAnimation() {
        const root = document.querySelector(".about-scenarios");
        if (!root) return;

        const buttons = Array.from(root.querySelectorAll("[data-tab-button]"));
        const panels = Array.from(root.querySelectorAll("[data-tab-panel]"));

        if (!buttons.length || !panels.length) return;

        buttons.forEach((button) => {
            button.addEventListener("click", () => {
                const target = button.getAttribute("data-tab-button");
                const panel = panels.find((item) => item.getAttribute("data-tab-panel") === target);

                if (!panel) return;

                panel.classList.remove("about-scenarios__panel--animated");

                window.requestAnimationFrame(() => {
                    panel.classList.add("about-scenarios__panel--animated");
                });

                refreshIcons();
            });
        });
    }

    function initMarqueeAccessibility() {
        const marquee = document.querySelector("[data-about-marquee]");
        if (!marquee) return;

        const row = marquee.querySelector(".about-marquee__row");
        if (!row) return;

        marquee.addEventListener("focusin", () => {
            row.style.animationPlayState = "paused";
        });

        marquee.addEventListener("focusout", () => {
            row.style.animationPlayState = "";
        });
    }

    function initValueCardsTilt() {
        const cards = document.querySelectorAll(".about-values__card, .about-model__panel");

        if (!cards.length) return;

        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced) return;

        cards.forEach((card) => {
            card.addEventListener("mousemove", (event) => {
                const rect = card.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                const rotateX = ((y / rect.height) - 0.5) * -4;
                const rotateY = ((x / rect.width) - 0.5) * 4;

                card.style.transform = `translateY(-7px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            card.addEventListener("mouseleave", () => {
                card.style.transform = "";
            });
        });
    }

    function initChoiceSlider() {
        const sliders = document.querySelectorAll("[data-choice-slider]");
        if (!sliders.length) return;

        sliders.forEach((slider) => {
            const slides = Array.from(slider.querySelectorAll("[data-choice-slide]"));
            if (!slides.length) return;

            slides.forEach((slide) => {
                const button = slide.querySelector("button");
                if (!button) return;

                button.addEventListener("click", () => {
                    slides.forEach((item) => {
                        const itemButton = item.querySelector("button");
                        const isActive = item === slide;

                        item.classList.toggle("is-active", isActive);

                        if (itemButton) {
                            itemButton.setAttribute("aria-expanded", isActive ? "true" : "false");
                        }
                    });
                });
            });
        });
    }

    function initAbout() {
        initAboutHeroParallax();
        initScenarioPanelAnimation();
        initMarqueeAccessibility();
        initValueCardsTilt();
        initChoiceSlider();
        refreshIcons();
    }

    ready(initAbout);
})();