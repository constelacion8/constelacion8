/* Navegación alternativa por las categorías principales de Constelación 8. */
const C8_MAIN_AREAS=['Artes','Ciencias','Deporte','Economía','Educación','Política','Sociedad'];
let c8ActiveMainArea=null;

/* Limpieza editorial del tramo final: se elimina el bloque explicativo de proyecto
   y el estado vacío del directorio para que las cifras sigan inmediatamente al explorador. */
(function c8StreamlineBottom(){
  document.getElementById('proyecto')?.remove();
  document.querySelector('.main-nav [data-scroll="proyecto"]')?.remove();
})();

(function c8InstallAreaStyles(){
  if(document.getElementById('c8MainAreaStyles'))return;
  const style=document.createElement('style');
  style.id='c8MainAreaStyles';
  style.textContent=`
    #islandSelector{display:flex!important;gap:9px;flex-wrap:wrap;margin-bottom:24px}
    #directory:empty{display:none}
    .area-chip{
      display:inline-flex;align-items:center;gap:8px;
      border:1px solid rgba(157,78,221,.42);
      background:rgba(59,10,106,.16);
      border-radius:999px;padding:10px 14px;
      font-family:"Work Sans",Arial,sans-serif;
      font-size:10px;letter-spacing:.04em;color:#F5EEFA;
      transition:.2s ease
    }
    .area-chip small{font-size:8px;color:#DCCFED;opacity:.9}
    .area-chip:hover,.area-chip.active{
      border-color:rgba(255,205,0,.72);
      background:var(--de8-yellow);color:#1A0633;
      box-shadow:0 0 24px rgba(255,205,0,.10)
    }
    .area-chip:hover small,.area-chip.active small{color:#1A0633;opacity:.72}
    .area-directory .person-row small{color:#E6DCEF}
    .profile-alias{margin-top:7px;font-size:12px;line-height:1.45;color:#E7DDF0}
    .profile-alias strong{font-weight:600;color:#fff}
    @media(max-width:620px){
      #islandSelector{gap:8px;margin-bottom:22px}
      .area-chip{font-size:13px;padding:10px 13px}
      .area-chip small{font-size:11px}
      .profile-alias{font-size:14px}
    }
  `;
  document.head.appendChild(style);
})();

function c8PersonMatchesArea(person,area){
  const categories=person.categories?.length?person.categories:[person.category].filter(Boolean);
  return categories.includes(area);
}

function c8MainAreaCounts(){
  return Object.fromEntries(C8_MAIN_AREAS.map(area=>[
    area,
    people.filter(person=>c8PersonMatchesArea(person,area)).length
  ]));
}

function c8UseCivilNamesForLucha(){
  people.forEach(person=>{
    const isLucha=(person.disciplines??[]).includes('Lucha canaria')||person.discipline==='Lucha canaria';
    if(!isLucha||!person.fullName)return;
    if(!person.c8Alias&&person.name&&person.name!==person.fullName)person.c8Alias=person.name;
    person.name=person.fullName;
  });
}

renderIslandSelector=function(){
  if(!islandSelector)return;
  const counts=c8MainAreaCounts();
  islandSelector.setAttribute('aria-label','Categorías principales');
  islandSelector.innerHTML=C8_MAIN_AREAS.map(area=>
    `<button class="area-chip ${c8ActiveMainArea===area?'active':''}" data-main-area="${escapeHtml(area)}"><span>${escapeHtml(area)}</span><small>${counts[area]??0}</small></button>`
  ).join('');
  islandSelector.querySelectorAll('[data-main-area]').forEach(button=>button.addEventListener('click',()=>{
    c8ActiveMainArea=button.dataset.mainArea;
    currentIsland=null;
    currentCategory='Todas';
    setMapActive(null);
    setTooltip(null);
    renderIslandSelector();
    renderMainAreaDirectory(c8ActiveMainArea);
  }));
};

renderEmpty=function(){
  if(!directory)return;
  directory.innerHTML='';
};

function renderMainAreaDirectory(area){
  if(!directory||!C8_MAIN_AREAS.includes(area))return;
  const matches=people
    .filter(person=>c8PersonMatchesArea(person,area))
    .sort((a,b)=>a.name.localeCompare(b.name,'es'));
  const groups={};
  matches.forEach(person=>{
    const letter=(person.name?.[0]||'#').toLocaleUpperCase('es');
    (groups[letter]??=[]).push(person);
  });

  directory.innerHTML=`
    <div class="directory-inner area-directory">
      <div class="directory-head">
        <div><h3>${escapeHtml(area)}</h3><p>Personas de esta categoría · todas las islas · orden alfabético</p></div>
        <div class="directory-count">${matches.length} ${matches.length===1?'perfil':'perfiles'}</div>
      </div>
      <div>${Object.entries(groups).length?Object.entries(groups).map(([letter,list])=>`
        <div class="alpha-block">
          <div class="alpha-letter">${letter}</div>
          <div class="people-list">${list.map(person=>`
            <button class="person-row" data-area-person="${person.id}">
              <span><strong>${escapeHtml(person.name)}</strong><small>${escapeHtml(personIslandName(person))} · ${escapeHtml(person.discipline)}</small></span>
              <span class="person-year">${escapeHtml(lifeLabel(person))} <b class="person-arrow">↗</b></span>
            </button>`).join('')}</div>
        </div>`).join(''):'<div class="directory-empty"><strong>Todavía no hay perfiles en esta categoría.</strong></div>'}</div>
    </div>`;

  directory.querySelectorAll('[data-area-person]').forEach(button=>button.addEventListener('click',()=>openProfile(button.dataset.areaPerson)));
  document.getElementById('explorar')?.scrollIntoView({behavior:'smooth',block:'start'});
}

/* El mapa sigue siendo la navegación territorial principal. Al entrar por isla,
   se desactiva el estado de categoría global sin retirar las categorías de la vista. */
const c8OriginalOpenIsland=openIsland;
openIsland=function(slug,scroll=true){
  c8ActiveMainArea=null;
  c8OriginalOpenIsland(slug,scroll);
};

const c8OriginalOpenProfileForAliases=openProfile;
openProfile=function(id){
  c8OriginalOpenProfileForAliases(id);
  const person=people.find(item=>item.id===id);
  if(!person?.c8Alias||person.c8Alias===person.name)return;
  const heading=directory?.querySelector('.profile-top h3');
  if(!heading||directory.querySelector('.profile-alias'))return;
  heading.insertAdjacentHTML('afterend',`<div class="profile-alias">Conocido en los terreros como <strong>${escapeHtml(person.c8Alias)}</strong></div>`);
};

const c8ExplorerEyebrow=document.querySelector('#explorar .section-heading .eyebrow');
const c8ExplorerCopy=document.querySelector('#explorar .section-heading>p:last-child');
if(c8ExplorerEyebrow)c8ExplorerEyebrow.textContent='Explora por territorio o categoría';
if(c8ExplorerCopy)c8ExplorerCopy.textContent='Pulsa una isla en el mapa para recorrer sus biografías o entra por una de las categorías principales para descubrir personas de todo el archipiélago.';

c8UseCivilNamesForLucha();
renderIslandSelector();
if(!currentIsland)renderEmpty();

window.addEventListener('c8:data-ready',()=>{
  c8UseCivilNamesForLucha();
  renderIslandSelector();
  if(c8ActiveMainArea)renderMainAreaDirectory(c8ActiveMainArea);
  else if(currentIsland)renderIslandList();
  else renderEmpty();
});

(function loadEditorialEnhancements(){
  const assets=[
    ['full-name-display.js?v=20260725-2245','data-c8-full-names'],
    ['constellation-stats.js?v=20260725-2318','data-c8-constellation-stats']
  ];
  assets.forEach(([src,marker])=>{
    if(document.querySelector(`script[${marker}]`))return;
    const script=document.createElement('script');
    script.src=src;
    script.setAttribute(marker,'true');
    script.async=false;
    document.body.appendChild(script);
  });
})();