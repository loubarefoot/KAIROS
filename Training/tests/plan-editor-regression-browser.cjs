const {chromium}=require(process.env.KAIROS_PLAYWRIGHT_MODULE || 'playwright-core');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const root=path.resolve(__dirname,'..'),server=http.createServer((req,res)=>{
  const name=req.url.split('?')[0].split('/').pop()||'index.html';
  if(!/^[\w.-]+$/.test(name)||!fs.existsSync(path.join(root,name))){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(path.join(root,name)));
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try {
  browser=await chromium.launch({executablePath:process.env.KAIROS_CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,serviceWorkers:'block'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));const url='http://127.0.0.1:'+server.address().port+'/';await page.goto(url);
  await page.evaluate(()=>{const D=KairosTrainingData,s=D.createStore();s.load();s.update(v=>{const p=D.createPlan({name:'Lifecycle',exerciseIds:v.exercises.slice(0,3).map(e=>e.id)});v.plans=[p];v.planOrder=[p.id];v.exercises[0].weightKg=17.5;v.exercises[1].weightKg=null;});});
  const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('kairos.training.state')));
  const open=async()=>{await page.reload();await page.locator('[data-tab=settings]').click();await page.locator('[data-view=plans]:visible').click();await page.locator('[data-edit-plan]').click();};
  const returnFrom=async(reason)=>page.evaluate(reason=>{
   window.dispatchEvent(new Event('pagehide'));
   const D=KairosTrainingData,s=D.createStore();s.load();s.update(v=>{
    v.settings.lastOpenedDay=reason==='day'?'2020-01-01':KairosTrainingNavigation.day(Date.now());
    v.settings.lastBackgroundAt=Date.now()-(reason==='short'?1000:reason==='day'?1000:3600000);
   });window.dispatchEvent(new Event('pageshow'));
  },reason);
  for(const reason of ['60','day']) {
   await open();const before=await state();await returnFrom(reason);
   await page.locator('#view-start').waitFor({state:'visible'});assert.ok(await page.locator('#plan-leave-dialog').isHidden());
   assert.deepEqual((await state()).plans,before.plans);assert.deepEqual((await state()).exercises,before.exercises);
   // Cancel, discard and save each protect/resolve the required lifecycle transition.
   for(const choice of ['cancel','discard','save']) {
    await open();const original=await state();await page.locator('#plan-form [name=description]').fill('Changed '+reason+' '+choice);
    const weight=page.locator('#plan-exercises [data-draft-field=weightKg]').first();await weight.fill('22,25');
    await page.locator('#plan-new-exercise-form [name=name]').fill('New '+reason+' '+choice);await page.locator('#plan-new-exercise-form [name=weight]').fill('0');await page.locator('#plan-new-exercise-form button').click();
    await returnFrom(reason);await page.locator('#plan-leave-dialog').waitFor({state:'visible'});
    assert.deepEqual((await state()).plans,original.plans);assert.deepEqual((await state()).exercises,original.exercises);
    await page.locator('#plan-leave-dialog [value='+choice+']').click();
    if(choice==='cancel') {
     await page.locator('#plan-leave-dialog').waitFor({state:'hidden'});assert.ok(await page.locator('#view-plan-editor').isVisible());
     assert.equal(await page.locator('#plan-form [name=description]').inputValue(),'Changed '+reason+' '+choice);assert.equal(await weight.inputValue(),'22,25');
     assert.equal(await page.locator('#plan-exercises .sort-row').count(),original.plans[0].exerciseIds.length+1);
     assert.deepEqual((await state()).plans,original.plans);assert.deepEqual((await state()).exercises,original.exercises);assert.equal((await state()).settings.lastView,'plans');
     // A second short return must retain this editor after explicit cancellation.
     await returnFrom('short');assert.ok(await page.locator('#view-plan-editor').isVisible());assert.ok(await page.locator('#plan-leave-dialog').isHidden());
     await page.locator('#close-plan').click();await page.locator('#plan-leave-dialog [value=discard]').click();await page.locator('#view-plans').waitFor({state:'visible'});
     assert.deepEqual((await state()).exercises,original.exercises);
    } else {
     await page.locator('#view-start').waitFor({state:'visible'});const saved=await state();
     if(choice==='discard'){assert.deepEqual(saved.plans,original.plans);assert.deepEqual(saved.exercises,original.exercises);}
     else {assert.equal(saved.plans[0].description,'Changed '+reason+' '+choice);assert.equal(saved.exercises[0].weightKg,22.25);assert.equal(saved.exercises.length,original.exercises.length+1);}
    }
   }
  }
  // Short returns preserve changed and unchanged editor DOM without autofocus or re-render.
  for(const changed of [false,true]){
   await open();if(changed)await page.locator('#plan-form [name=description]').fill('Short return');
   await page.evaluate(()=>window.originalInput=document.querySelector('#plan-form [name=name]'));
   await returnFrom('short');assert.ok(await page.locator('#view-plan-editor').isVisible());assert.ok(await page.locator('#plan-leave-dialog').isHidden());assert.ok(await page.evaluate(()=>window.originalInput===document.querySelector('#plan-form [name=name]')));
  }
  // Existing numeric and empty MAX values restore after toggling and across saved edits.
  await open();
  for(const index of [0,1]){
   const row=page.locator('#plan-exercises .sort-row').nth(index),weight=row.locator('[data-draft-field=weightKg]'),max=row.locator('[data-draft-field=isMax]');const value=await weight.inputValue();
   await max.check();assert.equal(await weight.isDisabled(),true);assert.equal(await weight.inputValue(),value);await max.uncheck();assert.equal(await weight.isDisabled(),false);assert.equal(await weight.inputValue(),value);await max.check();
  }
  await page.locator('#plan-form [type=submit]').click();await page.locator('#view-plans').waitFor({state:'visible'});let saved=await state();assert.equal(saved.exercises[0].isMax,true);assert.equal(saved.exercises[1].weightKg,null);
  await page.locator('[data-edit-plan]').click();for(const index of [0,1])await page.locator('#plan-exercises .sort-row').nth(index).locator('[data-draft-field=isMax]').uncheck();
  await page.locator('#plan-form [type=submit]').click();await page.locator('#view-plans').waitFor({state:'visible'});const back=await state();assert.equal(back.exercises[0].weightKg,saved.exercises[0].weightKg);assert.equal(back.exercises[1].weightKg,null);assert.equal(back.exercises[0].isMax,false);
  // Real mouse pointer and CDP touch events exercise capture, commit and cancellation.
  await page.setViewportSize({width:800,height:2000});await page.locator('[data-edit-plan]').click();
  const order=()=>page.locator('#plan-exercises .sort-row').evaluateAll(rows=>rows.map(r=>r.dataset.id));const initial=await order(),persisted=await state();
  const handle=page.locator('#plan-exercises .sort-row').nth(0).locator('.drag-handle');await handle.scrollIntoViewIfNeeded();let a=await handle.boundingBox(),b=await page.locator('#plan-exercises .sort-row').nth(1).boundingBox();
  await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:8});await page.mouse.up();
  assert.deepEqual((await order()).slice(0,2),[initial[1],initial[0]]);assert.deepEqual((await state()).plans,persisted.plans);
  const cdp=await context.newCDPSession(page);a=await page.locator('#plan-exercises .sort-row').nth(0).locator('.drag-handle').boundingBox();b=await page.locator('#plan-exercises .sort-row').nth(1).boundingBox();
  const touch=async(type,x,y)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'||type==='touchCancel'?[]:[{x,y,id:1}]});
  await touch('touchStart',a.x+a.width/2,a.y+a.height/2);await touch('touchMove',b.x+b.width/2,b.y+b.height/2);await touch('touchEnd');assert.deepEqual(await order(),initial);assert.deepEqual((await state()).plans,persisted.plans);
  await touch('touchStart',a.x+a.width/2,a.y+a.height/2);await touch('touchMove',b.x+b.width/2,b.y+b.height/2);await touch('touchCancel');assert.deepEqual(await order(),initial);assert.equal(await page.locator('#plan-exercises .dragging,#plan-exercises .drop-target').count(),0);
  // Commit another pointer reorder and verify persistence only on Save.
  a=await page.locator('#plan-exercises .sort-row').nth(0).locator('.drag-handle').boundingBox();await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:8});await page.mouse.up();
  const reordered=await order();await page.locator('#plan-form [type=submit]').click();await page.locator('#view-plans').waitFor({state:'visible'});assert.deepEqual((await state()).plans[0].exerciseIds,reordered);
  assert.deepEqual(errors,[]);console.log('PASS: 60-minute/day lifecycle unchanged and changed drafts; save/discard/cancel preserve global/new exercises; short return, MAX restoration, actual pointer/touch reorder and cancellation.');
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
