'use strict';
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
    let sel = null;
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
          cell.style.height = '40px';
          cell.textContent = v || '·';
          if(!v) cell.style.color = '#28324a';
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
      b.style.height = '34px';
      b.textContent = it.name;
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
      const ok =
        g[0][1]==='sinwi' &&
        g[1][0]==='po' && g[1][1]==='meat' && g[1][2]==='fish' && g[1][3]==='hye' &&
        g[2][0]==='fruitW' && g[2][2]==='fruitR';
      if(ok) setTimeout(() => pzSolved('jesa', '제상이 차려졌다. 복도 너머에서 방아 소리가 들린다'), 350);
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
    let sel = -1;
    const cells = [];
    for(let i = 0; i < 5; i++){
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.style.width = '52px';
      cell.style.height = '52px';
      cell.addEventListener('click', () => {
        Sfx.click();
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
      if(ok) setTimeout(() => {
        Engine.setFlag('tabletOrder', o);
        pzSolved('tablets');
      }, 350);
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
    const els = ['목', '화', '토', '금', '수'];
    const correct = [[0,1],[1,2],[2,3],[3,4],[4,0]];
    let sel = -1;
    const row = document.createElement('div');
    row.className = 'row';
    const cells = [];
    els.forEach((e, i) => {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.style.width = '48px';
      cell.style.height = '48px';
      cell.style.borderRadius = '50%';
      cell.textContent = e;
      cell.addEventListener('click', () => {
        Sfx.click();
        if(sel === -1){ sel = i; cell.classList.add('sel'); }
        else if(sel === i){ sel = -1; cell.classList.remove('sel'); }
        else {
          const a = Math.min(sel, i), b = Math.max(sel, i);
          const L = G.flags.ohaengLinks;
          const at = L.findIndex(x => x[0]===a && x[1]===b);
          if(at >= 0) L.splice(at, 1);
          else if(L.length < 5) L.push([a, b]);
          sel = -1;
          Engine.setFlag('ohaengLinks', L);
          refresh();
        }
      });
      row.appendChild(cell);
      cells.push(cell);
    });
    panel.appendChild(row);
    const status = document.createElement('div');
    status.className = 'desc';
    status.style.textAlign = 'center';
    panel.appendChild(status);
    const acts = document.createElement('div');
    acts.className = 'actions';
    acts.appendChild(pzBtn(panel, '나간다', pzClose));
    panel.appendChild(acts);
    function refresh(){
      const L = G.flags.ohaengLinks;
      cells.forEach(c2 => c2.classList.remove('sel'));
      status.textContent = '연결: ' + L.length + ' / 5';
      const done = correct.every(p => L.some(q => q[0]===p[0] && q[1]===p[1])) && L.length === 5;
      if(done) setTimeout(() => pzSolved('ohaeng', '벽이 열린다. 오행의 순환이 돌기 시작한다'), 350);
    }
    refresh();
  }
};
