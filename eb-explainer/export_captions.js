// Writes out/captions.srt from the same TIMELINE the film burns in.
const TL = require('./src/timeline.js'); const fs = require('fs');
const ts = (t) => { const ms = Math.round(t * 1000); const p = (n, l = 2) => String(n).padStart(l, '0'); return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`; };
fs.writeFileSync('out/captions.srt', TL.captions.map((c, i) => `${i + 1}\n${ts(c.t0)} --> ${ts(c.t1)}\n${c.text}\n`).join('\n'));
const cps = TL.captions.map((c) => c.text.length / (c.t1 - c.t0));
console.log('captions', TL.captions.length, 'max chars/sec', Math.max(...cps).toFixed(1));
const words = [...TL.headlines.flatMap((h) => h.lines), ...TL.payoff.tagline].map((l) => l.split(' ').length);
console.log('max words per on-screen line', Math.max(...words));
