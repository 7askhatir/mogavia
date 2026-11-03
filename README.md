# Taxi Tours Essaouira — static website

A fast, accessible, multilingual marketing site for a private taxi and excursion
business based in Essaouira, Morocco. The published site is plain HTML, CSS and
vanilla JavaScript; there is no server, database or build-time framework.

## Contents

- `index.html`, `about.html`, `services.html`, `excursions.html`,
  `destinations.html`, `fleet.html`, `blog.html`, `contact.html`, `book.html`,
  `terms.html`, `404.html` — generated pages (do not edit these by hand)
- `src/layout.html` — shared shell: head, header, navigation, footer, WhatsApp
  button
- `src/pages/*.html` — page-specific HTML fragments
- `pages.json` — page titles, descriptions, social images, canonical paths,
  contact placeholders, sitemap settings
- `build.mjs` — assembles fragments into the final HTML and writes `sitemap.xml`
- `assets/css/styles.css` — the complete design system, responsive and RTL rules
- `assets/js/` — configuration, translations, i18n, booking, reviews and shared
  interface behaviour
- `assets/img/` — optimised local images, including `favicon.svg`
- `tools/` — optional helper scripts used while preparing images

## Build

Requirements: Node.js 18 or newer. There are no npm dependencies.

```sh
node build.mjs
```

This reads `pages.json` and `src/pages/*.html`, then writes every page to the
project root together with `sitemap.xml`. Edit the fragments and rebuild; never
edit generated root HTML files directly, or your changes will be overwritten.

To preview, open `index.html` in a browser or serve the folder locally:

```sh
npx serve .
```

A local server is recommended for testing the Google map, fonts and language
URLs.

## Replace the business details before publishing

The site ships with clearly marked placeholders. Update BOTH places below; they
must match.

1. `pages.json` — `phone`, `phoneDisplay`, `email`, `whatsapp`, `baseUrl`.
2. `assets/js/config.js` — the same phone, email, WhatsApp number and base URL.

- `phone` is the dialable international number, for example `+212612345678`.
- `phoneDisplay` is the formatted number shown to visitors.
- `whatsapp` is digits only, without `+` or spaces, for `https://wa.me/...`.
- `baseUrl` must be the real domain, with no trailing slash. It controls
  canonical links, social metadata and the sitemap.

Also review:

- `assets/js/booking.js` — the route/vehicle price matrix. All fares are
  indicative; confirm your own rates before launch.
- `build.mjs` — business schema, service catalogue, FAQ answers and blog
  metadata.
- `src/pages/terms.html` and the terms strings in every language file — these
  are a practical starting point, not legal advice. Have them reviewed for your
  business and jurisdiction.
- Social preview images in `pages.json` — they currently use site photography.

The default contact details are placeholders and must not go live as-is.

## Booking behaviour (important)

There is no backend and no payment processing.

1. The visitor completes the form. JavaScript validates the fields and calculates
   an indicative fare for the whole vehicle, one way.
2. The request is saved in the visitor's own browser under the key
   `tte_booking_requests` (`localStorage`). Nothing is sent to a server.
3. A dialog opens with a prefilled WhatsApp message and an email draft. The
   visitor chooses how to send it.
4. The interface states clearly that the journey is **not confirmed** until the
   business replies with the vehicle, meeting point and final price.

If you later add a backend, keep the same confirmation language and privacy
disclosure, and update `terms.html` and the translation files accordingly.

## Languages

English is the default and the fallback. French, Arabic and Spanish are included.
Arabic switches the document to right-to-left.

- Strings live in `assets/js/lang/en.js`, `fr.js`, `ar.js` and `es.js`.
- All four files must contain the same keys. `en.js` is the source of truth.
- Mark up translatable text with `data-i18n` (text), `data-i18n-html` (markup),
  `data-i18n-placeholder`, `data-i18n-aria` or `data-i18n-title`.
- Page metadata uses `meta.<page>.title` and `meta.<page>.description`.
- The chosen language is stored in `localStorage` and reflected in the URL as
  `?lang=fr`, `?lang=ar` or `?lang=es`. Links between pages are relative and keep
  the saved language automatically.
- To add a language, extend `languages` in `assets/js/config.js`, add a
  dictionary and a script tag in `src/layout.html`, then rebuild.

## Reviews

`assets/js/reviews.js` intentionally starts with an empty
`window.TTE_REVIEWS = []`. No testimonials are invented. The home page explains
that reviews will appear when guests agree to share them. Add only genuine,
permission-based reviews using the documented object shape; the renderer shows
them as cards. Do not add ratings that were not actually given, and do not add
certifications or awards the business does not hold.

## Images

Photography was sourced from Pexels, whose licence permits free use without
attribution. The files are illustrative stock images, not photographs of a
specific fleet or team. Replace them with real, licensed photographs of your
vehicles, drivers and destinations before launch where authenticity matters, and
keep meaningful `alt` text. Images are pre-sized at multiple widths and use
explicit dimensions to reduce layout shift.

`tools/fetch-images.mjs` documents the original download workflow.
`tools/image-sizes.json` records the dimensions used in the HTML.

## SEO and accessibility

- Every page has a unique title, description, canonical URL, Open Graph and
  Twitter metadata.
- `hreflang` alternates are generated for all four languages.
- Semantic HTML5 landmarks, one `h1` per page, labelled navigation and forms,
  visible focus states, a skip link, a keyboard-operable mobile panel and
  reduced-motion support are included.
- `TaxiService`, `WebSite`, `BreadcrumbList` and page-specific schema are
  generated by `build.mjs`.
- `sitemap.xml` and `robots.txt` are included. The 404 page is `noindex`.
- Before launch, replace the placeholder domain in `robots.txt` if it differs
  from `pages.json`.

## Deployment

Upload the repository contents (except `src/`, `tools/`, `build.mjs` and
`pages.json` if you prefer a clean public folder) to any static host: Netlify,
Cloudflare Pages, GitHub Pages, an Apache/Nginx server, or a shared host. Keep
the directory structure so relative asset paths continue to work. Configure the
host to serve `404.html` for missing paths. Enable HTTPS, compression and
long-lived caching for `assets/`.

## Licence and credits

Site code and copy were created for this project. Photography remains subject to
the Pexels licence. Fonts are served by Google Fonts under their respective
licences (Cormorant Garamond, Inter, Amiri, Tajawal). The embedded map is
provided by Google Maps and subject to Google's terms.
