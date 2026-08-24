const fs = require('fs');
let c = fs.readFileSync('js/rooms_b.js', 'utf8');
const i = c.indexOf('ROOMS.ch4');
const j = c.indexOf('ROOMS.ch5');
if(i < 0 || j < 0){ console.error('markers not found'); process.exit(1); }
const next = `ROOMS.ch4 = {
  title: '사당 — 위패',
  onEnter(){
    Engine.say('사당이다. 제물 저울이 놓인 상과, 맨 아래 봉인된 칸.');
    Engine.setHotspots(this.spots());
  },
  onYin(){ Engine.setHotspots(this.spots()); },
  draw(c, t){
    const P = pal();
    drawRoomBase(c);
    px(P.wood, 60, 34, 200, 10);
    px(P.woodDark, 60, 44, 200, 4);
    px(P.wood, 60, 88, 200, 8);
    px(P.woodDark, 60, 96, 200, 4);
    px(P.woodDark, 216, 100, 44, 20);
    px(P.metal2, 234, 106, 8, 8);
    px(P.paper2, 220, 104, 36, 12);
    px(P.wood, 96, 52, 128, 8);
    px(P.woodDark, 100, 60, 6, 28); px(P.woodDark, 214, 60, 6, 28);
    const sp = G.flags.scalePos || {};
    let sumL = 0, sumR = 0;
    const WG = { gam:3, ju:2, bam:4, yu:1, san:5 };
    Object.keys(WG).forEach(k => {
      if(sp[k] === 'l') sumL += WG[k];
      if(sp[k] === 'r') sumR += WG[k];
    });
    const tilt = Math.max(-0.3, Math.min(0.3, (sumL - sumR) * 0.06));
    c.save();
    c.translate(160, 58);
    c.rotate(tilt);
    c.strokeStyle = P.wood2;
    c.lineWidth = 2;
    c.beginPath(); c.moveTo(-58, 0); c.lineTo(58, 0); c.stroke();
    c.fillStyle = P.accent;
    c.fillRect(-62, -4, 5, 5);
    c.fillRect(57, -4, 5, 5);
    c.restore();
    c.fillStyle = P.stone;
    c.beginPath(); c.moveTo(152, 88); c.lineTo(168, 88); c.lineTo(160, 74); c.fill();
    drawCandle(c, 280, 60, true, t);
    drawCandle(c, 292, 60, true, t + 2);
    px(P.paper, 276, 62, 4, 26);
    px(P.paper, 288, 62, 4, 26);
    px(Engine.flag('read_genealogy') ? P.paper2 : P.paper, 130, 100, 24, 10);
    px(P.paper2, 130, 100, 24, 1);
    if(G.yin) drawRabbitHint(c, 286, 96, t);
    if(Engine.flag('p_scale') && Engine.flag('p_ohaeng') && !Engine.flag('frag4')){
      const a = 0.6 + 0.4 * Math.sin(t * 5);
      c.globalAlpha = a;
      dspr('frag', 152, 20);
      c.globalAlpha = 1;
    }
  },
  spots(){
    const s = [];
    s.push({ x:96, y:40, w:128, h:48, act:() => {
      if(!Engine.flag('p_scale')) pzOpen('scale');
      else Engine.say('저울은 평온히 균형을 이루고 있다.');
    }});
    s.push({ x:214, y:98, w:48, h:24, act:() => {
      if(!Engine.flag('p_scale')){ Engine.say('봉인이 풀리지 않는다. 저울의 균형이 필요하다.'); return; }
      if(!Engine.has('diary2')){
        Engine.give('diary2');
        openReader('봉인 칸 — 낡은 위패', '위패에는 이렇게 새겨 있다.\\n\\n「김지호 — 세상을 떠나다\\n20년 전 그믐밤」\\n\\n…내 이름이다.');
        Engine.say('…이건. 내 위패.');
        setTimeout(() => Engine.say('나는 — 20년 전 여름에 죽었던 건가.'), 2500);
      } else openReader('낡은 위패', '「김지호 — 세상을 떠나다 20년 전 그믐밤」');
    }});
    s.push({ x:16, y:40, w:34, h:60, act:() => {
      if(!Engine.flag('p_ohaeng')) pzOpen('ohaeng');
      else Engine.say('오행의 순환이 조용히 돌고 있다.');
    }});
    s.push({ x:126, y:96, w:30, h:18, act:() => {
      if(!Engine.flag('read_genealogy')){
        Engine.setFlag('read_genealogy', true);
        openReader('족보', '달골 김씨 세계.\\n\\n제물 저울의 법.\\n좌우가 다르면 조상이 노한다.\\n넷 이상 올려 균형을 이루어라.\\n\\n곶감은 셋, 대추는 둘,\\n밤은 넷, 유과는 하나, 산자는 다섯.');
      } else openReader('족보', '「좌우가 다르면 조상이 노한다.\\n넷 이상 올려 균형을 이루어라」\\n\\n곶감 3 · 대추 2 · 밤 4 · 유과 1 · 산자 5');
    }});
    s.push({ x:0, y:40, w:14, h:70, act:() => Engine.go('madang') });
    if(G.yin) s.push({ x:282, y:92, w:26, h:22, act:rabbitTap });
    if(Engine.flag('p_scale') && Engine.flag('p_ohaeng') && !Engine.flag('frag4'))
      s.push({ x:146, y:16, w:32, h:16, act:() => collectFragment(4) });
    return s;
  }
};
`;
c = c.slice(0, i) + next + c.slice(j);
fs.writeFileSync('js/rooms_b.js', c);
console.log('ch4 replaced, new length:', c.length);
