(() => {
  'use strict';
  const base = 'https://github.com/dikobrazuka/linza/blob/main/';
  const fallbackTasks = [
    {id:'stock',track:'stand',tag:'ПОДГОТОВКА',title:'Проверить материалы и оборудование',subtitle:'С чего начать всем потокам',steps:['Сверить наличие PLA, DE-10, принтеров, NanoVNA, калибровочного набора и деталей для рупоров.','Уточнить количество, сроки и доступ к лабораторной оснастке.'],done:'У каждой позиции есть статус и источник. Корзина 24 267 ₽ — план, а не подтверждение покупки.',doc:'budget/MASTER_BOM_AND_COST_2026-11-09.md',link:'Список и смета'},
    {id:'horns',track:'stand',tag:'СТЕНД',title:'Изготовить два одинаковых рупора',subtitle:'Антенны для 5-ГГц стенда',steps:['Проверить посадку SMA-7814-16 по исходному STEP и фактическому разъёму.','Напечатать корпуса, металлизировать поверхности и гребни, собрать задние стенки.','Проверить соединения по геометрии конкретного рупора.'],done:'Два собранных рупора, фото соединений и стабильное крепление.',doc:'experiment/05GHZ_STAND_BUILD_AND_CALIBRATION.md',link:'Инструкция по сборке'},
    {id:'calibrate',track:'stand',tag:'СТЕНД',title:'Откалибровать и проверить стенд',subtitle:'NanoVNA + два рупора · около 5 ГГц',steps:['Выполнить SOLT в рабочем диапазоне, измерить S11 каждого рупора и S21 пары.','Проверить фон, прямую связь и сигнал от металлического эталона.'],done:'Эталон устойчиво виден над фоном, геометрия и настройки записаны. Калибровка 383–483 МГц не подходит.',doc:'docs/20_5GHZ_HORNS_NANOVNA.md',link:'Калибровка и контроль'},
    {id:'pla-cad',track:'pla',tag:'PLA Ø200',title:'Подготовить PLA-образец Ø200 мм',subtitle:'Материал, CAD и проверка печати',steps:['Выбрать конкретную марку PLA и структуру заполнения.','Подготовить CAD полусфер, стыка, крепления и отражателя.','Проверить область печати и расход в слайсере.'],done:'CAD, профиль печати и оценка массы. Наличие 2 кг в корзине не гарантирует достаточность.',doc:'docs/23_PLA_200MM_FDM_EXPERIMENT.md',link:'Описание образца'},
    {id:'pla-coupons',track:'pla',tag:'PLA Ø200',title:'Напечатать и проверить образцы PLA',subtitle:'До печати полной линзы',steps:['Напечатать купоны с теми же стенками, заполнением и ориентацией; измерить размеры и массу.','Размер RF-образца согласовать с доступной оснасткой.'],done:'Журнал образцов и ограничения печати. Процент заполнения не равен диэлектрической проницаемости.',doc:'experiment/PLA_200_TEST_PROCEDURE.md',link:'Протокол PLA'},
    {id:'pla-model',track:'pla',tag:'PLA Ø200',title:'Рассчитать PLA Ø200 отдельно',subtitle:'Модель · около 5 ГГц',steps:['Сначала рассчитать идеальную линзу Ø200, затем проверить модель с доступными данными о материале и геометрии.','Не использовать свойства DE-10 как измеренные свойства PLA.'],done:'Параметры модели, сохранённый расчёт и явно указанные допущения.',doc:'docs/23_PLA_200MM_FDM_EXPERIMENT.md',link:'Расчёт PLA-ветки'},
    {id:'pla-test',track:'pla',tag:'PLA Ø200',title:'Испытать PLA Ø200 на стенде',subtitle:'После подготовки образца и проверки стенда',steps:['Проверить расстояния 2 / 2,5 / 3 м и выбрать рабочую геометрию.','Снять фон, держатель, эталон, отражатель без линзы и линзу с отражателем; сохранить комплексные .s2p.','Повторить ключевые установки не менее трёх раз.'],done:'Журнал геометрии, фотографии, сырые данные и повторяемое сравнение выше фона.',doc:'experiment/PLA_200_TEST_PROCEDURE.md',link:'Все состояния P0–P5'},
    {id:'de10',track:'de10',tag:'DE-10 Ø120',title:'Измерить свойства и печатаемость DE-10',subtitle:'T1–T4 · отдельная фотополимерная ветка',steps:['Согласовать размеры RF-образцов с лабораторией.','Проверить сплошную смолу, усадку, печатаемость гироида и связь плотности с ε около 5 ГГц.'],done:'Протоколы T1–T4 и реальные данные для модели; перед полной печатью — проверка массы и расчёта.',doc:'experiment/DE10_120_TEST_PROCEDURE.md',link:'Порядок для DE-10'},
    {id:'de10-test',track:'de10',tag:'DE-10 Ø120',title:'Изготовить и испытать DE-10 Ø120',subtitle:'После проверки материала, расчёта и расхода',steps:['После допусков изготовить полусферы, промыть и выполнить post-cure; зафиксировать массу и размеры.','На проверенном стенде сравнить образец с отражателем и тот же отражатель без линзы; сохранить комплексные данные.'],done:'Журнал изготовления, фотографии и повторяемые измерения D0–D5 с исходными файлами.',doc:'experiment/DE10_120_TEST_PROCEDURE.md',link:'Порядок испытаний DE-10'},
    {id:'shell',track:'final',tag:'Ø80 / 24 ГГЦ',title:'Проверить оболочку PLA-Aero Pro',subtitle:'Две полусферы для целевой конструкции',steps:['Стартовый профиль: 245–250 °C, flow 0,30, две стенки.','Напечатать образцы, измерить фактическую толщину, массу и качество; проверить посадку и стык.'],done:'Измеренные размеры и протокол T5. Около 1,2 мм и ε = 1,4 пока не являются результатами измерения.',doc:'docs/18_PLA_AERO_SHELL_T5_PROTOCOL.md',link:'Испытания оболочки T5'},
    {id:'model',track:'final',tag:'Ø80 / 24 ГГЦ',title:'Рассчитать целевую линзу Ø80 мм',subtitle:'Отдельная модель на 24 ГГц',steps:['Построить отдельную модель с отражателем и оболочкой, проверить сценарии ε и потерь.','Оценить размер ячейки, изготовимость и массу всей сборки.'],done:'Параметры, сходимость и ограничения расчёта. Результаты 5-ГГц образцов не переносятся автоматически на 24 ГГц.',doc:'experiment/FINAL_80_24GHZ_TEST_PROCEDURE.md',link:'План для Ø80'},
    {id:'cdm',track:'final',tag:'Ø80 / 24 ГГЦ',title:'Проверить CDM324 на столе',subtitle:'Дополнительная демонстрация 24,125 ГГц',steps:['Проверить питание и распиновку конкретного радара; собрать усилитель и Pico по схеме.','После электрической проверки снять фон и несколько записей движущейся металлической пластины.'],done:'Контрольные напряжения, сырые записи и повторяемый сигнал. CDM324 не измеряет дальность и не доказывает абсолютную ЭПР.',doc:'electronics/01_CDM324_OPA2365_PICO_SCHEMATIC.md',link:'Схема и контрольные точки'},
    {id:'flight',track:'final',tag:'ДЕМОНСТРАЦИЯ',title:'Подготовить возможную лётную демонстрацию',subtitle:'После наземной проверки CDM324',steps:['Выяснить модель дрона, допустимую нагрузку и массу реальной сборки; согласовать безопасную траекторию.','Организовать сопоставимые пролёты и независимую запись расстояния и условий.'],done:'План и сырые записи с известными условиями; относительный IF не считать калиброванной ЭПР.',doc:'docs/22_DJI_FPV_24GHZ_FLIGHT_DEMO.md',link:'Условия лётного опыта'},
    {id:'result',track:'stand',tag:'ОТЧЁТ',title:'Обработать и сохранить результаты',subtitle:'После измерений, без подмены расчёта фактом',steps:['Вычесть фон из комплексных сигналов и сравнить линзу с тем же отражателем без линзы.','Сохранить исходные данные, настройки, повторяемость и условия измерения.'],done:'Воспроизводимый расчёт и отчёт с базовым состоянием, частотой, геометрией и ограничениями. Цель +10 дБ заявляют достигнутой только по подтверждённым данным.',doc:'docs/13_RCS_S21_PROCESSING.md',link:'Обработка S21'}
  ];
  const list = document.getElementById('worklist');
  const more = document.getElementById('show-more');
  const note = document.getElementById('local-note');
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const key = 'linza-personal-quick-checks-v1';
  let checks = {};
  try { checks = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (_) { checks = {}; }
  function renderTasks(tasks) {
    list.innerHTML = '';
    for (const task of tasks) {
    const card = document.createElement('article');
    card.className = 'task'; card.dataset.track = task.track;
    const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.className = 'check';
    checkbox.checked = checks[task.id] === true; checkbox.setAttribute('aria-label', `Отметить: ${task.title}`);
    const detail = document.createElement('details');
    const summary = document.createElement('summary');
    const name = document.createElement('span');
    const strong = document.createElement('strong'); strong.textContent = task.title;
    const small = document.createElement('small'); small.textContent = task.subtitle;
    name.append(strong, small);
    const tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = task.tag;
    const plus = document.createElement('span'); plus.className = 'plus'; plus.setAttribute('aria-hidden','true'); plus.textContent = '+';
    summary.append(name, tag, plus); detail.append(summary);
    const body = document.createElement('div'); body.className = 'taskbody';
    const steps = document.createElement('ol');
    for (const step of task.steps) { const li = document.createElement('li'); li.textContent = step; steps.append(li); }
    const done = document.createElement('p'); done.className = 'done';
    const label = document.createElement('b'); label.textContent = 'Готово: '; done.append(label, document.createTextNode(task.done));
    const link = document.createElement('a'); link.href = base + task.doc; link.textContent = task.link + ' ↗';
    body.append(steps, done, link); detail.append(body); card.append(checkbox, detail); list.append(card);
    checkbox.addEventListener('change', () => {
      checks[task.id] = checkbox.checked;
      try { localStorage.setItem(key, JSON.stringify(checks)); }
      catch (_) { note.textContent = 'Отметки не удалось сохранить в этом браузере.'; }
    });
  }
  }
  let selected = 'all', expanded = false;
  function update() {
    let count = 0;
    for (const card of list.children) {
      const match = selected === 'all' || card.dataset.track === selected;
      card.hidden = !match || (selected === 'all' && !expanded && count >= 5);
      if (match) count++;
    }
    more.hidden = selected !== 'all' || expanded || count <= 5;
    more.textContent = `Показать ещё ${Math.max(0, count - 5)} задач ↓`;
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.filter === selected));
  }
  for (const button of buttons) button.addEventListener('click', () => { selected = button.dataset.filter; update(); });
  more.addEventListener('click', () => { expanded = true; update(); });
  renderTasks(fallbackTasks);
  update();
  // Source of truth for all current tracks; preserve old browser-local quick checks by stable IDs.
  const legacyIds = {
    inventory:'stock', source_horns:'horns', calibrate_vna:'calibrate',
    pla_design:'pla-cad', pla_coupons:'pla-coupons', pla_meep:'pla-model',
    pla_test:'pla-test', de10_T1:'de10', de10_test:'de10-test',
    final80_shell:'shell', final80_model:'model', cdm_schematic:'cdm',
    flight_plan:'flight', report:'result'
  };
  const trackMap = { 'Общее':'stand','5 ГГц стенд':'stand',
    'PLA Ø200':'pla','DE-10 Ø120':'de10','CDM324':'final',
    'Ø80 / 24 ГГц':'final','Динамика':'final','Оформление':'stand' };
  fetch('./data/actions.json', {cache:'no-cache'})
    .then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json();})
    .then(data=>{
      if(!Array.isArray(data.actions)||data.actions.length===0)throw new Error('Пустой список действий');
      const tasks = data.actions.map(a=>({
        id:legacyIds[a.id]||a.id,track:trackMap[a.track]||'stand',
        tag:a.track,title:a.title,subtitle:a.status==='blocked'?'Ожидает подтверждения / доступа':'По основному плану проекта',
        steps:a.steps,done:'Нужны реальные результаты и подтверждающие файлы. Статус в браузере локальный.',
        doc:a.document,link:'Открыть рабочую инструкцию'
      }));
      renderTasks(tasks);update();
    })
    .catch(e=>{note.textContent='Не удалось загрузить актуальные задачи из GitHub Pages: '+e.message+'. Показан резервный список.';});
})();
