const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/pande/.gemini/antigravity/scratch/priya-birthday-surprise';
let html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(dir, 'style.css'), 'utf8');
const audio = fs.readFileSync(path.join(dir, 'audio.js'), 'utf8');
const particles = fs.readFileSync(path.join(dir, 'particles.js'), 'utf8');
const script = fs.readFileSync(path.join(dir, 'script.js'), 'utf8');

html = html.replace('<link rel="stylesheet" href="style.css">', `<style>\n${css}\n</style>`);
html = html.replace('<script src="audio.js"></script>', `<script>\n${audio}\n</script>`);
html = html.replace('<script src="particles.js"></script>', `<script>\n${particles}\n</script>`);
html = html.replace('<script src="script.js"></script>', `<script>\n${script}\n</script>`);

const outPath = path.join(dir, 'priya-birthday-standalone.html');
fs.writeFileSync(outPath, html, 'utf8');

console.log('SUCCESS: Standalone file created at: ' + outPath);
console.log('Size: ' + fs.statSync(outPath).size + ' bytes');
