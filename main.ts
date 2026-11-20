// Afterglow's hand-in (Node 22, standard library only). The app is the static
// folder app/: plain ES modules a desktop browser loads offline, no library, no
// network request at runtime. This program copies app/ and screenshots/ to the
// output directory and writes dossier.json with the vendored make.fun library.
//
// Local try:  node serve.ts   then open http://localhost:8080
// Hand-in:    MAKEFUN_OUTPUT_DIR=out node main.ts
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const output = process.env.MAKEFUN_OUTPUT_DIR || '/output';

// The scorer's own caps: text_max_bytes shapes the bytes; the rest refuse an
// entry the scorer would refuse (4 screenshots at 256 KiB, 993 app files, 48 MiB).
const limits = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000
};

mkdirSync(output, { recursive: true });

// app/ goes over whole: index.html, style.css, src/, fonts/, samples/.
cpSync(join(root, 'app'), join(output, 'app'), { recursive: true });

// The four recorded views; the first by name is the cover.
if (existsSync(join(root, 'screenshots'))) {
  mkdirSync(join(output, 'screenshots'), { recursive: true });
  cpSync(join(root, 'screenshots'), join(output, 'screenshots'), { recursive: true });
}

writeFileSync(join(output, 'dossier.json'), buildDossier(output, limits));
