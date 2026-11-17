(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const key = 'linza-lab-journal-v1';
  const stages = [...document.querySelectorAll('.stage')];
  const fields = [...document.querySelectorAll('input[id],textarea[id],select[id]')].filter(el => !['import','stage-select'].includes(el.id));
  let points = [], active = 0, storageOK = true;
  function snapshot() {
    const values = {};
    fields.forEach(el => values[el.id] = el.type === 'checkbox' ? el.checked : el.value);
    return {version: 1, values, points, active};
  }
  function save() {
    try { localStorage.setItem(key, JSON.stringify(snapshot())); storageOK = true; }
    catch (_) { storageOK = false; }
    $('save-status').textContent = storageOK ? 'Сохранено в этом браузере' : 'Автосохранение недоступно — скачайте журнал';
    refresh();
  }
  function renderPoints() {
    const body = $('points'); body.replaceChildren();
    points.forEach((point, index) => {
      const tr = document.createElement('tr');
      [['id','text'],['rho','number'],['eps','number'],['frequency','number'],['note','text']].forEach(([name,type]) => {
        const td = document.createElement('td'), input = document.createElement('input');
        input.type = type; input.value = point[name] ?? ''; input.placeholder = {id:'G-01',rho:'0.50',eps:'1.5',frequency:'5',note:'файл / условия'}[name];
        input.setAttribute('aria-label', `${name}, образец ${index + 1}`);
        if (type === 'number') input.step = 'any';
        input.addEventListener('input', () => { points[index][name] = input.value; save(); });
        td.append(input); tr.append(td);
      });
      const td = document.createElement('td'), remove = document.createElement('button');
      remove.textContent = '×'; remove.className = 'remove'; remove.setAttribute('aria-label','Удалить образец');
      remove.addEventListener('click', () => { points.splice(index,1); renderPoints(); save(); });
      td.append(remove); tr.append(td); body.append(tr);
    });
  }
  function restore(data) {
    if (!data || data.version !== 1 || !data.values || !Array.isArray(data.points)) throw new Error('Неверный формат журнала');
    fields.forEach(el => { if (Object.prototype.hasOwnProperty.call(data.values,el.id)) { if (el.type === 'checkbox') el.checked = data.values[el.id] === true; else el.value = String(data.values[el.id]); }});
    points = data.points.map(p => ({id:String(p.id ?? ''),rho:String(p.rho ?? ''),eps:String(p.eps ?? ''),frequency:String(p.frequency ?? ''),note:String(p.note ?? '')}));
    active = Math.max(0, Math.min(stages.length-1, Number(data.active) || 0)); renderPoints(); show(active); save();
  }
  function show(n) {
    active = Math.max(0, Math.min(stages.length-1,n));
    stages.forEach((stage,i) => stage.classList.toggle('active', i === active));
    document.querySelectorAll('.navitem').forEach((el,i) => {el.classList.toggle('active',i === active); el.setAttribute('aria-current',i === active ? 'step' : 'false');});
    $('stage-select').value = String(active); $('step-count').textContent = `${active+1} / ${stages.length}`;
    $('previous').disabled = active === 0; $('next').disabled = active === stages.length - 1;
  }
  function refresh() {
    const checks = [...document.querySelectorAll('.checklist input[type=checkbox]')], done = checks.filter(x=>x.checked).length;
    $('overall').textContent = `${done} / ${checks.length}`; $('progress').style.width = `${100*done/checks.length}%`;
    const mass=Number($('mass').value), width=Number($('sample_width').value), height=Number($('sample_height').value), corner=Number($('sample_corner').value), density=Number($('solid_density').value);
    const volume=(width*width-(4-Math.PI)*corner*corner)*height/1000;
    if (mass>0 && width>0 && height>0 && corner>=0 && corner<=width/2 && density>0 && volume>0) {
      const rho=mass/(volume*density);
      $('density-result').textContent = `Объём габарита: ${volume.toFixed(2)} см³ · ρ ≈ ${rho.toFixed(4)}${rho>1?' — больше 1: проверьте массу, размеры и плотность':''}`;
    } else $('density-result').textContent = 'Введите массу, размеры и измеренную плотность сплошного PLA.';
    const ids=['bg_re','bg_im','base_re','base_im','test_re','test_im'];
    const values=ids.map(id=>$(id).value.trim());
    if(values.every(v=>v!=='' && Number.isFinite(Number(v)))) {
      const [br,bi,ar,ai,tr,ti]=values.map(Number);
      const base=Math.hypot(ar-br,ai-bi), test=Math.hypot(tr-br,ti-bi);
      if(base>0 && test>0){const gain=20*Math.log10(test/base);$('rcs-result').textContent=`Δσ ≈ ${gain.toFixed(2)} дБ · Kσ ≈ ${(test/base)**2 < 1e6 ? ((test/base)**2).toFixed(3) : ((test/base)**2).toExponential(2)}. Проверьте уровень шума и повторы.`;}
      else $('rcs-result').textContent='Один из откликов после вычитания фона равен нулю: отношение не определено.';
    } else $('rcs-result').textContent='Заполните все шесть чисел из одной частотной точки.';
  }
  stages.forEach((stage,i) => {
    const b=document.createElement('button'); b.className='navitem'; b.innerHTML=`<span class="num">${stage.dataset.num}</span><span><strong>${stage.dataset.title}</strong><small>${stage.dataset.sub}</small></span>`;
    b.addEventListener('click',()=>{show(i);save();}); $('nav').append(b);
    const option=document.createElement('option'); option.value=String(i); option.textContent=`${stage.dataset.num} · ${stage.dataset.title}`; $('stage-select').append(option);
  });
  $('stage-select').addEventListener('change',e=>{show(Number(e.target.value));save();});
  $('previous').addEventListener('click',()=>{show(active-1);save();}); $('next').addEventListener('click',()=>{show(active+1);save();window.scrollTo({top:0,behavior:'smooth'});});
  fields.forEach(el => {el.addEventListener('input',save); el.addEventListener('change',save);});
  $('add-point').addEventListener('click',()=>{points.push({id:'',rho:'',eps:'',frequency:$('frequency').value,note:''});renderPoints();save();});
  function download(name, content, type) {const a=document.createElement('a'); const url=URL.createObjectURL(new Blob([content],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  $('export').addEventListener('click',()=>download('linza-lab-journal.json',JSON.stringify(snapshot(),null,2),'application/json'));
  $('import').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{restore(JSON.parse(await file.text()));}catch(err){alert(`Не удалось загрузить: ${err.message}`);}e.target.value='';});
  function calibration() {
    const solid=Number($('solid_eps').value), frequency=Number($('frequency').value);
    if (!(solid>2) || !Number.isFinite(solid)) throw new Error('В шаге 02 укажите ε сплошного PLA больше 2.');
    if (!(frequency>0)) throw new Error('Укажите рабочую частоту в шаге 01.');
    if (points.length<2) throw new Error('Нужны минимум две измеренные точки.');
    const rows=points.map(p=>({rho:Number(p.rho),eps:Number(p.eps),frequency:Number(p.frequency),id:p.id}));
    if (points.some(p=>!p.rho.trim() || !p.eps.trim() || !p.frequency.trim()) || rows.some(p=>!Number.isFinite(p.rho)||!Number.isFinite(p.eps)||!(p.rho>0&&p.rho<1&&p.eps>1&&p.eps<solid)||Math.abs(p.frequency-frequency)>1e-6)) throw new Error('Проверьте точки: 0 < ρ < 1, 1 < ε < ε сплошного PLA; частота каждой точки должна совпадать с рабочей.');
    rows.sort((a,b)=>a.rho-b.rho);
    if(rows.some((p,i)=>i && (p.rho<=rows[i-1].rho || p.eps<=rows[i-1].eps))) throw new Error('ρ и ε должны строго возрастать; усредните повторы и проверьте измерения перед экспортом.');
    return rows;
  }
  $('download-csv').addEventListener('click',()=>{try{const rows=calibration();download('calibration.csv','rho,epsilon_eff\n'+rows.map(p=>`${p.rho},${p.eps}`).join('\n')+'\n','text/csv');$('point-message').textContent='Таблица сохранена. Данные и сырые файлы сохраняйте вместе с журналом.';}catch(e){$('point-message').textContent=e.message;}});
  function result(id,message,error=false){const box=$(id);box.className='result'+(error?' error':'');box.replaceChildren();box.textContent=message;}
  async function generate(kind) {
    const isLens=kind==='lens', button=$(isLens?'generate-lens':'generate-coupon'), target=isLens?'lens-result':'coupon-result';
    try {
      if(location.protocol==='file:') throw new Error('Генерация работает через «Запустить лабораторию.bat». Закройте эту вкладку и откройте страницу через запускной файл.');
      let payload={kind};
      if(isLens){
        const solid=Number($('solid_eps').value);
        if(!(solid>2)) throw new Error('Укажите ε сплошного PLA в шаге 02.');
        payload={kind,diameter:Number($('diameter').value),cell:Number($('cell').value),solid_eps:solid,rho_min:Number($('rho_min').value),rho_max:Number($('rho_max').value),shell:Number($('shell').value),cap:Number($('cap').value),calibrated:$('mode').value==='measured'};
        if(payload.calibrated){if(!$('c33').checked) throw new Error('Подтвердите сопоставимость частоты и ориентации в шаге 04.');payload.points=calibration();}
        else if(!$('solid_source').value.trim()) throw new Error('Укажите источник принятого значения ε в шаге 02.');
      } else payload={kind,fraction:Number($('coupon_fraction').value)/100,cell:Number($('coupon_cell').value)};
      button.disabled=true;result(target,'Считаю геометрию и проверяю STL. Большая линза может занять несколько минут…');
      const response=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const data=await response.json();
      if(!response.ok)throw new Error(data.error||'Ошибка генерации');
      const box=$(target);box.replaceChildren();const a=document.createElement('a');a.href=data.file+'?t='+Date.now();a.textContent='↓ Скачать проверенный STL';a.download='';box.append(a);
      if(data.profile){box.append(' · ');const p=document.createElement('a');p.href=data.profile+'?t='+Date.now();p.textContent='↓ Профиль CSV';box.append(p);}
      const pre=document.createElement('pre');pre.textContent=data.log;box.append(pre);
    } catch(err){result(target,err.message,true);} finally{button.disabled=false;}
  }
  $('generate-coupon').addEventListener('click',()=>generate('coupon'));$('generate-lens').addEventListener('click',()=>generate('lens'));
  try{const data=JSON.parse(localStorage.getItem(key)||'null');if(data)restore(data);else{renderPoints();show(0);refresh();}}catch(_){renderPoints();show(0);refresh();}
})();

