/* Current tasks and procurement come from the three repository JSON files. */
(() => {
  'use strict';
  const app=window.Linza, ar=document.getElementById('canonicalActionsData'), br=document.getElementById('canonicalBudgetData');
  const base='https://github.com/dikobrazuka/linza/blob/main/';
  const rawBase='https://raw.githubusercontent.com/dikobrazuka/linza/main/';
  const protocolCache=new Map();
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const url=p=>base+String(p).split('/').map(encodeURIComponent).join('/');
  const money=n=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0}).format(n)+' ₽';
  const statusNames={planned:'Запланировано',doing:'В работе',blocked:'Заблокировано',done:'Готово · лично'};
  const purchaseNames={planned:'В плане',ordered:'Заказано · лично',received:'Получено · лично',blocked:'Заблокировано · лично'};
  const opts=(dict,selected,all)=>`${all?'<option value="all">Все</option>':''}`+Object.entries(dict).map(([v,t])=>`<option value="${esc(v)}" ${v===selected?'selected':''}>${esc(t)}</option>`).join('');
  function error(root,name,e){root.innerHTML=`<div class="ws-error">Не удалось загрузить ${esc(name)}: ${esc(e.message)}. <a href="${base}site/data/${esc(name)}.json">Открыть данные на GitHub ↗</a></div>`}
  function saveFile(name,obj){const a=document.createElement('a');const u=URL.createObjectURL(new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}));a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
  function safe(fn){try{fn();return true}catch(e){alert('Не удалось сохранить локальные данные: '+e.message);return false}}
  function renderProtocol(root,text){
    const fragment=document.createDocumentFragment();let list=null,pre=null,inCode=false;
    const clean=s=>s.replace(/\*\*/g,'').replace(/`([^`]+)`/g,'$1');
    for(const line of text.split(/\r?\n/)){
      if(line.trim().startsWith('```')){if(inCode){inCode=false;pre=null}else{inCode=true;list=null;pre=document.createElement('pre');fragment.append(pre)}continue}
      if(inCode){pre.textContent+=line+'\n';continue}
      if(!line.trim()){list=null;pre=null;continue}
      if(/^\s*\|/.test(line)){list=null;if(!pre){pre=document.createElement('pre');fragment.append(pre)}pre.textContent+=line+'\n';continue}
      pre=null;const heading=line.match(/^(#{1,6})\s+(.+)$/);
      if(heading){list=null;const h=document.createElement(heading[1].length<=2?'h3':'h4');h.textContent=clean(heading[2]);fragment.append(h);continue}
      const entry=line.match(/^\s*([-*]|\d+\.)\s+(.+)$/);
      if(entry){const kind=/\d/.test(entry[1])?'OL':'UL';if(!list||list.tagName!==kind){list=document.createElement(kind.toLowerCase());if(kind==='OL')list.start=parseInt(entry[1],10);fragment.append(list)}const li=document.createElement('li');li.textContent=clean(entry[2]);list.append(li);continue}
      list=null;const p=document.createElement('p');p.textContent=clean(line);fragment.append(p);
    }
    root.replaceChildren(fragment);
  }
  const systems=document.getElementById('canonicalSystems');
  if(systems)app.load('project').then(data=>{
    if(!Array.isArray(data.systems))throw new Error('Нет описания измерительных систем');
    systems.innerHTML='<p class="ws-muted">Измерительные системы по плану; аппаратная готовность требует подтверждения.</p><div class="ws-systems">'+data.systems.map(s=>`<article><b>${esc(s.name)}</b><small>${s.status==='planned'?'Запланировано':esc(s.status)}${s.warning?' · '+esc(s.warning==='Not calibrated RCS'?'не измеряет калиброванную ЭПР':s.warning):''}</small><a class="ws-link" href="${esc(url(s.document))}">${s.id==='cdm24'?'Описание схемы':'Инструкция'} ↗</a>${s.software?' <a class="ws-link" href="'+esc(url(s.software))+'">Запись ↗</a>':''}</article>`).join('')+'</div>';
  }).catch(e=>error(systems,'project',e));
  let tasks=[], stateFilter='all',trackFilter='all',query='',view='list', initialized=false, editingEvidence=false;
  function openHash(){if(!location.hash.startsWith('#action-'))return;let id;try{id=decodeURIComponent(location.hash.slice(1))}catch(_){return}const card=document.getElementById(id);if(card){card.open=true;card.scrollIntoView({block:'start'})}}
  function getStatus(a,state){return state.actions[a.id]?.status||a.status}
  function taskCard(a,state,open){
    const local=state.actions[a.id]||{}, status=getStatus(a,state),steps=local.steps||{};
    const matches=app.legacyCandidates(a.id);
    const candidates=matches.length?`<div class="ws-legacy"><b>Найдена прежняя отметка</b><p>Сопоставление приблизительное: проверьте исходную задачу. Старые данные остаются в архиве.</p>${matches.map(c=>`<p>${esc(c.source)}: ${esc(c.text)} · ${esc(statusNames[c.status]||c.status)} <button type="button" class="ws-button small" data-apply-legacy="${esc(a.id)}" data-legacy-status="${esc(c.status)}">Применить лично</button></p>`).join('')}</div>`:'';
    const stepsHtml=a.steps.map((step,i)=>`<label class="ws-step"><input type="checkbox" data-step="${esc(a.id)}" data-step-index="${i}" ${steps[i]?'checked':''}> <span>${esc(step)}</span></label>`).join('')||'<p class="ws-muted">Добавлено локально; подробности можно записать в поле результата.</p>';
    const doc=a.document?`<div class="ws-protocol-actions"><button type="button" class="ws-button small" data-protocol="${esc(a.id)}" aria-expanded="false">Показать протокол</button><a class="ws-link" href="${esc(url(a.document))}" target="_blank" rel="noopener noreferrer">Открыть на GitHub ↗</a></div><div class="ws-protocol" data-protocol-body="${esc(a.id)}" hidden aria-live="polite"></div>`:'<span class="ws-muted">Личная задача</span>';
    return `<details class="ws-task" id="action-${esc(a.id)}" data-card="${esc(a.id)}" ${open?'open':''}><summary><span><b>${esc(a.title)}</b><small>${esc(a.track)} · ${esc(statusNames[status]||status)}</small></span><span class="ws-plus" aria-hidden="true">+</span></summary><div class="ws-task-body"><label class="ws-field">Личный статус <select data-action-status="${esc(a.id)}">${opts(statusNames,status,false)}</select></label><label class="ws-field">Исполнитель (личная запись) <input data-assignee="${esc(a.id)}" value="${esc(local.assignee||'')}" placeholder="Пока не назначен"></label><div class="ws-steps">${stepsHtml}</div><label class="ws-field">Результат, ссылка или заметка <textarea data-evidence="${esc(a.id)}" rows="2" placeholder="Необязательно; сохраняется только в этом браузере">${esc(local.evidence||'')}</textarea></label><p class="ws-muted">Отметка «готово» — личная. Подтверждение и критерии GO/STOP смотрите в инструкции.</p>${candidates}${doc} ${a.id.startsWith('local-')?`<button type="button" class="ws-button small" data-edit-custom="${esc(a.id)}">Изменить название</button> <button type="button" class="ws-button small" data-delete-custom="${esc(a.id)}">Удалить личную задачу</button>`:''}</div></details>`;
  }
  function renderTasks(){
    if(!initialized)return;let state;try{state=app.read()}catch(e){error(ar,'actions',e);return}
    const open=new Set([...ar.querySelectorAll('[data-card][open]')].map(e=>e.dataset.card));
    const all=[...tasks,...state.custom], filtered=all.filter(a=>(trackFilter==='all'||a.track===trackFilter)&&(stateFilter==='all'||getStatus(a,state)===stateFilter)&&(!query||(a.title+' '+a.track+' '+a.steps.join(' ')).toLowerCase().includes(query)));
    const list=ar.querySelector('#ws-task-list'),kanban=ar.querySelector('#ws-kanban'),counter=ar.querySelector('#ws-task-count');
    if(!list||!kanban)return;counter.textContent=`Показано ${filtered.length} из ${all.length} · статусы личные`;
    list.innerHTML=filtered.map(a=>taskCard(a,state,open.has(a.id))).join('')||'<p class="ws-muted">По этим условиям задач нет.</p>';
    kanban.innerHTML=Object.entries(statusNames).map(([st,label])=>{const items=filtered.filter(a=>getStatus(a,state)===st);return `<section class="ws-column"><h4>${esc(label)} <span>${items.length}</span></h4>${items.map(a=>`<button type="button" class="ws-kanban-item" data-open-task="${esc(a.id)}">${esc(a.title)}<small>${esc(a.track)}</small></button>`).join('')}</section>`}).join('');
    list.hidden=view!=='list';kanban.hidden=view!=='kanban';ar.querySelector('#ws-view-list').setAttribute('aria-pressed',String(view==='list'));ar.querySelector('#ws-view-board').setAttribute('aria-pressed',String(view==='kanban'));
  }
  if(ar){
    app.load('actions').then(data=>{
      if(!Array.isArray(data.actions))throw new Error('Некорректный список');tasks=data.actions;
      const available=[...new Set(tasks.map(a=>a.track))];
      const order=['Общее','CDM324','5 ГГц стенд','PLA Ø200','DE-10 Ø120','Ø80 / 24 ГГц','Динамика','Оформление'];
      const trackNames=[...order.filter(t=>available.includes(t)),...available.filter(t=>!order.includes(t))];
      ar.innerHTML=`<div class="ws-intro"><div><b>${tasks.length} задач из проекта</b><p>Откройте задачу: внутри шаги и ссылка на протокол. Отметки, заметки и закупки видны только в этом браузере и не отправляются в GitHub.</p></div><div class="ws-tools"><button type="button" class="ws-button" id="ws-export">Экспорт прогресса</button><button type="button" class="ws-button" id="ws-import">Импорт прогресса</button><input id="ws-import-file" type="file" accept="application/json,.json" hidden></div></div><nav class="ws-flow" aria-label="Направления работ"><a href="#budget">Закупка</a>${trackNames.map(t=>`<button type="button" data-track-link="${esc(t)}">${esc(t)}</button>`).join('')}<a href="./explain.html#method">Методика ↗</a></nav><div class="ws-links">${tasks.find(a=>a.id==='cdm_schematic')?`<a href="${esc(url(tasks.find(a=>a.id==='cdm_schematic').document))}">Пайка: 32 шага и GO/STOP ↗</a>`:''}<a href="${base}electronics/RADAR_PINOUT_CARD_TEMPLATE.md">Паспорт распиновки ↗</a><a href="${base}electronics/06_WIRING_AND_POWER_QC.csv">Контроль QC CSV ↗</a><a href="${base}electronics/02_CDM324_NETLIST.csv">Netlist CSV ↗</a><a href="${base}electronics/03_CDM324_PICO_BOM.csv">BOM CSV ↗</a><a href="${base}experiment/05GHZ_STAND_BUILD_AND_CALIBRATION.md">Стенд и калибровка ↗</a><a href="${base}experiment/RUN_LOG_TEMPLATES.md">Журналы результатов ↗</a></div><div class="ws-filter"><label>Поиск<input type="search" id="ws-search" placeholder="Задача или шаг"></label><label>Направление<select id="ws-track"><option value="all">Все</option>${trackNames.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join('')}</select></label><label>Статус<select id="ws-status">${opts(statusNames,'all',true)}</select></label></div><div class="ws-view"><span id="ws-task-count" aria-live="polite"></span><div><button type="button" class="ws-button small" id="ws-view-list" aria-pressed="true">Список</button> <button type="button" class="ws-button small" id="ws-view-board" aria-pressed="false">Kanban</button></div></div><div id="ws-task-list"></div><div id="ws-kanban" class="ws-kanban" hidden></div><details class="ws-add"><summary>Добавить личную задачу</summary><form id="ws-add-form"><label>Название <input id="ws-add-title" required maxlength="180"></label><label>Направление <select id="ws-add-track">${trackNames.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join('')}</select></label><button class="ws-button" type="submit">Добавить</button></form><p>Задача останется только в этом браузере.</p></details>`;
      initialized=true;renderTasks();openHash();
      ar.querySelector('#ws-search').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();renderTasks()});
      ar.querySelector('#ws-track').addEventListener('change',e=>{trackFilter=e.target.value;renderTasks()});
      ar.querySelector('#ws-status').addEventListener('change',e=>{stateFilter=e.target.value;renderTasks()});
      ar.querySelector('#ws-view-list').addEventListener('click',()=>{view='list';renderTasks()});
      ar.querySelector('#ws-view-board').addEventListener('click',()=>{view='kanban';renderTasks()});
      ar.querySelector('#ws-add-form').addEventListener('submit',e=>{e.preventDefault();const input=ar.querySelector('#ws-add-title');const title=input.value.trim();if(title)safe(()=>{app.addCustom(title,ar.querySelector('#ws-add-track').value);input.value=''})});
      ar.querySelector('#ws-export').addEventListener('click',()=>safe(()=>saveFile('linza-workspace.json',app.exportData())));
      const input=ar.querySelector('#ws-import-file');ar.querySelector('#ws-import').addEventListener('click',()=>input.click());
      input.addEventListener('change',async()=>{const file=input.files?.[0];if(!file)return;try{const data=JSON.parse(await file.text());if(confirm('Импорт заменит текущие личные статусы и закупки. Сначала будет сохранена резервная копия. Старые WBS и смета сохранятся. Продолжить?'))app.importData(data)}catch(e){alert('Ошибка импорта: '+e.message)}finally{input.value=''}});
    }).catch(e=>error(ar,'actions',e));
    ar.addEventListener('click',e=>{
      const track=e.target.closest('[data-track-link]');if(track){trackFilter=track.dataset.trackLink;ar.querySelector('#ws-track').value=trackFilter;view='list';renderTasks();ar.querySelector('#ws-task-list').scrollIntoView({block:'start'});return}
      const legacy=e.target.closest('[data-apply-legacy]');if(legacy){safe(()=>app.updateAction(legacy.dataset.applyLegacy,{status:legacy.dataset.legacyStatus,migrated_from:'legacy-reviewed'}));return}
      const protocol=e.target.closest('[data-protocol]');if(protocol){
        const id=protocol.dataset.protocol,action=tasks.find(x=>x.id===id),body=protocol.parentElement.nextElementSibling;
        if(!action||!body)return;if(!body.hidden){body.hidden=true;protocol.setAttribute('aria-expanded','false');protocol.textContent='Показать протокол';return}
        body.hidden=false;protocol.setAttribute('aria-expanded','true');protocol.textContent='Скрыть протокол';body.textContent='Загружаем оригинал из репозитория…';
        if(!protocolCache.has(action.document))protocolCache.set(action.document,fetch(rawBase+action.document.split('/').map(encodeURIComponent).join('/')).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.text()}).catch(err=>{protocolCache.delete(action.document);throw err}));
        protocolCache.get(action.document).then(text=>renderProtocol(body,text)).catch(err=>{body.textContent='Не удалось загрузить протокол: '+err.message+'. Откройте ссылку GitHub рядом.'});return
      }
      const edit=e.target.closest('[data-edit-custom]');if(edit){const item=app.read().custom.find(x=>x.id===edit.dataset.editCustom);if(item){const value=prompt('Название личной задачи:',item.title);if(value&&value.trim())safe(()=>app.renameCustom(item.id,value.trim()))}return}
      const del=e.target.closest('[data-delete-custom]');if(del&&confirm('Удалить эту личную задачу? Перед удалением сохранится резервная копия.')){safe(()=>app.removeCustom(del.dataset.deleteCustom));return}
      const open=e.target.closest('[data-open-task]');if(open){view='list';renderTasks();const card=ar.querySelector('[data-card="'+CSS.escape(open.dataset.openTask)+'"]');if(card){card.open=true;card.scrollIntoView({block:'start'})}}
    });
    ar.addEventListener('input',e=>{const el=e.target;const key=el.dataset.evidence?'evidence':el.dataset.assignee?'assignee':null;if(key){const id=el.dataset[key];editingEvidence=true;try{safe(()=>app.updateAction(id,{[key]:el.value}))}finally{editingEvidence=false}}});
    ar.addEventListener('change',e=>{
      const el=e.target;if(el.dataset.actionStatus&&!safe(()=>app.updateAction(el.dataset.actionStatus,{status:el.value})))renderTasks();
      if(el.dataset.step&&!safe(()=>{const s=app.read().actions[el.dataset.step]||{};app.updateAction(el.dataset.step,{steps:{...(s.steps||{}),[el.dataset.stepIndex]:el.checked}})}))renderTasks();
    });
    window.addEventListener('linza-state-change',()=>{if(!editingEvidence)renderTasks()});
    window.addEventListener('hashchange',openHash);
  }
  if(br){
    app.load('procurement').then(data=>{
      if(!Array.isArray(data.rows)||!data.existing_resin_plan)throw new Error('Некорректные данные закупки');
      const rows=data.rows, total=rows.reduce((sum,r)=>sum+Number(r.line_total_rub),0), resin=Number(data.existing_resin_plan.estimated_cost_rub);
      const names={horns:'Рупоры и стенд',electronics:'Электроника',flight:'Полёт',pla200:'PLA Ø200',shared:'Общее'};
      const trackNames=[...new Set(rows.map(r=>r.track))];
      br.innerHTML=`<div class="ws-totals"><div><span>Корзина · ${rows.length} строк</span><b>${money(total)}</b></div><div><span>${esc(data.existing_resin_plan.material)} · ${esc(data.existing_resin_plan.quantity_kg)} кг отдельно</span><b>${money(resin)}</b></div><div><span>Известные статьи · без TBD</span><b>${money(total+resin)}</b></div></div><p>Все позиции из файла — план. Сумма строки уже включает выбранное количество. Личные статусы не подтверждают покупку для всей команды.</p><details class="ws-tbd"><summary>Что пока не входит в сумму · TBD</summary><ul>${data.other_costs_tbd.map(x=>'<li>'+esc(x)+'</li>').join('')}</ul><p>${esc(data.reserved_unknown_amount_meaning)}: ${money(data.reserved_unknown_amount_rub)}.</p><a class="ws-link" href="${esc(url(data.review_document))}">Подробная смета ↗</a></details><div class="ws-filter"><label>Поиск<input id="buy-search" type="search" placeholder="Наименование или комментарий"></label><label>Направление<select id="buy-track"><option value="all">Все</option>${trackNames.map(t=>`<option value="${esc(t)}">${esc(names[t]||t)}</option>`).join('')}</select></label><label>Статус<select id="buy-status">${opts(purchaseNames,'all',true)}</select></label></div><p class="ws-muted" id="buy-count" aria-live="polite"></p><div class="ws-table-wrap" tabindex="0" role="region" aria-label="Таблица закупки, можно прокрутить по горизонтали"><table class="ws-table"><thead><tr><th>№</th><th>Позиция / комментарий</th><th>Кол-во</th><th>Стоимость строки</th><th>Личный статус</th><th>Источник</th></tr></thead><tbody id="buy-rows"></tbody></table></div>`;
      const search=br.querySelector('#buy-search'),track=br.querySelector('#buy-track'),filter=br.querySelector('#buy-status');
      function draw(){let state;try{state=app.read()}catch(e){error(br,'procurement',e);return}const q=search.value.trim().toLowerCase();const shown=rows.filter(r=>(track.value==='all'||r.track===track.value)&&(filter.value==='all'||(state.purchases[r.id]?.status||r.status)===filter.value)&&(!q||(r.title+' '+r.note+' '+r.track).toLowerCase().includes(q)));br.querySelector('#buy-count').textContent=`Показано ${shown.length} из ${rows.length} · сумма видимых строк ${money(shown.reduce((s,r)=>s+Number(r.line_total_rub),0))}`;br.querySelector('#buy-rows').innerHTML=shown.map(r=>`<tr><td>${esc(r.original_row)}</td><td><b>${esc(r.title)}</b><small>${esc(r.note||'')}</small></td><td>${esc(r.purchase_quantity)}</td><td>${money(Number(r.line_total_rub))}</td><td><select data-purchase-status="${esc(r.id)}" aria-label="Статус закупки: ${esc(r.title)}">${opts(purchaseNames,state.purchases[r.id]?.status||r.status,false)}</select></td><td><a href="${esc(r.source_url)}" target="_blank" rel="noopener noreferrer">Лот ↗</a></td></tr>`).join('')||'<tr><td colspan="6">Ничего не найдено.</td></tr>'}
      search.addEventListener('input',draw);track.addEventListener('change',draw);filter.addEventListener('change',draw);
      br.addEventListener('change',e=>{if(e.target.dataset.purchaseStatus&&!safe(()=>app.updatePurchase(e.target.dataset.purchaseStatus,{status:e.target.value})))draw()});
      window.addEventListener('linza-state-change',draw);draw();
    }).catch(e=>error(br,'procurement',e));
  }
})();
