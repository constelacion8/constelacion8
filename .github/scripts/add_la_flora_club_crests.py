from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[2]
PAGE = ROOT / 'area-2627' / 'index.html'
ASSETS = ROOT / 'area-2627' / 'assets' / 'clubs'
ASSETS.mkdir(parents=True, exist_ok=True)

SOURCES = {
    'real-madrid.png': 'https://assets.footylogos.com/logos/real-madrid/real-madrid-logo-footylogos.png',
    'atletico-madrid.png': 'https://www.footylogos.com/downloads/logo/atletico-madrid-logo-footylogos.png',
    'cd-tenerife.png': 'https://www.footylogos.com/downloads/logo/cd-tenerife-logo-footylogos.png',
    'real-betis.png': 'https://www.footylogos.com/downloads/logo/real-betis-balompie-logo-footylogos.png',
    'fc-barcelona.png': 'https://www.footylogos.com/downloads/logo/fc-barcelona-logo-footylogos.png',
    'spain.png': 'https://www.footylogos.com/downloads/logo/spain-national-team-logo-footylogos.png',
    'canarias-7-estrellas.svg': 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Bandera%20Siete%20Estrellas%20Verdes.svg',
}

for filename, url in SOURCES.items():
    req = Request(url, headers={'User-Agent': 'Mozilla/5.0 LaFloraBets/1.0'})
    with urlopen(req, timeout=30) as response:
        (ASSETS / filename).write_bytes(response.read())

s = PAGE.read_text(encoding='utf-8')

anchor = "pretty=n=>String(n||'').replace(/andrew perilla/i,'Andrew Perilla');"
helper = """const CRESTS={'erodda':'assets/clubs/real-madrid.png','jm.':'assets/clubs/atletico-madrid.png','berto115':'assets/clubs/cd-tenerife.png','tosco13':'assets/clubs/atletico-madrid.png','andrew perilla':'assets/clubs/real-betis.png','bustaid':'assets/clubs/canarias-7-estrellas.svg','.rives.':'assets/clubs/fc-barcelona.png','fran.88':'assets/clubs/cd-tenerife.png','vidrio77':'assets/clubs/atletico-madrid.png','thoth':'assets/clubs/spain.png'};function crest(n,size='rank'){const src=CRESTS[String(n||'').toLowerCase()];return src?`<img class=\"crestimg ${size==='hero'?'hero-crest':'rank-crest'}\" src=\"${src}\" alt=\"\" ${size==='hero'?'':'loading=\"lazy\"'}>`:''}"""
if 'const CRESTS=' not in s:
    if anchor not in s:
        raise RuntimeError('Could not find JS helper anchor')
    s = s.replace(anchor, anchor + helper, 1)

css = ".crestimg{display:block;object-fit:contain}.av{width:80px;height:80px;margin:auto auto 8px;display:grid;place-items:center;padding:7px;border-radius:16px;border:1px solid #3a465c;background:radial-gradient(circle at 50% 35%,#ffffff12,transparent 58%),linear-gradient(#111925,#080d14);box-shadow:0 0 0 3px #ffffff08,0 10px 24px #0007}.hero-crest{width:100%;height:100%}.rank-crest{width:32px;height:32px;flex:0 0 32px}.podname{display:flex;align-items:center;gap:6px;min-width:0}.podname .rank-crest{width:25px;height:25px;flex-basis:25px}.podname span{min-width:0}.row .rank-crest{margin-left:1px}@media(max-width:360px){.av{width:70px;height:70px}.rank-crest{width:28px;height:28px;flex-basis:28px}}"
if '.crestimg{' not in s:
    s = s.replace('</style>', css + '</style>', 1)

a0 = '<div class="c"><div class="av"></div><h2>${esc(pretty(m.option_a))}</h2>'
a1 = '<div class="c"><div class="av">${crest(m.option_a,\'hero\')}</div><h2>${esc(pretty(m.option_a))}</h2>'
b0 = '<div class="c"><div class="av"></div><h2>${esc(pretty(m.option_b))}</h2>'
b1 = '<div class="c"><div class="av">${crest(m.option_b,\'hero\')}</div><h2>${esc(pretty(m.option_b))}</h2>'
if a0 in s:
    s = s.replace(a0, a1, 1)
if b0 in s:
    s = s.replace(b0, b1, 1)

r0 = '<span class="num">${i===0?\'♛\':i+1}</span><span class="nm"><b>${esc(pretty(p.display_name))}</b>'
r1 = '<span class="num">${i===0?\'♛\':i+1}</span>${crest(p.display_name,\'rank\')}<span class="nm"><b>${esc(pretty(p.display_name))}</b>'
if r0 in s:
    s = s.replace(r0, r1, 1)

q0 = '<div class="pod"><em>#${i+1}</em><span>${esc(pretty(p.display_name))}</span><b>${money(p.balance)}</b></div>'
q1 = '<div class="pod"><em>#${i+1}</em><div class="podname">${crest(p.display_name,\'rank\')}<span>${esc(pretty(p.display_name))}</span></div><b>${money(p.balance)}</b></div>'
if q0 in s:
    s = s.replace(q0, q1, 1)

if 'crest(m.option_a' not in s or 'crest(m.option_b' not in s or "crest(p.display_name,'rank')" not in s:
    raise RuntimeError('Crest UI patch incomplete')

PAGE.write_text(s, encoding='utf-8')
print('La Flora club crests patched successfully')
