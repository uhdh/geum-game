const fs = require('fs');
let h = fs.readFileSync('test_view.html', 'utf8');
h = h.replace('</body>', `<script>
setTimeout(function(){
  try{
    const cv = document.getElementById('game');
    const cx = cv.getContext('2d');
    const px = cx.getImageData(160, 90, 1, 1).data;
    document.title = JSON.stringify({
      w: cv.width, h: cv.height,
      styleW: cv.style.width,
      fade: Engine.fade, dir: Engine.fadeDir,
      room: Engine.room,
      px: [px[0], px[1], px[2]],
      hotspots: Engine.hotspots.length
    });
  }catch(e){ document.title = 'DIAGERR ' + e.message; }
}, 2500);
</script></body>`);
fs.writeFileSync('test_view.html', h);
console.log('pixdiag added');
