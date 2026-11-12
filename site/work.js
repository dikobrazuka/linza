(() => {
  'use strict';
  const app=window.Linza, base='https://github.com/dikobrazuka/linza/blob/main/';
  const list=document.getElementById('worklist'), more=document.getElementById('show-more');
  const note=document.getElementById('local-note'), filters=document.getElementById('work-filters');
  const labels={planned:'Запланировано',doing:'В работе',blocked:'Заблокировано',done:'Лично отмечено'};
  let selected='all',expanded=false,actions=[];
  function failure(root,name,error){root.replaceChildren();const p=document.createElement('p');p.textContent='Не удалось загрузить данные: '+error.message+'. ';const a=document.createElement('a');a.href=base+'site/data/'+name+'.json';a.textContent='Открыть данные на GitHub ↗';p.append(a);root.append(p)}
  function updateFilter(){let count=0;for(const card of list.children){const match=selected==='all'||card.dataset.track===selected;card.hidden=!match||(selected==='all'&&!expanded&&count>=5);if(match)count++}more.hidden=selected!=='all'||expanded||count<=5;more.textContent=`Показать ещё ${Math.max(0,count-5)} задач ↓`;for(const b of filters.querySelectorAll('[data-filter]'))b.setAttribute('aria-pressed',String(b.dataset.filter===selected));}
  function renderTasks(){
    let state;try{state=app.read()}catch(e){failure(list,'actions',e);return}
    const open=new Set([...list.querySelectorAll('article[data-id] details[open]')].map(detail=>detail.parentElement.dataset.id));
    list.replaceChildren();
    for(const task of [...actions,...state.custom]){
      const local=state.actions[task.id]||{},status=local.status||task.status;
      const card=document.createElement('article');card.className='task';card.dataset.track=task.track;card.dataset.id=task.id;
      const check=document.createElement('input');check.type='checkbox';check.className='check';check.checked=status==='done';check.setAttribute('aria-label','Лично отметить: '+task.title);
      check.addEventListener('change',()=>{try{const current=app.read().actions[task.id]||{};const previous=current.quick_previous_status;app.updateAction(task.id,check.checked?{status:'done',quick_previous_status:current.status||task.status}:{status:app.statuses.includes(previous)&&previous!=='done'?previous:(task.status==='done'?'planned':task.status),quick_previous_status:null})}catch(e){check.checked=!check.checked;note.textContent='Не удалось сохранить: '+e.message}});
      const detail=document.createElement('details'), summary=document.createElement('summary'),name=document.createElement('span');detail.open=open.has(task.id);
      const title=document.createElement('strong');title.textContent=task.title;const small=document.createElement('small');small.textContent=task.track+' · '+(labels[status]||status);name.append(title,small);
      const tag=document.createElement('span');tag.className='tag';tag.textContent=task.track;const plus=document.createElement('span');plus.className='plus';plus.setAttribute('aria-hidden','true');plus.textContent='+';summary.append(name,tag,plus);detail.append(summary);
      const body=document.createElement('div');body.className='taskbody';
      const statusLabel=document.createElement('label');statusLabel.className='task-status';statusLabel.textContent='Личный статус ';
      const statusSelect=document.createElement('select');statusSelect.setAttribute('aria-label','Личный статус: '+task.title);
      for(const [value,text] of Object.entries(labels)){const option=document.createElement('option');option.value=value;option.textContent=text;option.selected=value===status;statusSelect.append(option)}
      statusSelect.addEventListener('change',()=>{try{app.updateAction(task.id,{status:statusSelect.value})}catch(e){statusSelect.value=status;note.textContent='Не удалось сохранить: '+e.message}});statusLabel.append(statusSelect);body.append(statusLabel);
      const ol=document.createElement('ol');for(const step of task.steps){const li=document.createElement('li');li.textContent=step;ol.append(li)}
      if(task.document){const source=document.createElement('a');source.href=base+task.document;source.textContent='Открыть инструкцию ↗';source.target='_blank';source.rel='noopener noreferrer';body.append(ol,source)}else body.append(ol);
      const manage=document.createElement('p');const board=document.createElement('a');board.href='./board.html#action-'+encodeURIComponent(task.id);board.textContent='Статус, шаги и материалы на доске ↗';manage.append(board);
      body.append(manage);detail.append(body);card.append(check,detail);list.append(card);
    }
    updateFilter();
  }
  filters.addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(b){selected=b.dataset.filter;updateFilter()}});
  more.addEventListener('click',()=>{expanded=true;updateFilter()});
  app.load('actions').then(data=>{if(!Array.isArray(data.actions))throw new Error('Некорректный список задач');actions=data.actions;for(const [id,label] of [['all','Все задачи'],...[...new Set(actions.map(a=>a.track))].map(x=>[x,x])]){const b=document.createElement('button');b.type='button';b.className='tab';b.dataset.filter=id;b.textContent=label;filters.append(b)}renderTasks()}).catch(e=>failure(list,'actions',e));
  window.addEventListener('linza-state-change',renderTasks);
  const designs=document.getElementById('design-cards');
  app.load('project').then(data=>{
    if(!Array.isArray(data.specimens)||!data.target)throw new Error('Некорректное описание проекта');
    document.getElementById('target-diameter').textContent='Ø'+data.target.diameter_mm+' мм';
    document.getElementById('target-frequency').textContent=data.target.frequency_ghz+' ГГц';
    designs.replaceChildren();
    for(const item of data.specimens){
      const card=document.createElement('article');card.className='design';
      const art=document.createElement('div');art.className='design-art';art.setAttribute('aria-hidden','true');art.innerHTML='<svg viewBox="0 0 150 125"><circle cx="75" cy="62" r="42" fill="#a3dfc5" fill-opacity=".12" stroke="#b7f0d3" stroke-width="2"/><ellipse cx="75" cy="62" rx="20" ry="42" fill="none" stroke="#b7f0d3" stroke-opacity=".5"/><path d="M33 62h84 M42 42h66 M42 82h66" stroke="#b7f0d3" stroke-opacity=".4"/><path d="M105 32A42 42 0 0 1 105 92" fill="none" stroke="#f3bf83" stroke-width="4"/></svg>';
      const info=document.createElement('div');info.className='design-info';const top=document.createElement('div');top.className='design-top';const h=document.createElement('h3');h.textContent='Ø'+item.diameter_mm+' мм';const f=document.createElement('em');f.textContent=item.frequency_ghz+' ГГц';top.append(h,f);const p=document.createElement('p');p.textContent=item.material+' · '+item.route;const a=document.createElement('a');a.href=base+item.document;a.textContent='Методика и ограничения ↗';a.target='_blank';a.rel='noopener noreferrer';info.append(top,p,a);card.append(art,info);designs.append(card);
    }
  }).catch(e=>failure(designs,'project',e));
})();
