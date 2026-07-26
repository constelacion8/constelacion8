/* Vista interna de isla: separa los directorios largos de la portada principal. */
(function installIslandView(){
  const MAX_TRIES=40;
  let tries=0;

  function ready(){
    return typeof openIsland==='function' && typeof renderIslandList==='function' &&
      typeof setMapActive==='function' && typeof setTooltip==='function' &&
      typeof renderIslandSelector==='function' && document.getElementById('explorar') &&
      document.getElementById('directory');
  }

  function install(){
    if(window.__c8IslandViewInstalled)return;
    if(!ready()){
      if(++tries<MAX_TRIES)setTimeout(install,50);
      return;
    }
    window.__c8IslandViewInstalled=true;

    const explorer=document.getElementById('explorar');
    const wrap=explorer.querySelector('.section-wrap');
    const directory=document.getElementById('directory');
    const hero=document.getElementById('inicio');

    /* La firma vive entre el titular principal y la invitación a elegir isla. */
    (function placeHeroCredit(){
      const intro=hero?.querySelector('.hero-intro');
      const title=intro?.querySelector('.hero-atlas-title');
      const lead=intro?.querySelector('.hero-lead');
      let credit=hero?.querySelector('.c8-hero-credit-inline,.hero-presenter,.hero-credit-below');

      hero?.querySelector('.creator-signature')?.remove();
      hero?.querySelector('.hero-down')?.remove();
      hero?.querySelector('.map-gesture-hint')?.remove();

      if(!intro||!title||!lead)return;
      if(!credit)credit=document.createElement('div');
      credit.className='c8-hero-credit-inline';
      credit.setAttribute('aria-label','Creado por DE8 Films');
      credit.innerHTML='<span>Creado por</span><strong>DE8 Films.</strong>';
      title.insertAdjacentElement('afterend',credit);

      lead.innerHTML='<span class="c8-hero-lead-line">Elige una isla del mapa</span><span class="c8-hero-lead-line">y empieza el recorrido.</span>';

      if(!document.getElementById('c8HeroCreditInlineStyles')){
        const creditStyle=document.createElement('style');
        creditStyle.id='c8HeroCreditInlineStyles';
        creditStyle.textContent=`
          #inicio .hero-atlas-title{order:1!important}
          .c8-hero-credit-inline{
            order:2!important;display:flex;align-items:baseline;justify-content:center;gap:7px;
            margin:10px 0 8px;font-family:"Work Sans",Arial,sans-serif;color:#fff
          }
          .c8-hero-credit-inline span{font-size:10px;line-height:1;font-weight:400;color:#fff;white-space:nowrap}
          .c8-hero-credit-inline strong{font-size:15px;line-height:1;font-weight:700;letter-spacing:-.035em;color:#fff;white-space:nowrap}
          #inicio .hero-lead{order:3!important;margin:6px auto 0!important;color:#FFCD00!important;font-weight:500;text-align:center}
          #inicio .hero-lead .c8-hero-lead-line{display:block;white-space:nowrap}
          @media(max-width:620px){
            .c8-hero-credit-inline{margin:9px 0 8px;gap:6px}
            .c8-hero-credit-inline span{font-size:11px}
            .c8-hero-credit-inline strong{font-size:15px}
            #inicio .hero-lead{font-size:16px!important;line-height:1.48!important;max-width:none!important}
          }
        `;
        document.head.appendChild(creditStyle);
      }
    })();

    const style=document.createElement('style');
    style.id='c8IslandViewStyles';
    style.textContent=`
      body.c8-island-page{overflow-x:hidden}
      body.c8-island-page main>section:not(#explorar){display:none!important}
      body.c8-island-page footer{display:none!important}
      body.c8-island-page #explorar{
        display:block!important;min-height:100svh;padding:94px 5vw 70px!important;
        border-top:0!important;background:radial-gradient(circle at 72% 5%,rgba(90,24,154,.16),transparent 28%)
      }
      body.c8-island-page #explorar .section-wrap{max-width:1180px;margin:0 auto}
      body.c8-island-page #explorar .section-heading,
      body.c8-island-page #explorar #islandSelector{display:none!important}
      .c8-island-view-nav{display:none}
      body.c8-island-page .c8-island-view-nav{
        position:sticky;top:76px;z-index:80;display:flex;align-items:center;justify-content:space-between;gap:18px;
        margin:0 0 18px;padding:11px 13px 11px 15px;border:1px solid rgba(157,78,221,.27);border-radius:17px;
        background:rgba(24,5,44,.93);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);
        box-shadow:0 16px 45px rgba(0,0,0,.22)
      }
      .c8-island-view-back{
        border:1px solid rgba(255,205,0,.42);border-radius:999px;background:rgba(255,205,0,.055);
        padding:9px 13px;font-family:"Work Sans",Arial,sans-serif;font-size:10px;font-weight:600;
        letter-spacing:.015em;color:#FFCD00;text-align:left
      }
      .c8-island-view-back:hover,.c8-island-view-back:focus-visible{background:#FFCD00;color:#1A0633;outline:none}
      .c8-island-view-context{display:flex;flex-direction:column;align-items:flex-end;min-width:0}
      .c8-island-view-context small{font-size:8px;letter-spacing:.14em;text-transform:uppercase;color:#8F7CA0}
      .c8-island-view-context strong{margin-top:2px;font-family:"Work Sans",Arial,sans-serif;font-size:14px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:48vw}
      body.c8-island-page #directory{margin:0}
      @media(max-width:620px){
        body.c8-island-page #explorar{padding:78px 14px 50px!important}
        body.c8-island-page .c8-island-view-nav{top:70px;margin-bottom:12px;padding:9px 10px;border-radius:15px}
        .c8-island-view-back{font-size:11px;padding:9px 11px}
        .c8-island-view-context small{font-size:7px}
        .c8-island-view-context strong{font-size:12px;max-width:38vw}
        body.c8-island-page .directory-shell{border-radius:18px}
      }
    `;
    document.head.appendChild(style);

    let nav=document.getElementById('c8IslandViewNav');
    if(!nav){
      nav=document.createElement('div');
      nav.id='c8IslandViewNav';
      nav.className='c8-island-view-nav';
      nav.innerHTML=`<button type="button" class="c8-island-view-back" id="c8IslandViewBack">Volver al mapa / inicio</button><span class="c8-island-view-context"><small>Directorio de isla</small><strong id="c8IslandViewName"></strong></span>`;
      wrap.insertBefore(nav,directory);
    }

    function returnToPageTop(){
      requestAnimationFrame(()=>{
        window.scrollTo(0,0);
        document.documentElement.scrollTop=0;
        document.body.scrollTop=0;
        setTimeout(()=>{
          window.scrollTo(0,0);
          document.documentElement.scrollTop=0;
          document.body.scrollTop=0;
        },30);
      });
    }

    function closeIslandView(scroll=true){
      document.body.classList.remove('c8-island-page');
      explorer.classList.remove('c8-island-mode');
      currentIsland=null;
      currentCategory='Todas';
      setMapActive(null);
      setTooltip(null);
      directory.innerHTML='';
      if(typeof renderIslandSelector==='function')renderIslandSelector();
      if(scroll)returnToPageTop();
    }

    nav.querySelector('#c8IslandViewBack')?.addEventListener('click',event=>{
      event.preventDefault();
      closeIslandView(true);
    });

    /* Sustituye el comportamiento de "lista debajo del home" por una pantalla interna dedicada. */
    openIsland=function(slug,scroll=true){
      if(!islands?.[slug]||!directory)return;
      if(typeof c8ActiveMainArea!=='undefined')c8ActiveMainArea=null;
      currentIsland=slug;
      currentCategory='Todas';
      document.body.classList.add('c8-island-page');
      explorer.classList.add('c8-island-mode');
      setMapActive(slug);
      setTooltip(slug);
      const label=document.getElementById('c8IslandViewName');
      if(label)label.textContent=islands[slug].name;
      renderIslandList('');
      if(scroll)requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'auto'}));
    };

    /* El logo y Explorar funcionan también como salida desde la vista de isla. */
    document.querySelector('.site-header')?.addEventListener('click',event=>{
      if(!document.body.classList.contains('c8-island-page'))return;
      if(event.target.closest('#homeButton')||event.target.closest('[data-scroll="archipelagoStage"]')){
        event.preventDefault();
        event.stopImmediatePropagation();
        closeIslandView(true);
      }
    },true);
  }

  install();
})();

/* Coincidencias: una sola instrucción, sin repetir el mismo mensaje dentro del formulario. */
(function simplifyCoincidenceCopy(){
  const intro=document.querySelector('#coincidencias .time-match-copy>p:last-of-type');
  const help=document.querySelector('#coincidencias .time-tool-head small');
  const results=document.getElementById('timeResults');

  if(intro)intro.textContent='Introduce tu nombre, fecha e isla de nacimiento para descubrir qué figuras canarias coincidieron contigo en el tiempo.';
  if(help)help.textContent='Compara tu cronología vital con las personas incorporadas al atlas.';
  if(results&&results.querySelector('.time-empty')&&!results.querySelector('.time-summary'))results.innerHTML='';
})();
