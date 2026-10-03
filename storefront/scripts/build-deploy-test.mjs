import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
const root = process.cwd();
execFileSync("npm", ["run", "build"], { stdio: "inherit", cwd: root });
execFileSync("npm", ["run", "preview:restart"], { stdio: "inherit", cwd: root });
let html = "";
for (let i = 0; i < 60; i++) {
  try { html = String(execFileSync("curl", ["-fsS", "http://127.0.0.1:8081/"], { cwd: root })); break; } catch { await new Promise((r) => setTimeout(r, 500)); }
}
if (!html) throw new Error("production preview did not become ready");
writeFileSync(".vercel/output/static/index.html", html);
execFileSync("node", ["scripts/prepare-netlify-static.mjs"], { stdio: "inherit", cwd: root });
if (readFileSync(".vercel/output/static/index.html", "utf8").includes("virtual:tanstack-start-dev-client-entry")) throw new Error("dev client entry remains");
console.log("production preview ready and static fallback prepared");
