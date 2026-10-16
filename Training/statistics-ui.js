(function (root) {
  'use strict';
  const S = root.KairosTrainingStatistics;
  const esc = text => String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const date = time => time === null ? 'Datum nicht verfügbar' : new Date(time).toLocaleDateString('de-DE');
  const duration = ms => ms === null ? 'Nicht verfügbar' : root.KairosTrainingSession.formatDuration(ms);
  const value = n => n.toLocaleString('de-DE',{maximumFractionDigits:2});
  const week = time => {const w=S.isoWeek(time);return `${w.year} · KW ${String(w.week).padStart(2,'0')}`;};
  const measurementDate = time => new Date(time).toLocaleString('de-DE',{dateStyle:'short',timeStyle:'short'});
  function chartCard(model) {
    const weekly=model.kind==='count';
    return `<article class="card statistics-chart" data-chart="${model.id}"><h2>${model.title}</h2><div class="statistics-plot"></div><div class="statistics-readout" aria-live="polite"><span class="muted">${model.points.length?'Diagramm antippen für Werte.':'Keine Daten im Zeitraum.'}</span></div><details><summary>Daten anzeigen (${model.points.length})</summary><table><thead><tr>${weekly?'<th>KW</th><th>Woche ab</th>':'<th>Datum</th>'}<th>${weekly?'Einheiten':model.kind==='weight'?'Gewicht':'Minuten'}</th></tr></thead><tbody>${model.points.map(p=>`<tr>${weekly?`<td>${week(p.time)}</td>`:''}<td>${weekly?date(p.time):measurementDate(p.time)}</td><td>${value(p.value)}${model.kind==='weight'?' kg':''}</td></tr>`).join('')}</tbody></table></details></article>`;
  }
  function create(host, read, resetScroll) {
    let section='overview', period='30', selected='', detail=null, lastSignature='', models=[];
    function drawChart(model) {
      const card=host.querySelector(`[data-chart="${model.id}"]`);if(!card)return;
      const plot=card.querySelector('.statistics-plot'), width=Math.max(240,Math.round(plot.getBoundingClientRect().width)||280),height=218;
      const left=model.kind==='weight'?64:52,right=12,top=24,bottom=174,span=width-left-right;
      const scale=S.axis(model.points.map(p=>p.value),model.kind),domain=model.domain;
      const x=time=>left+(time-domain.start)/(domain.end-domain.start)*span;
      const y=p=>bottom-(p.value-scale.min)/(scale.max-scale.min)*(bottom-top);
      const weekly=model.kind==='count';
      const centers=model.points.map(p=>{
        if(!weekly)return x(p.time);
        const end=new Date(p.time);end.setDate(end.getDate()+7);
        return x((Math.max(p.time,domain.start)+Math.min(end.getTime()-1,domain.end))/2);
      });
      const slots=centers.map((v,i)=>Math.min(i? v-centers[i-1]:span, i+1<centers.length?centers[i+1]-v:span));
      const grids=scale.ticks.map(t=>{const py=y({value:t});return `<path d="M${left} ${py}H${width-right}"/><text x="${left-8}" y="${py+4}" text-anchor="end">${esc(value(t))}${model.kind==='weight'?' kg':''}</text>`;}).join('');
      const ticks=S.timeTicks(domain,period,span);
      const labels=ticks.map((t,i)=>`<text x="${x(t)}" y="197" text-anchor="${period==='7'||ticks.length===1?'middle':i===0?'start':i===ticks.length-1?'end':'middle'}">${new Date(t).toLocaleDateString('de-DE',period==='7'?{day:'2-digit',month:'2-digit'}:{day:'2-digit',month:'2-digit',year:'numeric'}).replace(/\.$/,'')}</text>`).join('');
      const marks=model.points.map((p,i)=>weekly?`<rect data-point="${i}" x="${centers[i]-Math.max(1,Math.min(30,slots[i]*0.65))/2}" y="${y(p)}" width="${Math.max(1,Math.min(30,slots[i]*0.65))}" height="${bottom-y(p)}"/>${slots[i]>=28?`<text class="statistics-bar-value" x="${centers[i]}" y="${y(p)-7}" text-anchor="middle">${p.value}</text>`:''}`:`<circle data-point="${i}" cx="${centers[i]}" cy="${y(p)}" r="${model.points.length>150?2:3.5}"/>`).join('');
      plot.innerHTML=`<svg viewBox="0 0 ${width} ${height}" role="img" tabindex="${model.points.length?'0':'-1'}" aria-label="${model.title}. ${model.points.length} Werte. Antippen oder Pfeiltasten für Details." data-chart-plot="${model.id}"><g class="statistics-axis">${grids}<path d="M${left} ${top}V${bottom}H${width-right}"/><text x="${left}" y="13">${model.kind==='duration'?'Minuten':weekly?'Einheiten':''}</text>${labels}</g><g class="statistics-marks">${!weekly&&model.points.length>1?`<polyline points="${model.points.map((p,i)=>`${centers[i]},${y(p)}`).join(' ')}"/>`:''}${marks}</g></svg>`;
      model.layout={width,height,x:centers,y:model.points.map(y)};
      if(model.index!=null) showMeasurement(model,model.index);
    }
    function showMeasurement(model,index) {
      if(!model.points.length)return;
      model.index=Math.max(0,Math.min(index,model.points.length-1));
      const p=model.points[model.index], card=host.querySelector(`[data-chart="${model.id}"]`);
      if(!card)return;
      const label=model.kind==='count'?`${week(p.time)} · ${date(p.time)} · ${p.value} ${p.value===1?'Einheit':'Einheiten'}`:`${measurementDate(p.time)} · ${model.kind==='duration'?duration(p.value*60000):value(p.value)+' kg'}`;
      // Neighbour controls make coincident measurements and dense weeks individually reachable.
      card.querySelector('.statistics-readout').innerHTML=`<button class="btn-secondary" data-chart-step="-1" data-chart-id="${model.id}" aria-label="Vorheriger Wert" ${model.index===0?'disabled':''}>‹</button><output>${esc(label)}</output><button class="btn-secondary" data-chart-step="1" data-chart-id="${model.id}" aria-label="Nächster Wert" ${model.index===model.points.length-1?'disabled':''}>›</button>`;
      card.querySelectorAll('[data-point]').forEach(n=>n.classList.toggle('selected',Number(n.dataset.point)===model.index));
    }
    function drawCharts(){models.forEach(drawChart);}
    function weightModel(sessions,range){return {id:'weight',title:'Gewichtsverlauf',kind:'weight',points:S.weights(sessions,selected),domain:range};}
    function render() {
      const all=S.history(read()), sessions=S.filter(all,period), m=S.metrics(sessions), range=S.domain(all,period);
      const choices=S.choices(all);
      if(!choices.some(e=>e.id===selected))selected=choices[0]?.id||'';
      const signature=JSON.stringify([all,section,period,selected,detail,range]);
      if(signature===lastSignature)return;
      lastSignature=signature;models=[];
      const button=(key,label)=>`<button data-stat-section="${key}" aria-pressed="${section===key}">${label}</button>`;
      let html=`<div class="statistics-nav" role="group" aria-label="Statistikbereiche">${button('overview','Übersicht')}${button('charts','Verlauf')}${button('history','Historie')}</div>`;
      if(section!=='history')html+=`<div class="statistics-period" role="group" aria-label="Zeitraum">${['7','30','90','all'].map(p=>`<button data-stat-period="${p}" aria-pressed="${period===p}">${p==='all'?'Gesamt':p+' Tage'}</button>`).join('')}</div>`;
      if(section==='overview') {
        html+=`<div class="statistics-metrics">${[['Trainingseinheiten',m.sessions],['Gesamte Trainingszeit',duration(m.total)],['Ø Trainingsdauer',duration(m.average)],['Übungen abgeschlossen',m.completed],['Übungen übersprungen',m.skipped]].map(([label,v])=>`<div class="card"><span>${label}</span><strong>${esc(v)}</strong></div>`).join('')}</div>`;
        if(!sessions.length)html+='<p class="empty">Keine gespeicherten Trainingseinheiten in diesem Zeitraum.</p>';
        if(m.missingDuration)html+=`<p class="muted">Dauer für ${m.missingDuration} Einheiten nicht verfügbar. Berechnet aus den bekannten Dauern.</p>`;
      } else if(section==='charts') {
        models=[{id:'frequency',title:'Trainingshäufigkeit pro Kalenderwoche',kind:'count',points:S.weeks(sessions,range),domain:range},
          {id:'duration',title:'Trainingsdauer im Zeitverlauf',kind:'duration',points:S.history(sessions).reverse().filter(s=>S.date(s)!==null&&S.duration(s)!==null).map(s=>({time:S.date(s),value:S.duration(s)/60000})),domain:range},weightModel(sessions,range)];
        html+=models.slice(0,2).map(chartCard).join('');
        html+=`<div class="statistics-exercise-picker"><label for="statistics-exercise">Übung für Gewichtsverlauf</label><select id="statistics-exercise" ${choices.length?'':'disabled'}>${choices.length?choices.map(e=>`<option value="${esc(e.id)}" ${e.id===selected?'selected':''}>${esc(e.name)}${choices.filter(item=>item.name===e.name).length>1?' ('+(choices.filter(item=>item.name===e.name).findIndex(item=>item.id===e.id)+1)+')':''}</option>`).join(''):'<option>Keine Übungen gespeichert</option>'}</select></div><div id="statistics-weight-chart">${chartCard(models[2])}</div>`;
      } else {
        const session=all.find(s=>s.id===detail);
        if(session) {
          html+='<button class="btn-secondary" data-stat-back>← Alle Einheiten</button>';
          html+=`<article class="card"><h2>${esc(session.planName || 'Planname nicht verfügbar')}</h2><p>${date(S.date(session))} · ${duration(S.duration(session))}</p><ol class="statistics-exercises">${S.exercises(session).map(e=>`<li><strong>${esc(e.name || 'Übungsname nicht verfügbar')}</strong><span>${e.isMax===true?'Gewicht nicht verfügbar':typeof e.weightKg==='number'&&Number.isFinite(e.weightKg)&&e.weightKg>=0?value(e.weightKg)+' kg':'Gewicht nicht verfügbar'} · ${{completed:'Abgeschlossen',skipped:'Übersprungen',open:'Offen'}[e.status] || 'Status nicht verfügbar'}</span></li>`).join('')}</ol></article>`;
        } else html+=all.map(s=>{const c=S.counts(s);return `<button class="card statistics-history" data-stat-session="${esc(s.id)}"><span>${date(S.date(s))} · ${duration(S.duration(s))}</span><strong>${esc(s.planName || 'Planname nicht verfügbar')}</strong><span>${c.completed} abgeschlossen · ${c.skipped} übersprungen</span></button>`;}).join('') || '<p class="empty">Noch keine Trainingseinheiten gespeichert.</p>';
      }
      host.innerHTML=html;drawCharts();
    }
    host.addEventListener('click',event=>{
      const svg=event.target.closest('[data-chart-plot]');
      if(svg){
        const model=models.find(m=>m.id===svg.dataset.chartPlot);if(!model?.points.length)return;
        const rect=svg.getBoundingClientRect(),px=(event.clientX-rect.left)/rect.width*model.layout.width,py=(event.clientY-rect.top)/rect.height*model.layout.height;
        const distances=model.points.map((p,i)=>Math.abs(model.layout.x[i]-px)+(model.kind==='count'?0:Math.abs(model.layout.y[i]-py)*0.3));
        showMeasurement(model,distances.reduce((best,d,i)=>d<distances[best]?i:best,0));return;
      }
      const button=event.target.closest('button');if(!button||button.disabled)return;
      if(button.dataset.chartStep){const model=models.find(m=>m.id===button.dataset.chartId);showMeasurement(model,model.index+Number(button.dataset.chartStep));return;}
      let focusSelector;
      if(button.dataset.statSection){section=button.dataset.statSection;detail=null;focusSelector=`[data-stat-section="${section}"]`;}
      else if(button.dataset.statPeriod){period=button.dataset.statPeriod;focusSelector=`[data-stat-period="${period}"]`;}
      else if(button.dataset.statSession){detail=button.dataset.statSession;focusSelector='[data-stat-back]';}
      else if(button.hasAttribute('data-stat-back')){focusSelector='[data-stat-section="history"]';detail=null;}
      else return;
      render();resetScroll();if(event.detail===0)host.querySelector(focusSelector)?.focus({preventScroll:true});
    });
    host.addEventListener('keydown',event=>{
      const id=event.target.dataset.chartPlot;if(!id||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();const model=models.find(m=>m.id===id);if(!model.points.length)return;
      showMeasurement(model,event.key==='Home'?0:event.key==='End'?model.points.length-1:(model.index??-1)+(event.key==='ArrowRight'?1:-1));
    });
    host.addEventListener('change',event=>{
      if(event.target.id!=='statistics-exercise')return;
      selected=event.target.value;
      const all=S.history(read()),model=weightModel(S.filter(all,period),S.domain(all,period));
      models=models.map(m=>m.id==='weight'?model:m);
      host.querySelector('#statistics-weight-chart').innerHTML=chartCard(model);drawChart(model);
      // Keep the original native select attached; never refocus or reopen its iOS picker.
      lastSignature=JSON.stringify([all,section,period,selected,detail,model.domain]);
    });
    if(root.ResizeObserver){
      let previousWidth=-1;
      new ResizeObserver(()=>{const width=host.getBoundingClientRect().width;if(width!==previousWidth){previousWidth=width;drawCharts();}}).observe(host);
    }
    return {render,snapshot:()=>({section,period,selected,detail}),restore(saved){
      if(!saved||typeof saved!=='object')return;
      if(['overview','charts','history'].includes(saved.section))section=saved.section;
      if(['7','30','90','all'].includes(saved.period))period=saved.period;
      if(typeof saved.selected==='string')selected=saved.selected;
      if(typeof saved.detail==='string'||saved.detail===null)detail=saved.detail;
    }};
  }
  root.KairosTrainingStatisticsUI=Object.freeze({create});
})(globalThis);
