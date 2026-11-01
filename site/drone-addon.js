/* LINZA FPV drone application-demo addon.
   Loaded after the main Project Control script. It mutates the existing WBS/budget
   in place without overwriting user statuses or local edits. */
(() => {
  const A2=(id,text,status='todo',scope='core')=>({id,text,status,scope});

  const droneTask={
    title:'Прикладной тест на карбоновом FPV-дроне',
    subs:[
      {title:'Паспорт реального FPV',actions:[
        A2('d1001','Взять карбоновый FPV-дрон у друга — стоимость 0 ₽'),
        A2('d1002','Измерить wheelbase и максимальный габарит дрона с пропеллерами'),
        A2('d1003','Взвесить дрон в той конфигурации, в которой он будет измеряться'),
        A2('d1004','Зафиксировать материал рамы и расположение основных carbon-fiber элементов'),
        A2('d1005','Зафиксировать положение батареи, антенн и пропеллеров фотографиями')
      ]},
      {title:'Зафиксировать measurement state',actions:[
        A2('d1010','Для всех VNA-съёмок полностью выключить motors / FC / VTX / ELRS / Wi‑Fi и прочие передатчики'),
        A2('d1011','Выбрать одно состояние батареи: установлена и отключена либо снята; не менять между сериями'),
        A2('d1012','Зафиксировать одинаковое положение пропеллеров между повторениями'),
        A2('d1013','Выбрать 0°: одинаковый nose/yaw reference для всех серий')
      ]},
      {title:'Проверить геометрию и дальнюю зону',actions:[
        A2('d1020','Измерить D_max всей сборки FPV + Ø120 линза'),
        A2('d1021','Рассчитать R_ff = 2·D_max²/λ для λ≈59.96 мм @5 ГГц'),
        A2('d1022','Выбрать максимально доступную дистанцию не меньше R_ff, если помещение позволяет'),
        A2('d1023','Если R<R_ff — заранее пометить drone result как relative coherent scattering / RCS proxy, а не строгую absolute far-field RCS')
      ]},
      {title:'Сделать low-scatter крепление линзы',actions:[
        A2('d1030','Спроектировать съёмный dielectric adapter: foam / тонкий полимер / nylon line, минимум металла'),
        A2('d1031','Расположить центр линзы и её optical axis воспроизводимо относительно рамы'),
        A2('d1032','Ориентировать metallic cap на дальней от радара стороне sphere'),
        A2('d1033','Проверить, что линзу можно снять/поставить без изменения положения самого FPV'),
        A2('d1034','Сфотографировать и измерить положение центра линзы относительно рамы')
      ]},
      {title:'Снять comparative states при 0°',actions:[
        A2('d1040','D0: снять BACKGROUND без дрона'),
        A2('d1041','D1: снять DRONE_BARE — карбоновый FPV без adapter/линзы'),
        A2('d1042','D2: снять DRONE_HOLDER — FPV + пустой dielectric adapter без линзы'),
        A2('d1043','D3: снять DRONE_LENS_REFLECTOR — FPV + adapter + полный шар + reflector'),
        A2('d1044','Для D1 полностью снять/поставить объект и повторить минимум 3 независимых установки'),
        A2('d1045','Для D2 повторить минимум 3 независимых установки'),
        A2('d1046','Для D3 повторить минимум 3 независимых установки'),
        A2('d1047','Сохранять каждый run отдельным complex .s2p без перезаписи')
      ]},
      {title:'Обработать прикладной результат',actions:[
        A2('d1050','Для каждого run выполнить complex background subtraction: S_corr=S_state−S_background'),
        A2('d1051','Посчитать полный эффект: Δ_drone=20log10(|S_D3,corr/S_D1,corr|)'),
        A2('d1052','Посчитать вклад assembly относительно крепления: Δ_assembly=20log10(|S_D3,corr/S_D2,corr|)'),
        A2('d1053','Оценить разброс между независимыми переустановками D1/D2/D3'),
        A2('d1054','Не применять критерий +10 dB к FPV-demo: записать фактический эффект и repeatability')
      ]},
      {title:'Угловая диаграмма — после стабильного 0°',actions:[
        A2('d1060','Если 0° стабилен — снять D1 и D3 от −60° до +60° с шагом 10°'),
        A2('d1061','Для D2 снять минимум 0°, ±30°, ±60°'),
        A2('d1062','Для каждого угла сохранять yaw, фото/метаданные и одинаковую convention'),
        A2('d1063','Полный 0…360° sweep делать только при наличии времени','todo','optional')
      ]},
      {title:'Сформулировать вывод независимо от исхода',actions:[
        A2('d1070','Если прирост большой — показать, что retroreflector выделяется даже на фоне carbon-fiber airframe'),
        A2('d1071','Если прирост небольшой, но повторяемый — показать частичное маскирование собственной сигнатурой FPV'),
        A2('d1072','Если прирост статистически неразличим — зафиксировать ограничение для данного FPV/ракурса, не отменяя isolated-lens result'),
        A2('d1073','Если результат нестабилен — проверить holder, distance, direct coupling, repositioning, battery/prop geometry и background drift')
      ]}
    ]
  };

  // Add to the physical-experiment stage while preserving existing user plan/statuses.
  if (typeof defaultPlan !== 'undefined') {
    const ds=defaultPlan.find(s=>s.id==='S10');
    if(ds && !ds.tasks.some(t=>t.title===droneTask.title)) ds.tasks.push(structuredClone(droneTask));
  }
  if (typeof plan !== 'undefined') {
    const s=plan.find(s=>s.id==='S10');
    if(s && !s.tasks.some(t=>t.title===droneTask.title)) {
      s.tasks.push(structuredClone(droneTask));
      if(typeof savePlan==='function') savePlan();
      if(typeof renderPlan==='function') renderPlan();
    }
  }

  // Budget migration. Drone is borrowed = 0 RUB.
  const budgetAdds=[
    {category:'FPV demo',item:'Карбоновый FPV-дрон',qty:1,unit:'шт.',price:0,note:'Бесплатно у друга; использовать статически, электроника OFF'},
    {category:'FPV demo',item:'Диэлектрический съёмный adapter линзы к FPV',qty:1,unit:'компл.',price:500,note:'Foam/тонкий полимер/nylon; минимум металла'},
    {category:'FPV demo',item:'Поворотная разметка / угловая шкала / крепёж стенда',qty:1,unit:'компл.',price:500,note:'Ориентир; 0 ₽ если всё есть в лаборатории'}
  ];
  if(typeof defaultBudget!=='undefined') {
    for(const r of budgetAdds) if(!defaultBudget.some(x=>x.item===r.item)) defaultBudget.push(structuredClone(r));
  }
  if(typeof budget!=='undefined') {
    let changed=false;
    for(const r of budgetAdds) if(!budget.some(x=>x.item===r.item)){budget.push(structuredClone(r));changed=true}
    if(changed && typeof renderBudget==='function') renderBudget();
  }

  // Add a concise methodology card before reference section.
  const ref=document.getElementById('reference');
  if(ref && !document.getElementById('drone-demo-summary')){
    const sec=document.createElement('section');
    sec.id='drone-demo-summary';
    sec.innerHTML=`<div class="head"><div><h2>FPV-дрон — прикладной эксперимент</h2><p>Карбоновый FPV бесплатно. Не заменяет основной isolated-lens test.</p></div><a class="btn" href="https://github.com/dikobrazuka/linza/blob/main/docs/17_DRONE_DEMO_PROTOCOL.md" target="_blank">Полная методика ↗</a></div>
    <div class="grid2"><div class="card box"><h3>Зачем</h3><p>Проверяем, виден ли эффект retroreflector на фоне реальной carbon-fiber рамы. Большой прирост — сильный прикладной результат; нулевой прирост — тоже допустимый вывод о маскировании собственной сигнатурой FPV.</p><div class="formula">D1 = bare FPV<br>D2 = FPV + empty adapter<br>D3 = FPV + lens + reflector</div></div><div class="card box"><h3>Главное правило</h3><p>Дрон <b>не летает</b>: motors/FC/VTX/ELRS/Wi‑Fi OFF. Положение батареи и винтов фиксировано. Сначала 0°, по 3 независимых переустановки каждого состояния.</p><div class="formula">Δdrone=20log₁₀|S̄D3,corr/S̄D1,corr|</div><p>Критерий +10 dB к drone-demo не применяется.</p></div></div>
    <div class="note warn" style="margin-top:8px"><b>Far field:</b> сначала измерить D_max всей сборки и посчитать R_ff≈2D_max²/λ. Для D=300 мм при 5 ГГц это около 3.0 м. Если помещение короче — результат честно называем relative scattering / RCS proxy, а не строгой absolute far-field RCS.</div>`;
    ref.parentNode.insertBefore(sec,ref);
  }
})();
