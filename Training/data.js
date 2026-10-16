/* Training schema and persistence, independent of the UI and Weight. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.KairosTrainingData = api;
})(globalThis, () => {
  'use strict';
  const STORAGE_KEY = 'kairos.training.state';
  const SCHEMA_VERSION = 1;
  const VIEWS = ['start', 'training', 'active', 'settings', 'plans', 'exercises', 'backup', 'summary'];
  const copy = value => JSON.parse(JSON.stringify(value));
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const id = value => typeof value === 'string' && value.trim() === value && value.length > 0;
  const nameKey = value => value.trim().replace(/\s+/gu, ' ').toLocaleLowerCase('de');
  const weight = value => value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0 && Number.isSafeInteger(value * 4));
  const time = value => Number.isSafeInteger(value) && value >= 0 && Number.isFinite(new Date(value).getTime());
  function calendarDay(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value + 'T00:00:00.000Z');
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }
  function requireRule(condition, message) { if (!condition) throw new Error(message); }
  function unique(values) { return new Set(values).size === values.length; }
  function emptyState() {
    return { schemaVersion: SCHEMA_VERSION, exercises: [], plans: [], planOrder: [], completedSessions: [], activeSession: null,
      settings: { lastView: 'start', lastOpenedDay: null, lastBackgroundAt: null } };
  }
  function createId() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    requireRule(globalThis.crypto?.getRandomValues, 'Sichere ID-Erzeugung ist nicht verfügbar.');
    const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  }
  function parseWeight(input) {
    if (input === null || (typeof input === 'string' && input.trim() === '')) return null;
    if (typeof input === 'number') { requireRule(weight(input), 'Gewicht muss in 0,25-kg-Schritten angegeben werden.'); return input; }
    requireRule(typeof input === 'string' && /^\d+(?:[.,]\d+)?$/.test(input.trim()), 'Bitte ein gültiges Gewicht eingeben.');
    const value = Number(input.trim().replace(',', '.'));
    requireRule(weight(value), 'Gewicht muss in 0,25-kg-Schritten angegeben werden.');
    return value;
  }
  function validateExercise(exercise) {
    requireRule(object(exercise) && id(exercise.id), 'Ungültige Übungs-ID.');
    requireRule(typeof exercise.name === 'string' && nameKey(exercise.name).length > 0, 'Ungültiger Übungsname.');
    requireRule(['custom', 'builtin'].includes(exercise.source), 'Ungültige Übungsherkunft.');
    requireRule(weight(exercise.weightKg) && typeof exercise.isMax === 'boolean', 'Ungültiges Gewicht oder MAX-Modus.');
    requireRule(Number.isSafeInteger(exercise.repetitions) && exercise.repetitions > 0, 'Ungültige Wiederholungszahl.');
  }
  function createExercise({ name, source = 'custom', weightKg = null, repetitions = 10, isMax = false }) {
    const exercise = { id: createId(), name, source, weightKg: parseWeight(weightKg), repetitions, isMax };
    validateExercise(exercise);
    return exercise;
  }
  // weightKg retains the last numeric value (or null) while MAX is active.
  function withMax(exercise, isMax) {
    const result = { ...copy(exercise), isMax };
    validateExercise(result);
    return result;
  }
  function createPlan({ name, description = '', exerciseIds = [] }) {
    return { id: createId(), name, description, exerciseIds: [...exerciseIds] };
  }
  function snapshotExercises(exercises) {
    exercises.forEach(validateExercise);
    return exercises.map(exercise => ({ ...copy(exercise), status: 'open' }));
  }
  const INACTIVITY_MS = 60 * 60 * 1000;
  function sessionReady(session) {
    return session.exercises.every(item => item.status === 'completed' || item.status === 'skipped');
  }
  function sessionExpired(session, now = Date.now()) {
    return !!session && !sessionReady(session) && now - (session.lastActivityAt ?? session.startedAt) >= INACTIVITY_MS;
  }
  function touchSession(session, now = Date.now()) {
    session.lastActivityAt = Math.max(now, session.lastActivityAt ?? session.startedAt);
  }
  function orderedSnapshots(session, plan) {
    const rank = new Map(plan.exerciseIds.map((id,index)=>[id,index]));
    return [...session.exercises].sort((a,b)=>(rank.get(a.id) ?? plan.exerciseIds.length) - (rank.get(b.id) ?? plan.exerciseIds.length));
  }
  function syncSessionOrder(state, plan, previousOrder, now = Date.now()) {
    const session = state.activeSession;
    if (!session || session.planId !== plan.id || sessionReady(session)) return;
    const ids = new Set(session.exercises.map(item=>item.id));
    const common = new Set(previousOrder.filter(id=>ids.has(id) && plan.exerciseIds.includes(id)));
    if (JSON.stringify(previousOrder.filter(id=>common.has(id))) === JSON.stringify(plan.exerciseIds.filter(id=>common.has(id)))) return;
    if (sessionExpired(session, now)) { state.activeSession = null; return; }
    const selected = session.exercises[session.currentIndex].id;
    session.exercises = orderedSnapshots(session, plan);
    session.currentIndex = session.exercises.findIndex(item=>item.id===selected);
    touchSession(session, now);
  }
  function validateSession(session, completed) {
    requireRule(object(session) && id(session.id) && id(session.planId), 'Ungültige Trainings-ID.');
    requireRule(typeof session.planName === 'string' && session.planName.trim() && typeof session.planDescription === 'string', 'Ungültige Plan-Momentaufnahme.');
    requireRule(time(session.startedAt) && Array.isArray(session.exercises) && session.exercises.length > 0, 'Ungültiger Trainingsstart oder Übungsliste.');
    session.exercises.forEach(exercise => {
      validateExercise(exercise);
      requireRule(['open', 'skipped', 'completed'].includes(exercise.status), 'Ungültiger Übungsstatus.');
    });
    requireRule(unique(session.exercises.map(exercise => exercise.id)), 'Mehrfache Übung in einer Einheit.');
    if (completed) {
      requireRule(time(session.endedAt) && session.endedAt >= session.startedAt && session.durationMs === session.endedAt - session.startedAt, 'Ungültige Trainingsdauer.');
    } else {
      requireRule(session.lastActivityAt === undefined || (time(session.lastActivityAt) && session.lastActivityAt >= session.startedAt), 'Ungültiger Aktivitätszeitpunkt.');
      const running = session.endedAt === null && session.durationMs === null;
      const pending = sessionReady(session) && time(session.endedAt) && session.endedAt >= session.startedAt && session.durationMs === session.endedAt - session.startedAt;
      requireRule((running || pending) && Number.isSafeInteger(session.currentIndex) && session.currentIndex >= 0 && session.currentIndex < session.exercises.length, 'Ungültiger laufender Trainingszustand.');
    }
    // Historical IDs intentionally need not refer to current plans/exercises.
  }
  function validateState(state) {
    requireRule(object(state) && state.schemaVersion === SCHEMA_VERSION, 'Nicht unterstützte Training-Datenversion.');
    requireRule(['exercises', 'plans', 'planOrder', 'completedSessions'].every(key => Array.isArray(state[key])), 'Ungültige Training-Datenstruktur.');
    state.exercises.forEach(validateExercise);
    requireRule(unique(state.exercises.map(exercise => nameKey(exercise.name))), 'Doppelte Übungsnamen.');
    const exerciseIds = new Set(state.exercises.map(exercise => exercise.id));
    state.plans.forEach(plan => {
      requireRule(object(plan) && id(plan.id) && typeof plan.name === 'string' && plan.name.trim() && typeof plan.description === 'string', 'Ungültiger Trainingsplan.');
      requireRule(Array.isArray(plan.exerciseIds) && unique(plan.exerciseIds) && plan.exerciseIds.every(value => exerciseIds.has(value)), 'Ungültige oder doppelte Übungsreferenzen.');
    });
    const planIds = new Set(state.plans.map(plan => plan.id));
    requireRule(unique(state.planOrder) && state.planOrder.length === state.plans.length && state.planOrder.every(value => planIds.has(value)), 'Ungültige Planreihenfolge.');
    state.completedSessions.forEach(session => validateSession(session, true));
    if (state.activeSession !== null) validateSession(state.activeSession, false);
    const ids = [...state.exercises, ...state.plans, ...state.completedSessions, ...(state.activeSession ? [state.activeSession] : [])].map(item => item.id);
    requireRule(unique(ids), 'Doppelte Objekt-IDs.');
    const settings = state.settings;
    requireRule(object(settings) && VIEWS.includes(settings.lastView) && (settings.lastBackgroundAt === null || time(settings.lastBackgroundAt)) && (settings.lastOpenedDay === null || calendarDay(settings.lastOpenedDay)), 'Ungültige Training-Einstellungen.');
    return true;
  }
  function validateBackup(state) {
    validateState(state);
    const keys = (value, allowed) => requireRule(Object.keys(value).every(key => allowed.includes(key)), 'Unbekannte Felder in der Training-Datei.');
    const exerciseKeys = ['id', 'name', 'source', 'weightKg', 'isMax', 'repetitions'];
    keys(state, ['schemaVersion', 'exercises', 'plans', 'planOrder', 'completedSessions', 'activeSession', 'settings']);
    state.exercises.forEach(value => keys(value, exerciseKeys));
    state.plans.forEach(value => keys(value, ['id', 'name', 'description', 'exerciseIds']));
    for (const session of [...state.completedSessions, ...(state.activeSession ? [state.activeSession] : [])]) {
      keys(session, ['id', 'planId', 'planName', 'planDescription', 'startedAt', 'endedAt', 'durationMs', ...(session === state.activeSession ? ['currentIndex', 'lastActivityAt'] : []), 'exercises']);
      session.exercises.forEach(value => keys(value, [...exerciseKeys, 'status']));
    }
    keys(state.settings, ['lastView', 'lastOpenedDay', 'lastBackgroundAt']);
    return true;
  }
  function parseBackup(text) {
    requireRule(typeof text === 'string', 'Bitte eine JSON-Trainingsdatei auswählen.');
    let candidate;
    try { candidate = JSON.parse(text.replace(/^\uFEFF/, '')); }
    catch (error) { throw new Error('Die Datei enthält kein gültiges JSON.'); }
    validateBackup(candidate);
    return candidate;
  }
  function validateChange(previous, next) {
    for (const session of previous.completedSessions) {
      requireRule(JSON.stringify(next.completedSessions.find(item => item.id === session.id)) === JSON.stringify(session), 'Abgeschlossene Einheiten dürfen nicht verändert oder entfernt werden.');
    }
    for (const exercise of previous.exercises.filter(item => item.source === 'builtin')) {
      requireRule(next.exercises.some(item => item.id === exercise.id && item.source === 'builtin'), 'Vorgefertigte Übungen dürfen nicht dauerhaft gelöscht werden.');
    }
    if (previous.activeSession && next.activeSession) {
      requireRule(next.activeSession.id === previous.activeSession.id, 'Eine laufende Einheit darf nicht durch eine zweite ersetzt werden.');
      const original = previous.activeSession;
      const updated = next.activeSession;
      if (original.endedAt !== null) {
        // Only an explicit retry may reopen one skipped item; all other frozen values stay intact.
        const retry = copy(original), index = updated.currentIndex;
        if (retry.exercises[index]?.status === 'skipped') {
          retry.endedAt = null; retry.durationMs = null; retry.currentIndex = index;
          retry.lastActivityAt = updated.lastActivityAt;
          retry.exercises[index].status = 'open';
        }
        requireRule(JSON.stringify(updated) === JSON.stringify(original) || JSON.stringify(updated) === JSON.stringify(retry), 'Ein eingefrorenes Training darf nur zum Nachholen einer übersprungenen Übung wieder geöffnet werden.');
      }
      requireRule(original.planId === updated.planId && original.planName === updated.planName && original.planDescription === updated.planDescription && original.startedAt === updated.startedAt, 'Laufende Plan-Momentaufnahme darf nicht verändert werden.');
      requireRule(original.lastActivityAt === undefined || (updated.lastActivityAt !== undefined && updated.lastActivityAt >= original.lastActivityAt), 'Aktivitätszeitpunkt darf nicht zurückgesetzt werden.');
      requireRule(original.exercises.length === updated.exercises.length && original.exercises.every(exercise => {
        const item = updated.exercises.find(item=>item.id===exercise.id);
        return item && exercise.name === item.name && exercise.source === item.source;
      }), 'Übungsliste und Namen einer laufenden Einheit dürfen nicht verändert werden.');
      if (JSON.stringify(original.exercises.map(item=>item.id)) !== JSON.stringify(updated.exercises.map(item=>item.id))) {
        const oldPlan = previous.plans.find(plan=>plan.id===original.planId), plan = next.plans.find(plan=>plan.id===original.planId);
        requireRule(oldPlan && plan && JSON.stringify(oldPlan.exerciseIds) !== JSON.stringify(plan.exerciseIds) && JSON.stringify(updated.exercises) === JSON.stringify(orderedSnapshots(original, plan)), 'Nur die gespeicherte Reihenfolge des aktiven Plans darf die laufende Reihenfolge synchronisieren.');
        requireRule(updated.exercises[updated.currentIndex].id === original.exercises[original.currentIndex].id, 'Die ausgewählte Übung muss beim Umsortieren erhalten bleiben.');
      }
    }
  }
  function createStore({ storage = () => globalThis.localStorage, onStatus = () => {} } = {}) {
    let state = emptyState();
    let baseline = null;
    let loaded = false;
    let isNew = false;
    let blocked = false;
    let dirty = false;
    let message = '';
    const backend = () => typeof storage === 'function' ? storage() : storage;
    const status = () => ({ loaded, blocked, dirty, isNew, message });
    function report(text) { message = text; onStatus(status()); return { ok: !text, ...status() }; }
    function load() {
      if (loaded || dirty) return report('Daten sind bereits geladen; ungespeicherte Änderungen werden nicht verworfen.');
      try {
        const raw = backend().getItem(STORAGE_KEY);
        const candidate = raw === null ? emptyState() : JSON.parse(raw);
        validateState(candidate);
        state = copy(candidate); baseline = raw; loaded = true; isNew = raw === null;
        return report('');
      } catch (error) {
        blocked = true;
        return report('Training-Daten konnten nicht gelesen werden oder sind beschädigt bzw. inkompatibel. Vorhandene Daten bleiben unverändert; Speichern ist gesperrt.');
      }
    }
    function refresh() {
      if (!loaded || blocked || dirty) return { ok: false, ...status() };
      try {
        const raw = backend().getItem(STORAGE_KEY);
        if (raw === baseline) return { ok: true, ...status() };
        requireRule(raw !== null, 'Training-Daten wurden entfernt.');
        const candidate = JSON.parse(raw); validateState(candidate);
        state = copy(candidate); baseline = raw; isNew = false;
        return report('');
      } catch (error) { blocked = true; return report('Training-Daten wurden außerhalb dieser Ansicht verändert oder beschädigt. Vorhandene Daten bleiben geschützt; bitte die App neu öffnen.'); }
    }
    function save() {
      if (!loaded || blocked) return report('Speichern ist gesperrt, damit vorhandene Training-Daten nicht überschrieben werden.');
      try {
        // Avoid overwriting changes made by another tab.
        if (backend().getItem(STORAGE_KEY) !== baseline) {
          blocked = true;
          return report('Training-Daten wurden außerhalb dieser Ansicht geändert. Ungespeicherte Änderungen bleiben im Arbeitsspeicher; Speichern ist zum Schutz der vorhandenen Daten gesperrt.');
        }
        validateState(state);
        const json = JSON.stringify(state);
        backend().setItem(STORAGE_KEY, json);
        baseline = json; dirty = false;
        return report('');
      } catch (error) {
        return report('Training-Daten konnten nicht gespeichert werden. Änderungen bleiben ungespeichert im Arbeitsspeicher. Bitte die App nicht schließen.');
      }
    }
    function update(change) {
      if (!loaded || blocked) return report('Training-Daten sind geschützt; Änderungen können derzeit nicht übernommen werden.');
      try {
        const candidate = copy(state);
        change(candidate);
        validateState(candidate);
        validateChange(state, candidate);
        state = copy(candidate); dirty = true;
      } catch (error) { return report('Änderung nicht übernommen: ' + error.message); }
      return save();
    }
    // Commit destructive transitions only after successful persistence.
    function commit(change, subject = null) {
      if (!loaded || blocked) return report(subject ? 'Training-Daten sind geschützt; ' + subject + ' kann nicht gespeichert werden.' : 'Training-Daten sind geschützt; der Abschluss kann nicht gespeichert werden.');
      let candidate;
      try {
        candidate = copy(state); change(candidate); validateState(candidate); validateChange(state, candidate);
      } catch (error) { return report((subject || 'Abschluss') + ' nicht übernommen: ' + error.message); }
      try {
        if (backend().getItem(STORAGE_KEY) !== baseline) {
          blocked = true;
          return report(subject ? 'Training-Daten wurden außerhalb dieser Ansicht geändert. ' + subject + ' wurde nicht gespeichert; vorhandene Daten bleiben erhalten.' : 'Training-Daten wurden außerhalb dieser Ansicht geändert. Der Abschluss wurde nicht gespeichert; die aktive Einheit bleibt erhalten.');
        }
        const json = JSON.stringify(candidate);
        backend().setItem(STORAGE_KEY, json);
        state = copy(candidate); baseline = json; dirty = false;
        return report('');
      } catch (error) {
        return report(subject ? subject + ' konnte nicht gespeichert werden. Vorhandene Daten bleiben erhalten. Bitte die App nicht schließen und erneut speichern.' : 'Der Trainingsabschluss konnte nicht gespeichert werden. Die Einheit bleibt aktiv. Bitte die App nicht schließen und den Abschluss erneut versuchen.');
      }
    }
    function exportJSON() {
      requireRule(loaded, 'Training-Daten konnten nicht geladen werden; Export ist nicht verfügbar.');
      validateBackup(state);
      return JSON.stringify(state, null, 2);
    }
    // Explicit, confirmed full replacement; ordinary mutation protections remain intact.
    function importJSON(text, { confirmed = false, expectedState } = {}) {
      if (!loaded || blocked) return report('Import ist gesperrt, damit geschützte Training-Daten erhalten bleiben.');
      if (state.activeSession) return report('Während eines laufenden Trainings ist der Import gesperrt. Export bleibt möglich.');
      if (!confirmed) return report('Import wurde nicht bestätigt. Vorhandene Daten bleiben unverändert.');
      let candidate;
      try {
        candidate = parseBackup(text);
        requireRule(expectedState === undefined || expectedState === JSON.stringify(state), 'Training-Daten haben sich während der Bestätigung geändert. Bitte die Datei erneut auswählen.');
      } catch (error) { return report('Import nicht übernommen: ' + error.message); }
      try {
        if (backend().getItem(STORAGE_KEY) !== baseline) {
          blocked = true;
          return report('Training-Daten wurden außerhalb dieser Ansicht geändert. Import wurde zum Schutz der vorhandenen Daten gesperrt.');
        }
        const json = JSON.stringify(candidate);
        backend().setItem(STORAGE_KEY, json);
        state = copy(candidate); baseline = json; dirty = false; isNew = false;
        return report('');
      } catch (error) { return report('Import konnte nicht gespeichert werden. Vorhandene Daten und ungespeicherte Änderungen bleiben erhalten. Bitte den Import erneut versuchen.'); }
    }
    function initializeLibrary(exercises) {
      if (!loaded || blocked || !isNew || dirty) return { ok: false, ...status() };
      isNew = false;
      return update(candidate => { candidate.exercises = copy(exercises); });
    }
    return Object.freeze({ load, refresh, save, update, commit, initializeLibrary, exportJSON, importJSON, getSavedState: () => baseline === null ? emptyState() : JSON.parse(baseline), getState: () => copy(state), getStatus: status });
  }
  return Object.freeze({ STORAGE_KEY, SCHEMA_VERSION, INACTIVITY_MS, sessionReady, sessionExpired, touchSession, syncSessionOrder, emptyState, createId, createExercise, createPlan, snapshotExercises, withMax, parseWeight, validateState, validateBackup, parseBackup, createStore });
});
