import { build } from 'esbuild';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const outdir = path.join(root, 'dist');
const clientDir = path.join(outdir, 'client');
const rawSiteUrl = String(process.env.SITE_URL || '').trim().replace(/\/$/, '');
const siteUrl = /^https?:\/\//.test(rawSiteUrl) ? rawSiteUrl : '';
const publicIndex = process.env.PUBLIC_INDEX === 'true' && Boolean(siteUrl);
const demoMode = process.env.DEMO_MODE !== 'false';
const dataMode = process.env.TGA_FRONTEND_DATA_MODE === 'api' ? 'api' : 'demo';
const apiBaseUrl = String(process.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');
const publicRoutes = ['/', '/about', '/membership', '/training', '/resources', '/contact'];

if (dataMode === 'api' && !/^https?:\/\//.test(apiBaseUrl)) {
  throw new Error('TGA_FRONTEND_DATA_MODE=api requires VITE_API_BASE_URL to be a full http(s) URL, for example https://your-api.onrender.com');
}

await rm(outdir, { recursive: true, force: true });
await mkdir(clientDir, { recursive: true });

await build({
  absWorkingDir: root,
  entryPoints: ['./src/main.js'],
  bundle: true,
  splitting: true,
  format: 'esm',
  target: ['es2022'],
  minify: true,
  sourcemap: false,
  outdir: 'dist/client',
  entryNames: 'app',
  chunkNames: 'chunks/[name]-[hash]',
  assetNames: 'assets/[name]-[hash]',
  define: {
    __TGA_SITE_URL__: JSON.stringify(siteUrl),
    __TGA_PUBLIC_INDEX__: JSON.stringify(publicIndex),
    __TGA_DEMO_MODE__: JSON.stringify(demoMode),
    __TGA_API_BASE_URL__: JSON.stringify(apiBaseUrl),
    __TGA_DATA_MODE__: JSON.stringify(dataMode)
  },
  loader: {
    '.jpg': 'file',
    '.jpeg': 'file',
    '.png': 'file',
    '.webp': 'file',
    '.woff': 'file',
    '.woff2': 'file',
    '.riv': 'file'
  },
  logLevel: 'info'
});

await cp(path.join(root, 'public'), clientDir, { recursive: true });

const canonical = siteUrl ? `<link rel="canonical" href="${siteUrl}/">` : '';
const socialImage = siteUrl
  ? `<meta property="og:url" content="${siteUrl}/">\n    <meta property="og:image" content="${siteUrl}/og.png">\n    <meta property="og:image:width" content="1200">\n    <meta property="og:image:height" content="630">\n    <meta name="twitter:image" content="${siteUrl}/og.png">`
  : '';
const sourceHtml = await readFile(path.join(root, 'index.html'), 'utf8');
const productionHtml = sourceHtml
  .replace('__TGA_ROBOTS__', publicIndex ? 'index, follow' : 'noindex, nofollow')
  .replace('<!-- TGA_CANONICAL -->', canonical)
  .replace('<!-- TGA_SOCIAL_IMAGE -->', socialImage)
  .replace('<link rel="stylesheet" href="/src/styles.css">', '<link rel="stylesheet" href="./app.css">')
  .replace('<script type="module" src="/src/main.js"></script>', '<script type="module" src="./app.js"></script>');

await writeFile(path.join(clientDir, 'index.html'), productionHtml);
await writeFile(path.join(clientDir, 'robots.txt'), publicIndex
  ? `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`
  : 'User-agent: *\nDisallow: /\n');

if (publicIndex) {
  const entries = publicRoutes
    .map((route) => `  <url><loc>${siteUrl}${route}</loc><changefreq>monthly</changefreq></url>`)
    .join('\n');
  await writeFile(path.join(clientDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`);
}

await mkdir(path.join(outdir, 'server'), { recursive: true });
await cp(path.join(root, 'src', 'worker.js'), path.join(outdir, 'server', 'index.js'));
console.log(`TGA frontend built in dist/client (${publicIndex ? 'indexable production' : 'private noindex'} mode; data=${dataMode}).`);
