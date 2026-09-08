import { islands } from './data.js';
import { supabase, isConfigured } from './supabase-client.js';

const SESSION_KEY = 'de8-commercial-map-session';
const usernameInput = document.getElementById('loginUsername') || document.getElementById('loginEmail');
if(usernameInput){
  usernameInput.id = 'loginUsername';
  usernameInput.type = 'text';
  usernameInput.setAttribute('autocapitalize','none');
  usernameInput.setAttribute('spellcheck','false');
  const label = usernameInput.closest('label');
  if(label?.firstChild) label.firstChild.textContent = 'Usuario\n          ';
}
const authScreen = document.getElementById('authScreen');
const app = document.getElementById('app');
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const mapSection = document.getElementById('mapSection');
const directorySection = document.getElementById('directorySection');
const contactSection = document.getElementById('contactSection');
const grid = document.getElementById('municipalityGrid');
const search = document.getElementById('municipalitySearch');
let activeIsland = null;

const passwordButton = document.createElement('button');
passwordButton.type = 'button';
passwordButton.textContent = 'Cambiar contraseña';
passwordButton.hidden = true;
passwordButton.setAttribute('aria-label','Cambiar contraseña');
Object.assign(passwordButton.style,{
  position:'fixed',right:'18px',bottom:'18px',zIndex:'90',border:'1px solid #FFCD00',
  borderRadius:'999px',padding:'11px 15px',background:'#000',color:'#FFCD00',
  font:'600 10px Work Sans, sans-serif',letterSpacing:'.09em',textTransform:'uppercase',
  boxShadow:'0 14px 40px rgba(0,0,0,.45)'
});
document.body.appendChild(passwordButton);

function getToken(){ return sessionStorage.getItem(SESSION_KEY) || ''; }
function setToken(token){ token ? sessionStorage.setItem(SESSION_KEY, token) : sessionStorage.removeItem(SESSION_KEY); }

function setAuthenticated(authenticated){
  authScreen.hidden = authenticated;
  app.hidden = !authenticated;
  passwordButton.hidden = !authenticated;
  if(authenticated) showMap();
}

function setLoginMessage(message, error=false){
  loginMessage.textContent = message;
  loginMessage.classList.toggle('error', error);
}

async function validateToken(token){
  if(!token || !supabase) return false;
  const { data, error } = await supabase.rpc('mc_validate_session', { p_token: token });
  return !error && Boolean(data?.[0]?.valid);
}

async function initializeAuth(){
  if(!isConfigured){
    setLoginMessage('No se pudo conectar con la base privada.', true);
    loginForm.querySelector('button').disabled = true;
    return;
  }
  const token = getToken();
  if(token && await validateToken(token)){
    setAuthenticated(true);
  }else{
    setToken('');
    setAuthenticated(false);
  }
}

loginForm.addEventListener('submit', async (event)=>{
  event.preventDefault();
  if(!supabase) return;
  setLoginMessage('Comprobando acceso…');
  const username = document.getElementById('loginUsername').value.trim().toLocaleLowerCase('es');
  const password = document.getElementById('loginPassword').value;
  const button = loginForm.querySelector('button');
  button.disabled = true;
  try{
    const { data, error } = await supabase.rpc('mc_login', { p_username: username, p_password: password });
    const row = data?.[0];
    if(error || !row?.session_token){
      setLoginMessage('Usuario o contraseña incorrectos.', true);
      return;
    }
    setToken(row.session_token);
    loginForm.reset();
    setLoginMessage('');
    setAuthenticated(true);
  }finally{
    button.disabled = false;
  }
});

passwordButton.addEventListener('click', async()=>{
  if(!supabase) return;
  const token = getToken();
  if(!token || !(await validateToken(token))){
    setToken('');
    setAuthenticated(false);
    setLoginMessage('La sesión ha caducado. Vuelve a acceder.', true);
    return;
  }
  const newPassword = window.prompt('Nueva contraseña (mínimo 8 caracteres):');
  if(newPassword === null) return;
  if(newPassword.length < 8 || newPassword.length > 64){
    window.alert('La contraseña debe tener entre 8 y 64 caracteres.');
    return;
  }
  const confirmation = window.prompt('Repite la nueva contraseña:');
  if(confirmation === null) return;
  if(newPassword !== confirmation){
    window.alert('Las contraseñas no coinciden.');
    return;
  }
  passwordButton.disabled = true;
  try{
    const { data, error } = await supabase.rpc('mc_change_password', { p_token: token, p_new_password: newPassword });
    if(error || data !== true){
      window.alert('No se pudo cambiar la contraseña.');
      return;
    }
    setToken('');
    setAuthenticated(false);
    setLoginMessage('Contraseña actualizada. Vuelve a entrar con la nueva.');
    window.alert('Contraseña actualizada correctamente.');
  }finally{
    passwordButton.disabled = false;
  }
});

document.getElementById('logoutButton').addEventListener('click', async()=>{
  const token = getToken();
  setToken('');
  setAuthenticated(false);
  if(supabase && token) await supabase.rpc('mc_logout', { p_token: token });
});

document.getElementById('homeButton').addEventListener('click', showMap);
document.getElementById('mapNav').addEventListener('click', showMap);
document.getElementById('municipalitiesNav').addEventListener('click', ()=> activeIsland ? showIsland(activeIsland.slug) : showMap());
document.getElementById('backToMap').addEventListener('click', showMap);
document.getElementById('backToMunicipalities').addEventListener('click', ()=>activeIsland && showIsland(activeIsland.slug));

function showMap(){
  mapSection.hidden = false; directorySection.hidden = true; contactSection.hidden = true;
  window.scrollTo({top:0,behavior:'smooth'});
}

function showIsland(slug){
  activeIsland = islands.find(i=>i.slug===slug);
  if(!activeIsland) return;
  mapSection.hidden = true; directorySection.hidden = false; contactSection.hidden = true;
  document.getElementById('islandEyebrow').textContent = 'Isla · Directorio institucional';
  document.getElementById('islandTitle').textContent = activeIsland.name;
  document.getElementById('islandCount').textContent = activeIsland.municipalities.length ? `${activeIsland.municipalities.length} municipios · orden alfabético` : activeIsland.note;
  search.value=''; renderMunicipalities(activeIsland.municipalities);
  window.scrollTo({top:0,behavior:'smooth'});
}

function renderMunicipalities(list){
  grid.innerHTML = list.length ? list.map((name,index)=>`<button class="municipality-card" data-name="${escapeAttr(name)}"><small>${String(index+1).padStart(2,'0')}</small><strong>${escapeHtml(name)}</strong><span>Ver contactos →</span></button>`).join('') : `<div class="contact-empty"><strong>Sin municipio propio</strong><p>${escapeHtml(activeIsland?.note || '')}</p></div>`;
  grid.querySelectorAll('.municipality-card').forEach(card=>card.addEventListener('click',()=>showMunicipality(card.dataset.name)));
}

function showMunicipality(name){
  directorySection.hidden = true; contactSection.hidden = false;
  document.getElementById('municipalityIsland').textContent = activeIsland.name;
  document.getElementById('municipalityTitle').textContent = name;
  void loadContacts(name);
  window.scrollTo({top:0,behavior:'smooth'});
}

async function loadContacts(municipalityName){
  const list = document.getElementById('contactsList');
  const empty = document.getElementById('contactEmpty');
  list.innerHTML=''; empty.hidden=false;
  if(!supabase) return;
  const token = getToken();
  if(!token || !(await validateToken(token))){
    setToken('');
    setAuthenticated(false);
    setLoginMessage('La sesión ha caducado. Vuelve a acceder.', true);
    return;
  }
  const { data, error } = await supabase.rpc('mc_contacts_for_municipality', {
    p_token: token,
    p_municipality: municipalityName
  });
  if(error || !data?.length) return;
  empty.hidden=true;
  list.innerHTML = data.map(c=>`<article class="contact-card"><p class="eyebrow">${escapeHtml(c.area_names || 'Área institucional')}</p><h3>${escapeHtml(c.full_name)}</h3><p>${escapeHtml(c.official_title || '')}</p><p>${c.email ? `<a href="mailto:${escapeAttr(c.email)}">${escapeHtml(c.email)}</a>`:''}${c.phone ? ` · ${escapeHtml(c.phone)}`:''}</p></article>`).join('');
}

search.addEventListener('input', ()=>{
  if(!activeIsland) return;
  const q=search.value.trim().toLocaleLowerCase('es');
  renderMunicipalities(activeIsland.municipalities.filter(name=>name.toLocaleLowerCase('es').includes(q)));
});

document.querySelectorAll('.island-node').forEach(node=>{
  const island=islands.find(i=>i.slug===node.dataset.island);
  node.addEventListener('mouseenter',()=>updateTooltip(island));
  node.addEventListener('focus',()=>updateTooltip(island));
  node.addEventListener('click',()=>showIsland(node.dataset.island));
  node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showIsland(node.dataset.island)}});
});

function updateTooltip(island){
  if(!island) return;
  const t=document.getElementById('mapTooltip');
  t.querySelector('strong').textContent=island.name;
  t.querySelector('small').textContent=island.municipalities.length ? `${island.municipalities.length} municipios` : 'Administración: Teguise';
}

function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function escapeAttr(value){return escapeHtml(value)}

initializeAuth();
