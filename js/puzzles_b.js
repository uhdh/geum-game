'use strict';
PZ_DEFS.doll = {
  title: '오방색 인형',
  build(panel){
    const hasClue = Engine.flag('read_crayon');
    pzDesc(panel, hasClue
      ? '인형의 다섯 띠를 낙서의 순서대로 물들여라.'
      : '다섯 띠가 바랜 인형이다. 방 안에 단서가 있을 것이다.');
    const bandNames = ['청', '백', '적', '황', '흑'];
    if(!G.flags.dollState) G.flags.dollState = [2,4,0,3,1];
    const row = document.createElement('div');
    row.className = 'row';
    const cv2 = document.createElement('canvas');
    cv2.width = 40; cv2.height = 60;
    row.appendChild(cv2);
    panel.appendChild(row);
    const row2 = document.createElement('div');
    row2.className = 'row';
    const labels = [];
    for(let i = 0; i < 5; i++){
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.style.width = '40px';
      const span = document.createElement('span');
      cell.appendChild(span);
      const nm = document.createElement('small');
      nm.textContent = (i+1) + '번 띠';
      cell.appendChild(nm);
      cell.addEventListener('click', () => {
        Sfx.click();
        G.flags.dollState[i] = (G.flags.dollState[i] + 1) % 5;
        Engine.setFlag('dollState', G.flags.dollState);
        refresh();
      });
      row2.appendChild(cell);
      labels.push(span);
    }
    panel.appendChild(row2);
    const acts = document.createElement('div');
    acts.className = 'actions';
    acts.appendChild(pzBtn(panel, '나간다', pzClose));
    panel.appendChild(acts);
    function refresh(){
      const cc = cv2.getContext('2d');
      const saveYin = G.yin; G.yin = false;
      drawDoll(cc, 16, 4, G.flags.dollState);
      G.yin = saveYin;
      for(let i = 0; i < 5; i++) labels[i].textContent = bandNames[G.flags.dollState[i]];
      const d = G.flags.dollState;
      if(d[0]===0 && d[1]===1 && d[2]===2 && d[3]===3 && d[4]===4){
        Engine.setFlag('dollState', d);
        setTimeout(() => {
          pzSolved('doll', '인형이 온전한 오방색을 띤다');
        }, 350);
      }
    }
    refresh();
  }
};
PZ_DEFS.candle = {
  title: '촛불의 기억',
  build(panel){
    const seen = Engine.flag('saw_yin_candles');
    pzDesc(panel, seen
      ? '이승의 촛불을 저승에서 보던 그대로 켜라.'
      : '꺼진 촛대 다섯 개. 어디서 본 듯한 배치다.');
    if(!G.flags.candleState) G.flags.candleState = [0,0,0,0,0];
    const answer = G.flags.yinCandlePattern || [1,0,1,1,0];
    const row = document.createElement('div');
    row.className = 'row';
    const cells = [];
    for(let i = 0; i < 5; i++){
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.style.width = '36px';
      cell.style.height = '56px';
      const cv2 = document.createElement('canvas');
      cv2.width = 20; cv2.height = 40;
      cell.appendChild(cv2);
      cell.addEventListener('click', () => {
        Sfx.click();
        G.flags.candleState[i] = G.flags.candleState[i] ? 0 : 1;
        refresh();
      });
      row.appendChild(cell);
      cells.push({cv2, cell});
    }
    panel.appendChild(row);
    const acts = document.createElement('div');
    acts.className = 'actions';
    acts.appendChild(pzBtn(panel, '나간다', pzClose));
    panel.appendChild(acts);
    function refresh(){
      cells.forEach((c2, i) => {
        const cc = c2.cv2.getContext('2d');
        const saveYin = G.yin; G.yin = false;
        cc.clearRect(0, 0, 20, 40);
        drawCandle(cc, 9, 34, G.flags.candleState[i], Engine.T || 0);
        G.yin = saveYin;
      });
      const a = G.flags.candleState;
      if(a.join('') === answer.join('')){
        setTimeout(() => pzSolved('candle', '촛불이 기억을 비춘다'), 300);
      }
    }
    refresh();
  }
};
PZ_DEFS.skewer = {
  title: '곶감과 대추',
  build(panel){
    pzDesc(panel, '다섯 개의 꼬치. 세 칸씩 꿰어야 한다.');
    const clue = Engine.flag('read_recipe');
    if(clue) pzDesc(panel, '「홀수 줄엔 대추, 짝수 줄엔 곶감」');
    if(!G.flags.skewerState) G.flags.skewerState = [
      ['g','j','g'], ['j','j','g'], ['g','g','j'], ['j','g','j'], ['g','j','j']
    ];
    const names = { e:'—', g:'곶감', j:'대추' };
    const rows = [];
    const wrap = document.createElement('div');
    for(let i = 0; i < 5; i++){
      const r = document.createElement('div');
      r.className = 'row';
      const num = document.createElement('span');
      num.textContent = (i+1) + ' ';
      num.style.color = '#5c7a9a';
      r.appendChild(num);
      const cells = [];
      for(let j = 0; j < 3; j++){
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.style.width = '48px';
        cell.style.height = '30px';
        cell.addEventListener('click', () => {
          Sfx.click();
          const st = G.flags.skewerState;
          st[i][j] = st[i][j] === 'e' ? 'g' : (st[i][j] === 'g' ? 'j' : 'e');
          Engine.setFlag('skewerState', st);
          refresh();
        });
        r.appendChild(cell);
        cells.push(cell);
      }
      wrap.appendChild(r);
      rows.push(cells);
    }
    panel.appendChild(wrap);
    const acts = document.createElement('div');
    acts.className = 'actions';
    acts.appendChild(pzBtn(panel, '나간다', pzClose));
    panel.appendChild(acts);
    function refresh(){
      let ok = true;
      for(let i = 0; i < 5; i++){
        const want = (i % 2 === 0) ? 'j' : 'g';
        for(let j = 0; j < 3; j++){
          const v = G.flags.skewerState[i][j];
          rows[i][j].textContent = names[v];
          if(v !== want) ok = false;
        }
      }
      if(ok) setTimeout(() => pzSolved('skewer', '제상에 올릴 꼬치가 완성됐다'), 300);
    }
    refresh();
  }
};
