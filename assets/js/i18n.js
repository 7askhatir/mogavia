/* ==========================================================================
   Taxi Tours Essaouira — lightweight i18n
   --------------------------------------------------------------------------
   - English is the default and the fallback.
   - The chosen language is stored in localStorage and reflected in ?lang=.
   - Text is translated through data-i18n attributes.
   - Arabic switches the document to RTL.
   ========================================================================== */
(function () {
  "use strict";

  var config = window.TTE_CONFIG || {};
  var supported = Array.isArray(config.languages) && config.languages.length
    ? config.languages
    : ["en", "fr", "ar", "es"];
  var rtlLanguages = ["ar", "he", "fa", "ur"];
  var storageKey = "tte_language";

  function dictionary(language) {
    return (window.TTE_STRINGS && window.TTE_STRINGS[language]) || {};
  }

  function readStoredLanguage() {
    try {
      return window.localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  function storeLanguage(language) {
    try {
      window.localStorage.setItem(storageKey, language);
    } catch (error) {
      /* Storage can be disabled; the URL parameter still works. */
    }
  }

  function normalise(language) {
    if (!language) return null;
    var value = String(language).toLowerCase().split("-")[0];
    return supported.indexOf(value) !== -1 ? value : null;
  }

  function initialLanguage() {
    var params = new URLSearchParams(window.location.search);
    return normalise(params.get("lang")) ||
      normalise(readStoredLanguage()) ||
      normalise(document.documentElement.lang) ||
      normalise(config.defaultLanguage) ||
      "en";
  }

  var currentLanguage = initialLanguage();

  function has(key) {
    return Object.prototype.hasOwnProperty.call(dictionary(currentLanguage), key) ||
      Object.prototype.hasOwnProperty.call(dictionary("en"), key);
  }

  function interpolate(value, vars) {
    if (!vars) return value;
    return String(value).replace(/\{(\w+)\}/g, function (match, name) {
      return Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match;
    });
  }

  function t(key, fallback, vars) {
    var text = dictionary(currentLanguage)[key];
    if (text === undefined || text === null || text === "") {
      text = dictionary("en")[key];
    }
    if (text === undefined || text === null || text === "") {
      text = fallback !== undefined && fallback !== null ? fallback : key;
    }
    return interpolate(text, vars);
  }

  function setMeta(selector, attribute, value) {
    if (!value) return;
    var element = document.querySelector(selector);
    if (element) element.setAttribute(attribute, value);
  }

  function updateMeta() {
    var page = document.body ? document.body.getAttribute("data-page") || "home" : "home";
    var titleKey = "meta." + page + ".title";
    var descriptionKey = "meta." + page + ".description";

    if (has(titleKey)) document.title = t(titleKey);
    if (has(descriptionKey)) {
      setMeta('meta[name="description"]', "content", t(descriptionKey));
      setMeta('meta[property="og:description"]', "content", t(descriptionKey));
      setMeta('meta[name="twitter:description"]', "content", t(descriptionKey));
    }
    if (has(titleKey)) {
      setMeta('meta[property="og:title"]', "content", t(titleKey));
      setMeta('meta[name="twitter:title"]', "content", t(titleKey));
    }

    var locales = { en: "en_US", fr: "fr_FR", ar: "ar_MA", es: "es_ES" };
    setMeta('meta[property="og:locale"]', "content", locales[currentLanguage] || "en_US");
  }

  function localiseLinks(language) {
    document.querySelectorAll("a[href]").forEach(function (link) {
      var raw = link.getAttribute("href");
      if (!raw || /^(?:#|mailto:|tel:|https?:|javascript:|data:)/i.test(raw)) return;
      try {
        var url = new URL(raw, window.location.href);
        if (!/\.html$/.test(url.pathname)) return;
        if (language === "en") url.searchParams.delete("lang");
        else url.searchParams.set("lang", language);
        var file = url.pathname.split("/").pop();
        link.setAttribute("href", file + (url.search || "") + url.hash);
      } catch (error) {
        /* Leave unusual links untouched. */
      }
    });
  }

  function apply(root) {
    var scope = root || document;
    var language = currentLanguage;

    document.documentElement.lang = language;
    document.documentElement.dir = rtlLanguages.indexOf(language) !== -1 ? "rtl" : "ltr";

    scope.querySelectorAll("[data-i18n]").forEach(function (element) {
      var key = element.getAttribute("data-i18n");
      if (!key) return;
      var fallback = element.textContent;
      element.textContent = t(key, fallback);
    });

    scope.querySelectorAll("[data-i18n-html]").forEach(function (element) {
      var key = element.getAttribute("data-i18n-html");
      if (!key) return;
      var fallback = element.innerHTML;
      element.innerHTML = t(key, fallback);
    });

    scope.querySelectorAll("[data-i18n-placeholder]").forEach(function (element) {
      var key = element.getAttribute("data-i18n-placeholder");
      if (!key) return;
      element.setAttribute("placeholder", t(key, element.getAttribute("placeholder") || ""));
    });

    scope.querySelectorAll("[data-i18n-aria]").forEach(function (element) {
      var key = element.getAttribute("data-i18n-aria");
      if (!key) return;
      element.setAttribute("aria-label", t(key, element.getAttribute("aria-label") || ""));
    });

    scope.querySelectorAll("[data-i18n-title]").forEach(function (element) {
      var key = element.getAttribute("data-i18n-title");
      if (!key) return;
      element.setAttribute("title", t(key, element.getAttribute("title") || ""));
    });

    document.querySelectorAll("[data-language-select]").forEach(function (select) {
      select.value = language;
    });

    localiseLinks(language);
    updateMeta();
  }

  function updateUrl(language) {
    try {
      var url = new URL(window.location.href);
      if (language === "en") {
        url.searchParams.delete("lang");
      } else {
        url.searchParams.set("lang", language);
      }
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : "") + url.hash);
    } catch (error) {
      /* file:// or very old browsers: the language still applies. */
    }
  }

  function setLanguage(language, options) {
    var next = normalise(language) || "en";
    var changed = next !== currentLanguage;
    currentLanguage = next;
    storeLanguage(next);
    if (!options || options.updateUrl !== false) updateUrl(next);
    apply(document);

    document.dispatchEvent(new CustomEvent("tte:languagechange", {
      detail: { language: next }
    }));

    return changed;
  }

  document.querySelectorAll("[data-language-select]").forEach(function (select) {
    select.addEventListener("change", function () {
      setLanguage(select.value);
    });
  });

  window.addEventListener("popstate", function () {
    var params = new URLSearchParams(window.location.search);
    var next = normalise(params.get("lang")) || normalise(readStoredLanguage()) || "en";
    currentLanguage = next;
    storeLanguage(next);
    apply(document);
    document.dispatchEvent(new CustomEvent("tte:languagechange", {
      detail: { language: next }
    }));
  });

  window.TTE_I18N = {
    t: t,
    has: has,
    apply: apply,
    updateMeta: updateMeta,
    setLanguage: setLanguage,
    getLanguage: function () { return currentLanguage; },
    languages: supported.slice()
  };

  // Apply immediately; the script is deferred, so the DOM is ready.
  apply(document);
  document.dispatchEvent(new CustomEvent("tte:languagechange", {
    detail: { language: currentLanguage }
  }));
})();
