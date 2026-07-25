const islands={
  'el-hierro':{name:'El Hierro',x:7,y:68},
  'la-palma':{name:'La Palma',x:12.5,y:32},
  'la-gomera':{name:'La Gomera',x:22,y:57},
  'tenerife':{name:'Tenerife',x:32.5,y:44},
  'gran-canaria':{name:'Gran Canaria',x:50,y:60},
  'fuerteventura':{name:'Fuerteventura',x:73,y:57},
  'lanzarote':{name:'Lanzarote',x:85,y:38},
  'la-graciosa':{name:'La Graciosa',x:88,y:29}
};

const people=[
  {id:'benito-perez-galdos',name:'Benito Pérez Galdós',born:1843,island:'gran-canaria',category:'Literatura',role:'Novelista y dramaturgo',bio:'Una de las figuras centrales de la literatura española del siglo XIX. Nació en Las Palmas de Gran Canaria y su obra convirtió la vida social y política de su tiempo en materia literaria.'},
  {id:'fernando-leon-castillo',name:'Fernando León y Castillo',born:1842,island:'gran-canaria',category:'Política',role:'Diplomático y político',bio:'Diplomático y político grancanario, figura destacada de la vida pública española de la segunda mitad del siglo XIX.'},
  {id:'juan-negrin',name:'Juan Negrín López',born:1892,island:'gran-canaria',category:'Ciencia',role:'Médico, fisiólogo y político',bio:'Médico y fisiólogo nacido en Las Palmas de Gran Canaria, con una trayectoria científica y política de alcance internacional.'},
  {id:'nestor',name:'Néstor Martín-Fernández de la Torre',born:1887,island:'gran-canaria',category:'Artes',role:'Pintor',bio:'Pintor grancanario vinculado al simbolismo y a una poderosa construcción estética de la identidad insular.'},
  {id:'tomas-morales',name:'Tomás Morales Castellano',born:1884,island:'gran-canaria',category:'Literatura',role:'Poeta',bio:'Poeta modernista nacido en Moya, Gran Canaria, autor de una obra profundamente vinculada al Atlántico y al paisaje insular.'},
  {id:'josefina-torre',name:'Josefina de la Torre',born:1907,island:'gran-canaria',category:'Literatura',role:'Poeta, actriz y cantante',bio:'Creadora polifacética nacida en Las Palmas de Gran Canaria, vinculada a la poesía, el teatro, el cine y la música.'},
  {id:'alfredo-kraus',name:'Alfredo Kraus',born:1927,island:'gran-canaria',category:'Música',role:'Tenor',bio:'Tenor nacido en Las Palmas de Gran Canaria, reconocido internacionalmente por su técnica y su interpretación del repertorio lírico.'},
  {id:'martin-chirino',name:'Martín Chirino',born:1925,island:'gran-canaria',category:'Artes',role:'Escultor',bio:'Escultor grancanario, referente de la abstracción española y autor de una obra marcada por el hierro, la espiral y la memoria atlántica.'},
  {id:'manolo-millares',name:'Manolo Millares',born:1926,island:'gran-canaria',category:'Artes',role:'Pintor',bio:'Pintor nacido en Las Palmas de Gran Canaria y figura esencial del arte español de posguerra.'},
  {id:'angel-guimera',name:'Ángel Guimerá',born:1845,island:'tenerife',category:'Literatura',role:'Dramaturgo y poeta',bio:'Dramaturgo y poeta nacido en Santa Cruz de Tenerife. Su trayectoria literaria lo convirtió en una de las figuras fundamentales del teatro de su época.'},
  {id:'oscar-dominguez',name:'Óscar Domínguez',born:1906,island:'tenerife',category:'Artes',role:'Pintor surrealista',bio:'Pintor tinerfeño y una de las figuras canarias de mayor proyección dentro del surrealismo europeo.'},
  {id:'maria-rosa-alonso',name:'María Rosa Alonso',born:1909,island:'tenerife',category:'Pensamiento',role:'Filóloga y ensayista',bio:'Filóloga, ensayista e investigadora tinerfeña, referente intelectual de la cultura canaria del siglo XX.'},
  {id:'antonio-gonzalez',name:'Antonio González González',born:1917,island:'tenerife',category:'Ciencia',role:'Químico e investigador',bio:'Químico tinerfeño de gran relevancia científica, especialmente vinculado a la investigación de productos naturales.'},
  {id:'luis-morera',name:'Luis Morera',born:1946,island:'la-palma',category:'Música',role:'Músico y artista',bio:'Músico y artista palmero con una trayectoria profundamente vinculada al paisaje, la identidad y la cultura de Canarias.'},
  {id:'felix-casanova',name:'Félix Francisco Casanova',born:1956,island:'la-palma',category:'Literatura',role:'Poeta y escritor',bio:'Poeta y escritor nacido en Santa Cruz de La Palma, cuya breve e intensa obra ocupa un lugar singular en la literatura canaria contemporánea.'},
  {id:'pedro-garcia-cabrera',name:'Pedro García Cabrera',born:1905,island:'la-gomera',category:'Literatura',role:'Poeta y escritor',bio:'Poeta nacido en Vallehermoso, La Gomera, una de las voces fundamentales de la literatura canaria del siglo XX.'},
  {id:'jose-aguiar',name:'José Aguiar',born:1895,island:'la-gomera',category:'Artes',role:'Pintor',bio:'Pintor nacido en La Gomera, autor de una obra de gran presencia mural y figurativa.'},
  {id:'juan-ismael',name:'Juan Ismael',born:1907,island:'fuerteventura',category:'Artes',role:'Pintor y poeta',bio:'Artista y poeta majorero vinculado a las vanguardias canarias del siglo XX.'},
  {id:'manuel-velazquez',name:'Manuel Velázquez Cabrera',born:1863,island:'fuerteventura',category:'Política',role:'Político y abogado',bio:'Político y abogado majorero, recordado por su defensa de los intereses insulares y su papel en la historia institucional de Canarias.'},
  {id:'cesar-manrique',name:'César Manrique',born:1919,island:'lanzarote',category:'Artes',role:'Artista y creador',bio:'Artista lanzaroteño cuya obra integró arte, arquitectura, paisaje y defensa del territorio.'},
  {id:'pancho-lasso',name:'Pancho Lasso',born:1904,island:'lanzarote',category:'Artes',role:'Escultor',bio:'Escultor lanzaroteño vinculado a las vanguardias y a una lectura moderna de la cultura popular de las islas.'},
  {id:'valentina-sabinosa',name:'Valentina Hernández “la de Sabinosa”',born:1889,island:'el-hierro',category:'Música',role:'Cantadora y referente del folclore',bio:'Figura esencial de la tradición musical herreña, cuya memoria está ligada a la transmisión del folclore de El Hierro.'}
];

const mapWrap=document.getElementById('mapWrap');
const panel=document.getElementById('panel');
const nodesLayer=document.getElementById('profileNodes');
const network=document.getElementById('network');
const legend=document.getElementById('legend');
let currentIsland=null;
let currentCategory='Todas';
let currentProfile=null;

function escapeHtml(value){
  return String(value).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}
function century(y){return Math.ceil(y/100)}
function decade(y){return Math.floor(y/10)*10}
function roman(n){return ({18:'XVIII',19:'XIX',20:'XX',21:'XXI'}[n]||String(n))}

Object.entries(islands).forEach(([slug,island])=>{
  const button=document.createElement('button');
  button.className='island-hotspot';
  button.dataset.island=slug;
  button.style.left=island.x+'%';
  button.style.top=island.y+'%';
  button.setAttribute('aria-label',island.name);
  button.innerHTML=`<span class="island-label">${island.name}</span>`;
  button.addEventListener('click',()=>openIsland(slug));
  mapWrap.appendChild(button);
});

function setActiveIsland(slug){
  document.querySelectorAll('.island-hotspot').forEach(el=>el.classList.toggle('active',el.dataset.island===slug));
}

function relationTags(a,b){
  const tags=[];
  if(a.island===b.island)tags.push({key:'island',label:'misma isla'});
  if(a.category===b.category)tags.push({key:'category',label:'misma disciplina'});
  if(decade(a.born)===decade(b.born))tags.push({key:'decade',label:`década de ${decade(a.born)}`});
  if(century(a.born)===century(b.born))tags.push({key:'century',label:`siglo ${roman(century(a.born))}`});
  return tags;
}

function scoreRelation(a,b){
  const keys=relationTags(a,b).map(t=>t.key);
  return (keys.includes('decade')?8:0)+(keys.includes('category')?6:0)+(keys.includes('island')?4:0)+(keys.includes('century')?1:0);
}

function getConnections(person){
  return people
    .filter(p=>p.id!==person.id&&relationTags(person,p).length)
    .sort((a,b)=>scoreRelation(person,b)-scoreRelation(person,a)||a.born-b.born)
    .slice(0,8);
}

function lineColor(tags){
  const keys=tags.map(t=>t.key);
  if(keys.includes('decade'))return 'var(--same-decade)';
  if(keys.includes('category'))return 'var(--same-category)';
  if(keys.includes('island'))return 'var(--same-island)';
  return 'var(--same-century)';
}

function hashNumber(str){
  let h=0;
  for(let i=0;i<str.length;i++)h=(h*31+str.charCodeAt(i))>>>0;
  return h;
}

function relatedPosition(person,central){
  const base=islands[person.island];
  const h=hashNumber(person.id);
  const angle=(h%360)*Math.PI/180;
  const same=person.island===central.island;
  const rx=same?5.5:2.6;
  const ry=same?9:4.5;
  return {
    x:Math.max(4,Math.min(96,base.x+Math.cos(angle)*rx)),
    y:Math.max(8,Math.min(91,base.y+Math.sin(angle)*ry))
  };
}

function clearNetwork(){
  network.innerHTML='';
  nodesLayer.innerHTML='';
  legend.hidden=true;
}

function drawNetwork(person){
  clearNetwork();
  const connections=getConnections(person);
  const center=islands[person.island];
  legend.hidden=connections.length===0;

  connections.forEach(related=>{
    const pos=relatedPosition(related,person);
    const tags=relationTags(person,related);
    const line=document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1',center.x);
    line.setAttribute('y1',center.y);
    line.setAttribute('x2',pos.x);
    line.setAttribute('y2',pos.y);
    line.setAttribute('stroke',lineColor(tags));
    line.setAttribute('stroke-width','.28');
    line.setAttribute('stroke-opacity','.62');
    line.setAttribute('vector-effect','non-scaling-stroke');
    if(tags.length===1&&tags[0].key==='century')line.setAttribute('stroke-dasharray','1 1.4');
    network.appendChild(line);

    const node=document.createElement('button');
    node.className='profile-node';
    node.style.left=pos.x+'%';
    node.style.top=pos.y+'%';
    node.setAttribute('aria-label',`Abrir ${related.name}`);
    node.title=tags.map(t=>t.label).join(' · ');
    node.innerHTML=`<span class="profile-dot"></span><span class="node-label">${related.name}</span>`;
    node.addEventListener('click',()=>openProfile(related.id));
    nodesLayer.appendChild(node);
  });

  const central=document.createElement('button');
  central.className='profile-node central';
  central.style.left=center.x+'%';
  central.style.top=center.y+'%';
  central.setAttribute('aria-label',person.name);
  central.innerHTML=`<span class="profile-dot"></span><span class="node-label">${person.name}</span>`;
  nodesLayer.appendChild(central);
}

function resetMapCopy(){
  document.getElementById('mapTitle').textContent='Ocho islas. Miles de historias conectadas.';
  document.getElementById('mapSub').textContent='Pulsa una isla para descubrir sus personas. Abre un perfil para explorar sus conexiones.';
}

function renderHome(){
  currentIsland=null;
  currentProfile=null;
  currentCategory='Todas';
  setActiveIsland(null);
  clearNetwork();
  resetMapCopy();
  panel.innerHTML=`
    <div class="panel-head"><div><div class="eyebrow">Explorar</div><h2>Empieza por una isla</h2></div></div>
    <p class="lede">El mapa es la entrada principal. Cada isla abre un directorio de personas nacidas allí y cada perfil despliega su constelación de relaciones.</p>
    <div class="home-card">
      <strong>Prueba la constelación</strong>
      <p>Abre a Benito Pérez Galdós para ver conexiones por territorio, disciplina y época.</p>
      <button class="primary" id="homeGaldos">Abrir a Galdós →</button>
    </div>
    <p class="footer-note">Esta versión sigue siendo un prototipo visual. La base editorial completa se conectará desde Supabase.</p>`;
  document.getElementById('homeGaldos').addEventListener('click',()=>openProfile('benito-perez-galdos'));
}

function openIsland(slug){
  if(!islands[slug])return;
  currentIsland=slug;
  currentProfile=null;
  currentCategory='Todas';
  clearNetwork();
  setActiveIsland(slug);
  document.getElementById('mapTitle').textContent=islands[slug].name;
  document.getElementById('mapSub').textContent='Personas nacidas en esta isla. Filtra por disciplina o busca por nombre.';
  renderIslandList();
}

function renderIslandList(query='',restoreFocus=false){
  const island=islands[currentIsland];
  const all=people.filter(p=>p.island===currentIsland);
  const q=query.trim().toLocaleLowerCase('es');
  const filtered=all.filter(p=>(currentCategory==='Todas'||p.category===currentCategory)&&p.name.toLocaleLowerCase('es').includes(q));
  const cats=['Todas',...new Set(all.map(p=>p.category))];
  const groups={};
  filtered.sort((a,b)=>a.name.localeCompare(b.name,'es')).forEach(p=>{
    const letter=p.name[0].toLocaleUpperCase('es');
    (groups[letter]??=[]).push(p);
  });

  panel.innerHTML=`
    <div class="panel-head">
      <div><div class="eyebrow">Isla</div><h2>${island.name}</h2><div class="count">${all.length} ${all.length===1?'perfil':'perfiles'} en esta versión</div></div>
      <button class="back" id="backHome" aria-label="Volver al inicio">←</button>
    </div>
    <input class="search" id="search" placeholder="Buscar una persona…" value="${escapeHtml(query)}">
    <div class="chips">${cats.map(c=>`<button class="chip ${currentCategory===c?'active':''}" data-cat="${escapeHtml(c)}">${c}</button>`).join('')}</div>
    <div id="list">${Object.keys(groups).length?Object.entries(groups).map(([letter,ps])=>`
      <div class="alpha-block"><div class="alpha-letter">${letter}</div>${ps.map(p=>`
        <button class="person-row" data-person="${p.id}"><span><strong>${p.name}</strong><small>${p.role}</small></span><span class="year">${p.born}</span></button>`).join('')}</div>`).join(''):'<div class="empty">Todavía no hay perfiles que coincidan con este filtro.</div>'}</div>`;

  document.getElementById('backHome').addEventListener('click',renderHome);
  panel.querySelectorAll('[data-person]').forEach(el=>el.addEventListener('click',()=>openProfile(el.dataset.person)));
  panel.querySelectorAll('[data-cat]').forEach(el=>el.addEventListener('click',()=>{currentCategory=el.dataset.cat;renderIslandList(query)}));
  const search=document.getElementById('search');
  search.addEventListener('input',e=>renderIslandList(e.target.value,true));
  if(restoreFocus){search.focus();search.setSelectionRange(search.value.length,search.value.length)}
}

function tagHtml(tag){return `<span class="tag ${tag.key}">${tag.label}</span>`}

function openProfile(id){
  const person=people.find(p=>p.id===id);
  if(!person)return;
  currentProfile=id;
  currentIsland=person.island;
  setActiveIsland(person.island);
  drawNetwork(person);
  document.getElementById('mapTitle').textContent=person.name;
  document.getElementById('mapSub').textContent='Su isla de origen y una selección de conexiones relevantes aparecen sobre el mapa.';
  const connections=getConnections(person);
  panel.innerHTML=`
    <div class="panel-head">
      <div><div class="profile-kicker">${islands[person.island].name} · ${person.category}</div><h2 class="profile-title">${person.name}</h2></div>
      <button class="back" id="backIsland" aria-label="Volver a ${islands[person.island].name}">←</button>
    </div>
    <div class="profile-meta">${person.born} · ${person.role}</div>
    <p class="profile-bio">${person.bio}</p>
    <div class="facts">
      <div class="fact"><b>Isla</b><span>${islands[person.island].name}</span></div>
      <div class="fact"><b>Disciplina</b><span>${person.category}</span></div>
      <div class="fact"><b>Década</b><span>${decade(person.born)}</span></div>
      <div class="fact"><b>Siglo</b><span>${roman(century(person.born))}</span></div>
    </div>
    <div class="rel-title">Conexiones visibles</div>
    ${connections.length?connections.map(p=>{
      const tags=relationTags(person,p);
      return `<button class="rel-card" data-related="${p.id}"><strong>${p.name}</strong><small>${p.role}</small><span class="rel-tags">${tags.map(tagHtml).join('')}</span></button>`;
    }).join(''):'<div class="empty">No hay todavía suficientes conexiones documentadas en esta versión.</div>'}
    <p class="footer-note">La red visual se limita a ocho conexiones para mantener el mapa legible. El perfil completo podrá contener más relaciones.</p>`;

  document.getElementById('backIsland').addEventListener('click',()=>openIsland(person.island));
  panel.querySelectorAll('[data-related]').forEach(el=>el.addEventListener('click',()=>openProfile(el.dataset.related)));
}

document.getElementById('homeButton').addEventListener('click',renderHome);
document.getElementById('galdosDemo').addEventListener('click',()=>openProfile('benito-perez-galdos'));
renderHome();
