(function (root) {
  'use strict';
  const S = root.KairosTrainingStatistics;
  const esc = text => String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const date = time => time === null ? 'Datum nicht verfügbar' : new Date(time).toLocaleDateString('de-DE');
  const duration = ms => ms === null ? 'Nicht verfügbar' : root.KairosTrainingSession.formatDuration(ms);
  const value = n => n.toLocaleString('de-DE',{maximumFractionDigits:2});
  function chart(title, points, unit, bars = false) {
    if (!points.length) return `<article class="card"><h2>${title}</h2><p class="muted">Keine auswertbaren Daten im Zeitraum.</p></article>`;
    const width = Math.max(280,points.length*48+60), height=180, max=points.reduce((maximum,p)=>Math.max(maximum,p.value),1);
    const minTime=points[0].time, span=points.at(-1).time-minTime;
    const x=(p,i)=>bars ? 38+i*(width-60)/points.length+(width-60)/points.length/2 : span ? 38+(p.time-minTime)/span*(width-60) : width/2;
    const y=p=>145-p.value/max*115;
    let lastLabelX=-Infinity;
    const labels=points.map((p,i)=>{if(x(p,i)-lastLabelX<75)return '';lastLabelX=x(p,i);return `<text x="${x(p,i)}" y="170" text-anchor="middle">${new Date(p.time).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'})}</text>`;}).join('');
    const marks=points.map((p,i)=>bars ? `<rect x="${x(p,i)-10}" y="${y(p)}" width="20" height="${145-y(p)}"/>` : `<circle cx="${x(p,i)}" cy="${y(p)}" r="4"/>`).join('');
    return `<article class="card statistics-chart"><h2>${title}</h2><div class="statistics-plot" tabindex="0" role="region" aria-label="${title}, seitlich scrollbar"><svg width="${width}" height="${height}" role="img" aria-label="${title}: ${points.length} Werte. Exakte Werte stehen unter Daten anzeigen."><g class="statistics-axis"><path d="M34 25V145H${width-8}"/><text x="2" y="22">${esc(value(max))}</text><text x="12" y="145">0</text>${labels}</g><g class="statistics-marks">${!bars&&points.length>1?`<polyline points="${points.map((p,i)=>`${x(p,i)},${y(p)}`).join(' ')}"/>`:''}${marks}</g></svg></div><p class="muted">${unit} · ${date(points[0].time)}${points.length>1?' – '+date(points.at(-1).time):''}${bars?' · Wochenbeginn Montag; nur Wochen mit Training':''}${width>280?' · Seitlich wischen für weitere Werte':''}</p><details><summary>Daten anzeigen (${points.length})</summary><table><thead><tr><th>${bars?'Woche ab':'Datum'}</th><th>${unit}</th></tr></thead><tbody>${points.map(p=>`<tr><td>${date(p.time)}</td><td>${value(p.value)}</td></tr>`).join('')}</tbody></table></details></article>`;
  }
  function create(host, read, resetScroll) {
    let section='overview', period='30', selected='', detail=null;
    function render() {
      const all=S.history(read()), sessions=S.filter(all,period), m=S.metrics(sessions);
      const choices=S.choices(all);
      if (!choices.some(e=>e.id===selected)) selected=choices[0]?.id || '';
      const button=(key,label)=>`<button class="btn-secondary" data-stat-section="${key}" aria-pressed="${section===key}">${label}</button>`;
      let html=`<div class="statistics-nav" role="group" aria-label="Statistikbereiche">${button('overview','Übersicht')}${button('charts','Verlauf')}${button('history','Historie')}</div>`;
      if(section!=='history') html+=`<div class="statistics-period" role="group" aria-label="Zeitraum">${['7','30','90','all'].map(p=>`<button class="btn-secondary" data-stat-period="${p}" aria-pressed="${period===p}">${p==='all'?'Gesamt':p+' Tage'}</button>`).join('')}</div><p class="muted">Nach Trainingsbeginn · ${period==='all'?'alle gespeicherten Einheiten':'einschließlich heute'}</p>`;
      if(section==='overview') {
        html+=`<div class="statistics-metrics">${[['Trainingseinheiten',m.sessions],['Gesamte Trainingszeit',duration(m.total)],['Ø Trainingsdauer',duration(m.average)],['Übungen abgeschlossen',m.completed],['Übungen übersprungen',m.skipped]].map(([label,v])=>`<div class="card"><span>${label}</span><strong>${esc(v)}</strong></div>`).join('')}</div>`;
        if(!sessions.length) html+='<p class="empty">Keine gespeicherten Trainingseinheiten in diesem Zeitraum.</p>';
        if(m.missingDuration) html+=`<p class="muted">Dauer für ${m.missingDuration} Einheiten nicht verfügbar. Gesamtzeit und Durchschnitt berücksichtigen nur bekannte Dauern.</p>`;
      } else if(section==='charts') {
        html+=chart('Trainingshäufigkeit pro Kalenderwoche',S.weeks(sessions),'Einheiten',true);
        html+=chart('Trainingsdauer im Zeitverlauf',S.history(sessions).reverse().filter(s=>S.date(s)!==null&&S.duration(s)!==null).map(s=>({time:S.date(s),value:S.duration(s)/60000})),'Minuten');
        html+=`<label for="statistics-exercise">Übung für Gewichtsverlauf</label><select id="statistics-exercise" ${choices.length?'':'disabled'}>${choices.length?choices.map(e=>`<option value="${esc(e.id)}" ${e.id===selected?'selected':''}>${esc(e.name)}${choices.filter(item=>item.name===e.name).length>1?' ('+(choices.filter(item=>item.name===e.name).findIndex(item=>item.id===e.id)+1)+')':''}</option>`).join(''):'<option>Keine Übungen gespeichert</option>'}</select>`;
        html+=chart('Gewichtsverlauf',S.weights(sessions,selected),'kg');
        html+='<p class="muted">Nur abgeschlossene Übungen mit gespeichertem Zahlengewicht. MAX, fehlende Gewichte und fehlende Datumsangaben werden nicht als Messwerte dargestellt.</p>';
      } else {
        const session=all.find(s=>s.id===detail);
        if(session) {
          html+='<button class="btn-secondary" data-stat-back>← Alle Einheiten</button>';
          html+=`<article class="card"><h2>${esc(session.planName || 'Planname nicht verfügbar')}</h2><p>${date(S.date(session))} · ${duration(S.duration(session))}</p><ol class="statistics-exercises">${S.exercises(session).map(e=>`<li><strong>${esc(e.name || 'Übungsname nicht verfügbar')}</strong><span>${e.isMax===true?'MAX':typeof e.weightKg==='number'&&Number.isFinite(e.weightKg)&&e.weightKg>=0?value(e.weightKg)+' kg':'Gewicht nicht verfügbar'} · ${{completed:'Abgeschlossen',skipped:'Übersprungen',open:'Offen'}[e.status] || 'Status nicht verfügbar'}</span></li>`).join('')}</ol></article>`;
        } else html+=all.map(s=>{const c=S.counts(s);return `<button class="card statistics-history" data-stat-session="${esc(s.id)}"><span>${date(S.date(s))} · ${duration(S.duration(s))}</span><strong>${esc(s.planName || 'Planname nicht verfügbar')}</strong><span>${c.completed} abgeschlossen · ${c.skipped} übersprungen</span></button>`;}).join('') || '<p class="empty">Noch keine Trainingseinheiten gespeichert.</p>';
      }
      host.innerHTML=html;
    }
    host.addEventListener('click',event=>{
      const button=event.target.closest('button'); if(!button)return;
      let focusSelector;
      if(button.dataset.statSection) {section=button.dataset.statSection;detail=null;focusSelector=`[data-stat-section="${section}"]`;}
      else if(button.dataset.statPeriod) {period=button.dataset.statPeriod;focusSelector=`[data-stat-period="${period}"]`;}
      else if(button.dataset.statSession) {detail=button.dataset.statSession;focusSelector='[data-stat-back]';}
      else if(button.hasAttribute('data-stat-back')) {focusSelector=`[data-stat-section="history"]`;detail=null;}
      else return;
      render();resetScroll();host.querySelector(focusSelector)?.focus({preventScroll:true});
    });
    host.addEventListener('change',event=>{if(event.target.id==='statistics-exercise'){selected=event.target.value;render();host.querySelector('select').focus({preventScroll:true});}});
    return {render};
  }
  root.KairosTrainingStatisticsUI=Object.freeze({create});
})(globalThis);
