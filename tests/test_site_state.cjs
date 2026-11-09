const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname,'..');
const source = fs.readFileSync(path.join(root,'site/site-state.js'),'utf8');
const load = name => JSON.parse(fs.readFileSync(path.join(root,'site/data',name+'.json'),'utf8'));

function environment(initial={}, failKey=null, fetcher=async()=>({ok:false,status:404})) {
  const values=new Map(Object.entries(initial)), events=[];
  const localStorage={
    get length(){return values.size}, key:i=>[...values.keys()][i]??null,
    getItem:key=>values.has(key)?values.get(key):null,
    setItem:(key,value)=>{if(key===failKey)throw new Error('quota');values.set(key,String(value));}
  };
  const window={dispatchEvent:e=>events.push(e.type),addEventListener:()=>{}};
  const context={window,localStorage,CustomEvent:class{constructor(type){this.type=type}},fetch:fetcher,crypto:{randomUUID:()=> 'test-uuid'},console};
  vm.createContext(context);vm.runInContext(source,context);
  return {app:window.Linza,values,events};
}

test('data contract keeps three specimens and line totals, not quantity multiplication',()=>{
  const project=load('project'), procurement=load('procurement'), actions=load('actions').actions;
  assert.deepEqual(project.specimens.map(x=>[x.id,x.diameter_mm,x.frequency_ghz]),[['pla200',200,5],['de10_120',120,5],['customer80',80,24]]);
  assert.equal(procurement.rows.length,32);assert.equal(procurement.rows.reduce((n,r)=>n+r.line_total_rub,0),24267);
  assert.equal(procurement.existing_resin_plan.estimated_cost_rub,14000);
  assert(procurement.rows.every(r=>r.status==='planned'&&r.ordered_at===null&&r.received_at===null));
  assert.equal(new Set(actions.map(x=>x.id)).size,actions.length);
  assert(actions.every(x=>fs.existsSync(path.join(root,x.document))));
});

test('legacy mappings are explicit suggestions and never silently change canonical status',()=>{
  const old=JSON.stringify([{id:'S6',tasks:[{subs:[{actions:[{id:'team_201',text:'Моя исправленная задача',status:'done'}]}]}]}]);
  const quick=JSON.stringify({'pla-cad':true});
  const {app,values}=environment({'linza-wbs-v1':old,'linza-personal-quick-checks-v1':quick});
  assert.equal(app.legacyMap.pla_design.quick,'pla-cad');assert(app.legacyMap.pla_design.wbs.includes('team_201'));
  const ids=new Set(load('actions').actions.map(x=>x.id));assert(Object.keys(app.legacyMap).every(id=>ids.has(id)));
  const candidates=app.legacyCandidates('pla_design');assert.equal(candidates.length,2);assert.equal(candidates[1].text,'Моя исправленная задача');
  assert.equal(app.read().actions.pla_design,undefined);assert.equal(values.get('linza-wbs-v1'),old);
  app.updateAction('pla_design',{status:'doing',steps:{0:true},evidence:'фото'});
  assert.equal(values.get('linza-wbs-v1'),old);assert.equal(values.get('linza-preserved-v1:linza-wbs-v1'),old);
  assert.equal(values.get('linza-preserved-v1:linza-personal-quick-checks-v1'),quick);
  assert.equal(app.read().actions.pla_design.status,'doing');assert.equal(app.read().actions.pla_design.evidence,'фото');
});

test('purchase status is separate, local changes survive read and export',()=>{
  const {app}=environment();app.updateAction('inventory',{status:'blocked'});app.updatePurchase('H002',{status:'ordered'});
  const s=app.read();assert.equal(s.actions.inventory.status,'blocked');assert.equal(s.purchases.H002.status,'ordered');
  assert.equal(app.exportData().state.purchases.H002.status,'ordered');
});

test('import backs up current state and does not overwrite existing legacy data',()=>{
  const old='{"custom":"старое"}', existing='[{"id":"my-old-work"}]';
  const {app,values}=environment({'linza-wbs-v1':existing,'linza-budget-v1':old});
  app.updateAction('pla_design',{status:'doing'});
  app.importData({type:'linza-local-workspace',version:1,state:{version:1,actions:{pla_design:{status:'done'}},purchases:{},custom:[]},legacy:{'linza-wbs-v1':'[]','linza-budget-v1':'[]','linza-budget-reserve-v1':'15'}});
  assert.equal(values.get('linza-wbs-v1'),existing);assert.equal(values.get('linza-budget-v1'),old);assert.equal(values.get('linza-budget-reserve-v1'),'15');
  assert([...values.keys()].some(k=>k.startsWith('linza-preserved-v1:incoming-')&&k.endsWith('linza-wbs-v1')));
  assert(Object.keys(app.exportData().backups).some(k=>k.startsWith('linza-preserved-v1:incoming-')));
  assert([...values.keys()].some(k=>k.startsWith('linza-preserved-v1:import-')));assert.equal(app.read().actions.pla_design.status,'done');
  assert.throws(()=>app.importData({type:'linza-local-workspace',version:1,state:{version:1,actions:{x:{status:'invented'}},purchases:{},custom:[]}}));
});

test('failed backup does not overwrite old data or create new progress',()=>{
  const original='[{"id":"important"}]';const {app,values}=environment({'linza-wbs-v1':original},'linza-preserved-v1:linza-wbs-v1');
  assert.throws(()=>app.updateAction('pla_design',{status:'done'}),/quota/);
  assert.equal(values.get('linza-wbs-v1'),original);assert.equal(values.has(app.KEY),false);
});

test('custom action survives reload and missing JSON reports an error',async()=>{
  const {app,values}=environment();app.addCustom('Моя задача','Общее');assert.equal(app.read().custom[0].title,'Моя задача');
  const id=app.read().custom[0].id;app.renameCustom(id,'Новое название');assert.equal(app.read().custom[0].title,'Новое название');assert([...values.keys()].some(k=>k.startsWith('linza-preserved-v1:edit-')));
  await assert.rejects(app.load('actions'),/HTTP 404/);
});

test('JSON loader validates source data and rejects malformed project files',async()=>{
  const data=load('actions');let requested='';
  const {app}=environment({},null,async url=>{requested=url;return {ok:true,json:async()=>data}});
  const result=await app.load('actions');assert.equal(requested,'./data/actions.json');assert.equal(result.actions.length,24);
  data.actions[0].steps=null;await assert.rejects(app.load('actions'),/Некорректный список задач/);
  await assert.rejects(app.load('../x'),/Неизвестный источник/);
});
