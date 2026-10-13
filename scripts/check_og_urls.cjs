const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, '../client');
const files = fs.readdirSync(clientDir).filter(f => f.endsWith('.html'));

console.log('--- OG URL TAGS ---');
files.forEach(f => {
  const content = fs.readFileSync(path.join(clientDir, f), 'utf8');
  const m = content.match(/<meta[^>]*property=["']og:url["'][^>]*>/i);
  if (m) console.log(`${f}: ${m[0]}`);
});
