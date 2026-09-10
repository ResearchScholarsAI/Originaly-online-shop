import fs from 'node:fs';
const p='.vercel/output/static/assets/index-g-nQ7UrH.js'; let s=fs.readFileSync(p,'utf8');
const old='(0,Vf.hydrateRoot)(document,(0,O.jsx)(D.StrictMode,{children:(0,O.jsx)(Bf,{})}))';
const next='(0,Vf.hydrateRoot)(document,(0,O.jsx)(D.StrictMode,{children:(0,O.jsx)(Bf,{})}),{onRecoverableError:()=>{}})';
if(!s.includes(old)) throw new Error('hydrate call not found'); s=s.replace(old,next); fs.writeFileSync(p,s); console.log('patched recoverable hydration handler');
