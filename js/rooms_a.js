'use strict';
function drawRoomBase(c){
  const P = pal();
  px(P.wall, 0, 26, W, 62);
  dither(P.wall2, 0, 26, W, 62);
  px(P.floor, 0, 88, W, 58);
  dither(P.floor2, 0, 88, W, 58);
  px(P.woodDark, 0, 86, W, 3);
  px(P.shadow, 0, 26, W, 2);
  const gr = c.createLinearGradient(0, 0, 0, 146);
  gr.addColorStop(0, 'rgba(0,0,0,0.35)');
  gr.addColorStop(0.4, 'rgba(0,0,0,0)');
  gr.addColorStop(1, 'rgba(0,0,0,0.3)');
  c.fillStyle = gr;
  c.fillRect(0, 0, W, 146);
}
function drawRabbitHint(c, x, y, t){
  const bob = Math.sin(t * 2.2) > 0 ? 0 : 1;
  c.drawImage(bake('rabbit'), x, y - bob, 16, 20);
  if(Math.sin(t * 1.4) > 0.4) c.drawImage(bake('mortar'), x + 18, y + 10, 16, 10);
}
const ROOMS = {};
ROOMS.ch1 = {
  title: '제1장 · 사랑채 — 유언',
  onEnter(){
    Engine.say('장례가 끝난 첫날 밤이다. 유언장대 위에 할머니의 유언이 놓여 있다.');
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
    const bo = G.flags.byungOrder || [2,0,3,1];
    for(let i = 0; i < 4; i++) drawSeason(c, Engine.flag('p_byung') ? i : bo[i], 24 + i * 32, 38, 30, 42);
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
    if(G.yin) drawRabbitHint(c, 284, 98, t);
    if(Engine.flag('p_lock') && !Engine.flag('frag1')){
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
        openReader('유언장', '지호에게.\n\n사당을 정리하고, 그믐밤까지 달집을 차려라.\n우물의 달이 지기 전에.\n\n— 달골의 마지막 달지기');
        Engine.say('…달지기? 달골에서 산 적도 없는데.');
      } else {
        Engine.say('「그믐밤까지 달집을 차려라」');
      }
    }});
    s.push({ x:22, y:36, w:130, h:46, act:() => {
      if(!Engine.flag('p_byung')) pzOpen('byung');
      else Engine.say('네 계절이 바르게 걸린 병풍이다.');
    }});
    s.push({ x:200, y:44, w:80, h:50, act:() => {
      if(!Engine.flag('p_lock')) pzOpen('lock');
      else Engine.say('서랍은 비어 있다.');
    }});
    s.push({ x:0, y:40, w:14, h:70, act:() => Engine.say('밖은 아직 캐지 않았다. 할 일부터 끝내자.') });
    if(G.yin) s.push({ x:280, y:94, w:26, h:22, act:hintCh1 });
    if(Engine.flag('p_lock') && !Engine.flag('frag1'))
      s.push({ x:228, y:28, w:34, h:18, act:() => collectFragment(1) });
    return s;
  }
};
function hintCh1(){
  G.hints++; saveGame();
  Sfx.mortar();
  if(!Engine.flag('p_byung')) Engine.say('토끼가 병풍 쪽을 본다. …계절의 순서일까.');
  else if(!Engine.flag('p_lock')) Engine.say('토끼가 방아를 두드린다. 달-그-락. 세 글자.');
  else Engine.say('토끼가 서랍 위를 본다.');
}
ROOMS.ch2 = {
  title: '제2장 · 안채 — 어린 여름',
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
        ITEMS.diary1.text = '달력 20년 8월.\n\n그 아이는 여름에 물에 빠졌다.\n달골은 아이를 보내지 않았다.\n내가 붙잡았다. 우물의 달이\n아이를 여기 묶어 두었다.\n\n미안하다. 미안하다.';
        Engine.give('diary1');
        openReader('할머니의 일기 · 상', ITEMS.diary1.text);
        Engine.say('…무슨 뜻이지? 나는 여름에 물에 빠진 적이…');
      } else openReader('할머니의 일기 · 상', ITEMS.diary1.text);
    }});
    if(G.yin){
      s.push({ x:248, y:58, w:18, h:32, act:() => { G.hints++; saveGame(); Sfx.mortar(); hintCh2(); } });
      s.push({ x:150, y:66, w:16, h:30, act:() => { G.hints++; saveGame(); Sfx.mortar(); hintCh2(); } });
      s.push({ x:188, y:62, w:16, h:26, act:() => { G.hints++; saveGame(); Sfx.mortar(); hintCh2(); } });
    }
    if(Engine.flag('p_candle') && Engine.flag('p_doll') && !Engine.flag('frag2'))
      s.push({ x:260, y:28, w:30, h:16, act:() => collectFragment(2) });
    return s;
  }
};
function hintCh2(){
  if(!Engine.flag('read_crayon')) Engine.say('토끼가 벽의 낙서를 본다.');
  else if(!Engine.flag('p_doll')) Engine.say('토끼가 인형을 두드린다. 청-백-적-황-흑.');
  else if(G.yin && !Engine.flag('saw_yin_candles')) Engine.say('토끼가 촛대를 본다. 저승의 불빛을 기억해라.');
  else if(!Engine.flag('p_candle')) Engine.say('토끼가 촛대를 본다. 저승에서 본 그대로.');
  else Engine.say('토끼가 화장대를 본다.');
}
ROOMS.ch3 = {
  title: '제3장 · 부엌 — 제상',
  onEnter(){
    Engine.say('부엌이다. 그믐밤 제사를 준비하는 곳.');
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
    const fire = Math.sin(t * 7) > 0;
    px(P.flame, 36, fire ? 88 : 90, 6, fire ? 8 : 6);
    px(P.flame2, 38, 92, 4, 4);
    dspr('jar', 84, 96); dspr('jar', 100, 100);
    px(P.wood, 128, 62, 84, 10);
    px(P.woodDark, 132, 72, 6, 34); px(P.woodDark, 202, 72, 6, 34);
    px(P.paper, 132, 56, 76, 6);
    for(let i = 0; i < 4; i++) px(P.wood2, 132 + i * 20, 56, 1, 6);
    for(let i = 0; i < 3; i++) px(P.wood2, 132, 56 + i * 2, 76, 1);
    px(P.woodDark, 244, 30, 4, 34);
    for(let i = 0; i < 5; i++){
      const st = (G.flags.skewerState || [[],[],[],[],[]])[i] || [];
      px(P.wood2, 256 + i * 10, 30, 1, 26);
      st.forEach((v, j) => {
        if(v === 'e') return;
        px(v === 'g' ? P.accent : P.wood2, 253 + i * 10, 33 + j * 7, 7, 5);
      });
    }
    px(P.wood, 236, 84, 30, 4);
    px(P.woodDark, 238, 88, 3, 10); px(P.woodDark, 260, 88, 3, 10);
    if(!Engine.flag('read_recipe')){
      px(P.paper, 240, 76, 22, 8);
      px(P.paper2, 240, 76, 22, 1);
    }
    for(let i = 0; i < 6; i++){
      px(P.accent, 92 + (i % 3) * 8, 28 + Math.floor(i / 3) * 9 + Math.sin(t * 1.5 + i) * 1.5, 4, 5);
      px(P.wood2, 94 + (i % 3) * 8, 26 + Math.floor(i / 3) * 9, 1, 4);
    }
    if(G.yin) drawRabbitHint(c, 286, 96, t);
    if(Engine.flag('p_jesa') && Engine.flag('p_skewer') && !Engine.flag('frag3')){
      const a = 0.6 + 0.4 * Math.sin(t * 5);
      c.globalAlpha = a;
      dspr('frag', 38, 44);
      c.globalAlpha = 1;
    }
  },
  spots(){
    const s = [];
    s.push({ x:232, y:70, w:36, h:24, act:() => {
      if(!Engine.flag('read_recipe')){
        Engine.setFlag('read_recipe', true);
        openReader('낡은 요리책', '제사 예법.\n\n· 신위는 먼 줄 가운데\n· 어동서육 — 생선은 동쪽(오른), 고기는 서쪽(왼)\n· 좌포우혜 — 포는 맨 왼쪽, 혜는 맨 오른쪽\n· 홍동백서 — 붉은 과일은 오른, 흰 과일은 왼\n· 꼬치는 홀수 줄 대추, 짝수 줄 곶감');
        Engine.say('할머니가 매년 지키던 규칙이다.');
      } else openReader('낡은 요리책', '제사 예법.\n\n· 신위는 먼 줄 가운데\n· 어동서육 — 생선은 동쪽(오른), 고기는 서쪽(왼)\n· 좌포우혜 — 포는 맨 왼쪽, 혜는 맨 오른쪽\n· 홍동백서 — 붉은 과일은 오른, 흰 과일은 왼\n· 꼬치는 홀수 줄 대추, 짝수 줄 곶감');
    }});
    s.push({ x:244, y:26, w:60, h:40, act:() => {
      if(!Engine.flag('p_skewer')) pzOpen('skewer');
      else Engine.say('꼬치가 예법대로 꿰어져 있다.');
    }});
    s.push({ x:126, y:52, w:90, h:56, act:() => {
      if(!Engine.flag('p_jesa')) pzOpen('jesa');
      else Engine.say('제상이 차려졌다.');
    }});
    if(G.yin) s.push({ x:282, y:92, w:26, h:22, act:() => { G.hints++; saveGame(); Sfx.mortar(); hintCh3(); } });
    if(Engine.flag('p_jesa') && Engine.flag('p_skewer') && !Engine.flag('frag3'))
      s.push({ x:32, y:40, w:32, h:18, act:() => collectFragment(3) });
    return s;
  }
};
function hintCh3(){
  if(!Engine.flag('read_recipe')) Engine.say('토끼가 선반의 책을 본다.');
  else if(!Engine.flag('p_skewer')) Engine.say('토끼가 꼬치를 본다. 홀수엔 대추.');
  else if(!Engine.flag('p_jesa')) Engine.say('토끼가 제상을 본다. 신위는 먼 줄 가운데.');
  else Engine.say('토끼가 가마솥 위를 본다.');
}
