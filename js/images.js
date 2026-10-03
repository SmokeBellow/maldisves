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

// Викимедиа отдаёт только стандартные ширины миниатюр (330, 500, 960...), 480 даёт ошибку
const big = u => u.replace(/\/(\d+)px-/, '/500px-');
async function viaSummary(title) {
  const r = await fetch(api(title));
  if (!r.ok) return null;
  const j = await r.json();
  return j.thumbnail?.source || j.originalimage?.source || null;
}
// поиск по статьям: берём первую подходящую статью, у которой есть картинка
async function viaSearch(lang, query) {
  const q = new URLSearchParams({ action: 'query', format: 'json', origin: '*', generator: 'search', gsrsearch: query, gsrlimit: '6',
    prop: 'pageimages', piprop: 'thumbnail', pithumbsize: '500', redirects: '1' });
  const r = await fetch(`https://${lang}.wikipedia.org/w/api.php?${q}`);
  if (!r.ok) return null;
  const pages = Object.values((await r.json()).query?.pages || {}).filter(p => p.thumbnail).sort((a, b) => a.index - b.index);
  return pages[0]?.thumbnail.source || null;
}

async function fetchUrl(title, ru) {
  let url = null;
  for (const step of [() => viaSummary(title), () => viaSearch('en', title), () => ru && viaSearch('ru', ru)]) {
    try { url = await step(); } catch {}
    if (url) break;
  }
  if (!url) throw new Error('no image');
  url = big(url);
  mem.set(title, url);
  try { localStorage.setItem(KEY + title, url); } catch {}
  return url;
}

function pump() {
  while (active < 4 && queue.length) {
    const job = queue.shift();
    active++;
    fetchUrl(job.title, job.ru).then(job.resolve, () => job.resolve(null)).finally(() => { active--; pump(); });
  }
}

export function getImage(title, ru = '') {
  const c = cachedUrl(title);
  if (c) return Promise.resolve(c);
  return new Promise(resolve => { queue.push({ title, ru, resolve }); pump(); });
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
export async function prefetchAll(items, onProgress) {
  let done = 0;
  const titles = items;
  await Promise.all(items.map(async ({ wiki, ru }) => {
    const url = await getImage(wiki, ru);
    if (url) await new Promise(res => { const i = new Image(); i.onload = i.onerror = res; i.src = url; });
    onProgress(++done, titles.length);
  }));
}

// Ленивая подгрузка фото: картинка запрашивается, когда карточка попадает в экран
export function lazyPhotos(root) {
  const imgs = [...root.querySelectorAll('img[data-wiki]:not([data-done])')];
  const fail = img => img.closest('.wphoto, .wbig')?.classList.add('nophoto');
  const load = img => {
    img.dataset.done = '1';
    getImage(img.dataset.wiki, img.dataset.ru).then(url => {
      if (!url) return fail(img);
      img.onload = () => img.classList.add('loaded');
      img.onerror = () => fail(img);
      img.src = url;
    });
  };
  if (!('IntersectionObserver' in window)) return imgs.forEach(load);
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); load(e.target); } }), { rootMargin: '300px' });
  imgs.forEach(i => io.observe(i));
}
