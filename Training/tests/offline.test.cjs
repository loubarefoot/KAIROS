const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const source=fs.readFileSync(path.join(__dirname,'../sw.js'),'utf8');
function worker({missing=false,corrupt=false,putFail=false}={}){
 const handlers={}, stores=new Map([['kairos-training-shell:https://example.test/Training/:old',new Map()],['weight-cache',new Map()]]);
 const caches={keys:async()=>[...stores.keys()],delete:async name=>stores.delete(name),open:async name=>{if(!stores.has(name))stores.set(name,new Map());const map=stores.get(name);return{put:async(key,response)=>{if(putFail&&key.endsWith('app.js'))throw Error('quota');map.set(key,response);},match:async key=>map.get(key)};}};
 let claims=0;
 const fetch=async request=>{const name=new URL(typeof request==='string'?request:request.url).pathname.split('/').pop();if(missing&&name==='navigation.js')return new Response('missing',{status:404});const body=fs.readFileSync(path.join(__dirname,'../'+name));return new Response(corrupt&&name==='navigation.js'?Buffer.concat([body,Buffer.from('broken')]):body,{headers:{'content-type':name.endsWith('.html')?'text/html':name.endsWith('.css')?'text/css':'application/javascript'}});};
 vm.runInNewContext(source,{self:{registration:{scope:'https://example.test/Training/'},clients:{claim:async()=>{claims++;}},addEventListener:(type,fn)=>{handlers[type]=fn;}},fetch,caches,Request,Response,Headers,URL,crypto:crypto.webcrypto});
 const dispatch=async(type,extra={})=>{let promise;handlers[type]({...extra,waitUntil:value=>{promise=value;},respondWith:value=>{promise=value;}});return promise?await promise:undefined;};
 return {dispatch,stores,getClaims:()=>claims};
}
test('shell hashes match files; full cache activation preserves other module caches',async()=>{
 const w=worker();await w.dispatch('install');const current=[...w.stores.keys()].find(k=>k.endsWith(':v1'));assert.equal(w.stores.get(current).size,8);
 await w.dispatch('activate');assert.ok(![...w.stores.keys()].some(k=>k.endsWith(':old')));assert.ok(w.stores.has('weight-cache'));assert.equal(w.getClaims(),1);
});
test('missing or corrupted shell fails install and keeps existing offline version',async()=>{
 for(const options of [{missing:true},{corrupt:true}]){const w=worker(options);await assert.rejects(w.dispatch('install'));assert.ok([...w.stores.keys()].some(k=>k.endsWith(':old')));assert.ok(![...w.stores.keys()].some(k=>k.endsWith(':v1')));}
});
test('only local Training shell requests and Training entry navigations are cached',async()=>{
 const w=worker();await w.dispatch('install');
 const nav=await w.dispatch('fetch',{request:{url:'https://example.test/Training/?pwa=1',method:'GET',mode:'navigate'}});assert.match(await nav.text(),/KAIROS – Training/);
 assert.equal(await w.dispatch('fetch',{request:{url:'https://example.test/Weight/',method:'GET',mode:'navigate'}}),undefined);
 assert.equal(await w.dispatch('fetch',{request:{url:'https://external.test/Training/app.js',method:'GET',mode:'cors'}}),undefined);
 assert.equal(await w.dispatch('fetch',{request:{url:'https://example.test/Training/app.js',method:'POST',mode:'cors'}}),undefined);
});

test('failed cache writes remove only the incomplete new version',async()=>{
 const w=worker({putFail:true});await assert.rejects(w.dispatch('install'));assert.ok([...w.stores.keys()].some(k=>k.endsWith(':old')));assert.ok(w.stores.has('weight-cache'));assert.ok(![...w.stores.keys()].some(k=>k.endsWith(':v1')));
});
