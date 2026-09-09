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
  {
    test: /agrupaci[oó]n herre[nñ]a independiente|\bahi\b/i,
    short: 'AHI',
    src: './assets/parties/ahi.svg'
  },
  {
    test: /agrupaci[oó]n socialista gomera|\basg\b/i,
    short: 'ASG',
    src: './assets/parties/asg.svg'
  },
  {
    test: /unidos por betancuria|\bupbe\b/i,
    short: 'UPBE',
    src: './assets/parties/upbe.svg'
  },
  {
    test: /unidos por yaiza|\bupy\b/i,
    short: 'UPY',
    src: './assets/parties/upy.jpg'
  },
  {
    test: /roque aguayro/i,
    short: 'RA',
    src: './assets/parties/roque-aguayro.png'
  },
  {
    test: /agrupaci[oó]n de electores por tejeda|\baet\b/i,
    short: 'AET',
    src: './assets/parties/aet.png'
  },
  {
    test: /juntos por mog[aá]n|\bjpm\b/i,
    short: 'JPM',
    src: './assets/parties/jpm.png'
  },
  {
    test: /unidos por gran canaria|\buxgc\b/i,
    short: 'UxGC',
    src: './assets/parties/uxgc.svg'
  },
  {
    test: /ando sataute/i,
    short: 'ANDO',
    src: './assets/parties/ando-sataute.png'
  },
  {
    test: /asamblea valsequillera|\basava\b/i,
    short: 'AV',
    src: './assets/parties/asamblea-valsequillera.png'
  },
  {
    test: /\bavesan\b|asamblea de vecinos de san mateo/i,
    short: 'AVESAN',
    src: './assets/parties/avesan.jpg'
  },
  {
    test: /bloque nacionalista rural|\bbnr\b/i,
    short: 'BNR',
    src: './assets/parties/bnr.png'
  },
  {
    test: /m[aá]s por telde|\+xt/i,
    short: '+XT',
    src: './assets/parties/mas-telde.png'
  },
  {
    test: /forum drago|drago canarias|drago verdes/i,
    short: 'DRAGO',
    src: './assets/parties/drago.png'
  },
  {
    test: /nueva canarias|nc-fac|frente amplio canarista/i,
    short: 'NC',
    src: './assets/parties/nueva-canarias.png'
  },
  {
    test: /el cambio necesario/i,
    short: 'ECN',
    src: './assets/parties/el-cambio-necesario.png'
  },
  {
    test: /iniciativa por el rosario|ir-?verdes/i,
    short: 'IR-VERDES',
    src: './assets/parties/ir-verdes.png'
  },
  {
    test: /alternativa icodense/i,
    short: 'AI',
    src: './assets/parties/alternativa-icodense.jpg'
  },
  {
    test: /asamblea unificada|aup-?ssp|sí se puede|si se puede/i,
    short: 'AUP-SSP',
    src: './assets/parties/si-se-puede.jpg'
  },
  {
    test: /agrupación independiente de santa úrsula|agrupacion independiente de santa ursula|\baisu\b/i,
    short: 'AISU',
    src: './assets/parties/aisu.png'
  },
  {
    test: /agrupación independiente de arafo|agrupacion independiente de arafo|ai ?arafo/i,
    short: 'AIA-CC',
    src: './assets/parties/cc.png'
  },
  {
    test: /coalición canaria|coalicion canaria/i,
    short: 'CC',
    src: './assets/parties/cc.png'
  },
  {
    test: /partido popular|\bpp\b/i,
    short: 'PP',
    src: './assets/parties/pp.png'
  },
  {
    test: /\bvox\b/i,
    short: 'VOX',
    src: './assets/parties/vox.png'
  },
  {
    test: /partido socialista|psoe/i,
    short: 'PSOE',
    src: './assets/parties/psoe.png'
  }
];

const mapSection = document.getElementById('mapSection');
const directorySection = document.getElementById('directorySection');
const contactSection = document.getElementById('contactSection');
const contactedSection = document.getElementById('contactedSection');
const grid = document.getElementById('municipalityGrid');
const search = document.getElementById('municipalitySearch');
const empty = document.getElementById('contactEmpty');
const list = document.getElementById('contactsList');
let activeIsland = null;
let activeMode = 'island';
let contactedMap = new Map();

function showMap(){
  activeIsland = null;
  document.body.classList.remove('island-open');
  mapSection.hidden = false;
  directorySection.hidden = true;
  contactSection.hidden = true;
  contactedSection.hidden = true;
  window.scrollTo({top:0,behavior:'smooth'});
}

function showIsland(slug){
  const island = islands.find(item=>item.slug===slug);
  if(!island) return;
  activeIsland = island;
  activeMode = 'island';
  document.body.classList.add('island-open');
  mapSection.hidden = false;
  directorySection.hidden = false;
  contactSection.hidden = true;
  contactedSection.hidden = true;
  document.getElementById('islandEyebrow').textContent = 'Isla · Directorio municipal';
  document.getElementById('islandTitle').textContent = island.name;
  document.getElementById('islandCount').textContent = island.municipalities.length ? `${island.municipalities.length} municipios · orden alfabético` : island.note;
  search.value = '';
  renderMunicipalities(island.municipalities.map(name=>({name,island:island.name})));
  window.scrollTo({top:0,behavior:'smooth'});
}

function showAll(){
  activeIsland = null;
  activeMode = 'all';
  const all = islands.flatMap(island=>island.municipalities.map(name=>({name,island:island.name}))).sort((a,b)=>a.name.localeCompare(b.name,'es'));
  document.body.classList.add('island-open');
  mapSection.hidden = false;
  directorySection.hidden = false;
  contactSection.hidden = true;
  contactedSection.hidden = true;
  document.getElementById('islandEyebrow').textContent = 'Canarias · Directorio municipal';
  document.getElementById('islandTitle').textContent = '88 municipios';
  document.getElementById('islandCount').textContent = `${totalMunicipalities} municipios · orden alfabético`;
  search.value = '';
  renderMunicipalities(all);
  window.scrollTo({top:0,behavior:'smooth'});
}

function renderMunicipalities(items){
  if(!items.length){
    grid.innerHTML = `<div class="contact-empty"><strong>Sin municipio propio.</strong><p>${escapeHtml(activeIsland?.note || '')}</p></div>`;
    return;
  }
  grid.innerHTML = items.map((item,index)=>{const contacted=contactedMap.get(item.name);return `<button class="municipality-card${contacted?' is-contacted':''}" type="button" data-name="${escapeAttr(item.name)}" data-island-name="${escapeAttr(item.island)}"><small>${String(index+1).padStart(2,'0')} · ${escapeHtml(item.island)}</small><strong>${escapeHtml(item.name)}</strong>${contacted?`<span class="contacted-label">✓ Contactado</span>`:`<span>Ver contactos →</span>`}</button>`}).join('');
  grid.querySelectorAll('.municipality-card').forEach(card=>card.addEventListener('click',()=>showMunicipality(card.dataset.name, card.dataset.islandName)));
}

function showMunicipality(name,islandName){
  document.body.classList.add('island-open');
  mapSection.hidden = false;
  directorySection.hidden = true;
  contactedSection.hidden = true;
  contactSection.hidden = false;
  document.getElementById('municipalityIsland').textContent = islandName;
  document.getElementById('municipalityTitle').textContent = name;
  list.innerHTML = '';
  empty.hidden = false;
  document.getElementById('contactCount').textContent = 'Cargando…';
  void loadContacts(name);
  window.scrollTo({top:0,behavior:'smooth'});
}

async function loadContactedMunicipalities(){
  if(!supabase) return [];
  const { data, error } = await supabase
    .from('m88_contacted_municipalities')
    .select('municipality_name,island_name,contacted_at,notes')
    .order('contacted_at',{ascending:false})
    .order('municipality_name',{ascending:true});
  if(error){ console.warn(error); return []; }
  contactedMap = new Map(data.map(item=>[item.municipality_name,item]));
  const headerCount=document.getElementById('contactedHeaderCount');
  if(headerCount) headerCount.textContent=String(data.length);
  return data;
}

async function showContacted(){
  activeIsland=null;
  activeMode='contacted';
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
  } else {
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
  const text = String(party || '').trim();
  if(!text) return '';
  const mark = PARTY_MARKS.find(item=>item.test.test(text));
  const short = mark?.short || initialsFromParty(text);
  const image = mark?.src
    ? `<img class="party-logo" src="${escapeAttr(mark.src)}" alt="${escapeAttr(short)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none';this.nextElementSibling.style.display='inline-grid'">`
    : '';
  const badgeStyle = mark?.src ? ' style="display:none"' : '';
  return `<div class="party-row">${image}<span class="party-badge"${badgeStyle}>${escapeHtml(short)}</span><span class="party-name">${escapeHtml(text)}</span></div>`;
}

function initialsFromParty(value){
  const tokens = String(value).replace(/\([^)]*\)/g,' ').split(/\s+/).filter(Boolean);
  const initials = tokens.filter(token=>!/^(de|del|la|el|y|por)$/i.test(token)).slice(0,4).map(token=>token[0]).join('').toUpperCase();
  return initials || 'PARTIDO';
}

async function loadContacts(municipalityName){
  if(!supabase){
    document.getElementById('contactCount').textContent = '0 contactos';
    return;
  }
  const { data, error } = await supabase
    .from('m88_contacts_directory')
    .select('full_name,official_title,email,phone,source_url,verified_at,notes,area_names,political_party,address')
    .eq('municipality_name', municipalityName)
    .order('full_name', { ascending:true });
  if(error){
    console.warn(error);
    document.getElementById('contactCount').textContent = '0 contactos';
    return;
  }
  document.getElementById('contactCount').textContent = `${data.length} ${data.length===1?'contacto':'contactos'}`;
  if(!data.length) return;
  empty.hidden = true;
  list.innerHTML = data.map(contact=>`<article class="contact-card"><div class="areas">${escapeHtml(contact.area_names || 'Área institucional')}</div><h3>${escapeHtml(contact.full_name)}</h3><p>${escapeHtml(contact.official_title || '')}</p>${partyMark(contact.political_party)}${contact.address ? `<p><strong>Dirección:</strong> ${escapeHtml(contact.address)}</p>` : ''}<p>${contact.email ? `<a href="mailto:${escapeAttr(contact.email)}">${escapeHtml(contact.email)}</a>` : ''}${contact.phone ? `${contact.email?' · ':''}${escapeHtml(contact.phone)}` : ''}</p>${contact.source_url ? `<p><a href="${escapeAttr(contact.source_url)}" target="_blank" rel="noopener noreferrer">Fuente oficial ↗</a></p>` : ''}</article>`).join('');
}

search.addEventListener('input',()=>{
  const q = search.value.trim().toLocaleLowerCase('es');
  if(activeMode==='all'){
    const items = islands.flatMap(island=>island.municipalities.map(name=>({name,island:island.name}))).sort((a,b)=>a.name.localeCompare(b.name,'es'));
    renderMunicipalities(items.filter(item=>item.name.toLocaleLowerCase('es').includes(q) || item.island.toLocaleLowerCase('es').includes(q)));
  } else if(activeIsland){
    renderMunicipalities(activeIsland.municipalities.filter(name=>name.toLocaleLowerCase('es').includes(q)).map(name=>({name,island:activeIsland.name})));
  }
});

document.querySelectorAll('.island-node').forEach(node=>{
  const activate = ()=>showIsland(node.dataset.island);
  node.addEventListener('click',activate);
  node.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();activate();}});
});

const navContacted = document.getElementById('navContacted');
if(navContacted) navContacted.addEventListener('click',()=>void showContacted());
const backFromContacted = document.getElementById('backFromContacted');
if(backFromContacted) backFromContacted.addEventListener('click',showMap);
void loadContactedMunicipalities();
const navAll = document.getElementById('navAll');
if(navAll) navAll.addEventListener('click',showAll);
document.getElementById('backToMap').addEventListener('click',showMap);
document.getElementById('backToMunicipalities').addEventListener('click',()=>activeMode==='all'?showAll():activeMode==='contacted'?void showContacted():activeIsland&&showIsland(activeIsland.slug));

function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
function escapeAttr(value){return escapeHtml(value);}

if(totalMunicipalities!==88) console.error(`Dataset municipal incorrecto: ${totalMunicipalities}`);
