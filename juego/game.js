'use strict';
/* Crónicas de Lexara — mundo, laberintos, misiones y bucle principal */

const DIRS = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
const D4 = [[0, -1], [1, 0], [0, 1], [-1, 0]];
const OPP = { N: 'S', S: 'N', E: 'W', W: 'E' };
const LEFT = { N: 'W', W: 'S', S: 'E', E: 'N' };
const RIGHT = { N: 'E', E: 'S', S: 'W', W: 'N' };
const WALK = '.,=bfD';
const EMO = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
const COL = { red: '#e5484d', blue: '#3b82f6', green: '#22a559', yellow: '#f5c518', purple: '#9b5de5' };
const MAPW = 80, MAPH = 60, SPEED = 7.5;

const G = { w: 0, wd: null, pal: null, palKey: '', map: null, W: 0, H: 0, ents: [], grid: new Map(), mobs: [], prot: null,
  maze: null, bag: [], active: null, seq: 0, boxStep: 0, banner: null, t: 0, started: false, busy: 0, acting: false, immune: 0, steps: 0,
  spawn: [0, 0], gatePos: [0, 0], miniBase: null, doors: null };
const P = { x: 0, y: 0, fx: 0, fy: 0, t: 1, dir: 'S', moving: false, phase: 0 };
const key = (x, y) => y * G.W + x;

const cv = $('#game'), cx = cv.getContext('2d');
let T = 48, TC = {};

/* ═══════════════ Progreso ═══════════════ */
const hasRune = (w, id) => !!(S.runes[w] && S.runes[w][id]);
const runeCount = w => Object.keys(S.runes[w] || {}).length;
const crystalCount = () => S.crystals.slice(0, 4).filter(Boolean).length;
const npcOf = q => G.ents.find(e => e.type === 'npc' && e.q === q) || null;

/* ═══════════════ Generación del mundo ═══════════════ */
function buildFeatures(wd) {
  const F = [], rows = (w, h) => Array.from({ length: h }, () => '.'.repeat(w));
  const deco = (dx, dy) => ({ dx, dy, type: 'decor', emoji: wd.house, solid: 1, size: .95 });
  F.push({ fixed: [33, 26], w: 13, h: 8, rows: rows(13, 8), ents: [
    deco(1, 1), deco(4, 0), deco(8, 0), deco(11, 1),
    { dx: 3, dy: 3, type: 'owl', emoji: '🦉', name: 'Ollie', solid: 1 },
    { dx: 6, dy: 2, type: 'fountain', emoji: '⛲', name: 'Fountain', solid: 1, size: .95 },
    { dx: 9, dy: 3, type: 'merchant', emoji: '🧝', name: 'Merchant Pip', solid: 1 },
    { dx: 10, dy: 6, type: 'portal', emoji: '🌀', name: 'Portal', solid: 1, size: .95 },
    { dx: 2, dy: 6, type: 'sign', solid: 1, text: [`Welcome to ${wd.name}! Talk to Ollie the owl.`, `¡Bienvenido a ${wd.es}! Habla con el búho Ollie.`] }
  ] });
  for (const q of wd.quests) {
    const npc = { type: 'npc', emoji: q.npc, name: q.name, solid: 1, q };
    if (q.type === 'plates') {
      const n = q.plates.length, w = 2 * n + 1;
      F.push({ w, h: 5, rows: rows(w, 5), ents: [...q.plates.map((p, i) => ({ dx: 1 + 2 * i, dy: 1, type: 'plate', label: p, q })), Object.assign(npc, { dx: w >> 1, dy: 3 })] });
    } else if (q.type === 'dig') {
      let x = 3, y = 6;
      for (const [d, n] of q.steps) { x += DIRS[d][0] * n; y += DIRS[d][1] * n; }
      F.push({ w: 11, h: 9, rows: rows(11, 9), ents: [
        { dx: 3, dy: 6, type: 'flag', emoji: '🚩' }, { dx: x, dy: y, type: 'digspot', q },
        { dx: 6, dy: 4, type: 'decor', emoji: '⛄', solid: 1 }, { dx: 9, dy: 7, type: 'decor', emoji: '⛄', solid: 1 },
        Object.assign(npc, { dx: 1, dy: 7 })] });
    } else if (q.type === 'boxes') {
      const box = (dx, dy, id) => ({ dx, dy, type: 'box', emoji: '📦', solid: 1, id, q });
      F.push({ w: 13, h: 7, rows: ['.............', '........R.R..', '..T..........', '.............', '.............', '.............', '.............'], ents: [
        box(2, 1, 'behind'), box(9, 1, 'between'), box(2, 3, 'front'), box(7, 3, 'fountain'), box(1, 5, 'lone1'), box(11, 5, 'lone2'),
        { dx: 6, dy: 3, type: 'decor', emoji: '⛲', solid: 1 }, Object.assign(npc, { dx: 6, dy: 5 })] });
    } else if (q.type === 'bridge') {
      const n = q.rows.length, h = 2 + 2 * n, R = ['~~~~~~~~~~~', '~~~.....~~~'], ents = [];
      for (let i = 0; i < n; i++) {           // fila 0 = la más cercana a la salida
        const row = q.rows[n - 1 - i], y = 2 + 2 * i, order = shuffle([0, 1, 2], rng(wd.seed + i * 31));
        if (i > 0) R.push('~~~.....~~~');
        R.push('~~~b~b~b~~~');
        order.forEach((k, c) => ents.push({ dx: 3 + 2 * c, dy: y, type: 'btile', label: row[k], ok: k === 0, q, hdx: 5, hdy: h - 1 }));
      }
      R.push('~~~.....~~~');
      ents.push({ dx: 5, dy: 1, type: 'altar', emoji: '🔮', name: 'Rune Altar', solid: 1, q });
      ents.push({ dx: 3, dy: h - 1, type: 'sign', solid: 1, q, text: q.rule });
      F.push({ w: 11, h, rows: R, ents });
    } else {
      F.push({ w: 5, h: 3, rows: rows(5, 3), ents: [deco(1, 0), Object.assign(npc, { dx: 3, dy: 1 })] });
    }
  }
  F.push({ w: 5, h: 3, rows: ['RRRRR', 'RR.RR', '.....'], ents: [{ dx: 2, dy: 1, type: 'gate', emoji: '⛩️', name: 'Maze Gate', solid: 1, size: .95 }] });
  return F;
}

function carveRoad(t, prot, block, jit, sx, sy, tx, ty) {
  const W = MAPW, H = MAPH, n = W * H, dist = new Float32Array(n).fill(Infinity), prev = new Int32Array(n).fill(-1), done = new Uint8Array(n);
  const s = sy * W + sx, goal = ty * W + tx, open = [s]; dist[s] = 0;
  while (open.length) {
    let bi = 0; for (let i = 1; i < open.length; i++) if (dist[open[i]] < dist[open[bi]]) bi = i;
    const c = open.splice(bi, 1)[0]; if (done[c]) continue; done[c] = 1; if (c === goal) break;
    const x = c % W, y = (c / W) | 0;
    for (const [dx, dy] of D4) {
      const nx = x + dx, ny = y + dy; if (nx < 2 || ny < 2 || nx >= W - 2 || ny >= H - 2) continue;
      const ni = ny * W + nx; if (done[ni] || block[ni]) continue;
      const ch = t[ny][nx], walk = WALK.includes(ch);
      let cst;
      if (prot[ni]) { if (!walk || ch === 'b') continue; cst = 1; }
      else cst = ch === '=' ? 0.5 : walk ? 1 + jit[ni] : ch === '~' ? 9 : 4;
      const nd = dist[c] + cst;
      if (nd < dist[ni]) { dist[ni] = nd; prev[ni] = c; open.push(ni); }
    }
  }
  if (goal !== s && prev[goal] < 0) return false;
  for (let c = goal; c >= 0; c = prev[c]) if (!prot[c]) t[(c / W) | 0][c % W] = '=';
  return true;
}

function loadWorld(w, where) {
  const wd = WORLDS[w], W = MAPW, H = MAPH, R = rng(wd.seed * 7919 + 13);
  Object.assign(G, { w, wd, pal: wd.pal, palKey: 'w' + w, W, H, maze: null, active: null, bag: [], seq: 0, boxStep: 0, doors: null, immune: 2 });
  resize();
  setBanner(null);
  const t = []; for (let y = 0; y < H; y++) t.push(new Array(W).fill('.'));
  const prot = new Uint8Array(W * H), block = new Uint8Array(W * H), jit = new Float32Array(W * H);
  for (let i = 0; i < jit.length; i++) jit[i] = R() * 1.5;
  const blob = (ch, n) => {
    let x = 4 + (R() * (W - 8) | 0), y = 4 + (R() * (H - 8) | 0);
    for (let i = 0; i < n; i++) {
      t[y][x] = ch; t[y][x + 1] = ch; t[y + 1][x] = ch; t[y + 1][x + 1] = ch;
      const d = D4[R() * 4 | 0]; x = clamp(x + d[0], 3, W - 5); y = clamp(y + d[1], 3, H - 5);
    }
  };
  for (let i = 0; i < 7; i++) blob('~', 25 + (R() * 45 | 0));
  for (let i = 0; i < 18; i++) blob('T', 14 + (R() * 40 | 0));
  for (let i = 0; i < 150; i++) { const x = R() * W | 0, y = R() * H | 0; if (t[y][x] === '.') t[y][x] = 'R'; }
  for (let i = 0; i < 520; i++) { const x = R() * W | 0, y = R() * H | 0; if (t[y][x] === '.') t[y][x] = ','; }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (x < 2 || y < 2 || x >= W - 2 || y >= H - 2) t[y][x] = 'T';

  /* colocar zonas (aldea, misiones, puerta del laberinto) */
  const feats = buildFeatures(wd), placed = [], ents = [];
  for (const f of feats) {
    let bx, by;
    if (f.fixed) [bx, by] = f.fixed;
    else {
      let best = null, bd = -1, valid = 0;
      for (let k = 0; k < 4000 && valid < 60; k++) {
        const x = 4 + (R() * (W - 8 - f.w) | 0), y = 4 + (R() * (H - 9 - f.h) | 0);
        if (placed.some(p => x < p.x + p.w + 4 && x + f.w + 4 > p.x && y < p.y + p.h + 4 && y + f.h + 4 > p.y)) continue;
        valid++;
        const d = Math.min(...placed.map(p => Math.hypot(x + f.w / 2 - p.x - p.w / 2, y + f.h / 2 - p.y - p.h / 2)));
        if (d > bd) { bd = d; best = [x, y]; }
      }
      if (!best) { console.warn('No hay sitio para una zona', f); continue; }
      [bx, by] = best;
    }
    f.x = bx; f.y = by; placed.push(f);
    for (let y = by - 1; y <= by + f.h; y++) for (let x = bx - 1; x <= bx + f.w; x++) {
      if (x >= bx && x < bx + f.w && y >= by && y < by + f.h) { t[y][x] = f.rows[y - by][x - bx]; prot[y * W + x] = 1; }
      else if (!'.,='.includes(t[y][x])) t[y][x] = '.';
    }
    for (const e of f.ents) {
      const o = Object.assign({}, e, { x: bx + e.dx, y: by + e.dy });
      if (e.hdx != null) { o.hx = bx + e.hdx; o.hy = by + e.hdy; }
      ents.push(o); if (o.solid) block[o.y * W + o.x] = 1;
    }
    f.entry = [bx + (f.w >> 1), by + f.h];
  }
  const sp = [feats[0].x + 6, feats[0].y + 5];
  for (const f of feats.slice(1)) if (f.entry && !carveRoad(t, prot, block, jit, sp[0], sp[1], f.entry[0], f.entry[1])) console.warn('Zona sin camino', f);

  /* celdas alcanzables para repartir objetos */
  const seen = new Uint8Array(W * H), reach = [], qu = [sp[1] * W + sp[0]]; seen[qu[0]] = 1;
  while (qu.length) {
    const c = qu.pop(), x = c % W, y = (c / W) | 0;
    if (!prot[c] && (t[y][x] === '.' || t[y][x] === ',')) reach.push(c);
    for (const [dx, dy] of D4) { const ni = (y + dy) * W + x + dx; if (!seen[ni] && WALK.includes(t[y + dy][x + dx]) && !block[ni]) { seen[ni] = 1; qu.push(ni); } }
  }
  reach.sort((a, b) => a - b);
  G.unreached = feats.filter(f => f.entry && !seen[f.entry[1] * W + f.entry[0]]).length;
  const used = new Set();
  const takeCell = cond => {
    for (let k = 0; k < 600; k++) {
      const c = reach[R() * reach.length | 0]; if (used.has(c)) continue;
      const x = c % W, y = (c / W) | 0; if (cond && !cond(x, y)) continue;
      used.add(c); return [x, y];
    }
    return null;
  };
  const open8 = (x, y) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const i = (y + dy) * W + x + dx; if (!WALK.includes(t[y + dy][x + dx]) || block[i] || used.has(i) && (dx || dy)) return false; } return true; };
  const far = d => (x, y) => Math.hypot(x - sp[0], y - sp[1]) > d;
  S.orbs[w] = S.orbs[w] || {};
  wd.vocab.forEach((v, i) => { const c = takeCell(far(6)); if (c && !S.orbs[w][i]) ents.push({ x: c[0], y: c[1], type: 'orb', i }); });
  wd.chests.forEach((r, i) => { const c = takeCell((x, y) => far(14)(x, y) && open8(x, y)); if (c) ents.push({ x: c[0], y: c[1], type: 'chest', i, solid: 1, name: 'Chest' }); });
  for (const q of wd.quests) if (q.type === 'fetch') {
    const chef = ents.find(e => e.q === q);
    for (const [name, emoji] of q.things) { const c = takeCell((x, y) => Math.hypot(x - chef.x, y - chef.y) < 17) || takeCell(); if (c) ents.push({ x: c[0], y: c[1], type: 'item', name, emoji, q }); }
  }
  G.mobs = [];
  for (let i = 0; i < 13; i++) { const c = takeCell(far(10)); if (c) G.mobs.push({ x: c[0], y: c[1], fx: c[0], fy: c[1], t: 1, wait: R() * 2, emoji: wd.mob }); }

  G.map = t; G.prot = prot; G.ents = ents; G.grid = new Map();
  for (const e of ents) G.grid.set(e.y * W + e.x, e);
  G.spawn = sp;
  const gate = ents.find(e => e.type === 'gate'); G.gatePos = [gate.x, gate.y + 1];

  /* minimapa */
  const mb = document.createElement('canvas'); mb.width = W; mb.height = H; const mg = mb.getContext('2d'), p = wd.pal;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const c = t[y][x]; mg.fillStyle = c === 'T' ? p.leaf : c === 'R' ? p.rock : c === '~' ? p.water : c === '=' ? p.path : c === 'b' ? '#ffffff' : p.g[0];
    mg.fillRect(x, y, 1, 1);
  }
  G.miniBase = mb;

  let pos = where === 'gate' ? G.gatePos : (where && where.x != null ? [where.x, where.y] : sp);
  if (!canWalk(pos[0], pos[1])) pos = sp;
  placePlayer(pos[0], pos[1], 'S');
  S.world = w; S.x = P.x; S.y = P.y;
  $('#place').textContent = `${wd.icon} ${wd.name}`;
  hud(); drawBag();
}
function placePlayer(x, y, dir) { P.x = P.fx = x; P.y = P.fy = y; P.t = 1; P.moving = false; P.dir = dir; }
function canWalk(x, y) {
  if (x < 0 || y < 0 || x >= G.W || y >= G.H || !WALK.includes(G.map[y][x])) return false;
  const e = G.grid.get(key(x, y)); return !(e && e.solid);
}
function removeEnt(e) { G.grid.delete(key(e.x, e.y)); const i = G.ents.indexOf(e); if (i >= 0) G.ents.splice(i, 1); }
function drawBag() { $('#bag').textContent = G.bag.length ? '🎒 ' + G.bag.map(b => b.emoji).join('') : ''; }

/* ═══════════════ Banner de instrucciones ═══════════════ */
function setBanner(b) {
  G.banner = b; const el = $('#banner');
  if (!b) { el.classList.add('hidden'); return; }
  el.classList.remove('hidden');
  $('#bEn').textContent = b.en; $('#bEs').textContent = b.es; $('#bEs').classList.add('hidden');
  $('#bHint').textContent = b.cost ? `💡 Español (−${b.cost} 🪙)` : '💡 Español';
}
$('#bSpeak').onclick = () => G.banner && speak(G.banner.en);
$('#bHint').onclick = () => {
  const b = G.banner; if (!b) return;
  if (b.cost && !b.paid) {
    if (S.coins < b.cost) { toast('No tienes monedas suficientes 🪙'); return; }
    S.coins -= b.cost; b.paid = 1; hud(); $('#bHint').textContent = '💡 Español';
  }
  $('#bEs').classList.toggle('hidden');
};

/* ═══════════════ Laberintos ═══════════════ */
const CARD = { N: ['north', 'norte'], E: ['east', 'este'], S: ['south', 'sur'], W: ['west', 'oeste'] };
const COLES = { red: 'roja', blue: 'azul', green: 'verde', yellow: 'amarilla' };
const COLLIKE = { red: 'a strawberry', blue: 'the sky', green: 'the grass', yellow: 'a banana' };
const MARKS = [['statue', '🗿', 'la estatua'], ['barrel', '🛢️', 'el barril'], ['torch', '🔥', 'la antorcha'], ['plant', '🌵', 'la planta'],
  ['skull', '💀', 'la calavera'], ['key', '🗝️', 'la llave'], ['mushroom', '🍄', 'la seta'], ['candle', '🕯️', 'la vela']];
const REL = {
  left: [['Turn left.', 'Take the door on your left.', 'Go left.'], 'gira a la izquierda'],
  right: [['Turn right.', 'Take the door on your right.', 'Go right.'], 'gira a la derecha'],
  straight: [['Go straight ahead.', "Don't turn. Keep walking straight.", 'Walk straight on.'], 'sigue todo recto'],
  back: [['Turn around and go back.', 'Go back through the door behind you.'], 'da la vuelta y regresa por donde viniste']
};
const NEG = { left: "Don't turn left.", right: "Don't turn right.", straight: "Don't go straight.", back: "Don't go back." };
const STYLES = [['card'], ['rel', 'rel', 'rel', 'card'], ['color', 'color', 'color', 'rel', 'card'], ['mark', 'mark', 'mark', 'color', 'rel'],
  ['mark', 'color', 'rel', 'card', 'cond', 'cond', 'double', 'double']];
const cap = s => s[0].toUpperCase() + s.slice(1);

function genInstr(M, entry) {
  const sides = ['N', 'E', 'S', 'W'], facing = OPP[entry];
  const cs = shuffle(['red', 'blue', 'green', 'yellow']), ms = shuffle(MARKS).slice(0, 4), col = {}, mark = {};
  sides.forEach((s, i) => { col[s] = cs[i]; mark[s] = ms[i]; });
  const room = { col, mark, entry };
  if (M.pending) {
    const p = M.pending; M.pending = null;
    return Object.assign(room, { ans: p.ans, en: 'The stone is silent… Remember the last instruction!', es: 'La piedra calla… Recuerda la instrucción anterior: ' + p.es + '.' });
  }
  let st = pick(STYLES[M.w]); if (st === 'double' && M.step >= M.total - 1) st = 'cond';
  const fwd = sides.filter(s => s !== entry);
  let ans = pick(fwd), en, es;
  const cardEn = s => pick([`Go ${CARD[s][0]}.`, `Walk to the ${CARD[s][0]}.`, `The way out is to the ${CARD[s][0]}.`, `Take the ${CARD[s][0]} door.`]);
  const cardEs = s => `Ve hacia el ${CARD[s][1]}.`;
  const relOf = s => s === facing ? 'straight' : s === LEFT[facing] ? 'left' : s === RIGHT[facing] ? 'right' : 'back';
  if (st === 'card') { en = cardEn(ans); es = cardEs(ans); }
  else if (st === 'rel') {
    if (M.step > 0 && rnd() < .15) ans = entry;
    const r = relOf(ans);
    if (r !== 'back' && rnd() < .3) { en = shuffle(['left', 'right', 'straight', 'back'].filter(x => x !== r)).map(o => NEG[o]).join(' '); es = 'Las otras tres no: ' + REL[r][1] + '.'; }
    else { en = pick(REL[r][0]); es = cap(REL[r][1]) + '.'; }
  } else if (st === 'color') {
    const c = col[ans], v = rnd();
    en = v < .5 ? pick([`Take the ${c} door.`, `Go through the ${c} door.`, `Open the ${c} door.`])
      : v < .75 ? `The right door is the same colour as ${COLLIKE[c]}.`
        : shuffle(cs.filter(x => x !== c)).map(x => `Not the ${x} door.`).join(' ');
    es = `Toma la puerta ${COLES[c]}.`;
  } else if (st === 'mark') {
    if (rnd() < .7) { const m = mark[ans]; en = pick([`Take the door next to the ${m[0]}.`, `The exit is near the ${m[0]}.`, `Go through the door beside the ${m[0]}.`]); es = `Toma la puerta que está junto a ${m[2]}.`; }
    else { const m = mark[OPP[ans]]; en = `The exit is opposite the ${m[0]}.`; es = `La salida está enfrente de ${m[2]} (en el lado contrario de la sala).`; }
  } else if (st === 'cond') {
    const s = pick(sides), truth = rnd() < .5, c = truth ? col[s] : pick(cs.filter(x => x !== col[s])), other = pick(fwd.filter(x => x !== ans));
    const a = truth ? ans : other, b = truth ? other : ans;
    en = `If the ${c} door is in the ${CARD[s][0]}, go ${CARD[a][0]}. If not, go ${CARD[b][0]}.`;
    es = `Si la puerta ${COLES[c]} está al ${CARD[s][1]}, ve al ${CARD[a][1]}. Si no, ve al ${CARD[b][1]}.`;
  } else { /* double: instrucción para dos salas */
    const r2 = pick(['left', 'right', 'straight']), ans2 = r2 === 'left' ? LEFT[ans] : r2 === 'right' ? RIGHT[ans] : ans;
    en = `${cardEn(ans)} Then, in the next room, ${{ left: 'turn left', right: 'turn right', straight: 'go straight ahead' }[r2]}.`;
    es = `${cardEs(ans)} Después, en la siguiente sala, ${REL[r2][1]}.`;
    M.pending = { ans: ans2, es: cap(REL[r2][1]) };
  }
  return Object.assign(room, { ans, en, es });
}

function enterMaze() {
  G.maze = { w: G.w, step: 0, cp: 0, total: G.wd.rooms, pending: null, room: null, bossDown: false };
  G.palKey = 'm' + G.w; G.active = null; G.bag = []; drawBag();
  resize();
  buildRoom('S');
}
function buildRoom(entry) {
  const M = G.maze, W = 15, H = 11, t = [];
  for (let y = 0; y < H; y++) { const r = []; for (let x = 0; x < W; x++) r.push(x === 0 || y === 0 || x === W - 1 || y === H - 1 ? '#' : 'f'); t.push(r); }
  G.W = W; G.H = H; G.map = t; G.ents = []; G.grid = new Map(); G.mobs = []; G.prot = null;
  const doors = { N: [7, 0], S: [7, 10], W: [0, 5], E: [14, 5] }, inPos = { N: [7, 1], S: [7, 9], W: [1, 5], E: [13, 5] };
  const markPos = { N: [9, 1], S: [5, 9], W: [1, 3], E: [13, 7] };
  const add = e => { G.ents.push(e); G.grid.set(key(e.x, e.y), e); };
  G.doors = doors;
  const last = M.step >= M.total;
  if (last) {
    M.room = null;
    add({ x: 7, y: 4, type: 'crystal', emoji: '💎', name: 'Crystal', solid: 1, size: 1 });
    if (M.w === 4 && !M.bossDown) add({ x: 7, y: 6, type: 'boss', emoji: '🧙', name: 'Lord Hush', solid: 1, size: 1.1 });
    setBanner({ en: M.w === 4 && !M.bossDown ? 'Lord Hush is waiting for you. Speak to him!' : 'You found the crystal! Take it.', es: M.w === 4 && !M.bossDown ? 'Lord Hush te está esperando. ¡Háblale!' : '¡Encontraste el cristal! Cógelo.' });
  } else {
    const r = M.room = genInstr(M, entry);
    for (const s in doors) t[doors[s][1]][doors[s][0]] = 'D';
    if (M.w >= 3) for (const s in markPos) add({ x: markPos[s][0], y: markPos[s][1], type: 'decor', emoji: r.mark[s][1], solid: 1, size: .8 });
    add({ x: 7, y: 5, type: 'stone', emoji: '🪨', name: 'Guide Stone', solid: 1, size: .9 });
    setBanner({ en: r.en, es: r.es, cost: 3 });
  }
  add({ x: inPos[entry][0], y: inPos[entry][1], type: 'foot', dir: OPP[entry] });
  placePlayer(inPos[entry][0], inPos[entry][1], OPP[entry]);
  $('#place').textContent = last ? `💎 ${G.wd.crystal[0]}` : `🧭 Maze · Room ${M.step + 1} / ${M.total}`;
}
async function mazeDoor() {
  const M = G.maze, side = Object.keys(G.doors).find(s => G.doors[s][0] === P.x && G.doors[s][1] === P.y);
  if (M.step === 0 && side === 'S') { await fade(() => loadWorld(G.w, 'gate')); return; }
  if (side === M.room.ans) {
    sfx.ok(); M.step++;
    if (M.total >= 7 && M.step === (M.total >> 1) && M.cp < M.step) { M.cp = M.step; toast('🚩 <b>Checkpoint!</b> Punto de control'); }
    await fade(() => buildRoom(OPP[side]));
  } else {
    sfx.bad(); const alive = hurt();
    if (!alive) return faint();
    await fade(() => { M.step = M.cp; M.pending = null; buildRoom('S'); });
    await say([{ en: 'Wrong door! You are lost in the fog…', es: '¡Puerta equivocada! Te pierdes en la niebla y vuelves ' + (M.cp ? 'al punto de control' : 'al inicio') + '. (−1 ❤️)' }]);
  }
}
async function bossFight(e) {
  const M = G.maze;
  await say([
    L(e, ['So… a little traveller wants my crystals? Words are noisy. I love SILENCE!', 'Así que… ¿un pequeño viajero quiere mis cristales? Las palabras hacen ruido. ¡Yo amo el SILENCIO!']),
    L(e, ['Answer my questions… if you can!', 'Responde a mis preguntas… ¡si puedes!'])
  ]);
  const MAXHP = 7; let hp = MAXHP, i = 0; const pool = shuffle(BOSS);
  while (hp > 0) {
    const it = pool[i++ % pool.length];
    const ok = await askMC({ title: '⚔️ Lord Hush', head: `<div class="boss">🧙</div><div class="hp"><i style="width:${hp / MAXHP * 100}%"></i></div>`, q: it[0], correct: it[1], wrong: it.slice(2) });
    if (ok) { hp--; addXp(8); }
    else if (!hurt()) {
      closeModal(); S.hearts = S.maxHearts; hud();
      await say([L(e, ['Ha ha ha! Silence wins!', '¡Ja, ja, ja! ¡El silencio gana!']), N('🦉 Ollie te reanima con su magia. ¡Háblale otra vez a Lord Hush para volver a intentarlo!')]);
      return;
    }
  }
  closeModal(); M.bossDown = true; sfx.win();
  await say([L(e, ['Nooo! Your words… they are too strong! I… I cannot… speak…', '¡Nooo! Tus palabras… ¡son demasiado fuertes! Yo… no puedo… hablar…']), N('✨ Lord Hush se desvanece en una nube de letras. ¡El último cristal es tuyo!')]);
  removeEnt(e);
  setBanner({ en: 'You defeated Lord Hush! Take the crystal.', es: '¡Derrotaste a Lord Hush! Coge el cristal.' });
}
async function takeCrystal() {
  const M = G.maze, w = G.w, wd = G.wd;
  if (w === 4 && !M.bossDown) { await say([N('Lord Hush protege el cristal. ¡Primero debes vencerle!')]); return; }
  const first = !S.crystals[w]; S.crystals[w] = 1; S.coins += first ? 50 : 10; sfx.win(); addXp(first ? 100 : 20); save();
  await say([{ en: `You got the ${wd.crystal[0]}!`, es: `💎 ¡Has conseguido el ${wd.crystal[1]}! Las palabras vuelven a ${wd.es}.` }]);
  await fade(() => loadWorld(w, 'gate'));
  if (w === 4 && !S.won) { S.won = true; save(); await ending(); }
  else if (first) {
    const n = crystalCount();
    await say([{ n: 'Ollie', e: '🦉', en: n >= 4 && w !== 4 ? 'You have four crystals! The portal to the Sky Citadel is open now!' : 'Well done! Use the portal in the village to travel to another world.',
      es: n >= 4 && w !== 4 ? '¡Tienes cuatro cristales! ¡El portal a la Ciudadela del Cielo ya está abierto!' : '¡Bien hecho! Usa el portal 🌀 de la aldea para viajar a otro mundo.' }]);
  }
}
async function ending() {
  await say([
    N('🌈 Los cinco cristales brillan juntos. Por todo Lexara, la gente vuelve a cantar, a contar historias y a saludarse.'),
    { n: 'Ollie', e: '🦉', en: 'You did it! You brought the words back. You are the Hero of Lexara!', es: '¡Lo lograste! Devolviste las palabras. ¡Eres el Héroe de Lexara!' },
    { n: 'Ollie', e: '🦉', en: 'And remember: every word you learn is a new key. Keep learning!', es: 'Y recuerda: cada palabra que aprendes es una llave nueva. ¡Sigue aprendiendo!' }
  ]);
  const c = openModal(`<div class="boss">🏆</div><h3>The End · Fin</h3><div class="q">Congratulations!<br>You saved Lexara.</div>
    <div class="sub">Palabras aprendidas: <b>${Object.keys(S.words).length}</b> · Nivel: <b>${S.level}</b> · Cristales: 💎💎💎💎💎</div>
    <div class="sub">Puedes seguir explorando los mundos, completar las misiones que te falten y repetir los laberintos para practicar.</div>
    <div class="rowc"><button class="big" id="mClose">Seguir jugando</button></div>`);
  c.querySelector('#mClose').onclick = closeModal;
}

/* ═══════════════ Transiciones y desmayos ═══════════════ */
async function fade(fn) {
  const f = $('#fade'); G.busy++;
  try { f.classList.add('on'); await sleep(270); await fn(); f.classList.remove('on'); await sleep(180); }
  finally { f.classList.remove('on'); G.busy--; }
}
async function faint() {
  closeModal(); S.hearts = S.maxHearts;
  await fade(() => loadWorld(G.w));
  save();
  await say([N('💫 Te has quedado sin corazones… Ollie te lleva volando a la aldea y te cura. ¡No te rindas!')]);
}

/* ═══════════════ Misiones e interacción ═══════════════ */
async function complete(e, q) {
  const w = G.w; S.runes[w] = S.runes[w] || {}; S.runes[w][q.id] = 1;
  if (G.active === q) { G.active = null; setBanner(null); }
  S.coins += 15; sfx.win(); addXp(30); save();
  const n = runeCount(w), need = G.wd.need, lines = [];
  lines.push(e && e.type === 'npc' ? L(e, q.done) : { en: q.done[0], es: q.done[1] });
  lines.push(N(`✨ ¡Has conseguido una Runa! (${n}/${need} para abrir el laberinto) · +15 🪙`));
  if (n === need) lines.push(N('🌟 ¡Ya tienes suficientes runas! Busca la puerta del laberinto ⛩️ (el punto morado del minimapa).'));
  await say(lines);
}
function vocabQ(w) {
  const V = WORLDS[w].vocab, it = pick(V), others = shuffle(V.filter(v => v !== it)).slice(0, 3);
  const mode = pick(it[2] ? ['emoji', 'emoji', 'es', 'en'] : ['es', 'en']);
  S.words[it[0]] = w;
  if (mode === 'emoji') return { q: `${it[2]}  What is this?`, correct: it[0], wrong: others.map(o => o[0]) };
  if (mode === 'es') return { q: `How do you say "${it[1]}" in English?`, correct: it[0], wrong: others.map(o => o[0]) };
  return { q: `What does "${it[0]}" mean?`, correct: it[1], wrong: others.map(o => o[1]) };
}
async function encounter(m) {
  G.acting = true;
  try {
    G.mobs.splice(G.mobs.indexOf(m), 1);
    const ok = await askMC(Object.assign({ title: `${m.emoji} A Silence Shadow attacks! · ¡Una Sombra del Silencio!` }, vocabQ(G.w)));
    closeModal(); G.immune = 1.5;
    if (ok) { S.coins += 3; addXp(8); toast('✨ Shadow defeated! +3 🪙'); }
    else if (!hurt()) await faint();
    save();
  } finally { G.acting = false; }
}

async function useEnt(e) {
  const w = G.w, wd = G.wd, q = e.q;
  switch (e.type) {
    case 'npc': {
      if (hasRune(w, q.id)) { await say([L(e, q.done)]); return; }
      if (['mc', 'listen', 'scramble', 'order'].includes(q.type)) {
        await say([L(e, q.intro)]);
        if (await runItems(`${e.emoji} ${e.name}`, q.type, q.items)) await complete(e, q); else await faint();
      } else if (q.type === 'memory') {
        await say([L(e, q.intro)]); await askMemory(`${e.emoji} ${e.name}`, q.pairs); closeModal(); await complete(e, q);
      } else if (q.type === 'plates' || q.type === 'dig') {
        await say([L(e, q.intro)]); G.active = q; G.seq = 0;
        G.ents.forEach(p => { if (p.type === 'plate' && p.q === q) p.on = false; });
        setBanner({ en: q.task[0], es: q.task[1] });
      } else if (q.type === 'fetch') {
        if (G.active !== q) { await say([L(e, q.intro)]); G.active = q; setBanner({ en: q.task[0], es: q.task[1] }); return; }
        const wrong = G.bag.filter(b => !q.need.includes(b.name));
        if (wrong.length) {
          const b = wrong[0]; G.bag.splice(G.bag.indexOf(b), 1); drawBag();
          const back = { x: b.x, y: b.y, type: 'item', name: b.name, emoji: b.emoji, q }; G.ents.push(back); G.grid.set(key(b.x, b.y), back);
          await say([L(e, [`No, no! I don't need the ${b.name} ${b.emoji}. I put it back in its place. Read my list again!`, `¡No, no! No necesito: ${b.name} ${b.emoji}. Lo devuelvo a su sitio. ¡Lee mi lista otra vez!`])]);
        } else if (q.need.some(n => !G.bag.find(b => b.name === n))) {
          await say([L(e, [`Good, but I need three things! You have ${G.bag.length}. Look around the market.`, `Bien, ¡pero necesito tres cosas! Tienes ${G.bag.length}. Busca por los alrededores del mercado.`])]);
        } else { G.bag = []; drawBag(); await complete(e, q); }
      } else if (q.type === 'boxes') {
        await say([L(e, G.active === q ? ['Read my clue again, dear.', 'Lee mi pista otra vez, querido.'] : q.intro)]);
        G.active = q; const c = q.clues[G.boxStep]; setBanner({ en: c.en, es: c.es });
      }
      return;
    }
    case 'box': {
      if (hasRune(w, q.id) || e.open) { await say([N('📦 La caja está vacía.')]); return; }
      if (G.active !== q) { await say([N('📦 La caja está cerrada con un hechizo. Habla primero con la fantasma Greta 👻.')]); return; }
      if (e.id === q.clues[G.boxStep].id) {
        e.open = true; e.emoji = '🗝️'; G.boxStep++; sfx.get();
        if (G.boxStep >= q.clues.length) { await complete(npcOf(q), q); return; }
        const c = q.clues[G.boxStep]; setBanner({ en: c.en, es: c.es });
        await say([{ en: 'You found a key! Read the next clue.', es: '¡Encontraste una llave! 🔑 Lee la siguiente pista.' }]);
      } else {
        sfx.bad(); const alive = hurt();
        if (!alive) return faint();
        await say([{ en: 'Wrong box! A shadow jumps out!', es: '¡Caja equivocada! ¡Una sombra salta de dentro! (−1 ❤️) Lee la pista con atención.' }]);
      }
      return;
    }
    case 'sign':
      await say([{ n: 'Sign', e: '📜', en: e.text[0], es: e.text[1] }]);
      if (q && !hasRune(w, q.id)) { G.active = q; setBanner({ en: e.text[0], es: e.text[1] }); }
      return;
    case 'altar':
      if (hasRune(w, q.id)) await say([N('🔮 El altar ya te entregó su runa.')]); else await complete(e, q);
      return;
    case 'owl': {
      const n = runeCount(w), lines = wd.owl.map(p => L(e, p));
      lines.push(N(S.crystals[w] ? `💎 Ya tienes el cristal de este mundo. Cristales: ${S.crystals.filter(Boolean).length}/5. Usa el portal 🌀 para viajar.`
        : `📜 Runas en este mundo: ${n}/${wd.need}. ${n >= wd.need ? '¡Ve al laberinto ⛩️ (punto morado del minimapa)!' : 'Los puntos amarillos del minimapa son misiones pendientes.'}`));
      await say(lines); return;
    }
    case 'fountain':
      S.hearts = S.maxHearts; hud(); sfx.get();
      await say([{ en: 'You drink the fresh water. You feel great!', es: 'Bebes el agua fresca. ¡Te sientes genial! (corazones restaurados ❤️)' }]); return;
    case 'merchant': await shop(e); return;
    case 'portal': await portalMenu(); return;
    case 'chest': {
      const id = w + '-' + e.i;
      if (S.chests[id]) { await say([N('El cofre está vacío.')]); return; }
      const r = wd.chests[e.i];
      await say([{ n: 'Chest', e: '🔒', en: 'The chest is locked with a riddle. Answer it to open me!', es: 'El cofre está cerrado con un acertijo. ¡Respóndelo para abrirme!' }]);
      const ok = await askMC({ title: '🔒 Riddle · Acertijo', q: r[0], correct: r[1], wrong: r.slice(2) }); closeModal();
      if (ok) { S.chests[id] = 1; S.coins += 20; S.potions++; addXp(15); sfx.win(); save(); toast('🎁 +20 🪙 · +1 🧪'); }
      else if (!hurt()) await faint();
      return;
    }
    case 'gate': {
      const n = runeCount(w);
      if (n < wd.need && !S.crystals[w]) { await say([{ n: 'Maze Gate', e: '⛩️', en: `The gate is closed. You need ${wd.need} runes. You have ${n}.`, es: `La puerta está cerrada. Necesitas ${wd.need} runas. Tienes ${n}. Ayuda a más aldeanos.` }]); return; }
      await say([{ n: 'Ollie', e: '🦉', en: wd.mazeIntro[0], es: wd.mazeIntro[1] },
        N('⚠️ Si eliges la puerta equivocada pierdes un corazón y vuelves atrás. Puedes pagar 3 🪙 para ver la pista en español. La puerta de abajo de la primera sala es la salida.')]);
      await fade(() => enterMaze()); return;
    }
    case 'stone': await say([{ n: 'Guide Stone', e: '🪨', en: G.maze.room.en }]); return;
    case 'boss': await bossFight(e); return;
    case 'crystal': await takeCrystal(); return;
    case 'decor': if (e.emoji === '⛄') await say([{ n: 'Snowman', e: '⛄', en: 'I am a snowman. I am very cold, but I am happy!', es: 'Soy un muñeco de nieve. ¡Tengo mucho frío, pero estoy feliz!' }]); return;
  }
}
async function interact() {
  if (G.acting || UI.lock || G.busy || P.moving || !G.started) return;
  G.acting = true;
  try {
    const [dx, dy] = DIRS[P.dir], e = G.grid.get(key(P.x + dx, P.y + dy));
    if (e && e.solid) { await useEnt(e); return; }
    const u = G.grid.get(key(P.x, P.y));
    if (G.active && G.active.type === 'dig') {
      if (u && u.type === 'digspot' && u.q === G.active) { sfx.get(); toast('⛏️ You found the golden compass! 🧭'); await complete(npcOf(u.q), u.q); }
      else { sfx.bad(); toast('⛏️ Nothing here… · Aquí no hay nada'); }
    }
  } finally { G.acting = false; }
}
async function onStep() {
  G.steps++;
  if (G.maze) { if (G.map[P.y][P.x] === 'D') await mazeDoor(); return; }
  if (G.steps % 12 === 0) { S.x = P.x; S.y = P.y; save(); }
  const e = G.grid.get(key(P.x, P.y)); if (!e) return;
  if (e.type === 'orb') {
    const v = G.wd.vocab[e.i]; removeEnt(e); S.orbs[G.w][e.i] = 1; S.words[v[0]] = G.w; sfx.get(); addXp(4); speak(v[0]);
    toast(`✨ New word: ${v[2] || ''} <b>${esc(v[0])}</b> = ${esc(v[1])}`, 3600);
  } else if (e.type === 'item') {
    if (G.bag.length >= 3) { toast('🎒 Bag full! · Bolsa llena (máx. 3). Habla con el chef.'); return; }
    removeEnt(e); G.bag.push(e); drawBag(); sfx.get();
  } else if (e.type === 'plate') {
    const q = e.q; if (hasRune(G.w, q.id)) return;
    if (G.active !== q) { toast('Habla primero con ' + q.name + ' ' + q.npc); return; }
    if (e.on) return;
    if (e.label === q.seq[G.seq]) {
      e.on = true; G.seq++; sfx.ok();
      if (G.seq >= q.seq.length) await complete(npcOf(q), q);
    } else {
      sfx.bad(); G.seq = 0; G.ents.forEach(p => { if (p.type === 'plate' && p.q === q) p.on = false; });
      if (!hurt()) return faint();
      toast('❌ Wrong! Start again · ¡Empieza de nuevo! (−1 ❤️)');
    }
  } else if (e.type === 'btile') {
    if (hasRune(G.w, e.q.id)) return;
    if (e.ok) { e.state = 'ok'; sfx.ok(); }
    else {
      e.state = 'bad'; sfx.bad(); const alive = hurt();
      placePlayer(e.hx, e.hy, 'N');
      if (!alive) return faint();
      toast(`💦 <b>${esc(e.label)}</b>? Splash! · ¡Al agua! (−1 ❤️)`);
    }
  }
}

/* ═══════════════ Menús ═══════════════ */
async function shop(e) {
  await say([L(e, ['Hello, friend! Do you want to buy a potion? It costs twelve coins.', '¡Hola, amigo! ¿Quieres comprar una poción? Cuesta doce monedas.'])]);
  const render = () => {
    const c = openModal(`<h3>🧝 Merchant Pip's Shop</h3><div class="q">🧪 Potion — 12 🪙<div class="sub">Recupera 3 corazones. Tienes ${S.potions} · Monedas: ${S.coins} 🪙</div></div>
      <div class="rowc"><button class="big" id="mBuy" ${S.coins < 12 ? 'disabled' : ''}>Buy · Comprar</button><button id="mClose">Goodbye! · Salir</button></div>`);
    c.querySelector('#mBuy').onclick = () => { S.coins -= 12; S.potions++; hud(); sfx.get(); save(); render(); };
    c.querySelector('#mClose').onclick = closeModal;
  };
  render();
}
function portalMenu() {
  const n = crystalCount();
  const c = openModal(`<h3>🌀 Portal — Choose a world · Elige un mundo</h3>` + WORLDS.map((w, i) => {
    const locked = i === 4 && n < 4;
    return `<button class="worldBtn ${i === G.w ? 'here' : ''}" data-i="${i}" ${locked ? 'disabled' : ''}><span class="ic">${locked ? '🔒' : w.icon}</span><span><b>${i + 1}. ${w.name}</b> — ${w.es} ${S.crystals[i] ? '💎' : ''}
      <small>${locked ? `Necesitas los 4 primeros cristales (tienes ${n})` : w.level}${i === G.w ? ' · estás aquí' : ''}</small></span></button>`;
  }).join('') + `<div class="rowc"><button id="mClose">Cerrar</button></div>`);
  c.querySelector('#mClose').onclick = closeModal;
  c.querySelectorAll('.worldBtn').forEach(b => b.onclick = async () => {
    const i = +b.dataset.i; closeModal(); if (i === G.w) return;
    await travel(i);
  });
}
async function travel(i) {
  sfx.win(); await fade(() => loadWorld(i)); save();
  if (!S.flags['v' + i]) { S.flags['v' + i] = 1; save(); await say(WORLDS[i].owl.map(p => ({ n: 'Ollie', e: '🦉', en: p[0], es: p[1] }))); }
}
function openMenu() {
  if (UI.lock || !G.started) return;
  const learned = Object.keys(S.words);
  const find = en => { for (const w of WORLDS) { const v = w.vocab.find(x => x[0] === en); if (v) return v; } return [en, '', '']; };
  const c = openModal(`<div class="menu"><h3 style="text-align:center">📖 Diario del viajero</h3>
    <h4>Misión</h4>${WORLDS.map((w, i) => `<div class="w">${w.icon} <b>${w.name}</b> — ${S.crystals[i] ? '💎 cristal conseguido' : `runas ${runeCount(i)}/${w.need}`}</div>`).join('')}
    <div class="sub">Consigue ${WORLDS[0].need} runas en cada mundo ayudando a sus habitantes, abre el laberinto ⛩️ y recupera el cristal.</div>
    <h4>Diccionario (${learned.length} palabras) — toca para escuchar</h4>
    <div class="words">${learned.length ? learned.map(en => { const v = find(en); return `<button data-w="${esc(en)}">${v[2]} ${esc(en)} <i>= ${esc(v[1])}</i></button>`; }).join('') : '<span class="sub">Recoge las esferas brillantes ✨ del mapa para aprender palabras.</span>'}</div>
    <h4>Leyenda del minimapa</h4><div class="sub">⚪ tú · 🟡 misión pendiente · 🟢 misión hecha · 🟣 laberinto · 🔵 portal</div>
    <h4>Opciones</h4>
    <div class="rowc" style="justify-content:flex-start"><button id="mSound">${S.sound ? '🔊 Sonido: sí' : '🔇 Sonido: no'}</button><button id="mReset">🗑️ Borrar partida</button></div>
    <div class="rowc"><button class="big" id="mClose">Volver al juego</button></div></div>`);
  c.querySelector('#mClose').onclick = closeModal;
  c.querySelector('#mSound').onclick = () => { S.sound = !S.sound; save(); closeModal(); openMenu(); };
  c.querySelector('#mReset').onclick = () => { if (confirm('¿Seguro que quieres borrar tu partida y empezar de cero?')) { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* nada */ } location.reload(); } };
  c.querySelectorAll('.words button').forEach(b => b.onclick = () => speak(b.dataset.w));
}
$('#menuBtn').onclick = openMenu;
$('#potBtn').onclick = () => {
  if (UI.lock) return;
  if (S.potions < 1) { toast('No tienes pociones. Cómpralas en la aldea 🧝'); return; }
  if (S.hearts >= S.maxHearts) { toast('Ya tienes todos los corazones ❤️'); return; }
  S.potions--; S.hearts = Math.min(S.maxHearts, S.hearts + 3); hud(); sfx.get(); save();
};

/* ═══════════════ Dibujo ═══════════════ */
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr);
  let base = clamp(Math.min(innerWidth, innerHeight) / 10, 40, 64);
  /* en el laberinto la sala entera debe verse en pantalla */
  if (G.maze) base = Math.max(22, Math.min(base, innerWidth / 15.2, (innerHeight - (innerWidth < 761 && innerHeight > innerWidth ? 250 : 110)) / 11.2));
  T = Math.round(base * dpr);
  TC = {};
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function poly(g, pts) { g.beginPath(); g.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]); g.closePath(); }
function circ(g, x, y, r) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }

function drawTile(g, kind, p) {
  g.scale(T / 32, T / 32);
  const k = kind[0], v = +kind[1] || 0, r = rng(kind.charCodeAt(0) * 131 + v * 977 + 5);
  const ground = () => { g.fillStyle = p.g[0]; g.fillRect(0, 0, 32, 32); if (v % 2) { g.globalAlpha = .45; g.fillStyle = p.g[1]; g.fillRect(0, 0, 32, 32); g.globalAlpha = 1; } g.fillStyle = p.speck; for (let i = 0; i < 6; i++) g.fillRect(r() * 30 | 0, r() * 30 | 0, 2, 2); };
  if (k === 'g') ground();
  else if (k === 'd') { ground(); for (let i = 0; i < 3; i++) { const x = 5 + r() * 22, y = 5 + r() * 22; g.fillStyle = p.flower[i % 3]; circ(g, x, y, 2.2); g.fillStyle = 'rgba(0,0,0,.18)'; circ(g, x, y, .9); } }
  else if (k === 'p') { g.fillStyle = p.path; g.fillRect(0, 0, 32, 32); g.fillStyle = p.pathSpeck; for (let i = 0; i < 7; i++) g.fillRect(r() * 29 | 0, r() * 29 | 0, 3, 2); }
  else if (k === 'w') {
    g.fillStyle = p.water; g.fillRect(0, 0, 32, 32);
    if (p.stars) { g.fillStyle = p.water2; for (let i = 0; i < 4; i++) { g.globalAlpha = .4 + r() * .6; g.fillRect(r() * 30 | 0, r() * 30 | 0, 1.5, 1.5); } g.globalAlpha = 1; }
    else { g.strokeStyle = p.water2; g.lineWidth = 1.5; g.globalAlpha = .7; for (let i = 0; i < 3; i++) { const y = 6 + i * 10, o = (v * 6 + i * 9) % 32; g.beginPath(); g.moveTo(o - 2, y); g.quadraticCurveTo(o + 3, y - 3, o + 8, y); g.stroke(); g.beginPath(); g.moveTo(o - 18, y + 4); g.quadraticCurveTo(o - 13, y + 1, o - 8, y + 4); g.stroke(); } g.globalAlpha = 1; }
  }
  else if (k === 'b') { g.fillStyle = p.water; g.fillRect(0, 0, 32, 32); g.fillStyle = 'rgba(0,0,0,.25)'; rr(g, 3, 5, 28, 26, 6); g.fill(); g.fillStyle = v === 1 ? '#8fe3a8' : v === 2 ? '#f08a8a' : '#f8fbff'; rr(g, 2, 2, 28, 26, 6); g.fill(); g.strokeStyle = 'rgba(40,60,110,.45)'; g.lineWidth = 1.5; g.stroke(); }
  else if (k === 'f') { g.fillStyle = p.floor; g.fillRect(0, 0, 32, 32); g.strokeStyle = 'rgba(0,0,0,.13)'; g.lineWidth = 1; g.strokeRect(.5, .5, 31, 31); g.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 3; i++) g.fillRect(r() * 26 | 0, r() * 26 | 0, 4, 2); }
  else if (k === '#') { g.fillStyle = p.wall; g.fillRect(0, 0, 32, 32); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1.5; for (let y = 0; y < 32; y += 8) { g.beginPath(); g.moveTo(0, y); g.lineTo(32, y); g.stroke(); const o = (y / 8) % 2 ? 8 : 0; for (let x = o; x < 32; x += 16) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 8); g.stroke(); } } g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(0, 0, 32, 3); }
  else if (k === 'r') {
    ground(); g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(16, 27, 12, 3.5, 0, 0, 7); g.fill();
    g.fillStyle = p.rock; poly(g, [5, 26, 4, 17, 10, 9, 20, 7, 27, 14, 28, 25]); g.fill();
    g.fillStyle = 'rgba(255,255,255,.28)'; poly(g, [10, 10, 20, 8, 22, 13, 11, 15]); g.fill();
    g.fillStyle = 'rgba(0,0,0,.18)'; poly(g, [5, 26, 28, 25, 27, 20, 6, 21]); g.fill();
  }
  else if (k === 't') {
    ground(); g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(16, 29, 10, 3, 0, 0, 7); g.fill();
    const s = p.tree;
    if (s === 'round') { g.fillStyle = p.trunk; g.fillRect(14, 19, 4, 10); g.fillStyle = p.leaf; circ(g, 16, 13, 11); g.fillStyle = p.leaf2; circ(g, 12 + v * 3, 10, 5.5); g.globalAlpha = .6; circ(g, 21 - v * 2, 16, 4); g.globalAlpha = 1; }
    else if (s === 'pine') { g.fillStyle = p.trunk; g.fillRect(14, 24, 4, 6); g.fillStyle = p.leaf; poly(g, [16, 13, 4, 27, 28, 27]); g.fill(); poly(g, [16, 7, 6, 20, 26, 20]); g.fill(); poly(g, [16, 1, 8, 13, 24, 13]); g.fill(); g.fillStyle = p.leaf2; poly(g, [16, 1, 11, 8, 14, 7, 16, 9, 18, 7, 21, 8]); g.fill(); poly(g, [10, 15, 7, 19, 12, 18]); g.fill(); poly(g, [22, 15, 25, 19, 20, 18]); g.fill(); }
    else if (s === 'cactus') { g.fillStyle = p.leaf; rr(g, 12, 5, 8, 24, 4); g.fill(); rr(g, 5, 12, 5, 9, 2.5); g.fill(); g.fillRect(7, 17, 7, 4); rr(g, 22, 9, 5, 10, 2.5); g.fill(); g.fillRect(18, 15, 7, 4); g.fillStyle = p.leaf2; g.fillRect(14, 8, 1.5, 18); if (v) { g.fillStyle = '#ff7eb6'; circ(g, 16, 5, 2.5); } }
    else if (s === 'dead') { g.strokeStyle = p.trunk; g.lineCap = 'round'; g.lineWidth = 4; g.beginPath(); g.moveTo(16, 29); g.lineTo(16, 13); g.stroke(); g.lineWidth = 2.5; g.beginPath(); g.moveTo(16, 19); g.lineTo(8, 11); g.moveTo(16, 15); g.lineTo(24, 7); g.moveTo(16, 13); g.lineTo(14, 4); g.moveTo(21, 10); g.lineTo(27, 11); g.stroke(); g.fillStyle = p.leaf; circ(g, 8, 10, 3.5); circ(g, 24, 7, 3); g.fillStyle = p.leaf2; circ(g, 14, 4, 2.5); }
    else { g.fillStyle = p.trunk; g.fillRect(8, 26, 16, 4); g.fillRect(8, 3, 16, 4); g.fillStyle = p.leaf2; g.fillRect(10, 7, 12, 19); g.fillStyle = p.leaf; g.fillRect(12, 7, 2, 19); g.fillRect(18, 7, 2, 19); g.fillStyle = '#ffd86b'; circ(g, 16, 3, 2.5); }
  }
}
function tileImg(kind) {
  const k = G.palKey + kind; if (TC[k]) return TC[k];
  const c = document.createElement('canvas'); c.width = c.height = T; drawTile(c.getContext('2d'), kind, G.pal); return TC[k] = c;
}
function drawHero(sx, sy) {
  const s = T / 32, walk = P.moving ? Math.sin(P.phase) : 0, bob = P.moving ? Math.abs(walk) * 1.2 : 0, d = P.dir;
  cx.save(); cx.translate(sx, sy - bob * s); cx.scale(s, s);
  cx.fillStyle = 'rgba(0,0,0,.25)'; cx.beginPath(); cx.ellipse(16, 29 + bob, 8, 2.8, 0, 0, 7); cx.fill();
  cx.fillStyle = '#4a3222'; cx.fillRect(11, 23 + walk * 2, 4, 6 - walk * 2); cx.fillRect(17, 23 - walk * 2, 4, 6 + walk * 2);
  if (d === 'N') { cx.fillStyle = '#8a2be2'; rr(cx, 8, 13, 16, 13, 4); cx.fill(); }
  else { cx.fillStyle = '#d9433f'; rr(cx, 9, 13, 14, 12, 4); cx.fill(); cx.fillStyle = '#f5c518'; cx.fillRect(9, 20, 14, 2); }
  cx.fillStyle = '#f2c79a';
  if (d !== 'W') cx.fillRect(22, 15 + walk * 1.5, 3, 6); if (d !== 'E') cx.fillRect(7, 15 - walk * 1.5, 3, 6);
  circ(cx, 16, 9, 7);
  cx.fillStyle = '#5a3716';
  if (d === 'N') circ(cx, 16, 8.5, 7.3);
  else { cx.beginPath(); cx.arc(16, 8, 7.4, Math.PI, 0); cx.fill(); if (d === 'E') cx.fillRect(8.6, 7, 4, 7); if (d === 'W') cx.fillRect(19.4, 7, 4, 7); }
  cx.fillStyle = '#1a1430';
  if (d === 'S') { cx.fillRect(12.5, 9, 2, 3); cx.fillRect(17.5, 9, 2, 3); }
  else if (d === 'E') cx.fillRect(19, 9, 2, 3); else if (d === 'W') cx.fillRect(11, 9, 2, 3);
  cx.restore();
}
function emoji(ch, x, y, size) { cx.fillStyle = '#000'; cx.font = `${Math.round(T * size)}px ${EMO}`; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(ch, x, y); }
function label(txt, x, y, size, color) {
  cx.font = `bold ${Math.round(T * size)}px "Trebuchet MS",system-ui,sans-serif`; cx.textAlign = 'center'; cx.textBaseline = 'middle';
  cx.lineWidth = Math.max(3, T * .09); cx.strokeStyle = 'rgba(255,255,255,.92)'; cx.lineJoin = 'round'; cx.strokeText(txt, x, y); cx.fillStyle = color || '#1a1430'; cx.fillText(txt, x, y);
}
function shadow(x, y) { cx.fillStyle = 'rgba(0,0,0,.22)'; cx.beginPath(); cx.ellipse(x + T / 2, y + T * .9, T * .3, T * .09, 0, 0, 7); cx.fill(); }

function drawFloorEnt(e, sx, sy) {
  const s = T / 32;
  if (e.type === 'plate') {
    const c = COL[e.label];
    cx.fillStyle = 'rgba(0,0,0,.3)'; rr(cx, sx + 3 * s, sy + 4 * s, 26 * s, 26 * s, 5 * s); cx.fill();
    cx.fillStyle = c || '#cfd3dc'; rr(cx, sx + 3 * s, sy + (e.on ? 4 : 2) * s, 26 * s, 26 * s, 5 * s); cx.fill();
    cx.lineWidth = 2 * s; cx.strokeStyle = e.on ? '#ffffff' : 'rgba(0,0,0,.35)'; cx.stroke();
    if (e.on) { cx.fillStyle = 'rgba(255,255,255,.35)'; cx.fill(); }
    if (!c) label(e.label, sx + T / 2, sy + T * .5, .32, e.on ? '#127a3c' : '#1a1430');
  } else if (e.type === 'btile') {
    const done = hasRune(G.w, e.q.id), st = done ? (e.ok ? 1 : 0) : e.state === 'ok' ? 1 : e.state === 'bad' ? 2 : 0;
    if (st) cx.drawImage(tileImg('b' + st), sx, sy);
    label(e.label, sx + T / 2, sy + T * .47, .33, st === 2 ? '#8a1c1c' : '#1a2a55');
  } else if (e.type === 'foot') {
    cx.save(); cx.translate(sx + T / 2, sy + T / 2); cx.rotate({ N: 0, E: Math.PI / 2, S: Math.PI, W: -Math.PI / 2 }[e.dir]);
    cx.fillStyle = 'rgba(255,255,255,.55)'; poly(cx, [0, -11 * s, 9 * s, 2 * s, 3.5 * s, 2 * s, 3.5 * s, 11 * s, -3.5 * s, 11 * s, -3.5 * s, 2 * s, -9 * s, 2 * s]); cx.fill(); cx.restore();
  } else if (e.type === 'flag') emoji(e.emoji, sx + T / 2, sy + T * .45, .7);
  else if (e.type === 'orb') {
    const y = sy + T * .5 + Math.sin(G.t * 3 + e.x) * T * .08, g = cx.createRadialGradient(sx + T / 2, y, 1, sx + T / 2, y, T * .34);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.4, 'rgba(255,224,120,.9)'); g.addColorStop(1, 'rgba(255,200,60,0)');
    cx.fillStyle = g; circ(cx, sx + T / 2, y, T * .34); emoji('✨', sx + T / 2, y, .34);
  } else if (e.type === 'item') { shadow(sx, sy); emoji(e.emoji, sx + T / 2, sy + T * .5 + Math.sin(G.t * 3 + e.x) * T * .05, .62); }
}
function drawSolidEnt(e, sx, sy) {
  const s = T / 32, mx = sx + T / 2;
  if (e.type === 'chest') {
    const open = S.chests[G.w + '-' + e.i];
    shadow(sx, sy); cx.fillStyle = '#8a5a2b'; rr(cx, sx + 5 * s, sy + 12 * s, 22 * s, 16 * s, 3 * s); cx.fill();
    cx.fillStyle = open ? '#3a2412' : '#a8713a'; rr(cx, sx + 5 * s, sy + (open ? 6 : 9) * s, 22 * s, 8 * s, 3 * s); cx.fill();
    cx.fillStyle = '#f5c518'; cx.fillRect(sx + 5 * s, sy + 17 * s, 22 * s, 2 * s); if (!open) cx.fillRect(sx + 14 * s, sy + 14 * s, 4 * s, 6 * s);
  } else if (e.type === 'sign') {
    shadow(sx, sy); cx.fillStyle = '#7b4b22'; cx.fillRect(sx + 14.5 * s, sy + 14 * s, 3 * s, 15 * s);
    cx.fillStyle = '#e8c98a'; rr(cx, sx + 5 * s, sy + 5 * s, 22 * s, 13 * s, 2 * s); cx.fill(); cx.strokeStyle = '#7b4b22'; cx.lineWidth = 1.5 * s; cx.stroke();
    cx.fillStyle = '#7b4b22'; cx.fillRect(sx + 8 * s, sy + 9 * s, 16 * s, 1.5 * s); cx.fillRect(sx + 8 * s, sy + 13 * s, 11 * s, 1.5 * s);
  } else if (e.type === 'portal') {
    cx.save(); cx.translate(mx, sy + T / 2); cx.rotate(G.t * 1.5); emoji(e.emoji, 0, 0, .95); cx.restore();
  } else {
    shadow(sx, sy);
    const bob = e.type === 'crystal' ? Math.sin(G.t * 2.5) * T * .08 : e.type === 'npc' || e.type === 'owl' || e.type === 'boss' ? Math.sin(G.t * 2 + e.x * 1.7) * T * .02 : 0;
    emoji(e.emoji, mx, sy + T * .5 + bob, e.size || .8);
  }
  const mark = e.type === 'npc' ? (hasRune(G.w, e.q.id) ? null : '!') : e.type === 'altar' && !hasRune(G.w, e.q.id) ? '!' : e.type === 'gate' ? '?' : null;
  if (mark) {
    const y = sy - T * .12 + Math.sin(G.t * 4) * T * .05;
    cx.fillStyle = e.type === 'gate' ? '#b06bff' : '#f5c518'; circ(cx, mx, y, T * .17); cx.strokeStyle = '#1a1430'; cx.lineWidth = 1.5 * s; cx.stroke();
    cx.fillStyle = '#1a1430'; cx.font = `bold ${Math.round(T * .26)}px sans-serif`; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(mark, mx, y + s);
  }
}
const parts = Array.from({ length: 46 }, () => ({ x: rnd(), y: rnd(), s: .4 + rnd() * .8, p: rnd() * 6 }));
function draw() {
  const vw = cv.width, vh = cv.height, W = G.W, H = G.H, pal = G.pal;
  const px = P.fx + (P.x - P.fx) * P.t, py = P.fy + (P.y - P.fy) * P.t;
  let camx = px * T + T / 2 - vw / 2, camy = py * T + T / 2 - vh / 2;
  camx = W * T <= vw ? (W * T - vw) / 2 : clamp(camx, 0, W * T - vw);
  /* deja libre la franja del cartel de instrucciones para que no tape el mapa */
  const br = G.banner ? $('#banner').getBoundingClientRect() : null, dpr = vw / innerWidth;
  const pad = br && br.top < innerHeight / 2 ? Math.round((br.bottom + 6) * dpr) : 0;
  camy = H * T + pad <= vh ? -(pad + (vh - pad - H * T) / 2) : clamp(camy, -pad, Math.max(-pad, H * T - vh));
  camx = Math.round(camx); camy = Math.round(camy);
  cx.fillStyle = G.maze ? '#0b0c14' : pal.leaf; cx.fillRect(0, 0, vw, vh);
  const x0 = Math.max(0, Math.floor(camx / T)), x1 = Math.min(W - 1, Math.floor((camx + vw) / T)), y0 = Math.max(0, Math.floor(camy / T)), y1 = Math.min(H - 1, Math.floor((camy + vh) / T));
  const wf = (G.t * 1.6 | 0) % 2, s = T / 32;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const c = G.map[y][x]; let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h = (h ^ (h >>> 16)) >>> 0;
    const kind = c === '.' ? 'g' + h % 4 : c === ',' ? 'd' + h % 3 : c === '=' ? 'p' + h % 2 : c === 'T' ? 't' + h % 2 : c === 'R' ? 'r' + h % 2 : c === '~' ? 'w' + ((wf + x + y) % 2) : c === 'b' ? 'b0' : c === '#' ? '#0' : 'f' + h % 3;
    cx.drawImage(tileImg(kind), x * T - camx, y * T - camy);
    if (c === 'D') {
      const side = y === 0 ? 'N' : y === H - 1 ? 'S' : x === 0 ? 'W' : 'E', M = G.maze, sx = x * T - camx, sy = y * T - camy;
      const exit = M.step === 0 && side === 'S';
      cx.fillStyle = '#1a1420'; cx.fillRect(sx, sy, T, T);
      cx.fillStyle = exit ? '#f8f2d0' : M.w >= 2 ? COL[M.room.col[side]] : '#9a6a36';
      rr(cx, sx + 4 * s, sy + 3 * s, 24 * s, 26 * s, 6 * s); cx.fill(); cx.strokeStyle = 'rgba(0,0,0,.45)'; cx.lineWidth = 2 * s; cx.stroke();
      cx.fillStyle = 'rgba(0,0,0,.28)'; cx.fillRect(sx + 15 * s, sy + 5 * s, 2 * s, 22 * s);
      if (exit) label('EXIT', sx + T / 2, sy + T / 2, .26, '#7a1c1c');
    }
  }
  const list = [];
  for (const e of G.ents) {
    if (e.x < x0 - 1 || e.x > x1 + 1 || e.y < y0 - 1 || e.y > y1 + 1 || e.type === 'digspot') continue;
    if (e.solid) list.push(e); else drawFloorEnt(e, e.x * T - camx, e.y * T - camy);
  }
  for (const m of G.mobs) list.push({ mob: m, y: m.fy + (m.y - m.fy) * m.t });
  list.push({ hero: 1, y: py });
  list.sort((a, b) => a.y - b.y);
  for (const e of list) {
    if (e.hero) drawHero(px * T - camx, py * T - camy);
    else if (e.mob) { const m = e.mob, mx = (m.fx + (m.x - m.fx) * m.t) * T - camx, my = e.y * T - camy; shadow(mx, my); emoji(m.emoji, mx + T / 2, my + T * .45 + Math.sin(G.t * 6 + m.x) * T * .06, .7); }
    else drawSolidEnt(e, e.x * T - camx, e.y * T - camy);
  }
  /* burbuja de interacción */
  if (!UI.lock && !P.moving) {
    const [dx, dy] = DIRS[P.dir], e = G.grid.get(key(P.x + dx, P.y + dy));
    if (e && e.solid && e.type !== 'decor') emoji('💬', e.x * T - camx + T * .82, e.y * T - camy + T * .05, .42);
  }
  /* ambiente */
  if (pal.tint && !G.maze) { cx.fillStyle = pal.tint; cx.fillRect(0, 0, vw, vh); }
  if (!G.maze && (pal.snow || pal.flies)) {
    for (const p of parts) {
      if (pal.snow) { const y = ((p.y + G.t * .06 * p.s) % 1) * vh, x = ((p.x + Math.sin(G.t * .7 + p.p) * .02) % 1) * vw; cx.fillStyle = 'rgba(255,255,255,.85)'; circ(cx, x, y, 2 * s * p.s); }
      else { const x = (p.x + Math.sin(G.t * .3 + p.p) * .04) * vw, y = (p.y + Math.cos(G.t * .4 + p.p * 2) * .04) * vh; cx.fillStyle = `rgba(250,255,140,${.35 + .35 * Math.sin(G.t * 2 + p.p)})`; circ(cx, x, y, 1.8 * s); }
    }
  }
  if (G.maze) {
    const gx = px * T + T / 2 - camx, gy = py * T + T / 2 - camy, g = cx.createRadialGradient(gx, gy, T * 4, gx, gy, T * 12);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,10,.4)'); cx.fillStyle = g; cx.fillRect(0, 0, vw, vh);
  }
  drawMini();
}
function drawMini() {
  const m = $('#mini'), g = m.getContext('2d'); g.imageSmoothingEnabled = false;
  if (G.maze) {
    g.fillStyle = '#141a38'; g.fillRect(0, 0, 160, 120);
    g.strokeStyle = '#d9b65a'; g.lineWidth = 2; g.beginPath(); g.arc(80, 60, 34, 0, 7); g.stroke();
    g.fillStyle = '#e5484d'; g.beginPath(); g.moveTo(80, 30); g.lineTo(88, 60); g.lineTo(72, 60); g.fill();
    g.fillStyle = '#f4f1e6'; g.beginPath(); g.moveTo(80, 90); g.lineTo(88, 60); g.lineTo(72, 60); g.fill();
    g.font = 'bold 17px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffe08a';
    g.fillText('N', 80, 13); g.fillText('S', 80, 108); g.fillText('W', 30, 60); g.fillText('E', 130, 60);
    return;
  }
  g.drawImage(G.miniBase, 0, 0, 160, 120);
  const dot = (x, y, c, r) => { g.fillStyle = '#000'; g.fillRect(x * 2 - r - 1, y * 2 - r - 1, r * 2 + 3, r * 2 + 3); g.fillStyle = c; g.fillRect(x * 2 - r, y * 2 - r, r * 2 + 1, r * 2 + 1); };
  for (const e of G.ents) {
    if (e.type === 'npc' || e.type === 'altar') dot(e.x, e.y, hasRune(G.w, e.q.id) ? '#3ddc6e' : '#ffd21e', 2);
    else if (e.type === 'gate') dot(e.x, e.y, '#c26bff', 3);
    else if (e.type === 'portal') dot(e.x, e.y, '#35d0ff', 2);
  }
  if ((G.t * 3 | 0) % 2) dot(P.x, P.y, '#ffffff', 2); else dot(P.x, P.y, '#ff4d6d', 2);
  g.font = 'bold 11px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'top'; g.fillStyle = '#fff'; g.strokeStyle = '#000'; g.lineWidth = 3; g.strokeText('N', 80, 2); g.fillText('N', 80, 2);
}

/* ═══════════════ Entrada ═══════════════ */
const held = []; let touchDir = null;
const KEYDIR = { ArrowUp: 'N', ArrowDown: 'S', ArrowLeft: 'W', ArrowRight: 'E', w: 'N', s: 'S', a: 'W', d: 'E', W: 'N', S: 'S', A: 'W', D: 'E' };
function actionPress() { if (dialogOpen()) nextLine(); else if (!modalOpen()) interact(); }
addEventListener('keydown', e => {
  if (!G.started) return;
  const d = KEYDIR[e.key];
  if (d) { e.preventDefault(); if (!held.includes(d)) held.push(d); return; }
  if (e.repeat) return;
  if (modalOpen()) {
    if (/^[1-9]$/.test(e.key)) { const b = document.querySelector(`#card .opt[data-i="${+e.key - 1}"]`); if (b) b.click(); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); const b = $('#mNext') || $('#mClose'); if (b) b.click(); }
    else if (e.key === 'Escape') { const b = $('#mClose'); if (b) b.click(); }
    return;
  }
  if (e.key === ' ' || e.key === 'Enter' || e.key === 'e' || e.key === 'E') { e.preventDefault(); actionPress(); }
  else if (e.key === 't' || e.key === 'T') { if (dialogOpen()) translateLine(); else if (G.banner) $('#bHint').click(); }
  else if (e.key === 'm' || e.key === 'M' || e.key === 'Escape') openMenu();
});
addEventListener('keyup', e => { const d = KEYDIR[e.key]; if (d) { const i = held.indexOf(d); if (i >= 0) held.splice(i, 1); } });
addEventListener('blur', () => { held.length = 0; touchDir = null; });
addEventListener('resize', resize);
addEventListener('contextmenu', e => e.preventDefault());
$('#dialog').addEventListener('click', e => { if (e.target.id === 'dSpeak') speak(dcur && dcur.en); else if (e.target.id === 'dTr') translateLine(); else if (performance.now() - dShownAt > 300) nextLine(); });
const dpad = $('#dpad');
function padDir(e) {
  const r = dpad.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
  if (Math.hypot(dx, dy) < 10) return null;
  return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'E' : 'W') : (dy > 0 ? 'S' : 'N');
}
dpad.addEventListener('pointerdown', e => { e.preventDefault(); try { dpad.setPointerCapture(e.pointerId); } catch (x) { /* nada */ } touchDir = padDir(e); });
dpad.addEventListener('pointermove', e => { if (touchDir !== null || e.buttons) touchDir = padDir(e); });
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n => dpad.addEventListener(n, () => { touchDir = null; }));
$('#btnA').addEventListener('pointerdown', e => { e.preventDefault(); actionPress(); });

/* ═══════════════ Bucle principal ═══════════════ */
function update(dt) {
  G.immune = Math.max(0, G.immune - dt);
  if (P.moving) {
    P.t += dt * SPEED; P.phase += dt * 14;
    if (P.t >= 1) { P.t = 1; P.moving = false; onStep(); }
  }
  const free = !UI.lock && !G.busy && !G.acting;
  if (!P.moving && free) {
    const d = touchDir || held[held.length - 1];
    if (d) {
      P.dir = d; const nx = P.x + DIRS[d][0], ny = P.y + DIRS[d][1];
      if (canWalk(nx, ny)) { P.fx = P.x; P.fy = P.y; P.x = nx; P.y = ny; P.t = 0; P.moving = true; }
    }
  }
  if (!free) return;
  for (const m of G.mobs) {
    if (m.t < 1) { m.t = Math.min(1, m.t + dt * 3); continue; }
    m.wait -= dt;
    if (m.wait <= 0) {
      m.wait = .5 + rnd() * 1.2;
      const d = pick(D4), nx = m.x + d[0], ny = m.y + d[1];
      if (canWalk(nx, ny) && !G.prot[ny * G.W + nx] && !G.grid.get(key(nx, ny)) && !G.mobs.some(o => o !== m && o.x === nx && o.y === ny)) { m.fx = m.x; m.fy = m.y; m.x = nx; m.y = ny; m.t = 0; }
    }
  }
  if (G.immune <= 0) {
    const px = P.fx + (P.x - P.fx) * P.t, py = P.fy + (P.y - P.fy) * P.t;
    const m = G.mobs.find(o => Math.abs(o.fx + (o.x - o.fx) * o.t - px) + Math.abs(o.fy + (o.y - o.fy) * o.t - py) < .75);
    if (m) encounter(m);
  }
}
let lastTs = 0;
function frame(ts) {
  const dt = Math.min(.05, (ts - lastTs) / 1000 || 0); lastTs = ts; G.t += dt;
  if (G.started) { update(dt); draw(); }
  requestAnimationFrame(frame);
}

/* ═══════════════ Inicio ═══════════════ */
async function startGame(fresh) {
  if (fresh) { const snd = S.sound; S = newSave(); S.sound = snd; }
  $('#title').classList.add('hidden'); $('#hud').classList.remove('hidden');
  if (matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window) $('#touch').classList.remove('hidden');
  resize();
  loadWorld(S.world, fresh ? null : { x: S.x, y: S.y });
  G.started = true; save();
  if (fresh) { S.flags.v0 = 1; await say(STORY); save(); }
}
(function init() {
  const s = loadSave();
  if (s) { S = s; $('#btnContinue').classList.remove('hidden'); }
  $('#btnContinue').onclick = () => startGame(false);
  $('#btnNew').onclick = () => { if (!s || confirm('Ya tienes una partida guardada. ¿Empezar una nueva y borrarla?')) startGame(true); };
  if ('speechSynthesis' in window) speechSynthesis.getVoices();
  resize(); requestAnimationFrame(frame);
  window.LX = { G, P, get S() { return S; }, loadWorld, enterMaze, interact, WORLDS };
})();
