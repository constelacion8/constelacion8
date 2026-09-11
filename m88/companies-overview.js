const API = 'https://kvoldyeinvjajsimxmyc.supabase.co/functions/v1/m88-companies-api';
const TOKEN_KEY = 'de8_m88_private_session';
const CONTACTED_STATUSES = new Set(['contactada','respuesta','reunion','propuesta','negociacion','cerrada']);

const mapSection = document.getElementById('mapSection');
const homeContacted = document.getElementById('homeContacted');

if (mapSection && !document.getElementById('m88ContactedCompanies')) {
  installStyles();

  const section = document.createElement('section');
  section.id = 'm88ContactedCompanies';
  section.className = 'm88-contacted-companies';
  section.hidden = true;
  section.innerHTML = `
    <div class="m88-contacted-companies-head">
      <h2>Empresas contactadas.</h2>
      <span id="m88ContactedCompaniesCount">0 empresas</span>
    </div>
    <div class="m88-contacted-companies-list" id="m88ContactedCompaniesList">
      <span class="m88-contacted-companies-empty">Aún no hay empresas contactadas.</span>
    </div>
  `;

  if (homeContacted) homeContacted.insertAdjacentElement('afterend', section);
  else mapSection.appendChild(section);

  let loadingPromise = null;
  let loadedAt = 0;

  const sync = () => {
    const active = document.body.classList.contains('m88-company-mode');
    section.hidden = !active;
    if (active && Date.now() - loadedAt > 5000) void loadOverview();
  };

  new MutationObserver(sync).observe(document.body, {attributes:true, attributeFilter:['class']});
  document.querySelectorAll('.m88-mode-button').forEach(button => {
    button.addEventListener('click', () => queueMicrotask(sync));
  });

  sync();

  async function loadOverview(){
    if (loadingPromise) return loadingPromise;
    loadingPromise = (async () => {
      const list = document.getElementById('m88ContactedCompaniesList');
      const count = document.getElementById('m88ContactedCompaniesCount');
      if (!list || !count) return;

      const token = getToken();
      if (!token) {
        list.innerHTML = '<span class="m88-contacted-companies-empty">La sesión privada aún no está disponible.</span>';
        return;
      }

      list.innerHTML = '<span class="m88-contacted-companies-empty">Cargando empresas contactadas…</span>';

      const islandNames = [...new Set(
        [...document.querySelectorAll('.island-node')]
          .map(node => node.getAttribute('aria-label'))
          .filter(Boolean)
      )];

      const results = await Promise.allSettled(islandNames.map(name => loadIsland(name, token)));
      const companies = new Map();

      results.forEach(result => {
        if (result.status !== 'fulfilled') return;
        (result.value || []).forEach(company => {
          if (!company?.company_id || !CONTACTED_STATUSES.has(company.sales_status)) return;
          const previous = companies.get(company.company_id);
          if (!previous || statusRank(company.sales_status) > statusRank(previous.sales_status)) {
            companies.set(company.company_id, company);
          }
        });
      });

      const items = [...companies.values()].sort((a,b) => {
        const rank = statusRank(b.sales_status) - statusRank(a.sales_status);
        return rank || String(a.company_name || '').localeCompare(String(b.company_name || ''), 'es');
      });

      count.textContent = `${items.length} ${items.length === 1 ? 'empresa' : 'empresas'}`;
      if (!items.length) {
        list.innerHTML = '<span class="m88-contacted-companies-empty">Aún no hay empresas contactadas.</span>';
      } else {
        list.innerHTML = items.map(company => `
          <span class="m88-contacted-company-item">
            <strong>${escapeHtml(company.company_name || 'Empresa')}</strong>
            <span>${escapeHtml(statusLabel(company.sales_status))}</span>
          </span>
        `).join('');
      }
      loadedAt = Date.now();
    })().catch(error => {
      const list = document.getElementById('m88ContactedCompaniesList');
      if (list) list.innerHTML = `<span class="m88-contacted-companies-empty">No se pudo cargar el resumen de empresas.</span>`;
      console.warn('Resumen de empresas contactadas no disponible', error);
    }).finally(() => {
      loadingPromise = null;
    });
    return loadingPromise;
  }
}

async function loadIsland(name, token){
  const url = new URL(API);
  url.searchParams.set('action', 'island');
  url.searchParams.set('island', name);
  const response = await fetch(url.toString(), {
    headers:{Authorization:`Bearer ${token}`},
    cache:'no-store',
    credentials:'omit'
  });
  if (!response.ok) return [];
  const payload = await response.json().catch(() => ({}));
  return Array.isArray(payload.companies) ? payload.companies : [];
}

function getToken(){
  try { return sessionStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
}

function statusRank(value){
  return ({contactada:1,respuesta:2,reunion:3,propuesta:4,negociacion:5,cerrada:6})[value] || 0;
}

function statusLabel(value){
  return ({contactada:'Contactada',respuesta:'Respuesta',reunion:'Reunión',propuesta:'Propuesta',negociacion:'En negociación',cerrada:'Cerrada'})[value] || 'Contactada';
}

function escapeHtml(value){
  return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

function installStyles(){
  if (document.getElementById('m88CompaniesOverviewStyles')) return;
  const style = document.createElement('style');
  style.id = 'm88CompaniesOverviewStyles';
  style.textContent = `
    .m88-contacted-companies{position:relative;z-index:4;width:min(92vw,1160px);margin:26px auto 0;padding-top:24px;border-top:1px solid rgba(255,255,255,.08)}
    .m88-contacted-companies[hidden]{display:none!important}
    .m88-contacted-companies-head{display:flex;align-items:center;justify-content:center;gap:10px;margin:0 0 14px;text-align:center}
    .m88-contacted-companies h2{margin:0;font:600 14px/1.2 "Work Sans",Arial,sans-serif;letter-spacing:-.01em;color:#fff}
    .m88-contacted-companies-head>span{color:#FFCD00;font:600 8px/1 "Work Sans",Arial,sans-serif;text-transform:uppercase;letter-spacing:.08em}
    .m88-contacted-companies-list{display:flex;flex-wrap:wrap;justify-content:center;gap:8px}
    .m88-contacted-company-item{display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(255,255,255,.12);border-radius:999px;background:#050505;padding:9px 12px}
    .m88-contacted-company-item strong{font:600 11px "Work Sans",Arial,sans-serif;color:#fff}
    .m88-contacted-company-item span{font:500 8px "Work Sans",Arial,sans-serif;text-transform:uppercase;letter-spacing:.08em;color:#FFCD00}
    .m88-contacted-companies-empty{display:block;width:100%;text-align:center;color:#6f6f6f;font-size:11px}
    @media(max-width:760px){
      .hero-intro .m88-mode-switch{position:relative;left:50%;transform:translateX(-50%);margin-top:18px}
      .m88-contacted-companies{width:90vw;margin-top:16px;padding-top:20px}
      .m88-contacted-companies-head{margin-bottom:12px}
      .m88-contacted-companies h2{font-size:13px}
      .m88-contacted-companies-list{gap:7px}
      .m88-contacted-company-item{padding:8px 10px}
      .m88-contacted-company-item strong{font-size:10px}
      .m88-contacted-company-item span{font-size:7px}
    }
  `;
  document.head.appendChild(style);
}
