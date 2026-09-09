from pathlib import Path

index = Path('m88/index.html')
html = index.read_text()

old_header = '''    <header class="site-header">
      <button class="header-count" id="navAll" type="button" aria-label="Ver los 88 municipios">88</button>
    </header>'''
new_header = '''    <header class="site-header">
      <div class="header-actions">
        <button class="header-contacted" id="navContacted" type="button">Municipios contactados <span id="contactedHeaderCount">0</span></button>
        <button class="header-count" id="navAll" type="button" aria-label="Ver los 88 municipios">88</button>
      </div>
    </header>'''
if old_header in html:
    html = html.replace(old_header, new_header, 1)

marker = '      <section class="contact-view" id="contactSection" hidden>'
contacted = '''      <section class="contacted-view" id="contactedSection" hidden>
        <div class="section-wrap">
          <button class="back-button" id="backFromContacted" type="button">← Mapa</button>
          <p class="eyebrow">Seguimiento comercial</p>
          <h2>Municipios contactados</h2>
          <div class="contacted-meta"><span id="contactedCount">0 de 88</span><span id="contactedPending">88 pendientes</span></div>
          <div class="municipality-grid contacted-grid" id="contactedGrid"></div>
          <div class="contact-empty" id="contactedEmpty"><strong>Aún no hay municipios marcados.</strong><p>Los municipios aparecerán aquí cuando los registremos como contactados.</p></div>
        </div>
      </section>

'''
if 'id="contactedSection"' not in html and marker in html:
    html = html.replace(marker, contacted + marker, 1)

import re
html = re.sub(r'app\.js\?v=[^"\']+', 'app.js?v=20260909-contacted1', html)
index.write_text(html)

css = Path('m88/app.css')
style = css.read_text()
additions = '''
.header-actions{display:flex;align-items:center;gap:10px}.header-contacted{appearance:none;border:1px solid rgba(255,255,255,.13);border-radius:999px;background:#050505;color:#c8c8c8;padding:10px 14px;font:500 9px "Work Sans",Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase}.header-contacted span{color:var(--yellow);font-weight:700;margin-left:5px}.header-contacted:hover,.header-contacted:focus-visible{border-color:rgba(255,205,0,.5);color:#fff;outline:none}.contacted-view{min-height:100svh;padding:104px 5vw 80px;background:#000}.contacted-view h2{font:500 clamp(44px,6vw,78px)/.92 "Work Sans";letter-spacing:-.05em;margin:0}.contacted-meta{display:flex;gap:16px;flex-wrap:wrap;margin:18px 0 28px;color:#8d8d8d;font-size:11px}.contacted-meta span:first-child{color:var(--yellow)}.municipality-card.is-contacted{border-color:rgba(255,205,0,.34)}.municipality-card .contacted-label{color:var(--yellow);font-weight:600}.municipality-card .contacted-date{color:#737373;margin-top:4px}.contacted-grid .municipality-card{min-height:126px}body.island-open .contacted-view{min-height:auto;padding-top:22px}@media(max-width:760px){.header-actions{gap:8px}.header-contacted{font-size:8px;padding:9px 11px}.contacted-view{padding:88px 20px 55px}body.island-open .contacted-view{padding:16px 20px 55px}}@media(max-width:430px){.header-contacted{max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}
'''
if '.header-contacted{' not in style:
    style += additions
css.write_text(style)

app = Path('m88/app.js')
js = app.read_text()

if "const contactedSection = document.getElementById('contactedSection');" not in js:
    js = js.replace(
        "const contactSection = document.getElementById('contactSection');",
        "const contactSection = document.getElementById('contactSection');\nconst contactedSection = document.getElementById('contactedSection');",
        1,
    )

if 'let contactedMap = new Map();' not in js:
    js = js.replace("let activeMode = 'island';", "let activeMode = 'island';\nlet contactedMap = new Map();", 1)

# Hide the tracker whenever another view is opened.
js = js.replace(
    "  directorySection.hidden = true;\n  contactSection.hidden = true;\n  window.scrollTo({top:0,behavior:'smooth'});",
    "  directorySection.hidden = true;\n  contactSection.hidden = true;\n  contactedSection.hidden = true;\n  window.scrollTo({top:0,behavior:'smooth'});",
    1,
)
js = js.replace(
    "  directorySection.hidden = false;\n  contactSection.hidden = true;\n  document.getElementById('islandEyebrow').textContent = 'Isla · Directorio municipal';",
    "  directorySection.hidden = false;\n  contactSection.hidden = true;\n  contactedSection.hidden = true;\n  document.getElementById('islandEyebrow').textContent = 'Isla · Directorio municipal';",
    1,
)
js = js.replace(
    "  directorySection.hidden = false;\n  contactSection.hidden = true;\n  document.getElementById('islandEyebrow').textContent = 'Canarias · Directorio municipal';",
    "  directorySection.hidden = false;\n  contactSection.hidden = true;\n  contactedSection.hidden = true;\n  document.getElementById('islandEyebrow').textContent = 'Canarias · Directorio municipal';",
    1,
)
js = js.replace(
    "  directorySection.hidden = true;\n  contactSection.hidden = false;\n  document.getElementById('municipalityIsland').textContent = islandName;",
    "  directorySection.hidden = true;\n  contactedSection.hidden = true;\n  contactSection.hidden = false;\n  document.getElementById('municipalityIsland').textContent = islandName;",
    1,
)

old_render = '''  grid.innerHTML = items.map((item,index)=>`<button class="municipality-card" type="button" data-name="${escapeAttr(item.name)}" data-island-name="${escapeAttr(item.island)}"><small>${String(index+1).padStart(2,'0')} · ${escapeHtml(item.island)}</small><strong>${escapeHtml(item.name)}</strong><span>Ver contactos →</span></button>`).join('');'''
new_render = '''  grid.innerHTML = items.map((item,index)=>{const contacted=contactedMap.get(item.name);return `<button class="municipality-card${contacted?' is-contacted':''}" type="button" data-name="${escapeAttr(item.name)}" data-island-name="${escapeAttr(item.island)}"><small>${String(index+1).padStart(2,'0')} · ${escapeHtml(item.island)}</small><strong>${escapeHtml(item.name)}</strong>${contacted?`<span class="contacted-label">✓ Contactado</span>`:`<span>Ver contactos →</span>`}</button>`}).join('');'''
if old_render in js:
    js = js.replace(old_render, new_render, 1)

functions = r'''async function loadContactedMunicipalities(){
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

'''
if 'async function showContacted()' not in js:
    js = js.replace('function partyMark(party){', functions + 'function partyMark(party){', 1)

events = '''const navContacted = document.getElementById('navContacted');
if(navContacted) navContacted.addEventListener('click',()=>void showContacted());
const backFromContacted = document.getElementById('backFromContacted');
if(backFromContacted) backFromContacted.addEventListener('click',showMap);
void loadContactedMunicipalities();
'''
if 'const navContacted' not in js:
    js = js.replace("const navAll = document.getElementById('navAll');", events + "const navAll = document.getElementById('navAll');", 1)

old_back = "document.getElementById('backToMunicipalities').addEventListener('click',()=>activeMode==='all'?showAll():activeIsland&&showIsland(activeIsland.slug));"
new_back = "document.getElementById('backToMunicipalities').addEventListener('click',()=>activeMode==='all'?showAll():activeMode==='contacted'?void showContacted():activeIsland&&showIsland(activeIsland.slug));"
if old_back in js:
    js = js.replace(old_back, new_back, 1)

app.write_text(js)
