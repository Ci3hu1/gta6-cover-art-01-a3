# gta6-cover-art-01-a3

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Ci3hu1/gta6-cover-art-01-a3/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Ci3hu1/gta6-cover-art-01-a3/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Afterglow Vice Cover Studio** — a self-contained browser studio that turns five photos and a caption into a GTA VI style magazine cover, then exports it as a PNG. Pick a frame, a colour story and a headline; drag any panel to reframe its shot. The whole thing runs offline in the browser — no server, no account, no upload.

No network, no build step, no dependencies. Node standard library on the server side, plain ES modules in the browser, everything painted on a canvas you own. Open it, arrange your five frames, type a headline, export a cover.

## What it does

- **Five cast frames** of photography in a fixed photo zone. Drag a panel to re-centre its crop, or use the photo-scale slider for a tighter shot.
- **Eight layouts** — HERO + 3, PULSE, STRIP, DIARY, MOSAIC, DUET, NIGHT, FULL BLEED. Every layout shows all five cast members, and the hero cell breaks the grid.
- **Eight colour stories** — GOLDEN HOUR, CORAL CLUB, ORCHID SKY, LAGOON, AFTER HOURS, CITRUS POP, ROSE NOIR, ELECTRIC. One grade washes every panel and the type band.
- **Headline and cast fields** — cover title, script line, cast name and role tag, with a live character count.
- **Undo / redo** across every edit, sixty steps deep.
- **Three-size export** — 1080 × 1350 portrait, 1080 × 1080 square, 1920 × 1080 landscape. The compositor re-flows the layout per aspect ratio instead of stretching one picture.
- **Complete magazine furniture** — five-star press quote, VOL. pill, tagline ribbon, gold starburst seal, striped chrome headline, pink script sub-line, typographic cast strip, billing block, barcode and an inset keyline. All of it inside the frame.
- **Photos stay local** — the upload button reads a file with `URL.createObjectURL`. No fetch, no XHR, no analytics, no server.

## Run it

```sh
node serve.ts          # app/ on http://localhost:8080
```

The hand-in is `node main.ts`: it copies `app/` and `screenshots/` to `$MAKEFUN_OUTPUT_DIR` (default `/output`) and writes `dossier.json` there.

```sh
MAKEFUN_OUTPUT_DIR=/tmp/cover-out node main.ts
```

Regenerate the four recorded views (needs a local server and headless Chromium):

```sh
node serve.ts --port 8081 &
node tools/render_shots.mjs
```

## Layout

```
app/
  index.html          the studio shell
  style.css           all styling, no framework
  src/cover.js        the compositor: cells, grades, chrome title, furniture
  src/main.js         studio state, undo/redo, pointer reframing, export
  src/shots.js        screenshot helpers around the same compositor
  fonts/              Anton, Pacifico, Barlow + OFL texts
  samples/            five bundled photographs
main.ts               hand-in: copies app/, writes dossier.json
serve.ts              static server for app/ on port 8080
shots.json            the four recorded views
screenshots/          the recorded PNGs (first by name is the cover)
vendor/               the scorer's make.fun dossier library, unmodified
```

## Design notes

The headline lives in a type band that sits **below** the photo zone on portrait and square covers, and **beside** it on landscape ones, so the title can never overlap a face at any aspect ratio. Role tags are inset from every panel edge, so a tag stays fully inside its frame even on the smallest cell. The cast strip under the script line is typographic — five numbered columns with hairlines — so the bottom of the cover reads as a credit strip rather than a row of thumbnails.

Fonts are bundled under the SIL Open Font License; see `app/fonts/OFL-*.txt`. Sample photographs are original generated artwork.

---

<sub>Entered on [make.fun](https://make.fun/?ref=cc7tcnw6&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
