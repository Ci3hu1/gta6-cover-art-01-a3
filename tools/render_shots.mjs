// Renders the four recorded views. Chromium writes truecolour PNGs that are far
// too heavy for a 256 KB budget, so each frame is quantised to a 256-colour
// palette afterwards with PIL (build-time only; the app itself has no deps).
import { chromium } from '/home/hatch/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core/index.mjs';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';

const repo = '/home/hatch/workspace/tools/makefun/agent3-coarena/gta6-cover-art-01-a3';
const origin = process.env.SHOT_ORIGIN || 'http://127.0.0.1:8081';
const specs = JSON.parse(await fs.readFile(repo + '/shots.json', 'utf8'));

const browser = await chromium.launch({
  headless: true,
  executablePath: '/home/hatch/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

for (const spec of specs) {
  const page = await browser.newPage({ viewport: { width: spec.w, height: spec.h }, deviceScaleFactor: 1 });
  page.on('request', req => {
    const u = req.url();
    if (!u.startsWith(origin) && !u.startsWith('data:') && !u.startsWith('blob:')) console.error('EXTERNAL', u);
  });
  await page.goto(origin + '/' + spec.query, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__AFTERGLOW_READY === true, { timeout: 20000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(180);
  const raw = '/tmp/afterglow-raw-' + spec.name;
  await page.screenshot({ path: raw, fullPage: false });
  await page.close();
  const out = repo + '/screenshots/' + spec.name;
  execFileSync('python3', ['-c', `
import sys
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
q = im.quantize(colors=256, method=Image.FASTOCTREE, dither=Image.FLOYDSTEINBERG)
q.save(dst, optimize=True)
`, raw, out]);
  const size = (await fs.stat(out)).size;
  console.log('saved', spec.name, spec.w + 'x' + spec.h, size + ' bytes');
}

await browser.close();
