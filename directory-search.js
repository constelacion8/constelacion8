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
      const searchable=c8NormalizeSearchText(`${person.name??''} ${person.fullName??''}`);
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
              <span class="person-year">${escapeHtml(lifeLabel(person))} <b class="person-arrow">↗</b></span>
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
