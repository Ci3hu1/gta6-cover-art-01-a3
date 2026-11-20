// Afterglow compositor — deterministic canvas art. No network, no dependencies,
// no randomness: every render of the same state produces the same pixels.
//
// Composition rule that drives the whole design: photographs live in a photo zone
// that ends above the type band. The headline can never touch a face, at any
// aspect ratio, because the band is a separate region of the canvas.

const PEOPLE = [
  { id:'mara', name:'MARA SOL',   role:'THE GETAWAY DRIVER', photo:'boulevard.jpg', color:'#e98b75', cx:.50, cy:.34, scale:1 },
  { id:'nico', name:'NICO VEGA',  role:'THE FIXER',          photo:'rooftop.jpg',   color:'#efbd72', cx:.50, cy:.32, scale:1 },
  { id:'luz',  name:'LUZ & JUNE', role:'THE NIGHT OWLS',     photo:'diner.jpg',     color:'#df81a1', cx:.50, cy:.40, scale:1 },
  { id:'tito', name:'TITO REYES', role:'THE OLD SALT',       photo:'pier.jpg',      color:'#74b8aa', cx:.50, cy:.34, scale:1 },
  { id:'jade', name:'JADE KNOX',  role:'THE WILDCARD',       photo:'garage.jpg',    color:'#df9b70', cx:.50, cy:.32, scale:1 }
];

const LAYOUTS = [
  { id:'pulse',  name:'PULSE' },
  { id:'hero',   name:'HERO + 3' },
  { id:'strip',  name:'STRIP' },
  { id:'diary',  name:'DIARY' },
  { id:'mosaic', name:'MOSAIC' },
  { id:'duet',   name:'DUET' },
  { id:'night',  name:'NIGHT' },
  { id:'full',   name:'FULL BLEED' }
];

const GRADES = [
  { id:'golden',   name:'GOLDEN HOUR', top:'#ffc17e', mid:'#f08478', bottom:'#7d2b57', glow:'#ffc069' },
  { id:'coral',    name:'CORAL CLUB',  top:'#ff997c', mid:'#e45e80', bottom:'#4b2358', glow:'#ff7e93' },
  { id:'orchid',   name:'ORCHID SKY',  top:'#f7a8ce', mid:'#a96bb3', bottom:'#312a61', glow:'#f2a4db' },
  { id:'lagoon',   name:'LAGOON',      top:'#8ed2c1', mid:'#3b91a0', bottom:'#203860', glow:'#9fe0d0' },
  { id:'after',    name:'AFTER HOURS', top:'#fb8e63', mid:'#854c86', bottom:'#16294f', glow:'#ffb875' },
  { id:'citrus',   name:'CITRUS POP',  top:'#ffd278', mid:'#f07858', bottom:'#553055', glow:'#ffe190' },
  { id:'rose',     name:'ROSE NOIR',   top:'#efa0a3', mid:'#c65e79', bottom:'#372447', glow:'#ffc0a4' },
  { id:'electric', name:'ELECTRIC',    top:'#8bd1cc', mid:'#8c78ba', bottom:'#412b64', glow:'#ff9cbd' }
];

// Cell geometry, normalised inside the photo zone. Every layout shows all five
// cast members; the sixth cell is a deliberate repeat that anchors the grid.
const CELLS = {
  pulse:  [ {p:0,x:0,y:0,w:.5,h:.55}, {p:1,x:.5,y:0,w:.25,h:.55}, {p:2,x:.75,y:0,w:.25,h:.55},
            {p:3,x:0,y:.555,w:.3333,h:.445}, {p:4,x:.3333,y:.555,w:.3333,h:.445}, {p:1,x:.6667,y:.555,w:.3333,h:.445} ],
  hero:   [ {p:0,x:0,y:0,w:.62,h:.665}, {p:1,x:.625,y:0,w:.375,h:.33}, {p:2,x:.625,y:.335,w:.375,h:.33},
            {p:3,x:0,y:.67,w:.31,h:.33}, {p:4,x:.315,y:.67,w:.305,h:.33}, {p:2,x:.625,y:.67,w:.375,h:.33} ],
  strip:  [ {p:1,x:0,y:0,w:.3333,h:.52}, {p:2,x:.3333,y:0,w:.3333,h:.52}, {p:3,x:.6667,y:0,w:.3333,h:.52},
            {p:0,x:0,y:.525,w:.5,h:.475}, {p:4,x:.5,y:.525,w:.5,h:.475} ],
  diary:  [ {p:2,x:0,y:0,w:.5,h:.55}, {p:1,x:.5,y:0,w:.5,h:.55},
            {p:4,x:0,y:.555,w:.3333,h:.445}, {p:0,x:.3333,y:.555,w:.3333,h:.445}, {p:3,x:.6667,y:.555,w:.3333,h:.445} ],
  mosaic: [ {p:1,x:0,y:0,w:.3333,h:.33}, {p:2,x:.3333,y:0,w:.3333,h:.33}, {p:3,x:.6667,y:0,w:.3333,h:.33},
            {p:4,x:0,y:.335,w:.5,h:.32}, {p:0,x:.5,y:.335,w:.5,h:.665},
            {p:2,x:0,y:.66,w:.3333,h:.34}, {p:1,x:.3333,y:.66,w:.3333,h:.34} ],
  duet:   [ {p:0,x:0,y:0,w:.615,h:1}, {p:1,x:.62,y:0,w:.38,h:.33}, {p:2,x:.62,y:.335,w:.38,h:.325},
            {p:3,x:.62,y:.665,w:.38,h:.165}, {p:4,x:.62,y:.835,w:.38,h:.165} ],
  night:  [ {p:2,x:0,y:0,w:.5,h:.42}, {p:1,x:.5,y:0,w:.5,h:.42},
            {p:4,x:0,y:.425,w:.33,h:.36}, {p:0,x:.335,y:.425,w:.665,h:.575}, {p:3,x:0,y:.79,w:.33,h:.21} ],
  full:   [ {p:0,x:0,y:0,w:1,h:1} ]
};

// Wide-format mosaic: a lead portrait column plus a stacked right rail.
const WIDE_CELLS = [
  {p:0,x:0,y:0,w:.615,h:.665}, {p:1,x:.62,y:0,w:.38,h:.33}, {p:2,x:.62,y:.335,w:.38,h:.325},
  {p:3,x:0,y:.67,w:.31,h:.33}, {p:4,x:.315,y:.67,w:.30,h:.33}, {p:2,x:.62,y:.665,w:.38,h:.335}
];

const SOFT_Q = 0.45;
const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const pad2 = n => String(n).padStart(2,'0');

function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') ctx.roundRect(x,y,w,h,r);
  else ctx.rect(x,y,w,h);
}

function fitText(ctx,text,family,maxW,size,minSize,weight=''){
  let s = size;
  ctx.font = `${weight}${s}px ${family}`;
  while (s > minSize && ctx.measureText(text).width > maxW) {
    s -= Math.max(1, Math.round(s * 0.03));
    ctx.font = `${weight}${s}px ${family}`;
  }
  return s;
}

function drawPhoto(ctx,img,x,y,w,h,person,grade,alpha=1){
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih || !w || !h) return;
  const scale = Math.max(w/iw, h/ih) * (person.scale || 1);
  const dw = iw*scale, dh = ih*scale;
  const fx = clamp(person.cx ?? .5, 0, 1);
  const fy = clamp(person.cy ?? .38, 0, 1);
  const dx = clamp(x + w*fx - dw/2, x + w - dw, x);
  const dy = clamp(y + h*fy - dh/2, y + h - dh, y);
  ctx.save();
  ctx.globalAlpha = alpha;

  // Photographs are printed, not pasted. A soft downscaled plate plus one duotone
  // pass gives every frame the same grade, and keeps exported PNGs light.
  const soft = document.createElement('canvas');
  soft.width = Math.max(8, Math.round(dw * SOFT_Q));
  soft.height = Math.max(8, Math.round(dh * SOFT_Q));
  const sctx = soft.getContext('2d');
  sctx.imageSmoothingEnabled = true;
  sctx.filter = 'grayscale(1) contrast(1.08) brightness(1.02)';
  sctx.drawImage(img, 0, 0, soft.width, soft.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(soft, dx, dy, dw, dh);

  // duotone: shadows take the grade bottom, highlights the grade top
  ctx.globalCompositeOperation = 'multiply';
  const duo = ctx.createLinearGradient(x, y + h, x, y);
  duo.addColorStop(0, grade.bottom);
  duo.addColorStop(.5, grade.mid);
  duo.addColorStop(1, grade.top);
  ctx.fillStyle = duo;
  ctx.fillRect(x, y, w, h);

  // screen lift restores the light multiply ate and warms the upper corner
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

function drawTile(ctx,rect,person,assets,grade,entry,tag){
  const {x,y,w,h} = rect;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x,y,w,h);
  ctx.clip();
  ctx.fillStyle = grade.bottom;
  ctx.fillRect(x,y,w,h);
  const img = assets[person.photo];
  if (img && img.complete && img.naturalWidth) drawPhoto(ctx,img,x,y,w,h,person,grade);
  else {
    const g = ctx.createLinearGradient(x,y,x,y+h);
    g.addColorStop(0, grade.top);
    g.addColorStop(.52, grade.mid);
    g.addColorStop(1, grade.bottom);
    ctx.fillStyle = g;
    ctx.fillRect(x,y,w,h);
  }
  const scrim = ctx.createLinearGradient(0, y + h*.55, 0, y + h);
  scrim.addColorStop(0, '#150f1c00');
  scrim.addColorStop(1, '#150f1ccc');
  ctx.fillStyle = scrim;
  ctx.fillRect(x,y,w,h);

  if (tag && w > 168 && h > 140) {
    const name = (entry.name || person.name).toUpperCase();
    const role = (entry.role || person.role).toUpperCase();
    const inset = Math.max(12, Math.min(w,h) * .055);
    const tagH = clamp(h * .105, 34, 54);
    const nameSize = Math.round(tagH * .34);
    const roleSize = Math.round(tagH * .235);
    ctx.font = `700 ${nameSize}px Barlow,Arial`;
    const nameW = ctx.measureText(name).width;
    ctx.font = `700 ${roleSize}px Barlow,Arial`;
    const roleW = ctx.measureText(role).width;
    // Inset from every edge, so a role tag can never be clipped by the frame.
    const tagW = Math.min(w - inset*2, Math.max(nameW, roleW) + tagH * .62);
    const tx = x + inset;
    const ty = y + h - inset - tagH;
    ctx.fillStyle = person.color;
    roundRect(ctx,tx,ty,tagW,tagH,2);
    ctx.fill();
    ctx.fillStyle = '#17141a';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `700 ${nameSize}px Barlow,Arial`;
    ctx.fillText(name, tx + tagH*.3, ty + tagH*.44, tagW - tagH*.6);
    ctx.globalAlpha = .78;
    ctx.font = `700 ${roleSize}px Barlow,Arial`;
    ctx.fillText(role, tx + tagH*.3, ty + tagH*.82, tagW - tagH*.6);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function drawKeyline(ctx,x,y,w,h,lw=2,color='#ffe6bd'){
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.strokeRect(x + lw/2, y + lw/2, w - lw, h - lw);
  ctx.restore();
}

function chromeTitle(ctx,text,cx,baseline,maxW,size){
  const fs = fitText(ctx,text,'Anton,Impact,sans-serif',maxW,size,Math.max(26,size*.42));
  ctx.save();
  ctx.font = `${fs}px Anton,Impact,sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  const tw = ctx.measureText(text).width;
  const left = cx - tw/2;

  ctx.save();
  ctx.shadowColor = '#0d0a14';
  ctx.shadowBlur = fs * .16;
  ctx.shadowOffsetY = fs * .055;
  ctx.lineWidth = fs * .135;
  ctx.strokeStyle = '#120f1b';
  ctx.strokeText(text,cx,baseline);
  ctx.restore();

  ctx.lineWidth = fs * .07;
  ctx.strokeStyle = '#4a263b';
  ctx.strokeText(text,cx,baseline);

  const g = ctx.createLinearGradient(0, baseline - fs*.92, 0, baseline + fs*.12);
  g.addColorStop(0,'#fffaea');
  g.addColorStop(.18,'#ffeec2');
  g.addColorStop(.34,'#fffdf6');
  g.addColorStop(.46,'#c6d1de');
  g.addColorStop(.56,'#8f9cae');
  g.addColorStop(.68,'#fff4d2');
  g.addColorStop(.82,'#dfe6ea');
  g.addColorStop(1,'#fff6dc');
  ctx.fillStyle = g;
  ctx.fillText(text,cx,baseline);

  ctx.save();
  ctx.beginPath();
  ctx.rect(left - 2, baseline - fs*.86, tw + 4, fs*.40);
  ctx.clip();
  ctx.globalAlpha = .38;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text,cx,baseline);
  ctx.restore();

  ctx.restore();
  return fs;
}

function drawStars(ctx,cx,y,size,count=5){
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${size}px Arial`;
  ctx.fillStyle = '#ffd58c';
  const step = size * 1.22;
  for (let i = 0; i < count; i++) ctx.fillText('\u2605', cx + (i - (count-1)/2) * step, y);
  ctx.restore();
}

function drawRibbon(ctx,cx,cy,w,h,label){
  const half = w/2, tip = h * .55;
  ctx.save();
  ctx.fillStyle = '#f0b967';
  ctx.beginPath();
  ctx.moveTo(cx-half, cy-h/2);
  ctx.lineTo(cx+half-tip, cy-h/2);
  ctx.lineTo(cx+half, cy);
  ctx.lineTo(cx+half-tip, cy+h/2);
  ctx.lineTo(cx-half, cy+h/2);
  ctx.lineTo(cx-half-tip, cy);
  ctx.closePath();
  ctx.fill();
  const fs = Math.max(7, Math.round(h * .28));
  ctx.fillStyle = '#2a2029';
  ctx.font = `700 ${fs}px Barlow,Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, cy + 1, w - h);
  ctx.restore();
}

function drawBarcode(ctx,x,y,w,h){
  ctx.save();
  ctx.fillStyle = '#f5e8d6';
  ctx.fillRect(x,y,w,h);
  ctx.fillStyle = '#171520';
  const widths = [1,2,1,1,3,1,2,1,1,2,3,1,1,2,1,3,2,1,1,1,2,3,1,2,1,1,2,1,3,1];
  const unit = (w - 8) / widths.reduce((a,b)=>a+b,0);
  let pos = x + 4;
  for (let i = 0; i < widths.length; i++) {
    const bw = Math.max(1, widths[i] * unit * .55);
    if (i % 2 === 0) ctx.fillRect(pos, y + 3, bw, h - 6);
    pos += bw + unit * .45;
    if (pos > x + w - 4) break;
  }
  ctx.restore();
}

function drawSeal(ctx,cx,cy,r){
  ctx.save();
  ctx.translate(cx,cy);
  ctx.rotate(-.14);
  ctx.fillStyle = '#f3c875';
  ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#fff3cf'; ctx.lineWidth = Math.max(1, r*.05); ctx.stroke();
  ctx.fillStyle = '#9c3d57';
  ctx.beginPath(); ctx.arc(0,0,r*.86,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#f3c875'; ctx.lineWidth = Math.max(1, r*.03);
  ctx.beginPath(); ctx.arc(0,0,r*.7,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle = '#fff0c7';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${Math.round(r*.24)}px Barlow,Arial`;
  ctx.fillText('VICE CITY', 0, -r*.34);
  ctx.font = `${Math.round(r*.5)}px Arial`;
  ctx.fillText('\u2726', 0, r*.02);
  ctx.font = `700 ${Math.round(r*.2)}px Barlow,Arial`;
  ctx.fillText('AFTER DARK', 0, r*.42);
  ctx.restore();
}

function drawFilmstrip(ctx,x,y,size,gap,people,assets,grade,count=5){
  for (let i = 0; i < count && i < people.length; i++) {
    const person = people[i];
    const px = x + i * (size + gap);
    ctx.save();
    ctx.beginPath();
    ctx.rect(px,y,size,size);
    ctx.clip();
    const img = assets[person.photo];
    if (img && img.complete && img.naturalWidth) drawPhoto(ctx,img,px,y,size,size,person,grade);
    else { ctx.fillStyle = grade.mid; ctx.fillRect(px,y,size,size); }
    ctx.fillStyle = 'rgba(14,11,20,.46)';
    ctx.fillRect(px, y + size - Math.max(13, size*.24), size, Math.max(13, size*.24));
    ctx.fillStyle = '#f7e2c4';
    ctx.font = `700 ${Math.round(size*.16)}px Barlow,Arial`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(pad2(i+1), px + size*.08, y + size - Math.max(13,size*.24)/2);
    ctx.restore();
    ctx.strokeStyle = '#ffe6bd88';
    ctx.lineWidth = 1;
    ctx.strokeRect(px+.5, y+.5, size-1, size-1);
  }
}

function drawGrain(ctx,w,h){
  ctx.save();
  ctx.globalAlpha = .055;
  ctx.fillStyle = '#ffffff';
  for (let y = 9; y < h; y += 31) {
    for (let x = ((y/31|0) % 2) * 15 + 7; x < w; x += 31) {
      ctx.fillRect(x,y,1,1);
      if ((x + y) % 9 === 0) ctx.fillRect(x + 9, y + 11, 1, 1);
    }
  }
  ctx.restore();
}

function bandFurniture(ctx,P,state,grade,cast,assets,people){
  const {x:px,y:py,w:pw,h:ph} = P;
  const f = Math.min(pw/1080, ph/540);
  const margin = pw * .062;
  const inner = pw - margin*2;

  ctx.save();
  const bg = ctx.createLinearGradient(0,py,0,py+ph);
  bg.addColorStop(0,'#191324');
  bg.addColorStop(.55,'#141020');
  bg.addColorStop(1,'#0e0b16');
  ctx.fillStyle = bg;
  ctx.fillRect(px,py,pw,ph);
  const sheen = ctx.createRadialGradient(px + pw*.18, py, 0, px + pw*.18, py, pw*.75);
  sheen.addColorStop(0, grade.mid + '22');
  sheen.addColorStop(1, grade.mid + '00');
  ctx.fillStyle = sheen;
  ctx.fillRect(px,py,pw,ph);

  ctx.fillStyle = '#f3c875';
  ctx.fillRect(px, py, pw, Math.max(2, 3*f));

  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#cbb9b3';
  ctx.font = `italic ${Math.round(17*f)}px Barlow,Arial`;
  ctx.fillText('\u201cTHE CITY NEVER LOOKED THIS GOOD AFTER DARK.\u201d', px + pw/2, py + ph*.048, inner);
  drawStars(ctx, px + pw/2, py + ph*.082, Math.round(15*f));

  drawRibbon(ctx, px + pw*.44, py + ph*.155, Math.min(inner*.86, 660*f), Math.max(22, 40*f), 'FIVE STORIES  \u00b7  ONE CITY  \u00b7  NO WAY BACK');
  drawSeal(ctx, px + pw*.905, py + ph*.145, Math.max(16, 30*f));

  ctx.textAlign = 'center';
  ctx.fillStyle = '#e7cdb4';
  ctx.font = `700 ${Math.round(15*f)}px Barlow,Arial`;
  ctx.fillText('AN ORIGINAL VICE-CITY NIGHT STORY', px + pw/2, py + ph*.238, inner*.8);

  const title = (state.title || 'GOLDEN GETAWAY').toUpperCase().trim();
  chromeTitle(ctx, title, px + pw/2, py + ph*.50, inner*.96, 152*f);

  ctx.save();
  ctx.shadowColor = '#1a0f1c';
  ctx.shadowBlur = 8*f;
  ctx.fillStyle = '#f68da8';
  ctx.font = `${Math.round(46*f)}px Pacifico,cursive`;
  ctx.textAlign = 'center';
  ctx.fillText(state.subtitle || 'every sunset has a story', px + pw/2, py + ph*.632, inner*.94);
  ctx.restore();

  const stripY = py + ph*.695;
  const size = Math.min(ph*.105, (inner - 4*12*f)/5);
  const gap = (inner - size*5) / 4;
  drawFilmstrip(ctx, px + margin, stripY, size, gap, people, assets, grade);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#a99ca6';
  ctx.font = `${Math.round(11*f)}px Barlow,Arial`;
  ctx.fillText('CAST \u00b7 IN ORDER OF APPEARANCE', px + margin, stripY - 9*f);

  ctx.fillStyle = '#f1d9bb';
  ctx.font = `700 ${Math.round(13*f)}px Barlow,Arial`;
  ctx.fillText(`STARRING  ${cast.map(c => c.name).join('  \u00b7  ')}`, px + margin, py + ph*.905, inner - size*1.6);

  const bcW = Math.min(150*f, pw*.16), bcH = Math.max(30, 52*f);
  drawBarcode(ctx, px + pw - margin - bcW, py + ph*.845, bcW, bcH);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#d6c4b4';
  ctx.font = `${Math.round(9*f)}px Barlow,Arial`;
  ctx.fillText('7 32109 44106 8', px + pw - margin - bcW/2, py + ph*.93);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#8f838f';
  ctx.font = `${Math.round(9*f)}px Barlow,Arial`;
  ctx.fillText('AFTERGLOW STUDIO  \u00b7  ORIGINAL FAN-STYLE COVER ART  \u00b7  NO AFFILIATION WITH ANY GAME OR STUDIO', px + pw/2, py + ph*.972, inner);
  ctx.restore();
}

function columnFurniture(ctx,P,state,grade,cast,assets,people){
  const {x:px,y:py,w:pw,h:ph} = P;
  const f = Math.min(pw/800, ph/1080);
  const margin = pw * .085;
  const inner = pw - margin*2;

  ctx.save();
  const bg = ctx.createLinearGradient(px,0,px+pw,0);
  bg.addColorStop(0,'#1a1426');
  bg.addColorStop(1,'#0d0a15');
  ctx.fillStyle = bg;
  ctx.fillRect(px,py,pw,ph);
  const sheen = ctx.createRadialGradient(px + pw*.5, py, 0, px + pw*.5, py, pw);
  sheen.addColorStop(0, grade.mid + '26');
  sheen.addColorStop(1, grade.mid + '00');
  ctx.fillStyle = sheen;
  ctx.fillRect(px,py,pw,ph);
  ctx.fillStyle = '#f3c875';
  ctx.fillRect(px, py, Math.max(2,3*f), ph);

  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#cbb9b3';
  ctx.font = `italic ${Math.round(19*f)}px Barlow,Arial`;
  ctx.fillText('\u201cTHE CITY NEVER LOOKED THIS GOOD AFTER DARK.\u201d', px + pw/2, py + ph*.07, inner);
  drawStars(ctx, px + pw/2, py + ph*.098, Math.round(16*f));

  drawRibbon(ctx, px + pw*.46, py + ph*.155, Math.min(inner*.92, 560*f), Math.max(22, 38*f), 'FIVE STORIES \u00b7 ONE CITY');
  drawSeal(ctx, px + pw*.88, py + ph*.145, Math.max(16, 28*f));

  ctx.textAlign = 'center';
  ctx.fillStyle = '#e7cdb4';
  ctx.font = `700 ${Math.round(15*f)}px Barlow,Arial`;
  ctx.fillText('AN ORIGINAL VICE-CITY NIGHT STORY', px + pw/2, py + ph*.235, inner);

  const title = (state.title || 'GOLDEN GETAWAY').toUpperCase().trim();
  chromeTitle(ctx, title, px + pw/2, py + ph*.455, inner*.99, 178*f);

  ctx.save();
  ctx.shadowColor = '#1a0f1c';
  ctx.shadowBlur = 8*f;
  ctx.fillStyle = '#f68da8';
  ctx.font = `${Math.round(44*f)}px Pacifico,cursive`;
  ctx.textAlign = 'center';
  ctx.fillText(state.subtitle || 'every sunset has a story', px + pw/2, py + ph*.585, inner*.96);
  ctx.restore();

  const stripY = py + ph*.665;
  const size = Math.min(ph*.082, (inner - 4*10*f)/5);
  const gap = (inner - size*5) / 4;
  drawFilmstrip(ctx, px + margin, stripY, size, gap, people, assets, grade);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#a99ca6';
  ctx.font = `${Math.round(11*f)}px Barlow,Arial`;
  ctx.fillText('CAST \u00b7 IN ORDER OF APPEARANCE', px + margin, stripY - 9*f);

  ctx.fillStyle = '#f1d9bb';
  ctx.font = `700 ${Math.round(13*f)}px Barlow,Arial`;
  ctx.fillText(`STARRING  ${cast.map(c => c.name).join('  \u00b7  ')}`, px + margin, py + ph*.80, inner);

  const bcW = Math.min(160*f, pw*.3), bcH = Math.max(30, 50*f);
  drawBarcode(ctx, px + margin, py + ph*.845, bcW, bcH);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#d6c4b4';
  ctx.font = `${Math.round(9*f)}px Barlow,Arial`;
  ctx.fillText('7 32109 44106 8', px + margin, py + ph*.925);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#8f838f';
  ctx.font = `${Math.round(9*f)}px Barlow,Arial`;
  ctx.fillText('AFTERGLOW STUDIO  \u00b7  ORIGINAL FAN-STYLE COVER ART', px + pw/2, py + ph*.965, inner);
  ctx.restore();
}

export function layoutMode(w,h){
  const ratio = w / h;
  if (ratio > 1.3) return 'wide';
  if (ratio > .86) return 'square';
  return 'tall';
}

export function zoneRect(w,h,mode=layoutMode(w,h)){
  if (mode === 'wide') return { x:0, y:0, w:w*.578, h };
  return { x:0, y:0, w, h: h * (mode === 'square' ? .575 : .60) };
}

export function cellsFor(layoutId,mode){
  if (mode === 'wide') return WIDE_CELLS;
  return CELLS[layoutId] || CELLS.hero;
}

export function hitTestCover(state,layoutId,w,h,px,py){
  const mode = layoutMode(w,h);
  const zone = zoneRect(w,h,mode);
  const nx = (px - zone.x) / zone.w;
  const ny = (py - zone.y) / zone.h;
  if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return -1;
  for (const cell of cellsFor(layoutId,mode)) {
    if (nx >= cell.x && nx <= cell.x + cell.w && ny >= cell.y && ny <= cell.y + cell.h) return cell.p;
  }
  return -1;
}

export function renderCover(ctx,state,assets,layoutId='hero',gradeId='golden',size={w:1080,h:1350}){
  const w = size.w || 1080;
  const h = size.h || 1350;
  const mode = layoutMode(w,h);
  const grade = GRADES.find(g => g.id === gradeId) || GRADES[0];
  const people = PEOPLE;
  const cast = state.cast && state.cast.length === people.length
    ? state.cast
    : people.map(p => ({ name:p.name, role:p.role }));
  const zone = zoneRect(w,h,mode);
  const cells = cellsFor(layoutId,mode);
  const gap = Math.max(4, Math.min(w,h) * .008);

  ctx.save();
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle = '#0e0b16';
  ctx.fillRect(0,0,w,h);

  // Photo zone
  ctx.save();
  ctx.beginPath();
  ctx.rect(zone.x,zone.y,zone.w,zone.h);
  ctx.clip();
  ctx.fillStyle = grade.bottom;
  ctx.fillRect(zone.x,zone.y,zone.w,zone.h);
  for (const cell of cells) {
    const rect = {
      x: zone.x + cell.x * zone.w + gap/2,
      y: zone.y + cell.y * zone.h + gap/2,
      w: cell.w * zone.w - gap,
      h: cell.h * zone.h - gap
    };
    if (rect.w <= 2 || rect.h <= 2) continue;
    const person = people[cell.p];
    drawTile(ctx,rect,person,assets,grade,cast[cell.p] || {},true);
  }
  ctx.restore();

  // Frame and seams
  ctx.save();
  ctx.strokeStyle = '#ffe6bd';
  ctx.lineWidth = Math.max(2, Math.min(w,h)*.0022);
  for (const cell of cells) {
    const rx = zone.x + cell.x * zone.w + gap/2;
    const ry = zone.y + cell.y * zone.h + gap/2;
    ctx.strokeRect(rx, ry, cell.w*zone.w - gap, cell.h*zone.h - gap);
  }
  ctx.restore();

  // Type band
  if (mode === 'wide') {
    columnFurniture(ctx,{x:zone.w,y:0,w:w-zone.w,h},state,grade,cast,assets,people);
  } else {
    bandFurniture(ctx,{x:0,y:zone.h,w,h:h-zone.h},state,grade,cast,assets,people);
  }

  // Outer keyline sits inside the frame, never over type or faces
  const inset = Math.max(8, Math.min(w,h)*.012);
  ctx.save();
  ctx.strokeStyle = '#ffdfae55';
  ctx.lineWidth = Math.max(1, Math.min(w,h)*.0018);
  ctx.strokeRect(inset, inset, w - inset*2, h - inset*2);
  ctx.restore();

  drawGrain(ctx,w,h);
  ctx.restore();
  return ctx.canvas;
}

export function getPeople(){ return PEOPLE; }
export function getLayouts(){ return LAYOUTS; }
export function getGrades(){ return GRADES; }
export function getPhotoPath(person){ return `./samples/${person.photo}`; }
