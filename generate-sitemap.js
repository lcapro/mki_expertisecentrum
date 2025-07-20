// generate-sitemap.js
const fs = require('fs');
const path = require('path');
const { SitemapStream, streamToPromise } = require('sitemap');

const BASE_URL = 'https://www.mkiexpertisecentrum.nl';
const CONTENT_DIR = path.join(__dirname, 'dev');
const SITEMAP_PATH = path.join(__dirname, 'sitemap.xml');

// 🔄 Oude sitemap verwijderen
if (fs.existsSync(SITEMAP_PATH)) {
  fs.unlinkSync(SITEMAP_PATH);
}

// 🔍 HTML-paden verzamelen
const getHtmlPaths = (dir, base = '') => {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  let paths = [];

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const urlPath = path.join(base, item.name);

    if (item.isDirectory()) {
      paths = paths.concat(getHtmlPaths(fullPath, urlPath));
    } else if (item.name.endsWith('.html')) {
      let cleanPath = urlPath
        .replace(/\\/g, '/')            // Windows pad fix
        .replace(/\/index\.html$/, '/') // index.html → /
        .replace(/\.html$/, '');        // over-ons.html → /over-ons

      if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
      paths.push(cleanPath);
    }
  }

  return paths;
};

// 🧱 Sitemap bouwen
const urls = getHtmlPaths(CONTENT_DIR).map((url) => ({
  url,
  changefreq: 'monthly',
  priority: url === '/' ? 1.0 : 0.7,
}));

const sitemap = new SitemapStream({ hostname: BASE_URL });

streamToPromise(sitemap).then((data) => {
  fs.writeFileSync(SITEMAP_PATH, data.toString());
  console.log('✅ sitemap.xml succesvol gegenereerd!');
});

urls.forEach((entry) => sitemap.write(entry));
sitemap.end();
