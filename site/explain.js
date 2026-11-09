/* LINZA explanatory page. All graphics are illustrative, not measured results. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const fmt = (n, digits = 2) => n.toLocaleString('ru-RU', {minimumFractionDigits: digits, maximumFractionDigits: digits});
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reducedMotion.matches;
  let rayMode = 'reflector';
  let lensView = 'whole';
  const SVG_NS = 'http://www.w3.org/2000/svg';
  function svgNode(tag, attributes) {
    const node = document.createElementNS(SVG_NS, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  }
  function selectButtons(selector, chosen) {
    document.querySelectorAll(selector).forEach(button => {
      const selected = button === chosen;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }
  function updateMotion() {
    document.body.classList.toggle('paused', paused);
    $('motion-toggle').textContent = paused ? 'Включить анимацию' : 'Пауза анимации';
    $('motion-toggle').setAttribute('aria-pressed', String(paused));
  }
  $('motion-toggle').addEventListener('click', () => { paused = !paused; updateMotion(); });
  reducedMotion.addEventListener('change', event => { paused = event.matches; updateMotion(); });
  updateMotion();

  // Exact ray trajectories inside the ideal geometrical-optics Luneburg profile:
  // q(t) = q_entry*cos(t) + (1,0)*sin(t), 0 <= t <= pi/2.
  // This does not model wave diffraction, losses or the printed microstructure.
  let rayTracks = [];
  function makeRays() {
    $('ray-paths').replaceChildren();
    $('ray-dots').replaceChildren();
    rayTracks = [];
    const cx = 410, cy = 200, radius = 142;
    for (const impact of [-0.84, -0.56, -0.28, 0, 0.28, 0.56, 0.84]) {
      const entryX = -Math.sqrt(1 - impact * impact);
      const points = [[45, cy + impact * radius], [cx + entryX * radius, cy + impact * radius]];
      for (let i = 1; i <= 48; i++) {
        const t = i / 48 * Math.PI / 2;
        points.push([cx + radius * (entryX * Math.cos(t) + Math.sin(t)), cy + radius * impact * Math.cos(t)]);
      }
      const inbound = svgNode('path', {d: 'M' + points.map(p => p.join(',')).join('L'), fill: 'none', stroke: '#86e7d3', 'stroke-width': 1.6, opacity: .72});
      $('ray-paths').append(inbound);
      let outgoing;
      if (rayMode === 'reflector') {
        const back = points.map(([x, y]) => [x, 2 * cy - y]).reverse();
        outgoing = svgNode('path', {d: 'M' + back.map(p => p.join(',')).join('L'), fill: 'none', stroke: '#efbd83', 'stroke-width': 1.7, 'stroke-dasharray': '5 7', opacity: .8});
      } else {
        const dx = Math.sqrt(1 - impact * impact);
        const length = Math.min(220 / dx, impact === 0 ? 1000 : 168 / Math.abs(impact));
        outgoing = svgNode('path', {d: `M${cx + radius},${cy}L${cx + radius + dx * length},${cy - impact * length}`, fill: 'none', stroke: '#86e7d3', 'stroke-width': 1.5, opacity: .6});
      }
      $('ray-paths').append(outgoing);
      const dot = svgNode('circle', {r: 3.4, fill: '#d6fff3'});
      $('ray-dots').append(dot);
      rayTracks.push({inbound, outgoing, inLength: inbound.getTotalLength(), outLength: outgoing.getTotalLength(), dot});
    }
    $('ray-cap').style.display = rayMode === 'reflector' ? '' : 'none';
    $('return-label').textContent = rayMode === 'reflector' ? '← Отражённая волна' : 'За фокусом волна расходится →';
    $('ray-heading').textContent = rayMode === 'reflector' ? 'Линза + отражатель' : 'Линза без отражателя';
    drawRays(1.3);
  }
  function drawRays(time) {
    const progress = (time * .22) % 1;
    for (const track of rayTracks) {
      const incoming = progress < .5;
      const point = incoming ? track.inbound.getPointAtLength(progress * 2 * track.inLength) : track.outgoing.getPointAtLength((progress - .5) * 2 * track.outLength);
      track.dot.setAttribute('cx', point.x);
      track.dot.setAttribute('cy', point.y);
      track.dot.setAttribute('fill', incoming || rayMode === 'lens' ? '#c7fff0' : '#ffd7a4');
    }
  }
  document.querySelectorAll('[data-ray-mode]').forEach(button => button.addEventListener('click', () => {
    rayMode = button.dataset.rayMode;
    selectButtons('[data-ray-mode]', button);
    makeRays();
  }));
  makeRays();

  function setScale(diameter) {
    const equivalent = diameter * 5 / 24;
    $('scale-d').textContent = `Ø${fmt(diameter, 0)} мм`;
    $('scale-equivalent').textContent = `Ø${fmt(equivalent, equivalent % 1 === 0 ? 0 : 2)} мм`;
    $('scale-electric').textContent = `D/λ ≈ ${fmt(diameter * 5 / 299.792458)}`;
    $('scale-circle').setAttribute('r', 60 * equivalent / 80);
    $('scale-verdict').textContent = diameter === 384
      ? 'Ø384 мм на 5 ГГц имеет то же D/λ, что Ø80 мм на 24 ГГц. Это строгий масштаб по геометрии; подобие материала и потерь всё равно нужно обосновать. Такой крупный опыт не обязателен.'
      : diameter === 200
        ? 'Ø200 мм на 5 ГГц — отдельный PLA/FDM-опыт. Свойства материала и конструкции проверяются; результат не переносится автоматически на заказную Ø80 мм / 24 ГГц.'
        : `Ø${diameter} мм на 5 ГГц проверяет материал, изготовление и расчётную модель. Его результат нельзя автоматически перенести на Ø80 мм при 24 ГГц.`;
  }
  document.querySelectorAll('[data-scale-d]').forEach(button => button.addEventListener('click', () => {
    selectButtons('[data-scale-d]', button);
    setScale(Number(button.dataset.scaleD));
  }));
  setScale(120);

  function updateStand() {
    const diameterM = Number($('stand-diameter').value) / 1000;
    const distance = Number($('stand-range').value);
    const farField = 2 * diameterM ** 2 / (299792458 / 5e9);
    $('stand-range-output').textContent = `${fmt(distance, 1)} м`;
    $('stand-distance-label').textContent = `R = ${fmt(distance, 1)} м`;
    $('ff-value').textContent = `≈ ${fmt(farField)} м`;
    const pass = distance >= farField;
    $('ff-status').textContent = pass ? 'Дистанция больше оценки по объекту' : 'Дистанция меньше оценки по объекту';
    $('ff-value').parentElement.classList.toggle('warning', !pass);
  }
  $('stand-range').addEventListener('input', updateStand);
  $('stand-diameter').addEventListener('change', updateStand);
  updateStand();

  const stateData = {
    background: ['BACKGROUND', 'Пустой держатель: измеряем фон', 'Сохраняем отклик помещения, кабелей, прямой связи TX–RX и пустого держателя. Для сравниваемых объектов сохраняем одинаковую опору; при смене крепления проверяем фон заново.', 'BACKGROUND_000_R01.s2p'],
    reference: ['REFERENCE', 'Сфера с известной ЭПР', 'Проверяем уровень сигнала и калибруем абсолютную ЭПР. Для сферы на выбранной частоте используем рассчитанную ЭПР, а не автоматически площадь πr².', 'REFERENCE_000_R01.s2p'],
    baseline: ['BASELINE', 'Тот же колпачок без линзы', 'Сохраняем положение, форму и ориентацию металлического отражателя. Воспроизводимое крепление нужно заранее: иначе вместе с линзой изменится и база сравнения.', 'BASELINE_000_R01.s2p'],
    lens: ['LENS_NO_REFLECTOR', 'Линза без металлического колпачка', 'Дополнительный контроль показывает рассеяние самого диэлектрика. Он помогает отделить работу полной сборки от отклика линзы без отражателя.', 'LENS_NO_REFLECTOR_000_R01.s2p'],
    test: ['NO_SHELL', 'Линза + отражатель без корпуса', 'Сначала измеряем линзу без защитного корпуса. Отражатель, центр линзы и держатель должны сохранять своё положение при следующем сравнении.', 'LENS_REFLECTOR_NO_SHELL_000_R01.s2p'],
    shell: ['SHELL_OPEN', 'Линза + отражатель + корпус', 'Тот же объект с временно установленной оболочкой PLA-Aero Pro. Сравниваем комплексный отклик с измерением без корпуса и отдельно с базовым отражателем.', 'LENS_REFLECTOR_SHELL_OPEN_000_R01.s2p'],
    joined: ['SHELL_JOINED', 'Корпус с окончательным швом', 'Повторяем ту же геометрию после окончательного соединения. Сравнение с временной сборкой показывает влияние шва и клея при контроле переустановки.', 'LENS_REFLECTOR_SHELL_JOINED_000_R01.s2p'],
    repeat: ['DRIFT CHECK', 'Повторяем эталон и фон', 'После серии снова измеряем сферу и пустой держатель. Изменение амплитуды и фазы покажет дрейф стенда. Это дополняет ≥3 независимые установки базы и теста.', 'REFERENCE_REPEAT.s2p + BACKGROUND_REPEAT.s2p']
  };
  function objectMarkup(state, cx, cy, r) {
    const sphere = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#21534e" stroke="#86e7d3" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="${r * .6}" fill="none" stroke="#86e7d3" opacity=".22"/><circle cx="${cx}" cy="${cy}" r="${r * .3}" fill="none" stroke="#86e7d3" opacity=".22"/>`;
    const cap = `<path d="M${cx + r * .5} ${cy - r * .866}A${r} ${r} 0 0 1 ${cx + r * .5} ${cy + r * .866}" fill="none" stroke="#efbd83" stroke-width="7" stroke-linecap="round"/>`;
    if (state === 'background') return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#586c7c" stroke-dasharray="4 6"/><text x="${cx}" y="${cy + 5}" text-anchor="middle" class="svg-small">Пусто</text>`;
    if (state === 'reference' || state === 'repeat') return `<circle cx="${cx}" cy="${cy}" r="${r * .75}" fill="#617582" stroke="#bdcdd6" stroke-width="2"/><ellipse cx="${cx - r * .22}" cy="${cy - r * .25}" rx="${r * .2}" ry="${r * .14}" fill="#d1e0e7" opacity=".6"/>`;
    if (state === 'baseline') return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#536274" stroke-dasharray="3 7"/>${cap}`;
    const outer = state === 'shell' || state === 'joined' ? `<circle cx="${cx}" cy="${cy}" r="${r * 1.04}" fill="none" stroke="#d0b9ee" stroke-width="4"/><path d="M${cx-r} ${cy}H${cx+r}" stroke="#d0b9ee" stroke-width="${state === 'joined' ? 2 : 1}" stroke-dasharray="${state === 'joined' ? '0' : '4 5'}"/>` : '';
    return sphere + outer + (['test','shell','joined'].includes(state) ? cap : '');
  }
  function setState(state) {
    const [code, title, description, file] = stateData[state];
    $('state-code').textContent = code;
    $('state-title').textContent = title;
    $('state-description').textContent = description;
    $('state-file').textContent = file;
    $('state-svg').setAttribute('aria-label', title);
    $('state-object').innerHTML = objectMarkup(state, 270, 112, 65);
    $('stand-target').innerHTML = objectMarkup(state, 812, 222, 58);
  }
  document.querySelectorAll('[data-state]').forEach(button => button.addEventListener('click', () => {
    selectButtons('[data-state]', button);
    setState(button.dataset.state);
  }));
  setState('test');

  function updateRatio(ratio) {
    const delta = 20 * Math.log10(ratio);
    $('ratio-value').textContent = `${fmt(ratio, 3)}×`;
    $('test-amplitude').textContent = `${fmt(ratio)}×`;
    $('test-bar').style.width = `${ratio / 5 * 100}%`;
    $('k-value').textContent = `${fmt(ratio ** 2)}×`;
    $('db-value').textContent = `${delta >= 0 ? '+' : '−'}${fmt(Math.abs(delta))} дБ`;
    $('amplitude-ratio').setAttribute('aria-valuetext', `${fmt(ratio, 3)} раза, изменение ЭПР ${fmt(delta)} децибел`);
  }
  $('amplitude-ratio').addEventListener('input', event => updateRatio(Number(event.target.value)));
  $('target-ratio').addEventListener('click', () => {
    $('amplitude-ratio').step = 'any';
    $('amplitude-ratio').value = Math.sqrt(10);
    updateRatio(Math.sqrt(10));
  });
  updateRatio(Number($('amplitude-ratio').value));

  // Self-contained WebGL renderer. Gyroid cells are deliberately enlarged in
  // this illustration; no generated surface is exported as a fabrication file.
  const canvas = $('lens-canvas');
  let renderer = null;
  function showFallback() {
    canvas.hidden = true;
    $('lens-fallback').hidden = false;
    document.querySelectorAll('[data-lens-view]').forEach(button => { button.disabled = true; button.title = '3D-режим недоступен в этом браузере'; });
  }
  try {
    const gl = canvas.getContext('webgl', {antialias: true, alpha: true});
    if (!gl) throw new Error('WebGL unavailable');
    const vertexSource = `
      attribute vec3 position;
      attribute vec3 normal;
      uniform mat4 rotation;
      uniform float aspect;
      uniform float split;
      uniform mediump float sliceSide;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main(){
        vPosition=position;
        vec3 p=position;
        p.y+=sliceSide*split;
        vec4 view=rotation*vec4(p,1.0);
        vNormal=mat3(rotation)*normal;
        float w=3.5-view.z;
        gl_Position=vec4(view.x*2.55/aspect,view.y*2.55,-view.z*.3,w);
      }`;
    const fragmentSource = `
      precision mediump float;
      uniform float cut;
      uniform float metal;
      uniform mediump float sliceSide;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main(){
        if(sliceSide>.5 && vPosition.y<0.0)discard;
        if(sliceSide<-.5 && vPosition.y>0.0)discard;
        if(cut>.5 && vPosition.z>.0 && vPosition.x<.55 && vPosition.y>.0 && metal<.5) discard;
        vec3 n=normalize(vNormal);
        if(!gl_FrontFacing)n=-n;
        vec3 light=normalize(vec3(-.5,.8,1.5));
        float diff=max(dot(n,light),0.0);
        float rim=pow(1.0-abs(n.z),2.0);
        float spec=pow(max(dot(reflect(-light,n),vec3(0.,0.,1.)),0.0),26.0);
        float radial=clamp(length(vPosition),0.,1.);
        vec3 base=mix(vec3(.31,.76,.66),vec3(.13,.47,.44),radial);
        if(metal>.5)base=vec3(.77,.47,.22);
        vec3 color=base*(.35+.75*diff)+vec3(.14,.22,.23)*rim+vec3(.7,.8,.75)*spec*(metal>.5?.65:.2);
        gl_FragColor=vec4(color,1.);
      }`;
    function shader(type, source) {
      const s = gl.createShader(type); gl.shaderSource(s, source); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    }
    const program = gl.createProgram();
    gl.attachShader(program, shader(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    const uniforms = Object.fromEntries(['rotation', 'aspect', 'split', 'cut', 'metal', 'sliceSide'].map(name => [name, gl.getUniformLocation(program, name)]));
    const posLocation = gl.getAttribLocation(program, 'position');
    const normLocation = gl.getAttribLocation(program, 'normal');
    const k = Math.PI * 3.5;
    function field(x, y, z) {
      const r = Math.hypot(x, y, z);
      const g = Math.sin(k*x)*Math.cos(k*y)+Math.sin(k*y)*Math.cos(k*z)+Math.sin(k*z)*Math.cos(k*x);
      const h = .24 + .86 * Math.max(0, 1-r*r);
      return Math.min(h - Math.abs(g), (1-r)*k);
    }
    function normal(p) {
      const e = .001, [x,y,z] = p;
      const n = [field(x-e,y,z)-field(x+e,y,z),field(x,y-e,z)-field(x,y+e,z),field(x,y,z-e)-field(x,y,z+e)];
      const length = Math.hypot(...n) || 1;
      return n.map(v => v/length);
    }
    const positions = [], normals = [];
    function triangle(a,b,c) {
      const ab=b.map((v,i)=>v-a[i]),ac=c.map((v,i)=>v-a[i]);
      const geometric=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];
      const outward=normal(a);
      if(geometric.reduce((sum,v,i)=>sum+v*outward[i],0)<0)[b,c]=[c,b];
      for (const point of [a,b,c]) { positions.push(...point); normals.push(...normal(point)); }
    }
    const n = 48, extent = 1.06, step = 2*extent/n, side = n+1;
    const values = new Float32Array(side**3);
    const index = (x,y,z) => (x*side+y)*side+z;
    for(let x=0;x<=n;x++)for(let y=0;y<=n;y++)for(let z=0;z<=n;z++) values[index(x,y,z)] = field(x*step-extent,y*step-extent,z*step-extent);
    const offsets = [[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]];
    const tetrahedra = [[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]];
    for(let x=0;x<n;x++)for(let y=0;y<n;y++)for(let z=0;z<n;z++) {
      const v=offsets.map(o=>values[index(x+o[0],y+o[1],z+o[2])]);
      if(v.every(a=>a>=0)||v.every(a=>a<0))continue;
      const p=offsets.map(o=>[(x+o[0])*step-extent,(y+o[1])*step-extent,(z+o[2])*step-extent]);
      const cross=(a,b)=>{const t=v[a]/(v[a]-v[b]);return p[a].map((c,i)=>c+t*(p[b][i]-c));};
      for(const tetra of tetrahedra) {
        const inside=tetra.filter(i=>v[i]>=0), outside=tetra.filter(i=>v[i]<0);
        if(inside.length===1){triangle(...outside.map(j=>cross(inside[0],j)));}
        else if(inside.length===3){triangle(...inside.map(j=>cross(outside[0],j)).reverse());}
        else if(inside.length===2){const a=cross(inside[0],outside[0]), b=cross(inside[0],outside[1]), c=cross(inside[1],outside[0]), d=cross(inside[1],outside[1]);triangle(a,b,c);triangle(b,d,c);}
      }
    }
    function bufferMesh(p, nrm) {
      const pos = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, pos); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(p),gl.STATIC_DRAW);
      const norm = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, norm); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(nrm),gl.STATIC_DRAW);
      return {pos,norm,count:p.length/3};
    }
    const lensMesh=bufferMesh(positions,normals);
    const capPositions=[],capNormals=[];
    function capPoint(theta,phi){return [1.025*Math.cos(theta),1.025*Math.sin(theta)*Math.cos(phi),1.025*Math.sin(theta)*Math.sin(phi)];}
    for(let i=0;i<20;i++)for(let j=0;j<64;j++) {
      const t0=i/20*Math.PI/3,t1=(i+1)/20*Math.PI/3,p0=j/64*2*Math.PI,p1=(j+1)/64*2*Math.PI;
      const a=capPoint(t0,p0),b=capPoint(t1,p0),c=capPoint(t1,p1),d=capPoint(t0,p1);
      for(const p of [a,b,c,a,c,d]){capPositions.push(...p);capNormals.push(...p.map(v=>v/1.025));}
    }
    const capMesh=bufferMesh(capPositions,capNormals);
    function bind(mesh) {
      gl.bindBuffer(gl.ARRAY_BUFFER,mesh.pos); gl.enableVertexAttribArray(posLocation); gl.vertexAttribPointer(posLocation,3,gl.FLOAT,false,0,0);
      gl.bindBuffer(gl.ARRAY_BUFFER,mesh.norm); gl.enableVertexAttribArray(normLocation); gl.vertexAttribPointer(normLocation,3,gl.FLOAT,false,0,0);
    }
    gl.enable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE);
    const resize=()=>{const bounds=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(bounds.width*dpr);canvas.height=Math.round(bounds.height*dpr);gl.viewport(0,0,canvas.width,canvas.height);};
    const observer=new ResizeObserver(()=>{resize();renderer?.draw(lastTime);});observer.observe(canvas);
    let lastTime=0;
    renderer={draw(time){
      lastTime=time;
      const yaw=-.48+Math.sin(time*.24)*.48, pitch=.2, cy=Math.cos(yaw),sy=Math.sin(yaw),cx=Math.cos(pitch),sx=Math.sin(pitch);
      const rotation=new Float32Array([cy,sx*sy,-cx*sy,0,0,cx,sx,0,sy,-sx*cy,cx*cy,0,0,0,0,1]);
      gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT); gl.useProgram(program);
      gl.uniformMatrix4fv(uniforms.rotation,false,rotation); gl.uniform1f(uniforms.aspect,canvas.width/canvas.height);
      gl.uniform1f(uniforms.split,lensView==='split'?.20:0); gl.uniform1f(uniforms.cut,lensView==='cut'?1:0);
      for(const half of lensView==='split'?[1,-1]:[0]){
        gl.uniform1f(uniforms.sliceSide,half);
        gl.uniform1f(uniforms.metal,0);bind(lensMesh);gl.drawArrays(gl.TRIANGLES,0,lensMesh.count);
        gl.uniform1f(uniforms.metal,1);bind(capMesh);gl.drawArrays(gl.TRIANGLES,0,capMesh.count);
      }
    }};
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();renderer=null;showFallback();});
    resize(); renderer.draw(0);
  } catch (error) {
    console.warn('LINZA: using static lens illustration.', error.message);
    showFallback();
  }
  let animationTime=0, previousTimestamp=0;
  document.querySelectorAll('[data-lens-view]').forEach(button=>button.addEventListener('click',()=>{
    lensView=button.dataset.lensView;
    selectButtons('[data-lens-view]',button);
    renderer?.draw(animationTime);
  }));
  // Stop work when out of view or in a hidden tab. Pause controls all animations.
  let lensVisible=true, raysVisible=true;
  const visibility=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.target===canvas)lensVisible=entry.isIntersecting;
    if(entry.target===$('ray-svg'))raysVisible=entry.isIntersecting;
  }));
  visibility.observe(canvas); visibility.observe($('ray-svg'));
  function frame(timestamp){
    const delta=Math.min((timestamp-previousTimestamp)/1000,.05);previousTimestamp=timestamp;
    if(!paused&&!document.hidden){
      animationTime+=delta;
      if(lensVisible)renderer?.draw(animationTime);
      if(raysVisible)drawRays(animationTime);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
