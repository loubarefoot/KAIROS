const test=require('node:test'),assert=require('node:assert/strict');
const D=require('../data.js'),S=require('../session.js');
function fixture(){let raw=null;const storage={getItem:()=>raw,setItem:(key,value)=>{raw=value;}};const store=D.createStore({storage});store.load();store.update(state=>{state.exercises=['A','B'].map((name,i)=>D.createExercise({name,weightKg:10+i*10}));const p=D.createPlan({name:'Plan',exerciseIds:state.exercises.map(e=>e.id)});state.plans=[p];state.planOrder=[p.id];});const flow=S.create(store,D,()=>1000);flow.start(store.getState().plans[0].id);return{store,flow,storage};}
test('stale weight context after another tab advances never edits the other exercise',()=>{
 const {store,flow,storage}=fixture(),context=flow.weightContext();const other=D.createStore({storage});other.load();S.create(other,D,()=>1000).complete();
 const previous=other.getState(),raw=storage.getItem();assert.equal(flow.changeWeight({weightKg:99,isMax:false,repetitions:10},context).ok,false);
 assert.deepEqual(store.getState(),previous);assert.equal(storage.getItem(),raw);assert.match(store.getStatus().message,/veraltet/);
 const current=flow.weightContext();assert.ok(flow.changeWeight({weightKg:25.25,isMax:false,repetitions:12},current).ok);
 assert.equal(store.getState().exercises[0].weightKg,10);assert.equal(store.getState().exercises[1].weightKg,25.25);assert.equal(store.getState().activeSession.exercises[1].weightKg,25.25);
});
test('contexts detect changed values and another training identity even for the same exercise',()=>{
 const {store,flow}=fixture(),context=flow.weightContext();store.update(state=>{state.exercises[0].weightKg=15;});
 assert.equal(flow.changeWeight({weightKg:99,isMax:false,repetitions:10},context).ok,false);assert.equal(store.getState().exercises[0].weightKg,15);
 const fresh=flow.weightContext();flow.finish(fresh.sessionId);flow.start(store.getState().plans[0].id);assert.equal(flow.changeWeight({weightKg:99,isMax:false,repetitions:10},fresh).ok,false);
});
test('invalid calendar dates and out-of-range timestamps cannot replace valid backups',()=>{
 let raw=null;const storage={getItem:()=>raw,setItem:(key,value)=>{raw=value;}};const target=D.createStore({storage});target.load();target.update(state=>{state.settings.lastOpenedDay='2024-02-29';});const previous=target.getState(),saved=raw;
 for(const day of ['2026-99-99','2025-02-29','2026-04-31','2026-00-01','2026-01-00']){const state=D.emptyState();state.settings.lastOpenedDay=day;assert.equal(target.importJSON(JSON.stringify(state),{confirmed:true}).ok,false);assert.deepEqual(target.getState(),previous);assert.equal(raw,saved);}
 for(const date of ['2024-02-29','2026-02-28','2000-02-29','1900-02-28']){const state=D.emptyState();state.settings.lastOpenedDay=date;assert.ok(D.validateBackup(state));}
 const source=fixture().store.getState();for(const value of [8640000000000001,9000000000000000]){const state=structuredClone(source);state.activeSession.startedAt=value;assert.throws(()=>D.parseBackup(JSON.stringify(state)));state.activeSession.startedAt=1000;state.settings.lastBackgroundAt=value;assert.throws(()=>D.parseBackup(JSON.stringify(state)));}
 const edge=structuredClone(source);edge.activeSession.startedAt=8640000000000000;edge.activeSession.lastActivityAt=8640000000000000;assert.ok(D.validateBackup(edge));
});
