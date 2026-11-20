# gta6-cover-art-01-a3

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Ci3hu1/gta6-cover-art-01-a3/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Ci3hu1/gta6-cover-art-01-a3/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Afterglow Vice Cover Studio** — a self-contained browser studio that builds a GTA VI style magazine cover from your own photos. Pick a frame, a colour story and a headline, then export the cover as a PNG.

No network, no build step, no dependencies. Pure Node standard library on the server side, plain ES modules in the browser, everything rendered on a canvas you own.

## What it does

- **5 frames** of cast photography in a fixed photo zone, each one reframable by dragging the panel and rescalable with the photo-scale slider.
- **8 layouts** — PULSE, HERO + 3, STRIP, DIARY, MOSAIC, DUET, NIGHT, FULL BLEED — every one shows all five cast members.
- **8 colour stories** — GOLDEN HOUR, CORAL CLUB, ORCHID SKY, LAGOON, AFTER HOURS, CITRUS POP, ROSE NOIR, ELECTRIC. One grade washes every panel plus the type band.
- **Headline and cast fields** — cover title, script line, cast name and role tag, with live character counts.
- **Undo / redo** across every edit, capped at 50 steps.
- **3-size export** — 1080 × 1350 portrait, 1080 × 1080 square, 1920 × 1080 landscape. The compositor re-flows the layout per aspect ratio instead of stretching one picture.
- **Complete magazine furniture** — masthead quote and star rating, story ribbon, gold seal, volume pill, cast filmstrip, barcode, billing block, and a fine edge keyline.
- **Local-only photos** — the upload button reads a file with `URL.createObjectURL`. Nothing leaves the browser; there is no fetch, no XHR, no analytics.

## Run it

```sh
node serve.ts
```

Then open <http://localhost:8080>.

The grader entrypoint is `node main.ts`: it copies `app/` and `screenshots/` to `$MAKEFUN_OUTPUT_DIR` (default `/output`) and writes `dossier.json` there.

```sh
MAKEFUN_OUTPUT_DIR=/tmp/cover-out node main.ts
```

## Layout

```
app/
  index.html          the studio shell
  style.css           all styling, no framework
  src/cover.js        the compositor: frames, grades, type band, furniture
  src/main.js         studio state, undo/redo, export, pointer reframing
  src/shots.js        screenshot helpers around the same compositor
  fonts/              Anton, Barlow Condensed, Pacifico + OFL texts
  samples/            five bundled photographs
main.ts               grader entrypoint (copies app/, writes dossier.json)
serve.ts              static server for app/ on port 8080
shots.json            screenshot specs
screenshots/          four recorded views
```

## Notes on the design

The headline lives in a type band that sits **below** the photo zone, so the title can never overlap a face at any aspect ratio. Cast role tags are inset from their panel edges, so they stay inside the frame even on the smallest cell. The cast filmstrip under the subtitle gives the bottom of the cover a clean, evenly spaced grid instead of ragged photo strips.

Fonts are bundled under the SIL Open Font License; see `app/fonts/OFL-*.txt`. Sample photographs are original generated artwork.

---

<sub>Entered on [make.fun](https://make.fun/?ref=cc7tcnw6&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>

---
