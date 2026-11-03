/* ==========================================================================
   Guest reviews
   --------------------------------------------------------------------------
   We do not publish invented testimonials. Add only genuine, permission-based
   reviews to the array below. Each review looks like:

   {
     name: "First name, Country",
     date: "October 2026",
     rating: 5,
     text: "The review text, in the language it was written in."
   }

   The array is intentionally empty. When it is empty the home page shows the
   honest "reviews coming soon" panel instead of fabricated quotes.
   ========================================================================== */
window.TTE_REVIEWS = window.TTE_REVIEWS || [];

(function () {
  "use strict";

  function t(key, fallback) {
    if (window.TTE_I18N && typeof window.TTE_I18N.t === "function") {
      return window.TTE_I18N.t(key, fallback);
    }
    return fallback || key;
  }

  function render() {
    var list = document.querySelector("[data-review-list]");
    if (!list) return;

    var reviews = Array.isArray(window.TTE_REVIEWS) ? window.TTE_REVIEWS : [];
    list.innerHTML = "";

    if (!reviews.length) {
      list.hidden = true;
      list.removeAttribute("role");
      return;
    }

    list.hidden = false;
    list.setAttribute("role", "list");

    reviews.forEach(function (review) {
      var card = document.createElement("article");
      card.className = "review-card";
      card.setAttribute("role", "listitem");

      var stars = document.createElement("p");
      stars.className = "review-card__stars";
      stars.setAttribute("aria-label", t("reviews.rating", "Rated {rating} out of 5").replace("{rating}", String(review.rating || 5)));
      stars.textContent = "★★★★★".slice(0, Math.max(1, Math.min(5, Number(review.rating) || 5)));

      var quote = document.createElement("p");
      quote.textContent = review.text || "";

      var footer = document.createElement("footer");
      footer.textContent = [review.name, review.date].filter(Boolean).join(" · ");

      card.appendChild(stars);
      card.appendChild(quote);
      card.appendChild(footer);
      list.appendChild(card);
    });
  }

  document.addEventListener("DOMContentLoaded", render);
  document.addEventListener("tte:languagechange", render);
})();
