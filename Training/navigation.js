(function (root) {
  'use strict';
  const ABSENCE_MS = 60 * 60 * 1000;
  function day(now) {
    const date = new Date(now);
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  }
  function entryView(state, now = Date.now(), { newDocument = false } = {}) {
    if (state.activeSession) return 'active';
    if (newDocument) return 'start';
    if (state.settings.lastOpenedDay !== day(now) || (state.settings.lastBackgroundAt !== null && now - state.settings.lastBackgroundAt >= ABSENCE_MS)) return 'start';
    const view = state.settings.lastView;
    if (view === 'active') return 'training';
    if (view === 'summary' && !state.completedSessions.length) return 'training';
    return view;
  }
  const api = Object.freeze({ABSENCE_MS, day, entryView});
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.KairosTrainingNavigation = api;
})(globalThis);
