/* Navegación por categorías: segunda puerta de entrada a Constelación 8. */
const C8_MAIN_AREAS=['Artes','Ciencias','Deporte','Educación','Política','Sociedad'];
let c8ActiveMainArea=null;

(function installCategoryBrowser(){
  const explorer=document.getElementById('explorar');
  const wrap=explorer?.querySelector('.section-wrap');
  const directoryNode=document.getElementById('directory');
  const hero=document.getElementById('inicio');
  const coincidences=document.getElementById('coincidencias');

  if(wrap&&!wrap.querySelector('.section-heading')){
    const headingNode=document.createElement('div');
    headingNode.className='section-heading';
    headingNode.innerHTML='<p class="eyebrow">Explora por categorías</p><h2>Elige por dónde entrar en la constelación.</h2><p>Las categorías son otra forma de recorrer las biografías más allá del territorio.</p>';
    wrap.insertBefore(headingNode,directoryNode||wrap.firstChild);
  }

  let selector=document.getElementById('islandSelector');
  if(wrap&&!selector){
    selector=document.createElement('div');
    selector.id='islandSelector';
    selector.className='island-selector';
    selector.setAttribute('aria-label','Explorar por categorías');
    wrap.insertBefore(selector,directoryNode||null);
  }

  const heading=explorer?.querySelector('.section-heading');
  const eyebrow=heading?.querySelector('.eyebrow');
  const title=heading?.querySelector('h2');
  const copy=heading?.querySelector('p:last-child');

  document.getElementById('proyecto')?.remove();
  document.querySelector('.main-nav [data-scroll="proyecto"]')?.remove();

  if(eyebrow)eyebrow.textContent='Explora por categorías';
  if(title)title.textContent='Elige por dónde entrar en la constelación.';

  if(!document.getElementById('c8CategoryBrowserStyles')){
    const style=document.createElement('style');
    style.id='c8CategoryBrowserStyles';
    style.textContent=`
      #explorar{padding-top:74px!important;padding-bottom:78px}
      #explorar .section-heading{max-width:820px;margin-bottom:26px}
      #explorar .section-heading .eyebrow{color:#FFCD00}
      #explorar .section-heading h2{max-width:760px;font-size:clamp(31px,4.2vw,54px);line-height:1.02}
      #explorar .section-heading>p:last-child{max-width:720px;color:#C9BBD5;font-size:14px;line-height:1.7}

      #directory:empty{
        display:none!important;min-height:0!important;border:0!important;
        background:none!important;box-shadow:none!important
      }

      #islandSelector.c8-interest-grid{
        display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));
        gap:12px;margin:0 0 30px
      }
      .c8-interest-card{
        position:relative;overflow:hidden;min-height:148px;padding:18px 19px 17px;
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
        transform:translateY(-3px);border-color:rgba(255,205,0,.7);
        background:linear-gradient(145deg,rgba(79,15,139,.48),rgba(27,5,48,.92));
        box-shadow:0 22px 60px rgba(0,0,0,.2),0 0 30px rgba(255,205,0,.06);outline:none
      }
      .c8-interest-card.active{
        border-color:#FFCD00;background:linear-gradient(145deg,#FFCD00,#EFC000);color:#1A0633;
        box-shadow:0 18px 46px rgba(255,205,0,.15)
      }
      .c8-interest-card.c8-interest-featured{
        grid-column:span 2;min-height:184px;padding:22px 23px 20px;border-color:rgba(255,205,0,.64);
        background:radial-gradient(circle at 83% 18%,rgba(255,205,0,.19),transparent 27%),linear-gradient(135deg,rgba(78,20,127,.82),rgba(29,5,51,.94));
        box-shadow:0 24px 70px rgba(0,0,0,.2),0 0 42px rgba(255,205,0,.08)
      }
      .c8-interest-card.c8-interest-featured:before{
        width:220px;height:220px;right:-62px;top:-112px;
        background:radial-gradient(circle,rgba(255,205,0,.30),rgba(255,205,0,.07) 37%,transparent 69%)
      }
      .c8-interest-topline{display:flex;align-items:center;justify-content:flex-start;width:100%;position:relative;z-index:2}
      .c8-interest-badge{
        min-height:24px;display:inline-flex;align-items:center;border:1px solid rgba(255,205,0,.26);border-radius:999px;
        padding:5px 8px;font-family:"Work Sans",Arial,sans-serif;font-size:8px;letter-spacing:.11em;text-transform:uppercase;color:#FFCD00
      }
      .c8-interest-featured .c8-interest-badge{background:rgba(255,205,0,.09);border-color:rgba(255,205,0,.52);font-weight:600}
      .c8-interest-card.active .c8-interest-badge{border-color:rgba(26,6,51,.22);color:#1A0633;background:transparent}
      .c8-interest-body{position:relative;z-index:2;display:block;width:100%}
      .c8-interest-label{
        display:block;margin-top:16px;font-family:"Work Sans",Arial,sans-serif;font-size:clamp(21px,2.1vw,29px);
        line-height:1;font-weight:600;letter-spacing:-.045em;color:inherit
      }
      .c8-interest-featured .c8-interest-label{font-size:clamp(30px,3.5vw,45px);margin-top:20px}
      .c8-interest-count{display:block;margin-top:8px;font-size:11px;color:#CBBBD8}
      .c8-interest-featured .c8-interest-count{font-size:13px;color:#F1E8F7}
      .c8-interest-disciplines{
        display:block;margin-top:11px;max-width:100%;font-size:10px;line-height:1.55;color:#AFA0BC
      }
      .c8-interest-featured .c8-interest-disciplines{max-width:560px;font-size:11px;color:#DED2E7}
      .c8-interest-card.active .c8-interest-count,.c8-interest-card.active .c8-interest-disciplines{color:rgba(26,6,51,.72)}
      .c8-interest-feature-copy{display:block;margin-top:7px;max-width:430px;font-size:10px;line-height:1.5;color:#DCCFE5}
      .c8-interest-card.active .c8-interest-feature-copy{color:rgba(26,6,51,.72)}
      .area-directory{margin-top:8px}
      .profile-alias{margin-top:7px;font-size:12px;line-height:1.45;color:#E7DDF0}
      .profile-alias strong{font-weight:600;color:#fff}
      .person-arrow{display:none!important}

      #explorar.c8-island-mode .section-heading,#explorar.c8-island-mode #islandSelector{display:none!important}
      #explorar.c8-island-mode{padding-top:34px!important;padding-bottom:72px!important}
      #explorar.c8-island-mode .directory-shell{margin-top:0}

      @media(max-width:820px){
        #islandSelector.c8-interest-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
        .c8-interest-card.c8-interest-featured{grid-column:1/-1}
      }
      @media(max-width:620px){
        #explorar{padding:58px 18px 66px!important}
        #explorar.c8-island-mode{padding:22px 18px 60px!important}
        #explorar .section-heading{margin-bottom:22px}
        #explorar .section-heading h2{font-size:30px!important;line-height:1.04}
        #explorar .section-heading>p:last-child{font-size:15px!important;line-height:1.58}
        #islandSelector.c8-interest-grid{gap:9px;margin-bottom:24px}
        .c8-interest-card{min-height:150px;padding:15px;border-radius:17px}
        .c8-interest-card.c8-interest-featured{min-height:190px;padding:18px 19px 17px}
        .c8-interest-featured .c8-interest-label{font-size:32px;margin-top:18px}
        .c8-interest-featured .c8-interest-count{font-size:13px}
        .c8-interest-label{font-size:19px;margin-top:13px}
        .c8-interest-count{font-size:12px;margin-top:7px}
        .c8-interest-disciplines{font-size:11px;line-height:1.48;margin-top:10px}
        .c8-interest-badge{font-size:8px;padding:4px 7px}
        .c8-interest-feature-copy{font-size:11px;max-width:285px}
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

  function c8AreaDisciplines(area,limit=5){
    const counts=new Map();
    people.filter(person=>c8PersonMatchesArea(person,area)).forEach(person=>{
      const disciplines=person.disciplines?.length?person.disciplines:[person.discipline].filter(Boolean);
      [...new Set(disciplines)].forEach(discipline=>{
        if(!discipline)return;
        counts.set(discipline,(counts.get(discipline)||0)+1);
      });
    });
    return [...counts.entries()]
      .sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'es'))
      .slice(0,limit)
      .map(([discipline])=>discipline);
  }

  function c8UpdateInterestCopy(counts){
    const top=c8TopArea(counts);
    if(!copy||!top)return;
    copy.textContent=`${top.area} es la categoría que más brilla ahora mismo en la constelación, con ${top.count} ${top.count===1?'perfil':'perfiles'}. Cada tarjeta te muestra algunos de los ámbitos que encontrarás dentro.`;
  }

  function c8UseCivilNamesForLucha(){
    people.forEach(person=>{
      const isLucha=(person.disciplines??[]).includes('Lucha canaria')||person.discipline==='Lucha canaria';
      if(!isLucha||!person.fullName)return;
      if(!person.c8Alias&&person.name&&person.name!==person.fullName)person.c8Alias=person.name;
      person.name=person.fullName;
    });
  }

  function restoreCategoryPosition(){
    if(explorer&&coincidences&&coincidences.nextElementSibling!==explorer){
      coincidences.insertAdjacentElement('afterend',explorer);
    }
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
      const disciplines=c8AreaDisciplines(area,isTop?6:5);
      const disciplineText=disciplines.length?disciplines.join(' · '):'Más ámbitos en desarrollo';
      return `<button class="c8-interest-card ${isTop?'c8-interest-featured':''} ${c8ActiveMainArea===area?'active':''}" data-main-area="${escapeHtml(area)}" type="button">
        <span class="c8-interest-topline"><span class="c8-interest-badge">${isTop?'La que más brilla':'Explorar'}</span></span>
        <span class="c8-interest-body">
          <strong class="c8-interest-label">${escapeHtml(area)}</strong>
          <small class="c8-interest-count">${count} ${count===1?'perfil':'perfiles'}</small>
          <small class="c8-interest-disciplines">${escapeHtml(disciplineText)}</small>
          ${isTop?'<small class="c8-interest-feature-copy">La categoría más poblada de Constelación 8.</small>':''}
        </span>
      </button>`;
    }).join('');

    selector.querySelectorAll('[data-main-area]').forEach(button=>button.addEventListener('click',()=>{
      c8ActiveMainArea=button.dataset.mainArea;
      currentIsland=null;
      currentCategory='Todas';
      restoreCategoryPosition();
      explorer?.classList.remove('c8-island-mode');
      setMapActive(null);
      setTooltip(null);
      renderIslandSelector();
      renderMainAreaDirectory(c8ActiveMainArea);
    }));
  };

  renderEmpty=function(){
    if(directory)directory.innerHTML='';
    restoreCategoryPosition();
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
                <span class="person-year">${escapeHtml(lifeLabel(person))}</span>
              </button>`).join('')}</div>
          </div>`).join(''):'<div class="directory-empty"><strong>Todavía no hay perfiles en esta categoría.</strong></div>'}</div>
      </div>`;

    directory.querySelectorAll('[data-area-person]').forEach(button=>button.addEventListener('click',()=>openProfile(button.dataset.areaPerson)));
    explorer?.scrollIntoView({behavior:'smooth',block:'start'});
  };

  /* Modo isla independiente de la navegación por categorías. */
  openIsland=function(slug,scroll=true){
    if(!islands[slug]||!directory)return;
    c8ActiveMainArea=null;
    currentIsland=slug;
    currentCategory='Todas';
    explorer?.classList.add('c8-island-mode');
    if(hero&&explorer&&hero.nextElementSibling!==explorer){
      hero.insertAdjacentElement('afterend',explorer);
    }
    setMapActive(slug);
    setTooltip(slug);
    renderIslandList('');
    if(scroll)explorer?.scrollIntoView({behavior:'smooth',block:'start'});
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
  else if(currentIsland)openIsland(currentIsland,false);
  else renderEmpty();

  window.addEventListener('c8:data-ready',()=>{
    c8UseCivilNamesForLucha();
    if(currentIsland)openIsland(currentIsland,false);
    else{
      restoreCategoryPosition();
      renderIslandSelector();
      if(c8ActiveMainArea)renderMainAreaDirectory(c8ActiveMainArea);
      else renderEmpty();
    }
  });
})();