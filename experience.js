const timeForm=document.getElementById('timeForm');
const timeName=document.getElementById('timeName');
const timeBirth=document.getElementById('timeBirth');
const timeResults=document.getElementById('timeResults');

// Firma principal: logo real de DE8 Films + "presenta".
// Se inserta como imagen real para no depender de pseudo-elementos ni de la caché de refine.css.
const heroEyebrow=document.querySelector('#inicio .hero-intro .eyebrow');
if(heroEyebrow){
  const logoStyle=document.createElement('style');
  logoStyle.textContent=`
    #inicio .hero-intro .eyebrow::before,#inicio .hero-intro .eyebrow::after{display:none!important}
    #inicio .hero-intro .eyebrow{font-size:initial!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:10px!important;color:#FFCD00!important}
    #inicio .hero-intro .de8-presenta-logo{display:block;width:116px;height:22px;object-fit:contain;flex:none;filter:drop-shadow(0 0 12px rgba(255,255,255,.08))}
    #inicio .hero-intro .de8-presenta-word{font-family:"Work Sans",Arial,sans-serif;font-size:8px;font-weight:500;letter-spacing:.25em;text-transform:uppercase;color:#FFCD00}
    footer .de8-footer-logo{display:block;width:100px;height:18px;object-fit:contain}
    @media(max-width:620px){#inicio .hero-intro .de8-presenta-logo{width:102px;height:19px}#inicio .hero-intro .de8-presenta-word{font-size:7px}footer .de8-footer-logo{width:90px;height:16px}}
  `;
  document.head.appendChild(logoStyle);
  heroEyebrow.innerHTML='<img class="de8-presenta-logo" src="assets/de8-logo.svg?v=5" alt="DE8 Films"><span class="de8-presenta-word">presenta</span>';
}

// El pie usa exactamente el mismo recurso de marca.
const footerWordmark=document.querySelector('.footer-de8 .de8-wordmark');
if(footerWordmark){
  footerWordmark.outerHTML='<img class="de8-footer-logo" src="assets/de8-logo.svg?v=5" alt="DE8 Films">';
}

// Taxonomía editorial principal. Se mantiene visible aunque una categoría todavía no tenga perfiles.
const C8_CATEGORIES=[
  {label:'Todas',values:null},
  {label:'Arte',values:['Arte','Artes']},
  {label:'Ciencia',values:['Ciencia','Ciencias']},
  {label:'Política',values:['Política']},
  {label:'Deporte',values:['Deporte','Deportes']},
  {label:'Economía y empresa',values:['Economía','Economía y empresa','Empresa']},
  {label:'Educación',values:['Educación']},
  {label:'Humanidades y pensamiento',values:['Humanidades','Humanidades y pensamiento','Pensamiento']},
  {label:'Comunicación',values:['Comunicación','Periodismo']},
  {label:'Sociedad',values:['Sociedad','Activismo']}
];

function c8CategoryMatches(person,categoryLabel){
  if(categoryLabel==='Todas')return true;
  const def=C8_CATEGORIES.find(category=>category.label===categoryLabel);
  return def ? def.values.includes(person.category) : person.category===categoryLabel;
}

// Sustituye el filtro provisional (que solo mostraba categorías con personas cargadas)
// por la taxonomía completa del atlas.
renderIslandList=function(query=''){
  const all=people.filter(p=>p.island===currentIsland);
  const q=query.trim().toLocaleLowerCase('es');
  const filtered=all
    .filter(p=>c8CategoryMatches(p,currentCategory) && p.name.toLocaleLowerCase('es').includes(q))
    .sort((a,b)=>a.name.localeCompare(b.name,'es'));
  const groups={};
  filtered.forEach(p=>{const letter=p.name[0].toLocaleUpperCase('es');(groups[letter]??=[]).push(p)});

  const chips=C8_CATEGORIES.map(category=>{
    const count=category.label==='Todas' ? all.length : all.filter(person=>c8CategoryMatches(person,category.label)).length;
    return `<button class="chip ${currentCategory===category.label?'active':''}" data-cat="${escapeHtml(category.label)}">${escapeHtml(category.label)}<small>${count}</small></button>`;
  }).join('');

  directory.innerHTML=`
    <div class="directory-inner">
      <div class="directory-head">
        <div><h3>${escapeHtml(islands[currentIsland].name)}</h3><p>Personas nacidas en la isla · orden alfabético</p></div>
        <div class="directory-count">${all.length} ${all.length===1?'perfil':'perfiles'} en esta versión</div>
      </div>
      <div class="toolbar">
        <input class="search" id="searchPeople" placeholder="Buscar una persona…" value="${escapeHtml(query)}">
        <div class="chips">${chips}</div>
      </div>
      <div>${Object.entries(groups).length ? Object.entries(groups).map(([letter,list])=>`
        <div class="alpha-block">
          <div class="alpha-letter">${letter}</div>
          <div class="people-list">${list.map(p=>`
            <button class="person-row" data-person="${p.id}">
              <span><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(p.category)} · ${escapeHtml(p.discipline)} · ${escapeHtml(p.role)}</small></span>
              <span class="person-year">${lifeLabel(p)} <b class="person-arrow">↗</b></span>
            </button>`).join('')}</div>
        </div>`).join('') : `<div class="directory-empty"><strong>Aún no hay perfiles en ${escapeHtml(currentCategory)}.</strong><p>La categoría forma parte de la estructura definitiva y se irá poblando a medida que incorporemos biografías.</p></div>`}</div>
    </div>`;

  const search=document.getElementById('searchPeople');
  search.addEventListener('input',e=>renderIslandList(e.target.value));
  directory.querySelectorAll('[data-cat]').forEach(btn=>btn.addEventListener('click',()=>{currentCategory=btn.dataset.cat;renderIslandList(query)}));
  directory.querySelectorAll('[data-person]').forEach(btn=>btn.addEventListener('click',()=>openProfile(btn.dataset.person)));
};

if(timeBirth)timeBirth.max=new Date().toISOString().slice(0,10);

function userOverlap(birthYear,person){
  const start=Math.max(birthYear,person.born);
  const end=Math.min(CURRENT_YEAR,person.died??CURRENT_YEAR);
  if(start>end)return null;
  return {start,end,years:Math.max(0,end-start)};
}

function temporalMatches(birthYear){
  return people
    .map(person=>({person,overlap:userOverlap(birthYear,person)}))
    .filter(item=>item.overlap)
    .sort((a,b)=>b.overlap.years-a.overlap.years || a.person.name.localeCompare(b.person.name,'es'));
}

function renderTemporalMatches(name,birthYear){
  const matches=temporalMatches(birthYear);
  const longest=matches[0]?.overlap?.years??0;
  const bornBefore=matches.filter(item=>item.person.born<=birthYear).length;

  timeResults.innerHTML=`
    <div class="time-summary">
      <span><b>${matches.length}</b> vidas coincidentes</span>
      <span><b>${longest}</b> años de coincidencia máxima</span>
      <span><b>${bornBefore}</b> ya habían nacido cuando llegaste</span>
    </div>
    ${matches.length?`<div class="time-match-grid">${matches.map(({person,overlap})=>{
      const endLabel=overlap.end===CURRENT_YEAR?'actualidad':overlap.end;
      const duration=overlap.years===0?'menos de un año':`${overlap.years} ${overlap.years===1?'año':'años'}`;
      return `<button class="time-person" data-time-person="${person.id}">
        <strong>${escapeHtml(person.name)}</strong>
        <small>${escapeHtml(islands[person.island].name)} · ${escapeHtml(person.discipline)} · ${lifeLabel(person)}</small>
        <span class="time-overlap">Coincidisteis ${duration} · ${overlap.start}–${endLabel}</span>
      </button>`;
    }).join('')}</div>`:`<div class="time-empty">${escapeHtml(name)}, con los perfiles incorporados a esta versión todavía no aparece ninguna coincidencia temporal. La herramienta crecerá con el atlas.</div>`}`;

  timeResults.querySelectorAll('[data-time-person]').forEach(button=>button.addEventListener('click',()=>openProfile(button.dataset.timePerson)));
}

if(timeForm){
  timeForm.addEventListener('submit',event=>{
    event.preventDefault();
    const name=timeName.value.trim();
    const raw=timeBirth.value;
    if(!name||!raw)return;
    const birthYear=new Date(`${raw}T00:00:00`).getFullYear();
    if(!Number.isFinite(birthYear)||birthYear>CURRENT_YEAR)return;
    renderTemporalMatches(name,birthYear);
  });
}
