const {chromium}=require(process.env.KAIROS_PLAYWRIGHT_MODULE||'playwright-core');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
(async()=>{
 const root=path.resolve(__dirname,'..'),prefix='/KAIROS/Training/',profile=fs.mkdtempSync(path.join(os.tmpdir(),'kairos-statistics-v26-'));
 const server=http.createServer((req,res)=>{const name=new URL(req.url,'http://localhost').pathname.slice(prefix.length)||'index.html';if(!/^([\w.-]+\/)*[\w.-]+$/.test(name)||!fs.existsSync(path.join(root,name))){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',name.endsWith('.png')?'image/png':name.endsWith('.webmanifest')?'application/manifest+json':name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(path.join(root,name)));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let context;
 const url='http://127.0.0.1:'+server.address().port+prefix,errors=[];
 const launch=async()=>{const c=await chromium.launchPersistentContext(profile,{executablePath:process.env.KAIROS_CHROMIUM_PATH||'/usr/bin/chromium',headless:true,viewport:{width:390,height:844},hasTouch:true,timezoneId:'Europe/Berlin',args:['--no-sandbox']});await c.addInitScript(()=>{Date.now=()=>Number(localStorage.getItem('kairos.test.clock'))||new Date(2026,9,16,18).getTime();});return c;};
 try{
  context=await launch();let page=context.pages()[0]||await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  const tab=()=>page.locator('[data-tab=statistics]').tap(),section=s=>page.locator(`[data-stat-section=${s}]`).tap(),period=p=>page.locator(`[data-stat-period="${p}"]`).tap();
  const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('kairos.training.state')));
  await tab();await section('charts');await period('7');assert.equal(await page.locator('.statistics-chart svg').count(),3);assert.equal(await page.locator('[data-chart=weight] circle').count(),0);
  assert.equal(await page.locator('[data-chart=weight] .statistics-axis text[y="197"]').count(),7);
  await page.evaluate(()=>{
   const D=KairosTrainingData,s=D.createStore();s.load();s.update(v=>{v.plans=[D.createPlan({name:'Historischer Plan',exerciseIds:v.exercises.slice(0,2).map(e=>e.id)})];v.planOrder=v.plans.map(p=>p.id);
    for(let i=0;i<120;i++){const start=new Date(2026,9,16-Math.max(0,i-2),i<3?10+i:10).getTime();v.completedSessions.push({id:D.createId(),planId:v.plans[0].id,planName:'Historischer Plan',planDescription:'',startedAt:start,endedAt:start+600000,durationMs:600000,exercises:v.exercises.slice(0,2).map((e,j)=>({...e,weightKg:j===0?(i%2?62.5:60):20,isMax:i===119&&j===0,status:'completed'}))});}
    v.exercises[0].weightKg=999;v.exercises[0].isMax=true;
   });KairosTrainingSession.create(s,D).start(s.getState().plans[0].id);
  });await page.reload();await tab();await section('charts');await period('all');
  const before=await state(),id=before.exercises[0].id;
  await page.locator('#statistics-exercise').selectOption(id);
  assert.equal(await page.locator('[data-chart=weight] circle').count(),119);
  for(const p of ['7','30','90','all']){
   await period(p);
   for(const width of [320,390,430,844]){
    await page.setViewportSize({width,height:844});await page.waitForTimeout(50);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    for(const svg of await page.locator('.statistics-chart svg').all())assert.ok(await svg.evaluate(e=>e.getBoundingClientRect().width<=e.parentElement.clientWidth+1));
    for(const plot of await page.locator('.statistics-plot').all())assert.ok(await plot.evaluate(e=>e.scrollWidth<=e.clientWidth+1));
    for(const card of await page.locator('.statistics-chart').all()){
     const labels=await card.locator('.statistics-axis text[y="197"]').evaluateAll(nodes=>nodes.map(e=>({text:e.textContent,x:e.getBoundingClientRect().x,right:e.getBoundingClientRect().right})));
     assert.equal(new Set(labels.map(l=>l.text)).size,labels.length);
     for(let i=1;i<labels.length;i++)assert.ok(labels[i-1].right<=labels[i].x+1,JSON.stringify(labels));
     if(p==='7')assert.equal(labels.length,7);
    }
   }
  }
  await page.setViewportSize({width:390,height:844});await period('30');
  const weightTicks=await page.locator('[data-chart=weight] .statistics-axis text[text-anchor=end]:not([y="197"])').allTextContents();assert.ok(weightTicks.every(t=>t.includes('kg')));assert.ok(weightTicks.every(t=>parseFloat(t.replace(',','.'))>=58));
  const integerTicks=await page.locator('[data-chart=frequency] .statistics-axis text[text-anchor=end]:not([y="197"])').allTextContents();assert.ok(integerTicks.every(t=>Number.isInteger(Number(t))));
  await page.locator('[data-chart=frequency] details summary').tap();assert.deepEqual(await page.locator('[data-chart=frequency] th').allTextContents(),['KW','Woche ab','Einheiten']);
  await page.locator('[data-chart=weight] circle').first().tap();assert.match(await page.locator('[data-chart=weight] output').innerText(),/62,5 kg/);await page.locator('[data-chart=weight] [data-chart-step="1"]').tap();assert.match(await page.locator('[data-chart=weight] output').innerText(),/60 kg/);
  await page.locator('[data-chart=duration] circle').first().tap();assert.match(await page.locator('[data-chart=duration] output').innerText(),/00:10:00/);
  await page.locator('[data-chart=frequency] rect').first().tap();assert.match(await page.locator('[data-chart=frequency] output').innerText(),/KW.*4 Einheiten/);
  await page.evaluate(()=>{window.originalSelect=document.getElementById('statistics-exercise');window.selectFocus=0;window.originalSelect.addEventListener('focus',()=>window.selectFocus++);window.durationSVG=document.querySelector('[data-chart=duration] svg');});
  await page.locator('#statistics-exercise').selectOption(before.exercises[1].id);
  assert.ok(await page.evaluate(()=>window.originalSelect===document.getElementById('statistics-exercise')&&window.durationSVG===document.querySelector('[data-chart=duration] svg')&&window.selectFocus===0));
  assert.equal(await page.locator('[data-chart=weight] circle').count(),32); // Today has three actual sessions, plus the previous 29 days.
  const flat=await page.locator('[data-chart=weight] circle').evaluateAll(ns=>ns.map(n=>n.getAttribute('cy')));assert.equal(new Set(flat).size,1);
  assert.doesNotMatch(await page.locator('#statistics-content').innerText(),/MAX|Zahlengewicht|Seitlich wischen/);
  await section('history');await page.locator('[data-stat-session]').last().tap();assert.doesNotMatch(await page.locator('#statistics-content').innerText(),/MAX/);assert.match(await page.locator('#statistics-content').innerText(),/Gewicht nicht verfügbar/);
  await section('charts');await period('90');
  await page.evaluate(()=>{window.dispatchEvent(new Event('pagehide'));localStorage.setItem('kairos.test.clock',String(Date.now()+899999));window.dispatchEvent(new Event('pageshow'));});
  await page.locator('#view-statistics').waitFor({state:'visible'});assert.equal(await page.locator('[data-stat-section=charts]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('[data-stat-period="90"]').getAttribute('aria-pressed'),'true');
  await page.reload();await page.locator('#view-statistics').waitFor({state:'visible'});assert.equal(await page.locator('[data-stat-period="90"]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('#statistics-exercise').inputValue(),before.exercises[1].id);
  // Block optional view storage. Memory restoration still works without touching training storage.
  await page.evaluate(()=>{const set=Storage.prototype.setItem;window.savedSet=set;Storage.prototype.setItem=function(k,v){if(k==='kairos.training.ui.v26')throw Error('quota');return set.call(this,k,v);};window.dispatchEvent(new Event('pagehide'));localStorage.setItem('kairos.test.clock',String(Date.now()+1000));window.dispatchEvent(new Event('pageshow'));Storage.prototype.setItem=set;});
  assert.ok(await page.locator('#view-statistics').isVisible());
  await page.evaluate(()=>{window.dispatchEvent(new Event('pagehide'));localStorage.setItem('kairos.test.clock',String(Date.now()+900000));window.dispatchEvent(new Event('pageshow'));});await page.locator('#view-start').waitFor({state:'visible'});
  assert.deepEqual((await state()).activeSession,before.activeSession);assert.deepEqual((await state()).completedSessions,before.completedSessions);assert.deepEqual((await state()).exercises,before.exercises);
  await tab();await section('charts');await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/workspace/work/v26/charts.png',fullPage:true});await section('overview');await page.screenshot({path:'/workspace/work/v26/overview.png'});
  await context.close();context=await launch();await context.setOffline(true);page=context.pages()[0]||await context.newPage();for(const other of context.pages())if(other!==page)await other.close();page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await page.bringToFront();await tab();await section('charts');assert.equal(await page.locator('.statistics-chart svg').count(),3);assert.deepEqual((await state()).completedSessions,before.completedSessions);assert.deepEqual((await state()).activeSession,before.activeSession);assert.deepEqual(errors,[]);
  console.log('PASS v26: full fixed-width periods/unique nonoverlapping axes, 120 actual sessions, integer weeks/ISO table, dynamic and flat weights, exact tap values, retained native select/no refocus, no MAX, short lock/reload/blocked UI storage, exact 15-minute overview with unchanged session, mobile and offline process restart.');
 }finally{await context?.close();await new Promise(r=>server.close(r));fs.rmSync(profile,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
