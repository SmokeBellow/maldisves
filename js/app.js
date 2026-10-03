import { CATS, RARITY, LOCATIONS, SPECIES, BY_ID, POINTS } from './data.js';
import { state, onChange, setSettings, setEntry, live, todayKey } from './store.js';
import { isSeen, seenCount, seenOnDay, bingoCard, bingoMarks, bingoLines, questsFor, questDone, score, badges } from './game.js';
import { getImage, prefetchAll } from './images.js';
import { startSync, syncNow, syncEnabled, status } from './sync.js';
import { artSVG } from './art.js';
import { SCENE_LIST, sceneAt, islandHour, postcardSVG } from './scenes.js';
import { headURL, frames } from './chars.js';

const $app = document.getElementById('app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ui = { tab: 'home', cat: 'all', q: '', sheet: null, real: false, preview: null, scroll: {} };

const PEOPLE = {
  'Маша': { key: 'masha', verb: 'Отметила', ring: '#ff8fa3', bg: '#ffd6e0' },
  'Антон': { key: 'anton', verb: 'Отметил', ring: '#4aa3ff', bg: '#cfe6ff' },
};
const avatar = (name, cls = '') => PEOPLE[name] ? `<span class="av ${cls}" title="${esc(name)}" style="--ring:${PEOPLE[name].ring};background:${PEOPLE[name].bg}"><img src="${headURL(PEOPLE[name].key)}" alt=""></span>` : '';
const stars = r => '★'.repeat(RARITY[r].stars) + '☆'.repeat(5 - RARITY[r].stars);
const art = s => `<div class="photo"><div class="art-wrap${s.cat === 'moments' ? ' mom' : ''}">${artSVG(s.id)}</div></div>`;
const fmtDay = d => d ? `${d.slice(6)}.${d.slice(4, 6)}` : '';
const CAT_ART = { fish: 'clown', giants: 'greenturtle', inverts: 'octopus', land: 'reefheron', moments: 'sunset' };

// ---------- выбор игрока ----------
function renderSetup() {
  $app.innerHTML = `
    <div class="setup">
      <div class="setup-sea">${[0, 1, 2, 3].map(i => `<span class="bubble-s" style="--i:${i}"></span>`).join('')}</div>
      <h1>Мальдивы<br><small>наш покедекс</small></h1>
      <p class="sub">Кто сейчас держит телефон?</p>
      <div class="who">
        ${Object.entries(PEOPLE).map(([n, p]) => `<button class="whobtn" data-who="${n}"><span class="fullspr">${frames(p.key, 'idle').map((u, i) => `<img class="${i ? 'fb' : 'fa'}" src="${u}" alt="">`).join('')}</span><b>${n}</b></button>`).join('')}
      </div>
      <p class="hint">Коллекция у вас общая. Отметки обоих видны сразу.</p>
    </div>`;
}

// ---------- шапка ----------
function header() {
  const sc = score();
  const span = sc.next ? sc.next - sc.base : 1;
  const pct = sc.next ? Math.min(100, ((sc.total - sc.base) / span) * 100) : 100;
  return `
    <header>
      <div class="hrow">
        ${avatar(state.me, 'me')}
        <div class="htxt"><div class="lvl">Ур. ${sc.level} · ${esc(sc.title)}</div><div class="pts">${sc.total} очков</div></div>
        <div class="count">${seenCount()}<small>/${SPECIES.length}</small></div>
      </div>
      <div class="bar"><i style="width:${pct}%"></i></div>
    </header>`;
}

// ---------- Главная ----------
function currentScene() {
  return ui.preview !== null ? SCENE_LIST[ui.preview] : sceneAt(islandHour());
}
function homeView() {
  const sc = currentScene();
  const hr = islandHour();
  const hhmm = `${String(Math.floor(hr)).padStart(2, '0')}:${String(Math.floor((hr % 1) * 60)).padStart(2, '0')}`;
  const pool = sc.suggest.map(id => BY_ID[id]).filter(Boolean);
  const pick = [...pool.filter(s => !isSeen(s.id)), ...pool.filter(s => isSeen(s.id))].slice(0, 4);
  const day = todayKey();
  const qs = questsFor(day), qd = qs.filter(q => questDone(q, day)).length;
  const b = bingoLines(bingoMarks(day));
  return `
    <div class="hero">${sc.svg()}
      <button class="clock" data-clock="1">🕒 ${hhmm} на острове${ui.preview !== null ? ' · предпросмотр' : ''}</button>
      ${ui.preview !== null ? '<button class="clock reset" data-clockreset="1">↺ сейчас</button>' : ''}
    </div>
    <h2 class="stitle">${esc(sc.title)}</h2>
    <p class="sub">${esc(sc.text)}</p>
    <h3>Что сейчас искать</h3>
    <div class="suggest">${pick.map(s => `<button class="mini ${isSeen(s.id) ? 'seen' : 'unseen'}" data-id="${s.id}">${art(s)}<span>${esc(s.ru)}</span>${isSeen(s.id) ? '<span class="tick">✓</span>' : ''}</button>`).join('')}</div>
    <div class="today">
      <button data-tab="dex"><b>${seenOnDay(day).length}</b>найдено сегодня</button>
      <button data-tab="quests"><b>${qd}/${qs.length}</b>задания</button>
      <button data-tab="bingo"><b>${b.lines.length}</b>линий бинго</button>
    </div>`;
}

// ---------- Декс ----------
function dexView() {
  const q = ui.q.trim().toLowerCase();
  const list = SPECIES.filter(s => (ui.cat === 'all' || s.cat === ui.cat) && (!q || s.ru.toLowerCase().includes(q)));
  const chips = [['all', null, 'Все'], ...Object.entries(CATS).map(([k, c]) => [k, CAT_ART[k], c.name])]
    .map(([k, a, n]) => {
      const total = k === 'all' ? SPECIES.length : SPECIES.filter(s => s.cat === k).length;
      const got = k === 'all' ? seenCount() : SPECIES.filter(s => s.cat === k && isSeen(s.id)).length;
      return `<button class="chip ${ui.cat === k ? 'on' : ''}" data-cat="${k}"><span class="ci">${a ? artSVG(a) : '🌊'}</span>${n} <b>${got}/${total}</b></button>`;
    }).join('');
  const cards = list.map((s, i) => {
    const e = live('seen', s.id);
    return `<button class="card r-${s.rar} ${e ? 'seen' : 'unseen'}" data-id="${s.id}" style="--d:${Math.min(i, 12) * 40}ms">
      ${art(s)}${e ? `<span class="tick">✓</span>` : ''}
      <span class="nm">${esc(s.ru)}</span><span class="st">${stars(s.rar)}</span></button>`;
  }).join('');
  return `
    <input id="search" class="search" type="search" placeholder="🔍 Поиск" value="${esc(ui.q)}">
    <div class="chips">${chips}</div>
    <div class="grid">${cards || '<p class="empty">Ничего не найдено</p>'}</div>`;
}

// ---------- Бинго ----------
function bingoView() {
  const day = todayKey();
  const card = bingoCard(day), marks = bingoMarks(day, card), { lines, full } = bingoLines(marks);
  const inLine = new Set(lines.flat());
  const cells = card.map((c, i) => {
    const m = marks[i], cls = `bcell ${m ? 'on' : ''} ${inLine.has(i) ? 'line' : ''}`;
    const who = m ? avatar(m.by, 'by') : '';
    if (c.type === 'species') {
      const s = BY_ID[c.id];
      return `<button class="${cls}" data-id="${s.id}">${art(s)}<span>${esc(s.ru)}</span>${m ? '<span class="tick">✓</span>' : ''}${who}</button>`;
    }
    return `<button class="${cls} act" data-bidx="${i}"><span class="big">💞</span><span>${esc(c.text)}</span>${m ? '<span class="tick">✓</span>' : ''}${who}</button>`;
  }).join('');
  return `
    <h2>Бинго дня</h2>
    <p class="sub">Новая карточка каждый день. Животных и моменты отмечайте в Дексе, они зачтутся сами. Сердечки нажимайте вручную.</p>
    <div class="bgrid">${cells}</div>
    <div class="bstat">Линий: <b>${lines.length}</b> (+${POINTS.bingoLine} за каждую)${full ? ' · 🎉 Полная карточка +' + POINTS.bingoFull : ''}</div>`;
}

// ---------- Задания ----------
function questsView() {
  const day = todayKey();
  const qs = questsFor(day);
  const done = qs.filter(q => questDone(q, day)).length;
  const rows = qs.map(q => {
    const d = questDone(q, day), tag = q.kind === 'manual' ? 'button' : 'div';
    return `<${tag} class="quest ${d ? 'done' : ''}" ${q.kind === 'manual' ? `data-quest="${q.id}"` : ''}>
      <span class="qi">${d ? '✅' : q.kind === 'manual' ? '⬜' : '🎯'}</span>
      <span class="qt">${esc(q.text)}<small>${q.kind === 'manual' ? 'отметьте вручную' : 'зачтётся сама, когда отметите находки'}</small></span>
      ${d && d.by ? avatar(d.by, 'by in') : ''}<span class="qp">+${POINTS.quest}</span></${tag}>`;
  }).join('');
  return `
    <h2>Задания на сегодня</h2>
    <p class="sub">${done}/${qs.length} выполнено${done === qs.length ? ` · 🎉 бонус +${POINTS.questAll}` : ` · за все три бонус +${POINTS.questAll}`}</p>
    <div class="quests">${rows}</div>`;
}

// ---------- Мы ----------
function usView() {
  const sc = score();
  const byWho = {};
  for (const e of Object.values(state.data.seen)) if (!e.del) byWho[e.by] = (byWho[e.by] || 0) + 1;
  const days = {};
  for (const [id, e] of Object.entries(state.data.seen)) if (!e.del && e.d) (days[e.d] ||= []).push(id);
  const timeline = Object.keys(days).sort().reverse().map(d =>
    `<div class="day"><b>${fmtDay(d)}</b><span class="dthumbs">${days[d].slice(0, 8).map(id => `<i>${artSVG(id)}</i>`).join('')}</span><small>${days[d].length}</small></div>`).join('')
    || '<p class="empty">Пока пусто. Самое время плыть к рифу!</p>';
  const best = SPECIES.filter(s => isSeen(s.id)).sort((a, b) => RARITY[b.rar].pts - RARITY[a.rar].pts).slice(0, 6)
    .map(s => `<button class="pill" data-id="${s.id}"><i>${artSVG(s.id)}</i>${esc(s.ru)}</button>`).join('');
  const bd = badges().map(b => `<div class="badge ${b.ok ? 'ok' : ''}"><span>${b.emoji}</span>${esc(b.name)}</div>`).join('');
  const who = Object.entries(byWho).map(([n, c]) => `${avatar(n, 'tiny')} ${esc(n)}: ${c}`).join(' &nbsp; ') || '—';
  return `
    <h2>Наша поездка</h2>
    <div class="polaroid"><div class="pcard">${postcardSVG()}</div><span class="tape"></span><p>Маша и Антон · Furaveri</p></div>
    <div class="stats">
      <div><b>${seenCount()}</b>видов</div><div><b>${sc.speciesPts}</b>за находки</div>
      <div><b>${sc.questPts}</b>за задания</div><div><b>${sc.bingoPts}</b>за бинго</div>
    </div>
    <p class="sub who-line">Отметили: ${who}</p>
    ${best ? `<h3>Лучшие находки</h3><div class="pills">${best}</div>` : ''}
    <h3>Значки</h3><div class="badges">${bd}</div>
    <h3>По дням</h3><div class="timeline">${timeline}</div>
    <h3>Настройки</h3>
    <div class="settings">
      <div>Играет: ${avatar(state.me, 'tiny')} <b>${esc(state.me)}</b></div>
      <div id="syncline">Синхронизация: ${syncEnabled() ? `<b class="${status.ok ? 'ok' : 'bad'}">${status.text}</b>` : '<b class="bad">не настроена</b>'}</div>
      <button class="btn ghost" id="syncbtn">🔄 Синхронизировать сейчас</button>
      <button class="btn ghost" id="offline">📥 Скачать реальные фото для офлайна</button>
      <div id="offprog" class="hint"></div>
      <button class="btn ghost" id="switch">Сменить игрока</button>
    </div>`;
}

// ---------- карточка существа ----------
function sheetView() {
  const s = BY_ID[ui.sheet];
  if (!s) return '';
  const e = live('seen', s.id);
  const locs = LOCATIONS.map(l => `<button class="loc ${state.lastLoc === l ? 'on' : ''}" data-loc="${esc(l)}">${esc(l)}</button>`).join('');
  return `<div class="overlay" data-close="1"><div class="sheet r-${s.rar}">
    <button class="x" data-close="1">✕</button>
    <div class="hero-art ${e ? 'seen' : 'unseen'}">
      ${ui.real ? `<div class="real"><img data-wiki="${esc(s.wiki)}" data-ru="${esc(s.ru)}" alt=""><span class="emo">Загружаю фото…</span></div>` : art(s)}
    </div>
    <h2>${esc(s.ru)}</h2>
    <div class="meta"><span class="rar">${stars(s.rar)} ${RARITY[s.rar].name}</span><span>+${RARITY[s.rar].pts} очк.</span></div>
    <p class="fact">${esc(s.fact)}</p>
    <p class="where">📍 Где искать: ${esc(s.spot)}</p>
    <button class="link" id="realtoggle">${ui.real ? '← Вернуть рисунок' : '📷 Как выглядит в жизни'}</button>
    ${e
      ? `<div class="seenbox">${avatar(e.by, 'tiny')} ${(PEOPLE[e.by]?.verb) || 'Отметил(а)'} <b>${esc(e.by)}</b>, ${fmtDay(e.d)}${e.loc ? ' · ' + esc(e.loc) : ''}</div>
         <button class="btn ghost" id="unmark">Снять отметку</button>`
      : `<div class="locs"><small>Где увидели (необязательно):</small>${locs}</div>
         <button class="btn big" id="mark">Видели! ✨</button>`}
  </div></div>`;
}

// ---------- каркас ----------
const TABS = [['home', '🏝️', 'Дом'], ['dex', '📖', 'Декс'], ['bingo', '🎲', 'Бинго'], ['quests', '🎯', 'Задания'], ['us', '💑', 'Мы']];

function render() {
  if (!state.me || !PEOPLE[state.me]) return renderSetup();
  const prev = document.querySelector('main');
  if (prev) ui.scroll[ui.tab] = prev.scrollTop;
  const search = document.activeElement?.id === 'search';
  const views = { home: homeView, dex: dexView, bingo: bingoView, quests: questsView, us: usView };
  $app.innerHTML = `${header()}<main class="tab-${ui.tab}">${views[ui.tab]()}</main>
    <nav>${TABS.map(([k, e, n]) => `<button class="${ui.tab === k ? 'on' : ''}" data-tab="${k}"><span>${e}</span>${n}</button>`).join('')}</nav>
    ${sheetView()}`;
  document.querySelector('main').scrollTop = ui.scroll[ui.tab] || 0;
  if (search) { const el = document.getElementById('search'); el.focus(); el.setSelectionRange(99, 99); }
  const real = document.querySelector('img[data-wiki]');
  if (real) getImage(real.dataset.wiki, real.dataset.ru).then(url => {
    if (!url) return (real.nextElementSibling.textContent = 'Фото не нашлось');
    real.onload = () => { real.classList.add('loaded'); real.nextElementSibling.remove(); };
    real.onerror = () => (real.nextElementSibling.textContent = 'Фото не загрузилось');
    real.src = url;
  });
}

function celebrate(s) {
  const el = document.createElement('div');
  el.className = 'burst';
  el.innerHTML = `<div class="burst-card"><div class="bart">${artSVG(s.id)}</div><b>${esc(s.ru)}</b><span>Новая находка! +${RARITY[s.rar].pts}</span></div>` +
    Array.from({ length: 18 }, (_, i) => `<i style="--a:${i * 20}deg;--d:${60 + (i % 3) * 30}px">${['✨', '🫧', '⭐', '🐚'][i % 4]}</i>`).join('');
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2000);
  navigator.vibrate?.(40);
}

// ---------- события ----------
$app.addEventListener('click', ev => {
  const t = ev.target.closest('[data-who],[data-tab],[data-cat],[data-id],[data-close],[data-loc],[data-bidx],[data-quest],[data-clock],[data-clockreset],button[id]');
  if (!t) return;
  if (t.dataset.who) { setSettings({ me: t.dataset.who }); ui.tab = 'home'; syncNow(); return; }
  if (t.dataset.clock) { ui.preview = ui.preview === null ? (SCENE_LIST.indexOf(sceneAt(islandHour())) + 1) % SCENE_LIST.length : (ui.preview + 1) % SCENE_LIST.length; return render(); }
  if (t.dataset.clockreset) { ui.preview = null; return render(); }
  if (t.dataset.tab) { ui.tab = t.dataset.tab; ui.sheet = null; ui.real = false; return render(); }
  if (t.dataset.cat) { ui.cat = t.dataset.cat; return render(); }
  if (t.dataset.close && (ev.target === t || t.classList.contains('x'))) { ui.sheet = null; ui.real = false; return render(); }
  if (t.dataset.loc) { setSettings({ lastLoc: state.lastLoc === t.dataset.loc ? '' : t.dataset.loc }); return; }
  if (t.dataset.id && !t.closest('.sheet')) { ui.sheet = t.dataset.id; ui.real = false; return render(); }
  if (t.dataset.bidx !== undefined) {
    const key = `d${todayKey()}_${t.dataset.bidx}`;
    return setEntry('bingo', key, { del: !!live('bingo', key) });
  }
  if (t.dataset.quest) {
    const key = `d${todayKey()}_${t.dataset.quest}`;
    return setEntry('quests', key, { del: !!live('quests', key) });
  }
  switch (t.id) {
    case 'mark': {
      const s = BY_ID[ui.sheet];
      setEntry('seen', s.id, { d: todayKey(), loc: state.lastLoc || '', del: false });
      ui.sheet = null; ui.real = false; render(); celebrate(s); syncNow(); break;
    }
    case 'unmark':
      if (confirm('Снять отметку?')) { setEntry('seen', ui.sheet, { d: '', loc: '', del: true }); ui.sheet = null; render(); syncNow(); }
      break;
    case 'realtoggle': ui.real = !ui.real; render(); break;
    case 'offline': {
      const out = document.getElementById('offprog');
      prefetchAll(SPECIES.map(s => ({ wiki: s.wiki, ru: s.ru })), (d, n) => { out.textContent = `Загружено ${d}/${n}`; })
        .then(() => { out.textContent += ' · готово, фото доступны без сети'; });
      break;
    }
    case 'syncbtn': syncNow(); break;
    case 'switch': setSettings({ me: '' }); break;
  }
});
$app.addEventListener('input', ev => {
  if (ev.target.id === 'search') { ui.q = ev.target.value; render(); }
});

onChange(() => { if (state.me) render(); });
document.addEventListener('syncstatus', () => { if (ui.tab === 'us' && !ui.sheet) render(); });

// главная сама меняется по времени суток
let lastKey = '';
setInterval(() => {
  if (ui.tab !== 'home' || ui.preview !== null || ui.sheet || !state.me) return;
  const k = sceneAt(islandHour()).key + Math.floor(islandHour() * 60);
  if (k !== lastKey) { lastKey = k; render(); }
}, 20000);

render();
startSync();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
