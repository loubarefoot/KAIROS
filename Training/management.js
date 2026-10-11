(function (root) {
  'use strict';
  function create(store, data) {
    const find = (items, id) => { const item = items.find(item => item.id === id); if (!item) throw new Error('Eintrag nicht gefunden.'); return item; };
    return Object.freeze({
      saveExercise(id, fields, planId = null) {
        return store.update(state => {
          if (id) Object.assign(find(state.exercises, id), { name: fields.name, weightKg: data.parseWeight(fields.weightKg), repetitions: fields.repetitions, isMax: fields.isMax });
          else {
            const exercise = data.createExercise(fields); state.exercises.push(exercise);
            if (planId) find(state.plans, planId).exerciseIds.push(exercise.id);
          }
        });
      },
      deleteExercise(id) {
        return store.update(state => {
          const exercise = find(state.exercises, id);
          if (exercise.source !== 'custom') throw new Error('Vorgefertigte Übungen können nicht gelöscht werden.');
          state.exercises = state.exercises.filter(item => item.id !== id);
          state.plans.forEach(plan => { plan.exerciseIds = plan.exerciseIds.filter(value => value !== id); });
        });
      },
      savePlan(id, fields) {
        return store.update(state => {
          if (id) Object.assign(find(state.plans, id), { name: fields.name, description: fields.description });
          else { const plan = data.createPlan(fields); state.plans.push(plan); state.planOrder.push(plan.id); }
        });
      },
      deletePlan(id) {
        return store.update(state => { find(state.plans, id); state.plans = state.plans.filter(item => item.id !== id); state.planOrder = state.planOrder.filter(value => value !== id); });
      },
      addExercise(planId, exerciseId) {
        return store.update(state => { find(state.exercises, exerciseId); const plan = find(state.plans, planId); if (plan.exerciseIds.includes(exerciseId)) throw new Error('Diese Übung ist bereits im Plan.'); plan.exerciseIds.push(exerciseId); });
      },
      removeExercise(planId, exerciseId) {
        return store.update(state => { const plan = find(state.plans, planId); plan.exerciseIds = plan.exerciseIds.filter(id => id !== exerciseId); });
      },
      reorder(planId, from, to) {
        return store.update(state => {
          const order = planId ? find(state.plans, planId).exerciseIds : state.planOrder;
          if (![from, to].every(index => Number.isInteger(index) && index >= 0 && index < order.length)) throw new Error('Ungültige Reihenfolge.');
          order.splice(to, 0, order.splice(from, 1)[0]);
        });
      }
    });
  }
  const api = Object.freeze({ create });
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.KairosTrainingManagement = api;
})(globalThis);
