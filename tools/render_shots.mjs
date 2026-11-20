// Renders the four recorded views once the build is green. Chromium writes
// truecolour PNGs far above the 256 KiB gate cap, so each frame is quantised
// to a 256-colour palette afterwards with PIL. Build-time only: the app
// ships no dependencies.
//
//   node serve.ts --port 8081 &
//   node tools/render_shots.mjs
import { chromium } from '/home/hatch/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';

const repo = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const origin = process.env.SHOT_ORIGIN || 'http://127.0.0.1:8081';
const specs = JSON.parse(await fs.readFile(`${repo}/shots.json`, 'utf8'));

const browser = await chromium.launch({
  headless: true,
  executablePath: '/home/hatch/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage']
});

for (const spec of specs) {
  const page = await browser.newPage({
    viewport: { width: spec.w, height: spec.h },
    deviceScaleFactor: 1
  });

  const offOrigin = [];
  page.on('request', req => {
    const u = req.url();
    if (!u.startsWith(origin) && !u.startsWith('data:') && !u.startsWith('blob:')) offOrigin.push(u);
  });
  page.on('pageerror', err => console.error('PAGEERROR', spec.name, err.message));

  await page.goto(`${origin}/${spec.query}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__AFTERGLOW_READY === true, { timeout: 20000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(200);

  const raw = `/tmp/afterglow-raw-${spec.name}`;
  await page.screenshot({ path: raw, fullPage: false });
  await page.close();

  const out = `${repo}/screenshots/${spec.name}`;
  execFileSync('python3', ['-c', `
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert('RGB')
q = im.quantize(colors=256, method=Image.FASTOCTREE, dither=Image.FLOYDSTEINBERG)
q.save(sys.argv[2], optimize=True)
`, raw, out]);

  const size = (await fs.stat(out)).size;
  const flag = size > 262144 ? ' OVER-CAP' : '';
  console.log(`saved ${spec.name} ${spec.w}x${spec.h} ${size} bytes${flag}`);
  if (offOrigin.length) console.error('OFF-ORIGIN REQUESTS', spec.name, offOrigin.join(' '));
}

await browser.close();
