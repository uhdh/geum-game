'use strict';
const W = 320, H = 180;
let ctx;
const PAL = {
  yang: {
    bg:'#241e12', wall:'#4a3f2a', wall2:'#3e3522', floor:'#5a4c32', floor2:'#4c4028',
    wood:'#6a5636', wood2:'#544428', woodDark:'#3a2e1c', paper:'#c9b892', paper2:'#a89870',
    ink:'#2a2014', accent:'#a33b2a', metal:'#8a8a92', metal2:'#5c5c64',
    cloth:'#7a5a3a', glow:'#e8d8a0', glow2:'#c9b060', shadow:'#161006', white:'#d8d0b8',
    flame:'#e8a040', flame2:'#c96020', green:'#4a5c34', stone:'#6a6a62', stone2:'#54544c',
    sky:'#1a1812', moon:'#e8e0c0'
  },
  yin: {
    bg:'#060a14', wall:'#16223a', wall2:'#101a2e', floor:'#1c2a46', floor2:'#16203a',
    wood:'#2a3a5c', wood2:'#22304c', woodDark:'#141e34', paper:'#8aa0c0', paper2:'#68809c',
    ink:'#0a1220', accent:'#3a7a8c', metal:'#5a6a8a', metal2:'#42506c',
    cloth:'#2a4a5c', glow:'#7ae0d0', glow2:'#4aa898', shadow:'#03060c', white:'#a8c0d8',
    flame:'#6ac8c0', flame2:'#3a8878', green:'#2a4a44', stone:'#3a4660', stone2:'#2c3850',
    sky:'#04060e', moon:'#cfe8e0'
  }
};
function pal(){ return G.yin ? PAL.yin : PAL.yang; }
function px(c, x, y, w, h){ ctx.fillStyle = c; ctx.fillRect(x|0, y|0, w|0, h|0); }
function dither(c, x, y, w, h){
  ctx.fillStyle = c;
  for(let j = 0; j < h; j++)
    for(let i = (j & 1); i < w; i += 2)
      ctx.fillRect((x|0)+i, (y|0)+j, 1, 1);
}
function frame(c, x, y, w, h){
  px(c, x, y, w, 1); px(c, x, y+h-1, w, 1);
  px(c, x, y, 1, h); px(c, x+w-1, y, 1, h);
}
