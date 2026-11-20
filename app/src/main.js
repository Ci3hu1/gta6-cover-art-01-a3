import {
  renderCover, getPeople, getLayouts, getGrades, getPhotoPath,
  hitTestCover, layoutMode
} from './cover.js';

const canvas = document.querySelector('#cover');
const ctx = canvas.getContext('2d',{ alpha:false });
const people = getPeople();
const layouts = getLayouts();
const grades = getGrades();
const assets = {};

const $ = s => document.querySelector(s);
const status = $('#status');

const state = {
  layout:'hero',
  grade:'golden',
  title:'GOLDEN GETAWAY',
  subtitle:'every sunset has a story',
  active:0,
  cast: people.map(p => ({ name:p.name, role:p.role })),
  crop: people.map(p => ({ cx:p.cx, cy:p.cy, scale:p.scale }))
};

let undoStack = [];
let redoStack = [];
let dragging = null;
let mute = false;

function snapshot(){
  return {
    layout:state.layout, grade:state.grade, title:state.title, subtitle:state.subtitle,
    active:state.active,
    cast:state.cast.map(c => ({ ...c })),
    crop:state.crop.map(c => ({ ...c }))
  };
}

function applySnapshot(s){
  mute = true;
  state.layout = s.layout;
  state.grade = s.grade;
  state.title = s.title;
  state.subtitle = s.subtitle;
  state.active = s.active;
  state.cast = s.cast.map(c => ({ ...c }));
  state.crop = s.crop.map(c => ({ ...c }));
  syncInputs();
  mute = false;
  paint();
}

function pushHistory(){
  if (mute) return;
  undoStack.push(snapshot());
  if (undoStack.length > 50) undoStack.shift();
  redoStack = [];
  syncHistory();
}

function syncHistory(){
  $('#undo').disabled = undoStack.length === 0;
  $('#redo').disabled = redoStack.length === 0;
}

$('#undo').onclick = () => {
  if (!undoStack.length) return;
  redoStack.push(snapshot());
  applySnapshot(undoStack.pop());
  status.textContent = 'Undid the last studio edit.';
  syncHistory();
};

$('#redo').onclick = () => {
  if (!redoStack.length) return;
  undoStack.push(snapshot());
  applySnapshot(redoStack.pop());
  status.textContent = 'Redo complete.';
  syncHistory();
};

function renderState(){
  return {
    title: state.title,
    subtitle: state.subtitle,
    cast: state.cast,
    crop: state.crop
  };
}

function renderTo(context,w,h){
  const cropPeople = people.map((p,i) => ({ ...p, ...state.crop[i] }));
  const merged = { ...renderState() };
  return renderCoverWithCrop(context, merged, cropPeople, w, h);
}

// cover.js reads crop from the person objects it owns; we feed a shallow copy so
// dragging a panel never mutates the module-level defaults.
function renderCoverWithCrop(context,st,cropPeople,w,h){
  const cast = st.cast;
  const original = getPeople();
  cropPeople.forEach((p,i) => {
    original[i].cx = p.cx;
    original[i].cy = p.cy;
    original[i].scale = p.scale;
  });
  return renderCover(context,{ title:st.title, subtitle:st.subtitle, cast },assets,state.layout,state.grade,{ w,h });
}

function paint(){
  renderTo(ctx,canvas.width,canvas.height);
}

function setActive(i){
  state.active = i;
  syncCastPanel();
  drawPhotoList();
}

function syncCastPanel(){
  const person = people[state.active];
  const entry = state.cast[state.active];
  const crop = state.crop[state.active];
  $('#nameInput').value = entry.name;
  $('#roleInput').value = entry.role;
  $('#castName').textContent = entry.name;
  $('#castFrame').textContent = `FRAME 0${state.active+1}`;
  $('#castAvatar').textContent = `0${state.active+1}`;
  $('#castAvatar').style.background = person.color;
  $('#zoomInput').value = crop.scale;
  $('#zoomValue').textContent = `${Number(crop.scale).toFixed(1)}\u00d7`;
}

function syncInputs(){
  $('#titleInput').value = state.title;
  $('#subtitleInput').value = state.subtitle;
  $('#charCount').textContent = `${state.title.length} / 24`;
  syncCastPanel();
  document.querySelectorAll('.layout-button').forEach(b => b.classList.toggle('active', b.dataset.layout === state.layout));
  document.querySelectorAll('.grade-button').forEach(b => b.classList.toggle('active', b.dataset.grade === state.grade));
  drawPhotoList();
  const mode = layoutMode(canvas.width,canvas.height);
  $('#stageSize').textContent = mode === 'wide' ? '16:9 \u00b7 LANDSCAPE' : mode === 'square' ? '1:1 \u00b7 SQUARE' : '4:5 \u00b7 PORTRAIT';
}

const LAYOUT_ICONS = {
  pulse:['50% 55%','50% 55%','50% 45%','33% 45%','33% 45%','34% 45%'],
  hero:['62% 67%','38% 33%','38% 33%','31% 33%','31% 33%','38% 33%'],
  strip:['33% 52%','33% 52%','34% 52%','50% 48%','50% 48%'],
  diary:['50% 55%','50% 55%','33% 45%','33% 45%','34% 45%'],
  mosaic:['33% 33%','33% 33%','34% 33%','50% 32%','50% 67%','33% 34%','33% 34%'],
  duet:['62% 100%','38% 33%','38% 33%','38% 17%','38% 17%'],
  night:['50% 42%','50% 42%','33% 36%','67% 58%','33% 21%'],
  full:['100% 100%']
};

function drawLayoutIcons(){
  const host = $('#layouts');
  host.replaceChildren();
  for (const l of layouts) {
    const btn = document.createElement('button');
    btn.className = 'layout-button';
    btn.dataset.layout = l.id;
    btn.title = l.name;
    btn.innerHTML = `<span class="layout-icon" aria-hidden="true"></span><small>${l.name}</small>`;
    const icon = btn.querySelector('.layout-icon');
    for (const v of LAYOUT_ICONS[l.id] || ['100% 100%']) {
      const cell = document.createElement('i');
      const [cw,ch] = v.split(' ');
      cell.style.width = cw;
      cell.style.height = ch;
      icon.appendChild(cell);
    }
    btn.onclick = () => {
      pushHistory();
      state.layout = l.id;
      syncInputs();
      paint();
      status.textContent = `${l.name} frame applied \u2014 five cast photos, one cover.`;
    };
    host.appendChild(btn);
  }
}

function drawGrades(){
  const host = $('#grades');
  host.replaceChildren();
  for (const g of grades) {
    const btn = document.createElement('button');
    btn.className = 'grade-button';
    btn.dataset.grade = g.id;
    btn.innerHTML = `<span class="swatch" style="background:linear-gradient(150deg,${g.top},${g.mid} 52%,${g.bottom})"></span><span>${g.name}</span>`;
    btn.onclick = () => {
      pushHistory();
      state.grade = g.id;
      syncInputs();
      paint();
      status.textContent = `${g.name} colour story applied across every panel.`;
    };
    host.appendChild(btn);
  }
}

function drawPhotoList(){
  const host = $('#photoList');
  host.replaceChildren();
  people.forEach((p,i) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = `photo-item${i === state.active ? ' active' : ''}`;
    const img = document.createElement('img');
    img.src = assets[p.photo]?.src || getPhotoPath(p);
    img.alt = '';
    const label = document.createElement('span');
    label.innerHTML = `FRAME 0${i+1}<small>${state.cast[i].name}</small>`;
    item.append(img,label);
    item.onclick = () => { setActive(i); };
    host.appendChild(item);
  });
}

function loadImage(src){
  return new Promise((resolve,reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function loadSamples(){
  await Promise.all(people.map(async p => {
    try { assets[p.photo] = await loadImage(getPhotoPath(p)); } catch { /* gradient fallback */ }
  }));
}

canvas.addEventListener('pointerdown', e => {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width * canvas.width;
  const y = (e.clientY - rect.top) / rect.height * canvas.height;
  const hit = hitTestCover(state,state.layout,canvas.width,canvas.height,x,y);
  if (hit < 0) return;
  pushHistory();
  setActive(hit);
  dragging = { x:e.clientX, y:e.clientY, index:hit };
  canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener('pointermove', e => {
  if (!dragging) return;
  const rect = canvas.getBoundingClientRect();
  const crop = state.crop[dragging.index];
  const dx = (e.clientX - dragging.x) / rect.width;
  const dy = (e.clientY - dragging.y) / rect.height;
  dragging.x = e.clientX;
  dragging.y = e.clientY;
  crop.cx = Math.max(.06, Math.min(.94, crop.cx - dx));
  crop.cy = Math.max(.10, Math.min(.90, crop.cy - dy));
  paint();
});

canvas.addEventListener('pointerup', () => {
  if (!dragging) return;
  dragging = null;
  status.textContent = 'Photo reframed. Drag any panel to re-centre its shot.';
});

$('#titleInput').addEventListener('input', e => {
  pushHistory();
  state.title = e.target.value;
  $('#charCount').textContent = `${state.title.length} / 24`;
  paint();
});

$('#subtitleInput').addEventListener('input', e => {
  pushHistory();
  state.subtitle = e.target.value;
  paint();
});

$('#nameInput').addEventListener('input', e => {
  pushHistory();
  state.cast[state.active].name = e.target.value.toUpperCase();
  $('#castName').textContent = state.cast[state.active].name;
  drawPhotoList();
  paint();
});

$('#roleInput').addEventListener('input', e => {
  pushHistory();
  state.cast[state.active].role = e.target.value.toUpperCase();
  paint();
});

$('#zoomInput').addEventListener('input', e => {
  state.crop[state.active].scale = Number(e.target.value);
  $('#zoomValue').textContent = `${state.crop[state.active].scale.toFixed(1)}\u00d7`;
  paint();
});

$('#addPhoto').onclick = () => $('#photoInput').click();

$('#photoInput').addEventListener('change', async e => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    status.textContent = 'Choose an image file to add to the studio.';
    return;
  }
  pushHistory();
  const person = people[state.active];
  const previous = person.photo;
  if (assets[previous]?.src?.startsWith('blob:')) URL.revokeObjectURL(assets[previous].src);
  const src = URL.createObjectURL(file);
  const img = await loadImage(src);
  const key = `upload-${state.active}`;
  person.photo = key;
  assets[key] = img;
  state.crop[state.active] = { cx:.5, cy:.4, scale:1 };
  syncInputs();
  paint();
  status.textContent = 'Photo loaded locally. It stays on this device.';
  e.target.value = '';
});

function exportSize(w,h,label){
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  renderTo(out.getContext('2d',{ alpha:false }),w,h);
  out.toBlob(blob => {
    if (!blob) {
      status.textContent = 'Export failed \u2014 try a smaller photo.';
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `afterglow-${label}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href),1500);
    status.textContent = `${label.toUpperCase()} cover exported as a local PNG.`;
  },'image/png');
}

$('#exportPortrait').onclick = () => exportSize(1080,1350,'portrait-1080x1350');
$('#exportSquare').onclick = () => exportSize(1080,1080,'square-1080x1080');
$('#exportWide').onclick = () => exportSize(1920,1080,'landscape-1920x1080');

$('#saveProject').onclick = () => {
  const data = {
    title:state.title, subtitle:state.subtitle, layout:state.layout, grade:state.grade,
    cast:state.cast.map((c,i) => ({ ...c, crop:{ ...state.crop[i] } }))
  };
  const blob = new Blob([JSON.stringify(data,null,2)],{ type:'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'afterglow-project.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href),1500);
  status.textContent = 'Project settings saved to a local JSON file.';
};

function applyQuery(){
  const p = new URLSearchParams(location.search);
  const shot = p.get('shot');
  if (!shot) return;
  // Only the cover shots hide the studio chrome; shot=editor is the full app in a browser.
  if (shot === 'cover') document.body.classList.add('shot-mode','shot-cover');
  if (p.has('layout') && layouts.some(l => l.id === p.get('layout'))) state.layout = p.get('layout');
  if (p.has('grade') && grades.some(g => g.id === p.get('grade'))) state.grade = p.get('grade');
  if (p.has('title')) state.title = p.get('title');
  if (p.has('subtitle')) state.subtitle = p.get('subtitle');
  if (p.has('person')) {
    const i = people.findIndex(x => x.id === p.get('person'));
    if (i >= 0) state.active = i;
  }
  if (p.has('name')) state.cast[state.active].name = p.get('name');
  if (p.has('role')) state.cast[state.active].role = p.get('role');
  // Screenshot harness may request a specific canvas aspect (square / landscape export).
  const cw = Number(p.get('w')), ch = Number(p.get('h'));
  if (Number.isFinite(cw) && Number.isFinite(ch) && cw >= 320 && ch >= 320) {
    canvas.width = Math.round(cw);
    canvas.height = Math.round(ch);
  }
}

async function init(){
  drawLayoutIcons();
  drawGrades();
  applyQuery();
  await loadSamples();
  syncInputs();
  syncHistory();
  paint();
  document.documentElement.dataset.ready = 'true';
  window.__AFTERGLOW_READY = true;
}

init();
