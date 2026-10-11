const test = require('node:test'), assert = require('node:assert/strict');
const D = require('../data.js'), S = require('../session.js');
function setup() {
  const values = new Map([['weightEntries', '[42]'], ['appSettings', '{"unit":"kg"}']]);
  const storage = {getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value)};
  const store = D.createStore({storage}); store.load();
  return {store, storage, values};
}
function populated() {
  const fixture = setup(), {store} = fixture;
  const exercises = ['A', 'B', 'C'].map((name, i) => D.createExercise({name, weightKg: i ? 0 : null, isMax: i === 1}));
  const plan = D.createPlan({name: 'Backup Plan', description: 'Beschreibung', exerciseIds: exercises.map(e => e.id)});
  store.update(state => { state.exercises = exercises; state.plans = [plan]; state.planOrder = [plan.id]; state.settings.lastView = 'backup'; });
  const flow = S.create(store, D, () => 1000); flow.start(plan.id); flow.complete(); flow.skip(); flow.finish(store.getState().activeSession.id);
  flow.start(plan.id); flow.skip();
  return {...fixture, flow};
}
test('full export/import preserves IDs, ordering, MAX, settings, historical and active snapshots', () => {
  const source = populated(), target = setup(); const text = source.store.exportJSON();
  assert.deepEqual(JSON.parse(text), source.store.getState());
  assert.ok(target.store.importJSON(text, {confirmed: true}).ok);
  assert.deepEqual(target.store.getState(), source.store.getState());
  const reloaded = D.createStore({storage: target.storage}); assert.ok(reloaded.load().ok);
  assert.deepEqual(reloaded.getState(), source.store.getState());
  assert.equal(target.values.get('weightEntries'), '[42]'); assert.equal(target.values.get('appSettings'), '{"unit":"kg"}');
  assert.ok(!text.includes('weightEntries')); assert.ok(!text.includes('appSettings'));
  const historical = reloaded.getState().completedSessions[0];
  assert.equal(reloaded.update(state => {state.completedSessions[0].planName = 'Changed';}).ok, false);
  assert.deepEqual(reloaded.getState().completedSessions[0], historical);
});
test('active target blocks imports even if confirmed, while export remains available', () => {
  const {store, storage} = populated(), previous = store.getState(), raw = storage.getItem(D.STORAGE_KEY);
  assert.equal(store.importJSON(JSON.stringify(D.emptyState()), {confirmed: true}).ok, false);
  assert.deepEqual(store.getState(), previous); assert.equal(storage.getItem(D.STORAGE_KEY), raw);
  assert.deepEqual(JSON.parse(store.exportJSON()), previous);
});
test('invalid JSON, schema, references, duplicates, weights, snapshots, settings and extra data never replace data', () => {
  const {store, storage} = setup(); store.update(state => {state.exercises = [D.createExercise({name:'Existing'})];});
  const previous = store.getState(), raw = storage.getItem(D.STORAGE_KEY);
  const source = populated().store.getState();
  const mutations = [state => {state.schemaVersion = 2;}, state => {state.plans[0].exerciseIds = ['missing'];}, state => {state.planOrder = [];}, state => {state.exercises[1].id = state.exercises[0].id;}, state => {state.exercises[1].name = ' a ';}, state => {state.exercises[0].weightKg = .1;}, state => {state.completedSessions[0].durationMs = -1;}, state => {state.activeSession.currentIndex = 999;}, state => {state.settings.lastView = 'unknown';}, state => {state.weightEntries = [];}, state => {state.exercises[0].secret = 'extra';}];
  for (const text of ['broken', 'null', '[]', '{}', ...mutations.map(change => {const state = structuredClone(source); change(state); return JSON.stringify(state);})]) {
    assert.equal(store.importJSON(text, {confirmed: true}).ok, false);
    assert.deepEqual(store.getState(), previous); assert.equal(storage.getItem(D.STORAGE_KEY), raw);
  }
});
test('unconfirmed import and changed confirmation state preserve existing data', () => {
  const {store, storage} = setup(), text = JSON.stringify(D.emptyState());
  const expectedState = JSON.stringify(store.getState());
  assert.equal(store.importJSON(text).ok, false); assert.equal(storage.getItem(D.STORAGE_KEY), null);
  store.update(state => {state.exercises = [D.createExercise({name: 'New'})];});
  const previous = store.getState();
  assert.equal(store.importJSON(text, {confirmed:true, expectedState}).ok, false); assert.deepEqual(store.getState(), previous);
});
test('failed writes preserve saved and unsaved data; retry imports only after successful persistence', () => {
  const {store, storage} = setup(); store.update(state => {state.exercises = [D.createExercise({name:'Saved'})];});
  const raw = storage.getItem(D.STORAGE_KEY), write = storage.setItem;
  storage.setItem = () => {throw new Error('quota');};
  store.update(state => {state.exercises.push(D.createExercise({name:'Pending'}));});
  const previous = store.getState(), backup = JSON.stringify(D.emptyState());
  assert.equal(store.importJSON(backup, {confirmed:true}).ok, false);
  assert.deepEqual(store.getState(), previous); assert.equal(storage.getItem(D.STORAGE_KEY), raw); assert.ok(store.getStatus().dirty);
  assert.deepEqual(JSON.parse(store.exportJSON()), previous);
  storage.setItem = write; assert.ok(store.importJSON(backup, {confirmed:true}).ok);
  assert.deepEqual(store.getState(), D.emptyState()); assert.equal(store.getStatus().dirty, false);
});
test('external changes and damaged storage remain protected; BOM JSON is accepted', () => {
  const {store, storage} = setup(), previous = store.getState();
  storage.setItem(D.STORAGE_KEY, 'external');
  assert.equal(store.importJSON(JSON.stringify(D.emptyState()), {confirmed:true}).ok, false);
  assert.equal(storage.getItem(D.STORAGE_KEY), 'external'); assert.deepEqual(store.getState(), previous);
  const damaged = D.createStore({storage}); assert.equal(damaged.load().ok, false);
  assert.equal(damaged.importJSON(JSON.stringify(D.emptyState()), {confirmed:true}).ok, false);
  assert.throws(() => damaged.exportJSON());
  assert.deepEqual(D.parseBackup('\uFEFF' + JSON.stringify(D.emptyState())), D.emptyState());
});
