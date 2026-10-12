/* Optional browser regression runner; use an already installed playwright-core. */
const {chromium}=require(process.env.KAIROS_PLAYWRIGHT_MODULE || 'playwright-core');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
(async()=>{
 let failedUpdate=false;
 const root=path.resolve(__dirname,'..');
 const server=http.createServer((req,res)=>{
  const name=req.url.split('?')[0].split('/KAIROS/Training/')[1]||'index.html';
  if(!['index.html','styles.css','data.js','library.js','management.js','session.js','navigation.js','app.js','sw.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'].includes(name)){res.writeHead(404);res.end();return;}
  let body=fs.readFileSync(path.join(root,name));
  if(failedUpdate && name==='app.js')body=Buffer.concat([body,Buffer.from('\n// Changed audit build\n')]);
  if(failedUpdate && name==='sw.js'){
   const old=fs.readFileSync(path.join(root,'app.js'));
   const changed=Buffer.concat([old,Buffer.from('\n// Changed audit build\n')]);
   body=body.toString().replace(crypto.createHash('sha256').update(old).digest('hex'),crypto.createHash('sha256').update(changed).digest('hex')).replace('cache.put(url, responses[i])',"(url.endsWith('app.js') ? Promise.reject(new Error('quota')) : cache.put(url, responses[i]))");
  }
  res.setHeader('Content-Type',name.endsWith('.png')?'image/png':name.endsWith('.webmanifest')?'application/manifest+json':name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html');res.setHeader('Cache-Control','no-store');res.end(body);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.KAIROS_CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage(),url='http://127.0.0.1:'+server.address().port+'/KAIROS/Training/';
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(url);await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  assert.equal(await page.evaluate(()=>document.activeElement.tagName==='H1'),false);
  for(const [width,height] of [[320,568],[375,667],[390,844],[430,932],[844,390]]){
   await page.setViewportSize({width,height});
   await page.locator('[data-tab=settings]').click();
   await page.locator('[data-view=exercises]:visible').click();
   const before=await page.locator('.tabbar').boundingBox();
   assert.ok(Math.abs(before.y+before.height-height)<1);
   assert.equal(await page.locator('.tab').last().evaluate(e=>getComputedStyle(e).marginTop),'0px');
   await page.evaluate(()=>document.getElementById('main').scrollTo(0,100000));
   await page.waitForFunction(()=>document.getElementById('main').scrollTop>0);
   const after=await page.locator('.tabbar').boundingBox();assert.deepEqual(after,before);
   const last=await page.locator('#view-exercises > button').last().boundingBox();
   assert.ok(last.y+last.height<=after.y);
   assert.equal(await page.evaluate(()=>scrollY),0);
   await page.locator('[data-tab=settings]').click();
   assert.equal(await page.evaluate(()=>document.getElementById('main').scrollTop),0);
   await page.reload();assert.equal(await page.evaluate(()=>document.activeElement.tagName==='H1'),false);
   await page.evaluate(()=>{window.dispatchEvent(new Event('pagehide'));window.dispatchEvent(new Event('pageshow'));});
   assert.equal(await page.evaluate(()=>document.activeElement.tagName==='H1'),false);
   const short=await page.locator('.tabbar').boundingBox();assert.ok(Math.abs(short.y+short.height-height)<1);
  }
  await page.setViewportSize({width:390,height:844});
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(()=>document.activeElement.matches(':focus-visible')),true);
  await page.locator('[data-tab=training]').focus();await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(()=>document.activeElement.tagName),'H1');
  assert.equal(await page.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle),'solid');
  const cdp=await context.newCDPSession(page);
  try{
   await cdp.send('Emulation.setSafeAreaInsets',{insets:{top:0,left:0,bottom:34,right:0}});
   assert.equal(await page.locator('.tabbar').evaluate(e=>getComputedStyle(e).paddingBottom),'34px');
   const bar=await page.locator('.tabbar').boundingBox();assert.ok(Math.abs(bar.y+bar.height-844)<1);
   await cdp.send('Emulation.setSafeAreaInsets',{insets:{top:0,left:0,bottom:0,right:0}});
   console.log('PASS: emulated 34px safe area.');
  }catch(error){if(!error.message.includes('wasn’t found')&&!error.message.includes("wasn't found"))throw error;console.log('Safe-area emulation unavailable; physical iPhone check required.');}
  const simulatedSafeArea=await page.addStyleTag({content:fs.readFileSync(path.join(root,'styles.css'),'utf8').replaceAll('env(safe-area-inset-bottom, 0px)','34px')});
  assert.equal(await page.locator('.tabbar').evaluate(e=>getComputedStyle(e).paddingBottom),'34px');
  await page.locator('[data-tab=settings]').click();
  assert.equal(await page.locator('#title-settings').evaluate(e=>getComputedStyle(e).outlineStyle),'none');
  await page.locator('[data-view=exercises]:visible').click();
  await page.evaluate(()=>document.getElementById('main').scrollTo(0,100000));
  const safeBar=await page.locator('.tabbar').boundingBox(),safeLast=await page.locator('#view-exercises > button').last().boundingBox();
  assert.ok(Math.abs(safeBar.y+safeBar.height-844)<1);assert.ok(safeLast.y+safeLast.height<=safeBar.y);
  await simulatedSafeArea.evaluate(e=>e.remove());
  await page.locator('[data-tab=training]').click();
  console.log('PASS: short/long views, isolated content scrolling, bottom anchoring across five viewports, reopen focus and keyboard indicators.');
  console.log('PASS: simulated 34px bottom inset, final content reachable, pointer heading has no outline.');

  await page.evaluate(()=>{const D=KairosTrainingData,s=D.createStore();s.load();s.update(state=>{state.exercises.slice(0,3).forEach((exercise,i)=>{exercise.weightKg=10+i*10;});state.plans=['One','Two','Three'].map(name=>D.createPlan({name,exerciseIds:state.exercises.slice(0,3).map(e=>e.id)}));state.planOrder=state.plans.map(p=>p.id);});});
  await page.reload();await page.locator('[data-start-plan]:visible').first().click();await page.locator('#edit-training-weight').click();
  const other=await context.newPage();await other.goto(url);await other.locator('#complete-exercise').click();await page.waitForFunction(()=>document.querySelector('.exercise-name').textContent==='Bankdrücken mit Kurzhanteln');
  await page.locator('#training-weight-form [type=submit]').click();await page.locator('#storage-status').waitFor({state:'visible'});assert.match(await page.locator('#storage-status').innerText(),/veraltet/);
  const weights=await page.evaluate(()=>JSON.parse(localStorage.getItem(KairosTrainingData.STORAGE_KEY)).exercises.slice(0,2).map(e=>e.weightKg));assert.deepEqual(weights,[10,20]);
  await other.close();await page.locator('#edit-training-weight').click();await page.locator('#training-weight-form [name=weight]').fill('25,25');await page.locator('#training-weight-form [type=submit]').click();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem(KairosTrainingData.STORAGE_KEY)).exercises[1].weightKg),25.25);
  await page.getByRole('button',{name:'Zurück zu Training',exact:true}).click();assert.match(await page.locator('#active-overview').innerText(),/One.*läuft/);assert.ok(!(await page.locator('#active-overview').innerText()).includes('Noch kein'));
  await page.locator('[data-tab=settings]').click();await page.getByRole('button',{name:'Trainingspläne öffnen',exact:true}).click();
  await page.locator('#plan-list [data-index="0"] [data-move="1"]').focus();await page.keyboard.press('Enter');assert.ok(await page.locator('#plan-list [data-index="1"] [data-move="1"]').evaluate(e=>e===document.activeElement));await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem(KairosTrainingData.STORAGE_KEY)).plans.find(p=>p.id===JSON.parse(localStorage.getItem(KairosTrainingData.STORAGE_KEY)).planOrder[2]).name),'One');
  await page.locator('#plan-list [data-index="2"] [data-edit-plan]').click();await page.locator('#plan-exercises [data-index="0"] [data-move="1"]').focus();await page.keyboard.press('Enter');assert.ok(await page.locator('#plan-exercises [data-index="1"] [data-move="1"]').evaluate(e=>e===document.activeElement));await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.dataset.move),'-1');
  await page.locator('[data-tab=training]').click();await page.locator('#finish-training').click();await page.locator('#confirm-dialog [value=delete]').click();await page.locator('#view-summary').waitFor({state:'visible'});
  await page.getByRole('button',{name:'Zur Trainingsübersicht',exact:true}).click();assert.equal(await page.locator('#active-overview').innerText(),'Noch kein Training gestartet.');
  await page.locator('[data-tab=settings]').click();await page.locator('[data-view=backup]').click();
  const raw=await page.evaluate(()=>localStorage.getItem(KairosTrainingData.STORAGE_KEY));const invalid=JSON.parse(raw);invalid.settings.lastOpenedDay='2025-02-29';
  await page.locator('#import-training').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(invalid))});await page.waitForFunction(()=>document.getElementById('backup-status').textContent.includes('Import nicht übernommen'));assert.equal(await page.evaluate(()=>localStorage.getItem(KairosTrainingData.STORAGE_KEY)),raw);assert.ok(await page.locator('#confirm-dialog').isHidden());
  const before=await page.evaluate(()=>caches.keys());failedUpdate=true;
  await page.evaluate(async()=>{const reg=await navigator.serviceWorker.getRegistration();await reg.update();if(reg.installing)await new Promise(resolve=>{const worker=reg.installing;worker.addEventListener('statechange',()=>{if(['redundant','installed'].includes(worker.state))resolve();});});});
  assert.deepEqual(await page.evaluate(()=>caches.keys()),before);assert.equal(await page.evaluate(async()=>!!(await navigator.serviceWorker.getRegistration()).waiting),false);
  await context.setOffline(true);await page.reload();assert.ok(await page.locator('#view-backup').isVisible());assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem(KairosTrainingData.STORAGE_KEY)).completedSessions.length),1);
  for(const width of [320,390,844,1280]){await page.setViewportSize({width,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  assert.deepEqual(errors,[]);console.log('PASS: stale multi-tab form rejected, regular global weight saved, plan/exercise keyboard focus repeated, active overview, invalid backup preserved, reused VERSION failed update keeps offline shell, mobile widths.');
 }finally{if(browser)await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
