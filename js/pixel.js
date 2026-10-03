// Пиксельные персонажи Маши и Антона. Спрайты собираются из прямоугольников и
// рисуются в SVG без сглаживания. Цвета и черты можно править в PAL.
const W = 24, H = 28, CX = 12;
const OUT = '#2b2a3a';

const PAL = {
  masha: {
    skin: '#f6cfae', skinSh: '#e5a987', hair: '#7a5340', hairSh: '#5d3d2e', shirt: '#dcbfa9', shirtSh: '#c3a38c',
    lens: '#eef8fb', frame: '#e0a93f', blush: '#f5a3a0', lip: '#d9776e', bg: '#ffd6e0',
  },
  anton: {
    skin: '#f6cfae', skinSh: '#e5a987', hair: '#9a6b45', hairSh: '#7d5434', beard: '#c4652f', beardSh: '#9c4a20', shirt: '#efe2d0', shirtSh: '#cbb79e',
    lens: '#eef8fb', frame: '#4a5870', blush: '#f2a08f', lip: '#d4756a', bg: '#cfe6ff',
  },
};

const blank = () => Array.from({ length: H }, () => Array(W).fill(null));
const put = (g, x, y, c) => { if (x >= 0 && x < W && y >= 0 && y < H) g[y][x] = c; };
const rect = (g, x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(g, x + i, y + j, c); };
const inEll = (x, y, cx, cy, rx, ry) => ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1;
const ell = (g, cx, cy, rx, ry, c, keep) => { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (inEll(x, y, cx, cy, rx, ry) && (!keep || keep(x, y))) put(g, x, y, c); };

function body(g, p, who) {
  rect(g, 10, 16, 4, 3, p.skinSh);
  for (let y = 18; y < H; y++) {
    const hw = Math.min(10, Math.round(5 + (y - 18) * 1.25));
    for (let x = CX - hw; x < CX + hw; x++) put(g, x, y, (x + y) % 7 === 0 && who === 'anton' ? p.shirtSh : p.shirt);
  }
  if (who === 'anton') {
    // гавайская рубашка: листочки
    [[6, 22], [9, 25], [15, 22], [18, 25], [12, 26], [5, 26], [19, 21]].forEach(([x, y]) => { put(g, x, y, p.shirtSh); put(g, x + 1, y + 1, p.shirtSh); });
    put(g, 9, 18, '#fff'); put(g, 10, 19, '#fff'); put(g, 14, 18, '#fff'); put(g, 13, 19, '#fff');
    put(g, 10, 18, p.skinSh); put(g, 11, 19, p.skinSh); put(g, 12, 19, p.skinSh); put(g, 13, 18, p.skinSh);
  } else {
    rect(g, 10, 18, 4, 1, p.skinSh); rect(g, 11, 19, 2, 1, p.skinSh);
    put(g, 9, 18, p.shirtSh); put(g, 14, 18, p.shirtSh); put(g, 10, 19, p.shirtSh); put(g, 13, 19, p.shirtSh);
    rect(g, 10, 20, 4, 1, p.frame); put(g, 11, 21, p.frame); put(g, 12, 21, p.frame); // цепочка
    for (let y = 23; y < H; y++) put(g, 3 + (y - 23), y, p.shirtSh);
  }
}

function head(g, p, who) {
  ell(g, CX, 10.2, 6.9, 6.2, p.skin);
  rect(g, 4, 10, 1, 3, p.skin); rect(g, 19, 10, 1, 3, p.skin); // уши
  rect(g, 9, 16, 6, 1, p.skinSh);
  if (who === 'anton') {
    // причёска
    ell(g, CX, 8.4, 8, 7.4, p.hair, (x, y) => y <= 6 || (Math.abs(x + 0.5 - CX) >= 6.3 && y <= 9));
    [6, 7, 9, 10, 13, 14, 16, 17].forEach(x => put(g, x, 7, p.hair)); [6, 7, 17].forEach(x => put(g, x, 8, p.hair));
    [8, 11, 15].forEach(x => put(g, x, 6, p.hairSh)); rect(g, 8, 1, 8, 1, p.hairSh); [5, 18].forEach(x => rect(g, x, 3, 1, 4, p.hairSh));
    // борода
    ell(g, CX, 10.2, 6.9, 6.2, p.beard, (x, y) => y >= 13 || ((x <= 5 || x >= 18) && y >= 9));
    rect(g, 8, 12, 8, 1, p.beardSh); rect(g, 10, 13, 4, 1, p.lip); rect(g, 10, 15, 4, 1, p.beardSh);
    // очки (чёрные прямоугольные)
    [[6, 9], [13, 9]].forEach(([x, y]) => { rect(g, x, y, 5, 4, p.frame); rect(g, x + 1, y + 1, 3, 2, p.lens); });
    rect(g, 11, 9, 2, 1, p.frame); put(g, 5, 9, p.frame); put(g, 18, 9, p.frame);
    put(g, 8, 10, '#2b2a3a'); put(g, 15, 10, '#2b2a3a'); put(g, 7, 10, p.lens); put(g, 9, 10, p.lens);
    put(g, 6, 12, p.blush); put(g, 17, 12, p.blush);
  } else {
    // длинные волосы с пробором
    ell(g, CX, 8.6, 8.2, 7.6, p.hair, (x, y) => y <= 6 || (Math.abs(x + 0.5 - CX) >= 6.2 && y <= 9));
    rect(g, 3, 8, 3, 11, p.hair); rect(g, 18, 8, 3, 11, p.hair); rect(g, 4, 19, 2, 1, p.hairSh); rect(g, 18, 19, 2, 1, p.hairSh);
    [6, 7, 8, 9, 10, 14, 15, 16, 17].forEach(x => put(g, x, 7, p.hair)); [5, 6, 17, 18].forEach(x => put(g, x, 8, p.hair));
    rect(g, 8, 1, 8, 1, p.hairSh); [6, 9, 15].forEach(x => put(g, x, 6, p.hairSh)); put(g, 11, 4, p.hairSh); put(g, 11, 5, p.hairSh);
    rect(g, 3, 12, 1, 7, p.hairSh); rect(g, 20, 12, 1, 7, p.hairSh);
    // цветок плюмерии у виска
    [[4, 5], [5, 5], [6, 5], [4, 6], [6, 6], [4, 7], [5, 7], [6, 7], [5, 4]].forEach(([x, y]) => put(g, x, y, '#ffffff'));
    put(g, 5, 6, '#ffd45e');
    // круглые золотые очки
    [[8.5, 10.5], [15.5, 10.5]].forEach(([ex, ey]) => {
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const d = Math.hypot(x + 0.5 - ex, y + 0.5 - ey);
        if (d <= 2.9 && d >= 1.8) put(g, x, y, p.frame); else if (d < 1.8) put(g, x, y, p.lens);
      }
    });
    rect(g, 11, 10, 2, 1, p.frame);
    put(g, 8, 10, '#3a2a2a'); put(g, 8, 11, '#3a2a2a'); put(g, 15, 10, '#3a2a2a'); put(g, 15, 11, '#3a2a2a');
    put(g, 6, 13, p.blush); put(g, 17, 13, p.blush);
    // улыбка с брекетами
    put(g, 9, 13, p.lip); put(g, 14, 13, p.lip); rect(g, 10, 13, 4, 1, '#fff'); rect(g, 10, 14, 4, 1, p.lip); put(g, 11, 13, '#9aa7b0'); put(g, 13, 13, '#9aa7b0');
  }
}

function accessory(g, acc) {
  if (acc === 'snorkel') {
    rect(g, 5, 8, 14, 5, '#2b4a66'); rect(g, 6, 9, 12, 3, '#9be7ff'); put(g, 4, 10, '#2b4a66'); put(g, 19, 10, '#2b4a66');
    put(g, 8, 10, '#2b2a3a'); put(g, 8, 11, '#2b2a3a'); put(g, 15, 10, '#2b2a3a'); put(g, 15, 11, '#2b2a3a');
    put(g, 7, 9, '#fff'); put(g, 8, 9, '#fff'); put(g, 14, 9, '#fff');
    rect(g, 20, 3, 1, 6, '#ffb23d'); put(g, 19, 8, '#ffb23d'); rect(g, 20, 1, 1, 2, '#ff6b6b');
  } else if (acc === 'sleep') {
    rect(g, 5, 9, 14, 3, '#ff9ec0'); put(g, 4, 10, '#ff9ec0'); put(g, 19, 10, '#ff9ec0');
    [[7, 10], [9, 10], [14, 10], [16, 10]].forEach(([x, y]) => put(g, x, y, OUT)); put(g, 8, 11, OUT); put(g, 15, 11, OUT);
  }
}

const cache = {};
function build(who, { acc = '', rows = H } = {}) {
  const key = `${who}|${acc}|${rows}`;
  if (cache[key]) return cache[key];
  const p = PAL[who], g = blank();
  body(g, p, who); head(g, p, who); accessory(g, acc);
  // контур
  const o = blank();
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (g[y][x]) continue;
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => g[y + dy]?.[x + dx])) o[y][x] = OUT;
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (o[y][x]) g[y][x] = OUT;
  // руны по цветам
  const by = {};
  for (let y = 0; y < Math.min(rows, H); y++) {
    let x = 0;
    while (x < W) {
      const c = g[y][x];
      if (!c) { x++; continue; }
      let w = 1; while (x + w < W && g[y][x + w] === c) w++;
      (by[c] ||= []).push(`M${x} ${y}h${w}v1h-${w}z`);
      x += w;
    }
  }
  return (cache[key] = Object.entries(by).map(([c, d]) => `<path fill="${c}" d="${d.join('')}"/>`).join(''));
}

// персонаж в сцене: центр головы в (0,0)
export function charSVG(who, { acc = '', body: withBody = true, k = 4.4 } = {}) {
  return `<g shape-rendering="crispEdges" transform="translate(${-CX * k} ${-10 * k}) scale(${k})">${build(who, { acc, rows: withBody ? H : 18 })}</g>`;
}

// круглая аватарка-голова
export function avatarSVG(who) {
  return `<svg viewBox="2 1 20 19" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">${build(who, { rows: 18 })}</svg>`;
}
export const avatarBg = who => PAL[who].bg;
