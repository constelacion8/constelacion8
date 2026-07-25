const timeForm=document.getElementById('timeForm');
const timeName=document.getElementById('timeName');
const timeBirth=document.getElementById('timeBirth');
const timeResults=document.getElementById('timeResults');

const heroEyebrow=document.querySelector('#inicio .hero-intro .eyebrow');
if(heroEyebrow)heroEyebrow.textContent='DE8 Films presenta';

if(timeBirth)timeBirth.max=new Date().toISOString().slice(0,10);

function userOverlap(birthYear,person){
  const start=Math.max(birthYear,person.born);
  const end=Math.min(CURRENT_YEAR,person.died??CURRENT_YEAR);
  if(start>end)return null;
  return {start,end,years:Math.max(0,end-start)};
}

function temporalMatches(birthYear){
  return people
    .map(person=>({person,overlap:userOverlap(birthYear,person)}))
    .filter(item=>item.overlap)
    .sort((a,b)=>b.overlap.years-a.overlap.years || a.person.name.localeCompare(b.person.name,'es'));
}

function renderTemporalMatches(name,birthYear){
  const matches=temporalMatches(birthYear);
  const longest=matches[0]?.overlap?.years??0;
  const bornBefore=matches.filter(item=>item.person.born<=birthYear).length;

  timeResults.innerHTML=`
    <div class="time-summary">
      <span><b>${matches.length}</b> vidas coincidentes</span>
      <span><b>${longest}</b> años de coincidencia máxima</span>
      <span><b>${bornBefore}</b> ya habían nacido cuando llegaste</span>
    </div>
    ${matches.length?`<div class="time-match-grid">${matches.map(({person,overlap})=>{
      const endLabel=overlap.end===CURRENT_YEAR?'actualidad':overlap.end;
      const duration=overlap.years===0?'menos de un año':`${overlap.years} ${overlap.years===1?'año':'años'}`;
      return `<button class="time-person" data-time-person="${person.id}">
        <strong>${escapeHtml(person.name)}</strong>
        <small>${escapeHtml(islands[person.island].name)} · ${escapeHtml(person.discipline)} · ${lifeLabel(person)}</small>
        <span class="time-overlap">Coincidisteis ${duration} · ${overlap.start}–${endLabel}</span>
      </button>`;
    }).join('')}</div>`:`<div class="time-empty">${escapeHtml(name)}, con los perfiles incorporados a esta versión todavía no aparece ninguna coincidencia temporal. La herramienta crecerá con el atlas.</div>`}`;

  timeResults.querySelectorAll('[data-time-person]').forEach(button=>button.addEventListener('click',()=>openProfile(button.dataset.timePerson)));
}

if(timeForm){
  timeForm.addEventListener('submit',event=>{
    event.preventDefault();
    const name=timeName.value.trim();
    const raw=timeBirth.value;
    if(!name||!raw)return;
    const birthYear=new Date(`${raw}T00:00:00`).getFullYear();
    if(!Number.isFinite(birthYear)||birthYear>CURRENT_YEAR)return;
    renderTemporalMatches(name,birthYear);
  });
}