// Tempo-locked procedural bed (Web Audio, rendered offline). 96 BPM, D major.
// One motif (F#5 A5 D6 B5) returns on the key idea (12.6 s) and the payoff (40.2 s).
// No voice track in this cut, so there is nothing to duck under.
window.renderAudio = async () => {
  const TL = TIMELINE, SR = 48000, DUR = TL.duration;
  const ac = new OfflineAudioContext(2, SR * DUR, SR);
  const beat = 60 / TL.bpm, bar = TL.bar;
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

  const master = ac.createGain(); master.gain.value = 0.9;
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.25;
  // Keep the bed out of the low end: a high-pass and a low-shelf cut so phone speakers hear the tune.
  const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 120; hp.Q.value = 0.7;
  const shelf = ac.createBiquadFilter(); shelf.type = 'lowshelf'; shelf.frequency.value = 300; shelf.gain.value = -8;
  master.connect(hp); hp.connect(shelf); shelf.connect(comp); comp.connect(ac.destination);
  // gentle fade in/out
  master.gain.setValueAtTime(0, 0); master.gain.linearRampToValueAtTime(0.9, 0.4);
  master.gain.setValueAtTime(0.9, DUR - 1.6); master.gain.linearRampToValueAtTime(0, DUR - 0.05);

  // seeded noise (mulberry32) so every render is identical
  let seed = 20261111; const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let x = Math.imul(seed ^ seed >>> 15, 1 | seed); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; };
  const nb = ac.createBuffer(1, SR, SR); const nd = nb.getChannelData(0); for (let i = 0; i < SR; i++) nd[i] = rnd() * 2 - 1;

  function tone(t, f, { type = 'sine', a = 0.01, d = 0.4, g = 0.2, pan = 0, lp = 0 } = {}) {
    const o = ac.createOscillator(); o.type = type; o.frequency.value = f;
    const v = ac.createGain(); v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(g, t + a); v.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    const p = ac.createStereoPanner(); p.pan.value = pan;
    let n = o; if (lp) { const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; o.connect(fl); n = fl; }
    n.connect(v); v.connect(p); p.connect(master); o.start(t); o.stop(t + a + d + 0.05);
  }
  function pad(t, len, notes, g) {
    notes.forEach((m, i) => {
      [0, 0.004].forEach((det, k) => {
        const o = ac.createOscillator(); o.type = k ? 'triangle' : 'sine'; o.frequency.value = hz(m) * (1 + det);
        const v = ac.createGain(); v.gain.setValueAtTime(0, t); v.gain.linearRampToValueAtTime(g / notes.length, t + 0.9); v.gain.setValueAtTime(g / notes.length, t + len - 0.6); v.gain.linearRampToValueAtTime(0, t + len + 0.5);
        const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 1100;
        const p = ac.createStereoPanner(); p.pan.value = (i % 2 ? 0.35 : -0.35) * (k ? 1 : -1);
        o.connect(fl); fl.connect(v); v.connect(p); p.connect(master); o.start(t); o.stop(t + len + 0.6);
      });
    });
  }
  function noise(t, d, f, g) {
    const s = ac.createBufferSource(); s.buffer = nb; const fl = ac.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = f; fl.Q.value = 1.2;
    const v = ac.createGain(); v.gain.setValueAtTime(g, t); v.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(fl); fl.connect(v); v.connect(master); s.start(t); s.stop(t + d + 0.02);
  }

  // Bed. S1 sits on an unresolved B minor (the worry); it resolves to D when the frame lets go at 5 s.
  const CH = { Bm: [47, 54, 59, 62], D: [50, 57, 62, 66], G: [43, 55, 59, 62], A: [45, 57, 61, 64], Em: [52, 55, 59, 64] };
  const prog = ['Bm', 'Bm', 'D', 'G', 'D', 'A', 'D', 'G', 'Bm', 'G', 'D', 'A', 'G', 'Em', 'A', 'A', 'D', 'D'];
  prog.forEach((c, i) => pad(i * bar, bar, CH[c].map((m) => m + 12), i < 2 ? 0.07 : 0.06));
  // soft pulse from the model onwards: root on every beat, fifth on the off-beats of the proof and turn
  for (let b = 8; b < 68; b++) {
    const t = b * beat, c = CH[prog[Math.floor(t / bar)]];
    tone(t, hz(c[0] + 12), { type: 'sine', a: 0.005, d: 0.3, g: b % 4 === 0 ? 0.08 : 0.045 });
    if (t >= 15 && t < 40) tone(t + beat / 2, hz(c[1] + 12), { type: 'triangle', a: 0.004, d: 0.18, g: 0.035, pan: b % 2 ? 0.4 : -0.4, lp: 2400 });
  }

  // Arpeggio an octave up from the model onwards: the bed carries a tune, not just a drone.
  for (let n = 16; n < 128; n++) {
    const t = n * beat / 2; if (t >= 43.5) break;
    const c = CH[prog[Math.floor(t / bar)]], pat = [1, 2, 3, 2];
    const m = c[pat[n % 4]] + 12 + (c[pat[n % 4]] < 55 ? 12 : 0);
    tone(t, hz(m), { type: 'triangle', a: 0.004, d: 0.42, g: (n % 8 === 0 ? 0.13 : 0.09) * (t >= 15 && t < 22.5 ? 1.25 : 1), pan: n % 2 ? 0.3 : -0.3, lp: 4200 });
  }
  // a soft bell on each bar from the proof onwards
  for (let i = 6; i < 17; i++) tone(i * bar, hz(CH[prog[i]][3] + 24), { a: 0.005, d: 1.6, g: 0.035, pan: i % 2 ? 0.4 : -0.4 });
  const MOTIF = [78, 81, 86, 83];
  for (const c of TL.cues) {
    const t = c.t;
    if (c.type === 'press') { tone(t, hz(47 - c.n), { a: 0.01, d: 0.5, g: 0.25 }); noise(t, 0.12, 300, 0.05); }
    if (c.type === 'release') { [62, 66, 69].forEach((m, i) => tone(t + i * 0.09, hz(m), { type: 'triangle', a: 0.02, d: 1.4, g: 0.08, lp: 3000, pan: (i - 1) * 0.3 })); }
    if (c.type === 'capture') { noise(t, 0.035, 5200, 0.07); tone(t + 0.01, hz(86 + [0, 2, 5][c.n]), { a: 0.003, d: 0.22, g: 0.07 }); }
    if (c.type === 'tick') { tone(t, hz(74 + [0, 2, 4, 7][c.n]), { type: 'triangle', a: 0.004, d: 0.3, g: 0.07, lp: 3500, pan: (c.n - 1.5) * 0.25 }); }
    if (c.type === 'step') { tone(t, hz(69 + [0, 2, 5, 9][c.n]), { type: 'triangle', a: 0.005, d: 0.5, g: 0.09, lp: 3200 }); noise(t, 0.03, 4200, 0.03); }
    if (c.type === 'widen') { tone(t, hz(62 + [0, 4, 7][c.n]), { type: 'triangle', a: 0.03, d: 0.9, g: 0.1, lp: 2600 }); tone(t, hz(74 + [0, 4, 7][c.n]), { a: 0.03, d: 0.7, g: 0.05 }); }
    if (c.type === 'motif') MOTIF.forEach((m, i) => { const tt = t + i * beat / 2; tone(tt, hz(m), { type: 'triangle', a: 0.006, d: 1.1, g: 0.2 * c.gain, lp: 5000, pan: (i - 1.5) * 0.2 }); tone(tt, hz(m - 12), { a: 0.006, d: 0.9, g: 0.06 * c.gain }); });
    if (c.type === 'lift') { [74, 78, 81, 86].forEach((m, i) => tone(t + i * 0.06, hz(m), { type: 'triangle', a: 0.01, d: 1.4, g: 0.07, lp: 5000, pan: (i - 1.5) * 0.25 })); noise(t, 0.6, 6000, 0.02); }
    if (c.type === 'chime') [74, 81, 86].forEach((m, i) => tone(t + i * 0.07, hz(m), { a: 0.006, d: 1.8, g: 0.08, pan: (i - 1) * 0.3 }));
  }

  const buf = await ac.startRendering();
  // 16-bit WAV
  const n = buf.length, L = buf.getChannelData(0), R = buf.getChannelData(1);
  const out = new DataView(new ArrayBuffer(44 + n * 4));
  const ws = (o, s) => { for (let i = 0; i < s.length; i++) out.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, 'RIFF'); out.setUint32(4, 36 + n * 4, true); ws(8, 'WAVEfmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 2, true);
  out.setUint32(24, SR, true); out.setUint32(28, SR * 4, true); out.setUint16(32, 4, true); out.setUint16(34, 16, true); ws(36, 'data'); out.setUint32(40, n * 4, true);
  for (let i = 0; i < n; i++) { out.setInt16(44 + i * 4, Math.max(-1, Math.min(1, L[i])) * 32767, true); out.setInt16(46 + i * 4, Math.max(-1, Math.min(1, R[i])) * 32767, true); }
  let bin = ''; const u8 = new Uint8Array(out.buffer); for (let i = 0; i < u8.length; i += 32768) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 32768));
  return btoa(bin);
};
