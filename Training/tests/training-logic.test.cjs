const test=require('node:test'),assert=require('node:assert/strict');
const D=require('../data.js'),M=require('../management.js'),S=require('../session.js');
function fixture(){let raw=null,clock=1000,fail=false,writes=0;const storage={getItem:()=>raw,setItem:(k,v)=>{if(fail)throw Error('quota');raw=v;writes++;}};
 const store=D.createStore({storage});store.load();const exercises=['A','B','C','D'].map((name,i)=>D.createExercise({name,weightKg:i*10,isMax:i===1,repetitions:10+i}));const plan=D.createPlan({name:'Plan',exerciseIds:exercises.map(e=>e.id)}),other=D.createPlan({name:'Other',exerciseIds:exercises.slice(0,2).map(e=>e.id)});
 store.update(v=>{v.exercises=exercises;v.plans=[plan,other];v.planOrder=[plan.id,other.id];});const now=()=>clock,flow=S.create(store,D,now),manage=M.create(store,D,now);flow.start(plan.id);flow.finish(store.getState().activeSession.id);flow.start(plan.id);
 return {store,storage,flow,manage,plan,other,exercises,time:t=>clock=t,fail:v=>fail=v,writes:()=>writes};}
test('atomic saved reorder preserves every snapshot value/status, manual selection, global weights and history',()=>{
 const f=fixture();f.flow.select(2);f.flow.complete();f.flow.complete();f.flow.select(3);f.flow.changeWeight({weightKg:'27,25',isMax:false,repetitions:14});const before=f.store.getState(),draft=f.manage.beginDraft(f.plan.id);
 draft.plan.exerciseIds=[f.exercises[3].id,f.exercises[2].id,f.exercises[0].id,f.exercises[1].id];assert.deepEqual(f.store.getState(),before);f.time(2000);const writes=f.writes();assert.ok(f.manage.saveDraft(draft).ok);assert.equal(f.writes(),writes+1);
 const after=f.store.getState();assert.deepEqual(after.activeSession.exercises.map(e=>e.id),draft.plan.exerciseIds);assert.equal(after.activeSession.exercises[after.activeSession.currentIndex].id,f.exercises[3].id);assert.equal(after.activeSession.lastActivityAt,2000);
 for(const item of before.activeSession.exercises)assert.deepEqual(after.activeSession.exercises.find(e=>e.id===item.id),item);
 assert.deepEqual(after.activeSession.exercises.filter(e=>e.status==='completed').map(e=>e.name),['C','A']);assert.deepEqual(after.activeSession.exercises.filter(e=>e.status!=='completed').map(e=>e.name),['D','B']);assert.deepEqual(after.completedSessions,before.completedSessions);assert.deepEqual(after.exercises,before.exercises);assert.deepEqual(after.plans[1],before.plans[1]);
 f.flow.complete();assert.equal(f.store.getState().activeSession.exercises[f.store.getState().activeSession.currentIndex].name,'B');
});
test('completion always selects the first unfinished exercise including skipped; completed cannot be selected again',()=>{
 const f=fixture();f.flow.select(2);f.flow.complete();assert.equal(f.store.getState().activeSession.currentIndex,0);f.flow.skip();assert.equal(f.store.getState().activeSession.currentIndex,1);f.flow.select(3);f.flow.complete();assert.equal(f.store.getState().activeSession.currentIndex,0);
 assert.equal(f.flow.select(2).ok,false);f.flow.complete();f.flow.complete();assert.equal(S.progress(f.store.getState().activeSession).percent,100);assert.ok(f.store.getState().activeSession);assert.equal(f.store.getState().completedSessions.length,1);
});
test('repeated reorder, unrelated plans, names, additions and removals preserve active membership and selected identity',()=>{
 const f=fixture();f.flow.select(2);let before=f.store.getState().activeSession;f.time(2000);f.manage.reorder(f.other.id,0,1);assert.deepEqual(f.store.getState().activeSession,before);
 for(const [from,to] of [[0,3],[3,1],[2,0],[0,2]]){f.manage.reorder(f.plan.id,from,to);const active=f.store.getState().activeSession;assert.equal(active.exercises[active.currentIndex].id,f.exercises[2].id);assert.equal(new Set(active.exercises.map(e=>e.id)).size,4);}
 const draft=f.manage.beginDraft(f.plan.id),extra=D.createExercise({name:'Extra'});draft.exercises.push(extra);draft.plan.exerciseIds=draft.plan.exerciseIds.filter(id=>id!==f.exercises[2].id).reverse();draft.plan.exerciseIds.push(extra.id);draft.plan.name='New name';assert.ok(f.manage.saveDraft(draft).ok);
 const active=f.store.getState().activeSession;assert.equal(active.planName,'Plan');assert.equal(active.exercises.length,4);assert.ok(active.exercises.some(e=>e.id===f.exercises[2].id));assert.ok(!active.exercises.some(e=>e.id===extra.id));assert.equal(active.exercises[active.currentIndex].id,f.exercises[2].id);
});
test('reorder write failures and stale drafts cannot partially change a plan or active session',()=>{
 const f=fixture(),before=f.store.getState(),raw=f.storage.getItem(),draft=f.manage.beginDraft(f.plan.id);draft.plan.exerciseIds.reverse();f.fail(true);assert.equal(f.manage.saveDraft(draft).ok,false);assert.deepEqual(f.store.getState(),before);assert.equal(f.storage.getItem(),raw);assert.equal(f.manage.reorder(f.plan.id,0,3).ok,false);assert.deepEqual(f.store.getState(),before);
 f.fail(false);assert.ok(f.manage.saveDraft(draft).ok);const stale=f.manage.beginDraft(f.plan.id),other=D.createStore({storage:f.storage});other.load();S.create(other,D,()=>3000).changeWeight({weightKg:99,isMax:false,repetitions:10});const saved=f.storage.getItem();stale.plan.exerciseIds.reverse();assert.equal(f.manage.saveDraft(stale).ok,false);assert.equal(f.storage.getItem(),saved);
});
test('validation rejects unbound reorders, changed snapshot values during reorder, missing/duplicate IDs and timestamp regressions',()=>{
 const f=fixture(),before=f.store.getState();assert.equal(f.store.update(s=>s.activeSession.exercises.reverse()).ok,false);
 assert.equal(f.store.update(s=>{s.plans[0].exerciseIds.reverse();s.activeSession.exercises.reverse();s.activeSession.exercises[0].weightKg=99;}).ok,false);
 assert.equal(f.store.update(s=>s.activeSession.exercises.pop()).ok,false);assert.equal(f.store.update(s=>s.activeSession.lastActivityAt=0).ok,false);assert.deepEqual(f.store.getState(),before);
 for(const value of [-1,NaN,Infinity,'1000',9000000000000000]){const raw=structuredClone(before);raw.activeSession.lastActivityAt=value;assert.throws(()=>D.validateState(raw));}
});
test('exact inactivity boundary persists discard only, never a completion, and retains durable global weights/history',()=>{
 const f=fixture();f.time(2000);f.flow.changeWeight({weightKg:25.25,isMax:true,repetitions:12});const before=f.store.getState();f.time(2000+D.INACTIVITY_MS-1);assert.equal(f.flow.expire().expired,false);f.time(2000+D.INACTIVITY_MS);assert.ok(f.flow.expire().ok);assert.equal(f.store.getState().activeSession,null);assert.deepEqual(f.store.getState().completedSessions,before.completedSessions);assert.deepEqual(f.store.getState().exercises,before.exercises);const again=D.createStore({storage:f.storage});again.load();assert.equal(again.getState().activeSession,null);
});
test('all relevant actions reset activity, passive load/export/settings and invalid actions do not',()=>{
 const f=fixture();for(const [time,action] of [[2000,()=>f.flow.select(2)],[3000,()=>f.flow.skip()],[4000,()=>f.flow.complete()],[5000,()=>f.flow.changeWeight({weightKg:0,isMax:false,repetitions:10})],[6000,()=>f.manage.reorder(f.plan.id,0,3)]]){f.time(time);assert.ok(action().ok);assert.equal(f.store.getState().activeSession.lastActivityAt,time);}
 const before=f.store.getState().activeSession.lastActivityAt;f.time(7000);f.store.refresh();f.store.exportJSON();f.store.update(s=>s.settings.lastView='settings');f.flow.select(-1);assert.equal(f.store.getState().activeSession.lastActivityAt,before);
});
test('expired actions and expired reorder cannot resurrect or complete an old session',()=>{
 for(const action of ['complete','skip','select','changeWeight','finish','reorder']){const f=fixture(),before=f.store.getState();f.time(1000+D.INACTIVITY_MS);let result;if(action==='select')result=f.flow.select(1);else if(action==='changeWeight')result=f.flow.changeWeight({weightKg:99,isMax:false,repetitions:10});else if(action==='finish')result=f.flow.finish(before.activeSession.id);else if(action==='reorder')result=f.manage.reorder(f.plan.id,0,3);else result=f.flow[action]();assert.equal(f.store.getState().activeSession,null,action);assert.deepEqual(f.store.getState().completedSessions,before.completedSessions);assert.deepEqual(f.store.getState().exercises,before.exercises);if(action!=='reorder')assert.equal(result.ok,false);}
});
test('legacy sessions use original startedAt without rewriting historical data; backups roundtrip optional activity',()=>{
 const f=fixture();let raw=f.store.getState();delete raw.activeSession.lastActivityAt;f.storage.setItem(D.STORAGE_KEY,JSON.stringify(raw));const fresh=D.createStore({storage:f.storage});assert.ok(fresh.load().ok);assert.ok(D.parseBackup(fresh.exportJSON()));const flow=S.create(fresh,D,()=>1000+D.INACTIVITY_MS);assert.ok(flow.expire().ok);assert.equal(fresh.getState().activeSession,null);assert.deepEqual(fresh.getState().completedSessions,raw.completedSessions);
 const g=fixture();assert.deepEqual(D.parseBackup(g.store.exportJSON()),g.store.getState());g.flow.finish(g.store.getState().activeSession.id);assert.ok(g.store.getState().completedSessions.every(s=>s.lastActivityAt===undefined));
});
test('expiry write failures retain original storage and can be retried; corrupt or dirty conflicting stores stay protected',()=>{
 const f=fixture(),before=f.store.getState(),raw=f.storage.getItem();f.time(1000+D.INACTIVITY_MS);f.fail(true);assert.equal(f.flow.expire().ok,false);assert.deepEqual(f.store.getState(),before);assert.equal(f.storage.getItem(),raw);assert.equal(f.flow.complete().ok,false);f.fail(false);assert.ok(f.flow.expire().ok);assert.equal(f.store.getState().activeSession,null);
 const g=fixture();g.storage.setItem(D.STORAGE_KEY,'broken');g.time(1000+D.INACTIVITY_MS);assert.equal(g.flow.expire().ok,false);assert.equal(g.storage.getItem(),'broken');assert.ok(g.store.getStatus().blocked);
 const h=fixture();h.fail(true);h.flow.complete();h.fail(false);const pending=h.store.getState(),external=JSON.stringify({...pending,settings:{...pending.settings,lastView:'settings'}});h.storage.setItem(D.STORAGE_KEY,external);h.time(1000+D.INACTIVITY_MS);assert.equal(h.flow.expire().ok,false);assert.ok(h.store.getStatus().blocked);assert.equal(h.storage.getItem(),external);assert.deepEqual(h.store.getState(),pending);
});
test('external recent activity prevents expiry; stale complete and ID-based selection cannot target a different exercise after reorder',()=>{
 const f=fixture(),s=f.store.getState().activeSession,context={sessionId:s.id,exerciseId:s.exercises[0].id};const other=D.createStore({storage:f.storage});other.load();const of=S.create(other,D,()=>1000+D.INACTIVITY_MS-1);of.select(1);f.time(1000+D.INACTIVITY_MS);assert.equal(f.flow.expire().expired,false);assert.equal(f.flow.complete(context).ok,false);assert.equal(f.store.getState().activeSession.exercises[1].status,'open');
 const draft=M.create(other,D,()=>1000+D.INACTIVITY_MS).beginDraft(f.plan.id);draft.plan.exerciseIds.reverse();M.create(other,D,()=>1000+D.INACTIVITY_MS).saveDraft(draft);assert.ok(f.flow.select(0,{sessionId:s.id,exerciseId:s.exercises[0].id}).ok);const active=f.store.getState().activeSession;assert.equal(active.exercises[active.currentIndex].id,s.exercises[0].id);
});
