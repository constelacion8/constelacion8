import { supabase } from '../../supabase-client.js';
const $ = id => document.getElementById(id);
const W=211, H=102, GAP=253, ROW=176, TOP=48;
const people=new Map();
let relations=[],focus=null,selected=null,mode='ancestors',generations=4;
let size={width:800,height:600},scale=1,tx=0,ty=0,loading=false;
const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const get=id=>people.get(id);
const dateString=v=>{if(!v)return '';const d=new Date(`${v.slice(0,10)}T12:00:00`);return Number.isNaN(d.getTime())?v:d.toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'});};
function year(p,type){const exact=p[`${type}_date`], yr=p[`${type}_year`],precision=p[`${type}_precision`];if(exact&&precision==='exact')return dateString(exact);if(yr)return `${precision==='approximate'?'c. ':''}${yr}`;return exact?dateString(exact):'Sin datos';}
function lifetime(p){const birth=p.birth_year||(p.birth_date||'').slice(0,4)||'?';const death=p.death_year||(p.death_date||'').slice(0,4)||(p.is_living===true?'actualidad':'?');return `${p.birth_precision==='approximate'?'c. ':''}${birth} – ${p.death_precision==='approximate'?'c. ':''}${death}`;}
const proof={documented:'Documentado',family:'Información familiar',pending:'Pendiente',conflict:'Contradicción'};
const certainty={documented:'Documental',family:'Información familiar',probable:'Probable',pending:'Pendiente',contradictory:'Contradictorio'};
const parentLinks=id=>relations.filter(r=>r.relation_type==='parent'&&r.person_b===id&&get(r.person_a));
const childLinks=id=>relations.filter(r=>r.relation_type==='parent'&&r.person_a===id&&get(r.person_b));
const partnerLinks=id=>relations.filter(r=>r.relation_type==='partner'&&(r.person_a===id||r.person_b===id)).map(r=>({relation:r,other:get(r.person_a===id?r.person_b:r.person_a)})).filter(x=>x.other);
function orderedParents(id){return parentLinks(id).sort((a,b)=>{const s=x=>get(x.person_a)?.sex==='male'?0:get(x.person_a)?.sex==='female'?1:2;return s(a)-s(b)||get(a.person_a).full_name.localeCompare(get(b.person_a).full_name,'es');});}
function orderedChildren(id){return childLinks(id).sort((a,b)=>{const x=get(a.person_b),y=get(b.person_b);const dx=x.birth_date||String(x.birth_year||'9999'),dy=y.birth_date||String(y.birth_year||'9999');return dx.localeCompare(dy)||x.full_name.localeCompare(y.full_name,'es');});}
function isTentative(r){return ['probable','pending','contradictory','conflict'].includes(r?.certainty);}
function layout(){const nodes=[],edges=[];let leaf=0,seq=0;const limit=mode==='family'?1:generations;
  const makeUp=(id,depth,path)=>{const node={key:`n${++seq}`,id,depth,x:0,y:TOP+(limit-depth)*ROW,kind:'ancestor'};nodes.push(node);
    const prs=depth<limit&&!path.has(id)?orderedParents(id):[];const links=prs.map(rel=>({rel,node:makeUp(rel.person_a,depth+1,new Set([...path,id]))}));
    if(links.length){node.x=links.reduce((sum,x)=>sum+x.node.x,0)/links.length;for(const x of links)edges.push({from:x.node,to:node,rel:x.rel});}
    else node.x=leaf++*GAP;
    return node;};
  const makeDown=(id,depth,path)=>{const node={key:`n${++seq}`,id,depth,x:0,y:TOP+depth*ROW,kind:'descendant'};nodes.push(node);
    const kids=depth<generations&&!path.has(id)?orderedChildren(id):[];const links=kids.map(rel=>({rel,node:makeDown(rel.person_b,depth+1,new Set([...path,id]))}));
    if(links.length){node.x=links.reduce((sum,x)=>sum+x.node.x,0)/links.length;for(const x of links)edges.push({from:node,to:x.node,rel:x.rel});}
    else node.x=leaf++*GAP;
    return node;};
  const root=mode==='descendants'?makeDown(focus,0,new Set()):makeUp(focus,0,new Set());
  if(mode!=='descendants'){
    const kids=orderedChildren(focus),n=kids.length;
    kids.forEach((rel,i)=>{const node={key:`n${++seq}`,id:rel.person_b,depth:-1,x:root.x+(i-(n-1)/2)*GAP,y:root.y+ROW,kind:'child'};nodes.push(node);edges.push({from:root,to:node,rel});});
  }
  const knownPartners=partnerLinks(focus);
  // Partners are shown next to the focus; their connection to children is NEVER inferred.
  knownPartners.forEach((link,i)=>{const node={key:`n${++seq}`,id:link.other.id,depth:0,x:root.x+(i+1)*GAP,y:root.y,kind:'partner'};nodes.push(node);edges.push({from:root,to:node,rel:link.relation,partner:true});});
  const minX=Math.min(...nodes.map(n=>n.x)),minY=Math.min(...nodes.map(n=>n.y));
  for(const n of nodes){n.x+=54-minX;n.y+=52-minY;}
  const width=Math.max(560,Math.max(...nodes.map(n=>n.x))+W+65);
  const height=Math.max(360,Math.max(...nodes.map(n=>n.y))+H+70);
  return {nodes,edges,width,height};
}
function line(svg,from,to,rel,partner=false){const path=document.createElementNS('http://www.w3.org/2000/svg','path');let d;
  if(partner){const y=from.y+H/2;d=`M ${from.x+W} ${y} L ${to.x} ${to.y+H/2}`;}
  else{const a=from.x+W/2,b=to.x+W/2,y1=from.y+H,y2=to.y,mid=(y1+y2)/2;d=`M ${a} ${y1} V ${mid} H ${b} V ${y2}`;}
  path.setAttribute('d',d);path.setAttribute('fill','none');path.setAttribute('stroke',partner?'#b18d59':'#999187');path.setAttribute('stroke-width',partner?'2.5':'2');path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');if(isTentative(rel))path.setAttribute('stroke-dasharray','6 5');svg.append(path);
}
function renderPanel(){const p=get(selected);if(!p){$('personPanel').innerHTML='<p>Selecciona una persona para consultar su ficha.</p>';return;}
  const links=(title,rows,key)=>`<div class="relatives"><h3>${title} (${rows.length})</h3>${rows.map(r=>{const other=get(r[key]);return other?`<button data-relative="${escapeHTML(other.id)}" type="button">${escapeHTML(other.full_name)} ↗</button>`:'';}).join('')||'<p>No constan.</p>'}</div>`;
  const partners=partnerLinks(p.id).map(x=>({id:x.other.id}));
  $('personPanel').innerHTML=`<div class="eyebrow">PERSONA SELECCIONADA</div><h2>${escapeHTML(p.full_name)}</h2>${p.aliases?`<p>${escapeHTML(p.aliases)}</p>`:''}<span class="tag">${escapeHTML(proof[p.verification]||'Sin verificar')}</span>${p.is_living===true?'<span class="tag">Vive</span>':p.is_living===false?'<span class="tag">Fallecido/a</span>':''}<dl><dt>Nacimiento</dt><dd>${escapeHTML(year(p,'birth'))}<br>${escapeHTML(p.birth_place||'Lugar no registrado')}</dd><dt>Defunción</dt><dd>${p.is_living===true?'—':escapeHTML(year(p,'death'))}<br>${escapeHTML(p.death_place||'Lugar no registrado')}</dd>${p.research_notes?`<dt>Notas de investigación</dt><dd>${escapeHTML(p.research_notes)}</dd>`:''}</dl><div class="buttons"><button class="emphasized" id="centerSelected" type="button">Centrar en esta persona</button><a href="../?person=${encodeURIComponent(p.id)}">Abrir ficha completa ↗</a></div>${links('Padres y madres',orderedParents(p.id),'person_a')}${links('Parejas',partners,'id')}${links('Hijos e hijas',orderedChildren(p.id),'person_b')}`;
  $('centerSelected').onclick=()=>setFocus(p.id);
  $('personPanel').querySelectorAll('[data-relative]').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.relative;renderPanel();highlight();}));
}
function highlight(){$('cards').querySelectorAll('.tree-node').forEach(b=>b.classList.toggle('selected',b.dataset.id===selected));}
function transform(){ $('stage').style.transform=`translate(${tx}px,${ty}px) scale(${scale})`;$('zoomLabel').textContent=`${Math.round(scale*100)} %`;}
function fit(){const box=$('viewport');if(!box.clientWidth||!size.width)return;scale=Math.max(.12,Math.min(1.15,(box.clientWidth-70)/size.width,(box.clientHeight-80)/size.height));tx=(box.clientWidth-size.width*scale)/2;ty=(box.clientHeight-size.height*scale)/2;transform();}
function zoom(factor,cx=$('viewport').clientWidth/2,cy=$('viewport').clientHeight/2){const old=scale;scale=Math.max(.12,Math.min(2.6,scale*factor));tx=cx-(cx-tx)*scale/old;ty=cy-(cy-ty)*scale/old;transform();}
function render(){if(!get(focus)){ $('treeStatus').textContent='No hay una persona central disponible.';return;}
  const model=layout();size={width:model.width,height:model.height};const stage=$('stage');stage.style.width=`${size.width}px`;stage.style.height=`${size.height}px`;
  const svg=$('connections');svg.replaceChildren();svg.setAttribute('width',size.width);svg.setAttribute('height',size.height);svg.setAttribute('viewBox',`0 0 ${size.width} ${size.height}`);
  model.edges.forEach(e=>line(svg,e.from,e.to,e.rel,e.partner));
  $('cards').innerHTML=model.nodes.map(n=>{const p=get(n.id),approx=p.birth_precision==='approximate'||p.death_precision==='approximate',root=n.id===focus&&n.kind!=='partner'&&n.depth===0;return `<button type="button" class="tree-node${root?' focus':''}${n.id===selected?' selected':''}${approx?' uncertain':''}" data-id="${escapeHTML(n.id)}" style="left:${n.x}px;top:${n.y}px" aria-label="Ver ${escapeHTML(p.full_name)}"><strong>${escapeHTML(p.full_name)}</strong><small>${escapeHTML(lifetime(p))}</small><em>${escapeHTML(proof[p.verification]||'Sin verificar')}${approx?' · Fecha aproximada':''}</em></button>`;}).join('');
  $('treeCount').textContent=`${model.nodes.length} tarjetas · ${model.edges.length} vínculos`;
  $('modeTitle').textContent=mode==='ancestors'?'Ascendencia':mode==='descendants'?'Descendencia':'Núcleo familiar';
  $('treeStatus').textContent='Pulsa una persona para consultar sus datos. Las líneas discontinuas indican relaciones pendientes de confirmar.';
  $('cards').querySelectorAll('[data-id]').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.id;highlight();renderPanel();}));
  renderPanel();fit();
}
function setFocus(id){if(!get(id))return;focus=id;selected=id;$('focus').value=id;render();}
function initializeControls(){const viewport=$('viewport');let pointer=null;
  viewport.addEventListener('pointerdown',e=>{if(e.target.closest('button')||e.button!==0)return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY,tx,ty};viewport.setPointerCapture(e.pointerId);viewport.classList.add('dragging');});
  viewport.addEventListener('pointermove',e=>{if(pointer?.id!==e.pointerId)return;tx=pointer.tx+e.clientX-pointer.x;ty=pointer.ty+e.clientY-pointer.y;transform();});
  const end=e=>{if(pointer?.id===e.pointerId){pointer=null;viewport.classList.remove('dragging');}};viewport.addEventListener('pointerup',end);viewport.addEventListener('pointercancel',end);
  viewport.addEventListener('wheel',e=>{e.preventDefault();const rect=viewport.getBoundingClientRect();zoom(e.deltaY<0?1.12:.89,e.clientX-rect.left,e.clientY-rect.top);},{passive:false});
  viewport.addEventListener('keydown',e=>{if(e.key==='+'||e.key==='='){zoom(1.2);e.preventDefault();}if(e.key==='-'){zoom(.83);e.preventDefault();}if(e.key.startsWith('Arrow')){const step=65;tx+=e.key==='ArrowLeft'?step:e.key==='ArrowRight'?-step:0;ty+=e.key==='ArrowUp'?step:e.key==='ArrowDown'?-step:0;transform();e.preventDefault();}});
  $('zoomIn').onclick=()=>zoom(1.2);$('zoomOut').onclick=()=>zoom(.83);$('zoomFit').onclick=fit;$('fit').onclick=fit;
  $('focus').onchange=e=>setFocus(e.target.value);$('generations').onchange=e=>{generations=Number(e.target.value)||4;render();};
  document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;document.querySelectorAll('[data-mode]').forEach(x=>{const active=x===b;x.classList.toggle('active',active);x.setAttribute('aria-pressed',String(active));});render();}));
  const observer=new ResizeObserver(()=>{if(get(focus))fit();});observer.observe(viewport);
  $('logout').onclick=async()=>{await supabase.auth.signOut();people.clear();relations=[];selected=focus=null;$('app').hidden=true;$('gate').hidden=false;$('loginStatus').textContent='Sesión cerrada.';};
}
let initialized=false;
async function check(session){if(!session?.user){$('app').hidden=true;$('gate').hidden=false;return;}if(loading)return;loading=true;
  try{const {data:admin,error:adminError}=await supabase.rpc('gen_is_admin');if(adminError||admin!==true)throw new Error('Esta cuenta no tiene permiso para consultar el archivo.');
    const results=await Promise.all([supabase.from('gen_people').select('*'),supabase.from('gen_relations').select('*')]);for(const res of results)if(res.error)throw res.error;
    people.clear();for(const p of results[0].data||[])people.set(p.id,p);relations=results[1].data||[];
    const opts=[...people.values()].sort((a,b)=>a.full_name.localeCompare(b.full_name,'es'));
    $('focus').innerHTML=opts.map(p=>`<option value="${escapeHTML(p.id)}">${escapeHTML(p.full_name)}</option>`).join('');
    const fromUrl=new URLSearchParams(location.search).get('person');const newest=[...opts].sort((a,b)=>(b.birth_year||0)-(a.birth_year||0))[0];focus=get(fromUrl)?fromUrl:get(focus)?focus:newest?.id||null;selected=focus;
    $('gate').hidden=true;$('app').hidden=false;if(!initialized){initializeControls();initialized=true;}render();
  }catch(error){console.error(error);$('gate').hidden=false;$('app').hidden=true;$('loginStatus').textContent=error.message||'No se pudo cargar el árbol.';}finally{loading=false;}
}
$('loginForm').addEventListener('submit',async e=>{e.preventDefault();const button=$('loginButton');button.disabled=true;$('loginStatus').textContent='Comprobando acceso…';try{const name=$('username').value.trim();const email=name==='28081988'?'info@enriquerodda.com':name;const {data,error}=await supabase.auth.signInWithPassword({email,password:$('password').value});if(error||!data?.session){$('loginStatus').textContent='Usuario o contraseña incorrectos. Si no recuerdas la contraseña, recupérala desde el archivo familiar.';return;}$('password').value='';$('loginStatus').textContent='';await check(data.session);}catch(e){$('loginStatus').textContent='No se pudo conectar. Inténtalo de nuevo.';console.error(e);}finally{button.disabled=false;}});
supabase.auth.onAuthStateChange((_event,session)=>queueMicrotask(()=>check(session)));
const {data}=await supabase.auth.getSession();await check(data.session);
