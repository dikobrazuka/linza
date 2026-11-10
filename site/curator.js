(() => {
  'use strict';
  const app=window.Linza, base='https://github.com/dikobrazuka/linza/blob/main/';
  const goal=document.getElementById('report-goal'),specimens=document.getElementById('report-specimens');
  const status=document.getElementById('report-status'),questions=document.getElementById('report-questions');
  const date=document.getElementById('report-date');
  function fail(el,file){el.replaceChildren();const p=document.createElement('p');p.className='brief-error';p.append('Не удалось загрузить данные. ');const a=document.createElement('a');a.href=base+'site/data/'+file+'.json';a.textContent='Источник ↗';p.append(a);el.append(p)}
  function dateRu(s){const parts=String(s||'').split('-');return parts.length===3?`${parts[2]}.${parts[1]}.${parts[0]}`:'не указан'}
  function money(n){return new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(n)+' ₽'}
  const results={};
  function renderStatus(){
    if(!results.actions||!results.procurement)return;
    const confirmed=results.actions.actions.filter(a=>['pla_test','de10_test'].includes(a.id)&&a.status==='done'&&a.evidence).length;
    const p=results.procurement,total=p.rows.reduce((sum,r)=>sum+r.line_total_rub,0)+p.existing_resin_plan.estimated_cost_rub;
    status.replaceChildren();const first=document.createElement('p');first.textContent=confirmed?`В реестре задач подтверждено результатов: ${confirmed}.`:'Подтверждённые результаты испытаний в реестре пока не указаны.';
    const second=document.createElement('p');second.textContent=`План закупки и смолы: ${money(total)} + дополнительные расходы. ${p.rows.some(r=>r.status==='planned')?'Закупка не подтверждена полностью.':'Статусы — по реестру закупок.'}`;
    status.append(first,second);
  }
  app.load('project').then(data=>{
    date.textContent='Срез данных проекта: '+dateRu(data.as_of);
    goal.textContent=`Пассивная радиолинза Ø${data.target.diameter_mm} мм для ${data.target.frequency_ghz} ГГц${Number.isFinite(data.target.mass_limit_g)?`; масса до ${data.target.mass_limit_g} г`:''}. Цель — увеличить обратное рассеяние.`;
    specimens.replaceChildren();for(const s of data.specimens){const row=document.createElement('div');row.className='brief-row';const b=document.createElement('b');b.textContent=s.label;const span=document.createElement('span');span.textContent=`${s.frequency_ghz} ГГц`;row.append(b,span);specimens.append(row)}
  }).catch(()=>{date.textContent='Срез данных недоступен';goal.textContent='Данные цели недоступны.';fail(specimens,'project')});
  app.load('actions').then(data=>{
    results.actions=data;renderStatus();
    const requests=[
      ['calibrate_vna','Оценить методику 5-ГГц стенда: калибровку, фон и эталон.'],
      ['de10_T4','Подсказать оснастку для измерения проницаемости и потерь материалов.'],
      ['final80_rf','Помочь с доступом к калиброванному измерению ЭПР на 24 ГГц.']
    ];
    questions.replaceChildren();for(const [id,text] of requests){const action=data.actions.find(a=>a.id===id);if(!action)continue;const li=document.createElement('li');li.append(text+' ');const a=document.createElement('a');a.href=base+action.document.split('/').map(encodeURIComponent).join('/');a.textContent='Протокол ↗';a.target='_blank';a.rel='noopener noreferrer';li.append(a);questions.append(li)}
    if(!questions.children.length)fail(questions,'actions');
  }).catch(()=>{fail(questions,'actions');fail(status,'actions')});
  app.load('procurement').then(data=>{results.procurement=data;renderStatus()}).catch(()=>fail(status,'procurement'));
})();
