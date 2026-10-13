(() => {
  'use strict';
  const D = KairosTrainingData;
  const $ = id => document.getElementById(id);
  const esc = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const store = D.createStore({ onStatus(status) { $('storage-status').textContent = status.message; $('storage-status').hidden = !status.message; $('retry-save').hidden = !status.dirty || status.blocked; if (status.message && $('view-plan-editor')?.hidden && $('view-exercise-editor')?.hidden) $('storage-status').scrollIntoView({ block: 'start' }); } });
  store.load();
  if (store.getStatus().isNew && !store.getStatus().blocked) store.initializeLibrary(KairosTrainingLibrary.create(D));
  const management = KairosTrainingManagement.create(store, D);
  const sessionFlow = KairosTrainingSession.create(store, D);
  const views = Array.from(document.querySelectorAll('.view'));
  const tabs = Array.from(document.querySelectorAll('[data-tab]'));
  let trainingView = 'start', editingPlan = null, addingToPlan = null, planDraft = null, leavingPlan = false;
  let currentView = 'start', away = false, entered = false;
  let summaryId = null, finishing = false, durationInterval = null, importing = false;
  // Touch navigation must not trigger iOS viewport adjustment through heading focus.
  // Keyboard and assistive activation keep the existing focus guidance.
  let focusHeadingForInteraction = true;
  document.addEventListener('pointerdown', event => { focusHeadingForInteraction = event.pointerType !== 'touch'; }, true);
  document.addEventListener('keydown', () => { focusHeadingForInteraction = true; }, true);
  document.addEventListener('click', event => { if (event.detail === 0) focusHeadingForInteraction = true; }, true);
  function showView(name, options = {}) {
    if (name === 'plan-editor' && currentView === name) return;
    if (currentView === 'plan-editor' && name !== 'plan-editor' && planDraft) {
      if (hasPlanChanges()) { leavePlan(name, options); return; }
      planDraft = null; editingPlan = null;
    }
    displayView(name, options);
  }
  async function leavePlan(name, options = {}) {
    if (leavingPlan) return;
    leavingPlan = true;
    const dialog = $('plan-leave-dialog'); dialog.returnValue = 'cancel'; dialog.showModal();
    const choice = await new Promise(resolve => dialog.addEventListener('close', () => resolve(dialog.returnValue), {once:true}));
    leavingPlan = false;
    if (choice === 'cancel' || !['save', 'discard'].includes(choice)) return;
    if (choice === 'save' && !savePlanDraft()) return;
    planDraft = null; editingPlan = null; render(); displayView(name, options);
  }
  function displayView(name, { focusHeading = focusHeadingForInteraction } = {}) {
    const target = $('view-' + name);
    if (!target || !views.includes(target)) return;
    views.forEach(view => { view.hidden = view !== target; });
    currentView = name;
    if (store.getStatus().loaded && !store.getStatus().blocked && store.getState().settings.lastView !== savedView(name)) store.update(state => { state.settings.lastView = savedView(name); });
    if (target.dataset.area === 'training') trainingView = name;
    tabs.forEach(tab => { const active = tab.dataset.tab === target.dataset.area; tab.classList.toggle('active', active); if (active) tab.setAttribute('aria-current','page'); else tab.removeAttribute('aria-current'); });
    $('scrollArea').scrollTop = 0;
    if (focusHeading) target.querySelector('h1').focus({preventScroll:true});
    window.dispatchEvent(new CustomEvent('kairos-training-viewchange', {detail: {view: name}}));
  }
  const savedView = name => name === 'plan-editor' ? 'plans' : name === 'exercise-editor' ? 'exercises' : name;
  const numericWeightLabel = exercise => exercise.weightKg === null ? 'Gewicht offen' : exercise.weightKg.toLocaleString('de-DE') + ' kg';
  const planDetails = plan => (plan.description.trim() ? esc(plan.description) + ' · ' : '') + plan.exerciseIds.length + (plan.exerciseIds.length === 1 ? ' Übung' : ' Übungen');
  const weightLabel = exercise => exercise.isMax ? 'MAX' : exercise.weightKg === null ? 'Gewicht offen' : exercise.weightKg.toLocaleString('de-DE') + ' kg';
  function rowControls(index, length) {
    return `<button type="button" class="drag-handle" aria-label="Durch Ziehen verschieben">☰</button><button type="button" data-move="-1" aria-label="Nach oben" ${index===0?'disabled':''}>↑</button><button type="button" data-move="1" aria-label="Nach unten" ${index===length-1?'disabled':''}>↓</button>`;
  }
  function render() {
    const state = store.getState();
    const plans = state.planOrder.map(id => state.plans.find(plan => plan.id === id));
    document.querySelectorAll('[data-plan-list]').forEach(list => { list.innerHTML = plans.length ? plans.map(plan => `<div class="card plan-summary"><strong>${esc(plan.name)}</strong><p class="muted">${planDetails(plan)}</p><button class="btn-secondary" data-start-plan="${esc(plan.id)}" ${!plan.exerciseIds.length || state.activeSession || store.getStatus().blocked ? 'disabled' : ''}>Training starten${plan.exerciseIds.length ? '' : ' – keine Übungen'}</button></div>`).join('') : '<p class="empty">Noch keine Trainingspläne vorhanden.</p>'; });
    $('plan-list').innerHTML = plans.map((plan,index) => `<div class="card sort-row" data-id="${esc(plan.id)}" data-index="${index}"><strong>${esc(plan.name)}</strong><p class="muted">${planDetails(plan)}</p><div class="row-actions">${rowControls(index,plans.length)}<button data-edit-plan="${esc(plan.id)}">Bearbeiten</button><button data-delete-plan="${esc(plan.id)}">Löschen</button></div></div>`).join('') || '<p class="empty">Noch keine Trainingspläne vorhanden.</p>';
    renderExerciseList();
    $('active-overview').textContent = state.activeSession ? 'Training „' + state.activeSession.planName + '“ läuft. Du kannst es in der Trainingsansicht fortsetzen.' : 'Noch kein Training gestartet.';
    // The draft editor owns its DOM; background renders never rebuild its fields.
    renderActive();
    renderSavedSessions();
    $('export-training').disabled = !store.getStatus().loaded;
    $('import-training').disabled = importing || !!state.activeSession || store.getStatus().blocked || !store.getStatus().loaded;
    $('import-unavailable').hidden = !state.activeSession;
    const blocked = store.getStatus().blocked || !store.getStatus().loaded;
    document.querySelectorAll('#new-plan, #new-exercise, [data-edit-plan], [data-delete-plan], [data-edit-exercise], .drag-handle, [data-move]').forEach(button => { if(blocked) button.disabled = true; });
  }
  function renderExerciseList() {
    const query = $('exercise-search').value.trim().toLocaleLowerCase('de');
    const exercises = store.getState().exercises.filter(item => item.name.toLocaleLowerCase('de').includes(query)).sort((a,b) => a.name.localeCompare(b.name, 'de', {sensitivity:'base'}) || a.id.localeCompare(b.id));
    $('exercise-list').innerHTML = exercises.map(exercise => `<div class="card library-exercise"><div><strong>${esc(exercise.name)}</strong><p class="muted">${esc(numericWeightLabel(exercise))}</p></div><button class="btn-secondary" data-edit-exercise="${esc(exercise.id)}">Bearbeiten</button></div>`).join('') || '<p class="empty">' + (query ? 'Keine passenden Übungen.' : 'Keine Übungen vorhanden.') + '</p>';
    if (store.getStatus().blocked) $('exercise-list').querySelectorAll('button').forEach(button => {button.disabled=true;});
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
  function backupMessage(text, error = false) {
    const status = $('backup-status');
    status.textContent = text; status.hidden = false;
    status.classList.toggle('storage-error', error);
    status.setAttribute('role', error ? 'alert' : 'status');
  }
  function exportTraining() {
    let url;
    try {
      const json = store.exportJSON();
      url = URL.createObjectURL(new Blob([json], {type: 'application/json'}));
      const link = document.createElement('a');
      link.href = url; link.download = 'kairos-training-' + new Date().toISOString().slice(0,10) + '.json';
      document.body.append(link); link.click(); link.remove();
      backupMessage('JSON-Datei zum Speichern bereitgestellt. Bitte in Downloads bzw. Dateien sichern.' + (store.getStatus().dirty ? ' Das Backup enthält auch noch nicht lokal gespeicherte Änderungen.' : ''));
    } catch (error) { backupMessage('Export nicht möglich: ' + error.message, true); }
    finally { if (url) window.setTimeout(() => URL.revokeObjectURL(url), 60000); }
  }
  async function importTraining(file) {
    if (!file || importing) return;
    if (store.getState().activeSession || store.getStatus().blocked || !store.getStatus().loaded) {
      backupMessage(store.getState().activeSession ? 'Während eines laufenden Trainings ist der Import gesperrt. Export bleibt möglich.' : 'Import ist gesperrt, damit geschützte Training-Daten erhalten bleiben.', true); return;
    }
    importing = true;
    const expectedState = JSON.stringify(store.getState());
    render();
    try {
      const text = await file.text();
      D.parseBackup(text);
      if (store.getState().activeSession) throw new Error('Während eines laufenden Trainings ist der Import gesperrt.');
      const confirmed = await confirmAction('Alle vorhandenen Training-Daten einschließlich ungespeicherter Änderungen durch diese Datei ersetzen? Diese Aktion kann nicht rückgängig gemacht werden.', 'Backup importieren', 'Daten ersetzen');
      if (!confirmed) { backupMessage('Import abgebrochen. Vorhandene Daten bleiben unverändert.'); return; }
      const outcome = store.importJSON(text, {confirmed: true, expectedState});
      if (!outcome.ok) { backupMessage(outcome.message, true); return; }
      editingPlan = null; addingToPlan = null; summaryId = null; trainingView = 'start';
      ['plan-editor', 'exercise-editor', 'training-weight-editor'].forEach(id => { $(id).hidden = true; });
      render();
      backupMessage('Training-Daten erfolgreich importiert und lokal gespeichert.');
      if (store.getState().activeSession) resumeActive();
    } catch (error) { backupMessage('Import nicht übernommen: ' + error.message, true); }
    finally { importing = false; $('import-training').value = ''; render(); }
  }
  $('import-training').addEventListener('change', event => importTraining(event.target.files[0]));
  function trainingWeightEditor() {
    const exercise = store.getState().activeSession.exercises[store.getState().activeSession.currentIndex];
    $('training-weight-editor').hidden = false;
    $('training-weight-editor').innerHTML = `<form id="training-weight-form" class="card" data-context="${esc(JSON.stringify(sessionFlow.weightContext()))}"><h2>Gewicht bearbeiten</h2><label>Gewicht (kg)<input name="weight" type="text" inputmode="decimal" value="${exercise.weightKg === null ? '' : exercise.weightKg}" ${exercise.isMax ? 'disabled' : ''}></label><label class="check"><input type="checkbox" name="max" ${exercise.isMax ? 'checked' : ''}> MAX-Modus</label><label>Wiederholungen<input type="number" name="repetitions" min="1" step="1" required value="${exercise.repetitions}"></label><button type="submit" class="btn-primary">Gewicht speichern</button><button type="button" class="btn-secondary" id="cancel-training-weight">Abbrechen</button></form>`;
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
  function exerciseEditor(id = null) {
    const exercise = id ? store.getState().exercises.find(item => item.id===id) : {name:'',weightKg:null,repetitions:10,isMax:false,source:'custom'};
    $('exercise-editor').hidden = false;
    $('title-exercise-editor').textContent = id ? 'Übung bearbeiten' : 'Eigene Übung erstellen';
    $('exercise-editor').innerHTML = `<form class="card" id="exercise-form" data-id="${esc(id || '')}" data-original="${esc(JSON.stringify(exercise))}"><label>Name<input name="name" required value="${esc(exercise.name)}"></label><label>Gewicht (kg)<input name="weight" inputmode="decimal" type="text" value="${exercise.weightKg===null?'':exercise.weightKg}"></label><p class="muted">Gewichte gelten in allen Trainingsplänen. Gewicht darf leer bleiben.</p><p id="exercise-error" class="storage-error" role="alert" hidden></p><button class="btn-primary" type="submit">Übung speichern</button><button class="btn-secondary" type="button" id="cancel-exercise">Abbrechen</button>${id && exercise.source==='custom'?`<button class="btn-danger" type="button" data-delete-exercise="${esc(id)}">Übung dauerhaft löschen</button>`:''}</form>`;
    showView('exercise-editor', {focusHeading:false});
  }
  function pendingNewExercise() {
    const form = $('plan-new-exercise-form');
    return !!(form && (form.elements.name.value || form.elements.weight.value));
  }
  function hasPlanChanges() { return management.draftChanged(planDraft) || pendingNewExercise(); }
  function addNewDraftExercise() {
    const form = $('plan-new-exercise-form');
    if (!form.reportValidity()) return false;
    try {
      const exercise = D.createExercise({name:form.elements.name.value.trim(), weightKg:form.elements.weight.value, isMax:false, repetitions:10});
      const key = name => name.trim().replace(/\s+/gu, ' ').toLocaleLowerCase('de');
      if (planDraft.exercises.some(item => key(item.name) === key(exercise.name))) throw new Error('Doppelte Übungsnamen.');
      planDraft.exercises.push(exercise); planDraft.plan.exerciseIds.push(exercise.id);
      form.reset(); renderPlanExercises(); planMessage('');
      return true;
    } catch (error) { planMessage(error.message); return false; }
  }
  function planMessage(message) { $('plan-error').textContent = message; $('plan-error').hidden = !message; }
  function savePlanDraft() {
    if (!$('plan-form').reportValidity()) return false;
    for (const field of $('plan-exercises').querySelectorAll('input')) if (!field.reportValidity()) return false;
    if (pendingNewExercise() && !addNewDraftExercise()) return false;
    const outcome = management.saveDraft(planDraft);
    if (!outcome.ok) { planMessage(outcome.message || store.getStatus().message); return false; }
    return true;
  }
  function planEditor(id = null) {
    planDraft = management.beginDraft(id); editingPlan = planDraft.plan.id;
    const plan = planDraft.plan;
    $('plan-editor').hidden = false;
    $('title-plan-editor').textContent = id ? 'Trainingsplan bearbeiten' : 'Trainingsplan erstellen';
    $('plan-editor').innerHTML = `<form class="card compact-plan-form" id="plan-form"><label>Name<input name="name" required value="${esc(plan.name)}"></label><label>Beschreibung<textarea name="description" rows="2">${esc(plan.description)}</textarea></label><p class="muted">Änderungen beim Verlassen speichern. Gewichte gelten in allen Plänen.</p></form>
      <p class="card storage-error" id="plan-error" role="alert" hidden></p>
      <div class="plan-exercise-heading"><h2>Übungen im Plan</h2><p id="plan-order-status" class="muted" role="status" aria-live="polite"></p></div><div id="plan-exercises" class="sortable" data-sort="draft"></div>
      <details class="card exercise-add-panel" open><summary>Übungen hinzufügen</summary><form id="add-exercise-form"><label>Vorhandene Übung<select name="exercise" id="exercise-choice"></select></label><button class="btn-secondary" type="submit">Übung hinzufügen</button></form><form id="plan-new-exercise-form"><h2>Eigene Übung</h2><label>Name<input name="name"></label><label>Gewicht (kg)<input name="weight" type="text" inputmode="decimal"></label><button class="btn-secondary" type="submit">Übung hinzufügen</button></form></details>`;
    renderPlanExercises(); displayView('plan-editor', {focusHeading: false});
  }
  function updatePlanChoices() {
    const available = planDraft.exercises.filter(item => !planDraft.plan.exerciseIds.includes(item.id)).sort((a,b)=>a.name.localeCompare(b.name,'de',{sensitivity:'base'}));
    $('exercise-choice').innerHTML = available.map(item => `<option value="${esc(item.id)}">${esc(item.name)}</option>`).join('');
    $('add-exercise-form').querySelector('button').disabled = !available.length;
  }
  function renderPlanExercises() {
    const list = $('plan-exercises'), order = planDraft.plan.exerciseIds;
    // Reuse rows (including focused inputs) when adding, removing or sorting.
    for (const row of Array.from(list.children)) if (!order.includes(row.dataset.id)) row.remove();
    order.forEach((id,index) => {
      const exercise = planDraft.exercises.find(item => item.id === id);
      let row = Array.from(list.children).find(item => item.dataset.id === id);
      if (!row) {
        row = document.createElement('div'); row.className = 'card sort-row plan-exercise'; row.dataset.id = id;
        row.innerHTML = `<div class="plan-exercise-title"><span class="exercise-position" aria-label="Position"></span><label class="exercise-name-field">Übungsname<input data-draft-field="name" type="text" value="${esc(exercise.name)}" required></label></div><label class="compact-weight">Gewicht (kg)<input data-draft-field="weightKg" type="text" inputmode="decimal" value="${exercise.weightKg === null ? '' : esc(exercise.weightKg)}"></label><div class="row-actions">${rowControls(index,order.length)}<button type="button" data-remove-exercise="${esc(id)}">Entfernen</button></div>`;
      }
      row.dataset.index = index;
      row.querySelector('.exercise-position').textContent = index + 1;
      row.setAttribute('aria-label', 'Position ' + (index + 1) + ': ' + exercise.name);
      row.querySelector('[data-move="-1"]').disabled = index === 0;
      row.querySelector('[data-move="1"]').disabled = index === order.length - 1;
      if (list.children[index] !== row) list.insertBefore(row, list.children[index] || null);
    });
    updatePlanChoices();
  }
  function reorderDraft(from, to) {
    const order = planDraft.plan.exerciseIds;
    if (to < 0 || to >= order.length) return;
    const moved = order[from];
    order.splice(to, 0, order.splice(from, 1)[0]); renderPlanExercises();
    $('plan-order-status').textContent = planDraft.exercises.find(item=>item.id===moved).name + ' auf Position ' + (to + 1);
  }
  document.addEventListener('input', event => {
    if (event.target.id === 'exercise-search') { renderExerciseList(); return; }
    if (!planDraft) return;
    const field = event.target;
    if (field.form?.id === 'plan-form') planDraft.plan[field.name] = field.value;
    else if (field.dataset.draftField) {
      const exercise = planDraft.exercises.find(item => item.id === field.closest('.sort-row').dataset.id);
      exercise[field.dataset.draftField] = field.value;
    }
  });
  document.addEventListener('change', event => { if(event.target.name==='max' && ['training-weight-form'].includes(event.target.form?.id)) event.target.form.elements.weight.disabled=event.target.checked; });
  document.addEventListener('submit', event => {
    if(!['exercise-form','plan-form','add-exercise-form','training-weight-form','plan-new-exercise-form'].includes(event.target.id)) return;
    event.preventDefault(); const form=event.target;
    if(form.id==='training-weight-form') {
      if(result(()=>sessionFlow.changeWeight({weightKg:form.elements.weight.value,isMax:form.elements.max.checked,repetitions:Number(form.elements.repetitions.value)},JSON.parse(form.dataset.context)))) $('training-weight-editor').hidden=true;
    } else if(form.id==='exercise-form') {
      const original = JSON.parse(form.dataset.original);
      store.refresh();
      const current = form.dataset.id ? store.getState().exercises.find(item=>item.id===form.dataset.id) : null;
      const error = $('exercise-error');
      if (form.dataset.id && JSON.stringify(current) !== JSON.stringify(original)) { error.textContent = 'Diese Übung wurde inzwischen geändert oder gelöscht. Bitte erneut öffnen.'; error.hidden = false; return; }
      const previousIds = new Set(store.getState().exercises.map(item=>item.id));
      const success=result(()=>management.saveExercise(form.dataset.id || null,{name:form.elements.name.value === original.name ? original.name : form.elements.name.value.trim(),weightKg:form.elements.weight.value,repetitions:original.repetitions,isMax:original.isMax}));
      if(success) { $('exercise-editor').hidden=true; showView('exercises'); }
      else {
        if (store.getStatus().dirty && !store.getStatus().blocked) {
          const pending = store.getState().exercises.find(item => form.dataset.id ? item.id === form.dataset.id : !previousIds.has(item.id));
          if (pending) { form.dataset.id = pending.id; form.dataset.original = JSON.stringify(pending); }
        }
        error.textContent=store.getStatus().message;error.hidden=false;
      }
    } else if(form.id==='plan-form') {
      showView('plans');
    } else if(form.id === 'plan-new-exercise-form') {
      addNewDraftExercise();
    } else if (planDraft) {
      const id = form.elements.exercise.value;
      if (id && !planDraft.plan.exerciseIds.includes(id)) { planDraft.plan.exerciseIds.push(id); renderPlanExercises(); }
    }

  });
  document.addEventListener('click', async event => {
    const button=event.target.closest('button'); if(!button || button.disabled) return;
    if(button.id==='export-training') exportTraining();
    else if(button.id==='finish-training') finishTraining();
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
    else if(button.id==='cancel-exercise') { $('exercise-editor').hidden=true; showView('exercises'); }
    else if(button.id==='new-plan') planEditor();
    else if(button.dataset.editPlan) planEditor(button.dataset.editPlan);
    else if(button.id==='back-plan') showView('plans');
    else if(button.dataset.removeExercise && planDraft) { planDraft.plan.exerciseIds = planDraft.plan.exerciseIds.filter(id => id !== button.dataset.removeExercise); renderPlanExercises(); }
    else if(button.dataset.deleteExercise && await confirmDelete('Diese eigene Übung dauerhaft löschen und aus allen Trainingsplänen entfernen? Gespeicherte und laufende Einheiten bleiben unverändert.')) { if(result(()=>management.deleteExercise(button.dataset.deleteExercise))) { $('exercise-editor').hidden=true; showView('exercises'); } }
    else if(button.dataset.deletePlan && await confirmDelete('Diesen Trainingsplan löschen? Übungen sowie gespeicherte und laufende Einheiten bleiben erhalten.')) { if(result(()=>management.deletePlan(button.dataset.deletePlan))) { editingPlan=null; $('plan-editor').hidden=true; } }
    else if(button.dataset.move) {
      const row = button.closest('.sort-row'), list = row.parentElement, from = Number(row.dataset.index), direction = button.dataset.move;
      if (list.dataset.sort === 'draft') { const id = row.dataset.id; reorderDraft(from, from + Number(direction)); const moved = Array.from(list.children).find(item => item.dataset.id === id); (moved.querySelector(`[data-move="${direction}"]:not(:disabled)`) || moved.querySelector('[data-move]:not(:disabled)') || moved.querySelector('.drag-handle')).focus({preventScroll:true}); return; }
      const identity = list.dataset.sort === 'plans' ? row.dataset.id : store.getState().plans.find(plan => plan.id === editingPlan).exerciseIds[from];
      result(() => management.reorder(list.dataset.sort === 'plans' ? null : editingPlan, from, from + Number(direction)));
      const order = list.dataset.sort === 'plans' ? store.getState().planOrder : store.getState().plans.find(plan => plan.id === editingPlan).exerciseIds;
      const index = order.indexOf(identity), refreshed = document.querySelector(list.dataset.sort === 'plans' ? '#plan-list' : '#plan-exercises');
      const nextRow = refreshed?.querySelector(`[data-index="${index}"]`);
      const preferred = nextRow?.querySelector(`[data-move="${direction}"]`);
      (preferred && !preferred.disabled ? preferred : nextRow?.querySelector('[data-move]:not(:disabled)') || nextRow?.querySelector('.drag-handle'))?.focus();
    }
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
  function endDrag(commit) { if(!drag) return; const current=drag; drag=null; current.list.querySelectorAll('.sort-row').forEach(row=>row.classList.remove('dragging','drop-target')); if(commit && current.from!==current.to) { if (current.list.dataset.sort === 'draft') reorderDraft(current.from, current.to); else result(()=>management.reorder(current.list.dataset.sort==='plans'?null:editingPlan,current.from,current.to)); } }
  document.addEventListener('pointerup',()=>endDrag(true)); document.addEventListener('pointercancel',()=>endDrag(false));
  function leaveApp() {
    if (away || !entered) return;
    away = true;
    store.refresh();
    if (store.getStatus().loaded && !store.getStatus().blocked) store.update(state => {
      state.settings.lastView = savedView(currentView);
      state.settings.lastBackgroundAt = Date.now();
    });
  }
  function enterApp() {
    if (document.visibilityState === 'hidden' || (entered && !away)) return;
    store.refresh();
    const state = store.getState(), now = Date.now();
    const entry = KairosTrainingNavigation.entryView(state, now, {newDocument: !entered});
    const view = planDraft && currentView === 'plan-editor' && entry === 'plans' ? 'plan-editor' : currentView === 'exercise-editor' && entry === 'exercises' ? 'exercise-editor' : entry;
    if (view === 'summary') {
      const last = state.completedSessions.reduce((latest, session) => !latest || session.endedAt >= latest.endedAt ? session : latest, null);
      summaryId = last?.id || null;
    }
    entered = true; away = false;
    if (store.getStatus().loaded && !store.getStatus().blocked) store.update(candidate => {
      candidate.settings.lastOpenedDay = KairosTrainingNavigation.day(now);
      candidate.settings.lastBackgroundAt = null;
      // Save the actual view while a leave decision is pending. displayView records its accepted destination.
      candidate.settings.lastView = planDraft && currentView === 'plan-editor' ? 'plans' : savedView(view);
    });
    render(); showView(view, {focusHeading: false});
  }
  render();
  enterApp();
  window.addEventListener('pagehide', leaveApp);
  window.addEventListener('pageshow', enterApp);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') leaveApp(); else enterApp(); });
  window.addEventListener('storage', event => {
    if (event.key === D.STORAGE_KEY || event.key === null) {
      if (store.getStatus().dirty) store.save();
      else store.refresh();
      render();
      if (document.visibilityState === 'visible') resumeActive();
    }
  });
  if ('serviceWorker' in navigator && window.isSecureContext) {
    const offlineFailure = () => {
      $('offline-status').textContent = 'Offline-Start konnte nicht eingerichtet werden. Bitte die App bei Internetverbindung erneut öffnen. Training-Daten bleiben erhalten.';
      $('offline-status').hidden = false;
    };
    navigator.serviceWorker.register('sw.js', {scope: './', updateViaCache: 'none'}).then(registration => {
      const monitor = worker => {
        if (!worker) return;
        worker.addEventListener('statechange', () => { if (worker.state === 'redundant' && !registration.active) offlineFailure(); });
        if (worker.state === 'redundant' && !registration.active) offlineFailure();
      };
      monitor(registration.installing);
      registration.addEventListener('updatefound', () => monitor(registration.installing));
    }).catch(offlineFailure);
  } else {
    $('offline-status').textContent = 'Offline-Start benötigt einen unterstützten Browser und eine HTTPS-Verbindung.';
    $('offline-status').hidden = false;
  }
})();
