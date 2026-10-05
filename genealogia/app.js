import { supabase } from '../supabase-client.js';
import { startWorkspace, state, setPage, renderPeople } from './workspace.js';
const $=id=>document.getElementById(id);
const loginAlias='28081988', adminAccount='info@enriquerodda.com';
const resolveAccount=value=>value.trim()===loginAlias?adminAccount:value.trim();
let recovery=false;
$('username').type='text';$('username').inputMode='text';$('username').placeholder='Usuario o correo';document.querySelector('label[for="username"]').textContent='Usuario';
const classicLink=document.createElement('a');
classicLink.href='./arbol/';classicLink.className='secondary';classicLink.textContent='↗ Vista clásica';classicLink.setAttribute('aria-label','Abrir la vista clásica del árbol genealógico');
classicLink.style.cssText='display:inline-flex;align-items:center;justify-content:center;text-decoration:none;';
document.querySelector('#page-tree .tree-focus')?.append(classicLink);
function addDossierLinks(){
 if(document.getElementById('familyDossierLink'))return;
 const link=document.createElement('a');link.id='familyDossierLink';link.href='./expediente/';link.className='navbtn';link.textContent='▣ Expediente familiar';link.style.cssText='display:flex;align-items:center;width:100%;text-decoration:none;';link.setAttribute('aria-label','Abrir el expediente privado de investigación Darias Morales');
 document.querySelector('.side-nav [data-page="tasks"]')?.insertAdjacentElement('afterend',link);
 const shortcut=document.createElement('a');shortcut.href='./expediente/';shortcut.className='secondary';shortcut.textContent='▣ Abrir expediente familiar →';shortcut.style.cssText='display:inline-flex;align-items:center;justify-content:center;text-decoration:none;';
 document.querySelector('#page-tasks .toolbar')?.append(shortcut);
 const letters=document.createElement('a');letters.id='familyLettersLink';letters.href='./cartas/';letters.className='navbtn';letters.textContent='✉ Cartas de Enrique y Margarita';letters.style.cssText='display:flex;align-items:center;width:100%;text-decoration:none;';letters.setAttribute('aria-label','Abrir archivo epistolar privado de Enrique y Margarita');
 link.insertAdjacentElement('afterend',letters);
 const houses=document.createElement('a');houses.id='familyHousesLink';houses.href='./casas/';houses.className='navbtn';houses.textContent='⌂ Casas de la familia';houses.style.cssText='display:flex;align-items:center;width:100%;text-decoration:none;';houses.setAttribute('aria-label','Abrir casas familiares y personas vinculadas');
 letters.insertAdjacentElement('afterend',houses);
 const mobileLetters=document.createElement('a');mobileLetters.id='mobileFamilyLettersLink';mobileLetters.href='./cartas/';mobileLetters.className='navbtn';mobileLetters.style.textDecoration='none';mobileLetters.setAttribute('aria-label','Abrir las cartas privadas de Enrique y Margarita');
 const mobileIcon=document.createElement('span');mobileIcon.textContent='✉';mobileIcon.setAttribute('aria-hidden','true');mobileLetters.append(mobileIcon,document.createTextNode('Cartas'));
 document.querySelector('#mobileNav [data-page="tree"]')?.insertAdjacentElement('afterend',mobileLetters);
 const mobileHouses=document.createElement('a');mobileHouses.id='mobileFamilyHousesLink';mobileHouses.href='./casas/';mobileHouses.className='navbtn';mobileHouses.style.textDecoration='none';mobileHouses.setAttribute('aria-label','Abrir las casas de la familia');
 const houseIcon=document.createElement('span');houseIcon.textContent='⌂';houseIcon.setAttribute('aria-hidden','true');mobileHouses.append(houseIcon,document.createTextNode('Casas'));
 mobileLetters.insertAdjacentElement('afterend',mobileHouses);
 const lettersShortcut=document.createElement('a');lettersShortcut.href='./cartas/';lettersShortcut.className='secondary';lettersShortcut.textContent='✉ Abrir cartas de Enrique y Margarita →';lettersShortcut.style.cssText='display:inline-flex;align-items:center;justify-content:center;text-decoration:none;';
 document.querySelector('#page-tasks .toolbar')?.append(lettersShortcut);
 const houseShortcut=document.createElement('a');houseShortcut.href='./casas/';houseShortcut.className='secondary';houseShortcut.textContent='⌂ Abrir casas de la familia →';houseShortcut.style.cssText='display:inline-flex;align-items:center;justify-content:center;text-decoration:none;';
 document.querySelector('#page-tasks .toolbar')?.append(houseShortcut);
}
function showApp(active){$('authPage').hidden=active;$('appShell').hidden=!active;$('mobileNav').hidden=!active;}
async function check(session){if(!session?.user){showApp(false);return;}if(recovery){$('loginArea').hidden=true;$('recoveryArea').hidden=false;showApp(false);return;}const {data,error}=await supabase.rpc('gen_is_admin');if(error||data!==true){showApp(false);$('loginStatus').textContent='Esta cuenta no tiene permiso de administrador.';return;}showApp(true);await startWorkspace(supabase);addDossierLinks();const linked=new URLSearchParams(location.search).get('person');if(linked&&state.people.some(p=>p.id===linked)){state.selected=linked;state.focus=linked;setPage('people');renderPeople();}}
$('loginForm').onsubmit=async e=>{e.preventDefault();let btn=e.target.querySelector('button');btn.disabled=true;$('loginStatus').textContent='Comprobando acceso…';try{const {data,error}=await supabase.auth.signInWithPassword({email:resolveAccount($('username').value),password:$('password').value});if(error||!data?.session){$('loginStatus').textContent='Usuario o contraseña incorrectos. Puedes recuperar la contraseña por correo.';return;}$('password').value='';$('loginStatus').textContent='';await check(data.session);}catch(err){$('loginStatus').textContent='No se pudo conectar.';console.error(err);}finally{btn.disabled=false;}};
$('recoverButton').onclick=async()=>{const account=resolveAccount($('username').value);if(!account.includes('@')){$('recoverStatus').textContent='Introduce tu usuario o tu correo de administrador.';return;}const btn=$('recoverButton');btn.disabled=true;try{const {error}=await supabase.auth.resetPasswordForEmail(account,{redirectTo:new URL('./',location.href).href});$('recoverStatus').textContent=error?'No se pudo enviar el enlace.':'Revisa tu correo para establecer una nueva contraseña.';}catch(err){$('recoverStatus').textContent='Error de conexión.';}finally{btn.disabled=false;}};
$('recoveryForm').onsubmit=async e=>{e.preventDefault();const password=$('newPassword').value;if(password!==$('confirmPassword').value){$('recoveryStatus').textContent='Las contraseñas no coinciden.';return;}const {error}=await supabase.auth.updateUser({password});if(error){$('recoveryStatus').textContent=error.message;return;}recovery=false;await supabase.auth.signOut();$('recoveryArea').hidden=true;$('loginArea').hidden=false;$('loginStatus').textContent='Contraseña actualizada. Inicia sesión.';};
async function logout(){await supabase.auth.signOut();showApp(false);$('loginStatus').textContent='Sesión cerrada.';}
$('sidebarLogout').onclick=logout;$('topLogout').onclick=logout;
supabase.auth.onAuthStateChange((event,session)=>{if(event==='PASSWORD_RECOVERY'){recovery=true;$('recoveryArea').hidden=false;$('loginArea').hidden=true;showApp(false);return;}queueMicrotask(()=>check(session));});
const {data}=await supabase.auth.getSession();await check(data.session);