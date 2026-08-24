'use strict';
const SPRITES = {
  bell: { rows:[
    '...cc...',
    '..c11c..',
    '.c1111c.',
    '.c1111c.',
    '.c1111c.',
    '..1111..',
    '...44...',
    '...22...',
    '..2222..'
  ], map:{ c:'woodDark', '1':'glow2', '2':'wood', '4':'ink' } },
  diary: { rows:[
    '.444444.',
    '41111114',
    '41111114',
    '41111114',
    '41111114',
    '41111114',
    '.444444.'
  ], map:{ '1':'paper', '4':'woodDark' } },
  rabbit: { rows:[
    '.5..5...',
    '.55.5...',
    '.5555...',
    '555555..',
    '515515..',
    '555555..',
    '.5555.5.',
    '.55555..',
    '.55.55..',
    '.5..5...'
  ], map:{ '5':'white', '1':'ink' } },
  mortar: { rows:[
    '.444444.',
    '43333334',
    '.433334.',
    '..4334..',
    '...44...'
  ], map:{ '3':'wood2', '4':'woodDark' } },
  frag: { rows:[
    '..44....',
    '..144...',
    '..114...',
    '...114..',
    '....14..',
    '....1...',
    '...1....'
  ], map:{ '4':'ink', '1':'glow' } },
  lock: { rows:[
    '..4444..',
    '.4....4.',
    '.4....4.',
    '44444444',
    '41111114',
    '41144114',
    '41111114',
    '44444444'
  ], map:{ '4':'metal2', '1':'metal' } },
  boat: { rows:[
    '......5.',
    '.....5..',
    '....5...',
    '55555555',
    '.444444.',
    '..4444..'
  ], map:{ '5':'white', '4':'ink' } },
  fish: { rows:[
    '......44',
    '.4444.4.',
    '4444444.',
    '.4444.4.',
    '......44'
  ], map:{ '4':'metal' } },
  meat: { rows:[
    '..444...',
    '.44444..',
    '.44444..',
    '..4444..',
    '...44...'
  ], map:{ '4':'accent' } },
  po: { rows:[
    '.4.4.4..',
    '.44444..',
    '..444...',
    '..444...',
    '...4....'
  ], map:{ '4':'paper2' } },
  hye: { rows:[
    '..444...',
    '.4...4..',
    '4.....4.',
    '.4...4..',
    '..444...'
  ], map:{ '4':'paper' } },
  fruitR: { rows:[
    '...4....',
    '..4444..',
    '.444444.',
    '.444444.',
    '..4444..'
  ], map:{ '4':'accent' } },
  fruitW: { rows:[
    '...4....',
    '..4444..',
    '.444444.',
    '.444444.',
    '..4444..'
  ], map:{ '4':'paper' } },
  sinwi: { rows:[
    '.444444.',
    '.455554.',
    '.455554.',
    '.444444.',
    '..4..4..'
  ], map:{ '4':'woodDark', '5':'paper' } },
  jar: { rows:[
    '..4444..',
    '.4....4.',
    '.4....4.',
    '.4....4.',
    '..4444..'
  ], map:{ '4':'stone' } },
  well: { rows:[
    '...444...',
    '..4...4..',
    '.4444444.',
    '4s2s2s2s4',
    '.4s2s2s4.',
    '.4444444.',
    '..4s2s4..',
    '..44444..'
  ], map:{ '4':'woodDark', 's':'stone', '2':'stone2' } },
  tal: { rows:[
    '..4444..',
    '.444444.',
    '4a4444b4',
    '44444444',
    '.444444.',
    '..4..4..'
  ], map:{ '4':'paper2', 'a':'accent', 'b':'ink' } },
  flint: { rows:[
    '..44....',
    '.4444.4.',
    '4444444.',
    '.44444..',
    '..444...',
    '...44...'
  ], map:{ '4':'metal2' } },
  cotton: { rows:[
    '...55...',
    '..5555..',
    '.555555.',
    '.555555.',
    '..5555..',
    '...55...'
  ], map:{ '5':'white' } },
  tinder: { rows:[
    '...ff...',
    '..fFFf..',
    '.fFFFFf.',
    '..FFFF..',
    '...44...',
    '..444...'
  ], map:{ 'f':'flame2', 'F':'flame', '4':'woodDark' } }
};
const bakeCache = {};
function bake(key, yinOverride){
  const st = (yinOverride === undefined ? G.yin : yinOverride) ? 'y' : 'n';
  const ck = key + st;
  if(bakeCache[ck]) return bakeCache[ck];
  const s = SPRITES[key];
  const cv2 = document.createElement('canvas');
  cv2.width = s.rows[0].length; cv2.height = s.rows.length;
  const c2 = cv2.getContext('2d');
  const P = st === 'y' ? PAL.yin : PAL.yang;
  for(let j = 0; j < s.rows.length; j++){
    const row = s.rows[j];
    for(let i = 0; i < row.length; i++){
      const ch = row[i];
      if(ch === '.' || ch === ' ') continue;
      const col = s.map[ch];
      c2.fillStyle = P[col] || col;
      c2.fillRect(i, j, 1, 1);
    }
  }
  bakeCache[ck] = cv2;
  return cv2;
}
function dspr(key, x, y){
  ctx.drawImage(bake(key), x|0, y|0);
}
function itemIcon(id, size){
  const map = { bell:'bell', diary1:'diary', diary2:'diary', flint:'flint', cotton:'cotton', tinder:'tinder' };
  const cv2 = document.createElement('canvas');
  cv2.width = 24; cv2.height = 24;
  const c2 = cv2.getContext('2d');
  c2.imageSmoothingEnabled = false;
  const spr = bake(map[id] || 'frag', false);
  const s = Math.floor(20 / Math.max(spr.width, spr.height)) || 1;
  c2.drawImage(spr, (24 - spr.width*s)/2|0, (24 - spr.height*s)/2|0, spr.width*s, spr.height*s);
  return cv2;
}
