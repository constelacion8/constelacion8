/* Top 5 editorial: discos esenciales ligados a artistas de Constelación 8. */
(function installMusicAlbumsRanking(){
  const REFRESH_MS=10*60*1000;
  const RANKING=[
    {
      slug:'teddy-bautista', artist:'Canarios / Teddy Bautista', album:'Ciclos', year:'1974',
      hook:'Rock progresivo, electrónica, clásica y ópera llevados al límite.',
      why:'Una de las obras más ambiciosas del rock español de los setenta. A partir de Las cuatro estaciones de Vivaldi, Teddy Bautista construyó con Canarios un disco monumental en el que conviven rock progresivo, música clásica, electrónica y voces operísticas. Medio siglo después sigue sonando radical.',
      source:'https://elpais.com/cultura/2020-06-05/otros-15-discos-del-rock-espanol-de-los-setenta-que-hay-que-escuchar-una-y-otra-vez.html'
    },
    {
      slug:'rosana-arbelo', artist:'Rosana', album:'Lunas rotas', year:'1996',
      hook:'El debut que llevó una voz de Lanzarote a decenas de países.',
      why:'El gran fenómeno internacional de la canción pop canaria de los noventa. Con temas como El talismán, A fuego lento o Si tú no estás, Lunas rotas consiguió certificación de diamante, premios nacionales y una difusión internacional extraordinaria. Un debut difícil de repetir.',
      source:'https://www.rosana.net/biografia/'
    },
    {
      slug:'pedro-guerra', artist:'Pedro Guerra', album:'Golosinas', year:'1995',
      hook:'Canción de autor íntima, popular y llena de sensibilidad.',
      why:'Pedro Guerra ya era un compositor conocido antes de publicar su primer álbum en solitario. Golosinas fijó en disco una escritura cercana, poética y profundamente humana que renovó la canción de autor española de los noventa y convirtió su voz en una de las más reconocibles de su generación.',
      source:'https://elpais.com/diario/1995/03/14/cultura/795135613_850215.html'
    },
    {
      slug:'luis-morera', artist:'Taburiente / Luis Morera', album:'Nuevo cauce', year:'1976',
      hook:'Folclore, canción protesta, sintetizadores e identidad canaria.',
      why:'Un disco fundamental de la Nueva Canción Canaria. Taburiente mezcló formas del folclore insular con canción de autor, reivindicación social y nuevas sonoridades electrónicas. Nuevo cauce ayudó a construir una manera contemporánea de cantar Canarias sin convertirla en una postal.',
      source:'https://www3.gobiernodecanarias.org/medusa/wiki/index.php?title=Taburiente'
    },
    {
      slug:'quevedo', artist:'Quevedo', album:'DONDE QUIERO ESTAR', year:'2023',
      hook:'La nueva Canarias urbana entrando de lleno en la música global.',
      why:'El debut largo de Quevedo consolidó el salto internacional iniciado por sus primeros éxitos. El álbum alcanzó el número uno en España y situó a un artista grancanario en el centro de la nueva música urbana en español. Su presencia cierra este ranking mostrando cuánto ha cambiado el paisaje sonoro canario.',
      source:'https://open.spotify.com/album/7menGlTCTcVnCbUMKRgu3Z'
    }
  ];

  function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function islandName(person){return person.places?.find(place=>place.relation_type==='birth'&&place.island)?.island?.name??person.places?.find(place=>place.island)?.island?.name??'Canarias';}

  function installStyles(){
    if(document.getElementById('c8MusicAlbumsStyles'))return;
    const style=document.createElement('style');
    style.id='c8MusicAlbumsStyles';
    style.textContent=`
      .c8-music-ranking{margin-top:52px;padding-top:40px;border-top:1px solid rgba(255,205,0,.2)}
      .c8-music-ranking .c8-ranking-head{margin-bottom:23px}.c8-music-ranking .c8-ranking-head h3 span{color:#FFCD00}
      .c8-music-list{display:grid;gap:10px}
      .c8-music-card{display:grid;grid-template-columns:74px minmax(230px,.9fr) minmax(300px,1.55fr);gap:18px;align-items:start;padding:22px;border:1px solid rgba(255,205,0,.16);border-radius:16px;background:radial-gradient(circle at 90% 0%,rgba(255,205,0,.07),transparent 24%),linear-gradient(145deg,rgba(59,10,106,.24),rgba(26,6,51,.68))}
      .c8-music-num{font-family:"Work Sans",Arial,sans-serif;font-size:34px;font-weight:600;letter-spacing:-.05em;color:#FFCD00}
      .c8-music-person{border:0;background:transparent;padding:0;text-align:left;color:#fff;cursor:pointer}
      .c8-music-album{display:block;font-family:"Work Sans",Arial,sans-serif;font-size:19px;line-height:1.16;font-weight:600;color:#fff}
      .c8-music-person strong{display:block;margin-top:7px;font-family:"Work Sans",Arial,sans-serif;font-size:12px;line-height:1.3;font-weight:500;color:#FFCD00}
      .c8-music-person small{display:block;margin-top:3px;font-size:10px;color:#D8CDE2}
      .c8-music-hook{display:block;margin-top:12px;font-size:12px;line-height:1.52;color:#EADFF1}
      .c8-music-copy{font-size:12px;line-height:1.66;color:#F1E9F6}.c8-music-copy p{margin:0 0 10px}.c8-music-copy a{color:#FFCD00;text-decoration:none}.c8-music-copy a:hover,.c8-music-copy a:focus-visible{text-decoration:underline;outline:none}
      .c8-music-note{margin-top:16px;padding:18px 20px;border-left:2px solid #FFCD00;background:rgba(255,205,0,.035);font-size:11px;line-height:1.65;color:#EDE4F3}.c8-music-note strong{color:#fff}
      @media(max-width:860px){.c8-music-card{grid-template-columns:54px 1fr}.c8-music-copy{grid-column:2}}
      @media(max-width:620px){.c8-music-ranking{margin-top:38px;padding-top:34px}.c8-music-card{grid-template-columns:42px 1fr;padding:19px}.c8-music-num{font-size:30px}.c8-music-copy{grid-column:2}.c8-music-album{font-size:18px}.c8-music-hook,.c8-music-copy{font-size:13px}}
    `;
    document.head.appendChild(style);
  }

  function scrollProfileToTop(){requestAnimationFrame(()=>requestAnimationFrame(()=>{const profile=document.querySelector('#directory article.profile');if(!profile)return;const h=document.querySelector('.site-header')?.getBoundingClientRect().height??72;window.scrollTo({top:Math.max(0,profile.getBoundingClientRect().top+window.scrollY-h-10),left:0,behavior:'auto'});}));}

  function render(records){
    const inner=document.querySelector('#cifras .c8-stats-inner');if(!inner)return false;installStyles();inner.querySelector('#c8MusicAlbumsRanking')?.remove();
    const verified=records.filter(p=>!p.editorial_status||p.editorial_status==='verified'||p.editorial_status==='published');
    const bySlug=new Map(verified.map(person=>[person.slug,person]));
    const available=RANKING.map(item=>({item,person:bySlug.get(item.slug)})).filter(row=>row.person);if(!available.length)return false;
    const section=document.createElement('section');section.id='c8MusicAlbumsRanking';section.className='c8-ranking c8-music-ranking';
    section.innerHTML=`<header class="c8-ranking-head"><div><h3>TOP 5 · <span>Discos esenciales de la constelación</span></h3></div><p>Cinco álbumes para recorrer medio siglo de música hecha desde Canarias: vanguardia, canción de autor, identidad, pop y cultura urbana.</p></header><div class="c8-music-list">${available.map(({item,person},index)=>`<article class="c8-music-card"><div class="c8-music-num">0${index+1}</div><button type="button" class="c8-music-person" data-c8-music-person="${esc(person.id)}"><span class="c8-music-album">${esc(item.album)}</span><strong>${esc(item.artist)}</strong><small>${esc(item.year)} · ${esc(islandName(person))}</small><span class="c8-music-hook">${esc(item.hook)}</span></button><div class="c8-music-copy"><p>${esc(item.why)}</p><p><a href="${esc(item.source)}" target="_blank" rel="noopener noreferrer">Fuente / escucha de referencia ↗</a></p></div></article>`).join('')}</div><div class="c8-music-note"><strong>Selección editorial C8.</strong> El orden valora influencia, singularidad artística, impacto cultural y capacidad para representar distintos momentos de la música vinculada a Canarias. No pretende ser un canon definitivo.</div>`;
    const summer=document.getElementById('c8SummerReadingRanking');const legendary=document.getElementById('c8LegendaryLivesRanking');if(summer)summer.insertAdjacentElement('afterend',section);else if(legendary)legendary.insertAdjacentElement('afterend',section);else inner.appendChild(section);
    section.querySelectorAll('[data-c8-music-person]').forEach(button=>button.addEventListener('click',()=>{if(typeof openProfile==='function'){openProfile(button.dataset.c8MusicPerson);scrollProfileToTop();}}));return true;
  }

  async function refresh(){try{if(typeof C8_API_URL==='undefined'||typeof C8_PUBLISHABLE_KEY==='undefined')return;const response=await fetch(C8_API_URL,{headers:{apikey:C8_PUBLISHABLE_KEY,Accept:'application/json'},cache:'no-store'});if(!response.ok)throw new Error(`HTTP ${response.status}`);const payload=await response.json();const records=Array.isArray(payload.people)?payload.people:[];if(!records.length)return;if(!render(records))window.setTimeout(()=>render(records),700);}catch(error){console.error('Constelación 8: no se pudo cargar el ranking musical.',error);}}
  refresh();window.addEventListener('c8:data-ready',refresh);window.setInterval(refresh,REFRESH_MS);
})();