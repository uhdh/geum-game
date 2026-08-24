'use strict';
function drawRoomBase(c){
  const P = pal();
  px(P.wall, 0, 26, W, 62);
  dither(P.wall2, 0, 26, W, 62);
  for(let bx = 12; bx < W; bx += 48){
    px(P.wood2, bx, 26, 3, 62);
    px(P.woodDark, bx + 3, 26, 1, 62);
  }
  px(P.wood, 0, 34, W, 3);
  px(P.woodDark, 0, 37, W, 1);
  px(P.wood, 0, 80, W, 2);
  px(P.woodDark, 0, 82, W, 6);
  px(P.floor, 0, 88, W, 58);
  for(let fy = 92; fy < 146; fy += 7){
    px(P.floor2, 0, fy, W, 1);
    const off = (fy / 7 | 0) % 2 ? 24 : 0;
    for(let fx = off; fx < W; fx += 64){
      px(P.woodDark, fx, fy - 6, 1, 6);
    }
  }
  dither(P.woodDark, 0, 140, W, 6);
  px(P.woodDark, 0, 86, W, 3);
  px(P.shadow, 0, 26, W, 2);
  const gr = c.createLinearGradient(0, 0, 0, 146);
  gr.addColorStop(0, 'rgba(0,0,0,0.4)');
  gr.addColorStop(0.35, 'rgba(0,0,0,0)');
  gr.addColorStop(1, 'rgba(0,0,0,0.35)');
  c.fillStyle = gr;
  c.fillRect(0, 0, W, 146);
}
function contactShadow(c, x, y, w){
  c.globalAlpha = 0.3;
  dither(pal().shadow, x, y, w, 2);
  c.globalAlpha = 1;
}
function drawRabbitHint(c, x, y, t){
  const bob = Math.sin(t * 2.2) > 0 ? 0 : 1;
  c.drawImage(bake('rabbit'), x, y - bob, 16, 20);
  if(Math.sin(t * 1.4) > 0.4) c.drawImage(bake('mortar'), x + 18, y + 10, 16, 10);
}
function rabbitTap(){
  G.hints++;
  saveGame();
  Sfx.mortar();
  Engine.say(hintFor(Engine.room));
}
function drawClock(c, x, y, t){
  const P = pal();
  c.fillStyle = P.woodDark;
  c.beginPath(); c.arc(x + 16, y + 16, 16, 0, 7); c.fill();
  c.fillStyle = P.paper;
  c.beginPath(); c.arc(x + 16, y + 16, 13, 0, 7); c.fill();
  c.strokeStyle = P.ink;
  c.lineWidth = 1;
  const st = G.flags.clockState || [3, 10];
  const ha = (st[0] / 12) * Math.PI * 2 - Math.PI / 2;
  const ma = (st[1] / 12) * Math.PI * 2 - Math.PI / 2;
  c.beginPath(); c.moveTo(x + 16, y + 16);
  c.lineTo(x + 16 + Math.cos(ha) * 7, y + 16 + Math.sin(ha) * 7); c.stroke();
  c.beginPath(); c.moveTo(x + 16, y + 16);
  c.lineTo(x + 16 + Math.cos(ma) * 10, y + 16 + Math.sin(ma) * 10); c.stroke();
  c.fillStyle = P.accent;
  c.fillRect(x + 15, y + 15, 2, 2);
}
const ROOMS = {};
ROOMS.madang = {
  title: '달골 — 할머니의 댁',
  onEnter(){
    Engine.say('할머니의 댁 마당이다. 여섯 개의 문이 나를 기다린다.');
    Engine.setHotspots(this.spots());
  },
  onYin(){ Engine.setHotspots(this.spots()); },
  draw(c, t){
    const P = pal();
    px(P.sky, 0, 0, W, 120);
    for(let i = 0; i < 26; i++){
      c.globalAlpha = 0.25 + 0.25 * Math.sin(t * 2 + i);
      px('#8a9ab8', (i * 53) % W, (i * 31) % 50 + 14, 1, 1);
      c.globalAlpha = 1;
    }
    px(P.moon, 262, 26, 20, 20);
    px(P.sky, 267, 30, 11, 11);
    px(P.wall2, 0, 62, W, 48);
    dither(P.wall, 0, 62, W, 48);
    px(P.woodDark, 0, 60, W, 3);
    const doors = [
      { x:30, key:'ch1', frag:'frag1', n:'사' },
      { x:130, key:'ch2', frag:'frag2', n:'안' },
      { x:230, key:'ch3', frag:'frag3', n:'부' }
    ];
    doors.forEach(d => {
      px(P.wood, d.x, 30, 44, 32);
      frame(P.woodDark, d.x, 30, 44, 32);
      px(P.wood2, d.x + 4, 34, 36, 24);
      px(P.accent, d.x + 36, 46, 3, 3);
      c.fillStyle = P.paper;
      c.font = '7px monospace';
      c.textAlign = 'center';
      c.fillText(d.n, d.x + 22, 58);
      c.textAlign = 'left';
    });
    px(P.floor2, 0, 110, W, 36);
    dither(P.stone2, 0, 110, W, 36);
    const gates = [
      { x:30, key:'ch4', frag:'frag4', n:'사당' },
      { x:130, key:'ch5', frag:'frag5', n:'우물' },
      { x:230, key:'ch6', frag:null, n:'달집' }
    ];
    gates.forEach(g => {
      const locked = g.key === 'ch6' && G.fragments < 5;
      px(P.stone, g.x, 74, 44, 36);
      frame(locked ? P.stone2 : P.glow2, g.x, 74, 44, 36);
      px(P.woodDark, g.x + 8, 80, 28, 26);
      c.fillStyle = locked ? P.stone2 : P.paper;
      c.font = '7px monospace';
      c.textAlign = 'center';
      c.fillText(g.n, g.x + 22, 95);
      c.textAlign = 'left';
      if(locked){
        c.globalAlpha = 0.5 + 0.3 * Math.sin(t * 3);
        px(P.glow, g.x + 19, 100, 6, 2);
        c.globalAlpha = 1;
      }
    });
    const allDoors = doors.concat(gates);
    allDoors.forEach(d => {
      if(!d.frag) return;
      const got = Engine.flag(d.frag);
      c.globalAlpha = got ? (0.7 + 0.3 * Math.sin(t * 4)) : 0.18;
      c.drawImage(bake('frag'), d.x + 18, 16, 8, 8);
      c.globalAlpha = 1;
    });
    if(G.yin) drawRabbitHint(c, 288, 92, t);
  },
  spots(){
    const s = [];
    s.push({ x:30, y:28, w:46, h:36, act:() => Engine.go('ch1') });
    s.push({ x:130, y:28, w:46, h:36, act:() => Engine.go('ch2') });
    s.push({ x:230, y:28, w:46, h:36, act:() => Engine.go('ch3') });
    s.push({ x:30, y:74, w:46, h:36, act:() => Engine.go('ch4') });
    s.push({ x:130, y:74, w:46, h:36, act:() => Engine.go('ch5') });
    s.push({ x:230, y:74, w:46, h:36, act:() => {
      if(G.fragments >= 5) Engine.go('ch6');
      else {
        Sfx.fail();
        Engine.say('달집 문이 닫혀 있다. 그믐조각 ' + G.fragments + '/5 — 다른 방의 조각이 필요하다.');
      }
    }});
    s.push({ x:256, y:22, w:30, h:26, act:() => Engine.say('하늘의 달은 어긋나 있고, 우물의 달만이 이 마을에 있다.') });
    if(G.yin) s.push({ x:284, y:88, w:30, h:26, act:rabbitTap });
    return s;
  }
};
ROOMS.ch1 = {
  title: '사랑채 — 유언',
  onEnter(){
    Engine.say('사랑채다. 멈춘 벽시계와 유언장, 그리고 잠긴 서랍장.');
    Engine.setHotspots(this.spots());
  },
  onYin(){ Engine.setHotspots(this.spots()); },
  draw(c, t){
    const P = pal();
    drawRoomBase(c);
    px(P.woodDark, 258, 32, 52, 40);
    frame(P.wood2, 258, 32, 52, 40);
    px(P.sky, 261, 35, 46, 34);
    px(P.moon, 276, 40, 10, 10);
    px(P.sky, 278, 42, 6, 6);
    px(P.wood2, 282, 35, 2, 34);
    px(P.wood2, 261, 51, 46, 2);
    for(let i = 0; i < 4; i++) drawSeason(c, (G.flags.byungOrder || [0,1,2,3])[i], 24 + i * 32, 44, 30, 42);
    drawClock(c, 158, 30, t);
    px(P.wood, 200, 44, 80, 48);
    px(P.wood2, 200, 44, 80, 4);
    frame(P.woodDark, 200, 44, 80, 48);
    px(P.woodDark, 206, 54, 68, 16);
    px(P.woodDark, 206, 74, 68, 14);
    if(!Engine.flag('p_lock')) dspr('lock', 232, 58);
    else px(P.metal, 232, 58, 8, 8);
    px(P.wood, 148, 96, 44, 16);
    px(P.woodDark, 152, 112, 4, 8); px(P.woodDark, 184, 112, 4, 8);
    px(P.paper, 154, 90, 32, 8);
    px(P.paper2, 154, 90, 32, 1);
    if(!Engine.has('flint') && !G.flags.flintTaken){
      const a = 0.6 + 0.4 * Math.sin(t * 4);
      c.globalAlpha = a;
      c.drawImage(bake('flint'), 268, 66, 12, 12);
      c.globalAlpha = 1;
    }
    if(G.yin) drawRabbitHint(c, 284, 98, t);
    if(Engine.flag('p_clock') && Engine.flag('p_lock') && !Engine.flag('frag1')){
      const a = 0.6 + 0.4 * Math.sin(t * 5);
      c.globalAlpha = a;
      dspr('frag', 234, 32);
      c.globalAlpha = 1;
    }
  },
  spots(){
    const s = [];
    s.push({ x:148, y:84, w:48, h:30, act:() => {
      if(!Engine.flag('read_will')){
        Engine.setFlag('read_will', true);
        openReader('유언장', '지호에게.\n\n사당을 정리하고, 그믐밤까지 달집을 차려라.\n우물의 달이 지기 전에.\n\n할아버지는 보름달 뜨는 저녁 8시 30분에\n이 세상을 떠났다. 그 시각을 잊지 마라.\n\n— 달골의 마지막 달지기');
        Engine.say('…달지기? 달골에서 산 적도 없는데.');
      } else {
        openReader('유언장', '지호에게.\n\n사당을 정리하고, 그믐밤까지 달집을 차려라.\n우물의 달이 지기 전에.\n\n할아버지는 보름달 뜨는 저녁 8시 30분에\n이 세상을 떠났다. 그 시각을 잊지 마라.\n\n— 달골의 마지막 달지기');
      }
    }});
    s.push({ x:154, y:26, w:40, h:38, act:() => {
      if(!Engine.flag('p_clock')) pzOpen('clock');
      else Engine.say('시계가 째깍거리며 할아버지의 시간을 세고 있다.');
    }});
    s.push({ x:22, y:42, w:130, h:46, act:() => Engine.say('네 계절이 그려진 병풍이다. 봄 — 여름 — 가을 — 겨울.') });
    s.push({ x:200, y:44, w:80, h:50, act:() => {
      if(!Engine.flag('p_lock')) pzOpen('lock');
      else Engine.say('서랍은 비어 있다.');
    }});
    s.push({ x:0, y:40, w:14, h:70, act:() => Engine.go('madang') });
    s.push({ x:262, y:62, w:34, h:20, act:() => {
      if(!Engine.has('flint') && !G.flags.flintTaken){
        Engine.setFlag('flintTaken', true);
        Engine.give('flint');
      } else Engine.say('창턱은 텅 비었다.');
    }});
    if(G.yin) s.push({ x:280, y:94, w:26, h:22, act:rabbitTap });
    if(Engine.flag('p_clock') && Engine.flag('p_lock') && !Engine.flag('frag1'))
      s.push({ x:228, y:28, w:34, h:18, act:() => collectFragment(1) });
    return s;
  }
};
ROOMS.ch2 = {
  title: '안채 — 어린 여름',
  onEnter(){
    Engine.say('할머니의 방이다. 어린 시절 여름을 보냈던 곳.');
    Engine.setHotspots(this.spots());
  },
  onYin(){
    if(!Engine.flag('saw_yin_candles')){
      Engine.setFlag('saw_yin_candles', true);
      Engine.setFlag('yinCandlePattern', [1,0,1,1,0]);
      Engine.say('저승의 촛불이 — 1, 3, 4번째만 켜져 있다.');
    }
    Engine.setHotspots(this.spots());
  },
  draw(c, t){
    const P = pal();
    drawRoomBase(c);
    px(P.wood, 16, 76, 66, 14);
    px(P.cloth, 20, 62, 58, 16);
    dither(P.wood2, 20, 62, 58, 16);
    px(P.woodDark, 20, 90, 6, 22); px(P.woodDark, 72, 90, 6, 22);
    if(!Engine.has('cotton') && !G.flags.cottonTaken){
      const a = 0.6 + 0.4 * Math.sin(t * 4);
      c.globalAlpha = a;
      c.drawImage(bake('cotton'), 44, 56, 12, 10);
      c.globalAlpha = 1;
    }
    px(P.wood, 240, 52, 64, 8);
    px(P.wood, 244, 60, 56, 52);
    frame(P.woodDark, 244, 60, 56, 52);
    px(P.metal2, 250, 26, 44, 26);
    frame(P.woodDark, 250, 26, 44, 26);
    if(!Engine.flag('p_doll')) dspr('diary', 262, 44);
    const cols = Engine.flag('p_doll') ? [0,1,2,3,4] : (G.flags.dollState || [2,4,0,3,1]);
    drawDoll(c, 150, 92, cols);
    px(P.wood, 188, 78, 24, 34);
    px(P.woodDark, 190, 74, 20, 4);
    for(let i = 0; i < 5; i++){
      const lit = Engine.flag('p_candle') ? false : (G.yin ? [1,0,1,1,0][i] : (G.flags.candleState || [0,0,0,0,0])[i]);
      drawCandle(c, 192 + i * 4, 76, lit, t + i);
    }
    px(P.paper, 100, 34, 54, 26);
    px(P.paper2, 100, 34, 54, 2);
    const cray = ['#3a5a8a', '#d8d0b8', '#a33b2a', '#c9a030', '#1a1a1a'];
    for(let i = 0; i < 5; i++) px(cray[i], 106 + i * 9, 40, 5, 8);
    px('#8a5a6a', 106, 50, 40, 3);
    px(P.green, 84, 26, 4, 62);
    px(P.green, 96, 26, 3, 62);
    if(G.yin){
      const sh = 'rgba(3,6,12,0.85)';
      c.fillStyle = sh;
      c.fillRect(252, 66, 10, 22);
      c.beginPath(); c.arc(257, 62, 5, 0, 7); c.fill();
      c.fillRect(154, 74, 9, 20);
      c.beginPath(); c.arc(158, 70, 4, 0, 7); c.fill();
      c.fillRect(192, 70, 9, 18);
      c.beginPath(); c.arc(196, 66, 4, 0, 7); c.fill();
      drawRabbitHint(c, 120, 96, t);
    }
    if(Engine.flag('p_candle') && Engine.flag('p_doll') && !Engine.flag('frag2')){
      const a = 0.6 + 0.4 * Math.sin(t * 5);
      c.globalAlpha = a;
      dspr('frag', 266, 34);
      c.globalAlpha = 1;
    }
  },
  spots(){
    const s = [];
    s.push({ x:96, y:30, w:62, h:32, act:() => {
      if(!Engine.flag('read_crayon')){
        Engine.setFlag('read_crayon', true);
        openReader('벽의 낙서', '아이의 글씨:\n\n「하늘은 청, 쌀은 백,\n해는 적, 볕은 황, 밤은 흑.\n이 순서로 인형을 물들이면\n여름이 돌아온대요」');
        Engine.say('…내가 썼던 글씨다.');
      } else Engine.say('「청, 백, 적, 황, 흑」');
    }});
    s.push({ x:146, y:88, w:26, h:26, act:() => {
      if(!Engine.flag('p_doll')) pzOpen('doll');
      else Engine.say('인형이 온전한 오방색을 띤다.');
    }});
    s.push({ x:186, y:64, w:28, h:50, act:() => {
      if(!Engine.flag('p_candle')) pzOpen('candle');
      else Engine.say('촛불은 조용히 꺼져 있다.');
    }});
    s.push({ x:256, y:40, w:26, h:16, act:() => {
      if(!Engine.has('diary1')){
        Engine.give('diary1');
        openReader('할머니의 일기 · 상', ITEMS.diary1.text);
        Engine.say('…무슨 뜻이지? 나는 여름에 물에 빠진 적이…');
      } else openReader('할머니의 일기 · 상', ITEMS.diary1.text);
    }});
    s.push({ x:38, y:52, w:22, h:18, act:() => {
      if(!Engine.has('cotton') && !G.flags.cottonTaken){
        Engine.setFlag('cottonTaken', true);
        Engine.give('cotton');
      } else Engine.say('이불은 여전히 푹신하다.');
    }});
    s.push({ x:306, y:40, w:14, h:70, act:() => Engine.go('madang') });
    if(G.yin){
      s.push({ x:114, y:92, w:34, h:26, act:rabbitTap });
      s.push({ x:248, y:58, w:18, h:32, act:() => Engine.say('아이의 그림자가 창문을 향해 손을 뻗는다.') });
      s.push({ x:150, y:66, w:16, h:30, act:() => Engine.say('아이의 그림자가 인형을 바라본다. 오랫동안.') });
      s.push({ x:188, y:62, w:16, h:26, act:() => Engine.say('아이의 그림자가 촛대를 가리킨다.') });
    }
    if(Engine.flag('p_candle') && Engine.flag('p_doll') && !Engine.flag('frag2'))
      s.push({ x:260, y:28, w:30, h:16, act:() => collectFragment(2) });
    return s;
  }
};
ROOMS.ch3 = {
  title: '부엌 — 제상',
  onEnter(){
    Engine.say('부엌이다. 아궁이는 차갑고, 제상은 비어 있다.');
    Engine.setHotspots(this.spots());
  },
  onYin(){ Engine.setHotspots(this.spots()); },
  draw(c, t){
    const P = pal();
    drawRoomBase(c);
    px(P.stone2, 16, 70, 54, 42);
    px(P.stone, 16, 70, 54, 6);
    px(P.ink, 24, 56, 38, 16);
    px(P.wood2, 24, 52, 38, 5);
    const lit = Engine.flag('p_fire');
    const fire = Math.sin(t * 7) > 0;
    if(lit){
      px(P.flame, 34, fire ? 84 : 86, 10, fire ? 12 : 10);
      px(P.flame2, 36, 90, 6, 6);
    } else {
      px(P.flame2, 38, 92, 4, 3);
    }
    dspr('jar', 84, 96); dspr('jar', 100, 100);
    px(P.wood, 128, 62, 84, 10);
    px(P.woodDark, 132, 72, 6, 34); px(P.woodDark, 202, 72, 6, 34);
    px(Engine.flag('p_jesa') ? P.paper : P.paper2, 132, 56, 76, 6);
    if(Engine.flag('p_fire')){
      px(P.flame2, 150, 50, 3, 4);
      px(P.flame, 154, 48, 4, 6);
      px(P.flame2, 160, 50, 3, 4);
    }
    px(P.woodDark, 244, 30, 4, 34);
    for(let i = 0; i < 5; i++){
      px(P.wood2, 256 + i * 10, 30, 1, 26);
      for(let j = 0; j < 3; j++){
        px(i % 2 === 0 ? P.wood2 : P.accent, 253 + i * 10, 33 + j * 7, 7, 5);
      }
    }
    px(P.wood, 236, 84, 30, 4);
    px(P.woodDark, 238, 88, 3, 10); px(P.woodDark, 260, 88, 3, 10);
    px(Engine.flag('read_recipe') ? P.paper2 : P.paper, 240, 76, 22, 8);
    px(P.paper2, 240, 76, 22, 1);
    for(let i = 0; i < 6; i++){
      px(P.accent, 92 + (i % 3) * 8, 28 + Math.floor(i / 3) * 9 + Math.sin(t * 1.5 + i) * 1.5, 4, 5);
      px(P.wood2, 94 + (i % 3) * 8, 26 + Math.floor(i / 3) * 9, 1, 4);
    }
    if(G.yin) drawRabbitHint(c, 286, 96, t);
    if(Engine.flag('p_fire') && Engine.flag('p_jesa') && !Engine.flag('frag3')){
      const a = 0.6 + 0.4 * Math.sin(t * 5);
      c.globalAlpha = a;
      dspr('frag', 38, 44);
      c.globalAlpha = 1;
    }
  },
  spots(){
    const s = [];
    s.push({ x:16, y:52, w:56, h:60, act:() => {
      if(!Engine.flag('p_fire')) pzOpen('fire');
      else Engine.say('아궁이가 보글보글 끓고 있다.');
    }});
    s.push({ x:232, y:70, w:36, h:24, act:() => {
      const txt = '제사 예법.\n\n· 신위는 먼 줄 가운데\n· 어동서육 — 생선은 동쪽(오른), 고기는 서쪽(왼)\n· 좌포우혜 — 포는 맨 왼쪽, 혜는 맨 오른쪽\n· 홍동백서 — 붉은 과일은 오른, 흰 과일은 왼';
      if(!Engine.flag('read_recipe')){
        Engine.setFlag('read_recipe', true);
        openReader('낡은 요리책', txt);
        Engine.say('할머니가 매년 지키던 규칙이다.');
      } else openReader('낡은 요리책', txt);
    }});
    s.push({ x:126, y:52, w:90, h:56, act:() => {
      if(!Engine.flag('p_fire')){
        Engine.say('가마솥이 차갑다. 제상을 차리기 전에 불을 지펴야 한다.');
        return;
      }
      if(!Engine.flag('p_jesa')) pzOpen('jesa');
      else Engine.say('제상이 차려졌다.');
    }});
    s.push({ x:0, y:40, w:14, h:70, act:() => Engine.go('madang') });
    if(G.yin) s.push({ x:282, y:92, w:26, h:22, act:rabbitTap });
    if(Engine.flag('p_fire') && Engine.flag('p_jesa') && !Engine.flag('frag3'))
      s.push({ x:32, y:40, w:32, h:18, act:() => collectFragment(3) });
    return s;
  }
};
