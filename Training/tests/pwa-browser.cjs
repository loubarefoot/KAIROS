/* Local GitHub-Pages-path regression. No deployment or project dependencies. */
const {chromium}=require(process.env.KAIROS_PLAYWRIGHT_MODULE || 'playwright-core');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{execFileSync}=require('node:child_process');
(async()=>{
 const repo=path.resolve(__dirname,'../..'),profile=fs.mkdtempSync(path.join(os.tmpdir(),'kairos-pwa-'));
 const prefix='/KAIROS/Training/',weightPrefix='/KAIROS/Weight/';
 const files=['index.html','styles.css','data.js','library.js','management.js','session.js','navigation.js','app.js','sw.js','diagnostics.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];
 let phase='old',context;
 const old=new Map(files.filter(f=>!f.includes('manifest')&&!f.startsWith('icons/')&&f!=='diagnostics.js').map(f=>[f,execFileSync('git',['show','d05f7541839fda3adc26e87c323c15cbb77f543b:Training/'+f],{cwd:repo})]));
 const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname==='/KAIROS/Training'){res.writeHead(301,{Location:prefix});res.end();return;}
  if(pathname===weightPrefix||pathname===weightPrefix+'index.html'){res.setHeader('Content-Type','text/html');res.end(fs.readFileSync(path.join(repo,'Weight/index.html')));return;}
  if(!pathname.startsWith(prefix)){res.writeHead(404);res.end();return;}
  const name=pathname.slice(prefix.length)||'index.html';
  if(!files.includes(name)||(phase==='old'&&!old.has(name))||(phase==='missing-icon'&&name==='icons/icon-512.png')){res.writeHead(404);res.end();return;}
  const body=phase==='old'?old.get(name):fs.readFileSync(path.join(repo,'Training',name));
  const type=name.endsWith('.png')?'image/png':name.endsWith('.webmanifest')?'application/manifest+json':name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html';
  res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});res.end(body);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+server.address().port,url=origin+prefix;
 const launch=()=>chromium.launchPersistentContext(profile,{executablePath:process.env.KAIROS_CHROMIUM_PATH||'/usr/bin/chromium',headless:true,viewport:{width:390,height:844},args:['--no-sandbox']});
 const update=page=>page.evaluate(async()=>{
  const reg=await navigator.serviceWorker.getRegistration();await reg.update();
  if(reg.installing)await new Promise(resolve=>{const worker=reg.installing;const done=()=>{if(['installed','redundant'].includes(worker.state))resolve();};worker.addEventListener('statechange',done);done();});
 });
 try{
  context=await launch();const page=context.pages()[0]||await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await page.evaluate(()=>{localStorage.setItem('weightEntries','[{"date":"2026-10-10","weight":79}]');localStorage.setItem('appSettings','{"name":"Before","height":180,"goal":75}');});
  await page.locator('[data-tab=settings]').click();await page.locator('[data-view=plans]:visible').click();await page.locator('#new-plan').click();
  await page.locator('#plan-form [name=name]').fill('PWA Test');await page.locator('#plan-form [type=submit]').click();
  await page.locator('[data-edit-plan]').first().click();
  for(let i=0;i<3;i++)await page.locator('#add-exercise-form [type=submit]').click();
  await page.locator('[data-tab=training]').click();await page.locator('[data-start-plan]:visible').first().click();
  await page.locator('#edit-training-weight').click();await page.locator('#training-weight-form [name=weight]').fill('17,5');await page.locator('#training-weight-form [type=submit]').click();await page.locator('#complete-exercise').click();await page.locator('#skip-exercise').click();
  const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('kairos.training.state')));
  const before=await page.evaluate(()=>caches.keys());assert.equal(before.length,1);assert.ok(before[0].includes(':v2:'));
  await page.evaluate(async()=>{const cache=await caches.open('weight-regression-cache');await cache.put('/KAIROS/Weight/sentinel',new Response('keep'));});
  phase='missing-icon';await update(page);console.log('Checked update phase:',phase);
  assert.deepEqual(await page.evaluate(()=>caches.keys()),[...before,'weight-regression-cache']);
  assert.equal(await page.evaluate(async()=>!!(await navigator.serviceWorker.getRegistration()).waiting),false);
  phase='current';await update(page);console.log('Checked update phase:',phase);
  assert.equal(await page.evaluate(async()=>!!(await navigator.serviceWorker.getRegistration()).waiting),true);
  assert.ok(await page.evaluate(async()=>!!(await caches.keys()).find(k=>k.includes(':v2:'))));
  assert.equal(await page.locator('link[rel=manifest]').count(),0); // Old page stays on v2 until closed.
  await page.close();const current=await context.newPage();current.on('pageerror',e=>errors.push(e.message));await current.goto(url);
  await current.waitForFunction(async()=>!(await navigator.serviceWorker.getRegistration()).waiting);
  await current.reload();await current.locator('#view-active').waitFor({state:'visible'});
  assert.equal(await current.evaluate(()=>JSON.parse(localStorage.getItem('kairos.training.state')).activeSession.startedAt),state.activeSession.startedAt);
  assert.deepEqual(await current.evaluate(()=>JSON.parse(localStorage.getItem('kairos.training.state')).activeSession.exercises.map(e=>e.status)),state.activeSession.exercises.map(e=>e.status));
  const registration=await current.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();return{scope:r.scope,script:r.active.scriptURL};});
  assert.deepEqual(registration,{scope:url,script:url+'sw.js'});
  const cdp=await context.newCDPSession(current);let manifest;
  for(let attempt=0;attempt<20;attempt++){manifest=await cdp.send('Page.getAppManifest');if(manifest.data)break;await current.waitForTimeout(100);}
  assert.ok(manifest.data,'Browser manifest must finish loading');
  assert.deepEqual(manifest.errors,[]);const parsed=JSON.parse(manifest.data);assert.equal(parsed.id,'/KAIROS/Training/');assert.equal(new URL(parsed.start_url,manifest.url).href,url);assert.equal(parsed.display,'standalone');
  assert.equal(await current.locator('meta[name=apple-mobile-web-app-capable]').getAttribute('content'),'yes');
  const cached=await current.evaluate(async()=>{const names=await caches.keys(),name=names.find(k=>k.includes(':v6:'));const cache=await caches.open(name);return{names,urls:(await cache.keys()).map(r=>r.url)};});
  assert.equal(cached.urls.length,13);assert.ok(cached.urls.every(u=>u.startsWith(url)));assert.ok(!cached.names.some(k=>k.includes(':v2:')));assert.ok(cached.names.includes('weight-regression-cache'));
  for(const width of [320,390,844,1280]){await current.setViewportSize({width,height:844});assert.ok(await current.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  // Network-offline requests must be served by the worker, including new binary resources.
  await context.setOffline(true);await current.reload();assert.ok(await current.locator('#view-active').isVisible());
  for(const name of ['manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png']){
   const result=await current.evaluate(async name=>{const r=await fetch(name);return{ok:r.ok,size:(await r.arrayBuffer()).byteLength,type:r.headers.get('content-type')};},name);assert.ok(result.ok&&result.size>0);assert.ok(result.type.includes(name.endsWith('.png')?'image/png':'manifest+json'));
  }
  await current.locator('#complete-exercise').click();await current.locator('#finish-training').click();await current.locator('#confirm-dialog [value=delete]').click();await current.locator('#view-summary').waitFor({state:'visible'});
  await current.locator('[data-tab=settings]').click();await current.locator('[data-view=backup]').click();
  const downloadPromise=current.waitForEvent('download');await current.locator('#export-training').click();const download=await downloadPromise;const backup=fs.readFileSync(await download.path());
  assert.equal(JSON.parse(backup).completedSessions.length,1);
  await current.locator('#import-training').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:backup});await current.locator('#confirm-dialog [value=delete]').click();await current.waitForFunction(()=>document.getElementById('backup-status').textContent.includes('importiert'));
  assert.equal(await current.evaluate(()=>localStorage.getItem('weightEntries')),'[{"date":"2026-10-10","weight":79}]');assert.equal(await current.evaluate(()=>localStorage.getItem('appSettings')),'{"name":"Before","height":180,"goal":75}');
  const saved=await current.evaluate(()=>localStorage.getItem('kairos.training.state'));
  assert.deepEqual(errors,[]);await context.close();context=await launch();await context.setOffline(true);
  const restarted=context.pages()[0]||await context.newPage();await restarted.goto(url);await restarted.locator('#view-backup').waitFor({state:'visible'});assert.equal(await restarted.evaluate(()=>JSON.parse(localStorage.getItem('kairos.training.state')).completedSessions.length),1);
  console.log('PASS: /KAIROS/Training/, v2 -> v6 waiting/activation, incomplete icon update preserved, manifest identity, 13 cached resources, 4 mobile widths, offline finish/export/import, full browser-process offline restart, Weight data/cache preserved.');
  await context.setOffline(false);
  const chartPath=process.env.KAIROS_CHART_PATH;
  if(!chartPath)throw new Error('Set KAIROS_CHART_PATH to the unmodified Chart.js 4.4.1 file for Weight regression.');
  await context.route('https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js',route=>route.fulfill({path:chartPath,contentType:'text/javascript'}));
  const beforeWeight=await restarted.evaluate(()=>localStorage.getItem('kairos.training.state'));
  const weight=await context.newPage(),weightErrors=[];weight.on('pageerror',e=>weightErrors.push(e.message));await weight.goto(origin+weightPrefix);
  assert.equal(await weight.evaluate(()=>navigator.serviceWorker.controller),null);assert.equal(await weight.evaluate(()=>typeof Chart),'function');
  await weight.locator('#weightInput').fill('78.4');await weight.locator('#saveBtn').click();assert.match(await weight.locator('#currentValue').innerText(),/78.4/);await weight.reload();assert.match(await weight.locator('#currentValue').innerText(),/78.4/);
  await weight.locator('#weightInput').fill('10');await weight.locator('#saveBtn').click();assert.match(await weight.locator('#errorMsg').innerText(),/plausibles/);
  await weight.locator('[data-tab=settings]').click();await weight.locator('#setName').fill('Regression');await weight.locator('#setHeight').fill('180');await weight.locator('#setGoal').fill('75');await weight.locator('#saveSettingsBtn').click();assert.equal(await weight.locator('#setMsg').innerText(),'Gespeichert.');
  await weight.locator('[data-tab=stats]').click();assert.match(await weight.locator('#goalBox').innerText(),/75/);assert.ok((await weight.locator('#tiles').innerText()).length>0);assert.deepEqual(weightErrors,[]);
  // Opening Training updates lifecycle settings only; Weight must not change its stored document.
  assert.equal(await weight.evaluate(()=>localStorage.getItem('kairos.training.state')),beforeWeight);
  assert.equal(JSON.parse(saved).completedSessions.length,1);
  console.log('PASS: Weight same-origin regression: no Training worker controller, Chart.js, save/history/reload, invalid input, settings/statistics; Training data unchanged by Weight.');
  await context.close();context=null;
  const freshBrowser=await chromium.launch({executablePath:process.env.KAIROS_CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  try{
   const fresh=await freshBrowser.newContext(),first=await fresh.newPage();
   await first.goto(origin+'/KAIROS/Training');assert.equal(first.url(),url);
   await first.evaluate(()=>navigator.serviceWorker.ready);await first.waitForFunction(()=>!!navigator.serviceWorker.controller);
   assert.equal(await first.locator('#offline-status').isHidden(),true);
   await fresh.setOffline(true);await first.goto(url+'index.html?pwa=1');await first.locator('#view-start').waitFor({state:'visible'});
   assert.equal(await first.evaluate(()=>JSON.parse(localStorage.getItem('kairos.training.state')).exercises.length),52);
   assert.equal(await first.evaluate(async()=>{const name=(await caches.keys())[0];return(await(await caches.open(name)).keys()).length;}),13);
   console.log('PASS: fresh PWA installation, directory redirect, index.html/query offline entry and full 13-resource cache.');
  }finally{await freshBrowser.close();}

 }finally{if(context)await context.close();await new Promise(resolve=>server.close(resolve));fs.rmSync(profile,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
