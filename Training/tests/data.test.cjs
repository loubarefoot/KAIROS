const test = require('node:test');
const assert = require('node:assert/strict');
const D = require('../data.js');
function memory() {
  const values = new Map([['weightEntries', '[{"weight":80}]'], ['appSettings', '{"name":"Weight"}']]);
  return { values, getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}
function fixture() {
  const state = D.emptyState();
  const exercise = D.createExercise({name:'Bankdrücken',weightKg:'17,25'});
  const plan = D.createPlan({name:'Oberkörper',exerciseIds:[exercise.id]});
  state.exercises.push(exercise); state.plans.push(plan); state.planOrder.push(plan.id);
  const session = {id:D.createId(),planId:plan.id,planName:plan.name,planDescription:plan.description,startedAt:1000,exercises:D.snapshotExercises([exercise]),endedAt:null,durationMs:null,currentIndex:0};
  state.activeSession = session;
  state.completedSessions.push({...structuredClone(session),id:D.createId(),endedAt:2000,durationMs:1000});
  return state;
}
test('save/reload, stable IDs, order and independent Weight data', () => {
  const backend=memory(); const store=D.createStore({storage:backend}); assert.ok(store.load().ok);
  assert.equal(backend.values.has(D.STORAGE_KEY),false);
  const state=fixture(); assert.ok(store.update(d=>Object.assign(d,state)).ok);
  const again=D.createStore({storage:backend}); assert.ok(again.load().ok); assert.deepEqual(again.getState(),state);
  assert.equal(backend.getItem('weightEntries'),'[{"weight":80}]'); assert.equal(backend.getItem('appSettings'),'{"name":"Weight"}');
  const exposed=again.getState();exposed.exercises[0].name='Mutation';assert.equal(again.getState().exercises[0].name,'Bankdrücken');
  assert.equal(new Set(Array.from({length:1000},()=>D.createId())).size,1000);
});
test('weights, comma/point, zero, empty, MAX restoration and default repetitions', () => {
  for (const input of ['',null,'  ',0,'0','17,25','17.25']) assert.equal(D.parseWeight(input), input===0||input==='0'?0:input===null||String(input).trim()===''?null:17.25);
  for (const input of [-1,NaN,Infinity,'17,2','12kg','1e2',{},'1,2.3']) assert.throws(()=>D.parseWeight(input));
  for (const weightKg of [null,0,17.25]) {
    const exercise=D.createExercise({name:'Übung',weightKg});assert.equal(exercise.repetitions,10);
    const max=D.withMax(exercise,true);assert.ok(max.isMax);assert.equal(D.withMax(max,false).weightKg,weightKg);
  }
});
test('reject invalid references, duplicate IDs/names, order and invalid session data', () => {
  const changes=[d=>d.exercises.push({...d.exercises[0]}),d=>d.exercises.push({...d.exercises[0],id:D.createId(),name:' BANKDRÜCKEN  '}),d=>d.plans[0].exerciseIds.push(d.exercises[0].id),d=>d.plans[0].exerciseIds=['missing'],d=>d.planOrder=[],d=>d.exercises[0].weightKg=.1,d=>d.completedSessions[0].durationMs=4,d=>d.activeSession.currentIndex=10,d=>d.settings.lastView='unknown',d=>d.schemaVersion=2];
  for (const change of changes) { const state=fixture();change(state);assert.throws(()=>D.validateState(state)); }
  const state=fixture();state.plans[0].exerciseIds=[];assert.ok(D.validateState(state));
});
test('snapshots survive removal; completed sessions and builtin identity protected', () => {
  const store=D.createStore({storage:memory()});store.load();store.update(d=>Object.assign(d,fixture()));
  const completed=store.getState().completedSessions;
  assert.equal(store.update(d=>{d.completedSessions[0].exercises[0].weightKg=20;}).ok,false);
  assert.equal(store.update(d=>{d.activeSession.exercises[0].name='Changed';}).ok,false);
  assert.ok(store.update(d=>{d.exercises=[];d.plans=[];d.planOrder=[];}).ok);
  assert.deepEqual(store.getState().completedSessions,completed);assert.equal(store.getState().activeSession.exercises[0].name,'Bankdrücken');
  assert.ok(store.update(d=>d.exercises.push(D.createExercise({name:'Grundübung',source:'builtin'}))).ok);
  assert.equal(store.update(d=>{d.exercises=[];}).ok,false);
});
test('invalid JSON, incompatible schema and read failures never overwrite storage', () => {
  for (const raw of ['{broken','null',JSON.stringify({...D.emptyState(),schemaVersion:99}),JSON.stringify({...D.emptyState(),exercises:{}})]) {
    const backend=memory();backend.setItem(D.STORAGE_KEY,raw);const store=D.createStore({storage:backend});
    assert.equal(store.load().ok,false);assert.equal(store.save().ok,false);assert.equal(backend.getItem(D.STORAGE_KEY),raw);assert.ok(store.getStatus().blocked);
  }
  const store=D.createStore({storage:()=>{throw new Error('blocked');}});assert.equal(store.load().ok,false);assert.equal(store.update(()=>{}).ok,false);
});
test('write failures retain pending state, retry succeeds, reload cannot discard changes', () => {
  const backend=memory();const store=D.createStore({storage:backend});store.load();
  const write=backend.setItem;backend.setItem=()=>{throw new Error('quota');};
  const result=store.update(d=>d.exercises.push(D.createExercise({name:'Eigene Übung'})));
  assert.equal(result.ok,false);assert.ok(result.dirty);assert.equal(store.getState().exercises.length,1);assert.equal(backend.getItem(D.STORAGE_KEY),null);
  assert.equal(store.load().ok,false);assert.equal(store.getState().exercises.length,1);
  backend.setItem=write;assert.ok(store.save().ok);assert.equal(store.getStatus().dirty,false);
});
test('external changes block overwrite while preserving memory', () => {
  const backend=memory();const store=D.createStore({storage:backend});store.load();
  backend.setItem(D.STORAGE_KEY,JSON.stringify(D.emptyState()));
  assert.equal(store.update(d=>d.exercises.push(D.createExercise({name:'Pending'}))).ok,false);
  assert.ok(store.getStatus().blocked);assert.equal(store.getState().exercises.length,1);assert.equal(JSON.parse(backend.getItem(D.STORAGE_KEY)).exercises.length,0);
});
