'use strict';
function pzIcon(key){
  const cv2 = document.createElement('canvas');
  cv2.width = 20; cv2.height = 20;
  const c2 = cv2.getContext('2d');
  c2.imageSmoothingEnabled = false;
  const spr = bake(key, false);
  const s = Math.max(1, Math.floor(18 / Math.max(spr.width, spr.height)));
  c2.drawImage(spr, (20 - spr.width * s) / 2 | 0, (20 - spr.height * s) / 2 | 0, spr.width * s, spr.height * s);
  return cv2;
}
PZ_DEFS.jesa = {
  title: '제사상',
  build(panel){
    pzDesc(panel, '비어 있는 제상. 예법에 맞게 차려라.');
    const clue = Engine.flag('read_recipe');
    pzDesc(panel, clue
      ? '「신위는 먼 줄 가운데 · 어동서육 · 좌포우혜 · 홍동백서」'
      : '부엌 어딘가에 옛 요리책이 있을 것이다.');
    const items = [
      {id:'sinwi', name:'신위'}, {id:'fish', name:'생선'}, {id:'meat', name:'고기'},
      {id:'po', name:'포'}, {id:'hye', name:'혜'},
      {id:'fruitR', name:'붉은 과일'}, {id:'fruitW', name:'흰 과일'}
    ];
    if(!G.flags.jesaGrid) G.flags.jesaGrid = [
      ['','','',''],
      ['','','',''],
      ['','','','']
    ];
    let sel = null, done = false, warned = false;
    const gridEl = document.createElement('div');
    const pool = document.createElement('div');
    pool.className = 'row';
    const poolBtns = {};
    function refresh(){
      gridEl.innerHTML = '';
      for(let r = 0; r < 3; r++){
        const row = document.createElement('div');
        row.className = 'row';
        for(let c2 = 0; c2 < 4; c2++){
          const v = G.flags.jesaGrid[r][c2];
          const cell = document.createElement('div');
          cell.className = 'cell';
          cell.style.width = '56px';
          cell.style.height = '46px';
          if(v){
            cell.appendChild(pzIcon(v));
            const nm = document.createElement('small');
            nm.textContent = items.find(x => x.id === v).name;
            cell.appendChild(nm);
          } else {
            cell.textContent = '·';
            cell.style.color = '#28324a';
          }
          cell.addEventListener('click', () => {
            Sfx.click();
            if(v){ G.flags.jesaGrid[r][c2] = ''; }
            else if(sel){ G.flags.jesaGrid[r][c2] = sel; }
            Engine.setFlag('jesaGrid', G.flags.jesaGrid);
            refresh();
          });
          row.appendChild(cell);
        }
        gridEl.appendChild(row);
      }
      items.forEach(it => {
        const used = G.flags.jesaGrid.flat().includes(it.id);
        poolBtns[it.id].style.opacity = used ? 0.25 : 1;
      });
      check();
    }
    items.forEach(it => {
      const b = document.createElement('div');
      b.className = 'cell';
      b.style.width = '52px';
      b.style.height = '44px';
      b.appendChild(pzIcon(it.id));
      const nm = document.createElement('small');
      nm.textContent = it.name;
      b.appendChild(nm);
      b.addEventListener('click', () => {
        Sfx.click();
        sel = it.id;
        Object.values(poolBtns).forEach(x => x.classList.remove('sel'));
        b.classList.add('sel');
      });
      poolBtns[it.id] = b;
      pool.appendChild(b);
    });
    panel.appendChild(gridEl);
    pzDesc(panel, '올릴 것을 눌러 상 위를 누른다. 올린 것을 다시 누르면 내린다.');
    panel.appendChild(pool);
    const acts = document.createElement('div');
    acts.className = 'actions';
    acts.appendChild(pzBtn(panel, '나간다', pzClose));
    panel.appendChild(acts);
    function check(){
      const g = G.flags.jesaGrid;
      const placed = g.flat().filter(v => v).length;
      const sinwiOk = g[0][1] === 'sinwi' || g[0][2] === 'sinwi';
      const row1ok = g[1][0]==='po' && g[1][1]==='meat' && g[1][2]==='fish' && g[1][3]==='hye';
      let wI = -1, rI = -1;
      for(let c2 = 0; c2 < 4; c2++){
        if(g[2][c2] === 'fruitW') wI = c2;
        if(g[2][c2] === 'fruitR') rI = c2;
      }
      const row2ok = (wI === 0 || wI === 1) && (rI === 2 || rI === 3) && wI < rI;
      const ok = sinwiOk && row1ok && row2ok;
      if(ok && placed === 7){
        if(!done){
          done = true;
          setTimeout(() => pzSolved('jesa', '제상이 차려졌다. 복도 너머에서 방아 소리가 들린다'), 350);
        }
      } else if(placed === 7 && !ok && !warned){
        warned = true;
        Sfx.fail();
        toast('예법에 어긋나는 것이 있다');
        panel.classList.add('shake');
        setTimeout(() => panel.classList.remove('shake'), 450);
      }
    }
    refresh();
  }
};
PZ_DEFS.tablets = {
  title: '위패 켜',
  build(panel){
    const clue = Engine.flag('read_genealogy');
    pzDesc(panel, clue
      ? '「간은 갑을병정무기경임계로 돌고, 지는 자축인묘진사오미신유술해로 돈다」'
      : '다섯 위패의 차례가 어긋나 있다. 족보를 찾아라.');
    if(!G.flags.tabletOrder) G.flags.tabletOrder = ['경오','갑자','임신','병인','무진'];
    const idx = {갑자:1, 병인:3, 무진:5, 경오:7, 임신:9};
    const row = document.createElement('div');
    row.className = 'row';
    let sel = -1, done = false;
    const cells = [];
    for(let i = 0; i < 5; i++){
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.style.width = '52px';
      cell.style.height = '52px';
      cell.addEventListener('click', () => {
        Sfx.click();
        if(done) return;
        if(sel === -1){ sel = i; cell.classList.add('sel'); }
        else if(sel === i){ sel = -1; cell.classList.remove('sel'); }
        else {
          const o = G.flags.tabletOrder;
          const t = o[sel]; o[sel] = o[i]; o[i] = t;
          sel = -1;
          Engine.setFlag('tabletOrder', o);
          refresh();
        }
      });
      row.appendChild(cell);
      cells.push(cell);
    }
    panel.appendChild(row);
    const acts = document.createElement('div');
    acts.className = 'actions';
    acts.appendChild(pzBtn(panel, '나간다', pzClose));
    panel.appendChild(acts);
    function refresh(){
      cells.forEach((c2, i) => {
        c2.textContent = G.flags.tabletOrder[i];
        c2.classList.remove('sel');
      });
      const o = G.flags.tabletOrder;
      let ok = true;
      for(let i = 1; i < 5; i++) if(idx[o[i]] < idx[o[i-1]]) ok = false;
      if(ok && !done){
        done = true;
        setTimeout(() => {
          Engine.setFlag('tabletOrder', o);
          pzSolved('tablets');
        }, 350);
      }
    }
    refresh();
  }
};
PZ_DEFS.ohaeng = {
  title: '오행의 벽장치',
  build(panel){
    pzDesc(panel, '다섯 구슬을 상생의 순서로 이어라.');
    pzDesc(panel, '「목생화 · 화생토 · 토생금 · 금생수 · 수생목」');
    if(!G.flags.ohaengLinks) G.flags.ohaengLinks = [];
    const correct = [[0,1],[1,2],[2,3],[3,4],[0,4]];
    const els = ['목', '화', '토', '금', '수'];
    const orbCols = ['#5a8a4a', '#b84a3a', '#b8923a', '#c8c4b0', '#3a6a9a'];
    const pos = [[100,26],[168,72],[142,150],[58,150],[32,72]];
    let done = false;
    const cv2 = document.createElement('canvas');
    cv2.width = 200; cv2.height = 180;
    cv2.style.width = '280px';
    cv2.style.imageRendering = 'pixelated';
    panel.appendChild(cv2);
    const c2 = cv2.getContext('2d');
    const status = document.createElement('div');
    status.className = 'desc';
    status.style.textAlign = 'center';
    panel.appendChild(status);
    const acts = document.createElement('div');
    acts.className = 'actions';
    acts.appendChild(pzBtn(panel, '나간다', pzClose));
    panel.appendChild(acts);
    let sel = -1;
    function drawBoard(){
      const L = G.flags.ohaengLinks;
      c2.fillStyle = '#0a0e18';
      c2.fillRect(0, 0, 200, 180);
      c2.strokeStyle = '#3a3220';
      c2.lineWidth = 2;
      L.forEach(l => {
        c2.beginPath();
        c2.moveTo(pos[l[0]][0], pos[l[0]][1]);
        c2.lineTo(pos[l[1]][0], pos[l[1]][1]);
        c2.stroke();
      });
      if(sel >= 0){
        c2.strokeStyle = '#7ae0d0';
        c2.setLineDash([3,3]);
        c2.beginPath();
        c2.moveTo(pos[sel][0], pos[sel][1]);
        c2.lineTo(pos[sel][0], pos[sel][1]);
        c2.stroke();
        c2.setLineDash([]);
      }
      els.forEach((e, i) => {
        const [x, y] = pos[i];
        c2.fillStyle = '#05070e';
        c2.beginPath(); c2.arc(x, y, 15, 0, 7); c2.fill();
        c2.fillStyle = orbCols[i];
        c2.beginPath(); c2.arc(x, y, 13, 0, 7); c2.fill();
        c2.fillStyle = 'rgba(255,255,255,0.35)';
        c2.beginPath(); c2.arc(x - 4, y - 5, 4, 0, 7); c2.fill();
        c2.fillStyle = '#0a0e18';
        c2.font = '10px monospace';
        c2.textAlign = 'center';
        c2.fillText(e, x, y + 4);
        if(i === sel){
          c2.strokeStyle = '#7ae0d0';
          c2.lineWidth = 2;
          c2.beginPath(); c2.arc(x, y, 17, 0, 7); c2.stroke();
        }
        c2.textAlign = 'left';
      });
      status.textContent = '연결: ' + L.length + ' / 5';
    }
    cv2.addEventListener('pointerdown', ev => {
      if(done) return;
      const r = cv2.getBoundingClientRect();
      const x = (ev.clientX - r.left) / r.width * 200;
      const y = (ev.clientY - r.top) / r.height * 180;
      let hit = -1, best = 26;
      pos.forEach((p, i) => {
        const d = Math.hypot(p[0] - x, p[1] - y);
        if(d < best){ best = d; hit = i; }
      });
      if(hit === -1) return;
      Sfx.click();
      if(sel === -1){ sel = hit; }
      else if(sel === hit){ sel = -1; }
      else {
        const a = Math.min(sel, hit), b = Math.max(sel, hit);
        const L = G.flags.ohaengLinks;
        const at = L.findIndex(q => q[0]===a && q[1]===b);
        if(at >= 0) L.splice(at, 1);
        else if(L.length < 5) L.push([a, b]);
        sel = -1;
        Engine.setFlag('ohaengLinks', L);
        const doneOk = correct.every(p => L.some(q => q[0]===p[0] && q[1]===p[1])) && L.length === 5;
        if(doneOk && !done){
          done = true;
          drawBoard();
          setTimeout(() => pzSolved('ohaeng', '벽이 열린다. 오행의 순환이 돌기 시작한다'), 400);
          return;
        }
      }
      drawBoard();
    });
    drawBoard();
  }
};
