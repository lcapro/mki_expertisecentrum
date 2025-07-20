// generate-sitemap.js
const fs = require('fs');
const path = require('path');
const { SitemapStream, streamToPromise } = require('sitemap');

const BASE_URL = 'https://www.mkiexpertisecentrum.nl';
const CONTENT_DIR = path.join(__dirname, 'dev');

const getHtmlPaths = (dir, base = '') => {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  let paths = [];

  for (const item of items) {
    if (item.isDirectory()) {
      paths = paths.concat(getHtmlPaths(path.join(dir, item.name), path.join(base, item.name)));
    } else if (item.name === 'index.html') {
      paths.push(path.join(base, '/'));
    } else if (item.name.endsWith('.html')) {
      paths.push(path.join(base, item.name));
    }
  }

  return paths;
};

const urls = getHtmlPaths(CONTENT_DIR).map((p) => {
  const cleanPath = p.replace(/\\/g, '/').replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  return {
    url: cleanPath,
    changefreq: 'monthly',
    priority: 0.7,
  };
});

const sitemap = new SitemapStream({ hostname: BASE_URL });
streamToPromise(sitemap).then((data) => {
  fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), data.toString());
  console.log('✅ sitemap.xml bijgewerkt!');
});

urls.forEach((u) => sitemap.write(u));
sitemap.end();
