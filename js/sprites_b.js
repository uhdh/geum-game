'use strict';
function drawSeason(c, kind, x, y, w, h){
  const P = pal();
  px(P.paper, x, y, w, h);
  frame(P.woodDark, x, y, w, h);
  if(kind === 0){
    px('#8a5a6a', x+2, y+h-6, w-4, 4);
    for(let i = 0; i < 5; i++){
      px('#c86a8a', x+4+(i*5)%(w-8), y+3+(i*3)%(h-9), 2, 2);
    }
    px(P.wood2, x+w/2-1, y+h-10, 2, 6);
  } else if(kind === 1){
    px('#3a6a8a', x+2, y+h/2, w-4, h/2-3);
    for(let i = 0; i < 3; i++)
      px('#7ab0c8', x+3+((i*7)%(w-6)), y+h/2+1+i*2, 3, 1);
    px(P.glow2, x+w-8, y+3, 4, 4);
  } else if(kind === 2){
    px(P.moon, x+w-9, y+3, 5, 5);
    px(P.paper, x+w-8, y+3, 4, 5);
    px('#a85a2a', x+2, y+h-6, w-4, 4);
    px('#7a3a1a', x+4, y+h-8, 2, 2);
    px('#8a4a1a', x+w-7, y+h-9, 2, 2);
  } else {
    px(P.wall2, x+2, y+2, w-4, h-7);
    for(let i = 0; i < 6; i++)
      px(P.white, x+3+(i*6)%(w-6), y+3+(i*4)%(h-9), 1, 1);
    px(P.white, x+2, y+h-6, w-4, 4);
  }
}
function drawDoll(c, x, y, cols){
  const P = pal();
  px(P.wood2, x+3, y, 4, 4);
  px(P.paper, x+2, y+4, 6, 6);
  const bandCols = ['#3a5a8a', '#d8d0b8', '#a33b2a', '#c9a030', '#1a1a1a'];
  for(let i = 0; i < 5; i++){
    const col = cols[i] !== undefined ? bandCols[cols[i]] : P.wood2;
    px(col, x+1, y+10+i, 8, 1);
  }
  px(P.ink, x+4, y+1, 1, 1); px(P.ink, x+6, y+1, 1, 1);
}
function drawCandle(c, x, y, lit, t){
  const P = pal();
  px(P.paper2, x, y-8, 2, 8);
  if(lit){
    const f = Math.sin(t*10 + x) > 0 ? 0 : 1;
    px(P.flame, x-1+f, y-12, 3, 4);
    px(P.flame2, x+f, y-10, 2, 2);
  }
}
function drawTablet(c, x, y, w, h, label){
  const P = pal();
  px(P.wood2, x, y, w, h);
  frame(P.woodDark, x, y, w, h);
  px(P.paper, x+2, y+2, w-4, h-4);
  c.fillStyle = P.ink;
  c.font = '7px monospace';
  c.textAlign = 'center';
  const parts = label.split(' ');
  parts.forEach((p, i) => c.fillText(p, x + w/2, y + 9 + i*8));
  c.textAlign = 'left';
}
function drawStone(c, x, y, glow, t){
  const P = pal();
  px(P.stone, x, y, 8, 7);
  px(P.stone2, x+1, y+1, 3, 2);
  if(glow){
    const a = 0.6 + 0.4 * Math.sin(t*4 + x);
    c.globalAlpha = a;
    px(P.glow, x+2, y+2, 4, 3);
    c.globalAlpha = 1;
  }
}
function drawMoonPhase(c, cv2, n){
  const c2 = cv2.getContext('2d');
  c2.clearRect(0, 0, cv2.width, cv2.height);
  const cx2 = cv2.width/2, cy2 = cv2.height/2, r = 10;
  c2.fillStyle = '#1a2438';
  c2.beginPath(); c2.arc(cx2, cy2, r+1, 0, 7); c2.fill();
  c2.fillStyle = n >= 5 ? '#e8e0c0' : '#b8b090';
  c2.beginPath(); c2.arc(cx2, cy2, r, 0, 7); c2.fill();
  if(n < 5){
    c2.fillStyle = '#1a2438';
    const k = 5 - n;
    c2.beginPath(); c2.arc(cx2 - k*2.2, cy2, r, 0, 7); c2.fill();
    if(n > 0){
      c2.fillStyle = '#b8b090';
      c2.beginPath(); c2.arc(cx2, cy2, r - k*1.2, 0, 7); c2.fill();
    }
  }
}
