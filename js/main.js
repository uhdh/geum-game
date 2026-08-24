'use strict';
const CH_TITLES = {
  1:'사랑채 — 유언', 2:'안채 — 어린 여름', 3:'부엌 — 제상',
  4:'사당 — 위패', 5:'우물 — 두 세계의 빛', 6:'달집 — 그믐밤'
};
function onPuzzleSolved(pid){
  if(pid === 'lock'){
    Engine.give('bell');
    Engine.say('서랍에서 작은 제방이 나왔다. 흔들면 — 세계가 뒤집힌다.');
  }
  if(pid === 'clock'){
    openReader('시계 뒤에 붙은 쪽지',
      '토끼가 방아를 두드리는 소리 — 「달그락」.\n\n그 첫 어절, 한 글자를\n소리 조각 셋으로 쪼개\n서랍의 자물쇠에 넣어라.');
  }
  if(ROOMS[Engine.room]) Engine.setHotspots(ROOMS[Engine.room].spots());
}
function fragCount(){
  return ['frag1','frag2','frag3','frag4','frag5'].filter(f => G.flags[f]).length;
}
function collectFragment(n){
  Engine.setFlag('frag' + n, true);
  G.fragments = fragCount();
  drawMoonUI();
  Sfx.fragment();
  toast('그믐조각 ' + n + ' 을(를) 얻었다 (' + G.fragments + '/5)');
  saveGame();
  if(ROOMS[Engine.room]) Engine.setHotspots(ROOMS[Engine.room].spots());
  if(G.fragments >= 5){
    setTimeout(() => Engine.say('조각 다섯 개... 이제 달집으로 가자.'), 800);
  } else {
    setTimeout(() => Engine.say('마당으로 돌아가 다른 방을 둘러보자.'), 800);
  }
}
function showRoomCard(title){
  const sc = document.getElementById('screen-card');
  document.getElementById('card-ch').textContent = '—';
  document.getElementById('card-title').textContent = title;
  sc.classList.remove('hidden');
  Sfx.page();
  setTimeout(() => sc.classList.add('hidden'), 1700);
}
function drawMoonUI(){
  drawMoonPhase(null, document.getElementById('mooncv'), G.fragments);
}
const INTRO = [
  '달골 — 지도에도 없는 산골이다.',
  '할머니는 이 마을의 마지막\n「달지기」였다.',
  '장례를 마치고 유언장을 받아 든 나는,\n20년 만에 고향 집으로 돌아왔다.',
  '「사당을 정리하고, 그믐밤까지\n달집을 차려라.\n우물의 달이 지기 전에.」',
  '마당에는 여섯 개의 문이 있다.\n어느 곳부터 살펴봐도 좋다.\n\n— 단, 모든 조각을 모아야\n달집의 문이 열린다.'
];
let introIdx = 0;
function showIntro(){
  document.getElementById('screen-title').classList.add('hidden');
  const sc = document.getElementById('screen-intro');
  sc.classList.remove('hidden');
  introIdx = 0;
  showIntroPage();
}
function showIntroPage(){
  document.getElementById('intro-text').textContent = INTRO[introIdx];
  Sfx.page();
  document.getElementById('btn-intro-next').textContent =
    introIdx === INTRO.length - 1 ? '마당으로' : '다음';
}
function hintFor(room){
  const F = k => Engine.flag(k);
  if(room === 'madang'){
    if(G.fragments >= 5) return '달집으로. 조각을 박고, 토끼의 리듬을 기억해라.';
    const done = [];
    if(F('frag1')) done.push('사랑채');
    if(F('frag2')) done.push('안채');
    if(F('frag3')) done.push('부엌');
    if(F('frag4')) done.push('사당');
    if(F('frag5')) done.push('우물');
    return '아직 손대지 않은 방이 있다: ' +
      ['사랑채','안채','부엌','사당','우물'].filter(n => done.indexOf(n) < 0).join(', ') +
      '. 어디부터 가도 좋다.';
  }
  if(room === 'ch1'){
    if(!F('read_will')) return '유언장대의 유언장부터 읽어라. 단서는 늘 종이에서 시작된다.';
    if(!F('p_clock')) return '벽시계 바늘을 맞춰라. 유언장이 말하는 시각 — 저녁 8시 30분.';
    if(!F('p_lock')) return '시계 뒤 쪽지를 읽었나? 「달그락」의 첫 글자 「달」 — ㄷ·ㅏ·ㄹ.';
    return '이방은 끝났다. 마당으로.';
  }
  if(room === 'ch2'){
    if(!F('read_crayon')) return '벽의 낙서 — 청·백·적·황·흑. 인형의 순서다.';
    if(!F('p_doll')) return '인형의 다섯 띠를 낙서 순서로 물들여라.';
    if(!F('saw_yin_candles')) return '제방을 흔들어 저승의 촛불을 확인해라.';
    if(!F('p_candle')) return '이승의 촛불을 저승에서 보던 그대로 — 1·3·4번째.';
    return '이방은 끝났다. 부엌 문은 마당 반대쪽에 있다.';
  }
  if(room === 'ch3'){
    if(!G.inv.includes('tinder')) return '부싯돈(사랑채)과 솜(안채)을 주워 인벤토리에서 조합해 불씨를 만들어라.';
    if(!F('p_fire')) return '아궁이에 불씨를 옮기고, 불꽃이 초록빛일 때 부솥질해라.';
    if(!F('p_jesa')) return '요리책의 예법대로 제상을 차려라. 신위는 먼 줄 가운데.';
    return '이방은 끝났다. 사당 문은 마당 뒤편에 있다.';
  }
  if(room === 'ch4'){
    if(!F('read_genealogy')) return '바닥의 족보 — 저울의 단서가 적혀 있다.';
    if(!F('p_scale')) return '저울: 넷 이상 올리고 좌우 무게가 같게. 곶감3·대추2·밤4·유과1·산자5.';
    if(!F('read_diary2') && !Engine.has('diary2')) return '봉인칸이 열렸다면 — 먼저 열어보라.';
    if(!F('p_ohaeng')) return '오행 벽장치: 목→화→토→금→수→목으로 이어라.';
    return '이방은 끝났다. 우물은 마당 오른쪽이다.';
  }
  if(room === 'ch5'){
    if(!F('read_stone_clue')) return '우물가 비석 — 이승의 빛 셋, 저승의 빛 둘.';
    if(!F('p_rhythm')) return '토끼의 리듬을 따라 쳐라. 쉬는 칸은 치지 않는다.';
    if(!F('p_stones')) return '제방으로 오가며 빛나는 돌을 확인 — 이승 셋 먼저, 저승 둘을 다음에.';
    return '이방은 끝났다.';
  }
  if(room === 'ch6'){
    return '다섯 조각을 달 틀에 박아라. 그다음은 달이 물을 것이다.';
  }
  return '마당에서 시작해라.';
}
function useMenuHint(){
  if(G.hints === 0){
    showModal('힌트를 볼까요?',
      '힌트를 한 번이라도 사용하면<br><b>숨겨진 결말</b>을 볼 수 없게 됩니다.',
      [
        { label:'취소', cls:'btn-sub', fn:null },
        { label:'힌트 보기', cls:'btn-primary', fn:function(){
            G.hints++;
            saveGame();
            openReader('달토끼의 힌트', hintFor(Engine.room));
          } }
      ]);
  } else {
    G.hints++;
    saveGame();
    openReader('달토끼의 힌트', hintFor(Engine.room));
  }
}
function showEnding(id){
  pzClose();
  G.endings[id] = true;
  saveGame();
  const sc = document.getElementById('screen-ending');
  const cv2 = document.getElementById('endcv');
  const c2 = cv2.getContext('2d');
  c2.imageSmoothingEnabled = false;
  const texts = {
    a:'달이 물에 닿아 부서진다.\n\n할머니의 손과 나의 손이 닿고,\n삼도천 저편에서 누군가 손을 흔든다.\n\n— 건너가는 자 · 엔딩 A —',
    b:'나는 조각을 다시 우물에 넣는다.\n\n달은 남고, 나는 남는다.\n내년 그믐밤, 또 다른 내가\n제를 지을 것이다.\n\n— 머무는 자 · 엔딩 B —',
    c:'달토끼가 모습을 드러낸다.\n방아를 쥔 손은 사람의 손이었다.\n\n「나는 첫 달지기, 너희의 시조다.\n달골의 달은 내가 시작했고 —\n네가 끝냈다. 잘 가거라.」\n\n— 토끼 · 히든 엔딩 —'
  };
  document.getElementById('end-text').textContent = texts[id];
  c2.fillStyle = '#04060e';
  c2.fillRect(0, 0, 320, 180);
  for(let i = 0; i < 40; i++){
    c2.fillStyle = '#3a4a6a';
    c2.fillRect((i * 41) % 320, (i * 37) % 100, 1, 1);
  }
  if(id === 'a'){
    c2.fillStyle = '#0a1428'; c2.fillRect(0, 110, 320, 70);
    for(let i = 0; i < 8; i++){
      c2.fillStyle = '#1a2a4a';
      c2.fillRect((i * 47 + 10) % 320, 118 + (i % 4) * 12, 40, 2);
    }
    c2.drawImage(bake('boat', true), 140, 96);
    c2.fillStyle = '#e8e0c0';
    c2.fillRect(150, 90, 3, 6);
    c2.fillRect(158, 90, 3, 6);
  } else if(id === 'b'){
    c2.fillStyle = '#101a2e'; c2.fillRect(40, 70, 240, 80);
    c2.fillStyle = '#0a1220';
    c2.beginPath(); c2.moveTo(30, 70); c2.lineTo(160, 40); c2.lineTo(290, 70); c2.fill();
    c2.fillStyle = '#cfe8e0';
    c2.fillRect(140, 84, 12, 12);
    c2.fillStyle = '#e8d8a0';
    c2.fillRect(150, 100, 6, 8);
  } else {
    c2.fillStyle = '#a8c0d8';
    c2.fillRect(120, 60, 80, 70);
    c2.fillStyle = '#04060e';
    c2.fillRect(140, 84, 10, 12);
    c2.fillRect(170, 84, 10, 12);
    c2.fillRect(148, 110, 24, 6);
    c2.fillStyle = '#a8c0d8';
    c2.fillRect(128, 30, 14, 34);
    c2.fillRect(178, 30, 14, 34);
  }
  sc.classList.remove('hidden');
  Sfx.fragment();
}
function drawTitle(){
  const cv2 = document.getElementById('titlecv');
  const c2 = cv2.getContext('2d');
  c2.imageSmoothingEnabled = false;
  c2.fillStyle = '#04060e';
  c2.fillRect(0, 0, 320, 180);
  for(let i = 0; i < 60; i++){
    c2.fillStyle = i % 3 ? '#3a4a6a' : '#8a9ab8';
    c2.fillRect((i * 67) % 320, (i * 43) % 130, 1, 1);
  }
  c2.fillStyle = '#cfe8e0';
  c2.beginPath(); c2.arc(230, 60, 34, 0, 7); c2.fill();
  c2.fillStyle = '#04060e';
  c2.beginPath(); c2.arc(216, 52, 30, 0, 7); c2.fill();
  c2.fillStyle = '#0a1220';
  c2.fillRect(0, 130, 320, 50);
  c2.fillStyle = '#060a14';
  c2.fillRect(40, 96, 90, 44);
  c2.beginPath(); c2.moveTo(30, 96); c2.lineTo(85, 70); c2.lineTo(140, 96); c2.fill();
  c2.fillStyle = '#e8d8a0';
  c2.fillRect(58, 110, 8, 10);
  c2.fillStyle = '#1a2a4a';
  c2.fillRect(160, 150, 60, 4);
  c2.fillStyle = '#7ae0d0';
  c2.globalAlpha = 0.5 + 0.3 * Math.sin(Date.now() / 400);
  c2.fillRect(184, 146, 8, 3);
  c2.globalAlpha = 1;
}
function bindUI(){
  document.getElementById('btn-new').addEventListener('click', () => {
    Sfx.ensure(); Sfx.click();
    wipeSave();
    Sfx.startAmbient();
    if(titleTimer) clearInterval(titleTimer);
    showIntro();
  });
  document.getElementById('btn-continue').addEventListener('click', () => {
    Sfx.ensure(); Sfx.click();
    loadGame();
    const map = {1:'ch1',2:'ch2',3:'ch3',4:'ch4',5:'ch5',6:'ch6'};
    const startRoom = G.room || map[G.chapter] || 'madang';
    if(!ROOMS[startRoom]) G.room = 'madang'; else G.room = startRoom;
    Sfx.startAmbient();
    if(titleTimer) clearInterval(titleTimer);
    document.getElementById('screen-title').classList.add('hidden');
    drawMoonUI();
    Engine.go(G.room);
  });
  document.getElementById('btn-intro-next').addEventListener('click', () => {
    Sfx.click();
    if(introIdx < INTRO.length - 1){
      introIdx++;
      showIntroPage();
    } else {
      document.getElementById('screen-intro').classList.add('hidden');
      G.seenIntro = true;
      drawMoonUI();
      Engine.go('madang');
    }
  });
  document.getElementById('btn-end-title').addEventListener('click', () => {
    Sfx.click();
    document.getElementById('screen-ending').classList.add('hidden');
    document.getElementById('screen-title').classList.remove('hidden');
    drawTitle();
  });
  document.getElementById('btn-menu').addEventListener('click', () => {
    Sfx.click();
    document.getElementById('menu-overlay').classList.remove('hidden');
    document.getElementById('btn-sound').textContent = '소리: ' + (Sfx.on ? '켬' : '끔');
  });
  document.getElementById('btn-resume').addEventListener('click', () => {
    Sfx.click();
    document.getElementById('menu-overlay').classList.add('hidden');
  });
  document.getElementById('btn-hint').addEventListener('click', () => {
    Sfx.click();
    document.getElementById('menu-overlay').classList.add('hidden');
    useMenuHint();
  });
  document.getElementById('btn-sound').addEventListener('click', () => {
    const on = Sfx.toggle();
    document.getElementById('btn-sound').textContent = '소리: ' + (on ? '켬' : '끔');
    saveGame();
  });
  document.getElementById('btn-help').addEventListener('click', () => {
    document.getElementById('menu-overlay').classList.add('hidden');
    openReader('조작법', '· 화면을 눌러 조사한다\n· 마당의 여섯 문은 언제든 자유롭게 오갈 수 있다\n· 인벤토리의 물건을 누르면 읽거나, 조합할 수 있다\n· 제방을 누르면 이승(양)과 저승(음)이 뒤집힌다\n· 막히면 메뉴의 힌트나 저승의 달토끼를 눌러라\n· 힌트를 한 번도 쓰지 않으면 숨겨진 결말이 열린다');
  });
  document.getElementById('btn-reset').addEventListener('click', () => {
    if(confirm('처음부터 다시 시작할까요? 저장이 지워집니다.')){
      wipeSave();
      location.reload();
    }
  });
  document.getElementById('reader-close').addEventListener('click', () => {
    Sfx.click();
    document.getElementById('reader').classList.add('hidden');
  });
}
function updateSoundBtn(){
  const b = document.getElementById('btn-sound');
  if(b) b.textContent = '소리: ' + (Sfx.on ? '켬' : '끔');
}
let titleTimer = null;
function boot(){
  Engine.init();
  bindUI();
  if('serviceWorker' in navigator && location.protocol !== 'file:'){
    navigator.serviceWorker.register('./sw.js').catch(function(){});
  }
  const has = loadGame();
  const progressed = has && (G.chapter > 1 || G.inv.length > 0 || Object.keys(G.flags).length > 1);
  if(progressed) document.getElementById('btn-continue').classList.remove('hidden');
  const owned = ['a','b','c'].filter(k => G.endings && G.endings[k]);
  if(owned.length){
    const names = { a:'A 건너가는 자', b:'B 머무는 자', c:'C 토끼' };
    document.getElementById('ending-note').textContent =
      '도달한 결말 — ' + owned.map(k => names[k]).join(' · ');
  }
  drawMoonUI();
  titleTimer = setInterval(() => {
    if(!document.getElementById('screen-title').classList.contains('hidden')) drawTitle();
  }, 500);
  drawTitle();
}
boot();
