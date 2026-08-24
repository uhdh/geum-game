'use strict';
const STONE_YANG = [0, 2, 4];
const STONE_YIN = [1, 3];
PZ_DEFS.rhythm = {
  title: '달토끼의 방아',
  build(panel){
    if(!G.flags.rhythmRound) G.flags.rhythmRound = 0;
    const lens = [3, 4, 5];
    const round = G.flags.rhythmRound;
    pzDesc(panel, '달토끼가 두드리는 리듬을 그대로 따라 쳐라. (' + (round+1) + '/3)');
    const cv2 = document.createElement('canvas');
    cv2.width = 120; cv2.height = 70;
    cv2.style.width = '180px';
    cv2.style.imageRendering = 'pixelated';
    panel.appendChild(cv2);
    const status = document.createElement('div');
    status.className = 'desc';
    status.style.textAlign = 'center';
    status.textContent = '토끼를 눌러 시작';
    panel.appendChild(status);
    const c2 = cv2.getContext('2d');
    let seq = [], input = [], phase = 'idle', idx = 0, hitFlash = 0, rabFlash = 0;
    function drawScene(){
      const P = pal();
      c2.fillStyle = P.bg; c2.fillRect(0, 0, 120, 70);
      c2.drawImage(bake('rabbit'), 20, 18);
      c2.drawImage(bake('mortar'), 62, 40);
      if(rabFlash > 0){ c2.globalAlpha = rabFlash; c2.fillStyle = P.glow; c2.fillRect(20, 18, 14, 10); c2.globalAlpha = 1; }
      if(hitFlash > 0){ c2.globalAlpha = hitFlash; c2.fillStyle = P.glow; c2.fillRect(62, 40, 12, 5); c2.globalAlpha = 1; }
    }
    function playSeq(){
      phase = 'watch'; input = []; idx = 0;
      status.textContent = '듣는 중...';
      seq.forEach((s2, i) => {
        setTimeout(() => { Sfx.mortar(); rabFlash = 1; drawScene(); }, 500 + i * 520);
        setTimeout(() => { rabFlash = 0; drawScene(); }, 500 + i * 520 + 240);
      });
      setTimeout(() => {
        phase = 'input';
        status.textContent = '따라 치시오 (' + input.length + '/' + seq.length + ')';
      }, 500 + seq.length * 520);
    }
    cv2.addEventListener('pointerdown', () => {
      if(phase === 'idle'){ start(); return; }
      if(phase === 'watch') return;
      Sfx.mortar();
      hitFlash = 1; drawScene();
      setTimeout(() => { hitFlash = 0; drawScene(); }, 140);
      input.push(1);
      status.textContent = '따라 치시오 (' + input.length + '/' + seq.length + ')';
      if(input.length >= seq.length){
        phase = 'wait';
        setTimeout(judge, 400);
      }
    });
    function judge(){
      if(input.length === seq.length){
        if(round >= 2){
          pzSolved('rhythm', '달토끼가 고개를 끄덕인다');
        } else {
          G.flags.rhythmRound = round + 1;
          Engine.setFlag('rhythmRound', G.flags.rhythmRound);
          toast('토끼가 더 긴 리듬을 두드린다');
          pzClose();
          setTimeout(() => pzOpen('rhythm'), 400);
        }
      } else {
        Sfx.fail();
        status.textContent = '틀렸다. 다시 듣자.';
        setTimeout(playSeq, 700);
      }
    }
    function start(){
      seq = [];
      for(let i = 0; i < lens[round]; i++) seq.push(1);
      G.flags.rhythmSeq = seq;
      playSeq();
    }
    const iv = setInterval(drawScene, 120);
    const obs = new MutationObserver(() => {
      if(document.getElementById('puzzle-layer').classList.contains('hidden')){
        clearInterval(iv);
        obs.disconnect();
      }
    });
    obs.observe(document.getElementById('puzzle-layer'), { attributes:true });
    drawScene();
  }
};
PZ_DEFS.ritual = {
  title: '달집 — 그믐밤의 의식',
  build(panel){
    pzDesc(panel, '다섯 조각을 달 틀에 박아라.');
    const placed = [];
    const cv2 = document.createElement('canvas');
    cv2.width = 160; cv2.height = 90;
    cv2.style.width = '240px';
    cv2.style.imageRendering = 'pixelated';
    panel.appendChild(cv2);
    const c2 = cv2.getContext('2d');
    const status = document.createElement('div');
    status.className = 'desc';
    status.style.textAlign = 'center';
    panel.appendChild(status);
    const acts = document.createElement('div');
    acts.className = 'actions';
    panel.appendChild(acts);
    let done = false;
    function drawRitual(){
      const P = pal();
      c2.fillStyle = '#04060e'; c2.fillRect(0, 0, 160, 90);
      for(let i = 0; i < 40; i++){
        c2.fillStyle = '#3a4a6a';
        c2.fillRect((i*37)%160, (i*23)%80, 1, 1);
      }
      c2.fillStyle = placed.length >= 5 ? '#e8e0c0' : '#3a3a30';
      c2.beginPath(); c2.arc(80, 42, 30, 0, 7); c2.fill();
      placed.forEach((p, i) => {
        c2.fillStyle = '#7ae0d0';
        const a = (i / 5) * Math.PI * 2 - Math.PI/2;
        c2.fillRect(80 + Math.cos(a)*18 - 2, 42 + Math.sin(a)*18 - 2, 4, 4);
      });
      c2.drawImage(bake('rabbit', true), 8, 60);
      c2.drawImage(bake('mortar', true), 128, 66);
    }
    function place(){
      if(done) return;
      if(placed.length >= 5) return;
      Sfx.fragment();
      placed.push(1);
      drawRitual();
      status.textContent = '조각 ' + placed.length + ' / 5';
      if(placed.length === 5){
        done = true;
        status.textContent = '달이 차오른다...';
        for(let i = 0; i < 5; i++) setTimeout(() => Sfx.mortar(i * 0.4), 600 + i * 400);
        setTimeout(showChoice, 600 + 5 * 400 + 600);
      }
    }
    function showChoice(){
      status.textContent = '달이 물었다. 너는 어디로 가겠니.';
      acts.innerHTML = '';
      const b1 = pzBtn(panel, '건너간다', () => showEnding('a'));
      const b2 = pzBtn(panel, '머문다', () => showEnding('b'));
      acts.appendChild(b1); acts.appendChild(b2);
      if(G.hints === 0){
        const b3 = pzBtn(panel, '토끼에게 묻는다', () => showEnding('c'));
        acts.appendChild(b3);
      }
    }
    cv2.addEventListener('pointerdown', place);
    drawRitual();
    status.textContent = '달 틀을 눌러라';
  }
};
