import { bindActions } from './workspace-actions.js';
import { bindExports } from './workspace-export.js';
const $=id=>document.getElementById(id);
export const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const state={people:[],relations:[],sources:[],evidence:[],events:[],tasks:[],documents:[],audit:[],biographies:[],page:'dashboard',selected:null,focus:null,selectedBiography:null};
export const person=id=>state.people.find(x=>x.id===id);
export const source=id=>state.sources.find(x=>x.id===id);
export const parents=id=>state.relations.filter(r=>r.relation_type==='parent'&&r.person_b===id).map(r=>person(r.person_a)).filter(Boolean);
export const children=id=>state.relations.filter(r=>r.relation_type==='parent'&&r.person_a===id).map(r=>person(r.person_b)).filter(Boolean);
export const partners=id=>state.relations.filter(r=>r.relation_type==='partner'&&(r.person_a===id||r.person_b===id)).map(r=>person(r.person_a===id?r.person_b:r.person_a)).filter(Boolean);
const ENRIQUE_NAME='Enrique Rodríguez Darias';
const relationGender=(p,male,female,neutral)=>p?.sex==='female'?female:p?.sex==='male'?male:neutral;
function ancestorMap(id,maxDepth=12){
 const result=new Map([[id,{dist:0,path:[id]}]]),queue=[id];
 while(queue.length){
  const current=queue.shift(),base=result.get(current);
  if(!base||base.dist>=maxDepth)continue;
  state.relations.filter(r=>r.relation_type==='parent'&&r.person_b===current).forEach(r=>{
   if(result.has(r.person_a))return;
   result.set(r.person_a,{dist:base.dist+1,path:[...base.path,r.person_a]});
   queue.push(r.person_a);
  });
 }
 return result;
}
function branchLabel(path){
 if(!path||path.length<2)return '';
 const first=person(path[1]);
 if(!first)return '';
 if(first.sex==='female')return 'Rama materna';
 if(first.sex==='male')return 'Rama paterna';
 return `Rama de ${first.full_name}`;
}
function ancestorLabel(p,d){
 const labels={
  1:['Padre','Madre','Progenitor/a'],
  2:['Abuelo','Abuela','Abuelo/a'],
  3:['Bisabuelo','Bisabuela','Bisabuelo/a'],
  4:['Tatarabuelo','Tatarabuela','Tatarabuelo/a']
 };
 const x=labels[d];
 return x?relationGender(p,x[0],x[1],x[2]):`Ascendiente directo · ${d} generaciones`;
}
function descendantLabel(p,d){
 const labels={
  1:['Hijo','Hija','Hijo/a'],
  2:['Nieto','Nieta','Nieto/a'],
  3:['Bisnieto','Bisnieta','Bisnieto/a'],
  4:['Tataranieto','Tataranieta','Tataranieto/a']
 };
 const x=labels[d];
 return x?relationGender(p,x[0],x[1],x[2]):`Descendiente directo · ${d} generaciones`;
}
function siblingLabel(p){return relationGender(p,'Hermano','Hermana','Hermano/a');}
function uncleLabel(p,d){
 const levels={
  2:['Tío','Tía','Tío/a'],
  3:['Tío abuelo','Tía abuela','Tío/a abuelo/a'],
  4:['Tío bisabuelo','Tía bisabuela','Tío/a bisabuelo/a'],
  5:['Tío tatarabuelo','Tía tatarabuela','Tío/a tatarabuelo/a']
 };
 const x=levels[d];
 return x?relationGender(p,x[0],x[1],x[2]):relationGender(p,'Tío de generación anterior','Tía de generación anterior','Tío/a de generación anterior');
}
function nephewLabel(p,d){
 const levels={
  2:['Sobrino','Sobrina','Sobrino/a'],
  3:['Sobrino nieto','Sobrina nieta','Sobrino/a nieto/a'],
  4:['Sobrino bisnieto','Sobrina bisnieta','Sobrino/a bisnieto/a']
 };
 const x=levels[d];
 return x?relationGender(p,x[0],x[1],x[2]):relationGender(p,'Sobrino de generación posterior','Sobrina de generación posterior','Sobrino/a de generación posterior');
}
function cousinLabel(p,degree){
 const levels={
  1:['Primo hermano','Prima hermana','Primo/a hermano/a'],
  2:['Primo segundo','Prima segunda','Primo/a segundo/a'],
  3:['Primo tercero','Prima tercera','Primo/a tercero/a'],
  4:['Primo cuarto','Prima cuarta','Primo/a cuarto/a']
 };
 const x=levels[degree];
 return x?relationGender(p,x[0],x[1],x[2]):`Primo/a de ${degree}.º grado`;
}
function bloodRelationship(targetId,referenceId){
 const target=person(targetId),reference=person(referenceId);
 if(!target||!reference)return null;
 if(targetId===referenceId)return {label:'Yo / persona de referencia',detail:'Enrique Rodríguez Darias',kind:'self'};
 const refAnc=ancestorMap(referenceId),targetAnc=ancestorMap(targetId);
 if(refAnc.has(targetId)){
  const x=refAnc.get(targetId);
  return {label:ancestorLabel(target,x.dist),detail:[branchLabel(x.path),'Línea ascendente directa'].filter(Boolean).join(' · '),kind:'direct'};
 }
 if(targetAnc.has(referenceId)){
  const x=targetAnc.get(referenceId);
  return {label:descendantLabel(target,x.dist),detail:'Línea descendente directa de Enrique Rodríguez Darias',kind:'direct'};
 }
 let common=[];
 for(const [id,a] of refAnc){
  if(id===referenceId||id===targetId||!targetAnc.has(id))continue;
  const b=targetAnc.get(id);
  common.push({id,de:a.dist,dt:b.dist,sum:a.dist+b.dist,path:a.path});
 }
 common.sort((a,b)=>a.sum-b.sum||Math.max(a.de,a.dt)-Math.max(b.de,b.dt));
 const best=common[0];
 if(!best)return null;
 const commonPerson=person(best.id),detailParts=[];
 const branch=branchLabel(best.path);if(branch)detailParts.push(branch);
 if(commonPerson)detailParts.push(`Antepasado común: ${commonPerson.full_name}`);
 if(best.de===1&&best.dt===1)return {label:siblingLabel(target),detail:detailParts.join(' · '),kind:'collateral'};
 if(best.dt===1&&best.de>=2)return {label:uncleLabel(target,best.de),detail:detailParts.join(' · '),kind:'collateral'};
 if(best.de===1&&best.dt>=2)return {label:nephewLabel(target,best.dt),detail:detailParts.join(' · '),kind:'collateral'};
 if(best.de===best.dt&&best.de>=2)return {label:cousinLabel(target,best.de-1),detail:detailParts.join(' · '),kind:'collateral'};
 const degree=Math.max(1,Math.min(best.de,best.dt)-1),gap=Math.abs(best.de-best.dt);
 detailParts.push(`${cousinLabel(target,degree)} · ${gap} ${gap===1?'generación':'generaciones'} de diferencia`);
 return {label:'Pariente colateral',detail:detailParts.join(' · '),kind:'collateral'};
}
export function relationshipToEnrique(targetId){
 const reference=state.people.find(p=>p.full_name===ENRIQUE_NAME);
 if(!reference)return {label:'Parentesco sin calcular',detail:'No se ha localizado a Enrique Rodríguez Darias en el árbol.'};
 const blood=bloodRelationship(targetId,reference.id);
 if(blood)return blood;
 const target=person(targetId);
 for(const partner of partners(targetId)){
  const via=bloodRelationship(partner.id,reference.id);
  if(via&&via.kind!=='self'){
   return {label:`Pareja de mi ${via.label.toLowerCase()}`,detail:`Conexión familiar a través de ${partner.full_name}`,kind:'affinal'};
  }
 }
 if(partners(reference.id).some(x=>x.id===targetId))return {label:'Pareja',detail:'Pareja de Enrique Rodríguez Darias',kind:'affinal'};
 return {label:'Parentesco no determinado',detail:'No hay todavía una cadena familiar suficiente en el árbol para calcularlo.',kind:'unknown'};
}
export const sortedPeople=()=>[...state.people].sort((a,b)=>a.full_name.localeCompare(b.full_name,'es'));
export const options=(rows,blank='— Seleccionar —')=>`<option value="">${esc(blank)}</option>`+rows.map(x=>`<option value="${esc(x.id)}">${esc(x.full_name||x.title)}</option>`).join('');
export function dateLabel(v){if(!v)return '';let d=new Date(`${v.slice(0,10)}T12:00:00`);return isNaN(d)?v:d.toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'});}
export function vital(p,type){const date=p[type+'_date'],year=p[type+'_year'],precision=p[type+'_precision'];if(date&&precision==='exact')return dateLabel(date);if(year)return (precision==='approximate'?'hacia ':'')+year;return date?dateLabel(date):'desconocido';}
export const name=id=>person(id)?.full_name||'Sin identificar';
export function notify(message,error=false){let el=$('toast');el.textContent=message;el.classList.toggle('error',error);el.hidden=false;setTimeout(()=>el.hidden=true,4400);}
const labels={documented:'Documentado',family:'Información familiar',pending:'Pendiente',conflict:'Contradicción',probable:'Probable',contradictory:'Contradictorio'};
const badge=s=>`<span class="tag ${esc(s)}">${esc(labels[s]||s||'Pendiente')}</span>`;
const pages={biographies:['Biografías completas','Historias familiares extensas, conservadas en su integridad.','MEMORIA NARRADA'],dashboard:['Archivo familiar','Tu investigación genealógica, ordenada y conectada.','MEMORIA Y DOCUMENTACIÓN'],people:['Personas','Fichas biográficas y relaciones entre generaciones.','PERSONAS Y PARENTESCOS'],tree:['Árbol familiar','Explora líneas ascendentes y descendientes.','CARTOGRAFÍA FAMILIAR'],sources:['Fuentes y pruebas','Cada afirmación, vinculada a su procedencia.','RIGOR DOCUMENTAL'],documents:['Archivo documental','Conserva las copias originales fuera del sitio público.','DOCUMENTOS PRIVADOS'],tasks:['Investigación','Preguntas abiertas, conflictos y próximos hallazgos.','CUADERNO DE CAMPO'],history:['Historial','Registro de cambios para no perder el contexto.','TRAZABILIDAD']};
export function setPage(page){if(!pages[page])return;state.page=page;document.querySelectorAll('[id^="page-"]').forEach(el=>el.hidden=el.id!==`page-${page}`);document.querySelectorAll('[data-page]').forEach(el=>el.classList.toggle('active',el.dataset.page===page));$('pageTitle').textContent=pages[page][0];$('topCrumb').textContent=pages[page][0];$('pageSubtitle').textContent=pages[page][1];$('pageEyebrow').textContent=pages[page][2];let add={people:'+ Nueva persona',tree:'+ Relación',sources:'+ Nueva fuente',documents:'+ Subir documento',tasks:'+ Nueva tarea'};$('headerAdd').hidden=!add[page];$('headerAdd').textContent=add[page]||'';window.scrollTo(0,0);}
function fillSelectors(){let all=sortedPeople();for(let id of ['treeFocus','rA','rB','ePerson','evPerson','docPerson','tPerson']){let el=$(id),old=el.value;el.innerHTML=options(all);el.value=id==='treeFocus'?(state.focus||''):(old||'');}for(let id of ['eSource','evSource','docSource']){let el=$(id),old=el.value;el.innerHTML=options(state.sources);el.value=old||'';}}

function renderDashboard(){
 const todo=state.tasks.filter(t=>t.status!=='done');
 $('stats').innerHTML=[[state.people.length,'Personas'],[state.relations.length,'Relaciones'],[state.sources.length,'Fuentes'],[todo.length,'Investigaciones abiertas']].map(([n,label])=>`<div class="stat"><span class="eyebrow">ARCHIVO</span><b>${n}</b><span>${label}</span></div>`).join('');
 // El hilo muestra ascendientes directos de Enrique, independientemente de la ficha que se abra.
 const p=state.people.find(x=>x.full_name==='Enrique Rodríguez Darias');
 const levels=p?[[p]]:[],seen=new Set(p?[p.id]:[]);
 for(let i=0;i<15;i++){
  const prev=levels.at(-1)||[];
  const next=[...new Set(prev.flatMap(x=>parents(x.id).map(y=>y.id)))].filter(id=>!seen.has(id)).map(person).filter(Boolean);
  if(!next.length)break;
  next.forEach(x=>seen.add(x.id));levels.push(next);
 }
 $('familyLine').innerHTML=levels.reverse().map((level,i)=>`<div class="list-item"><div><small>Generación ${levels.length-i}</small><strong>${level.map(p=>`<button class="tiny" data-action="openPerson" data-id="${p.id}">${esc(p.full_name)}</button>`).join(' ')}</strong></div></div>`).join('')||'<div class="empty">No se ha localizado la ascendencia de Enrique en el archivo.</div>';
 $('dashboardTasks').innerHTML=todo.slice(0,6).map(t=>`<button class="list-item" data-action="editTask" data-id="${t.id}"><div><strong>${esc(t.title)}</strong><small>${t.person_id?esc(name(t.person_id)):'General'} · ${t.priority==='high'?'Alta prioridad':'Normal'}</small></div><span class="tag">${t.status==='in_progress'?'En curso':'Pendiente'}</span></button>`).join('')||'<div class="empty">Todo al día.</div>';
}
export function renderPeople(){let query=$('personSearch').value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),filter=$('personFilter').value;let ppl=sortedPeople().filter(p=>(!filter||p.verification===filter)&&(!query||[p.full_name,p.aliases,p.birth_place,p.death_place,p.research_notes].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(query)));$('personCount').textContent=`${ppl.length} / ${state.people.length}`;$('peopleList').innerHTML=ppl.map(p=>`<button class="list-item ${p.id===state.selected?'selected':''}" data-action="openPerson" data-id="${p.id}"><div><strong>${esc(p.full_name)}</strong><small>${esc(vital(p,'birth'))} · ${esc(p.birth_place||'Lugar desconocido')}</small></div>${badge(p.verification)}</button>`).join('')||'<div class="empty">Sin resultados.</div>';renderDetail();}
function link(p){return `<button class="tiny" data-action="openPerson" data-id="${p.id}">${esc(p.full_name)}</button>`;}
function renderDetail(){let p=person(state.selected),el=$('personDetail');if(!p){el.innerHTML='<div class="card detail-empty">Selecciona una persona para abrir su ficha.</div>';return;}let rels=state.relations.filter(r=>r.person_a===p.id||r.person_b===p.id),evidence=state.evidence.filter(x=>x.person_id===p.id),events=state.events.filter(x=>x.person_id===p.id),docs=state.documents.filter(x=>x.person_id===p.id);let kinship=relationshipToEnrique(p.id);let group=(title,items)=>`<div class="subpanel"><h3>${title} (${items.length})</h3><div class="inline-row">${items.map(link).join('')||'<span class="small-note">Sin identificar</span>'}</div></div>`;el.innerHTML=`<div class="card"><div class="eyebrow">FICHA PRIVADA</div><h2 style="font-size:29px;margin-top:10px">${esc(p.full_name)}</h2><div class="inline-row">${badge(p.verification)}${p.aliases?`<span class="tag">${esc(p.aliases)}</span>`:''}</div><div class="columns" style="margin-top:20px"><p><span class="eyebrow">NACIMIENTO</span><br>${esc(vital(p,'birth'))}<br><span class="muted">${esc(p.birth_place||'Lugar desconocido')}</span></p><p><span class="eyebrow">DEFUNCIÓN</span><br>${p.is_living?'Vive':esc(vital(p,'death'))}<br><span class="muted">${esc(p.death_place||'Lugar desconocido')}</span></p></div>${`<div class="subpanel" style="margin-top:18px"><div class="eyebrow">PARENTESCO CON ENRIQUE RODRÍGUEZ DARIAS</div><strong style="display:block;font-size:20px;margin-top:8px">${esc(kinship.label)}</strong>${kinship.detail?`<span class="small-note" style="display:block;margin-top:6px">${esc(kinship.detail)}</span>`:''}</div>`}${p.biography?`<p style="white-space:pre-wrap;line-height:1.7">${esc(p.biography)}</p>`:''}${p.research_notes?`<div class="notice"><b>Notas de investigación</b><br>${esc(p.research_notes)}</div>`:''}<div class="button-row"><button class="secondary" data-action="editPerson" data-id="${p.id}">Editar ficha</button><button class="danger" data-action="deletePerson" data-id="${p.id}">Eliminar</button></div></div><div class="card"><h2>Red familiar</h2>${group('Progenitores',parents(p.id))}${group('Parejas',partners(p.id))}${group('Hijos e hijas',children(p.id))}<div class="subpanel"><h3>Vínculos registrados</h3>${rels.map(r=>`<div class="link-row"><span class="mini">${r.relation_type==='parent'?'Progenitor → hijo/a':'Pareja'}: ${esc(name(r.person_a))} / ${esc(name(r.person_b))}</span><button class="tiny danger-text" data-action="deleteRelation" data-id="${r.id}">×</button></div>`).join('')||'<span class="small-note">Sin relaciones.</span>'}</div><div class="button-row"><button class="secondary" data-action="addRelation" data-id="${p.id}">+ Relación</button><button class="secondary" data-action="focusTree" data-id="${p.id}">Ver árbol →</button></div></div><div class="card"><h2>Fuentes y pruebas</h2>${evidence.map(x=>`<div class="list-item"><div><strong>${esc(x.claim)}</strong><small>${esc(source(x.source_id)?.title||'Fuente desconocida')} · ${esc(labels[x.strength]||x.strength)} · ${esc(x.notes||'')}</small></div><button class="tiny danger-text" data-action="deleteEvidence" data-id="${x.id}">×</button></div>`).join('')||'<div class="empty">Aún sin fuentes asociadas.</div>'}<div class="button-row"><button class="secondary" data-action="addEvidence" data-id="${p.id}">+ Vincular prueba</button></div></div><div class="card"><h2>Acontecimientos</h2>${events.map(x=>`<div class="list-item"><div><strong>${esc(x.event_type)} · ${esc(x.event_date?dateLabel(x.event_date):x.event_year?(x.date_precision==='approximate'?'hacia ':'')+x.event_year:'sin fecha')}</strong><small>${esc(x.place||'')} · ${esc(x.description||'')}</small></div><button class="tiny danger-text" data-action="deleteEvent" data-id="${x.id}">×</button></div>`).join('')||'<div class="empty">Sin eventos añadidos.</div>'}<div class="button-row"><button class="secondary" data-action="addEvent" data-id="${p.id}">+ Acontecimiento</button></div></div><div class="card"><h2>Documentos (${docs.length})</h2>${docs.map(d=>`<div class="link-row"><span class="mini">${esc(d.title)}</span><button class="tiny" data-action="openDocument" data-id="${d.id}">Abrir</button></div>`).join('')||'<span class="small-note">Ningún documento adjunto.</span>'}</div>`;}
function treeCard(p,focus=false){return `<button class="tree-person ${focus?'focus':''}" data-action="focusTree" data-id="${p.id}"><b>${esc(p.full_name)}</b><small>${esc(vital(p,'birth'))}</small></button>`;}
export function renderTree(){let p=person(state.focus);$('treeFocus').value=p?.id||'';if(!p){$('treeCanvas').innerHTML='<div class="empty">Selecciona una persona.</div>';return;}let levels=[[p]],seen=new Set([p.id]);for(let i=0;i<4;i++){let next=levels.at(-1).flatMap(x=>parents(x.id)).filter(x=>!seen.has(x.id));next.forEach(x=>seen.add(x.id));if(!next.length)break;levels.push(next);}let names=['Persona central','Padres y madres','Abuelos y abuelas','Bisabuelos y bisabuelas','Tatarabuelos y tatarabuelas'];$('treeCanvas').innerHTML=levels.reverse().map((items,i)=>{let n=levels.length-i-1;return `<div class="generation"><h3>${names[n]} · ${items.length}</h3><div class="tree-cards">${items.map(x=>treeCard(x,n===0)).join('')}</div></div>`;}).join('')+`<div class="generation"><h3>Parejas</h3><div class="tree-cards">${partners(p.id).map(x=>treeCard(x)).join('')||'<div class="empty">No constan.</div>'}</div></div><div class="generation"><h3>Hijos e hijas</h3><div class="tree-cards">${children(p.id).map(x=>treeCard(x)).join('')||'<div class="empty">No constan.</div>'}</div></div>`;}
function renderSources(){$('sourceList').innerHTML=state.sources.map(s=>`<div class="list-item"><div><strong>${esc(s.title)}</strong><small>${esc(s.source_type)} · ${esc(s.reference||'Sin signatura')} · ${esc(s.archive_name||'')}${s.source_url?`<br><a href="${esc(s.source_url)}" target="_blank" rel="noopener noreferrer">Consultar ↗</a>`:''}<br>${esc(s.notes||'')}</small></div><div class="inline-row"><button class="tiny" data-action="editSource" data-id="${s.id}">Editar</button><button class="tiny danger-text" data-action="deleteSource" data-id="${s.id}">×</button></div></div>`).join('')||'<div class="empty">Sin fuentes.</div>';$('evidenceList').innerHTML=state.evidence.map(e=>`<div class="list-item"><div><strong>${esc(name(e.person_id))}</strong><small>${esc(e.claim)} · ${esc(source(e.source_id)?.title||'Sin fuente')}</small></div><button class="tiny" data-action="openPerson" data-id="${e.person_id}">Abrir</button></div>`).join('')||'<div class="empty">Sin pruebas.</div>';}
function renderDocuments(){$('documentList').innerHTML=state.documents.map(d=>`<div class="list-item"><div><strong>${esc(d.title)}</strong><small>${esc(name(d.person_id))} · ${esc(source(d.source_id)?.title||'Sin fuente')} · ${esc(d.notes||'')}</small></div><div class="inline-row"><button class="tiny" data-action="openDocument" data-id="${d.id}">Abrir</button><button class="tiny danger-text" data-action="deleteDocument" data-id="${d.id}">×</button></div></div>`).join('')||'<div class="empty">Aún no hay archivos subidos.</div>';}
export function renderTasks(){let filter=$('taskFilter').value,items=state.tasks.filter(t=>!filter||t.status===filter);$('taskList').innerHTML=items.map(t=>`<div class="list-item"><div><strong>${esc(t.title)}</strong><small>${t.person_id?esc(name(t.person_id))+' · ':''}${esc(t.notes||'')} · ${t.priority==='high'?'Alta prioridad':'Normal'}</small></div><div class="inline-row"><span class="tag">${t.status==='done'?'Hecha':t.status==='in_progress'?'En curso':'Pendiente'}</span><button class="tiny" data-action="cycleTask" data-id="${t.id}">↻</button><button class="tiny" data-action="editTask" data-id="${t.id}">Editar</button><button class="tiny danger-text" data-action="deleteTask" data-id="${t.id}">×</button></div></div>`).join('')||'<div class="empty">No hay tareas.</div>';}

function renderBiographyBody(body){
 const inline=p=>esc(p.trim()).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>').replace(/\n/g,'<br>');
 return String(body||'').split(/\n\s*\n/).filter(p=>p.trim()).map(p=>`<p>${inline(p)}</p>`).join('');
}
export function renderBiographies(){
 const items=[...state.biographies].filter(x=>x.is_published).sort((a,b)=>(a.title||'').localeCompare(b.title||'','es'));
 if(!items.some(x=>x.id===state.selectedBiography))state.selectedBiography=items[0]?.id||null;
 const list=$('biographyList'),detail=$('biographyDetail');
 if(!list||!detail)return;
 list.innerHTML=items.map(b=>`<button class="list-item ${b.id===state.selectedBiography?'selected':''}" data-biography-id="${b.id}"><div><strong>${esc(b.title)}</strong><small>${esc(b.subtitle||'')}</small></div><span aria-hidden="true">›</span></button>`).join('')||'<div class="empty">Aún no hay biografías completas publicadas.</div>';
 const b=items.find(x=>x.id===state.selectedBiography);
 detail.innerHTML=b?`<article class="bio-story"><div class="eyebrow">BIOGRAFÍA COMPLETA · ARCHIVO PRIVADO</div><h2>${esc(b.title)}</h2><p class="bio-subtitle">${esc(b.subtitle||'')}</p><div class="bio-content">${renderBiographyBody(b.body)}</div></article>`:'<div class="empty">Selecciona una biografía para leerla.</div>';
}
function renderHistory(){$('auditList').innerHTML=state.audit.map(x=>`<div class="list-item"><div><strong>${x.operation==='INSERT'?'Alta':x.operation==='UPDATE'?'Edición':'Eliminación'} · ${esc(x.entity.replace('gen_',''))}</strong><small>${esc(x.changed_at?.slice(0,16).replace('T',' ')||'')} · ID: ${esc(x.record_id)}</small></div></div>`).join('')||'<div class="empty">No hay registros.</div>';}
export function render(){renderDashboard();renderBiographies();renderPeople();renderTree();renderSources();renderDocuments();renderTasks();renderHistory();}
let client=null,initialized=false;
export async function refresh(){if(!client)return;try{let keys=['people','relations','sources','evidence','events','tasks','documents','audit','biographies'];let results=await Promise.all(keys.map(k=>{let q=client.from('gen_'+k).select(k==='audit'?'id,entity,record_id,operation,changed_at':'*');if(k==='audit')q=q.order('changed_at',{ascending:false}).limit(75);return q;}));let bad=results.find(x=>x.error);if(bad)throw bad.error;results.forEach((r,i)=>state[keys[i]]=r.data||[]);if(!person(state.selected))state.selected=[...state.people].sort((a,b)=>(b.birth_year||0)-(a.birth_year||0))[0]?.id||null;if(!person(state.focus))state.focus=state.selected;fillSelectors();render();$('globalStatus').textContent='';}catch(error){console.error(error);$('globalStatus').textContent='Error de carga. Comprueba tus permisos e inténtalo de nuevo.';notify('No se pudieron cargar los registros.',true);}}
export async function startWorkspace(supabase){client=supabase;if(!initialized){initialized=true;document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>setPage(b.dataset.page)));$('biographyList').addEventListener('click',e=>{const btn=e.target.closest('[data-biography-id]');if(!btn)return;state.selectedBiography=btn.dataset.biographyId;renderBiographies();});$('personSearch').oninput=renderPeople;$('personFilter').onchange=renderPeople;$('taskFilter').onchange=renderTasks;$('treeFocus').onchange=()=>{state.focus=$('treeFocus').value;renderTree();};$('treeOpenPerson').onclick=()=>{state.selected=state.focus;setPage('people');renderPeople();};bindActions(supabase);bindExports();}await refresh();}
