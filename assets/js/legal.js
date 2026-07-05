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

    function initLegalHeroParallax() {
        const heroImage = document.querySelector(".legal-hero__image");
        if (!heroImage) return;

        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced) return;

        let ticking = false;

        function update() {
            const scroll = window.scrollY || 0;
            const offset = Math.min(34, scroll * 0.07);
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

    function initLegalTocActiveState() {
        const tocLinks = Array.from(document.querySelectorAll(".legal-toc__links a[href^='#']"));
        const sections = tocLinks
            .map((link) => {
                const id = link.getAttribute("href");
                const section = id ? document.querySelector(id) : null;

                return {
                    link,
                    section
                };
            })
            .filter((item) => item.section);

        if (!sections.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

                if (!visible) return;

                sections.forEach(({ link, section }) => {
                    const isActive = section === visible.target;
                    link.classList.toggle("is-active", isActive);
                    if (isActive) {
                        link.setAttribute("aria-current", "true");
                    } else {
                        link.removeAttribute("aria-current");
                    }
                });
            },
            {
                root: null,
                threshold: [0.16, 0.3, 0.55],
                rootMargin: "-18% 0px -62% 0px"
            }
        );

        sections.forEach(({ section }) => observer.observe(section));
    }

    function initLegalSmoothToc() {
        document.querySelectorAll(".legal-toc__links a[href^='#']").forEach((link) => {
            link.addEventListener("click", (event) => {
                const id = link.getAttribute("href");
                const target = id ? document.querySelector(id) : null;

                if (!target) return;

                event.preventDefault();

                const headerHeight = document.querySelector(".site-header")?.offsetHeight || 0;
                const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 24;

                window.scrollTo({
                    top: targetTop,
                    behavior: "smooth"
                });

                window.history.pushState(null, "", id);
            });
        });
    }

    function initCookiePreferenceActions() {
        const acceptButtons = document.querySelectorAll("[data-legal-cookie-accept]");
        const declineButtons = document.querySelectorAll("[data-legal-cookie-decline]");
        const resetButtons = document.querySelectorAll("[data-legal-cookie-reset]");
        const statusItems = document.querySelectorAll("[data-legal-cookie-status]");

        function setStatus(message) {
            statusItems.forEach((item) => {
                item.textContent = message;
                item.classList.add("is-visible");
            });
        }

        acceptButtons.forEach((button) => {
            button.addEventListener("click", () => {
                try {
                    localStorage.setItem("lawnoraCookieConsent", "accepted");
                } catch (error) {
                    
                }

                setStatus("Cookie preference saved: accepted.");
            });
        });

        declineButtons.forEach((button) => {
            button.addEventListener("click", () => {
                try {
                    localStorage.setItem("lawnoraCookieConsent", "declined");
                } catch (error) {
                    
                }

                setStatus("Cookie preference saved: declined.");
            });
        });

        resetButtons.forEach((button) => {
            button.addEventListener("click", () => {
                try {
                    localStorage.removeItem("lawnoraCookieConsent");
                } catch (error) {
                    
                }

                setStatus("Cookie preference reset. The cookie notice can appear again.");
            });
        });
    }

    function initLegalPrintButtons() {
        document.querySelectorAll("[data-print-page]").forEach((button) => {
            button.addEventListener("click", () => {
                window.print();
            });
        });
    }

    function initLegalExternalLinks() {
        document.querySelectorAll(".legal-document a[href^='http']").forEach((link) => {
            link.setAttribute("target", "_blank");
            link.setAttribute("rel", "noopener noreferrer");
        });
    }

    function initLegalCardsTilt() {
        const cards = document.querySelectorAll(".legal-contact-strip__card");

        if (!cards.length) return;

        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced) return;

        cards.forEach((card) => {
            card.addEventListener("mousemove", (event) => {
                const rect = card.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                const rotateX = ((y / rect.height) - 0.5) * -3.5;
                const rotateY = ((x / rect.width) - 0.5) * 3.5;

                card.style.transform = `translateY(-6px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            card.addEventListener("mouseleave", () => {
                card.style.transform = "";
            });
        });
    }

    function fixLegalTocSticky() {
        const toc = document.querySelector(".legal-toc");
        if (!toc) return;

        toc.removeAttribute("data-aos");
        toc.removeAttribute("data-aos-delay");
        toc.classList.remove("aos-init", "aos-animate");

        const parents = [
            document.documentElement,
            document.body,
            document.querySelector("main"),
            document.querySelector(".legal-content"),
            document.querySelector(".legal-content .container-wide"),
            document.querySelector(".legal-layout")
        ].filter(Boolean);

        parents.forEach((parent) => {
            parent.style.overflow = "visible";
            parent.style.overflowX = "visible";
            parent.style.overflowY = "visible";
            parent.style.transform = "none";
        });

        toc.style.position = "sticky";
        toc.style.top = "calc(var(--header-height) + 28px)";
        toc.style.alignSelf = "start";
        toc.style.height = "max-content";
        toc.style.transform = "none";
    }

    function initLegalPage() {
        fixLegalTocSticky();
        initLegalHeroParallax();
        initLegalTocActiveState();
        initLegalSmoothToc();
        initCookiePreferenceActions();
        initLegalPrintButtons();
        initLegalExternalLinks();
        initLegalCardsTilt();
        refreshIcons();
    }

    ready(initLegalPage);
})();