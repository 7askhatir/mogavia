import fs from "node:fs";
import vm from "node:vm";

function load(file, language) {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(file, "utf8"), sandbox, { filename: file });
  return sandbox.window.TTE_STRINGS[language];
}

const en = load("assets/js/lang/en.js", "en");
for (const language of ["fr", "ar", "es"]) {
  const dict = load(`assets/js/lang/${language}.js`, language);
  const same = Object.keys(en).filter((key) => en[key] === dict[key]);
  console.log(`${language}: ${same.length} identical values`);
  same.forEach((key) => console.log(`  ${key}: ${JSON.stringify(en[key]).slice(0, 90)}`));
}
