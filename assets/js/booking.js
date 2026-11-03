/* ==========================================================================
   Taxi Tours Essaouira — booking engine
   --------------------------------------------------------------------------
   Static, no-backend booking:
   1. The quick form on the home page sends route/date/passenger details to
      the full booking page through the URL.
   2. The full form validates the request, estimates a fare from a local
      matrix, stores the request in localStorage and opens WhatsApp or email
      with a prefilled confirmation message.
   3. A booking is only confirmed when the business replies. This is stated
      clearly in the interface.
   ========================================================================== */
(function () {
  "use strict";

  var config = window.TTE_CONFIG || {};

  function t(key, fallback, vars) {
    if (window.TTE_I18N && typeof window.TTE_I18N.t === "function") {
      return window.TTE_I18N.t(key, fallback, vars);
    }
    var text = fallback !== undefined && fallback !== null ? fallback : key;
    if (vars) {
      Object.keys(vars).forEach(function (name) {
        text = text.replace(new RegExp("\\{" + name + "\\}", "g"), String(vars[name]));
      });
    }
    return text;
  }

  var LOCATIONS = [
    { key: "essaouira", group: "city", labelKey: "booking.location.essaouira", fallback: "Essaouira" },
    { key: "marrakech", group: "city", labelKey: "booking.location.marrakech", fallback: "Marrakech" },
    { key: "agadir", group: "city", labelKey: "booking.location.agadir", fallback: "Agadir" },
    { key: "taghazout", group: "city", labelKey: "booking.location.taghazout", fallback: "Taghazout" },
    { key: "imsouane", group: "city", labelKey: "booking.location.imsouane", fallback: "Imsouane" },
    { key: "casablanca", group: "city", labelKey: "booking.location.casablanca", fallback: "Casablanca" },
    { key: "agafay", group: "city", labelKey: "booking.location.agafay", fallback: "Agafay Desert" },
    { key: "ouarzazate", group: "city", labelKey: "booking.location.ouarzazate", fallback: "Ouarzazate" },
    { key: "taroudant", group: "city", labelKey: "booking.location.taroudant", fallback: "Taroudant" },
    { key: "safi", group: "city", labelKey: "booking.location.safi", fallback: "Safi" },
    { key: "el-jadida", group: "city", labelKey: "booking.location.elJadida", fallback: "El Jadida" },
    { key: "rabat", group: "city", labelKey: "booking.location.rabat", fallback: "Rabat" },
    { key: "essaouira-airport", group: "airport", labelKey: "booking.location.essaouiraAirport", fallback: "Essaouira Airport (ESU)" },
    { key: "marrakech-airport", group: "airport", labelKey: "booking.location.marrakechAirport", fallback: "Marrakech Menara Airport (RAK)" },
    { key: "agadir-airport", group: "airport", labelKey: "booking.location.agadirAirport", fallback: "Agadir Al Massira Airport (AGA)" },
    { key: "casablanca-airport", group: "airport", labelKey: "booking.location.casablancaAirport", fallback: "Casablanca Mohammed V Airport (CMN)" },
    { key: "other", group: "other", labelKey: "booking.location.other", fallback: "Other place in Morocco" }
  ];

  var VEHICLES = [
    {
      key: "sedan",
      index: 0,
      min: 1,
      max: 4,
      nameKey: "booking.vehicle.sedan.name",
      nameFallback: "Comfort Sedan",
      descKey: "booking.vehicle.sedan.desc",
      descFallback: "Up to 4 passengers · 2 large suitcases",
      capabilityKey: "booking.vehicle.sedan.capability",
      capabilityFallback: "1–4 passengers"
    },
    {
      key: "minivan",
      index: 1,
      min: 5,
      max: 7,
      nameKey: "booking.vehicle.minivan.name",
      nameFallback: "Premium Minivan",
      descKey: "booking.vehicle.minivan.desc",
      descFallback: "Up to 7 passengers · 6 suitcases",
      capabilityKey: "booking.vehicle.minivan.capability",
      capabilityFallback: "5–7 passengers"
    },
    {
      key: "van",
      index: 2,
      min: 8,
      max: 14,
      nameKey: "booking.vehicle.van.name",
      nameFallback: "Tour Van",
      descKey: "booking.vehicle.van.desc",
      descFallback: "Up to 14 passengers · 12 suitcases",
      capabilityKey: "booking.vehicle.van.capability",
      capabilityFallback: "8–14 passengers"
    },
    {
      key: "coach",
      index: 3,
      min: 15,
      max: 40,
      nameKey: "booking.vehicle.coach.name",
      nameFallback: "Mini Coach",
      descKey: "booking.vehicle.coach.desc",
      descFallback: "Up to 40 passengers · 20 suitcases",
      capabilityKey: "booking.vehicle.coach.capability",
      capabilityFallback: "15+ passengers"
    }
  ];

  /* Indicative one-way fares in EUR for the whole vehicle:
     [sedan 1–4, minivan 5–7, van 8–14, mini coach 15+]. */
  var ROUTES = {};

  function routeKey(a, b) {
    return [a, b].sort().join("|");
  }

  function addRoute(a, b, prices) {
    ROUTES[routeKey(a, b)] = prices;
  }

  addRoute("essaouira", "marrakech", [90, 130, 170, 240]);
  addRoute("essaouira", "marrakech-airport", [100, 140, 180, 250]);
  addRoute("essaouira", "agadir", [90, 130, 170, 240]);
  addRoute("essaouira", "agadir-airport", [100, 140, 180, 250]);
  addRoute("essaouira", "taghazout", [110, 150, 190, 260]);
  addRoute("essaouira", "imsouane", [70, 100, 140, 200]);
  addRoute("essaouira", "casablanca", [190, 250, 320, 420]);
  addRoute("essaouira", "casablanca-airport", [200, 260, 330, 430]);
  addRoute("essaouira", "agafay", [110, 150, 190, 260]);
  addRoute("essaouira", "ouarzazate", [250, 320, 400, 510]);
  addRoute("essaouira", "taroudant", [120, 150, 190, 250]);
  addRoute("essaouira", "safi", [100, 130, 170, 230]);
  addRoute("essaouira", "el-jadida", [140, 180, 230, 300]);
  addRoute("essaouira", "rabat", [250, 310, 390, 500]);
  addRoute("essaouira", "essaouira-airport", [25, 35, 45, 60]);

  addRoute("marrakech", "marrakech-airport", [20, 30, 40, 55]);
  addRoute("agadir", "agadir-airport", [20, 30, 40, 55]);
  addRoute("casablanca", "casablanca-airport", [35, 45, 60, 80]);

  addRoute("marrakech", "agadir", [180, 230, 290, 380]);
  addRoute("marrakech", "casablanca", [220, 280, 350, 450]);
  addRoute("marrakech", "imsouane", [160, 200, 260, 340]);
  addRoute("marrakech", "taghazout", [190, 240, 300, 390]);
  addRoute("marrakech", "agafay", [60, 80, 100, 130]);
  addRoute("marrakech", "ouarzazate", [190, 240, 300, 390]);

  addRoute("agadir", "taghazout", [40, 55, 70, 95]);
  addRoute("agadir", "imsouane", [60, 80, 100, 130]);
  addRoute("agadir", "taroudant", [70, 90, 120, 160]);
  addRoute("taghazout", "imsouane", [50, 70, 90, 120]);
  addRoute("casablanca", "rabat", [90, 120, 150, 200]);
  addRoute("casablanca", "el-jadida", [90, 120, 150, 200]);

  function locationByKey(key) {
    for (var i = 0; i < LOCATIONS.length; i++) {
      if (LOCATIONS[i].key === key) return LOCATIONS[i];
    }
    return null;
  }

  function vehicleByKey(key) {
    for (var i = 0; i < VEHICLES.length; i++) {
      if (VEHICLES[i].key === key) return VEHICLES[i];
    }
    return null;
  }

  function locationLabel(key) {
    var location = locationByKey(key);
    return location ? t(location.labelKey, location.fallback) : "";
  }

  function vehicleLabel(key) {
    var vehicle = vehicleByKey(key);
    return vehicle ? t(vehicle.nameKey, vehicle.nameFallback) : "";
  }

  function getRoutePrices(from, to) {
    if (!from || !to || from === "other" || to === "other" || from === to) return null;
    return ROUTES[routeKey(from, to)] || null;
  }

  function getRoutePrice(from, to, vehicleKey) {
    var prices = getRoutePrices(from, to);
    var vehicle = vehicleByKey(vehicleKey);
    if (!prices || !vehicle) return null;
    return prices[vehicle.index];
  }

  function currencySymbol() {
    return config.currencySymbol || "€";
  }

  function formatPrice(value) {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return t("booking.priceOnRequest", "On request");
    }
    return currencySymbol() + Number(value);
  }

  function todayISO() {
    var now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 10);
  }

  function locale() {
    var language = window.TTE_I18N ? window.TTE_I18N.getLanguage() : "en";
    return { en: "en-GB", fr: "fr-FR", ar: "ar-MA", es: "es-ES" }[language] || "en-GB";
  }

  function formatDate(value) {
    if (!value) return "—";
    var date = new Date(value + "T12:00:00");
    if (isNaN(date.getTime())) return "—";
    try {
      return new Intl.DateTimeFormat(locale(), { day: "numeric", month: "short", year: "numeric" }).format(date);
    } catch (error) {
      return value;
    }
  }

  function passengerLabel(count) {
    if (Number(count) === 1) {
      return t("booking.passengerOne", "1 passenger");
    }
    return t("booking.passengersValue", "{count} passengers", { count: count });
  }

  function routeLabel(from, to) {
    if (!from || !to) return "";
    var arrow = document.documentElement.dir === "rtl" ? " ← " : " → ";
    return locationLabel(from) + arrow + locationLabel(to);
  }

  function populateLocationSelect(select, selectedValue) {
    if (!select) return;
    var value = selectedValue !== undefined ? selectedValue : select.value;
    select.innerHTML = "";

    var placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = t("booking.selectPlaceholder", "Select a place");
    select.appendChild(placeholder);

    var groups = [
      { key: "city", label: t("booking.group.cities", "Cities") },
      { key: "airport", label: t("booking.group.airports", "Airports") },
      { key: "other", label: t("booking.group.other", "Other") }
    ];

    groups.forEach(function (group) {
      var items = LOCATIONS.filter(function (location) { return location.group === group.key; });
      if (!items.length) return;
      var optgroup = document.createElement("optgroup");
      optgroup.label = group.label;
      items.forEach(function (location) {
        var option = document.createElement("option");
        option.value = location.key;
        option.textContent = t(location.labelKey, location.fallback);
        optgroup.appendChild(option);
      });
      select.appendChild(optgroup);
    });

    if (value && locationByKey(value)) {
      select.value = value;
    } else {
      select.value = "";
    }
  }

  function setMinimumDates(root) {
    var today = todayISO();
    (root || document).querySelectorAll('input[type="date"][data-booking-date]').forEach(function (input) {
      input.min = today;
      if (input.value && input.value < today) input.value = "";
    });
  }

  function quickPriceFor(from, to) {
    var prices = getRoutePrices(from, to);
    return prices ? prices[0] : null;
  }

  function updateQuickPrice(form) {
    var card = form.closest(".quick-card") || document;
    var valueEl = card.querySelector("[data-quick-price-value]");
    var labelEl = card.querySelector("[data-quick-price-label]");
    if (!valueEl) return;

    var from = form.querySelector('[name="from"]') ? form.querySelector('[name="from"]').value : "";
    var to = form.querySelector('[name="to"]') ? form.querySelector('[name="to"]').value : "";
    var price = quickPriceFor(from, to);

    if (!from || !to) {
      valueEl.textContent = "—";
      if (labelEl) labelEl.textContent = t("booking.fromPrice", "from");
      return;
    }
    if (price === null) {
      valueEl.textContent = "—";
      if (labelEl) labelEl.textContent = t("booking.priceOnRequest", "On request");
      return;
    }
    valueEl.textContent = formatPrice(price);
    if (labelEl) labelEl.textContent = t("booking.oneWay", "one way");
  }

  function quickError(form, message) {
    var scope = form.closest(".quick-card") || form.parentElement || form;
    var error = scope.querySelector("[data-quick-error]");
    if (!error) return;
    if (message) {
      error.textContent = message;
      error.hidden = false;
    } else {
      error.textContent = "";
      error.hidden = true;
    }
  }

  function initQuickForms() {
    document.querySelectorAll("[data-quick-form]").forEach(function (form) {
      if (form.dataset.initialised === "true") return;
      form.dataset.initialised = "true";

      populateLocationSelect(form.querySelector('[name="from"]'));
      populateLocationSelect(form.querySelector('[name="to"]'));
      setMinimumDates(form);
      updateQuickPrice(form);

      form.addEventListener("change", function () {
        quickError(form, "");
        updateQuickPrice(form);
      });

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var from = form.querySelector('[name="from"]').value;
        var to = form.querySelector('[name="to"]').value;
        var date = form.querySelector('[name="date"]').value;
        var passengers = form.querySelector('[name="passengers"]').value || "2";

        if (!from || !to) {
          quickError(form, t("booking.error.quickRoute", "Please choose a pickup point and a destination."));
          return;
        }
        if (from === to) {
          quickError(form, t("booking.error.sameRoute", "Pickup and destination must be different."));
          return;
        }
        if (!date || date < todayISO()) {
          quickError(form, t("booking.error.date", "Please choose a valid travel date."));
          return;
        }

        var params = new URLSearchParams();
        params.set("from", from);
        params.set("to", to);
        params.set("date", date);
        params.set("pax", passengers);
        window.location.href = "book.html?" + params.toString();
      });
    });
  }

  function buildSummaryRows(form, route, price, vehicleKey) {
    var scope = form.closest(".booking-layout") || document;
    var from = form.querySelector('[name="pickup"]').value;
    var to = form.querySelector('[name="destination"]').value;
    var date = form.querySelector('[name="date"]').value;
    var time = form.querySelector('[name="time"]').value;
    var passengers = form.querySelector('[name="passengers"]').value;

    var routeEl = scope.querySelector("[data-summary-route]");
    var dateEl = scope.querySelector("[data-summary-date]");
    var timeEl = scope.querySelector("[data-summary-time]");
    var paxEl = scope.querySelector("[data-summary-pax]");
    var vehicleEl = scope.querySelector("[data-summary-vehicle]");
    var totalEl = scope.querySelector("[data-summary-total]");

    if (routeEl) routeEl.textContent = from && to && from !== to ? routeLabel(from, to) : "—";
    if (dateEl) dateEl.textContent = formatDate(date);
    if (timeEl) timeEl.textContent = time || "—";
    if (paxEl) paxEl.textContent = passengers ? passengerLabel(passengers) : "—";
    if (vehicleEl) vehicleEl.textContent = vehicleKey ? vehicleLabel(vehicleKey) : "—";

    if (totalEl) {
      if (!from || !to || from === to) {
        totalEl.textContent = "—";
      } else {
        totalEl.textContent = formatPrice(price);
      }
    }
  }

  function renderVehicleOptions(container) {
    if (!container) return;
    container.innerHTML = "";

    VEHICLES.forEach(function (vehicle) {
      var label = document.createElement("label");
      label.className = "vehicle-option";
      label.setAttribute("data-vehicle-key", vehicle.key);

      var input = document.createElement("input");
      input.type = "radio";
      input.name = "vehicle";
      input.value = vehicle.key;
      input.setAttribute("aria-label", t(vehicle.nameKey, vehicle.nameFallback));
      label.appendChild(input);

      var check = document.createElement("span");
      check.className = "vehicle-option__check";
      check.setAttribute("aria-hidden", "true");
      check.innerHTML = '<svg class="icon" viewBox="0 0 24 24"><path d="m5 12 5 5L20 7"/></svg>';
      label.appendChild(check);

      var top = document.createElement("span");
      top.className = "vehicle-option__top";
      var name = document.createElement("span");
      name.className = "vehicle-option__name";
      name.textContent = t(vehicle.nameKey, vehicle.nameFallback);
      var capacity = document.createElement("span");
      capacity.className = "vehicle-option__cap";
      capacity.textContent = t(vehicle.capabilityKey, vehicle.capabilityFallback);
      top.appendChild(name);
      top.appendChild(capacity);
      label.appendChild(top);

      var desc = document.createElement("span");
      desc.className = "vehicle-option__desc";
      desc.textContent = t(vehicle.descKey, vehicle.descFallback);
      label.appendChild(desc);

      var price = document.createElement("span");
      price.className = "vehicle-option__price";
      var priceValue = document.createElement("span");
      priceValue.setAttribute("data-vehicle-price", "");
      priceValue.textContent = "—";
      var priceUnit = document.createElement("small");
      priceUnit.textContent = t("booking.oneWay", "one way");
      price.appendChild(priceValue);
      price.appendChild(priceUnit);
      label.appendChild(price);

      container.appendChild(label);
    });
  }

  function syncVehicleState(form, routePrices, passengers) {
    var radios = form.querySelectorAll('input[name="vehicle"]');
    if (!radios.length) return;

    var eligible = [];
    radios.forEach(function (radio) {
      var vehicle = vehicleByKey(radio.value);
      var ok = vehicle && passengers >= vehicle.min && passengers <= vehicle.max;
      radio.disabled = !ok;
      var option = radio.closest(".vehicle-option");
      if (option) option.classList.toggle("is-disabled", !ok);
      if (ok) eligible.push(radio);

      var priceEl = option ? option.querySelector("[data-vehicle-price]") : null;
      if (priceEl) {
        priceEl.textContent = routePrices ? formatPrice(routePrices[vehicle.index]) : (routePrices === null ? t("booking.priceOnRequest", "On request") : "—");
      }
    });

    var checked = form.querySelector('input[name="vehicle"]:checked');
    if (!checked || checked.disabled) {
      if (eligible.length) {
        eligible[0].checked = true;
      } else {
        radios.forEach(function (radio) { radio.checked = false; });
      }
    }

    radios.forEach(function (radio) {
      var option = radio.closest(".vehicle-option");
      if (option) option.classList.toggle("is-selected", radio.checked);
    });
  }

  function selectedVehicleKey(form) {
    var checked = form.querySelector('input[name="vehicle"]:checked');
    return checked ? checked.value : "";
  }

  function selectedVehiclePrice(form) {
    var key = selectedVehicleKey(form);
    if (!key) return null;
    var from = form.querySelector('[name="pickup"]').value;
    var to = form.querySelector('[name="destination"]').value;
    var prices = getRoutePrices(from, to);
    return prices ? getRoutePrice(from, to, key) : null;
  }

  function updateBookingView(form) {
    var from = form.querySelector('[name="pickup"]').value;
    var to = form.querySelector('[name="destination"]').value;
    var passengers = parseInt(form.querySelector('[name="passengers"]').value, 10) || 0;
    var prices = getRoutePrices(from, to);

    syncVehicleState(form, prices, passengers);
    var vehicleKey = selectedVehicleKey(form);
    var price = prices && vehicleKey ? getRoutePrice(from, to, vehicleKey) : null;
    buildSummaryRows(form, prices, price, vehicleKey);
  }

  function showFieldError(form, name, message) {
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

  function clearFieldError(form, name) {
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

  function clearAllErrors(form) {
    form.querySelectorAll("[data-error-for]").forEach(function (error) {
      error.textContent = "";
      error.hidden = true;
      var field = error.closest(".field");
      if (field) field.classList.remove("has-error");
    });
    form.querySelectorAll("[aria-invalid]").forEach(function (control) {
      control.removeAttribute("aria-invalid");
    });
  }

  function validateBooking(form) {
    clearAllErrors(form);
    var invalid = [];

    var pickup = form.querySelector('[name="pickup"]').value;
    var destination = form.querySelector('[name="destination"]').value;
    var date = form.querySelector('[name="date"]').value;
    var time = form.querySelector('[name="time"]').value;
    var passengers = parseInt(form.querySelector('[name="passengers"]').value, 10);
    var fullname = form.querySelector('[name="fullname"]').value.trim();
    var email = form.querySelector('[name="email"]').value.trim();
    var phone = form.querySelector('[name="phone"]').value.trim();
    var consent = form.querySelector('[name="consent"]');

    if (!pickup) {
      showFieldError(form, "pickup", t("booking.error.pickup", "Please choose a pickup point."));
      invalid.push("pickup");
    }
    if (!destination) {
      showFieldError(form, "destination", t("booking.error.destination", "Please choose a destination."));
      invalid.push("destination");
    }
    if (pickup && destination && pickup === destination) {
      showFieldError(form, "destination", t("booking.error.sameRoute", "Pickup and destination must be different."));
      invalid.push("destination");
    }
    if (!date) {
      showFieldError(form, "date", t("booking.error.date", "Please choose a valid travel date."));
      invalid.push("date");
    } else if (date < todayISO()) {
      showFieldError(form, "date", t("booking.error.datePast", "Please choose a date from today onwards."));
      invalid.push("date");
    }
    if (!time) {
      showFieldError(form, "time", t("booking.error.time", "Please choose a pickup time."));
      invalid.push("time");
    }
    if (!passengers || passengers < 1 || passengers > 40) {
      showFieldError(form, "passengers", t("booking.error.pax", "Enter between 1 and 40 passengers."));
      invalid.push("passengers");
    }
    if (!selectedVehicleKey(form)) {
      showFieldError(form, "vehicle", t("booking.error.vehicle", "Please choose a vehicle for your group."));
      invalid.push("vehicle");
    }
    if (fullname.length < 2) {
      showFieldError(form, "fullname", t("booking.error.name", "Please enter your full name."));
      invalid.push("fullname");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      showFieldError(form, "email", t("booking.error.email", "Please enter a valid email address."));
      invalid.push("email");
    }
    var digits = phone.replace(/[^\d]/g, "");
    if (digits.length < 7) {
      showFieldError(form, "phone", t("booking.error.phone", "Please enter a valid phone or WhatsApp number."));
      invalid.push("phone");
    }
    if (consent && !consent.checked) {
      showFieldError(form, "consent", t("booking.error.consent", "Please accept the booking terms to continue."));
      invalid.push("consent");
    }

    return invalid;
  }

  function makeReference() {
    var date = new Date();
    var stamp = String(date.getFullYear()).slice(2) +
      String(date.getMonth() + 1).padStart(2, "0") +
      String(date.getDate()).padStart(2, "0");
    var random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return "TTE-" + stamp + "-" + random;
  }

  function saveRequest(request) {
    var key = config.storageKey || "tte_booking_requests";
    try {
      var stored = window.localStorage.getItem(key);
      var list = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(list)) list = [];
      list.unshift(request);
      window.localStorage.setItem(key, JSON.stringify(list.slice(0, config.maxStoredRequests || 20)));
    } catch (error) {
      /* Private browsing or disabled storage: the request still opens in WhatsApp/email. */
    }
  }

  function collectRequest(form) {
    var from = form.querySelector('[name="pickup"]').value;
    var to = form.querySelector('[name="destination"]').value;
    var vehicleKey = selectedVehicleKey(form);
    var price = getRoutePrice(from, to, vehicleKey);
    var notes = form.querySelector('[name="notes"]').value.trim();

    return {
      reference: makeReference(),
      createdAt: new Date().toISOString(),
      pickup: from,
      pickupLabel: locationLabel(from),
      destination: to,
      destinationLabel: locationLabel(to),
      date: form.querySelector('[name="date"]').value,
      time: form.querySelector('[name="time"]').value,
      passengers: parseInt(form.querySelector('[name="passengers"]').value, 10),
      vehicle: vehicleKey,
      vehicleLabel: vehicleLabel(vehicleKey),
      price: price,
      priceLabel: formatPrice(price),
      currency: config.currency || "EUR",
      fullname: form.querySelector('[name="fullname"]').value.trim(),
      email: form.querySelector('[name="email"]').value.trim(),
      phone: form.querySelector('[name="phone"]').value.trim(),
      notes: notes
    };
  }

  function buildMessage(request, mode) {
    var variables = {
      ref: request.reference,
      route: request.pickupLabel + " → " + request.destinationLabel,
      date: formatDate(request.date),
      time: request.time,
      pax: passengerLabel(request.passengers),
      vehicle: request.vehicleLabel,
      price: request.priceLabel,
      name: request.fullname,
      phone: request.phone,
      email: request.email,
      notes: request.notes || t("booking.noNotes", "No special requests"),
      link: window.location.href
    };

    if (mode === "email") {
      return {
        subject: t("booking.emailSubject", "Private transfer request {ref}", variables),
        body: t("booking.emailBody",
          "Hello Taxi Tours Essaouira,\n\nI would like to confirm this transfer request.\n\nReference: {ref}\nRoute: {route}\nDate: {date} at {time}\nPassengers: {pax}\nVehicle: {vehicle}\nIndicative price: {price}\nName: {name}\nPhone: {phone}\nEmail: {email}\nNotes: {notes}\n\nThank you.",
          variables)
      };
    }

    return t("booking.whatsappMessage",
      "Hello Taxi Tours Essaouira, I would like to confirm this transfer request:\n\nReference: {ref}\nRoute: {route}\nDate: {date} at {time}\nPassengers: {pax}\nVehicle: {vehicle}\nIndicative price: {price}\nName: {name}\nPhone: {phone}\nNotes: {notes}",
      variables);
  }

  function whatsappLink(message) {
    var number = String(config.whatsapp || "").replace(/[^\d]/g, "");
    return "https://wa.me/" + number + "?text=" + encodeURIComponent(message);
  }

  function emailLink(subject, body) {
    return "mailto:" + (config.email || "") +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
  }

  function addDialogRow(container, label, value) {
    var row = document.createElement("div");
    var dt = document.createElement("dt");
    var dd = document.createElement("dd");
    dt.textContent = label;
    dd.textContent = value;
    row.appendChild(dt);
    row.appendChild(dd);
    container.appendChild(row);
  }

  function openConfirmation(request) {
    var dialog = document.getElementById("booking-dialog");
    if (!dialog) return;

    var refEl = dialog.querySelector("[data-dialog-ref]");
    var summary = dialog.querySelector("[data-dialog-summary]");
    var waLink = dialog.querySelector("[data-dialog-wa]");
    var mailLink = dialog.querySelector("[data-dialog-email]");

    if (refEl) refEl.textContent = request.reference;
    if (summary) {
      summary.innerHTML = "";
      addDialogRow(summary, t("booking.summary.route", "Route"), request.pickupLabel + " → " + request.destinationLabel);
      addDialogRow(summary, t("booking.summary.date", "Date"), formatDate(request.date));
      addDialogRow(summary, t("booking.summary.time", "Pickup time"), request.time);
      addDialogRow(summary, t("booking.summary.passengers", "Passengers"), passengerLabel(request.passengers));
      addDialogRow(summary, t("booking.summary.vehicle", "Vehicle"), request.vehicleLabel);
      addDialogRow(summary, t("booking.summary.total", "Indicative total"), request.priceLabel);
    }

    if (waLink) waLink.href = whatsappLink(buildMessage(request, "whatsapp"));
    if (mailLink) {
      var mail = buildMessage(request, "email");
      mailLink.href = emailLink(mail.subject, mail.body);
    }

    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  }

  function initDialog() {
    var dialog = document.getElementById("booking-dialog");
    if (!dialog || dialog.dataset.initialised === "true") return;
    dialog.dataset.initialised = "true";

    dialog.querySelectorAll("[data-dialog-close]").forEach(function (button) {
      button.addEventListener("click", function () {
        if (typeof dialog.close === "function") dialog.close();
        else dialog.removeAttribute("open");
      });
    });

    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) {
        if (typeof dialog.close === "function") dialog.close();
        else dialog.removeAttribute("open");
      }
    });
  }

  function applyUrlPrefill(form) {
    var params = new URLSearchParams(window.location.search);
    var from = params.get("from");
    var to = params.get("to");
    var date = params.get("date");
    var pax = params.get("pax") || params.get("passengers");
    var time = params.get("time");

    if (from && locationByKey(from)) form.querySelector('[name="pickup"]').value = from;
    if (to && locationByKey(to)) form.querySelector('[name="destination"]').value = to;
    if (date && date >= todayISO()) form.querySelector('[name="date"]').value = date;
    if (pax && Number(pax) >= 1 && Number(pax) <= 40) form.querySelector('[name="passengers"]').value = String(Number(pax));
    if (time && /^\d{2}:\d{2}$/.test(time)) form.querySelector('[name="time"]').value = time;
  }

  function initBookingForm() {
    var form = document.querySelector("[data-booking-form]");
    if (!form || form.dataset.initialised === "true") return;
    form.dataset.initialised = "true";

    populateLocationSelect(form.querySelector('[name="pickup"]'));
    populateLocationSelect(form.querySelector('[name="destination"]'));
    setMinimumDates(form);
    renderVehicleOptions(form.querySelector("[data-vehicle-options]"));
    applyUrlPrefill(form);
    updateBookingView(form);

    form.addEventListener("change", function (event) {
      var name = event.target.getAttribute("name");
      if (name) clearFieldError(form, name);
      if (event.target.name === "vehicle") {
        form.querySelectorAll(".vehicle-option").forEach(function (option) {
          var radio = option.querySelector('input[name="vehicle"]');
          option.classList.toggle("is-selected", Boolean(radio && radio.checked));
        });
      }
      updateBookingView(form);
    });

    form.addEventListener("input", function (event) {
      var name = event.target.getAttribute("name");
      if (name) clearFieldError(form, name);
      if (name === "passengers") updateBookingView(form);
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      initDialog();
      var invalid = validateBooking(form);
      if (invalid.length) {
        var first = form.querySelector('[name="' + invalid[0] + '"]');
        if (first && typeof first.focus === "function") first.focus();
        return;
      }

      var request = collectRequest(form);
      saveRequest(request);
      openConfirmation(request);

      var status = form.querySelector("[data-booking-status]");
      if (status) {
        status.textContent = t("booking.statusSaved", "Your request has been prepared. Confirmation is complete when we reply on WhatsApp or email.");
        status.classList.add("form-status--ok");
        status.hidden = false;
      }

      document.dispatchEvent(new CustomEvent("tte:bookingrequest", { detail: request }));
    });
  }

  function refreshLanguage() {
    document.querySelectorAll("[data-quick-form]").forEach(function (form) {
      var from = form.querySelector('[name="from"]');
      var to = form.querySelector('[name="to"]');
      if (from) populateLocationSelect(from, from.value);
      if (to) populateLocationSelect(to, to.value);
      updateQuickPrice(form);
      quickError(form, "");
    });

    var form = document.querySelector("[data-booking-form]");
    if (form) {
      var pickup = form.querySelector('[name="pickup"]');
      var destination = form.querySelector('[name="destination"]');
      if (pickup) populateLocationSelect(pickup, pickup.value);
      if (destination) populateLocationSelect(destination, destination.value);
      var checked = selectedVehicleKey(form);
      renderVehicleOptions(form.querySelector("[data-vehicle-options]"));
      if (checked) {
        var radio = form.querySelector('input[name="vehicle"][value="' + checked + '"]');
        if (radio) radio.checked = true;
      }
      updateBookingView(form);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initQuickForms();
    initBookingForm();
    initDialog();
  });

  document.addEventListener("tte:languagechange", function () {
    if (document.readyState === "loading") return;
    refreshLanguage();
  });

  window.TTE_BOOKING = {
    locations: LOCATIONS,
    vehicles: VEHICLES,
    routes: ROUTES,
    getRoutePrice: getRoutePrice,
    formatPrice: formatPrice,
    formatDate: formatDate
  };
})();
