const fs = require('fs');
let h = fs.readFileSync('test_view.html', 'utf8');
const css = fs.readFileSync('style.css', 'utf8');
h = h.replace('<link rel="stylesheet" href="style.css"/>', '<style>\n' + css + '\n</style>');
fs.writeFileSync('test_view_inline.html', h);
console.log('inline written, css bytes:', css.length);
