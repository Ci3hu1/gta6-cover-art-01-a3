const W = 1080;
const PEOPLE = [
  { id:'mara', name:'MARA SOL', role:'THE GETAWAY DRIVER', photo:'boulevard.jpg', color:'#e98b75', hero:true, cx:.71, cy:.39, scale:1 },
  { id:'nico', name:'NICO VEGA', role:'THE FIXER', photo:'rooftop.jpg', color:'#efbd72', cx:.54, cy:.35, scale:1 },
  { id:'luz', name:'LUZ & JUNE', role:'THE NIGHT OWLS', photo:'diner.jpg', color:'#df81a1', cx:.53, cy:.48, scale:1 },
  { id:'tito', name:'TITO REYES', role:'THE OLD SALT', photo:'pier.jpg', color:'#74b8aa', cx:.49, cy:.29, scale:1 },
  { id:'jade', name:'JADE KNOX', role:'THE WILDCARD', photo:'garage.jpg', color:'#df9b70', cx:.47, cy:.29, scale:1 }
];
const LAYOUTS = [
  {id:'pulse', name:'PULSE', kind:'pulse'}, {id:'hero', name:'HERO + 3', kind:'hero'}, {id:'strip', name:'STRIP', kind:'strip'}, {id:'diary', name:'DIARY', kind:'diary'},
  {id:'mosaic', name:'MOSAIC', kind:'mosaic'}, {id:'duet', name:'DUET', kind:'duet'}, {id:'night', name:'NIGHT', kind:'night'}, {id:'full', name:'FULL BLEED', kind:'full'}
];
const GRADES = [
  {id:'golden',name:'GOLDEN HOUR',top:'#ffc17e',mid:'#f08478',bottom:'#842f5c',glow:'#ffc069'},
  {id:'coral',name:'CORAL CLUB',top:'#ff997c',mid:'#e45e80',bottom:'#51265d',glow:'#ff7e93'},
  {id:'orchid',name:'ORCHID SKY',top:'#f7a8ce',mid:'#a96bb3',bottom:'#342c65',glow:'#f2a4db'},
  {id:'lagoon',name:'LAGOON',top:'#8ed2c1',mid:'#3b91a0',bottom:'#223b63',glow:'#9fe0d0'},
  {id:'after',name:'AFTER HOURS',top:'#fb8e63',mid:'#854c86',bottom:'#172c55',glow:'#ffb875'},
  {id:'citrus',name:'CITRUS POP',top:'#ffd278',mid:'#f07858',bottom:'#5a335b',glow:'#ffe190'},
  {id:'rose',name:'ROSE NOIR',top:'#efa0a3',mid:'#c65e79',bottom:'#3a274d',glow:'#ffc0a4'},
  {id:'electric',name:'ELECTRIC',top:'#8bd1cc',mid:'#8c78ba',bottom:'#452e69',glow:'#ff9cbd'}
];
const LAYOUTS_DRAW = {
  pulse:[{p:1,x:0,y:0,w:.45,h:.48},{p:2,x:.46,y:0,w:.54,h:.48},{p:3,x:0,y:.49,w:.43,h:.51},{p:4,x:.44,y:.49,w:.56,h:.51}],
  hero:[{p:1,x:.65,y:0,w:.35,h:.40},{p:2,x:.65,y:.41,w:.35,h:.41},{p:3,x:0,y:.83,w:.48,h:.17},{p:4,x:.49,y:.83,w:.51,h:.17},{p:0,x:-.012,y:.012,w:.695,h:.835}],
  strip:[{p:1,x:0,y:0,w:.33,h:.48},{p:2,x:.335,y:0,w:.33,h:.48},{p:3,x:.67,y:0,w:.33,h:.48},{p:4,x:0,y:.49,w:.48,h:.31},{p:0,x:.49,y:.49,w:.51,h:.51}],
  diary:[{p:2,x:0,y:0,w:.49,h:.53},{p:1,x:.50,y:0,w:.50,h:.53},{p:4,x:0,y:.54,w:.34,h:.46},{p:0,x:.35,y:.54,w:.34,h:.46},{p:3,x:.70,y:.54,w:.30,h:.46}],
  mosaic:[{p:1,x:0,y:0,w:.33,h:.32},{p:2,x:.335,y:0,w:.33,h:.32},{p:3,x:.67,y:0,w:.33,h:.32},{p:4,x:0,y:.33,w:.49,h:.31},{p:0,x:.50,y:.33,w:.50,h:.67},{p:2,x:0,y:.65,w:.33,h:.35},{p:1,x:.335,y:.65,w:.33,h:.35}],
  duet:[{p:1,x:0,y:0,w:.49,h:1},{p:2,x:.50,y:0,w:.50,h:.49},{p:0,x:.50,y:.50,w:.50,h:.50}],
  night:[{p:2,x:0,y:0,w:.48,h:.40},{p:1,x:.49,y:0,w:.51,h:.40},{p:4,x:0,y:.41,w:.33,h:.35},{p:0,x:.34,y:.41,w:.66,h:.59},{p:3,x:0,y:.77,w:.33,h:.23}],
  full:[{p:0,x:0,y:0,w:1,h:1}]
};
const SHOTS = {
  'mara': { name:'MARA SOL', role:'THE GETAWAY DRIVER' },
  'nico': { name:'NICO VEGA', role:'THE FIXER' },
  'luz': { name:'LUZ & JUNE', role:'THE NIGHT OWLS' },
  'tito': { name:'TITO REYES', role:'THE OLD SALT' },
  'jade': { name:'JADE KNOX', role:'THE WILDCARD' }
};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
function gradient(ctx,x,y,w,h,stops){const g=ctx.createLinearGradient(x,y,x,y+h);for(const [p,c] of stops)g.addColorStop(p,c);return g;}
function drawImageCrop(ctx,img,x,y,w,h,person,grade,alpha=1){
  const iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height;if(!iw||!ih)return;
  const base=Math.max(w/iw,h/ih),zoom=base*(person.scale||1),dw=iw*zoom,dh=ih*zoom;
  const fx=clamp(person.cx??.5,0,1),fy=clamp(person.cy??.45,0,1),cx=clamp(x+w*fx-dw/2,x+w-dw,x),cy=clamp(y+h*fy-dh/2,y+h-dh,y);
  ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(img,cx,cy,dw,dh);
  const wash=ctx.createLinearGradient(x,y,x+w,y+h);wash.addColorStop(0,grade.top+'2b');wash.addColorStop(.45,grade.mid+'12');wash.addColorStop(1,grade.bottom+'66');ctx.fillStyle=wash;ctx.fillRect(x,y,w,h);
  ctx.globalCompositeOperation='screen';ctx.fillStyle=grade.glow+'18';ctx.fillRect(x,y,w,h);ctx.restore();
}
function drawTile(ctx,rect,person,assets,grade,idx,castEntry={}){
  const x=rect.x,y=rect.y,w=rect.w,h=rect.h,img=assets[person.photo];
  ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.fillStyle=grade.bottom;ctx.fillRect(x,y,w,h);
  if(img?.complete&&img.naturalWidth)drawImageCrop(ctx,img,x,y,w,h,person,grade);
  else {const g=gradient(ctx,x,y,w,h,[[0,grade.top],[.5,grade.mid],[1,grade.bottom]]);ctx.fillStyle=g;ctx.fillRect(x,y,w,h);}
  ctx.fillStyle=gradient(ctx,x,y,w,h,[[0,'#160f2030'],[.58,'#120e1b05'],[1,'#120e1bc9']]);ctx.fillRect(x,y,w,h);
  if(w>130&&h>115){ctx.fillStyle=person.color;rr(ctx,x+10,y+10,Math.min(w-20,162),35,2);ctx.fill();ctx.fillStyle='#17141a';ctx.textBaseline='middle';ctx.font='700 11px Barlow,Arial';ctx.fillText((castEntry.name||person.name).toUpperCase(),x+17,y+20,Math.min(w-34,146));ctx.globalAlpha=.82;ctx.font='700 8px Barlow,Arial';ctx.fillText((castEntry.role||person.role).toUpperCase(),x+17,y+35,Math.min(w-34,146));ctx.globalAlpha=1;}
  ctx.restore();
}
function drawHalo(ctx,cx,cy,r,color){const g=ctx.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,color+'66');g.addColorStop(.24,color+'24');g.addColorStop(1,color+'00');ctx.fillStyle=g;ctx.fillRect(cx-r,cy-r,r*2,r*2);}
function drawSun(ctx,x,y,r,color){const g=ctx.createRadialGradient(x-r*.2,y-r*.4,r*.06,x,y,r);g.addColorStop(0,'#fff8d9');g.addColorStop(.26,'#ffe3aa');g.addColorStop(1,color);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.save();ctx.beginPath();ctx.arc(x,y,r*.82,0,Math.PI*2);ctx.clip();ctx.fillStyle='#d86579';for(let i=0;i<7;i++){const yy=y+r*.18+i*r*.17;ctx.fillRect(x-r,yy,r*2,Math.max(2,r*.035+i*1.1));}ctx.restore();}
function drawPalm(ctx,x,y,s,color){ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=s*.045;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+s*.10,y-s*.48,x+s*.05,y-s);ctx.stroke();const tx=x+s*.05,ty=y-s;for(let i=0;i<9;i++){const a=(Math.PI*2*i/9)-Math.PI*.5, len=s*(.48+((i*7)%4)*.035);ctx.beginPath();ctx.moveTo(tx,ty);ctx.quadraticCurveTo(tx+Math.cos(a)*len*.55,ty+Math.sin(a)*len*.68,tx+Math.cos(a)*len,ty+Math.sin(a)*len);ctx.lineWidth=Math.max(1,s*.024);ctx.stroke();}ctx.restore();}
function drawChromeTitle(ctx,title,x,y,maxW,size){let fs=size;ctx.font=`${fs}px Anton,Impact,sans-serif`;while(ctx.measureText(title).width>maxW&&fs>22){fs-=2;ctx.font=`${fs}px Anton,Impact,sans-serif`;}const tw=ctx.measureText(title).width,tx=x+(maxW-tw)/2;
  ctx.save();ctx.font=`${fs}px Anton,Impact,sans-serif`;ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.lineJoin='round';ctx.lineWidth=fs*.1;ctx.strokeStyle='#171521';ctx.shadowColor='#120e19';ctx.shadowBlur=18;ctx.shadowOffsetY=10;ctx.strokeText(title,tx,y);ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  ctx.lineWidth=fs*.055;ctx.strokeStyle='#4a263b';ctx.strokeText(title,tx,y);
  const g=ctx.createLinearGradient(0,y-fs,0,y+fs*.13);g.addColorStop(0,'#fff8de');g.addColorStop(.16,'#fff3c8');g.addColorStop(.27,'#fffdf2');g.addColorStop(.35,'#cbd4df');g.addColorStop(.46,'#fffef6');g.addColorStop(.54,'#929eaf');g.addColorStop(.67,'#fff0ca');g.addColorStop(.77,'#d8e1e7');g.addColorStop(1,'#fff4d0');ctx.fillStyle=g;ctx.fillText(title,tx,y);
  ctx.save();ctx.beginPath();ctx.rect(tx,y-fs*.9,tw,fs*.47);ctx.clip();ctx.globalAlpha=.43;ctx.fillStyle='#fff';ctx.font=`${fs}px Anton,Impact,sans-serif`;ctx.fillText(title,tx,y);ctx.restore();ctx.restore();return fs;
}
function drawStars(ctx,cx,y,rating=5){ctx.save();ctx.textAlign='center';ctx.font='20px Arial';ctx.fillStyle='#ffd98d';for(let i=0;i<rating;i++)ctx.fillText('★',cx+(i-(rating-1)/2)*25,y);ctx.restore();}
function drawSeal(ctx,x,y,r){ctx.save();ctx.translate(x,y);ctx.rotate(-.16);ctx.fillStyle='#f3c875';ctx.strokeStyle='#fff1c9';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#9f3d58';ctx.beginPath();ctx.arc(0,0,r-5,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#f3c875';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,r-8,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#fff0c7';ctx.textAlign='center';ctx.font='bold 8px Barlow,Arial';ctx.fillText('VICE CITY',0,-6);ctx.font='18px Arial';ctx.fillText('✦',0,10);ctx.font='bold 7px Barlow,Arial';ctx.fillText('AFTER DARK',0,22);ctx.restore();}
function drawBarcode(ctx,x,y,w,h){ctx.save();ctx.fillStyle='#f5e8d6';ctx.fillRect(x,y,w,h);ctx.fillStyle='#171520';let pos=x+3;const widths=[1,2,1,1,3,1,2,1,1,2,3,1,1,2,1,3,2,1,1,1,2,3,1,2,1,1,2,1,3,1];for(let i=0;i<widths.length;i++){const bw=widths[i]*1.25;if(i%2===0)ctx.fillRect(pos,y+2,bw,h-4);pos+=bw+1.1;if(pos>x+w-3)break;}ctx.restore();}
function drawFurniture(ctx,w,h,state,grade,portrait){
  const cast=state.cast||PEOPLE.map(p=>({name:p.name,role:p.role}));
  const sx=w/W,sy=h/1350;ctx.save();ctx.scale(sx,sy);const baseH=1350;
  // edge keyline and light photographic vignette
  ctx.strokeStyle='#ffdfae99';ctx.lineWidth=2;ctx.strokeRect(17,17,1046,1316);
  ctx.fillStyle='rgba(16,12,25,.24)';ctx.fillRect(0,0,1080,132);
  // Top quote strip, five complete stars, clear-space above and below
  ctx.fillStyle='#191421bd';rr(ctx,74,52,732,74,4);ctx.fill();ctx.fillStyle='#f3d8bd';ctx.font='italic 15px Barlow,Arial';ctx.textAlign='center';ctx.fillText('“THE CITY NEVER LOOKED THIS GOOD AFTER DARK.”',440,82);drawStars(ctx,440,108,5);
  // volume pill
  ctx.fillStyle='#211825';rr(ctx,838,51,164,34,17);ctx.fill();ctx.strokeStyle='#f2c879';ctx.lineWidth=1;rr(ctx,838,51,164,34,17);ctx.stroke();ctx.fillStyle='#f7daa0';ctx.font='700 10px Barlow,Arial';ctx.textAlign='center';ctx.fillText('VOL. 06  ·  NO. 01',920,72);
  // open sky ornament / palm and sun remain above faces
  drawSun(ctx,916,199,54,grade.top);drawPalm(ctx,1027,282,111,'#192029');drawPalm(ctx,66,279,91,'#25202d');
  // gold seal on upper right, not over headline or faces
  drawSeal(ctx,996,376,47);
  // little story ribbon over title
  ctx.save();ctx.translate(540,735);ctx.rotate(-.025);ctx.fillStyle='#f0b967';ctx.beginPath();ctx.moveTo(-234,-18);ctx.lineTo(221,-18);ctx.lineTo(244,0);ctx.lineTo(221,18);ctx.lineTo(-234,18);ctx.lineTo(-256,0);ctx.closePath();ctx.fill();ctx.fillStyle='#29202a';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='700 11px Barlow,Arial';ctx.fillText('FIVE STORIES  ·  ONE CITY  ·  NO WAY BACK',0,1);ctx.restore();
  const headline=(state.title||'GOLDEN GETAWAY').toUpperCase().trim();const titleSize=drawChromeTitle(ctx,headline,88,837,904,122);
  ctx.textAlign='center';ctx.fillStyle='#fff4e4';ctx.font='italic 15px Barlow,Arial';ctx.globalAlpha=.85;ctx.fillText('AN ORIGINAL VICE-CITY NIGHT STORY',540,864);ctx.globalAlpha=1;
  ctx.save();ctx.shadowColor='#21111f';ctx.shadowBlur=7;ctx.fillStyle='#f58da8';ctx.font='40px Pacifico,cursive';ctx.textAlign='center';ctx.fillText(state.subtitle||'every sunset has a story',540,916,820);ctx.restore();
  // billboarding lower furniture
  const lowerY=1198;ctx.fillStyle='#211820c9';ctx.fillRect(0,lowerY,1080,152);ctx.fillStyle='#f3c875';ctx.fillRect(0,lowerY,1080,3);
  ctx.fillStyle='#f4e6d2';ctx.font='bold 12px Barlow,Arial';ctx.textAlign='left';ctx.fillText('AN AFTERGLOW ORIGINAL',72,1231);ctx.font='10px Barlow,Arial';ctx.fillStyle='#d4c8bc';ctx.fillText('A CITY OF SUNSHINE. A NIGHT WITH NO RULES.',72,1252);ctx.font='9px Barlow,Arial';ctx.fillStyle='#a9a0a5';ctx.fillText(`STARRING  ${cast.map(c=>c.name).join('  ·  ')}`,72,1275);
  ctx.fillStyle='#f1d9bb';ctx.font='bold 8px Barlow,Arial';ctx.textAlign='center';ctx.fillText('A NEON COAST PICTURE  •  SUMMER NIGHTS ARE FOREVER',540,1312);
  drawBarcode(ctx,862,1222,141,44);ctx.fillStyle='#d6c4b4';ctx.font='7px Barlow,Arial';ctx.textAlign='center';ctx.fillText('7 32109 44106 8',932,1276);ctx.font='bold 9px Barlow,Arial';ctx.fillStyle='#f0c978';ctx.fillText('ONLY IN YOUR IMAGINATION',932,1297);
  // very fine micro billing, fully inset
  ctx.fillStyle='#a89ca3';ctx.font='6px Barlow,Arial';ctx.textAlign='center';ctx.fillText('ORIGINAL FAN-STYLE COVER ART  ·  NO AFFILIATION WITH ANY GAME OR STUDIO',540,1330);
  ctx.restore();
}
function addTexture(ctx,w,h){ // deterministic fine grain, no random per frame
  ctx.save();ctx.globalAlpha=.08;ctx.fillStyle='#fff';for(let y=7;y<h;y+=29)for(let x=((y/29|0)%2)*13+6;x<w;x+=29){ctx.fillRect(x,y,1,1);if((x+y)%7===0)ctx.fillRect(x+8,y+9,1,1);}ctx.restore();
}
function renderLandscape(ctx,state,assets,grade){
 const w=1920,h=1080;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,w,h);ctx.fillStyle=grade.bottom;ctx.fillRect(0,0,w,h);
 const cells=[{p:0,x:0,y:0,w:800,h:860},{p:1,x:810,y:0,w:550,h:425},{p:2,x:1370,y:0,w:550,h:425},{p:3,x:810,y:435,w:550,h:425},{p:4,x:1370,y:435,w:550,h:425}];
 cells.forEach((c,i)=>drawTile(ctx,{x:c.x,y:c.y,w:c.w,h:c.h},PEOPLE[c.p],assets,grade,i,(state.cast||[])[c.p]||{}));
 // An offset cream keyline frames the oversized lead portrait as a clean pop-out panel.
 ctx.save();ctx.strokeStyle='#fff0ca';ctx.lineWidth=5;ctx.shadowColor='#120f1c';ctx.shadowBlur=24;ctx.strokeRect(9,9,782,842);ctx.restore();
 const wash=ctx.createLinearGradient(0,690,0,1080);wash.addColorStop(0,'#17131b00');wash.addColorStop(.42,'#17131bde');wash.addColorStop(1,'#17131bf5');ctx.fillStyle=wash;ctx.fillRect(0,650,w,430);
 ctx.fillStyle='#1b1523d9';rr(ctx,68,38,730,75,4);ctx.fill();ctx.fillStyle='#f2d8bd';ctx.font='italic 17px Barlow,Arial';ctx.textAlign='center';ctx.fillText('“THE CITY NEVER LOOKED THIS GOOD AFTER DARK.”',433,68);drawStars(ctx,433,97,5);
 ctx.fillStyle='#211825';rr(ctx,1645,46,198,40,20);ctx.fill();ctx.strokeStyle='#f2c879';ctx.lineWidth=1;rr(ctx,1645,46,198,40,20);ctx.stroke();ctx.fillStyle='#f7daa0';ctx.font='700 13px Barlow,Arial';ctx.fillText('VOL. 06  ·  NO. 01',1744,71);
 drawSun(ctx,1220,180,68,grade.top);drawPalm(ctx,1878,285,122,'#192029');drawSeal(ctx,1815,600,52);
 ctx.save();ctx.translate(960,767);ctx.rotate(-.018);ctx.fillStyle='#f0b967';ctx.beginPath();ctx.moveTo(-270,-20);ctx.lineTo(246,-20);ctx.lineTo(270,0);ctx.lineTo(246,20);ctx.lineTo(-270,20);ctx.lineTo(-294,0);ctx.closePath();ctx.fill();ctx.fillStyle='#29202a';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='700 14px Barlow,Arial';ctx.fillText('FIVE STORIES  ·  ONE CITY  ·  NO WAY BACK',0,1);ctx.restore();
 const title=(state.title||'GOLDEN GETAWAY').toUpperCase().trim();drawChromeTitle(ctx,title,90,896,1740,204);ctx.fillStyle='#f58da8';ctx.textAlign='center';ctx.font='42px Pacifico,cursive';ctx.fillText(state.subtitle||'every sunset has a story',960,950,1400);
 ctx.fillStyle='#19151f';ctx.fillRect(0,986,w,94);ctx.fillStyle='#f3c875';ctx.fillRect(0,986,w,3);ctx.fillStyle='#f4e6d2';ctx.textAlign='left';ctx.font='bold 14px Barlow,Arial';ctx.fillText('AN AFTERGLOW ORIGINAL',70,1016);ctx.font='11px Barlow,Arial';ctx.fillStyle='#d4c8bc';ctx.fillText('A CITY OF SUNSHINE. A NIGHT WITH NO RULES.',70,1038);ctx.font='9px Barlow,Arial';ctx.fillStyle='#b6a9ab';ctx.fillText(`STARRING  ${(state.cast||PEOPLE).map(c=>c.name).join('  ·  ')}`,70,1063,1000);drawBarcode(ctx,1610,1004,132,43);ctx.fillStyle='#d6c4b4';ctx.font='8px Barlow,Arial';ctx.textAlign='center';ctx.fillText('7 32109 44106 8',1676,1060);ctx.fillStyle='#f0c978';ctx.font='bold 10px Barlow,Arial';ctx.fillText('ORIGINAL FAN-STYLE COVER ART',1817,1031);
 ctx.strokeStyle='#ffdfae99';ctx.lineWidth=2;ctx.strokeRect(12,12,1896,1056);addTexture(ctx,w,h);ctx.restore();return ctx.canvas;
}
export function renderCover(ctx,state,assets,layoutId='hero',gradeId='golden',size={w:1080,h:1350}){
 const w=size.w||1080,h=size.h||1350;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,w,h);
 const grade=GRADES.find(g=>g.id===gradeId)||GRADES[0];if(w/h>1.45){ctx.restore();return renderLandscape(ctx,state,assets,grade);}const layout=LAYOUTS_DRAW[layoutId]||LAYOUTS_DRAW.hero;ctx.fillStyle=grade.bottom;ctx.fillRect(0,0,w,h);
 const sx=w/W,sy=h/1350;ctx.save();ctx.scale(sx,sy);
 const topGrad=ctx.createLinearGradient(0,0,0,1350);topGrad.addColorStop(0,grade.top);topGrad.addColorStop(.28,grade.mid);topGrad.addColorStop(.75,grade.bottom);topGrad.addColorStop(1,'#201622');ctx.fillStyle=topGrad;ctx.fillRect(0,0,W,1350);
 // assign all five unique people at least once per main layout
 layout.forEach((slot,i)=>{const person=PEOPLE[slot.p];drawTile(ctx,{x:slot.x*W,y:slot.y*1350,w:slot.w*W,h:slot.h*1350},person,assets,grade,i,(state.cast||[])[slot.p]||{});});
 // consistent tiny separators: pale gold panel rules
 ctx.strokeStyle='#ffe0ad';ctx.lineWidth=3;for(const slot of layout){ctx.strokeRect(slot.x*W+1.5,slot.y*1350+1.5,slot.w*W-3,slot.h*1350-3);}
 // subtle radial flare behind art, under all furniture
 drawHalo(ctx,880,294,310,grade.glow);
 ctx.restore();
 // The lead portrait floats over the side cells: a framed, offset plane breaks the mosaic seam without duplicating faces.
 if(layoutId==='hero'){
   ctx.save();ctx.strokeStyle='#fff0ca';ctx.lineWidth=Math.max(2,w/540);ctx.shadowColor='#120f1c';ctx.shadowBlur=w*.014;ctx.shadowOffsetX=w*.008;ctx.shadowOffsetY=w*.012;
   ctx.strokeRect(-.012*W*sx+.01*w,.012*1350*sy+.01*h,.695*W*sx,.835*1350*sy);ctx.restore();
 }
 // Furniture retains safe title band independent of layout/photo placement
 drawFurniture(ctx,w,h,state,grade,h>=w);
 addTexture(ctx,w,h);ctx.restore();return ctx.canvas;
}
export function getPeople(){return PEOPLE;}
export function getLayouts(){return LAYOUTS;}
export function getGrades(){return GRADES;}
export function getPhotoPath(person){return `./samples/${person.photo}`;}
export function faceSafeInfo(person){return {cx:person.cx,cy:person.cy,scale:person.scale};}
