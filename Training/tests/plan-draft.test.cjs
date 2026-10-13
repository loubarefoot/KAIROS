const test = require('node:test'), assert = require('node:assert/strict');
const D = require('../data.js'), M = require('../management.js'), S = require('../session.js');
function setup() {
 const values = new Map([['weightEntries','unchanged'],['appSettings','unchanged']]); let writes=0, fail=false;
 const storage={getItem:key=>values.get(key)??null,setItem(key,value){if(fail)throw Error('quota');writes++;values.set(key,value);}};
 const store=D.createStore({storage});store.load();const manage=M.create(store,D);
 manage.saveExercise(null,{name:'Shared',weightKg:10,isMax:false,repetitions:10});
 const id=store.getState().exercises[0].id;
 for(const name of ['First','Second']){manage.savePlan(null,{name,description:''});manage.addExercise(store.getState().plans.at(-1).id,id);}
 const flow=S.create(store,D);flow.start(store.getState().plans[0].id);flow.finish(store.getState().activeSession.id);flow.start(store.getState().plans[0].id);
 return {store,manage,flow,storage,values,writes:()=>writes,fail:value=>{fail=value;}};
}
test('draft is isolated; one write saves plan, new exercises and global weights without touching sessions or Weight',()=>{
 const f=setup(), before=f.store.getState(), raw=f.values.get(D.STORAGE_KEY), draft=f.manage.beginDraft(before.plans[0].id);
 assert.equal(f.manage.draftChanged(draft),false);
 draft.plan.name='Edited';draft.exercises[0].weightKg='17,25';
 const added=D.createExercise({name:'New',weightKg:0,isMax:true});draft.exercises.push(added);draft.plan.exerciseIds.unshift(added.id);
 assert.ok(f.manage.draftChanged(draft));assert.deepEqual(f.store.getState(),before);assert.equal(f.values.get(D.STORAGE_KEY),raw);
 const writes=f.writes();assert.ok(f.manage.saveDraft(draft).ok);assert.equal(f.writes(),writes+1);
 const saved=f.store.getState();assert.equal(saved.exercises[0].weightKg,17.25);assert.equal(saved.plans[1].exerciseIds[0],saved.exercises[0].id);
 assert.deepEqual(saved.activeSession,before.activeSession);assert.deepEqual(saved.completedSessions,before.completedSessions);
 assert.equal(f.values.get('weightEntries'),'unchanged');assert.equal(f.values.get('appSettings'),'unchanged');
 const again=D.createStore({storage:f.storage});again.load();assert.deepEqual(again.getState(),saved);
});
test('discarding a draft leaves store unchanged; new empty plans save; invalid drafts preserve originals',()=>{
 const f=setup(),before=f.store.getState();let draft=f.manage.beginDraft();draft.plan.name='Discarded';draft=null;assert.deepEqual(f.store.getState(),before);
 draft=f.manage.beginDraft();draft.plan.name='Empty';assert.ok(f.manage.saveDraft(draft).ok);assert.equal(f.store.getState().plans.at(-1).exerciseIds.length,0);
 const saved=f.store.getState();draft=f.manage.beginDraft(saved.plans[0].id);draft.exercises[0].weightKg='0.1';assert.equal(f.manage.saveDraft(draft).ok,false);assert.deepEqual(f.store.getState(),saved);
 draft.exercises[0].weightKg=10;draft.plan.exerciseIds.push(draft.plan.exerciseIds[0]);assert.equal(f.manage.saveDraft(draft).ok,false);assert.deepEqual(f.store.getState(),saved);
});
test('quota failure retains draft and original data; retry writes exactly once without duplicate IDs',()=>{
 const f=setup(),before=f.store.getState(),raw=f.values.get(D.STORAGE_KEY),draft=f.manage.beginDraft();draft.plan.name='Retry';
 f.fail(true);assert.equal(f.manage.saveDraft(draft).ok,false);assert.deepEqual(f.store.getState(),before);assert.equal(f.values.get(D.STORAGE_KEY),raw);assert.equal(draft.plan.name,'Retry');
 f.fail(false);assert.ok(f.manage.saveDraft(draft).ok);assert.equal(f.store.getState().plans.filter(p=>p.id===draft.plan.id).length,1);
});
test('external plan/weight changes are rejected; session progress and settings changes remain preserved',()=>{
 const f=setup(),draft=f.manage.beginDraft(f.store.getState().plans[0].id);draft.plan.name='Draft';f.flow.complete();f.store.update(s=>s.settings.lastView='settings');
 const active=f.store.getState().activeSession;assert.ok(f.manage.saveDraft(draft).ok);assert.deepEqual(f.store.getState().activeSession,active);assert.equal(f.store.getState().settings.lastView,'settings');
 const stale=f.manage.beginDraft(draft.plan.id);stale.exercises[0].weightKg=50;
 const other=D.createStore({storage:f.storage});other.load();other.update(s=>s.exercises[0].weightKg=25);const raw=f.values.get(D.STORAGE_KEY);
 assert.equal(f.manage.saveDraft(stale).ok,false);assert.equal(f.values.get(D.STORAGE_KEY),raw);assert.equal(stale.exercises[0].weightKg,50);
});

test('plan-only edits preserve all exercise values including imported whitespace; weight edits change only the selected fields',()=>{
 const f=setup();f.store.update(state=>{
  state.exercises[0].name='  Shared  ';state.plans[0].name='  First  ';state.plans[1].name='  Second  ';
  state.exercises.push(D.createExercise({name:'  Outside plan  ',weightKg:0,isMax:true,repetitions:12}));
 });
 const before=f.store.getState(),draft=f.manage.beginDraft(before.plans[0].id);
 draft.plan.description='Only description';assert.ok(f.manage.saveDraft(draft).ok);
 assert.equal(JSON.stringify(f.store.getState().exercises),JSON.stringify(before.exercises));assert.equal(f.store.getState().plans[0].name,before.plans[0].name);
 assert.deepEqual(f.store.getState().plans[1],before.plans[1]);assert.deepEqual(f.store.getState().planOrder,before.planOrder);
 const edited=f.manage.beginDraft(before.plans[0].id);edited.exercises[0].weightKg='17,5';assert.ok(f.manage.saveDraft(edited).ok);
 const saved=f.store.getState();assert.deepEqual(saved.exercises[0],{...before.exercises[0],weightKg:17.5});
 assert.equal(JSON.stringify(saved.exercises[1]),JSON.stringify(before.exercises[1]));assert.deepEqual(saved.plans[1],before.plans[1]);
 assert.deepEqual(saved.activeSession,before.activeSession);assert.deepEqual(saved.completedSessions,before.completedSessions);
});
test('deleted plan or exercise conflicts never recreate deleted data or partially save the stale draft',()=>{
 for (const kind of ['plan','exercise']) {
  const f=setup(),before=f.store.getState(),draft=f.manage.beginDraft(before.plans[0].id);
  draft.plan.name='Stale';draft.exercises[0].weightKg=50;draft.exercises.push(D.createExercise({name:'Pending new'}));
  const other=D.createStore({storage:f.storage});other.load();const management=M.create(other,D);
  assert.ok((kind==='plan'?management.deletePlan(before.plans[0].id):management.deleteExercise(before.exercises[0].id)).ok);
  const raw=f.values.get(D.STORAGE_KEY),writes=f.writes();assert.equal(f.manage.saveDraft(draft).ok,false);
  assert.equal(f.values.get(D.STORAGE_KEY),raw);assert.equal(f.writes(),writes);assert.equal(draft.plan.name,'Stale');
  assert.deepEqual(f.store.getState().activeSession,before.activeSession);assert.deepEqual(f.store.getState().completedSessions,before.completedSessions);
 }
});
test('MAX preserves both previous numeric and empty weights through save and back-switch',()=>{
 for (const weight of [null,0,17.5]) {
  const f=setup();f.store.update(s=>s.exercises[0].weightKg=weight);
  const draft=f.manage.beginDraft(f.store.getState().plans[0].id);draft.exercises[0].isMax=true;draft.exercises[0].repetitions=12;
  assert.ok(f.manage.saveDraft(draft).ok);assert.equal(f.store.getState().exercises[0].weightKg,weight);
  const back=f.manage.beginDraft(draft.plan.id);back.exercises[0].isMax=false;
  assert.ok(f.manage.saveDraft(back).ok);assert.equal(f.store.getState().exercises[0].weightKg,weight);assert.equal(f.store.getState().exercises[0].isMax,false);
 }
});
