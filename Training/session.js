(function (root) {
  'use strict';
  function progress(session) {
    const total = session.exercises.length;
    const completed = session.exercises.filter(exercise => exercise.status === 'completed').length;
    return { completed, total, percent: Math.round(completed / total * 100) };
  }
  function elapsed(session, now = Date.now()) { return Math.max(0, now - session.startedAt); }
  function formatDuration(milliseconds) {
    const seconds = Math.floor(Math.max(0, milliseconds) / 1000);
    return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map(value => String(value).padStart(2, '0')).join(':');
  }
  function create(store, data, now = () => Date.now()) {
    function active(state) { if (!state.activeSession) throw new Error('Es gibt kein laufendes Training.'); return state.activeSession; }
    function weightContext() {
      const state = store.getState(), session = active(state), exercise = session.exercises[session.currentIndex];
      return {sessionId: session.id, exerciseId: exercise.id, snapshot: exercise, global: state.exercises.find(item => item.id === exercise.id) || null};
    }
    function mark(status) {
      return store.update(state => {
        const session = active(state), index = session.currentIndex;
        if (session.exercises[index].status === 'completed') throw new Error('Diese Übung ist bereits abgeschlossen.');
        session.exercises[index].status = status;
        const indices = session.exercises.map((exercise, i) => i);
        const next = indices.find(i => i > index && session.exercises[i].status === 'open')
          ?? indices.find(i => session.exercises[i].status === 'open')
          ?? indices.find(i => i > index && session.exercises[i].status === 'skipped')
          ?? indices.find(i => session.exercises[i].status === 'skipped');
        if (next !== undefined) session.currentIndex = next;
      });
    }
    return Object.freeze({
      start(planId) {
        return store.update(state => {
          if (state.activeSession) throw new Error('Es läuft bereits ein Training. Bitte dieses Training fortsetzen.');
          const plan = state.plans.find(item => item.id === planId);
          if (!plan || !plan.exerciseIds.length) throw new Error('Ein leerer oder fehlender Trainingsplan kann nicht gestartet werden.');
          state.activeSession = {
            id: data.createId(), planId: plan.id, planName: plan.name, planDescription: plan.description,
            startedAt: now(), endedAt: null, durationMs: null, currentIndex: 0,
            exercises: data.snapshotExercises(plan.exerciseIds.map(id => state.exercises.find(item => item.id === id)))
          };
        });
      },
      finish(expectedId) {
        return store.commit(state => {
          const session = active(state);
          if (session.id !== expectedId) throw new Error('Diese Einheit ist nicht mehr aktiv.');
          const endedAt = now();
          if (endedAt < session.startedAt) throw new Error('Die Geräteuhr liegt vor dem Trainingsstart. Bitte die Uhrzeit prüfen.');
          const completed = { ...session, endedAt, durationMs: endedAt - session.startedAt };
          delete completed.currentIndex;
          state.completedSessions.push(completed);
          state.activeSession = null;
        });
      },
      complete: () => mark('completed'),
      skip: () => mark('skipped'),
      select(index) {
        return store.update(state => {
          const session = active(state);
          if (!Number.isInteger(index) || !session.exercises[index] || session.exercises[index].status === 'completed') throw new Error('Bitte eine noch offene Übung auswählen.');
          session.currentIndex = index;
        });
      },
      weightContext,
      changeWeight(fields, expected) {
        if (expected !== undefined) store.refresh();
        return store.update(state => {
          if (expected !== undefined && JSON.stringify(expected) !== JSON.stringify(weightContext())) throw new Error('Diese Gewichtseingabe ist veraltet. Bitte das Gewicht der aktuellen Übung erneut öffnen. Es wurde kein Gewicht geändert.');
          const session = active(state), snapshot = session.exercises[session.currentIndex];
          const exercise = state.exercises.find(item => item.id === snapshot.id);
          if (!exercise) throw new Error('Diese Übung wurde aus der Bibliothek gelöscht. Ihr Trainingszustand bleibt erhalten; eine globale Gewichtsänderung ist nicht mehr möglich.');
          const values = { weightKg: data.parseWeight(fields.weightKg), isMax: fields.isMax, repetitions: fields.repetitions };
          Object.assign(snapshot, values); Object.assign(exercise, values);
        });
      }
    });
  }
  const api = Object.freeze({ create, progress, elapsed, formatDuration });
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.KairosTrainingSession = api;
})(globalThis);
