'use strict';
const G = {
  chapter: 1, yin: false, inv: [], flags: {}, fragments: 0, hints: 0,
  started: false, seenIntro: false, endings: {}, stoneSeed: 7,
  cursor: null, msgFull: '', msgShown: 0, msgT: 0
};
const SAVE_KEY = 'geum_save_v1';
function saveGame(){
  try{
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      chapter:G.chapter, yin:G.yin, inv:G.inv, flags:G.flags, fragments:G.fragments,
      hints:G.hints, seenIntro:G.seenIntro, endings:G.endings, stoneSeed:G.stoneSeed, sound:Sfx.on
    }));
  }catch(e){}
}
function loadGame(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if(raw){
      const d = JSON.parse(raw);
      Object.assign(G, d);
      Sfx.on = d.sound !== false;
      return true;
    }
  }catch(e){}
  return false;
}
function wipeSave(){
  try{ localStorage.removeItem(SAVE_KEY); }catch(e){}
  Object.assign(G, {
    chapter:1, yin:false, inv:[], flags:{}, fragments:0, hints:0,
    started:false, seenIntro:false, endings:{}, stoneSeed:7, cursor:null
  });
}
const ITEMS = {
  bell:{ name:'제방 — 누르면 음과 양이 바뀐다' },
  diary1:{ name:'할머니의 일기 · 상', readable:true, text:'' },
  diary2:{ name:'할머니의 일기 · 하', readable:true, text:'' }
};
const Engine = {
  cv:null, ctx:null, scale:1, room:null, hotspots:[], sparkleT:0,
  fade:1, fadeDir:0, fadeCb:null,
  init(){
    this.cv = document.getElementById('game');
    this.ctx = this.cv.getContext('2d');
    ctx = this.ctx;
    this.ctx.imageSmoothingEnabled = false;
    this.fit();
    window.addEventListener('resize', () => this.fit());
    this.cv.addEventListener('pointerdown', e => this.tap(e));
    requestAnimationFrame(t => this.loop(t));
  },
  fit(){
    const pad = 0;
    const s = Math.max(1, Math.min(
      Math.floor((window.innerWidth - pad) / W),
      Math.floor((window.innerHeight - pad) / H)
    ));
    this.scale = s;
    const st = document.getElementById('stage');
    st.style.width = (W * s) + 'px';
    st.style.height = (H * s) + 'px';
    const cv = this.cv;
    cv.style.width = (W * s) + 'px';
    cv.style.height = (H * s) + 'px';
  },
  toGame(e){
    const r = this.cv.getBoundingClientRect();
    return {
      x: Math.floor((e.clientX - r.left) / r.width * W),
      y: Math.floor((e.clientY - r.top) / r.height * H)
    };
  },
  tap(e){
    Sfx.ensure();
    if(this.fadeDir !== 0) return;
    const pz = document.getElementById('puzzle-layer');
    if(!pz.classList.contains('hidden')) return;
    const p = this.toGame(e);
    const hs = this.hotspots;
    for(let i = 0; i < hs.length; i++){
      const h = hs[i];
      if(h.yin !== undefined && h.yin !== G.yin) continue;
      if(h.when && !h.when()) continue;
      if(p.x >= h.x && p.x < h.x + h.w && p.y >= h.y && p.y < h.y + h.h){
        Sfx.click();
        h.act();
        return;
      }
    }
  },
  setHotspots(list){ this.hotspots = list; this.sparkleT = 2.6; },
  go(roomId){
    this.room = roomId;
    const r = ROOMS[roomId];
    document.getElementById('chapname').textContent = r.title;
    r.onEnter && r.onEnter();
    this.fadeIn();
  },
  say(text){
    G.msgFull = text; G.msgShown = 0; G.msgT = 0;
    document.getElementById('textbar').classList.add('on');
  },
  clearSay(){ document.getElementById('textbar').classList.remove('on'); },
  give(id){
    if(!G.inv.includes(id)) G.inv.push(id);
    Sfx.pickup();
    renderInv();
    toast(ITEMS[id].name + ' 을(를) 얻었다');
    saveGame();
  },
  has(id){ return G.inv.includes(id); },
  setFlag(k, v){ G.flags[k] = v; saveGame(); },
  flag(k){ return !!G.flags[k]; },
  fadeOut(cb){ this.fadeDir = 1; this.fadeCb = cb; },
  fadeIn(){ this.fadeDir = -1; },
  toggleYin(){
    if(!G.has('bell')){ toast('무언가 소리를 내는 도구가 필요하다'); return; }
    this.fadeOut(() => {
      G.yin = !G.yin;
      bakeCacheClear();
      if(G.yin) Sfx.yinShift(); else Sfx.yangShift();
      const fl = document.getElementById('flash');
      fl.style.opacity = 0.5;
      setTimeout(() => fl.style.opacity = 0, 130);
      const r = ROOMS[this.room];
      r.onYin && r.onYin();
      saveGame();
    });
  },
  loop(t){
    const now = t / 1000;
    const dt = Math.min(0.05, now - (this._last || now));
    this._last = now;
    this.T = (this.T || 0) + dt;
    if(this.fadeDir === 1){
      this.fade += dt * 2.2;
      if(this.fade >= 1){ this.fade = 1; this.fadeDir = -1; const cb = this.fadeCb; this.fadeCb = null; if(cb) cb(); }
    } else if(this.fadeDir === -1){
      this.fade -= dt * 2.2;
      if(this.fade <= 0){ this.fade = 0; this.fadeDir = 0; }
    }
    if(G.msgShown < G.msgFull.length){
      G.msgT += dt;
      while(G.msgT > 0.028 && G.msgShown < G.msgFull.length){
        G.msgT -= 0.028; G.msgShown++;
        if(G.msgShown % 3 === 0) Sfx.tone(900 + Math.random() * 300, .015, 'square', .012);
      }
      document.getElementById('msg').textContent = G.msgFull.slice(0, G.msgShown);
    }
    if(this.room && ROOMS[this.room]) this.render();
    requestAnimationFrame(t2 => this.loop(t2));
  },
  render(){
    const c = this.ctx;
    c.fillStyle = pal().bg;
    c.fillRect(0, 0, W, H);
    ROOMS[this.room].draw(c, this.T);
    if(this.sparkleT > 0){
      this.sparkleT -= 0.016;
      const a = Math.min(1, this.sparkleT);
      c.globalAlpha = a * 0.8;
      this.hotspots.forEach(h => {
        if(h.yin !== undefined && h.yin !== G.yin) return;
        if(h.when && !h.when()) return;
        if(h.hidden) return;
        const x = h.x + h.w/2, y = h.y + h.h/2;
        const s2 = 1 + Math.sin(this.T * 6) * 0.5;
        c.fillStyle = pal().glow;
        c.fillRect(x-1, y-3, 2, 2); c.fillRect(x-1, y+1, 2, 2);
        c.fillRect(x-3, y-1, 2, 2); c.fillRect(x+1, y-1, 2, 2);
      });
      c.globalAlpha = 1;
    }
    if(this.fade > 0){
      c.fillStyle = '#02040a';
      c.globalAlpha = this.fade;
      c.fillRect(0, 0, W, H);
      c.globalAlpha = 1;
    }
  }
};
function bakeCacheClear(){ for(const k in bakeCache) delete bakeCache[k]; }
let toastTimer = null;
function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}
function renderInv(){
  const inv = document.getElementById('inv');
  inv.innerHTML = '';
  G.inv.forEach(id => {
    const slot = document.createElement('div');
    slot.className = 'slot' + (G.cursor === id ? ' sel' : '');
    slot.appendChild(itemIcon(id));
    slot.addEventListener('click', () => {
      Sfx.click();
      const it = ITEMS[id];
      if(id === 'bell'){
        Engine.toggleYin();
        return;
      }
      if(it.readable){ openReader(it.name, it.text); return; }
      toast(it.name);
    });
    inv.appendChild(slot);
  });
}
function openReader(title, body){
  document.getElementById('reader-title').textContent = title;
  document.getElementById('reader-body').textContent = body;
  document.getElementById('reader').classList.remove('hidden');
  Sfx.page();
}
