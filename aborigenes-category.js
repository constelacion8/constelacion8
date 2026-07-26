/* Categoría histórica especial: Aborígenes. Se monta sobre el navegador de categorías existente. */
(function installAborigenesCategory(){
  const AREA='Aborígenes';
  const explorer=document.getElementById('explorar');
  const directory=document.getElementById('directory');
  const header=document.querySelector('.site-header');
  if(!explorer||!directory)return;

  function matches(person){
    const categories=person.categories?.length?person.categories:[person.category].filter(Boolean);
    return categories.includes(AREA);
  }

  function historicalLifeLabel(person){
    const born=Number.isFinite(person.born)?person.born:null;
    const died=Number.isFinite(person.died)?person.died:null;
    if(born&&died)return `${born}–${died}`;
    if(died)return `† ${died} · nacimiento no precisado`;
    if(born)return `${born} · fallecimiento no precisado`;
    return 'Fechas no documentadas';
  }

  function ensureStyles(){
    if(document.getElementById('c8AborigenesStyles'))return;
    const style=document.createElement('style');
    style.id='c8AborigenesStyles';
    style.textContent=`
      .c8-interest-card.c8-interest-aborigenes{border-color:rgba(255,205,0,.46);background:radial-gradient(circle at 86% 16%,rgba(255,205,0,.12),transparent 28%),linear-gradient(145deg,rgba(71,18,116,.52),rgba(21,4,39,.86))}
      .c8-interest-card.c8-interest-aborigenes .c8-interest-badge{border-color:rgba(255,205,0,.58);background:rgba(255,205,0,.06)}
      .c8-indigenous-note{margin:0 0 18px;padding:16px 18px;border:1px solid rgba(255,205,0,.28);border-radius:16px;background:rgba(255,205,0,.045);color:#E9DFF0}
      .c8-indigenous-note strong{display:block;margin-bottom:5px;font-family:"Work Sans",Arial,sans-serif;color:#FFCD00;font-size:13px}
      .c8-indigenous-note p{margin:0;max-width:850px;font-size:12px;line-height:1.65;color:#CDBFD8}
      .c8-indigenous-evidence{display:inline-flex;align-items:center;margin-top:10px;padding:5px 8px;border:1px solid rgba(157,78,221,.3);border-radius:999px;font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:#BFAFD0}
    `;
    document.head.appendChild(style);
  }

  function addCard(){
    const selector=document.getElementById('islandSelector');
    if(!selector||selector.querySelector('[data-c8-aborigenes]'))return;
    const count=people.filter(matches).length;
    const button=document.createElement('button');
    button.type='button';
    button.className='c8-interest-card c8-interest-aborigenes';
    button.dataset.c8Aborigenes='true';
    button.innerHTML=`
      <span class="c8-interest-topline"><span class="c8-interest-badge">Memoria más antigua</span></span>
      <span class="c8-interest-body"><strong class="c8-interest-label">${AREA}</strong><small class="c8-interest-count">${count} ${count===1?'perfil':'perfiles'}</small></span>`;
    button.addEventListener('click',()=>renderAborigenesDirectory(true));
    selector.appendChild(button);
  }

  function installProfileBack(person){
    const back=document.getElementById('profileBack');
    if(back){
      const replacement=back.cloneNode(true);
      replacement.textContent='Volver a Aborígenes';
      back.replaceWith(replacement);
      replacement.addEventListener('click',()=>renderAborigenesDirectory(false));
    }
    const meta=document.querySelector('#directory .profile-meta');
    if(meta)meta.textContent=`${historicalLifeLabel(person)}${person.role?` · ${person.role}`:''}`;
    const bio=document.querySelector('#directory .profile-bio');
    if(bio&&!document.querySelector('#directory .c8-indigenous-note')){
      const note=document.createElement('div');
      note.className='c8-indigenous-note';
      note.innerHTML='<strong>Perfil de época indígena</strong><p>La cronología y algunos datos personales de las sociedades prehispánicas no siempre pueden precisarse con las fuentes conservadas. Constelación 8 deja esos datos sin completar cuando no existe respaldo suficiente.</p>';
      bio.before(note);
    }
  }

  function renderAborigenesDirectory(scrollTop=true){
    const matchesPeople=people.filter(matches).sort((a,b)=>a.name.localeCompare(b.name,'es'));
    const groups={};
    matchesPeople.forEach(person=>{
      const letter=(person.name?.[0]||'#').toLocaleUpperCase('es');
      (groups[letter]??=[]).push(person);
    });

    currentIsland=null;
    currentCategory='Todas';
    document.body.classList.remove('c8-island-page');
    document.body.classList.add('c8-category-page');
    setMapActive(null);
    setTooltip(null);
    const navName=document.getElementById('c8CategoryViewName');
    if(navName)navName.textContent=AREA;

    directory.innerHTML=`
      <div class="directory-inner area-directory c8-indigenous-directory">
        <div class="directory-head">
          <div><h3>${AREA}</h3><p>Personas de las sociedades indígenas de Canarias · todas las islas · orden alfabético</p></div>
          <div class="directory-count">${matchesPeople.length} ${matchesPeople.length===1?'perfil':'perfiles'}</div>
        </div>
        <div class="c8-indigenous-note"><strong>Una categoría histórica especial.</strong><p>En muchos casos no se conserva una fecha fiable de nacimiento o fallecimiento. Esas ausencias se muestran expresamente y no se sustituyen por fechas inventadas o aproximaciones sin respaldo documental.</p></div>
        <div>${Object.entries(groups).length?Object.entries(groups).map(([letter,list])=>`
          <div class="alpha-block">
            <div class="alpha-letter">${letter}</div>
            <div class="people-list">${list.map(person=>`
              <button class="person-row" data-c8-aborigen-person="${person.id}">
                <span><strong>${escapeHtml(person.name)}</strong><small>${escapeHtml(personIslandName(person))}${person.discipline?` · ${escapeHtml(person.discipline)}`:''}</small></span>
                <span class="person-year">${escapeHtml(historicalLifeLabel(person))}</span>
              </button>`).join('')}</div>
          </div>`).join(''):'<div class="directory-empty"><strong>Todavía no hay perfiles publicados en esta categoría.</strong></div>'}</div>
      </div>`;

    directory.querySelectorAll('[data-c8-aborigen-person]').forEach(button=>button.addEventListener('click',()=>{
      const person=people.find(item=>item.id===button.dataset.c8AborigenPerson);
      openProfile(button.dataset.c8AborigenPerson);
      document.body.classList.remove('c8-island-page');
      document.body.classList.add('c8-category-page');
      if(person)installProfileBack(person);
      window.scrollTo(0,0);
    }));

    if(scrollTop)requestAnimationFrame(()=>window.scrollTo(0,0));
  }

  window.renderAborigenesDirectory=renderAborigenesDirectory;
  ensureStyles();

  let attempts=0;
  const timer=setInterval(()=>{
    attempts++;
    if(typeof window.renderIslandSelector==='function'&&document.querySelector('#islandSelector.c8-interest-grid')){
      clearInterval(timer);
      const baseRender=window.renderIslandSelector;
      window.renderIslandSelector=function(){
        baseRender();
        addCard();
      };
      addCard();
      window.addEventListener('c8:data-ready',addCard);
    }else if(attempts>120){
      clearInterval(timer);
    }
  },50);
})();
