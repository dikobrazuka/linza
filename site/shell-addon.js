/* D-028/T5: add tasks to existing plans without replacing local statuses. */
(() => {
  const a = (id, text, status='todo') => ({id,text,status,scope:'core'});
  const additions = [
    ['S4', {title:'T5 — оболочка PLA-Aero Pro',subs:[
      {title:'Печать и геометрия',actions:[
        a('t5_01','Зафиксировать PLA-Aero Pro, цвет, партию, принтер и профиль 245–250 °C / flow 0,30'),
        a('t5_02','Напечатать три вертикальных образца в две стенки тем же профилем'),
        a('t5_03','Измерить фактические толщины, массу и размеры, рассчитать плотность и разброс'),
        a('t5_04','Изготовить пробные полусферы и проверить овальность, прочность, шов и зазор'),
        a('t5_05','Проверить габарит Ø80 мм вместе с корпусом, клеем и отражателем','blocked')
      ]},
      {title:'Радиосвойства',actions:[
        a('t5_06','Согласовать RF-оснастку, калибровку, чувствительность и размеры образцов'),
        a('t5_07','Напечатать RF-купоны по реальной оснастке','blocked'),
        a('t5_08','Измерить complex S-параметры около 5 ГГц, минимум три переустановки','blocked'),
        a('t5_09','Если метод позволяет — извлечь ε и tanδ с неопределённостью; иначе сохранить S21 и ограничение','blocked'),
        a('t5_10','Уточнить возможность независимого измерения оболочки около 24 ГГц')
      ]}
    ]}],
    ['S10', {title:'T5 — влияние оболочки на сборку',subs:[{title:'Сравнение на стенде',actions:[
      a('t5_11','Снять lens+reflector без корпуса и с временным PLA-Aero Pro корпусом в одной геометрии','blocked'),
      a('t5_12','Снять сборку с окончательным соединением, проверить эффект шва/клея','blocked'),
      a('t5_13','Выполнить три независимые переустановки и сохранить комплексные .s2p','blocked'),
      a('t5_14','Посчитать эффект корпуса и отдельно Kσ относительно reflector-only','blocked')
    ]}]}],
    ['S12', {title:'T5 — расчёт корпуса на 24 ГГц',subs:[{title:'Численная проверка',actions:[
      a('t5_15','Сравнить Ø80 с корпусом и без него при одинаковом отражателе','blocked'),
      a('t5_16','Исследовать диапазон ε и потерь; ε=1,4 обозначить гипотезой','blocked'),
      a('t5_17','Проверить сходимость сетки на оболочке и отражателе и влияние шва','blocked'),
      a('t5_18','Отделить измерения 5 ГГц от прогноза 24 ГГц','blocked')
    ]}]}]
  ];
  function addMissing(target) {
    let changed = false;
    for (const [id, task] of additions) {
      const stage = target.find(item => item.id === id);
      if (!stage) continue;
      const firstId = task.subs[0].actions[0].id;
      const exists = stage.tasks.some(item => item.subs.some(sub => sub.actions.some(action => action.id === firstId)));
      if (!exists) { stage.tasks.push(structuredClone(task)); changed = true; }
    }
    return changed;
  }
  addMissing(defaultPlan);
  const migrationKey = 'linza-t5-shell-migration-v1';
  if (!localStorage.getItem(migrationKey)) {
    if (addMissing(plan)) { savePlan(); renderPlan(); }
    localStorage.setItem(migrationKey, 'done');
  }
  const row={category:'Материал',item:'PLA-Aero Pro — корпус',qty:1,unit:'компл.',price:0,note:'Расход и фактическую стоимость уточнить после T5; 0 ₽ = не введено'};
  if (!defaultBudget.some(item=>item.item===row.item)) defaultBudget.push(structuredClone(row));
  const budgetKey='linza-t5-shell-budget-v1';
  if (!localStorage.getItem(budgetKey)) {
    if (!budget.some(item=>item.item===row.item)) { budget.push(structuredClone(row)); renderBudget(); }
    localStorage.setItem(budgetKey, 'done');
  }
})();
