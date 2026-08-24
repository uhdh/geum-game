'use strict';
const STONE_YANG = [0, 2, 4];
const STONE_YIN = [1, 3];
const RHYTHM_PATTERNS = [
  [0, 2, 4],
  [0, 1, 3, 5],
  [0, 2, 3, 5, 7]
];
PZ_DEFS.rhythm = {
  title: '달토끼의 방아',
  build(panel){
    if(!G.flags.rhythmRound) G.flags.rhythmRound = 0;
    const round = Math.min(G.flags.rhythmRound, 2);
    const expected = RHYTHM_PATTERNS[round];
    const SLOTS = 8, SLOT_MS = 420;
    pzDesc(panel, '달토끼의 리듬을 그대로 따라 쳐라. 쉬는 칸은 치지 않는다. (' + (round+1) + '/3)');
    const cv2 = document.createElement('canvas');
    cv2.width = 160; cv2.height = 80;
    cv2.style.width = '240px';
    cv2.style.imageRendering = 'pixelated';
    panel.appendChild(cv2);
    const dots = document.createElement('div');
    dots.className = 'row';
    const dotEls = [];
    for(let i = 0; i < SLOTS; i++){
      const d = document.createElement('div');
      d.className = 'beat-dot';
      dots.appendChild(d);
      dotEls.push(d);
    }
    panel.appendChild(dots);
    const status = document.createElement('div');
    status.className = 'desc';
    status.style.textAlign = 'center';
    status.textContent = '토끼를 눌러 시작';
    panel.appendChild(status);
    const acts = document.createElement('div');
    acts.className = 'actions';
    acts.appendChild(pzBtn(panel, '나간다', pzClose));
    panel.appendChild(acts);
    const c2 = cv2.getContext('2d');
    let phase = 'idle', idx = 0, startAt = 0;
    let hitFlash = 0, rabFlash = 0, timers = [];
    function drawScene(){
      const P = pal();
      c2.fillStyle = P.bg; c2.fillRect(0, 0, 160, 80);
      c2.drawImage(bake('rabbit'), 24, 22, 32, 40);
      c2.drawImage(bake('mortar'), 96, 52, 32, 20);
      if(rabFlash > 0){ c2.globalAlpha = rabFlash; c2.fillStyle = P.glow; c2.fillRect(24, 22, 32, 22); c2.globalAlpha = 1; }
      if(hitFlash > 0){ c2.globalAlpha = hitFlash; c2.fillStyle = P.glow; c2.fillRect(96, 52, 32, 12); c2.globalAlpha = 1; }
    }
    function drawDots(cur, filled){
      dotEls.forEach((d, i) => {
        d.className = 'beat-dot' + (i === cur ? ' cur' : '') + (filled > i ? ' on' : '');
      });
    }
    function clearTimers(){ timers.forEach(t => clearTimeout(t)); timers = []; }
    function playSeq(){
      phase = 'watch'; idx = 0;
      status.textContent = '잘 들어...';
      expected.forEach((slot, i) => {
        timers.push(setTimeout(() => {
          Sfx.mortar(); rabFlash = 1; drawScene(); drawDots(slot, i);
        }, 600 + slot * SLOT_MS));
        timers.push(setTimeout(() => {
          rabFlash = 0; drawScene();
        }, 600 + slot * SLOT_MS + 200));
      });
      timers.push(setTimeout(() => {
        phase = 'input';
        startAt = performance.now();
        status.textContent = '따라 치시오! (0/' + expected.length + ')';
        drawDots(-1, 0);
      }, 600 + SLOTS * SLOT_MS));
    }
    cv2.addEventListener('pointerdown', () => {
      if(phase === 'idle'){ start(); return; }
      if(phase !== 'input') return;
      const slot = Math.round((performance.now() - startAt) / SLOT_MS);
      const want = expected[idx];
      if(Math.abs(slot - want) <= 1){
        Sfx.mortar();
        hitFlash = 1; drawScene();
        timers.push(setTimeout(() => { hitFlash = 0; drawScene(); }, 130));
        idx++;
        status.textContent = '따라 치시오! (' + idx + '/' + expected.length + ')';
        drawDots(want, idx);
        if(idx >= expected.length){
          phase = 'wait';
          timers.push(setTimeout(judge, 350));
        }
      } else {
        fail();
      }
    });
    function fail(){
      phase = 'wait';
      clearTimers();
      Sfx.fail();
      status.textContent = '어긋났다. 다시 들어보자.';
      drawDots(-1, 0);
      timers.push(setTimeout(playSeq, 900));
    }
    function judge(){
      if(round >= 2){
        clearTimers();
        pzSolved('rhythm', '달토끼가 고개를 끄덕인다');
      } else {
        G.flags.rhythmRound = round + 1;
        Engine.setFlag('rhythmRound', G.flags.rhythmRound);
        toast('토끼가 더 긴 리듬을 두드린다');
        clearTimers();
        pzClose();
        setTimeout(() => pzOpen('rhythm'), 400);
      }
    }
    function start(){
      phase = 'wait';
      playSeq();
    }
    const iv = setInterval(drawScene, 120);
    const obs = new MutationObserver(() => {
      if(document.getElementById('puzzle-layer').classList.contains('hidden')){
        clearInterval(iv);
        clearTimers();
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
    let done = false, ritualTimers = [];
    const obs = new MutationObserver(() => {
      if(document.getElementById('puzzle-layer').classList.contains('hidden')){
        ritualTimers.forEach(t => clearTimeout(t));
        obs.disconnect();
      }
    });
    obs.observe(document.getElementById('puzzle-layer'), { attributes:true });
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
    function refreshActs(){
      acts.innerHTML = '';
      if(placed.length < 5){
        acts.appendChild(pzBtn(panel, '나간다', pzClose));
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
    function place(){
      if(done) return;
      if(placed.length >= 5) return;
      Sfx.fragment();
      placed.push(1);
      drawRitual();
      refreshActs();
      status.textContent = '조각 ' + placed.length + ' / 5';
      if(placed.length === 5){
        done = true;
        status.textContent = '달이 차오른다...';
        for(let i = 0; i < 5; i++){
          ritualTimers.push(setTimeout(() => Sfx.mortar(i * 0.4), 600 + i * 400));
        }
        ritualTimers.push(setTimeout(showChoice, 600 + 5 * 400 + 600));
      }
    }
    cv2.addEventListener('pointerdown', place);
    drawRitual();
    refreshActs();
    status.textContent = '달 틀을 눌러라';
  }
};
