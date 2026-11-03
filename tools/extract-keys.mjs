import fs from "node:fs";

const file = process.argv[2] || "assets/js/lang/en.js";
const src = fs.readFileSync(file, "utf8");
const keys = [...src.matchAll(/^\s*"([^"]+)"\s*:/gm)].map((m) => m[1]);
console.log(keys.join("\n"));
console.log("COUNT " + keys.length);
