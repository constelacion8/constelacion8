const API = 'https://kvoldyeinvjajsimxmyc.supabase.co/functions/v1/m88-companies-api';
const TOKEN_KEY = 'de8_m88_private_session';

const mapSection = document.getElementById('mapSection');
const directorySection = document.getElementById('directorySection');
const contactSection = document.getElementById('contactSection');
const contactedSection = document.getElementById('contactedSection');
const main = document.querySelector('main');
const heroIntro = mapSection?.querySelector('.hero-intro');
const backToMap = document.getElementById('backToMap');

let companyMode = false;
let activeIsland = null;
let companyCache = [];

const stylesheet = document.createElement('link');
stylesheet.rel = 'stylesheet';
stylesheet.href = './companies.css?v=20260911-private1';
document.head.appendChild(stylesheet);

const switcher = document.createElement('div');
switcher.className = 'm88-mode-switch';
switcher.setAttribute('role', 'group');
switcher.setAttribute('aria-label', 'Tipo de directorio comercial');
switcher.innerHTML = `
  <button class="m88-mode-button is-active" type="button" data-mode="institutions" aria-pressed="true">Instituciones</button>
  <button class="m88-mode-button" type="button" data-mode="companies" aria-pressed="false">Devolución Cultural</button>
`;
heroIntro?.appendChild(switcher);

const companySection = document.createElement('section');
companySection.id = 'm88CompanySection';
companySection.className = 'm88-company-section';
companySection.hidden = true;
companySection.innerHTML = `
  <div class="m88-company-toolbar">
    <div class="m88-company-heading">
      <p>Isla · Devolución Cultural</p>
      <h2 id="m88CompanyIsland">Empresas</h2>
      <span id="m88CompanyCount">Cartera privada de DE8 Films</span>
    </div>
    <button class="m88-company-back" type="button" id="m88CompanyBackMap">← Volver al mapa</button>
  </div>
  <label class="m88-company-search">
    <input id="m88CompanySearch" type="search" placeholder="Buscar empresa, sector o vínculo…" autocomplete="off">
  </label>
  <div class="m88-company-grid" id="m88CompanyGrid"></div>
`;
main?.appendChild(companySection);

const detailSection = document.createElement('section');
detailSection.id = 'm88CompanyDetail';
detailSection.className = 'm88-company-section';
detailSection.hidden = true;
detailSection.innerHTML = `
  <div class="m88-company-toolbar">
    <button class="m88-company-back" type="button" id="m88CompanyBackList">← Volver a empresas</button>
  </div>
  <div id="m88CompanyDetailContent"></div>
`;
main?.appendChild(detailSection);

const grid = document.getElementById('m88CompanyGrid');
const search = document.getElementById('m88CompanySearch');
const detailContent = document.getElementById('m88CompanyDetailContent');

function token(){
  try { return sessionStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
}

async function api(params){
  const session = token();
  if(!session) throw new Error('La sesión privada no está disponible. Recarga la página.');
  const url = new URL(API);
  Object.entries(params).forEach(([key,value])=>url.searchParams.set(key,String(value)));
  const response = await fetch(url.toString(), {
    headers:{Authorization:`Bearer ${session}`},
    cache:'no-store',
    credentials:'omit'
  });
  const payload = await response.json().catch(()=>({}));
  if(response.status===401) throw new Error('La sesión ha caducado. Recarga la página para volver a entrar.');
  if(!response.ok) throw new Error(payload.error || 'No se pudo cargar la cartera privada.');
  return payload;
}

function setMode(mode){
  companyMode = mode === 'companies';
  document.body.classList.toggle('m88-company-mode', companyMode);
  switcher.querySelectorAll('.m88-mode-button').forEach(button=>{
    const selected = button.dataset.mode === mode;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });

  if(companyMode){
    companySection.hidden = true;
    detailSection.hidden = true;
    backToMap?.click();
    companyMode = true;
    document.body.classList.add('m88-company-mode');
    switcher.querySelector('[data-mode="institutions"]')?.classList.remove('is-active');
    switcher.querySelector('[data-mode="institutions"]')?.setAttribute('aria-pressed','false');
    switcher.querySelector('[data-mode="companies"]')?.classList.add('is-active');
    switcher.querySelector('[data-mode="companies"]')?.setAttribute('aria-pressed','true');
  }else{
    companySection.hidden = true;
    detailSection.hidden = true;
    activeIsland = null;
    backToMap?.click();
  }
}

switcher.querySelectorAll('.m88-mode-button').forEach(button=>button.addEventListener('click',()=>setMode(button.dataset.mode)));

document.getElementById('m88CompanyBackMap')?.addEventListener('click',()=>{
  companySection.hidden = true;
  detailSection.hidden = true;
  activeIsland = null;
  backToMap?.click();
  companyMode = true;
  document.body.classList.add('m88-company-mode');
});
document.getElementById('m88CompanyBackList')?.addEventListener('click',()=>activeIsland && showIslandCompanies(activeIsland.slug,activeIsland.name));

function hideInstitutionalSections(){
  if(directorySection) directorySection.hidden = true;
  if(contactSection) contactSection.hidden = true;
  if(contactedSection) contactedSection.hidden = true;
}

async function showIslandCompanies(slug,name){
  activeIsland = {slug,name};
  hideInstitutionalSections();
  if(mapSection) mapSection.hidden = false;
  detailSection.hidden = true;
  companySection.hidden = false;
  document.getElementById('m88CompanyIsland').textContent = name;
  document.getElementById('m88CompanyCount').textContent = 'Cargando empresas vinculadas al territorio…';
  search.value = '';
  grid.innerHTML = '<div class="m88-company-empty"><strong>Cargando cartera privada…</strong></div>';
  window.scrollTo({top:Math.max(0,companySection.offsetTop-110),behavior:'smooth'});
  try{
    const payload = await api({action:'island',island:name});
    companyCache = Array.isArray(payload.companies) ? payload.companies : [];
    document.getElementById('m88CompanyCount').textContent = `${companyCache.length} ${companyCache.length===1?'empresa vinculada':'empresas vinculadas'} · cartera en expansión`;
    renderCompanies(companyCache);
  }catch(error){
    companyCache = [];
    grid.innerHTML = `<div class="m88-company-empty"><strong>No se pudo cargar la cartera.</strong><p>${escapeHtml(error.message)}</p></div>`;
  }
}

function primaryRelation(company){
  const relations = Array.isArray(company.relations) ? company.relations : [];
  return relations.find(item=>item.primary) || relations[0] || {};
}

function renderCompanies(items){
  if(!items.length){
    grid.innerHTML = '<div class="m88-company-empty"><strong>Aún no hay empresas cargadas para esta isla.</strong><p>Solo se incorporan empresas con un vínculo territorial justificable.</p></div>';
    return;
  }
  grid.innerHTML = items.map(company=>{
    const relation = primaryRelation(company);
    const relationCopy = [relation.municipality,relation.detail].filter(Boolean).join(' · ');
    return `<button class="m88-company-card" type="button" data-company-id="${escapeAttr(company.company_id)}">
      <div class="m88-company-card-top"><span class="m88-company-sector">${escapeHtml(company.sector||'Empresa privada')}</span><span class="m88-company-status status-${escapeAttr(company.sales_status||'sin_contactar')}">${escapeHtml(statusLabel(company.sales_status))}</span></div>
      <strong>${escapeHtml(company.company_name)}</strong>
      <p>${escapeHtml(relationCopy||'Vínculo territorial en investigación')}</p>
      <div class="m88-company-metrics"><span>Afinidad <b>${escapeHtml(company.fit_score||0)}/5</b></span><span>Prioridad <b>${escapeHtml(company.priority||0)}/5</b></span></div>
      <span class="m88-company-entry">Puerta de entrada: ${escapeHtml(company.recommended_entry||'Por investigar')}</span>
      <span class="m88-company-open">Abrir ficha →</span>
    </button>`;
  }).join('');
  grid.querySelectorAll('.m88-company-card').forEach(card=>card.addEventListener('click',()=>showDetail(card.dataset.companyId)));
}

async function showDetail(companyId){
  companySection.hidden = true;
  detailSection.hidden = false;
  detailContent.innerHTML = '<div class="m88-company-empty"><strong>Cargando ficha comercial…</strong></div>';
  window.scrollTo({top:Math.max(0,detailSection.offsetTop-110),behavior:'smooth'});
  try{
    const payload = await api({action:'detail',company_id:companyId});
    renderDetail(payload);
  }catch(error){
    detailContent.innerHTML = `<div class="m88-company-empty"><strong>No se pudo abrir la ficha.</strong><p>${escapeHtml(error.message)}</p></div>`;
  }
}

function renderDetail(payload){
  const company = payload.company || {};
  const contacts = Array.isArray(payload.contacts) ? payload.contacts : [];
  const territories = Array.isArray(payload.territories) ? payload.territories : [];
  detailContent.innerHTML = `
    <div class="m88-company-detail-head">
      <div><span class="m88-panel-label">Devolución Cultural · Ficha privada</span><h2>${escapeHtml(company.company_name||'Empresa')}</h2><p class="m88-company-detail-sector">${escapeHtml(company.sector||'')}</p></div>
      <span class="m88-company-status status-${escapeAttr(company.sales_status||'sin_contactar')}">${escapeHtml(statusLabel(company.sales_status))}</span>
    </div>
    <div class="m88-company-panels">
      <article class="m88-company-panel is-pitch"><span class="m88-panel-label">Por qué encaja</span><p>${escapeHtml(company.pitch_reason||'Argumento comercial pendiente de completar.')}</p></article>
      <article class="m88-company-panel"><span class="m88-panel-label">Puerta de entrada recomendada</span><p>${escapeHtml(company.recommended_entry||'Por investigar')}</p><div class="m88-company-detail-metrics"><span>Afinidad <b>${escapeHtml(company.fit_score||0)}/5</b></span><span>Prioridad <b>${escapeHtml(company.priority||0)}/5</b></span></div></article>
    </div>
    <div class="m88-company-block"><div class="m88-company-block-head"><strong>Contactos</strong><small>${contacts.length} disponibles</small></div><div class="m88-company-contact-grid">${contacts.length?contacts.map(contactCard).join(''):'<div class="m88-company-empty"><strong>Contacto directo pendiente de investigación.</strong></div>'}</div></div>
    <div class="m88-company-block"><div class="m88-company-block-head"><strong>Vínculo territorial</strong><small>${territories.length} relaciones</small></div><div class="m88-territory-list">${territories.map(territoryCard).join('')}</div></div>
    <div class="m88-company-block m88-company-meta"><div><span class="m88-panel-label">Sede / referencia</span><p>${escapeHtml(company.headquarters||'—')}</p></div><div><span class="m88-panel-label">Web</span><p>${company.website?`<a href="${escapeAttr(company.website)}" target="_blank" rel="noopener noreferrer">${escapeHtml(company.website.replace(/^https?:\/\//,''))} ↗</a>`:'—'}</p></div><div><span class="m88-panel-label">Verificación</span><p>${escapeHtml(formatDate(company.verified_at)||'Pendiente')}</p></div></div>
  `;
}

function contactCard(contact){
  const firstPhone = String(contact.phone||'').split('/')[0].replace(/[^+\d]/g,'');
  return `<article class="m88-company-contact ${contact.is_primary?'is-primary':''}"><span class="m88-panel-label">${escapeHtml(contact.department||'Contacto')}</span><h3>${escapeHtml(contact.full_name||'Contacto de departamento')}</h3>${contact.job_title?`<p class="role">${escapeHtml(contact.job_title)}</p>`:''}${contact.email?`<a href="mailto:${escapeAttr(contact.email)}">${escapeHtml(contact.email)}</a>`:''}${contact.phone?`<a href="tel:${escapeAttr(firstPhone)}">${escapeHtml(contact.phone)}</a>`:''}${contact.linkedin_url?`<a href="${escapeAttr(contact.linkedin_url)}" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>`:''}${contact.source_url?`<a href="${escapeAttr(contact.source_url)}" target="_blank" rel="noopener noreferrer">Fuente ↗</a>`:''}${contact.notes?`<span class="notes">${escapeHtml(contact.notes)}</span>`:''}${contact.verified_at?`<span class="m88-company-verified">Verificado ${escapeHtml(formatDate(contact.verified_at))}</span>`:''}</article>`;
}

function territoryCard(item){
  const place = [item.island_name,item.municipality_name].filter(Boolean).join(' · ');
  return `<article class="m88-territory-row ${item.primary_relation?'is-primary':''}"><div><strong>${escapeHtml(place)}</strong><p>${escapeHtml(item.relation_detail||'')}</p></div><span>${escapeHtml(relationLabel(item.relation_type))}</span></article>`;
}

search?.addEventListener('input',()=>{
  const q = search.value.trim().toLocaleLowerCase('es');
  renderCompanies(companyCache.filter(company=>{
    const haystack = [company.company_name,company.sector,company.recommended_entry,...(company.relations||[]).flatMap(r=>[r.detail,r.municipality])].join(' ').toLocaleLowerCase('es');
    return haystack.includes(q);
  }));
});

document.addEventListener('click',event=>{
  if(!companyMode) return;
  const node = event.target.closest?.('.island-node');
  if(!node) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const name = node.getAttribute('aria-label') || '';
  void showIslandCompanies(node.dataset.island,name);
},true);

document.addEventListener('keydown',event=>{
  if(!companyMode || !['Enter',' '].includes(event.key)) return;
  const node = event.target.closest?.('.island-node');
  if(!node) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const name = node.getAttribute('aria-label') || '';
  void showIslandCompanies(node.dataset.island,name);
},true);

function statusLabel(value){return ({sin_contactar:'Sin contactar',contactada:'Contactada',respuesta:'Respuesta',reunion:'Reunión',propuesta:'Propuesta',negociacion:'En negociación',cerrada:'Cerrada',descartada:'Descartada'})[value]||'Sin contactar';}
function relationLabel(value){return ({origen:'Origen',sede:'Sede',arraigo:'Arraigo',fabrica:'Fábrica',delegacion:'Delegación',fundacion:'Fundación',implantacion:'Implantación'})[value]||value||'Vínculo';}
function formatDate(value){const [y,m,d]=String(value||'').slice(0,10).split('-');return y&&m&&d?`${d}/${m}/${y}`:String(value||'');}
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function escapeAttr(value){return escapeHtml(value);}
