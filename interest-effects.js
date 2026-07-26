/* Capa visual para la exploración por intereses: microconstelaciones sutiles y específicas por categoría. */
(function installInterestEffects(){
  const SYMBOLS={
    Artes:'♪',
    Ciencias:'✦',
    Deporte:'●',
    Educación:'Aa',
    Política:'◇',
    Sociedad:'∞'
  };

  function installStyles(){
    if(document.getElementById('c8InterestEffectsStyles'))return;
    const style=document.createElement('style');
    style.id='c8InterestEffectsStyles';
    style.textContent=`
      .c8-interest-card{isolation:isolate}
      .c8-interest-card>.c8-interest-topline,
      .c8-interest-card>span:not(.c8-interest-visual){position:relative;z-index:3}
      .c8-interest-visual{
        position:absolute;inset:0;z-index:1;overflow:hidden;pointer-events:none;
        opacity:.78;transition:opacity .25s ease,transform .25s ease
      }
      .c8-interest-card:hover .c8-interest-visual,.c8-interest-card:focus-visible .c8-interest-visual{opacity:1;transform:scale(1.02)}
      .c8-interest-orbit{
        position:absolute;right:-26px;top:-31px;width:128px;height:128px;border-radius:50%;
        border:1px solid rgba(157,78,221,.22);transform:rotate(-16deg);
        animation:c8InterestOrbit 18s linear infinite
      }
      .c8-interest-orbit:before,.c8-interest-orbit:after{
        content:"";position:absolute;border-radius:50%;border:1px solid rgba(255,205,0,.13)
      }
      .c8-interest-orbit:before{inset:19px 8px;transform:rotate(28deg)}
      .c8-interest-orbit:after{inset:38px 20px;border-color:rgba(157,78,221,.22);transform:rotate(-34deg)}
      .c8-interest-symbol{
        position:absolute;right:24px;top:30px;font-family:"Work Sans",Arial,sans-serif;
        font-size:38px;line-height:1;font-weight:500;color:rgba(255,205,0,.13);
        text-shadow:0 0 26px rgba(255,205,0,.12);transform:rotate(-8deg);
        animation:c8InterestSymbol 7s ease-in-out infinite alternate
      }
      .c8-interest-node{position:absolute;width:4px;height:4px;border-radius:50%;background:#FFCD00;box-shadow:0 0 11px rgba(255,205,0,.88);animation:c8InterestPulse 3.6s ease-in-out infinite}
      .c8-interest-node.n1{left:16%;top:27%}
      .c8-interest-node.n2{left:36%;top:44%;animation-delay:-1.3s;background:#D7A6FF;box-shadow:0 0 10px rgba(157,78,221,.9)}
      .c8-interest-node.n3{left:61%;top:23%;animation-delay:-2.1s}
      .c8-interest-node.n4{left:78%;top:68%;animation-delay:-.7s;background:#D7A6FF;box-shadow:0 0 10px rgba(157,78,221,.9)}
      .c8-interest-line{
        position:absolute;height:1px;transform-origin:0 50%;
        background:linear-gradient(90deg,rgba(157,78,221,.05),rgba(255,205,0,.30),rgba(157,78,221,.05));
        opacity:.55;animation:c8InterestLine 5.5s ease-in-out infinite
      }
      .c8-interest-line.l1{left:17%;top:29%;width:26%;transform:rotate(27deg)}
      .c8-interest-line.l2{left:37%;top:45%;width:31%;transform:rotate(-24deg);animation-delay:-1.8s}
      .c8-interest-line.l3{left:62%;top:25%;width:28%;transform:rotate(58deg);animation-delay:-3.1s}
      .c8-interest-spark{
        position:absolute;left:-20%;top:0;width:34%;height:100%;transform:skewX(-20deg);
        background:linear-gradient(90deg,transparent,rgba(255,255,255,.035),transparent);
        animation:c8InterestSweep 10s ease-in-out infinite
      }
      .c8-interest-card[data-main-area="Ciencias"] .c8-interest-symbol{font-size:31px;right:27px;top:31px}
      .c8-interest-card[data-main-area="Deporte"] .c8-interest-symbol{font-size:22px;border:1px solid rgba(255,205,0,.12);border-radius:50%;padding:8px;color:rgba(255,205,0,.11)}
      .c8-interest-card[data-main-area="Educación"] .c8-interest-symbol{font-size:29px;letter-spacing:-.08em}
      .c8-interest-card[data-main-area="Política"] .c8-interest-symbol{font-size:43px}
      .c8-interest-card[data-main-area="Sociedad"] .c8-interest-symbol{font-size:39px}
      .c8-interest-card.active .c8-interest-visual{opacity:.32;mix-blend-mode:multiply}
      .c8-interest-card.active .c8-interest-node{background:#1A0633;box-shadow:none}
      .c8-interest-card.active .c8-interest-line{background:rgba(26,6,51,.3)}
      .c8-interest-card.active .c8-interest-symbol{color:rgba(26,6,51,.2);text-shadow:none}
      @keyframes c8InterestPulse{0%,100%{opacity:.35;transform:scale(.75)}50%{opacity:1;transform:scale(1.45)}}
      @keyframes c8InterestLine{0%,100%{opacity:.18}50%{opacity:.72}}
      @keyframes c8InterestOrbit{to{transform:rotate(344deg)}}
      @keyframes c8InterestSymbol{0%{transform:translate3d(0,0,0) rotate(-8deg)}100%{transform:translate3d(-5px,6px,0) rotate(-3deg)}}
      @keyframes c8InterestSweep{0%,72%{left:-35%;opacity:0}82%{opacity:1}100%{left:125%;opacity:0}}
      @media(max-width:620px){
        .c8-interest-symbol{right:17px;top:31px;font-size:31px}
        .c8-interest-orbit{width:106px;height:106px;right:-29px;top:-27px}
        .c8-interest-node{width:3px;height:3px}
      }
      @media(prefers-reduced-motion:reduce){
        .c8-interest-orbit,.c8-interest-symbol,.c8-interest-node,.c8-interest-line,.c8-interest-spark{animation:none!important}
        .c8-interest-card{transition:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function visualMarkup(area){
    const symbol=SYMBOLS[area]||'✦';
    return `<span class="c8-interest-visual" aria-hidden="true">
      <i class="c8-interest-orbit"></i>
      <i class="c8-interest-line l1"></i><i class="c8-interest-line l2"></i><i class="c8-interest-line l3"></i>
      <i class="c8-interest-node n1"></i><i class="c8-interest-node n2"></i><i class="c8-interest-node n3"></i><i class="c8-interest-node n4"></i>
      <i class="c8-interest-spark"></i>
      <b class="c8-interest-symbol">${symbol}</b>
    </span>`;
  }

  function decorate(){
    const heading=document.querySelector('#explorar .section-heading');
    const copy=heading?.querySelector('p:last-child');
    const cards=[...document.querySelectorAll('.c8-interest-card[data-main-area]')];

    if(copy&&cards.length){
      const ranked=cards.map(card=>({
        area:card.dataset.mainArea||'',
        count:Number((card.querySelector('.c8-interest-count')?.textContent||'').match(/\d+/)?.[0]||0)
      })).sort((a,b)=>b.count-a.count||a.area.localeCompare(b.area,'es'));
      if(ranked[0]?.area)copy.textContent=`${ranked[0].area}, la categoría con más perfiles en la actualidad.`;
    }

    cards.forEach(card=>{
      if(card.querySelector('.c8-interest-visual'))return;
      card.insertAdjacentHTML('afterbegin',visualMarkup(card.dataset.mainArea));
    });
  }

  installStyles();
  decorate();

  const selector=document.getElementById('islandSelector');
  if(selector){
    const observer=new MutationObserver(()=>decorate());
    observer.observe(selector,{childList:true,subtree:true});
  }
  window.addEventListener('c8:data-ready',()=>requestAnimationFrame(decorate));
})();