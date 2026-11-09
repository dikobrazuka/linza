/* Upgrade the local WBS by stable action IDs without replacing user progress. */
(() => {
  'use strict';
  const action = (id,text) => ({id,text,status:'todo',scope:'core'});
  const groups = {
    P200: [
      {title:'Печать и контроль PLA Ø200',subs:[{title:'После выбора PLA и CAD',actions:[
        action('p200_01','Проверить размеры полусферы, build volume и расход в слайсере'),
        action('p200_02','Зафиксировать материал, партию, направление и параметры печати'),
        action('p200_03','Измерить купоны и согласовать размеры RF-образцов с оснасткой'),
        action('p200_04','Напечатать и обмерить две полусферы после технологических проверок'),
        action('p200_05','Зафиксировать массу, геометрию, стык, клей, отражатель и фото')]}]},
      {title:'Модель и испытания PLA Ø200 / 5 ГГц',subs:[{title:'Отдельная ветка',actions:[
        action('p200_06','Рассчитать идеальную Ø200, затем модель с доступными свойствами PLA'),
        action('p200_07','Для стенда проверить 2 / 2,5 / 3 м, фон и прямую связь рупоров'),
        action('p200_08','Снять P0–P5: фон, держатель, эталон, базу и линзу с/без отражателя'),
        action('p200_09','Повторить ключевые установки ≥3 раз, сохранить complex .s2p и геометрию'),
        action('p200_10','Обработать фон комплексно и сохранить результат с ограничениями стенда')]}]}
    ],
    CDM24: [
      {title:'CDM324 + OPA2365 + Pico',subs:[{title:'Сначала наземная проверка',actions:[
        action('cdm24_01','Сверить реальную распиновку VCC/GND/IF и питание конкретного CDM324'),
        action('cdm24_02','Подтвердить корпус OPA2365, адаптер и комплектующие IF-AFE-R1'),
        action('cdm24_03','Собрать по схеме и проверить соединения без питания'),
        action('cdm24_04','Измерить питание, VREF и выходы; проверить ADC и устойчивость'),
        action('cdm24_05','Подключить радар после проверки и записать фон и движущуюся металлическую пластину'),
        action('cdm24_06','Сохранить сырые данные и повторяемость; IF не считать измерением ЭПР')]}]},
      {title:'План DJI / FPV на 24 ГГц',subs:[{title:'Только после наземной проверки',actions:[
        action('cdm24_07','Уточнить модель дрона, допустимую нагрузку, массу образца и крепление'),
        action('cdm24_08','Согласовать безопасную траекторию и независимый контроль дальности'),
        action('cdm24_09','Записать сравнимые пролёты и ограничения: CDM324 не измеряет дальность')]}]}
    ],
    CUSTOMER24: [
      {title:'Целевая сборка Ø80 / 24 ГГц',subs:[{title:'Модель, изготовление и проверка',actions:[
        action('customer24_01','Рассчитать отдельную модель Ø80 с отражателем и оболочкой, исследовать ε и потери'),
        action('customer24_02','После CAD и технологических проверок оценить изготовление и массу всей сборки ≤300 г'),
        action('customer24_03','Согласовать калиброванный 24-ГГц стенд для прямой проверки ЭПР'),
        action('customer24_04','При отсутствии стенда явно оставить физическую проверку ЭПР на 24 ГГц невыполненной')]}]}
    ]
  };
  const titles = {
    S0:['Архитектура проекта и критерии','Общие решения и критерии'],
    S2:['Зафиксировать технологию печати DE-10','DE-10 Ø120 · технология печати'],
    S3:['T1 — свойства сплошного DE-10 около 5 ГГц','DE-10 Ø120 · T1: свойства материала'],
    S4:['T2/T3 — плотность, усадка и печатаемость gyroid','DE-10 Ø120 · T2/T3 и оболочка T5'],
    S5:['T4 — измеренная связь ρactual → εeff','DE-10 Ø120 · T4: связь плотности и ε'],
    S6:['Моделирование 5 ГГц','DE-10 Ø120 · моделирование 5 ГГц'],
    S7:['Финальная геометрия и подготовка производства','DE-10 Ø120 · геометрия и подготовка'],
    S8:['Изготовление физического шара','DE-10 Ø120 · изготовление образца'],
    S9:['Подготовка и валидация RF-стенда','Общий стенд 5 ГГц · рупоры и калибровка'],
    S10:['Физический эксперимент 5 ГГц','Серии на 5 ГГц · DE-10, PLA и статический FPV'],
    S12:['Расчётная версия 24 ГГц','Заказная Ø80 · расчёт 24 ГГц']
  };
  const texts = {
    a002:['Зафиксировать физический диаметр Ø120 мм и R=60 мм','Зафиксировать кандидата DE-10: Ø120 мм, R=60 мм, 5 ГГц'],
    a003:['Зафиксировать период gyroid a=7.5 мм','Зафиксировать исходный период гироида DE-10 a=7.5 мм'],
    a004:['Зафиксировать полный шар; две полусферы только для изготовления','Зафиксировать DE-10: полный шар; две полусферы для изготовления'],
    a901:['Зафиксировать TX/RX положение и поляризацию','Зафиксировать положение TX/RX и поляризацию для 5-ГГц стенда'],
    a904:['Начать с distance 1.0–1.5 м','Для DE-10 Ø120 начать проверку с дистанции 1.0–1.5 м'],
    a1206:['Проверить scaled minimum wall against printer capability','Проверить минимальную стенку модели Ø80 по возможностям принтера'],
    o011:['Физически изготовить 24-ГГц версию','Дополнительный вариант физической версии после основной сборки'],
    o012:['Провести отдельную 24-ГГц experimental campaign','Расширенная кампания 24 ГГц после основной RF-проверки'],
    o008:['Full diameter gate 120/150/180/240','Расширенный анализ результатов diameter gate'],
    a1210:['Отдельно пометить: физической 24-ГГц валидации нет','Согласовать прямую проверку на 24 ГГц; до неё считать результат расчётным']
  };
  function hasAction(task,id) { return task.subs?.some(sub => sub.actions?.some(a => a.id === id)); }
  function upgrade(target) {
    if (!Array.isArray(target)) return false;
    let changed = false;
    for (const stage of target) {
      const pair = titles[stage.id];
      if (pair && stage.title === pair[0]) { stage.title = pair[1]; changed = true; }
      for (const task of stage.tasks || []) {
        if (stage.id === 'S0' && task.title === 'Зафиксировать физический MVP') { task.title='Зафиксировать эксперимент DE-10 Ø120'; changed=true; }
        if (stage.id === 'S4' && task.title === 'T3 — 5 uniform gyroid coupons') { task.title='T3 — 9 образцов гироида по подробному протоколу'; changed=true; }
        if (stage.id === 'S6' && task.title === 'Fallback diameter gate') { task.title='Diameter gate DE-10 перед полной печатью'; changed=true; }
        for (const sub of task.subs || []) for (const a of sub.actions || []) {
          const item=texts[a.id];
          const changesMeaning=['a1206','a1210','o008','o011','o012'].includes(a.id);
          if (item && a.text === item[0] && !(changesMeaning && a.status === 'done')) { a.text=item[1]; changed=true; }
          const gateText={a616:'Прогнать Ø150 мм',a617:'Прогнать Ø180 мм',a618:'Прогнать Ø240 мм reference',a619:'Выбрать минимальный проходящий D'};
          if (stage.id === 'S6' && gateText[a.id] === a.text && a.scope === 'optional') { a.scope='core'; changed=true; }
        }
        if (stage.id === 'S4') for (const sub of task.subs || []) {
          if (sub.title === '3 solid blocks') { sub.title='5 solid blocks'; changed=true; }
          if (sub.actions?.some(a=>a.id==='a401') && !sub.actions.some(a=>a.id==='t2_complete_five')) { sub.actions.splice(sub.actions.findIndex(a=>a.id==='a401')+1,0,action('t2_complete_five','Довести серию T2 до пяти образцов по подробному протоколу')); changed=true; }
          if (sub.actions?.some(a=>a.id==='a407')) {
            const missing=[['t3_010','Сгенерировать ρ=0.10 coupon'],['t3_020','Сгенерировать ρ=0.20 coupon'],['t3_040','Сгенерировать ρ=0.40 coupon'],['t3_081','Сверить ρ=0.80 с протоколом T3: целевая точка 0.81'],['t3_090','Сгенерировать ρ=0.90 coupon']];
            for (const [id,text] of missing) if (!sub.actions.some(a=>a.id===id)) { sub.actions.push(action(id,text)); changed=true; }
          }
          if (sub.actions?.some(a=>a.id==='a413') && !sub.actions.some(a=>a.id==='t3_complete_nine')) { sub.actions.splice(sub.actions.findIndex(a=>a.id==='a413')+1,0,action('t3_complete_nine','Допечатать недостающие образцы для серии T3 по 9 плотностям')); changed=true; }
        }
        if (stage.id === 'S6') for (const sub of task.subs || []) {
          if (sub.title === 'Только если Ø120 не проходит') { sub.title='Сравнить 120 / 150 / 180 / 240 мм до полной печати'; changed=true; }
        }
      }
    }
    function ensureStage(id,title,after) {
      let stage=target.find(s=>s.id===id);
      if (!stage) {
        stage={id,title,scope:'core',tasks:[]};
        const pos=target.findIndex(s=>s.id===after);
        target.splice(pos<0?target.length:pos+1,0,stage); changed=true;
      }
      return stage;
    }
    const pla=ensureStage('P200','PLA / FDM Ø200 · отдельный опыт','S6');
    const cdm=ensureStage('CDM24','CDM324 / Pico · демонстрация 24 ГГц','S12');
    const customer=ensureStage('CUSTOMER24','Заказная Ø80 · сборка и RF-проверка','CDM24');
    function moveTask(sourceId, dest, firstAction) {
      const source=target.find(s=>s.id===sourceId);
      if (!source || dest.tasks.some(t=>hasAction(t,firstAction))) return;
      const index=source.tasks.findIndex(t=>hasAction(t,firstAction));
      if (index>=0) { dest.tasks.push(source.tasks.splice(index,1)[0]); changed=true; }
    }
    moveTask('S6',pla,'team_201');
    moveTask('S12',cdm,'team_501');
    for (const stage of [pla,cdm,customer]) for (const group of groups[stage.id]) {
      const marker=group.subs[0].actions[0].id;
      if (!stage.tasks.some(t=>hasAction(t,marker))) { stage.tasks.push(structuredClone(group)); changed=true; }
    }
    return changed;
  }
  window.linzaUpgradePlan=upgrade;
  upgrade(defaultPlan);
  const migrationKey='linza-board-three-branches-v2';
  if (!localStorage.getItem(migrationKey)) {
    const original=localStorage.getItem(PLAN_KEY);
    if (original && !localStorage.getItem(migrationKey+'-backup')) localStorage.setItem(migrationKey+'-backup',original);
    if (upgrade(plan)) { savePlan(); renderPlan(); }
    localStorage.setItem(migrationKey,'done');
  }
})();
