/* Navegación editorial simplificada: el mapa es la entrada principal al atlas. */
(function c8SimplifyExplorer(){
  const explorer=document.getElementById('explorar');
  const selector=document.getElementById('islandSelector');
  const heading=explorer?.querySelector('.section-heading');

  document.getElementById('proyecto')?.remove();
  document.querySelector('.main-nav [data-scroll="proyecto"]')?.remove();

  /* El bloque introductorio y las categorías globales desaparecen por completo. */
  heading?.remove();
  if(selector){
    selector.innerHTML='';
    selector.style.display='none';
    selector.setAttribute('aria-hidden','true');
  }

  /* "Islas" y "Explorar" llevan directamente al mapa. */
  document.querySelectorAll('[data-scroll="explorar"]').forEach(button=>{
    button.dataset.scroll='archipelagoStage';
  });

  if(!document.getElementById('c8SimplifiedExplorerStyles')){
    const style=document.createElement('style');
    style.id='c8SimplifiedExplorerStyles';
    style.textContent=`
      #explorar.c8-explorer-empty{display:none!important}
      #explorar{padding-top:34px}
      #explorar .section-heading,#islandSelector{display:none!important}
      #explorar .directory-shell{margin-top:0}
      .profile-alias{margin-top:7px;font-size:12px;line-height:1.45;color:#E7DDF0}
      .profile-alias strong{font-weight:600;color:#fff}
      @media(max-width:620px){
        #explorar{padding-top:22px}
        .profile-alias{font-size:14px}
      }
    `;
    document.head.appendChild(style);
  }

  function c8UseCivilNamesForLucha(){
    people.forEach(person=>{
      const isLucha=(person.disciplines??[]).includes('Lucha canaria')||person.discipline==='Lucha canaria';
      if(!isLucha||!person.fullName)return;
      if(!person.c8Alias&&person.name&&person.name!==person.fullName)person.c8Alias=person.name;
      person.name=person.fullName;
    });
  }

  /* Ya no existe selector global: los filtros útiles permanecen dentro de cada isla. */
  renderIslandSelector=function(){
    if(!selector)return;
    selector.innerHTML='';
    selector.style.display='none';
  };

  const originalRenderIslandList=renderIslandList;
  renderIslandList=function(query=''){
    explorer?.classList.remove('c8-explorer-empty');
    originalRenderIslandList(query);
  };

  renderEmpty=function(){
    if(directory)directory.innerHTML='';
    explorer?.classList.add('c8-explorer-empty');
  };

  const originalOpenIsland=openIsland;
  openIsland=function(slug,scroll=true){
    explorer?.classList.remove('c8-explorer-empty');
    originalOpenIsland(slug,scroll);
  };

  const originalOpenProfile=openProfile;
  openProfile=function(id){
    explorer?.classList.remove('c8-explorer-empty');
    originalOpenProfile(id);
    const person=people.find(item=>item.id===id);
    if(!person?.c8Alias||person.c8Alias===person.name)return;
    const profileHeading=directory?.querySelector('.profile-top h3');
    if(!profileHeading||directory.querySelector('.profile-alias'))return;
    profileHeading.insertAdjacentHTML('afterend',`<div class="profile-alias">Conocido en los terreros como <strong>${escapeHtml(person.c8Alias)}</strong></div>`);
  };

  c8UseCivilNamesForLucha();
  renderIslandSelector();
  if(currentIsland)renderIslandList();
  else renderEmpty();

  window.addEventListener('c8:data-ready',()=>{
    c8UseCivilNamesForLucha();
    renderIslandSelector();
    if(currentIsland)renderIslandList();
    else renderEmpty();
  });
})();
