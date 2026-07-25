const CURRENT_YEAR=new Date().getFullYear();

const islands={
  'el-hierro':{name:'El Hierro',x:7,y:68,w:7,h:12,r:-8},
  'la-palma':{name:'La Palma',x:12.5,y:32,w:7,h:18,r:-8},
  'la-gomera':{name:'La Gomera',x:22,y:57,w:7,h:12,r:0},
  'tenerife':{name:'Tenerife',x:32.5,y:44,w:12,h:20,r:-30},
  'gran-canaria':{name:'Gran Canaria',x:50,y:60,w:10,h:17,r:0},
  'fuerteventura':{name:'Fuerteventura',x:73,y:57,w:12,h:26,r:18},
  'lanzarote':{name:'Lanzarote',x:85,y:38,w:10,h:21,r:30},
  'la-graciosa':{name:'La Graciosa',x:88,y:29,w:6,h:8,r:15}
};

// Datos de demostración. Supabase será la fuente editorial definitiva.
// "category" es el ámbito amplio; "discipline" concreta la actividad.
const people=[
  {id:'benito-perez-galdos',name:'Benito Pérez Galdós',born:1843,died:1920,island:'gran-canaria',category:'Artes',discipline:'Literatura',role:'Novelista y dramaturgo',bio:'Una de las figuras centrales de la literatura española del siglo XIX. Nació en Las Palmas de Gran Canaria y su obra convirtió la vida social y política de su tiempo en materia literaria.'},
  {id:'fernando-leon-castillo',name:'Fernando León y Castillo',born:1842,died:1918,island:'gran-canaria',category:'Política',discipline:'Diplomacia y política',role:'Diplomático y político',bio:'Diplomático y político grancanario, figura destacada de la vida pública española de la segunda mitad del siglo XIX.'},
  {id:'juan-negrin',name:'Juan Negrín López',born:1892,died:1956,island:'gran-canaria',category:'Ciencias',discipline:'Medicina y fisiología',role:'Médico, fisiólogo y político',bio:'Médico y fisiólogo nacido en Las Palmas de Gran Canaria, con una trayectoria científica y política de alcance internacional.'},
  {id:'nestor',name:'Néstor Martín-Fernández de la Torre',born:1887,died:1938,island:'gran-canaria',category:'Artes',discipline:'Pintura',role:'Pintor',bio:'Pintor grancanario vinculado al simbolismo y a una poderosa construcción estética de la identidad insular.'},
  {id:'tomas-morales',name:'Tomás Morales Castellano',born:1884,died:1921,island:'gran-canaria',category:'Artes',discipline:'Literatura',role:'Poeta',bio:'Poeta modernista nacido en Moya, Gran Canaria, autor de una obra profundamente vinculada al Atlántico y al paisaje insular.'},
  {id:'josefina-torre',name:'Josefina de la Torre',born:1907,died:2002,island:'gran-canaria',category:'Artes',discipline:'Literatura y artes escénicas',role:'Poeta, actriz y cantante',bio:'Creadora polifacética nacida en Las Palmas de Gran Canaria, vinculada a la poesía, el teatro, el cine y la música.'},
  {id:'alfredo-kraus',name:'Alfredo Kraus',born:1927,died:1999,island:'gran-canaria',category:'Artes',discipline:'Música',role:'Tenor',bio:'Tenor nacido en Las Palmas de Gran Canaria, reconocido internacionalmente por su técnica y su interpretación del repertorio lírico.'},
  {id:'martin-chirino',name:'Martín Chirino',born:1925,died:2019,island:'gran-canaria',category:'Artes',discipline:'Escultura',role:'Escultor',bio:'Escultor grancanario, referente de la abstracción española y autor de una obra marcada por el hierro, la espiral y la memoria atlántica.'},
  {id:'manolo-millares',name:'Manolo Millares',born:1926,died:1972,island:'gran-canaria',category:'Artes',discipline:'Pintura',role:'Pintor',bio:'Pintor nacido en Las Palmas de Gran Canaria y figura esencial del arte español de posguerra.'},
  {id:'angel-guimera',name:'Ángel Guimerá',born:1845,died:1924,island:'tenerife',category:'Artes',discipline:'Literatura',role:'Dramaturgo y poeta',bio:'Dramaturgo y poeta nacido en Santa Cruz de Tenerife. Su trayectoria literaria lo convirtió en una de las figuras fundamentales del teatro de su época.'},
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

const mapWrap=document.getElementById('mapWrap');
const directory=document.getElementById('directory');
let currentIsland=null;
let currentCategory='Todas';

function escapeHtml(value){
  return String(value).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}

function endYear(person){return person.died??CURRENT_YEAR}
function lifeLabel(person){return `${person.born}–${person.died??'actualidad'}`}
function overlap(a,b){
  const start=Math.max(a.born,b.born);
  const end=Math.min(endYear(a),endYear(b));
  return start<=end?{start,end}:null;
}
function getConnections(person){
  return people
    .filter(other=>other.id!==person.id&&other.category===person.category&&overlap(person,other))
    .sort((a,b)=>{
      const oa=overlap(person,a),ob=overlap(person,b);
      return (ob.end-ob.start)-(oa.end-oa.start)||a.name.localeCompare(b.name,'es');
    });
}

Object.entries(islands).forEach(([slug,island])=>{
  const button=document.createElement('button');
  button.className='island-hotspot';
  button.dataset.island=slug;
  button.style.left=island.x+'%';
  button.style.top=island.y+'%';
  button.style.width=island.w+'%';
  button.style.height=island.h+'%';
  button.style.setProperty('--r',island.r+'deg');
  button.setAttribute('aria-label',`Abrir personas de ${island.name}`);
  button.addEventListener('click',()=>openIsland(slug));
  mapWrap.appendChild(button);
});

function scrollToDirectory(){
  directory.scrollIntoView({behavior:'smooth',block:'start'});
}

function renderHome(scroll=false){
  currentIsland=null;
  currentCategory='Todas';
  directory.innerHTML=`
    <div class="directory-inner home-note">
      <div class="eyebrow">Cómo explorar</div>
      <h2>El mapa es la puerta de entrada.</h2>
      <p>No hay marcadores ni etiquetas sobre las islas. Pulsa una de ellas y aparecerá aquí su directorio. Las conexiones solo se crean cuando dos personas pertenecen a la <em>misma categoría</em> y sus vidas se solaparon en el tiempo.</p>
    </div>`;
  if(scroll)scrollToDirectory();
}

function openIsland(slug){
  if(!islands[slug])return;
  currentIsland=slug;
  currentCategory='Todas';
  renderIslandList();
  scrollToDirectory();
}

function renderIslandList(query='',restoreFocus=false){
  const island=islands[currentIsland];
  const all=people.filter(p=>p.island===currentIsland);
  const q=query.trim().toLocaleLowerCase('es');
  const categories=['Todas',...new Set(all.map(p=>p.category))];
  const filtered=all
    .filter(p=>(currentCategory==='Todas'||p.category===currentCategory)&&p.name.toLocaleLowerCase('es').includes(q))
    .sort((a,b)=>a.name.localeCompare(b.name,'es'));
  const groups={};
  filtered.forEach(p=>{
    const letter=p.name[0].toLocaleUpperCase('es');
    (groups[letter]??=[]).push(p);
  });

  directory.innerHTML=`
    <div class="directory-inner">
      <div class="directory-head">
        <div>
          <div class="eyebrow">${all.length} ${all.length===1?'persona':'personas'}</div>
          <h2>${island.name}</h2>
          <p>Selecciona un perfil para descubrir qué personas de su misma categoría fueron contemporáneas durante una parte de su vida.</p>
        </div>
        <button class="back" id="backHome">Volver al mapa</button>
      </div>
      <div class="toolbar">
        <input class="search" id="search" placeholder="Buscar una persona…" value="${escapeHtml(query)}">
        <div class="chips">${categories.map(c=>`<button class="chip ${currentCategory===c?'active':''}" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('')}</div>
      </div>
      <div>${Object.keys(groups).length?Object.entries(groups).map(([letter,ps])=>`
        <div class="alpha-block">
          <div class="alpha-letter">${letter}</div>
          ${ps.map(p=>{
            const count=getConnections(p).length;
            return `<button class="person-row" data-person="${p.id}">
              <span><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(p.category)} · ${escapeHtml(p.discipline)} · ${escapeHtml(p.role)}</small></span>
              <span class="person-side"><span class="years">${lifeLabel(p)}</span><span class="connection-count">${count} ${count===1?'conexión':'conexiones'} vitales</span></span>
            </button>`;
          }).join('')}
        </div>`).join(''):'<div class="empty">No hay perfiles que coincidan con este filtro.</div>'}</div>
    </div>`;

  document.getElementById('backHome').addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  directory.querySelectorAll('[data-person]').forEach(el=>el.addEventListener('click',()=>openProfile(el.dataset.person)));
  directory.querySelectorAll('[data-cat]').forEach(el=>el.addEventListener('click',()=>{currentCategory=el.dataset.cat;renderIslandList(query)}));
  const search=document.getElementById('search');
  search.addEventListener('input',e=>renderIslandList(e.target.value,true));
  if(restoreFocus){search.focus();search.setSelectionRange(search.value.length,search.value.length)}
}

function openProfile(id){
  const person=people.find(p=>p.id===id);
  if(!person)return;
  currentIsland=person.island;
  const connections=getConnections(person);

  directory.innerHTML=`
    <div class="directory-inner profile-shell">
      <div class="directory-head">
        <div>
          <div class="profile-kicker">${escapeHtml(islands[person.island].name)} · ${escapeHtml(person.category)} · ${escapeHtml(person.discipline)}</div>
          <h2 class="profile-title">${escapeHtml(person.name)}</h2>
        </div>
        <button class="back" id="backIsland">Volver a ${escapeHtml(islands[person.island].name)}</button>
      </div>
      <div class="profile-meta">${lifeLabel(person)} · ${escapeHtml(person.role)}</div>
      <p class="profile-bio">${escapeHtml(person.bio)}</p>
      <div class="facts">
        <span class="fact"><b>Categoría</b>${escapeHtml(person.category)}</span>
        <span class="fact"><b>Disciplina</b>${escapeHtml(person.discipline)}</span>
        <span class="fact"><b>Isla</b>${escapeHtml(islands[person.island].name)}</span>
      </div>
      <h3 class="rel-title">Contemporáneos de su misma categoría</h3>
      <p class="rel-intro">La conexión significa únicamente que pertenecen a la misma categoría y que sus vidas se solaparon. No presupone que se conocieran o trabajaran juntos: esas relaciones deberán estar documentadas por separado.</p>
      ${connections.length?`<div class="connections-grid">${connections.map(other=>{
        const shared=overlap(person,other);
        return `<button class="rel-card" data-related="${other.id}">
          <strong>${escapeHtml(other.name)}</strong>
          <small>${escapeHtml(islands[other.island].name)} · ${escapeHtml(other.discipline)} · ${lifeLabel(other)}</small>
          <span class="overlap">Coincidencia vital · ${shared.start}–${shared.end===CURRENT_YEAR?'actualidad':shared.end}</span>
        </button>`;
      }).join('')}</div>`:'<div class="empty">Todavía no hay otra persona verificada de esta categoría cuya vida se solape con este perfil.</div>'}
    </div>`;

  document.getElementById('backIsland').addEventListener('click',()=>openIsland(person.island));
  directory.querySelectorAll('[data-related]').forEach(el=>el.addEventListener('click',()=>openProfile(el.dataset.related)));
  scrollToDirectory();
}

document.getElementById('homeButton').addEventListener('click',()=>{renderHome();window.scrollTo({top:0,behavior:'smooth'})});
document.getElementById('moreraDemo').addEventListener('click',()=>openProfile('luis-morera'));
renderHome();