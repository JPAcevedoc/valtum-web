/* VALTUM — interacción del sitio. Sin dependencias.
   Los datos de la demostración son ficticios y se generan aquí mismo. */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const n = (v, d = 0) => v.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d });
  const sum = (rows, k) => rows.reduce((a, r) => a + r[k], 0);
  const ratio = (a, b) => (b ? a / b : 0);
  const rng = seed => { let s = seed >>> 0; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };

  function h(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function s(tag, attrs = {}, text) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }

  /* ---------- Meses: 24 meses terminando en el último mes completo ---------- */
  const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const now = new Date();
  const endIdx = now.getFullYear() * 12 + now.getMonth() - 1;
  const mInfo = i => {
    const t = endIdx - (23 - i), y = Math.floor(t / 12), m = t % 12;
    return { m, y, long: `${MES[m]} ${y}`, lbl: MES[m] };
  };

  /* ---------- Datos ficticios ---------- */
  const DATA = {};

  DATA.ventas = (() => {
    const regions = ['Norte', 'Centro', 'Sur', 'Metropolitana'];
    const lines = ['Equipos', 'Servicios', 'Repuestos'];
    const rw = [.7, .9, .6, 1.6], lw = [1.4, .8, 1], mr = [.27, .42, .33];
    const r = rng(2026), rows = [];
    for (let i = 0; i < 24; i++) regions.forEach((rg, a) => lines.forEach((ln, b) => {
      const base = 9 * rw[a] * lw[b] * (1 + .011 * i);
      const sales = base * (1 + .1 * Math.sin(2 * Math.PI * ((i + 1) % 12) / 12)) * (.92 + r() * .16);
      rows.push({ i, d: [rg, ln], sales, target: base * 1.04, margin: sales * (mr[b] + (r() - .5) * .03) });
    }));
    return {
      rows,
      dims: [
        { label: 'Región', title: 'Ventas por región', values: regions },
        { label: 'Línea', title: 'Ventas por línea de negocio', values: lines },
      ],
      trendTitle: 'Evolución de ventas mensuales',
      trendSub: 'Millones de pesos (CLP)',
      short: 'Ventas',
      tipMode: 'pct',
      measure: rs => sum(rs, 'sales'),
      fmt: v => '$' + n(v) + ' M',
      axis: v => n(v),
      barNote: (v, tot) => `${n(100 * ratio(v, tot))} % del total`,
      kpis: [
        { label: 'Ventas del período', val: c => sum(c.cur, 'sales'), prev: c => sum(c.prev, 'sales'), fmt: v => '$' + n(v) + ' M', mode: 'pct', better: 'up' },
        { label: 'Cumplimiento de meta', val: c => 100 * ratio(sum(c.cur, 'sales'), sum(c.cur, 'target')), prev: c => 100 * ratio(sum(c.prev, 'sales'), sum(c.prev, 'target')), fmt: v => n(v, 1) + ' %', mode: 'pp', better: 'up' },
        { label: 'Margen', val: c => 100 * ratio(sum(c.cur, 'margin'), sum(c.cur, 'sales')), prev: c => 100 * ratio(sum(c.prev, 'margin'), sum(c.prev, 'sales')), fmt: v => n(v, 1) + ' %', mode: 'pp', better: 'up' },
      ],
    };
  })();

  DATA.personas = (() => {
    const areas = ['Operaciones', 'Comercial', 'Administración', 'Tecnología'];
    const sedes = ['Santiago', 'Valparaíso', 'Concepción'];
    const ab = [120, 80, 45, 35], sw = [.55, .25, .2], rate = [.022, .028, .012, .018];
    const r = rng(77), rows = [];
    for (let i = 0; i < 24; i++) areas.forEach((a, x) => sedes.forEach((sd, y) => {
      const hc = Math.round(ab[x] * sw[y] * (1 + .005 * i) + (r() - .5) * 2);
      const exp = hc * rate[x] * (1 + .35 * Math.sin(2 * Math.PI * ((i + 3) % 12) / 12)) * (.85 + r() * .3);
      rows.push({ i, d: [a, sd], hc, ex: Math.floor(exp + r()) });
    }));
    const rot = rs => 100 * ratio(sum(rs, 'ex'), sum(rs, 'hc'));
    return {
      rows,
      dims: [
        { label: 'Área', title: 'Rotación por área', values: areas },
        { label: 'Sede', title: 'Rotación por sede', values: sedes },
      ],
      trendTitle: 'Rotación mensual',
      trendSub: 'Egresos como % de la dotación',
      short: 'Rotación',
      tipMode: 'pp',
      measure: rot,
      fmt: v => n(v, 1) + ' %',
      axis: v => n(v, 1),
      barNote: (v, tot) => `${v >= tot ? '▲' : '▼'} ${n(Math.abs(v - tot), 1)} pp vs. promedio`,
      kpis: [
        { label: 'Dotación actual', val: c => sum(c.cur.filter(r => r.i === c.to), 'hc'), prev: c => sum(c.prev.filter(r => r.i === c.pto), 'hc'), fmt: v => n(v) + ' personas', mode: 'pct', better: null },
        { label: 'Rotación mensual', val: c => rot(c.cur), prev: c => rot(c.prev), fmt: v => n(v, 1) + ' %', mode: 'pp', better: 'down' },
        { label: 'Retención anualizada', val: c => 100 * Math.pow(1 - rot(c.cur) / 100, 12), prev: c => 100 * Math.pow(1 - rot(c.prev) / 100, 12), fmt: v => n(v) + ' %', mode: 'pp', better: 'up' },
      ],
    };
  })();

  /* ---------- Estado ---------- */
  const state = { key: 'ventas', win: 12, sel: [null, null], view: 'chart' };
  const ds = () => DATA[state.key];
  const match = (r, skip = -1) => state.sel.every((v, k) => k === skip || v == null || r.d[k] === v);

  const el = {
    dash: $('#dash'), kpis: $('#kpis'), chips: $('#chips'), trend: $('#trendBody'),
    title: $('#trendTitle'), sub: $('#trendSub'), view: $('#viewBtn'),
  };
  if (!el.dash) return;

  /* ---------- Tooltip global ---------- */
  const tip = h('div', 'tip');
  tip.setAttribute('role', 'tooltip');
  tip.hidden = true;
  document.body.appendChild(tip);
  function showTip(x, y, build) {
    tip.replaceChildren();
    build(tip);
    tip.hidden = false;
    const w = tip.offsetWidth, ht = tip.offsetHeight;
    let L = x + 16, T = y - ht - 14;
    if (L + w > innerWidth - 8) L = x - w - 16;
    if (L < 8) L = 8;
    if (T < 8) T = y + 18;
    tip.style.transform = `translate(${Math.round(L)}px, ${Math.round(T)}px)`;
  }
  const hideTip = () => { tip.hidden = true; };

  /* ---------- Utilidades de escala ---------- */
  function niceTicks(lo, hi, cnt = 4) {
    const raw = (hi - lo) / cnt, mag = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / mag;
    const step = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * mag;
    const a = Math.max(0, Math.floor(lo / step) * step), b = Math.ceil(hi / step) * step, t = [];
    for (let v = a; v <= b + step / 2; v += step) t.push(+v.toFixed(10));
    return t;
  }

  function animateNumber(node, from, to, fmt) {
    cancelAnimationFrame(node._raf);
    if (reduce || from === to) { node.textContent = fmt(to); return; }
    const t0 = performance.now(), dur = 600;
    const tick = t => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      node.textContent = fmt(from + (to - from) * e);
      if (p < 1) node._raf = requestAnimationFrame(tick);
    };
    node._raf = requestAnimationFrame(tick);
  }

  /* ---------- Contexto de ventana ---------- */
  function ctx() {
    const w = state.win, from = 24 - w, pfrom = from - w;
    const rows = ds().rows;
    return {
      cur: rows.filter(r => r.i >= from && match(r)),
      prev: rows.filter(r => r.i >= pfrom && r.i < from && match(r)),
      to: 23, pto: from - 1,
    };
  }

  function deltaOf(k, v, p) {
    const d = k.mode === 'pct' ? 100 * (ratio(v, p) - 1) : v - p;
    if (!isFinite(d) || Math.abs(d) < .05) return { cls: 'neutral', txt: '• Sin cambio' };
    const up = d > 0;
    let cls = 'neutral';
    if (k.better === 'up') cls = up ? 'good' : 'bad';
    if (k.better === 'down') cls = up ? 'bad' : 'good';
    return { cls, txt: `${up ? '▲' : '▼'} ${n(Math.abs(d), 1)} ${k.mode === 'pct' ? '%' : 'pp'}` };
  }

  /* ---------- KPIs ---------- */
  function buildKpis() {
    el.kpis.replaceChildren();
    ds().kpis.forEach(k => {
      const t = h('div', 'kpi');
      const d = h('span', 'delta');
      t.append(h('small', '', k.label), h('strong', '', '—'), d);
      el.kpis.append(t);
      k._el = t; k._cur = 0;
    });
  }
  function updateKpis() {
    const c = ctx();
    ds().kpis.forEach(k => {
      const v = k.val(c), p = k.prev(c);
      animateNumber($('strong', k._el), k._cur, v, k.fmt);
      k._cur = v;
      const dl = deltaOf(k, v, p), box = $('.delta', k._el);
      box.className = 'delta ' + dl.cls;
      box.replaceChildren(h('span', '', dl.txt), h('em', '', 'vs. período anterior'));
    });
  }

  /* ---------- Tendencia ---------- */
  const rowsAt = i => ds().rows.filter(r => r.i === i && match(r));
  const valAt = i => ds().measure(rowsAt(i));

  function deltaText(mode, v, p) {
    const d = mode === 'pct' ? 100 * (ratio(v, p) - 1) : v - p;
    return `${d >= 0 ? '▲' : '▼'} ${n(Math.abs(d), 1)} ${mode === 'pct' ? '%' : 'pp'} vs. mes anterior`;
  }

  function renderTrend() {
    const host = el.trend, d = ds();
    hideTip();
    host.replaceChildren();
    const from = 24 - state.win, pts = [];
    for (let i = from; i < 24; i++) pts.push({ i, v: valAt(i) });
    const N = pts.length;

    if (state.view === 'table') {
      const wrap = h('div', 'tbl-wrap'), tb = h('table', 'tbl');
      tb.append(h('caption', '', `${d.trendTitle}. ${d.trendSub}.`));
      const hd = h('tr'); ['Mes', d.short, 'Variación'].forEach(t => hd.append(h('th', '', t)));
      tb.append(hd);
      pts.forEach(p => {
        const tr = h('tr'), prev = valAt(p.i - 1 >= 0 ? p.i - 1 : p.i);
        const dd = d.tipMode === 'pct' ? 100 * (ratio(p.v, prev) - 1) : p.v - prev;
        tr.append(h('td', '', mInfo(p.i).long), h('td', '', d.fmt(p.v)), h('td', '', `${dd >= 0 ? '▲' : '▼'} ${n(Math.abs(dd), 1)} ${d.tipMode === 'pct' ? '%' : 'pp'}`));
        tb.append(tr);
      });
      wrap.append(tb); host.append(wrap);
      return;
    }

    const W = Math.max(280, Math.round(host.clientWidth)), H = W < 520 ? 224 : window.innerWidth > 980 ? 330 : 272;
    const m = { t: 16, r: W < 520 ? 50 : 66, b: 30, l: W < 520 ? 40 : 50 };
    const vs = pts.map(p => p.v), lo = Math.min(...vs), hi = Math.max(...vs), span = (hi - lo) || hi * .1 || 1;
    const ticks = niceTicks(lo - span * .4, hi + span * .25, 4), y0 = ticks[0], y1 = ticks[ticks.length - 1];
    const pw = W - m.l - m.r, ph = H - m.t - m.b;
    const X = i => m.l + (i / (N - 1)) * pw, Y = v => m.t + (1 - (v - y0) / (y1 - y0)) * ph;

    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, class: 'tchart', tabindex: 0, role: 'img',
      'aria-label': `${d.trendTitle}, últimos ${state.win} meses. Usa las flechas del teclado para recorrer los meses o abre la vista de tabla.` });
    const defs = s('defs');
    const lg = s('linearGradient', { id: 'tg', x1: 0, y1: 0, x2: 0, y2: 1 });
    lg.append(s('stop', { offset: 0, 'stop-color': '#2dd4bf', 'stop-opacity': .2 }), s('stop', { offset: 1, 'stop-color': '#2dd4bf', 'stop-opacity': 0 }));
    defs.append(lg); svg.append(defs);

    ticks.forEach(t => {
      const y = Y(t);
      svg.append(s('line', { x1: m.l, x2: W - m.r, y1: y, y2: y, class: 'grid' }), s('text', { x: m.l - 10, y: y + 4, class: 'end' }, d.axis(t)));
    });
    const px = pw / (N - 1), every = Math.max(1, Math.ceil(60 / px));
    pts.forEach((p, idx) => {
      if ((N - 1 - idx) % every) return;
      const mi = mInfo(p.i);
      svg.append(s('text', { x: X(idx), y: H - 8, class: 'mid' }, mi.m === 0 || idx === 0 ? `${mi.lbl} ${String(mi.y).slice(2)}` : mi.lbl));
    });

    const line = pts.map((p, idx) => `${idx ? 'L' : 'M'}${X(idx).toFixed(1)} ${Y(p.v).toFixed(1)}`).join(' ');
    const base = Y(y0);
    svg.append(
      s('path', { d: `${line} L${X(N - 1)} ${base} L${X(0)} ${base} Z`, fill: 'url(#tg)', class: 'area' }),
      s('path', { d: line, class: 'line', pathLength: 1 }),
    );
    const last = pts[N - 1];
    svg.append(
      s('circle', { cx: X(N - 1), cy: Y(last.v), r: 5, class: 'edot' }),
      s('text', { x: X(N - 1) + 12, y: Y(last.v) + 4.5, class: 'endlbl' }, d.fmt(last.v)),
    );

    const xh = s('line', { y1: m.t, y2: H - m.b, class: 'xh' });
    const hd = s('circle', { r: 5, class: 'hd' });
    const hit = s('rect', { x: m.l - 6, y: 0, width: pw + 12, height: H, class: 'hit' });
    svg.append(xh, hd, hit);

    const show = idx => {
      const p = pts[idx], x = X(idx), y = Y(p.v);
      xh.setAttribute('x1', x); xh.setAttribute('x2', x); xh.style.opacity = 1;
      hd.setAttribute('cx', x); hd.setAttribute('cy', y); hd.style.opacity = 1;
      const r = svg.getBoundingClientRect(), k = r.width / W;
      showTip(r.left + x * k, r.top + y * k, t => {
        t.append(h('div', 'tip-h', mInfo(p.i).long));
        const row = h('div', 'tip-row');
        row.append(h('span', 'key'), h('strong', '', d.fmt(p.v)), h('span', 'tip-s', d.short));
        t.append(row);
        if (p.i > 0) t.append(h('div', 'tip-d', deltaText(d.tipMode, p.v, valAt(p.i - 1))));
      });
    };
    const hide = () => { xh.style.opacity = 0; hd.style.opacity = 0; hideTip(); };
    let cur = N - 1;
    hit.addEventListener('pointermove', e => {
      const r = svg.getBoundingClientRect(), k = W / r.width;
      cur = Math.max(0, Math.min(N - 1, Math.round(((e.clientX - r.left) * k - m.l) / px)));
      show(cur);
    });
    hit.addEventListener('pointerleave', hide);
    svg.addEventListener('focus', () => { cur = N - 1; show(cur); });
    svg.addEventListener('blur', hide);
    svg.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') cur = Math.max(0, cur - 1);
      else if (e.key === 'ArrowRight') cur = Math.min(N - 1, cur + 1);
      else if (e.key === 'Home') cur = 0;
      else if (e.key === 'End') cur = N - 1;
      else return;
      e.preventDefault(); show(cur);
    });
    host.append(svg);
  }

  /* ---------- Barras ---------- */
  function buildBars() {
    $$('.bars').forEach(card => {
      const k = +card.dataset.dim, dim = ds().dims[k], list = $('.bar-list', card);
      $('h3', card).textContent = dim.title;
      list.replaceChildren();
      dim.values.forEach(name => {
        const b = h('button', 'bar-row');
        b.type = 'button'; b.dataset.name = name;
        const track = h('span', 'bar-track'), fill = h('span', 'bar-fill');
        track.append(fill);
        b.append(h('span', 'bar-name', name), track, h('span', 'bar-val', ''));
        b.addEventListener('click', () => { state.sel[k] = state.sel[k] === name ? null : name; update(); });
        const tipFor = (x, y) => showTip(x, y, t => {
          t.append(h('div', 'tip-h', `${dim.label}: ${name}`));
          const row = h('div', 'tip-row');
          row.append(h('strong', '', ds().fmt(b._v)));
          t.append(row, h('div', 'tip-d', ds().barNote(b._v, b._tot)));
        });
        b.addEventListener('pointermove', e => tipFor(e.clientX, e.clientY));
        b.addEventListener('pointerleave', hideTip);
        b.addEventListener('focus', () => { const r = b.getBoundingClientRect(); tipFor(r.left + r.width / 2, r.top); });
        b.addEventListener('blur', hideTip);
        list.append(b);
      });
    });
  }
  function updateBars() {
    const d = ds(), from = 24 - state.win;
    $$('.bars').forEach(card => {
      const k = +card.dataset.dim;
      const base = d.rows.filter(r => r.i >= from && match(r, k));
      const vals = d.dims[k].values.map(name => ({ name, v: d.measure(base.filter(r => r.d[k] === name)) }));
      const tot = d.measure(base), max = Math.max(...vals.map(x => x.v)) || 1;
      vals.forEach(x => {
        const b = $$('.bar-row', card).find(r => r.dataset.name === x.name);
        const on = state.sel[k] === x.name;
        b._v = x.v; b._tot = tot;
        $('.bar-fill', b).style.width = `${(100 * x.v / max).toFixed(1)}%`;
        $('.bar-val', b).textContent = d.fmt(x.v);
        b.classList.toggle('on', on);
        b.classList.toggle('dim', state.sel[k] != null && !on);
        b.setAttribute('aria-pressed', on);
        b.setAttribute('aria-label', `${x.name}: ${d.fmt(x.v)}. ${d.barNote(x.v, tot)}. ${on ? 'Quitar filtro' : 'Filtrar el informe'}`);
      });
    });
  }

  /* ---------- Chips de filtros ---------- */
  function updateChips() {
    const box = el.chips, act = [];
    state.sel.forEach((v, k) => { if (v) act.push([v, k]); });
    box.replaceChildren();
    if (!act.length) { box.append(h('span', 'hint', 'Haz clic en una barra para filtrar todo el informe, como en Power BI.')); return; }
    act.forEach(([v, k]) => {
      const c = h('button', 'chip');
      c.type = 'button';
      c.setAttribute('aria-label', `Quitar filtro ${ds().dims[k].label}: ${v}`);
      c.append(h('span', '', `${ds().dims[k].label}:`), h('strong', '', v), h('span', 'x', '✕'));
      c.addEventListener('click', () => { state.sel[k] = null; update(); });
      box.append(c);
    });
    const clr = h('button', 'link', 'Limpiar filtros');
    clr.type = 'button';
    clr.addEventListener('click', () => { state.sel = [null, null]; update(); });
    box.append(clr);
  }

  /* ---------- Orquestación ---------- */
  function update() { updateKpis(); renderTrend(); updateBars(); updateChips(); }

  function setDataset(key) {
    state.key = key; state.sel = [null, null];
    $$('.tab').forEach(t => t.setAttribute('aria-selected', t.dataset.ds === key));
    el.title.textContent = ds().trendTitle;
    el.sub.textContent = ds().trendSub;
    buildKpis(); buildBars(); update();
  }

  $$('.tab').forEach(t => t.addEventListener('click', () => { if (t.dataset.ds !== state.key) setDataset(t.dataset.ds); }));
  $$('.seg button').forEach(b => b.addEventListener('click', () => {
    state.win = +b.dataset.win;
    $$('.seg button').forEach(x => x.setAttribute('aria-pressed', x === b));
    update();
  }));
  el.view.addEventListener('click', () => {
    state.view = state.view === 'chart' ? 'table' : 'chart';
    el.view.textContent = state.view === 'chart' ? 'Ver como tabla' : 'Ver gráfico';
    el.view.setAttribute('aria-pressed', state.view === 'table');
    renderTrend();
  });

  let lastW = 0;
  new ResizeObserver(() => {
    const w = Math.round(el.trend.clientWidth);
    if (w && Math.abs(w - lastW) > 2) { lastW = w; if (state.view === 'chart') renderTrend(); }
  }).observe(el.trend);

  setDataset('ventas');

  /* ---------- Hero: contadores, revelado y cabecera ---------- */
  const countUp = node => {
    const to = parseFloat(node.dataset.count), dec = +(node.dataset.decimals || 0);
    const pre = node.dataset.prefix || '', suf = node.dataset.suffix || '';
    animateNumber(node, 0, to, v => `${pre}${n(v, dec)}${suf}`);
  };
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      $$('[data-count]', e.target).forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(x => io.observe(x));

  const header = $('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
