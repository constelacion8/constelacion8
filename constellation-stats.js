/* La constelación en cifras: estadísticas vivas calculadas sobre Supabase. */
(function installConstellationStats(){
  const REFRESH_MS=10*60*1000;
  const fmt=new Intl.NumberFormat('es-ES');
  const now=()=>new Date();

  function esc(value){
    return String(value??'').replace(/[&<>'"]/g,char=>({
      '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
    })[char]);
  }

  function parseDate(value){
    if(!value)return null;
    const date=new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime())?null:date;
  }

  function fullName(person){return person.full_name||person.known_as||'Perfil sin nombre';}
  function aliasLabel(person){
    const alias=person.known_as;
    return alias&&alias!==person.full_name?alias:null;
  }

  function ageAt(person,endDate=now()){
    const birth=parseDate(person.birth_date);
    if(birth){
      let age=endDate.getFullYear()-birth.getFullYear();
      const beforeBirthday=endDate.getMonth()<birth.getMonth()||(endDate.getMonth()===birth.getMonth()&&endDate.getDate()<birth.getDate());
      if(beforeBirthday)age--;
      return {value:age,approx:false};
    }
    if(Number.isFinite(person.birth_year))return {value:endDate.getFullYear()-person.birth_year,approx:true};
    return null;
  }

  function ageAtDeath(person){
    const birth=parseDate(person.birth_date);
    const death=parseDate(person.death_date);
    if(birth&&death)return ageAt(person,death);
    if(Number.isFinite(person.birth_year)&&Number.isFinite(person.death_year))return {value:person.death_year-person.birth_year,approx:true};
    return null;
  }

  function validEndYear(person,currentYear){
    if(person.is_living===true)return currentYear;
    if(Number.isFinite(person.death_year))return person.death_year;
    return null;
  }

  function overlapStats(person,records,currentYear){
    if(!Number.isFinite(person.birth_year))return {count:0,totalYears:0};
    const endA=validEndYear(person,currentYear);
    if(!Number.isFinite(endA))return {count:0,totalYears:0};
    let count=0,totalYears=0;
    for(const other of records){
      if(other.id===person.id||!Number.isFinite(other.birth_year))continue;
      const endB=validEndYear(other,currentYear);
      if(!Number.isFinite(endB))continue;
      const start=Math.max(person.birth_year,other.birth_year);
      const end=Math.min(endA,endB);
      if(start>end)continue;
      count++;
      totalYears+=Math.max(0,end-start);
    }
    return {count,totalYears};
  }

  function chooseOldestDeceased(records){
    return records
      .filter(p=>p.is_living===false)
      .map(p=>({person:p,age:ageAtDeath(p)}))
      .filter(x=>x.age)
      .sort((a,b)=>b.age.value-a.age.value||a.person.birth_year-b.person.birth_year)[0]||null;
  }

  function chooseOldestLiving(records){
    const living=records.filter(p=>p.is_living===true&&Number.isFinite(p.birth_year));
    if(!living.length)return null;
    const minYear=Math.min(...living.map(p=>p.birth_year));
    const sameYear=living.filter(p=>p.birth_year===minYear);
    const allExact=sameYear.every(p=>parseDate(p.birth_date));
    if(!allExact&&sameYear.length>1)return {people:sameYear,provisional:true,year:minYear};
    sameYear.sort((a,b)=>parseDate(a.birth_date)-parseDate(b.birth_date));
    return {people:[sameYear[0]],provisional:false,year:minYear};
  }

  function chooseYoungestLiving(records){
    const living=records.filter(p=>p.is_living===true&&Number.isFinite(p.birth_year));
    if(!living.length)return null;
    const maxYear=Math.max(...living.map(p=>p.birth_year));
    const sameYear=living.filter(p=>p.birth_year===maxYear);
    const allExact=sameYear.every(p=>parseDate(p.birth_date));
    if(!allExact&&sameYear.length>1)return {people:sameYear,provisional:true};
    sameYear.sort((a,b)=>parseDate(b.birth_date)-parseDate(a.birth_date));
    const person=sameYear[0];
    return {people:[person],provisional:false,age:ageAt(person)};
  }

  function topByOverlap(records,predicate,key){
    const currentYear=now().getFullYear();
    const ranked=records.filter(predicate).map(person=>({person,...overlapStats(person,records,currentYear)}));
    if(!ranked.length)return null;
    const max=Math.max(...ranked.map(row=>row[key]));
    return {value:max,people:ranked.filter(row=>row[key]===max).map(row=>row.person)};
  }

  function topDecade(records){
    const counts=new Map();
    records.forEach(p=>{
      if(!Number.isFinite(p.birth_year))return;
      const decade=Math.floor(p.birth_year/10)*10;
      counts.set(decade,(counts.get(decade)||0)+1);
    });
    return [...counts.entries()].sort((a,b)=>b[1]-a[1]||a[0]-b[0])[0]||null;
  }

  function earliestBirth(records){
    return records.filter(p=>Number.isFinite(p.birth_year)).sort((a,b)=>a.birth_year-b.birth_year)[0]||null;
  }

  function personButtons(people){
    return people.map(person=>{
      const alias=aliasLabel(person);
      return `<button class="c8-stat-person" type="button" data-c8-stat-person="${esc(person.id)}"><strong>${esc(fullName(person))}</strong>${alias?`<small>${esc(alias)}</small>`:''}</button>`;
    }).join('');
  }

  function card({eyebrow,value,people,copy,className=''}){
    return `<article class="c8-stat-card ${className}">
      <span class="c8-stat-eyebrow">${esc(eyebrow)}</span>
      <div class="c8-stat-value">${value}</div>
      <div class="c8-stat-people">${personButtons(people)}</div>
      <p>${esc(copy)}</p>
    </article>`;
  }

  function installStyles(){
    if(document.getElementById('c8StatsStyles'))return;
    const style=document.createElement('style');
    style.id='c8StatsStyles';
    style.textContent=`
      .c8-stats{position:relative;padding:92px 0 96px;border-top:1px solid rgba(255,255,255,.08);overflow:hidden}
      .c8-stats::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 14% 20%,rgba(157,78,221,.13),transparent 34%),radial-gradient(circle at 82% 45%,rgba(255,205,0,.07),transparent 30%);pointer-events:none}
      .c8-stats-inner{position:relative;z-index:1;max-width:1180px;margin:0 auto;padding:0 28px}
      .c8-stats-head{display:grid;grid-template-columns:minmax(0,.72fr) minmax(300px,1fr);gap:48px;align-items:end;margin-bottom:36px}
      .c8-stats-head .eyebrow{margin:0 0 12px;color:#FFCD00}
      .c8-stats-head h2{margin:0;font-family:"Work Sans",Arial,sans-serif;font-size:clamp(34px,5vw,64px);line-height:.96;letter-spacing:-.055em;color:#fff;font-weight:600}
      .c8-stats-head h2 span{color:#FFCD00}
      .c8-stats-intro{margin:0;font-size:15px;line-height:1.72;color:#F5EEFA;max-width:650px}
      .c8-stats-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:14px}
      .c8-stat-card{grid-column:span 4;min-height:310px;display:flex;flex-direction:column;padding:25px;border:1px solid rgba(255,255,255,.12);border-radius:18px;background:linear-gradient(145deg,rgba(43,10,76,.84),rgba(22,4,39,.76));box-shadow:0 18px 55px rgba(0,0,0,.16)}
      .c8-stat-card.c8-stat-wide{grid-column:span 6;min-height:270px}
      .c8-stat-card.c8-stat-small{grid-column:span 6;min-height:220px}
      .c8-stat-eyebrow{font-family:"Work Sans",Arial,sans-serif;text-transform:uppercase;letter-spacing:.14em;font-size:9px;font-weight:700;color:#FFCD00}
      .c8-stat-value{margin:18px 0 16px;font-family:"Work Sans",Arial,sans-serif;font-size:clamp(38px,5vw,62px);line-height:.9;font-weight:600;letter-spacing:-.055em;color:#fff}
      .c8-stat-people{display:flex;flex-direction:column;align-items:flex-start;gap:5px;margin-bottom:14px}
      .c8-stat-person{display:flex;flex-wrap:wrap;align-items:baseline;gap:7px;text-align:left;border:0;padding:0;background:transparent;color:#fff;font:inherit;cursor:pointer}
      .c8-stat-person strong{font-family:"Work Sans",Arial,sans-serif;font-size:15px;line-height:1.25;font-weight:600;color:#fff}
      .c8-stat-person small{font-size:10px;color:#E8DFF0}
      .c8-stat-person:hover strong{text-decoration:underline;text-decoration-color:#FFCD00;text-underline-offset:4px}
      .c8-stat-card p{margin:auto 0 0;font-size:12px;line-height:1.6;color:#F1E9F6}
      .c8-stats-foot{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;margin-top:22px;padding-top:19px;border-top:1px solid rgba(255,255,255,.09);font-size:10px;line-height:1.55;color:#EDE4F3}
      .c8-stats-sync{white-space:nowrap;color:#fff}
      .c8-stats-sync::before{content:"";display:inline-block;width:6px;height:6px;margin-right:7px;border-radius:50%;background:#FFCD00;box-shadow:0 0 9px rgba(255,205,0,.55)}
      @media(max-width:860px){.c8-stats-head{grid-template-columns:1fr;gap:18px}.c8-stat-card{grid-column:span 6}.c8-stat-card.c8-stat-wide,.c8-stat-card.c8-stat-small{grid-column:span 6}}
      @media(max-width:620px){.c8-stats{padding:68px 0 74px}.c8-stats-inner{padding:0 18px}.c8-stats-grid{gap:10px}.c8-stat-card,.c8-stat-card.c8-stat-wide,.c8-stat-card.c8-stat-small{grid-column:1/-1;min-height:auto;padding:21px}.c8-stat-value{font-size:43px;margin:16px 0 14px}.c8-stat-person strong{font-size:16px}.c8-stat-person small{font-size:12px}.c8-stat-card p{margin-top:18px;font-size:13px}.c8-stats-foot{flex-direction:column;font-size:11px}.c8-stats-sync{white-space:normal}}
    `;
    document.head.appendChild(style);
  }

  function ensureSection(){
    let section=document.getElementById('cifras');
    if(section)return section;
    section=document.createElement('section');
    section.id='cifras';
    section.className='c8-stats';
    section.setAttribute('aria-labelledby','c8StatsTitle');
    const project=document.getElementById('proyecto');
    if(project)project.insertAdjacentElement('afterend',section);
    else document.querySelector('main')?.appendChild(section);
    return section;
  }

  function render(records){
    installStyles();
    const section=ensureSection();
    if(!section)return;
    const verified=records.filter(p=>!p.editorial_status||p.editorial_status==='verified'||p.editorial_status==='published');
    const chronological=verified.filter(p=>Number.isFinite(p.birth_year));
    const oldestDead=chooseOldestDeceased(chronological);
    const oldestLiving=chooseOldestLiving(chronological);
    const youngestLiving=chooseYoungestLiving(chronological);
    const livingOverlap=topByOverlap(chronological,p=>p.is_living===true,'count');
    const deadOverlap=topByOverlap(chronological,p=>p.is_living===false&&Number.isFinite(p.death_year),'count');
    const intertwined=topByOverlap(chronological,p=>Number.isFinite(validEndYear(p,now().getFullYear())),'totalYears');
    const decade=topDecade(chronological);
    const earliest=earliestBirth(chronological);

    const oldestDeadValue=oldestDead?`${oldestDead.age.approx?'≈ ':''}${fmt.format(oldestDead.age.value)} años`:'—';
    const oldestLivingValue=oldestLiving?(oldestLiving.provisional?`${oldestLiving.year}`:`${fmt.format(ageAt(oldestLiving.people[0]).value)} años`):'—';
    const youngestValue=youngestLiving&&!youngestLiving.provisional&&youngestLiving.age?`${fmt.format(youngestLiving.age.value)} años`:(youngestLiving?.people?.[0]?.birth_year||'—');
    const decadeLabel=decade?`${decade[0]}–${decade[0]+9}`:'—';

    section.innerHTML=`<div class="c8-stats-inner">
      <header class="c8-stats-head">
        <div><p class="eyebrow">El tiempo convertido en datos</p><h2 id="c8StatsTitle">La constelación <span>en cifras</span></h2></div>
        <p class="c8-stats-intro">Cuando cruzamos las fechas de las biografías aparecen historias que no se ven a simple vista. Estos récords se calculan automáticamente con los perfiles y cronologías disponibles en Constelación 8 y cambian a medida que crece la base de datos.</p>
      </header>
      <div class="c8-stats-grid">
        ${oldestDead?card({eyebrow:'La vida más larga',value:oldestDeadValue,people:[oldestDead.person],copy:'La persona fallecida con la trayectoria vital más extensa entre los perfiles con cronología suficiente.'}):''}
        ${oldestLiving?card({eyebrow:'La persona viva más longeva',value:oldestLivingValue,people:oldestLiving.people,copy:oldestLiving.provisional?'Comparten el año de nacimiento más antiguo entre los perfiles vivos. El récord queda provisional hasta disponer de todas las fechas exactas de nacimiento.':'Es actualmente la persona viva de mayor edad incorporada a Constelación 8.'}):''}
        ${youngestLiving?card({eyebrow:'La persona influyente más joven',value:youngestValue,people:youngestLiving.people,copy:youngestLiving.provisional?'Son los perfiles vivos del año de nacimiento más reciente; falta precisión suficiente para desempatar por fecha exacta.':'Es actualmente el perfil vivo más joven incorporado a la constelación.'}):''}
        ${livingOverlap?card({eyebrow:'El gran contemporáneo vivo',value:`${fmt.format(livingOverlap.value)} vidas`,people:livingOverlap.people,copy:'Número de personas de la base con las que ha coincidido temporalmente durante su vida. Coincidir en el tiempo no implica que se conocieran.',className:'c8-stat-wide'}):''}
        ${deadOverlap?card({eyebrow:'Las grandes vidas contemporáneas',value:`${fmt.format(deadOverlap.value)} vidas`,people:deadOverlap.people,copy:'Entre las personas fallecidas, son quienes compartieron época con un mayor número de perfiles de la constelación.',className:'c8-stat-wide'}):''}
        ${intertwined?card({eyebrow:'La vida más entrelazada',value:`${fmt.format(intertwined.value)} años`,people:intertwined.people,copy:'Suma de todos los años de solapamiento temporal con las demás biografías. No son años vividos: es la suma matemática de cada coincidencia.'}):''}
        ${decade?card({eyebrow:'La década que más estrellas produjo',value:decadeLabel,people:[],copy:`${fmt.format(decade[1])} personas de la base nacieron durante esta década.`,className:'c8-stat-small'}):''}
        ${earliest?card({eyebrow:'El nacimiento más antiguo documentado',value:`${earliest.birth_year}`,people:[earliest],copy:'Es el año de nacimiento conocido más antiguo entre las biografías con cronología documentada.',className:'c8-stat-small'}):''}
      </div>
      <div class="c8-stats-foot">
        <span>Los cálculos utilizan únicamente perfiles con cronología suficiente. Las coincidencias representan solapamiento vital y nunca presuponen relación personal. Las cifras pueden cambiar cuando se incorporan nuevas biografías o se precisan fechas.</span>
        <span class="c8-stats-sync">Sincronizado con Supabase · ${esc(new Intl.DateTimeFormat('es-ES',{dateStyle:'short',timeStyle:'short'}).format(now()))}</span>
      </div>
    </div>`;

    section.querySelectorAll('[data-c8-stat-person]').forEach(button=>button.addEventListener('click',()=>{
      if(typeof openProfile==='function')openProfile(button.dataset.c8StatPerson);
    }));
  }

  async function refreshStats(){
    try{
      if(typeof C8_API_URL==='undefined'||typeof C8_PUBLISHABLE_KEY==='undefined')throw new Error('Configuración de Supabase no disponible');
      const response=await fetch(C8_API_URL,{headers:{apikey:C8_PUBLISHABLE_KEY,Accept:'application/json'},cache:'no-store'});
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const payload=await response.json();
      const records=Array.isArray(payload.people)?payload.people:[];
      if(!records.length)throw new Error('Supabase no devolvió perfiles');
      render(records);
    }catch(error){
      console.error('Constelación 8: no se pudieron recalcular las cifras.',error);
    }
  }

  refreshStats();
  window.setInterval(refreshStats,REFRESH_MS);
})();