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
  if(ROOMS[Engine.room]) Engine.setHotspots(ROOMS[Engine.room].spots());
}
function collectFragment(n){
  Engine.setFlag('frag' + n, true);
  G.fragments = Math.max(G.fragments, n);
  Sfx.fragment();
  drawMoonUI();
  saveGame();
  toast('그믐조각 ' + n + ' 을(를) 얻었다');
  Engine.fadeOut(() => {
    if(n < 6) chapterCard(n + 1);
  });
}
function chapterCard(n){
  const sc = document.getElementById('screen-card');
  document.getElementById('card-ch').textContent = '제 ' + n + ' 장';
  document.getElementById('card-title').textContent = CH_TITLES[n];
  sc.classList.remove('hidden');
  Sfx.page();
  setTimeout(() => {
    sc.classList.add('hidden');
    G.chapter = n;
    Engine.go('ch' + n);
    saveGame();
  }, 2400);
}
function drawMoonUI(){
  drawMoonPhase(null, document.getElementById('mooncv'), G.fragments);
}
const INTRO = [
  '달골 — 지도에도 없는 산골이다.',
  '할머니는 이 마을의 마지막\n「달지기」였다.',
  '장례를 마치고 유언장을 받아 든 나는,\n20년 만에 고향 집으로 돌아왔다.',
  '「사당을 정리하고, 그믐밤까지\n달집을 차려라.\n우물의 달이 지기 전에.」',
  '그날 밤부터 —\n방들은 두 개의 얼굴을 보여 주기 시작했다.'
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
    introIdx === INTRO.length - 1 ? '사랑채로' : '다음';
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
    c2.drawImage(bake('rabbit', true), 140, 60, 40, 40, 0, 0, 0, 0);
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
    showIntro();
  });
  document.getElementById('btn-continue').addEventListener('click', () => {
    Sfx.ensure(); Sfx.click();
    loadGame();
    Sfx.startAmbient();
    document.getElementById('screen-title').classList.add('hidden');
    drawMoonUI();
    Engine.go('ch' + Math.min(G.chapter, 6));
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
      chapterCard(1);
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
  document.getElementById('btn-sound').addEventListener('click', () => {
    const on = Sfx.toggle();
    document.getElementById('btn-sound').textContent = '소리: ' + (on ? '켬' : '끔');
    saveGame();
  });
  document.getElementById('btn-help').addEventListener('click', () => {
    document.getElementById('menu-overlay').classList.add('hidden');
    openReader('조작법', '· 화면을 눌러 조사한다\n· 아래 물건을 눌러 읽거나 확인한다\n· 제방을 누르면 이승(양)과 저승(음)이 뒤집힌다\n· 막히면 저승의 달토끼를 눌러 힌트를 듣는다\n· 힌트를 한 번도 쓰지 않으면 숨겨진 길이 열린다');
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
function boot(){
  Engine.init();
  bindUI();
  const has = loadGame();
  const progressed = has && (G.chapter > 1 || G.inv.length > 0 || Object.keys(G.flags).length > 0);
  if(progressed) document.getElementById('btn-continue').classList.remove('hidden');
  drawMoonUI();
  const tcv = setInterval(() => {
    if(!document.getElementById('screen-title').classList.contains('hidden')) drawTitle();
  }, 500);
  drawTitle();
}
boot();
