(function (root) {
  'use strict';
  const number = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
  const timestamp = value => number(value) && !Number.isNaN(new Date(value).getTime());
  const exercises = session => Array.isArray(session.exercises) ? session.exercises : [];
  const date = session => timestamp(session.startedAt) ? session.startedAt : null;
  const duration = session => number(session.durationMs) ? session.durationMs : null;
  function history(sessions) { return [...sessions].sort((a,b) => (date(b) ?? -1) - (date(a) ?? -1)); }
  function filter(sessions, days, now = Date.now()) {
    if (days === 'all') return [...sessions];
    const start = new Date(now); start.setHours(0,0,0,0); start.setDate(start.getDate() - Number(days) + 1);
    return sessions.filter(session => date(session) !== null && date(session) >= start.getTime() && date(session) <= now);
  }
  function counts(session) {
    const items = exercises(session);
    return {completed:items.filter(e=>e.status === 'completed').length, skipped:items.filter(e=>e.status === 'skipped').length};
  }
  function metrics(sessions) {
    const durations = sessions.map(duration).filter(value=>value !== null);
    const total = durations.reduce((a,b)=>a+b,0);
    return {sessions:sessions.length, total:durations.length || !sessions.length ? total : null,
      average:durations.length ? total / durations.length : null, missingDuration:sessions.length-durations.length,
      completed:sessions.reduce((n,s)=>n+counts(s).completed,0), skipped:sessions.reduce((n,s)=>n+counts(s).skipped,0)};
  }
  function monday(time) { const d = new Date(time); d.setHours(0,0,0,0); d.setDate(d.getDate()-(d.getDay()+6)%7); return d.getTime(); }
  function weeks(sessions) {
    const dated = sessions.filter(s=>date(s)!==null);
    if (!dated.length) return [];
    const totals = new Map();
    dated.forEach(s=>{const key=monday(date(s)); totals.set(key,(totals.get(key)||0)+1);});
    // Sparse weeks preserve every recorded week without allocating years of empty buckets.
    return [...totals].sort((a,b)=>a[0]-b[0]).map(([time,value])=>({time,value}));
  }
  function choices(sessions) {
    const map = new Map();
    history(sessions).forEach(s=>exercises(s).forEach(e=>{if(e.id && !map.has(e.id)) map.set(e.id,{id:e.id,name:e.name || 'Name nicht verfügbar'});}));
    return [...map.values()].sort((a,b)=>a.name.localeCompare(b.name,'de'));
  }
  function weights(sessions, id) {
    return history(sessions).reverse().flatMap(s=>date(s)===null ? [] : exercises(s).filter(e=>e.id===id && e.status==='completed' && e.isMax===false && number(e.weightKg)).map(e=>({time:date(s),value:e.weightKg})));
  }
  const api = Object.freeze({date,duration,exercises,history,filter,counts,metrics,weeks,choices,weights});
  if (typeof module === 'object' && module.exports) module.exports=api; else root.KairosTrainingStatistics=api;
})(globalThis);
