const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, '..', 'client');
const files = fs.readdirSync(clientDir).filter(f => f.endsWith('.html'));

console.log('Total HTML files:', files.length);

const results = [];

files.forEach(f => {
  const content = fs.readFileSync(path.join(clientDir, f), 'utf8');
  const titleMatch = content.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const descMatch = content.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i);
  const robotsMatch = content.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([\s\S]*?)["']/i);
  const canonicalMatch = content.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([\s\S]*?)["']/i);
  const ogTitleMatch = content.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([\s\S]*?)["']/i);
  const ogUrlMatch = content.match(/<meta[^>]*property=["']og:url["'][^>]*content=["']([\s\S]*?)["']/i);
  const ogImageMatch = content.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([\s\S]*?)["']/i);
  const twitterCardMatch = content.match(/<meta[^>]*name=["']twitter:card["'][^>]*content=["']([\s\S]*?)["']/i);
  const h1Matches = [...content.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
  const jsonLdMatches = [...content.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];

  // Check images for alt attribute
  const imgMatches = [...content.matchAll(/<img([^>]*)>/gi)];
  const missingAltImgs = [];
  imgMatches.forEach(img => {
    if (!/alt=["']/i.test(img[1])) {
      missingAltImgs.push(img[0].slice(0, 50));
    }
  });

  // Check links
  const hrefMatches = [...content.matchAll(/href=["']([^"']*)["']/gi)].map(m => m[1]);

  results.push({
    file: f,
    title: titleMatch ? titleMatch[1].trim() : null,
    description: descMatch ? descMatch[1].trim() : null,
    robots: robotsMatch ? robotsMatch[1].trim() : null,
    canonical: canonicalMatch ? canonicalMatch[1].trim() : null,
    ogTitle: ogTitleMatch ? ogTitleMatch[1].trim() : null,
    ogUrl: ogUrlMatch ? ogUrlMatch[1].trim() : null,
    ogImage: ogImageMatch ? ogImageMatch[1].trim() : null,
    twitterCard: twitterCardMatch ? twitterCardMatch[1].trim() : null,
    h1s: h1Matches,
    jsonLdCount: jsonLdMatches.length,
    missingAltCount: missingAltImgs.length,
    missingAltSamples: missingAltImgs.slice(0, 3),
    totalHrefs: hrefMatches.length,
    emptyHrefs: hrefMatches.filter(h => h === '#' || h === '').length
  });
});

fs.writeFileSync(path.join(__dirname, 'audit_res.json'), JSON.stringify(results, null, 2));
console.log('Saved audit_res.json with', results.length, 'pages');
