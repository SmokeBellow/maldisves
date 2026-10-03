// Скан по фото: нейросеть CLIP работает прямо в браузере (transformers.js) и сравнивает снимок
// с каталогом. Фото никуда не отправляется, из сети скачивается только сама модель (один раз).
import { SPECIES } from './data.js';

const LIB = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';
const MODEL = 'Xenova/clip-vit-base-patch32';
export const READY_KEY = 'maldisves.scanReady';

let clf = null, loading = null;
// подпись для модели: английское название из Википедии
const labelOf = s => s.wiki.toLowerCase();
const BY_LABEL = new Map(SPECIES.map(s => [labelOf(s), s]));

export const scanReady = () => { try { return !!localStorage.getItem(READY_KEY); } catch { return false; } };

async function load(onProgress) {
  if (clf) return clf;
  loading ||= (async () => {
    const { pipeline, env } = await import(LIB);
    env.allowLocalModels = false;
    clf = await pipeline('zero-shot-image-classification', MODEL, { progress_callback: onProgress });
    try { localStorage.setItem(READY_KEY, '1'); } catch {}
    return clf;
  })();
  try { return await loading; } finally { loading = null; }
}

// file: снимок из камеры или галереи -> [{species, score}] по убыванию вероятности
export async function identify(file, onProgress = () => {}) {
  const c = await load(onProgress);
  const url = URL.createObjectURL(file);
  try {
    const out = await c(url, SPECIES.map(labelOf));
    return out.slice(0, 4).map(r => ({ species: BY_LABEL.get(r.label), score: r.score })).filter(r => r.species);
  } finally { URL.revokeObjectURL(url); }
}
