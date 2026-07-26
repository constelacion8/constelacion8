/* Geometría de Lanzarote y Archipiélago Chinijo trazada desde la referencia cartográfica aportada al proyecto.
   Las formas mantienen proporción, orientación y posición relativa; no se reinterpretan a mano. */
(function installEasternCanaryGeometry(){
  const NS='http://www.w3.org/2000/svg';

  function apply(){
    const map=document.querySelector('.canary-map');
    if(!map)return;

    const lanzarote=map.querySelector('[data-island="lanzarote"]');
    const graciosa=map.querySelector('[data-island="la-graciosa"]');
    if(!lanzarote||!graciosa)return;

    /* Lanzarote: contorno trazado de la referencia, conservando el perfil SW-NE y el cuello de Famara/Haría. */
    const lanzarotePath='M575.5 33.9 L573.0 31.7 L571.2 32.6 L570.2 30.0 L567.3 32.3 L563.6 42.8 L559.8 46.5 L558.4 46.5 L558.4 44.8 L556.1 43.2 L551.7 45.4 L548.5 44.9 L548.0 47.6 L546.1 47.4 L542.9 50.4 L537.3 50.9 L532.4 54.6 L528.4 60.0 L527.9 70.9 L522.0 76.2 L522.9 79.8 L527.1 80.0 L527.4 78.2 L529.0 77.9 L529.9 80.0 L532.7 80.6 L533.0 82.3 L537.3 77.5 L538.7 73.6 L544.1 71.6 L549.5 71.7 L554.4 68.6 L554.4 66.4 L556.1 67.3 L559.3 66.7 L559.8 64.9 L562.1 65.2 L567.9 62.1 L570.6 58.5 L570.6 53.5 L572.4 49.0 L570.1 42.9 L575.5 39.3 Z';
    lanzarote.querySelectorAll('.island-aura,.island-shape').forEach(path=>path.setAttribute('d',lanzarotePath));

    /* La Graciosa: al N-NO de Lanzarote, separada claramente por El Río y a escala relativa. */
    const graciosaPath='M569.6 25.2 L568.5 24.2 L567.3 24.1 L566.4 23.2 L565.6 23.0 L565.3 23.6 L565.3 24.2 L564.2 26.0 L564.2 27.4 L563.6 27.8 L563.6 29.2 L561.4 30.5 L561.5 31.9 L562.1 31.9 L562.9 32.2 L563.2 31.9 L563.9 31.9 L565.0 31.2 L565.0 30.9 L565.3 30.6 L566.2 30.6 L566.4 30.5 L566.4 29.8 L567.0 29.7 L567.8 28.8 L567.8 27.7 L567.9 27.4 L569.8 25.8 Z';
    graciosa.querySelectorAll('.island-aura,.island-shape').forEach(path=>path.setAttribute('d',graciosaPath));
    const hit=graciosa.querySelector('.tiny-hit');
    if(hit){hit.setAttribute('cx','565.5');hit.setAttribute('cy','27.6');hit.setAttribute('r','7');}

    /* El resto del Chinijo queda como referencia geográfica, no como nuevas islas navegables. */
    map.querySelectorAll('.chinijo-reference').forEach(node=>node.remove());
    const chinijo=document.createElementNS(NS,'g');
    chinijo.setAttribute('class','chinijo-reference');
    chinijo.setAttribute('aria-label','Archipiélago Chinijo');
    chinijo.setAttribute('pointer-events','none');

    const style='fill:rgba(255,205,0,.07);stroke:rgba(255,205,0,.52);stroke-width:.55;vector-effect:non-scaling-stroke';
    const addPath=(d,label)=>{const p=document.createElementNS(NS,'path');p.setAttribute('d',d);p.setAttribute('style',style);p.setAttribute('aria-label',label);chinijo.appendChild(p);};
    const addCircle=(cx,cy,r,label)=>{const c=document.createElementNS(NS,'circle');c.setAttribute('cx',cx);c.setAttribute('cy',cy);c.setAttribute('r',r);c.setAttribute('style',style);c.setAttribute('aria-label',label);chinijo.appendChild(c);};

    const alegranzaPath='M568.1 7.7 L567.3 6.8 L566.8 6.8 L566.5 6.5 L565.9 6.5 L565.4 6.8 L564.8 7.0 L564.0 7.7 L564.0 7.9 L563.4 8.5 L563.4 9.6 L563.6 9.9 L564.2 10.2 L564.6 10.2 L564.8 10.1 L566.0 10.1 L566.0 9.9 L566.8 9.1 L567.4 9.1 L567.9 8.7 Z';
    const montanaClaraPath='M562.6 20.7 L562.5 20.7 L562.3 20.8 L562.3 22.7 L562.8 22.5 L562.8 22.4 L562.9 22.2 L562.9 21.8 L563.4 21.3 Z';
    addPath(alegranzaPath,'Alegranza');
    addPath(montanaClaraPath,'Montaña Clara');
    addCircle('560.2','22.8','0.35','Roque del Oeste');
    addCircle('585.9','25.1','0.35','Roque del Este');
    map.appendChild(chinijo);

    /* La red decorativa acompaña los centros reales del conjunto oriental. */
    const network=document.querySelector('.network-layer');
    if(network){
      const violet=[...network.querySelectorAll('.violet-line')];
      if(violet[1])violet[1].setAttribute('d','M510 141 C532 107,543 82,552 61 C559 44,562 34,565.5 27.6');
      const nodes=[...network.querySelectorAll('.network-nodes circle')];
      if(nodes[6]){nodes[6].setAttribute('cx','552');nodes[6].setAttribute('cy','61');}
      if(nodes[7]){nodes[7].setAttribute('cx','565.5');nodes[7].setAttribute('cy','27.6');}
    }

    document.documentElement.dataset.c8MapGeometry='reference-traced-20260726';
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();
})();