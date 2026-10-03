import { CATS, RARITY, LOCATIONS, SPECIES, BY_ID, BINGO_ACTIONS, POINTS } from './data.js';
import { state, onChange, setSettings, setEntry, live, todayKey } from './store.js';
import { isSeen, seenCount, bingoCard, bingoMarks, bingoLines, questsFor, questDone, score, badges } from './game.js';
import { hydrate, prefetchAll } from './images.js';
import { startSync, syncNow, syncEnabled, status } from './sync.js';

const $app = document.getElementById('app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ui = { tab: 'dex', cat: 'all', q: '', sheet: null, scroll: {} };

const stars = r => '★'.repeat(RARITY[r].stars) + '☆'.repeat(5 - RARITY[r].stars);
const photo = s => `<div class="photo"><span class="emo">${s.emoji}</span><img data-wiki="${esc(s.wiki)}" alt=""></div>`;

// ---------- первый запуск ----------
function renderSetup() {
  const fromUrl = new URLSearchParams(location.hash.slice(1)).get('room') || '';
  $app.innerHTML = `
    <div class="setup">
      <div class="logo">🐠</div>
      <h1>Мальдивский<br>Покедекс</h1>
      <p>Общая коллекция для двоих: отмечаем всех, кого увидели на Фураверы.</p>
      <label>Как тебя зовут?<input id="name" maxlength="20" placeholder="Например, Аня" autocomplete="off"></label>
      <label>Код вашей комнаты<input id="room" maxlength="24" value="${esc(fromUrl)}" placeholder="Придумай или вставь код" autocapitalize="off" autocomplete="off"></label>
      <p class="hint">Код — общий для вас двоих. Один создаёт (кнопка ниже), второй вводит тот же или открывает присланную ссылку.</p>
      <button class="btn ghost" id="gen">🎲 Придумать код</button>
      <button class="btn" id="go">Поехали!</button>
    </div>`;
  const room = document.getElementById('room');
  document.getElementById('gen').onclick = () => {
    const w = ['rif', 'manta', 'kokos', 'dhoni', 'laguna', 'atoll', 'pearl', 'palma'];
    room.value = `${w[Math.floor(Math.random() * w.length)]}-${Math.random().toString(36).slice(2, 8)}`;
  };
  document.getElementById('go').onclick = () => {
    const me = document.getElementById('name').value.trim();
    const code = room.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!me || code.length < 4) return alert('Введи имя и код комнаты (от 4 символов, латиницей и цифрами).');
    setSettings({ me, room: code });
    location.hash = '';
    syncNow();
  };
}

// ---------- шапка ----------
function header() {
  const sc = score();
  const span = sc.next ? sc.next - sc.base : 1;
  const pct = sc.next ? Math.min(100, ((sc.total - sc.base) / span) * 100) : 100;
  return `
    <header>
      <div class="hrow">
        <div><div class="lvl">Ур. ${sc.level} · ${esc(sc.title)}</div>
        <div class="pts">${sc.total} очков</div></div>
        <div class="count">${seenCount()}<small>/${SPECIES.length}</small></div>
      </div>
      <div class="bar"><i style="width:${pct}%"></i></div>
    </header>`;
}

// ---------- Декс ----------
function dexView() {
  const q = ui.q.trim().toLowerCase();
  const list = SPECIES.filter(s => (ui.cat === 'all' || s.cat === ui.cat) && (!q || s.ru.toLowerCase().includes(q)));
  const chips = [['all', '🌊', 'Все'], ...Object.entries(CATS).map(([k, c]) => [k, c.emoji, c.name])]
    .map(([k, e, n]) => {
      const total = k === 'all' ? SPECIES.length : SPECIES.filter(s => s.cat === k).length;
      const got = k === 'all' ? seenCount() : SPECIES.filter(s => s.cat === k && isSeen(s.id)).length;
      return `<button class="chip ${ui.cat === k ? 'on' : ''}" data-cat="${k}">${e} ${n} <b>${got}/${total}</b></button>`;
    }).join('');
  const cards = list.map(s => {
    const e = live('seen', s.id);
    return `<button class="card r-${s.rar} ${e ? 'seen' : 'unseen'}" data-id="${s.id}">
      ${photo(s)}${e ? '<span class="tick">✓</span>' : ''}
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
    const m = marks[i];
    if (c.type === 'species') {
      const s = BY_ID[c.id];
      return `<button class="bcell ${m ? 'on' : ''} ${inLine.has(i) ? 'line' : ''}" data-id="${s.id}">${photo(s)}<span>${esc(s.ru)}</span>${m ? '<span class="tick">✓</span>' : ''}</button>`;
    }
    return `<button class="bcell act ${m ? 'on' : ''} ${inLine.has(i) ? 'line' : ''}" data-bidx="${i}"><span class="big">💞</span><span>${esc(c.text)}</span>${m ? '<span class="tick">✓</span>' : ''}</button>`;
  }).join('');
  return `
    <h2>Бинго дня</h2>
    <p class="sub">Новая карточка каждый день. Животных и моменты отмечаем в Дексе — они зачтутся сами, а сердечки жмём вручную.</p>
    <div class="bgrid">${cells}</div>
    <div class="bstat">Линий: <b>${lines.length}</b> (+${POINTS.bingoLine} за каждую)${full ? ' · 🎉 Полная карточка +' + POINTS.bingoFull : ''}</div>`;
}

// ---------- Квесты ----------
function questsView() {
  const day = todayKey();
  const qs = questsFor(day);
  const done = qs.filter(q => questDone(q, day)).length;
  const rows = qs.map(q => {
    const d = questDone(q, day);
    return `<${q.kind === 'manual' ? 'button' : 'div'} class="quest ${d ? 'done' : ''}" ${q.kind === 'manual' ? `data-quest="${q.id}"` : ''}>
      <span class="qi">${d ? '✅' : q.kind === 'manual' ? '⬜' : '🎯'}</span>
      <span class="qt">${esc(q.text)}<small>${q.kind === 'manual' ? 'отметь вручную' : 'зачтётся сама, когда отметите находки'}</small></span>
      <span class="qp">+${POINTS.quest}</span></${q.kind === 'manual' ? 'button' : 'div'}>`;
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
    `<div class="day"><b>${d.slice(6)}.${d.slice(4, 6)}</b> ${days[d].map(id => BY_ID[id]?.emoji || '').join(' ')} <small>${days[d].length}</small></div>`).join('')
    || '<p class="empty">Пока пусто — самое время плыть к рифу!</p>';
  const rares = SPECIES.filter(s => isSeen(s.id)).sort((a, b) => RARITY[b.rar].pts - RARITY[a.rar].pts).slice(0, 5)
    .map(s => `<span class="pill">${s.emoji} ${esc(s.ru)}</span>`).join('');
  const bd = badges().map(b => `<div class="badge ${b.ok ? 'ok' : ''}"><span>${b.emoji}</span>${esc(b.name)}</div>`).join('');
  const who = Object.entries(byWho).map(([n, c]) => `${esc(n)}: ${c}`).join(' · ') || '—';
  const link = `${location.origin}${location.pathname}#room=${state.room}`;
  return `
    <h2>Наша поездка</h2>
    <div class="stats">
      <div><b>${seenCount()}</b>видов</div><div><b>${sc.speciesPts}</b>за находки</div>
      <div><b>${sc.questPts}</b>за задания</div><div><b>${sc.bingoPts}</b>за бинго</div>
    </div>
    <p class="sub">Отметили: ${who}</p>
    ${rares ? `<h3>Лучшие находки</h3><div class="pills">${rares}</div>` : ''}
    <h3>Значки</h3><div class="badges">${bd}</div>
    <h3>По дням</h3><div class="timeline">${timeline}</div>
    <h3>Настройки</h3>
    <div class="settings">
      <div>Ты: <b>${esc(state.me)}</b> · комната: <b>${esc(state.room)}</b></div>
      <div id="syncline">Синхронизация: ${syncEnabled() ? `<b class="${status.ok ? 'ok' : 'bad'}">${status.text}</b>` : '<b class="bad">не настроена (см. README)</b>'}</div>
      <button class="btn ghost" id="share">🔗 Скопировать ссылку для второго</button>
      <button class="btn ghost" id="offline">📥 Скачать фото для офлайна</button>
      <div id="offprog" class="hint"></div>
      <button class="btn ghost" id="syncbtn">🔄 Синхронизировать сейчас</button>
      <button class="btn ghost danger" id="reset">Выйти из комнаты</button>
      <input type="hidden" id="linkval" value="${esc(link)}">
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
    <div class="hero ${e ? 'seen' : 'unseen'}">${photo(s)}</div>
    <h2>${esc(s.ru)}</h2>
    <div class="meta"><span class="rar">${stars(s.rar)} ${RARITY[s.rar].name}</span><span>+${RARITY[s.rar].pts} очк.</span></div>
    <p class="fact">${esc(s.fact)}</p>
    <p class="where">📍 Где искать: ${esc(s.spot)}</p>
    ${e
      ? `<div class="seenbox">✅ Отметил(а) <b>${esc(e.by)}</b>, ${e.d ? e.d.slice(6) + '.' + e.d.slice(4, 6) : ''}${e.loc ? ' · ' + esc(e.loc) : ''}</div>
         <button class="btn ghost" id="unmark">Снять отметку</button>`
      : `<div class="locs"><small>Где увидели (необязательно):</small>${locs}</div>
         <button class="btn big" id="mark">Видели! ✨</button>`}
  </div></div>`;
}

// ---------- каркас ----------
const TABS = [['dex', '📖', 'Декс'], ['bingo', '🎲', 'Бинго'], ['quests', '🎯', 'Задания'], ['us', '💑', 'Мы']];

function render() {
  if (!state.me || !state.room) return renderSetup();
  const prev = document.querySelector('main');
  if (prev) ui.scroll[ui.tab] = prev.scrollTop;
  const search = document.activeElement?.id === 'search';
  const views = { dex: dexView, bingo: bingoView, quests: questsView, us: usView };
  $app.innerHTML = `${header()}<main>${views[ui.tab]()}</main>
    <nav>${TABS.map(([k, e, n]) => `<button class="${ui.tab === k ? 'on' : ''}" data-tab="${k}"><span>${e}</span>${n}</button>`).join('')}</nav>
    ${sheetView()}`;
  document.querySelector('main').scrollTop = ui.scroll[ui.tab] || 0;
  if (search) { const el = document.getElementById('search'); el.focus(); el.setSelectionRange(99, 99); }
  hydrate($app);
}

function celebrate(s) {
  const el = document.createElement('div');
  el.className = 'burst';
  el.innerHTML = `<div class="burst-card">${s.emoji}<b>${esc(s.ru)}</b><span>Новая находка! +${RARITY[s.rar].pts}</span></div>` +
    Array.from({ length: 18 }, (_, i) => `<i style="--a:${i * 20}deg;--d:${60 + (i % 3) * 30}px">${['✨', '🫧', '⭐', '🐚'][i % 4]}</i>`).join('');
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1800);
  navigator.vibrate?.(40);
}

// ---------- события ----------
$app.addEventListener('click', ev => {
  const t = ev.target.closest('[data-tab],[data-cat],[data-id],[data-close],[data-loc],[data-bidx],[data-quest],button[id]');
  if (!t) return;
  if (t.dataset.tab) { ui.tab = t.dataset.tab; ui.sheet = null; return render(); }
  if (t.dataset.cat) { ui.cat = t.dataset.cat; return render(); }
  if (t.dataset.close && (ev.target === t || t.classList.contains('x'))) { ui.sheet = null; return render(); }
  if (t.dataset.loc) { setSettings({ lastLoc: state.lastLoc === t.dataset.loc ? '' : t.dataset.loc }); return; }
  if (t.dataset.id && !t.closest('.sheet')) { ui.sheet = t.dataset.id; return render(); }
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
      ui.sheet = null; render(); celebrate(s); syncNow(); break;
    }
    case 'unmark':
      if (confirm('Снять отметку?')) { setEntry('seen', ui.sheet, { d: '', loc: '', del: true }); ui.sheet = null; render(); syncNow(); }
      break;
    case 'share': {
      const v = document.getElementById('linkval').value;
      (navigator.share ? navigator.share({ url: v, title: 'Мальдивский Покедекс' }) : navigator.clipboard.writeText(v).then(() => alert('Ссылка скопирована')))
        .catch(() => prompt('Скопируй ссылку:', v));
      break;
    }
    case 'offline': {
      const out = document.getElementById('offprog');
      prefetchAll([...new Set(SPECIES.map(s => s.wiki))], (d, n) => { out.textContent = `Загружено ${d}/${n}`; })
        .then(() => { out.textContent += ' — готово, фото доступны без сети'; });
      break;
    }
    case 'syncbtn': syncNow(); break;
    case 'reset':
      if (confirm('Выйти из комнаты на этом телефоне? Данные в облаке останутся.')) {
        localStorage.removeItem('maldisves.v1'); location.reload();
      }
      break;
  }
});
$app.addEventListener('input', ev => {
  if (ev.target.id === 'search') { ui.q = ev.target.value; render(); }
});

onChange(() => { if (state.me && state.room) render(); });
document.addEventListener('syncstatus', () => { if (ui.tab === 'us' && !ui.sheet) render(); });

// комната из ссылки (#room=...)
const r = new URLSearchParams(location.hash.slice(1)).get('room');
if (r && !state.room) { /* подставится в форму первого запуска */ }

render();
startSync();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
