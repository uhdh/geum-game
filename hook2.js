const fs = require('fs');
let h = fs.readFileSync('test_view.html', 'utf8');
const hook = '<script>window.onerror=function(m,s,l){document.title=m+" @"+l;return false;};</script>\n<script src="js/palette.js"';
h = h.replace('<script src="js/palette.js"', hook);
fs.writeFileSync('test_view.html', h);
console.log('hooked');
