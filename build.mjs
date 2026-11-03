import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const config = JSON.parse(fs.readFileSync(path.join(root, "pages.json"), "utf8"));
const layout = fs.readFileSync(path.join(root, "src", "layout.html"), "utf8");
const base = config.baseUrl.replace(/\/$/, "");

const pageNames = {
  home: "Home",
  about: "About Us",
  services: "Taxi Services",
  excursions: "Excursions",
  destinations: "Destinations",
  fleet: "Fleet",
  blog: "Blog",
  contact: "Contact",
  book: "Book Now",
  terms: "Booking Terms & Privacy",
  "404": "Page Not Found"
};

const business = {
  "@context": "https://schema.org",
  "@type": "TaxiService",
  "@id": `${base}/#taxi-service`,
  name: "Taxi Tours Essaouira",
  description:
    "Private taxi transfers, airport pickups and tailor-made excursions from Essaouira to Marrakech, Agadir, Casablanca and the Atlas Mountains.",
  url: `${base}/`,
  image: `${base}/assets/img/fleet-sedan-960.jpg`,
  telephone: config.phone,
  email: config.email,
  priceRange: "€€",
  currenciesAccepted: "EUR, MAD",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Essaouira",
    addressRegion: "Marrakech-Safi",
    addressCountry: "MA"
  },
  geo: { "@type": "GeoCoordinates", latitude: 31.5085, longitude: -9.7595 },
  areaServed: [
    "Essaouira", "Marrakech", "Agadir", "Taghazout", "Imsouane",
    "Casablanca", "Agafay", "Ouarzazate", "Taroudant", "Safi"
  ].map((name) => ({ "@type": "City", name })),
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "07:00",
    closes: "22:00"
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Private transport services",
    itemListElement: [
      "Private taxi transfers",
      "Airport transfers",
      "City-to-city transfers",
      "Private day trips",
      "City tours",
      "Group transportation"
    ].map((name) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name }
    }))
  }
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${base}/#website`,
  url: `${base}/`,
  name: "Taxi Tours Essaouira",
  publisher: { "@id": `${base}/#taxi-service` },
  inLanguage: ["en", "fr", "ar", "es"]
};

function breadcrumb(page) {
  const items = [
    { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` }
  ];
  if (page.page !== "home") {
    items.push({
      "@type": "ListItem",
      position: 2,
      name: pageNames[page.page] || page.title,
      item: `${base}/${page.slug}`
    });
  }
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items };
}

function pageSchema(page) {
  if (page.page === "home") {
    return [business, website];
  }
  if (page.page === "404") return [];
  const nodes = [business, breadcrumb(page)];
  if (page.page === "about") {
    nodes.push({
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: page.title,
      url: `${base}/${page.slug}`,
      about: { "@id": `${base}/#taxi-service` },
      inLanguage: "en"
    });
  }
  if (page.page === "services") {
    nodes.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Private transport services",
      itemListElement: [
        "Private taxi transfers",
        "Airport transfers",
        "City-to-city transfers",
        "Private day trips",
        "City tours",
        "Group transportation"
      ].map((name, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: { "@type": "Service", name, provider: { "@id": `${base}/#taxi-service` } }
      }))
    });
  }
  if (page.page === "excursions") {
    nodes.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Private excursions from Essaouira",
      itemListElement: [
        "Marrakech day trip",
        "Agafay desert sunset",
        "Atlas Mountains and Imlil",
        "Aït Benhaddou and Ouarzazate",
        "Essaouira medina and coast",
        "Paradise Valley and Agadir"
      ].map((name, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: { "@type": "TouristTrip", name, provider: { "@id": `${base}/#taxi-service` } }
      }))
    });
  }
  if (page.page === "destinations") {
    nodes.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Destinations in Morocco",
      itemListElement: [
        "Essaouira", "Marrakech", "Agadir", "Taghazout",
        "Imsouane", "Casablanca", "Agafay", "Ouarzazate"
      ].map((name, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: { "@type": "TouristDestination", name }
      }))
    });
  }
  if (page.page === "contact") {
    nodes.push({
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: page.title,
      url: `${base}/${page.slug}`,
      about: { "@id": `${base}/#taxi-service` }
    });
  }
  if (page.page === "book") {
    nodes.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How do I confirm a booking?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Send your request through the booking form, then confirm the details with us on WhatsApp. Your journey is confirmed when we reply with the vehicle, meeting point and final price."
          }
        },
        {
          "@type": "Question",
          name: "Is a deposit or online payment required?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No online payment is taken by this website. Payment is arranged directly with your driver; confirm the accepted method when you book."
          }
        },
        {
          "@type": "Question",
          name: "What happens if my flight is delayed?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Share your flight number when booking. We monitor arrival times and adjust the pickup for delays."
          }
        },
        {
          "@type": "Question",
          name: "Can I request a child seat?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Tell us the ages of any children travelling and we will confirm the best available option before your journey."
          }
        }
      ]
    });
  }
  if (page.page === "blog") {
    nodes.push({
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "Morocco Travel Blog",
      url: `${base}/blog.html`,
      publisher: { "@id": `${base}/#taxi-service` },
      blogPost: [
        ["Essaouira to Marrakech by private taxi: what to expect", "essaouira-to-marrakech-by-private-taxi"],
        ["The best day trips from Essaouira", "best-day-trips-from-essaouira"],
        ["When to visit Essaouira: a season-by-season guide", "when-to-visit-essaouira"]
      ].map(([headline, slug]) => ({
        "@type": "BlogPosting",
        headline,
        url: `${base}/blog.html#${slug}`,
        publisher: { "@id": `${base}/#taxi-service` }
      }))
    });
  }
  return nodes;
}

function schemaMarkup(page) {
  return pageSchema(page)
    .map((node) => `<script type="application/ld+json">${JSON.stringify(node, null, 2)}</script>`)
    .join("\n  ");
}

function preloadLink(page) {
  if (!page.preload) return "";
  return `<link rel="preload" as="image" href="assets/img/${page.preload}-960.jpg" imagesrcset="${page.preloadSrcset}" imagesizes="${page.preloadSizes}">`;
}

let built = 0;
for (const page of config.pages) {
  const bodyPath = path.join(root, "src", "pages", `${page.file}.html`);
  if (!fs.existsSync(bodyPath)) {
    console.warn(`Skipping ${page.slug || "index.html"}: missing ${bodyPath}`);
    continue;
  }
  const body = fs.readFileSync(bodyPath, "utf8");
  const canonical = page.slug ? `${base}/${page.slug}` : `${base}/`;
  let html = layout;
  const replacements = {
    TITLE: page.title,
    DESCRIPTION: page.description,
    CANONICAL: canonical,
    BASE: `${base}/`,
    OG_TYPE: page.page === "blog" ? "article" : "website",
    OG_TITLE: page.ogTitle || page.title,
    OG_DESCRIPTION: page.description,
    OG_IMAGE: page.ogImage,
    OG_WIDTH: String(page.ogWidth || 960),
    OG_HEIGHT: String(page.ogHeight || 640),
    ROBOTS: page.robots || "index,follow,max-image-preview:large",
    PRELOAD_LINK: preloadLink(page),
    PAGE: page.page,
    BODY_CLASS: page.bodyClass || "",
    CONTENT: body,
    EXTRA_HEAD: schemaMarkup(page),
    PHONE: config.phone,
    PHONE_DISPLAY: config.phoneDisplay,
    EMAIL: config.email,
    WHATSAPP: config.whatsapp
  };
  for (const [key, value] of Object.entries(replacements)) {
    html = html.split(`{{${key}}}`).join(value);
  }
  const out = path.join(root, page.slug || "index.html");
  fs.writeFileSync(out, html);
  built++;
  console.log(`built ${page.slug || "index.html"}`);
}

const today = new Date().toISOString().slice(0, 10);
let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
for (const page of config.pages) {
  if (!page.sitemap) continue;
  const loc = page.slug ? `${base}/${page.slug}` : `${base}/`;
  sitemap += `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${page.sitemap.changefreq}</changefreq>\n    <priority>${page.sitemap.priority}</priority>\n  </url>\n`;
}
sitemap += "</urlset>\n";
fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap);

console.log(`\n${built} pages built. Sitemap written.`);
