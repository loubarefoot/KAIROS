const {chromium}=require(process.env.KAIROS_PLAYWRIGHT_MODULE||'playwright-core');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 let workerUpdate=false;
 const root=path.resolve(__dirname,'..'),files=fs.readdirSync(root).filter(name=>/\.(js|css|html|webmanifest)$/.test(name));
 const server=http.createServer((req,res)=>{
  const name=new URL(req.url,'http://localhost').pathname.replace(/^\/KAIROS\/Training\//,'')||'index.html';
  if(!files.includes(name)&&!['icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'].includes(name)){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.png')?'image/png':name.endsWith('.webmanifest')?'application/manifest+json':'text/html');res.end(name==='sw.js'&&workerUpdate?fs.readFileSync(path.join(root,name),'utf8')+'\n// waiting protocol test\n':fs.readFileSync(path.join(root,name)));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.KAIROS_CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),url='http://127.0.0.1:'+server.address().port+'/KAIROS/Training/';
  const errors=[];page.on('pageerror',e=>errors.push(e.message));let externalRequests=0;
  page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:'))externalRequests++;});
  await page.goto(url);await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await page.locator('[data-tab=settings]').click();const state=await page.evaluate(()=>localStorage.getItem('kairos.training.state'));
  const navBefore=await page.locator('.tabbar').boundingBox();
  await page.locator('#diagnostics-panel summary').click();await page.waitForFunction(()=>document.getElementById('diagnostics-status').textContent.startsWith('Aktualisiert'));
  const read=async()=>JSON.parse(await page.locator('#diagnostics-report').inputValue());
  let data=await read();assert.match(data.diagnosticBuildFromLoadedJS,/training-diagnostics-1/);
  assert.equal(data.stylesheet.versionFromLoadedRules,'training-diagnostics-1');assert.match(data.stylesheet.loadedCSSOM_SHA256,/^[a-f0-9]{64}$/);
  assert.equal(data.serviceWorker.controller.version,'v6');assert.equal(data.serviceWorker.registrationActive.version,'v6');assert.equal(data.serviceWorker.waiting.present,false);
  assert.equal(data.serviceWorker.controller.expectedStylesheetFileSHA256,require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,'styles.css'))).digest('hex'));
  assert.equal(data.viewport.innerHeight,844);assert.equal(data.navigation.height,80);assert.equal(data.standalone.media,false);
  workerUpdate=true;
  await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update();if(r.installing)await new Promise(resolve=>{const w=r.installing;const check=()=>{if(['installed','redundant'].includes(w.state))resolve();};w.addEventListener('statechange',check);check();});});
  await page.locator('#diagnostics-refresh').click();await page.waitForFunction(()=>document.getElementById('diagnostics-status').textContent.startsWith('Aktualisiert'));
  data=await read();assert.equal(data.serviceWorker.waiting.present,true);assert.equal(data.serviceWorker.waiting.version,'v6');assert.equal(data.serviceWorker.waiting.state,'installed');

  await page.locator('#diagnostics-keyboard').fill('not exported');
  await page.evaluate(()=>Object.defineProperty(visualViewport,'height',{configurable:true,get:()=>300}));
  await page.locator('#diagnostics-refresh').click();await page.waitForFunction(()=>document.getElementById('diagnostics-status').textContent.startsWith('Aktualisiert'));
  data=await read();assert.equal(data.viewport.visualHeight,300);assert.match(data.measurement,/vor Fokus/);assert.equal(data.focus,'#diagnostics-keyboard');assert.ok(!(await page.locator('#diagnostics-report').inputValue()).includes('not exported'));
  await page.evaluate(()=>delete visualViewport.height);
  await page.evaluate(()=>window.scrollTo(0,500));await page.waitForFunction(()=>window.scrollY>0);
  await page.locator('#diagnostics-refresh').click();await page.waitForFunction(()=>document.getElementById('diagnostics-status').textContent.startsWith('Aktualisiert'));
  data=await read();assert.equal(typeof data.scroll.observedScrollingContainers,'object');
  await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.copiedDiagnosis=value;}}});});
  await page.locator('#diagnostics-copy').click();assert.equal(await page.evaluate(()=>window.copiedDiagnosis),await page.locator('#diagnostics-report').inputValue());
  await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined});});
  await page.locator('#diagnostics-copy').click();assert.match(await page.locator('#diagnostics-status').innerText(),/Auswahlmenü/);
  assert.equal(await page.locator('#diagnostics-report').evaluate(e=>e.selectionEnd-e.selectionStart), (await page.locator('#diagnostics-report').inputValue()).length);
  // A silent old controller must never be reported as the new worker's version.
  await page.evaluate(()=>Object.defineProperty(navigator.serviceWorker,'controller',{configurable:true,value:{scriptURL:location.href+'sw.js',state:'activated',postMessage(){}}}));
  await page.locator('#diagnostics-refresh').click();await page.waitForFunction(()=>document.getElementById('diagnostics-status').textContent.startsWith('Aktualisiert'));
  data=await read();assert.equal(data.serviceWorker.controller.version,'unbekannt');assert.equal(data.serviceWorker.registrationActive.version,'v6');
  assert.equal(await page.evaluate(()=>localStorage.getItem('kairos.training.state')),state);
  assert.deepEqual(await page.locator('.tabbar').boundingBox(),navBefore);assert.equal(externalRequests,0);assert.deepEqual(errors,[]);
  await page.evaluate(()=>delete navigator.serviceWorker.controller);await context.setOffline(true);await page.reload();
  await page.locator('#diagnostics-panel summary').click();await page.waitForFunction(()=>document.getElementById('diagnostics-status').textContent.startsWith('Aktualisiert'));
  assert.equal((await read()).serviceWorker.controller.version,'v6');
  await context.close();
  const blocked=await browser.newContext({serviceWorkers:'block'}),noSW=await blocked.newPage();await noSW.goto(url);await noSW.locator('[data-tab=settings]').click();await noSW.locator('#diagnostics-panel summary').click();
  await noSW.waitForFunction(()=>document.getElementById('diagnostics-status').textContent.startsWith('Aktualisiert'));
  assert.equal(JSON.parse(await noSW.locator('#diagnostics-report').inputValue()).serviceWorker.controller.version,'unbekannt');await blocked.close();
  console.log('PASS: actual controller and waiting worker v6, silent controller unknown, CSSOM marker/hash, viewport/nav/scroll/focus, copy and fallback, offline diagnosis, unsupported worker, no external requests or data changes.');
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
