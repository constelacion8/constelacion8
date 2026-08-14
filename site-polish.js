/* Ajustes finales de navegación, ritmo móvil, marca y pie legal. */
(function installSitePolish(){
  document.querySelector('.hero-down')?.remove();
  document.querySelector('.map-gesture-hint')?.remove();

  const credit=document.querySelector('.hero-credit-below,.hero-presenter');
  if(credit){
    credit.setAttribute('aria-label','Creado por DE8 Films');
    credit.innerHTML='<span>Creado por</span><strong>DE8 Films.</strong>';
  }

  const brandMark=document.querySelector('.brand-mark');
  if(brandMark&&!brandMark.classList.contains('c8-brand-mark-new')){
    brandMark.classList.add('c8-brand-mark-new');
    brandMark.innerHTML=`
      <svg class="c8-brand-symbol" viewBox="0 0 38 34" aria-hidden="true">
        <defs>
          <filter id="c8BrandGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation=".8" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <path d="M19 4.5C12.7 4.5 10.1 9.1 12.7 12.9c1.7 2.5 4.2 3.9 6.3 5.3 2.2 1.5 4.7 2.9 6.1 5.3 2.3 3.8-.1 8-6.1 8-5.9 0-8.4-4.2-6.1-8 1.4-2.4 3.9-3.8 6.1-5.3 2.1-1.4 4.6-2.8 6.3-5.3C27.9 9.1 25.3 4.5 19 4.5Z" fill="none" stroke="#F8F4FF" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" filter="url(#c8BrandGlow)"/>
        <circle cx="19" cy="4.5" r="1.9" fill="#F8F4FF"/>
        <circle cx="12.5" cy="11.2" r="1.45" fill="#F8F4FF"/>
        <circle cx="15.6" cy="16" r="1.4" fill="#F8F4FF"/>
        <circle cx="19" cy="18.2" r="2" fill="#F8F4FF"/>
        <circle cx="22.4" cy="20.7" r="1.4" fill="#F8F4FF"/>
        <circle cx="25.5" cy="26" r="1.45" fill="#F8F4FF"/>
        <circle cx="19" cy="31.5" r="1.9" fill="#F8F4FF"/>
        <circle cx="12.5" cy="26" r="1.45" fill="#F8F4FF"/>
        <path d="M19 14.4l1 2.3 2.3 1-2.3 1-1 2.3-1-2.3-2.3-1 2.3-1Z" fill="#CBA8FF" filter="url(#c8BrandGlow)"/>
      </svg>`;
  }

  if(!document.getElementById('c8SitePolishStyles')){
    const style=document.createElement('style');
    style.id='c8SitePolishStyles';
    style.textContent=`
      .brand{min-width:0;overflow:visible;gap:11px!important}
      .brand-mark.c8-brand-mark-new{position:relative;width:38px;height:34px;display:grid;place-items:center;flex:0 0 38px;overflow:visible}
      .brand-mark.c8-brand-mark-new:before,.brand-mark.c8-brand-mark-new:after,.brand-mark.c8-brand-mark-new i{display:none!important}
      .c8-brand-symbol{display:block;width:38px;height:34px;overflow:visible}
      .brand-name b{color:#F8F4FF!important}
      .c8-legal-links{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-size:9px}
      .c8-legal-links a{color:#A997B7;text-decoration:none;transition:color .18s ease}
      .c8-legal-links a:hover,.c8-legal-links a:focus-visible{color:#FFCD00;outline:none}
      footer{gap:20px;flex-wrap:wrap}
      @media(max-width:620px){
        .brand{gap:9px!important;max-width:calc(100vw - 118px)}
        .brand-mark.c8-brand-mark-new{width:31px;height:28px;flex-basis:31px}
        .c8-brand-symbol{width:31px;height:28px}
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
