// scripts/generate-sitemap.js
const fs = require('fs');
const path = require('path');

const BASE = process.env.SITE_BASE_URL || 'https://www.yoursite.com';
const DIST = path.join(__dirname, '..', 'dist'); // adjust if your build output is different

function walk(dir, files = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    const full = path.join(dir, it.name);
    if (it.isDirectory()) walk(full, files);
    else if (it.isFile() && /\.html$/.test(it.name)) {
      const rel = path.relative(DIST, full).replace(/\\/g, '/');
      // normalize /index.html to root path
      let url = rel === 'index.html' ? `${BASE}/` : `${BASE}/${rel.replace(/index\.html$/, '')}`;
      // remove duplicate slashes
      url = url.replace(/([^:]\/)\/+/g, '$1');
      files.push(url);
    }
  }
  return files;
}

if (!fs.existsSync(DIST)) {
  console.warn('Warning: dist directory not found at', DIST);
  process.exit(0);
}

const pages = walk(DIST);
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(u => `
  <url>
    <loc>${u}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`;

fs.writeFileSync(path.join(DIST, 'sitemap.xml'), xml, 'utf8');
console.log('Sitemap written with', pages.length, 'entries to', path.join(DIST, 'sitemap.xml'));
