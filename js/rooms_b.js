'use strict';
ROOMS.ch4 = {
  title: '제4장 · 사당 — 위패',
  onEnter(){
    Engine.say('사당이다. 조상의 위패가 켜마다 놓여 있고, 맨 아래 칸은 봉인돼 있다.');
    Engine.setHotspots(this.spots());
  },
  onYin(){ Engine.setHotspots(this.spots()); },
  draw(c, t){
    const P = pal();
    drawRoomBase(c);
    px(P.wood, 60, 34, 200, 10);
    px(P.woodDark, 60, 44, 200, 4);
    const order = G.flags.tabletOrder || ['경오','갑자','임신','병인','무진'];
    for(let i = 0; i < 5; i++) drawTablet(c, 68 + i * 38, 48, 32, 34, order[i]);
    px(P.wood, 60, 88, 200, 8);
    px(P.woodDark, 60, 96, 200, 4);
    px(P.woodDark, 216, 100, 44, 20);
    px(P.metal2, 234, 106, 8, 8);
    px(P.paper2, 220, 104, 36, 12);
    px(P.wood, 16, 40, 34, 60);
    frame(P.woodDark, 16, 40, 34, 60);
    const els = ['목','화','토','금','수'];
    const L = G.flags.ohaengLinks || [];
    const pos = [[33,52],[24,66],[42,66],[24,84],[42,84]];
    c.strokeStyle = P.metal2;
    c.lineWidth = 1;
    L.forEach(l => {
      c.beginPath();
      c.moveTo(pos[l[0]][0], pos[l[0]][1]);
      c.lineTo(pos[l[1]][0], pos[l[1]][1]);
      c.stroke();
    });
    els.forEach((e, i) => {
      px(Engine.flag('p_ohaeng') ? P.glow : P.metal, pos[i][0]-4, pos[i][1]-4, 8, 8);
      c.fillStyle = P.ink;
      c.font = '6px monospace';
      c.textAlign = 'center';
      c.fillText(e, pos[i][0], pos[i][1]+2);
      c.textAlign = 'left';
    });
    drawCandle(c, 280, 60, true, t);
    drawCandle(c, 292, 60, true, t + 2);
    px(P.paper, 276, 62, 4, 26);
    px(P.paper, 288, 62, 4, 26);
    px(P.paper, 130, 100, 24, 10);
    px(Engine.flag('read_genealogy') ? P.paper2 : P.paper, 130, 100, 24, 10);
    px(P.paper2, 130, 100, 24, 1);
    if(G.yin) drawRabbitHint(c, 286, 96, t);
    if(Engine.flag('p_tablets') && Engine.flag('p_ohaeng') && !Engine.flag('frag4')){
      const a = 0.6 + 0.4 * Math.sin(t * 5);
      c.globalAlpha = a;
      dspr('frag', 152, 20);
      c.globalAlpha = 1;
    }
  },
  spots(){
    const s = [];
    s.push({ x:60, y:34, w:200, h:50, act:() => {
      if(!Engine.flag('p_tablets')) pzOpen('tablets');
      else Engine.say('위패가 바른 차례로 놓였다.');
    }});
    s.push({ x:214, y:98, w:48, h:24, act:() => {
      if(!Engine.flag('p_tablets')){ Engine.say('봉인이 풀리지 않는다. 위패의 차례가 어긋나 있다.'); return; }
      if(!Engine.has('diary2')){
        ITEMS.diary2.text = '달력 20년 9월.\n\n달지기는 아이를 지키는 자가 아니었다.\n아이가 저승으로 건너가는 마지막 길을\n밝히는 자였다.\n\n나는 겁이 났다. 그믐밤이 올 때마다\n제를 지었지만, 조각을 물에 띄우지 못했다.\n이제 나의 시간도 다한다.\n지호야, 사당의 봉인을 열어라.\n너의 이름을 확인하고, 그믐밤에 달집에 나라.';
        Engine.give('diary2');
        openReader('봉인 칸 — 낡은 위패', '위패에는 이렇게 새겨 있다.\n\n「김지호 — 세상을 떠나다\n20년 전 그믐밤」\n\n…내 이름이다.');
        Engine.say('…이건. 내 위패.');
        setTimeout(() => Engine.say('나는 — 20년 전 여름에 죽었던 건가.'), 2500);
      } else openReader('낡은 위패', '「김지호 — 세상을 떠나다 20년 전 그믐밤」');
    }});
    s.push({ x:16, y:40, w:34, h:60, act:() => {
      if(!Engine.flag('p_ohaeng')) pzOpen('ohaeng');
      else Engine.say('오행의 순환이 조용히 돌고 있다.');
    }});
    s.push({ x:126, y:96, w:30, h:18, act:() => {
      if(!Engine.flag('read_genealogy')){
        Engine.setFlag('read_genealogy', true);
        openReader('족보', '달골 김씨 세계.\n\n위패는 간의 차례로 세운다.\n간은 — 갑 · 을 · 병 · 정 · 무 · 기 · 경 · 신 · 임 · 계\n지는 — 자 · 축 · 인 · 묘 · 진 · 사 · 오 · 미 · 신 · 유 · 술 · 해');
      } else Engine.say('족보: 갑을병정무기경임계 / 자축인묘진사오미신유술해');
    }});
    if(G.yin) s.push({ x:282, y:92, w:26, h:22, act:() => { G.hints++; saveGame(); Sfx.mortar(); hintCh4(); } });
    if(Engine.flag('p_tablets') && Engine.flag('p_ohaeng') && !Engine.flag('frag4'))
      s.push({ x:146, y:16, w:32, h:16, act:() => collectFragment(4) });
    return s;
  }
};
function hintCh4(){
  if(!Engine.flag('read_genealogy')) Engine.say('토끼가 바닥의 족보를 본다.');
  else if(!Engine.flag('p_tablets')) Engine.say('토끼가 위패를 본다. 간의 순서대로.');
  else if(!Engine.has('diary2')) Engine.say('토끼가 봉인 칸을 본다. 위패부터.');
  else if(!Engine.flag('p_ohaeng')) Engine.say('토끼가 벽장치를 본다. 목은 화를 낳고, 화는 토를 낳는다.');
  else Engine.say('토끼가 사당 천장을 본다.');
}
ROOMS.ch5 = {
  title: '제5장 · 우물 — 두 세계의 빛',
  onEnter(){
    Engine.say('뒤뜰 우물이다. 물 대신 달이 우물 안에 떠 있다.');
    Engine.setHotspots(this.spots());
  },
  onYin(){ Engine.setHotspots(this.spots()); },
  draw(c, t){
    const P = pal();
    px(P.sky, 0, 0, W, 120);
    for(let i = 0; i < 30; i++){
      const a = 0.3 + 0.3 * Math.sin(t * 2 + i);
      c.globalAlpha = a;
      px('#8a9ab8', (i * 53) % W, (i * 29) % 60 + 14, 1, 1);
      c.globalAlpha = 1;
    }
    px(P.moon, 250, 24, 22, 22);
    px(P.sky, 256, 28, 12, 12);
    px(P.stone2, 0, 110, W, 36);
    dither(P.stone, 0, 110, W, 36);
    c.drawImage(bake('well'), 130, 58, 54, 48);
    px(P.glow, 148, 96, 24, 3);
    const seen = G.flags.stoneSeen || [];
    for(let k = 0; k < 5; k++){
      if(k < seen.length){
        px(k < 3 ? P.paper : P.glow, 138 + k * 8, 50, 4, 4);
      } else {
        px(P.woodDark, 138 + k * 8, 50, 4, 4);
      }
    }
    STONE_YANG.concat(STONE_YIN).forEach(i => {
      const sx = 40 + i * 50, sy = 100 + (i % 2) * 8;
      const glow = STONE_YANG.includes(i) ? !G.yin : G.yin;
      drawStone(c, sx, sy, glow && !Engine.flag('p_stones'), t + i * 2);
    });
    drawRabbitHint(c, 226, 84, t);
    px(P.stone, 288, 70, 18, 26);
    px(P.glow, 292, 76, 10, 10);
    if(Engine.flag('p_rhythm') && Engine.flag('p_stones') && !Engine.flag('frag5')){
      const a = 0.6 + 0.4 * Math.sin(t * 5);
      c.globalAlpha = a;
      dspr('frag', 148, 48);
      c.globalAlpha = 1;
    }
  },
  spots(){
    const s = [];
    for(let i = 0; i < 5; i++){
      const sx = 40 + i * 50, sy = 100 + (i % 2) * 8;
      s.push({ x:sx - 4, y:sy - 4, w:16, h:15, act:() => tapStone(i) });
    }
    s.push({ x:224, y:76, w:36, h:20, act:() => {
      if(!Engine.flag('p_rhythm')) pzOpen('rhythm');
      else Engine.say('토끼는 방아를 다 쳤다.');
    }});
    s.push({ x:130, y:56, w:56, h:50, act:() => Engine.say(G.yin
      ? '우물 속 달이 탁하다. 이쪽에서는 빛이 두 개뿐이다.'
      : '우물 속 달이 선명하다. 이쪽에서는 빛이 셋이다.') });
    s.push({ x:284, y:66, w:26, h:32, act:() => {
      if(!Engine.flag('read_stone_clue')){
        Engine.setFlag('read_stone_clue', true);
        openReader('우물가의 비석', '「두 세계의 빛을 울려라.\n이승의 빛 셋을 먼저,\n저승의 빛 둘을 그다음에.\n같은 돌을 두 번 울릴 수 없고,\n순서가 어긋나면 달은 다시 잠든다」');
        Engine.say('제방으로 이승과 저승을 오가며 빛나는 돌을 찾아라.');
      } else Engine.say('「이승의 빛 셋, 저승의 빛 둘 — 두 번 울림 없이」');
    }});
    s.push({ x:0, y:120, w:30, h:26, act:() => Engine.say('조각을 모으면 저절로 다음 길이 열린다.') });
    if(Engine.flag('p_rhythm') && Engine.flag('p_stones') && !Engine.flag('frag5'))
      s.push({ x:144, y:44, w:32, h:18, act:() => collectFragment(5) });
    return s;
  }
};
function tapStone(i){
  if(Engine.flag('p_stones')){ Engine.say('돌은 이미 조용하다.'); return; }
  let seen = G.flags.stoneSeen || [];
  if(seen.includes(i)){ toast('이미 울린 돌이다'); return; }
  const yangPhase = seen.length < 3;
  const isYang = STONE_YANG.includes(i);
  if(yangPhase === isYang){
    seen = seen.concat([i]);
    G.flags.stoneSeen = seen;
    Sfx.tone(420 + seen.length * 90, .3, 'sine', .12);
    if(seen.length === 3) Engine.say('이승의 빛 셋이 울렸다. 이제 저승의 빛을 울려라.');
    if(seen.length >= 5){
      Engine.setFlag('p_stones', true);
      Engine.say('다섯 빛이 우물 속 달을 비춘다.');
    }
    saveGame();
  } else {
    G.flags.stoneSeen = [];
    Sfx.fail();
    Engine.say(yangPhase
      ? '달이 다시 잠든다. 이승의 빛 셋부터 다시.'
      : '달이 다시 잠든다. 남은 저승의 빛부터 다시.');
  }
  Engine.setHotspots(ROOMS.ch5.spots());
}
ROOMS.ch6 = {
  title: '제6장 · 달집 — 그믐밤',
  onEnter(){
    Engine.say('달집 앞이다. 소나무 틀에 다섯 개의 조각 홈이 비어 있고, 달토끼가 방아를 멈추고 이쪽을 본다.');
    setTimeout(() => Engine.say('…이제 보내줘도 되는 걸까.'), 2600);
    Engine.setHotspots(this.spots());
  },
  onYin(){ Engine.setHotspots(this.spots()); },
  draw(c, t){
    const P = pal();
    px(P.sky, 0, 0, W, 130);
    for(let i = 0; i < 30; i++){
      const a = 0.3 + 0.3 * Math.sin(t * 2 + i);
      c.globalAlpha = a;
      px('#8a9ab8', (i * 47) % W, (i * 31) % 70 + 14, 1, 1);
      c.globalAlpha = 1;
    }
    px(P.moon, 140, 22, 34, 34);
    px(P.sky, 148, 28, 18, 18);
    px(P.stone2, 0, 118, W, 28);
    dither(P.stone, 0, 118, W, 28);
    px(P.wood, 96, 60, 128, 8);
    px(P.woodDark, 100, 68, 6, 50);
    px(P.woodDark, 214, 68, 6, 50);
    for(let i = 0; i < 5; i++){
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const x = 160 + Math.cos(a) * 34, y = 84 + Math.sin(a) * 22;
      px(P.wood2, x - 5, y - 5, 10, 10);
      frame(P.woodDark, x - 5, y - 5, 10, 10);
      if(Engine.flag('frag1') && Engine.flag('frag2') && Engine.flag('frag3') && Engine.flag('frag4') && Engine.flag('frag5')){
        c.globalAlpha = 0.5 + 0.3 * Math.sin(t * 3 + i);
        px(P.glow, x - 2, y - 2, 4, 4);
        c.globalAlpha = 1;
      }
    }
    drawRabbitHint(c, 40, 96, t);
    px(P.paper, 250, 92, 30, 20);
    px(P.paper2, 250, 92, 30, 2);
  },
  spots(){
    const s = [];
    s.push({ x:96, y:56, w:128, h:64, act:() => {
      const all = ['frag1','frag2','frag3','frag4','frag5'].every(f => Engine.flag(f));
      if(!all){ Engine.say('조각 다섯 개가 필요하다.'); return; }
      pzOpen('ritual');
    }});
    s.push({ x:36, y:92, w:30, h:24, act:() => {
      G.hints++; saveGame(); Sfx.mortar();
      Engine.say('토끼가 달집을 두드린다. 달그락, 달그락. …이제 보내줘도 되는 걸까.');
    }});
    s.push({ x:246, y:88, w:38, h:26, act:() => {
      openReader('달집의 헌 종이', '그믐밤의 제.\n\n다섯 조각을 달 틀에 박고,\n방아 다섯 번을 울려라.\n달이 물을 것이다 — 너는 어디로 가겠느냐고.');
    }});
    return s;
  }
};
