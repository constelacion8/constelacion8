/* Corrección conservadora del extremo oriental del mapa.
   Lanzarote conserva exactamente su silueta vectorial original; este archivo solo
   separa La Graciosa y sitúa referencias discretas del Archipiélago Chinijo. */
(function installEasternCanaryGeometry(){
  const NS='http://www.w3.org/2000/svg';

  function apply(){
    const map=document.querySelector('.canary-map');
    if(!map)return;

    const lanzarote=map.querySelector('[data-island="lanzarote"]');
    const graciosa=map.querySelector('[data-island="la-graciosa"]');
    if(!lanzarote||!graciosa)return;

    /* Silueta ORIGINAL de Lanzarote: no volver a reinterpretarla ni simplificarla. */
    const lanzarotePath='M577,19 L573,18 L572,16 L569,16 L569,19 L572,20 L571,24 L568,28 L569,29 L573,28 L575,29 L573,31 L571,39 L569,41 L567,41 L565,39 L555,41 L551,46 L543,48 L536,54 L534,60 L535,62 L534,67 L535,68 L529,73 L529,79 L539,79 L540,81 L542,81 L549,71 L559,70 L563,68 L564,66 L571,65 L573,62 L578,59 L580,56 L580,51 L582,47 L582,44 L580,41 L585,36 L585,29 L577,24 L579,22 Z';
    lanzarote.querySelectorAll('.island-aura,.island-shape').forEach(path=>path.setAttribute('d',lanzarotePath));

    /* La Graciosa: pieza independiente al NNO, con agua visible respecto a Lanzarote. */
    const graciosaPath='M544 19 L548 17 L553 17 L557 19 L559 22 L558 25 L555 27 L551 29 L547 28 L543 26 L541 23 L542 21 Z';
    graciosa.querySelectorAll('.island-aura,.island-shape').forEach(path=>path.setAttribute('d',graciosaPath));
    const hit=graciosa.querySelector('.tiny-hit');
    if(hit){hit.setAttribute('cx','550');hit.setAttribute('cy','23');hit.setAttribute('r','10');}

    map.querySelectorAll('.chinijo-reference').forEach(node=>node.remove());
    const chinijo=document.createElementNS(NS,'g');
    chinijo.setAttribute('class','chinijo-reference');
    chinijo.setAttribute('aria-label','Archipiélago Chinijo');
    chinijo.setAttribute('pointer-events','none');

    const style='fill:rgba(255,205,0,.07);stroke:rgba(255,205,0,.52);stroke-width:.55;vector-effect:non-scaling-stroke';
    const addPath=(d,label)=>{const p=document.createElementNS(NS,'path');p.setAttribute('d',d);p.setAttribute('style',style);p.setAttribute('aria-label',label);chinijo.appendChild(p);};
    const addCircle=(cx,cy,r,label)=>{const c=document.createElementNS(NS,'circle');c.setAttribute('cx',cx);c.setAttribute('cy',cy);c.setAttribute('r',r);c.setAttribute('style',style);c.setAttribute('aria-label',label);chinijo.appendChild(c);};

    /* Alegranza al norte; Montaña Clara al oeste de La Graciosa; roques mínimos. */
    addPath('M550 5 L553 3 L557 4 L558 7 L556 10 L552 10 L549 8 Z','Alegranza');
    addPath('M536 18 L539 16 L542 17 L543 20 L541 22 L537 22 L535 20 Z','Montaña Clara');
    addCircle('533','18','0.8','Roque del Oeste');
    addCircle('565','20','0.75','Roque del Este');
    map.appendChild(chinijo);

    /* Solo recolocamos los nodos decorativos; no alteramos más geometría insular. */
    const network=document.querySelector('.network-layer');
    if(network){
      const violet=[...network.querySelectorAll('.violet-line')];
      if(violet[1])violet[1].setAttribute('d','M510 141 C532 107,548 82,559 58 C565 45,568 33,573 25 C562 22,556 22,550 23');
      const nodes=[...network.querySelectorAll('.network-nodes circle')];
      if(nodes[6]){nodes[6].setAttribute('cx','559');nodes[6].setAttribute('cy','58');}
      if(nodes[7]){nodes[7].setAttribute('cx','550');nodes[7].setAttribute('cy','23');}
    }

    document.documentElement.dataset.c8MapGeometry='lanzarote-original-graciosa-separated';
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});
  else apply();
})();