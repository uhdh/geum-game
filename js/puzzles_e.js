'use strict';
// ---- 벽시계 ----
PZ_DEFS.clock = {
  title: '낡은 벽시계',
  build(panel){
    pzDesc(panel, Engine.flag('read_will')
      ? '「할아버지는 보름달 뜨는 저녁 8시 30분에 이 세상을 떠났다」 — 바늘을 맞춰라.'
      : '멈춘 벽시계. 유언장에 무언가 적혀 있었던 것 같다.');
    if(!G.flags.clockState) G.flags.clockState = [3, 10];
    const s = G.flags.clockState;
    let done = false;
    const cv2 = document.createElement('canvas');
    cv2.width = 120; cv2.height = 120;
    cv2.style.width = '180px';
    cv2.style.imageRendering = 'pixelated';
    cv2.style.display = 'block';
    cv2.style.margin = '0 auto';
    panel.appendChild(cv2);
    const c2 = cv2.getContext('2d');
    const acts = document.createElement('div');
    acts.className = 'actions';
    const rowH = document.createElement('div');
    rowH.className = 'actions';
    rowH.appendChild(pzBtn(panel, '시침 ◀', () => moveHour(-1)));
    rowH.appendChild(pzBtn(panel, '시침 ▶', () => moveHour(1)));
    const rowM = document.createElement('div');
    rowM.className = 'actions';
    rowM.appendChild(pzBtn(panel, '분침 ◀', () => moveMin(-1)));
    rowM.appendChild(pzBtn(panel, '분침 ▶', () => moveMin(1)));
    acts.appendChild(rowH);
    acts.appendChild(rowM);
    acts.appendChild(pzBtn(panel, '나간다', pzClose));
    panel.appendChild(acts);
    function moveHour(d){
      if(done) return;
      s[0] += d;
      if(s[0] > 12) s[0] = 1;
      if(s[0] < 1) s[0] = 12;
      afterMove();
    }
    function moveMin(d){
      if(done) return;
      s[1] += d;
      if(s[1] > 11) s[1] = 0;
      if(s[1] < 0) s[1] = 11;
      afterMove();
    }
    function afterMove(){
      Engine.setFlag('clockState', s);
      drawClock();
      if(!done && s[0] === 8 && s[1] === 6){
        done = true;
        Engine.setFlag('clockState', [8, 6]);
        Sfx.tone(880, .3, 'sine', .15);
        setTimeout(() => pzSolved('clock', '시계가 째깍거리며 다시 움직인다'), 400);
      }
    }
    function drawClock(){
      const P = pal();
      c2.fillStyle = P.bg; c2.fillRect(0, 0, 120, 120);
      c2.fillStyle = P.woodDark;
      c2.beginPath(); c2.arc(60, 60, 57, 0, 7); c2.fill();
      c2.fillStyle = P.paper;
      c2.beginPath(); c2.arc(60, 60, 50, 0, 7); c2.fill();
      for(let i = 0; i < 12; i++){
        const a = i / 12 * Math.PI * 2 - Math.PI / 2;
        const major = i % 3 === 0;
        const r1 = major ? 41 : 45;
        c2.strokeStyle = P.ink;
        c2.lineWidth = major ? 2 : 1;
        c2.beginPath();
        c2.moveTo(60 + Math.cos(a) * r1, 60 + Math.sin(a) * r1);
        c2.lineTo(60 + Math.cos(a) * 49, 60 + Math.sin(a) * 49);
        c2.stroke();
      }
      c2.fillStyle = P.ink;
      c2.font = '8px monospace';
      c2.textAlign = 'center';
      c2.textBaseline = 'middle';
      [12, 3, 6, 9].forEach(num => {
        const a = num / 12 * Math.PI * 2 - Math.PI / 2;
        c2.fillText(String(num), 60 + Math.cos(a) * 34, 60 + Math.sin(a) * 34);
      });
      const ha = s[0] / 12 * Math.PI * 2 - Math.PI / 2;
      c2.strokeStyle = P.ink;
      c2.lineWidth = 3;
      c2.beginPath();
      c2.moveTo(60, 60);
      c2.lineTo(60 + Math.cos(ha) * 30, 60 + Math.sin(ha) * 30);
      c2.stroke();
      const ma = s[1] / 12 * Math.PI * 2 - Math.PI / 2;
      c2.lineWidth = 1;
      c2.beginPath();
      c2.moveTo(60, 60);
      c2.lineTo(60 + Math.cos(ma) * 42, 60 + Math.sin(ma) * 42);
      c2.stroke();
      c2.fillStyle = P.accent;
      c2.beginPath(); c2.arc(60, 60, 3, 0, 7); c2.fill();
    }
    drawClock();
  }
};
// ---- 불 지피기 ----
PZ_DEFS.fire = {
  title: '아궁이의 불',
  build(panel){
    if(!G.inv.includes('tinder')){
      pzDesc(panel, '불씨가 없다. 부싯돈과 솜을 조합해 불씨를 만들어야 한다.');
      const acts = document.createElement('div');
      acts.className = 'actions';
      acts.appendChild(pzBtn(panel, '나간다', pzClose));
      panel.appendChild(acts);
      return;
    }
    pzDesc(panel, '불씨를 옮기고, 불꽃이 적당할 때 부솥질을 해라. 세 단계를 넘기면 가마솥이 끓는다.');
    if(G.flags.fireStage === undefined || G.flags.fireStage === null) G.flags.fireStage = 0;
    let fireStage = Math.min(3, Math.max(0, G.flags.fireStage));
    let firePower = 0, misses = 0;
    let speed = 2.2, p = 0.5, flash = 0, started = false, done = false;
    let iv = null;
    const timers = [];
    const cv2 = document.createElement('canvas');
    cv2.width = 200; cv2.height = 40;
    cv2.style.width = '300px';
    cv2.style.imageRendering = 'pixelated';
    cv2.style.display = 'block';
    cv2.style.margin = '0 auto';
    panel.appendChild(cv2);
    const c2 = cv2.getContext('2d');
    const status = pzDesc(panel, '');
    const acts = document.createElement('div');
    acts.className = 'actions';
    panel.appendChild(acts);
    function refreshStatus(){
      status.textContent = '단계 ' + fireStage + '/3 · 부솥질 ' + firePower + '/3 · 실수 ' + misses + '/3';
    }
    function drawGauge(){
      const P = pal();
      c2.fillStyle = P.woodDark; c2.fillRect(0, 0, 200, 40);
      c2.fillStyle = '#3a8a4a'; c2.fillRect(80, 6, 60, 28);
      const mx = Math.round(p * 192) + 2;
      c2.fillStyle = P.paper; c2.fillRect(mx, 2, 4, 36);
      if(flash > 0){
        c2.globalAlpha = flash;
        c2.fillStyle = P.glow; c2.fillRect(80, 6, 60, 28);
        c2.globalAlpha = 1;
      }
      frame(P.ink, 0, 0, 200, 40);
    }
    function tick(){
      p = 0.5 + 0.5 * Math.sin(Engine.T * speed);
      if(flash > 0) flash = Math.max(0, flash - 0.12);
      drawGauge();
    }
    function bellows(){
      if(done) return;
      if(p >= 0.40 && p <= 0.70){
        firePower++;
        flash = 1;
        Sfx.tone(300 + firePower * 80, .12, 'triangle', .14);
        if(firePower >= 3){
          fireStage++;
          G.flags.fireStage = fireStage;
          Engine.setFlag('fireStage', fireStage);
          firePower = 0;
          Sfx.mortar();
          toast('불이 세진다! (' + fireStage + '/3)');
          if(fireStage >= 3){
            done = true;
            if(iv){ clearInterval(iv); iv = null; }
            refreshStatus();
            timers.push(setTimeout(() => pzSolved('fire', '가마솥이 보글보글 끓어오른다'), 400));
            return;
          }
        }
      } else {
        misses++;
        Sfx.fail();
        speed = Math.min(speed * 1.25, 8.8);
        if(misses >= 3){
          fireStage = Math.max(0, fireStage - 1);
          G.flags.fireStage = fireStage;
          Engine.setFlag('fireStage', fireStage);
          firePower = 0;
          misses = 0;
          speed = 2.2;
          Sfx.fail();
          toast('불이 꺼졌다!');
        }
      }
      refreshStatus();
    }
    function startFire(){
      if(started) return;
      started = true;
      acts.innerHTML = '';
      acts.appendChild(pzBtn(panel, '부솥질!', bellows));
      acts.appendChild(pzBtn(panel, '나간다', pzClose));
      refreshStatus();
      tick();
      iv = setInterval(tick, 60);
    }
    acts.appendChild(pzBtn(panel, '불씨를 옮긴다', startFire));
    acts.appendChild(pzBtn(panel, '나간다', pzClose));
    const obs = new MutationObserver(() => {
      if(document.getElementById('puzzle-layer').classList.contains('hidden')){
        if(iv) clearInterval(iv);
        timers.forEach(t => clearTimeout(t));
        obs.disconnect();
      }
    });
    obs.observe(document.getElementById('puzzle-layer'), { attributes:true });
    refreshStatus();
    drawGauge();
  }
};
// ---- 저울 ----
PZ_DEFS.scale = {
  title: '제물 저울',
  build(panel){
    pzDesc(panel, Engine.flag('read_genealogy')
      ? '「좌우가 다르면 조상이 노한다. 넷 이상 올려 균형을 이루어라」'
      : '큰 저울. 제물을 어떻게 올릴지 단서가 필요하다.');
    const items = [
      { id:'gam', name:'곶감', w:3 },
      { id:'ju', name:'대추', w:2 },
      { id:'bam', name:'밤', w:4 },
      { id:'yu', name:'유과', w:1 },
      { id:'san', name:'산자', w:5 }
    ];
    if(!G.flags.scalePos){
      G.flags.scalePos = { gam:'l', ju:'l', bam:'r', yu:'n', san:'n' };
    }
    let done = false;
    const fb = document.createElement('div');
    fb.className = 'desc';
    fb.style.textAlign = 'center';
    panel.appendChild(fb);
    const cv2 = document.createElement('canvas');
    cv2.width = 200; cv2.height = 60;
    cv2.style.width = '300px';
    cv2.style.imageRendering = 'pixelated';
    cv2.style.display = 'block';
    cv2.style.margin = '0 auto';
    panel.appendChild(cv2);
    const c2 = cv2.getContext('2d');
    const cols = document.createElement('div');
    cols.style.display = 'flex';
    cols.style.justifyContent = 'space-around';
    function mkCol(label){
      const d = document.createElement('div');
      d.style.display = 'flex';
      d.style.flexDirection = 'column';
      d.style.alignItems = 'stretch';
      d.style.minWidth = '96px';
      const h = document.createElement('small');
      h.textContent = label;
      h.style.textAlign = 'center';
      d.appendChild(h);
      cols.appendChild(d);
      return d;
    }
    const leftCol = mkCol('좌팬');
    const rightCol = mkCol('우팬');
    panel.appendChild(cols);
    const poolWrap = document.createElement('div');
    const poolLabel = document.createElement('small');
    poolLabel.textContent = '밑에';
    poolLabel.style.display = 'block';
    poolLabel.style.textAlign = 'center';
    poolWrap.appendChild(poolLabel);
    const pool = document.createElement('div');
    pool.style.display = 'flex';
    pool.style.flexWrap = 'wrap';
    pool.style.justifyContent = 'center';
    poolWrap.appendChild(pool);
    panel.appendChild(poolWrap);
    const acts = document.createElement('div');
    acts.className = 'actions';
    acts.appendChild(pzBtn(panel, '나간다', pzClose));
    panel.appendChild(acts);
    function drawSeesaw(sumL, sumR){
      const P = pal();
      c2.fillStyle = P.bg; c2.fillRect(0, 0, 200, 60);
      c2.fillStyle = P.woodDark; c2.fillRect(20, 55, 160, 2);
      c2.fillStyle = P.wood2;
      c2.beginPath();
      c2.moveTo(88, 55); c2.lineTo(112, 55); c2.lineTo(100, 40);
      c2.closePath(); c2.fill();
      const tilt = Math.max(-0.35, Math.min(0.35, (sumR - sumL) * 0.06));
      const dx = Math.cos(tilt) * 72, dy = Math.sin(tilt) * 72;
      const lx = 100 - dx, ly = 40 - dy;
      const rx = 100 + dx, ry = 40 + dy;
      c2.strokeStyle = P.wood;
      c2.lineWidth = 4;
      c2.beginPath(); c2.moveTo(lx, ly); c2.lineTo(rx, ry); c2.stroke();
      drawLoad(lx, ly, sumL);
      drawLoad(rx, ry, sumR);
    }
    function drawLoad(x, y, w){
      if(w <= 0) return;
      const s = Math.min(6 + w * 2, 20);
      c2.fillStyle = pal().accent;
      c2.fillRect(Math.round(x - s / 2), Math.round(y - s), s, s);
    }
    function render(){
      const leftList = [], rightList = [], poolList = [];
      let sumL = 0, sumR = 0, cnt = 0;
      items.forEach(it => {
        const pos = G.flags.scalePos[it.id];
        if(pos === 'l'){ sumL += it.w; cnt++; }
        else if(pos === 'r'){ sumR += it.w; cnt++; }
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.style.cursor = 'pointer';
        cell.style.margin = '2px';
        const nm = document.createElement('span');
        nm.textContent = it.name + ' ' + it.w;
        cell.appendChild(nm);
        cell.addEventListener('click', () => {
          if(done) return;
          Sfx.click();
          const cur = G.flags.scalePos[it.id];
          G.flags.scalePos[it.id] = cur === 'n' ? 'l' : cur === 'l' ? 'r' : 'n';
          Engine.setFlag('scalePos', G.flags.scalePos);
          render();
        });
        if(pos === 'l') leftList.push(cell);
        else if(pos === 'r') rightList.push(cell);
        else poolList.push(cell);
      });
      leftCol.querySelectorAll('.cell').forEach(el => el.remove());
      rightCol.querySelectorAll('.cell').forEach(el => el.remove());
      while(pool.firstChild) pool.removeChild(pool.firstChild);
      leftList.forEach(c3 => leftCol.appendChild(c3));
      rightList.forEach(c3 => rightCol.appendChild(c3));
      poolList.forEach(c3 => pool.appendChild(c3));
      const tiltTxt = sumL > sumR ? '◀ 기움' : sumR > sumL ? '기움 ▶' : '균형!';
      fb.textContent = '좌 ' + sumL + ' · 우 ' + sumR + ' · ' + tiltTxt;
      drawSeesaw(sumL, sumR);
      if(!done && cnt >= 4 && sumL === sumR){
        done = true;
        Engine.setFlag('scalePos', G.flags.scalePos);
        setTimeout(() => pzSolved('scale', '저울이 평온히 멈춘다. 봉인이 풀린다'), 400);
      }
    }
    render();
  }
};
