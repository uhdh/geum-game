const fs = require('fs');
let h = fs.readFileSync('index.html', 'utf8');
const mode = process.argv[2] || 'madang';
let inject = '<script>' +
  'document.getElementById("screen-title").classList.add("hidden");' +
  'wipeSave(); Sfx.on=false;';
if(mode === 'madang'){ inject += 'Engine.go("madang"); Engine.fade=0; Engine.fadeDir=0;'; }
else if(mode === 'yang'){ inject += 'Engine.go("ch1"); Engine.fade=0; Engine.fadeDir=0;'; }
else if(mode === 'yin'){ inject += 'Engine.go("ch1"); G.yin=true; bakeCacheClear(); Engine.fade=0; Engine.fadeDir=0; Engine.setHotspots(ROOMS.ch1.spots());'; }
else if(mode === 'ch2'){ inject += 'Engine.go("ch2"); Engine.fade=0; Engine.fadeDir=0;'; }
else if(mode === 'clock'){ inject += 'Engine.go("ch1"); Engine.fade=0; Engine.fadeDir=0; G.flags.read_will=true; pzOpen("clock");'; }
else if(mode === 'fire'){ inject += 'Engine.go("ch3"); Engine.fade=0; Engine.fadeDir=0; Engine.give("tinder"); Engine.give("flint"); pzOpen("fire");'; }
else if(mode === 'scale'){ inject += 'Engine.go("ch4"); Engine.fade=0; Engine.fadeDir=0; G.flags.read_genealogy=true; pzOpen("scale");'; }
else if(mode === 'ch4'){ inject += 'Engine.go("ch4"); Engine.fade=0; Engine.fadeDir=0;'; }
else if(mode === 'madangyin'){ inject += 'Engine.go("madang"); G.yin=true; bakeCacheClear(); Engine.fade=0; Engine.fadeDir=0; Engine.setHotspots(ROOMS.madang.spots());'; }
else if(mode === 'ch6'){ inject += '["frag1","frag2","frag3","frag4","frag5"].forEach(f=>Engine.setFlag(f,true)); Engine.go("ch6"); Engine.fade=0; Engine.fadeDir=0;'; }
inject += '<\/script></body>';
h = h.replace('</body>', inject);
fs.writeFileSync('test_view.html', h);
console.log('written ' + mode);
