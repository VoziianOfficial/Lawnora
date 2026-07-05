"use strict";

(function () {
    const config = window.LAWNORA_CONFIG || {};

    const SELECTORS = {
        header: ".site-header",
        navLink: ".nav-link",
        mobileLink: ".mobile-menu__link",
        mobileMenu: "[data-mobile-menu]",
        mobileOpen: "[data-mobile-open]",
        mobileClose: "[data-mobile-close]",
        mobileDismiss: "[data-mobile-dismiss]",
        servicesDropdown: "[data-services-dropdown]",
        servicesDropdownGrid: "[data-services-dropdown-grid]",
        mobileServices: "[data-mobile-services]",
        footerServices: "[data-footer-services]",
        serviceSelect: "[data-service-select]",
        cookieBanner: "[data-cookie-banner]",
        cookieAccept: "[data-cookie-accept]",
        cookieDecline: "[data-cookie-decline]",
        accordion: "[data-accordion]",
        accordionTrigger: "[data-accordion-trigger]",
        accordionPanel: "[data-accordion-panel]"
    };

    const state = {
        lastFocusedElement: null
    };

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback, { once: true });
            return;
        }

        callback();
    }

    function getConfigValue(path, fallback = "") {
        if (!path || typeof path !== "string") return fallback;

        return path.split(".").reduce((current, key) => {
            if (current && Object.prototype.hasOwnProperty.call(current, key)) {
                return current[key];
            }

            return undefined;
        }, config) ?? fallback;
    }

    function setText(el, value) {
        if (!el) return;
        el.textContent = value ?? "";
    }

    function normalizePath(path) {
        return String(path || "").trim();
    }

    function createIcon(name) {
        const iconName = name || "leaf";

        return `<i data-lucide="${iconName}" aria-hidden="true"></i>`;
    }

    function refreshIcons() {
        if (window.lucide && typeof window.lucide.createIcons === "function") {
            window.lucide.createIcons();
        }
    }

    function initAOS() {
        if (!window.AOS || typeof window.AOS.init !== "function") return;

        window.AOS.init({
            once: true,
            duration: 760,
            easing: "ease-out-cubic",
            offset: 90,
            delay: 0,
            anchorPlacement: "top-bottom",
            disable: function () {
                return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            }
        });

        window.addEventListener(
            "load",
            () => {
                if (window.AOS && typeof window.AOS.refreshHard === "function") {
                    window.AOS.refreshHard();
                }
            },
            { once: true }
        );
    }

    function injectConfigText() {
        document.querySelectorAll("[data-config]").forEach((el) => {
            const path = el.getAttribute("data-config");
            setText(el, getConfigValue(path));
        });
    }

    function injectConfigAttributes() {
        document.querySelectorAll("[data-config-attr]").forEach((el) => {
            const raw = el.getAttribute("data-config-attr");
            if (!raw) return;

            raw.split(",").forEach((pair) => {
                const [attr, path] = pair.split(":").map((part) => part && part.trim());
                if (!attr || !path) return;

                const value = getConfigValue(path);
                if (value !== undefined && value !== null && value !== "") {
                    el.setAttribute(attr, value);
                }
            });
        });

        document.querySelectorAll("[data-config-img]").forEach((img) => {
            const path = img.getAttribute("data-config-img");
            const src = getConfigValue(path);
            if (src) img.setAttribute("src", src);
        });
    }

    function injectContactLinks() {
        const phoneRaw = getConfigValue("contact.phoneRaw");
        const phoneDisplay = getConfigValue("contact.phoneDisplay");
        const phoneButtonText = getConfigValue("contact.phoneButtonText");
        const email = getConfigValue("contact.email");
        const emailSubject = encodeURIComponent(getConfigValue("contact.emailSubject"));
        const address = getConfigValue("company.address");
        const mapQuery = encodeURIComponent(getConfigValue("company.mapQuery", address));
        const contactUrl = getConfigValue("contact.contactUrl", "contact.html#request-form");

        document.querySelectorAll("[data-phone-link]").forEach((link) => {
            link.setAttribute("href", `tel:${phoneRaw}`);
            link.setAttribute("aria-label", phoneButtonText || `Call ${phoneDisplay}`);

            if (link.hasAttribute("data-phone-text")) {
                setText(link, phoneDisplay);
            }
        });

        document.querySelectorAll("[data-email-link]").forEach((link) => {
            link.setAttribute("href", `mailto:${email}?subject=${emailSubject}`);
            link.setAttribute("aria-label", `Email ${email}`);

            if (link.hasAttribute("data-email-text")) {
                setText(link, email);
            }
        });

        document.querySelectorAll("[data-address-link]").forEach((link) => {
            link.setAttribute("href", `https://www.google.com/maps/search/?api=1&query=${mapQuery}`);
            link.setAttribute("target", "_blank");
            link.setAttribute("rel", "noopener noreferrer");

            if (link.hasAttribute("data-address-text")) {
                setText(link, address);
            }
        });

        document.querySelectorAll("[data-contact-link]").forEach((link) => {
            link.setAttribute("href", contactUrl);
        });
    }

    function injectLogoImages() {
        const logoPath = getConfigValue("brand.logo", "assets/images/logo.svg");

        document.querySelectorAll("[data-logo-src]").forEach((img) => {
            img.setAttribute("src", logoPath);
        });
    }

    function buildServiceDropdownLink(service) {
        return `
            <a class="services-dropdown__link" href="${service.url}">
                <span class="services-dropdown__icon">
                    ${createIcon(service.icon)}
                </span>
                <span>
                    <span class="services-dropdown__title">${service.title}</span>
                    <span class="services-dropdown__note">${service.shortTitle || "Compare options"}</span>
                </span>
                <span class="services-dropdown__arrow">
                    ${createIcon("arrow-up-right")}
                </span>
            </a>
        `;
    }

    function buildMobileServiceLink(service) {
        return `
            <a class="mobile-menu__service" href="${service.url}" data-mobile-dismiss>
                ${createIcon(service.icon)}
                <span>${service.title}</span>
            </a>
        `;
    }

    function buildFooterServiceLink(service) {
        return `
            <li>
                <a class="footer-link" href="${service.url}">${service.title}</a>
            </li>
        `;
    }

    function buildServiceOption(service) {
        return `<option value="${service.title}">${service.title}</option>`;
    }

    function injectServices() {
        const services = Array.isArray(config.services) ? config.services : [];

        document.querySelectorAll(SELECTORS.servicesDropdownGrid).forEach((wrap) => {
            wrap.innerHTML = services.map(buildServiceDropdownLink).join("");
        });

        document.querySelectorAll(SELECTORS.mobileServices).forEach((wrap) => {
            wrap.innerHTML = services.map(buildMobileServiceLink).join("");
        });

        document.querySelectorAll(SELECTORS.footerServices).forEach((wrap) => {
            wrap.innerHTML = services.map(buildFooterServiceLink).join("");
        });

        document.querySelectorAll(SELECTORS.serviceSelect).forEach((select) => {
            const currentValue = select.value;
            const placeholder =
                select.getAttribute("data-placeholder") || "Select a lawn care category";

            select.innerHTML = `
                <option value="">${placeholder}</option>
                ${services.map(buildServiceOption).join("")}
            `;

            if (currentValue) {
                select.value = currentValue;
            }
        });
    }

    function fillFormHiddenFields() {
        const sourceValue = `${document.title || "Lawnora page"} — ${window.location.pathname}`;

        document.querySelectorAll('input[name="sourcePage"]').forEach((input) => {
            input.value = sourceValue;
        });

        document.querySelectorAll("[data-form-recipient]").forEach((input) => {
            input.value = getConfigValue("form.recipientEmail", getConfigValue("contact.email"));
        });

        document.querySelectorAll("[data-form-brand]").forEach((input) => {
            input.value = getConfigValue("brand.name", "Lawnora");
        });
    }

    function injectGlobalContent() {
        injectConfigText();
        injectConfigAttributes();
        injectContactLinks();
        injectLogoImages();
        injectServices();
        fillFormHiddenFields();
        refreshIcons();
    }

    function initStickyHeader() {
        const header = document.querySelector(SELECTORS.header);
        if (!header) return;

        const update = () => {
            header.classList.toggle("is-scrolled", window.scrollY > 8);
        };

        update();
        window.addEventListener("scroll", update, { passive: true });
    }

    function cleanUrlPath(pathname) {
        const path = pathname.split("/").pop() || "index.html";
        return path === "" ? "index.html" : path;
    }

    function setActiveNavigation() {
        const currentPage = cleanUrlPath(window.location.pathname);

        document.querySelectorAll(`${SELECTORS.navLink}, ${SELECTORS.mobileLink}`).forEach((link) => {
            const href = link.getAttribute("href");
            if (!href) return;

            const linkPage = cleanUrlPath(href.split("#")[0]);

            if (linkPage === currentPage) {
                link.classList.add("is-active");
                link.setAttribute("aria-current", "page");
            }
        });

        const servicePages = (config.services || []).map((service) => cleanUrlPath(service.url));
        if (servicePages.includes(currentPage)) {
            document.querySelectorAll('[href="all-services.html"]').forEach((link) => {
                if (link.classList.contains("nav-link") || link.classList.contains("mobile-menu__link")) {
                    link.classList.add("is-active");
                }
            });
        }
    }

    function initServicesDropdown() {
        const dropdown = document.querySelector(SELECTORS.servicesDropdown);
        if (!dropdown) return;

        const parent = dropdown.closest(".nav-item--services");
        const trigger = parent ? parent.querySelector(".nav-link") : null;
        let timer = null;

        const open = () => {
            clearTimeout(timer);
            dropdown.classList.add("is-open");
            if (trigger) trigger.setAttribute("aria-expanded", "true");
        };

        const close = () => {
            timer = window.setTimeout(() => {
                dropdown.classList.remove("is-open");
                if (trigger) trigger.setAttribute("aria-expanded", "false");
            }, 180);
        };

        if (parent) {
            parent.addEventListener("mouseenter", open);
            parent.addEventListener("mouseleave", close);
            parent.addEventListener("focusin", open);
            parent.addEventListener("focusout", (event) => {
                if (!parent.contains(event.relatedTarget)) close();
            });
        }

        if (trigger) {
            trigger.addEventListener("click", (event) => {
                const href = trigger.getAttribute("href");

                if (window.innerWidth >= 1180) {
                    return;
                }

                if (!href || href === "#") {
                    event.preventDefault();
                    dropdown.classList.toggle("is-open");
                    trigger.setAttribute(
                        "aria-expanded",
                        dropdown.classList.contains("is-open") ? "true" : "false"
                    );
                }
            });
        }

        document.addEventListener("keydown", (event) => {
            if (event.key !== "Escape") return;
            dropdown.classList.remove("is-open");
            if (trigger) trigger.setAttribute("aria-expanded", "false");
        });
    }

    function getFocusableElements(container) {
        if (!container) return [];

        return Array.from(
            container.querySelectorAll(
                'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
        ).filter((el) => !el.hasAttribute("hidden") && el.offsetParent !== null);
    }

    function trapFocus(event, container) {
        if (event.key !== "Tab") return;

        const focusable = getFocusableElements(container);
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        }

        if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function initMobileMenu() {
        const menu = document.querySelector(SELECTORS.mobileMenu);
        const openButtons = document.querySelectorAll(SELECTORS.mobileOpen);
        const closeButtons = document.querySelectorAll(SELECTORS.mobileClose);
        if (!menu || !openButtons.length) return;

        const isMenuOpen = () => menu.classList.contains("is-open");

        const openMenu = (button) => {
            state.lastFocusedElement = button || document.activeElement;
            menu.classList.add("is-open");
            menu.setAttribute("aria-hidden", "false");
            document.body.classList.add("is-menu-open");

            openButtons.forEach((btn) => btn.setAttribute("aria-expanded", "true"));

            const focusable = getFocusableElements(menu);
            if (focusable.length) focusable[0].focus();
        };

        const closeMenu = () => {
            menu.classList.remove("is-open");
            menu.setAttribute("aria-hidden", "true");
            document.body.classList.remove("is-menu-open");

            openButtons.forEach((btn) => btn.setAttribute("aria-expanded", "false"));

            if (state.lastFocusedElement && typeof state.lastFocusedElement.focus === "function") {
                state.lastFocusedElement.focus();
            }
        };

        openButtons.forEach((button) => {
            button.addEventListener("click", () => {
                if (isMenuOpen()) {
                    closeMenu();
                    return;
                }

                openMenu(button);
            });
        });

        closeButtons.forEach((button) => {
            button.addEventListener("click", closeMenu);
        });

        menu.addEventListener("click", (event) => {
            const dismissTarget = event.target.closest(SELECTORS.mobileDismiss);
            if (dismissTarget) closeMenu();
        });

        menu.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeMenu();
                return;
            }

            trapFocus(event, menu);
        });
    }

    function initCookieBanner() {
        const banner = document.querySelector(SELECTORS.cookieBanner);
        if (!banner) return;

        const accept = banner.querySelector(SELECTORS.cookieAccept);
        const decline = banner.querySelector(SELECTORS.cookieDecline);

        const storageKey = getConfigValue("cookies.storageKey", "lawnora_cookie_choice");
        const acceptedValue = getConfigValue("cookies.acceptedValue", "accepted");
        const declinedValue = getConfigValue("cookies.declinedValue", "declined");

        const savedChoice = localStorage.getItem(storageKey);

        if (!savedChoice) {
            banner.classList.add("is-visible");
            banner.setAttribute("aria-hidden", "false");
        } else {
            banner.classList.remove("is-visible");
            banner.setAttribute("aria-hidden", "true");
        }

        const saveChoice = (value) => {
            localStorage.setItem(storageKey, value);
            banner.classList.remove("is-visible");
            banner.setAttribute("aria-hidden", "true");
        };

        if (accept) {
            accept.addEventListener("click", () => saveChoice(acceptedValue));
        }

        if (decline) {
            decline.addEventListener("click", () => saveChoice(declinedValue));
        }
    }

    function setPanelState(trigger, panel, isOpen) {
        trigger.setAttribute("aria-expanded", String(isOpen));
        panel.classList.toggle("is-open", isOpen);
        panel.setAttribute("aria-hidden", String(!isOpen));
    }

    function initAccordions(root = document) {
        root.querySelectorAll(SELECTORS.accordion).forEach((accordion) => {
            const allowMultiple = accordion.hasAttribute("data-accordion-multiple");
            const triggers = accordion.querySelectorAll(SELECTORS.accordionTrigger);

            triggers.forEach((trigger, index) => {
                const panelId = trigger.getAttribute("aria-controls");
                const panel =
                    (panelId && document.getElementById(panelId)) ||
                    trigger.closest(".accordion-item")?.querySelector(SELECTORS.accordionPanel);

                if (!panel) return;

                if (!trigger.id) {
                    trigger.id = `accordion-trigger-${Math.random().toString(16).slice(2)}`;
                }

                if (!panel.id) {
                    panel.id = `accordion-panel-${Math.random().toString(16).slice(2)}`;
                }

                trigger.setAttribute("aria-controls", panel.id);
                panel.setAttribute("aria-labelledby", trigger.id);

                const shouldOpen =
                    trigger.getAttribute("aria-expanded") === "true" ||
                    panel.classList.contains("is-open") ||
                    index === 0;

                setPanelState(trigger, panel, shouldOpen);

                trigger.addEventListener("click", () => {
                    const isOpen = trigger.getAttribute("aria-expanded") === "true";

                    if (!allowMultiple) {
                        triggers.forEach((otherTrigger) => {
                            const otherPanelId = otherTrigger.getAttribute("aria-controls");
                            const otherPanel = otherPanelId && document.getElementById(otherPanelId);

                            if (otherTrigger !== trigger && otherPanel) {
                                setPanelState(otherTrigger, otherPanel, false);
                            }
                        });
                    }

                    setPanelState(trigger, panel, !isOpen);
                });
            });
        });
    }

    function initSmoothAnchorScroll() {
        document.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener("click", (event) => {
                const targetId = link.getAttribute("href");
                if (!targetId || targetId === "#") return;

                const target = document.querySelector(targetId);
                if (!target) return;

                event.preventDefault();
                target.scrollIntoView({ behavior: "smooth", block: "start" });

                if (target.hasAttribute("tabindex")) {
                    target.focus({ preventScroll: true });
                }
            });
        });
    }

    function initHorizontalActiveScroll() {
        const navs = document.querySelectorAll("[data-scroll-nav]");
        if (!navs.length) return;

        navs.forEach((nav) => {
            const links = Array.from(nav.querySelectorAll("a[href^='#']"));
            const sections = links
                .map((link) => document.querySelector(link.getAttribute("href")))
                .filter(Boolean);

            if (!sections.length) return;

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) return;

                        links.forEach((link) => {
                            const isActive = link.getAttribute("href") === `#${entry.target.id}`;
                            link.classList.toggle("is-active", isActive);
                        });
                    });
                },
                {
                    rootMargin: "-30% 0px -62% 0px",
                    threshold: 0.01
                }
            );

            sections.forEach((section) => observer.observe(section));
        });
    }

    function initRevealOnHoverCards() {
        document.querySelectorAll("[data-reveal-card]").forEach((card) => {
            card.addEventListener("click", () => {
                card.classList.toggle("is-open");
            });

            card.addEventListener("keydown", (event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                card.classList.toggle("is-open");
            });
        });
    }

    function initBasicTabs(root = document) {
        root.querySelectorAll("[data-tabs]").forEach((tabs) => {
            const buttons = Array.from(tabs.querySelectorAll("[data-tab-button]"));
            const panels = Array.from(tabs.querySelectorAll("[data-tab-panel]"));
            if (!buttons.length || !panels.length) return;

            const activate = (id) => {
                buttons.forEach((button) => {
                    const isActive = button.getAttribute("data-tab-button") === id;
                    button.classList.toggle("is-active", isActive);
                    button.setAttribute("aria-selected", String(isActive));
                    button.setAttribute("tabindex", isActive ? "0" : "-1");
                });

                panels.forEach((panel) => {
                    const isActive = panel.getAttribute("data-tab-panel") === id;
                    panel.classList.toggle("is-active", isActive);
                    panel.toggleAttribute("hidden", !isActive);
                });

                refreshIcons();
            };

            buttons.forEach((button, index) => {
                button.setAttribute("role", "tab");

                button.addEventListener("click", () => {
                    activate(button.getAttribute("data-tab-button"));
                });

                button.addEventListener("keydown", (event) => {
                    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

                    event.preventDefault();

                    let nextIndex = index;

                    if (event.key === "ArrowRight") nextIndex = (index + 1) % buttons.length;
                    if (event.key === "ArrowLeft") nextIndex = (index - 1 + buttons.length) % buttons.length;
                    if (event.key === "Home") nextIndex = 0;
                    if (event.key === "End") nextIndex = buttons.length - 1;

                    buttons[nextIndex].focus();
                    activate(buttons[nextIndex].getAttribute("data-tab-button"));
                });
            });

            panels.forEach((panel) => panel.setAttribute("role", "tabpanel"));

            const initiallyActive =
                buttons.find((button) => button.classList.contains("is-active")) || buttons[0];

            activate(initiallyActive.getAttribute("data-tab-button"));
        });
    }

    function createFAQSchema(items) {
        if (!Array.isArray(items) || !items.length) return;

        const schema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: {
                    "@type": "Answer",
                    text: item.answer
                }
            }))
        };

        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
    }

    function collectVisibleFAQSchema() {
        document.querySelectorAll("[data-faq-schema]").forEach((faqRoot) => {
            const items = Array.from(faqRoot.querySelectorAll(".accordion-item"))
                .map((item) => {
                    const question = item.querySelector("[data-accordion-trigger] span")?.textContent?.trim();
                    const answer = item.querySelector(".accordion-panel__content")?.textContent?.trim();

                    if (!question || !answer) return null;

                    return { question, answer };
                })
                .filter(Boolean);

            createFAQSchema(items);
        });
    }

    function initExternalLinks() {
        document.querySelectorAll('a[target="_blank"]').forEach((link) => {
            const rel = link.getAttribute("rel") || "";
            if (!rel.includes("noopener")) {
                link.setAttribute("rel", `${rel} noopener noreferrer`.trim());
            }
        });
    }

    function getServiceById(id) {
        return (config.services || []).find((service) => service.id === id);
    }

    function getServiceByUrl(url) {
        const page = cleanUrlPath(url || window.location.pathname);
        return (config.services || []).find((service) => cleanUrlPath(service.url) === page);
    }

    function updateSliderProgress(swiper, progressEl) {
        if (!swiper || !progressEl) return;

        const total = swiper.slides ? swiper.slides.length : 1;
        const realIndex = typeof swiper.realIndex === "number" ? swiper.realIndex : swiper.activeIndex || 0;
        const percentage = total <= 1 ? 100 : ((realIndex + 1) / total) * 100;

        progressEl.style.width = `${Math.max(8, Math.min(100, percentage))}%`;
    }

    function debounce(callback, wait = 120) {
        let timeout = null;

        return function debounced(...args) {
            window.clearTimeout(timeout);
            timeout = window.setTimeout(() => callback.apply(this, args), wait);
        };
    }

    function initGlobal() {
        injectGlobalContent();
        initStickyHeader();
        setActiveNavigation();
        initServicesDropdown();
        initMobileMenu();
        initCookieBanner();
        initAccordions();
        initSmoothAnchorScroll();
        initHorizontalActiveScroll();
        initRevealOnHoverCards();
        initBasicTabs();
        collectVisibleFAQSchema();
        initExternalLinks();
        initAOS();
        refreshIcons();
    }

    window.LawnoraUtils = {
        config,
        getConfigValue,
        getServiceById,
        getServiceByUrl,
        injectGlobalContent,
        initAccordions,
        initBasicTabs,
        createFAQSchema,
        updateSliderProgress,
        debounce,
        refreshIcons
    };

    ready(initGlobal);
})();
