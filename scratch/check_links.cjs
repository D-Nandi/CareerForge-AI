const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, '..', 'client');
const files = fs.readdirSync(clientDir).filter(f => f.endsWith('.html'));

const allPages = new Set(files);
const brokenLinks = [];
const emptyLinks = [];

files.forEach(file => {
  const content = fs.readFileSync(path.join(clientDir, file), 'utf8');
  // Specifically match anchor links
  const matches = [...content.matchAll(/<a[^>]*href=["']([^"']*)["']/gi)];

  matches.forEach(m => {
    const rawHref = m[1].trim();
    if (!rawHref || rawHref === '#') {
      emptyLinks.push({ file, href: rawHref });
      return;
    }

    if (rawHref.startsWith('http://') || rawHref.startsWith('https://')) {
      return;
    }

    if (rawHref.startsWith('mailto:') || rawHref.startsWith('tel:') || rawHref.startsWith('javascript:')) {
      return;
    }

    // Split target file and hash/query
    const [pathPart, queryOrHash] = rawHref.split(/[?#]/);

    if (pathPart === '') {
      // Local anchor link on the same page, e.g. #faq or #how
      const anchorId = queryOrHash;
      if (anchorId) {
        const idRegex = new RegExp(`id=["']${anchorId}["']`, 'i');
        if (!idRegex.test(content)) {
          brokenLinks.push({ file, href: rawHref, reason: `Anchor #${anchorId} not found in ${file}` });
        }
      }
    } else {
      // Relative file link
      if (!allPages.has(pathPart) && pathPart !== 'sitemap.xml' && pathPart !== 'robots.txt') {
        brokenLinks.push({ file, href: rawHref, reason: `Target file ${pathPart} does not exist in client/` });
      } else if (allPages.has(pathPart) && rawHref.includes('#')) {
        const anchorId = rawHref.split('#')[1];
        if (anchorId) {
          const targetContent = fs.readFileSync(path.join(clientDir, pathPart), 'utf8');
          const idRegex = new RegExp(`id=["']${anchorId}["']`, 'i');
          if (!idRegex.test(targetContent)) {
            brokenLinks.push({ file, href: rawHref, reason: `Anchor #${anchorId} not found in ${pathPart}` });
          }
        }
      }
    }
  });
});

console.log('Broken anchor links:', brokenLinks.length);
if (brokenLinks.length) console.log(JSON.stringify(brokenLinks, null, 2));

console.log('Empty / hash anchor links:', emptyLinks.length);
if (emptyLinks.length) console.log(JSON.stringify(emptyLinks, null, 2));
