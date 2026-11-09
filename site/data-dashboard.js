/* Canonical read-only project data from repo JSON. User WBS and personal budget remain local. */
(() => {
  'use strict';
  const root = document.getElementById('canonicalBudgetData');
  const actionsRoot = document.getElementById('canonicalActionsData');
  if (!root && !actionsRoot) return;
  const money = n => new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(n)+' ₽';
  const link = (url,text) => {
    const a=document.createElement('a');a.href=url;a.textContent=text;a.target='_blank';a.rel='noopener noreferrer';return a;
  };
  if (root) {
    root.textContent='Загрузка 32 позиций закупки из JSON проекта…';
    fetch('./data/procurement.json',{cache:'no-cache'}).then(r=>{
      if(!r.ok)throw Error('HTTP '+r.status);return r.json();
    }).then(data=>{
      if(!Array.isArray(data.rows)||data.rows.length!==32)throw Error('Некорректное количество строк');
      const sum=data.rows.reduce((x,r)=>x+Number(r.line_total_rub||0),0);
      if(sum!==24267 || sum!==data.planned_cart_total_rub)throw Error('Не совпадает сумма');
      root.replaceChildren();
      const intro=document.createElement('p');
      const strong=document.createElement('strong');strong.textContent='Актуальная корзина: '+data.rows.length+' строки · '+money(sum);
      intro.append(strong,document.createTextNode('. Все позиции — план, покупки не подтверждены. DE-10 1 кг (~14 000 ₽) отдельно; неизвестные расходы не включены.'));
      root.append(intro);
      const filter=document.createElement('input');filter.type='search';filter.placeholder='Найти позицию закупки…';filter.setAttribute('aria-label','Поиск в корзине');
      filter.style.cssText='width:100%;padding:10px;margin-bottom:10px;background:#111923;color:inherit;border:1px solid #374456;border-radius:8px';
      root.append(filter);
      const wrap=document.createElement('div');wrap.style.overflowX='auto';
      const table=document.createElement('table');table.style.cssText='width:100%;border-collapse:collapse;min-width:710px;font-size:13px';
      const thead=document.createElement('thead');const thr=document.createElement('tr');
      ['№','Позиция','Кол-во в лоте','Сумма строки','Статус','Ссылка'].forEach(name=>{const th=document.createElement('th');th.textContent=name;th.style.cssText='padding:8px;border-bottom:1px solid #364152;text-align:left';thr.append(th)});
      thead.append(thr);table.append(thead);
      const tbody=document.createElement('tbody');
      const rows=[];
      data.rows.forEach(item=>{
        const tr=document.createElement('tr');tr.dataset.search=(item.title+' '+item.track+' '+item.note).toLowerCase();
        const cell=(value)=>{const td=document.createElement('td');td.textContent=String(value);td.style.cssText='padding:8px;border-bottom:1px solid #283241;vertical-align:top';tr.append(td);return td};
        cell(item.original_row);const title=cell(item.title);title.title=item.note;cell(item.purchase_quantity);cell(money(item.line_total_rub));cell('В плане');
        const td=document.createElement('td');td.style.padding='8px';td.append(link(item.source_url,'Лот'));tr.append(td);
        tbody.append(tr);rows.push(tr);
      });
      table.append(tbody);wrap.append(table);root.append(wrap);
      filter.addEventListener('input',()=>{const q=filter.value.trim().toLowerCase();rows.forEach(tr=>tr.hidden=!tr.dataset.search.includes(q));});
      const note=document.createElement('p');note.textContent='Сумма строки — уже стоимость выбранного количества/упаковки. Не умножайте её на количество повторно.';note.style.opacity='.7';root.append(note);
    }).catch(e=>{root.textContent='Ошибка загрузки актуальной сметы: '+e.message+'. Откройте budget/MASTER_BOM_AND_COST_2026-11-09.md в GitHub.';});
  }
  if (actionsRoot) {
    actionsRoot.textContent='Загрузка плана из site/data/actions.json…';
    fetch('./data/actions.json',{cache:'no-cache'}).then(r=>{
      if(!r.ok)throw Error('HTTP '+r.status);return r.json();
    }).then(data=>{
      if(!Array.isArray(data.actions))throw Error('Пустой список');
      actionsRoot.replaceChildren();
      const note=document.createElement('p');note.textContent='Канонический план: '+data.actions.length+' задач. Ни одна не считается выполненной без подтверждений. Ниже — ссылки на рабочие инструкции; локальный Kanban находится отдельно.';actionsRoot.append(note);
      const ul=document.createElement('ul');ul.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px;list-style:none;padding:0';
      for(const a of data.actions){
        const li=document.createElement('li');li.style.cssText='border:1px solid #364152;border-radius:10px;padding:10px';
        const b=document.createElement('b');b.textContent=a.title;li.append(b);
        const p=document.createElement('p');p.textContent=a.track+' · '+(a.status==='blocked'?'ожидает подтверждения':'запланировано');p.style.opacity='.7';li.append(p);
        const path='https://github.com/dikobrazuka/linza/blob/main/'+a.document;li.append(link(path,'Инструкция'));
        ul.append(li);
      }
      actionsRoot.append(ul);
    }).catch(e=>{actionsRoot.textContent='Не удалось загрузить план: '+e.message;});
  }
})();
