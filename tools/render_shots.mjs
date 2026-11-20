import { chromium } from '/home/hatch/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import fs from 'node:fs/promises';
const repo='/home/hatch/workspace/tools/makefun/agent3-coarena/gta6-cover-art-01-a3';
const specs=JSON.parse(await fs.readFile(repo+'/shots.json','utf8'));
const browser=await chromium.launch({headless:true,executablePath:'/home/hatch/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome',args:['--no-sandbox','--disable-dev-shm-usage']});
for(const spec of specs){
 const page=await browser.newPage({viewport:{width:spec.w,height:spec.h},deviceScaleFactor:1});
 page.on('request',req=>{if(!req.url().startsWith('http://127.0.0.1')&&!req.url().startsWith('http://localhost')&&!req.url().startsWith('data:')&&!req.url().startsWith('blob:'))console.error('EXTERNAL',req.url());});
 await page.goto('http://127.0.0.1:8081/'+spec.query,{waitUntil:'networkidle'}); await page.waitForFunction(()=>window.__AFTERGLOW_READY===true,{timeout:15000}); await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({path:repo+'/screenshots/'+spec.name,fullPage:false}); console.log('saved',spec.name);
 await page.close();
}
await browser.close();
