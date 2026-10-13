const {chromium}=require(process.env.KAIROS_PLAYWRIGHT_MODULE || 'playwright-core');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const root=path.resolve(__dirname,'..'),server=http.createServer((req,res)=>{
  const name=req.url.split('?')[0].split('/').pop()||'index.html';
  if(!/^[\w.-]+$/.test(name)||!fs.existsSync(path.join(root,name))){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.webmanifest')?'application/manifest+json':'text/html');res.end(fs.readFileSync(path.join(root,name)));
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try {
  browser=await chromium.launch({executablePath:process.env.KAIROS_CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,serviceWorkers:'block'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));const url='http://127.0.0.1:'+server.address().port+'/';await page.goto(url);
  const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('kairos.training.state')));
  const open=async()=>{await page.locator('[data-tab=settings]').click();await page.locator('[data-view=plans]:visible').click();await page.locator('#new-plan').click();};
  await open();assert.ok(await page.locator('#view-plan-editor').isVisible());assert.ok(await page.locator('#view-plans').isHidden());
  assert.equal(await page.evaluate(()=>['INPUT','TEXTAREA'].includes(document.activeElement.tagName)),false);
  const original=await state();await page.locator('#plan-form [name=name]').fill('Draft plan');await page.locator('#plan-form [name=description]').fill('Description');
  await page.locator('#add-exercise-form button').click();await page.locator('#add-exercise-form button').click();
  const weightedId=await page.locator('#plan-exercises .sort-row').first().getAttribute('data-id');
  await page.locator('#plan-exercises [data-draft-field=weightKg]').first().fill('17,5');
  await page.evaluate(()=>{window.originalNameInput=document.querySelector('#plan-form [name=name]');window.originalWeightInput=document.querySelector('[data-draft-field=weightKg]');});
  await page.locator('#plan-exercises [data-index="0"] [data-move="1"]').click();
  assert.ok(await page.evaluate(()=>window.originalNameInput===document.querySelector('#plan-form [name=name]')&&window.originalWeightInput.isConnected));
  assert.deepEqual((await state()).plans,original.plans);assert.deepEqual((await state()).exercises,original.exercises);
  await page.locator('#back-plan').click();await page.locator('#plan-leave-dialog [value=cancel]').click();assert.ok(await page.locator('#view-plan-editor').isVisible());assert.equal(await page.locator('#plan-form [name=name]').inputValue(),'Draft plan');
  await page.locator('#plan-new-exercise-form [name=name]').fill('Custom draft');await page.locator('#plan-new-exercise-form [name=weight]').fill('0');
  await page.locator('#back-plan').click();await page.locator('#plan-leave-dialog [value=save]').click();await page.locator('#view-plans').waitFor({state:'visible'});
  let saved=await state();assert.equal(saved.plans[0].name,'Draft plan');assert.equal(saved.plans[0].exerciseIds.length,3);assert.equal(saved.exercises.find(e=>e.id===weightedId).weightKg,17.5);assert.equal(saved.exercises.at(-1).weightKg,0);
  await page.locator('[data-edit-plan]').first().click();await page.locator('#plan-form [name=name]').fill('Discard');await page.locator('#plan-exercises [data-remove-exercise]').first().click();await page.locator('#back-plan').click();await page.locator('#plan-leave-dialog [value=discard]').click();assert.deepEqual((await state()).plans,saved.plans);
  await page.locator('[data-edit-plan]').first().click();await page.locator('#back-plan').click();assert.ok(await page.locator('#view-plans').isVisible());assert.ok(await page.locator('#plan-leave-dialog').isHidden());
  // Incomplete new-exercise inputs must also trigger the leave guard.
  await page.locator('[data-edit-plan]').first().click();await page.locator('#plan-new-exercise-form [name=weight]').fill('5');await page.locator('[data-tab=training]').click();await page.locator('#plan-leave-dialog [value=cancel]').click();
  await page.locator('#plan-new-exercise-form [name=weight]').fill('');await page.locator('#plan-form [name=name]').fill('Saved via dialog');
  await page.locator('[data-tab=training]').click();await page.locator('#plan-leave-dialog [value=save]').click();await page.locator('#view-start').waitFor({state:'visible'});assert.equal((await state()).plans[0].name,'Saved via dialog');
  // Save failure keeps both editor and stored originals; repeat Save succeeds.
  await page.locator('[data-tab=settings]').click();await page.locator('[data-view=plans]:visible').click();await page.locator('[data-edit-plan]').first().click();saved=await state();await page.locator('#plan-form [name=name]').fill('Retry');
  await page.evaluate(()=>{window.originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='kairos.training.state')throw Error('quota');return window.originalSetItem.call(this,k,v);};});
  await page.locator('#back-plan').click();await page.locator('#plan-leave-dialog [value=save]').click();await page.locator('#plan-error').waitFor({state:'visible'});assert.ok(await page.locator('#view-plan-editor').isVisible());assert.match(await page.locator('#plan-error').innerText(),/nicht gespeichert/);assert.deepEqual((await state()).plans,saved.plans);assert.equal(await page.locator('#plan-form [name=name]').inputValue(),'Retry');
  await page.evaluate(()=>Storage.prototype.setItem=window.originalSetItem);await page.locator('#back-plan').click();await page.locator('#plan-leave-dialog [value=save]').click();await page.locator('#view-plans').waitFor({state:'visible'});assert.equal((await state()).plans[0].name,'Retry');
  // Another tab changes global weight; its update must survive a stale draft save.
  await page.locator('[data-edit-plan]').first().click();await page.locator('#plan-form [name=name]').fill('Stale');const other=await context.newPage();await other.goto(url);await other.evaluate(()=>{const s=KairosTrainingData.createStore();s.load();s.update(v=>v.exercises[0].weightKg=30);});await other.close();
  await page.locator('#back-plan').click();await page.locator('#plan-leave-dialog [value=save]').click();assert.ok(await page.locator('#view-plan-editor').isVisible());assert.match(await page.locator('#plan-error').innerText(),/inzwischen geändert/);assert.equal((await state()).exercises[0].weightKg,30);assert.equal((await state()).plans[0].name,'Retry');
  await page.locator('#back-plan').click();await page.locator('#plan-leave-dialog [value=discard]').click();
  // Native Escape cancels and background return keeps the same editor DOM.
  await page.locator('[data-edit-plan]').first().click();await page.locator('#plan-form [name=description]').fill('Pending');await page.locator('#back-plan').click();await page.keyboard.press('Escape');assert.ok(await page.locator('#view-plan-editor').isVisible());
  await page.evaluate(()=>{window.savedInput=document.querySelector('#plan-form [name=name]');window.dispatchEvent(new Event('pagehide'));window.dispatchEvent(new Event('pageshow'));});assert.ok(await page.locator('#view-plan-editor').isVisible());assert.ok(await page.evaluate(()=>window.savedInput===document.querySelector('#plan-form [name=name]')));
  // Typing leaves scroll and node identity stable; navigation shell remains 80px.
  await page.locator('#plan-exercises input').last().scrollIntoViewIfNeeded();const scroll=await page.evaluate(()=>scrollY);await page.locator('#plan-exercises [data-draft-field=weightKg]').last().fill('12');assert.equal(await page.evaluate(()=>scrollY),scroll);
  const bar=await page.locator('.tabbar').boundingBox();assert.equal(bar.height,80);assert.equal(bar.y+bar.height,844);
  assert.deepEqual(errors,[]);console.log('PASS: isolated editor, no autofocus, draft CRUD/order/global weights, DOM stability, save/discard/cancel/Escape, tab leave, quota retry, multi-tab conflict, lifecycle and fixed navigation.');
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
