// Главные сцены по времени суток (время на Мальдивах, UTC+5).
import { artSVG, INK } from './art.js';
import { frames, FRAME_W, FRAME_H, SCALE } from './chars.js';

const ST = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
const ST2 = `stroke="${INK}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`;

export function islandHour(d = new Date()) {
  return ((d.getUTCHours() + 5) % 24) + d.getUTCMinutes() / 60;
}

// ---------- детали ----------
const defs = '';
const skyRect = (id, a, b, h = 360) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="400" height="${h}" fill="url(#${id})"/>`;
const waves = (y, c, c2, cls = 'waveA') =>
  `<g class="${cls}"><path d="M0 ${y} ${'q12.5 -9 25 0 t25 0 '.repeat(40)} V380 H0Z" fill="${c}"/><path d="M0 ${y + 10} ${'q12.5 -9 25 0 t25 0 '.repeat(40)}" fill="none" stroke="${c2}" stroke-width="3" opacity=".7"/></g>`;
const cloud = (x, y, s = 1, cls = 'drift', fill = '#fff') =>
  `<g class="${cls}"><g transform="translate(${x} ${y}) scale(${s})"><path d="M0 30 Q-4 12 16 12 Q22 -6 44 4 Q62 -4 70 16 Q86 18 82 30Z" fill="${fill}" ${ST2}/></g></g>`;
const palm = (x, y, s = 1, flip = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s * flip} ${s})"><path d="M0 0 Q10 -50 2 -100" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M0 0 Q10 -50 2 -100" fill="none" stroke="#b5835a" stroke-width="7" stroke-linecap="round"/>
  <g class="sway" style="transform-origin:2px -100px"><g fill="#35a56a" ${ST2}><path d="M2 -100 q-40 -6 -64 22 q34 -14 64 -22z"/><path d="M2 -100 q40 -10 66 18 q-34 -10 -66 -18z"/><path d="M2 -100 q-22 -34 -56 -30 q32 6 56 30z"/><path d="M2 -100 q24 -36 58 -30 q-34 8 -58 30z"/><path d="M2 -100 q-4 -30 -30 -40 q20 18 30 40z"/></g><circle cx="-4" cy="-98" r="5" fill="#9a6b43" ${ST2}/><circle cx="7" cy="-97" r="5" fill="#9a6b43" ${ST2}/></g></g>`;
const sun = (x, y, r = 30, c = '#ffd45e') => `<g class="pulse" style="transform-origin:${x}px ${y}px"><circle cx="${x}" cy="${y}" r="${r + 14}" fill="${c}" opacity=".25"/><circle cx="${x}" cy="${y}" r="${r}" fill="${c}" ${ST}/></g>`;
const starsSky = n => Array.from({ length: n }, (_, i) => `<circle class="twinkle" style="animation-delay:${(i % 7) * 0.4}s" cx="${(i * 53 + 17) % 396}" cy="${(i * 31 + 9) % 170}" r="${i % 3 ? 1.5 : 2.4}" fill="#fff"/>`).join('');
const island = (x, y, w = 170) => `<path d="M${x - w / 2} ${y} Q${x} ${y - 30} ${x + w / 2} ${y} Z" fill="#f6dfa4" ${ST}/>`;
const villa = (x, y, lit) => `<g transform="translate(${x} ${y})"><path d="M0 0 L60 -34 L120 0 Z" fill="#8a5f3d" ${ST}/><rect x="10" y="0" width="100" height="46" fill="#f6e7c8" ${ST}/><rect x="22" y="12" width="22" height="22" rx="3" fill="${lit ? '#ffd45e' : '#9be7ff'}" ${ST2}/><rect x="74" y="12" width="22" height="22" rx="3" fill="${lit ? '#ffd45e' : '#9be7ff'}" ${ST2}/><path d="M-6 46 H126 M0 46 v26 M60 46 v26 M120 46 v26" stroke="${INK}" stroke-width="4"/></g>`;

// спрайт из «Шерстин»: x — центр, bottom — линия ног; scale 1 = 72x124 единицы сцены
function person(who, x, bottom, { mode = 'idle', acc = '', scale = 1.6, delay = 0, cut = false } = {}) {
  const w = FRAME_W * SCALE * scale, h = FRAME_H * SCALE * scale, [f0, f1] = frames(who, mode, acc);
  const g = `<g transform="translate(${(x - w / 2).toFixed(1)} ${(bottom - h).toFixed(1)})" style="--dly:${delay}s">
    <image class="fa" href="${f0}" width="${w}" height="${h}"/><image class="fb" href="${f1}" width="${w}" height="${h}"/></g>`;
  return cut ? `<clipPath id="cut${Math.round(cut)}-${Math.round(x)}"><rect width="400" height="${cut}"/></clipPath><g clip-path="url(#cut${Math.round(cut)}-${Math.round(x)})">${g}</g>` : g;
}
const zzz = (x, y) => `<g class="zzz"><text x="${x}" y="${y}" font-size="26" font-weight="900" fill="#fff" stroke="${INK}" stroke-width="1.5" paint-order="stroke">Z</text><text x="${x + 18}" y="${y - 20}" font-size="19" font-weight="900" fill="#fff" stroke="${INK}" stroke-width="1.2" paint-order="stroke">z</text><text x="${x + 32}" y="${y - 36}" font-size="14" font-weight="900" fill="#fff" stroke="${INK}" stroke-width="1" paint-order="stroke">z</text></g>`;
const swim = (id, y, size, delay, dur, flip = false) =>
  `<g class="swim" style="--y:${y}px;animation-duration:${dur}s;animation-delay:-${delay + dur * 0.35}s"><svg x="0" y="0" width="${size}" height="${size}" viewBox="0 0 120 120" style="overflow:visible"><g transform="${flip ? 'translate(120 0) scale(-1 1)' : ''}">${artSVG(id).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g></svg></g>`;
const bubbles = `<g>${[40, 120, 200, 290, 350].map((x, i) => `<circle class="bubble" style="animation-delay:${i * 0.9}s" cx="${x}" cy="330" r="${4 + (i % 3) * 2}" fill="#fff" fill-opacity=".5" stroke="#fff" stroke-width="1.5"/>`).join('')}</g>`;
const reef = `<path d="M0 360 L0 330 Q30 300 60 330 Q90 310 120 340 Q170 300 200 336 Q250 306 290 338 Q340 304 400 332 V360Z" fill="#f6dfa4" ${ST}/>
  <g>${[[30, 330, '#ff8fb0'], [150, 336, '#ffb347'], [250, 334, '#a46bff'], [350, 330, '#ff8a5b']].map(([x, y, c]) => `<path d="M${x} ${y} v-24 M${x} ${y - 12} l-10 -12 M${x} ${y - 16} l10 -12" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M${x} ${y} v-24 M${x} ${y - 12} l-10 -12 M${x} ${y - 16} l10 -12" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`).join('')}</g>`;
const table = (y = 262) => `<path d="M30 ${y} H370 V${y + 14} H30Z" fill="#c8794a" ${ST}/><path d="M60 ${y + 14} v50 M340 ${y + 14} v50" stroke="${INK}" stroke-width="6"/>`;
const cup = (x, y) => `<g transform="translate(${x} ${y})"><path d="M0 0 h34 v22 q0 12 -17 12 q-17 0 -17 -12z" fill="#fff" ${ST}/><path d="M34 6 q14 0 12 10 q-2 8 -12 6" fill="none" ${ST}/>
  <path class="steam" d="M10 -6 q-6 -10 0 -18 q6 -8 0 -16" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".9"/><path class="steam" style="animation-delay:.7s" d="M24 -6 q-6 -10 0 -18 q6 -8 0 -16" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".9"/></g>`;
const plate = (x, y, food) => `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="0" rx="34" ry="9" fill="#fff" ${ST}/>${food}</g>`;
const cone = (x, y, a = '#ff9ec0', b = '#ffe66b') => `<g transform="translate(${x} ${y})"><g class="lick"><path d="M-12 0 L0 34 L12 0Z" fill="#e0a15a" ${ST}/><path d="M-6 8 l8 8 M2 4 l6 6" stroke="${INK}" stroke-width="1.5"/><circle cx="0" cy="-4" r="14" fill="${a}" ${ST}/><circle cx="0" cy="-20" r="11" fill="${b}" ${ST}/><circle cx="-4" cy="-24" r="2" fill="#fff" opacity=".8"/></g></g>`;
const bat = (x, y, d, dur) => `<g class="fly" style="--y:${y}px;animation-delay:${d}s;animation-duration:${dur}s"><path d="M0 0 q10 -14 22 -4 q-6 2 -8 8 q-6 -6 -14 -4z M0 0 q-10 -14 -22 -4 q6 2 8 8 q6 -6 14 -4z" fill="#33293c" ${ST2}/><circle cx="0" cy="3" r="5" fill="#33293c" ${ST2}/></g>`;
const crow = (x, y) => `<g transform="translate(${x} ${y})"><g class="bob"><ellipse cx="0" cy="0" rx="14" ry="11" fill="#33333f" ${ST2}/><circle cx="-12" cy="-8" r="8" fill="#33333f" ${ST2}/><path d="M-19 -9 l-9 3 l9 3z" fill="#16425b"/><circle cx="-13" cy="-9" r="2" fill="#fff"/><path d="M-4 10 v8 M5 10 v8" stroke="${INK}" stroke-width="3" stroke-linecap="round"/></g></g>`;

// ---------- сцены ----------
const wrap = inner => `<svg class="scene" viewBox="0 0 400 360" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">${defs}${inner}</svg>`;

const S = {
  snorkelAm: () => wrap(`${skyRect('sA', '#ffc9a8', '#ffe9c9', 180)}${sun(300, 150, 28, '#fff0a8')}${cloud(30, 40, 1)}${cloud(240, 60, .8, 'drift2')}
    <rect y="170" width="400" height="200" fill="#4cc3d6"/>${skyRect('sW', '#5fd3e0', '#1a8fa6', 360).replace('<rect width="400" height="360"', '<rect y="190" width="400" height="170"')}
    ${waves(176, '#5fd3e0', '#c9f4fa')}${swim('parrot', 255, 54, 0, 15)}${swim('butterfly', 300, 40, 6, 11, true)}${swim('anthias', 235, 34, 3, 13)}
    ${bubbles}${reef}
    ${person('masha', 120, 270, { acc: 'snorkel', cut: 200 })}${person('anton', 280, 270, { acc: 'snorkel', cut: 200 })}
    <g class="waveB"><path d="M0 198 ${'q12.5 -9 25 0 t25 0 '.repeat(40)}" fill="none" stroke="#c9f4fa" stroke-width="4"/></g>`),
  breakfast: () => wrap(`${skyRect('sB', '#bdeefa', '#fff4d6', 360)}${sun(330, 50, 24)}${cloud(20, 36, 1)}
    ${waves(160, '#4cc3d6', '#c9f4fa')}${palm(46, 200, .9)}${palm(360, 210, 1, -1)}
    <rect x="0" y="220" width="400" height="140" fill="#e9c98a"/>
    ${person('masha', 100, 346)}${person('anton', 290, 346)}${table(256)}
    ${plate(130, 252, '<path d="M-14 -4 q14 -16 28 0 q-14 8 -28 0z" fill="#e8a65c" stroke="#16425b" stroke-width="2"/>')}${plate(200, 252, '<circle cx="-8" cy="-4" r="8" fill="#ff8a5b" stroke="#16425b" stroke-width="2"/><circle cx="8" cy="-4" r="8" fill="#ffd45e" stroke="#16425b" stroke-width="2"/>')}${cup(190, 224)}${crow(356, 242)}`),
  nap: () => wrap(`${skyRect('sN', '#9be7ff', '#e6f7fb', 360)}${sun(330, 44, 30, '#fff0a8')}${cloud(40, 40, 1)}
    ${waves(150, '#4cc3d6', '#c9f4fa')}${palm(60, 250, 1.1)}${palm(350, 250, 1.1, -1)}
    <rect y="245" width="400" height="115" fill="#f6dfa4"/>
    <path d="M60 190 Q200 262 340 190" fill="none" stroke="${INK}" stroke-width="5"/>
    ${person('masha', 140, 316, { acc: 'sleep', cut: 255 })}${person('anton', 260, 316, { acc: 'sleep', cut: 255 })}
    <path d="M70 196 Q200 262 330 196 Q200 288 70 196Z" fill="#ff9ec0" ${ST}/><path d="M80 204 Q200 268 320 204" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="8 8"/>${zzz(285, 150)}`),
  icecream: () => wrap(`${skyRect('sI', '#9be7ff', '#fff4d6', 360)}${sun(70, 50, 30, '#ffe66b')}${cloud(220, 40, .9)}
    ${waves(170, '#4cc3d6', '#c9f4fa')}${palm(360, 230, 1, -1)}
    <rect y="230" width="400" height="130" fill="#f6dfa4"/><path d="M0 232 q50 -14 100 0 t100 0 t100 0 t100 0" fill="none" stroke="#fff" stroke-width="5" opacity=".8"/>
    ${person('masha', 100, 324)}${person('anton', 300, 324)}
    ${cone(176, 244, '#ff9ec0', '#ffe66b')}${cone(224, 244, '#8fe0a3', '#ffb347')}`),
  snorkelPm: () => wrap(`${skyRect('sP', '#9be7ff', '#e6f7fb', 170)}${sun(80, 52, 26, '#fff0a8')}${cloud(250, 30, .9)}
    <rect y="170" width="400" height="200" fill="#4cc3d6"/>${skyRect('sW2', '#4cc3d6', '#157f98', 360).replace('<rect width="400" height="360"', '<rect y="190" width="400" height="170"')}
    ${waves(176, '#4cc3d6', '#c9f4fa')}${swim('greenturtle', 260, 74, 0, 20)}${swim('napoleon', 300, 62, 7, 18, true)}${swim('clown', 230, 30, 3, 10)}${swim('blacktip', 320, 54, 10, 22)}
    ${bubbles}${reef}
    ${person('masha', 120, 270, { acc: 'snorkel', cut: 200 })}${person('anton', 280, 270, { acc: 'snorkel', cut: 200 })}
    <g class="waveB"><path d="M0 198 ${'q12.5 -9 25 0 t25 0 '.repeat(40)}" fill="none" stroke="#c9f4fa" stroke-width="4"/></g>`),
  sunset: () => wrap(`${skyRect('sS', '#ff6f91', '#ffc27a', 360)}${sun(200, 178, 46, '#fff0a8')}
    ${cloud(20, 50, 1, 'drift', '#ffd1c4')}${cloud(250, 80, .9, 'drift2', '#ffd1c4')}
    ${bat(0, 70, 0, 14)}${bat(0, 110, 4, 17)}${bat(0, 50, 8, 15)}
    ${waves(190, '#c04a82', '#ffb59a')}<path d="M150 210 h100 M165 224 h70 M180 238 h40" stroke="#ffe39a" stroke-width="4" stroke-linecap="round" class="twinkle"/>
    <rect y="262" width="400" height="98" fill="#f0c98e"/><path d="M0 264 q50 -12 100 0 t100 0 t100 0 t100 0" fill="none" stroke="#fff" stroke-width="4" opacity=".7"/>
    ${palm(40, 270, 1.2)}${palm(366, 270, 1.1, -1)}
    ${person('masha', 150, 335, { mode: 'hug' })}${person('anton', 250, 335, { mode: 'hug' })}`),
  dinner: () => wrap(`${skyRect('sD', '#3b2a6b', '#e26a8a', 360)}${starsSky(20)}<circle cx="320" cy="60" r="22" fill="#fff6c9" ${ST}/>
    ${waves(150, '#2a4f8a', '#ff9ec0')}${palm(40, 250, 1)}${palm(364, 250, 1, -1)}
    <rect y="210" width="400" height="150" fill="#d9b87a"/>
    <path d="M10 56 Q100 100 200 62 T390 56" fill="none" stroke="${INK}" stroke-width="3"/>${[30, 80, 130, 190, 250, 300, 350].map((x, i) => `<circle class="twinkle" style="animation-delay:${i * .3}s" cx="${x}" cy="${72 + Math.sin(i * 1.3) * 12}" r="5" fill="#ffd45e" ${ST2}/>`).join('')}
    ${person('masha', 105, 352)}${person('anton', 295, 352)}
    ${table(262)}${plate(120, 258, '<circle cx="0" cy="-4" r="9" fill="#ff8a5b" stroke="#16425b" stroke-width="2"/>')}${plate(280, 258, '<path d="M-16 -3 q16 -14 32 0 q-16 8 -32 0z" fill="#7fd08a" stroke="#16425b" stroke-width="2"/>')}
    <g transform="translate(200 238)"><rect x="-7" y="0" width="14" height="22" rx="3" fill="#fff" ${ST2}/><path class="flame" d="M0 -4 q-9 -10 0 -22 q9 12 0 22z" fill="#ffb23d" ${ST2}/></g>`),
  night: () => wrap(`${skyRect('sNi', '#0f1b4a', '#2b2f6e', 360)}${starsSky(36)}<circle cx="318" cy="56" r="26" fill="#fff6c9" ${ST}/><circle cx="310" cy="50" r="4" fill="#efe4a8"/><circle cx="326" cy="62" r="5" fill="#efe4a8"/>
    ${waves(168, '#16306b', '#7a8fe0')}${palm(40, 270, 1)}
    ${villa(190, 170, true)}
    <rect y="262" width="400" height="98" fill="#2c3a6b"/>
    <rect x="100" y="244" width="200" height="48" rx="14" fill="#fff" ${ST}/>
    ${person('masha', 140, 340, { acc: 'sleep', cut: 300 })}${person('anton', 260, 340, { acc: 'sleep', cut: 300 })}
    <rect x="98" y="262" width="204" height="40" rx="12" fill="#4aa3ff" ${ST}/><path d="M106 272 h188" stroke="#fff" stroke-width="3" stroke-dasharray="8 8"/>${zzz(290, 214)}`),
};

export const SCENE_LIST = [
  { key: 'snorkelAm', from: 5, to: 7.5, title: 'Раннее утро: снорклинг', text: 'Рифы просыпаются. Вода спокойная, рыбы активны. Самое время для масок и ласт.',
    suggest: ['clown', 'parrot', 'butterfly', 'moorish', 'cleaner', 'napoleon', 'greenturtle'], cat: 'fish' },
  { key: 'breakfast', from: 7.5, to: 10.5, title: 'Завтрак на веранде', text: 'Кофе, фрукты и ворона, которая уже всё приметила. Держите тосты крепче.',
    suggest: ['crow', 'gecko', 'reefheron', 'koel', 'plaintiger', 'waterhen'], cat: 'land' },
  { key: 'nap', from: 10.5, to: 13.5, title: 'Тихий час', text: 'Жарко! Время гамака, кондиционера и сладких снов. Задания подождут.',
    suggest: ['rain', 'rainbow', 'seaplane', 'dhoni', 'coconut'], cat: 'moments' },
  { key: 'icecream', from: 13.5, to: 15.5, title: 'Мороженое и обед', text: 'Освежиться, подкрепиться, а потом снова в воду. Загляните в бинго дня.',
    suggest: ['hermit', 'ghostcrab', 'egret', 'turnstone', 'tern', 'coconut'], cat: 'land' },
  { key: 'snorkelPm', from: 15.5, to: 17.25, title: 'Снорклинг, второй заход', text: 'После обеда свет на рифе другой. Самое время для черепахи, ската и акулы.',
    suggest: ['greenturtle', 'hawksbill', 'blacktip', 'eagleray', 'stingray', 'napoleon', 'octopus'], cat: 'giants' },
  { key: 'sunset', from: 17.25, to: 18.5, title: 'Закат', text: 'Небо рисует лучшее шоу дня. Следите за горизонтом: вдруг мелькнёт зелёный луч?',
    suggest: ['sunset', 'greenflash', 'flyingfox', 'dolphin', 'rainbow', 'noddy'], cat: 'moments' },
  { key: 'dinner', from: 18.5, to: 21, title: 'Ужин у воды', text: 'Свечи, шум волны и крабики на песке. После ужина посмотрите на небо.',
    suggest: ['ghostcrab', 'gecko', 'milkyway', 'fullmoon', 'shootingstar', 'plankton'], cat: 'moments' },
  { key: 'night', from: 21, to: 29, title: 'Спокойной ночи', text: 'Луна, звёзды и сны про дельфинов. Завтра рифы снова ждут.',
    suggest: ['plankton', 'milkyway', 'shootingstar', 'fullmoon', 'flyingfox'], cat: 'moments' },
].map(s => ({ ...s, svg: S[s.key] }));

export function sceneAt(hour) {
  const h = hour < 5 ? hour + 24 : hour;
  return SCENE_LIST.find(s => h >= s.from && h < s.to) || SCENE_LIST[SCENE_LIST.length - 1];
}

// открытка «мы на пляже» для вкладки «Мы»
export function postcardSVG() {
  return `<svg class="scene" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
    ${skyRect('sPc', '#ff9ec0', '#ffd9a0', 300)}${sun(300, 120, 30, '#fff0a8')}${cloud(30, 40, 1)}
    ${waves(150, '#4cc3d6', '#c9f4fa')}${palm(46, 230, 1.1)}${palm(360, 230, 1.1, -1)}
    <rect y="205" width="400" height="100" fill="#f6dfa4"/>
    ${person('masha', 160, 292, { mode: 'hug', scale: 1.3 })}${person('anton', 240, 292, { mode: 'hug', scale: 1.3 })}
    <path class="beat" d="M200 82 q-10 -14 -20 -2 q-8 12 20 28 q28 -16 20 -28 q-10 -12 -20 2z" fill="#ff6b8a" ${ST}/></svg>`;
}
