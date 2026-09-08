import { islands, totalMunicipalities } from './data.js?v=20260908-1842';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config.js?v=20260908-1842';

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
    test: /iniciativa por el rosario|ir-?verdes/i,
    short: 'IR-VERDES',
    src: 'https://irverdes.com/wp-content/uploads/2023/03/IR_VERDES-IC-20_anos-horiz.png'
  },
  {
    test: /alternativa icodense/i,
    short: 'AI',
    src: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Logo_AI.jpg'
  },
  {
    test: /asamblea unificada|aup-?ssp|sí se puede|si se puede/i,
    short: 'AUP-SSP',
    src: 'https://sisepuedecanarias.org/wp-content/uploads/2018/12/logo-ssp-infimo.jpg'
  },
  {
    test: /agrupación independiente de santa úrsula|agrupacion independiente de santa ursula|\baisu\b/i,
    short: 'AISU',
    src: null
  },
  {
    test: /agrupación independiente de arafo|agrupacion independiente de arafo|ai ?arafo/i,
    short: 'AIA-CC',
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Coalici%C3%B3n_Canaria.svg/400px-Coalici%C3%B3n_Canaria.svg.png'
  },
  {
    test: /coalición canaria|coalicion canaria/i,
    short: 'CC',
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Coalici%C3%B3n_Canaria.svg/400px-Coalici%C3%B3n_Canaria.svg.png'
  },
  {
    test: /partido popular|\bpp\b/i,
    short: 'PP',
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Logo_del_PP_%282022%29.svg/512px-Logo_del_PP_%282022%29.svg.png'
  },
  {
    test: /\bvox\b/i,
    short: 'VOX',
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/VOX_logo.svg/500px-VOX_logo.svg.png'
  },
  {
    test: /partido socialista|psoe/i,
    short: 'PSOE',
    src: 'https://upload.wikimedia.org/wikipedia/commons/9/92/PSOE_LOGO.png'
  }
];

const mapSection = document.getElementById('mapSection');
const directorySection = document.getElementById('directorySection');
const contactSection = document.getElementById('contactSection');
const grid = document.getElementById('municipalityGrid');
const search = document.getElementById('municipalitySearch');
const empty = document.getElementById('contactEmpty');
const list = document.getElementById('contactsList');
let activeIsland = null;
let activeMode = 'island';

function showMap(){
  activeIsland = null;
  document.body.classList.remove('island-open');
  mapSection.hidden = false;
  directorySection.hidden = true;
  contactSection.hidden = true;
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
  grid.innerHTML = items.map((item,index)=>`<button class="municipality-card" type="button" data-name="${escapeAttr(item.name)}" data-island-name="${escapeAttr(item.island)}"><small>${String(index+1).padStart(2,'0')} · ${escapeHtml(item.island)}</small><strong>${escapeHtml(item.name)}</strong><span>Ver contactos →</span></button>`).join('');
  grid.querySelectorAll('.municipality-card').forEach(card=>card.addEventListener('click',()=>showMunicipality(card.dataset.name, card.dataset.islandName)));
}

function showMunicipality(name,islandName){
  document.body.classList.add('island-open');
  mapSection.hidden = false;
  directorySection.hidden = true;
  contactSection.hidden = false;
  document.getElementById('municipalityIsland').textContent = islandName;
  document.getElementById('municipalityTitle').textContent = name;
  list.innerHTML = '';
  empty.hidden = false;
  document.getElementById('contactCount').textContent = 'Cargando…';
  void loadContacts(name);
  window.scrollTo({top:0,behavior:'smooth'});
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

const navAll = document.getElementById('navAll');
if(navAll) navAll.addEventListener('click',showAll);
document.getElementById('backToMap').addEventListener('click',showMap);
document.getElementById('backToMunicipalities').addEventListener('click',()=>activeMode==='all'?showAll():activeIsland&&showIsland(activeIsland.slug));

function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
function escapeAttr(value){return escapeHtml(value);}

if(totalMunicipalities!==88) console.error(`Dataset municipal incorrecto: ${totalMunicipalities}`);
