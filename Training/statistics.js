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
  function weeks(sessions, domain = null) {
    const dated = sessions.filter(s=>date(s)!==null);
    if (!dated.length && !domain) return [];
    const totals = new Map();
    dated.forEach(s=>{const key=monday(date(s)); totals.set(key,(totals.get(key)||0)+1);});
    if (domain) {
      const cursor = new Date(monday(domain.start));
      while (cursor.getTime() <= domain.end) {
        if (!totals.has(cursor.getTime())) totals.set(cursor.getTime(), 0);
        cursor.setDate(cursor.getDate() + 7);
      }
    }
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
  function domain(sessions, period, now = Date.now()) {
    const dates = sessions.map(date).filter(time => time !== null);
    const start = new Date(now), end = new Date(now);
    if (period === 'all' && dates.length) {
      start.setTime(dates.reduce((a,b)=>Math.min(a,b)));
      end.setTime(dates.reduce((a,b)=>Math.max(a,b)));
    } else start.setDate(start.getDate() - (period === 'all' ? 6 : Number(period) - 1));
    start.setHours(0,0,0,0); end.setHours(23,59,59,999);
    return {start:start.getTime(), end:end.getTime()};
  }
  function isoWeek(time) {
    // UTC calendar arithmetic avoids local daylight-saving hours in ISO week numbering.
    const local = new Date(time), thursday = new Date(Date.UTC(local.getFullYear(),local.getMonth(),local.getDate()));
    thursday.setUTCDate(thursday.getUTCDate() + 3 - (thursday.getUTCDay()+6)%7);
    const year=thursday.getUTCFullYear(), first=new Date(Date.UTC(year,0,4));
    first.setUTCDate(first.getUTCDate() + 3 - (first.getUTCDay()+6)%7);
    return {year, week:1 + Math.round((thursday-first)/604800000)};
  }
  function axis(values, kind) {
    if (!values.length) return {min:0,max:1,ticks:[]};
    const low=values.reduce((a,b)=>Math.min(a,b)), high=values.reduce((a,b)=>Math.max(a,b));
    const padding=Math.max((high-low)*0.15, high===low ? Math.max(0.5,high*0.02) : 0);
    const lower=kind==='weight' ? Math.max(0,low-padding) : 0;
    const upper=kind==='weight' ? high+padding : Math.max(high,1);
    const raw=(upper-lower)/4, magnitude=10**Math.floor(Math.log10(raw));
    const step=Math.max(kind==='count'?1:0,([1,2,2.5,5,10].find(n=>n*magnitude>=raw)||10)*magnitude);
    const min=Math.floor(lower/step)*step, max=Math.ceil(upper/step)*step;
    const ticks=Array.from({length:Math.round((max-min)/step)+1},(_,i)=>Number((min+i*step).toPrecision(12)));
    return {min,max,ticks};
  }
  function timeTicks(range, period, width) {
    const first=new Date(range.start), last=new Date(range.end);
    const count=Math.round((Date.UTC(last.getFullYear(),last.getMonth(),last.getDate())-Date.UTC(first.getFullYear(),first.getMonth(),first.getDate()))/86400000)+1;
    const labels=period==='7' ? 7 : Math.min(count, Math.max(2,Math.floor(width/80)+1));
    return Array.from({length:labels},(_,i)=>{
      const d=new Date(first); d.setDate(d.getDate()+(labels===1?0:Math.round(i*(count-1)/(labels-1))));
      d.setHours(12,0,0,0); return d.getTime();
    });
  }
  const api = Object.freeze({date,duration,exercises,history,filter,counts,metrics,weeks,choices,weights,domain,isoWeek,axis,timeTicks});
  if (typeof module === 'object' && module.exports) module.exports=api; else root.KairosTrainingStatistics=api;
})(globalThis);
