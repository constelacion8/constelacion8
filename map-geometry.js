/* Geometría cartográfica corregida para Lanzarote, La Graciosa y el Archipiélago Chinijo.
   La silueta prioriza proporciones y separación geográfica legibles dentro del mapa estilizado. */
(function installEasternCanaryGeometry(){
  const NS='http://www.w3.org/2000/svg';

  function apply(){
    const map=document.querySelector('.canary-map');
    if(!map)return;

    const lanzarote=map.querySelector('[data-island="lanzarote"]');
    const graciosa=map.querySelector('[data-island="la-graciosa"]');
    if(!lanzarote||!graciosa)return;

    /* Lanzarote: eje NE–SO, norte estrecho y mitad meridional más ancha. */
    const lanzarotePath='M580 25 L576 23 L573 25 L571 29 L570 33 L567 36 L565 40 L561 43 L559 47 L555 49 L553 53 L550 56 L548 60 L544 63 L542 67 L538 70 L535 74 L531 77 L529 80 L534 82 L539 82 L544 79 L549 77 L553 74 L558 72 L561 69 L565 67 L568 63 L572 60 L575 56 L578 52 L580 47 L582 43 L583 39 L585 35 L585 31 L583 27 Z';
    lanzarote.querySelectorAll('.island-aura,.island-shape').forEach(path=>path.setAttribute('d',lanzarotePath));

    /* La Graciosa: al NNO de Lanzarote, separada por El Río y con eje similar. */
    const graciosaPath='M553 14 L557 12 L562 12 L566 14 L568 17 L568 20 L565 22 L562 24 L558 25 L554 23 L551 21 L550 18 L551 16 Z';
    graciosa.querySelectorAll('.island-aura,.island-shape').forEach(path=>path.setAttribute('d',graciosaPath));
    const hit=graciosa.querySelector('.tiny-hit');
    if(hit){hit.setAttribute('cx','559');hit.setAttribute('cy','19');hit.setAttribute('r','11');}

    /* Retiramos referencias provisionales anteriores para no duplicar islotes. */
    map.querySelectorAll('.chinijo-reference').forEach(node=>node.remove());

    const chinijo=document.createElementNS(NS,'g');
    chinijo.setAttribute('class','chinijo-reference');
    chinijo.setAttribute('aria-label','Archipiélago Chinijo');
    chinijo.setAttribute('pointer-events','none');

    const referenceStyle='fill:rgba(255,205,0,.07);stroke:rgba(255,205,0,.52);stroke-width:.55;vector-effect:non-scaling-stroke';
    const addPath=(d,label)=>{
      const p=document.createElementNS(NS,'path');
      p.setAttribute('d',d);p.setAttribute('style',referenceStyle);p.setAttribute('aria-label',label);chinijo.appendChild(p);
    };
    const addCircle=(cx,cy,r,label)=>{
      const c=document.createElementNS(NS,'circle');
      c.setAttribute('cx',cx);c.setAttribute('cy',cy);c.setAttribute('r',r);c.setAttribute('style',referenceStyle);c.setAttribute('aria-label',label);chinijo.appendChild(c);
    };

    /* Alegranza al norte; Montaña Clara al oeste de La Graciosa; roques como hitos mínimos. */
    addPath('M548 2 L551 1 L554 3 L554 6 L552 8 L548 8 L546 6 L546 4 Z','Alegranza');
    addPath('M547 10 L550 9 L552 11 L551 14 L548 14 L546 12 Z','Montaña Clara');
    addCircle('543.5','12.8','0.85','Roque del Oeste');
    addCircle('574','17.2','0.75','Roque del Este');
    map.appendChild(chinijo);

    /* La red decorativa acompaña ahora a las posiciones reales de Lanzarote y La Graciosa. */
    const network=document.querySelector('.network-layer');
    if(network){
      const violet=[...network.querySelectorAll('.violet-line')];
      if(violet[1])violet[1].setAttribute('d','M510 141 C532 107, 550 79, 559 53 C563 39, 562 28, 559 19');
      const nodes=[...network.querySelectorAll('.network-nodes circle')];
      if(nodes[6]){nodes[6].setAttribute('cx','559');nodes[6].setAttribute('cy','53');}
      if(nodes[7]){nodes[7].setAttribute('cx','559');nodes[7].setAttribute('cy','19');}
    }

    document.documentElement.dataset.c8MapGeometry='chinijo-corrected';
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();
})();
