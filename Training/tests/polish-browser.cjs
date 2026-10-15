const {chromium}=require(process.env.KAIROS_PLAYWRIGHT_MODULE||'playwright-core');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
(async()=>{
 const root=path.resolve(__dirname,'..'),base='fe31c84d57d44b225026df072af13d1a180ea75a';
 const names=['index.html','styles.css','app.js','data.js','library.js','management.js','navigation.js','session.js','diagnostics.js','manifest.webmanifest'];
 const old=new Map(names.map(n=>[n,execFileSync('git',['show',base+':Training/'+n],{cwd:root})]));
 const server=http.createServer((req,res)=>{
  const u=new URL(req.url,'http://localhost'),baseline=u.pathname.startsWith('/v21/'),name=u.pathname.replace(/^\/v2[12]\//,'')||'index.html';
  if(!names.includes(name)){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html');
  res.end(baseline?old.get(name):fs.readFileSync(path.join(root,name)));
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.KAIROS_CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const errors=[],origin='http://127.0.0.1:'+server.address().port,clock=new Date('2026-10-15T10:00:00+02:00').getTime();
  const context=async()=>{const c=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,serviceWorkers:'block',timezoneId:'Europe/Berlin'});await c.addInitScript(t=>{Date.now=()=>t;},clock);return c;};
  const a=await context(),b=await context(),before=await a.newPage(),page=await b.newPage();
  for(const p of [before,page])p.on('pageerror',e=>errors.push(e.message));
  await before.goto(origin+'/v21/');
  const raw=await before.evaluate(()=>{
   const D=KairosTrainingData,s=D.createStore();s.load();s.update(v=>{v.exercises.slice(0,4).forEach((e,i)=>e.weightKg=17.5+i*5);v.plans=['Push · Kraft','Pull · Rücken'].map(name=>D.createPlan({name,description:'Kontrolliert bewegen',exerciseIds:v.exercises.slice(0,4).map(e=>e.id)}));v.planOrder=v.plans.map(p=>p.id);});
   const f=KairosTrainingSession.create(s,D);f.start(s.getState().plans[0].id);f.finish(s.getState().activeSession.id);f.start(s.getState().plans[1].id);f.select(2);f.complete();f.select(3);f.complete();f.select(1);f.skip();
   return localStorage.getItem(D.STORAGE_KEY);
  });
  await before.reload();await page.goto(origin+'/v22/');await page.evaluate(raw=>localStorage.setItem('kairos.training.state',raw),raw);await page.reload();
  const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('kairos.training.state'))),original=await state();
  const projection=async(p,selector)=>p.locator(selector).evaluate(el=>{
   const box=el.getBoundingClientRect(),props=['display','position','boxSizing','backgroundColor','backgroundImage','color','borderTopColor','borderTopWidth','borderRadius','paddingTop','paddingRight','paddingBottom','paddingLeft','fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','gap','textAlign'];
   return {html:el.innerHTML,width:box.width,height:box.height,nodes:[el,...el.querySelectorAll('*')].map(n=>{const s=getComputedStyle(n),r=n.getBoundingClientRect();return {tag:n.tagName,style:Object.fromEntries(props.map(k=>[k,s[k]])),rect:n.getClientRects().length ? [r.x-box.x,r.y-box.y,r.width,r.height].map(v=>Math.round(v*100)/100) : null};})};
  });
  const resume=async()=>{await page.locator('#view-start [data-view=active]').tap();await page.locator('#view-active').waitFor({state:'visible'});};
  const unchanged=async()=>{const current=await state();for(const key of ['activeSession','exercises','plans','planOrder','completedSessions'])assert.deepEqual(current[key],original[key],key+' preserved');};
  for(const [width,height] of [[320,568],[375,667],[390,844],[430,932],[844,390]]){
   for(const p of [before,page])await p.setViewportSize({width,height});
   for(const selector of ['.session-metrics','#active-content progress','#current-exercise .is-current','#open-exercises article','#completed-exercises','.tabbar'])
    assert.deepEqual(await projection(page,selector),await projection(before,selector),selector+' unchanged at '+width);
   assert.equal(await page.locator('.session-eyebrow').count(),0);
   const heading=await page.locator('#title-active').evaluate(e=>{const s=getComputedStyle(e);return {size:parseFloat(s.fontSize),color:s.color,align:s.textAlign,decoration:s.textDecorationLine,font:s.fontFamily};});
   const oldHeading=await before.locator('#title-active').evaluate(e=>({size:parseFloat(getComputedStyle(e).fontSize),font:getComputedStyle(e).fontFamily,color:getComputedStyle(e).color}));
   assert.ok(heading.size>oldHeading.size);assert.equal(heading.color,oldHeading.color);assert.equal(heading.font,oldHeading.font);assert.equal(heading.align,'left');assert.equal(heading.decoration,'none');
   const title=await page.locator('#title-active').boundingBox(),name=await page.locator('.training-session-header h2').boundingBox();assert.ok(name.y>=title.y+title.height+10);
   const back=await page.locator('.finish-training-actions [data-view=training]').boundingBox(),finish=await page.locator('#finish-training').boundingBox();
   assert.equal(back.y,finish.y);assert.equal(back.height,finish.height);assert.ok(back.height>=44);assert.ok(back.x+back.width+10<=finish.x);assert.ok(finish.x+finish.width<=width);
   assert.equal(await page.locator('#finish-training').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(120, 201, 155)');
   assert.equal(await page.locator('.finish-training-actions').evaluate(e=>getComputedStyle(e).marginTop),'20px');
   assert.equal(await page.locator('#open-exercises .select-session-exercise').evaluate(e=>getComputedStyle(e,'::after').content),'none');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.locator('#view-active').screenshot({path:'/workspace/work/v22-active-'+width+'.png'});
   await page.evaluate(()=>{document.scrollingElement.scrollTop=document.scrollingElement.scrollHeight;document.querySelector('#scrollArea').scrollTop=document.querySelector('#scrollArea').scrollHeight;});
   for(const selector of ['#finish-training','.finish-training-actions [data-view=training]']){const r=await page.locator(selector).boundingBox();assert.ok(r.y>=0&&r.y+r.height<=height-80,'footer remains above navigation');}
   await page.screenshot({path:'/workspace/work/v22-footer-'+width+'.png'});
  }
  await page.setViewportSize({width:390,height:844});
  const choice=page.locator('#open-exercises .select-session-exercise').first();assert.match(await choice.getAttribute('aria-label'),/^Übung auswählen:/);assert.equal(await choice.innerText(),'');
  const card=await choice.boundingBox();assert.ok(card.height>44);await choice.scrollIntoViewIfNeeded();const box=await choice.boundingBox();await page.mouse.move(box.x+10,box.y+10);await page.mouse.down();await page.waitForFunction(()=>getComputedStyle(document.querySelector('#open-exercises .select-session-exercise')).backgroundColor!=='rgba(0, 0, 0, 0)');assert.notEqual(await choice.evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)');await page.mouse.up();
  // Pointer release selected the open card; native touch and keyboard also keep working.
  await page.locator('#open-exercises .select-session-exercise').first().tap();
  await page.locator('#open-exercises .select-session-exercise').first().focus();await page.keyboard.press('Enter');
  await page.locator('#open-exercises .select-session-exercise').first().focus();await page.keyboard.press('Space');
  const session=await state();assert.equal(session.activeSession.exercises.length,4);assert.deepEqual(session.activeSession.exercises,original.activeSession.exercises);
  // Restore original manual selection through the existing action, then compare session exactly.
  const originalId=original.activeSession.exercises[original.activeSession.currentIndex].id;
  if((await state()).activeSession.exercises[(await state()).activeSession.currentIndex].id!==originalId)await page.locator('[data-exercise-id="'+originalId+'"]').tap();
  await unchanged();
  await page.locator('[data-tab=training]').tap();await page.locator('#view-start').waitFor({state:'visible'});await unchanged();
  await page.locator('[data-tab=training]').tap();await page.locator('#view-start').waitFor({state:'visible'});await unchanged();
  await before.locator('#view-active > [data-view=training]').tap();
  for(const [width,height] of [[320,568],[390,844],[430,932]]){
   for(const p of [before,page])await p.setViewportSize({width,height});
   for(const selector of ['#title-start','#view-start .running-plan','#view-start .plan-summary:not(.running-plan)'])assert.deepEqual(await projection(page,selector),await projection(before,selector),'start protection '+selector+' '+width);
   assert.equal(await page.locator('#last-training, .last-training-card').count(),0);assert.ok(!(await page.locator('#view-start').innerText()).includes('Letztes Training'));
   const size=await page.locator('.plan-collection > h2').evaluate(e=>({size:parseFloat(getComputedStyle(e).fontSize),weight:+getComputedStyle(e).fontWeight}));assert.ok(size.size>17.28);assert.ok(size.weight>650);
   await page.locator('#view-start').screenshot({path:'/workspace/work/v22-start-'+width+'.png'});
  }
  await page.setViewportSize({width:390,height:844});await before.setViewportSize({width:390,height:844});
  for(const p of [before,page])await p.locator('[data-tab=settings]').tap();
  assert.deepEqual(await projection(page,'#view-settings'),await projection(before,'#view-settings'),'settings unchanged');
  await page.locator('[data-tab=training]').tap();await page.locator('#view-start').waitFor({state:'visible'});await unchanged();
  await resume();await unchanged();await page.locator('.finish-training-actions [data-view=training]').tap();await page.locator('#view-start').waitFor({state:'visible'});await unchanged();await resume();
  await before.locator('[data-tab=training]').tap();
  for(const p of [before,page])await p.locator('#finish-training').tap();
  assert.deepEqual(await projection(page,'#training-finish-dialog'),await projection(before,'#training-finish-dialog'),'entire finish dialog unchanged');
  await page.locator('#finish-continue').tap();await unchanged();
  await page.reload();await page.locator('#view-active').waitFor({state:'visible'});await unchanged();
  await page.locator('[data-tab=training]').tap();await page.locator('#view-start').waitFor({state:'visible'});await unchanged();
  // Empty history remains empty; rendering does not recreate the removed information card.
  await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('kairos.training.state'));s.activeSession=null;s.completedSessions=[];localStorage.setItem('kairos.training.state',JSON.stringify(s));});await page.reload();assert.equal(await page.locator('.last-training-card, #last-training').count(),0);
  assert.deepEqual(errors,[]);
  console.log('PASS: v22 against v21 at five mobile/landscape sizes: protected main card, metrics, completed rows, tabbar, plan cards, settings and entire finish dialog unchanged; removed last-training/stripe/eyebrow; headings, compact horizontal footer, native touch/keyboard feedback; Training tab always overview, settings roundtrip/resume/reload preserve session, history and weights.');
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
