// Фото берутся из Википедии (миниатюра статьи) и кэшируются: ссылка — в localStorage,
// сама картинка — в кэше service worker. Без сети показываем эмодзи.
const KEY = 'maldisves.img.';
const mem = new Map();
const queue = [];
let active = 0;

const api = title => `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`;

export function cachedUrl(title) {
  if (mem.has(title)) return mem.get(title);
  try {
    const v = localStorage.getItem(KEY + title);
    if (v) { mem.set(title, v); return v; }
  } catch {}
  return null;
}

async function fetchUrl(title) {
  const r = await fetch(api(title));
  if (!r.ok) throw new Error(r.status);
  const j = await r.json();
  let url = j.thumbnail?.source || j.originalimage?.source;
  if (!url) throw new Error('no image');
  url = url.replace(/\/(\d+)px-/, '/480px-');
  mem.set(title, url);
  try { localStorage.setItem(KEY + title, url); } catch {}
  return url;
}

function pump() {
  while (active < 4 && queue.length) {
    const job = queue.shift();
    active++;
    fetchUrl(job.title).then(job.resolve, () => job.resolve(null)).finally(() => { active--; pump(); });
  }
}

export function getImage(title) {
  const c = cachedUrl(title);
  if (c) return Promise.resolve(c);
  return new Promise(resolve => { queue.push({ title, resolve }); pump(); });
}

// Подставить фото во все <img data-wiki>, пока без картинки показывается эмодзи
export function hydrate(root) {
  root.querySelectorAll('img[data-wiki]:not([data-done])').forEach(img => {
    img.dataset.done = '1';
    getImage(img.dataset.wiki).then(url => {
      if (!url) return;
      img.onload = () => img.classList.add('loaded');
      img.onerror = () => img.remove();
      img.src = url;
    });
  });
}

// Загрузить всё заранее (на вилле, пока есть Wi-Fi)
export async function prefetchAll(titles, onProgress) {
  let done = 0;
  await Promise.all(titles.map(async t => {
    const url = await getImage(t);
    if (url) await new Promise(res => { const i = new Image(); i.onload = i.onerror = res; i.src = url; });
    onProgress(++done, titles.length);
  }));
}
