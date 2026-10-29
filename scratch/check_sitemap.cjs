const fs = require('fs');
const path = require('path');

const sitemap = fs.readFileSync('client/sitemap.xml', 'utf8');
const locMatches = [...sitemap.matchAll(/<loc>(https:\/\/careernest\.taqnik\.in[^<]*)<\/loc>/g)].map(m => m[1]);

console.log('URLs in sitemap (' + locMatches.length + '):');
locMatches.forEach(u => console.log('  ', u));

