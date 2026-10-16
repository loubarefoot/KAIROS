(function (root) {
  'use strict';
  const ABSENCE_MS = 60 * 60 * 1000;
  function day(now) {
    const date = new Date(now);
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  }
  function entryView(state, now = Date.now(), { newDocument = false } = {}) {
    if (state.activeSession && (state.activeSession.endedAt != null || state.activeSession.exercises?.length && state.activeSession.exercises.every(item=>item.status === 'completed' || item.status === 'skipped'))) return 'active';
    if (state.activeSession) return now - (state.activeSession.lastActivityAt ?? state.activeSession.startedAt) >= ABSENCE_MS ? 'start' : 'active';
    if (newDocument) return 'start';
    if (state.settings.lastOpenedDay !== day(now) || (state.settings.lastBackgroundAt !== null && now - state.settings.lastBackgroundAt >= ABSENCE_MS)) return 'start';
    const view = state.settings.lastView;
    if (view === 'active' || view === 'training') return 'start';
    if (view === 'summary' && !state.completedSessions.length) return 'start';
    return view;
  }
  const api = Object.freeze({ABSENCE_MS, day, entryView});
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.KairosTrainingNavigation = api;
})(globalThis);
