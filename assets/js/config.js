"use strict";

/**
 * Lawnora global configuration.
 * Edit this file to update brand, contact, legal, footer, services,
 * and form settings across the entire website.
 */

window.LAWNORA_CONFIG = {
    brand: {
        name: "Lawnora",
        tagline: "Independent Lawn Care Matching Platform",
        homeUrl: "index.html",
        logo: "assets/images/logo.svg"
    },

    company: {
        name: "Lawnora",
        legalName: "Lawnora Independent Provider-Matching Platform",
        companyId: "Independent provider-matching",
        address: "Service area varies by location",
        serviceArea: "Participating local lawn care",
        mapQuery: "Lawnora lawn care provider matching"
    },

    contact: {
        phoneRaw: "+18005550198",
        phoneDisplay: "+1 (800) 555-0198",
        phoneButtonText: "Call Lawnora",
        email: "support@lawnora.com",
        emailSubject: "Lawnora lawn care request",
        contactUrl: "contact.html#request-form"
    },

    navigation: [
        {
            label: "Home",
            url: "index.html"
        },
        {
            label: "About",
            url: "about.html"
        },
        {
            label: "Services",
            url: "all-services.html"
        },
        {
            label: "Contact",
            url: "contact.html"
        }
    ],

    services: [
        {
            id: "mowing",
            title: "Lawn Mowing & Maintenance",
            shortTitle: "Mowing",
            url: "lawn-mowing-maintenance.html",
            image: "assets/images/card-1.jpg",
            icon: "leaf",
            description:
                "Compare local provider options for regular lawn mowing, recurring maintenance, grass height control, trimming, and general lawn upkeep.",
            usefulWhen:
                "Useful when your lawn needs consistent upkeep, recurring mowing, trimming, or seasonal maintenance support.",
            compareFor:
                "Frequency, included trimming, cleanup expectations, access needs, scheduling windows, and provider terms."
        },
        {
            id: "fertilization",
            title: "Lawn Fertilization & Weed Control",
            shortTitle: "Fertilization",
            url: "lawn-fertilization-weed-control.html",
            image: "assets/images/card-2.jpg",
            icon: "sprout",
            description:
                "Compare provider options for fertilization, weed control programs, nutrient support, and healthier grass appearance.",
            usefulWhen:
                "Useful when your lawn looks thin, patchy, weed-heavy, or needs a planned treatment conversation.",
            compareFor:
                "Treatment scope, product details, visit timing, follow-up needs, safety notes, and provider terms."
        },
        {
            id: "aeration",
            title: "Lawn Aeration & Overseeding",
            shortTitle: "Aeration",
            url: "lawn-aeration-overseeding.html",
            image: "assets/images/card-3.jpg",
            icon: "shovel",
            description:
                "Compare local providers for core aeration, overseeding, lawn thickening, soil breathing support, and seasonal lawn improvement.",
            usefulWhen:
                "Useful when compacted soil, thinning grass, or seasonal recovery makes your lawn harder to maintain.",
            compareFor:
                "Aeration method, overseeding approach, timing, preparation needs, watering expectations, and provider terms."
        },
        {
            id: "cleanup",
            title: "Seasonal Yard Clean-Up",
            shortTitle: "Clean-Up",
            url: "seasonal-yard-cleanup.html",
            image: "assets/images/card-4.jpg",
            icon: "tree-pine",
            description:
                "Compare provider options for spring clean-up, fall clean-up, leaf removal, debris clearing, and seasonal outdoor preparation.",
            usefulWhen:
                "Useful when leaves, branches, debris, or seasonal buildup need to be cleared before regular yard use.",
            compareFor:
                "Included cleanup tasks, debris handling, hauling expectations, access, timing, and provider terms."
        },
        {
            id: "sod-repair",
            title: "Sod Installation & Lawn Repair",
            shortTitle: "Sod Repair",
            url: "sod-installation-lawn-repair.html",
            image: "assets/images/card-5.jpg",
            icon: "badge-check",
            description:
                "Compare local provider options for sod installation, damaged lawn repair, bare patch improvement, and new lawn area setup.",
            usefulWhen:
                "Useful when bare patches, damaged grass, or new lawn areas need provider guidance before moving forward.",
            compareFor:
                "Area size, soil preparation, sod type, repair scope, watering expectations, scheduling, and provider terms."
        },
        {
            id: "hedge-care",
            title: "Shrub, Hedge & Edge Care",
            shortTitle: "Hedge Care",
            url: "shrub-hedge-edge-care.html",
            image: "assets/images/card-6.jpg",
            icon: "scissors",
            description:
                "Compare providers for hedge trimming, shrub shaping, lawn edging, border cleanup, and polished yard detailing.",
            usefulWhen:
                "Useful when edges, hedges, shrubs, or borders need cleaner shaping and more polished outdoor detail.",
            compareFor:
                "Scope, trimming style, cleanup, plant access, recurring options, scheduling, and provider terms."
        }
    ],

    legal: {
        privacyUrl: "privacy-policy.html",
        termsUrl: "terms-of-service.html",
        cookieUrl: "cookie-policy.html",

        fullDisclaimer:
            "Disclaimer: This site is a free service to assist homeowners in connecting with local service providers. All contractors/providers are independent and this site does not warrant or guarantee any work performed. It is the responsibility of the homeowner to verify that the hired contractor furnishes the necessary license and insurance required for the work being performed. All persons depicted in a photo or video are actors or models and not contractors listed on this site.",

        shortDisclaimer:
            "Lawnora is an independent provider-matching platform. Providers are independent, and final pricing, scheduling, availability, service terms, warranties, and work details are provided by participating providers."
    },

    footer: {
        description:
            "Lawnora helps homeowners organize lawn care request details, review service categories, and compare available local provider options before deciding whether to continue.",
        copyright:
            "© 2026 Lawnora. All rights reserved."
    },

    form: {
        endpoint: "contact.php",
        method: "POST",
        recipientEmail: "support@lawnora.com",
        successMessage: "Thank you. Your request has been received.",
        errorMessage: "Please check the required fields and try again.",
        minSubmitSeconds: 3,
        sourceFieldName: "sourcePage",
        honeypotFieldName: "website"
    },

    cookies: {
        storageKey: "lawnora_cookie_choice",
        acceptedValue: "accepted",
        declinedValue: "declined"
    },

    images: {
        heroHome: "assets/images/hero-home.jpg",
        heroAbout: "assets/images/hero-about.jpg",
        heroServices: "assets/images/hero-services.jpg",
        heroContact: "assets/images/hero-contact.jpg"
    }
};