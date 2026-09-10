import fs from 'node:fs';
const out='.vercel/output/static';
const old='index-g-nQ7UrH.js';
const fresh='index-final-20260910.js';
fs.copyFileSync(`${out}/assets/${old}`,`${out}/assets/${fresh}`);
const p=`${out}/index.html`; fs.writeFileSync(p,fs.readFileSync(p,'utf8').replaceAll(`/assets/${old}`,`/assets/${fresh}`));
console.log(fresh);
