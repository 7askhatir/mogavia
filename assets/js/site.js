/* ==========================================================================
   Taxi Tours Essaouira — shared site behaviour
   ========================================================================== */
(function () {
  "use strict";

  var config = window.TTE_CONFIG || {};

  function t(key, fallback, vars) {
    if (window.TTE_I18N && typeof window.TTE_I18N.t === "function") {
      return window.TTE_I18N.t(key, fallback, vars);
    }
    return fallback !== undefined && fallback !== null ? fallback : key;
  }

  /* ------------------------------------------------------------------ */
  /* Contact details                                                     */
  /* ------------------------------------------------------------------ */
  function syncContactDetails() {
    var phoneHref = "tel:" + String(config.phone || "").replace(/[^\d+]/g, "");
    var emailHref = "mailto:" + (config.email || "");

    document.querySelectorAll("[data-phone-link]").forEach(function (link) {
      link.href = phoneHref;
    });
    document.querySelectorAll("[data-phone-display]").forEach(function (element) {
      element.textContent = config.phoneDisplay || config.phone || "";
    });
    document.querySelectorAll("[data-email-link]").forEach(function (link) {
      link.href = emailHref;
    });
    document.querySelectorAll("[data-email-display]").forEach(function (element) {
      element.textContent = config.email || "";
    });

    document.querySelectorAll("[data-wa]").forEach(function (link) {
      var key = link.getAttribute("data-wa-message") || "wa.general";
      var message = t(key, "Hello Taxi Tours Essaouira, I would like to ask about a private transfer.");
      var number = String(config.whatsapp || "").replace(/[^\d]/g, "");
      link.href = "https://wa.me/" + number + "?text=" + encodeURIComponent(message);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Header + mobile navigation                                          */
  /* ------------------------------------------------------------------ */
  function initHeader() {
    var header = document.querySelector("[data-header]");
    if (!header) return;

    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initMobileNavigation() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    var backdrop = document.querySelector("[data-mobile-backdrop]");
    var closeButton = document.querySelector("[data-menu-close]");
    if (!toggle || !panel || !backdrop) return;

    var isOpen = false;
    var lastFocused = null;

    function focusable() {
      return Array.prototype.slice.call(
        panel.querySelectorAll('a[href], button:not([disabled]), select, input, textarea, [tabindex]:not([tabindex="-1"])')
      ).filter(function (element) {
        return element.offsetParent !== null;
      });
    }

    function openMenu() {
      if (isOpen) return;
      isOpen = true;
      lastFocused = document.activeElement;
      backdrop.hidden = false;
      panel.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("nav-open");
      window.requestAnimationFrame(function () {
        backdrop.classList.add("is-open");
        panel.classList.add("is-open");
      });
      if (closeButton) window.setTimeout(function () { closeButton.focus(); }, 60);
    }

    function closeMenu(restoreFocus) {
      if (!isOpen) return;
      isOpen = false;
      backdrop.classList.remove("is-open");
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
      window.setTimeout(function () {
        if (!isOpen) backdrop.hidden = true;
      }, 350);
      if (restoreFocus !== false) {
        var target = lastFocused && typeof lastFocused.focus === "function" ? lastFocused : toggle;
        target.focus();
      }
    }

    toggle.addEventListener("click", function () {
      if (isOpen) closeMenu();
      else openMenu();
    });

    if (closeButton) closeButton.addEventListener("click", function () { closeMenu(); });
    backdrop.addEventListener("click", function () { closeMenu(); });

    document.addEventListener("keydown", function (event) {
      if (!isOpen) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== "Tab") return;

      var items = focusable();
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 1260 && isOpen) closeMenu(false);
    });

    panel.querySelectorAll("a[href]").forEach(function (link) {
      link.addEventListener("click", function () { closeMenu(false); });
    });
  }

  function markActiveNavigation() {
    var page = document.body ? document.body.getAttribute("data-page") : "";
    var filename = window.location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll(".main-nav a, .mobile-nav a").forEach(function (link) {
      var href = (link.getAttribute("href") || "").split("?")[0].split("#")[0];
      var isHome = (page === "home" || filename === "" || filename === "index.html") && (href === "index.html" || href === "");
      var isCurrent = isHome || (href && href === filename) || (link.getAttribute("data-nav") === page);
      if (isCurrent) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Reveal on scroll                                                    */
  /* ------------------------------------------------------------------ */
  function initReveal() {
    var elements = document.querySelectorAll(".reveal");
    if (!elements.length) return;

    if (!("IntersectionObserver" in window)) {
      elements.forEach(function (element) { element.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    elements.forEach(function (element) { observer.observe(element); });
  }

  /* ------------------------------------------------------------------ */
  /* Contact form (opens the visitor's mail app — no backend)            */
  /* ------------------------------------------------------------------ */
  function contactError(form, name, message) {
    var error = form.querySelector('[data-error-for="' + name + '"]');
    if (error) {
      error.textContent = message;
      error.hidden = false;
      var field = error.closest(".field");
      if (field) field.classList.add("has-error");
    }
    var control = form.querySelector('[name="' + name + '"]');
    if (control) control.setAttribute("aria-invalid", "true");
  }

  function clearContactError(form, name) {
    var error = form.querySelector('[data-error-for="' + name + '"]');
    if (error) {
      error.textContent = "";
      error.hidden = true;
      var field = error.closest(".field");
      if (field) field.classList.remove("has-error");
    }
    var control = form.querySelector('[name="' + name + '"]');
    if (control) control.removeAttribute("aria-invalid");
  }

  function initContactForm() {
    var form = document.querySelector("[data-contact-form]");
    if (!form || form.dataset.initialised === "true") return;
    form.dataset.initialised = "true";

    form.addEventListener("input", function (event) {
      var name = event.target.getAttribute("name");
      if (name) clearContactError(form, name);
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      form.querySelectorAll("[data-error-for]").forEach(function (error) {
        error.textContent = "";
        error.hidden = true;
        var field = error.closest(".field");
        if (field) field.classList.remove("has-error");
      });
      form.querySelectorAll("[aria-invalid]").forEach(function (control) {
        control.removeAttribute("aria-invalid");
      });

      var name = form.querySelector('[name="name"]').value.trim();
      var email = form.querySelector('[name="email"]').value.trim();
      var phone = form.querySelector('[name="phone"]') ? form.querySelector('[name="phone"]').value.trim() : "";
      var subject = form.querySelector('[name="subject"]') ? form.querySelector('[name="subject"]').value.trim() : "";
      var message = form.querySelector('[name="message"]').value.trim();
      var consent = form.querySelector('[name="consent"]');
      var invalid = [];

      if (name.length < 2) {
        contactError(form, "name", t("contact.error.name", "Please enter your name."));
        invalid.push("name");
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        contactError(form, "email", t("contact.error.email", "Please enter a valid email address."));
        invalid.push("email");
      }
      if (message.length < 10) {
        contactError(form, "message", t("contact.error.message", "Please tell us a little more about your plans."));
        invalid.push("message");
      }
      if (consent && !consent.checked) {
        contactError(form, "consent", t("contact.error.consent", "Please accept the privacy note to continue."));
        invalid.push("consent");
      }

      if (invalid.length) {
        var first = form.querySelector('[name="' + invalid[0] + '"]');
        if (first && typeof first.focus === "function") first.focus();
        return;
      }

      var defaultSubject = t("contact.mailSubject", "Website enquiry from {name}", { name: name });
      var body = t("contact.mailBody",
        "Name: {name}\nEmail: {email}\n\nMessage:\n{message}",
        { name: name, email: email, message: message });
      if (phone) {
        body += "\n" + t("contact.info.phone", "Phone") + ": " + phone;
      }
      var mailto = "mailto:" + (config.email || "") +
        "?subject=" + encodeURIComponent(subject || defaultSubject) +
        "&body=" + encodeURIComponent(body);

      var status = form.querySelector("[data-contact-status]");
      if (status) {
        status.textContent = t("contact.status", "Your email app should open with the message. If it does not, write to {email} or contact us on WhatsApp.", { email: config.email || "" });
        status.classList.add("form-status--ok");
        status.hidden = false;
      }

      window.location.href = mailto;
    });
  }

  /* ------------------------------------------------------------------ */
  /* Miscellaneous                                                       */
  /* ------------------------------------------------------------------ */
  function initYear() {
    var year = String(new Date().getFullYear());
    document.querySelectorAll("[data-year]").forEach(function (element) {
      element.textContent = year;
    });
  }

  /* Vehicles carousel ------------------------------------------------------- */
  function initVehiclesCarousel() {
    var track = document.querySelector("[data-vehicles-track]");
    var prevBtn = document.querySelector(".vehicles__nav--prev");
    var nextBtn = document.querySelector(".vehicles__nav--next");

    if (!track || !prevBtn || !nextBtn) return;

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function getGap() {
      var styles = getComputedStyle(track);
      var gap = parseFloat(styles.columnGap || styles.gap);
      return isNaN(gap) ? 24 : gap;
    }

    function getStep() {
      var card = track.querySelector(".vehicles__card");
      if (!card) return 0;
      return Math.round(card.getBoundingClientRect().width + getGap());
    }

    function getMaxScroll() {
      return Math.max(0, track.scrollWidth - track.clientWidth);
    }

    function isRtl() {
      return getComputedStyle(track).direction === "rtl";
    }

    function getPosition() {
      return Math.abs(track.scrollLeft);
    }

    function scrollToPosition(position) {
      track.scrollTo({
        left: isRtl() ? -position : position,
        behavior: reduceMotion.matches ? "auto" : "smooth"
      });
    }

    function goNext() {
      var max = getMaxScroll();
      var step = getStep();
      if (max <= 1 || !step) return;

      var position = getPosition();

      if (position >= max - 1) {
        scrollToPosition(0);
        return;
      }

      scrollToPosition(Math.min(position + step, max));
    }

    function goPrev() {
      var max = getMaxScroll();
      var step = getStep();
      if (max <= 1 || !step) return;

      var position = getPosition();

      if (position <= 1) {
        scrollToPosition(max);
        return;
      }

      scrollToPosition(Math.max(position - step, 0));
    }

    prevBtn.addEventListener("click", goPrev);
    nextBtn.addEventListener("click", goNext);

    track.addEventListener("keydown", function (event) {
      var rtl = isRtl();
      if (event.key === "ArrowRight") {
        event.preventDefault();
        rtl ? goPrev() : goNext();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        rtl ? goNext() : goPrev();
      }
    });

    /* Mouse and pen drag. Touch keeps the native swipe and momentum. */
    var pointerId = null;
    var startX = 0;
    var startY = 0;
    var startScroll = 0;
    var axis = null;
    var dragSign = -1;

    function endDrag() {
      if (pointerId === null) return;
      pointerId = null;
      axis = null;
      track.style.scrollBehavior = "";
      track.classList.remove("is-dragging");
    }

    track.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "touch" || event.button !== 0) return;

      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      startScroll = track.scrollLeft;
      axis = null;
      dragSign = isRtl() ? 1 : -1;
      track.style.scrollBehavior = "auto";
      track.classList.add("is-dragging");

      if (track.setPointerCapture) {
        try {
          track.setPointerCapture(event.pointerId);
        } catch (error) {
          /* ignore */
        }
      }
    });

    track.addEventListener("pointermove", function (event) {
      if (event.pointerId !== pointerId) return;

      var dx = event.clientX - startX;
      var dy = event.clientY - startY;

      if (!axis) {
        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
        axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        if (axis === "y") {
          endDrag();
          return;
        }
      }

      if (axis !== "x") return;

      event.preventDefault();
      track.scrollLeft = startScroll + (dragSign * dx);
    }, { passive: false });

    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);
  }

  /* ------------------------------------------------------------------ */
  /* Vehicle details popup                                               */
  /* ------------------------------------------------------------------ */
  var VEHICLE_DETAILS = {
    superb: {
      title: "EXECUTIVE / FIRST CLASS",
      type: "BERLINE",
      image: "assets/img/1.png",
      passengers: "1–3 passengers",
      luggage: "2 large suitcases",
      models: "Skoda Superb",
      description: "A quiet, comfortable sedan for couples and small families on airport pickups and city-to-city transfers.",
      features: ["Air conditioning", "Phone charging", "Bottled water"]
    },
    vito: {
      title: "EXECUTIVE / VIP",
      type: "VIP",
      image: "assets/img/2.png",
      passengers: "1–8 passengers",
      luggage: "6 suitcases",
      models: "Mercedes Vito, Renault Trafic or Fiat Scudo",
      description: "A premium minivan with sliding doors and flexible seating for families, business travellers and small groups.",
      features: ["Air conditioning", "Sliding doors", "Child seat on request"]
    },
    sprinter: {
      title: "EXECUTIVE / MINIBUS",
      type: "MINIBUS",
      image: "assets/img/3.webp",
      passengers: "8–14 passengers",
      luggage: "12 suitcases",
      models: "Mercedes Sprinter",
      description: "A spacious minibus for larger families and small groups, with a generous luggage bay for long journeys.",
      features: ["Air conditioning", "High roof", "Long-distance comfort"]
    },
    kodiaq: {
      title: "EXECUTIVE / FIRST CLASS SUV",
      type: "SUV",
      image: "assets/img/4.png",
      passengers: "1–4 passengers",
      luggage: "6 suitcases",
      models: "Skoda Kodiaq or Hyundai",
      description: "A capable 4x4 for mountain roads, coastal escapes and family transfers, with room for everyone and their luggage.",
      features: ["Air conditioning", "Phone charging", "Bottled water"]
    }
  };

  function initVehiclePopup() {
    var popup = document.getElementById("vehiclePopup");
    if (!popup) return;

    var overlay = popup.querySelector(".vehicle-popup__overlay");
    var panel = popup.querySelector(".vehicle-popup__panel");
    var closeButton = popup.querySelector(".vehicle-popup__close");
    var titleEl = popup.querySelector("[data-vehicle-popup-title]");
    var typeEl = popup.querySelector("[data-vehicle-popup-type]");
    var imageEl = popup.querySelector("[data-vehicle-popup-image]");
    var passengersEl = popup.querySelector("[data-vehicle-popup-passengers]");
    var luggageEl = popup.querySelector("[data-vehicle-popup-luggage]");
    var modelsEl = popup.querySelector("[data-vehicle-popup-models]");
    var descriptionEl = popup.querySelector("[data-vehicle-popup-description]");
    var featuresEl = popup.querySelector("[data-vehicle-popup-features]");
    var lastFocused = null;
    var isOpen = false;

    function populate(key) {
      var data = VEHICLE_DETAILS[key];
      if (!data) return false;
      titleEl.textContent = data.title;
      typeEl.textContent = data.type;
      imageEl.src = data.image;
      imageEl.alt = data.models;
      passengersEl.textContent = data.passengers;
      luggageEl.textContent = data.luggage;
      modelsEl.textContent = data.models;
      descriptionEl.textContent = data.description;
      featuresEl.innerHTML = "";
      for (var i = 0; i < data.features.length; i++) {
        var item = document.createElement("li");
        item.textContent = data.features[i];
        featuresEl.appendChild(item);
      }
      return true;
    }

    function open(key) {
      if (isOpen || !populate(key)) return;
      isOpen = true;
      lastFocused = document.activeElement;
      popup.classList.add("is-open");
      popup.setAttribute("aria-hidden", "false");
      document.body.classList.add("vehicle-popup-open");
      closeButton.focus();
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      popup.classList.remove("is-open");
      popup.setAttribute("aria-hidden", "true");
      document.body.classList.remove("vehicle-popup-open");
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    }

    var track = document.querySelector("[data-vehicles-track]");
    var clickedCard = null;
    var pointerId = null;
    var startX = 0;
    var startY = 0;
    var moved = false;

    if (track) {
      track.addEventListener("pointerdown", function (event) {
        clickedCard = event.target.closest(".vehicles__card");
        pointerId = event.pointerId;
        startX = event.clientX;
        startY = event.clientY;
        moved = false;
      });

      track.addEventListener("pointermove", function (event) {
        if (event.pointerId !== pointerId) return;
        if (Math.abs(event.clientX - startX) > 6 || Math.abs(event.clientY - startY) > 6) {
          moved = true;
        }
      });

      track.addEventListener("pointerup", function (event) {
        if (event.pointerId !== pointerId) return;
        if (clickedCard && !moved) {
          open(clickedCard.getAttribute("data-vehicle"));
        }
        clickedCard = null;
        pointerId = null;
        moved = false;
      });

      track.addEventListener("pointercancel", function () {
        clickedCard = null;
        pointerId = null;
        moved = false;
      });
    }

    document.querySelectorAll(".vehicles__card").forEach(function (card) {
      card.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
          event.preventDefault();
          open(card.getAttribute("data-vehicle"));
        }
      });
    });

    overlay.addEventListener("click", close);
    closeButton.addEventListener("click", close);

    document.addEventListener("keydown", function (event) {
      if (!isOpen) return;

      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key === "Tab") {
        var focusables = panel.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])");
        var visible = [];
        for (var i = 0; i < focusables.length; i++) {
          if (focusables[i].offsetParent !== null) visible.push(focusables[i]);
        }
        if (!visible.length) return;
        var first = visible[0];
        var last = visible[visible.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  function init() {
    syncContactDetails();
    initHeader();
    initMobileNavigation();
    markActiveNavigation();
    initReveal();
    initContactForm();
    initYear();
    initVehiclesCarousel();
    initVehiclePopup();
  }

  document.addEventListener("DOMContentLoaded", init);
  document.addEventListener("tte:languagechange", syncContactDetails);
})();
