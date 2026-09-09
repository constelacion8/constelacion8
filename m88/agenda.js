import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config.js?v=20260908-1842';

const agendaList = document.getElementById('agendaList');
const agendaCount = document.getElementById('agendaCount');
if (!agendaList || !agendaCount || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  // Agenda is optional and must never interfere with the map.
} else {
  void loadAgenda();
}

async function loadAgenda(){
  try{
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.110.8/+esm');
    const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth:{ persistSession:false, autoRefreshToken:false, detectSessionInUrl:false }
    });

    const { data, error } = await client
      .from('m88_meetings')
      .select('title,starts_at,ends_at,island_name,municipality_name,contact_name,area_name,location,meeting_url,status')
      .eq('status','confirmed')
      .gte('starts_at', new Date().toISOString())
      .order('starts_at',{ascending:true})
      .limit(20);

    if(error) throw error;
    renderAgenda(data || []);
  }catch(error){
    console.warn('Agenda no disponible',error);
    agendaCount.innerHTML='<strong>—</strong> agenda';
    agendaList.innerHTML='<div class="agenda-empty"><strong>Agenda no disponible.</strong><span>No se han podido cargar las reuniones.</span></div>';
  }
}

function renderAgenda(meetings){
  agendaCount.innerHTML=`<strong>${meetings.length}</strong> ${meetings.length===1?'reunión':'reuniones'}`;
  if(!meetings.length){
    agendaList.innerHTML='<div class="agenda-empty"><strong>Sin reuniones confirmadas.</strong><span>Las próximas reuniones aparecerán aquí automáticamente.</span></div>';
    return;
  }
  agendaList.innerHTML=meetings.map(renderMeeting).join('');
}

function renderMeeting(meeting){
  const date = new Date(meeting.starts_at);
  const day = format(date,{day:'2-digit'});
  const month = format(date,{month:'short'}).replace('.','');
  const weekday = format(date,{weekday:'long'});
  const time = format(date,{hour:'2-digit',minute:'2-digit',hour12:false});
  const place = [meeting.municipality_name,meeting.island_name].filter(Boolean).join(' · ') || 'Reunión comercial';
  const details = [meeting.contact_name,meeting.area_name,meeting.location].filter(Boolean);
  return `<article class="agenda-item">
    <div class="agenda-date">
      <span class="agenda-day">${esc(day)}</span>
      <span class="agenda-month">${esc(month)}</span>
      <span class="agenda-weekday">${esc(weekday)}</span>
    </div>
    <div class="agenda-body">
      <p class="agenda-place">${esc(place)}</p>
      <h3 class="agenda-name">${esc(meeting.title || 'Reunión')}</h3>
      ${details.length?`<div class="agenda-details">${details.map(item=>`<span>${esc(item)}</span>`).join('')}</div>`:''}
    </div>
    <div class="agenda-side">
      <span class="agenda-time">${esc(time)}</span>
      <span class="agenda-status">Confirmada</span>
    </div>
  </article>`;
}

function format(date,options){
  return new Intl.DateTimeFormat('es-ES',{timeZone:'Atlantic/Canary',...options}).format(date);
}

function esc(value){
  return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
