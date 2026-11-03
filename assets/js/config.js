/* ==========================================================================
   Taxi Tours Essaouira — central configuration
   Replace the placeholders below with your real business details before
   publishing. They are used by the header, footer, booking form and
   WhatsApp / email links.
   ========================================================================== */
(function () {
  "use strict";

  var config = {
    brand: "Taxi Tours Essaouira",
    baseUrl: "https://www.taxitoursessaouira.com",
    phone: "+212600000000",
    phoneDisplay: "+212 600 000 000",
    email: "booking@taxitoursessaouira.com",
    whatsapp: "212600000000",
    hours: "07:00–22:00",
    currency: "EUR",
    currencySymbol: "€",
    defaultLanguage: "en",
    languages: ["en", "fr", "ar", "es"],
    storageKey: "tte_booking_requests",
    maxStoredRequests: 20
  };

  window.TTE_CONFIG = Object.assign({}, config, window.TTE_CONFIG || {});
  window.TTE = window.TTE || {};
  window.TTE.config = window.TTE_CONFIG;
})();
