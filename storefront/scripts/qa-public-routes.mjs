import { chromium } from 'playwright';
const browser = await chromium.launch({headless:true});
const page = await browser.newPage({viewport:{width:1280,height:900},locale:'fa-IR'});
const errors=[]; page.on('console',m=>{if(m.type()==='error') errors.push('console: '+m.text())}); page.on('pageerror',e=>errors.push('page: '+e.message));
const routes=['/','/shop','/lookbook','/guide','/about','/login','/account','/cart','/wishlist','/admin'];
const results=[];
for (const route of routes) { try { const r=await page.goto('https://originaly-next-storefront.netlify.app'+route,{waitUntil:'domcontentloaded',timeout:15000}); await page.waitForTimeout(1500); results.push({route,status:r?.status(),title:await page.title(),h1:await page.locator('h1').first().textContent().catch(()=>null),body:(await page.locator('body').innerText()).slice(0,180),url:page.url()}); } catch(e){results.push({route,error:e.message})} }
console.log(JSON.stringify({results,errors},null,2)); await browser.close();
