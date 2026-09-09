import { islands, totalMunicipalities } from './data.js?v=20260908-1842';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config.js?v=20260909-agenda1';

let supabase = null;
if (SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY) {
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.110.8/+esm');
    supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession:false, autoRefreshToken:false, detectSessionInUrl:false }
    });
  } catch (error) {
    console.warn('Supabase no disponible', error);
  }
}

const PARTY_MARKS = [
  [/agrupaci[oó]n herre[nñ]a independiente|\bahi\b/i,'AHI','./assets/parties/ahi.svg'],
  [/agrupaci[oó]n socialista gomera|\basg\b/i,'ASG','./assets/parties/asg.svg'],
  [/unidos por betancuria|\bupbe\b/i,'UPBE','./assets/parties/upbe.svg'],
  [/unidos por yaiza|\bupy\b/i,'UPY','./assets/parties/upy.jpg'],
  [/roque aguayro/i,'RA','./assets/parties/roque-aguayro.png'],
  [/agrupaci[oó]n de electores por tejeda|\baet\b/i,'AET','./assets/parties/aet.png'],
  [/juntos por mog[aá]n|\bjpm\b/i,'JPM','./assets/parties/jpm.png'],
  [/unidos por gran canaria|\buxgc\b/i,'UxGC','./assets/parties/uxgc.svg'],
  [/ando sataute/i,'ANDO','./assets/parties/ando-sataute.png'],
  [/asamblea valsequillera|\basava\b/i,'AV','./assets/parties/asamblea-valsequillera.png'],
  [/\bavesan\b|asamblea de vecinos de san mateo/i,'AVESAN','./assets/parties/avesan.jpg'],
  [/bloque nacionalista rural|\bbnr\b/i,'BNR','./assets/parties/bnr.png'],
  [/m[aá]s por telde|\+xt/i,'+XT','./assets/parties/mas-telde.png'],
  [/forum drago|drago canarias|drago verdes/i,'DRAGO','./assets/parties/drago.png'],
  [/nueva canarias|nc-fac|frente amplio canarista/i,'NC','./assets/parties/nueva-canarias.png'],
  [/el cambio necesario/i,'ECN','./assets/parties/el-cambio-necesario.png'],
  [/iniciativa por el rosario|ir-?verdes/i,'IR-VERDES','./assets/parties/ir-verdes.png'],
  [/alternativa icodense/i,'AI','./assets/parties/alternativa-icodense.jpg'],
  [/asamblea unificada|aup-?ssp|sí se puede|si se puede/i,'AUP-SSP','./assets/parties/si-se-puede.jpg'],
  [/agrupación independiente de santa úrsula|agrupacion independiente de santa ursula|\baisu\b/i,'AISU','./assets/parties/aisu.png'],
  [/agrupación independiente de arafo|agrupacion independiente de arafo|ai ?arafo/i,'AIA-CC','./assets/parties/cc.png'],
  [/coalición canaria|coalicion canaria/i,'CC','./assets/parties/cc.png'],
  [/partido popular|\bpp\b/i,'PP','./assets/parties/pp.png'],
  [/\bvox\b/i,'VOX','./assets/parties/vox.png'],
  [/partido socialista|psoe/i,'PSOE','./assets/parties/psoe.png']
].map(([test,short,src])=>({test,short,src}));

const mapSection = document.getElementById('mapSection');
const directorySection = document.getElementById('directorySection');
const contactSection = document.getElementById('contactSection');
const contactedSection = document.getElementById('contactedSection');
const grid = document.getElementById('municipalityGrid');
const search = document.getElementById('municipalitySearch');
const empty = document.getElementById('contactEmpty');
const list = document.getElementById('contactsList');
const archipelagoStage = document.getElementById('archipelagoStage');
const canaryMap = archipelagoStage?.querySelector('.canary-map');
const DEFAULT_VIEWBOX = canaryMap?.getAttribute('viewBox') || '0 0 588 246';

let activeIsland = null;
let activeMode = 'island';
let contactedMap = new Map();

(function installIslandFocusStyles(){
  if(document.getElementById('de8IslandFocusStyles')) return;
  const style=document.createElement('style');
  style.id='de8IslandFocusStyles';
  style.textContent=`
    body.island-focus .network-layer{display:none!important}
    body.island-focus .canary-map .island-node:not(.is-focused){display:none!important}
    body.island-focus .archipelago-stage{width:min(78vw,760px)!important;height:min(44svh,430px)!important;max-width:760px!important;aspect-ratio:auto!important;margin:8px auto 2px!important}
    body.island-focus .canary-map{overflow:visible!important}
    body.island-focus .hero{padding-bottom:8px!important}
    body.island-focus .municipality-tooltip{z-index:20}
    @media(max-width:760px){
      body.island-focus .archipelago-stage{width:88vw!important;max-width:480px!important;height:min(38svh,330px)!important;margin:4px auto 0!important}
      body.island-focus .hero{padding-bottom:4px!important}
    }
    @media(max-width:430px){body.island-focus .archipelago-stage{width:90vw!important;height:min(36svh,310px)!important}}
  `;
  document.head.appendChild(style);
})();

function resetIslandFocus(){
  document.body.classList.remove('island-focus');
  if(canaryMap) canaryMap.setAttribute('viewBox',DEFAULT_VIEWBOX);
  document.querySelectorAll('.island-node').forEach(node=>node.classList.remove('is-focused'));
}

function focusIsland(slug){
  if(!canaryMap || !archipelagoStage) return;
  const node=canaryMap.querySelector(`.island-node[data-island="${CSS.escape(slug)}"]`);
  if(!node) return;
  requestAnimationFrame(()=>{
    const box=node.getBBox();
    if(!box.width || !box.height) return;
    const padX=Math.max(box.width*.16,3.5);
    const padY=Math.max(box.height*.12,3.5);
    const x=box.x-padX;
    const y=box.y-padY;
    const width=box.width+padX*2;
    const height=box.height+padY*2;
    canaryMap.setAttribute('viewBox',`${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)}`);
    document.querySelectorAll('.island-node').forEach(item=>item.classList.toggle('is-focused',item===node));
    document.body.classList.add('island-focus');
  });
}

function showMap(){
  activeIsland=null;
  activeMode='island';
  resetIslandFocus();
  document.body.classList.remove('island-open');
  mapSection.hidden=false;
  directorySection.hidden=true;
  contactSection.hidden=true;
  contactedSection.hidden=true;
  window.scrollTo({top:0,behavior:'smooth'});
}

function showIsland(slug){
  const island=islands.find(item=>item.slug===slug);
  if(!island) return;
  activeIsland=island;
  activeMode='island';
  document.body.classList.add('island-open');
  mapSection.hidden=false;
  directorySection.hidden=false;
  contactSection.hidden=true;
  contactedSection.hidden=true;
  document.getElementById('islandEyebrow').textContent='Isla · Directorio municipal';
  document.getElementById('islandTitle').textContent=island.name;
  document.getElementById('islandCount').textContent=island.municipalities.length?`${island.municipalities.length} municipios · orden alfabético`:island.note;
  search.value='';
  renderMunicipalities(island.municipalities.map(name=>({name,island:island.name})));
  focusIsland(slug);
  window.scrollTo({top:0,behavior:'smooth'});
}

function showAll(){
  activeIsland=null;
  activeMode='all';
  resetIslandFocus();
  const all=islands.flatMap(island=>island.municipalities.map(name=>({name,island:island.name}))).sort((a,b)=>a.name.localeCompare(b.name,'es'));
  document.body.classList.add('island-open');
  mapSection.hidden=false;
  directorySection.hidden=false;
  contactSection.hidden=true;
  contactedSection.hidden=true;
  document.getElementById('islandEyebrow').textContent='Canarias · Directorio municipal';
  document.getElementById('islandTitle').textContent='88 municipios';
  document.getElementById('islandCount').textContent=`${totalMunicipalities} municipios · orden alfabético`;
  search.value='';
  renderMunicipalities(all);
  window.scrollTo({top:0,behavior:'smooth'});
}

function renderMunicipalities(items){
  if(!items.length){
    grid.innerHTML=`<div class="contact-empty"><strong>Sin municipio propio.</strong><p>${escapeHtml(activeIsland?.note||'')}</p></div>`;
    return;
  }
  grid.innerHTML=items.map((item,index)=>{
    const contacted=contactedMap.get(item.name);
    return `<button class="municipality-card${contacted?' is-contacted':''}" type="button" data-name="${escapeAttr(item.name)}" data-island-name="${escapeAttr(item.island)}"><small>${String(index+1).padStart(2,'0')} · ${escapeHtml(item.island)}</small><strong>${escapeHtml(item.name)}</strong>${contacted?'<span class="contacted-label">✓ Contactado</span>':'<span>Ver contactos →</span>'}</button>`;
  }).join('');
  grid.querySelectorAll('.municipality-card').forEach(card=>card.addEventListener('click',()=>showMunicipality(card.dataset.name,card.dataset.islandName)));
}

function showMunicipality(name,islandName){
  if(!activeIsland) resetIslandFocus();
  document.body.classList.add('island-open');
  mapSection.hidden=false;
  directorySection.hidden=true;
  contactedSection.hidden=true;
  contactSection.hidden=false;
  document.getElementById('municipalityIsland').textContent=islandName;
  document.getElementById('municipalityTitle').textContent=name;
  list.innerHTML='';
  empty.hidden=false;
  document.getElementById('contactCount').textContent='Cargando…';
  void loadContacts(name);
  window.scrollTo({top:0,behavior:'smooth'});
}

async function loadContactedMunicipalities(){
  if(!supabase) return [];
  const {data,error}=await supabase.from('m88_contacted_municipalities').select('municipality_name,island_name,contacted_at,notes').order('contacted_at',{ascending:false}).order('municipality_name',{ascending:true});
  if(error){console.warn(error);return[];}
  contactedMap=new Map(data.map(item=>[item.municipality_name,item]));
  const headerCount=document.getElementById('contactedHeaderCount');
  if(headerCount) headerCount.textContent=String(data.length);
  return data;
}

async function showContacted(){
  activeIsland=null;
  activeMode='contacted';
  resetIslandFocus();
  document.body.classList.add('island-open');
  mapSection.hidden=false;
  directorySection.hidden=true;
  contactSection.hidden=true;
  contactedSection.hidden=false;
  const data=await loadContactedMunicipalities();
  document.getElementById('contactedCount').textContent=`${data.length} de ${totalMunicipalities}`;
  document.getElementById('contactedPending').textContent=`${totalMunicipalities-data.length} pendientes`;
  const contactedGrid=document.getElementById('contactedGrid');
  const contactedEmpty=document.getElementById('contactedEmpty');
  if(!data.length){
    contactedGrid.innerHTML='';
    contactedEmpty.hidden=false;
  }else{
    contactedEmpty.hidden=true;
    contactedGrid.innerHTML=data.map(item=>`<button class="municipality-card is-contacted" type="button" data-name="${escapeAttr(item.municipality_name)}" data-island-name="${escapeAttr(item.island_name)}"><small>${escapeHtml(item.island_name)}</small><strong>${escapeHtml(item.municipality_name)}</strong><span class="contacted-label">✓ Contactado</span>${item.contacted_at?`<span class="contacted-date">${formatContactedDate(item.contacted_at)}</span>`:''}</button>`).join('');
    contactedGrid.querySelectorAll('.municipality-card').forEach(card=>card.addEventListener('click',()=>showMunicipality(card.dataset.name,card.dataset.islandName)));
  }
  window.scrollTo({top:0,behavior:'smooth'});
}

function formatContactedDate(value){
  const [y,m,d]=String(value).split('-');
  return y&&m&&d?`${d}/${m}/${y}`:String(value||'');
}

function partyMark(party){
  const text=String(party||'').trim();
  if(!text) return '';
  const mark=PARTY_MARKS.find(item=>item.test.test(text));
  const short=mark?.short||initialsFromParty(text);
  const image=mark?.src?`<img class="party-logo" src="${escapeAttr(mark.src)}" alt="${escapeAttr(short)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-grid'">`:'';
  const badgeStyle=mark?.src?' style="display:none"':'';
  return `<div class="party-row">${image}<span class="party-badge"${badgeStyle}>${escapeHtml(short)}</span><span class="party-name">${escapeHtml(text)}</span></div>`;
}

function initialsFromParty(value){
  const tokens=String(value).replace(/\([^)]*\)/g,' ').split(/\s+/).filter(Boolean);
  const initials=tokens.filter(token=>!/^(de|del|la|el|y|por)$/i.test(token)).slice(0,4).map(token=>token[0]).join('').toUpperCase();
  return initials||'PARTIDO';
}

async function loadContacts(municipalityName){
  if(!supabase){document.getElementById('contactCount').textContent='0 contactos';return;}
  const {data,error}=await supabase.from('m88_contacts_directory').select('full_name,official_title,email,phone,source_url,verified_at,notes,area_names,political_party,address').eq('municipality_name',municipalityName).order('full_name',{ascending:true});
  if(error){console.warn(error);document.getElementById('contactCount').textContent='0 contactos';return;}
  document.getElementById('contactCount').textContent=`${data.length} ${data.length===1?'contacto':'contactos'}`;
  if(!data.length) return;
  empty.hidden=true;
  list.innerHTML=data.map(contact=>`<article class="contact-card"><div class="areas">${escapeHtml(contact.area_names||'Área institucional')}</div><h3>${escapeHtml(contact.full_name)}</h3><p>${escapeHtml(contact.official_title||'')}</p>${partyMark(contact.political_party)}${contact.address?`<p><strong>Dirección:</strong> ${escapeHtml(contact.address)}</p>`:''}<p>${contact.email?`<a href="mailto:${escapeAttr(contact.email)}">${escapeHtml(contact.email)}</a>`:''}${contact.phone?`${contact.email?' · ':''}${escapeHtml(contact.phone)}`:''}</p>${contact.source_url?`<p><a href="${escapeAttr(contact.source_url)}" target="_blank" rel="noopener noreferrer">Fuente oficial ↗</a></p>`:''}</article>`).join('');
}

search.addEventListener('input',()=>{
  const q=search.value.trim().toLocaleLowerCase('es');
  if(activeMode==='all'){
    const items=islands.flatMap(island=>island.municipalities.map(name=>({name,island:island.name}))).sort((a,b)=>a.name.localeCompare(b.name,'es'));
    renderMunicipalities(items.filter(item=>item.name.toLocaleLowerCase('es').includes(q)||item.island.toLocaleLowerCase('es').includes(q)));
  }else if(activeIsland){
    renderMunicipalities(activeIsland.municipalities.filter(name=>name.toLocaleLowerCase('es').includes(q)).map(name=>({name,island:activeIsland.name})));
  }
});

document.querySelectorAll('.island-node').forEach(node=>{
  const activate=()=>showIsland(node.dataset.island);
  node.addEventListener('click',activate);
  node.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();activate();}});
});

const navContacted=document.getElementById('navContacted');
if(navContacted) navContacted.addEventListener('click',()=>void showContacted());
const backFromContacted=document.getElementById('backFromContacted');
if(backFromContacted) backFromContacted.addEventListener('click',showMap);
void loadContactedMunicipalities();
const navAll=document.getElementById('navAll');
if(navAll) navAll.addEventListener('click',showAll);
document.getElementById('backToMap').addEventListener('click',showMap);
document.getElementById('backToMunicipalities').addEventListener('click',()=>activeMode==='all'?showAll():activeMode==='contacted'?void showContacted():activeIsland&&showIsland(activeIsland.slug));

function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
function escapeAttr(value){return escapeHtml(value);}

if(totalMunicipalities!==88) console.error(`Dataset municipal incorrecto: ${totalMunicipalities}`);