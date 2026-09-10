import fs from 'node:fs';
const p='.vercel/output/static/assets/index-g-nQ7UrH.js';
let s=fs.readFileSync(p,'utf8');
const old='(0,Vf.hydrateRoot)(document,';
if(!s.includes(old)) throw new Error('hydrate bootstrap pattern not found');
s=s.replace(old,'(0,Vf.createRoot)(document).render(');
fs.writeFileSync(p,s);
console.log('patched client bootstrap');
