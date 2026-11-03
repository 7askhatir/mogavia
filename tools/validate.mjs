/* Static validation for the generated site. Run: node tools/validate.mjs */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(fs.readFileSync(path.join(root, "pages.json"), "utf8"));
const pages = config.pages.map((page) => page.slug || "index.html");
const problems = [];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function checkLocalReference(page, reference) {
  if (!reference) return;
  const value = reference.trim();
  if (!value || value.startsWith("#") || value.startsWith("//")) return;
  if (/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(value)) return;
  const clean = value.split("#")[0].split("?")[0];
  if (!clean || clean === ".") return;
  const target = path.resolve(root, path.dirname(page), clean);
  if (!fs.existsSync(target)) problems.push(`${page}: missing local reference ${value}`);
}

for (const page of pages) {
  const html = read(page);

  for (const match of html.matchAll(/\b(?:href|src|poster|action)\s*=\s*"([^"]*)"/gi)) {
    checkLocalReference(page, match[1]);
  }
  for (const match of html.matchAll(/\bsrcset\s*=\s*"([^"]*)"/gi)) {
    match[1].split(",").forEach((part) => checkLocalReference(page, part.trim().split(/\s+/)[0]));
  }

  const ids = [...html.matchAll(/\bid\s*=\s*"([^"]+)"/gi)].map((m) => m[1]);
  const duplicateIds = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (duplicateIds.length) problems.push(`${page}: duplicate ids ${[...new Set(duplicateIds)].join(", ")}`);

  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (h1Count !== 1) problems.push(`${page}: expected exactly one h1, found ${h1Count}`);

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt\s*=\s*"[^"]*"/i.test(match[0])) problems.push(`${page}: image without alt attribute`);
  }

  if (!/<title>[^<]+<\/title>/i.test(html)) problems.push(`${page}: missing title`);
  if (!/<meta\s+name="description"\s+content="[^"]+"/i.test(html)) problems.push(`${page}: missing description`);
  if (!/<link\s+rel="canonical"\s+href="[^"]+"/i.test(html)) problems.push(`${page}: missing canonical`);
  if (!/<html\s+lang="en"/i.test(html)) problems.push(`${page}: missing html lang`);
}

// Load the dictionaries.
function loadDictionary(file) {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(read(file), sandbox, { filename: file });
  return sandbox.window.TTE_STRINGS;
}

const en = loadDictionary("assets/js/lang/en.js").en;
const enKeys = Object.keys(en);

for (const page of pages) {
  const html = read(page);
  for (const match of html.matchAll(/\bdata-i18n(?:-html|-placeholder|-aria|-title)?\s*=\s*"([^"]+)"/gi)) {
    if (!Object.prototype.hasOwnProperty.call(en, match[1])) {
      problems.push(`${page}: unknown i18n key ${match[1]}`);
    }
  }
}

const languageFiles = ["fr", "ar", "es"];
for (const language of languageFiles) {
  const file = `assets/js/lang/${language}.js`;
  if (!fs.existsSync(path.join(root, file))) {
    problems.push(`missing language file ${file}`);
    continue;
  }
  let dictionary;
  try {
    dictionary = loadDictionary(file)[language];
  } catch (error) {
    problems.push(`${file}: could not execute (${error.message})`);
    continue;
  }
  if (!dictionary) {
    problems.push(`${file}: missing window.TTE_STRINGS.${language}`);
    continue;
  }
  const keys = Object.keys(dictionary);
  const missing = enKeys.filter((key) => !Object.prototype.hasOwnProperty.call(dictionary, key));
  const extra = keys.filter((key) => !Object.prototype.hasOwnProperty.call(en, key));
  if (missing.length) problems.push(`${file}: missing ${missing.length} keys (${missing.slice(0, 6).join(", ")}…)`);
  if (extra.length) problems.push(`${file}: ${extra.length} extra keys (${extra.slice(0, 6).join(", ")}…)`);
  if (keys.length !== enKeys.length) problems.push(`${file}: ${keys.length} keys, expected ${enKeys.length}`);

  for (const key of enKeys) {
    if (!dictionary[key]) continue;
    const source = String(en[key]);
    const target = String(dictionary[key]);
    const sourceVars = (source.match(/\{\w+\}/g) || []).sort().join(",");
    const targetVars = (target.match(/\{\w+\}/g) || []).sort().join(",");
    if (sourceVars !== targetVars) problems.push(`${file}: placeholder mismatch in ${key}`);
    const sourceTags = (source.match(/<\/?[a-z][^>]*>/gi) || []).map((tag) => tag.toLowerCase()).sort().join(",");
    const targetTags = (target.match(/<\/?[a-z][^>]*>/gi) || []).map((tag) => tag.toLowerCase()).sort().join(",");
    if (sourceTags !== targetTags) problems.push(`${file}: HTML tag mismatch in ${key}`);
  }
}

if (problems.length) {
  console.error(`Validation found ${problems.length} problem(s):`);
  problems.forEach((problem) => console.error(` - ${problem}`));
  process.exitCode = 1;
} else {
  console.log(`Validation passed: ${pages.length} pages, ${enKeys.length} English keys, 3 translation files.`);
}
