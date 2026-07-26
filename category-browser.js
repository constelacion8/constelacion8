/* Navegación por intereses: segunda puerta de entrada a Constelación 8. */
const C8_MAIN_AREAS=['Artes','Ciencias','Deporte','Educación','Política','Sociedad'];
let c8ActiveMainArea=null;

(function installInterestBrowser(){
  const explorer=document.getElementById('explorar');
  const selector=document.getElementById('islandSelector');
  const heading=explorer?.querySelector('.section-heading');
  const eyebrow=heading?.querySelector('.eyebrow');
  const title=heading?.querySelector('h2');
  const copy=heading?.querySelector('p:last-child');

  document.getElementById('proyecto')?.remove();
  document.querySelector('.main-nav [data-scroll="proyecto"]')?.remove();

  /* El mapa sigue siendo la entrada territorial principal del menú. */
  document.querySelectorAll('[data-scroll="explorar"]').forEach(button=>{
    button.dataset.scroll='archipelagoStage';
  });

  if(eyebrow)eyebrow.textContent='Explora por intereses';
  if(title)title.textContent='Busca a través de tus intereses.';

  if(!document.getElementById('c8InterestBrowserStyles')){
    const style=document.createElement('style');
    style.id='c8InterestBrowserStyles';
    style.textContent=`
      #explorar{padding-top:86px}
      #explorar .section-heading{max-width:800px;margin-bottom:30px}
      #explorar .section-heading h2{max-width:780px}
      #explorar .section-heading>p:last-child{max-width:690px;color:#C9BBD5}
      #islandSelector.c8-interest-grid{
        display:grid!important;
        grid-template-columns:repeat(3,minmax(0,1fr));
        gap:12px;
        margin:0 0 34px;
      }
      .c8-interest-card{
        position:relative;overflow:hidden;
        min-height:122px;padding:20px 20px 18px;
        display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;
        border:1px solid rgba(157,78,221,.34);border-radius:20px;
        background:linear-gradient(145deg,rgba(59,10,106,.34),rgba(21,4,39,.78));
        box-shadow:0 18px 55px rgba(0,0,0,.12);
        color:#fff;text-align:left;transition:transform .2s ease,border-color .2s ease,background .2s ease,box-shadow .2s ease;
      }
      .c8-interest-card:before{
        content:"";position:absolute;width:150px;height:150px;right:-72px;top:-80px;border-radius:50%;
        background:radial-gradient(circle,rgba(255,205,0,.13),transparent 68%);pointer-events:none;
      }
      .c8-interest-card:hover,.c8-interest-card:focus-visible{
        transform:translateY(-3px);border-color:rgba(255,205,0,.7);
        background:linear-gradient(145deg,rgba(79,15,139,.48),rgba(27,5,48,.9));
        box-shadow:0 22px 60px rgba(0,0,0,.2),0 0 30px rgba(255,205,0,.06);outline:none;
      }
      .c8-interest-card.active{
        border-color:#FFCD00;background:linear-gradient(145deg,#FFCD00,#EFC000);color:#1A0633;
        box-shadow:0 18px 46px rgba(255,205,0,.15)
      }
      .c8-interest-topline{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%}
      .c8-interest-badge{
        min-height:24px;display:inline-flex;align-items:center;border:1px solid rgba(255,205,0,.26);border-radius:999px;
        padding:5px 8px;font-family:"Work Sans",Arial,sans-serif;font-size:8px;letter-spacing:.11em;text-transform:uppercase;color:#FFCD00
      }
      .c8-interest-card.active .c8-interest-badge{border-color:rgba(26,6,51,.22);color:#1A0633}
      .c8-interest-arrow{
        width:29px;height:29px;border-radius:50%;display:grid;place-items:center;
        border:1px solid rgba(255,255,255,.16);font-size:15px;color:#FFCD00;transition:transform .2s ease
      }
      .c8-interest-card:hover .c8-interest-arrow{transform:translate(2px,-2px)}
      .c8-interest-card.active .c8-interest-arrow{border-color:rgba(26,6,51,.22);color:#1A0633}
      .c8-interest-label{
        display:block;margin-top:18px;font-family:"Work Sans",Arial,sans-serif;font-size:clamp(21px,2.1vw,29px);
        line-height:1;font-weight:600;letter-spacing:-.045em;color:inherit
      }
      .c8-interest-count{display:block;margin-top:8px;font-size:11px;color:#CBBBD8}
      .c8-interest-card.active .c8-interest-count{color:rgba(26,6,51,.72)}
      .area-directory{margin-top:8px}
      .profile-alias{margin-top:7px;font-size:12px;line-height:1.45;color:#E7DDF0}
      .profile-alias strong{font-weight:600;color:#fff}
      #explorar.c8-island-mode .section-heading,#explorar.c8-island-mode #islandSelector{display:none!important}
      #explorar.c8-island-mode .directory-shell{margin-top:0}
      @media(max-width:820px){
        #islandSelector.c8-interest-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
      }
      @media(max-width:620px){
        #explorar{padding-top:68px}
        #explorar .section-heading{margin-bottom:24px}
        #explorar .section-heading h2{font-size:34px!important;line-height:1.02}
        #explorar .section-heading>p:last-child{font-size:16px!important;line-height:1.6}
        #islandSelector.c8-interest-grid{gap:9px;margin-bottom:26px}
        .c8-interest-card{min-height:108px;padding:16px;border-radius:17px}
        .c8-interest-label{font-size:20px;margin-top:14px}
        .c8-interest-count{font-size:12px;margin-top:7px}
        .c8-interest-badge{font-size:9px;padding:4px 7px}
        .c8-interest-arrow{width:27px;height:27px}
        .profile-alias{font-size:14px}
      }
    `;
    document.head.appendChild(style);
  }

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

  function c8TopArea(counts){
    return C8_MAIN_AREAS
      .map(area=>({area,count:counts[area]??0}))
      .sort((a,b)=>b.count-a.count||a.area.localeCompare(b.area,'es'))[0]??null;
  }

  function c8UpdateInterestCopy(counts){
    const top=c8TopArea(counts);
    if(!copy||!top)return;
    copy.textContent=`${top.area} es ahora mismo la categoría más poblada, con ${top.count} ${top.count===1?'perfil':'perfiles'}. Elige el ámbito que más te interese y empieza por ahí.`;
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
    if(!selector)return;
    const counts=c8MainAreaCounts();
    const top=c8TopArea(counts);
    c8UpdateInterestCopy(counts);
    selector.className='island-selector c8-interest-grid';
    selector.removeAttribute('aria-hidden');
    selector.setAttribute('aria-label','Explorar por intereses');
    selector.innerHTML=C8_MAIN_AREAS.map(area=>{
      const isTop=top?.area===area;
      const count=counts[area]??0;
      return `<button class="c8-interest-card ${c8ActiveMainArea===area?'active':''}" data-main-area="${escapeHtml(area)}" type="button">
        <span class="c8-interest-topline"><span class="c8-interest-badge">${isTop?'Más poblada':'Explorar'}</span><span class="c8-interest-arrow" aria-hidden="true">↗</span></span>
        <span><strong class="c8-interest-label">${escapeHtml(area)}</strong><small class="c8-interest-count">${count} ${count===1?'perfil':'perfiles'}</small></span>
      </button>`;
    }).join('');
    selector.querySelectorAll('[data-main-area]').forEach(button=>button.addEventListener('click',()=>{
      c8ActiveMainArea=button.dataset.mainArea;
      currentIsland=null;
      currentCategory='Todas';
      explorer?.classList.remove('c8-island-mode');
      setMapActive(null);
      setTooltip(null);
      renderIslandSelector();
      renderMainAreaDirectory(c8ActiveMainArea);
    }));
  };

  renderEmpty=function(){
    if(directory)directory.innerHTML='';
    explorer?.classList.remove('c8-island-mode');
  };

  window.renderMainAreaDirectory=function(area){
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
          <div><h3>${escapeHtml(area)}</h3><p>Personas vinculadas a ${escapeHtml(area.toLocaleLowerCase('es'))} · todas las islas · orden alfabético</p></div>
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
  };

  const c8OriginalOpenIsland=openIsland;
  openIsland=function(slug,scroll=true){
    c8ActiveMainArea=null;
    explorer?.classList.add('c8-island-mode');
    c8OriginalOpenIsland(slug,scroll);
  };

  const c8OriginalOpenProfile=openProfile;
  openProfile=function(id){
    c8OriginalOpenProfile(id);
    const person=people.find(item=>item.id===id);
    if(!person?.c8Alias||person.c8Alias===person.name)return;
    const profileHeading=directory?.querySelector('.profile-top h3');
    if(!profileHeading||directory.querySelector('.profile-alias'))return;
    profileHeading.insertAdjacentHTML('afterend',`<div class="profile-alias">Conocido en los terreros como <strong>${escapeHtml(person.c8Alias)}</strong></div>`);
  };

  c8UseCivilNamesForLucha();
  renderIslandSelector();
  if(c8ActiveMainArea)renderMainAreaDirectory(c8ActiveMainArea);
  else if(currentIsland){explorer?.classList.add('c8-island-mode');renderIslandList();}
  else renderEmpty();

  window.addEventListener('c8:data-ready',()=>{
    c8UseCivilNamesForLucha();
    renderIslandSelector();
    if(c8ActiveMainArea)renderMainAreaDirectory(c8ActiveMainArea);
    else if(currentIsland){explorer?.classList.add('c8-island-mode');renderIslandList();}
    else renderEmpty();
  });
})();