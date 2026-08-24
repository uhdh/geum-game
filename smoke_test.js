const fs = require('fs');
const vm = require('vm');

function makeCtx(){
  return new Proxy({}, {
    get(t, p){
      if(p === 'createLinearGradient') return () => ({ addColorStop(){} });
      if(p === 'measureText') return () => ({ width: 10 });
      if(typeof p === 'string') return t[p] !== undefined ? t[p] : (() => {});
      return () => {};
    },
    set(t, p, v){ t[p] = v; return true; }
  });
}
function makeEl(tag){
  const el = {
    tag, children: [], style: {}, dataset: {}, _cls: new Set(),
    classList: {
      add(c){ el._cls.add(c); },
      remove(c){ el._cls.delete(c); },
      contains(c){ return el._cls.has(c); },
      toggle(c, v){ v ? el._cls.add(c) : el._cls.delete(c); }
    },
    appendChild(ch){ el.children.push(ch); return ch; },
    addEventListener(ev, fn){ (el._h ||= {})[ev] = fn; },
    removeEventListener(){}, remove(){},
    querySelector(){ return makeEl('div'); },
    querySelectorAll(){ return []; },
    getBoundingClientRect(){ return { left:0, top:0, width:320, height:180 }; },
    getContext(){ if(!el._ctx) el._ctx = makeCtx(); return el._ctx; },
    set innerHTML(v){ el.children = []; },
    get innerHTML(){ return ''; },
    set textContent(v){ el._txt = v; },
    get textContent(){ return el._txt || ''; },
    click(){ if(el._h && el._h.click) el._h.click(); },
    width: 300, height: 200
  };
  Object.defineProperty(el, 'offsetWidth', { get(){ return 100; } });
  return el;
}
const els = {};
const documentStub = {
  getElementById(id){ if(!els[id]) els[id] = makeEl('div'); return els[id]; },
  createElement(tag){ return makeEl(tag); },
  addEventListener(){},
  body: makeEl('body')
};
const storage = {};
const sandbox = {
  document: documentStub,
  window: { addEventListener(){}, innerWidth: 640, innerHeight: 360 },
  localStorage: { getItem:k=>storage[k]||null, setItem:(k,v)=>{storage[k]=v;}, removeItem:k=>{delete storage[k];} },
  navigator: { vibrate(){} },
  requestAnimationFrame(){ return 1; },
  setTimeout, clearTimeout, setInterval, clearInterval,
  MutationObserver: class { observe(){} disconnect(){} },
  confirm: () => true,
  performance: { now: () => Date.now() },
  console
};
sandbox.window.AudioContext = undefined;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

const files = ['palette','sprites_a','sprites_b','audio','engine','puzzles_a','puzzles_b','puzzles_c','puzzles_d','rooms_a','rooms_b','main'];
for(const f of files){
  const code = fs.readFileSync('js/' + f + '.js', 'utf8');
  try{
    vm.runInContext(code, sandbox, { filename: f + '.js' });
  }catch(e){
    console.error('LOAD FAIL:', f, e.message);
    process.exit(1);
  }
}
console.log('all files loaded');

function run(name, fn){
  try{ fn(); console.log('PASS:', name); }
  catch(e){ console.error('FAIL:', name, '-', e.message, e.stack.split('\n')[1]); process.exitCode = 1; }
}

run('boot', () => vm.runInContext('boot()', sandbox));
run('intro+ch1', () => {
  vm.runInContext('wipeSave(); Sfx.startAmbient(); chapterCard(1)', sandbox);
});
run('draw ch1 yang', () => {
  vm.runInContext('Engine.go("ch1"); Engine.T = 1; Engine.render()', sandbox);
});
run('draw ch1 yin', () => {
  vm.runInContext('G.yin = true; bakeCacheClear(); Engine.render(); ROOMS.ch1.spots()', sandbox);
});
run('ch1 puzzles', () => {
  vm.runInContext('G.yin = false; bakeCacheClear(); pzOpen("byung"); pzClose(); pzOpen("lock"); pzClose()', sandbox);
});
run('solve ch1 + fragment', () => {
  vm.runInContext('Engine.setFlag("p_byung", true); Engine.setFlag("p_lock", true); onPuzzleSolved("byung"); onPuzzleSolved("lock"); collectFragment(1)', sandbox);
});
for(const n of [2,3,4,5]){
  run('ch' + n + ' draw+spots both states', () => {
    vm.runInContext('G.chapter=' + n + '; G.yin=false; bakeCacheClear(); Engine.go("ch' + n + '"); Engine.T=2; Engine.render(); ROOMS.ch' + n + '.spots()', sandbox);
    vm.runInContext('G.yin=true; bakeCacheClear(); Engine.render(); ROOMS.ch' + n + '.spots()', sandbox);
    vm.runInContext('G.yin=false; bakeCacheClear()', sandbox);
  });
}
run('all puzzles open', () => {
  const list = ['byung','lock','doll','candle','skewer','jesa','tablets','ohaeng','rhythm','ritual'];
  vm.runInContext('const L=' + JSON.stringify(list) + '; L.forEach(p=>{pzOpen(p); pzClose();})', sandbox);
});
run('stones puzzle', () => {
  vm.runInContext('Engine.go("ch5"); [0,2,4].forEach(i=>tapStone(i)); [1,3].forEach(i=>tapStone(i))', sandbox);
});
run('fragments + ch6 + endings', () => {
  vm.runInContext('collectFragment(2); collectFragment(3); collectFragment(4); collectFragment(5)', sandbox);
});
run('ch6 draw', () => {
  vm.runInContext('G.chapter=6; Engine.go("ch6"); Engine.T=3; Engine.render(); ROOMS.ch6.spots()', sandbox);
});
run('endings', () => {
  vm.runInContext('showEnding("a"); showEnding("b"); showEnding("c")', sandbox);
});
run('save roundtrip', () => {
  vm.runInContext('saveGame(); const ok = loadGame(); if(!ok) throw new Error("load failed")', sandbox);
});
console.log('SMOKE TEST DONE');
process.exit(process.exitCode || 0);
