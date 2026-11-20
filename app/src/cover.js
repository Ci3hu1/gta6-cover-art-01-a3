// Afterglow Vice Cover Studio — the compositor.
// Everything here is deterministic 2D-canvas work: no network, no randomness,
// no Date. The same state always paints the same pixels.
//
// How a cover is built: photographs fill a photo zone, and all the magazine
// furniture (headline, quote, seal, cast strip, barcode) lives in a separate
// type band — below the photos on tall and square covers, beside them on
// landscape ones. Because the band is its own region, the headline can never
// sit on a face, and the role tags are inset from every panel edge so they
// can never be clipped by a frame.

// The five cast members. cx/cy is the focal point of the photograph (0..1);
// scale is the default zoom for that frame.
const PEOPLE = [
  { id: 'mara', name: 'MARA SOL',   role: 'THE GETAWAY DRIVER', photo: 'boulevard.jpg', color: '#e98b75', cx: .50, cy: .34, scale: 1 },
  { id: 'nico', name: 'NICO VEGA',  role: 'THE FIXER',          photo: 'rooftop.jpg',   color: '#efbd72', cx: .50, cy: .30, scale: 1 },
  { id: 'luz',  name: 'LUZ & JUNE', role: 'THE NIGHT OWLS',     photo: 'diner.jpg',     color: '#df81a1', cx: .50, cy: .40, scale: 1 },
  { id: 'tito', name: 'TITO REYES', role: 'THE OLD SALT',       photo: 'pier.jpg',      color: '#74b8aa', cx: .50, cy: .32, scale: 1 },
  { id: 'jade', name: 'JADE KNOX',  role: 'THE WILDCARD',       photo: 'garage.jpg',    color: '#df9b70', cx: .50, cy: .30, scale: 1 }
];

// The eight frames. Every one shows all five people; the hero cell breaks
// the grid so the cover has a clear lead photograph.
const LAYOUTS = [
  { id: 'hero',   name: 'HERO + 3' },
  { id: 'pulse',  name: 'PULSE' },
  { id: 'strip',  name: 'STRIP' },
  { id: 'diary',  name: 'DIARY' },
  { id: 'mosaic', name: 'MOSAIC' },
  { id: 'duet',   name: 'DUET' },
  { id: 'night',  name: 'NIGHT' },
  { id: 'full',   name: 'FULL BLEED' }
];

// The eight colour stories. Each one washes every panel and the type band.
const GRADES = [
  { id: 'golden',   name: 'GOLDEN HOUR', top: '#ffc17e', mid: '#f08478', bottom: '#7d2b57', glow: '#ffc069' },
  { id: 'coral',    name: 'CORAL CLUB',  top: '#ff997c', mid: '#e45e80', bottom: '#4b2358', glow: '#ff7e93' },
  { id: 'orchid',   name: 'ORCHID SKY',  top: '#f7a8ce', mid: '#a96bb3', bottom: '#312a61', glow: '#f2a4db' },
  { id: 'lagoon',   name: 'LAGOON',      top: '#8ed2c1', mid: '#3b91a0', bottom: '#203860', glow: '#9fe0d0' },
  { id: 'after',    name: 'AFTER HOURS', top: '#fb8e63', mid: '#854c86', bottom: '#16294f', glow: '#ffb875' },
  { id: 'citrus',   name: 'CITRUS POP',  top: '#ffd278', mid: '#f07858', bottom: '#553055', glow: '#ffe190' },
  { id: 'rose',     name: 'ROSE NOIR',   top: '#efa0a3', mid: '#c65e79', bottom: '#372447', glow: '#ffc0a4' },
  { id: 'electric', name: 'ELECTRIC',    top: '#8bd1cc', mid: '#8c78ba', bottom: '#412b64', glow: '#ff9cbd' }
];

// Cells are normalised inside the photo zone: { p: person index, x, y, w, h }.
// A person may appear in more than one cell; the hero cell is always the lead.
const CELLS = {
  hero: [
    { p: 0, x: 0,     y: 0,    w: .62,   h: .665 },
    { p: 1, x: .625,  y: 0,    w: .375,  h: .33  },
    { p: 2, x: .625,  y: .335, w: .375,  h: .33  },
    { p: 3, x: 0,     y: .67,  w: .31,   h: .33  },
    { p: 4, x: .315,  y: .67,  w: .305,  h: .33  },
    { p: 2, x: .625,  y: .67,  w: .375,  h: .33  }
  ],
  pulse: [
    { p: 0, x: 0,      y: 0,    w: .5,    h: .55 },
    { p: 1, x: .5,     y: 0,    w: .25,   h: .55 },
    { p: 2, x: .75,    y: 0,    w: .25,   h: .55 },
    { p: 3, x: 0,      y: .555, w: .3333, h: .445 },
    { p: 4, x: .3333,  y: .555, w: .3333, h: .445 },
    { p: 1, x: .6667,  y: .555, w: .3333, h: .445 }
  ],
  strip: [
    { p: 1, x: 0,      y: 0,    w: .3333, h: .52 },
    { p: 2, x: .3333,  y: 0,    w: .3333, h: .52 },
    { p: 3, x: .6667,  y: 0,    w: .3333, h: .52 },
    { p: 0, x: 0,      y: .525, w: .5,    h: .475 },
    { p: 4, x: .5,     y: .525, w: .5,    h: .475 }
  ],
  diary: [
    { p: 2, x: 0,      y: 0,    w: .5,    h: .55 },
    { p: 1, x: .5,     y: 0,    w: .5,    h: .55 },
    { p: 4, x: 0,      y: .555, w: .3333, h: .445 },
    { p: 0, x: .3333,  y: .555, w: .3333, h: .445 },
    { p: 3, x: .6667,  y: .555, w: .3333, h: .445 }
  ],
  mosaic: [
    { p: 1, x: 0,      y: 0,    w: .3333, h: .33 },
    { p: 2, x: .3333,  y: 0,    w: .3333, h: .33 },
    { p: 3, x: .6667,  y: 0,    w: .3333, h: .33 },
    { p: 4, x: 0,      y: .335, w: .5,    h: .32 },
    { p: 0, x: .5,     y: .335, w: .5,    h: .665 },
    { p: 2, x: 0,      y: .66,  w: .3333, h: .34 },
    { p: 1, x: .3333,  y: .66,  w: .3333, h: .34 }
  ],
  duet: [
    { p: 0, x: 0,     y: 0,    w: .615, h: 1 },
    { p: 1, x: .62,   y: 0,    w: .38,  h: .33 },
    { p: 2, x: .62,   y: .335, w: .38,  h: .325 },
    { p: 3, x: .62,   y: .665, w: .38,  h: .165 },
    { p: 4, x: .62,   y: .835, w: .38,  h: .165 }
  ],
  night: [
    { p: 2, x: 0,     y: 0,    w: .5,   h: .42 },
    { p: 1, x: .5,    y: 0,    w: .5,   h: .42 },
    { p: 4, x: 0,     y: .425, w: .33,  h: .36 },
    { p: 0, x: .335,  y: .425, w: .665, h: .575 },
    { p: 3, x: 0,     y: .79,  w: .33,  h: .21 }
  ],
  full: [
    { p: 0, x: 0,    y: 0,    w: .78, h: 1 },
    { p: 1, x: .78,  y: 0,    w: .22, h: .25 },
    { p: 2, x: .78,  y: .25,  w: .22, h: .25 },
    { p: 3, x: .78,  y: .5,   w: .22, h: .25 },
    { p: 4, x: .78,  y: .75,  w: .22, h: .25 }
  ]
};

// On wide covers the photograph column stays on the left and the type band
// stands on the right, so a landscape export reads like a spread rather
// than a squashed page. The cell shapes are the same; only the band moves.
const WIDE_CELLS = {
  hero: [
    { p: 0, x: 0,     y: 0,    w: .62,   h: .665 },
    { p: 1, x: .625,  y: 0,    w: .375,  h: .33  },
    { p: 2, x: .625,  y: .335, w: .375,  h: .33  },
    { p: 3, x: 0,     y: .67,  w: .31,   h: .33  },
    { p: 4, x: .315,  y: .67,  w: .305,  h: .33  },
    { p: 2, x: .625,  y: .67,  w: .375,  h: .33  }
  ],
  pulse: [
    { p: 0, x: 0,      y: 0,    w: .5,    h: .55 },
    { p: 1, x: .5,     y: 0,    w: .25,   h: .55 },
    { p: 2, x: .75,    y: 0,    w: .25,   h: .55 },
    { p: 3, x: 0,      y: .555, w: .3333, h: .445 },
    { p: 4, x: .3333,  y: .555, w: .3333, h: .445 },
    { p: 1, x: .6667,  y: .555, w: .3333, h: .445 }
  ],
  strip: [
    { p: 1, x: 0,      y: 0,    w: .3333, h: .52 },
    { p: 2, x: .3333,  y: 0,    w: .3333, h: .52 },
    { p: 3, x: .6667,  y: 0,    w: .3333, h: .52 },
    { p: 0, x: 0,      y: .525, w: .5,    h: .475 },
    { p: 4, x: .5,     y: .525, w: .5,    h: .475 }
  ],
  diary: [
    { p: 2, x: 0,      y: 0,    w: .5,    h: .55 },
    { p: 1, x: .5,     y: 0,    w: .5,    h: .55 },
    { p: 4, x: 0,      y: .555, w: .3333, h: .445 },
    { p: 0, x: .3333,  y: .555, w: .3333, h: .445 },
    { p: 3, x: .6667,  y: .555, w: .3333, h: .445 }
  ],
  mosaic: [
    { p: 1, x: 0,      y: 0,    w: .3333, h: .33 },
    { p: 2, x: .3333,  y: 0,    w: .3333, h: .33 },
    { p: 3, x: .6667,  y: 0,    w: .3333, h: .33 },
    { p: 4, x: 0,      y: .335, w: .5,    h: .32 },
    { p: 0, x: .5,     y: .335, w: .5,    h: .665 },
    { p: 2, x: 0,      y: .66,  w: .3333, h: .34 },
    { p: 1, x: .3333,  y: .66,  w: .3333, h: .34 }
  ],
  duet: [
    { p: 0, x: 0,     y: 0,    w: .615, h: 1 },
    { p: 1, x: .62,   y: 0,    w: .38,  h: .33 },
    { p: 2, x: .62,   y: .335, w: .38,  h: .325 },
    { p: 3, x: .62,   y: .665, w: .38,  h: .165 },
    { p: 4, x: .62,   y: .835, w: .38,  h: .165 }
  ],
  night: [
    { p: 2, x: 0,     y: 0,    w: .5,   h: .42 },
    { p: 1, x: .5,    y: 0,    w: .5,   h: .42 },
    { p: 4, x: 0,     y: .425, w: .33,  h: .36 },
    { p: 0, x: .335,  y: .425, w: .665, h: .575 },
    { p: 3, x: 0,     y: .79,  w: .33,  h: .21 }
  ],
  full: [
    { p: 0, x: 0,    y: 0,    w: .78, h: 1 },
    { p: 1, x: .78,  y: 0,    w: .22, h: .25 },
    { p: 2, x: .78,  y: .25,  w: .22, h: .25 },
    { p: 3, x: .78,  y: .5,   w: .22, h: .25 },
    { p: 4, x: .78,  y: .75,  w: .22, h: .25 }
  ]
};

const INK = '#0e0b16';
// The duotone plate is rendered at this fraction of the photo size: cheap,
// and it keeps exported PNGs light because the grade wash hides the softness.
const PLATE_Q = 0.45;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const two = n => String(n).padStart(2, '0');

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

// Shrink the font until the text fits, never below minSize. Returns the size used.
function fitText(ctx, text, family, maxW, size, minSize, weight = '') {
  let s = size;
  ctx.font = `${weight}${s}px ${family}`;
  while (s > minSize && ctx.measureText(text).width > maxW) {
    s -= Math.max(1, Math.round(s * 0.03));
    ctx.font = `${weight}${s}px ${family}`;
  }
  return s;
}

// One duotone pass per photograph: the picture is first reduced to a soft
// grey plate, then multiplied by the grade and lifted with a warm screen
// highlight. The grade wash is what makes every panel feel like one cover.
function drawPhoto(ctx, img, x, y, w, h, person, grade, alpha = 1) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih || w <= 0 || h <= 0) return;

  const scale = Math.max(w / iw, h / ih) * (person.scale || 1);
  const dw = iw * scale;
  const dh = ih * scale;
  const fx = clamp(person.cx ?? .5, 0, 1);
  const fy = clamp(person.cy ?? .38, 0, 1);
  const dx = clamp(x + w * fx - dw / 2, x + w - dw, x);
  const dy = clamp(y + h * fy - dh / 2, y + h - dh, y);

  ctx.save();
  ctx.globalAlpha = alpha;

  const plate = document.createElement('canvas');
  plate.width = Math.max(8, Math.round(dw * PLATE_Q));
  plate.height = Math.max(8, Math.round(dh * PLATE_Q));
  const pctx = plate.getContext('2d');
  pctx.imageSmoothingEnabled = true;
  pctx.filter = 'grayscale(1) contrast(1.08) brightness(1.02)';
  pctx.drawImage(img, 0, 0, plate.width, plate.height);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(plate, dx, dy, dw, dh);

  ctx.globalCompositeOperation = 'multiply';
  const duo = ctx.createLinearGradient(x, y + h, x, y);
  duo.addColorStop(0, grade.bottom);
  duo.addColorStop(.5, grade.mid);
  duo.addColorStop(1, grade.top);
  ctx.fillStyle = duo;
  ctx.fillRect(x, y, w, h);

  ctx.globalCompositeOperation = 'screen';
  const lift = ctx.createLinearGradient(x, y + h, x, y);
  lift.addColorStop(0, grade.bottom + '55');
  lift.addColorStop(.62, grade.mid + '3d');
  lift.addColorStop(1, grade.glow + '4a');
  ctx.fillStyle = lift;
  ctx.fillRect(x, y, w, h);

  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}

// A small black role tag, two lines. It is always inset from the panel edges
// by a margin that scales with the cell, so the tag stays fully inside its
// frame however small the cell gets.
function drawRoleTag(ctx, rect, name, role) {
  const { x, y, w, h } = rect;
  if (w < 108 || h < 96) return;

  const inset = Math.max(9, Math.min(w, h) * .052);
  const tagH = clamp(h * .17, 30, 56);
  const nameSize = Math.round(tagH * .33);
  const roleSize = Math.round(tagH * .235);

  ctx.save();
  ctx.font = `700 ${nameSize}px Barlow,Arial`;
  const nameW = ctx.measureText(name).width;
  ctx.font = `600 ${roleSize}px Barlow,Arial`;
  const roleW = ctx.measureText(role).width;
  const tagW = Math.min(w - inset * 2, Math.max(nameW, roleW) + tagH * .58);
  const tx = x + inset;
  const ty = y + h - inset - tagH;

  ctx.fillStyle = 'rgba(11,8,17,.86)';
  roundRect(ctx, tx, ty, tagW, tagH, 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,230,189,.5)';
  ctx.lineWidth = Math.max(1, tagH * .02);
  roundRect(ctx, tx + .5, ty + .5, tagW - 1, tagH - 1, 2);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#fdf4e6';
  ctx.font = `700 ${nameSize}px Barlow,Arial`;
  ctx.fillText(name, tx + tagH * .3, ty + tagH * .46, tagW - tagH * .6);
  ctx.fillStyle = '#f0a7b6';
  ctx.font = `600 ${roleSize}px Barlow,Arial`;
  ctx.fillText(role, tx + tagH * .3, ty + tagH * .83, tagW - tagH * .6);
  ctx.restore();
}

// One photograph cell: the duotone photo, a dark scrim at the foot so the
// tag reads, and the role tag itself.
function drawTile(ctx, rect, person, assets, grade, entry) {
  const { x, y, w, h } = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  ctx.fillStyle = grade.bottom;
  ctx.fillRect(x, y, w, h);

  const img = assets[person.photo];
  if (img && img.complete && img.naturalWidth) {
    drawPhoto(ctx, img, x, y, w, h, person, grade);
  } else {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, grade.top);
    g.addColorStop(.52, grade.mid);
    g.addColorStop(1, grade.bottom);
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
  }

  const scrim = ctx.createLinearGradient(0, y + h * .58, 0, y + h);
  scrim.addColorStop(0, '#150f1c00');
  scrim.addColorStop(1, '#150f1cd0');
  ctx.fillStyle = scrim;
  ctx.fillRect(x, y, w, h);

  drawRoleTag(ctx, rect, (entry.name || person.name).toUpperCase(), (entry.role || person.role).toUpperCase());
  ctx.restore();
}

// Striped retro chrome for the headline: the letterform is rendered once to
// its own canvas, then a vertical gradient and a set of horizontal stripes
// are composited onto the glyphs alone, so nothing outside the letters is
// touched. Returns the metrics the band layout needs to place the next line.
function chromeTitle(ctx, text, cx, baseline, maxW, size) {
  const fs = fitText(ctx, text, 'Anton,Impact,sans-serif', maxW, size, Math.max(24, size * .42));
  ctx.save();
  ctx.font = `${fs}px Anton,Impact,sans-serif`;
  const tw = ctx.measureText(text).width;
  const pad = fs * .34;
  const base = fs * 1.02;

  const oc = document.createElement('canvas');
  oc.width = Math.max(8, Math.ceil(tw + pad * 2));
  oc.height = Math.max(8, Math.ceil(fs * 1.34));
  const octx = oc.getContext('2d');
  octx.font = `${fs}px Anton,Impact,sans-serif`;
  octx.textAlign = 'left';
  octx.textBaseline = 'alphabetic';
  octx.lineJoin = 'round';
  octx.miterLimit = 2;

  octx.lineWidth = fs * .145;
  octx.strokeStyle = '#120f1b';
  octx.strokeText(text, pad, base);

  octx.lineWidth = fs * .072;
  octx.strokeStyle = '#5b2b3f';
  octx.strokeText(text, pad, base);

  const g = octx.createLinearGradient(0, base - fs * .95, 0, base + fs * .12);
  g.addColorStop(0, '#fffbea');
  g.addColorStop(.16, '#ffeec2');
  g.addColorStop(.32, '#fffdf6');
  g.addColorStop(.44, '#c8d3df');
  g.addColorStop(.55, '#8e9bad');
  g.addColorStop(.67, '#fff4d2');
  g.addColorStop(.83, '#dde5e9');
  g.addColorStop(1, '#fff6dc');
  octx.fillStyle = g;
  octx.fillText(text, pad, base);

  octx.globalCompositeOperation = 'source-atop';
  octx.fillStyle = 'rgba(24,16,30,.20)';
  for (let sy = base - fs * .95; sy < base + fs * .14; sy += fs * .132) {
    octx.fillRect(0, sy, oc.width, Math.max(1, fs * .045));
  }
  octx.globalCompositeOperation = 'source-over';

  ctx.shadowColor = '#0b0810';
  ctx.shadowBlur = fs * .17;
  ctx.shadowOffsetY = fs * .055;
  ctx.drawImage(oc, Math.round(cx - oc.width / 2), Math.round(baseline - base));
  ctx.restore();
  return { size: fs, ascent: fs * .76, descent: fs * .22, width: tw };
}

// A star drawn as a path, never set as a glyph: a headless browser with a
// thin font set has no U+2605 and would leave the rating row blank.
function starPath(ctx, cx, cy, r, points = 5, inner = .44) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : r * inner;
    const a = -Math.PI / 2 + (i / (points * 2)) * Math.PI * 2;
    const px = cx + Math.cos(a) * rad;
    const py = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawStars(ctx, cx, y, r, count = 5) {
  const step = r * 2.62;
  ctx.save();
  for (let i = 0; i < count; i++) {
    const sx = cx + (i - (count - 1) / 2) * step;
    starPath(ctx, sx, y, r);
    ctx.fillStyle = '#ffd58c';
    ctx.fill();
    ctx.strokeStyle = '#8d5a3a';
    ctx.lineWidth = Math.max(1, r * .09);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRibbon(ctx, cx, cy, w, h, label) {
  const half = w / 2;
  const tip = h * .55;
  ctx.save();
  ctx.fillStyle = '#f0b967';
  ctx.beginPath();
  ctx.moveTo(cx - half, cy - h / 2);
  ctx.lineTo(cx + half - tip, cy - h / 2);
  ctx.lineTo(cx + half, cy);
  ctx.lineTo(cx + half - tip, cy + h / 2);
  ctx.lineTo(cx - half, cy + h / 2);
  ctx.lineTo(cx - half - tip, cy);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#2a2029';
  ctx.font = `700 ${Math.max(7, Math.round(h * .28))}px Barlow,Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, cy + 1, w - h);
  ctx.restore();
}

function drawVolPill(ctx, x, y, h, vol, edition) {
  const w = h * 2.55;
  ctx.save();
  ctx.fillStyle = 'rgba(12,9,18,.72)';
  roundRect(ctx, x, y, w, h, h * .5);
  ctx.fill();
  ctx.strokeStyle = '#e8bd76';
  ctx.lineWidth = Math.max(1, h * .05);
  roundRect(ctx, x + .5, y + .5, w - 1, h - 1, h * .5);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffeccb';
  ctx.font = `700 ${Math.round(h * .42)}px Barlow,Arial`;
  ctx.fillText(vol, x + w * .5, y + h * .38);
  ctx.fillStyle = '#c8a97e';
  ctx.font = `600 ${Math.round(h * .21)}px Barlow,Arial`;
  ctx.fillText(edition, x + w * .5, y + h * .72);
  ctx.restore();
}

// Gold starburst seal: a spiked badge with the grade's own accent inside.
function drawSeal(ctx, cx, cy, r, grade) {
  const spikes = 24;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-.16);

  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const rad = i % 2 === 0 ? r : r * .84;
    const a = (i / (spikes * 2)) * Math.PI * 2;
    const px = Math.cos(a) * rad;
    const py = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = '#f3c875';
  ctx.fill();
  ctx.strokeStyle = '#fff3cf';
  ctx.lineWidth = Math.max(1, r * .035);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, r * .72, 0, Math.PI * 2);
  ctx.fillStyle = '#9c3d57';
  ctx.fill();
  ctx.strokeStyle = '#f7d491';
  ctx.lineWidth = Math.max(1, r * .03);
  ctx.stroke();

  ctx.fillStyle = '#fff0c7';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${Math.round(r * .2)}px Barlow,Arial`;
  ctx.fillText('VICE CITY', 0, -r * .3);
  ctx.save();
  ctx.translate(0, -r * .02);
  ctx.beginPath();
  const sp = r * .3;
  const sp2 = r * .1;
  ctx.moveTo(0, -sp);
  ctx.quadraticCurveTo(sp2, -sp2, sp, 0);
  ctx.quadraticCurveTo(sp2, sp2, 0, sp);
  ctx.quadraticCurveTo(-sp2, sp2, -sp, 0);
  ctx.quadraticCurveTo(-sp2, -sp2, 0, -sp);
  ctx.closePath();
  ctx.fillStyle = '#ffe9bd';
  ctx.fill();
  ctx.restore();
  ctx.font = `700 ${Math.round(r * .17)}px Barlow,Arial`;
  ctx.fillText('AFTER DARK', 0, r * .3);
  ctx.fillStyle = grade.glow;
  ctx.globalAlpha = .9;
  ctx.fillRect(-r * .3, r * .46, r * .6, Math.max(1, r * .035));
  ctx.restore();
}

function drawBarcode(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = '#f5e8d6';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#171520';
  const widths = [1, 2, 1, 1, 3, 1, 2, 1, 1, 2, 3, 1, 1, 2, 1, 3, 2, 1, 1, 1, 2, 3, 1, 2, 1, 1, 2, 1, 3, 1];
  const total = widths.reduce((a, b) => a + b, 0);
  const unit = (w - 8) / total;
  let pos = x + 4;
  for (let i = 0; i < widths.length; i++) {
    const bw = Math.max(1, widths[i] * unit * .55);
    if (i % 2 === 0) ctx.fillRect(pos, y + 3, bw, h - 6);
    pos += bw + unit * .45;
    if (pos > x + w - 4) break;
  }
  ctx.restore();
}

// The cast strip under the script line is typographic, not photographic:
// five numbered columns with a hairline between them, so the bottom of the
// cover reads as a clean credit strip instead of a row of ragged thumbnails.
function drawCastStrip(ctx, x, y, w, h, cast, color) {
  const cols = cast.length;
  const colW = w / cols;
  const numSize = Math.round(h * .2);
  const nameSize = Math.round(h * .3);
  const roleSize = Math.round(h * .21);

  ctx.save();
  ctx.textBaseline = 'alphabetic';
  for (let i = 0; i < cols; i++) {
    const cx = x + colW * i;
    if (i > 0) {
      ctx.fillStyle = 'rgba(255,230,189,.16)';
      ctx.fillRect(cx - .5, y, 1, h);
    }
    ctx.textAlign = 'left';
    ctx.fillStyle = '#e8bd76';
    ctx.font = `700 ${numSize}px Barlow,Arial`;
    ctx.fillText(two(i + 1), cx + colW * .1, y + numSize);

    ctx.fillStyle = '#fdf2e2';
    ctx.font = `700 ${nameSize}px Barlow,Arial`;
    ctx.fillText(cast[i].name, cx + colW * .1, y + h * .52, colW * .86);

    ctx.fillStyle = color;
    ctx.globalAlpha = .85;
    ctx.font = `600 ${roleSize}px Barlow,Arial`;
    ctx.fillText(cast[i].role, cx + colW * .1, y + h * .78, colW * .86);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function bandBackground(ctx, x, y, w, h, grade, vertical) {
  const bg = vertical
    ? ctx.createLinearGradient(0, y, 0, y + h)
    : ctx.createLinearGradient(x, 0, x + w, 0);
  bg.addColorStop(0, '#191324');
  bg.addColorStop(.55, '#141020');
  bg.addColorStop(1, '#0e0b16');
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, w, h);

  const sheen = ctx.createRadialGradient(x + w * .2, y, 0, x + w * .2, y, Math.max(w, h) * .8);
  sheen.addColorStop(0, grade.mid + '26');
  sheen.addColorStop(1, grade.mid + '00');
  ctx.fillStyle = sheen;
  ctx.fillRect(x, y, w, h);
}

// The band is laid out as a measured stack: every element reports its height
// and the type scale shrinks until the whole stack fits the band with air to
// spare. Nothing can collide with the headline or spill past the frame.
function bandFurniture(ctx, P, state, grade, cast) {
  const { x: px, y: py, w: pw, h: ph } = P;
  const margin = pw * .062;
  const inner = pw - margin * 2;
  const title = (state.title || 'GOLDEN GETAWAY').toUpperCase().trim() || 'GOLDEN GETAWAY';
  const subtitle = state.subtitle || 'every sunset has a story';

  // Measure once at a nominal scale to find the f that fits the band.
  let f = Math.min(pw / 1080, ph / 540);
  const measure = () => {
    const titleSize = Math.min(fitText(ctx, title, 'Anton,Impact,sans-serif', inner * .96, 152 * f, 24), 152 * f);
    return (22 + 40 + 62 + 18 + titleSize * 1.02 + 46 * f + 16 + 20 + 3 * 13 + 14 + 8 * 9) * f + ph * .105;
  };
  let guard = 0;
  while (measure() > ph * .95 && f > ph * .0006 && guard++ < 200) f *= .985;

  const titleSize = Math.min(fitText(ctx, title, 'Anton,Impact,sans-serif', inner * .96, 152 * f, 24), 152 * f);
  const gap = 11 * f;

  let cursor = py + ph * .052;

  ctx.save();
  bandBackground(ctx, px, py, pw, ph, grade, true);
  ctx.fillStyle = '#f3c875';
  ctx.fillRect(px, py, pw, Math.max(2, 3 * f));

  // 1. press quote, then the five stars with clear space below them
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#cbb9b3';
  ctx.font = `italic ${Math.round(16 * f)}px Barlow,Arial`;
  ctx.fillText('\u201cTHE CITY NEVER LOOKED THIS GOOD AFTER DARK.\u201d', px + pw / 2, cursor + 14 * f, inner * .94);
  cursor += 20 * f;

  const starR = 16 * f;
  drawStars(ctx, px + pw / 2, cursor + starR, starR);
  cursor += starR * 2 + gap;

  // 2. volume pill, tagline ribbon, gold starburst seal: one row, all inside
  const rowH = 58 * f;
  const pillH = 26 * f;
  drawVolPill(ctx, px + margin, cursor + (rowH - pillH) / 2, pillH, 'VOL. 06', 'NIGHT EDITION');
  const sealR = 28 * f;
  drawSeal(ctx, px + pw - margin - sealR, cursor + rowH / 2, sealR, grade);
  const ribbonX = px + margin + pillH * 2.55 + 10 * f;
  const ribbonW = (px + pw - margin - sealR * 2 - 10 * f) - ribbonX;
  drawRibbon(ctx, ribbonX + ribbonW / 2, cursor + rowH / 2, ribbonW, Math.max(20, 32 * f), 'FIVE STORIES \u00b7 ONE CITY');
  cursor += rowH + gap;

  // 3. eyebrow line
  ctx.textAlign = 'center';
  ctx.fillStyle = '#e7cdb4';
  ctx.font = `700 ${Math.round(12 * f)}px Barlow,Arial`;
  ctx.fillText('A N   O R I G I N A L   V I C E - C I T Y   N I G H T   S T O R Y', px + pw / 2, cursor + 10 * f, inner * .84);
  cursor += 16 * f + gap * .5;

  // 4. the striped chrome headline
  const titleMetrics = chromeTitle(ctx, title, px + pw / 2, cursor + titleSize * .78, inner * .96, titleSize);
  cursor += titleMetrics.ascent + titleMetrics.descent + gap * .5;

  // 5. pink script sub-line
  ctx.save();
  ctx.shadowColor = '#1a0f1c';
  ctx.shadowBlur = 8 * f;
  ctx.fillStyle = '#f68da8';
  ctx.font = `${Math.round(42 * f)}px Pacifico,cursive`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(subtitle, px + pw / 2, cursor + 32 * f, inner * .9);
  ctx.restore();
  cursor += 42 * f + gap;

  // 6. typographic cast strip: numbered columns, hairlines, no thumbnails
  ctx.textAlign = 'left';
  ctx.fillStyle = '#a99ca6';
  ctx.font = `${Math.round(10 * f)}px Barlow,Arial`;
  ctx.fillText('C A S T   \u00b7   I N   O R D E R   O F   A P P E A R A N C E', px + margin, cursor + 8 * f);
  cursor += 14 * f;
  const stripH = Math.min(ph * .105, 74 * f);
  drawCastStrip(ctx, px + margin, cursor, inner, stripH, cast, grade.glow);
  cursor += stripH + gap;

  // 7. billing block on the left, barcode on the right, both inside the frame
  const bcW = Math.min(132 * f, pw * .15);
  const bcH = Math.max(24, 40 * f);
  const bcX = px + pw - margin - bcW;
  drawBarcode(ctx, bcX, cursor, bcW, bcH);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#d6c4b4';
  ctx.font = `${Math.round(8 * f)}px Barlow,Arial`;
  ctx.fillText('7 32109 44106 8', bcX + bcW / 2, cursor + bcH + 9 * f);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#c2b2ba';
  ctx.font = `600 ${Math.round(10 * f)}px Barlow,Arial`;
  ctx.fillText('AFTERGLOW STUDIO presents', px + margin, cursor + 10 * f);
  ctx.fillStyle = '#8f838f';
  ctx.font = `${Math.round(9 * f)}px Barlow,Arial`;
  ctx.fillText('AN ORIGINAL COVER IN FIVE FRAMES', px + margin, cursor + 10 * f + 13 * f);
  ctx.fillText('STORY \u00b7 ART \u00b7 LETTERING BY THE STUDIO', px + margin, cursor + 10 * f + 26 * f);

  // 8. the standing footer line
  ctx.textAlign = 'center';
  ctx.fillStyle = '#7d7280';
  ctx.font = `${Math.round(8 * f)}px Barlow,Arial`;
  ctx.fillText('AFTERGLOW STUDIO  \u00b7  ORIGINAL FAN-STYLE COVER ART  \u00b7  NO AFFILIATION WITH ANY GAME OR STUDIO', px + pw / 2, py + ph - 10 * f, inner);
  ctx.restore();
}

// Landscape: the same stack stood on its side, in a narrower column. It gets
// its own scale search so a 1920 x 1080 export reads as a spread, not a
// squashed page.
function columnFurniture(ctx, P, state, grade, cast) {
  const { x: px, y: py, w: pw, h: ph } = P;
  const margin = pw * .085;
  const inner = pw - margin * 2;
  const title = (state.title || 'GOLDEN GETAWAY').toUpperCase().trim() || 'GOLDEN GETAWAY';
  const subtitle = state.subtitle || 'every sunset has a story';

  let f = Math.min(pw / 800, ph / 1080);
  const measure = () => {
    const titleSize = Math.min(fitText(ctx, title, 'Anton,Impact,sans-serif', inner * .99, 160 * f, 24), 160 * f);
    return (46 + 40 + 60 + 18 + titleSize * 1.02 + 42 * f + 18 + 20 + 3 * 13 + 14 + 8 * 9) * f + ph * .10;
  };
  let guard = 0;
  while (measure() > ph * .95 && f > ph * .0006 && guard++ < 200) f *= .985;

  const titleSize = Math.min(fitText(ctx, title, 'Anton,Impact,sans-serif', inner * .99, 160 * f, 24), 160 * f);
  const gap = 10 * f;
  let cursor = py + ph * .045;

  ctx.save();
  bandBackground(ctx, px, py, pw, ph, grade, false);
  ctx.fillStyle = '#f3c875';
  ctx.fillRect(px, py, Math.max(2, 3 * f), ph);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#cbb9b3';
  ctx.font = `italic ${Math.round(17 * f)}px Barlow,Arial`;
  ctx.fillText('\u201cTHE CITY NEVER LOOKED', px + pw / 2, cursor + 15 * f, inner);
  ctx.fillText('THIS GOOD AFTER DARK.\u201d', px + pw / 2, cursor + 15 * f + 22 * f, inner);
  cursor += 46 * f;

  const starR = 15 * f;
  drawStars(ctx, px + pw / 2, cursor + starR, starR);
  cursor += starR * 2 + gap;

  const rowH = 56 * f;
  const pillH = 24 * f;
  const sealR = 26 * f;
  drawVolPill(ctx, px + margin, cursor + (rowH - pillH) / 2, pillH, 'VOL. 06', 'NIGHT');
  drawSeal(ctx, px + pw - margin - sealR, cursor + rowH / 2, sealR, grade);
  drawRibbon(ctx, px + pw / 2, cursor + rowH / 2, Math.min(inner - pillH * 2.55 - sealR * 2 - 16 * f, 520 * f), Math.max(20, 30 * f), 'FIVE STORIES');
  cursor += rowH + gap;

  ctx.textAlign = 'center';
  ctx.fillStyle = '#e7cdb4';
  ctx.font = `700 ${Math.round(11 * f)}px Barlow,Arial`;
  ctx.fillText('A N   O R I G I N A L   N I G H T   S T O R Y', px + pw / 2, cursor + 9 * f, inner * .92);
  cursor += 18 * f + gap * .5;

  const titleMetrics = chromeTitle(ctx, title, px + pw / 2, cursor + titleSize * .78, inner * .99, titleSize);
  cursor += titleMetrics.ascent + titleMetrics.descent + gap * .5;

  ctx.save();
  ctx.shadowColor = '#1a0f1c';
  ctx.shadowBlur = 8 * f;
  ctx.fillStyle = '#f68da8';
  ctx.font = `${Math.round(38 * f)}px Pacifico,cursive`;
  ctx.textAlign = 'center';
  ctx.fillText(subtitle, px + pw / 2, cursor + 29 * f, inner * .94);
  ctx.restore();
  cursor += 38 * f + gap;

  ctx.textAlign = 'left';
  ctx.fillStyle = '#a99ca6';
  ctx.font = `${Math.round(10 * f)}px Barlow,Arial`;
  ctx.fillText('C A S T   \u00b7   I N   O R D E R', px + margin, cursor + 8 * f);
  cursor += 14 * f;
  const stripH = Math.min(ph * .10, 70 * f);
  drawCastStrip(ctx, px + margin, cursor, inner, stripH, cast, grade.glow);
  cursor += stripH + gap;

  const bcW = Math.min(120 * f, pw * .3);
  const bcH = Math.max(24, 38 * f);
  drawBarcode(ctx, px + margin, cursor, bcW, bcH);
  ctx.fillStyle = '#d6c4b4';
  ctx.font = `${Math.round(8 * f)}px Barlow,Arial`;
  ctx.fillText('7 32109 44106 8', px + margin, cursor + bcH + 9 * f);

  ctx.fillStyle = '#c2b2ba';
  ctx.font = `600 ${Math.round(10 * f)}px Barlow,Arial`;
  ctx.fillText('AFTERGLOW STUDIO presents', px + margin + bcW + 12 * f, cursor + 10 * f);
  ctx.fillStyle = '#8f838f';
  ctx.font = `${Math.round(9 * f)}px Barlow,Arial`;
  ctx.fillText('AN ORIGINAL COVER', px + margin + bcW + 12 * f, cursor + 23 * f);
  ctx.fillText('IN FIVE FRAMES', px + margin + bcW + 12 * f, cursor + 36 * f);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#7d7280';
  ctx.font = `${Math.round(8 * f)}px Barlow,Arial`;
  ctx.fillText('ORIGINAL FAN-STYLE COVER ART \u00b7 NO AFFILIATION', px + pw / 2, py + ph - 9 * f, inner);
  ctx.restore();
}

// A faint deterministic grain: a fixed grid of dots, so the cover never
// looks flat and no two renders can drift.
function drawGrain(ctx, w, h) {
  ctx.save();
  ctx.globalAlpha = .055;
  ctx.fillStyle = '#ffffff';
  for (let y = 9; y < h; y += 31) {
    for (let x = ((y / 31 | 0) % 2) * 15 + 7; x < w; x += 31) {
      ctx.fillRect(x, y, 1, 1);
      if ((x + y) % 9 === 0) ctx.fillRect(x + 9, y + 11, 1, 1);
    }
  }
  ctx.restore();
}

export function layoutMode(w, h) {
  const ratio = w / h;
  if (ratio > 1.3) return 'wide';
  if (ratio > .86) return 'square';
  return 'tall';
}

export function zoneRect(w, h, mode = layoutMode(w, h)) {
  if (mode === 'wide') return { x: 0, y: 0, w: w * .578, h };
  return { x: 0, y: 0, w, h: h * (mode === 'square' ? .578 : .612) };
}

export function cellsFor(layoutId, mode) {
  const table = mode === 'wide' ? WIDE_CELLS : CELLS;
  return table[layoutId] || table.hero;
}

export function hitTestCover(state, layoutId, w, h, px, py) {
  const mode = layoutMode(w, h);
  const zone = zoneRect(w, h, mode);
  const nx = (px - zone.x) / zone.w;
  const ny = (py - zone.y) / zone.h;
  if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return -1;
  for (const cell of cellsFor(layoutId, mode)) {
    if (nx >= cell.x && nx <= cell.x + cell.w && ny >= cell.y && ny <= cell.y + cell.h) return cell.p;
  }
  return -1;
}

export function renderCover(ctx, state, assets, layoutId = 'hero', gradeId = 'golden', size = { w: 1080, h: 1350 }) {
  const w = Math.round(size.w || 1080);
  const h = Math.round(size.h || 1350);
  const mode = layoutMode(w, h);
  const grade = GRADES.find(g => g.id === gradeId) || GRADES[0];
  const people = PEOPLE;

  const crops = Array.isArray(state.crop) ? state.crop : [];
  const withCrop = people.map((p, i) => ({ ...p, ...(crops[i] || {}) }));
  const cast = state.cast && state.cast.length === people.length
    ? state.cast
    : people.map(p => ({ name: p.name, role: p.role }));

  const zone = zoneRect(w, h, mode);
  const cells = cellsFor(layoutId, mode);
  const gap = Math.max(4, Math.min(w, h) * .008);

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, w, h);

  // Photograph zone
  ctx.save();
  ctx.beginPath();
  ctx.rect(zone.x, zone.y, zone.w, zone.h);
  ctx.clip();
  ctx.fillStyle = grade.bottom;
  ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
  for (const cell of cells) {
    const rect = {
      x: zone.x + cell.x * zone.w + gap / 2,
      y: zone.y + cell.y * zone.h + gap / 2,
      w: cell.w * zone.w - gap,
      h: cell.h * zone.h - gap
    };
    if (rect.w <= 2 || rect.h <= 2) continue;
    drawTile(ctx, rect, withCrop[cell.p], assets, grade, cast[cell.p] || {});
  }
  ctx.restore();

  // Panel keylines
  ctx.save();
  ctx.strokeStyle = '#ffe6bd';
  ctx.lineWidth = Math.max(2, Math.min(w, h) * .0022);
  for (const cell of cells) {
    ctx.strokeRect(
      zone.x + cell.x * zone.w + gap / 2,
      zone.y + cell.y * zone.h + gap / 2,
      cell.w * zone.w - gap,
      cell.h * zone.h - gap
    );
  }
  ctx.restore();

  // Type band: below the photographs when tall, beside them when wide
  if (mode === 'wide') {
    columnFurniture(ctx, { x: zone.w, y: 0, w: w - zone.w, h }, state, grade, cast);
  } else {
    bandFurniture(ctx, { x: 0, y: zone.h, w, h: h - zone.h }, state, grade, cast);
  }

  // Outer keyline, inset so it never crosses type or faces
  const inset = Math.max(8, Math.min(w, h) * .012);
  ctx.save();
  ctx.strokeStyle = '#ffdfae55';
  ctx.lineWidth = Math.max(1, Math.min(w, h) * .0018);
  ctx.strokeRect(inset, inset, w - inset * 2, h - inset * 2);
  ctx.restore();

  drawGrain(ctx, w, h);
  ctx.restore();
  return ctx.canvas;
}

export function getPeople() { return PEOPLE; }
export function getLayouts() { return LAYOUTS; }
export function getGrades() { return GRADES; }
export function getPhotoPath(person) { return `./samples/${person.photo}`; }
