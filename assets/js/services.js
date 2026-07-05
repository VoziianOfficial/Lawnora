"use strict";

(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback, { once: true });
            return;
        }

        callback();
    }

    function getConfig() {
        return window.LAWNORA_CONFIG || {};
    }

    function getServices() {
        const config = getConfig();
        return Array.isArray(config.services) ? config.services : [];
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

    function getCurrentService() {
        const services = getServices();
        const bodyId = document.body ? document.body.getAttribute("data-service-id") : "";
        const currentPath = window.location.pathname.split("/").pop();

        if (bodyId) {
            const byId = services.find((service) => service.id === bodyId);
            if (byId) return byId;
        }

        return services.find((service) => service.url === currentPath) || null;
    }

    function initServiceHeroParallax() {
        const heroImage = document.querySelector(".service-hero__image");
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

    function hydrateCurrentServiceLinks(service) {
        if (!service) return;

        document.querySelectorAll("[data-current-service-title]").forEach((item) => {
            item.textContent = service.title || "";
        });

        document.querySelectorAll("[data-current-service-short]").forEach((item) => {
            item.textContent = service.shortTitle || service.title || "";
        });

        document.querySelectorAll("[data-current-service-description]").forEach((item) => {
            item.textContent = service.description || "";
        });

        document.querySelectorAll("[data-current-service-icon]").forEach((item) => {
            item.setAttribute("data-lucide", service.icon || "leaf");
        });

        document.querySelectorAll("[data-current-service-image]").forEach((item) => {
            if (!service.image) return;
            item.setAttribute("src", service.image);
        });

        document.querySelectorAll("[data-current-service-link]").forEach((item) => {
            item.setAttribute("href", service.url || "all-services.html");
        });

        document.querySelectorAll("[data-request-current-service]").forEach((item) => {
            const url = new URL("contact.html", window.location.href);
            url.hash = "request-form";
            url.searchParams.set("service", service.title || service.shortTitle || "");
            item.setAttribute("href", `${url.pathname.split("/").pop()}${url.search}${url.hash}`);
        });
    }

    function createRelatedCard(service) {
        const card = document.createElement("a");
        card.className = "service-related__card card-shine";
        card.href = service.url || "all-services.html";

        card.innerHTML = `
            <img src="${service.image || "assets/images/service-1.jpg"}" alt="${service.title || "Lawn care category"}">
            <span class="service-related__icon">
                <i data-lucide="${service.icon || "leaf"}" aria-hidden="true"></i>
            </span>
            <span class="service-related__content">
                <h3>${service.title || "Lawn Care Category"}</h3>
                <p>${service.description || "Review this Lawnora request category and compare available provider options."}</p>
                <span>View category <i data-lucide="arrow-up-right" aria-hidden="true"></i></span>
            </span>
        `;

        return card;
    }

    function initRelatedServices(currentService) {
        const containers = document.querySelectorAll("[data-related-services]");
        if (!containers.length) return;

        const services = getServices();
        const currentId = currentService ? currentService.id : "";

        const related = services
            .filter((service) => service.id !== currentId)
            .slice(0, 3);

        containers.forEach((container) => {
            container.innerHTML = "";
            related.forEach((service) => {
                container.appendChild(createRelatedCard(service));
            });
        });

        refreshIcons();
    }

    function initRequestServiceFromQuery() {
        const params = new URLSearchParams(window.location.search);
        const selectedService = params.get("service");

        if (!selectedService) return;

        const select = document.querySelector("[data-service-select]");
        if (!select) return;

        Array.from(select.options).forEach((option) => {
            if (option.textContent.trim() === selectedService.trim() || option.value.trim() === selectedService.trim()) {
                option.selected = true;
            }
        });
    }

    function initServiceCardsTilt() {
        const cards = document.querySelectorAll(
            ".service-board__card, .service-process__step, .service-related__card, .service-overview__mini article"
        );

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

    function initServiceAnchorFocus() {
        document.querySelectorAll('a[href^="contact.html#request-form"], [data-request-current-service]').forEach((link) => {
            link.addEventListener("click", () => {
                try {
                    sessionStorage.setItem("lawnoraLastServiceRequest", document.title);
                } catch (error) {
                    /* silent */
                }
            });
        });
    }

    function initServicePrintMeta() {
        const service = getCurrentService();
        if (!service) return;

        const metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription || metaDescription.getAttribute("content")) return;

        metaDescription.setAttribute(
            "content",
            `${service.title} request category from Lawnora. Compare available local provider options through an independent provider-matching platform.`
        );
    }

    function initServicesPage() {
        const currentService = getCurrentService();

        hydrateCurrentServiceLinks(currentService);
        initRelatedServices(currentService);
        initRequestServiceFromQuery();
        initServiceHeroParallax();
        initServiceCardsTilt();
        initServiceAnchorFocus();
        initServicePrintMeta();
        refreshIcons();
    }

    ready(initServicesPage);
})();