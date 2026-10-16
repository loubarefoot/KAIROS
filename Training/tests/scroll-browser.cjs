const {chromium}=require(process.env.KAIROS_PLAYWRIGHT_MODULE||'playwright-core');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
(async()=>{
 const root=path.resolve(__dirname,'..'),base='e6077f32bd214e6238f434fd0bb66f8a756c010a';
 const names=['index.html','styles.css','app.js','data.js','library.js','management.js','navigation.js','session.js','diagnostics.js','manifest.webmanifest'];
 const old=new Map(names.map(n=>[n,execFileSync('git',['show',base+':Training/'+n],{cwd:root})]));
 assert.deepEqual(fs.readFileSync(path.join(root,'styles.css')),old.get('styles.css'),'all CSS byte-identical');
 const trainingHTML=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/^.*(?:href="statistics.css"|src="statistics(?:-ui)?\.js"|data-tab="statistics").*\n/gm,'').replace(/    <section class="view" id="view-statistics"[\s\S]*?    <\/section>\n/,'');
 assert.equal(trainingHTML,old.get('index.html').toString(),'existing training HTML byte-identical after removing statistics additions');
 const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://localhost'),baseline=u.pathname.startsWith('/v22/'),n=u.pathname.replace(/^\/v2[23]\//,'')||'index.html';if(!names.includes(n)&&!['statistics.js','statistics-ui.js','statistics.css'].includes(n)){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',n.endsWith('.js')?'text/javascript':n.endsWith('.css')?'text/css':'text/html');res.end(baseline?old.get(n):fs.readFileSync(path.join(root,n)));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.KAIROS_CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const origin='http://127.0.0.1:'+server.address().port,errors=[],clock=new Date('2026-10-15T10:00:00+02:00').getTime();
  const make=async()=>{const c=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block',timezoneId:'Europe/Berlin'});await c.addInitScript(t=>{Date.now=()=>t;},clock);const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));return p;};
  const before=await make(),page=await make();await before.goto(origin+'/v22/');
  const raw=await before.evaluate(()=>{const D=KairosTrainingData,s=D.createStore();s.load();s.update(v=>{v.plans=Array.from({length:16},(_,i)=>D.createPlan({name:'Training '+(i+1),exerciseIds:v.exercises.slice(0,8).map(e=>e.id)}));v.planOrder=v.plans.map(p=>p.id);v.exercises[0].weightKg=17.5;});const f=KairosTrainingSession.create(s,D);f.start(s.getState().plans[0].id);f.finish(s.getState().activeSession.id);f.start(s.getState().plans[0].id);return localStorage.getItem(D.STORAGE_KEY);});
  await before.reload();await page.goto(origin+'/v23/');await page.evaluate(v=>localStorage.setItem('kairos.training.state',v),raw);await page.reload();
  const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('kairos.training.state'))),original=await state();
  const frames=async p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const bottom=async p=>{await p.evaluate(()=>{document.scrollingElement.scrollTop=document.scrollingElement.scrollHeight;});await frames(p);assert.ok(await p.evaluate(()=>scrollY>0),'source really scrolled');};
  const observeViews=()=>{window.scrollViews=[];window.addEventListener('kairos-training-viewchange',e=>{const read=()=>({view:e.detail.view,document:document.scrollingElement.scrollTop,wrapper:document.querySelector('#scrollArea').scrollTop});window.scrollViews.push(read());requestAnimationFrame(()=>window.scrollViews.push(read()));});};
  await page.addInitScript(observeViews);await page.evaluate(observeViews);
  const go=async(selector,view)=>{await page.evaluate(()=>window.scrollViews=[]);await page.locator(selector).tap();await page.locator('#view-'+view).waitFor({state:'visible'});await frames(page);const samples=await page.evaluate(()=>window.scrollViews);assert.ok(samples.length>=2);for(const sample of samples){assert.equal(sample.view,view);assert.equal(sample.document,0,'document starts at zero before event and next paint');assert.equal(sample.wrapper,0);}assert.equal(await page.evaluate(()=>scrollY),0);};
  // Baseline proof: long active view -> long plan overview retains root scroll in v22.
  await bottom(before);await before.locator('#view-active [data-view=training]').tap();await frames(before);assert.ok(await before.evaluate(()=>scrollY>0),'v22 bug reproduced');
  for(const [width,height] of [[320,568],[375,667],[390,844],[430,932],[844,390]]){
   await page.setViewportSize({width,height});
   await bottom(page);await go('#view-active [data-view=training]','start');
   await bottom(page);await go('#view-start [data-view=active]','active');
   await bottom(page);await go('[data-tab=settings]','settings');
   await go('#view-settings [data-view=exercises]','exercises');
   await bottom(page);await go('[data-tab=settings]','settings');
   await go('#view-settings [data-view=exercises]','exercises');
   await bottom(page);await go('#view-exercises .back-button','settings');
   await go('[data-tab=training]','start');
   await bottom(page);await go('[data-tab=settings]','settings');
   await go('[data-tab=training]','start');
   await go('#view-start [data-view=active]','active');
   const bar=await page.locator('.tabbar').boundingBox();assert.equal(bar.height,80);assert.equal(bar.y+bar.height,height);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  const current=await state();for(const key of ['activeSession','completedSessions','exercises','plans','planOrder'])assert.deepEqual(current[key],original[key],key+' unchanged by navigation');
  await page.setViewportSize({width:390,height:844});
  // Instrument only explicit reset writes; normal browser anchoring during data renders stays allowed.
  await page.evaluate(()=>{window.resetWrites=[];for(const [label,el] of [['root',document.scrollingElement],['wrapper',document.querySelector('#scrollArea')]]){const d=Object.getOwnPropertyDescriptor(Element.prototype,'scrollTop');Object.defineProperty(el,'scrollTop',{configurable:true,get(){return d.get.call(this);},set(v){window.resetWrites.push({label,value:v});d.set.call(this,v);}});}});
  const clear=()=>page.evaluate(()=>window.resetWrites=[]),noReset=async()=>assert.deepEqual(await page.evaluate(()=>window.resetWrites),[]);
  await page.locator('#edit-training-weight').tap();await page.locator('#training-weight-form [name=weight]').fill('22,25');await page.evaluate(()=>scrollTo(0,180));const position=await page.evaluate(()=>scrollY);await clear();await page.waitForTimeout(1100);await noReset();assert.equal(await page.evaluate(()=>scrollY),position);assert.equal(await page.locator('#training-weight-form [name=weight]').inputValue(),'22,25');
  await page.locator('#training-weight-form [type=submit]').tap();await noReset();assert.equal((await state()).exercises[0].weightKg,22.25);
  await clear();await page.locator('#skip-exercise').tap();await noReset();
  await clear();await page.locator('#complete-exercise').tap();await noReset();assert.equal((await state()).activeSession.exercises.filter(e=>e.status==='completed').length,1);
  await page.locator('#edit-training-weight').tap();await page.locator('#training-weight-form [name=weight]').fill('77');await page.evaluate(()=>scrollTo(0,160));await clear();const prior=await page.evaluate(()=>scrollY);
  await page.evaluate(()=>{window.dispatchEvent(new Event('pagehide'));window.dispatchEvent(new Event('pageshow'));});await frames(page);await noReset();assert.equal(await page.evaluate(()=>scrollY),prior);assert.equal(await page.locator('#training-weight-form [name=weight]').inputValue(),'77');await page.locator('#cancel-training-weight').tap();
  // Dirty draft: cancellation is not a view change; accepted leave is reset synchronously.
  await go('[data-tab=settings]','settings');await go('#view-settings [data-view=plans]','plans');await page.locator('#new-plan').tap();await page.locator('#plan-form [name=name]').fill('Unsaved');await bottom(page);await clear();
  await page.locator('[data-tab=training]').tap();await page.locator('#plan-leave-dialog [value=cancel]').tap();await noReset();assert.ok(await page.locator('#view-plan-editor').isVisible());assert.equal(await page.locator('#plan-form [name=name]').inputValue(),'Unsaved');
  await page.locator('[data-tab=training]').tap();await page.locator('#plan-leave-dialog [value=discard]').tap();await frames(page);assert.ok(await page.locator('#view-start').isVisible());assert.equal(await page.evaluate(()=>scrollY),0);
  // Same-view tab activation must not reset; actual view changes still do.
  await bottom(page);const same=await page.evaluate(()=>scrollY);await clear();await page.locator('[data-tab=training]').tap();await noReset();assert.equal(await page.evaluate(()=>scrollY),same);
  // Preserve the documented v13 reserve, including its known short-page excess.
  await page.evaluate(()=>{const D=KairosTrainingData,s=D.createStore();s.load();s.update(v=>{v.plans=v.plans.slice(0,1);v.planOrder=v.plans.map(p=>p.id);});});await page.reload();await go('[data-tab=training]','start');
  for(const [width,height] of [[320,568],[390,844],[430,932]]){
   await page.setViewportSize({width,height});await go('[data-tab=settings]','settings');
   const measure=await page.evaluate(()=>({excess:document.scrollingElement.scrollHeight-innerHeight,padding:getComputedStyle(document.querySelector('#scrollArea')).paddingBottom,box:getComputedStyle(document.querySelector('#scrollArea')).boxSizing}));assert.equal(measure.excess,80);assert.equal(measure.padding,'80px');assert.equal(measure.box,'content-box');
   await bottom(page);await go('[data-tab=training]','start');await bottom(page);await go('[data-tab=settings]','settings');
  }
  // Simulated upper safe area: geometry remains intact and root reset includes that offset.
  const probe=await page.addStyleTag({content:'#scrollArea {padding-top:44px !important}'});await bottom(page);await go('[data-tab=training]','start');assert.equal(await page.locator('#scrollArea').evaluate(e=>getComputedStyle(e).paddingTop),'44px');assert.equal((await page.locator('.tabbar').boundingBox()).height,80);await probe.evaluate(e=>e.remove());
  const final=await state();assert.deepEqual(final.completedSessions,original.completedSessions);assert.ok(final.activeSession);assert.equal(final.activeSession.exercises.length,8);assert.equal(final.activeSession.exercises.filter(e=>e.status==='completed').length,1);assert.equal(final.exercises[0].weightKg,22.25);assert.deepEqual(errors,[]);
  console.log('PASS: reproduced v22 root-scroll leak; v23 synchronous before-paint resets across active/overview/library/settings and tabs at five mobile sizes; long pages scroll; no resets for weights/skip/complete/timer/same-view resume or cancelled drafts; accepted draft leave resets; state/history preserved, CSS/existing training HTML byte-identical, 80px short-page reserve deliberately deferred, simulated safe area unchanged.');
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
