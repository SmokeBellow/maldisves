// Спрайты в стиле игры «Шерстины» (MurMyak Games): 16x24, тёмный контур, кадры idle/hug.
// Одежда здесь пляжная, у Маши добавлен цветок плюмерии.
import { mk, rect, dot, outline } from './px.js';

const PAL = {
  masha: {
    hair: '#c9a066', hairD: '#97703f', hairL: '#e8c68f', skin: '#f6cba5', skinD: '#e2a881',
    eye: '#3a2a25', blush: '#ec9f8d', mouth: '#c0705f',
    plA: '#e8d2be', plB: '#e1c8b2', plC: '#dbbfa8', under: '#f3e4d2', underL: '#fff3e4',
    cuff: '#e0bfa6', pants: '#f2eee4', pantsD: '#d9d2c2', shoe: '#a2693f', bead: '#f1c453',
  },
  anton: {
    hair: '#b2562b', hairD: '#7c391b', hairL: '#d77f48', skin: '#f0c29c', skinD: '#d9a07a',
    eye: '#2a1d1a', blush: '#e49a86', mouth: '#8a4a3a',
    beard: '#a2512a', beardD: '#7a3a1c', hood: '#f1e6d3', hoodD: '#cdb89d', hoodL: '#fff8ec',
    strap: '#f1e6d3', glass: '#22222b', lens: '#cfe8f5', tee: '#e6dcc8',
    pants: '#5aa6c9', pantsD: '#3f86a8', shoe: '#a2693f', sole: '#7a4a2a',
    pack: '#f1e6d3', packD: '#cdb89d',
  },
};

const STEP = [0, 1, 0, -1];
const BOB = [0, 1, 0, 1];

function plaid(x, P, px, py, w, h) {
  for (let yy = 0; yy < h; yy++) {
    for (let xx = 0; xx < w; xx++) {
      const vx = (xx + 1) % 4 === 0, hy = (yy + 1) % 4 === 0;
      let c = P.plA;
      if (vx && hy) c = P.plC;
      else if (vx || hy) c = P.plB;
      else if ((xx + yy) % 5 === 0) c = P.plC;
      dot(x, px + xx, py + yy, c);
    }
  }
}

function legs(x, P, who, step, by) {
  const lift = (s) => (step === s ? 1 : 0);
  const pants = P.pants;
  rect(x, 4, 17 + by - lift(1), 3, 5 + lift(1), pants);
  rect(x, 9, 17 + by - lift(-1), 3, 5 + lift(-1), pants);
  if (who === 'masha') {
    rect(x, 4, 19, 1, 2, P.pantsD); rect(x, 9, 19, 1, 2, P.pantsD);
  }
  rect(x, 3, 22 - lift(1), 4, 2, P.shoe);
  rect(x, 9, 22 - lift(-1), 4, 2, P.shoe);
  if (who === 'anton') { rect(x, 3, 23 - lift(1), 4, 1, P.sole); rect(x, 9, 23 - lift(-1), 4, 1, P.sole); }
}

function drawFront(x, who, step, b, mode, acc) {
  const P = PAL[who];
  if (who === 'masha') {
    // длинные волосы позади
    rect(x, 2, 2 + b, 2, 13, P.hair); rect(x, 12, 2 + b, 2, 13, P.hair);
    rect(x, 2, 12 + b, 1, 3, P.hairD); rect(x, 13, 12 + b, 1, 3, P.hairD);
    legs(x, P, who, step, b);
    plaid(x, P, 4, 11 + b, 8, 7);
    rect(x, 7, 11 + b, 2, 7, P.under);
    rect(x, 5, 10 + b, 6, 2, P.under); rect(x, 5, 10 + b, 6, 1, P.underL);
    dot(x, 6, 12 + b, P.bead); dot(x, 9, 12 + b, P.bead); dot(x, 7, 13 + b, P.bead); dot(x, 8, 13 + b, P.bead);
    const sl = step === 1 ? 1 : step === -1 ? -1 : 0;
    for (const [ax, s] of [[2, sl], [12, -sl]]) {
      plaid(x, P, ax, 11 + b + s, 2, 4);
      rect(x, ax, 15 + b + s, 2, 1, P.cuff);
      rect(x, ax, 16 + b + s, 2, 2, P.skin);
    }
    // голова
    rect(x, 3, 2 + b, 10, 8, P.skin); rect(x, 4, 1 + b, 8, 1, P.skin); rect(x, 4, 10 + b, 8, 0, P.skin);
    dot(x, 3, 2 + b, '#0000');
    rect(x, 3, 1 + b, 10, 3, P.hair); rect(x, 4, 0 + b, 8, 1, P.hair);
    rect(x, 3, 3 + b, 2, 4, P.hair); rect(x, 11, 3 + b, 2, 3, P.hair);
    rect(x, 5, 3 + b, 3, 1, P.hair); // чёлка набок
    rect(x, 6, 1 + b, 3, 1, P.hairL); rect(x, 10, 1 + b, 2, 1, P.hairL);
    rect(x, 3, 6 + b, 1, 1, P.hairD); rect(x, 12, 5 + b, 1, 1, P.hairD);
    if (mode === 'hug') {
      rect(x, 5, 6 + b, 2, 1, P.eye); rect(x, 9, 6 + b, 2, 1, P.eye);
      dot(x, 5, 7 + b, P.skin); dot(x, 10, 7 + b, P.skin);
      rect(x, 7, 9 + b, 2, 1, P.mouth); dot(x, 6, 8 + b, P.mouth); dot(x, 9, 8 + b, P.mouth);
    } else {
      rect(x, 5, 6 + b, 1, 2, P.eye); rect(x, 10, 6 + b, 1, 2, P.eye);
      dot(x, 5, 6 + b, '#6a4a3e'); dot(x, 10, 6 + b, '#6a4a3e');
      rect(x, 7, 9 + b, 2, 1, P.mouth);
    }
    dot(x, 4, 8 + b, P.blush); dot(x, 11, 8 + b, P.blush);
  } else {
    legs(x, P, who, step, b);
    rect(x, 4, 11 + b, 8, 7, P.hood);
    rect(x, 4, 10 + b, 8, 2, P.hoodL); rect(x, 7, 10 + b, 2, 1, P.tee);
    rect(x, 6, 12 + b, 1, 2, '#c9cfe6'); rect(x, 9, 12 + b, 1, 2, '#c9cfe6');
    [[5,12],[9,13],[10,12],[6,14],[8,15]].forEach(([lx,ly]) => dot(x, lx, ly + b, P.hoodD)); // листочки гавайской рубашки
    rect(x, 5, 15 + b, 6, 2, P.hoodD);
    const sl = step === 1 ? 1 : step === -1 ? -1 : 0;
    for (const [ax, s] of [[2, sl], [12, -sl]]) {
      rect(x, ax, 11 + b + s, 2, 5, P.hood);
      rect(x, ax, 15 + b + s, 2, 1, P.hoodD);
      rect(x, ax, 16 + b + s, 2, 2, P.skin);
    }
    rect(x, 3, 2 + b, 10, 8, P.skin); rect(x, 4, 1 + b, 8, 1, P.skin);
    rect(x, 3, 0 + b, 10, 3, P.hair); rect(x, 4, -1 + b < 0 ? 0 : -1 + b, 8, 1, P.hairL);
    rect(x, 3, 3 + b, 1, 3, P.hairD); rect(x, 12, 3 + b, 1, 3, P.hairD);
    rect(x, 4, 3 + b, 3, 1, P.hair); rect(x, 8, 3 + b, 3, 1, P.hair);
    // борода
    rect(x, 3, 7 + b, 10, 3, P.beard); rect(x, 4, 10 + b, 8, 0, P.beard);
    rect(x, 7, 9 + b, 2, 1, mode === 'hug' ? '#6a3a2e' : P.skinD);
    rect(x, 3, 9 + b, 2, 1, P.beardD); rect(x, 11, 9 + b, 2, 1, P.beardD);
    // очки
    // тонкая оправа: прозрачные линзы, чтобы были видны глаза (не похоже на солнечные очки)
    for (const gx of [4, 9]) {
      rect(x, gx, 5 + b, 4, 1, P.glass); dot(x, gx, 7 + b, P.glass); dot(x, gx + 3, 7 + b, P.glass);
      dot(x, gx, 6 + b, P.glass); dot(x, gx + 3, 6 + b, P.glass);
      rect(x, gx + 1, 6 + b, 2, 1, '#fbfdff');
    }
    rect(x, 8, 5 + b, 1, 1, P.glass);
    if (mode === 'hug') { rect(x, 5, 6 + b, 2, 1, P.hairD); rect(x, 10, 6 + b, 2, 1, P.hairD); } else {
      dot(x, 6, 6 + b, P.eye); dot(x, 10, 6 + b, P.eye);
    }
  }
  if (who === 'masha') {
    // цветок плюмерии у виска
    for (const [fx, fy] of [[2, 2], [3, 1], [3, 3], [4, 2]]) dot(x, fx, fy + b, '#ffffff');
    dot(x, 3, 2 + b, '#ffd45e');
  }
  if (acc === 'snorkel') {
    rect(x, 3, 5 + b, 10, 4, '#2b4a66'); rect(x, 4, 6 + b, 8, 2, '#9be7ff');
    dot(x, 5, 6 + b, '#2b2a3a'); dot(x, 10, 6 + b, '#2b2a3a'); dot(x, 4, 6 + b, '#ffffff');
    rect(x, 13, -3 + b, 2, 9, '#ffb23d'); rect(x, 13, -3 + b, 2, 2, '#ff6b6b');
  } else if (acc === 'sleep') {
    rect(x, 3, 5 + b, 10, 3, '#ff9ec0');
    rect(x, 5, 6 + b, 2, 1, '#3a2a25'); rect(x, 9, 6 + b, 2, 1, '#3a2a25'); dot(x, 5, 7 + b, '#ff9ec0');
  }
}

const U = 4; // во сколько раз увеличиваем кадр заранее, чтобы пиксели были чёткими на любом экране
function frame(who, mode, f, acc) {
  const [c, x] = mk(16, 29);
  x.translate(0, 5);
  drawFront(x, who, 0, mode === 'idle' ? f : mode === 'hug' ? f : 0, mode, acc);
  const o = outline(c);
  const [big, bx] = mk(o.width * U, o.height * U);
  bx.imageSmoothingEnabled = false;
  bx.drawImage(o, 0, 0, o.width * U, o.height * U);
  return big;
}

const cache = {};
// две картинки-кадра (data URL) для покадровой анимации, размер кадра 18x31 «больших пикселей»
export function frames(who, mode = 'idle', acc = '') {
  const key = `${who}|${mode}|${acc}`;
  return (cache[key] ||= [0, 1].map(f => frame(who, mode, f, acc).toDataURL()));
}
export const FRAME_W = 18, FRAME_H = 31, SCALE = U;

// аватарка: голова и плечи первого кадра
export function headURL(who) {
  const key = `head|${who}`;
  if (cache[key]) return cache[key];
  const big = frame(who, 'idle', 0, '');
  const [c, x] = mk(16 * U, 15 * U);
  x.imageSmoothingEnabled = false;
  x.drawImage(big, 1 * U, 5 * U, 16 * U, 15 * U, 0, 0, 16 * U, 15 * U);
  return (cache[key] = c.toDataURL());
}
