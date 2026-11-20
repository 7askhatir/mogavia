(function () {
  "use strict";

  var config = window.TTE_CONFIG || {};

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function todayISO() {
    var now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 10);
  }

  function nowLocalDateTimeValue() {
    var now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  function formatMoney(value) {
    var sym = config.currencySymbol || "€";
    var n = Number(value);
    if (isNaN(n)) return "—";
    return sym + n;
  }

  function formatDateTime(date, time) {
    if (!date || !time) return "—";
    try {
      var d = new Date(date + "T" + time + ":00");
      if (!isNaN(d.getTime())) {
        return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(d);
      }
    } catch (e) {}
    return date + " · " + time;
  }

  function parseParams() {
    var p = new URLSearchParams(window.location.search);
    return {
      from: (p.get("from") || p.get("pickup") || "").trim(),
      to: (p.get("to") || p.get("dropoff") || "").trim(),
      date: (p.get("date") || "").trim(),
      time: (p.get("time") || "").trim(),
      passengers: parseInt(p.get("passengers") || p.get("pax") || "0", 10),
      luggage: (p.get("luggage") || "").trim(),
      vehicle: (p.get("vehicle") || "").trim(),
      category: (p.get("category") || "All").trim(),
      types: (p.get("types") || "").trim(),
      minPrice: (p.get("minPrice") || "").trim(),
      maxPrice: (p.get("maxPrice") || "").trim()
    };
  }

  function setParams(params) {
    var p = new URLSearchParams();
    Object.keys(params).forEach(function (k) {
      var v = params[k];
      if (v === undefined || v === null || v === "") return;
      p.set(k, String(v));
    });
    var url = window.location.pathname + (p.toString() ? "?" + p.toString() : "");
    window.history.replaceState({}, "", url);
  }

  function showFormError(form, message) {
    var el = qs("[data-transfer-error]", form.closest(".quick-card") || form.parentElement || document);
    if (!el) return;
    if (message) {
      el.textContent = message;
      el.hidden = false;
    } else {
      el.textContent = "";
      el.hidden = true;
    }
  }

  function buildLocationDatalist(datalist) {
    if (!datalist || datalist.children.length) return;
    var booking = window.TTE_BOOKING;
    var locs = booking && booking.locations ? booking.locations : [];
    locs.forEach(function (loc) {
      if (!loc || loc.key === "other") return;
      var opt = document.createElement("option");
      var label = loc.fallback || loc.key;
      try {
        if (booking && typeof booking.formatPrice === "function") {
          /* location labels are translated elsewhere; fallback is fine for datalist */
        }
      } catch (e) {}
      // try translated label if i18n ready
      if (window.TTE_I18N && typeof window.TTE_I18N.t === "function" && loc.labelKey) {
        label = window.TTE_I18N.t(loc.labelKey, loc.fallback);
      }
      opt.value = label;
      datalist.appendChild(opt);
    });
  }

  function initHomeSearchForm() {
    var form = qs("[data-transfer-search-form]");
    if (!form || form.dataset.initialised === "true") return;
    form.dataset.initialised = "true";

    buildLocationDatalist(qs("#transfer-locations"));

    var params = new URLSearchParams(window.location.search);
    var from = params.get("from") || params.get("pickup");
    var to = params.get("to") || params.get("dropoff") || params.get("destination");
    var date = params.get("date");
    var time = params.get("time");
    var pax = params.get("passengers") || params.get("pax");
    var luggage = params.get("luggage");

    if (from && qs('[name="from"]', form)) qs('[name="from"]', form).value = from;
    if (to && qs('[name="to"]', form)) qs('[name="to"]', form).value = to;
    if (pax && qs('[name="passengers"]', form)) {
      var n = parseInt(pax, 10);
      if (n >= 1 && n <= 16) qs('[name="passengers"]', form).value = String(n);
    }
    if (luggage && qs('[name="luggage"]', form)) qs('[name="luggage"]', form).value = luggage;

    var dateInput = qs('[name="date"]', form);
    var timeInput = qs('[name="time"]', form);
    var datetimeInput = qs('[name="datetime"]', form);

    if (datetimeInput) {
      datetimeInput.min = nowLocalDateTimeValue();
      if (date && time) {
        var combined = date + "T" + time;
        if (combined >= datetimeInput.min) datetimeInput.value = combined;
      }
      if (datetimeInput.value && datetimeInput.min && datetimeInput.value < datetimeInput.min) {
        datetimeInput.value = "";
      }
    } else {
      if (time && timeInput) timeInput.value = time;
      if (dateInput) {
        dateInput.min = todayISO();
        if (date && date >= todayISO()) dateInput.value = date;
        if (dateInput.value && dateInput.value < todayISO()) dateInput.value = "";
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      showFormError(form, "");

      var from = (qs('[name="from"]', form).value || "").trim();
      var to = (qs('[name="to"]', form).value || "").trim();
      var dateValue = "";
      var timeValue = "";

      if (qs('[name="datetime"]', form)) {
        var dt = (qs('[name="datetime"]', form).value || "").trim();
        if (dt && dt.indexOf("T") !== -1) {
          var parts = dt.split("T");
          dateValue = parts[0] || "";
          timeValue = (parts[1] || "").slice(0, 5);
        }
      } else {
        dateValue = (qs('[name="date"]', form) ? qs('[name="date"]', form).value : "").trim();
        timeValue = (qs('[name="time"]', form) ? qs('[name="time"]', form).value : "").trim();
      }

      var passengers = parseInt(qs('[name="passengers"]', form).value, 10);
      var luggage = (qs('[name="luggage"]', form) ? qs('[name="luggage"]', form).value : "").toString().trim();

      if (!from || !to) {
        showFormError(form, "Please enter both pickup and drop-off locations.");
        return;
      }
      if (from.toLowerCase() === to.toLowerCase()) {
        showFormError(form, "Pickup and drop-off locations must be different.");
        return;
      }
      if (!dateValue || !timeValue) {
        showFormError(form, "Please choose a valid pickup date and time.");
        return;
      }
      if (dateValue < todayISO()) {
        showFormError(form, "Please choose a valid pickup date and time.");
        return;
      }
      if (!passengers || passengers < 1 || passengers > 16) {
        showFormError(form, "Please select between 1 and 16 passengers.");
        return;
      }

      var submitParams = new URLSearchParams();
      submitParams.set("from", from);
      submitParams.set("to", to);
      submitParams.set("date", dateValue);
      submitParams.set("time", timeValue);
      submitParams.set("passengers", String(passengers));
      if (luggage) submitParams.set("luggage", luggage);
      window.location.href = "results.html?" + submitParams.toString();
    });
  }

  function finalPrice(vehicle) {
    if (!vehicle) return null;
    var p = Number(vehicle.price) || 0;
    var d = Number(vehicle.discount) || 0;
    return Math.max(0, p - d);
  }

  function renderVehicleCard(vehicle, selectedId) {
    var price = finalPrice(vehicle);
    var isSelected = vehicle.id === selectedId;
    var fees = Array.isArray(vehicle.includedFees) ? vehicle.includedFees.join(" · ") : "";
    var name = vehicle.name + (vehicle.similar ? " or similar" : "");
    var discountHtml = vehicle.discount ? '<span class="vehicle-card__discount">Save ' + formatMoney(vehicle.discount) + '</span>' : '';
    var originalHtml = vehicle.discount ? '<span class="vehicle-card__price-old">' + formatMoney(vehicle.price) + '</span>' : '';

    var card = document.createElement("article");
    card.className = "vehicle-card" + (isSelected ? " is-selected" : "");
    card.setAttribute("data-vehicle-id", vehicle.id);
    card.innerHTML =
      '<div class="vehicle-card__media"><img src="' + vehicle.image + '" alt="' + name.replace(/"/g, '&quot;') + '" loading="lazy" decoding="async"></div>' +
      '<div class="vehicle-card__body">' +
        '<div class="vehicle-card__badges"><span class="badge">' + vehicle.category + '</span><span class="badge badge--muted">' + vehicle.type + '</span></div>' +
        '<h3 class="vehicle-card__title">' + name + '</h3>' +
        '<p class="vehicle-card__desc">' + (vehicle.description || "") + '</p>' +
      '</div>' +
      '<div class="vehicle-card__side">' +
        '<div class="vehicle-card__pricing">' + discountHtml + originalHtml + '<span class="vehicle-card__price">' + formatMoney(price) + '</span><span class="vehicle-card__price-note">Max ' + vehicle.maxPassengers + ' passengers</span></div>' +
        '<button class="btn btn--primary vehicle-card__select" type="button" data-select-vehicle="' + vehicle.id + '">' + (isSelected ? "Selected" : "Select vehicle") + '</button>' +
      '</div>';
    return card;
  }

  function initResultsPage() {
    var page = qs("[data-results-page]");
    if (!page || page.dataset.initialised === "true") return;
    page.dataset.initialised = "true";

    var state = parseParams();
    var data = window.TTE_TRANSFER_DATA || { vehicles: [], estimateRoute: function () { return {}; } };
    var allVehicles = Array.isArray(data.vehicles) ? data.vehicles.slice() : [];

    var listEl = qs("[data-results-list]", page);
    var emptyEl = qs("[data-results-empty]", page);
    var loadingEl = qs("[data-results-loading]", page);
    var errorEl = qs("[data-results-error]", page);
    var countEl = qs("[data-results-count]", page);

    function hasRequiredSearch() {
      return state.from && state.to && state.date && state.time && state.passengers >= 1 && state.passengers <= 16;
    }

    function showError(message) {
      if (errorEl) { errorEl.textContent = message; errorEl.hidden = false; }
      if (loadingEl) loadingEl.hidden = true;
      if (listEl) listEl.innerHTML = "";
      if (emptyEl) emptyEl.hidden = true;
      if (countEl) countEl.textContent = "0 vehicles available";
    }

    if (loadingEl) loadingEl.hidden = false;
    if (errorEl) errorEl.hidden = true;

    if (!hasRequiredSearch()) {
      showError("Missing or invalid search details. Please start a new availability search from the homepage.");
      // keep summary minimal
      updateSummaryHeader();
      wireControls(function () {}, function () {});
      return;
    }

    if (state.from.toLowerCase() === state.to.toLowerCase()) {
      showError("Pickup and drop-off locations must be different. Please edit your search.");
      updateSummaryHeader();
      wireControls(function () {}, function () {});
      return;
    }

    function getSelectedTypes() {
      return qsa("[data-type-filter]:checked", page).map(function (el) { return el.value; });
    }

    function getFilters() {
      var activeCatBtn = qs(".results-cats .chip.is-active", page);
      var category = activeCatBtn ? activeCatBtn.getAttribute("data-cat-filter") : "All";
      var min = qs("[data-price-min]", page) ? qs("[data-price-min]", page).value : "";
      var max = qs("[data-price-max]", page) ? qs("[data-price-max]", page).value : "";
      return {
        category: category || "All",
        types: getSelectedTypes(),
        minPrice: min !== "" ? Number(min) : null,
        maxPrice: max !== "" ? Number(max) : null
      };
    }

    function capacityMatches(vehicle) {
      return Number(vehicle.maxPassengers) >= Number(state.passengers);
    }

    function applyFilters(vehicles) {
      var f = getFilters();
      return vehicles.filter(function (v) {
        if (!capacityMatches(v)) return false;
        if (f.category && f.category !== "All" && v.category !== f.category) return false;
        if (f.types && f.types.length && f.types.indexOf(v.type) === -1) return false;
        var price = finalPrice(v);
        if (f.minPrice !== null && !isNaN(f.minPrice) && price < f.minPrice) return false;
        if (f.maxPrice !== null && !isNaN(f.maxPrice) && price > f.maxPrice) return false;
        return true;
      });
    }

    function baseAvailable() {
      return allVehicles.filter(capacityMatches);
    }

    function updateSummaryHeader() {
      var pickupEl = qs("[data-results-pickup]", page);
      var dropEl = qs("[data-results-dropoff]", page);
      var dtEl = qs("[data-results-datetime]", page);
      var paxEl = qs("[data-results-passengers]", page);
      var lugEl = qs("[data-results-luggage]", page);
      if (pickupEl) pickupEl.textContent = state.from || "—";
      if (dropEl) dropEl.textContent = state.to || "—";
      if (dtEl) dtEl.textContent = formatDateTime(state.date, state.time);
      if (paxEl) paxEl.textContent = state.passengers ? (state.passengers + (state.passengers === 1 ? " passenger" : " passengers")) : "—";
      if (lugEl) lugEl.textContent = state.luggage ? (state.luggage + " item(s)") : "Not specified";

      var est = (typeof data.estimateRoute === "function") ? data.estimateRoute(state.from, state.to) : {};
      var routeEl = qs("[data-summary-route]", page);
      var distEl = qs("[data-summary-distance]", page);
      var durEl = qs("[data-summary-duration]", page);
      var spaxEl = qs("[data-summary-pax]", page);
      if (routeEl) routeEl.textContent = (state.from && state.to) ? (state.from + " → " + state.to) : "—";
      if (distEl) distEl.textContent = est.distance || "Not available";
      if (durEl) durEl.textContent = est.duration || "Not available";
      if (spaxEl) spaxEl.textContent = state.passengers ? (state.passengers + (state.passengers === 1 ? " passenger" : " passengers")) : "—";

      var edit = qs("[data-results-edit]", page);
      if (edit) {
        var p = new URLSearchParams();
        if (state.from) p.set("from", state.from);
        if (state.to) p.set("to", state.to);
        if (state.date) p.set("date", state.date);
        if (state.time) p.set("time", state.time);
        if (state.passengers) p.set("passengers", String(state.passengers));
        if (state.luggage) p.set("luggage", state.luggage);
        edit.href = "index.html?" + p.toString() + "#transfer-search";
      }
    }

    function updateSelectionSummary(filtered) {
      var selected = null;
      for (var i = 0; i < allVehicles.length; i++) {
        if (allVehicles[i].id === state.vehicle) { selected = allVehicles[i]; break; }
      }
      // if selected is filtered out by passengers (invalid), clear it
      if (selected && !capacityMatches(selected)) {
        selected = null;
        state.vehicle = "";
      }
      var vehicleEl = qs("[data-summary-vehicle]", page);
      var totalEl = qs("[data-summary-total]", page);
      var noteEl = qs("[data-summary-total-note]", page);
      var promptEl = qs("[data-summary-prompt]", page);
      var continueEl = qs("[data-summary-continue]", page);

      if (selected) {
        if (vehicleEl) vehicleEl.textContent = selected.name + (selected.similar ? " or similar" : "");
        if (totalEl) totalEl.textContent = formatMoney(finalPrice(selected));
        if (noteEl) noteEl.textContent = "one way · " + selected.category;
        if (promptEl) promptEl.hidden = true;
        if (continueEl) {
          continueEl.classList.remove("is-disabled");
          continueEl.setAttribute("aria-disabled", "false");
          var p = new URLSearchParams();
          p.set("pickup", state.from);
          p.set("destination", state.to);
          p.set("date", state.date);
          p.set("time", state.time);
          p.set("pax", String(state.passengers));
          if (state.luggage) p.set("luggage", state.luggage);
          p.set("vehicleId", selected.id);
          p.set("vehicleLabel", selected.name + (selected.similar ? " or similar" : ""));
          p.set("price", String(finalPrice(selected)));
          continueEl.href = "book.html?" + p.toString();
        }
      } else {
        if (vehicleEl) vehicleEl.textContent = "Choose a vehicle";
        if (totalEl) totalEl.textContent = "—";
        if (noteEl) noteEl.textContent = "one way";
        if (promptEl) promptEl.hidden = false;
        if (continueEl) {
          continueEl.classList.add("is-disabled");
          continueEl.setAttribute("aria-disabled", "true");
          continueEl.href = "book.html";
        }
      }
      return selected;
    }

    function persistState() {
      var f = getFilters();
      setParams({
        from: state.from,
        to: state.to,
        date: state.date,
        time: state.time,
        passengers: state.passengers,
        luggage: state.luggage,
        vehicle: state.vehicle,
        category: f.category !== "All" ? f.category : "",
        types: f.types && f.types.length ? f.types.join(",") : "",
        minPrice: f.minPrice !== null && !isNaN(f.minPrice) ? f.minPrice : "",
        maxPrice: f.maxPrice !== null && !isNaN(f.maxPrice) ? f.maxPrice : ""
      });
    }

    function render() {
      if (loadingEl) loadingEl.hidden = true;
      if (errorEl) errorEl.hidden = true;

      var filtered = applyFilters(allVehicles);
      var totalForPassengers = baseAvailable().length;

      if (listEl) listEl.innerHTML = "";
      if (countEl) {
        countEl.textContent = filtered.length + (filtered.length === 1 ? " vehicle available" : " vehicles available");
      }

      if (filtered.length === 0) {
        if (emptyEl) {
          emptyEl.hidden = false;
          var h = qs("h3", emptyEl);
          var p = qs("p", emptyEl);
          if (totalForPassengers === 0) {
            if (h) h.textContent = "No vehicles available for this passenger count";
            if (p) p.textContent = "We don't have vehicles that can accommodate " + state.passengers + " passenger(s). Try a smaller group or contact us for a custom option.";
          } else {
            if (h) h.textContent = "No vehicles match your filters";
            if (p) p.textContent = "Try changing the category, vehicle type, or price range to see available options.";
          }
        }
      } else {
        if (emptyEl) emptyEl.hidden = true;
        var selected = updateSelectionSummary(filtered);
        filtered.forEach(function (v) {
          listEl.appendChild(renderVehicleCard(v, selected ? selected.id : ""));
        });
      }

      updateSelectionSummary(filtered);
      persistState();
    }

    function wireControls(onChange, onSelect) {
      qsa("[data-cat-filter]", page).forEach(function (btn) {
        btn.addEventListener("click", function () {
          qsa("[data-cat-filter]", page).forEach(function (b) { b.classList.remove("is-active"); });
          btn.classList.add("is-active");
          onChange();
        });
      });
      qsa("[data-type-filter], [data-price-min], [data-price-max]", page).forEach(function (el) {
        el.addEventListener("change", onChange);
        el.addEventListener("input", function () {
          if (el.hasAttribute("data-price-min") || el.hasAttribute("data-price-max")) onChange();
        });
      });
      var clear = qs("[data-filters-clear]", page);
      if (clear) clear.addEventListener("click", function () {
        qsa("[data-type-filter]", page).forEach(function (el) { el.checked = false; });
        var min = qs("[data-price-min]", page); if (min) min.value = "";
        var max = qs("[data-price-max]", page); if (max) max.value = "";
        onChange();
      });

      page.addEventListener("click", function (event) {
        var btn = event.target.closest("[data-select-vehicle]");
        if (!btn) return;
        state.vehicle = btn.getAttribute("data-select-vehicle") || "";
        onSelect();
      });

      var toggle = qs("[data-results-filter-toggle]", page);
      var filters = qs("[data-results-filters]", page);
      var close = qs("[data-results-filters-close]", page);
      if (toggle && filters) {
        toggle.addEventListener("click", function () {
          var open = filters.classList.toggle("is-open");
          toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
      }
      if (close && filters && toggle) {
        close.addEventListener("click", function () {
          filters.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        });
      }
    }

    // hydrate filters from URL
    if (state.category && state.category !== "All") {
      qsa("[data-cat-filter]", page).forEach(function (b) {
        b.classList.toggle("is-active", b.getAttribute("data-cat-filter") === state.category);
      });
    }
    if (state.types) {
      var tset = state.types.split(",").map(function (s) { return s.trim(); });
      qsa("[data-type-filter]", page).forEach(function (el) { el.checked = tset.indexOf(el.value) !== -1; });
    }
    if (state.minPrice) { var minEl = qs("[data-price-min]", page); if (minEl) minEl.value = state.minPrice; }
    if (state.maxPrice) { var maxEl = qs("[data-price-max]", page); if (maxEl) maxEl.value = state.maxPrice; }

    updateSummaryHeader();
    wireControls(render, render);

    // simulate brief loading state for UX
    window.setTimeout(function () {
      render();
    }, 120);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initHomeSearchForm();
    initResultsPage();
  });
})();