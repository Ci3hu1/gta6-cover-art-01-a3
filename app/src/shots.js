import { renderCover, getPeople, getGrades } from './cover.js';
export function drawShot(canvas, state, assets) { const ctx=canvas.getContext('2d');return renderCover(ctx,state,assets,'hero','golden',{w:canvas.width,h:canvas.height}); }
export function screenshotPeople(){ return getPeople().map(({id,name,role,photo})=>({id,name,role,photo})); }
export function screenshotGrades(){ return getGrades().map(({id,name})=>({id,name})); }
