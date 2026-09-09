import { islands } from './data.js?v=20260908-1842';

const SVG_NS = 'http://www.w3.org/2000/svg';
const YELLOW = '#FFCD00';
const SUPABASE_URL = 'https://kvoldyeinvjajsimxmyc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_AjQQNYKbCwaGNv_o1GopAw_TzyLkHXh';
const GEO_URLS = [
  'https://opendata.sitcan.es/upload/unidades-administrativas/gobcan_unidades-administrativas_municipios.geojson',
  'https://raw.githubusercontent.com/diegoalegil/canariasconvive-mapa/ae9e812bfd7e123d2d7353aed6359cdbc8022c25/scripts/canarias-municipios.geojson'
];

const STATUS = {
  no_contactado: { label: 'No contactado', paint: 'url(#municipality-fill-no-contactado)', dot: '#C23B3B', legend: '#C23B3B' },
  contactado: { label: 'Contactado', paint: '#D9842F', dot: '#D9842F', legend: '#D9842F' },
  negociacion: { label: 'En negociación', paint: '#3E8A5A', dot: '#3E8A5A', legend: '#3E8A5A' },
  trabajado: { label: 'Ya hemos trabajado', paint: '#2F6FA3', dot: '#2F6FA3', legend: '#2F6FA3' }
};

const allMunicipalities = islands.flatMap(island => island.municipalities.map(name => ({ name, island })));
const canonicalByNormalized = new Map(allMunicipalities.map(item => [normalize(item.name), item.name]));
const aliases = new Map([
  ['fuencaliente', 'Fuencaliente de La Palma'],
  ['el pinar', 'El Pinar de El Hierro'],
  ['vilaflor', 'Vilaflor de Chasna'],
  ['santa maria de guia', 'Santa María de Guía de Gran Canaria'],
  ['santa maria de guia de gran canaria', 'Santa María de Guía de Gran Canaria'],
  ['san cristobal de la laguna', 'San Cristóbal de La Laguna']
]);

function normalize(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function canonicalName(raw = '') {
  const key = normalize(raw);
  return canonicalByNormalized.get(key) || aliases.get(key) || null;
}

function featureName(feature) {
  const props = feature?.properties || {};
  const preferred = [
    props.name, props.nombre, props.NOMBRE, props.municipio, props.MUNICIPIO,
    props.denominacion, props.DENOMINACION
  ].filter(Boolean);
  const candidates = [...preferred, ...Object.values(props).filter(value => typeof value === 'string')];
  for (const value of candidates) {
    const name = canonicalName(value);
    if (name) return name;
  }
  return null;
}

function geometryPolygons(geometry) {
  if (!geometry) return [];
  if (geometry.type === 'Polygon') return [geometry.coordinates];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates;
  return [];
}

function ringArea(ring = []) {
  let area = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    area += Number(ring[j]?.[0] || 0) * Number(ring[i]?.[1] || 0)
      - Number(ring[i]?.[0] || 0) * Number(ring[j]?.[1] || 0);
  }
  return Math.abs(area / 2);
}

function primaryOuterRing(feature) {
  const polygons = geometryPolygons(feature?.geometry);
  if (!polygons.length) return null;
  const polygon = polygons.reduce(
    (best, candidate) => ringArea(candidate?.[0]) > ringArea(best?.[0]) ? candidate : best,
    polygons[0]
  );
  return Array.isArray(polygon?.[0]) ? polygon[0] : null;
}

function boundsFromPoints(points) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const point of points) {
    const x = Number(point?.[0]);
    const y = Number(point?.[1]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return Number.isFinite(minX) ? { minX, minY, maxX, maxY } : null;
}

function islandGeoBounds(features) {
  const points = [];
  for (const feature of features) {
    const ring = primaryOuterRing(feature);
    if (ring) points.push(...ring);
  }
  return boundsFromPoints(points);
}

function createProjector(geoBounds, targetBounds) {
  const geoWidth = geoBounds.maxX - geoBounds.minX || 1;
  const geoHeight = geoBounds.maxY - geoBounds.minY || 1;
  const scale = Math.min(targetBounds.width / geoWidth, targetBounds.height / geoHeight);
  const drawnWidth = geoWidth * scale;
  const drawnHeight = geoHeight * scale;
  const offsetX = targetBounds.x + (targetBounds.width - drawnWidth) / 2;
  const offsetY = targetBounds.y + (targetBounds.height - drawnHeight) / 2;

  return point => [
    offsetX + (point[0] - geoBounds.minX) * scale,
    offsetY + (geoBounds.maxY - point[1]) * scale
  ];
}

function ringPath(ring, project, close = true) {
  if (!ring?.length) return '';
  const d = ring.map((point, index) => {
    const [x, y] = project(point);
    return `${index ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
  return close ? `${d} Z` : d;
}

function getOrCreateDefs(svg) {
  let defs = svg.querySelector(':scope > defs');
  if (defs) return defs;
  defs = document.createElementNS(SVG_NS, 'defs');
  svg.insertBefore(defs, svg.firstChild);
  return defs;
}

function ensurePaintDefs(defs) {
  if (!defs.querySelector('#municipality-fill-no-contactado')) {
    const gradient = document.createElementNS(SVG_NS, 'linearGradient');
    gradient.id = 'municipality-fill-no-contactado';
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '100%');
    [['0%', '#6E1B1B'], ['48%', '#B83939'], ['100%', '#7D2020']].forEach(([offset, color]) => {
      const stop = document.createElementNS(SVG_NS, 'stop');
      stop.setAttribute('offset', offset);
      stop.setAttribute('stop-color', color);
      gradient.appendChild(stop);
    });
    defs.appendChild(gradient);
  }
}

function ensureStyles() {
  if (document.getElementById('de8MunicipalityMapStyles')) return;
  const style = document.createElement('style');
  style.id = 'de8MunicipalityMapStyles';
  style.textContent = `
    .municipality-fill-layer{
      pointer-events:auto;
      filter:drop-shadow(0 0 .8px rgba(255,205,0,.98)) drop-shadow(0 0 3.6px rgba(255,205,0,.52));
    }
    .municipality-shape{
      stroke:${YELLOW};
      stroke-opacity:.96;
      stroke-width:.34;
      stroke-linecap:round;
      stroke-linejoin:round;
      vector-effect:non-scaling-stroke;
      paint-order:stroke fill;
      cursor:pointer;
      transition:filter .16s ease,opacity .16s ease,fill .22s ease;
    }
    .municipality-shape:hover{filter:brightness(1.14)}
    .island-node.has-municipalities .island-shape,
    .island-node.has-municipalities .island-aura,
    .island-node.has-municipalities:hover .island-shape,
    .island-node.has-municipalities:hover .island-aura,
    .island-node.has-municipalities:focus-visible .island-shape,
    .island-node.has-municipalities:focus-visible .island-aura,
    .island-node.has-municipalities.active .island-shape,
    .island-node.has-municipalities.active .island-aura{
      opacity:0!important;
      stroke:transparent!important;
      fill:transparent!important;
      filter:none!important;
      pointer-events:none!important;
    }
    .municipality-tooltip{position:absolute;z-index:8;display:none;pointer-events:none;min-width:148px;max-width:230px;padding:9px 11px;border:1px solid rgba(255,205,0,.34);border-radius:11px;background:rgba(0,0,0,.94);box-shadow:0 9px 30px rgba(0,0,0,.48),0 0 18px rgba(255,205,0,.06);backdrop-filter:blur(10px);color:#fff;font:500 10px/1.35 "Work Sans",Arial,sans-serif}
    .municipality-tooltip strong{display:block;margin-bottom:3px;font-size:11px;font-weight:600;color:#fff}
    .municipality-tooltip span{display:flex;align-items:center;gap:6px;color:#969696}
    .municipality-tooltip i{width:6px;height:6px;flex:none;border-radius:50%;background:var(--tooltip-status)}
    .pipeline-legend{position:relative;z-index:4;width:min(92vw,1160px);margin:18px auto 0;display:flex;align-items:center;justify-content:center;gap:8px 16px;flex-wrap:wrap;color:#8e8e8e;font:500 8px/1.2 "Work Sans",Arial,sans-serif;letter-spacing:.03em}
    .pipeline-legend-title{color:#5f5f5f;text-transform:uppercase;letter-spacing:.14em;margin-right:3px}
    .pipeline-legend-item{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
    .pipeline-legend-item i{width:7px;height:7px;border-radius:50%;background:var(--legend-color);box-shadow:0 0 8px color-mix(in srgb,var(--legend-color) 45%,transparent)}
    .pipeline-legend-item b{font-weight:600;color:#d2d2d2}
    body.island-open .pipeline-legend{display:none}
    @media(max-width:760px){
      .municipality-shape{stroke-width:.30}
      .pipeline-legend{width:90vw;margin-top:12px;gap:7px 12px;font-size:7px}
      .pipeline-legend-title{width:100%;text-align:center;margin:0 0 2px}
      .municipality-tooltip{display:none!important}
    }
    @media(prefers-reduced-motion:reduce){.municipality-shape{transition:none!important}}
  `;
  document.head.appendChild(style);
}

function ensureTooltip(stage) {
  let tooltip = document.getElementById('municipalityMapTooltip');
  if (tooltip) return tooltip;
  tooltip = document.createElement('div');
  tooltip.id = 'municipalityMapTooltip';
  tooltip.className = 'municipality-tooltip';
  stage.appendChild(tooltip);
  return tooltip;
}

function showTooltip(event, stage, tooltip, name, statusKey, extra = '') {
  const state = STATUS[statusKey] || STATUS.no_contactado;
  tooltip.style.setProperty('--tooltip-status', state.dot);
  tooltip.innerHTML = `<strong>${escapeHtml(name)}</strong><span><i style="background:${state.dot}"></i>${escapeHtml(state.label)}${extra ? ` · ${escapeHtml(extra)}` : ''}</span>`;
  tooltip.style.display = 'block';
  const rect = stage.getBoundingClientRect();
  let left = event.clientX - rect.left + 13;
  let top = event.clientY - rect.top + 13;
  const width = tooltip.offsetWidth || 190;
  const height = tooltip.offsetHeight || 50;
  if (left + width > rect.width - 4) left = Math.max(4, left - width - 26);
  if (top + height > rect.height - 4) top = Math.max(4, top - height - 26);
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function hideTooltip(tooltip) {
  tooltip.style.display = 'none';
}

function ensureLegend(stage, statusMap) {
  let legend = document.getElementById('pipelineLegend');
  if (!legend) {
    legend = document.createElement('div');
    legend.id = 'pipelineLegend';
    legend.className = 'pipeline-legend';
    stage.insertAdjacentElement('afterend', legend);
  }
  const counts = Object.fromEntries(Object.keys(STATUS).map(key => [key, 0]));
  for (const item of allMunicipalities) {
    const key = STATUS[statusMap.get(item.name)] ? statusMap.get(item.name) : 'no_contactado';
    counts[key]++;
  }
  legend.innerHTML = `<span class="pipeline-legend-title">Estado comercial</span>${Object.entries(STATUS).map(([key, state]) => `<span class="pipeline-legend-item" style="--legend-color:${state.legend}"><i style="background:${state.dot}"></i>${state.label} <b>${counts[key]}</b></span>`).join('')}`;
}

async function loadPipelineStatuses() {
  const statuses = new Map(allMunicipalities.map(item => [item.name, 'no_contactado']));
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/m88_municipality_pipeline?select=municipality_name,status&order=municipality_name.asc`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`Pipeline ${response.status}`);
    const rows = await response.json();
    for (const row of rows) {
      const name = canonicalName(row.municipality_name);
      if (name && STATUS[row.status]) statuses.set(name, row.status);
    }
    return statuses;
  } catch (error) {
    console.warn('Pipeline municipal no disponible; usando municipios contactados', error);
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/m88_contacted_municipalities?select=municipality_name`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      cache: 'no-store'
    });
    if (response.ok) {
      const rows = await response.json();
      for (const row of rows) {
        const name = canonicalName(row.municipality_name);
        if (name) statuses.set(name, 'contactado');
      }
    }
  } catch (error) {
    console.warn('Seguimiento de municipios no disponible', error);
  }
  return statuses;
}

async function loadGeoFeatures() {
  let lastError = null;
  for (const url of GEO_URLS) {
    try {
      const response = await fetch(url, { cache: 'force-cache' });
      if (!response.ok) throw new Error(`GeoJSON ${response.status}`);
      const data = await response.json();
      const recognized = [];
      for (const feature of data.features || []) {
        const name = featureName(feature);
        if (name) recognized.push({ ...feature, _municipalityName: name });
      }
      const unique = new Map(recognized.map(feature => [feature._municipalityName, feature]));
      if (unique.size < 84) throw new Error(`Solo se reconocieron ${unique.size} municipios`);
      return [...unique.values()];
    } catch (error) {
      lastError = error;
      console.warn('No se pudo cargar una fuente municipal', url, error);
    }
  }
  throw lastError || new Error('No se pudo cargar la geometría municipal');
}

function renderMunicipalityOverlay(svg, stage, features, statusMap) {
  svg.querySelectorAll('.municipality-fill-layer').forEach(node => node.remove());
  svg.querySelectorAll('.island-node.has-municipalities').forEach(node => node.classList.remove('has-municipalities'));

  const tooltip = ensureTooltip(stage);
  const defs = getOrCreateDefs(svg);
  ensurePaintDefs(defs);
  const featureByName = new Map(features.map(feature => [feature._municipalityName, feature]));

  for (const island of islands.filter(item => item.municipalities.length)) {
    const node = svg.querySelector(`.island-node[data-island="${CSS.escape(island.slug)}"]`);
    const oldOutline = node?.querySelector('.island-shape');
    if (!node || !oldOutline) continue;

    const islandFeatures = island.municipalities.map(name => featureByName.get(name)).filter(Boolean);
    if (!islandFeatures.length) continue;

    const geoBounds = islandGeoBounds(islandFeatures);
    const targetBounds = oldOutline.getBBox();
    if (!geoBounds || !targetBounds.width || !targetBounds.height) continue;

    const project = createProjector(geoBounds, targetBounds);
    const fillGroup = document.createElementNS(SVG_NS, 'g');
    fillGroup.classList.add('municipality-fill-layer');
    fillGroup.dataset.island = island.slug;

    for (const feature of islandFeatures) {
      const ring = primaryOuterRing(feature);
      if (!ring) continue;
      const name = feature._municipalityName;
      const statusKey = STATUS[statusMap.get(name)] ? statusMap.get(name) : 'no_contactado';
      const path = document.createElementNS(SVG_NS, 'path');
      path.classList.add('municipality-shape');
      path.dataset.municipality = name;
      path.dataset.status = statusKey;
      path.setAttribute('d', ringPath(ring, project, true));
      path.setAttribute('fill', STATUS[statusKey].paint);
      path.setAttribute('aria-label', `${name}: ${STATUS[statusKey].label}`);
      path.addEventListener('mousemove', event => showTooltip(event, stage, tooltip, name, statusKey, island.name));
      path.addEventListener('mouseleave', () => hideTooltip(tooltip));
      fillGroup.appendChild(path);
    }

    node.insertBefore(fillGroup, oldOutline);
    node.classList.add('has-municipalities');
  }

  renderGraciosa(svg, stage, tooltip, statusMap);
}

function renderGraciosa(svg, stage, tooltip, statusMap) {
  const node = svg.querySelector('.island-node[data-island="la-graciosa"]');
  const oldOutline = node?.querySelector('.island-shape');
  if (!node || !oldOutline) return;

  const statusKey = STATUS[statusMap.get('Teguise')] ? statusMap.get('Teguise') : 'no_contactado';
  const group = document.createElementNS(SVG_NS, 'g');
  group.classList.add('municipality-fill-layer');
  group.dataset.island = 'la-graciosa';

  const path = document.createElementNS(SVG_NS, 'path');
  path.classList.add('municipality-shape');
  path.dataset.municipality = 'Teguise';
  path.dataset.status = statusKey;
  path.setAttribute('d', oldOutline.getAttribute('d') || '');
  path.setAttribute('fill', STATUS[statusKey].paint);
  path.setAttribute('aria-label', `Teguise (La Graciosa): ${STATUS[statusKey].label}`);
  path.addEventListener('mousemove', event => showTooltip(event, stage, tooltip, 'Teguise', statusKey, 'La Graciosa'));
  path.addEventListener('mouseleave', () => hideTooltip(tooltip));
  group.appendChild(path);

  node.insertBefore(group, oldOutline);
  node.classList.add('has-municipalities');
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

async function initMunicipalityMap() {
  const svg = document.querySelector('.canary-map');
  const stage = document.getElementById('archipelagoStage');
  if (!svg || !stage) return;
  ensureStyles();
  const statusMap = await loadPipelineStatuses();
  ensureLegend(stage, statusMap);
  try {
    const features = await loadGeoFeatures();
    renderMunicipalityOverlay(svg, stage, features, statusMap);
  } catch (error) {
    console.warn('Mapa municipal no disponible; se mantiene el mapa insular original', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => void initMunicipalityMap(), { once: true });
} else {
  void initMunicipalityMap();
}
