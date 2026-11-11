// Renders the procedural bed offline in headless Chrome, then normalises to
// -16 LUFS integrated / -1.5 dBTP with a two-pass ffmpeg loudnorm.
const { chromium } = require('playwright');
const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  p.on('pageerror', (e) => { console.error('PAGE ERROR', e.message); process.exit(1); });
  await p.goto('file://' + path.join(__dirname, 'src/audio.html'));
  const b64 = await p.evaluate(() => window.renderAudio());
  await b.close();
  fs.mkdirSync('out', { recursive: true });
  fs.writeFileSync('out/_bed_raw.wav', Buffer.from(b64, 'base64'));
  const pass1 = spawnSync('ffmpeg', ['-hide_banner', '-i', 'out/_bed_raw.wav', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const m = JSON.parse(pass1.slice(pass1.lastIndexOf('{')));
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', 'out/_bed_raw.wav', '-af',
    `loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`,
    '-ar', '48000', 'out/audio.wav']);
  fs.unlinkSync('out/_bed_raw.wav');
  console.log('raw', m.input_i, 'LUFS', m.input_tp, 'dBTP');
})();
