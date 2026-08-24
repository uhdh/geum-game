'use strict';
const G = {
  chapter: 1, yin: false, inv: [], flags: { yinCandlePattern:[1,0,1,1,0] }, fragments: 0, hints: 0,
  started: false, seenIntro: false, endings: {}, stoneSeed: 7,
  cursor: null, msgFull: '', msgShown: 0, msgT: 0
};
const SAVE_KEY = 'geum_save_v1';
function saveGame(){
  try{
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      room:(typeof Engine !== 'undefined' && Engine.room) || null,
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
    chapter:1, yin:false, inv:[], flags:{ yinCandlePattern:[1,0,1,1,0] }, fragments:0, hints:0,
    started:false, seenIntro:false, endings:{}, stoneSeed:7, cursor:null
  });
}
const ITEMS = {
  bell:{ name:'제방 — 누르면 음과 양이 바뀐다' },
  diary1:{ name:'할머니의 일기 · 상', readable:true, text:
    '달력 20년 8월.\n\n그 아이는 여름에 물에 빠졌다.\n달골은 아이를 보내지 않았다.\n내가 붙잡았다. 우물의 달이\n아이를 여기 묶어 두었다.\n\n미안하다. 미안하다.' },
  diary2:{ name:'할머니의 일기 · 하', readable:true, text:
    '달력 20년 9월.\n\n달지기는 아이를 지키는 자가 아니었다.\n아이가 저승으로 건너가는 마지막 길을\n밝히는 자였다.\n\n나는 겁이 났다. 그믐밤이 올 때마다\n제를 지었지만, 조각을 물에 띄우지 못했다.\n이제 나의 시간도 다한다.\n지호야, 사당의 봉인을 열어라.\n너의 이름을 확인하고, 그믐밤에 달집에 나라.' },
  flint:{ name:'부싯돈 — 조합할 물건을 누른 뒤 다른 물건을 눌러라' },
  cotton:{ name:'솜뭉치 — 조합할 물건을 누른 뒤 다른 물건을 눌러라' },
  tinder:{ name:'불씨 — 아궁이에 옮길 수 있다' }
};
const RECIPES = {
  'flint+cotton':'tinder',
  'cotton+flint':'tinder'
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
    let s = Math.min(window.innerWidth / W, window.innerHeight / H);
    if(s >= 2) s = Math.floor(s);
    s = Math.max(s, 1);
    this.scale = s;
    document.documentElement.style.setProperty('--s', s);
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
        this.ripple(p.x, p.y);
        h.act();
        return;
      }
    }
  },
  setHotspots(list){ this.hotspots = list; this.sparkleT = 2.6; },
  shake(m){ this._shake = Math.max(this._shake || 0, m); },
  burst(x, y, col, n){
    if(!this.boom) this.boom = [];
    for(let i = 0; i < (n || 14); i++){
      const a = Math.random() * Math.PI * 2;
      const sp = 20 + Math.random() * 60;
      this.boom.push({
        x:x, y:y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp - 30,
        life:0.7 + Math.random()*0.5, t:0,
        c: col || pal().glow, s: 1 + (Math.random() < 0.3 ? 1 : 0)
      });
    }
  },
  ripple(x, y){
    if(!this.rings) this.rings = [];
    this.rings.push({ x:x, y:y, t:0 });
  },
  initAmbient(){
    this.dust = [];
    for(let i = 0; i < 26; i++){
      this.dust.push({
        x: Math.random() * W, y: 30 + Math.random() * 100,
        vx: (Math.random() - 0.5) * 3, vy: -2 - Math.random() * 4,
        ph: Math.random() * 7
      });
    }
  },
  go(roomId){
    this.room = roomId;
    const r = ROOMS[roomId];
    document.getElementById('chapname').textContent = r.title;
    this.initAmbient();
    r.onEnter && r.onEnter();
    if(G.yin && r.onYin) r.onYin();
    if(!Engine.flag('seen_' + roomId)){
      Engine.setFlag('seen_' + roomId, true);
      if(typeof showRoomCard === 'function') showRoomCard(r.title);
    }
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
    toast(ITEMS[id].name.split(' — ')[0] + ' 을(를) 얻었다');
    saveGame();
  },
  take(id){
    G.inv = G.inv.filter(x => x !== id);
    if(G.cursor === id) G.cursor = null;
    renderInv();
  },
  has(id){ return G.inv.includes(id); },
  setFlag(k, v){ G.flags[k] = v; saveGame(); },
  flag(k){ return !!G.flags[k]; },
  fadeOut(cb){ this.fadeDir = 1; this.fadeCb = cb; },
  fadeIn(){ this.fadeDir = -1; },
  toggleYin(){
    if(this.fadeDir !== 0) return;
    if(!G.has('bell')){ toast('무언가 소리를 내는 도구가 필요하다'); return; }
    this.fadeOut(() => {
      G.yin = !G.yin;
      bakeCacheClear();
      if(G.yin) Sfx.yinShift(); else Sfx.yangShift();
      this.shake(4);
      this.burst(160, 90, G.yin ? '#7ae0d0' : '#e8d8a0', 12);
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
    const P = pal();
    c.save();
    if(this._shake > 0.2){
      c.translate((Math.random() - 0.5) * this._shake, (Math.random() - 0.5) * this._shake);
      this._shake *= 0.86;
    } else this._shake = 0;
    c.fillStyle = P.bg;
    c.fillRect(-4, -4, W + 8, H + 8);
    ROOMS[this.room].draw(c, this.T);
    if(ROOMS[this.room].lights){
      const Ls = ROOMS[this.room].lights(this.T);
      c.globalCompositeOperation = 'lighter';
      for(let i = 0; i < Ls.length; i++){
        const L = Ls[i];
        const fl = L.fl ? (0.82 + 0.18 * Math.sin(this.T * L.fl + i * 2.7)) : 1;
        const g = c.createRadialGradient(L.x, L.y, 2, L.x, L.y, L.r);
        g.addColorStop(0, L.col + (L.a * fl).toFixed(3) + ')');
        g.addColorStop(1, L.col + '0)');
        c.fillStyle = g;
        c.fillRect(L.x - L.r, L.y - L.r, L.r * 2, L.r * 2);
      }
      c.globalCompositeOperation = 'source-over';
    }
    if(this.dust && this.dust.length){
      for(let i = 0; i < this.dust.length; i++){
        const d = this.dust[i];
        d.x += d.vx * 0.016; d.y += d.vy * 0.016;
        if(d.y < 26){ d.y = 130; d.x = Math.random() * W; }
        if(d.x < 0) d.x = W; if(d.x > W) d.x = 0;
        const tw = 0.10 + 0.12 * (0.5 + 0.5 * Math.sin(this.T * 2 + d.ph));
        c.globalAlpha = tw;
        c.fillStyle = G.yin ? '#7ae0d0' : '#e8d8a0';
        c.fillRect(d.x | 0, d.y | 0, 1, 1);
      }
      c.globalAlpha = 1;
    }
    if(this.boom && this.boom.length){
      for(let i = this.boom.length - 1; i >= 0; i--){
        const b = this.boom[i];
        b.t += 0.016;
        if(b.t >= b.life){ this.boom.splice(i, 1); continue; }
        b.x += b.vx * 0.016; b.y += b.vy * 0.016;
        b.vy += 60 * 0.016;
        c.globalAlpha = 1 - b.t / b.life;
        c.fillStyle = b.c;
        c.fillRect(b.x | 0, b.y | 0, b.s, b.s);
      }
      c.globalAlpha = 1;
    }
    if(this.rings && this.rings.length){
      for(let i = this.rings.length - 1; i >= 0; i--){
        const r = this.rings[i];
        r.t += 0.016;
        if(r.t > 0.4){ this.rings.splice(i, 1); continue; }
        c.globalAlpha = (1 - r.t / 0.4) * 0.5;
        c.strokeStyle = P.glow;
        c.lineWidth = 1;
        c.beginPath();
        c.arc(r.x, r.y, 3 + r.t * 40, 0, 7);
        c.stroke();
      }
      c.globalAlpha = 1;
    }
    if(!this._vig){
      const v = c.createRadialGradient(W/2, H/2 - 10, 70, W/2, H/2, 210);
      v.addColorStop(0, 'rgba(0,0,0,0)');
      v.addColorStop(1, 'rgba(0,0,0,0.42)');
      this._vig = v;
    }
    c.fillStyle = this._vig;
    c.fillRect(0, 0, W, H);
    if(this.sparkleT > 0){
      this.sparkleT -= 0.016;
      const a = Math.min(1, this.sparkleT);
      c.globalAlpha = a * 0.85;
      this.hotspots.forEach(h => {
        if(h.yin !== undefined && h.yin !== G.yin) return;
        if(h.when && !h.when()) return;
        if(h.hidden) return;
        const x = h.x + h.w/2, y = h.y + h.h/2;
        c.fillStyle = P.glow;
        c.fillRect(x-1, y-3, 2, 2); c.fillRect(x-1, y+1, 2, 2);
        c.fillRect(x-3, y-1, 2, 2); c.fillRect(x+1, y-1, 2, 2);
      });
      c.globalAlpha = 1;
    }
    if(this.fade > 0){
      c.fillStyle = '#02040a';
      const f = this.fade;
      for(let gy = 0; gy < 23; gy++){
        for(let gx = 0; gx < 40; gx++){
          const h2 = ((gx * 7 + gy * 13) % 23) / 23;
          if(h2 < f * 1.15) c.fillRect(gx * 8, gy * 8, 8, 8);
        }
      }
      c.globalAlpha = Math.max(0, f * 1.6 - 0.6) * 0.9;
      c.fillRect(0, 0, W, H);
      c.globalAlpha = 1;
    }
    c.restore();
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
      if(G.cursor && G.cursor !== id){
        const result = RECIPES[G.cursor + '+' + id] || RECIPES[id + '+' + G.cursor];
        const used = G.cursor;
        G.cursor = null;
        if(result){
          Engine.take(used);
          Engine.take(id);
          Engine.give(result);
          toast('조합: ' + ITEMS[used].name.split(' — ')[0] + ' + ' + ITEMS[id].name.split(' — ')[0] + ' = ' + ITEMS[result].name.split(' — ')[0]);
        } else {
          toast('함께 쓸 수 없는 조합이다');
          renderInv();
        }
        return;
      }
      if(G.cursor === id){
        G.cursor = null;
        renderInv();
        return;
      }
      if(id === 'flint' || id === 'cotton' || id === 'tinder'){
        G.cursor = id;
        renderInv();
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
