// Игровая логика: очки, бинго дня, квесты дня. Всё выводится из синхронизируемых отметок.
import { SPECIES, BY_ID, RARITY, RARITY_ORDER, BINGO_ACTIONS, QUESTS, LEVELS, POINTS } from './data.js';
import { state, live, todayKey } from './store.js';

// --- детерминированный генератор по строке ---
function hash(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return (h ^= h >>> 16) >>> 0; };
}
export function rng(seed) {
  let a = hash(seed)();
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function pick(rand, arr, n) {
  const a = [...arr], out = [];
  while (out.length < n && a.length) out.push(a.splice(Math.floor(rand() * a.length), 1)[0]);
  return out;
}
function shuffle(rand, arr) { return pick(rand, arr, arr.length); }

// --- что видели ---
export const isSeen = id => !!live('seen', id);
export const seenCount = () => SPECIES.filter(s => isSeen(s.id)).length;
export const seenOnDay = day => SPECIES.filter(s => { const e = live('seen', s.id); return e && e.d === day; });

// --- бинго дня ---
export function bingoCard(day) {
  const rand = rng(`${state.room}|bingo|${day}`);
  const byRar = r => SPECIES.filter(s => s.rar === r && s.cat !== 'moments');
  const moments = SPECIES.filter(s => s.cat === 'moments' && s.rar !== 'legendary');
  const cells = [
    ...pick(rand, byRar('common'), 2),
    ...pick(rand, byRar('uncommon'), 2),
    ...pick(rand, [...byRar('rare'), ...byRar('epic')], 1),
    ...pick(rand, moments, 1),
  ].map(s => ({ type: 'species', id: s.id }));
  cells.push(...pick(rand, BINGO_ACTIONS, 3).map(text => ({ type: 'action', text })));
  return shuffle(rand, cells);
}

export function bingoMarks(day, card = bingoCard(day)) {
  return card.map((c, i) => {
    if (c.type === 'species') {
      const e = live('seen', c.id);
      return e && e.d === day ? { by: e.by, auto: true } : null;
    }
    const e = live('bingo', `d${day}_${i}`);
    return e ? { by: e.by } : null;
  });
}

const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
export function bingoLines(marks) {
  const lines = LINES.filter(l => l.every(i => marks[i]));
  return { lines, full: marks.every(Boolean) };
}

// --- квесты дня ---
export function questsFor(day) {
  const rand = rng(`${state.room}|quests|${day}`);
  const auto = pick(rand, QUESTS.filter(q => q.kind === 'auto'), 2);
  const manual = pick(rand, QUESTS.filter(q => q.kind === 'manual'), 1);
  return [...auto, ...manual];
}
export function questDone(q, day) {
  if (q.kind === 'manual') return live('quests', `d${day}_${q.id}`);
  return q.test({ today: seenOnDay(day) }) ? { auto: true } : null;
}

// --- дни с активностью ---
function activeDays() {
  const days = new Set([todayKey()]);
  for (const e of Object.values(state.data.seen)) if (e.d) days.add(e.d);
  for (const map of ['bingo', 'quests'])
    for (const k of Object.keys(state.data[map])) days.add(k.slice(1, 9));
  return [...days].filter(d => d <= todayKey());
}

export function score() {
  let speciesPts = 0, questPts = 0, bingoPts = 0;
  for (const s of SPECIES) if (isSeen(s.id)) speciesPts += RARITY[s.rar].pts;
  for (const day of activeDays()) {
    const qs = questsFor(day);
    const done = qs.filter(q => questDone(q, day)).length;
    questPts += done * POINTS.quest + (done === qs.length ? POINTS.questAll : 0);
    const b = bingoLines(bingoMarks(day));
    bingoPts += b.lines.length * POINTS.bingoLine + (b.full ? POINTS.bingoFull : 0);
  }
  const total = speciesPts + questPts + bingoPts;
  let lvl = 0;
  LEVELS.forEach(([min], i) => { if (total >= min) lvl = i; });
  const next = LEVELS[lvl + 1];
  return { speciesPts, questPts, bingoPts, total, level: lvl + 1, title: LEVELS[lvl][1], next: next ? next[0] : null, base: LEVELS[lvl][0] };
}

// --- значки ---
export function badges() {
  const out = [];
  const cats = [...new Set(SPECIES.map(s => s.cat))];
  const n = seenCount();
  out.push({ emoji: '🌱', name: 'Первая находка', ok: n >= 1 });
  out.push({ emoji: '🔟', name: '10 видов', ok: n >= 10 });
  out.push({ emoji: '🏅', name: '25 видов', ok: n >= 25 });
  out.push({ emoji: '🏆', name: 'Половина каталога', ok: n >= SPECIES.length / 2 });
  out.push({ emoji: '👑', name: 'Весь каталог', ok: n === SPECIES.length });
  out.push({ emoji: '🐢', name: 'Друг черепах', ok: isSeen('greenturtle') || isSeen('hawksbill') });
  out.push({ emoji: '🦈', name: 'Встреча с акулой', ok: ['blacktip', 'whitetip', 'greyreef', 'nurse', 'whaleshark'].some(isSeen) });
  out.push({ emoji: '💎', name: 'Легенда', ok: SPECIES.some(s => s.rar === 'legendary' && isSeen(s.id)) });
  return out;
}

export const rarityIdx = r => RARITY_ORDER.indexOf(r);
export const speciesById = id => BY_ID[id];
