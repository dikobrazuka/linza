/* Shared, browser-local state. Repository JSON is never modified by this module. */
(() => {
  'use strict';
  const KEY='linza-canonical-progress-v1', BACKUP='linza-preserved-v1:';
  const LEGACY=['linza-wbs-v1','linza-budget-v1','linza-budget-reserve-v1','linza-personal-quick-checks-v1'];
  // These are suggestions only: an old action may cover only part of a canonical action.
  const legacyMap={
    inventory:{quick:'stock',wbs:['team_101']}, source_horns:{quick:'horns',wbs:['team_103']},
    fabricate_horns:{quick:'horns',wbs:['team_301']}, calibrate_vna:{quick:'calibrate',wbs:['team_302']},
    pla_design:{quick:'pla-cad',wbs:['team_201']}, pla_coupons:{quick:'pla-coupons',wbs:['team_202']},
    pla_meep:{quick:'pla-model',wbs:['team_204']}, pla_test:{quick:'pla-test',wbs:['team_401']},
    de10_T1:{quick:'de10',wbs:['a313']}, de10_test:{quick:'de10-test',wbs:['team_402']},
    final80_shell:{quick:'shell',wbs:['t5_01']}, final80_model:{quick:'model',wbs:['a1201']},
    cdm_schematic:{quick:'cdm',wbs:['team_502']}, flight_plan:{quick:'flight',wbs:['team_504']},
    report:{quick:'result',wbs:['a1308']}
  };
  const statuses=['planned','doing','blocked','done'];
  const purchaseStatuses=['planned','ordered','received','blocked'];
  const empty=()=>({version:1,actions:{},purchases:{},custom:[]});
  function readRaw(k){try{return localStorage.getItem(k)}catch(_){return null}}
  function read(){
    const raw=readRaw(KEY); if(raw===null)return empty();
    let data;try{data=JSON.parse(raw)}catch(_){throw new Error('Не удалось прочитать локальный прогресс. Данные не заменены; экспортируйте резервную копию браузера.')}
    if(!data||data.version!==1||!data.actions||!data.purchases||!Array.isArray(data.custom))throw new Error('Неизвестный формат локального прогресса. Данные не заменены.');
    return data;
  }
  function backupLegacy(){
    for(const k of LEGACY){const value=localStorage.getItem(k);if(value!==null&&localStorage.getItem(BACKUP+k)===null)localStorage.setItem(BACKUP+k,value)}
  }
  function write(data){backupLegacy();localStorage.setItem(KEY,JSON.stringify(data));window.dispatchEvent(new CustomEvent('linza-state-change'));}
  function updateAction(id,patch){const s=read();s.actions[id]={...(s.actions[id]||{}),...(Object.hasOwn(patch,'status')&&!Object.hasOwn(patch,'quick_previous_status')?{quick_previous_status:null}:{}),...patch};write(s)}
  function updatePurchase(id,patch){const s=read();s.purchases[id]={...(s.purchases[id]||{}),...patch};write(s)}
  function addCustom(title,track){const s=read();const id='local-'+(globalThis.crypto?.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2));s.custom.push({id,title,track,status:'planned',steps:[],document:null,evidence:null});write(s)}
  function renameCustom(id,title){const s=read(),task=s.custom.find(x=>x.id===id);if(!task)throw new Error('Личная задача не найдена');const old=localStorage.getItem(KEY);if(old!==null)localStorage.setItem(BACKUP+'edit-'+Date.now(),old);task.title=title;write(s)}
  function removeCustom(id){const s=read();const old=localStorage.getItem(KEY);if(old!==null)localStorage.setItem(BACKUP+'delete-'+Date.now(),old);s.custom=s.custom.filter(x=>x.id!==id);delete s.actions[id];write(s)}
  function legacyCandidates(id){
    const map=legacyMap[id];if(!map)return[];const out=[];
    try{const q=JSON.parse(readRaw('linza-personal-quick-checks-v1')||'{}');if(map.quick&&q[map.quick]===true)out.push({source:'личная отметка прежнего списка',status:'done',text:map.quick})}catch(_){}
    try{const p=JSON.parse(readRaw('linza-wbs-v1')||'[]');for(const stage of p)for(const task of stage.tasks||[])for(const sub of task.subs||[])for(const a of sub.actions||[])if(map.wbs?.includes(a.id)&&['done','doing','blocked'].includes(a.status))out.push({source:'старая доска',status:a.status,text:a.text,id:a.id})}catch(_){}
    return out;
  }
  async function load(name){
    if(!['project','actions','procurement'].includes(name))throw new Error('Неизвестный источник');
    const r=await fetch('./data/'+name+'.json',{cache:'no-cache'});if(!r.ok)throw new Error('HTTP '+r.status);const d=await r.json();
    const unique=items=>new Set(items.map(x=>x.id)).size===items.length&&items.every(x=>typeof x.id==='string'&&x.id.length>0);
    const pathOk=p=>typeof p==='string'&&p.length>0&&!p.startsWith('/')&&!p.split('/').includes('..');
    if(name==='actions'&&(!Array.isArray(d.actions)||!unique(d.actions)||!d.actions.every(a=>typeof a.title==='string'&&typeof a.track==='string'&&Array.isArray(a.steps)&&a.steps.every(s=>typeof s==='string')&&statuses.includes(a.status)&&pathOk(a.document))))throw new Error('Некорректный список задач');
    if(name==='project'&&(!d.target||!Number.isFinite(d.target.diameter_mm)||!Number.isFinite(d.target.frequency_ghz)||!Array.isArray(d.systems)||!d.systems.every(s=>pathOk(s.document)&&(!s.software||pathOk(s.software)))||!Array.isArray(d.specimens)||!unique(d.specimens)||!d.specimens.every(s=>Number.isFinite(s.diameter_mm)&&Number.isFinite(s.frequency_ghz)&&pathOk(s.document))))throw new Error('Некорректное описание проекта');
    if(name==='procurement'&&(!Array.isArray(d.rows)||!unique(d.rows)||!d.existing_resin_plan||!Number.isFinite(d.existing_resin_plan.estimated_cost_rub)||!Array.isArray(d.other_costs_tbd)||!d.other_costs_tbd.every(x=>typeof x==='string')||!d.rows.every(x=>typeof x.title==='string'&&typeof x.track==='string'&&purchaseStatuses.includes(x.status)&&Number.isFinite(x.line_total_rub)&&x.line_total_rub>=0&&Number.isFinite(x.purchase_quantity)&&typeof x.source_url==='string'&&x.source_url.startsWith('https://'))))throw new Error('Некорректные данные закупки');
    return d;
  }
  function exportData(){const backups={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith(BACKUP))backups[k]=localStorage.getItem(k)}return {type:'linza-local-workspace',version:1,exported_at:new Date().toISOString(),state:read(),legacy:Object.fromEntries(LEGACY.map(k=>[k,readRaw(k)])),backups}}
  function importData(data){
    if(!data||data.type!=='linza-local-workspace'||data.version!==1||!data.state||data.state.version!==1||!data.state.actions||!data.state.purchases||!Array.isArray(data.state.custom))throw new Error('Это не файл экспорта рабочего пространства LINZA');
    const a=data.state.actions,p=data.state.purchases;
    if(Array.isArray(a)||Array.isArray(p)||typeof a!=='object'||typeof p!=='object'||Object.values(a).some(v=>!v||typeof v!=='object'||(v.status&&!statuses.includes(v.status))||(v.evidence!=null&&typeof v.evidence!=='string')||(v.assignee!=null&&typeof v.assignee!=='string')||(v.steps!=null&&(typeof v.steps!=='object'||Array.isArray(v.steps)))))throw new Error('Повреждённый формат статусов задач');
    if(Object.values(p).some(v=>!v||typeof v!=='object'||(v.status&&!purchaseStatuses.includes(v.status)))||data.state.custom.some(v=>!v||typeof v.id!=='string'||!v.id.startsWith('local-')||typeof v.title!=='string'||typeof v.track!=='string'||!Array.isArray(v.steps)||!v.steps.every(s=>typeof s==='string')||!statuses.includes(v.status)||v.document!==null)||new Set(data.state.custom.map(x=>x.id)).size!==data.state.custom.length)throw new Error('Повреждённый формат закупок или личных задач');
    backupLegacy();const old=localStorage.getItem(KEY);if(old!==null)localStorage.setItem(BACKUP+'import-'+Date.now(),old);
    // Fill missing legacy data on a new device, but never replace existing legacy keys.
    if(data.legacy&&typeof data.legacy==='object')for(const k of LEGACY){const incoming=data.legacy[k],current=localStorage.getItem(k);if(typeof incoming==='string'){if(current===null)localStorage.setItem(k,incoming);else if(current!==incoming)localStorage.setItem(BACKUP+'incoming-'+Date.now()+':'+k,incoming)}}
    if(data.backups&&typeof data.backups==='object')for(const [k,v] of Object.entries(data.backups)){if(k.startsWith(BACKUP)&&typeof v==='string'&&localStorage.getItem(k)===null)localStorage.setItem(k,v)}
    localStorage.setItem(KEY,JSON.stringify(data.state));window.dispatchEvent(new CustomEvent('linza-state-change'));
  }
  window.Linza={KEY,legacyMap,statuses,purchaseStatuses,read,load,updateAction,updatePurchase,addCustom,renameCustom,removeCustom,legacyCandidates,exportData,importData,backupLegacy};
  window.addEventListener('storage',e=>{if(e.key===KEY||LEGACY.includes(e.key))window.dispatchEvent(new CustomEvent('linza-state-change'))});
  window.addEventListener('linza-legacy-change',()=>window.dispatchEvent(new CustomEvent('linza-state-change')));
})();
