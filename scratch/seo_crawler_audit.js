const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, '..', 'client');
const files = fs.readdirSync(clientDir).filter(f => f.endsWith('.html'));

console.log('--- ALL HTML FILES IN CLIENT ---');
files.forEach(f => {
  const content = fs.readFileSync(path.join(clientDir, f), 'utf8');
  const robotsMatch = content.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["'][^>]*>/i);
  const canonicalMatch = content.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i);
  const titleMatch = content.match(/<title>([^<]*)<\/title>/i);
  
  const robots = robotsMatch ? robotsMatch[1] : 'NONE';
  const canonical = canonicalMatch ? canonicalMatch[1] : 'NONE';
  const title = titleMatch ? titleMatch[1].trim() : 'NONE';

  console.log(`${f.padEnd(28)} | Robots: ${robots.padEnd(18)} | Canonical: ${canonical}`);
});

