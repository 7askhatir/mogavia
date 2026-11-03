import fs from "node:fs";
import path from "node:path";

const dir = path.resolve("assets", "img");
function size(buf) {
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  return null;
}
const out = {};
for (const f of fs.readdirSync(dir).filter(f => f.endsWith(".jpg")).sort()) {
  const s = size(fs.readFileSync(path.join(dir, f)));
  out[f] = s;
  console.log(f, s ? `${s.w}x${s.h}` : "?");
}
fs.writeFileSync(path.resolve("tools", "image-sizes.json"), JSON.stringify(out, null, 2));
