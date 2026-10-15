const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const source=fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8');
function worker({missing=false,corrupt=false,putFail=false,stores:existingStores,version,hashes,resource="navigation.js",wrongMime=false,redirected=false}={}){
 const handlers={}, stores=existingStores || new Map([['kairos-training-shell:https://example.test/Training/:old',new Map()],['weight-cache',new Map()]]);
 const caches={keys:async()=>[...stores.keys()],delete:async name=>stores.delete(name),open:async name=>{if(!stores.has(name))stores.set(name,new Map());const map=stores.get(name);return{put:async(key,response)=>{if(putFail&&key.endsWith('app.js'))throw Error('quota');map.set(key,response.clone());},match:async key=>map.get(key)?.clone()};}};
 let claims=0;
 const fetch=async request=>{const name=new URL(typeof request==='string'?request:request.url).pathname.split('/Training/')[1];if(missing&&name===resource)return new Response('missing',{status:404});if(wrongMime&&name===resource)return new Response('wrong type',{headers:{'content-type':'text/html'}});const body=fs.readFileSync(path.join(__dirname,'../'+name));const response=new Response(corrupt&&name===resource?Buffer.concat([body,Buffer.from('broken')]):body,{headers:{'content-type':name.endsWith('.html')?'text/html':name.endsWith('.css')?'text/css':name.endsWith('.png')?'image/png':name.endsWith('.webmanifest')?'application/manifest+json':'application/javascript'}});if(redirected&&name===resource)Object.defineProperty(response,'redirected',{value:true});return response;};
 let script=version ? source.replace(/const VERSION = '[^']+';/, "const VERSION = '"+version+"';") : source;
 if(hashes) script=script.replace(/const HASHES = [\s\S]*?;\nconst cacheName/, 'const HASHES = '+JSON.stringify(hashes)+';\nconst cacheName');
 vm.runInNewContext(script,{self:{registration:{scope:'https://example.test/Training/'},clients:{claim:async()=>{claims++;}},addEventListener:(type,fn)=>{handlers[type]=fn;}},fetch,caches,Request,Response,Headers,URL,TextEncoder,crypto:crypto.webcrypto});
 const dispatch=async(type,extra={})=>{let promise;handlers[type]({...extra,waitUntil:value=>{promise=value;},respondWith:value=>{promise=value;}});return promise?await promise:undefined;};
 return {dispatch,stores,getClaims:()=>claims};
}
test('shell hashes match files; full cache activation preserves other module caches',async()=>{
 const w=worker();await w.dispatch('install');const current=[...w.stores.keys()].find(k=>k.includes(':v22:'));assert.equal(w.stores.get(current).size,13);
 await w.dispatch('activate');assert.ok(![...w.stores.keys()].some(k=>k.endsWith(':old')));assert.ok(w.stores.has('weight-cache'));assert.equal(w.getClaims(),1);
});
test('missing or corrupted shell fails install and keeps existing offline version',async()=>{
 for(const options of [{missing:true},{corrupt:true}]){const w=worker(options);await assert.rejects(w.dispatch('install'));assert.ok([...w.stores.keys()].some(k=>k.endsWith(':old')));assert.ok(![...w.stores.keys()].some(k=>k.includes(':v22:')));}
});
test('only local Training shell requests and Training entry navigations are cached',async()=>{
 const w=worker();await w.dispatch('install');
 const nav=await w.dispatch('fetch',{request:{url:'https://example.test/Training/?pwa=1',method:'GET',mode:'navigate'}});assert.match(await nav.text(),/KAIROS – Training/);
 assert.equal(await w.dispatch('fetch',{request:{url:'https://example.test/Weight/',method:'GET',mode:'navigate'}}),undefined);
 assert.equal(await w.dispatch('fetch',{request:{url:'https://external.test/Training/app.js',method:'GET',mode:'cors'}}),undefined);
 assert.equal(await w.dispatch('fetch',{request:{url:'https://example.test/Training/app.js',method:'POST',mode:'cors'}}),undefined);
});

test('failed cache writes remove only the incomplete new version',async()=>{
 const w=worker({putFail:true});await assert.rejects(w.dispatch('install'));assert.ok([...w.stores.keys()].some(k=>k.endsWith(':old')));assert.ok(w.stores.has('weight-cache'));assert.ok(![...w.stores.keys()].some(k=>k.includes(':v22:')));
});

test('reused VERSION with changed content cannot delete the prior working shell on write failure',async()=>{
 const hashes=JSON.parse(source.match(/const HASHES = ([\s\S]*?);\n/)[1]);
 const priorHashes={...hashes,'app.js':'previous-build'};
 const scope='https://example.test/Training/',prefix='kairos-training-shell:'+scope+':v22:';
 const previous=prefix+crypto.createHash('sha256').update(JSON.stringify(priorHashes)).digest('hex');
 const stores=new Map([[previous,new Map([['https://example.test/Training/index.html',new Response('old working shell')]])],['weight-cache',new Map()]]);
 const w=worker({putFail:true,stores});await assert.rejects(w.dispatch('install'));
 assert.ok(stores.has(previous));assert.equal(await stores.get(previous).get(scope+'index.html').clone().text(),'old working shell');assert.equal(stores.size,2);
});
test('identical complete cache survives a code-only reinstall and worker restart without writes',async()=>{
 const w=worker();await w.dispatch('install');const names=[...w.stores.keys()];
 const restarted=worker({stores:w.stores,putFail:true});await restarted.dispatch('install');assert.deepEqual([...w.stores.keys()],names);
 const response=await restarted.dispatch('fetch',{request:{url:'https://example.test/Training/',method:'GET',mode:'navigate'}});assert.match(await response.text(),/KAIROS – Training/);
});

test('missing, corrupted, wrong-MIME or redirected PWA resources preserve the prior shell',async()=>{
 for(const resource of ['manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png']) {
  for(const failure of ['missing','corrupt','wrongMime','redirected']) {
   const w=worker({resource,[failure]:true});await assert.rejects(w.dispatch('install'));
   assert.ok(w.stores.has('kairos-training-shell:https://example.test/Training/:old'));
   assert.ok(w.stores.has('weight-cache'));assert.equal(w.stores.size,2);
  }
 }
});
