(() => {
  'use strict';
  const D = KairosTrainingData;
  const $ = id => document.getElementById(id);
  const esc = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const store = D.createStore({ onStatus(status) { $('storage-status').textContent = status.message; $('storage-status').hidden = !status.message; $('retry-save').hidden = !status.dirty || status.blocked; if (status.message) $('storage-status').scrollIntoView({ block: 'start' }); } });
  store.load();
  if (store.getStatus().isNew && !store.getStatus().blocked) store.initializeLibrary(KairosTrainingLibrary.create(D));
  const management = KairosTrainingManagement.create(store, D);
  const sessionFlow = KairosTrainingSession.create(store, D);
  const views = Array.from(document.querySelectorAll('.view'));
  const tabs = Array.from(document.querySelectorAll('[data-tab]'));
  let trainingView = 'start', editingPlan = null, addingToPlan = null;
  let summaryId = null, finishing = false, durationInterval = null;
  function showView(name) {
    const target = $('view-' + name);
    if (!target || !views.includes(target)) return;
    views.forEach(view => { view.hidden = view !== target; });
    if (target.dataset.area === 'training') trainingView = name;
    tabs.forEach(tab => { const active = tab.dataset.tab === target.dataset.area; tab.classList.toggle('active', active); if (active) tab.setAttribute('aria-current','page'); else tab.removeAttribute('aria-current'); });
    window.scrollTo(0,0); target.querySelector('h1').focus({preventScroll:true});
  }
  const weightLabel = exercise => exercise.isMax ? 'MAX' : exercise.weightKg === null ? 'Gewicht offen' : exercise.weightKg.toLocaleString('de-DE') + ' kg';
  function rowControls(index, length) {
    return `<button type="button" class="drag-handle" aria-label="Durch Ziehen verschieben">☰</button><button type="button" data-move="-1" aria-label="Nach oben" ${index===0?'disabled':''}>↑</button><button type="button" data-move="1" aria-label="Nach unten" ${index===length-1?'disabled':''}>↓</button>`;
  }
  function render() {
    const state = store.getState();
    const plans = state.planOrder.map(id => state.plans.find(plan => plan.id === id));
    document.querySelectorAll('[data-plan-list]').forEach(list => { list.innerHTML = plans.length ? plans.map(plan => `<div class="plan-summary"><strong>${esc(plan.name)}</strong><p class="muted">${esc(plan.description)} · ${plan.exerciseIds.length} Übungen</p><button class="btn-secondary" data-start-plan="${esc(plan.id)}" ${!plan.exerciseIds.length || state.activeSession || store.getStatus().blocked ? 'disabled' : ''}>Training starten${plan.exerciseIds.length ? '' : ' – keine Übungen'}</button></div>`).join('') : '<p class="empty">Noch keine Trainingspläne vorhanden.</p>'; });
    $('plan-list').innerHTML = plans.map((plan,index) => `<div class="card sort-row" data-id="${esc(plan.id)}" data-index="${index}"><strong>${esc(plan.name)}</strong><p class="muted">${esc(plan.description)} · ${plan.exerciseIds.length} Übungen</p><div class="row-actions">${rowControls(index,plans.length)}<button data-edit-plan="${esc(plan.id)}">Bearbeiten</button><button data-delete-plan="${esc(plan.id)}">Löschen</button></div></div>`).join('') || '<p class="empty">Noch keine Trainingspläne vorhanden.</p>';
    $('exercise-list').innerHTML = state.exercises.map(exercise => `<div class="card"><strong>${esc(exercise.name)}</strong><p class="muted">${exercise.source==='builtin'?'Grundbibliothek':'Eigene Übung'} · ${esc(weightLabel(exercise))} · ${exercise.repetitions} Wiederholungen</p><button class="btn-secondary" data-edit-exercise="${esc(exercise.id)}">Bearbeiten</button></div>`).join('') || '<p class="empty">Keine Übungen vorhanden.</p>';
    if (editingPlan) renderPlanExercises();
    renderActive();
    renderSavedSessions();
    const blocked = store.getStatus().blocked || !store.getStatus().loaded;
    document.querySelectorAll('#new-plan, #new-exercise, [data-edit-plan], [data-delete-plan], [data-edit-exercise], .drag-handle, [data-move]').forEach(button => { if(blocked) button.disabled = true; });
  }
  function renderActive() {
    const session = store.getState().activeSession;
    syncDuration(session);
    if (!session) { $('active-content').innerHTML = '<div class="card"><p class="empty">Noch kein Training gestartet.</p></div>'; return; }
    const exercise = session.exercises[session.currentIndex], progress = KairosTrainingSession.progress(session);
    const disabled = store.getStatus().blocked ? 'disabled' : '';
    const done = exercise.status === 'completed';
    $('active-content').innerHTML = `<div class="card"><h2>${esc(session.planName)}</h2><p class="duration">Dauer: <time id="training-duration">${KairosTrainingSession.formatDuration(KairosTrainingSession.elapsed(session))}</time></p><p id="training-progress">${progress.completed} / ${progress.total} Übungen abgeschlossen · ${progress.percent} %</p><progress max="${progress.total}" value="${progress.completed}" aria-labelledby="training-progress"></progress></div>
      ${progress.completed === progress.total ? '<div class="card"><p>Alle Übungen abgeschlossen. Das Training läuft weiterhin.</p></div>' : ''}
      <div class="card exercise"><p class="muted">Übung ${session.currentIndex + 1} von ${progress.total} · ${done ? 'Abgeschlossen' : exercise.status === 'skipped' ? 'Übersprungen – offen' : 'Offen'}</p><h2 class="exercise-name">${esc(exercise.name)}</h2><button class="weight weight-button" id="edit-training-weight" ${disabled}>${esc(weightLabel(exercise))}<span class="weight-hint">Gewicht bearbeiten</span></button>${exercise.isMax ? `<p>3 × ${exercise.repetitions}</p>` : ''}<button class="btn-primary" id="complete-exercise" ${done ? 'disabled' : disabled}>Übung abgeschlossen</button><button class="btn-secondary" id="skip-exercise" ${done ? 'disabled' : disabled}>Überspringen</button></div>
      <div class="card"><h2>Übungen</h2>${session.exercises.map((item,index) => `<div class="session-row"><strong>${esc(item.name)}</strong><p class="muted">${item.status === 'completed' ? 'Abgeschlossen' : item.status === 'skipped' ? 'Übersprungen – offen' : 'Offen'}</p>${item.status !== 'completed' ? `<button class="btn-secondary" data-select-exercise="${index}" ${disabled}>${item.status === 'skipped' ? 'Jetzt nachholen' : 'Übung auswählen'}</button>` : ''}</div>`).join('')}</div>
      <button class="btn-primary" id="finish-training" ${disabled || (finishing ? 'disabled' : '')}>Training beenden</button>`;
  }
  function tickDuration() {
    const session = store.getState().activeSession, label = $('training-duration');
    if (session && label) label.textContent = KairosTrainingSession.formatDuration(KairosTrainingSession.elapsed(session));
  }
  function syncDuration(session) {
    if (session && durationInterval === null) durationInterval = window.setInterval(tickDuration, 1000);
    if (!session && durationInterval !== null) { window.clearInterval(durationInterval); durationInterval = null; }
  }
  function renderSavedSessions() {
    const saved = store.getSavedState().completedSessions;
    const last = saved.reduce((latest, session) => !latest || session.endedAt >= latest.endedAt ? session : latest, null);
    $('last-training').innerHTML = last ? `<strong>${esc(last.planName)}</strong><p class="muted">${esc(new Date(last.endedAt).toLocaleDateString('de-DE'))}</p>` : '<p class="empty">Noch kein Training vorhanden.</p>';
    const summary = saved.find(session => session.id === summaryId);
    if (summary) {
      const progress = KairosTrainingSession.progress(summary);
      $('training-summary').innerHTML = `<h2>${esc(summary.planName)}</h2><p>Datum: ${esc(new Date(summary.endedAt).toLocaleDateString('de-DE'))}</p><p>Dauer: ${KairosTrainingSession.formatDuration(summary.durationMs)}</p><p>Übungen: ${progress.completed} / ${progress.total}</p>`;
    }
  }
  async function finishTraining() {
    if (finishing || !store.getState().activeSession) return;
    finishing = true;
    const session = store.getState().activeSession, progress = KairosTrainingSession.progress(session);
    try {
      const confirmed = await confirmAction(`Training „${session.planName}“ beenden? ${progress.completed} von ${progress.total} Übungen sind abgeschlossen. Auch offene Übungen werden mit der Einheit gespeichert.`, 'Training beenden', 'Training beenden');
      if (!confirmed) return;
      const outcome = sessionFlow.finish(session.id);
      render();
      if (outcome.ok) { summaryId = session.id; $('training-weight-editor').hidden = true; renderSavedSessions(); showView('summary'); }
    } finally { finishing = false; renderActive(); }
  }
  function trainingWeightEditor() {
    const exercise = store.getState().activeSession.exercises[store.getState().activeSession.currentIndex];
    $('training-weight-editor').hidden = false;
    $('training-weight-editor').innerHTML = `<form id="training-weight-form" class="card"><h2>Gewicht bearbeiten</h2><label>Gewicht (kg)<input name="weight" type="text" inputmode="decimal" value="${exercise.weightKg === null ? '' : exercise.weightKg}" ${exercise.isMax ? 'disabled' : ''}></label><label class="check"><input type="checkbox" name="max" ${exercise.isMax ? 'checked' : ''}> MAX-Modus</label><label>Wiederholungen<input type="number" name="repetitions" min="1" step="1" required value="${exercise.repetitions}"></label><button type="submit" class="btn-primary">Gewicht speichern</button><button type="button" class="btn-secondary" id="cancel-training-weight">Abbrechen</button></form>`;
    const form = $('training-weight-form');
    (form.elements.weight.disabled ? form.elements.max : form.elements.weight).focus();
  }
  function resumeActive() { if (store.getState().activeSession) { renderActive(); showView('active'); } }
  function result(action) { const outcome = action(); render(); return outcome.ok; }
  async function confirmAction(text, title, label) {
    const dialog = $('confirm-dialog'); $('confirm-text').textContent = text; $('confirm-title').textContent = title; dialog.querySelector('[value=delete]').textContent = label; dialog.returnValue = 'cancel'; dialog.showModal();
    return new Promise(resolve => dialog.addEventListener('close', () => resolve(dialog.returnValue === 'delete'), {once:true}));
  }
  const confirmDelete = text => confirmAction(text, 'Löschen bestätigen', 'Löschen');
  function exerciseEditor(id = null, planId = null) {
    const exercise = id ? store.getState().exercises.find(item => item.id===id) : {name:'',weightKg:null,repetitions:10,isMax:false,source:'custom'};
    addingToPlan = planId;
    $('exercise-editor').hidden = false;
    $('exercise-editor').innerHTML = `<form class="card" id="exercise-form" data-id="${esc(id || '')}"><h2>${id?'Übung bearbeiten':'Eigene Übung erstellen'}</h2><label>Name<input name="name" required value="${esc(exercise.name)}"></label><label>Gewicht (kg)<input name="weight" inputmode="decimal" type="text" value="${exercise.weightKg===null?'':exercise.weightKg}" ${exercise.isMax?'disabled':''}></label><label class="check"><input name="max" type="checkbox" ${exercise.isMax?'checked':''}> MAX-Modus</label><label>Wiederholungen<input name="repetitions" type="number" min="1" step="1" required value="${exercise.repetitions}"></label><p class="muted">Gewicht darf leer bleiben. Bei MAX bleibt das vorherige Gewicht erhalten.</p><button class="btn-primary" type="submit">Übung speichern</button><button class="btn-secondary" type="button" id="cancel-exercise">Abbrechen</button>${id && exercise.source==='custom'?`<button class="btn-danger" type="button" data-delete-exercise="${esc(id)}">Übung dauerhaft löschen</button>`:''}</form>`;
    showView('exercises'); $('exercise-form').elements.name.focus();
  }
  function planEditor(id = null) {
    const plan = id ? store.getState().plans.find(item => item.id===id) : {name:'',description:''};
    editingPlan = id;
    $('plan-editor').hidden = false;
    $('plan-editor').innerHTML = `<form class="card" id="plan-form" data-id="${esc(id || '')}"><h2>${id?'Trainingsplan bearbeiten':'Trainingsplan erstellen'}</h2><label>Name<input name="name" required value="${esc(plan.name)}"></label><label>Beschreibung<textarea name="description">${esc(plan.description)}</textarea></label><button class="btn-primary" type="submit">Plan speichern</button><button class="btn-secondary" type="button" id="close-plan">Schließen</button></form>${id?'<div class="card"><h2>Übungen im Plan</h2><div id="plan-exercises" class="sortable" data-sort="exercises"></div><form id="add-exercise-form"><label>Übung auswählen<select name="exercise" id="exercise-choice"></select></label><button class="btn-secondary" type="submit">Übung hinzufügen</button></form><button class="btn-secondary" id="create-for-plan">Neue eigene Übung hinzufügen</button></div>':''}`;
    if(id) renderPlanExercises(); $('plan-form').elements.name.focus();
  }
  function renderPlanExercises() {
    if (!$('plan-exercises')) return;
    const state = store.getState(), plan = state.plans.find(item => item.id===editingPlan);
    if(!plan) { editingPlan=null; $('plan-editor').hidden=true; return; }
    $('plan-exercises').innerHTML = plan.exerciseIds.map((id,index) => { const exercise=state.exercises.find(item=>item.id===id); return `<div class="sort-row" data-index="${index}"><strong>${esc(exercise.name)}</strong><p class="muted">${esc(weightLabel(exercise))}</p><div class="row-actions">${rowControls(index,plan.exerciseIds.length)}<button data-remove-exercise="${esc(id)}">Entfernen</button></div></div>`; }).join('') || '<p class="empty">Dieser Plan enthält noch keine Übungen.</p>';
    const available=state.exercises.filter(item=>!plan.exerciseIds.includes(item.id));
    $('exercise-choice').innerHTML=available.map(item=>`<option value="${esc(item.id)}">${esc(item.name)}</option>`).join('');
    $('add-exercise-form').querySelector('button').disabled = !available.length;
  }
  document.addEventListener('change', event => { if(event.target.name==='max' && ['exercise-form','training-weight-form'].includes(event.target.form?.id)) event.target.form.elements.weight.disabled=event.target.checked; });
  document.addEventListener('submit', event => {
    if(!['exercise-form','plan-form','add-exercise-form','training-weight-form'].includes(event.target.id)) return;
    event.preventDefault(); const form=event.target;
    if(form.id==='training-weight-form') {
      if(result(()=>sessionFlow.changeWeight({weightKg:form.elements.weight.value,isMax:form.elements.max.checked,repetitions:Number(form.elements.repetitions.value)}))) $('training-weight-editor').hidden=true;
    } else if(form.id==='exercise-form') {
      const success=result(()=>management.saveExercise(form.dataset.id || null,{name:form.elements.name.value.trim(),weightKg:form.elements.weight.value,repetitions:Number(form.elements.repetitions.value),isMax:form.elements.max.checked},addingToPlan));
      if(success) { $('exercise-editor').hidden=true; if(addingToPlan) { showView('plans'); planEditor(addingToPlan); } addingToPlan=null; }
    } else if(form.id==='plan-form') {
      const existing=form.dataset.id;
      if(result(()=>management.savePlan(existing || null,{name:form.elements.name.value.trim(),description:form.elements.description.value}))) { if(existing) planEditor(existing); else { editingPlan=null; $('plan-editor').hidden=true; } }
    } else result(()=>management.addExercise(editingPlan,form.elements.exercise.value));
  });
  document.addEventListener('click', async event => {
    const button=event.target.closest('button'); if(!button || button.disabled) return;
    if(button.id==='finish-training') finishTraining();
    else if(button.dataset.startPlan) { result(()=>sessionFlow.start(button.dataset.startPlan)); if(store.getState().activeSession) showView('active'); }
    else if(button.id==='complete-exercise' || button.id==='skip-exercise') { $('training-weight-editor').hidden=true; result(()=>button.id==='complete-exercise'?sessionFlow.complete():sessionFlow.skip()); }
    else if(button.dataset.selectExercise!==undefined) { $('training-weight-editor').hidden=true; result(()=>sessionFlow.select(Number(button.dataset.selectExercise))); }
    else if(button.id==='edit-training-weight') trainingWeightEditor();
    else if(button.id==='cancel-training-weight') $('training-weight-editor').hidden=true;
    else if(button.id==='retry-save') result(()=>store.save());
    else if(button.dataset.view) showView(button.dataset.view);
    else if(button.dataset.tab) showView(button.dataset.tab==='training'?(store.getState().activeSession?'active':trainingView):'settings');
    else if(button.id==='new-exercise') exerciseEditor();
    else if(button.dataset.editExercise) exerciseEditor(button.dataset.editExercise);
    else if(button.id==='cancel-exercise') { $('exercise-editor').hidden=true; if(addingToPlan) showView('plans'); addingToPlan=null; }
    else if(button.id==='new-plan') planEditor();
    else if(button.dataset.editPlan) planEditor(button.dataset.editPlan);
    else if(button.id==='close-plan') { editingPlan=null; $('plan-editor').hidden=true; }
    else if(button.id==='create-for-plan') exerciseEditor(null,editingPlan);
    else if(button.dataset.removeExercise) result(()=>management.removeExercise(editingPlan,button.dataset.removeExercise));
    else if(button.dataset.deleteExercise && await confirmDelete('Diese eigene Übung dauerhaft löschen und aus allen Trainingsplänen entfernen? Gespeicherte und laufende Einheiten bleiben unverändert.')) { if(result(()=>management.deleteExercise(button.dataset.deleteExercise))) $('exercise-editor').hidden=true; }
    else if(button.dataset.deletePlan && await confirmDelete('Diesen Trainingsplan löschen? Übungen sowie gespeicherte und laufende Einheiten bleiben erhalten.')) { if(result(()=>management.deletePlan(button.dataset.deletePlan))) { editingPlan=null; $('plan-editor').hidden=true; } }
    else if(button.dataset.move) { const row=button.closest('.sort-row'), list=row.parentElement; result(()=>management.reorder(list.dataset.sort==='plans'?null:editingPlan,Number(row.dataset.index),Number(row.dataset.index)+Number(button.dataset.move))); }
  });
  // Pointer capture supports drag-and-drop on touchscreens and with a mouse.
  let drag=null;
  document.addEventListener('pointerdown', event => {
    const handle=event.target.closest('.drag-handle'); if(!handle || handle.disabled) return;
    const row=handle.closest('.sort-row'); drag={handle,list:row.parentElement,from:Number(row.dataset.index),to:Number(row.dataset.index)};
    handle.setPointerCapture(event.pointerId); row.classList.add('dragging'); event.preventDefault();
  });
  document.addEventListener('pointermove', event => {
    if(!drag) return;
    const rows=Array.from(drag.list.querySelectorAll('.sort-row'));
    const found=rows.find(row=>{const box=row.getBoundingClientRect();return event.clientY>=box.top && event.clientY<=box.bottom;});
    if(found) { drag.to=Number(found.dataset.index); rows.forEach(row=>row.classList.toggle('drop-target',row===found)); }
    if(event.clientY>innerHeight-110) window.scrollBy(0,12); else if(event.clientY<80) window.scrollBy(0,-12);
  });
  function endDrag(commit) { if(!drag) return; const current=drag; drag=null; current.list.querySelectorAll('.sort-row').forEach(row=>row.classList.remove('dragging','drop-target')); if(commit && current.from!==current.to) result(()=>management.reorder(current.list.dataset.sort==='plans'?null:editingPlan,current.from,current.to)); }
  document.addEventListener('pointerup',()=>endDrag(true)); document.addEventListener('pointercancel',()=>endDrag(false));
  render();
  resumeActive();
  window.addEventListener('pageshow', resumeActive);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') resumeActive(); });
})();
