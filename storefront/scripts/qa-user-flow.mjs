import { chromium } from 'playwright';
const b=await chromium.launch({headless:true}); const c=await b.newContext({viewport:{width:390,height:844},locale:'fa-IR'}); const p=await c.newPage(); const errors=[]; p.on('console',m=>{if(m.type()==='error') errors.push(m.text())}); p.on('pageerror',e=>errors.push(e.message));
await p.goto('https://originaly-next-storefront.netlify.app/?flow='+Date.now(),{waitUntil:'domcontentloaded',timeout:15000}); await p.waitForTimeout(1200);
const steps=[]; for(const href of ['/shop','/lookbook','/guide','/about','/wishlist','/cart','/login']){const link=p.locator(`a[href^="${href}"]`).first(); if(await link.count()){await link.click(); await p.waitForTimeout(900); steps.push({href,url:p.url(),h1:await p.locator('h1').first().textContent().catch(()=>null),bad:(await p.locator('body').innerText()).includes('Something went wrong')}); await p.goBack(); await p.waitForTimeout(700)}}
console.log(JSON.stringify({steps,errors},null,2)); await b.close();
