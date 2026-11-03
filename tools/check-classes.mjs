import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pages = [
  "index.html", "about.html", "services.html", "excursions.html",
  "destinations.html", "fleet.html", "blog.html", "contact.html",
  "book.html", "terms.html", "404.html"
];
const html = pages.map((page) => fs.readFileSync(path.join(root, page), "utf8")).join("\n") +
  fs.readFileSync(path.join(root, "src/layout.html"), "utf8");
const css = fs.readFileSync(path.join(root, "assets/css/styles.css"), "utf8");

const classes = new Set();
for (const match of html.matchAll(/class="([^"]+)"/g)) {
  match[1].split(/\s+/).filter(Boolean).forEach((name) => classes.add(name));
}
const missing = [...classes].filter((name) => !css.includes(`.${name}`)).sort();
console.log(`${classes.size} classes used; ${missing.length} without a matching CSS selector:`);
missing.forEach((name) => console.log(` - ${name}`));
