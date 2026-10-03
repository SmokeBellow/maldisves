// Локальное состояние + слияние с удалённым (last-write-wins по каждой записи).
const LS = 'maldisves.v1';
export const MAPS = ['seen', 'bingo', 'quests'];

const blank = () => ({ me: '', room: '', lastLoc: '', data: { seen: {}, bingo: {}, quests: {} }, dirty: {} });

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(LS));
    if (s && s.data) return { ...blank(), ...s, data: { ...blank().data, ...s.data } };
  } catch {}
  return blank();
}

export const state = load();
const listeners = new Set();
export const onChange = fn => listeners.add(fn);
const emit = () => listeners.forEach(fn => fn());

export function save() {
  try { localStorage.setItem(LS, JSON.stringify(state)); } catch {}
}

export function setSettings(patch) {
  Object.assign(state, patch);
  save(); emit();
}

export const todayKey = (d = new Date()) =>
  `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;

// Записать запись в карту (seen/bingo/quests); значение всегда содержит t и by
export function setEntry(map, key, value) {
  const entry = { ...value, by: state.me, t: Date.now() };
  state.data[map][key] = entry;
  state.dirty[`${map}.${key}`] = 1;
  save(); emit();
}

export const live = (map, key) => {
  const e = state.data[map][key];
  return e && !e.del ? e : null;
};

// Слияние удалённых данных: побеждает запись с большим t
export function mergeRemote(remote) {
  let changed = false;
  for (const map of MAPS) {
    for (const [key, entry] of Object.entries(remote[map] || {})) {
      const local = state.data[map][key];
      if (!local || (entry.t || 0) > (local.t || 0)) {
        state.data[map][key] = entry;
        delete state.dirty[`${map}.${key}`];
        changed = true;
      }
    }
  }
  if (changed) { save(); emit(); }
  return changed;
}

export function clearDirty(paths) {
  paths.forEach(p => delete state.dirty[p]);
  save();
}
