import { supabase } from './supabase-client.js';

/*
 * Analítica propia de Constelación 8.
 * Solo guardamos identificadores seudónimos, navegación interna y datos técnicos básicos.
 * No se guarda la IP, el texto escrito en búsquedas ni la URL completa de procedencia.
 */

const VISITOR_KEY = 'c8-visitor-v1';
const SESSION_KEY = 'c8-session-v1';
const VISITOR_TTL_MS = 90 * 24 * 60 * 60 * 1000;

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.random() * 16 | 0;
    const value = char === 'x' ? random : (random & 0x3 | 0x8);
    return value.toString(16);
  });
}

function getVisitorId() {
  try {
    const now = Date.now();
    const stored = JSON.parse(localStorage.getItem(VISITOR_KEY) || 'null');
    if (stored?.id && stored?.expiresAt > now) {
      localStorage.setItem(VISITOR_KEY, JSON.stringify({ id: stored.id, expiresAt: now + VISITOR_TTL_MS }));
      return stored.id;
    }
    const id = createId();
    localStorage.setItem(VISITOR_KEY, JSON.stringify({ id, expiresAt: now + VISITOR_TTL_MS }));
    return id;
  } catch (_) {
    return createId();
  }
}

function getSessionId() {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = createId();
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch (_) {
    return createId();
  }
}

function getDevice() {
  const width = Math.min(window.innerWidth || 9999, screen?.width || 9999);
  if (width < 720) return 'mobile';
  if (width < 1100) return 'tablet';
  return 'desktop';
}

function getReferrerHost() {
  if (!document.referrer) return null;
  try {
    const host = new URL(document.referrer).hostname;
    return host && host !== location.hostname ? host.slice(0, 255) : null;
  } catch (_) {
    return null;
  }
}

const visitorId = getVisitorId();
const sessionId = getSessionId();
const baseEvent = {
  visitor_id: visitorId,
  session_id: sessionId,
  path: location.pathname.slice(0, 500) || '/',
  referrer_host: getReferrerHost(),
  device: getDevice(),
  locale: (navigator.language || '').slice(0, 32) || null
};

function cleanText(value, maxLength) {
  if (typeof value !== 'string') return null;
  const cleaned = value.trim();
  return cleaned ? cleaned.slice(0, maxLength) : null;
}

async function track(eventType, details = {}) {
  const payload = {
    ...baseEvent,
    event_type: eventType,
    person_slug: cleanText(details.personSlug, 160),
    person_name: cleanText(details.personName, 220),
    source_person_slug: cleanText(details.sourcePersonSlug, 160),
    source_person_name: cleanText(details.sourcePersonName, 220),
    island_slug: cleanText(details.islandSlug, 80)
  };

  try {
    await supabase.from('analytics_events').insert(payload);
  } catch (_) {
    // La analítica nunca debe interferir con la navegación del atlas.
  }
}

window.C8Analytics = { track };

track('page_view');

document.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  const islandNode = target.closest('.island-node');
  if (islandNode?.dataset.island) {
    track('island_open', { islandSlug: islandNode.dataset.island });
    return;
  }

  const islandChip = target.closest('[data-island-select]');
  if (islandChip?.dataset.islandSelect) {
    track('island_open', { islandSlug: islandChip.dataset.islandSelect });
    return;
  }

  const related = target.closest('[data-related]');
  if (related?.dataset.related) {
    const sourceProfile = document.querySelector('.profile');
    const sourceName = sourceProfile?.querySelector('h3')?.textContent || null;
    const sourceSlug = sourceProfile?.dataset.personSlug || null;
    const personName = related.querySelector('strong')?.textContent || null;
    const personSlug = related.dataset.related;

    track('connection_open', {
      personSlug,
      personName,
      sourcePersonSlug: sourceSlug,
      sourcePersonName: sourceName
    });
    track('profile_open', { personSlug, personName });
    return;
  }

  const person = target.closest('[data-person]');
  if (person?.dataset.person) {
    track('profile_open', {
      personSlug: person.dataset.person,
      personName: person.querySelector('strong')?.textContent || null
    });
  }
}, true);

let searchTimer = null;
document.addEventListener('input', (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.id !== 'searchPeople') return;
  clearTimeout(searchTimer);
  if (input.value.trim().length < 2) return;
  searchTimer = setTimeout(() => track('search', { islandSlug: document.querySelector('.island-node.active')?.dataset.island || null }), 900);
});
