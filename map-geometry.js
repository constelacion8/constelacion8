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

    /* La Graciosa: ligeramente desplazada al NO para que El Río sea legible incluso con el glow. */
    const graciosaPath='M567.6 24.2 L566.5 23.2 L565.3 23.1 L564.4 22.2 L563.6 22.0 L563.3 22.6 L563.3 23.2 L562.2 25.0 L562.2 26.4 L561.6 26.8 L561.6 28.2 L559.4 29.5 L559.5 30.9 L560.1 30.9 L560.9 31.2 L561.2 30.9 L561.9 30.9 L563.0 30.2 L563.0 29.9 L563.3 29.6 L564.2 29.6 L564.4 29.5 L564.4 28.8 L565.0 28.7 L565.8 27.8 L565.8 26.7 L565.9 26.4 L567.8 24.8 Z';
    graciosa.querySelectorAll('.island-aura,.island-shape').forEach(path=>path.setAttribute('d',graciosaPath));
    const hit=graciosa.querySelector('.tiny-hit');
    if(hit){hit.setAttribute('cx','563.5');hit.setAttribute('cy','26.6');hit.setAttribute('r','7');}

    /* El resto del Chinijo queda como referencia geográfica, no como nuevas islas navegables. */
    map.querySelectorAll('.chinijo-reference').forEach(node=>node.remove());
    const chinijo=document.createElementNS(NS,'g');
    chinijo.setAttribute('class','chinijo-reference');
    chinijo.setAttribute('aria-label','Archipiélago Chinijo');
    chinijo.setAttribute('pointer-events','none');

    const style='fill:rgba(255,205,0,.07);stroke:rgba(255,205,0,.52);stroke-width:.55;vector-effect:non-scaling-stroke';
    const addPath=(d,label)=>{const p=document.createElementNS(NS,'path');p.setAttribute('d',d);p.setAttribute('style',style);p.setAttribute('aria-label',label);chinijo.appendChild(p);};
    const addCircle=(cx,cy,r,label)=>{const c=document.createElementNS(NS,'circle');c.setAttribute('cx',cx);c.setAttribute('cy',cy);c.setAttribute('r',r);c.setAttribute('style',style);c.setAttribute('aria-label',label);chinijo.appendChild(c);};

    const alegranzaPath='M566.1 6.7 L565.3 5.8 L564.8 5.8 L564.5 5.5 L563.9 5.5 L563.4 5.8 L562.8 6.0 L562.0 6.7 L562.0 6.9 L561.4 7.5 L561.4 8.6 L561.6 8.9 L562.2 9.2 L562.6 9.2 L562.8 9.1 L564.0 9.1 L564.0 8.9 L564.8 8.1 L565.4 8.1 L565.9 7.7 Z';
    const montanaClaraPath='M560.6 19.7 L560.5 19.7 L560.3 19.8 L560.3 21.7 L560.8 21.5 L560.8 21.4 L560.9 21.2 L560.9 20.8 L561.4 20.3 Z';
    addPath(alegranzaPath,'Alegranza');
    addPath(montanaClaraPath,'Montaña Clara');
    addCircle('558.2','21.8','0.35','Roque del Oeste');
    addCircle('583.9','24.1','0.35','Roque del Este');
    map.appendChild(chinijo);

    /* La red decorativa acompaña los centros reales del conjunto oriental. */
    const network=document.querySelector('.network-layer');
    if(network){
      const violet=[...network.querySelectorAll('.violet-line')];
      if(violet[1])violet[1].setAttribute('d','M510 141 C532 107,543 82,552 61 C558 44,560 34,563.5 26.6');
      const nodes=[...network.querySelectorAll('.network-nodes circle')];
      if(nodes[6]){nodes[6].setAttribute('cx','552');nodes[6].setAttribute('cy','61');}
      if(nodes[7]){nodes[7].setAttribute('cx','563.5');nodes[7].setAttribute('cy','26.6');}
    }

    document.documentElement.dataset.c8MapGeometry='reference-traced-separated-20260726';
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();
})();
