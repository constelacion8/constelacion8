/* Extensión editorial de "La constelación en cifras": territorio + Índice de trascendencia C8. */
(function installConstellationRanking(){
  const REFRESH_MS=10*60*1000;
  const fmt=new Intl.NumberFormat('es-ES');

  const WOMEN_CURRENT=new Set([
    'Alcira Padrón Armas','Flora Lilia Barrera Álamo','María Mérida Pérez','María Josefina Plá Guerra Galvany',
    'Antonia San Juan Fernández','Carla Suárez Navarro','Carolina Darias San Sebastián','Dolores Massieu Verdugo',
    'Josefa Aurora Rodríguez Silvera','Josefina de la Torre Millares','Leonor Rodríguez Manso','Leticia Romero González',
    'María Cristina del Pino Segura Gómez','María Dolores de la Fe Bonilla','María Isabel Rodríguez Rivero','Marta Mangué González',
    'Natalia Sosa Ayala','Paola Tirados Sánchez','Patricia Guerra Cabrera','Pino Ojeda Quevedo','Thaïs Henríquez Torres',
    'Cesarina Bento Montesino','Isabel Medina Brito','Inocencia Páez Betancort','Margarita Páez Guadalupe',
    'Carmen Arozena Rodríguez','María Isabel Nazco Hernández','Gregoria Micaela Toledo Machín','María de los Dolores Suárez Suárez',
    'María Lasso Morales','Rosana Arbelo Gopar','Ana Bautista Reyes','Antonia del Carmen Acosta León',
    'Carolina Martínez Pulido','Cecilia Domínguez Luis','Dolores Campos-Herrero Navas','Dolores Covadonga Corbella Díaz',
    'Francisca Balbina Rivero Pimienta','María Belén Morales Gómez','María del Carmen Betancourt y Molina',
    'María del Rosario Álvarez Martínez','María Joaquina Viera y Clavijo','María Rosa Alonso Rodríguez','Mercedes Pinto Armas de la Rosa y Clós','Michelle Alonso Morales',
    'Valentina Hernández Rodríguez'
  ]);

  const RANKING=[
    {
      slug:'benito-perez-galdos',score:96,
      parts:[['Aportación histórica',25,25],['Proyección exterior',20,20],['Permanencia',20,20],['Historia de Canarias',14,15],['Arraigo',8,10],['Reconocimiento actual',9,10]],
      why:'Su obra ocupa una posición central en la literatura española moderna y conserva una recepción crítica, editorial y académica internacional excepcional.',
      source:'https://www.cervantesvirtual.com/portales/benito_perez_galdos/autor_apunte/'
    },
    {
      slug:'juan-negrin',score:94,
      parts:[['Aportación histórica',24,25],['Proyección exterior',20,20],['Permanencia',19,20],['Historia de Canarias',14,15],['Arraigo',8,10],['Reconocimiento actual',9,10]],
      why:'Combina una carrera científica de primer nivel con un papel decisivo como jefe del Gobierno de la II República durante la Guerra Civil y el exilio.',
      source:'https://fundacionjuannegrin.es/juan-negrin/cronobiografia/'
    },
    {
      slug:'agustin-de-betancourt',score:92,
      parts:[['Aportación histórica',25,25],['Proyección exterior',20,20],['Permanencia',18,20],['Historia de Canarias',12,15],['Arraigo',8,10],['Reconocimiento actual',9,10]],
      why:'Ingeniero ilustrado de proyección europea, impulsó instituciones técnicas y grandes obras públicas en España y Rusia y es una figura clave de la ingeniería moderna.',
      source:'https://fundacionorotava.org/en/betancourt/about/description/'
    },
    {
      slug:'cesar-manrique',score:90,
      parts:[['Aportación histórica',20,25],['Proyección exterior',18,20],['Permanencia',19,20],['Historia de Canarias',15,15],['Arraigo',10,10],['Reconocimiento actual',8,10]],
      why:'Transformó la relación entre arte, paisaje, turismo y territorio en Lanzarote y dejó un modelo cultural y ambiental inseparable de la imagen contemporánea de la isla.',
      source:'https://fcmanrique.org/cesar-manrique/biografia/'
    },
    {
      slug:'blas-cabrera-felipe',score:89,
      parts:[['Aportación histórica',23,25],['Proyección exterior',19,20],['Permanencia',18,20],['Historia de Canarias',13,15],['Arraigo',8,10],['Reconocimiento actual',8,10]],
      why:'Fue una de las grandes figuras españolas de la física del siglo XX, referente internacional en magnetismo e integrante de las redes científicas europeas de su tiempo.',
      source:'https://rac.es/sobre-nosotros/miembros/academicos-historicos/numerarios/217/'
    }
  ];

  const WOMEN_RANKING=[
    {
      slug:'mercedes-pinto',
      why:'Escritora, periodista y activista de amplia proyección hispanoamericana. Su trayectoria convirtió la literatura y la intervención pública en herramientas de transformación social y dejó una huella que rebasa el ámbito insular.',
      source:'https://www.bibliotecadecanarias.org/escritores-as/mercedes-pinto'
    },
    {
      slug:'josefina-de-la-torre',
      why:'Poeta, actriz, cantante y novelista vinculada a la Generación del 27. Su trayectoria multidisciplinar la sitúa entre las creadoras canarias con mayor presencia en la cultura española del siglo XX.',
      source:'https://portal.academiacanarialengua.org/archipielago-letras/josefina-de-la-torre/'
    },
    {
      slug:'maria-rosa-alonso',
      why:'Filóloga, ensayista, docente e investigadora fundamental para el estudio de la literatura y la cultura de Canarias. Su obra intelectual atravesó buena parte del siglo XX y dejó un legado académico duradero.',
      source:'https://www.ull.es/portal/hipotesis/calendario-investigaull/figurag_investigaull/mariarosaalonso/'
    },
    {
      slug:'maria-joaquina-viera-y-clavijo',
      why:'Figura pionera de las letras canarias en el siglo XVIII. Su obra posee un valor singular tanto por su aportación literaria como por haber desarrollado una voz intelectual propia en un contexto especialmente restrictivo para las mujeres.',
      source:'https://portal.academiacanarialengua.org/archipielago-letras/maria-joaquina-viera-y-clavijo/'
    },
    {
      slug:'valentina-la-de-sabinosa',
      why:'Figura esencial para la conservación y transmisión del patrimonio musical y oral de El Hierro. Su voz y su memoria contribuyeron decisivamente a proyectar una parte fundamental de la cultura tradicional canaria.',
      source:'https://www.gobiernodecanarias.org/igualdad/documentos/publicaciones/mujer_cultura_canarias.pdf'
    }
  ];

  function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function birthIsland(person){return person.places?.find(place=>place.relation_type==='birth'&&place.island)?.island?.name??null;}
  function fullName(person){return person.full_name||person.known_as||'Perfil sin nombre';}

  function topIsland(records,predicate=()=>true){
    const counts=new Map();
    for(const person of records){
      if(!predicate(person))continue;
      const island=birthIsland(person);
      if(!island)continue;
      counts.set(island,(counts.get(island)||0)+1);
    }
    return [...counts.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'es'))[0]||null;
  }

  function installStyles(){
    if(document.getElementById('c8RankingStyles'))return;
    const style=document.createElement('style');
    style.id='c8RankingStyles';
    style.textContent=`
      .c8-extra-metrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:14px}
      .c8-extra-card{padding:24px;border:1px solid rgba(255,255,255,.12);border-radius:18px;background:linear-gradient(145deg,rgba(43,10,76,.84),rgba(22,4,39,.76))}
      .c8-extra-card small{display:block;font-family:"Work Sans",Arial,sans-serif;text-transform:uppercase;letter-spacing:.14em;font-size:9px;font-weight:700;color:#FFCD00}
      .c8-extra-card strong{display:block;margin:15px 0 6px;font-family:"Work Sans",Arial,sans-serif;font-size:clamp(28px,4vw,44px);line-height:.98;letter-spacing:-.045em;color:#fff}
      .c8-extra-card b{font-size:13px;color:#FFCD00}
      .c8-extra-card p{margin:13px 0 0;font-size:12px;line-height:1.6;color:#F1E9F6}
      .c8-ranking{margin-top:54px;padding-top:38px;border-top:1px solid rgba(255,255,255,.1)}
      .c8-ranking-head{display:grid;grid-template-columns:minmax(0,.75fr) minmax(300px,1fr);gap:38px;align-items:end;margin-bottom:24px}
      .c8-ranking-head h3{margin:0;font-family:"Work Sans",Arial,sans-serif;font-size:clamp(28px,4vw,46px);line-height:1;letter-spacing:-.045em;color:#fff}
      .c8-ranking-head h3 span{color:#FFCD00}
      .c8-ranking-head p{margin:0;font-size:13px;line-height:1.68;color:#F1E9F6}
      .c8-ranking-list{display:grid;gap:10px}
      .c8-rank-card{display:grid;grid-template-columns:74px minmax(180px,.7fr) 120px minmax(280px,1.5fr);gap:18px;align-items:start;padding:21px;border:1px solid rgba(255,255,255,.11);border-radius:16px;background:rgba(26,6,51,.6)}
      .c8-rank-num{font-family:"Work Sans",Arial,sans-serif;font-size:34px;font-weight:600;letter-spacing:-.05em;color:#FFCD00}
      .c8-rank-person{border:0;background:transparent;padding:0;text-align:left;color:#fff;cursor:pointer}
      .c8-rank-person strong{display:block;font-family:"Work Sans",Arial,sans-serif;font-size:17px;line-height:1.22;color:#fff}
      .c8-rank-person small{display:block;margin-top:5px;font-size:11px;color:#DCCFED}
      .c8-rank-island{color:#FFCD00!important;font-weight:600}
      .c8-rank-score{font-family:"Work Sans",Arial,sans-serif;font-size:30px;font-weight:600;color:#fff;letter-spacing:-.04em}.c8-rank-score small{font-size:11px;color:#DCCFED}
      .c8-rank-copy{font-size:12px;line-height:1.58;color:#F1E9F6}.c8-rank-copy p{margin:0 0 10px}.c8-rank-copy a{color:#FFCD00;text-decoration:none}.c8-rank-copy a:hover{text-decoration:underline}
      .c8-rank-parts{display:flex;flex-wrap:wrap;gap:5px}.c8-rank-parts span{padding:5px 7px;border:1px solid rgba(255,205,0,.25);border-radius:999px;font-size:9px;color:#F7F0FA}
      .c8-method{margin-top:16px;padding:18px 20px;border-left:2px solid #FFCD00;background:rgba(255,205,0,.04);font-size:11px;line-height:1.65;color:#EDE4F3}
      .c8-method strong{color:#fff}
      .c8-women-ranking{margin-top:48px;padding-top:40px;border-top:1px solid rgba(255,205,0,.18)}
      .c8-women-ranking .c8-ranking-head{margin-bottom:22px}
      .c8-women-ranking .c8-ranking-head h3 span{color:#FFCD00}
      .c8-women-ranking .c8-rank-card{grid-template-columns:74px minmax(200px,.8fr) minmax(280px,1.5fr);background:linear-gradient(145deg,rgba(59,10,106,.24),rgba(26,6,51,.62));border-color:rgba(255,205,0,.14)}
      .c8-women-ranking .c8-rank-num{color:#FFCD00}
      .c8-women-note{margin-top:16px;padding:18px 20px;border-left:2px solid #FFCD00;background:rgba(255,205,0,.035);font-size:11px;line-height:1.65;color:#EDE4F3}
      .c8-women-note strong{color:#fff}
      @media(max-width:860px){.c8-ranking-head{grid-template-columns:1fr}.c8-rank-card{grid-template-columns:54px 1fr 90px}.c8-rank-copy{grid-column:2/-1}.c8-women-ranking .c8-rank-card{grid-template-columns:54px 1fr}.c8-women-ranking .c8-rank-copy{grid-column:2}}
      @media(max-width:620px){.c8-extra-metrics{grid-template-columns:1fr}.c8-rank-card{grid-template-columns:42px 1fr}.c8-rank-score{grid-column:2;font-size:26px}.c8-rank-copy{grid-column:2}.c8-ranking{margin-top:42px}.c8-extra-card{padding:21px}.c8-women-ranking{margin-top:38px;padding-top:34px}.c8-women-ranking .c8-rank-card{grid-template-columns:42px 1fr}.c8-women-ranking .c8-rank-copy{grid-column:2}}
    `;
    document.head.appendChild(style);
  }

  function scrollRankingProfileToTop(){
    const doScroll=()=>{
      const profile=document.querySelector('#directory article.profile');
      if(!profile)return;
      const headerHeight=document.querySelector('.site-header')?.getBoundingClientRect().height??72;
      const top=Math.max(0,profile.getBoundingClientRect().top+window.scrollY-headerHeight-10);
      window.scrollTo({top,left:0,behavior:'auto'});
    };
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      doScroll();
      setTimeout(doScroll,80);
      setTimeout(doScroll,220);
    }));
  }

  function render(records){
    installStyles();
    const inner=document.querySelector('#cifras .c8-stats-inner');
    if(!inner)return false;
    inner.querySelector('#c8ExtraMetrics')?.remove();
    inner.querySelector('#c8InfluenceRanking')?.remove();
    inner.querySelector('#c8WomenInfluenceRanking')?.remove();

    const verified=records.filter(p=>!p.editorial_status||p.editorial_status==='verified'||p.editorial_status==='published');
    const islandLeader=topIsland(verified);
    const womenLeader=topIsland(verified,p=>WOMEN_CURRENT.has(p.full_name));

    const metrics=document.createElement('div');
    metrics.id='c8ExtraMetrics';
    metrics.className='c8-extra-metrics';
    metrics.innerHTML=`
      <article class="c8-extra-card"><small>La isla con más biografías</small><strong>${esc(islandLeader?.[0]||'—')}</strong><b>${islandLeader?fmt.format(islandLeader[1]):'—'} perfiles nacidos en la isla</b><p>Cuenta únicamente nacimientos insulares documentados dentro de los perfiles verificados. Es una medida de representación en la base, no de “importancia” de una isla.</p></article>
      <article class="c8-extra-card"><small>La isla con más mujeres destacadas</small><strong>${esc(womenLeader?.[0]||'—')}</strong><b>${womenLeader?fmt.format(womenLeader[1]):'—'} biografías de mujeres</b><p>Fotografía editorial de la colección actual. La clasificación se revisa nominalmente y no añade un campo de sexo o género a Supabase.</p></article>`;
    inner.querySelector('.c8-stats-grid')?.insertAdjacentElement('afterend',metrics);

    const bySlug=new Map(verified.map(p=>[p.slug,p]));
    const ranking=document.createElement('section');
    ranking.id='c8InfluenceRanking';
    ranking.className='c8-ranking';
    ranking.innerHTML=`
      <header class="c8-ranking-head">
        <div><h3>TOP 5 · <span>Índice de trascendencia C8</span></h3></div>
        <p>Una estimación editorial de la huella histórica de las personas de Constelación 8. No mide fama: combina aportación, proyección exterior, permanencia del legado, importancia para la historia de Canarias, arraigo y reconocimiento contemporáneo.</p>
      </header>
      <div class="c8-ranking-list">${RANKING.map((item,index)=>{
        const person=bySlug.get(item.slug);
        if(!person)return '';
        const island=birthIsland(person)||'Canarias';
        const alias=person.known_as&&person.known_as!==person.full_name?person.known_as:null;
        return `<article class="c8-rank-card">
          <div class="c8-rank-num">0${index+1}</div>
          <button type="button" class="c8-rank-person" data-c8-rank-person="${esc(person.id)}"><strong>${esc(fullName(person))}</strong>${alias?`<small>${esc(alias)}</small>`:''}<small class="c8-rank-island">${esc(island)}</small></button>
          <div class="c8-rank-score">${item.score}<small>/100</small></div>
          <div class="c8-rank-copy"><p>${esc(item.why)}</p><div class="c8-rank-parts">${item.parts.map(([label,value,max])=>`<span>${esc(label)} ${value}/${max}</span>`).join('')}</div><p><a href="${esc(item.source)}" target="_blank" rel="noopener noreferrer">Fuente de referencia ↗</a></p></div>
        </article>`;
      }).join('')}</div>
      <div class="c8-method"><strong>Cómo se calcula.</strong> Aportación histórica 25 puntos · proyección exterior 20 · permanencia del legado 20 · importancia para la historia de Canarias 15 · arraigo e identificación con Canarias 10 · reconocimiento e impacto contemporáneo 10. El índice es experimental, argumentado y revisable. La influencia no equivale a superioridad moral ni a popularidad en internet; los indicadores digitales solo forman una parte menor del último bloque.</div>`;
    metrics.insertAdjacentElement('afterend',ranking);

    const womenRanking=document.createElement('section');
    womenRanking.id='c8WomenInfluenceRanking';
    womenRanking.className='c8-ranking c8-women-ranking';
    womenRanking.innerHTML=`
      <header class="c8-ranking-head">
        <div><h3>TOP 5 · <span>Mujeres más influyentes de Canarias</span></h3></div>
        <p>Cinco trayectorias fundamentales para comprender la cultura, el pensamiento y la memoria de Canarias. Una selección editorial que busca hacer visible una parte de nuestra historia que durante mucho tiempo recibió menos atención.</p>
      </header>
      <div class="c8-ranking-list">${WOMEN_RANKING.map((item,index)=>{
        const person=bySlug.get(item.slug);
        if(!person)return '';
        const island=birthIsland(person)||'Canarias';
        const alias=person.known_as&&person.known_as!==person.full_name?person.known_as:null;
        return `<article class="c8-rank-card">
          <div class="c8-rank-num">0${index+1}</div>
          <button type="button" class="c8-rank-person" data-c8-rank-person="${esc(person.id)}"><strong>${esc(fullName(person))}</strong>${alias?`<small>${esc(alias)}</small>`:''}<small class="c8-rank-island">${esc(island)}</small></button>
          <div class="c8-rank-copy"><p>${esc(item.why)}</p><p><a href="${esc(item.source)}" target="_blank" rel="noopener noreferrer">Fuente de referencia ↗</a></p></div>
        </article>`;
      }).join('')}</div>
      <div class="c8-women-note"><strong>Selección editorial C8.</strong> Este ranking es provisional y revisable a medida que crece la investigación de Constelación 8. No modifica el Top 5 general ni aplica una cuota matemática: ordena cinco trayectorias femeninas especialmente relevantes para darles una lectura y visibilidad propias.</div>`;
    ranking.insertAdjacentElement('afterend',womenRanking);

    inner.querySelectorAll('[data-c8-rank-person]').forEach(button=>button.addEventListener('click',()=>{
      if(typeof openProfile==='function'){
        openProfile(button.dataset.c8RankPerson);
        scrollRankingProfileToTop();
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
      if(!render(records))window.setTimeout(()=>render(records),600);
    }catch(error){console.error('Constelación 8: no se pudieron cargar las métricas editoriales.',error);}
  }

  refresh();
  window.addEventListener('c8:data-ready',refresh);
  window.setInterval(refresh,REFRESH_MS);
})();