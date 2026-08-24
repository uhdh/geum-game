const fs = require('fs');
const c = fs.readFileSync('test_view.html', 'utf8');
const i = c.indexOf('classList.add("hidden")');
console.log('inject found at:', i);
if(i > 0) console.log('---CONTEXT---');
console.log(c.slice(Math.max(0, i - 200), i + 300));
