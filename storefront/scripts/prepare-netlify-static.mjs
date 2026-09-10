import fs from "node:fs";
const out = ".vercel/output/static";
const html = fs.readFileSync(`${out}/index.html`, "utf8");
const entry = fs.readdirSync(`${out}/assets`).find((name) => /^index-.*\.js$/.test(name));
if (!entry) throw new Error("client entry bundle not found");
const cleaned = html
  .replaceAll("/@id/virtual:tanstack-start-dev-client-entry", `/assets/${entry}`)
  .replace(/<script async src="\/\.netlify\/scripts\/hud[^>]+><\/script>/g, "");
fs.writeFileSync(`${out}/index.html`, cleaned);
fs.writeFileSync(`${out}/_redirects`, "/* /index.html 200\n");
console.log(`prepared ${entry}`);
