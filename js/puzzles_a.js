'use strict';
const PZ_DEFS = {};
function pzOpen(id){
  const layer = document.getElementById('puzzle-layer');
  layer.innerHTML = '';
  const panel = document.createElement('div');
  panel.className = 'pz';
  const def = PZ_DEFS[id];
  const h3 = document.createElement('h3');
  h3.textContent = def.title;
  panel.appendChild(h3);
  def.build(panel);
  layer.appendChild(panel);
  layer.classList.remove('hidden');
  Sfx.page();
}
function pzClose(){
  const layer = document.getElementById('puzzle-layer');
  layer.classList.add('hidden');
  layer.innerHTML = '';
}
function pzSolved(pid, msg){
  Engine.setFlag('p_' + pid, true);
  Sfx.unlock();
  pzClose();
  if(msg) toast(msg);
  onPuzzleSolved(pid);
}
function pzBtn(panel, label, fn){
  const b = document.createElement('button');
  b.textContent = label;
  b.addEventListener('click', () => { Sfx.click(); fn(); });
  return b;
}
function pzDesc(panel, text){
  const d = document.createElement('div');
  d.className = 'desc';
  d.textContent = text;
  panel.appendChild(d);
  return d;
}
PZ_DEFS.byung = {
  title: '병풍 — 네 폭의 계절',
  build(panel){
    pzDesc(panel, '계절의 순서가 어긋나 있다. 두 폭을 눌러 자리를 바꿔라.');
    if(!G.flags.byungOrder) G.flags.byungOrder = [2,0,3,1];
    const names = ['봄', '여름', '가을', '겨울'];
    const row = document.createElement('div');
    row.className = 'row';
    let sel = -1;
    const cells = [];
    for(let i = 0; i < 4; i++){
      const cell = document.createElement('div');
      cell.className = 'cell';
      const cv2 = document.createElement('canvas');
      cv2.width = 26; cv2.height = 36;
      cell.appendChild(cv2);
      const nm = document.createElement('small');
      cell.appendChild(nm);
      cell.addEventListener('click', () => {
        Sfx.click();
        if(sel === -1){ sel = i; cell.classList.add('sel'); }
        else if(sel === i){ sel = -1; cell.classList.remove('sel'); }
        else {
          const o = G.flags.byungOrder;
          const tmp = o[sel]; o[sel] = o[i]; o[i] = tmp;
          sel = -1;
          refresh();
        }
      });
      row.appendChild(cell);
      cells.push({cv2, nm, cell});
    }
    panel.appendChild(row);
    function refresh(){
      cells.forEach((c2, i) => {
        const k = G.flags.byungOrder[i];
        const cc = c2.cv2.getContext('2d');
        const saveYin = G.yin;
        G.yin = false;
        drawSeason(cc, k, 0, 0, 26, 36);
        G.yin = saveYin;
        c2.nm.textContent = names[k];
        c2.cell.classList.remove('sel');
      });
      const o = G.flags.byungOrder;
      if(o[0]===0 && o[1]===1 && o[2]===2 && o[3]===3){
        Engine.setFlag('byungOrder', o);
        setTimeout(() => {
          pzSolved('byung');
          openReader('병풍 뒤에 붙은 쪽지',
            '토끼가 방아를 두드리는 소리,\n그 세 글자가 서랍을 연다.');
        }, 350);
      } else {
        Engine.setFlag('byungOrder', o);
      }
    }
    refresh();
  }
};
PZ_DEFS.lock = {
  title: '서랍의 자물쇠',
  build(panel){
    const locked = !Engine.flag('p_byung');
    pzDesc(panel, locked
      ? '세 개의 홈이 비어 있다. 단서를 찾지 못했다.'
      : '세 개의 홈에 낱글자를 넣어라.');
    const sets = [
      ['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅇ'],
      ['ㅏ','ㅓ','ㅗ','ㅜ','ㅣ','ㅡ','ㅐ'],
      ['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅇ']
    ];
    if(!G.flags.lockState) G.flags.lockState = [0,0,0];
    const row = document.createElement('div');
    row.className = 'row';
    const cells = [];
    for(let i = 0; i < 3; i++){
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.style.width = '52px';
      const span = document.createElement('span');
      span.style.fontSize = '20px';
      cell.appendChild(span);
      cell.addEventListener('click', () => {
        Sfx.click();
        G.flags.lockState[i] = (G.flags.lockState[i] + 1) % sets[i].length;
        Engine.setFlag('lockState', G.flags.lockState);
        refresh();
      });
      row.appendChild(cell);
      cells.push(span);
    }
    panel.appendChild(row);
    const acts = document.createElement('div');
    acts.className = 'actions';
    acts.appendChild(pzBtn(panel, '열어 본다', tryOpen));
    acts.appendChild(pzBtn(panel, '나간다', pzClose));
    panel.appendChild(acts);
    function refresh(){
      for(let i = 0; i < 3; i++) cells[i].textContent = sets[i][G.flags.lockState[i]];
    }
    function tryOpen(){
      const s = G.flags.lockState;
      if(sets[0][s[0]]==='ㄷ' && sets[1][s[1]]==='ㅏ' && sets[2][s[2]]==='ㄹ'){
        pzSolved('lock', '서랍이 열렸다');
      } else {
        Sfx.fail();
        toast('열리지 않는다');
      }
    }
    refresh();
  }
};
