/* 09.11.2026: add the new work streams without replacing a user's plan. */
(() => {
  const item = (id, text) => ({id, text, status:'todo', scope:'core'});
  const additions = [
    ['S1','Поставка и новая закупка','Проверить до заказа',[
      item('team_101','Сверить наличие и сроки PLA, DE-10, принтеров, рупоров и приборов'),
      item('team_102','Сверить общую смету 09.11: позиции на рассмотрении, не считать их купленными'),
      item('team_103','Проверить посадку SMA-7814-16 по реальному STEP рупора')]],
    ['S6','PLA/FDM Ø200 — отдельная модель','До полной печати',[
      item('team_201','Выбрать PLA, сделать CAD двух полусфер Ø200 и проверить build volume'),
      item('team_202','Подготовить и обмерить купоны PLA с фактическими стенками и infill'),
      item('team_203','Проверить массу по слайсеру и не переносить ε DE-10 на PLA'),
      item('team_204','Отдельно рассчитать Ø200 / 5 ГГц, затем проверить реализуемую модель')]],
    ['S9','Новый 5-ГГц тракт','Рупоры и калибровка',[
      item('team_301','Изготовить 2 одинаковых рупора; проверить геометрию SMA и проводимость соединений'),
      item('team_302','Перекалибровать NanoVNA около 5 ГГц; прежний диапазон 383–483 МГц не подходит'),
      item('team_303','Измерить S11 каждого рупора и S21 пары; проверить устойчивость эталона и фона'),
      item('team_304','Для PLA Ø200 проверить расстояния 2 / 2,5 / 3 м и прямую связь антенн')]],
    ['S10','Отдельные серии PLA200 и DE10','Сохранить результаты',[
      item('team_401','PLA200: сохранить фон, держатель, эталон, reflector-only и образец с/без reflector'),
      item('team_402','DE10: провести отдельную серию после T1–T4 и допусков'),
      item('team_403','Повторить ключевые установки ≥3 раз, записать расстояния и complex .s2p')]],
    ['S12','CDM324 / Pico — отдельная демонстрация','Сначала наземная проверка',[
      item('team_501','Подтвердить питание и VCC/GND/IF реальной ревизии CDM324'),
      item('team_502','Собрать IF-AFE-R1 OPA2365/Pico по схеме; проверить питание, диапазон ADC и устойчивость'),
      item('team_503','Снять фон и ≥3 сырые записи движущейся металлической пластины'),
      item('team_504','Только после проверки нагрузки и траектории рассмотреть DJI/FPV; IF не считать измерением ЭПР'),
      item('team_505','Для доказательства ЭПР Ø80 на 24 ГГц согласовать отдельный калиброванный RF-стенд')]]
  ];
  function addMissing(target) {
    let changed = false;
    for (const [id,title,sub,actions] of additions) {
      const stage = target.find(s => s.id === id);
      if (!stage) continue;
      const first = actions[0].id;
      if (!stage.tasks.some(t => t.subs.some(s => s.actions.some(a => a.id === first)))) {
        stage.tasks.push({title,subs:[{title:sub,actions:structuredClone(actions)}]});
        changed = true;
      }
    }
    return changed;
  }
  addMissing(defaultPlan);
  const key = 'linza-team-2026-11-09-v1';
  if (!localStorage.getItem(key)) {
    if (addMissing(plan)) { savePlan(); renderPlan(); }
    localStorage.setItem(key,'done');
  }
})();
