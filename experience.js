const C8_API_URL='https://kvoldyeinvjajsimxmyc.supabase.co/functions/v1/constelacion8-web';
const C8_PUBLISHABLE_KEY='sb_publishable_AjQQNYKbCwaGNv_o1GopAw_TzyLkHXh';

const timeForm=document.getElementById('timeForm');
const timeName=document.getElementById('timeName');
const timeBirth=document.getElementById('timeBirth');
const timeResults=document.getElementById('timeResults');

const C8_TIME_ISLANDS=[
  ['all','Todas las Islas Canarias'],
  ['el-hierro','El Hierro'],
  ['fuerteventura','Fuerteventura'],
  ['gran-canaria','Gran Canaria'],
  ['la-gomera','La Gomera'],
  ['la-graciosa','La Graciosa'],
  ['la-palma','La Palma'],
  ['lanzarote','Lanzarote'],
  ['tenerife','Tenerife']
];

function ensureTimeIslandSelector(){
  if(!timeForm)return null;
  const existing=document.getElementById('timeIsland');
  if(existing)return existing;
  const label=document.createElement('label');
  label.className='time-field time-field-island';
  label.innerHTML=`<span>Isla de nacimiento</span><select id="timeIsland" name="island" aria-label="Isla de nacimiento">${C8_TIME_ISLANDS.map(([value,label])=>`<option value="${value}">${label}</option>`).join('')}</select>`;
  const submit=timeForm.querySelector('.time-submit');
  timeForm.insertBefore(label,submit);
  return label.querySelector('select');
}

const timeIsland=ensureTimeIslandSelector();
const timeIntro=document.querySelector('#coincidencias .time-match-copy>p:last-of-type');
if(timeIntro)timeIntro.textContent='Introduce tu nombre, tu fecha de nacimiento y la isla en la que naciste. Constelación 8 comparará tu vida con las biografías del atlas y te mostrará qué figuras de esa isla coincidieron contigo en el tiempo.';
const timeToolHelp=document.querySelector('#coincidencias .time-tool-head small');
if(timeToolHelp)timeToolHelp.textContent='Una forma personal de entrar en el atlas: tu fecha y tu isla de nacimiento frente a la cronología vital de las personas incorporadas.';

const heroEyebrow=document.querySelector('#inicio .hero-intro .eyebrow');
if(heroEyebrow) heroEyebrow.textContent='';

function primaryBirthPlace(record){
  return record.places?.find(place=>place.relation_type==='birth'&&place.island)??null;
}

function primaryDisplayPlace(record){
  return primaryBirthPlace(record)
    ??record.places?.find(place=>place.is_primary&&place.island)
    ??null;
}

function normalizeRemotePerson(record){
  const birthPlace=primaryBirthPlace(record);
  const displayPlace=primaryDisplayPlace(record);
  const categories=(record.areas??[]).map(area=>area.name).filter(Boolean);
  const primaryCategory=(record.areas??[]).find(area=>area.is_primary)?.name??categories[0]??'Sin categoría';
  const disciplines=(record.disciplines??[]).map(discipline=>discipline.name).filter(Boolean);
  const livingStatus=record.is_living===true?'living':record.is_living===false?'deceased':'unknown';
  return {
    id:record.id,
    slug:record.slug,
    name:record.known_as||record.full_name,
    fullName:record.full_name,
    born:Number.isFinite(record.birth_year)?record.birth_year:null,
    died:livingStatus==='living'?null:(Number.isFinite(record.death_year)?record.death_year:null),
    isLiving:livingStatus==='living',
    livingStatus,
    island:displayPlace?.island?.slug??null,
    islandName:displayPlace?.island?.name??null,
    birthIsland:birthPlace?.island?.slug??null,
    birthIslandName:birthPlace?.island?.name??null,
    municipality:birthPlace?.municipality?.name??displayPlace?.municipality?.name??null,
    category:primaryCategory,
    categories,
    discipline:disciplines.join(' · ')||'Sin disciplina especificada',
    disciplines,
    role:record.short_description||record.main_contribution||disciplines.join(' · '),
    bio:record.short_bio||record.short_description||record.main_contribution||'',
    contribution:record.main_contribution||'',
    sources:(record.sources??[]).filter(source=>source?.url),
    places:record.places??[],
    confidence:record.confidence_score,
    lastReviewedAt:record.last_reviewed_at
  };
}

function personIslandName(person){
  if(person.island&&islands[person.island])return islands[person.island].name;
  return person.islandName||'Vinculado a Canarias';
}

lifeLabel=function(person){
  const born=Number.isFinite(person.born)?person.born:null;
  const status=person.livingStatus??(person.isLiving===true?'living':Number.isFinite(person.died)?'deceased':'unknown');
  if(status==='living')return `${born??'Fecha no precisada'}–actualidad · vive actualmente`;
  if(status==='deceased'&&Number.isFinite(person.died))return `${born??'¿?'}–${person.died}`;
  if(status==='deceased')return born?`${born} · fallecimiento sin fecha precisada`:'Fallecimiento documentado · cronología incompleta';
  return born?`${born} · estado vital pendiente de actualización`:'Cronología vital pendiente de actualización';
};

function endYear(person){
  const status=person.livingStatus??(person.isLiving===true?'living':Number.isFinite(person.died)?'deceased':'unknown');
  if(status==='living')return CURRENT_YEAR;
  if(status==='deceased'&&Number.isFinite(person.died))return person.died;
  return null;
}

function lifeOverlap(a,b){
  if(!Number.isFinite(a.born)||!Number.isFinite(b.born))return null;
  const aEnd=endYear(a),bEnd=endYear(b);
  if(!Number.isFinite(aEnd)||!Number.isFinite(bEnd))return null;
  const start=Math.max(a.born,b.born);
  const end=Math.min(aEnd,bEnd);
  if(start>end)return null;
  return {start,end,years:Math.max(0,end-start)};
}

function sharedCategories(a,b){
  const aCats=a.categories?.length?a.categories:[a.category].filter(Boolean);
  const bCats=b.categories?.length?b.categories:[b.category].filter(Boolean);
  return aCats.filter(category=>bCats.includes(category));
}

connectionReasons=function(a,b){
  const shared=sharedCategories(a,b);
  const overlap=lifeOverlap(a,b);
  if(!shared.length||!overlap)return [];
  const endLabel=overlap.end===CURRENT_YEAR&&(a.isLiving||b.isLiving)?'actualidad':overlap.end;
  return [`misma categoría: ${shared.join(', ')}`,`coincidencia vital: ${overlap.start}–${endLabel}`];
};

getConnections=function(person){
  return people
    .filter(other=>other.id!==person.id)
    .map(other=>({person:other,reasons:connectionReasons(person,other),overlap:lifeOverlap(person,other)}))
    .filter(item=>item.reasons.length&&item.overlap)
    .sort((a,b)=>b.overlap.years-a.overlap.years||a.person.name.localeCompare(b.person.name,'es'))
    .slice(0,12);
};

function categoriesForIsland(all){
  return ['Todas',...new Set(all.flatMap(person=>person.categories?.length?person.categories:[person.category]).filter(Boolean))]
    .sort((a,b)=>a==='Todas'?-1:b==='Todas'?1:a.localeCompare(b,'es'));
}

function categoryMatches(person,label){
  if(label==='Todas')return true;
  const list=person.categories?.length?person.categories:[person.category];
  return list.includes(label);
}

renderIslandList=function(query=''){
  const all=people.filter(person=>person.island===currentIsland);
  const q=query.trim().toLocaleLowerCase('es');
  const filtered=all
    .filter(person=>categoryMatches(person,currentCategory)&&person.name.toLocaleLowerCase('es').includes(q))
    .sort((a,b)=>a.name.localeCompare(b.name,'es'));
  const groups={};
  filtered.forEach(person=>{const letter=person.name[0].toLocaleUpperCase('es');(groups[letter]??=[]).push(person)});
  const categories=categoriesForIsland(all);
  const chips=categories.map(category=>{
    const count=category==='Todas'?all.length:all.filter(person=>categoryMatches(person,category)).length;
    return `<button class="chip ${currentCategory===category?'active':''}" data-cat="${escapeHtml(category)}">${escapeHtml(category)}<small>${count}</small></button>`;
  }).join('');

  directory.innerHTML=`
    <div class="directory-inner">
      <div class="directory-head">
        <div><h3>${escapeHtml(islands[currentIsland].name)}</h3><p>Personas nacidas en la isla · orden alfabético · datos sincronizados con Supabase</p></div>
        <div class="directory-count">${all.length} ${all.length===1?'perfil verificado':'perfiles verificados'}</div>
      </div>
      <div class="toolbar">
        <input class="search" id="searchPeople" placeholder="Buscar una persona…" value="${escapeHtml(query)}">
        <div class="chips">${chips}</div>
      </div>
      <div>${Object.entries(groups).length?Object.entries(groups).map(([letter,list])=>`
        <div class="alpha-block">
          <div class="alpha-letter">${letter}</div>
          <div class="people-list">${list.map(person=>`
            <button class="person-row" data-person="${person.id}">
              <span><strong>${escapeHtml(person.name)}</strong><small>${escapeHtml(person.category)} · ${escapeHtml(person.discipline)}${person.municipality?` · ${escapeHtml(person.municipality)}`:''}</small></span>
              <span class="person-year">${escapeHtml(lifeLabel(person))} <b class="person-arrow">↗</b></span>
            </button>`).join('')}</div>
        </div>`).join(''):'<div class="directory-empty"><strong>No hay coincidencias.</strong><p>Prueba con otra categoría o término de búsqueda.</p></div>'}</div>
    </div>`;

  const search=document.getElementById('searchPeople');
  search?.addEventListener('input',event=>renderIslandList(event.target.value));
  directory.querySelectorAll('[data-cat]').forEach(button=>button.addEventListener('click',()=>{currentCategory=button.dataset.cat;renderIslandList(query)}));
  directory.querySelectorAll('[data-person]').forEach(button=>button.addEventListener('click',()=>openProfile(button.dataset.person)));
};

openProfile=function(id){
  const person=people.find(item=>item.id===id);
  if(!person)return;
  currentIsland=person.island&&islands[person.island]?person.island:null;
  setMapActive(currentIsland);
  setTooltip(currentIsland);
  renderIslandSelector();
  const connections=getConnections(person);
  const sourceHtml=person.sources.length?`
    <div class="profile-sources">
      <h4>Fuentes</h4>
      <ul>${person.sources.map(source=>`<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.title||source.publisher||'Fuente')}</a>${source.publisher?` <small>· ${escapeHtml(source.publisher)}</small>`:''}</li>`).join('')}</ul>
    </div>`:'';

  directory.innerHTML=`
    <article class="profile">
      <div class="profile-top">
        <div>
          <div class="profile-kicker">${escapeHtml(personIslandName(person))} · ${escapeHtml(person.category)} · ${escapeHtml(person.discipline)}</div>
          <h3>${escapeHtml(person.name)}</h3>
        </div>
        <button class="profile-back" id="profileBack">${currentIsland?`Volver a ${escapeHtml(islands[currentIsland].name)}`:'Volver al atlas'}</button>
      </div>
      <div class="profile-meta">${escapeHtml(lifeLabel(person))}${person.role?` · ${escapeHtml(person.role)}`:''}</div>
      <p class="profile-bio">${escapeHtml(person.bio)}</p>
      <div class="facts">
        <span class="fact"><b>Isla</b>${escapeHtml(personIslandName(person))}</span>
        ${person.municipality?`<span class="fact"><b>Municipio</b>${escapeHtml(person.municipality)}</span>`:''}
        <span class="fact"><b>Ámbito</b>${escapeHtml(person.categories.join(' · ')||person.category)}</span>
        <span class="fact"><b>Disciplina</b>${escapeHtml(person.discipline)}</span>
      </div>
      <h4 class="constellation-title">Contemporáneos de la misma categoría</h4>
      <p class="profile-bio">Estas conexiones indican únicamente que compartieron una categoría y parte de su tiempo vital. No implican una relación personal salvo que esté documentada expresamente.</p>
      <div class="connections-grid">${connections.length?connections.map(({person:other,reasons})=>`
        <button class="rel-card" data-related="${other.id}">
          <strong>${escapeHtml(other.name)}</strong>
          <small>${escapeHtml(personIslandName(other))} · ${escapeHtml(lifeLabel(other))}</small>
          <span class="rel-reasons">${reasons.map(reason=>`<span class="reason">${escapeHtml(reason)}</span>`).join('')}</span>
        </button>`).join(''):'<div class="directory-empty"><strong>Sin conexiones temporales verificables.</strong><p>Este perfil todavía no tiene otro contemporáneo de la misma categoría con cronología suficiente en la base.</p></div>'}</div>
      ${sourceHtml}
    </article>`;

  document.getElementById('profileBack')?.addEventListener('click',()=>{
    if(currentIsland)renderIslandList();
    else renderEmpty();
  });
  directory.querySelectorAll('[data-related]').forEach(button=>button.addEventListener('click',()=>openProfile(button.dataset.related)));
  document.getElementById('explorar')?.scrollIntoView({behavior:'smooth',block:'start'});
};

if(timeBirth)timeBirth.max=new Date().toISOString().slice(0,10);

function userOverlap(birthYear,person){
  if(!Number.isFinite(person.born))return null;
  const personEnd=endYear(person);
  if(!Number.isFinite(personEnd))return null;
  const start=Math.max(birthYear,person.born);
  const end=Math.min(CURRENT_YEAR,personEnd);
  if(start>end)return null;
  return {start,end,years:Math.max(0,end-start)};
}

function temporalMatches(birthYear,islandSlug='all'){
  return people
    .filter(person=>islandSlug==='all'||(person.birthIsland??person.island)===islandSlug)
    .map(person=>({person,overlap:userOverlap(birthYear,person)}))
    .filter(item=>item.overlap)
    .sort((a,b)=>b.overlap.years-a.overlap.years||a.person.name.localeCompare(b.person.name,'es'));
}

function renderTemporalMatches(name,birthYear,islandSlug='all'){
  const matches=temporalMatches(birthYear,islandSlug);
  const longest=matches[0]?.overlap?.years??0;
  const bornBefore=matches.filter(item=>Number.isFinite(item.person.born)&&item.person.born<=birthYear).length;
  const selectedIslandLabel=islandSlug==='all'?'Todas las Islas Canarias':(islands[islandSlug]?.name??'Isla seleccionada');

  timeResults.innerHTML=`
    <div class="time-summary">
      <span><b>${matches.length}</b> vidas coincidentes</span>
      <span><b>${longest}</b> años de coincidencia máxima</span>
      <span><b>${bornBefore}</b> ya habían nacido cuando llegaste</span>
      <span><b>✦</b> ${escapeHtml(selectedIslandLabel)}</span>
    </div>
    ${matches.length?`<div class="time-match-grid">${matches.map(({person,overlap})=>{
      const stillAlive=person.livingStatus==='living'&&overlap.end===CURRENT_YEAR;
      const endLabel=stillAlive?'actualidad':overlap.end;
      const duration=overlap.years===0?'menos de un año':`${overlap.years} ${overlap.years===1?'año':'años'}`;
      const wording=stillAlive?`Coincidís desde ${overlap.start} · sigue vivo`:`Coincidisteis ${duration}`;
      return `<button class="time-person" data-time-person="${person.id}">
        <strong>${escapeHtml(person.name)}</strong>
        <small>${escapeHtml(personIslandName(person))} · ${escapeHtml(person.discipline)} · ${escapeHtml(lifeLabel(person))}</small>
        <span class="time-overlap">${escapeHtml(wording)} · ${overlap.start}–${endLabel}</span>
      </button>`;
    }).join('')}</div>`:`<div class="time-empty">${escapeHtml(name)}, todavía no aparece ninguna coincidencia temporal verificable para ${escapeHtml(selectedIslandLabel)}.</div>`}`;

  timeResults.querySelectorAll('[data-time-person]').forEach(button=>button.addEventListener('click',()=>openProfile(button.dataset.timePerson)));
}

if(timeForm){
  timeForm.addEventListener('submit',event=>{
    event.preventDefault();
    const name=timeName.value.trim();
    const raw=timeBirth.value;
    const islandSlug=timeIsland?.value||'all';
    if(!name||!raw)return;
    const birthYear=new Date(`${raw}T00:00:00`).getFullYear();
    if(!Number.isFinite(birthYear)||birthYear>CURRENT_YEAR)return;
    renderTemporalMatches(name,birthYear,islandSlug);
  });
}

async function loadSupabasePeople(){
  try{
    const response=await fetch(C8_API_URL,{headers:{apikey:C8_PUBLISHABLE_KEY,Accept:'application/json'}});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const payload=await response.json();
    const remote=(payload.people??[]).map(normalizeRemotePerson);
    if(!remote.length)throw new Error('La API no devolvió perfiles');
    people.splice(0,people.length,...remote);
    renderIslandSelector();
    setTooltip(currentIsland);
    if(currentIsland)renderIslandList();
    else renderEmpty();
    document.documentElement.dataset.c8Data='supabase';
    window.dispatchEvent(new CustomEvent('c8:data-ready',{detail:{count:remote.length,generatedAt:payload.generated_at}}));
  }catch(error){
    console.error('Constelación 8: no se pudo sincronizar Supabase, se mantiene el conjunto local de respaldo.',error);
    document.documentElement.dataset.c8Data='fallback';
  }
}

loadSupabasePeople();
