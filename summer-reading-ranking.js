/* Top 5 editorial: lecturas canarias para el verano. */
(function installSummerReadingRanking(){
  const REFRESH_MS=10*60*1000;
  const RANKING=[
    {
      slug:'pedro-garcia-cabrera',
      work:'Las islas en que vivo',
      year:'1971',
      hook:'Una isla exterior y otra interior: mar, silencio, libertad y pertenencia.',
      why:'Uno de los libros que mejor convierten la condición insular en experiencia íntima. García Cabrera escribe desde el territorio, pero también desde la memoria, la libertad y el deseo de una isla capaz de dejar de ser silencio. Es una lectura luminosa y honda para volver a mirar Canarias desde dentro.',
      source:'https://www.bibliotecadecanarias.org/escritores-as/pedro-garcia-cabrera'
    },
    {
      slug:'josefina-de-la-torre',
      work:'Marzo incompleto',
      year:'1968',
      hook:'Memoria, deseo, ausencia y una voz que se busca a sí misma.',
      why:'La obra lírica más madura de Josefina de la Torre transforma la intimidad en paisaje. El amor, la maternidad frustrada, la sensualidad, el recuerdo y la incertidumbre recorren un libro delicado y doloroso, de enorme transparencia emocional. Pocas lecturas canarias hablan con tanta cercanía desde el interior de una vida.',
      source:'https://portal.academiacanarialengua.org/archipielago-letras/josefina-de-la-torre/'
    },
    {
      slug:'rafael-arozarena',
      work:'Mararía',
      year:'1973',
      hook:'Lanzarote, deseo y tragedia alrededor de una mujer convertida en mito.',
      why:'El paisaje volcánico de Lanzarote no es un decorado: respira dentro de la historia. A través de distintas voces, Arozarena reconstruye la figura de Mararía y crea una novela de deseo, soledad, belleza y fatalidad profundamente ligada a la isla. Un clásico canario que sigue teniendo una fuerza visual extraordinaria.',
      source:'https://www.bibliotecadecanarias.org/escritores-as/rafael-arozarena'
    },
    {
      slug:'felix-francisco-casanova',
      work:'El invernadero',
      year:'1974',
      hook:'Juventud en carne viva: lluvia, sueños, cuerpos, miedo y belleza.',
      why:'Publicado cuando Félix Francisco Casanova apenas empezaba a construir una obra que quedaría interrumpida demasiado pronto, este poemario conserva una sensibilidad sorprendentemente moderna. Sus imágenes mezclan naturaleza, cuerpo, sueño, oscuridad y una intensidad juvenil que hace que el libro siga pareciendo escrito desde un presente inmediato.',
      source:'https://www.bibliotecadecanarias.org/lectura/letras-canarias-2023'
    },
    {
      slug:'natalia-sosa-ayala',
      work:'Muchacha sin nombre y otros poemas',
      year:'1980',
      hook:'Identidad, deseo y silencio: una voz íntima que lucha por poder nombrarse.',
      why:'Natalia Sosa Ayala convierte la escritura en búsqueda de identidad y resistencia íntima. En este poemario aparecen el desdoblamiento, la soledad, el deseo, la sensación de no encajar y la necesidad de construir una voz propia frente a los límites impuestos por su tiempo. Es una lectura vulnerable, valiente y profundamente humana.',
      source:'https://portal.academiacanarialengua.org/archipielago-letras/natalia-sosa-ayala/'
    }
  ];

  function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function fullName(person){return person.known_as||person.full_name||'Perfil sin nombre';}
  function islandName(person){return person.places?.find(place=>place.relation_type==='birth'&&place.island)?.island?.name??person.places?.find(place=>place.island)?.island?.name??'Canarias';}

  function installStyles(){
    if(document.getElementById('c8SummerReadingStyles'))return;
    const style=document.createElement('style');
    style.id='c8SummerReadingStyles';
    style.textContent=`
      .c8-summer-ranking{margin-top:52px;padding-top:40px;border-top:1px solid rgba(255,205,0,.2)}
      .c8-summer-ranking .c8-ranking-head{margin-bottom:23px}
      .c8-summer-ranking .c8-ranking-head h3 span{color:#FFCD00}
      .c8-summer-list{display:grid;gap:10px}
      .c8-summer-card{display:grid;grid-template-columns:74px minmax(230px,.9fr) minmax(300px,1.55fr);gap:18px;align-items:start;padding:22px;border:1px solid rgba(255,205,0,.16);border-radius:16px;background:radial-gradient(circle at 8% 0%,rgba(255,205,0,.075),transparent 22%),radial-gradient(circle at 94% 100%,rgba(157,78,221,.12),transparent 30%),linear-gradient(145deg,rgba(59,10,106,.22),rgba(26,6,51,.66))}
      .c8-summer-num{font-family:"Work Sans",Arial,sans-serif;font-size:34px;font-weight:600;letter-spacing:-.05em;color:#FFCD00}
      .c8-summer-person{border:0;background:transparent;padding:0;text-align:left;color:#fff;cursor:pointer}
      .c8-summer-work{display:block;font-family:"Work Sans",Arial,sans-serif;font-size:19px;line-height:1.16;font-weight:600;color:#fff}
      .c8-summer-person strong{display:block;margin-top:7px;font-family:"Work Sans",Arial,sans-serif;font-size:12px;line-height:1.3;font-weight:500;color:#FFCD00}
      .c8-summer-person small{display:block;margin-top:3px;font-size:10px;color:#D8CDE2}
      .c8-summer-hook{display:block;margin-top:12px;font-size:12px;line-height:1.52;color:#EADFF1}
      .c8-summer-copy{font-size:12px;line-height:1.66;color:#F1E9F6}
      .c8-summer-copy p{margin:0 0 10px}
      .c8-summer-copy a{color:#FFCD00;text-decoration:none}
      .c8-summer-copy a:hover,.c8-summer-copy a:focus-visible{text-decoration:underline;outline:none}
      .c8-summer-note{margin-top:16px;padding:18px 20px;border-left:2px solid #FFCD00;background:rgba(255,205,0,.035);font-size:11px;line-height:1.65;color:#EDE4F3}
      .c8-summer-note strong{color:#fff}
      @media(max-width:860px){.c8-summer-card{grid-template-columns:54px 1fr}.c8-summer-copy{grid-column:2}}
      @media(max-width:620px){.c8-summer-ranking{margin-top:38px;padding-top:34px}.c8-summer-card{grid-template-columns:42px 1fr;padding:19px}.c8-summer-num{font-size:30px}.c8-summer-copy{grid-column:2}.c8-summer-work{font-size:18px}.c8-summer-hook,.c8-summer-copy{font-size:13px}}
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
    inner.querySelector('#c8SummerReadingRanking')?.remove();
    const verified=records.filter(p=>!p.editorial_status||p.editorial_status==='verified'||p.editorial_status==='published');
    const bySlug=new Map(verified.map(person=>[person.slug,person]));
    const available=RANKING.map(item=>({item,person:bySlug.get(item.slug)})).filter(row=>row.person);
    if(!available.length)return false;

    const section=document.createElement('section');
    section.id='c8SummerReadingRanking';
    section.className='c8-ranking c8-summer-ranking';
    section.innerHTML=`
      <header class="c8-ranking-head">
        <div><h3>TOP 5 · <span>Libros canarios que deberías leer este verano</span></h3></div>
        <p>Cinco obras para leer despacio: isla, memoria, deseo, juventud e identidad. Una selección de libros y poemarios especialmente sensibles de la literatura canaria.</p>
      </header>
      <div class="c8-summer-list">${available.map(({item,person},index)=>`
        <article class="c8-summer-card">
          <div class="c8-summer-num">0${index+1}</div>
          <button type="button" class="c8-summer-person" data-c8-summer-person="${esc(person.id)}"><span class="c8-summer-work">${esc(item.work)}</span><strong>${esc(fullName(person))}</strong><small>${esc(item.year)} · ${esc(islandName(person))}</small><span class="c8-summer-hook">${esc(item.hook)}</span></button>
          <div class="c8-summer-copy"><p>${esc(item.why)}</p><p><a href="${esc(item.source)}" target="_blank" rel="noopener noreferrer">Fuente de referencia ↗</a></p></div>
        </article>`).join('')}</div>
      <div class="c8-summer-note"><strong>Selección editorial C8.</strong> El orden no pretende establecer un canon absoluto de la literatura canaria. Prioriza la sensibilidad de la obra, su capacidad para conectar con el territorio y el placer de descubrirla como lectura de verano.</div>`;

    const legendary=document.getElementById('c8LegendaryLivesRanking');
    const women=document.getElementById('c8WomenInfluenceRanking');
    const general=document.getElementById('c8InfluenceRanking');
    if(legendary)legendary.insertAdjacentElement('afterend',section);
    else if(women)women.insertAdjacentElement('afterend',section);
    else if(general)general.insertAdjacentElement('afterend',section);
    else inner.appendChild(section);

    section.querySelectorAll('[data-c8-summer-person]').forEach(button=>button.addEventListener('click',()=>{
      if(typeof openProfile==='function'){
        openProfile(button.dataset.c8SummerPerson);
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
    }catch(error){console.error('Constelación 8: no se pudo cargar el ranking de lecturas de verano.',error);}
  }

  refresh();
  window.addEventListener('c8:data-ready',refresh);
  window.setInterval(refresh,REFRESH_MS);
})();