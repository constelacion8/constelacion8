/* Top 5 editorial: Vidas legendarias de película. */
(function installLegendaryLivesRanking(){
  const REFRESH_MS=10*60*1000;
  const RANKING=[
    {
      slug:'jose-de-anchieta',
      hook:'De Tenerife a Brasil: océano, misiones y una vida convertida en leyenda.',
      why:'Nacido en La Laguna en 1534, cruzó el Atlántico siendo muy joven y desarrolló casi toda su vida en Brasil como jesuita, escritor, profesor y misionero. Su trayectoria quedó ligada a los primeros tiempos de São Paulo y a algunos de los grandes episodios humanos, culturales y religiosos del Brasil colonial.',
      source:'https://historia-hispanica.rah.es/biografias/24641-san-jose-de-anchieta'
    },
    {
      slug:'amaro-pargo',
      hook:'Corsario, comercio atlántico, Caribe, fortuna y una biografía rodeada de misterio.',
      why:'Amaro Rodríguez Felipe, conocido como Amaro Pargo, protagonizó una intensa vida marítima entre Canarias y América. La documentación conservada acredita sus actuaciones corsarias, la protección de buques de la Carrera de Indias y sus vínculos con la Corona, ingredientes de una auténtica aventura atlántica del siglo XVIII.',
      source:'https://portalciencia.ull.es/documentos/65ea0e4a8aef32320667f140'
    },
    {
      slug:'mercedes-pinto',
      hook:'Violencia, huida, desafío público, exilio y una nueva vida construida en América.',
      why:'Escritora, periodista y pionera de los derechos de las mujeres, convirtió una experiencia personal durísima en una trayectoria pública extraordinaria. Tras su polémica defensa del divorcio abandonó España y recorrió Uruguay, Chile, Cuba y México. Su novela Él acabaría siendo llevada al cine por Luis Buñuel.',
      source:'https://www.bibliotecadecanarias.org/escritores-as/mercedes-pinto'
    },
    {
      slug:'bencomo',
      hook:'El mencey de Taoro frente a la conquista de Tenerife.',
      why:'Bencomo encabezó la resistencia del poderoso menceyato de Taoro durante la conquista castellana de Tenerife. Rechazó las condiciones de rendición de Alonso Fernández de Lugo y quedó ligado a las grandes batallas de la conquista hasta perder la vida en la campaña de 1495. Su historia contiene todos los elementos de una gran película histórica.',
      source:'https://www.gobiernodecanarias.org/cmsweb/export/sites/educacion/web/programas-redes-educativas/_galerias/galeria_documentos/ensenas/historia-y-patrimonio-vol2-primaria-1.pdf'
    },
    {
      slug:'antonio-cubillo',
      hook:'Exilio, independentismo, geopolítica africana y un atentado que casi acaba con su vida.',
      why:'Abogado y dirigente independentista, pasó buena parte de su trayectoria política en Argelia y convirtió la cuestión canaria en un asunto con dimensión internacional. En 1978 sufrió un brutal atentado en Argel que le dejó graves secuelas. Una biografía propia de un thriller político, marcada también por fuertes controversias y por la violencia vinculada a su movimiento.',
      source:'https://elpais.com/politica/2012/12/10/actualidad/1355140551_352067.html'
    }
  ];

  function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function fullName(person){return person.known_as||person.full_name||'Perfil sin nombre';}
  function islandName(person){return person.places?.find(place=>place.relation_type==='birth'&&place.island)?.island?.name??person.places?.find(place=>place.island)?.island?.name??'Canarias';}

  function installStyles(){
    if(document.getElementById('c8LegendaryLivesStyles'))return;
    const style=document.createElement('style');
    style.id='c8LegendaryLivesStyles';
    style.textContent=`
      .c8-legendary-ranking{margin-top:52px;padding-top:40px;border-top:1px solid rgba(255,205,0,.2)}
      .c8-legendary-ranking .c8-ranking-head{margin-bottom:23px}
      .c8-legendary-ranking .c8-ranking-head h3 span{color:#FFCD00}
      .c8-legendary-list{display:grid;gap:10px}
      .c8-legendary-card{display:grid;grid-template-columns:74px minmax(210px,.78fr) minmax(300px,1.55fr);gap:18px;align-items:start;padding:22px;border:1px solid rgba(255,205,0,.15);border-radius:16px;background:radial-gradient(circle at 92% 8%,rgba(255,205,0,.055),transparent 26%),linear-gradient(145deg,rgba(59,10,106,.24),rgba(26,6,51,.64))}
      .c8-legendary-num{font-family:"Work Sans",Arial,sans-serif;font-size:34px;font-weight:600;letter-spacing:-.05em;color:#FFCD00}
      .c8-legendary-person{border:0;background:transparent;padding:0;text-align:left;color:#fff;cursor:pointer}
      .c8-legendary-person strong{display:block;font-family:"Work Sans",Arial,sans-serif;font-size:18px;line-height:1.2;color:#fff}
      .c8-legendary-person small{display:block;margin-top:6px;font-size:11px;color:#FFCD00;font-weight:600}
      .c8-legendary-hook{display:block;margin-top:11px;font-size:12px;line-height:1.52;color:#EADFF1}
      .c8-legendary-copy{font-size:12px;line-height:1.62;color:#F1E9F6}
      .c8-legendary-copy p{margin:0 0 10px}
      .c8-legendary-copy a{color:#FFCD00;text-decoration:none}
      .c8-legendary-copy a:hover,.c8-legendary-copy a:focus-visible{text-decoration:underline;outline:none}
      .c8-legendary-note{margin-top:16px;padding:18px 20px;border-left:2px solid #FFCD00;background:rgba(255,205,0,.035);font-size:11px;line-height:1.65;color:#EDE4F3}
      .c8-legendary-note strong{color:#fff}
      @media(max-width:860px){.c8-legendary-card{grid-template-columns:54px 1fr}.c8-legendary-copy{grid-column:2}}
      @media(max-width:620px){.c8-legendary-ranking{margin-top:38px;padding-top:34px}.c8-legendary-card{grid-template-columns:42px 1fr;padding:19px}.c8-legendary-num{font-size:30px}.c8-legendary-copy{grid-column:2}.c8-legendary-person strong{font-size:17px}.c8-legendary-hook,.c8-legendary-copy{font-size:13px}}
    `;
    document.head.appendChild(style);
  }

  function scrollProfileToTop(){
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      const profile=document.querySelector('#directory article.profile');
      if(!profile)return;
      const headerHeight=document.querySelector('.site-header')?.getBoundingClientRect().height??72;
      window.scrollTo({top:Math.max(0,profile.getBoundingClientRect().top+window.scrollY-headerHeight-10),left:0,behavior:'auto'});
    }));
  }

  function render(records){
    const inner=document.querySelector('#cifras .c8-stats-inner');
    if(!inner)return false;
    installStyles();
    inner.querySelector('#c8LegendaryLivesRanking')?.remove();
    const verified=records.filter(p=>!p.editorial_status||p.editorial_status==='verified'||p.editorial_status==='published');
    const bySlug=new Map(verified.map(person=>[person.slug,person]));
    const available=RANKING.map(item=>({item,person:bySlug.get(item.slug)})).filter(row=>row.person);
    if(!available.length)return false;

    const section=document.createElement('section');
    section.id='c8LegendaryLivesRanking';
    section.className='c8-ranking c8-legendary-ranking';
    section.innerHTML=`
      <header class="c8-ranking-head">
        <div><h3>TOP 5 · <span>Vidas legendarias de película</span></h3></div>
        <p>Cinco personajes de Canarias cuyas biografías parecen escritas para el cine. Aventuras, guerras, océanos, exilios, persecuciones y episodios extraordinarios que atraviesan más de cinco siglos de historia.</p>
      </header>
      <div class="c8-legendary-list">${available.map(({item,person},index)=>`
        <article class="c8-legendary-card">
          <div class="c8-legendary-num">0${index+1}</div>
          <button type="button" class="c8-legendary-person" data-c8-legendary-person="${esc(person.id)}"><strong>${esc(fullName(person))}</strong><small>${esc(islandName(person))}</small><span class="c8-legendary-hook">${esc(item.hook)}</span></button>
          <div class="c8-legendary-copy"><p>${esc(item.why)}</p><p><a href="${esc(item.source)}" target="_blank" rel="noopener noreferrer">Fuente de referencia ↗</a></p></div>
        </article>`).join('')}</div>
      <div class="c8-legendary-note"><strong>Selección editorial C8.</strong> “Vida legendaria” describe la fuerza narrativa de una biografía, no una valoración moral, política o ideológica de la persona. El orden atiende al potencial cinematográfico y a la singularidad de cada trayectoria.</div>`;

    const women=document.getElementById('c8WomenInfluenceRanking');
    const general=document.getElementById('c8InfluenceRanking');
    if(women)women.insertAdjacentElement('afterend',section);
    else if(general)general.insertAdjacentElement('afterend',section);
    else inner.appendChild(section);

    section.querySelectorAll('[data-c8-legendary-person]').forEach(button=>button.addEventListener('click',()=>{
      if(typeof openProfile==='function'){
        openProfile(button.dataset.c8LegendaryPerson);
        scrollProfileToTop();
      }
    }));
    return true;
  }

  async function refresh(){
    try{
      if(typeof C8_API_URL==='undefined'||typeof C8_PUBLISHABLE_KEY==='undefined')return;
      const response=await fetch(C8_API_URL,{headers:{apikey:C8_PUBLISHABLE_KEY,Accept:'application/json'},cache:'no-store'});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const payload=await response.json();
      const records=Array.isArray(payload.people)?payload.people:[];
      if(!records.length)return;
      if(!render(records))window.setTimeout(()=>render(records),700);
    }catch(error){console.error('Constelación 8: no se pudo cargar Vidas legendarias de película.',error);}
  }

  refresh();
  window.addEventListener('c8:data-ready',refresh);
  window.setInterval(refresh,REFRESH_MS);
})();