export const SUPABASE_URL = 'https://kvoldyeinvjajsimxmyc.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_AjQQNYKbCwaGNv_o1GopAw_TzyLkHXh';

const PRIVATE_API = `${SUPABASE_URL}/functions/v1/m88-private-api`;
const TOKEN_KEY = 'de8_m88_private_session';
const nativeFetch = typeof window !== 'undefined' ? window.fetch.bind(window) : null;
let accessResolve;
let accessReady = new Promise(resolve => { accessResolve = resolve; });
let gateMounted = false;

if (typeof document !== 'undefined' && nativeFetch) {
  installPrivateFetchProxy();
  installGateStyles();
  void ensurePrivateAccess();

  import('./agenda.js?v=20260910-private1').catch(error=>console.warn('Agenda no disponible',error));
  import('./municipal-map.js?v=20260910-private1').catch(error=>console.warn('Mapa municipal no disponible',error));
  import('./companies.js?v=20260911-private1').catch(error=>console.warn('Devolución Cultural no disponible',error));
}

function installPrivateFetchProxy(){
  if(window.__de8M88PrivateFetchInstalled) return;
  window.__de8M88PrivateFetchInstalled = true;

  window.fetch = async function(input, init = {}){
    const source = input instanceof Request ? input.url : String(input);
    let url;
    try { url = new URL(source, window.location.href); } catch { return nativeFetch(input, init); }

    const match = url.origin === SUPABASE_URL && url.pathname.match(/^\/rest\/v1\/(m88_[a-z0-9_]+)$/i);
    if(!match) return nativeFetch(input, init);

    await accessReady;
    return privateRestFetch(match[1], url.searchParams, input, init, true);
  };
}

async function privateRestFetch(table, params, input, init, allowRetry){
  const token = getToken();
  if(!token){
    resetAccessPromise();
    await ensurePrivateAccess();
    await accessReady;
  }

  const endpoint = new URL(PRIVATE_API);
  endpoint.searchParams.set('table', table);
  for(const [key,value] of params.entries()) endpoint.searchParams.append(key,value);

  const sourceHeaders = new Headers(input instanceof Request ? input.headers : undefined);
  const initHeaders = new Headers(init?.headers || undefined);
  initHeaders.forEach((value,key)=>sourceHeaders.set(key,value));
  sourceHeaders.delete('apikey');
  sourceHeaders.set('Authorization', `Bearer ${getToken() || ''}`);
  sourceHeaders.set('Accept', 'application/json');

  const response = await nativeFetch(endpoint.toString(), {
    method:'GET',
    headers:sourceHeaders,
    cache:'no-store',
    credentials:'omit'
  });

  if(response.status === 401 && allowRetry){
    clearToken();
    resetAccessPromise();
    await ensurePrivateAccess();
    await accessReady;
    return privateRestFetch(table, params, input, init, false);
  }
  return response;
}

function resetAccessPromise(){
  accessReady = new Promise(resolve => { accessResolve = resolve; });
}

function getToken(){
  try { return sessionStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
}

function saveToken(token){
  try { sessionStorage.setItem(TOKEN_KEY, token); } catch {}
}

function clearToken(){
  try { sessionStorage.removeItem(TOKEN_KEY); } catch {}
}

async function ensurePrivateAccess(){
  const existing = getToken();
  if(existing){
    try{
      const check = await nativeFetch(`${PRIVATE_API}?check=1`, {
        headers:{Authorization:`Bearer ${existing}`},
        cache:'no-store',
        credentials:'omit'
      });
      if(check.ok){
        unlock(existing);
        return true;
      }
    }catch{}
    clearToken();
  }

  mountGate();
  return false;
}

function installGateStyles(){
  if(document.getElementById('de8M88GateStyles')) return;
  const style = document.createElement('style');
  style.id = 'de8M88GateStyles';
  style.textContent = `
    html.m88-auth-locked,html.m88-auth-locked body{min-height:100%;background:#030303!important;overflow:hidden!important}
    html.m88-auth-locked body>.noise,html.m88-auth-locked body>.app{visibility:hidden!important;pointer-events:none!important}
    .m88-auth-gate{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 50% 40%,rgba(255,205,0,.055),transparent 30%),#030303;color:#fff;font-family:"Open Sans",Arial,sans-serif}
    .m88-auth-box{width:min(92vw,420px);padding:34px 30px 30px;border:1px solid rgba(255,255,255,.12);border-radius:24px;background:#090909;box-shadow:0 30px 100px rgba(0,0,0,.6)}
    .m88-auth-kicker{margin:0 0 12px;color:#FFCD00;font:600 10px/1.2 "Work Sans",Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase}
    .m88-auth-box h1{margin:0 0 10px;color:#fff;font:600 clamp(28px,8vw,38px)/1 "Work Sans",Arial,sans-serif;letter-spacing:-.045em}
    .m88-auth-copy{margin:0 0 24px;color:rgba(255,255,255,.58);font-size:12px;line-height:1.6}
    .m88-auth-form{display:grid;gap:10px}
    .m88-auth-input{width:100%;min-height:52px;padding:0 15px;border:1px solid rgba(255,255,255,.16);border-radius:13px;background:#030303;color:#fff;font:500 16px/1 "Work Sans",Arial,sans-serif;outline:none}
    .m88-auth-input:focus{border-color:rgba(255,205,0,.7);box-shadow:0 0 0 3px rgba(255,205,0,.06)}
    .m88-auth-submit{min-height:50px;border:0;border-radius:13px;background:#FFCD00;color:#000;font:700 13px/1 "Work Sans",Arial,sans-serif;cursor:pointer}
    .m88-auth-submit:disabled{opacity:.55;cursor:wait}
    .m88-auth-error{min-height:18px;margin:3px 0 0;color:#ff7272;font-size:11px;line-height:1.45}
    .m88-auth-foot{margin:18px 0 0;padding-top:16px;border-top:1px solid rgba(255,255,255,.07);color:rgba(255,255,255,.35);font-size:9px;line-height:1.55}
  `;
  document.head.appendChild(style);
  document.documentElement.classList.add('m88-auth-locked');
}

function mountGate(){
  document.documentElement.classList.add('m88-auth-locked');
  if(gateMounted && document.getElementById('m88AuthGate')) return;
  gateMounted = true;

  const gate = document.createElement('div');
  gate.className = 'm88-auth-gate';
  gate.id = 'm88AuthGate';
  gate.innerHTML = `
    <div class="m88-auth-box">
      <p class="m88-auth-kicker">Área privada · DE8 Films</p>
      <h1>Mapa comercial.</h1>
      <p class="m88-auth-copy">Acceso restringido al equipo. Introduce la contraseña para abrir el panel comercial.</p>
      <form class="m88-auth-form" id="m88AuthForm" autocomplete="off">
        <input class="m88-auth-input" id="m88AuthPassword" type="password" name="password" placeholder="Contraseña" autocomplete="current-password" required autofocus>
        <button class="m88-auth-submit" id="m88AuthSubmit" type="submit">Entrar</button>
        <p class="m88-auth-error" id="m88AuthError" aria-live="polite"></p>
      </form>
      <p class="m88-auth-foot">Sesión privada de 12 horas. Los datos comerciales no se sirven sin una sesión válida.</p>
    </div>`;
  document.body.appendChild(gate);

  const form = gate.querySelector('#m88AuthForm');
  const input = gate.querySelector('#m88AuthPassword');
  const submit = gate.querySelector('#m88AuthSubmit');
  const error = gate.querySelector('#m88AuthError');

  form.addEventListener('submit', async event=>{
    event.preventDefault();
    const password = String(input.value || '');
    if(!password) return;
    submit.disabled = true;
    submit.textContent = 'Comprobando…';
    error.textContent = '';
    try{
      const response = await nativeFetch(PRIVATE_API, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({password}),
        cache:'no-store',
        credentials:'omit'
      });
      const payload = await response.json().catch(()=>({}));
      if(!response.ok || !payload.token) throw new Error(payload.error || 'No se pudo iniciar sesión');
      saveToken(payload.token);
      input.value = '';
      unlock(payload.token);
    }catch(err){
      error.textContent = err?.message || 'No se pudo iniciar sesión';
      input.select();
    }finally{
      submit.disabled = false;
      submit.textContent = 'Entrar';
    }
  });
  setTimeout(()=>input?.focus(),0);
}

function unlock(token){
  if(token) saveToken(token);
  document.documentElement.classList.remove('m88-auth-locked');
  const gate = document.getElementById('m88AuthGate');
  if(gate) gate.remove();
  gateMounted = false;
  if(accessResolve) accessResolve(true);
  void refreshHomeContacted();
}

async function refreshHomeContacted(){
  const list = document.getElementById('homeContactedList');
  if(!list) return;
  try{
    const response = await window.fetch(`${SUPABASE_URL}/rest/v1/m88_contacted_municipalities?select=municipality_name,island_name&order=municipality_name.asc`, {cache:'no-store'});
    if(!response.ok) return;
    const data = await response.json();
    if(!Array.isArray(data) || !data.length){
      list.innerHTML = '<span class="home-contacted-empty">Aún no hay municipios contactados.</span>';
      return;
    }
    list.innerHTML = data.map(item=>`<span class="home-contacted-item"><strong>${escapeHtml(item.municipality_name||'')}</strong><span>${escapeHtml(item.island_name||'')}</span></span>`).join('');
  }catch(error){console.warn('Resumen comercial no disponible',error)}
}

function escapeHtml(value){
  return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
