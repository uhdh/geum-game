'use strict';
const Sfx = {
  ctx: null, master: null, on: true, ambientNodes: [],
  ensure(){
    if(!this.on) return null;
    if(!this.ctx){
      const AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    }
    if(this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },
  tone(f, dur, type, vol, delay, slide){
    const c = this.ensure(); if(!c) return;
    const t0 = c.currentTime + (delay || 0);
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(f, t0);
    if(slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(this.master);
    o.start(t0); o.stop(t0 + dur + 0.05);
  },
  noise(dur, freq, vol, delay){
    const c = this.ensure(); if(!c) return;
    const t0 = c.currentTime + (delay || 0);
    const len = Math.max(1, (dur * c.sampleRate)|0);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for(let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(); src.buffer = buf;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass';
    bp.frequency.value = freq; bp.Q.value = 1.2;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(bp); bp.connect(g); g.connect(this.master);
    src.start(t0); src.stop(t0 + dur + 0.02);
  },
  click(){ this.tone(700, .05, 'triangle', .1); },
  page(){ this.noise(.14, 2400, .06); },
  pickup(){ this.tone(520, .08, 'triangle', .12); this.tone(780, .1, 'triangle', .1, .08); },
  unlock(){ [440, 550, 660, 880].forEach((f, i) => this.tone(f, .1, 'triangle', .11, i * .07)); },
  fail(){ this.tone(140, .18, 'sawtooth', .08); },
  bell(){
    this.tone(660, 1.4, 'sine', .18, 0, 640);
    this.tone(662, 1.2, 'sine', .1);
    this.tone(1320, .5, 'sine', .05);
  },
  mortar(delay){
    this.noise(.05, 900, .16, delay || 0);
    this.tone(190, .06, 'square', .07, delay || 0);
    this.noise(.05, 700, .12, (delay || 0) + .09);
    this.tone(160, .06, 'square', .06, (delay || 0) + .09);
  },
  fragment(){
    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, .5, 'sine', .1, i * .16));
    this.noise(.6, 3000, .03, .3);
  },
  yinShift(){
    this.tone(300, .8, 'sine', .1, 0, 80);
    this.noise(.7, 400, .06);
  },
  yangShift(){
    this.tone(80, .8, 'sine', .1, 0, 300);
    this.noise(.7, 900, .05);
  },
  startAmbient(){
    const c = this.ensure(); if(!c || this.ambientNodes.length) return;
    const o1 = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain();
    o1.frequency.value = 55; o2.frequency.value = 55.8;
    o1.type = 'sine'; o2.type = 'sine';
    g.gain.value = 0.035;
    const lfo = c.createOscillator(), lg = c.createGain();
    lfo.frequency.value = 0.08; lg.gain.value = 0.02;
    lfo.connect(lg); lg.connect(g.gain);
    o1.connect(g); o2.connect(g); g.connect(this.master);
    o1.start(); o2.start(); lfo.start();
    this.ambientNodes = [o1, o2, lfo, g];
  },
  stopAmbient(){
    this.ambientNodes.forEach(n => { try{ n.stop && n.stop(); }catch(e){} });
    this.ambientNodes = [];
  },
  toggle(){
    this.on = !this.on;
    if(!this.on) this.stopAmbient();
    else { this.startAmbient(); this.click(); }
    return this.on;
  }
};
