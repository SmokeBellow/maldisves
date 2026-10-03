// Синхронизация через Firestore REST API. Один документ rooms/<код> на пару.
import { FIREBASE } from '../config.js';
import { state, mergeRemote, clearDirty, MAPS } from './store.js';

export const syncEnabled = () => !!(FIREBASE.apiKey && FIREBASE.projectId);
export const status = { text: syncEnabled() ? 'ожидание' : 'выключена', ok: false };

const docUrl = () =>
  `https://firestore.googleapis.com/v1/projects/${FIREBASE.projectId}/databases/(default)/documents/rooms/${encodeURIComponent(state.room)}`;

export function encodeEntry(e) {
  const fields = {};
  for (const [k, v] of Object.entries(e)) {
    if (typeof v === 'string') fields[k] = { stringValue: v };
    else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
    else if (Number.isInteger(v)) fields[k] = { integerValue: String(v) };
  }
  return { mapValue: { fields } };
}

export function decodeEntry(v) {
  const out = {};
  for (const [k, f] of Object.entries(v.mapValue?.fields || {})) {
    if ('stringValue' in f) out[k] = f.stringValue;
    else if ('booleanValue' in f) out[k] = f.booleanValue;
    else if ('integerValue' in f) out[k] = Number(f.integerValue);
  }
  return out;
}

export function decodeDoc(doc) {
  const out = {};
  for (const map of MAPS) {
    const fields = doc?.fields?.[map]?.mapValue?.fields || {};
    out[map] = Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, decodeEntry(v)]));
  }
  return out;
}

export function buildPatch(paths, data) {
  const fields = {};
  for (const p of paths) {
    const [map, ...rest] = p.split('.');
    const key = rest.join('.');
    const entry = data[map]?.[key];
    if (!entry) continue;
    fields[map] ??= { mapValue: { fields: {} } };
    fields[map].mapValue.fields[key] = encodeEntry(entry);
  }
  return fields;
}

async function pull() {
  const r = await fetch(`${docUrl()}?key=${FIREBASE.apiKey}`);
  if (r.status === 404) return {};
  if (!r.ok) throw new Error(`pull ${r.status}`);
  return decodeDoc(await r.json());
}

async function push() {
  const paths = Object.keys(state.dirty);
  if (!paths.length) return;
  const fields = buildPatch(paths, state.data);
  const q = new URLSearchParams({ key: FIREBASE.apiKey });
  for (const p of paths) {
    const [map, ...rest] = p.split('.');
    q.append('updateMask.fieldPaths', `${map}.\`${rest.join('.')}\``);
  }
  const r = await fetch(`${docUrl()}?${q}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  if (!r.ok) throw new Error(`push ${r.status}`);
  clearDirty(paths);
}

let busy = false;
export async function syncNow() {
  if (!syncEnabled() || !state.room || busy) return;
  busy = true;
  try {
    mergeRemote(await pull());
    await push();
    status.ok = true; status.text = 'на связи';
  } catch (e) {
    status.ok = false; status.text = navigator.onLine ? 'ошибка связи' : 'нет сети';
  } finally {
    busy = false;
    document.dispatchEvent(new Event('syncstatus'));
  }
}

export function startSync() {
  if (!syncEnabled()) return;
  syncNow();
  setInterval(() => { if (!document.hidden) syncNow(); }, 8000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) syncNow(); });
  window.addEventListener('online', syncNow);
}
