const CURRENT_YEAR = new Date().getFullYear();

const islands = {
  'el-hierro': { name: 'El Hierro' },
  'fuerteventura': { name: 'Fuerteventura' },
  'gran-canaria': { name: 'Gran Canaria' },
  'la-gomera': { name: 'La Gomera' },
  'la-graciosa': { name: 'La Graciosa' },
  'la-palma': { name: 'La Palma' },
  'lanzarote': { name: 'Lanzarote' },
  'tenerife': { name: 'Tenerife' }
};

// Contenido provisional para conservar la navegación mientras se trabaja el diseño.
const people = [
  {id:'benito-perez-galdos',name:'Benito Pérez Galdós',born:1843,died:1920,island:'gran-canaria',category:'Artes',discipline:'Literatura',role:'Novelista y dramaturgo',bio:'Nacido en Las Palmas de Gran Canaria, fue una de las figuras esenciales de la literatura española del siglo XIX. Su producción novelística, teatral y periodística convirtió la sociedad y la política de su tiempo en materia literaria y dejó una obra de enorme influencia.'},
  {id:'fernando-leon-castillo',name:'Fernando León y Castillo',born:1842,died:1918,island:'gran-canaria',category:'Política',discipline:'Diplomacia y política',role:'Diplomático y político',bio:'Diplomático y político grancanario con una trayectoria de gran peso en la vida pública española de la segunda mitad del siglo XIX.'},
  {id:'juan-negrin',name:'Juan Negrín López',born:1892,died:1956,island:'gran-canaria',category:'Ciencias',discipline:'Medicina y fisiología',role:'Médico, fisiólogo y político',bio:'Médico y fisiólogo nacido en Las Palmas de Gran Canaria, con una trayectoria científica y política de alcance internacional.'},
  {id:'nestor',name:'Néstor Martín-Fernández de la Torre',born:1887,died:1938,island:'gran-canaria',category:'Artes',discipline:'Pintura',role:'Pintor',bio:'Pintor grancanario vinculado al simbolismo y a una poderosa construcción estética de la identidad insular.'},
  {id:'tomas-morales',name:'Tomás Morales Castellano',born:1884,died:1921,island:'gran-canaria',category:'Artes',discipline:'Literatura',role:'Poeta',bio:'Poeta modernista nacido en Moya, Gran Canaria, autor de una obra profundamente vinculada al Atlántico y al paisaje insular.'},
  {id:'josefina-torre',name:'Josefina de la Torre',born:1907,died:2002,island:'gran-canaria',category:'Artes',discipline:'Literatura y artes escénicas',role:'Poeta, actriz y cantante',bio:'Creadora polifacética nacida en Las Palmas de Gran Canaria, vinculada a la poesía, el teatro, el cine y la música.'},
  {id:'alfredo-kraus',name:'Alfredo Kraus',born:1927,died:1999,island:'gran-canaria',category:'Artes',discipline:'Música',role:'Tenor',bio:'Tenor nacido en Las Palmas de Gran Canaria y reconocido internacionalmente por su técnica y su interpretación del repertorio lírico.'},
  {id:'martin-chirino',name:'Martín Chirino',born:1925,died:2019,island:'gran-canaria',category:'Artes',discipline:'Escultura',role:'Escultor',bio:'Escultor grancanario, referente de la abstracción española y autor de una obra marcada por el hierro, la espiral y la memoria atlántica.'},
  {id:'manolo-millares',name:'Manolo Millares',born:1926,died:1972,island:'gran-canaria',category:'Artes',discipline:'Pintura',role:'Pintor',bio:'Pintor nacido en Las Palmas de Gran Canaria y figura esencial del arte español de posguerra.'},
  {id:'angel-guimera',name:'Ángel Guimerá',born:1845,died:1924,island:'tenerife',category:'Artes',discipline:'Literatura',role:'Dramaturgo y poeta',bio:'Dramaturgo y poeta nacido en Santa Cruz de Tenerife. Su trayectoria literaria lo convirtió en una figura fundamental del teatro de su época.'},
  {id:'oscar-dominguez',name:'Óscar Domínguez',born:1906,died:1957,island:'tenerife',category:'Artes',discipline:'Pintura',role:'Pintor surrealista',bio:'Pintor tinerfeño y una de las figuras canarias de mayor proyección dentro del surrealismo europeo.'},
  {id:'maria-rosa-alonso',name:'María Rosa Alonso',born:1909,died:2011,island:'tenerife',category:'Humanidades',discipline:'Filología y ensayo',role:'Filóloga y ensayista',bio:'Filóloga, ensayista e investigadora tinerfeña, referente intelectual de la cultura canaria del siglo XX.'},
  {id:'antonio-gonzalez',name:'Antonio González González',born:1917,died:2002,island:'tenerife',category:'Ciencias',discipline:'Química',role:'Químico e investigador',bio:'Químico tinerfeño de gran relevancia científica, especialmente vinculado a la investigación de productos naturales.'},
  {id:'luis-morera',name:'Luis Morera',born:1946,died:null,island:'la-palma',category:'Artes',discipline:'Música',role:'Músico y artista',bio:'Músico y artista palmero con una trayectoria profundamente vinculada al paisaje, la identidad y la cultura de Canarias.'},
  {id:'felix-casanova',name:'Félix Francisco Casanova',born:1956,died:1976,island:'la-palma',category:'Artes',discipline:'Literatura',role:'Poeta y escritor',bio:'Poeta y escritor nacido en Santa Cruz de La Palma, cuya breve e intensa obra ocupa un lugar singular en la literatura canaria contemporánea.'},
  {id:'pedro-garcia-cabrera',name:'Pedro García Cabrera',born:1905,died:1981,island:'la-gomera',category:'Artes',discipline:'Literatura',role:'Poeta y escritor',bio:'Poeta nacido en Vallehermoso, La Gomera, una de las voces fundamentales de la literatura canaria del siglo XX.'},
  {id:'jose-aguiar',name:'José Aguiar',born:1895,died:1976,island:'la-gomera',category:'Artes',discipline:'Pintura',role:'Pintor',bio:'Pintor nacido en La Gomera, autor de una obra de gran presencia mural y figurativa.'},
  {id:'juan-ismael',name:'Juan Ismael',born:1907,died:1981,island:'fuerteventura',category:'Artes',discipline:'Pintura y literatura',role:'Pintor y poeta',bio:'Artista y poeta majorero vinculado a las vanguardias canarias del siglo XX.'},
  {id:'manuel-velazquez',name:'Manuel Velázquez Cabrera',born:1863,died:1916,island:'fuerteventura',category:'Política',discipline:'Derecho y política',role:'Político y abogado',bio:'Político y abogado majorero, recordado por su defensa de los intereses insulares y su papel en la historia institucional de Canarias.'},
  {id:'cesar-manrique',name:'César Manrique',born:1919,died:1992,island:'lanzarote',category:'Artes',discipline:'Artes plásticas y creación',role:'Artista y creador',bio:'Artista lanzaroteño cuya obra integró arte, arquitectura, paisaje y defensa del territorio.'},
  {id:'pancho-lasso',name:'Pancho Lasso',born:1904,died:1973,island:'lanzarote',category:'Artes',discipline:'Escultura',role:'Escultor',bio:'Escultor lanzaroteño vinculado a las vanguardias y a una lectura moderna de la cultura popular de las islas.'},
  {id:'valentina-sabinosa',name:'Valentina Hernández “la de Sabinosa”',born:1889,died:1976,island:'el-hierro',category:'Artes',discipline:'Música tradicional',role:'Cantadora y referente del folclore',bio:'Figura esencial de la tradición musical herreña, cuya memoria está ligada a la transmisión del folclore de El Hierro.'}
];

const directory = document.getElementById('directory');
const islandSelector = document.getElementById('islandSelector');
const mapTooltip = document.getElementById('mapTooltip');
const particleField = document.getElementById('particleField');
const archipelagoStage = document.getElementById('archipelagoStage');
const mapZoomIn = document.getElementById('mapZoomIn');
const mapZoomOut = document.getElementById('mapZoomOut');
const mapReset = document.getElementById('mapReset');
const gyroButton = document.getElementById('gyroButton');
let currentIsland = null;
let currentCategory = 'Todas';

const mapView = {scale:1,x:0,y:0,gyroX:0,gyroY:0};
let mapGestureMovedAt = 0;
let activePointer = null;
let gestureStart = null;
let gyroEnabled = false;
let gyroBaseline = null;

function escapeHtml(value){
  return String(value).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}
function century(year){return Math.floor((year-1)/100)+1}
function decade(year){return Math.floor(year/10)*10}
function lifeLabel(p){return `${p.born}–${p.died ?? 'actualidad'}`}

function connectionReasons(a,b){
  const reasons=[];
  if(a.island===b.island) reasons.push('misma isla');
  if(a.category===b.category) reasons.push('misma área');
  if(a.discipline===b.discipline) reasons.push('misma disciplina');
  if(decade(a.born)===decade(b.born)) reasons.push('misma década');
  if(century(a.born)===century(b.born)) reasons.push('mismo siglo');
  return reasons;
}
function getConnections(person){
  return people
    .filter(other=>other.id!==person.id)
    .map(other=>({person:other,reasons:connectionReasons(person,other)}))
    .filter(item=>item.reasons.length)
    .sort((a,b)=>b.reasons.length-a.reasons.length || Math.abs(person.born-a.person.born)-Math.abs(person.born-b.person.born) || a.person.name.localeCompare(b.person.name,'es'))
    .slice(0,9);
}

function setMapActive(slug){
  document.querySelectorAll('.island-node').forEach(node=>node.classList.toggle('active',node.dataset.island===slug));
}
function setTooltip(slug=null){
  if(!slug){
    mapTooltip.innerHTML='<span class="tooltip-dot"></span><strong>Explora una isla</strong><small>Pulsa sobre su silueta</small>';
    return;
  }
  const count=people.filter(p=>p.island===slug).length;
  mapTooltip.innerHTML=`<span class="tooltip-dot"></span><strong>${escapeHtml(islands[slug].name)}</strong><small>${count ? `${count} perfiles disponibles` : 'estructura preparada'}</small>`;
}

function openIsland(slug, scroll=true){
  if(!islands[slug]) return;
  currentIsland=slug;
  currentCategory='Todas';
  setMapActive(slug);
  setTooltip(slug);
  renderIslandList();
  renderIslandSelector();
  if(scroll) document.getElementById('explorar').scrollIntoView({behavior:'smooth',block:'start'});
}

function renderIslandSelector(){
  islandSelector.innerHTML=Object.entries(islands).map(([slug,island])=>
    `<button class="island-chip ${currentIsland===slug?'active':''}" data-island-select="${slug}">${escapeHtml(island.name)}</button>`
  ).join('');
  islandSelector.querySelectorAll('[data-island-select]').forEach(btn=>btn.addEventListener('click',()=>openIsland(btn.dataset.islandSelect,false)));
}

function renderEmpty(){
  directory.innerHTML=`<div class="directory-empty"><strong>Elige una isla en el mapa.</strong><p>La navegación empieza en el territorio. Al seleccionar una isla aparecerá su directorio alfabético y los filtros por áreas.</p></div>`;
}

function renderIslandList(query=''){
  const all=people.filter(p=>p.island===currentIsland);
  const q=query.trim().toLocaleLowerCase('es');
  const categories=['Todas',...new Set(all.map(p=>p.category))];
  const filtered=all
    .filter(p=>(currentCategory==='Todas'||p.category===currentCategory) && p.name.toLocaleLowerCase('es').includes(q))
    .sort((a,b)=>a.name.localeCompare(b.name,'es'));
  const groups={};
  filtered.forEach(p=>{const letter=p.name[0].toLocaleUpperCase('es');(groups[letter]??=[]).push(p)});

  directory.innerHTML=`
    <div class="directory-inner">
      <div class="directory-head">
        <div><h3>${escapeHtml(islands[currentIsland].name)}</h3><p>Personas nacidas en la isla · orden alfabético</p></div>
        <div class="directory-count">${all.length} ${all.length===1?'perfil':'perfiles'} en esta versión</div>
      </div>
      <div class="toolbar">
        <input class="search" id="searchPeople" placeholder="Buscar una persona…" value="${escapeHtml(query)}">
        <div class="chips">${categories.map(c=>`<button class="chip ${currentCategory===c?'active':''}" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('')}</div>
      </div>
      <div>${Object.entries(groups).length ? Object.entries(groups).map(([letter,list])=>`
        <div class="alpha-block">
          <div class="alpha-letter">${letter}</div>
          <div class="people-list">${list.map(p=>`
            <button class="person-row" data-person="${p.id}">
              <span><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(p.category)} · ${escapeHtml(p.discipline)} · ${escapeHtml(p.role)}</small></span>
              <span class="person-year">${lifeLabel(p)} <b class="person-arrow">↗</b></span>
            </button>`).join('')}</div>
        </div>`).join('') : '<div class="directory-empty"><strong>No hay coincidencias.</strong><p>Prueba con otra categoría o término de búsqueda.</p></div>'}</div>
    </div>`;

  const search=document.getElementById('searchPeople');
  search.addEventListener('input',e=>renderIslandList(e.target.value));
  directory.querySelectorAll('[data-cat]').forEach(btn=>btn.addEventListener('click',()=>{currentCategory=btn.dataset.cat;renderIslandList(query)}));
  directory.querySelectorAll('[data-person]').forEach(btn=>btn.addEventListener('click',()=>openProfile(btn.dataset.person)));
}

function openProfile(id){
  const person=people.find(p=>p.id===id);
  if(!person)return;
  currentIsland=person.island;
  setMapActive(person.island);
  setTooltip(person.island);
  renderIslandSelector();
  const connections=getConnections(person);

  directory.innerHTML=`
    <article class="profile">
      <div class="profile-top">
        <div>
          <div class="profile-kicker">${escapeHtml(islands[person.island].name)} · ${escapeHtml(person.category)} · ${escapeHtml(person.discipline)}</div>
          <h3>${escapeHtml(person.name)}</h3>
        </div>
        <button class="profile-back" id="profileBack">Volver a ${escapeHtml(islands[person.island].name)}</button>
      </div>
      <div class="profile-meta">${lifeLabel(person)} · ${escapeHtml(person.role)}</div>
      <p class="profile-bio">${escapeHtml(person.bio)}</p>
      <div class="facts">
        <span class="fact"><b>Isla</b>${escapeHtml(islands[person.island].name)}</span>
        <span class="fact"><b>Década</b>${decade(person.born)}</span>
        <span class="fact"><b>Siglo</b>${century(person.born)}</span>
        <span class="fact"><b>Disciplina</b>${escapeHtml(person.discipline)}</span>
      </div>
      <h4 class="constellation-title">Su constelación</h4>
      <div class="connections-grid">${connections.map(({person:other,reasons})=>`
        <button class="rel-card" data-related="${other.id}">
          <strong>${escapeHtml(other.name)}</strong>
          <small>${escapeHtml(islands[other.island].name)} · ${lifeLabel(other)}</small>
          <span class="rel-reasons">${reasons.map(r=>`<span class="reason">${escapeHtml(r)}</span>`).join('')}</span>
        </button>`).join('')}</div>
    </article>`;
  document.getElementById('profileBack').addEventListener('click',()=>renderIslandList());
  directory.querySelectorAll('[data-related]').forEach(btn=>btn.addEventListener('click',()=>openProfile(btn.dataset.related)));
  document.getElementById('explorar').scrollIntoView({behavior:'smooth',block:'start'});
}

function isCompactMap(){
  return window.matchMedia('(max-width: 900px)').matches;
}
function clamp(value,min,max){return Math.min(max,Math.max(min,value))}
function clampMapPan(){
  const rect=archipelagoStage.getBoundingClientRect();
  const maxX=Math.max(0,(mapView.scale-1)*rect.width*.5+5);
  const maxY=Math.max(0,(mapView.scale-1)*rect.height*.5+4);
  mapView.x=clamp(mapView.x,-maxX,maxX);
  mapView.y=clamp(mapView.y,-maxY,maxY);
}
function applyMapTransform(){
  clampMapPan();
  const gx=isCompactMap()?mapView.gyroX:0;
  const gy=isCompactMap()?mapView.gyroY:0;
  const transform=`translate3d(${(mapView.x+gx).toFixed(2)}px, ${(mapView.y+gy).toFixed(2)}px, 0) scale(${mapView.scale.toFixed(3)})`;
  document.querySelectorAll('.canary-map,.network-layer,.particle-field').forEach(layer=>{layer.style.transform=transform});
}
function setMapScale(nextScale){
  mapView.scale=clamp(nextScale,1,2.05);
  if(mapView.scale===1){mapView.x=0;mapView.y=0}
  applyMapTransform();
}
function resetMapView(){
  mapView.scale=1;mapView.x=0;mapView.y=0;mapView.gyroX=0;mapView.gyroY=0;
  applyMapTransform();
}
function bindMobileMapGestures(){
  archipelagoStage.addEventListener('pointerdown',event=>{
    if(!isCompactMap() || event.pointerType==='mouse' || event.target.closest('.map-controls'))return;
    activePointer=event.pointerId;
    gestureStart={x:event.clientX,y:event.clientY,lastX:event.clientX,lastY:event.clientY,dragging:false};
  });
  archipelagoStage.addEventListener('pointermove',event=>{
    if(activePointer!==event.pointerId || !gestureStart)return;
    const totalX=event.clientX-gestureStart.x;
    const totalY=event.clientY-gestureStart.y;
    if(!gestureStart.dragging && Math.abs(totalX)>7 && Math.abs(totalX)>Math.abs(totalY)*1.1){
      gestureStart.dragging=true;
      if(mapView.scale<1.08) mapView.scale=1.30;
      archipelagoStage.classList.add('is-gesturing');
      try{archipelagoStage.setPointerCapture(event.pointerId)}catch(_){ }
    }
    if(!gestureStart.dragging)return;
    event.preventDefault();
    mapView.x+=event.clientX-gestureStart.lastX;
    mapView.y+=(event.clientY-gestureStart.lastY)*.22;
    gestureStart.lastX=event.clientX;
    gestureStart.lastY=event.clientY;
    applyMapTransform();
    mapGestureMovedAt=Date.now();
  });
  const endGesture=event=>{
    if(activePointer!==event.pointerId)return;
    if(gestureStart?.dragging)mapGestureMovedAt=Date.now();
    activePointer=null;gestureStart=null;
    archipelagoStage.classList.remove('is-gesturing');
  };
  archipelagoStage.addEventListener('pointerup',endGesture);
  archipelagoStage.addEventListener('pointercancel',endGesture);

  mapZoomIn?.addEventListener('click',event=>{event.stopPropagation();setMapScale(mapView.scale+.28)});
  mapZoomOut?.addEventListener('click',event=>{event.stopPropagation();setMapScale(mapView.scale-.28)});
  mapReset?.addEventListener('click',event=>{event.stopPropagation();resetMapView()});
}
function handleDeviceOrientation(event){
  if(!gyroEnabled || !isCompactMap() || event.gamma==null || event.beta==null)return;
  if(!gyroBaseline)gyroBaseline={gamma:event.gamma,beta:event.beta};
  const dx=event.gamma-gyroBaseline.gamma;
  const dy=event.beta-gyroBaseline.beta;
  mapView.gyroX=clamp(dx*.34,-9,9);
  mapView.gyroY=clamp(dy*.15,-5,5);
  applyMapTransform();
}
async function toggleGyroscope(){
  if(!gyroButton)return;
  if(gyroEnabled){
    gyroEnabled=false;gyroBaseline=null;mapView.gyroX=0;mapView.gyroY=0;
    window.removeEventListener('deviceorientation',handleDeviceOrientation);
    gyroButton.setAttribute('aria-pressed','false');gyroButton.innerHTML='<span aria-hidden="true">✦</span> Movimiento';
    applyMapTransform();return;
  }
  try{
    if(typeof DeviceOrientationEvent!=='undefined' && typeof DeviceOrientationEvent.requestPermission==='function'){
      const permission=await DeviceOrientationEvent.requestPermission();
      if(permission!=='granted')return;
    }
    gyroEnabled=true;gyroBaseline=null;
    window.addEventListener('deviceorientation',handleDeviceOrientation,{passive:true});
    gyroButton.setAttribute('aria-pressed','true');gyroButton.innerHTML='<span aria-hidden="true">✦</span> Activo';
  }catch(_){gyroButton.hidden=true}
}
function prepareGyroscopeControl(){
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!gyroButton || reduceMotion || typeof DeviceOrientationEvent==='undefined'){if(gyroButton)gyroButton.hidden=true;return}
  gyroButton.hidden=false;
  gyroButton.addEventListener('click',event=>{event.stopPropagation();toggleGyroscope()});
}

function createParticles(){
  const count=window.innerWidth<700?36:70;
  const fragment=document.createDocumentFragment();
  for(let i=0;i<count;i++){
    const p=document.createElement('span');
    p.className='particle';
    const gold=Math.random()>.42;
    const size=(Math.random()*2.2+.6).toFixed(2)+'px';
    p.style.left=(Math.random()*100).toFixed(2)+'%';
    p.style.top=(Math.random()*100).toFixed(2)+'%';
    p.style.setProperty('--size',size);
    p.style.setProperty('--particle-color',gold?'#FFCD00':'#9D4EDD');
    p.style.setProperty('--glow',(Math.random()*10+6).toFixed(1)+'px');
    p.style.setProperty('--opacity',(Math.random()*.6+.2).toFixed(2));
    p.style.setProperty('--duration',(Math.random()*7+6).toFixed(1)+'s');
    p.style.setProperty('--delay',(-Math.random()*8).toFixed(1)+'s');
    p.style.setProperty('--dx',(Math.random()*24-12).toFixed(1)+'px');
    p.style.setProperty('--dy',(Math.random()*20-10).toFixed(1)+'px');
    fragment.appendChild(p);
  }
  particleField.replaceChildren(fragment);
}

function bindMap(){
  document.querySelectorAll('.island-node').forEach(node=>{
    const slug=node.dataset.island;
    node.addEventListener('mouseenter',()=>setTooltip(slug));
    node.addEventListener('mouseleave',()=>setTooltip(currentIsland));
    node.addEventListener('focus',()=>setTooltip(slug));
    node.addEventListener('blur',()=>setTooltip(currentIsland));
    node.addEventListener('click',()=>{
      if(Date.now()-mapGestureMovedAt<320)return;
      openIsland(slug,true);
    });
    node.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){e.preventDefault();openIsland(slug,true)}
    });
  });
}

document.querySelectorAll('[data-scroll]').forEach(btn=>btn.addEventListener('click',()=>document.getElementById(btn.dataset.scroll)?.scrollIntoView({behavior:'smooth',block:'start'})));
document.getElementById('homeButton').addEventListener('click',()=>document.getElementById('inicio').scrollIntoView({behavior:'smooth'}));

renderIslandSelector();
renderEmpty();
bindMap();
bindMobileMapGestures();
prepareGyroscopeControl();
createParticles();
applyMapTransform();
window.addEventListener('resize',()=>{
  clearTimeout(window.__c8resize);
  window.__c8resize=setTimeout(()=>{createParticles();if(!isCompactMap())resetMapView();else applyMapTransform()},180);
});
