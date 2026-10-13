const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, '../client');
const files = fs.readdirSync(clientDir).filter(f => f.endsWith('.html'));

console.log('--- CANONICAL TAGS ---');
files.forEach(f => {
  const content = fs.readFileSync(path.join(clientDir, f), 'utf8');
  const m = content.match(/<link[^>]*rel=["']canonical["'][^>]*>/i);
  if (m) console.log(`${f}: ${m[0]}`);
  else console.log(`${f}: NO CANONICAL`);
});
