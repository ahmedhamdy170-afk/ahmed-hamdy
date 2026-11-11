// EB Wedding Videography explainer. Every frame is a pure function of t:
// window.seek(t) paints the frame at time t and nothing else carries state.
(() => {
  const TL = TIMELINE;
  const q = new URLSearchParams(location.search);
  const FMT = q.get('fmt') || '16x9';
  const RM = q.get('rm') === '1';

  // Tokens pulled from ./brand/site.css
  const C = { navy: '#172556', deep: '#0f1a40', white: '#ffffff', rec: '#e04a4a' };
  const SERIF = '"Cormorant"', SANS = '"Manrope"';

  const F = {
    '16x9': { W: 1920, H: 1080, fs: 1.15, labelY: 132, headY: 232, gy: 580, capY: 1000, s4: 205, L: 1380, FWW: 1500, FHH: 600, filmW: 860, cols: 4, cardW: 300, gap: 30, safe: 70 },
    '1x1': { W: 1080, H: 1080, fs: 1.0, labelY: 96, headY: 178, gy: 610, capY: 990, s4: 235, L: 860, FWW: 940, FHH: 600, filmW: 760, cols: 2, cardW: 296, gap: 36, safe: 50 },
    '9x16': { W: 1080, H: 1920, fs: 1.4, labelY: 300, headY: 440, gy: 1010, capY: 1640, s4: 235, L: 860, FWW: 940, FHH: 940, filmW: 900, cols: 2, cardW: 390, gap: 40, safe: 60 },
  }[FMT];
  const { W, H, fs, gy, L } = F;
  const cx = W / 2, lineY = gy - 30, x0 = cx - L / 2, x1 = cx + L / 2;
  const camY = lineY + 110;

  const cv = document.getElementById('c');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const buf = document.createElement('canvas'); buf.width = W; buf.height = H;
  const bctx = buf.getContext('2d');

  // ---------- helpers ----------
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const mix = (a, b, k) => a + (b - a) * k;
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  // The site's own easing: cubic-bezier(.2, .7, .2, 1). Settles, never bounces.
  function ease(x) {
    if (x <= 0) return 0; if (x >= 1) return 1;
    const bx = (s) => 3 * (1 - s) * (1 - s) * s * 0.2 + 3 * (1 - s) * s * s * 0.2 + s * s * s;
    const by = (s) => 3 * (1 - s) * (1 - s) * s * 0.7 + 3 * (1 - s) * s * s * 1 + s * s * s;
    let lo = 0, hi = 1;
    for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (bx(m) < x) lo = m; else hi = m; }
    return by((lo + hi) / 2);
  }
  const io = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
  const fade = (t, tin, tout, din = 0.35, dout = 0.25) => Math.min(seg(t, tin, tin + din), 1 - seg(t, tout - dout, tout));

  function text(g, s, x, y, o = {}) {
    const size = (o.size || 30) * (o.raw ? 1 : fs);
    g.save();
    g.globalAlpha *= o.alpha == null ? 1 : o.alpha;
    g.font = `${o.weight || 400} ${size}px ${o.font || SANS}`;
    g.letterSpacing = o.track ? `${o.track * size}px` : '0px';
    g.textAlign = o.align || 'center';
    g.textBaseline = o.base || 'alphabetic';
    g.fillStyle = o.color || C.white;
    // letter-spacing adds a trailing gap; nudge so tracked text stays optically centred
    const nx = o.track && (o.align || 'center') === 'center' ? x + (o.track * size) / 2 : x;
    g.fillText(s, nx, y);
    g.restore();
  }
  function measure(g, s, size, font, track = 0) {
    g.save(); g.font = `${font === SERIF ? 600 : 400} ${size * fs}px ${font}`; g.letterSpacing = `${track * size * fs}px`;
    const w = g.measureText(s).width; g.restore(); return w;
  }
  function wrap(g, s, size, font, maxW) {
    const words = s.split(' '); const lines = []; let cur = '';
    for (const w of words) {
      const tryL = cur ? cur + ' ' + w : w;
      if (measure(g, tryL, size, font) > maxW && cur) { lines.push(cur); cur = w; } else cur = tryL;
    }
    if (cur) lines.push(cur);
    return lines;
  }
  function balanced(g, s, size, font, maxW) {
    let lines = wrap(g, s, size, font, maxW);
    if (lines.length < 2) return lines;
    for (let w = maxW - 20; w > maxW * 0.45; w -= 20) { const l = wrap(g, s, size, font, w); if (l.length > lines.length) break; lines = l; }
    return lines;
  }
  function corners(g, x, y, w, h, o = {}) {
    const cl = o.len != null ? o.len : clamp(Math.min(w, h) * 0.2, 9, 44);
    const l = x - w / 2, r = x + w / 2, tp = y - h / 2, b = y + h / 2;
    g.save();
    g.globalAlpha *= o.alpha == null ? 1 : o.alpha;
    g.strokeStyle = o.color || C.white; g.lineWidth = o.lw || 3; g.lineCap = 'square';
    g.beginPath();
    g.moveTo(l, tp + cl); g.lineTo(l, tp); g.lineTo(l + cl, tp);
    g.moveTo(r - cl, tp); g.lineTo(r, tp); g.lineTo(r, tp + cl);
    g.moveTo(r, b - cl); g.lineTo(r, b); g.lineTo(r - cl, b);
    g.moveTo(l + cl, b); g.lineTo(l, b); g.lineTo(l, b - cl);
    g.stroke(); g.restore();
  }
  function dot(g, x, y, r, o = {}) {
    g.save(); g.globalAlpha *= o.alpha == null ? 1 : o.alpha;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2);
    if (o.hollow) { g.strokeStyle = o.color || C.white; g.lineWidth = 2.5; g.stroke(); }
    else { g.fillStyle = o.color || C.white; g.fill(); }
    g.restore();
  }
  function cover(g, img, x, y, w, h, alpha) {
    if (alpha <= 0) return;
    const ir = img.width / img.height, r = w / h;
    let sw, sh;
    if (ir > r) { sh = img.height; sw = sh * r; } else { sw = img.width; sh = sw / r; }
    const sx = (img.width - sw) / 2, sy = (img.height - sh) * 0.32; // faces sit high in these frames
    g.save(); g.globalAlpha *= alpha; g.drawImage(img, sx, sy, sw, sh, x - w / 2, y - h / 2, w, h); g.restore();
  }

  // ---------- geometry that depends on format ----------
  const filmW = F.filmW, filmH = filmW / 2.39, filmCy = gy - 30;
  const cardW = F.cardW, cardH = cardW * 9 / 16, rows = 4 / F.cols;
  const rowPitch = cardH + 96 * fs;
  const gridW = F.cols * cardW + (F.cols - 1) * F.gap;
  const gridTop = (gy - 10) - (rows * rowPitch - 96 * fs + 70 * fs) / 2;
  const cardPos = (i) => ({
    x: cx - gridW / 2 + cardW / 2 + (i % F.cols) * (cardW + F.gap),
    y: gridTop + cardH / 2 + Math.floor(i / F.cols) * rowPitch,
  });
  const gridCy = gridTop + (rows * rowPitch - 96 * fs + 70 * fs) / 2;
  const gridH = rows * rowPitch - 96 * fs + 70 * fs;
  const nodeX = (i) => x0 + L * (i * 2 + 1) / 8;

  // Walk: couple progress along the day, and when each moment happens / is captured.
  const wk = TL.walk;
  const walkP = (t) => io(seg(t, wk.t0, wk.t1));
  const camP = (t) => walkP(t - wk.lag);
  const whenP = (f, fn) => { let lo = wk.t0, hi = wk.t1 + wk.lag; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (fn(m) < f) lo = m; else hi = m; } return hi; };
  const moments = TL.moments.map((m) => ({ ...m, tHappen: whenP(Math.min(m.f, 0.999), walkP), tCapture: whenP(Math.min(m.f, 0.999), camP) }));

  // Bracket track: the one object that lives through the whole film.
  const c1 = cardPos(0);
  const tierRect = (k) => ({ x: x0 + L * (k.f0 + k.f1) / 2, y: lineY, w: L * (k.f1 - k.f0) + 34, h: 124 });
  const BK = [
    { t: 0, d: 0, x: cx, y: gy, w: F.FWW, h: F.FHH },
    { t: 0.9, d: 0.6, x: cx, y: gy, w: F.FWW * 0.68, h: F.FHH * 0.72 },
    { t: 1.7, d: 0.6, x: cx, y: gy, w: F.FWW * 0.42, h: F.FHH * 0.5 },
    { t: 2.5, d: 0.6, x: cx, y: gy, w: 210, h: 140 },
    { t: 5.0, d: 1.2, x: x0, y: camY, w: 64, h: 44 },
    { t: 12.3, d: 0, x: x1, y: camY, w: 64, h: 44 },
    { t: 15.0, d: 1.4, x: cx, y: filmCy, w: filmW + 30, h: filmH + 30 },
    { t: 17.5, d: 1.0, x: c1.x, y: c1.y, w: cardW + 22, h: cardH + 22 },
    { t: 20.0, d: 1.0, x: cx, y: gridCy, w: gridW + 56, h: gridH + 56 },
    { t: 22.5, d: 1.0, x: nodeX(0), y: lineY, w: 72, h: 72 },
    { t: 25.1, d: 0.7, x: nodeX(1), y: lineY, w: 72, h: 72 },
    { t: 27.6, d: 0.7, x: nodeX(2), y: lineY, w: 72, h: 72 },
    { t: 30.1, d: 0.7, x: nodeX(3), y: lineY, w: 72, h: 72 },
    ...TL.tiers.map((k, i) => ({ t: k.t, d: i ? 0.9 : 1.1, ...tierRect(k) })),
    { t: 40.0, d: 1.4, x: cx, y: gy, w: F.FWW, h: F.FHH },
  ];
  function bracketAt(t) {
    let cur = { ...BK[0] };
    for (let i = 1; i < BK.length; i++) {
      const k = BK[i]; if (t < k.t) break;
      const e = k.d ? ease(seg(t, k.t, k.t + k.d)) : 1;
      cur = { x: mix(cur.x, k.x, e), y: mix(cur.y, k.y, e), w: mix(cur.w, k.w, e), h: mix(cur.h, k.h, e) };
    }
    if (t >= 7.5 && t < 15) cur.x = x0 + L * camP(t);
    return cur;
  }

  const timecode = (t) => {
    const p = (n) => String(n).padStart(2, '0');
    return `00:00:${p(Math.floor(t))}:${p(Math.floor((t % 1) * 25))}`;
  };

  // ---------- draw one frame ----------
  function draw(g, t) {
    g.globalAlpha = 1;
    g.fillStyle = C.navy; g.fillRect(0, 0, W, H);

    // brand mark, quiet, top-left
    if (IMG.mark) { const mw = 62 * fs; g.save(); g.globalAlpha = 0.92; g.drawImage(IMG.mark, F.safe, F.safe * 0.75, mw, mw * IMG.mark.height / IMG.mark.width); g.restore(); }

    const bk = bracketAt(t);

    // --- day line (S2), steps line (S3), coverage line (S4) ---
    const lineIn = t < 15.9 ? ease(seg(t, 6.0, 7.3)) : ease(seg(t, 22.9, 23.7));
    const lineA = t < 15.9 ? 1 - seg(t, 15.0, 15.7) : 1;
    const collapse = ease(seg(t, 40.0, 41.0));
    if (lineIn > 0 && lineA > 0 && collapse < 1) {
      const a = mix(x0, cx, collapse), b = mix(x0 + L * lineIn, cx, collapse);
      g.save(); g.globalAlpha = lineA * (t >= 32.6 ? mix(1, 0.4, seg(t, 32.6, 33.2)) : 1) * (1 - seg(t, 40.5, 41.0));
      g.strokeStyle = C.white; g.lineWidth = 2; g.beginPath(); g.moveTo(a, lineY); g.lineTo(b, lineY); g.stroke(); g.restore();
    }

    // --- S1: directives ---
    TL.directives.forEach((d, i) => {
      const next = TL.directives[i + 1];
      const a = seg(t, d.t, d.t + 0.3) * (1 - seg(t, 4.7, 5.0));
      if (a <= 0) return;
      const dim = next ? mix(1, 0.62, seg(t, next.t, next.t + 0.3)) : mix(1, 0.62, seg(t, 3.3, 3.6));
      const ox = F.FWW * 0.3, oy = F.FHH * (FMT === '9x16' ? 0.24 : 0.3);
      const rise = (1 - ease(seg(t, d.t, d.t + 0.4))) * 14;
      text(g, d.text, cx + d.dx * ox, gy + d.dy * oy + 16 * fs + rise, { font: SERIF, weight: 600, size: 50, alpha: a * dim });
    });

    // --- S2: moments on the line ---
    moments.forEach((m, i) => {
      const mx = x0 + L * m.f;
      const born = ease(seg(t, m.tHappen, m.tHappen + 0.35));
      const gone = seg(t, 15.0, 15.9);
      if (born <= 0 || gone >= 1) return;
      const cap = ease(seg(t, m.tCapture, m.tCapture + 0.3));
      const px = mix(mx, cx, ease(gone)), py = mix(lineY, filmCy, ease(gone));
      dot(g, px, py, 10 * born, { color: cap > 0.5 ? C.rec : C.white, alpha: 1 - gone });
      if (cap > 0) corners(g, px, py, mix(64, 38, cap), mix(64, 38, cap), { len: 9, lw: 2.5, alpha: cap * (1 - gone) });
      const nextT = moments[i + 1] ? moments[i + 1].tHappen : 12.45;
      const la = fade(t, m.tHappen, nextT, 0.3, 0.25);
      if (la > 0) {
        const tw = measure(g, m.text, 42, SERIF);
        const lx = clamp(mx, F.safe + tw / 2, W - F.safe - tw / 2);
        text(g, m.text, lx, lineY - 58 * fs, { font: SERIF, weight: 600, size: 42, alpha: la });
      }
    });

    // --- the couple ---
    {
      let px = cx, py = gy, a = 1, gap = mix(14, 3, ease(seg(t, 0.9, 3.1)));
      if (t >= 5) {
        const e = ease(seg(t, 5.0, 6.2)); px = mix(cx, x0, e); py = mix(gy, lineY, e); gap = mix(3, 12, e);
        px = mix(px, x1, walkP(t));
      }
      if (t >= 15) { const e = ease(seg(t, 15.0, 15.9)); px = mix(x1, cx, e); py = mix(lineY, filmCy, e); a = 1 - seg(t, 15.2, 15.9); }
      if (t >= 40) { px = cx; py = gy; gap = 14; a = seg(t, 40.5, 41.2); }
      if (a > 0) { const r = 13; dot(g, px - r - gap / 2, py, r, { alpha: a }); dot(g, px + r + gap / 2, py, r, { alpha: a }); }
    }

    // --- S3: films ---
    if (t >= 15 && t < 22.9) {
      const out = 1 - seg(t, 22.5, 22.85);
      const toCard = ease(seg(t, 17.5, 18.5));
      TL.films.forEach((f, i) => {
        const p = cardPos(i);
        let x = p.x, y = p.y, w = cardW, h = cardH, a = seg(t, f.t, f.t + 0.5);
        if (i === 0) { x = mix(cx, p.x, toCard); y = mix(filmCy, p.y, toCard); w = mix(filmW, cardW, toCard); h = mix(filmH, cardH, toCard); a = seg(t, f.t, f.t + 0.8); }
        if (a <= 0) return;
        cover(g, IMG[f.img], x, y, w, h, a * out);
        const big = i === 0 ? 1 - toCard : 0;
        const ny = y + h / 2 + mix(40, 58, big) * fs;
        text(g, f.name, x, ny, { font: SERIF, weight: 600, size: mix(32, 50, big), alpha: a * out });
        text(g, f.venue.toUpperCase(), x, ny + mix(30, 40, big) * fs, { size: mix(15, 18, big), track: 0.24, alpha: a * out * 0.8 });
      });
    }

    // --- S3: steps ---
    if (t >= 22.6 && t < 33.4) {
      const out = 1 - seg(t, 32.5, 33.0);
      TL.steps.forEach((s, i) => {
        const nx = nodeX(i);
        const a = seg(t, 23.0 + i * 0.12, 23.4 + i * 0.12) * out;
        if (a <= 0) return;
        const on = seg(t, s.t + 0.25, s.t + 0.55);
        dot(g, nx, lineY, mix(8, 11, on), { hollow: on < 0.5, alpha: a });
        text(g, s.n, nx, lineY + 78 * fs, { size: 20, track: 0.24, weight: 600, alpha: a * mix(0.62, 1, on) });
        const nextT = TL.steps[i + 1] ? TL.steps[i + 1].t : 32.5;
        const pin = s.t + (i === 0 ? 0.55 : 0.2);
        const pa = fade(t, pin, nextT + 0.1, 0.4, 0.25) * out;
        if (pa > 0) {
          const rise = (1 - ease(seg(t, pin, pin + 0.5))) * 16;
          const py = lineY + 190 * fs + rise;
          text(g, s.title, cx, py, { font: SERIF, weight: 600, size: 72, alpha: pa });
          wrap(g, s.desc, 32, SANS, W - F.safe * 2 - 40).forEach((ln, k) => text(g, ln, cx, py + (62 + k * 44) * fs, { size: 32, alpha: pa * 0.86 }));
        }
      });
    }

    // --- S4: coverage ---
    if (t >= 32.6 && t < 41) {
      const out = 1 - seg(t, 40.0, 40.5);
      const tin = seg(t, 33.0, 33.6);
      // covered part of the day, drawn solid inside the bracket
      const l = bk.x - bk.w / 2 + 17, r = bk.x + bk.w / 2 - 17;
      g.save(); g.globalAlpha = tin * out; g.strokeStyle = C.white; g.lineWidth = 5; g.beginPath(); g.moveTo(Math.max(l, x0), lineY); g.lineTo(Math.min(r, x1), lineY); g.stroke(); g.restore();
      TL.ticks.forEach((k, i) => {
        const tx = x0 + L * k.f, inside = tx >= l - 4 && tx <= r + 4;
        g.save(); g.globalAlpha = tin * out * (inside ? 1 : 0.62);
        g.strokeStyle = C.white; g.lineWidth = 2; g.beginPath(); g.moveTo(tx, lineY - 9); g.lineTo(tx, lineY + 9); g.stroke(); g.restore();
        const stag = F.cols === 2 && i % 2 === 1 ? 30 * fs : 0;
        const tw = measure(g, k.label, 16, SANS, 0.2);
        const lx = clamp(tx, F.safe * 0.6 + tw / 2, W - F.safe * 0.6 - tw / 2);
        text(g, k.label, lx, lineY + 108 + 4 * fs + stag, { size: 16, track: 0.2, weight: inside ? 600 : 400, alpha: tin * out * (inside ? 1 : 0.62) });
      });
      TL.tiers.forEach((k, i) => {
        const nextT = TL.tiers[i + 1] ? TL.tiers[i + 1].t : 40.2;
        const pa = fade(t, k.t + 0.3, nextT + 0.15, 0.4, 0.25);
        if (pa <= 0) return;
        const py = lineY + F.s4 * fs;
        text(g, k.name, cx, py, { font: SERIF, weight: 600, size: 68, alpha: pa });
        text(g, k.price, cx, py + 46 * fs, { size: 20, track: 0.28, weight: 600, alpha: pa });
        if (FMT === '9x16') k.facts.forEach((f, j) => text(g, f, cx, py + (104 + j * 44) * fs, { size: 30, alpha: pa * 0.9 }));
        else text(g, k.facts.join('   ·   '), cx, py + 96 * fs, { size: 30, alpha: pa * 0.9 });
        if (k.two) { const a2 = ease(seg(t, k.t + 0.5, k.t + 1.1)); corners(g, bk.x + 14 * a2, bk.y + 14 * a2, bk.w, bk.h, { alpha: a2 * 0.75 * out }); }
      });
    }

    // --- the bracket itself ---
    corners(g, bk.x, bk.y, bk.w, bk.h);
    {
      // viewfinder read-outs only while the bracket is a full frame (S1 open, S5 close)
      const big = clamp((bk.w - 520) / 200) * (t < 5 ? 1 : seg(t, 40.8, 41.4));
      if (big > 0) {
        const l = bk.x - bk.w / 2, r = bk.x + bk.w / 2, tp = bk.y - bk.h / 2;
        dot(g, l + 34, tp + 30, 6, { color: C.rec, alpha: big });
        text(g, 'REC', l + 52, tp + 30, { size: 17, track: 0.24, align: 'left', base: 'middle', alpha: big, weight: 600 });
        text(g, timecode(t), r - 30, tp + 30, { size: 17, track: 0.14, align: 'right', base: 'middle', alpha: big });
      } else if (t >= 5 && t < 15) {
        dot(g, bk.x, bk.y, 5, { color: C.rec, alpha: seg(t, 6.0, 6.4) * (1 - seg(t, 15.0, 15.3)) });
      }
    }

    // --- headlines (anchors) ---
    TL.headlines.forEach((h, i) => {
      const prev = TL.headlines[i - 1], next = TL.headlines[i + 1];
      const sameIn = prev && prev.label === h.label && h.t0 - prev.t1 < 0.5;
      const sameOut = next && next.label === h.label && next.t0 - h.t1 < 0.5;
      const la = Math.min(sameIn ? (t >= h.t0 - 0.11 ? 1 : 0) : seg(t, h.t0, h.t0 + 0.35), sameOut ? (t < h.t1 + 0.09 ? 1 : 0) : 1 - seg(t, h.t1 - 0.25, h.t1));
      if (la > 0) {
        const lw = measure(g, h.label, 19, SANS, 0.32);
        text(g, h.label, cx, F.labelY, { size: 19, track: 0.32, weight: 600, alpha: la * 0.86 });
        g.save(); g.globalAlpha = la * 0.5; g.strokeStyle = C.white; g.lineWidth = 1.5; g.beginPath(); g.moveTo(cx - 26, F.labelY + 24 * fs); g.lineTo(cx + 26, F.labelY + 24 * fs); g.stroke(); g.restore();
        void lw;
      }
      const tin = h.linesAt || h.t0 + 0.1;
      const a = fade(t, tin, h.t1, 0.4, 0.25);
      if (a > 0) {
        const rise = (1 - ease(seg(t, tin, tin + 0.5))) * 18;
        h.lines.forEach((ln, k) => text(g, ln, cx, F.headY + k * 84 * fs + rise, { font: SERIF, weight: 600, size: 76, alpha: a }));
      }
    });

    // --- S5: payoff ---
    if (t >= 40.8) {
      const p = TL.payoff;
      const a = seg(t, 41.0, 41.6), rise = (1 - ease(seg(t, 41.0, 41.6))) * 18;
      const ty = gy - (FMT === '9x16' ? 205 : 160) * fs;
      const tsz = FMT === '9x16' ? 68 : 80;
      p.tagline.forEach((ln, k) => text(g, ln, cx, ty + k * tsz * 1.1 * fs + rise, { font: SERIF, weight: 600, size: tsz, alpha: a }));
      const ca = seg(t, p.ctaAt, p.ctaAt + 0.45), cr = (1 - ease(seg(t, p.ctaAt, p.ctaAt + 0.5))) * 14;
      if (ca > 0) {
        const by = gy + (FMT === '9x16' ? 190 : 118) * fs + cr, bw = 330 * fs, bh = 74 * fs;
        g.save(); g.globalAlpha = ca; g.fillStyle = C.white; g.fillRect(cx - bw / 2, by - bh / 2, bw, bh); g.restore();
        text(g, p.cta, cx, by + 1, { size: 19, track: 0.24, weight: 600, color: C.navy, base: 'middle', alpha: ca });
        text(g, p.url, cx, by + bh / 2 + 52 * fs, { size: 26, track: 0.08, alpha: ca });
      }
    }

    // --- captions, burned in ---
    TL.captions.forEach((c) => {
      const a = fade(t, c.t0, c.t1, 0.18, 0.15);
      if (a <= 0) return;
      const lines = balanced(g, c.text, 34, SANS, Math.min(W - F.safe * 2, 1300));
      lines.forEach((ln, k) => text(g, ln, cx, F.capY + k * 46 * fs, { size: 34, alpha: a * 0.94 }));
    });
  }

  // ---------- seek ----------
  function seek(t) {
    t = clamp(t, 0, TL.duration);
    if (!RM) { draw(ctx, t); return; }
    // Reduced motion: settled stills, joined by a short dissolve. Captions stay on real time.
    // Each cut is [switch time, settled time to show], so stills change with the captions.
    const cuts = TL.rmCuts;
    let i = 0; while (i + 1 < cuts.length && cuts[i + 1][0] <= t) i++;
    draw(ctx, cuts[i][1]);
    const k = i > 0 ? seg(t, cuts[i][0], cuts[i][0] + 0.3) : 1;
    if (k < 1) { draw(bctx, cuts[i - 1][1]); ctx.save(); ctx.globalAlpha = 1 - k; ctx.drawImage(buf, 0, 0); ctx.restore(); }
    // repaint the caption band at true time so captions never lag the audio
    ctx.fillStyle = C.navy; ctx.fillRect(0, F.capY - 44 * fs, W, 120 * fs);
    ctx.globalAlpha = 1;
    TL.captions.forEach((c) => {
      const a = fade(t, c.t0, c.t1, 0.18, 0.15); if (a <= 0) return;
      balanced(ctx, c.text, 34, SANS, Math.min(W - F.safe * 2, 1300)).forEach((ln, n) => text(ctx, ln, cx, F.capY + n * 46 * fs, { size: 34, alpha: a * 0.94 }));
    });
  }

  // ---------- load ----------
  const IMG = {};
  const loadImg = (key, src) => new Promise((res, rej) => { const im = new Image(); im.onload = () => { IMG[key] = im; res(); }; im.onerror = () => rej(new Error('image ' + src)); im.src = src; });
  const fonts = [
    new FontFace('Cormorant', 'url(../brand/Cormorant-Semibold.woff2)', { weight: '600' }),
    new FontFace('Manrope', 'url(../brand/Manrope-Regular.woff2)', { weight: '400' }),
    new FontFace('Manrope', 'url(../brand/Manrope-Semibold.woff2)', { weight: '600' }),
  ];
  window.ready = Promise.all([
    ...fonts.map((f) => f.load().then((ff) => document.fonts.add(ff))),
    loadImg('mark', '../brand/EB_Mark_White.svg'),
    ...TL.films.map((f) => loadImg(f.img, '../screens/' + f.img)),
  ]).then(() => { window.seek = seek; seek(0); return true; });

  // live preview: ?play=1
  if (q.get('play') === '1') window.ready.then(() => { const s = performance.now(); const loop = () => { seek(((performance.now() - s) / 1000) % TL.duration); requestAnimationFrame(loop); }; loop(); });
})();
