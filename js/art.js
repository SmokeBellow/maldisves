// Нарисованные в коде мультяшные иллюстрации. Каждый вид = шаблон формы + цвета.
// Вид слева направо: голова слева. viewBox везде 0 0 120 120.
const INK = '#16425b';
const ST = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
const ST2 = `stroke="${INK}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`;
let uid = 0;

const eye = (x, y, r = 4.5) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" ${ST2}/><circle cx="${x + r * 0.15}" cy="${y + r * 0.1}" r="${r * 0.55}" fill="${INK}"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.25}" r="${r * 0.22}" fill="#fff"/>`;
const cheek = (x, y, r = 4) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.65}" fill="#ff8fa3" opacity=".55"/>`;
const smile = (x, y, w = 6) => `<path d="M${x} ${y} q${w / 2} ${w * 0.55} ${w} 0" fill="none" ${ST2}/>`;
const shade = (c, a) => { // осветлить (a>0) или затемнить (a<0) цвет #rrggbb
  const n = parseInt(c.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v + (a > 0 ? (255 - v) : v) * a)));
  return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(f).map(v => v.toString(16).padStart(2, '0')).join('');
};

// ---------- рыбы ----------
function fish(p) {
  const { c1, c2 = shade(p.c1, -0.15), c3 = '#fff', pat = '', rx = 32, ry = 24, cx = 56, cy = 60, tail = 'fork', dorsal = 13, anal = 8,
    belly, beak, horn, long, spikes, lips } = p;
  const id = 'c' + ++uid, tx = cx + rx - 6;
  let t;
  if (tail === 'fork') t = `<path d="M${tx} ${cy} L${tx + 24} ${cy - 18} Q${tx + 14} ${cy} ${tx + 24} ${cy + 18} Z" fill="${c2}" ${ST}/>`;
  else if (tail === 'long') t = `<path d="M${tx} ${cy} Q${tx + 20} ${cy - 22} ${tx + 26} ${cy - 2} Q${tx + 20} ${cy + 22} ${tx} ${cy} Z" fill="${c2}" ${ST}/>`;
  else t = `<path d="M${tx} ${cy} Q${tx + 18} ${cy - 16} ${tx + 22} ${cy} Q${tx + 18} ${cy + 16} ${tx} ${cy} Z" fill="${c2}" ${ST}/>`;
  const dx1 = cx - rx * 0.45, dx2 = cx + rx * 0.05, dx3 = cx + rx * 0.62;
  const dors = `<path d="M${dx1} ${cy - ry + 3} Q${dx1 + 4} ${cy - ry - dorsal} ${dx2 + 6} ${cy - ry - dorsal - (long ? 8 : 0)} Q${dx3 - 8} ${cy - ry - 2} ${dx3} ${cy - ry + 5} Z" fill="${c2}" ${ST}/>`;
  const an = `<path d="M${cx - 4} ${cy + ry - 3} Q${cx + 8} ${cy + ry + anal} ${cx + rx * 0.55} ${cy + ry - 5} Z" fill="${c2}" ${ST}/>`;
  let pattern = '';
  if (belly) pattern += `<ellipse cx="${cx - 2}" cy="${cy + ry * 0.75}" rx="${rx}" ry="${ry * 0.6}" fill="${belly}"/>`;
  if (pat === 'stripes') pattern += [-0.35, 0.15, 0.55].map(k => `<rect x="${cx + rx * k - 3.5}" y="${cy - ry}" width="7" height="${ry * 2}" fill="${c3}" ${p.stripeInk ? ST2 : ''}/>`).join('');
  if (pat === 'bars') pattern += [-0.45, -0.1, 0.25, 0.6].map(k => `<rect x="${cx + rx * k - 2.5}" y="${cy - ry}" width="5" height="${ry * 2}" fill="${c3}"/>`).join('');
  if (pat === 'spots') pattern += [[-.2, -.3], [.2, -.4], [.4, 0], [0, .1], [-.35, .25], [.2, .4], [.55, -.25]].map(([a, b]) => `<circle cx="${cx + rx * a}" cy="${cy + ry * b}" r="3" fill="${c3}"/>`).join('');
  if (pat === 'band') pattern += `<rect x="${cx - rx}" y="${cy - 3}" width="${rx * 2}" height="6" fill="${c3}"/>`;
  if (pat === 'stripe-h') pattern += `<rect x="${cx - rx}" y="${cy - ry * 0.35}" width="${rx * 2}" height="4" fill="${c3}"/><rect x="${cx - rx}" y="${cy + ry * 0.15}" width="${rx * 2}" height="4" fill="${c3}"/>`;
  if (pat === 'saddle') pattern += `<ellipse cx="${cx + rx * 0.3}" cy="${cy - ry * 0.7}" rx="10" ry="8" fill="${c3}"/>`;
  if (pat === 'scales') pattern += [0, 1, 2].map(r => [0, 1, 2, 3].map(q => `<path d="M${cx - rx * .5 + q * 11 + r * 4} ${cy - 8 + r * 9} q4 4 8 0" fill="none" stroke="${shade(c1, -0.3)}" stroke-width="1.5" opacity=".6"/>`).join('')).join('');
  if (pat === 'white-tail') pattern += `<rect x="${cx + rx * 0.45}" y="${cy - ry}" width="${rx}" height="${ry * 2}" fill="${c3}"/>`;
  let extra = '';
  if (beak) extra += `<path d="M${cx - rx + 3} ${cy - 2} q-9 1 -9 8 q6 4 12 -1 z" fill="${p.beakC || '#fff'}" ${ST}/>`;
  if (horn) extra += `<path d="M${cx - rx * 0.62} ${cy - ry * 0.7} l-16 -14 l20 6 z" fill="${c2}" ${ST}/>`;
  if (lips) extra += `<ellipse cx="${cx - rx + 2}" cy="${cy + 5}" rx="5" ry="4" fill="${shade(c1, 0.35)}" ${ST2}/>`;
  if (spikes) extra += [-0.5, -0.2, 0.1, 0.4].map(k => `<path d="M${cx + rx * k - 3} ${cy - ry + 2} l3 -${spikes} l3 ${spikes}" fill="none" ${ST}/>`).join('');
  return `<defs><clipPath id="${id}"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/></clipPath></defs>
  ${t}${dors}${an}
  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c1}"/>
  <g clip-path="url(#${id})">${pattern}</g>
  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" ${ST}/>
  <ellipse cx="${cx - 2}" cy="${cy + 4}" rx="9" ry="6" fill="${c2}" ${ST2} transform="rotate(-20 ${cx - 2} ${cy + 4})"/>
  ${extra}${eye(cx - rx * 0.5, cy - ry * 0.22, p.eyeR || 4.6)}${cheek(cx - rx * 0.28, cy + ry * 0.3, 3.5)}${smile(cx - rx + 3, cy + ry * 0.35, 5)}`;
}

function longFish(p) {
  const { c1, c2 = shade(p.c1, -0.2), c3 = '#fff', eel, snout, pat, teeth, frill } = p;
  const id = 'c' + ++uid;
  const body = eel
    ? `M22 58 Q34 40 54 52 Q74 64 90 46 Q104 34 112 46 Q100 58 88 66 Q70 82 50 70 Q36 62 30 74 Q16 72 22 58 Z`
    : `M14 60 Q40 44 80 50 L108 42 Q104 60 108 78 L80 70 Q40 76 14 60 Z`;
  let pattern = '';
  if (pat === 'spots') pattern = [[40, 55], [58, 60], [74, 52], [88, 58], [50, 70], [68, 68]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="${c3}"/>`).join('');
  if (pat === 'bars') pattern = [30, 46, 62, 78, 94].map(x => `<rect x="${x}" y="30" width="5" height="60" fill="${c3}"/>`).join('');
  if (pat === 'stripe') pattern = `<rect x="10" y="${eel ? 56 : 58}" width="110" height="5" fill="${c3}" transform="rotate(${eel ? -8 : 0} 60 60)"/>`;
  const belly = p.belly ? `<path d="M14 60 Q40 72 80 66 L108 66 L108 80 L14 62Z" fill="${p.belly}"/>` : '';
  let head = '';
  if (snout) head = `<path d="M16 58 L${snout} 58 L${snout} 63 L16 63Z" fill="${c1}" ${ST}/>`;
  if (teeth) head += `<path d="M14 61 l3 3 l3 -3 l3 3" fill="none" stroke="#fff" stroke-width="2"/>`;
  return `<defs><clipPath id="${id}"><path d="${body}"/></clipPath></defs>
  ${eel ? '' : `<path d="M60 49 q10 -12 20 1" fill="${c2}" ${ST}/>`}
  <path d="${body}" fill="${c1}"/><g clip-path="url(#${id})">${belly}${pattern}</g><path d="${body}" fill="none" ${ST}/>
  ${head}${eye(eel ? 30 : 26, eel ? 58 : 56, 3.8)}${cheek(eel ? 34 : 34, eel ? 66 : 63, 3)}
  ${frill ? `<path d="M18 52 q4 -8 8 -2 q4 -8 8 0" fill="${c2}" ${ST2}/>` : ''}`;
}

function shark(p) {
  const { c1, belly = '#f4f8fa', tip, spots, wide, cA = '#fff' } = p;
  const id = 'c' + ++uid;
  const bodyPath = wide
    ? 'M6 62 Q14 44 52 44 L84 44 Q98 44 108 30 L112 24 L104 58 L112 94 Q98 80 84 76 Q50 84 6 62 Z'
    : 'M10 62 Q20 46 52 44 L84 44 Q98 44 106 32 L110 26 L104 58 L110 92 Q96 80 82 74 Q50 86 10 62 Z';
  let pat = '';
  if (spots) pat = [[24, 56], [34, 52], [44, 58], [54, 52], [64, 58], [74, 52], [84, 58], [30, 66], [48, 68], [66, 66], [38, 47], [58, 47], [78, 47]]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="#fff" opacity=".9"/>`).join('');
  const tips = tip ? `<path d="M56 30 L62 21 Q64 28 66 34 Z" fill="${tip}"/><path d="M104 36 L110 26 L108 40Z" fill="${tip}"/><path d="M108 78 L110 92 L102 82Z" fill="${tip}"/>` : '';
  return `<defs><clipPath id="${id}"><path d="${bodyPath}"/></clipPath></defs>
  <path d="M48 45 L62 20 Q68 38 78 45 Z" fill="${c1}" ${ST}/>
  <path d="M44 68 L36 94 Q58 86 64 72 Z" fill="${shade(c1, -0.12)}" ${ST}/>
  <path d="${bodyPath}" fill="${c1}"/>
  <g clip-path="url(#${id})"><path d="M0 64 Q50 86 90 72 L90 100 L0 100Z" fill="${belly}"/>${pat}</g>
  <path d="${bodyPath}" fill="none" ${ST}/>${tips}
  <path d="M36 54 q3 5 0 10 M42 53 q3 5 0 10 M48 52 q3 5 0 10" fill="none" ${ST2} opacity=".5"/>
  ${eye(24, 56, 4)}${cheek(30, 64, 3.2)}${smile(14, 66, 8)}`;
}

function ray(p) {
  const { c1, belly = '#fff', spots, horns, round, cA = '#fff' } = p;
  const wings = round
    ? 'M60 24 Q100 24 108 60 Q100 94 60 96 Q20 94 12 60 Q20 24 60 24 Z'
    : 'M60 34 Q92 22 114 52 Q88 60 60 82 Q32 60 6 52 Q28 22 60 34 Z';
  const tail = round ? 'M60 94 L60 116' : 'M60 80 Q62 100 58 116';
  const id = 'c' + ++uid;
  let pat = '';
  if (spots) pat = [[40, 48], [52, 42], [66, 44], [78, 50], [60, 56], [46, 62], [74, 62], [34, 56], [88, 56], [60, 70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${cA}"/>`).join('');
  if (horns) pat += `<path d="M44 34 q-8 -2 -8 -10 q8 2 12 8z M76 34 q8 -2 8 -10 q-8 2 -12 8z" fill="${c1}" ${ST2}/>` + `<path d="M48 40 Q60 46 72 40" fill="none" stroke="${cA}" stroke-width="3"/>`;
  return `<defs><clipPath id="${id}"><path d="${wings}"/></clipPath></defs>
  <path d="${tail}" fill="none" ${ST} stroke-width="4"/>
  <path d="${wings}" fill="${c1}"/><g clip-path="url(#${id})">${pat}</g><path d="${wings}" fill="none" ${ST}/>
  ${eye(52, round ? 40 : 46, 3.8)}${eye(68, round ? 40 : 46, 3.8)}${cheek(46, round ? 49 : 54, 3)}${cheek(74, round ? 49 : 54, 3)}${smile(56, round ? 52 : 58, 8)}`;
}

function turtle(p) {
  const { c1, c2 = '#e9cf8c', c3 = shade(p.c1, 0.2), hawk } = p;
  return `<path d="M82 84 q18 6 22 22 q-16 -2 -26 -14z" fill="${c2}" ${ST}/>
  <path d="M30 78 q-16 4 -20 22 q16 -2 28 -14z" fill="${c2}" ${ST}/>
  <path d="M96 76 l12 -2 l-6 8z" fill="${c2}" ${ST2}/>
  <path d="M26 74 Q28 32 64 32 Q100 32 100 74 Z" fill="${c1}" ${ST}/>
  <path d="M64 32 L64 74 M46 36 Q40 54 40 74 M82 36 Q88 54 88 74 M30 56 Q64 48 98 56" fill="none" stroke="${c3}" stroke-width="3" opacity=".8"/>
  ${hawk ? `<path d="M50 44 l8 8 l-8 8 M78 44 l-8 8 l8 8" fill="none" stroke="#ffd45e" stroke-width="3"/>` : ''}
  <path d="M22 76 L102 76 Q100 86 62 86 Q26 86 22 76Z" fill="${c2}" ${ST}/>
  <circle cx="26" cy="60" r="14" fill="${c2}" ${ST}/>
  ${hawk ? `<path d="M14 62 q-8 2 -8 8 q8 2 14 -4z" fill="${c2}" ${ST}/>` : ''}
  ${eye(24, 56, 4)}${cheek(26, 66, 3.5)}${smile(16, 68, 7)}
  <path d="M50 84 q10 12 22 4" fill="${c2}" ${ST}/>`;
}

function dolphin(p) {
  const { c1, belly = '#f4f8fa' } = p;
  const body = 'M10 70 Q14 44 50 42 Q80 40 98 56 Q104 40 118 38 Q112 54 112 62 Q118 74 118 80 Q104 76 98 66 Q80 90 44 86 Q16 84 10 70 Z';
  const id = 'c' + ++uid;
  return `<defs><clipPath id="${id}"><path d="${body}"/></clipPath></defs>
  <path d="M52 44 Q58 22 74 20 Q70 34 74 46 Z" fill="${c1}" ${ST}/>
  <path d="${body}" fill="${c1}"/><g clip-path="url(#${id})"><path d="M0 72 Q40 90 100 68 L100 100 L0 100Z" fill="${belly}"/></g><path d="${body}" fill="none" ${ST}/>
  <path d="M50 74 q-8 14 -20 14 q8 -4 14 -16z" fill="${shade(c1, -0.1)}" ${ST}/>
  ${eye(30, 60, 4)}${cheek(36, 68, 3.2)}<path d="M14 72 q8 4 18 -1" fill="none" ${ST2}/>`;
}

function octopus(p) {
  const { c1, spots = shade(p.c1, 0.3), squid } = p;
  const arms = [14, 28, 42, 56, 70, 84, 98].map((x, i) =>
    `<path d="M${x + 4} 70 q${i % 2 ? 10 : -10} 16 ${i % 2 ? -4 : 4} 28 q${i % 2 ? -4 : 4} 6 ${i % 2 ? 4 : -2} 10" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/>
     <path d="M${x + 4} 70 q${i % 2 ? 10 : -10} 16 ${i % 2 ? -4 : 4} 28 q${i % 2 ? -4 : 4} 6 ${i % 2 ? 4 : -2} 10" fill="none" stroke="${c1}" stroke-width="5.5" stroke-linecap="round"/>`).join('');
  if (squid) return `<path d="M18 58 Q20 32 60 28 Q100 32 102 58 Q100 78 60 80 Q20 78 18 58Z" fill="${c1}" ${ST}/>
    <path d="M22 60 Q60 74 98 60" fill="none" stroke="${spots}" stroke-width="3" opacity=".7"/>
    ${[26, 38, 50, 62, 74, 86].map(x => `<path d="M${x} 78 q-2 12 3 22" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M${x} 78 q-2 12 3 22" fill="none" stroke="${c1}" stroke-width="3" stroke-linecap="round"/>`).join('')}
    ${eye(44, 56, 5)}${eye(76, 56, 5)}${cheek(36, 66, 4)}${cheek(84, 66, 4)}${smile(55, 68, 10)}`;
  return `${arms}<path d="M26 62 Q24 18 60 18 Q96 18 94 62 Q80 76 60 76 Q40 76 26 62Z" fill="${c1}" ${ST}/>
  ${[[44, 30], [60, 26], [76, 32], [52, 38], [70, 40]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${spots}"/>`).join('')}
  ${eye(46, 54, 6)}${eye(74, 54, 6)}${cheek(37, 64, 4.5)}${cheek(83, 64, 4.5)}${smile(55, 66, 10)}`;
}

function crab(p) {
  const { c1, c2 = shade(p.c1, -0.12), hermit, shell } = p;
  const legs = [-1, 1].map(s => [0, 1, 2].map(i =>
    `<path d="M${60 + s * 24} ${72 + i * 6} q${s * 16} ${-4 + i * 4} ${s * 24} ${10 + i * 4}" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M${60 + s * 24} ${72 + i * 6} q${s * 16} ${-4 + i * 4} ${s * 24} ${10 + i * 4}" fill="none" stroke="${c2}" stroke-width="3" stroke-linecap="round"/>`).join('')).join('');
  const claw = s => `<path d="M${60 + s * 28} 60 Q${60 + s * 42} 44 ${60 + s * 38} 28" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M${60 + s * 28} 60 Q${60 + s * 42} 44 ${60 + s * 38} 28" fill="none" stroke="${c1}" stroke-width="4" stroke-linecap="round"/>
    <path d="M${60 + s * 38} 24 q${s * 12} -14 ${s * 8} 6 q${s * -4} 8 ${s * -8} 10 q${s * -10} 0 0 -16z" fill="${c1}" ${ST}/>`;
  if (hermit) return `<path d="M20 100 Q14 80 30 70 Q42 66 50 74" fill="none"/>
    <path d="M70 90 Q100 96 104 70 Q106 40 76 36 Q46 36 44 62 Q44 84 66 82 Q82 80 80 64 Q78 52 66 54" fill="${shell || '#f3d9a6'}" ${ST}/>
    <path d="M30 96 Q40 84 62 90 L62 100 L30 104Z" fill="${c1}" ${ST}/>
    <path d="M26 96 q-10 -10 -4 -22 q8 4 12 14" fill="${c1}" ${ST}/>${eye(26, 82, 3.4)}${eye(36, 82, 3.4)}${smile(26, 94, 6)}
    <path d="M22 76 l-4 -10 M34 76 l2 -10" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
  return `${legs}${claw(-1)}${claw(1)}<ellipse cx="60" cy="70" rx="30" ry="22" fill="${c1}" ${ST}/>
  <path d="M50 52 l-2 -10 M70 52 l2 -10" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
  ${eye(48, 40, 5)}${eye(72, 40, 5)}${cheek(42, 72, 4)}${cheek(78, 72, 4)}${smile(54, 72, 12)}`;
}

function star(p) {
  const { c1, dots = shade(p.c1, 0.4) } = p;
  const pts = [];
  for (let i = 0; i < 10; i++) { const r = i % 2 ? 22 : 50, a = -Math.PI / 2 + i * Math.PI / 5; pts.push(`${(60 + r * Math.cos(a)).toFixed(1)},${(64 + r * Math.sin(a)).toFixed(1)}`); }
  return `<polygon points="${pts.join(' ')}" fill="${c1}" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/><polygon points="${pts.join(' ')}" fill="${c1}" stroke="${c1}" stroke-width="4" stroke-linejoin="round"/>
  ${[[60, 30], [86, 56], [34, 56], [76, 86], [44, 86]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.8" fill="${dots}"/>`).join('')}
  ${eye(51, 62, 4.5)}${eye(69, 62, 4.5)}${cheek(45, 71, 3.5)}${cheek(75, 71, 3.5)}${smile(55, 70, 10)}`;
}

function urchin(p) {
  const { c1 } = p;
  const sp = Array.from({ length: 18 }, (_, i) => { const a = i * Math.PI / 9; return `<line x1="${60 + 22 * Math.cos(a)}" y1="${68 + 22 * Math.sin(a)}" x2="${60 + 48 * Math.cos(a)}" y2="${68 + 48 * Math.sin(a)}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><line x1="${60 + 22 * Math.cos(a)}" y1="${68 + 22 * Math.sin(a)}" x2="${60 + 46 * Math.cos(a)}" y2="${68 + 46 * Math.sin(a)}" stroke="${c1}" stroke-width="2" stroke-linecap="round"/>`; }).join('');
  return `${sp}<circle cx="60" cy="68" r="26" fill="${c1}" ${ST}/>${eye(51, 64, 4.5)}${eye(69, 64, 4.5)}${cheek(45, 73, 3.5)}${cheek(75, 73, 3.5)}${smile(55, 73, 10)}`;
}

function cucumber(p) {
  const { c1 } = p;
  return `<path d="M12 74 Q10 52 36 50 Q64 42 90 52 Q116 58 108 78 Q96 92 60 90 Q22 92 12 74Z" fill="${c1}" ${ST}/>
  ${[[34, 58], [48, 54], [62, 52], [76, 54], [90, 60], [42, 82], [58, 84], [76, 82]].map(([x, y]) => `<path d="M${x} ${y} l3 -7 l3 7" fill="${shade(c1, 0.35)}" ${ST2}/>`).join('')}
  ${eye(30, 68, 4.5)}${eye(44, 66, 4.5)}${cheek(27, 77, 3.4)}${smile(33, 77, 8)}`;
}

function jelly(p) {
  const { c1 } = p;
  const t = [28, 40, 52, 64, 76, 88].map((x, i) => `<path d="M${x} 66 q${i % 2 ? 6 : -6} 12 0 22 q${i % 2 ? -6 : 6} 10 0 18" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M${x} 66 q${i % 2 ? 6 : -6} 12 0 22 q${i % 2 ? -6 : 6} 10 0 18" fill="none" stroke="${shade(c1, 0.25)}" stroke-width="2.6" stroke-linecap="round"/>`).join('');
  return `${t}<path d="M14 66 Q14 14 60 14 Q106 14 106 66 Q84 74 60 66 Q36 74 14 66Z" fill="${c1}" ${ST} opacity=".96"/>
  <path d="M28 40 Q34 24 48 22" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>
  ${eye(46, 48, 4.6)}${eye(74, 48, 4.6)}${cheek(38, 56, 4)}${cheek(82, 56, 4)}${smile(55, 55, 10)}`;
}

function coral(p) {
  const { c1, brain, anem } = p;
  if (brain) return `<path d="M14 92 Q10 50 60 40 Q110 50 106 92 Z" fill="${c1}" ${ST}/>
    <path d="M26 82 Q30 66 42 70 Q54 58 62 72 Q74 58 84 70 Q96 66 94 82 M36 56 Q48 50 58 56 M66 54 Q80 48 88 58" fill="none" stroke="${shade(c1, -0.3)}" stroke-width="3" stroke-linecap="round"/>
    ${eye(46, 84, 3.6)}${eye(72, 84, 3.6)}${smile(55, 90, 10)}`;
  if (anem) return [24, 40, 56, 72, 88, 100].map((x, i) => `<path d="M${x} 80 q${i % 2 ? -10 : 10} -22 ${i % 2 ? 4 : -4} -42" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M${x} 80 q${i % 2 ? -10 : 10} -22 ${i % 2 ? 4 : -4} -42" fill="none" stroke="${c1}" stroke-width="5.5" stroke-linecap="round"/><circle cx="${x + (i % 2 ? 4 : -4)}" cy="38" r="3.6" fill="${p.tipC || '#ffd45e'}" stroke="${INK}" stroke-width="2"/>`).join('') +
    `<path d="M16 100 Q16 76 60 76 Q104 76 104 100 Z" fill="${shade(c1, -0.2)}" ${ST}/>${eye(48, 90, 3.6)}${eye(72, 90, 3.6)}${smile(55, 96, 10)}`;
  return `<path d="M20 100 Q60 92 100 100" fill="${shade(c1, -0.2)}" ${ST}/>` + [[36, 90, 60], [60, 88, 78], [84, 90, 58]].map(([x, y, h]) =>
    `<path d="M${x} ${y} L${x} ${y - h * 0.5} M${x} ${y - h * 0.3} l-14 -16 M${x} ${y - h * 0.4} l14 -18" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><path d="M${x} ${y} L${x} ${y - h * 0.5} M${x} ${y - h * 0.3} l-14 -16 M${x} ${y - h * 0.4} l14 -18" fill="none" stroke="${c1}" stroke-width="6" stroke-linecap="round"/>`).join('') + `${eye(54, 84, 3.6)}${eye(66, 84, 3.6)}`;
}

function shellArt(p) {
  const { c1, c2 = shade(p.c1, -0.25), kind } = p;
  if (kind === 'clam') return `<path d="M10 80 Q10 24 60 20 Q110 24 110 80 Q100 98 60 98 Q20 98 10 80Z" fill="${c1}" ${ST}/>
    ${[26, 40, 54, 68, 82].map((x, i) => `<path d="M60 96 L${x} ${i == 2 ? 24 : 30}" stroke="${c2}" stroke-width="3" fill="none"/>`).join('')}
    <path d="M20 80 Q60 70 100 80 Q60 96 20 80Z" fill="${p.mantle || '#46c1b3'}" ${ST}/>${eye(46, 82, 3.6)}${eye(74, 82, 3.6)}`;
  if (kind === 'cowry') return `<ellipse cx="60" cy="66" rx="46" ry="30" fill="${c1}" ${ST}/>
    ${[[34, 54], [56, 48], [80, 54], [46, 80], [72, 82], [90, 70], [30, 70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="${c2}" opacity=".7"/>`).join('')}
    <path d="M18 64 Q60 76 102 64" fill="none" stroke="${INK}" stroke-width="3"/>${Array.from({ length: 9 }, (_, i) => `<path d="M${28 + i * 8} ${66 + (i % 2)} l0 5" stroke="${INK}" stroke-width="2"/>`).join('')}${eye(44, 56, 3.6)}${eye(76, 56, 3.6)}`;
  return `<path d="M60 20 Q100 24 106 66 Q100 100 60 102 Q20 100 14 66 Q20 24 60 20Z" fill="${c1}" ${ST}/>
  <path d="M60 36 Q82 40 84 64 Q82 82 60 84 Q42 82 40 64 Q42 48 58 50" fill="none" stroke="${c2}" stroke-width="3.5" stroke-linecap="round"/>${eye(46, 74, 3.6)}${eye(74, 74, 3.6)}`;
}

function nudi(p) {
  const { c1, c2 } = p;
  return `<path d="M14 78 Q8 50 40 54 Q60 46 82 54 Q114 52 106 78 Q88 98 60 96 Q30 98 14 78Z" fill="${c1}" ${ST}/>
  ${[28, 44, 60, 76, 92].map(x => `<path d="M${x} 56 q-6 -12 2 -16 q8 4 4 16z" fill="${c2}" ${ST2}/>`).join('')}
  <path d="M30 76 q-12 -16 -4 -28 M38 76 q-6 -18 4 -26" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M30 76 q-12 -16 -4 -28 M38 76 q-6 -18 4 -26" fill="none" stroke="${c2}" stroke-width="2.4" stroke-linecap="round"/>
  ${eye(54, 74, 4.2)}${eye(70, 74, 4.2)}${smile(56, 84, 9)}`;
}

function shrimp(p) {
  const { c1, c2 = shade(p.c1, -0.2), lobster, mantis } = p;
  const segs = [0, 1, 2, 3, 4].map(i => `<path d="M${40 + i * 14} ${64 - (i === 0 ? 4 : 0)} q8 -4 ${14} 0 l0 18 q-6 6 -14 0z" fill="${i % 2 ? c2 : c1}" ${ST2}/>`).join('');
  return `<path d="M96 66 q20 -6 18 12 q-12 6 -22 -4z" fill="${c2}" ${ST}/>${segs}
  <path d="M26 60 Q30 44 52 48 L52 84 Q30 86 26 70Z" fill="${c1}" ${ST}/>
  <path d="M26 56 Q10 38 8 24 M28 52 Q22 36 28 22" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
  ${lobster ? `<path d="M28 74 q-14 10 -20 26 q10 2 14 -4 M34 78 q-6 14 -2 24" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` : `<path d="M32 78 q-10 8 -14 18 q8 2 14 -6z" fill="${mantis || c2}" ${ST}/>`}
  ${eye(38, 60, 4)}${mantis ? `<circle cx="38" cy="52" r="3" fill="#ffd45e" ${ST2}/>` : ''}${smile(32, 72, 6)}
  ${[52, 64, 76, 88].map(x => `<path d="M${x} 84 l-3 8" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`).join('')}`;
}

function gardenEels(p) {
  return `<path d="M0 100 Q60 90 120 100 L120 120 L0 120Z" fill="#f1d99c" ${ST}/>` + [[30, 70, 1], [60, 56, -1], [90, 72, 1]].map(([x, h, s]) =>
    `<path d="M${x} 98 Q${x + s * 12} ${h + 20} ${x} ${h}" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M${x} 98 Q${x + s * 12} ${h + 20} ${x} ${h}" fill="none" stroke="${p.c1}" stroke-width="8" stroke-linecap="round"/>
     <circle cx="${x}" cy="${h}" r="8" fill="${p.c1}" ${ST}/>${eye(x - 2, h - 1, 2.6)}<circle cx="${x + 5}" cy="${h - 1}" r="1.6" fill="${INK}"/>${smile(x - 3, h + 3, 5)}<circle cx="${x}" cy="${h + 24}" r="2" fill="${p.c3}"/><circle cx="${x + 2}" cy="${h + 40}" r="2" fill="${p.c3}"/>`).join('');
}

function cuttle(p) {
  const { c1, c3 = '#f2e2bd' } = p;
  return `<path d="M44 40 Q76 24 108 44 Q112 60 108 76 Q76 96 44 80Z" fill="${shade(c1, 0.25)}" ${ST}/>
  ${[0, 1, 2, 3, 4].map(i => `<path d="M30 ${52 + i * 5} q-14 ${i * 3 - 6} -22 ${i * 5 - 6}" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M30 ${52 + i * 5} q-14 ${i * 3 - 6} -22 ${i * 5 - 6}" fill="none" stroke="${c1}" stroke-width="3" stroke-linecap="round"/>`).join('')}
  <path d="M26 60 Q28 36 60 34 Q96 34 102 60 Q96 86 60 86 Q28 84 26 60Z" fill="${c1}" ${ST}/>
  ${[[56, 46], [70, 50], [84, 46], [64, 70], [80, 68], [92, 58]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="${c3}" opacity=".85"/>`).join('')}
  ${eye(42, 56, 5.4)}${cheek(38, 68, 3.6)}${smile(44, 70, 8)}`;
}

// ---------- птицы и прочие ----------
function bird(p) {
  const { c1, c2 = '#fff', beak = '#ffb23d', beakL = 10, legC = '#ffb23d', legL = 12, neck = 0, tail = 'short', wing = shade(p.c1, -0.18), cap, eyeC, fork, belly } = p;
  const by = 62 - neck * 0.2;
  return `<path d="M30 ${by + 6} L${22 + (fork ? 0 : 0)} ${by + 12} L92 ${by + 4}" fill="none"/>
  <path d="M82 ${by} Q${tail === 'long' ? 112 : 102} ${by - 8} ${tail === 'long' ? 116 : 104} ${by + 4} Q${tail === 'long' ? 112 : 102} ${by + 14} ${fork ? `110 ${by + 24} L96 ${by + 18} L84 ${by + 16}` : `84 ${by + 16}`} Z" fill="${wing}" ${ST}/>
  <path d="M52 ${by + 28} l0 ${legL} M70 ${by + 28} l0 ${legL}" stroke="${legC}" stroke-width="4" stroke-linecap="round"/>
  ${neck ? `<path d="M30 ${by - neck} Q22 ${by - neck / 2} 38 ${by}" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M30 ${by - neck} Q22 ${by - neck / 2} 38 ${by}" fill="none" stroke="${c1}" stroke-width="7" stroke-linecap="round"/>` : ''}
  <ellipse cx="60" cy="${by + 6}" rx="${neck ? 28 : 32}" ry="${neck ? 20 : 24}" fill="${c1}" ${ST}/>
  ${belly ? `<ellipse cx="52" cy="${by + 16}" rx="18" ry="11" fill="${belly}"/>` : ''}
  <path d="M52 ${by - 6} Q78 ${by - 6} 82 ${by + 12} Q66 ${by + 26} 50 ${by + 12}Z" fill="${wing}" ${ST2}/>
  <circle cx="${neck ? 28 : 34}" cy="${by - neck - (neck ? 4 : 10)}" r="${neck ? 11 : 15}" fill="${c1}" ${ST}/>
  ${cap ? `<path d="M${neck ? 17 : 19} ${by - neck - (neck ? 8 : 14)} Q${neck ? 28 : 34} ${by - neck - (neck ? 22 : 30)} ${neck ? 39 : 49} ${by - neck - (neck ? 8 : 14)}Z" fill="${cap}" ${ST2}/>` : ''}
  <path d="M${neck ? 18 : 20} ${by - neck - (neck ? 5 : 11)} l-${beakL} 3 l${beakL * 0.2} 5 l${beakL * 0.8} -2z" fill="${beak}" ${ST}/>
  ${eye(neck ? 28 : 33, by - neck - (neck ? 6 : 12), 3.8)}${cheek(neck ? 33 : 40, by - neck - (neck ? 0 : 4), 3)}`;
}

function bat() {
  return `<line x1="14" y1="14" x2="106" y2="14" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><line x1="14" y1="14" x2="106" y2="14" stroke="#9a6b43" stroke-width="2" stroke-linecap="round"/>
  <path d="M60 18 Q18 28 14 76 Q36 70 44 88 Q60 70 76 88 Q84 70 106 76 Q102 28 60 18Z" fill="#4a3b4f" ${ST}/>
  <path d="M60 22 Q40 26 38 60 Q60 78 82 60 Q80 26 60 22Z" fill="#b2744a" ${ST}/>
  <ellipse cx="60" cy="74" rx="22" ry="20" fill="#e7a35b" ${ST}/>
  <path d="M44 62 l-6 -14 l12 6z M76 62 l6 -14 l-12 6z" fill="#7a5036" ${ST2}/>
  ${eye(51, 70, 4.4)}${eye(69, 70, 4.4)}<ellipse cx="60" cy="80" rx="6" ry="4.5" fill="#7a5036" ${ST2}/><circle cx="60" cy="79" r="2" fill="${INK}"/>${cheek(45, 79, 3.5)}${cheek(75, 79, 3.5)}`;
}

function lizard(p) {
  const { c1, c2 = shade(p.c1, -0.18), spots } = p;
  return `<path d="M82 62 Q106 62 106 84 Q106 104 90 100" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M82 62 Q106 62 106 84 Q106 104 90 100" fill="none" stroke="${c1}" stroke-width="7" stroke-linecap="round"/>
  ${[[38, 44, -1], [38, 82, 1], [76, 44, -1], [76, 82, 1]].map(([x, y, s]) => `<path d="M${x} ${y < 60 ? 52 : 72} q${s * 2} ${y < 60 ? -14 : 14} ${-4} ${y < 60 ? -16 : 16}" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M${x} ${y < 60 ? 52 : 72} q${s * 2} ${y < 60 ? -14 : 14} ${-4} ${y < 60 ? -16 : 16}" fill="none" stroke="${c1}" stroke-width="5" stroke-linecap="round"/><circle cx="${x - 4}" cy="${y < 60 ? 36 : 88}" r="4" fill="${c1}" ${ST2}/>`).join('')}
  <ellipse cx="62" cy="62" rx="28" ry="14" fill="${c1}" ${ST}/>
  ${spots ? [[50, 58], [62, 55], [74, 58], [56, 68], [68, 68]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${c2}"/>`).join('') : ''}
  <ellipse cx="28" cy="62" rx="16" ry="12" fill="${c1}" ${ST}/>
  ${eye(24, 55, 4)}${eye(24, 69, 4)}${smile(14, 62, 5)}`;
}

function butterfly(p) {
  const { c1, c2 = '#16425b', c3 = '#fff' } = p;
  return `<path d="M60 58 Q30 10 10 34 Q10 58 56 64Z" fill="${c1}" ${ST}/><path d="M60 58 Q90 10 110 34 Q110 58 64 64Z" fill="${c1}" ${ST}/>
  <path d="M58 66 Q24 70 22 98 Q42 112 58 78Z" fill="${c1}" ${ST}/><path d="M62 66 Q96 70 98 98 Q78 112 62 78Z" fill="${c1}" ${ST}/>
  ${[[24, 34], [34, 24], [96, 34], [86, 24], [34, 92], [86, 92]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="${c3}" stroke="${c2}" stroke-width="1.5"/>`).join('')}
  <rect x="55" y="40" width="10" height="52" rx="5" fill="${c2}" ${ST2}/>
  <path d="M58 42 q-8 -14 -14 -14 M62 42 q8 -14 14 -14" fill="none" ${ST}/>${eye(57.5, 52, 2.6)}${eye(62.5, 52, 2.6)}`;
}

// ---------- моменты (круглые сценки) ----------
const sceneBox = (bg, inner) => `<defs><clipPath id="sc"><circle cx="60" cy="60" r="52"/></clipPath>${bg}</defs><g clip-path="url(#sc)">${inner}</g><circle cx="60" cy="60" r="52" fill="none" ${ST}/>`;
const grad = (id, a, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const sea = (y, c1, c2 = shade(c1, 0.25)) => `<rect x="0" y="${y}" width="120" height="${120 - y}" fill="${c1}"/><path d="M0 ${y + 6} q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="${c2}" stroke-width="3"/>`;
const palm = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 Q4 -20 -2 -38" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><g fill="#2c8a5a" ${ST2}><path d="M-2 -38 q-20 -4 -26 8 q16 -6 26 -8z"/><path d="M-2 -38 q20 -6 28 6 q-16 -4 -28 -6z"/><path d="M-2 -38 q-8 -16 -22 -14 q14 4 22 14z"/><path d="M-2 -38 q10 -18 24 -14 q-14 6 -24 14z"/></g></g>`;
const stars = (n, seed = 1) => Array.from({ length: n }, (_, i) => `<circle cx="${(i * 37 * seed + 11) % 118}" cy="${(i * 23 * seed + 7) % 62}" r="${i % 3 ? 1 : 1.6}" fill="#fff"/>`).join('');

const SCENES = {
  sunrise: () => sceneBox(grad('g1', '#ffd6a5', '#ff9e7a'), `<rect width="120" height="120" fill="url(#g1)"/><circle cx="60" cy="72" r="24" fill="#ffd45e" ${ST}/>${sea(72, '#4cc3d6')}<path d="M40 82 h40 M46 90 h28" stroke="#ffe39a" stroke-width="3" stroke-linecap="round"/>`),
  sunset: () => sceneBox(grad('g2', '#ff7a9a', '#ffb347'), `<rect width="120" height="120" fill="url(#g2)"/><circle cx="46" cy="68" r="20" fill="#fff0b3" ${ST}/>${sea(72, '#c04a82', '#ff9a7a')}${palm(100, 74, 1)}`),
  rainbow: () => sceneBox(grad('g3', '#a8e6ff', '#e6f7fb'), `<rect width="120" height="120" fill="url(#g3)"/>${['#ff6b6b', '#ffb347', '#ffe66b', '#5cc98a', '#4aa3ff', '#a46bff'].map((c, i) => `<path d="M${10 + i * 5} 96 A${50 - i * 5} ${50 - i * 5} 0 0 1 ${110 - i * 5} 96" fill="none" stroke="${c}" stroke-width="5"/>`).join('')}<ellipse cx="22" cy="98" rx="20" ry="10" fill="#fff" ${ST2}/><ellipse cx="100" cy="98" rx="20" ry="10" fill="#fff" ${ST2}/>`),
  milkyway: () => sceneBox(grad('g4', '#1d2b64', '#3a1c71'), `<rect width="120" height="120" fill="url(#g4)"/><path d="M-10 110 Q40 50 130 10" fill="none" stroke="#c7a8ff" stroke-width="26" opacity=".45"/><path d="M-10 110 Q40 50 130 10" fill="none" stroke="#fff" stroke-width="8" opacity=".35"/>${stars(26, 3)}${sea(100, '#10224a', '#23417d')}`),
  plankton: () => sceneBox(grad('g5', '#0b1f4d', '#0a2a5e'), `<rect width="120" height="120" fill="url(#g5)"/>${stars(10, 2)}${sea(66, '#0a2a5e', '#2fe0ff')}${Array.from({ length: 24 }, (_, i) => `<circle cx="${(i * 29 + 9) % 116}" cy="${72 + (i * 17) % 44}" r="${i % 3 ? 1.6 : 2.6}" fill="#7ff3ff"/>`).join('')}`),
  shootingstar: () => sceneBox(grad('g6', '#141e4a', '#40306b'), `<rect width="120" height="120" fill="url(#g6)"/>${stars(18, 5)}<path d="M96 20 L38 66" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/><path d="M96 20 L58 50" stroke="#ffe66b" stroke-width="5" stroke-linecap="round"/><polygon points="96,10 99,18 107,19 101,24 103,32 96,28 89,32 91,24 85,19 93,18" fill="#ffe66b" ${ST2}/>${sea(100, '#0e1b46')}`),
  fullmoon: () => sceneBox(grad('g7', '#1a2456', '#2d3c7a'), `<rect width="120" height="120" fill="url(#g7)"/>${stars(14, 4)}<circle cx="60" cy="46" r="24" fill="#fff6c9" ${ST}/><circle cx="52" cy="40" r="4" fill="#efe4a8"/><circle cx="68" cy="52" r="5" fill="#efe4a8"/>${sea(84, '#16306b', '#fff6c9')}<path d="M52 92 h16 M48 100 h24" stroke="#fff6c9" stroke-width="3" stroke-linecap="round"/>`),
  greenflash: () => sceneBox(grad('g8', '#ff9a5a', '#ffd9a0'), `<rect width="120" height="120" fill="url(#g8)"/><circle cx="60" cy="76" r="26" fill="#b9ff7a" opacity=".5"/><path d="M42 76 A18 18 0 0 1 78 76 Z" fill="#fff0a8" ${ST}/>${sea(76, '#1f8e9e')}<circle cx="60" cy="70" r="3.4" fill="#4dff8a" stroke="#fff" stroke-width="1.4"/>`),
  rain: () => sceneBox(grad('g9', '#8fb7d6', '#cfe3ef'), `<rect width="120" height="120" fill="url(#g9)"/><path d="M26 56 Q22 36 42 34 Q50 18 68 26 Q90 20 94 42 Q108 46 100 58 Z" fill="#fff" ${ST}/>${Array.from({ length: 10 }, (_, i) => `<path d="M${22 + i * 9} ${68 + (i % 3) * 8} l-3 9" stroke="#4aa3ff" stroke-width="3" stroke-linecap="round"/>`).join('')}${sea(100, '#4cc3d6')}`),
  seaplane: () => sceneBox(grad('g10', '#9be7ff', '#e6f7fb'), `<rect width="120" height="120" fill="url(#g10)"/>${sea(84, '#4cc3d6')}<path d="M24 62 Q24 50 44 50 L88 52 Q104 56 100 62 Q98 70 88 70 L34 70 Q24 70 24 62Z" fill="#fff" ${ST}/><path d="M44 50 L52 38 H72 L68 52Z" fill="#ff8a5b" ${ST}/><rect x="46" y="55" width="8" height="7" rx="2" fill="#9be7ff" ${ST2}/><rect x="58" y="55" width="8" height="7" rx="2" fill="#9be7ff" ${ST2}/><path d="M40 70 v10 h40 v-10 M34 82 h56" fill="none" ${ST}/><path d="M18 44 l6 6 M12 56 l8 2" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M100 54 h6 M104 48 l4 4" stroke="${INK}" stroke-width="3"/>`),
  dhoni: () => sceneBox(grad('g11', '#ffd6a5', '#fff4d6'), `<rect width="120" height="120" fill="url(#g11)"/>${sea(78, '#4cc3d6')}<path d="M16 62 Q60 82 104 56 L98 74 Q60 96 24 78Z" fill="#c8794a" ${ST}/><path d="M44 62 L44 44 Q60 36 80 44 L80 60Z" fill="#fff" ${ST}/><rect x="52" y="48" width="8" height="8" rx="2" fill="#4aa3ff" ${ST2}/><path d="M104 56 L112 40" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M92 40 L104 56" stroke="${INK}" stroke-width="2.5"/>`),
  coconut: () => sceneBox(grad('g12', '#bdeefa', '#fff4d6'), `<rect width="120" height="120" fill="url(#g12)"/><rect y="86" width="120" height="34" fill="#f6dfa4"/><circle cx="58" cy="68" r="28" fill="#9a6b43" ${ST}/><path d="M42 52 Q58 44 74 52" fill="none" stroke="#c99564" stroke-width="4" stroke-linecap="round"/><path d="M68 44 L80 12" stroke="#ff8a5b" stroke-width="5" stroke-linecap="round"/><path d="M78 16 l8 -4" stroke="#ff8a5b" stroke-width="5" stroke-linecap="round"/>${eye(48, 66, 4)}${eye(66, 66, 4)}${cheek(42, 76, 3.5)}${cheek(72, 76, 3.5)}${smile(53, 76, 9)}`),
  sandbank: () => sceneBox(grad('g13', '#bdeefa', '#e6f7fb'), `<rect width="120" height="120" fill="url(#g13)"/>${sea(70, '#4cc3d6')}<path d="M28 82 Q60 56 94 82 Q60 92 28 82Z" fill="#f6dfa4" ${ST}/><path d="M0 100 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#7fe3f0" stroke-width="3"/>${palm(58, 74, 0.7)}`),
};

// ---------- рецепты ----------
const R = {
  clown: ['fish', { c1: '#ff8a3d', c2: '#ff6a1f', c3: '#fff', pat: 'stripes', stripeInk: true, rx: 28, ry: 22, tail: 'round', dorsal: 10 }],
  parrot: ['fish', { c1: '#26b3a8', c2: '#ff8fb0', pat: 'scales', rx: 34, ry: 26, tail: 'long', beak: true, beakC: '#ffe66b' }],
  bumphead: ['fish', { c1: '#4aa89a', c2: '#2d7f78', pat: 'scales', rx: 36, ry: 28, cx: 56, tail: 'long', beak: true, beakC: '#e9f0ee', horn: false, lips: true }],
  butterfly: ['fish', { c1: '#ffe66b', c2: '#ffbf3d', c3: '#16425b', pat: 'bars', rx: 26, ry: 28, tail: 'round', dorsal: 12, beak: true, beakC: '#ffe66b' }],
  moorish: ['fish', { c1: '#fff6c9', c2: '#16425b', c3: '#16425b', pat: 'bars', rx: 26, ry: 28, tail: 'fork', dorsal: 24, long: true, beak: true, beakC: '#ffb23d' }],
  angel: ['fish', { c1: '#3a7bd5', c2: '#ffd45e', c3: '#ffd45e', pat: 'stripe-h', rx: 28, ry: 28, tail: 'round', dorsal: 12 }],
  surgeon: ['fish', { c1: '#3a8de0', c2: '#ffd45e', c3: '#16425b', pat: 'band', rx: 32, ry: 24, tail: 'fork' }],
  unicorn: ['fish', { c1: '#7fb2c9', c2: '#ffd45e', pat: 'scales', rx: 34, ry: 22, tail: 'fork', horn: true }],
  clowntrigger: ['fish', { c1: '#1f2f4a', c2: '#ffd45e', c3: '#fff', pat: 'spots', rx: 30, ry: 24, tail: 'round', dorsal: 14, belly: '#ffe66b' }],
  titan: ['fish', { c1: '#47697e', c2: '#365569', c3: '#7fa2b6', pat: 'scales', rx: 32, ry: 26, tail: 'round', dorsal: 14, lips: true }],
  puffer: ['fish', { c1: '#f2cf7d', c2: '#d9a95a', c3: '#8a6a3a', pat: 'spots', rx: 30, ry: 28, tail: 'round', dorsal: 6, anal: 4, spikes: 5, belly: '#fff6dc' }],
  boxfish: ['fish', { c1: '#ffd45e', c2: '#ffbf3d', c3: '#16425b', pat: 'spots', rx: 28, ry: 26, tail: 'round', dorsal: 6, anal: 5 }],
  lion: ['fish', { c1: '#e0583c', c2: '#ffb347', c3: '#fff', pat: 'bars', rx: 28, ry: 22, tail: 'long', dorsal: 20, anal: 14, long: true }],
  trumpet: ['long', { c1: '#e6b23a', c2: '#c28a1d', c3: '#fff', snout: 4, pat: 'stripe' }],
  damsel: ['fish', { c1: '#2d6bd6', c2: '#2457b0', c3: '#6fb1ff', pat: 'spots', rx: 26, ry: 20, tail: 'fork', dorsal: 9 }],
  anthias: ['fish', { c1: '#ff7aa8', c2: '#ffb347', c3: '#fff', pat: 'spots', rx: 26, ry: 20, tail: 'fork', dorsal: 12 }],
  fusilier: ['fish', { c1: '#4cb0e8', c2: '#ffd45e', c3: '#ffe66b', pat: 'band', rx: 34, ry: 17, tail: 'fork', dorsal: 7, anal: 5 }],
  snapper: ['fish', { c1: '#ffd45e', c2: '#ffb347', c3: '#4aa3ff', pat: 'stripe-h', rx: 32, ry: 22, tail: 'fork' }],
  grouper: ['fish', { c1: '#b9855a', c2: '#8a5f3d', c3: '#7a4e2c', pat: 'spots', rx: 36, ry: 27, tail: 'round', dorsal: 12, lips: true }],
  napoleon: ['fish', { c1: '#2fa9a9', c2: '#2f7fb8', c3: '#d6f5f0', pat: 'scales', rx: 38, ry: 28, cx: 54, tail: 'long', lips: true, horn: false, dorsal: 14 }],
  cleaner: ['fish', { c1: '#4aa3ff', c2: '#2d6bd6', c3: '#16425b', pat: 'band', rx: 32, ry: 14, tail: 'round', dorsal: 7, anal: 4, belly: '#fff' }],
  moray: ['long', { c1: '#b88a3c', c2: '#8a6422', eel: true, pat: 'spots', c3: '#f4d58a', teeth: true }],
  gardeneel: ['garden', { c1: '#c9b88f', c3: '#4a3b4f' }],
  stonefish: ['fish', { c1: '#8a7a64', c2: '#6c5d49', c3: '#b7a584', pat: 'spots', rx: 34, ry: 24, tail: 'round', dorsal: 14, spikes: 7, lips: true }],
  barracuda: ['long', { c1: '#8fb2c4', c2: '#6c8da0', snout: 2, teeth: true, pat: 'bars', c3: '#5c7b8c', belly: '#fff' }],
  trevally: ['fish', { c1: '#7fa1b3', c2: '#5c7f92', pat: '', rx: 36, ry: 26, tail: 'fork', dorsal: 10, belly: '#eaf3f6', lips: true }],
  tuna: ['fish', { c1: '#2d5f9a', c2: '#ffd45e', rx: 38, ry: 22, tail: 'fork', dorsal: 12, belly: '#e5eff8' }],
  flyingfish: ['fish', { c1: '#5fb0d8', c2: '#bfe6f7', rx: 30, ry: 15, tail: 'fork', dorsal: 6, belly: '#fff' }],
  needlefish: ['long', { c1: '#8ed1c4', c2: '#6bb3a5', snout: 2, teeth: true, pat: 'stripe', c3: '#2d7f78', belly: '#fff' }],
  remora: ['fish', { c1: '#7d8b94', c2: '#5c6a73', c3: '#16425b', pat: 'stripe-h', rx: 34, ry: 14, tail: 'round', dorsal: 3, anal: 3 }],
  goby: ['fish', { c1: '#e9c978', c2: '#c9a24a', c3: '#a26a3a', pat: 'spots', rx: 28, ry: 15, tail: 'round', dorsal: 9, anal: 4 }],
  manta: ['ray', { c1: '#2b3a55', cA: '#fff', horns: true, spots: false }],
  eagleray: ['ray', { c1: '#34496b', cA: '#fff', spots: true }],
  stingray: ['ray', { c1: '#c9a979', cA: '#e8d2a8', round: true, spots: true }],
  blacktip: ['shark', { c1: '#7d95a6', tip: '#16425b' }],
  whitetip: ['shark', { c1: '#8ea0ae', tip: '#fff' }],
  greyreef: ['shark', { c1: '#6c7f8e', tip: '#3a4a57' }],
  nurse: ['shark', { c1: '#b88f5c', belly: '#f4e2c2' }],
  whaleshark: ['shark', { c1: '#4c6f93', wide: true, spots: true, belly: '#fff' }],
  greenturtle: ['turtle', { c1: '#4aa86a', c2: '#e8d18c', c3: '#8fe0a3' }],
  hawksbill: ['turtle', { c1: '#a56a3a', c2: '#e8c17a', c3: '#e0a15a', hawk: true }],
  dolphin: ['dolphin', { c1: '#7d95a6' }],
  octopus: ['octopus', { c1: '#e0584f' }],
  cuttlefish: ['cuttle', { c1: '#b88f5c', c3: '#f2e2bd' }],
  hermit: ['crab', { c1: '#ff8a5b', hermit: true, shell: '#f3d9a6' }],
  ghostcrab: ['crab', { c1: '#f2d8a2' }],
  starfish: ['star', { c1: '#ff7a59', dots: '#ffd1a8' }],
  seacucumber: ['cucumber', { c1: '#8a7a5a' }],
  urchin: ['urchin', { c1: '#6b4b8a' }],
  giantclam: ['shell', { c1: '#e9dcc0', c2: '#b9a77f', kind: 'clam', mantle: '#37c4b4' }],
  nudibranch: ['nudi', { c1: '#a46bff', c2: '#ff8fd0' }],
  cowry: ['shell', { c1: '#f3d9a6', c2: '#a8763e', kind: 'cowry' }],
  mantisshrimp: ['shrimp', { c1: '#3fbf7a', c2: '#ff6a8a', mantis: '#ffb347' }],
  jellyfish: ['jelly', { c1: '#e9a8ff' }],
  coral: ['coral', { c1: '#ff8fb0', brain: true }],
  anemone: ['coral', { c1: '#ff8a5b', anem: true }],
  lobster: ['shrimp', { c1: '#e0584f', c2: '#b83c35', lobster: true }],
  flyingfox: ['bat', {}],
  reefheron: ['bird', { c1: '#6c8396', beak: '#ffd45e', beakL: 14, neck: 24, legL: 18, legC: '#ffd45e', wing: '#566b7c', tail: 'short' }],
  egret: ['bird', { c1: '#fff', beak: '#16425b', beakL: 14, neck: 24, legL: 18, legC: '#16425b', wing: '#e9eef2', tail: 'short' }],
  noddy: ['bird', { c1: '#4a3f52', c2: '#fff', beak: '#16425b', beakL: 11, cap: '#e9eef2', legC: '#16425b', wing: '#33293c', tail: 'long' }],
  tern: ['bird', { c1: '#fff', beak: '#ff9a3d', beakL: 13, cap: '#16425b', fork: true, tail: 'long', wing: '#c9d6df', legC: '#16425b' }],
  booby: ['bird', { c1: '#7a5a3a', belly: '#fff', beak: '#7fc3e8', beakL: 14, wing: '#5b4229', tail: 'long', legC: '#7fc3e8' }],
  crow: ['bird', { c1: '#33333f', beak: '#16425b', beakL: 13, wing: '#22222b', belly: '#8c8a96', legC: '#16425b' }],
  koel: ['bird', { c1: '#2c3550', beak: '#c8d99a', beakL: 12, wing: '#1c2438', tail: 'long', legC: '#16425b' }],
  waterhen: ['bird', { c1: '#46586b', belly: '#fff', beak: '#ffd45e', beakL: 9, wing: '#33414f', legC: '#ffd45e', legL: 14 }],
  turnstone: ['bird', { c1: '#c9722f', belly: '#fff', beak: '#16425b', beakL: 9, wing: '#7a4a24', legC: '#ff8a3d' }],
  gecko: ['lizard', { c1: '#d6c19a', spots: true }],
  gardenlizard: ['lizard', { c1: '#8a6b3e', spots: false }],
  plaintiger: ['butterfly', { c1: '#ff9a3d', c2: '#16425b', c3: '#fff' }],
};
const T = { garden: gardenEels, cuttle, fish, long: longFish, shark, ray, turtle, dolphin, octopus, crab, star, urchin, cucumber, jelly, coral, shell: shellArt, nudi, shrimp, bird, bat, lizard, butterfly };

export function artSVG(id) {
  let inner;
  if (SCENES[id]) inner = SCENES[id]();
  else if (R[id]) inner = T[R[id][0]](R[id][1]);
  else inner = '';
  return `<svg class="art" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
}
export { INK };
