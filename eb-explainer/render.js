// Headless Chrome steps t = n/60 and pipes frames to ffmpeg (libx264, crf 16, yuv420p).
// usage: node render.js <16x9|9x16|1x1> <out.mp4> [--rm] [--stills dir t1,t2,...] [--audio file.wav]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const TL = require('./src/timeline.js');

const SIZES = { '16x9': [1920, 1080], '9x16': [1080, 1920], '1x1': [1080, 1080] };
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.png': 'image/png', '.css': 'text/css' };

function serve(root) {
  return new Promise((res) => {
    const srv = http.createServer((req, rsp) => {
      const p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
      if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { rsp.writeHead(404); return rsp.end(); }
      rsp.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(rsp);
    }).listen(0, '127.0.0.1', () => res(srv));
  });
}

(async () => {
  const args = process.argv.slice(2);
  const fmt = args[0], out = args[1];
  const rm = args.includes('--rm');
  const si = args.indexOf('--stills'), ai = args.indexOf('--audio');
  const [W, H] = SIZES[fmt];
  const srv = await serve(__dirname);
  const url = `http://127.0.0.1:${srv.address().port}/src/film.html?fmt=${fmt}${rm ? '&rm=1' : ''}`;
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage();
  page.on('pageerror', (e) => { console.error('PAGE ERROR', e.message); process.exit(1); });
  await page.goto(url);
  await page.evaluate(() => window.ready);

  if (si >= 0) {
    const dir = args[si + 1]; fs.mkdirSync(dir, { recursive: true });
    for (const t of args[si + 2].split(',').map(Number)) {
      await page.evaluate((x) => window.seek(x), t);
      await page.screenshot({ path: path.join(dir, `${fmt}${rm ? '_rm' : ''}_${t.toFixed(2).padStart(5, '0')}.png`) });
    }
  } else {
    const n = Math.round(TL.duration * TL.fps);
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(TL.fps), '-c:v', 'png', '-i', '-',
      ...(ai >= 0 ? ['-i', args[ai + 1]] : []),
      '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', String(TL.fps),
      ...(ai >= 0 ? ['-c:a', 'aac', '-b:a', '256k', '-shortest'] : []), '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const done = new Promise((r) => ff.on('close', r));
    const t0 = Date.now();
    for (let i = 0; i < n; i++) {
      await page.evaluate((x) => window.seek(x), i / TL.fps);
      const b = await page.screenshot({ type: 'png' });
      if (!ff.stdin.write(b)) await new Promise((r) => ff.stdin.once('drain', r));
      if (i % 300 === 0) console.log(`${fmt}${rm ? ' rm' : ''} frame ${i}/${n} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end();
    console.log(`${fmt}${rm ? ' rm' : ''} ffmpeg exit`, await done);
  }
  await browser.close(); srv.close();
})();
