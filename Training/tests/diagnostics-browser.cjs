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
  const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),url='http://127.0.0.1:'+server.address().port+'/KAIROS/Training/?diagnostics=1';
  const errors=[];page.on('pageerror',e=>errors.push(e.message));let externalRequests=0;
  page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:'))externalRequests++;});
  await page.goto(url);await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await page.locator('[data-tab=settings]').click();const state=await page.evaluate(()=>localStorage.getItem('kairos.training.state'));
  const navBefore=await page.locator('.tabbar').boundingBox();
  assert.equal(await page.locator('#diagnostics-panel,#diagnostics-keyboard,#diagnostics-refresh,#diagnostics-copy,#diagnostics-report,#diagnostics-status').count(),0);
  const open=async()=>{await page.locator('#diagnostics-live').click();await page.waitForFunction(()=>document.getElementById('diagnostics-live-status').textContent.startsWith('Aktualisiert'));};
  const close=async()=>{await page.locator('#diagnostics-live-close').click();};
  const read=async()=>JSON.parse(await page.locator('#diagnostics-live-report').inputValue());
  await open();
  let data=await read();assert.match(data.diagnosticBuildFromLoadedJS,/training-compact-diagnostics-2/);
  assert.equal(data.visibleSection.id,'view-settings');
  assert.equal(data.stylesheet.versionFromLoadedRules,'training-minimum-height-1');assert.match(data.stylesheet.loadedCSSOM_SHA256,/^[a-f0-9]{64}$/);
  assert.equal(data.serviceWorker.controller.version,'v24');assert.equal(data.serviceWorker.registrationActive.version,'v24');assert.equal(data.serviceWorker.waiting.present,false);
  assert.equal(data.serviceWorker.controller.expectedStylesheetFileSHA256,require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,'styles.css'))).digest('hex'));
  assert.equal(data.viewport.innerHeight,844);assert.equal(data.navigation.height,80);assert.equal(data.standalone.media,false);
  await close();workerUpdate=true;
  await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update();if(r.installing)await new Promise(resolve=>{const w=r.installing;const check=()=>{if(['installed','redundant'].includes(w.state))resolve();};w.addEventListener('statechange',check);check();});});
  await open();data=await read();assert.equal(data.serviceWorker.waiting.present,true);assert.equal(data.serviceWorker.waiting.version,'v24');assert.equal(data.serviceWorker.waiting.state,'installed');await close();
  // Input focus/value exclusion remains tested without retaining a production keyboard probe.
  await page.evaluate(()=>{const input=document.createElement('input');input.id='test-keyboard';input.value='not exported';document.getElementById('view-settings').append(input);input.focus();Object.defineProperty(visualViewport,'height',{configurable:true,get:()=>300});visualViewport.dispatchEvent(new Event('resize'));});
  await open();data=await read();assert.equal(data.viewport.visualHeight,300);assert.match(data.measurement,/vor Fokus/);assert.equal(data.focus,'#test-keyboard');assert.ok(!(await page.locator('#diagnostics-live-report').inputValue()).includes('not exported'));await close();
  await page.evaluate(()=>{delete visualViewport.height;document.getElementById('test-keyboard').remove();window.scrollTo(0,80);});await page.waitForFunction(()=>window.scrollY>0);
  await open();data=await read();assert.equal(typeof data.scroll.observedScrollingContainers,'object');
  await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.copiedDiagnosis=value;}}});});
  await page.locator('#diagnostics-live-copy').click();assert.equal(await page.evaluate(()=>window.copiedDiagnosis),await page.locator('#diagnostics-live-report').inputValue());
  await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined});});
  await page.locator('#diagnostics-live-copy').click();assert.match(await page.locator('#diagnostics-live-status').innerText(),/Auswahlmenü/);
  assert.equal(await page.locator('#diagnostics-live-report').evaluate(e=>e.selectionEnd-e.selectionStart),(await page.locator('#diagnostics-live-report').inputValue()).length);await close();
  // A silent old controller must never be reported as the new worker's version.
  await page.evaluate(()=>Object.defineProperty(navigator.serviceWorker,'controller',{configurable:true,value:{scriptURL:location.href+'sw.js',state:'activated',postMessage(){}}}));
  await open();data=await read();assert.equal(data.serviceWorker.controller.version,'unbekannt');assert.equal(data.serviceWorker.registrationActive.version,'v24');await close();
  assert.equal(await page.evaluate(()=>localStorage.getItem('kairos.training.state')),state);
  assert.deepEqual(await page.locator('.tabbar').boundingBox(),navBefore);assert.equal(externalRequests,0);assert.deepEqual(errors,[]);
  await page.evaluate(()=>delete navigator.serviceWorker.controller);await context.setOffline(true);await page.reload();
  await page.locator('[data-tab=settings]').click();await open();assert.equal((await read()).serviceWorker.controller.version,'v24');await close();

  await context.setOffline(false);
  // Direct measurements must identify the visible view, not the settings panel.
  await page.reload();await page.locator('#view-start').waitFor({state:'visible'});
  await page.locator('#diagnostics-live').click();await page.waitForFunction(()=>document.getElementById('diagnostics-live-status').textContent.startsWith('Aktualisiert'));
  let live=JSON.parse(await page.locator('#diagnostics-live-report').inputValue());assert.equal(live.visibleSection.id,'view-start');
  assert.ok(live.documentHeight>=live.viewport.innerHeight+80);
  assert.equal(await page.locator('#temporary-start-height-test').count(),0);
  await page.locator('#diagnostics-live-close').click();
  // The trigger reserves real space; native close/copy stay outside the scroll body.
  for (const viewport of [{width:320,height:568},{width:390,height:797},{width:390,height:844},{width:844,height:390}]) {
    await page.setViewportSize(viewport);
    const trigger=await page.locator('#diagnostics-live').boundingBox(),heading=await page.locator('#title-start').boundingBox();
    assert.ok(trigger.y+trigger.height<=heading.y);
    assert.equal(await page.locator('#main').evaluate(e=>getComputedStyle(e).overflowY),'visible');
    assert.equal(await page.locator('#scrollArea').evaluate(e=>getComputedStyle(e).overflowY),'auto');
    assert.equal(await page.locator('#scrollArea').evaluate(e=>getComputedStyle(e).paddingBottom),'80px');
    await page.locator('#diagnostics-live').click();
    await page.waitForFunction(()=>document.getElementById('diagnostics-live-status').textContent.startsWith('Aktualisiert'));
    for (const scroll of [0,100000]) {
      await page.locator('.diagnostics-dialog-body').evaluate((e,value)=>{e.scrollTop=value;},scroll);
      const dialog=await page.locator('#diagnostics-live-dialog').boundingBox();
      for (const id of ['diagnostics-live-close','diagnostics-live-copy']) {
        const box=await page.locator('#'+id).boundingBox();
        assert.ok(box.y>=dialog.y && box.y+box.height<=dialog.y+dialog.height);
        assert.ok(box.y>=0 && box.y+box.height<=viewport.height);
      }
    }
    await page.locator('#diagnostics-live-report').focus();
    await page.locator('#diagnostics-live-close').click();
    assert.equal(await page.locator('#diagnostics-live-dialog').evaluate(e=>e.open),false);
    await page.locator('#diagnostics-live').click();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#diagnostics-live-dialog').evaluate(e=>e.open),false);
  }
  await page.setViewportSize({width:390,height:844});
  console.log('PASS: separate Weight-style scroll wrapper, no trigger overlap, native close/copy reachable across four mobile viewports, textarea focus and Escape close.');
  await page.locator('[data-tab=training]').click();
  assert.equal(await page.locator('#temporary-start-height-test').count(),0);
  await page.evaluate(()=>{const filler=document.createElement('div');filler.id='test-long-training';filler.style.height='1800px';document.getElementById('view-start').append(filler);window.scrollTo(0,500);});
  await page.waitForFunction(()=>scrollY>0);await page.waitForTimeout(160);
  await page.locator('#diagnostics-live').click();await page.waitForFunction(()=>document.getElementById('diagnostics-live-status').textContent.startsWith('Aktualisiert'));
  live=JSON.parse(await page.locator('#diagnostics-live-report').inputValue());assert.equal(live.visibleSection.id,'view-start');assert.ok(live.documentHeight>844);assert.ok(live.recentMeasurements.some(x=>x.scroll.windowY>0));
  assert.ok(live.recentMeasurements.some(x=>x.visibleSection.id==='view-start'&&x.measurement.includes('Ansichtswechsel')));
  assert.ok(live.recentMeasurements.some(x=>x.visibleSection.id==='view-start'&&x.measurement.includes('Scroll')));
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.copiedDiagnosis=value;}}}));
  await page.locator('#diagnostics-live-copy').click();assert.equal(await page.evaluate(()=>window.copiedDiagnosis),await page.locator('#diagnostics-live-report').inputValue());
  await page.locator('#diagnostics-live-close').click();await page.evaluate(()=>document.getElementById('test-long-training').remove());
  // New documents start at start; warm/BFCache returns keep settings, long/day returns do not.
  await page.locator('[data-tab=settings]').click();await page.reload();await page.locator('#view-start').waitFor({state:'visible'});
  await page.locator('[data-tab=settings]').click();
  await page.evaluate(()=>{window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));});
  assert.ok(await page.locator('#view-settings').isVisible());
  await page.evaluate(()=>{window.dispatchEvent(new Event('pagehide'));const raw=JSON.parse(localStorage.getItem('kairos.training.state'));raw.settings.lastBackgroundAt=Date.now()-3600000;localStorage.setItem('kairos.training.state',JSON.stringify(raw));window.dispatchEvent(new Event('pageshow'));});
  assert.ok(await page.locator('#view-start').isVisible());
  await page.locator('[data-tab=settings]').click();
  await page.evaluate(()=>{window.dispatchEvent(new Event('pagehide'));const raw=JSON.parse(localStorage.getItem('kairos.training.state'));raw.settings.lastOpenedDay='2020-01-01';localStorage.setItem('kairos.training.state',JSON.stringify(raw));window.dispatchEvent(new Event('pageshow'));});
  assert.ok(await page.locator('#view-start').isVisible());
  await page.evaluate(()=>{const D=KairosTrainingData,s=D.createStore();s.load();s.update(raw=>{const p=D.createPlan({name:'Running',exerciseIds:raw.exercises.slice(0,2).map(e=>e.id)});raw.plans=[p];raw.planOrder=[p.id];});const flow=KairosTrainingSession.create(s,D);flow.start(s.getState().plans[0].id);flow.complete();});
  const running=await page.evaluate(()=>JSON.parse(localStorage.getItem('kairos.training.state')).activeSession);
  await page.reload();await page.locator('#view-active').waitFor({state:'visible'});
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('kairos.training.state')).activeSession),running);
  await page.locator('#diagnostics-live').click();await page.waitForFunction(()=>document.getElementById('diagnostics-live-status').textContent.startsWith('Aktualisiert'));
  assert.equal(JSON.parse(await page.locator('#diagnostics-live-report').inputValue()).visibleSection.id,'view-active');
  await page.locator('#diagnostics-live-close').click();
  assert.deepEqual(errors,[]);
  console.log('PASS: direct start/training/active snapshots, view/scroll history and copy, fresh document, warm BFCache, 60 minutes/day change, active session/time/status preserved.');
  await context.close();
  const blocked=await browser.newContext({serviceWorkers:'block'}),noSW=await blocked.newPage();await noSW.goto(url);await noSW.locator('[data-tab=settings]').click();await noSW.locator('#diagnostics-live').click();
  await noSW.waitForFunction(()=>document.getElementById('diagnostics-live-status').textContent.startsWith('Aktualisiert'));
  assert.equal(JSON.parse(await noSW.locator('#diagnostics-live-report').inputValue()).serviceWorker.controller.version,'unbekannt');await blocked.close();
  console.log('PASS: actual controller and waiting worker v24, silent controller unknown, CSSOM marker/hash, viewport/nav/scroll/focus, copy and fallback, offline diagnosis, unsupported worker, no external requests or data changes.');
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
