/* Ajustes de interacción del directorio y firma de portada. */
(function refineHeroCopy(){
  const lead=document.querySelector('#inicio .hero-lead');
  if(!lead)return;
  lead.textContent='Elige una isla del mapa y empieza el recorrido.';
})();

(function moveHeroCreditBelowCoincidences(){
  const hero=document.getElementById('inicio');
  const credit=hero?.querySelector('.hero-presenter');
  const oldSignature=hero?.querySelector('.creator-signature');
  const coincidencesLink=hero?.querySelector('.hero-down');

  oldSignature?.remove();
  if(!hero||!credit||!coincidencesLink)return;

  credit.className='hero-credit-below';
  credit.setAttribute('aria-label','Creado por DE8 Films');
  credit.innerHTML='<span>Creado por</span><strong>DE8 Films.</strong>';
  coincidencesLink.insertAdjacentElement('afterend',credit);

  if(!document.getElementById('heroCreditBelowStyles')){
    const style=document.createElement('style');
    style.id='heroCreditBelowStyles';
    style.textContent=`
      .hero-credit-below{
        position:relative;
        z-index:5;
        order:10;
        display:flex;
        align-items:baseline;
        justify-content:center;
        gap:7px;
        margin-top:0;
        font-family:"Work Sans",Arial,sans-serif;
        color:#fff;
      }
      .hero-credit-below span{
        font-size:9px;
        line-height:1;
        font-weight:400;
        letter-spacing:.02em;
        color:#fff;
        white-space:nowrap;
      }
      .hero-credit-below strong{
        font-family:"Work Sans",Arial,sans-serif;
        font-size:15px;
        line-height:1;
        font-weight:700;
        letter-spacing:-.045em;
        color:#fff;
        white-space:nowrap;
      }
      @media(max-width:620px){
        .hero-credit-below{gap:6px;margin-top:1px}
        .hero-credit-below span{font-size:10px}
        .hero-credit-below strong{font-size:15px}
      }
    `;
    document.head.appendChild(style);
  }
})();

/* Búsqueda manual del directorio: no filtra mientras el usuario escribe. */
let c8DirectorySearchQuery='';
let c8DirectorySearchIsland=null;

function c8NormalizeSearchText(value){
  return String(value??'')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLocaleLowerCase('es')
    .replace(/\s+/g,' ')
    .trim();
}

renderIslandList=function(query){
  if(!currentIsland||!islands[currentIsland])return;

  if(c8DirectorySearchIsland!==currentIsland){
    c8DirectorySearchIsland=currentIsland;
    c8DirectorySearchQuery='';
  }
  if(typeof query==='string')c8DirectorySearchQuery=query.trim();

  const all=people.filter(person=>person.island===currentIsland);
  const normalizedQuery=c8NormalizeSearchText(c8DirectorySearchQuery);
  const filtered=all
    .filter(person=>categoryMatches(person,currentCategory))
    .filter(person=>{
      if(!normalizedQuery)return true;
      const searchable=c8NormalizeSearchText(`${person.name??''} ${person.fullName??''} ${person.alias??''} ${person.c8Alias??''}`);
      return searchable.includes(normalizedQuery);
    })
    .sort((a,b)=>a.name.localeCompare(b.name,'es'));

  const groups={};
  filtered.forEach(person=>{
    const letter=person.name[0].toLocaleUpperCase('es');
    (groups[letter]??=[]).push(person);
  });

  const categories=categoriesForIsland(all);
  const chips=categories.map(category=>{
    const count=category==='Todas'?all.length:all.filter(person=>categoryMatches(person,category)).length;
    return `<button class="chip ${currentCategory===category?'active':''}" data-cat="${escapeHtml(category)}">${escapeHtml(category)}<small>${count}</small></button>`;
  }).join('');

  const noResults=normalizedQuery
    ? `<div class="directory-empty"><strong>Esta persona no está incluida ahora mismo en Constelación 8.</strong><p>No hemos encontrado «${escapeHtml(c8DirectorySearchQuery)}» entre los perfiles verificados de ${escapeHtml(islands[currentIsland].name)}. Vuelve pronto: la base de datos se amplía continuamente con nuevas biografías.</p></div>`
    : '<div class="directory-empty"><strong>No hay perfiles en este filtro.</strong><p>Prueba con otra categoría.</p></div>';

  directory.innerHTML=`
    <div class="directory-inner">
      <div class="directory-head">
        <div><h3>${escapeHtml(islands[currentIsland].name)}</h3><p>Personas nacidas en la isla · orden alfabético · datos sincronizados con Supabase</p></div>
        <div class="directory-count">${all.length} ${all.length===1?'perfil verificado':'perfiles verificados'}</div>
      </div>
      <div class="toolbar">
        <form id="directorySearchForm" role="search" style="display:flex;flex:1;align-items:center;gap:8px;min-width:min(100%,360px);width:100%">
          <input class="search" id="searchPeople" type="search" autocomplete="off" enterkeyhint="search" aria-label="Buscar una persona" placeholder="Escribe un nombre y pulsa Buscar" value="${escapeHtml(c8DirectorySearchQuery)}">
          <button class="profile-back" type="submit" style="flex:none;min-height:38px;padding-inline:14px">Buscar</button>
          ${normalizedQuery?'<button class="profile-back" id="clearDirectorySearch" type="button" style="flex:none;min-height:38px">Ver todos</button>':''}
        </form>
        <div class="chips">${chips}</div>
      </div>
      <div>${Object.entries(groups).length?Object.entries(groups).map(([letter,list])=>`
        <div class="alpha-block">
          <div class="alpha-letter">${letter}</div>
          <div class="people-list">${list.map(person=>`
            <button class="person-row" data-person="${person.id}">
              <span><strong>${escapeHtml(person.name)}</strong><small>${escapeHtml(person.category)} · ${escapeHtml(person.discipline)}${person.municipality?` · ${escapeHtml(person.municipality)}`:''}</small></span>
              <span class="person-year">${escapeHtml(lifeLabel(person))}</span>
            </button>`).join('')}</div>
        </div>`).join(''):noResults}</div>
    </div>`;

  const form=document.getElementById('directorySearchForm');
  const search=document.getElementById('searchPeople');
  form?.addEventListener('submit',event=>{
    event.preventDefault();
    currentCategory='Todas';
    renderIslandList(search?.value??'');
  });
  document.getElementById('clearDirectorySearch')?.addEventListener('click',()=>{
    c8DirectorySearchQuery='';
    currentCategory='Todas';
    renderIslandList('');
    document.getElementById('searchPeople')?.focus();
  });
  directory.querySelectorAll('[data-cat]').forEach(button=>button.addEventListener('click',()=>{
    currentCategory=button.dataset.cat;
    renderIslandList(c8DirectorySearchQuery);
  }));
  directory.querySelectorAll('[data-person]').forEach(button=>button.addEventListener('click',()=>openProfile(button.dataset.person)));
};

/* La navegación territorial ya vive en el mapa. Cargamos una segunda entrada por categorías principales. */
(function loadCategoryBrowser(){
  if(document.querySelector('script[data-c8-category-browser]'))return;
  const script=document.createElement('script');
  script.src='category-browser.js?v=20260726-0405';
  script.dataset.c8CategoryBrowser='true';
  script.async=false;
  document.body.appendChild(script);
})();

/* Los directorios de isla se abren en una vista interna independiente del home. */
(function loadIslandView(){
  if(document.querySelector('script[data-c8-island-view]'))return;
  const script=document.createElement('script');
  script.src='island-view.js?v=20260726-0500';
  script.dataset.c8IslandView='true';
  script.async=false;
  document.body.appendChild(script);
})();

/* Norma general: después de la capa de categorías, el nombre civil completo manda en toda la interfaz. */
(function loadFullNameDisplay(){
  if(document.querySelector('script[data-c8-full-name-display]'))return;
  const script=document.createElement('script');
  script.src='full-name-display.js?v=20260725-2245';
  script.dataset.c8FullNameDisplay='true';
  script.async=false;
  document.body.appendChild(script);
})();

/* Estadísticas vivas: se recalculan desde Supabase y se insertan al final de la web. */
(function loadConstellationStats(){
  if(document.querySelector('script[data-c8-constellation-stats]'))return;
  const script=document.createElement('script');
  script.src='constellation-stats.js?v=20260725-2318';
  script.dataset.c8ConstellationStats='true';
  script.async=false;
  document.body.appendChild(script);
})();

/* Métricas territoriales e Índice de trascendencia C8. */
(function loadConstellationRanking(){
  if(document.querySelector('script[data-c8-constellation-ranking]'))return;
  const script=document.createElement('script');
  script.src='constellation-ranking.js?v=20260726-0110';
  script.dataset.c8ConstellationRanking='true';
  script.async=false;
  document.body.appendChild(script);
})();