import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const API_BASE = 'https://api.porkbun.com/api/json/v3';
const config = JSON.parse(await fs.readFile(new URL('../dns/porkbun.json', import.meta.url), 'utf8'));

if (!config.enabled) {
  console.log('Porkbun DNS sync is disabled in dns/porkbun.json.');
  process.exit(0);
}

const apiKey = process.env.PORKBUN_API_KEY;
const secretApiKey = process.env.PORKBUN_SECRET_API_KEY;
if (!apiKey || !secretApiKey) {
  throw new Error('Missing PORKBUN_API_KEY or PORKBUN_SECRET_API_KEY GitHub Actions secret.');
}

const domain = String(config.domain || '').trim().toLowerCase();
if (!domain) throw new Error('dns/porkbun.json is missing domain.');

const desired = Array.isArray(config.records) ? config.records : [];
if (!desired.length) throw new Error('dns/porkbun.json has no records to manage.');

const authHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'X-API-Key': apiKey,
  'X-Secret-API-Key': secretApiKey,
};

function normalizeName(name = '') {
  const value = String(name).trim().replace(/\.$/, '').toLowerCase();
  if (!value || value === '@' || value === domain) return '';
  if (value.endsWith(`.${domain}`)) return value.slice(0, -(domain.length + 1));
  return value;
}

function key(record) {
  return `${String(record.type).toUpperCase()}|${normalizeName(record.name)}`;
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { ...authHeaders };
  if (method === 'POST') headers['Idempotency-Key'] = crypto.randomUUID();
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!response.ok || data.status === 'ERROR') {
    throw new Error(`Porkbun ${method} ${path} failed (${response.status}): ${data.code || ''} ${data.message || text}`.trim());
  }
  return data;
}

const currentPayload = await request(`/dns/retrieve/${encodeURIComponent(domain)}`);
const current = Array.isArray(currentPayload.records) ? currentPayload.records : [];
const desiredKeys = new Set(desired.map(key));

const currentManaged = current.filter(record => desiredKeys.has(key(record)));
const keepIds = new Set();
const creates = [];
const deletes = [];

for (const wanted of desired) {
  const wantedKey = key(wanted);
  const matches = currentManaged.filter(record => key(record) === wantedKey);
  const exact = matches.find(record => String(record.content).replace(/\.$/, '') === String(wanted.content).replace(/\.$/, ''));
  if (exact) keepIds.add(String(exact.id));
  else creates.push(wanted);
}

for (const record of currentManaged) {
  if (!keepIds.has(String(record.id))) deletes.push(record);
}

console.log(`Domain: ${domain}`);
console.log(`Managed desired records: ${desired.length}`);
console.log(`Create: ${creates.length} · Delete/replace: ${deletes.length}`);

if (config.dryRun) {
  console.log('Dry-run mode is enabled. No Porkbun DNS changes were made.');
  console.log(JSON.stringify({ creates, deletes: deletes.map(r => ({ id: r.id, type: r.type, name: r.name, content: r.content })) }, null, 2));
  process.exit(0);
}

for (const record of deletes) {
  await request(`/dns/delete/${encodeURIComponent(domain)}/${encodeURIComponent(record.id)}`, {
    method: 'POST',
    body: {},
  });
  console.log(`Deleted ${record.type} ${record.name} -> ${record.content}`);
}

for (const record of creates) {
  const payload = {
    type: String(record.type).toUpperCase(),
    content: String(record.content),
    ttl: String(record.ttl || '600'),
  };
  const name = normalizeName(record.name);
  if (name) payload.name = name;
  if (record.prio !== undefined) payload.prio = String(record.prio);

  await request(`/dns/create/${encodeURIComponent(domain)}`, {
    method: 'POST',
    body: payload,
  });
  console.log(`Created ${payload.type} ${name || '@'} -> ${payload.content}`);
}

console.log('Porkbun DNS sync completed successfully.');
