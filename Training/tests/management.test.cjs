const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const D = require('../data.js'), L = require('../library.js'), M = require('../management.js');
function setup(raw = null) {
  let value=raw;const storage={getItem:()=>value,setItem:(key,v)=>{value=v;}};
  const store=D.createStore({storage});store.load();return {store,storage,manage:M.create(store,D),raw:()=>value};
}
test('library matches exactly all 52 approved names; seed once only in absent valid storage',()=>{
  const document=fs.readFileSync(require('node:path').join(__dirname,'../../docs/KairosTraining.md'),'utf8');
  const names=[...document.slice(document.indexOf('## 8.1'),document.indexOf('# 9.')).matchAll(/^- (.+)$/gm)].map(match=>match[1]);
  assert.deepEqual(L.names,names);assert.equal(names.length,52);
  const {store,storage}=setup();assert.ok(store.initializeLibrary(L.create(D)).ok);const seeded=store.getState();
  assert.equal(seeded.exercises.length,52);assert.ok(seeded.exercises.every(ex=>ex.source==='builtin'));
  assert.equal(store.initializeLibrary(L.create(D)).ok,false);assert.deepEqual(store.getState(),seeded);
  const again=D.createStore({storage});again.load();assert.equal(again.getStatus().isNew,false);assert.deepEqual(again.getState(),seeded);
  const existing=setup(JSON.stringify(D.emptyState()));assert.equal(existing.store.initializeLibrary(L.create(D)).ok,false);assert.equal(existing.store.getState().exercises.length,0);
  const broken=setup('{broken');assert.equal(broken.store.initializeLibrary(L.create(D)).ok,false);assert.equal(broken.raw(),'{broken');
});
test('exercise CRUD, normalized names, builtin protection, MAX and weights',()=>{
  const {store,manage}=setup();store.initializeLibrary(L.create(D));
  assert.ok(manage.saveExercise(null,{name:'Eigene Übung',weightKg:'0',isMax:false,repetitions:10}).ok);
  let ex=store.getState().exercises.at(-1);assert.equal(ex.weightKg,0);
  assert.equal(manage.saveExercise(null,{name:' EIGENE  ÜBUNG ',weightKg:null,isMax:false,repetitions:10}).ok,false);
  assert.equal(manage.saveExercise(ex.id,{name:'Eigene Übung',weightKg:'0,1',isMax:false,repetitions:10}).ok,false);
  for(const value of [null,0,'17,25','17.25']) {
    assert.ok(manage.saveExercise(ex.id,{name:'Umbenannt',weightKg:value,isMax:true,repetitions:12}).ok);
    const max=store.getState().exercises.at(-1);assert.equal(max.weightKg,D.parseWeight(value));
    assert.ok(manage.saveExercise(ex.id,{...max,isMax:false}).ok);assert.equal(store.getState().exercises.at(-1).weightKg,D.parseWeight(value));
  }
  const builtin=store.getState().exercises[0];assert.equal(manage.deleteExercise(builtin.id).ok,false);
  assert.ok(manage.saveExercise(builtin.id,{...builtin,name:'Neue Grundübung',weightKg:25,isMax:true,repetitions:15}).ok);
  assert.ok(manage.deleteExercise(ex.id).ok);assert.equal(store.getState().exercises.length,52);
});
test('plans CRUD, ordered references, no duplicates, removal and snapshot protection',()=>{
  const {store,manage,storage}=setup();store.initializeLibrary(L.create(D));
  for(const name of ['A','B'])assert.ok(manage.savePlan(null,{name,description:'Beschreibung'}).ok);
  const [a,b]=store.getState().plans;const [x,y]=store.getState().exercises;
  assert.equal(a.exerciseIds.length,0);assert.ok(manage.savePlan(a.id,{name:'Oberkörper',description:'Neu'}).ok);
  for(const exercise of [x,y])assert.ok(manage.addExercise(a.id,exercise.id).ok);
  assert.equal(manage.addExercise(a.id,x.id).ok,false);
  assert.ok(manage.reorder(a.id,0,1).ok);assert.deepEqual(store.getState().plans[0].exerciseIds,[y.id,x.id]);
  assert.ok(manage.reorder(null,0,1).ok);assert.deepEqual(store.getState().planOrder,[b.id,a.id]);
  assert.ok(manage.saveExercise(null,{name:'Custom',weightKg:null,isMax:false,repetitions:10},a.id).ok);
  const custom=store.getState().exercises.at(-1);assert.ok(manage.addExercise(b.id,custom.id).ok);
  const session={id:D.createId(),planId:a.id,planName:a.name,planDescription:a.description,startedAt:10,endedAt:null,durationMs:null,currentIndex:0,exercises:D.snapshotExercises([custom])};
  store.update(d=>{d.activeSession=session;d.completedSessions=[{...structuredClone(session),id:D.createId(),endedAt:20,durationMs:10}];});
  const snapshots=store.getState();
  assert.ok(manage.saveExercise(custom.id,{...custom,name:'Geändert',weightKg:20}).ok);
  assert.ok(manage.deleteExercise(custom.id).ok);assert.ok(manage.deletePlan(a.id).ok);
  assert.deepEqual(store.getState().activeSession,snapshots.activeSession);assert.deepEqual(store.getState().completedSessions,snapshots.completedSessions);
  assert.deepEqual(store.getState().plans[0].exerciseIds,[]);
  const again=D.createStore({storage});assert.ok(again.load().ok);assert.deepEqual(again.getState(),store.getState());
});
test('failed management writes retain pending state and never report success',()=>{
  const {store,manage,storage,raw}=setup();store.initializeLibrary(L.create(D));const saved=raw();
  const write=storage.setItem;storage.setItem=()=>{throw new Error('quota');};
  const result=manage.savePlan(null,{name:'Pending',description:''});assert.equal(result.ok,false);assert.ok(result.dirty);
  assert.equal(store.getState().plans.length,1);assert.equal(raw(),saved);storage.setItem=write;assert.ok(store.save().ok);
});

test('failed initialization is not duplicated; removing from a plan preserves the exercise',()=>{
  const {store,manage,storage}=setup();const write=storage.setItem;storage.setItem=()=>{throw new Error('quota');};
  assert.equal(store.initializeLibrary(L.create(D)).ok,false);assert.equal(store.getState().exercises.length,52);
  assert.equal(store.initializeLibrary(L.create(D)).ok,false);assert.equal(store.getState().exercises.length,52);storage.setItem=write;assert.ok(store.save().ok);
  manage.savePlan(null,{name:'Test',description:''});const plan=store.getState().plans[0],exercise=store.getState().exercises[0];
  manage.addExercise(plan.id,exercise.id);assert.ok(manage.removeExercise(plan.id,exercise.id).ok);
  assert.deepEqual(store.getState().exercises[0],exercise);assert.deepEqual(store.getState().plans[0].exerciseIds,[]);
});
