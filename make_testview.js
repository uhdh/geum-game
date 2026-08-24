const fs = require('fs');
let h = fs.readFileSync('index.html', 'utf8');
const mode = process.argv[2] || 'title';
let inject = '<script>' +
  'document.getElementById("screen-title").classList.add("hidden");' +
  'wipeSave(); Sfx.on=false;';
if(mode === 'yang'){ inject += 'Engine.go("ch1"); Engine.fade=0; Engine.fadeDir=0;'; }
else if(mode === 'yin'){ inject += 'Engine.go("ch1"); G.yin=true; bakeCacheClear(); Engine.fade=0; Engine.fadeDir=0; Engine.setHotspots(ROOMS.ch1.spots());'; }
else if(mode === 'jesa'){ inject += 'Engine.go("ch3"); Engine.fade=0; Engine.fadeDir=0; G.flags.read_recipe=true; pzOpen("jesa");'; }
else if(mode === 'ohaeng'){ inject += 'Engine.go("ch4"); Engine.fade=0; Engine.fadeDir=0; G.flags.read_genealogy=true; pzOpen("ohaeng");'; }
else if(mode === 'rhythm'){ inject += 'Engine.go("ch5"); Engine.fade=0; Engine.fadeDir=0; pzOpen("rhythm");'; }
else if(mode === 'ch5'){ inject += 'Engine.go("ch5"); Engine.fade=0; Engine.fadeDir=0;'; }
else if(mode === 'ch5yin'){ inject += 'Engine.go("ch5"); G.yin=true; bakeCacheClear(); Engine.fade=0; Engine.fadeDir=0; Engine.setHotspots(ROOMS.ch5.spots());'; }
else if(mode === 'ch6'){ inject += '["frag1","frag2","frag3","frag4","frag5"].forEach((f,i)=>Engine.setFlag(f,true)); Engine.go("ch6"); Engine.fade=0; Engine.fadeDir=0;'; }
else if(mode === 'ch2yin'){ inject += 'Engine.go("ch2"); G.yin=true; bakeCacheClear(); Engine.fade=0; Engine.fadeDir=0; Engine.setHotspots(ROOMS.ch2.spots());'; }
inject += '<\/script></body>';
h = h.replace('</body>', inject);
fs.writeFileSync('test_view.html', h);
console.log('written ' + mode);
