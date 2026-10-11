const test=require('node:test'),assert=require('node:assert/strict');
const D=require('../data.js'),S=require('../session.js'),M=require('../management.js');
function setup(){let raw=null,clock=1000;const storage={getItem:()=>raw,setItem:(k,v)=>{raw=v;}};const store=D.createStore({storage});store.load();const exercises=['A','B','C'].map(name=>D.createExercise({name}));const plan=D.createPlan({name:'Plan',exerciseIds:exercises.map(e=>e.id)});store.update(d=>{d.exercises=exercises;d.plans=[plan];d.planOrder=[plan.id];});const flow=S.create(store,D,()=>clock);flow.start(plan.id);return{store,flow,storage,manage:M.create(store,D),setTime:value=>{clock=value;}};}
test('timestamp duration and formatting keep hours/minutes/seconds across reload',()=>{
 assert.equal(S.formatDuration(0),'00:00:00');assert.equal(S.formatDuration(3661999),'01:01:01');assert.equal(S.formatDuration(360000000),'100:00:00');
 const{store,storage}=setup();const session=store.getState().activeSession;assert.equal(S.elapsed(session,3662000),3661000);
 const again=D.createStore({storage});again.load();assert.equal(S.elapsed(again.getState().activeSession,3662000),3661000);
});
test('partial finish preserves statuses and snapshots, immutable after edits, no duplicate',()=>{
 const{store,flow,setTime,manage}=setup();flow.complete();flow.skip();const active=store.getState().activeSession;setTime(3662000);
 assert.ok(flow.finish(active.id).ok);const final=store.getState().completedSessions[0];assert.equal(store.getState().activeSession,null);
 assert.equal(final.id,active.id);assert.equal(final.startedAt,1000);assert.equal(final.endedAt,3662000);assert.equal(final.durationMs,3661000);assert.deepEqual(final.exercises.map(e=>e.status),['completed','skipped','open']);
 assert.deepEqual(S.progress(final),{completed:1,total:3,percent:33});assert.equal(flow.finish(active.id).ok,false);assert.equal(store.getState().completedSessions.length,1);
 manage.deleteExercise(final.exercises[0].id);manage.deletePlan(final.planId);assert.deepEqual(store.getState().completedSessions[0],final);assert.deepEqual(store.getSavedState().completedSessions[0],final);
});
test('100% needs explicit finish; retry safely keeps active state on storage failure',()=>{
 const{store,flow,storage,setTime}=setup();flow.complete();flow.complete();flow.complete();assert.ok(store.getState().activeSession);const active=store.getState().activeSession,raw=storage.getItem();const write=storage.setItem;
 storage.setItem=()=>{throw new Error('quota');};setTime(5000);assert.equal(flow.finish(active.id).ok,false);assert.deepEqual(store.getState().activeSession,active);assert.equal(store.getState().completedSessions.length,0);assert.equal(storage.getItem(),raw);
 assert.equal(store.getSavedState().completedSessions.length,0);storage.setItem=write;setTime(6000);assert.ok(flow.finish(active.id).ok);assert.equal(store.getState().completedSessions.length,1);assert.equal(store.getState().completedSessions[0].durationMs,5000);
});
test('pending unsaved progress survives failed finish and saves atomically with completion',()=>{
 const{store,flow,storage,setTime}=setup();const write=storage.setItem;storage.setItem=()=>{throw new Error('quota');};flow.complete();assert.ok(store.getStatus().dirty);const pending=store.getState();
 setTime(4000);assert.equal(flow.finish(pending.activeSession.id).ok,false);assert.deepEqual(store.getState(),pending);assert.ok(store.getStatus().dirty);assert.equal(store.getSavedState().activeSession.exercises[0].status,'open');
 storage.setItem=write;assert.ok(flow.finish(pending.activeSession.id).ok);assert.equal(store.getSavedState().completedSessions[0].exercises[0].status,'completed');assert.equal(store.getSavedState().activeSession,null);
});
test('wrong session, clock regression and external storage conflict do not lose unit',()=>{
 const{store,flow,setTime,storage}=setup();const active=store.getState().activeSession;
 assert.equal(flow.finish('wrong').ok,false);setTime(900);assert.equal(flow.finish(active.id).ok,false);assert.deepEqual(store.getState().activeSession,active);
 setTime(2000);storage.setItem(D.STORAGE_KEY,JSON.stringify(D.emptyState()));assert.equal(flow.finish(active.id).ok,false);assert.ok(store.getStatus().blocked);assert.deepEqual(store.getState().activeSession,active);
});
