'use strict';
/* Crónicas de Lexara — utilidades, guardado, sonido, diálogos y minijuegos */

const $ = s => document.querySelector(s);
const rnd = Math.random;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = a => a[Math.floor(rnd() * a.length)];
function rng(seed) {
  let a = seed >>> 0;
  return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function shuffle(a, r = rnd) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

/* ─────────── Guardado ─────────── */
const SAVE_KEY = 'lexara-save-v1';
function newSave() {
  return { world: 0, x: -1, y: -1, hearts: 5, maxHearts: 5, coins: 10, xp: 0, level: 1, potions: 1,
    crystals: [0, 0, 0, 0, 0], runes: {}, words: {}, orbs: {}, chests: {}, flags: {}, sound: true, won: false };
}
let S = newSave();
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* almacenamiento no disponible */ } }
function loadSave() {
  try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s && Array.isArray(s.crystals)) return Object.assign(newSave(), s); } catch (e) { /* sin partida */ }
  return null;
}

/* ─────────── Sonido y voz ─────────── */
let AC = null;
function beep(f, d = 0.12, type = 'square', v = 0.05, when = 0) {
  if (!S.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + when;
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + d + 0.02);
  } catch (e) { /* sin audio */ }
}
const sfx = {
  ok() { beep(660, .1); beep(880, .16, 'square', .05, .09); },
  bad() { beep(170, .28, 'sawtooth', .06); },
  get() { beep(990, .08, 'triangle', .08); beep(1320, .14, 'triangle', .08, .07); },
  tick() { beep(420, .05, 'triangle', .05); },
  win() { [523, 659, 784, 1047].forEach((f, i) => beep(f, .2, 'square', .05, i * .13)); }
};
function speak(text) {
  if (!('speechSynthesis' in window) || !text) return;
  try {
    speechSynthesis.cancel();
    const clean = String(text).replace(/_{2,}/g, ' blank ').replace(/\([^)]*\)/g, '').replace(/[\u{1F000}-\u{1FFFF}\u{2190}-\u{2BFF}\u{FE0F}]/gu, '');
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = 'en-US'; u.rate = 0.85;
    const vs = speechSynthesis.getVoices();
    const v = vs.find(x => /^en[-_]US/i.test(x.lang)) || vs.find(x => /^en/i.test(x.lang));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch (e) { /* sin voz */ }
}

/* ─────────── HUD, avisos ─────────── */
const UI = { lock: 0 };
function hud() {
  $('#hearts').textContent = '❤️'.repeat(Math.max(0, S.hearts)) + '🖤'.repeat(Math.max(0, S.maxHearts - S.hearts));
  $('#coins').textContent = '🪙 ' + S.coins;
  $('#lvl').textContent = '⭐ Nv ' + S.level;
  $('#xpbar i').style.width = Math.min(100, S.xp / (S.level * 50) * 100) + '%';
  $('#potBtn').textContent = '🧪×' + S.potions;
}
function toast(html, ms = 2800) {
  const d = document.createElement('div'); d.className = 'toast'; d.innerHTML = html;
  $('#toasts').appendChild(d); setTimeout(() => d.remove(), ms);
  while ($('#toasts').children.length > 4) $('#toasts').firstChild.remove();
}
function addXp(n) {
  S.xp += n;
  while (S.xp >= S.level * 50) {
    S.xp -= S.level * 50; S.level++;
    if (S.maxHearts < 10) S.maxHearts++;
    S.hearts = S.maxHearts;
    toast('⭐ <b>Level up!</b> Nivel ' + S.level + ' · corazones restaurados'); sfx.win();
  }
  hud();
}
/* Pierde un corazón. Devuelve false si el jugador se queda sin corazones. */
function hurt() {
  S.hearts = Math.max(0, S.hearts - 1); hud();
  const h = document.createElement('div'); h.id = 'hurt'; document.body.appendChild(h); setTimeout(() => h.remove(), 520);
  return S.hearts > 0;
}

/* ─────────── Diálogos ─────────── */
let dq = [], dres = null, dcur = null, dShownAt = 0;
function say(lines) {
  if (!Array.isArray(lines)) lines = [lines];
  return new Promise(res => { dq = lines.slice(); dres = res; dShownAt = performance.now(); UI.lock++; $('#dialog').classList.remove('hidden'); nextLine(); });
}
function nextLine() {
  if (!dq.length) {
    $('#dialog').classList.add('hidden'); UI.lock--; dcur = null;
    const r = dres; dres = null; if (r) r(); return;
  }
  dcur = dq.shift();
  const nm = $('#dname'), tx = $('#dtext'), es = $('#des');
  nm.textContent = ((dcur.e ? dcur.e + ' ' : '') + (dcur.n || '')).trim();
  nm.style.display = nm.textContent ? '' : 'none';
  es.classList.add('hidden');
  if (dcur.en) {
    tx.textContent = dcur.en; tx.className = ''; es.textContent = dcur.es || '';
    $('#dSpeak').style.display = ''; $('#dTr').style.display = dcur.es ? '' : 'none';
  } else {
    tx.textContent = dcur.es; tx.className = 'es';
    $('#dSpeak').style.display = 'none'; $('#dTr').style.display = 'none';
  }
  sfx.tick();
}
function dialogOpen() { return !!dcur; }
function translateLine() { if (dcur && dcur.en && dcur.es) $('#des').classList.toggle('hidden'); }
const L = (ent, pair) => ({ n: ent.name, e: ent.emoji, en: pair[0], es: pair[1] });
const N = es => ({ es });

/* ─────────── Ventanas modales ─────────── */
function modalOpen() { return !$('#modal').classList.contains('hidden'); }
function openModal(html) {
  $('#card').innerHTML = html;
  if (!modalOpen()) { $('#modal').classList.remove('hidden'); UI.lock++; }
  $('#card').scrollTop = 0;
  return $('#card');
}
function closeModal() { if (modalOpen()) { $('#modal').classList.add('hidden'); UI.lock--; } }

/* Pregunta de opción múltiple. o = {title, q, correct, wrong[], listen, head, prog} */
function askMC(o) {
  return new Promise(res => {
    const opts = shuffle([o.correct, ...o.wrong]);
    UI.answer = o.correct;
    const c = openModal(
      `<h3>${esc(o.title)}</h3>${o.prog ? `<div class="prog">${esc(o.prog)}</div>` : ''}${o.head || ''}` +
      (o.listen
        ? `<div class="q"><button class="big" id="mSpeak">🔊 Escuchar</button><div class="sub">Listen and choose · Escucha y elige</div><button class="link" id="mShow">No puedo oírlo 👁</button></div>`
        : `<div class="q">${esc(o.q)}</div><button class="mini" id="mSpeak">🔊</button>`) +
      `<div class="opts">${opts.map((t, i) => `<button class="opt" data-i="${i}"><kbd>${i + 1}</kbd>${esc(t)}</button>`).join('')}</div><div id="mFb"></div>`);
    const full = String(o.q).includes('___') ? o.q.replace(/_{2,}/, o.correct) : o.q;
    c.querySelector('#mSpeak').onclick = () => speak(o.q);
    if (o.listen) {
      c.querySelector('#mShow').onclick = e => { e.target.outerHTML = `<div class="sub">📖 “${esc(o.q)}”</div>`; };
      setTimeout(() => speak(o.q), 350);
    }
    let answered = false;
    c.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      if (answered) return; answered = true;
      const ok = opts[+b.dataset.i] === o.correct;
      c.querySelectorAll('.opt').forEach(x => { if (opts[+x.dataset.i] === o.correct) x.classList.add('ok'); x.disabled = true; });
      if (ok) {
        sfx.ok(); c.querySelector('#mFb').innerHTML = '✅ Correct!';
        if (!o.listen && S.sound && /[a-z]/i.test(full) && full.length < 90) speak(full);
        setTimeout(() => res(true), 850);
      } else {
        b.classList.add('no'); sfx.bad();
        c.querySelector('#mFb').innerHTML = `❌ Respuesta correcta: <b>${esc(o.correct)}</b> &nbsp; <button id="mNext" class="mini">Continuar ▶</button>`;
        c.querySelector('#mNext').onclick = () => res(false);
      }
    });
  });
}

/* Ordenar letras o palabras. o = {title, tokens[], hint, join, prog, sub} */
function askArrange(o) {
  return new Promise(res => {
    const target = o.tokens.join(o.join);
    UI.answer = o.tokens;
    let pool = shuffle(o.tokens.map((t, i) => ({ t, i })));
    for (let k = 0; k < 5 && o.tokens.length > 1 && pool.map(p => p.t).join(o.join) === target; k++) pool = shuffle(pool);
    let ans = [], locked = false;
    const c = openModal(`<h3>${esc(o.title)}</h3>${o.prog ? `<div class="prog">${esc(o.prog)}</div>` : ''}<div class="sub">${esc(o.sub)}</div><div class="q">${esc(o.hint)}</div><div class="slots" id="mSlots"></div><div class="pool" id="mPool"></div><div id="mFb"></div>`);
    const draw = () => {
      c.querySelector('#mSlots').innerHTML = ans.map((p, k) => `<button class="tok" data-k="${k}">${esc(p.t)}</button>`).join('');
      c.querySelector('#mPool').innerHTML = pool.map((p, k) => `<button class="tok" data-k="${k}">${esc(p.t)}</button>`).join('');
      c.querySelectorAll('#mPool .tok').forEach(b => b.onclick = () => { if (locked) return; sfx.tick(); ans.push(pool.splice(+b.dataset.k, 1)[0]); draw(); check(); });
      c.querySelectorAll('#mSlots .tok').forEach(b => b.onclick = () => { if (locked) return; pool.push(ans.splice(+b.dataset.k, 1)[0]); draw(); });
    };
    const check = () => {
      if (pool.length) return;
      locked = true;
      if (ans.map(p => p.t).join(o.join) === target) {
        sfx.ok(); c.querySelector('#mFb').innerHTML = '✅ Correct!'; speak(target.toLowerCase());
        setTimeout(() => res(true), 950);
      } else {
        sfx.bad(); c.querySelector('#mSlots').classList.add('shake');
        c.querySelector('#mFb').innerHTML = `❌ Correcto: <b>${esc(target)}</b> &nbsp; <button id="mNext" class="mini">Continuar ▶</button>`;
        c.querySelector('#mNext').onclick = () => res(false);
      }
    };
    draw();
  });
}

/* Memoria de parejas */
function askMemory(title, pairs) {
  return new Promise(res => {
    const cards = shuffle(pairs.flatMap((p, i) => [{ t: p[0], i }, { t: p[1], i }]));
    const c = openModal(`<h3>${esc(title)}</h3><div class="sub">Find the pairs · Encuentra las parejas</div><div class="mem">${cards.map((_, k) => `<button class="memc" data-k="${k}">❓</button>`).join('')}</div><div id="mFb"></div>`);
    let open = [], found = 0, busy = false;
    const isWord = t => /^[a-z' ]+$/i.test(t);
    c.querySelectorAll('.memc').forEach(b => b.onclick = () => {
      const k = +b.dataset.k;
      if (busy || b.classList.contains('open') || b.classList.contains('done')) return;
      const card = cards[k];
      b.classList.add('open'); b.innerHTML = isWord(card.t) ? esc(card.t) : `<span class="big">${esc(card.t)}</span>`;
      sfx.tick(); if (isWord(card.t)) speak(card.t);
      open.push({ b, card });
      if (open.length < 2) return;
      const [a, d] = open; open = [];
      if (a.card.i === d.card.i) {
        a.b.classList.add('done'); d.b.classList.add('done'); sfx.ok(); found++;
        if (found === pairs.length) { c.querySelector('#mFb').innerHTML = '✅ Well done!'; setTimeout(() => res(true), 900); }
      } else {
        busy = true;
        setTimeout(() => { [a.b, d.b].forEach(x => { x.classList.remove('open'); x.textContent = '❓'; }); busy = false; }, 900);
      }
    });
  });
}

/* Ejecuta una serie de ejercicios. Devuelve false si el jugador se queda sin corazones. */
async function runItems(title, type, items) {
  const queue = items.slice(), total = items.length; let done = 0;
  while (queue.length) {
    const it = queue.shift(), prog = `${done + 1} / ${total}`;
    let ok;
    if (type === 'mc') ok = await askMC({ title, prog, q: it[0], correct: it[1], wrong: it.slice(2) });
    else if (type === 'listen') ok = await askMC({ title, prog, listen: true, q: it[0], correct: it[0], wrong: it.slice(1) });
    else if (type === 'scramble') ok = await askArrange({ title, prog, tokens: it[0].split(''), join: '', hint: `${it[2] || ''} ${it[1]}`, sub: 'Order the letters · Ordena las letras' });
    else ok = await askArrange({ title, prog, tokens: it[0].split(' '), join: ' ', hint: `“${it[1]}”`, sub: 'Order the words · Ordena las palabras' });
    if (ok) { done++; addXp(5); }
    else { queue.push(it); if (!hurt()) { closeModal(); return false; } }
  }
  closeModal();
  return true;
}
