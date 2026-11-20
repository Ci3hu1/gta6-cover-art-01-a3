# AGENTS.md - Workspace conventions

Personality and tone live in `SOUL.md`. This file holds the working rules for the repo.

<!-- build3 rebuild r2 redo, 20 Nov 2026: re-authored fresh inside the r2 recorded session. -->

## Red lines

- Build only. Never submit an entry, never claim a prize, never handle credentials or wallets.
- Don't hand private data to anyone the user did not name.
- Ask before any destructive or irreversible action the user did not request.
- Before touching config or schedulers (crontab, systemd, nginx, shell rc files), read the current state and merge; never replace a whole file unless told to.
- Prefer `trash` to `rm`: recoverable beats gone forever.

## Sight-unseen rule

- Build from the brief, the fresh kit and the public top-10 study. Never open Muse's v4 repo or any `gta6-cover-art-01-*` prep directory.
- If a part of the design is caught being copied from a prep directory, rebuild that part from the brief.

## This repository

- `gta6-cover-art-01-a3` — the agent #3 entry for make.fun bounty `gta6-cover-art-01` ("Make GTA 6 Cover Art", $250, FREE, strict transcripts).
- The product is **Afterglow Vice Cover Studio**: a static, offline browser studio that turns five photos and a caption into a GTA-VI-style magazine cover and exports it as a PNG.
- `main.ts` at the root is the hand-in: it copies `app/` and `screenshots/` to `/output` and writes `dossier.json` with `vendor/makefun-app.ts`.
- `app/` is plain static files: `index.html`, `style.css`, `src/*.js` ES modules, `fonts/`, `samples/`. No build step, no network request at runtime, no dependency.
- `vendor/makefun-app.ts` must stay byte-for-byte the scorer's copy (it comes from the kit's `starter/vendor/`). Never edit it.

## Code rules

- Node 22+ standard library only on the server side; vanilla ES modules in the browser.
- Deterministic: no `Math.random`, no `Date.now` in the art path. Same state must render the same pixels.
- Every file under `app/` loads from the local origin only. Fonts are vendored under the OFL.
- Screenshots are quantised to 256 colours so each stays under the 256 KiB gate cap.

## Checks before reporting done

1. `node main.ts` with `MAKEFUN_OUTPUT_DIR` set writes a dossier without error.
2. `node tools/render_shots.mjs` regenerates all four screenshots and prints their byte sizes.
3. The kit check passes: `node cli/makefun.mjs check --repo <this repo> --commit <sha>` from the fresh kit, 0 failed.

## Memory

- Daily notes go in `memory/YYYY-MM-DD.md`; durable preferences in `USER.md`; durable facts in `MEMORY.md` (main session only).
- Write a concrete note when a build decision or a mistake would otherwise be repeated.

## Tools

- Local notes (camera names, SSH hosts, voices) belong here, not in shared skills.
- On Discord and WhatsApp use bullet lists instead of tables; on WhatsApp use **bold** instead of headers.
