const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'client');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
let updatedCount = 0;

files.forEach(f => {
  const filePath = path.join(dir, f);
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('favicon.svg')) {
    // Look for <link rel="icon" type="image/png" href="favicon.png" />
    const target = '<link rel="icon" type="image/png" href="favicon.png" />';
    if (content.includes(target)) {
      content = content.replace(
        target,
        '<link rel="icon" type="image/svg+xml" href="favicon.svg" />\n  <link rel="icon" type="image/png" href="favicon.png" />'
      );
      fs.writeFileSync(filePath, content, 'utf8');
      updatedCount++;
      console.log('Updated:', f);
    }
  }
});

console.log('Finished. Total files updated:', updatedCount);
