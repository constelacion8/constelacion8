/* Ajustes finales de navegación, ritmo móvil, marca y pie legal. */
(function installSitePolish(){
  document.querySelector('.hero-down')?.remove();
  document.querySelector('.map-gesture-hint')?.remove();

  const credit=document.querySelector('.hero-credit-below,.hero-presenter');
  if(credit){
    credit.setAttribute('aria-label','Creado por DE8 Films');
    credit.innerHTML='<span>Creado por</span><strong>DE8 Films.</strong>';
  }

  /* Marca textual: sin símbolo, sin puntos y sin emblemas añadidos. */
  document.querySelector('.brand-mark')?.remove();

  if(!document.getElementById('c8SitePolishStyles')){
    const style=document.createElement('style');
    style.id='c8SitePolishStyles';
    style.textContent=`
      .brand{min-width:0;overflow:visible;gap:0!important}
      .brand-name b{color:inherit!important}
      .c8-legal-links{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-size:9px}
      .c8-legal-links a{color:#A997B7;text-decoration:none;transition:color .18s ease}
      .c8-legal-links a:hover,.c8-legal-links a:focus-visible{color:#FFCD00;outline:none}
      footer{gap:20px;flex-wrap:wrap}
      @media(max-width:620px){
        .brand{gap:0!important;max-width:calc(100vw - 118px)}
        .brand-name{font-size:12px!important;letter-spacing:.11em!important}

        body:not(.c8-island-page) .hero{padding-bottom:14px!important}
        body:not(.c8-island-page) .archipelago-stage{margin-bottom:38px!important}
        body:not(.c8-island-page) .map-mobile-ui{bottom:-36px!important;width:100%!important;justify-content:center!important}
        body:not(.c8-island-page) .map-controls{margin:0 auto!important}
        body:not(.c8-island-page) .hero-credit-below{margin-top:0!important;margin-bottom:0!important}

        body:not(.c8-island-page) #coincidencias.time-match{padding:36px 18px 40px!important}
        body:not(.c8-island-page) #coincidencias .time-match-inner{gap:16px!important}
        body:not(.c8-island-page) #coincidencias .time-match-copy h2{margin-bottom:10px!important}
        body:not(.c8-island-page) #coincidencias .time-match-copy>p:last-of-type{margin-bottom:0!important}
        body:not(.c8-island-page) #coincidencias .time-tool{margin-top:0!important}

        body:not(.c8-island-page) #explorar{padding:36px 18px 40px!important}
        body:not(.c8-island-page) #explorar .section-heading{margin-bottom:16px!important}
        body:not(.c8-island-page) #islandSelector.c8-interest-grid{margin-bottom:14px!important}

        body:not(.c8-island-page) #cifras.c8-stats{padding:40px 0 44px!important}
        body:not(.c8-island-page) #cifras .c8-stats-head{gap:12px!important;margin-bottom:20px!important}
        body:not(.c8-island-page) #cifras .c8-extra-metrics{margin-top:8px!important}
        body:not(.c8-island-page) #cifras .c8-ranking{margin-top:28px!important;padding-top:22px!important}
        body:not(.c8-island-page) #cifras .c8-ranking-head{gap:12px!important;margin-bottom:16px!important}

        footer{min-height:0!important;padding:22px 18px!important;gap:10px!important;align-items:flex-start!important}
        .c8-legal-links{gap:10px 14px;font-size:11px;line-height:1.45}
      }
    `;
    document.head.appendChild(style);
  }

  const footer=document.querySelector('footer');
  if(footer&&!footer.querySelector('.c8-legal-links')){
    const nav=document.createElement('nav');
    nav.className='c8-legal-links';
    nav.setAttribute('aria-label','Información legal');
    nav.innerHTML='<a href="aviso-legal.html">Aviso legal</a><a href="privacidad.html">Política de privacidad</a><a href="cookies.html">Política de cookies</a>';
    const de8=footer.querySelector('.footer-de8');
    if(de8)footer.insertBefore(nav,de8);else footer.appendChild(nav);
  }
})();
