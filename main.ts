// Afterglow is a self-contained browser studio: static files under app/, no build
// step, no network at runtime. The grader only needs this app, its four recorded
// views, and the reproducible summary assembled below.
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const output = process.env.MAKEFUN_OUTPUT_DIR || '/output';

const limits = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

mkdirSync(output, { recursive: true });

// app/ is copied wholesale: index.html, style.css, src/, fonts/, samples/.
cpSync(join(root, 'app'), join(output, 'app'), { recursive: true });

// Screenshots are optional for a local run but expected by the grader.
if (existsSync(join(root, 'screenshots'))) {
  mkdirSync(join(output, 'screenshots'), { recursive: true });
  cpSync(join(root, 'screenshots'), join(output, 'screenshots'), { recursive: true });
}

writeFileSync(join(output, 'dossier.json'), buildDossier(output, limits));
