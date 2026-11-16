(() => {
  'use strict';
  const SVG='http://www.w3.org/2000/svg';
  const doc=document;
  const $=id=>doc.getElementById(id);
  const storageKey='linza-radar-assembly-checked-v1';
  const pinHelp={
    opa:{
      1:{label:'OUT A',net:'OUTA',text:'Выход первого каскада. Сюда припаять R5 100 кОм (обратная связь к pin 2) и C4 100 нФ (на вход B).'},
      2:{label:'IN− A',net:'FBA',text:'Инвертирующий вход A. R4 10 кОм на VREF, R5 100 кОм на выход pin 1. Не подключать к GND напрямую.'},
      3:{label:'IN+ A',net:'INA',text:'Вход A. C3 100 нФ от радарного IF, R3 33 кОм от этой точки к VREF.'},
      4:{label:'V− / GND',net:'GND',text:'Общая земля. Соединить с Pico AGND (физическая ножка 33) и всеми земляными точками усилителя.'},
      5:{label:'IN+ B',net:'INB',text:'Вход B. Через C4 100 нФ приходит сигнал с pin 1; R6 33 кОм к VREF.'},
      6:{label:'IN− B',net:'FBB',text:'Инвертирующий вход B: R7 10 кОм к VREF и R8 100 кОм к выходу pin 7.'},
      7:{label:'OUT B',net:'OUTB',text:'Выход второго каскада. R8 100 кОм к pin 6; R9 3,3 кОм к узлу N_ADC.'},
      8:{label:'V+ / 3V3',net:'3V3',text:'Питание OPA2365 от Pico pin 36: 3,3 В. Конденсаторы C6 100 нФ и C7 10 мкФ между 3V3 и GND рядом с U1.'}
    },
    pico:{
      40:{label:'VBUS / USB 5 В',net:null,text:'Это 5 В USB! Не соединяй напрямую с U1 pin 8, VREF или GP26. Питание CDM324 через VBUS — только при подтверждённом 5 В для конкретного модуля и проверенном токе.'},
      36:{label:'3V3(OUT)',net:'3V3',text:'Физический контакт 36, от него короткий провод питания 3,3 В на шину платы и ножку 8 OPA2365.'},
      33:{label:'AGND',net:'GND',text:'Физический контакт 33, общая аналоговая земля платы: соединить с U1 pin 4 и оплёткой RG174.'},
      31:{label:'GP26 / ADC0',net:'ADC',text:'Физическая ножка 31, аналоговый вход Pico. Припаять провод от N_ADC (после R9 и в точке C5) только после проверки сигнала 0–3,3 В осциллографом.'}
    }
  };
  function svgEl(type,attrs={},text){
    const node=doc.createElementNS(SVG,type);
    for(const [k,v] of Object.entries(attrs))node.setAttribute(k,String(v));
    if(text!=null)node.textContent=String(text);
    return node;
  }
  function pinDetails(device,pin) {
    const data=pinHelp[device][pin];
    if(!data)return;
    const panel=$('selected-pin');
    panel.replaceChildren();
    const title=doc.createElement('strong');
    title.textContent=(device==='opa'?'OPA2365':'Pico')+' · ножка '+pin+' — '+data.label+'. ';
    panel.append(title,doc.createTextNode(data.text));
    doc.querySelectorAll('.pin-svg .pin-control').forEach(n=>n.classList.toggle('active',n.dataset.device===device && Number(n.dataset.pin)===pin));
    if(data.net)chooseNet(data.net);
  }
  function addInteractivePin(group,device,pin,x,y,side,label,fill){
    const g=svgEl('g',{'class':'pin-control','role':'button','tabindex':'0','aria-label':device+' pin '+pin+': '+label,'data-device':device,'data-pin':pin});
    const rx=side==='left'?x-17:x, tx=side==='left'?x-28:x+28;
    g.append(svgEl('rect',{x:rx,y:y-10,width:17,height:20,rx:3,fill,stroke:'#9eafbd','stroke-width':1.3}));
    g.append(svgEl('text',{x:tx,y:y+5,'text-anchor':side==='left'?'end':'start',fill:'#e7f0f6','font-size':12,'font-weight':700},pin+' '+label));
    g.addEventListener('click',()=>pinDetails(device,pin));
    g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pinDetails(device,pin)}});
    group.append(g);
  }
  const opaLeft=[[1,'OUT A'],[2,'IN− A'],[3,'IN+ A'],[4,'GND']];
  const opaRight=[[8,'3V3'],[7,'OUT B'],[6,'IN− B'],[5,'IN+ B']];
  const colors={3V3:'#edac7c',GND:'#95aabb',ADC:'#93b0ff',OUTA:'#88e3c6',OUTB:'#88e3c6'};
  const opag=$('opa-pins');
  opaLeft.forEach(([p,name],i)=>addInteractivePin(opag,'opa',p,144,82+i*50,'left',name,colors[pinHelp.opa[p].net]||'#a7c8d2'));
  opaRight.forEach(([p,name],i)=>addInteractivePin(opag,'opa',p,314,82+i*50,'right',name,colors[pinHelp.opa[p].net]||'#a7c8d2'));
  const pg=$('pico-pins');
  const pr={40:'VBUS 5V',36:'3V3 OUT',33:'AGND',31:'GP26 ADC0'};
  for(let p=40;p>=31;p--){
    const y=69+(40-p)*22.2;
    if(pinHelp.pico[p])addInteractivePin(pg,'pico',p,310,y,'right',pr[p],pinHelp.pico[p].net?colors[pinHelp.pico[p].net]:'#e9b47d');
    else {
      pg.append(svgEl('rect',{x:310,y:y-9,width:17,height:18,rx:2,fill:'#779f8e'}));
      pg.append(svgEl('text',{x:335,y:y+4,'font-size':11,fill:'#bbd2d0'},String(p)));
    }
    pg.append(svgEl('rect',{x:129,y:y-9,width:17,height:18,rx:2,fill:'#779f8e'}));
  }
  let data=null;
  function chooseNet(id){
    if(!data)return;
    const net=data.nets.find(n=>n.id===id);if(!net)return;
    const name=$('net-name'),description=$('net-description'),members=$('net-members');
    name.textContent=net.label;name.style.color=net.color;
    description.textContent=net.description;members.replaceChildren();
    for(const m of net.members){const li=doc.createElement('li');li.textContent=m;members.append(li)}
    $('net-controls').querySelectorAll('[data-net]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.net===id)));
  }
  function loadProgress(){
    try{
      const value=JSON.parse(localStorage.getItem(storageKey)||'[]');
      if(Array.isArray(value))return new Set(value.filter(v=>Number.isInteger(v)&&v>=1&&v<=32));
    }catch(_){}
    return new Set();
  }
  let checked=loadProgress();
  function saveProgress(){
    try{localStorage.setItem(storageKey,JSON.stringify([...checked].sort((a,b)=>a-b)));}
    catch(_){const title=$('progress-text');title.title='В этом браузере отметки сохранить не удалось'}
  }
  function updateProgress(){
    const p=$('progress-text'),bar=$('progress-bar');
    p.textContent=checked.size+' / 32';bar.style.width=(checked.size/32*100)+'%';
    doc.querySelectorAll('.stage[data-start]').forEach(stage=>{
      const a=Number(stage.dataset.start),b=Number(stage.dataset.end);
      const count=Array.from({length:b-a+1},(_,i)=>a+i).filter(v=>checked.has(v)).length;
      stage.querySelector('.stage-count').textContent=count+' / '+(b-a+1);
    });
  }
  function cleanMd(s){
    return String(s).replace(/\*\*/g,'').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/\`/g,'').replace(/\\/g,'');
  }
  function render(data){
    const controls=$('net-controls');controls.replaceChildren();
    for(const n of data.nets){
      const button=doc.createElement('button');button.type='button';button.dataset.net=n.id;
      button.style.setProperty('--net-color',n.color);
      button.setAttribute('aria-pressed','false');button.textContent=n.label;
      button.addEventListener('click',()=>chooseNet(n.id));controls.append(button);
    }
    chooseNet('3V3');
    const root=$('steps-root');root.replaceChildren();
    for(const g of data.stages){
      const details=doc.createElement('details');details.className='stage';details.dataset.start=g.range[0];details.dataset.end=g.range[1];details.open=g.range[0]===1;
      const summary=doc.createElement('summary');const num=doc.createElement('span');num.className='stage-number';num.textContent=String(g.range[0]).padStart(2,'0')+'–'+String(g.range[1]).padStart(2,'0');
      const mid=doc.createElement('span');mid.className='stage-title';const b=doc.createElement('b');b.textContent=g.name;const small=doc.createElement('small');small.textContent=g.steps.length+' действий · открой, чтобы увидеть конкретные подключения';mid.append(b,small);
      const count=doc.createElement('span');count.className='stage-count';summary.append(num,mid,count);
      details.append(summary);
      const content=doc.createElement('div');content.className='stage-content';
      const checkpoint=doc.createElement('p');checkpoint.className='stage-checkpoint';checkpoint.textContent='Проверка этапа: '+g.checkpoint;content.append(checkpoint);
      for(const step of g.steps){
        const row=doc.createElement('div');row.className='step';
        const id='radar-step-'+step.number;
        const cb=doc.createElement('input');cb.type='checkbox';cb.id=id;cb.checked=checked.has(step.number);
        row.classList.toggle('checked',cb.checked);
        const label=doc.createElement('label');label.htmlFor=id;
        const heading=doc.createElement('b');heading.textContent='ДЕЙСТВИЕ '+String(step.number).padStart(2,'0');
        const text=doc.createElement('div');text.className='step-text';text.textContent=cleanMd(step.text);
        label.append(heading,text);row.append(cb,label);content.append(row);
        cb.addEventListener('change',()=>{
          if(cb.checked)checked.add(step.number);else checked.delete(step.number);
          row.classList.toggle('checked',cb.checked);saveProgress();updateProgress();
        });
      }
      details.append(content);root.append(details);
    }
    updateProgress();
  }
  $('reset-progress').addEventListener('click',()=>{
    if(!confirm('Сбросить только 32 локальные отметки сборки радара? Остальные задачи проекта не изменятся.'))return;
    checked.clear();saveProgress();
    $('steps-root').querySelectorAll('.step').forEach(x=>{x.classList.remove('checked');x.querySelector('input').checked=false});updateProgress();
  });
  fetch('./data/radar-assembly.json',{cache:'no-cache'})
    .then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()})
    .then(value=>{
      if(!value||!Array.isArray(value.stages)||!Array.isArray(value.nets)||value.stages.flatMap(s=>s.steps).length!==32)throw new Error('Некорректная версия данных сборки');
      data=value;render(value);
    })
    .catch(err=>{
      $('steps-root').replaceChildren();
      const p=doc.createElement('p');p.textContent='Не удалось загрузить 32 действия: '+err.message+'. ';
      const link=doc.createElement('a');link.href='https://github.com/dikobrazuka/linza/blob/main/electronics/05_BUILD_CDM324_STEP_BY_STEP.md';link.textContent='Открой полный текст на GitHub ↗';
      p.append(link);$('steps-root').append(p);
    });
})();