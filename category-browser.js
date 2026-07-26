/* Navegación por categorías: segunda puerta de entrada a Constelación 8. */
const C8_MAIN_AREAS=['Artes','Ciencias','Deporte','Educación','Política','Sociedad'];
let c8ActiveMainArea=null;

(function installCategoryBrowser(){
  const explorer=document.getElementById('explorar');
  const wrap=explorer?.querySelector('.section-wrap');
  const directory=document.getElementById('directory');
  const header=document.querySelector('.site-header');
  const heading=explorer?.querySelector('.section-heading');
  const eyebrow=heading?.querySelector('.eyebrow');
  const title=heading?.querySelector('h2');
  const copy=heading?.querySelector('p:last-child');

  if(!explorer||!wrap||!directory)return;

  document.getElementById('proyecto')?.remove();
  document.querySelector('.main-nav [data-scroll="proyecto"]')?.remove();
  if(eyebrow)eyebrow.textContent='Explora por categorías';
  if(title)title.textContent='Elige por dónde entrar en la constelación.';

  let selector=document.getElementById('islandSelector');
  if(!selector){
    selector=document.createElement('div');
    selector.id='islandSelector';
    selector.className='island-selector';
    selector.setAttribute('aria-label','Explorar por categorías');
    wrap.insertBefore(selector,directory);
  }

  let categoryNav=document.getElementById('c8CategoryViewNav');
  if(!categoryNav){
    categoryNav=document.createElement('div');
    categoryNav.id='c8CategoryViewNav';
    categoryNav.className='c8-category-view-nav';
    categoryNav.innerHTML='<button type="button" class="c8-category-view-back" id="c8CategoryViewBack">Volver a categorías</button><span class="c8-category-view-context"><small>Categoría</small><strong id="c8CategoryViewName"></strong></span>';
    wrap.insertBefore(categoryNav,directory);
  }

  if(!document.getElementById('c8CategoryBrowserStyles')){
    const style=document.createElement('style');
    style.id='c8CategoryBrowserStyles';
    style.textContent=`
      #explorar{padding-top:74px!important;padding-bottom:78px}
      #explorar .section-heading{max-width:820px;margin-bottom:26px}
      #explorar .section-heading .eyebrow{color:#FFCD00}
      #explorar .section-heading h2{max-width:760px;font-size:clamp(31px,4.2vw,54px);line-height:1.02}
      #explorar .section-heading>p:last-child{max-width:720px;color:#C9BBD5;font-size:14px;line-height:1.7}

      #directory:empty{display:none!important;min-height:0!important;border:0!important;background:none!important;box-shadow:none!important}

      #islandSelector.c8-interest-grid{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:0 0 30px}
      .c8-interest-card{
        position:relative;overflow:hidden;min-height:132px;padding:18px 19px 17px;
        display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;
        border:1px solid rgba(157,78,221,.34);border-radius:20px;
        background:linear-gradient(145deg,rgba(59,10,106,.34),rgba(21,4,39,.82));
        box-shadow:0 18px 55px rgba(0,0,0,.12);color:#fff;text-align:left;
        transition:transform .2s ease,border-color .2s ease,background .2s ease,box-shadow .2s ease
      }
      .c8-interest-card:before{
        content:"";position:absolute;width:150px;height:150px;right:-72px;top:-80px;border-radius:50%;
        background:radial-gradient(circle,rgba(157,78,221,.18),transparent 68%);pointer-events:none
      }
      .c8-interest-card:hover,.c8-interest-card:focus-visible{
        transform:translateY(-3px);border-color:rgba(255,205,0,.72);
        background:linear-gradient(145deg,rgba(79,15,139,.48),rgba(27,5,48,.92));
        box-shadow:0 22px 60px rgba(0,0,0,.2),0 0 30px rgba(255,205,0,.06);outline:none
      }
      .c8-interest-card.c8-interest-featured{
        grid-column:span 2;min-height:150px;padding:21px 23px 20px;border-color:rgba(255,205,0,.64);
        background:radial-gradient(circle at 83% 18%,rgba(255,205,0,.15),transparent 27%),linear-gradient(135deg,rgba(78,20,127,.82),rgba(29,5,51,.94));
        box-shadow:0 24px 70px rgba(0,0,0,.2),0 0 42px rgba(255,205,0,.08)
      }
      .c8-interest-card.c8-interest-featured:before{width:220px;height:220px;right:-62px;top:-112px;background:radial-gradient(circle,rgba(255,205,0,.23),rgba(255,205,0,.05) 37%,transparent 69%)}
      .c8-interest-topline{display:flex;align-items:center;justify-content:flex-start;width:100%;position:relative;z-index:2}
      .c8-interest-badge{min-height:24px;display:inline-flex;align-items:center;border:1px solid rgba(255,205,0,.34);border-radius:999px;padding:5px 8px;font-family:"Work Sans",Arial,sans-serif;font-size:9px;letter-spacing:.11em;text-transform:uppercase;color:#FFCD00}
      .c8-interest-featured .c8-interest-badge{background:rgba(255,205,0,.07);border-color:rgba(255,205,0,.52);font-weight:600}
      .c8-interest-body{position:relative;z-index:2;display:block;width:100%}
      .c8-interest-label{display:block;margin-top:18px;font-family:"Work Sans",Arial,sans-serif;font-size:clamp(22px,2.1vw,30px);line-height:1;font-weight:600;letter-spacing:-.045em;color:#fff}
      .c8-interest-featured .c8-interest-label{font-size:clamp(31px,3.5vw,44px);margin-top:20px}
      .c8-interest-count{display:block;margin-top:9px;font-size:13px;color:#D4C6DE}
      .c8-interest-featured .c8-interest-count{font-size:14px;color:#F1E8F7}
      .person-arrow{display:none!important}

      .c8-category-view-nav{display:none}
      body.c8-category-page{overflow-x:hidden}
      body.c8-category-page main>section:not(#explorar){display:none!important}
      body.c8-category-page footer{display:none!important}
      body.c8-category-page #explorar{display:block!important;min-height:100svh;padding:94px 5vw 70px!important;border-top:0!important;background:radial-gradient(circle at 72% 5%,rgba(90,24,154,.16),transparent 28%)}
      body.c8-category-page #explorar .section-wrap{max-width:1180px;margin:0 auto}
      body.c8-category-page #explorar .section-heading,body.c8-category-page #explorar #islandSelector{display:none!important}
      body.c8-category-page .c8-category-view-nav{
        position:sticky;top:76px;z-index:85;display:flex;align-items:center;justify-content:space-between;gap:18px;
        margin:0 0 18px;padding:11px 13px 11px 15px;border:1px solid rgba(157,78,221,.27);border-radius:17px;
        background:rgba(24,5,44,.94);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);box-shadow:0 16px 45px rgba(0,0,0,.22)
      }
      .c8-category-view-back{border:1px solid rgba(255,205,0,.42);border-radius:999px;background:rgba(255,205,0,.055);padding:9px 13px;font-family:"Work Sans",Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:.015em;color:#FFCD00;text-align:left}
      .c8-category-view-back:hover,.c8-category-view-back:focus-visible{background:#FFCD00;color:#1A0633;outline:none}
      .c8-category-view-context{display:flex;flex-direction:column;align-items:flex-end;min-width:0}
      .c8-category-view-context small{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#8F7CA0}
      .c8-category-view-context strong{margin-top:2px;font-family:"Work Sans",Arial,sans-serif;font-size:15px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:48vw}
      body.c8-category-page #directory{margin:0}
      body.c8-category-page .directory-shell{margin-top:0}

      @media(max-width:820px){#islandSelector.c8-interest-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.c8-interest-card.c8-interest-featured{grid-column:1/-1}}
      @media(max-width:620px){
        #explorar{padding:58px 18px 66px!important}
        #explorar .section-heading{margin-bottom:22px}
        #explorar .section-heading h2{font-size:30px!important;line-height:1.04}
        #explorar .section-heading>p:last-child{font-size:15px!important;line-height:1.58}
        #islandSelector.c8-interest-grid{gap:9px;margin-bottom:24px}
        .c8-interest-card{min-height:126px;padding:15px;border-radius:17px}
        .c8-interest-card.c8-interest-featured{min-height:145px;padding:18px 19px 17px}
        .c8-interest-featured .c8-interest-label{font-size:31px;margin-top:17px}
        .c8-interest-label{font-size:20px;margin-top:14px}
        .c8-interest-count,.c8-interest-featured .c8-interest-count{font-size:13px;margin-top:8px}
        .c8-interest-badge{font-size:9px;padding:4px 7px}
        body.c8-category-page #explorar{padding:78px 14px 50px!important}
        body.c8-category-page .c8-category-view-nav{top:70px;margin-bottom:12px;padding:9px 10px;border-radius:15px}
        .c8-category-view-back{font-size:11px;padding:9px 11px}
        .c8-category-view-context small{font-size:8px}
        .c8-category-view-context strong{font-size:13px;max-width:38vw}
        body.c8-category-page .directory-shell{border-radius:18px}
      }
    `;
    document.head.appendChild(style);
  }

  function c8PersonMatchesArea(person,area){
    const categories=person.categories?.length?person.categories:[person.category].filter(Boolean);
    return categories.includes(area);
  }

  function c8MainAreaCounts(){
    return Object.fromEntries(C8_MAIN_AREAS.map(area=>[area,people.filter(person=>c8PersonMatchesArea(person,area)).length]));
  }

  function c8TopArea(counts){
    return C8_MAIN_AREAS.map(area=>({area,count:counts[area]??0})).sort((a,b)=>b.count-a.count||a.area.localeCompare(b.area,'es'))[0]??null;
  }

  function c8UpdateInterestCopy(counts){
    const top=c8TopArea(counts);
    if(!copy||!top)return;
    copy.textContent=`${top.area} es la categoría con más perfiles ahora mismo en la constelación, con ${top.count} ${top.count===1?'perfil':'perfiles'}. Elige una categoría para abrir su directorio.`;
  }

  function c8UseCivilNamesForLucha(){
    people.forEach(person=>{
      const isLucha=(person.disciplines??[]).includes('Lucha canaria')||person.discipline==='Lucha canaria';
      if(!isLucha||!person.fullName)return;
      if(!person.c8Alias&&person.name&&person.name!==person.fullName)person.c8Alias=person.name;
      person.name=person.fullName;
    });
  }

  function scrollToCategoryStart(){
    const doScroll=()=>{
      const headerHeight=header?.getBoundingClientRect().height??72;
      const top=Math.max(0,explorer.getBoundingClientRect().top+window.scrollY-headerHeight-8);
      window.scrollTo({top,left:0,behavior:'auto'});
    };
    requestAnimationFrame(()=>requestAnimationFrame(()=>{doScroll();setTimeout(doScroll,40)}));
  }

  function scrollCategoryPageTop(){
    requestAnimationFrame(()=>{
      window.scrollTo(0,0);
      document.documentElement.scrollTop=0;
      document.body.scrollTop=0;
      setTimeout(()=>window.scrollTo(0,0),30);
    });
  }

  function closeCategoryView(){
    document.body.classList.remove('c8-category-page');
    explorer.classList.remove('c8-island-mode');
    c8ActiveMainArea=null;
    currentIsland=null;
    currentCategory='Todas';
    directory.innerHTML='';
    setMapActive(null);
    setTooltip(null);
    renderIslandSelector();
    scrollToCategoryStart();
  }

  function installCategoryProfileBack(area){
    const back=document.getElementById('profileBack');
    if(!back)return;
    const replacement=back.cloneNode(true);
    replacement.textContent=`Volver a ${area}`;
    back.replaceWith(replacement);
    replacement.addEventListener('click',()=>renderMainAreaDirectory(area,false));
  }

  renderIslandSelector=function(){
    if(!selector)return;
    const counts=c8MainAreaCounts();
    const top=c8TopArea(counts);
    c8UpdateInterestCopy(counts);
    selector.className='island-selector c8-interest-grid';
    selector.removeAttribute('aria-hidden');
    selector.setAttribute('aria-label','Explorar por categorías');
    selector.innerHTML=C8_MAIN_AREAS.map(area=>{
      const isTop=top?.area===area;
      const count=counts[area]??0;
      return `<button class="c8-interest-card ${isTop?'c8-interest-featured':''}" data-main-area="${escapeHtml(area)}" type="button">
        <span class="c8-interest-topline"><span class="c8-interest-badge">${isTop?'La que más brilla':'Explorar'}</span></span>
        <span class="c8-interest-body"><strong class="c8-interest-label">${escapeHtml(area)}</strong><small class="c8-interest-count">${count} ${count===1?'perfil':'perfiles'}</small></span>
      </button>`;
    }).join('');

    selector.querySelectorAll('[data-main-area]').forEach(button=>button.addEventListener('click',()=>renderMainAreaDirectory(button.dataset.mainArea,true)));
  };

  renderEmpty=function(){
    if(directory)directory.innerHTML='';
    explorer.classList.remove('c8-island-mode');
  };

  window.renderMainAreaDirectory=function(area,enterView=true){
    if(!directory||!C8_MAIN_AREAS.includes(area))return;
    c8ActiveMainArea=area;
    currentIsland=null;
    currentCategory='Todas';
    document.body.classList.remove('c8-island-page');
    document.body.classList.add('c8-category-page');
    explorer.classList.remove('c8-island-mode');
    setMapActive(null);
    setTooltip(null);

    const navName=document.getElementById('c8CategoryViewName');
    if(navName)navName.textContent=area;

    const matches=people.filter(person=>c8PersonMatchesArea(person,area)).sort((a,b)=>a.name.localeCompare(b.name,'es'));
    const groups={};
    matches.forEach(person=>{
      const letter=(person.name?.[0]||'#').toLocaleUpperCase('es');
      (groups[letter]??=[]).push(person);
    });

    directory.innerHTML=`
      <div class="directory-inner area-directory">
        <div class="directory-head">
          <div><h3>${escapeHtml(area)}</h3><p>Personas de ${escapeHtml(area.toLocaleLowerCase('es'))} · todas las islas · orden alfabético</p></div>
          <div class="directory-count">${matches.length} ${matches.length===1?'perfil':'perfiles'}</div>
        </div>
        <div>${Object.entries(groups).length?Object.entries(groups).map(([letter,list])=>`
          <div class="alpha-block">
            <div class="alpha-letter">${letter}</div>
            <div class="people-list">${list.map(person=>`
              <button class="person-row" data-area-person="${person.id}">
                <span><strong>${escapeHtml(person.name)}</strong><small>${escapeHtml(personIslandName(person))}${person.discipline?` · ${escapeHtml(person.discipline)}`:''}</small></span>
                <span class="person-year">${escapeHtml(lifeLabel(person))}</span>
              </button>`).join('')}</div>
          </div>`).join(''):'<div class="directory-empty"><strong>Todavía no hay perfiles en esta categoría.</strong></div>'}</div>
      </div>`;

    directory.querySelectorAll('[data-area-person]').forEach(button=>button.addEventListener('click',()=>{
      const activeArea=area;
      openProfile(button.dataset.areaPerson);
      document.body.classList.remove('c8-island-page');
      document.body.classList.add('c8-category-page');
      c8ActiveMainArea=activeArea;
      installCategoryProfileBack(activeArea);
    }));

    if(enterView)scrollCategoryPageTop();
    else scrollCategoryPageTop();
  };

  categoryNav.querySelector('#c8CategoryViewBack')?.addEventListener('click',event=>{
    event.preventDefault();
    closeCategoryView();
  });

  /* La cabecera vuelve al inicio del sitio desde una categoría sin dejar el estado interno abierto. */
  header?.addEventListener('click',event=>{
    if(!document.body.classList.contains('c8-category-page'))return;
    if(event.target.closest('#homeButton')){
      event.preventDefault();
      event.stopImmediatePropagation();
      document.body.classList.remove('c8-category-page');
      c8ActiveMainArea=null;
      directory.innerHTML='';
      renderIslandSelector();
      window.scrollTo(0,0);
    }
  },true);

  c8UseCivilNamesForLucha();
  renderIslandSelector();
  if(c8ActiveMainArea)renderMainAreaDirectory(c8ActiveMainArea,false);
  else renderEmpty();

  window.addEventListener('c8:data-ready',()=>{
    c8UseCivilNamesForLucha();
    if(document.body.classList.contains('c8-category-page')&&c8ActiveMainArea)renderMainAreaDirectory(c8ActiveMainArea,false);
    else renderIslandSelector();
  });
})();
