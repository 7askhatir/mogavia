import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd(), "assets", "img");
fs.mkdirSync(root, { recursive: true });

const base = "https://images.pexels.com/photos/";
const items = [
  ["hero-essaouira", "32891813/pexels-photo-32891813/free-photo-of-aerial-view-of-essaouira-ramparts-and-atlantic-ocean.jpeg", [480, 960, 1600]],
  ["hero-vito", "17455625/pexels-photo-17455625/free-photo-of-black-mercedes-benz-vito-on-street-in-turkey.jpeg", [480, 960]],
  ["about-hero", "36377051/pexels-photo-36377051/free-photo-of-professional-chauffeur-standing-beside-luxury-suv.jpeg", [960, 1600]],
  ["about-essaouira", "39317835/pexels-photo-39317835/free-photo-of-charming-street-view-in-essaouira-morocco.jpeg", [480, 960]],
  ["services-hero", "36909833/pexels-photo-36909833/free-photo-of-scenic-road-through-moroccan-countryside-at-dusk.jpeg", [960, 1600]],
  ["excursions-hero", "35910049/pexels-photo-35910049/free-photo-of-camels-in-moroccan-desert-under-clear-blue-sky.jpeg", [960, 1600]],
  ["destinations-hero", "25254928/pexels-photo-25254928/free-photo-of-high-angle-view-of-a-scenic-ancient-city.jpeg", [960, 1600]],
  ["fleet-hero", "14764071/pexels-photo-14764071.jpeg", [960, 1600]],
  ["blog-hero", "37651105/pexels-photo-37651105/free-photo-of-bustling-market-scene-in-marrakesh-medina.jpeg", [960, 1600]],
  ["contact-hero", "37955932/pexels-photo-37955932/free-photo-of-seaside-view-with-historic-coastal-architecture.jpeg", [960, 1600]],
  ["book-hero", "6749656/pexels-photo-6749656.jpeg", [960, 1600]],
  ["why-chauffeur", "36377043/pexels-photo-36377043/free-photo-of-professional-chauffeur-loading-luggage-into-sedan.jpeg", [480, 960]],
  ["cta-coast", "37955932/pexels-photo-37955932/free-photo-of-seaside-view-with-historic-coastal-architecture.jpeg", [960, 1600]],
  ["dest-essaouira", "39894977/pexels-photo-39894977/free-photo-of-historic-port-fortress-in-essaouira-morocco.jpeg", [480, 960]],
  ["dest-marrakech", "25489589/pexels-photo-25489589/free-photo-of-view-of-horse-carriages-and-pedestrians-near-the-kutubiyya-mosque-in-marrakesh-morocco.jpeg", [480, 960]],
  ["dest-agadir", "35627666/pexels-photo-35627666/free-photo-of-aerial-view-of-agadir-city-and-beach.jpeg", [480, 960]],
  ["dest-taghazout", "28152720/pexels-photo-28152720/free-photo-of-banana-village.jpeg", [480, 960]],
  ["dest-imsouane", "27350413/pexels-photo-27350413/free-photo-of-imsouane.jpeg", [480, 960]],
  ["dest-casablanca", "1378421/pexels-photo-1378421.jpeg", [480, 960]],
  ["dest-agafay", "35910043/pexels-photo-35910043/free-photo-of-vast-desert-landscape-in-agafay-morocco.jpeg", [480, 960]],
  ["dest-ouarzazate", "23456866/pexels-photo-23456866/free-photo-of-view-of-taourirt-kasbah.jpeg", [480, 960]],
  ["tour-marrakech", "37651105/pexels-photo-37651105/free-photo-of-bustling-market-scene-in-marrakesh-medina.jpeg", [480, 960]],
  ["tour-agafay", "35910049/pexels-photo-35910049/free-photo-of-camels-in-moroccan-desert-under-clear-blue-sky.jpeg", [480, 960]],
  ["tour-atlas", "36909829/pexels-photo-36909829/free-photo-of-scenic-landscape-with-atlas-mountains-in-morocco.jpeg", [480, 960]],
  ["tour-aitbenhaddou", "34856121/pexels-photo-34856121/free-photo-of-scenic-view-of-ait-benhaddou-in-morocco.jpeg", [480, 960]],
  ["tour-medina", "39317835/pexels-photo-39317835/free-photo-of-charming-street-view-in-essaouira-morocco.jpeg", [480, 960]],
  ["tour-paradise", "10007119/pexels-photo-10007119.jpeg", [480, 960]],
  ["fleet-sedan", "14764071/pexels-photo-14764071.jpeg", [480, 960]],
  ["fleet-minivan", "17455625/pexels-photo-17455625/free-photo-of-black-mercedes-benz-vito-on-street-in-turkey.jpeg", [480, 960]],
  ["fleet-van", "19871522/pexels-photo-19871522/free-photo-of-a-black-2023-mercedes-benz-sprinter-cargo-van.jpeg", [480, 960]],
  ["fleet-minibus", "29586609/pexels-photo-29586609/free-photo-of-luxury-seabird-coach-bus-for-comfortable-travel.jpeg", [480, 960]],
  ["blog-road", "36909833/pexels-photo-36909833/free-photo-of-scenic-road-through-moroccan-countryside-at-dusk.jpeg", [480, 960]],
  ["blog-season", "27523570/pexels-photo-27523570/free-photo-of-a-man-is-standing-on-the-rocks-near-the-ocean.jpeg", [480, 960]],
  ["blog-surf", "36586462/pexels-photo-36586462/free-photo-of-surfer-on-rugged-moroccan-coastline.jpeg", [480, 960]],
  ["stay-villa", "21273694/pexels-photo-21273694.jpeg", [480, 960]],
  ["stay-apartment", "20445895/pexels-photo-20445895.jpeg", [480, 960]],
  ["stay-terrace", "1101982/pexels-photo-1101982.jpeg", [480, 960]],
];

const jobs = [];
for (const [name, p, widths] of items) {
  for (const w of widths) {
    const out = path.join(root, `${name}-${w}.jpg`);
    if (fs.existsSync(out) && fs.statSync(out).size > 1000) continue;
    jobs.push({ out, url: `${base}${p}?auto=compress&cs=tinysrgb&w=${w}` });
  }
}

let cursor = 0;
let done = 0;
async function worker() {
  while (cursor < jobs.length) {
    const job = jobs[cursor++];
    try {
      const res = await fetch(job.url, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 1000) throw new Error("empty image");
      fs.writeFileSync(job.out, buf);
      done++;
      console.log(`ok ${path.basename(job.out)} ${(buf.length / 1024).toFixed(0)}kB`);
    } catch (err) {
      console.error(`FAIL ${path.basename(job.out)}: ${err.message}`);
    }
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
console.log(`Downloaded ${done}/${jobs.length}`);
