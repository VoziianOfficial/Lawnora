"use strict";

(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback, { once: true });
            return;
        }

        callback();
    }

    function getConfigValue(path, fallback = "") {
        if (window.LawnoraUtils && typeof window.LawnoraUtils.getConfigValue === "function") {
            return window.LawnoraUtils.getConfigValue(path, fallback);
        }

        return fallback;
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

    function initContactHeroParallax() {
        const heroImage = document.querySelector(".contact-hero__image");
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

    function setStatus(statusEl, type, message) {
        if (!statusEl) return;

        statusEl.className = "form-status is-visible";
        statusEl.classList.add(type === "success" ? "is-success" : "is-error");
        statusEl.textContent = message;
    }

    function clearStatus(statusEl) {
        if (!statusEl) return;

        statusEl.className = "form-status";
        statusEl.textContent = "";
    }

    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
    }

    function validateForm(form) {
        const fullName = form.querySelector('[name="fullName"]');
        const email = form.querySelector('[name="email"]');
        const phone = form.querySelector('[name="phone"]');
        const service = form.querySelector('[name="service"]');
        const message = form.querySelector('[name="message"]');
        const privacyConsent = form.querySelector('[name="privacyConsent"]');

        const fields = [fullName, email, phone, service, message, privacyConsent];

        fields.forEach((field) => {
            if (!field) return;
            field.removeAttribute("aria-invalid");
        });

        let firstInvalid = null;

        function markInvalid(field) {
            if (!firstInvalid) firstInvalid = field;
            field.setAttribute("aria-invalid", "true");
        }

        if (!fullName || !fullName.value.trim()) markInvalid(fullName);
        if (!email || !isValidEmail(email.value)) markInvalid(email);
        if (!phone || !phone.value.trim()) markInvalid(phone);
        if (!service || !service.value.trim()) markInvalid(service);
        if (!message || !message.value.trim()) markInvalid(message);
        if (!privacyConsent || !privacyConsent.checked) markInvalid(privacyConsent);

        if (firstInvalid) {
            firstInvalid.focus();
            return false;
        }

        return true;
    }

    function initFormStartTime() {
        document.querySelectorAll("[data-form-started-at]").forEach((input) => {
            input.value = String(Date.now());
        });
    }

    function buildFormData(form) {
        const formData = new FormData(form);

        if (!formData.get("sourcePage")) {
            formData.set("sourcePage", `${document.title} — ${window.location.pathname}`);
        }

        return formData;
    }

    async function submitForm(form, statusEl) {
        const endpoint = form.getAttribute("action") || getConfigValue("form.endpoint", "contact.php");
        const successMessage = getConfigValue(
            "form.successMessage",
            "Thank you. Your request has been received."
        );
        const errorMessage = getConfigValue(
            "form.errorMessage",
            "Please check the required fields and try again."
        );

        const submitButton = form.querySelector('button[type="submit"]');
        const submitLabel = submitButton ? submitButton.querySelector("span") : null;
        const originalLabel = submitLabel ? submitLabel.textContent : "";

        clearStatus(statusEl);

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.classList.add("is-loading");
        }

        if (submitLabel) {
            submitLabel.textContent = "Sending...";
        }

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                body: buildFormData(form),
                headers: {
                    Accept: "application/json"
                }
            });

            let result = null;

            try {
                result = await response.json();
            } catch (error) {
                result = null;
            }

            if (!response.ok || !result || result.success !== true) {
                throw new Error(result && result.message ? result.message : errorMessage);
            }

            setStatus(statusEl, "success", result.message || successMessage);
            form.reset();
            initFormStartTime();

            if (window.LawnoraUtils && typeof window.LawnoraUtils.injectGlobalContent === "function") {
                window.LawnoraUtils.injectGlobalContent();
            }
        } catch (error) {
            setStatus(statusEl, "error", error.message || errorMessage);
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.classList.remove("is-loading");
            }

            if (submitLabel) {
                submitLabel.textContent = originalLabel;
            }

            refreshIcons();
        }
    }

    function initContactForm() {
        const form = document.querySelector("[data-contact-form]");
        if (!form) return;

        const statusEl = form.querySelector("[data-form-status]");

        form.addEventListener("submit", (event) => {
            event.preventDefault();

            if (!validateForm(form)) {
                setStatus(
                    statusEl,
                    "error",
                    getConfigValue("form.errorMessage", "Please check the required fields and try again.")
                );
                return;
            }

            submitForm(form, statusEl);
        });

        form.querySelectorAll("input, select, textarea").forEach((field) => {
            field.addEventListener("input", () => {
                field.removeAttribute("aria-invalid");
                clearStatus(statusEl);
            });

            field.addEventListener("change", () => {
                field.removeAttribute("aria-invalid");
                clearStatus(statusEl);
            });
        });
    }

    function initContactCardsTilt() {
        const cards = document.querySelectorAll(
            ".contact-intent__card, .contact-after__item, .contact-direct__card"
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

                card.style.transform = `translateY(-7px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            card.addEventListener("mouseleave", () => {
                card.style.transform = "";
            });
        });
    }

    function initContact() {
        initFormStartTime();
        initContactHeroParallax();
        initContactForm();
        initContactCardsTilt();
        refreshIcons();
    }

    ready(initContact);
})();