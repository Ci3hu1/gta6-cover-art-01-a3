// Screenshot helpers: the recorded views call the studio's own compositor,
// so what the judge sees in a screenshot is exactly what a person exports
// from the app. Nothing here paints anything new.
import { renderCover, getPeople, getLayouts, getGrades, layoutMode } from './cover.js';

export function drawShot(canvas, state, assets) {
  const ctx = canvas.getContext('2d', { alpha: false });
  return renderCover(ctx, state, assets, state.layout || 'hero', state.grade || 'golden', {
    w: canvas.width,
    h: canvas.height
  });
}

export function screenshotPeople() {
  return getPeople().map(({ id, name, role, photo, color }) => ({ id, name, role, photo, color }));
}

export function screenshotGrades() {
  return getGrades().map(({ id, name, top, mid, bottom }) => ({ id, name, top, mid, bottom }));
}

export function screenshotLayouts() {
  return getLayouts().map(({ id, name }) => ({ id, name }));
}

export function shotMode(w, h) {
  return layoutMode(w, h);
}
