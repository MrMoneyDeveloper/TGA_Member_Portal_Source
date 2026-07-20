import { build } from 'esbuild';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const outdir = path.join(root, 'dist');
const clientDir = path.join(outdir, 'client');

await rm(outdir, { recursive: true, force: true });
await mkdir(clientDir, { recursive: true });

await build({
  absWorkingDir: root,
  entryPoints: ['./src/main.js'],
  bundle: true,
  format: 'esm',
  target: ['es2022'],
  minify: true,
  sourcemap: false,
  outfile: 'dist/client/app.js',
  assetNames: 'assets/[name]-[hash]',
  loader: {
    '.jpg': 'file',
    '.jpeg': 'file',
    '.png': 'file',
    '.mp3': 'file',
    '.riv': 'file'
  },
  logLevel: 'info'
});

await cp(path.join(root, 'public'), clientDir, { recursive: true });

const sourceHtml = await readFile(path.join(root, 'index.html'), 'utf8');
const productionHtml = sourceHtml
  .replace('<link rel="stylesheet" href="/src/styles.css">', '<link rel="stylesheet" href="./app.css">')
  .replace('<script type="module" src="/src/main.js"></script>', '<script type="module" src="./app.js"></script>');

await writeFile(path.join(clientDir, 'index.html'), productionHtml);
await mkdir(path.join(outdir, 'server'), { recursive: true });
await cp(path.join(root, 'src', 'worker.js'), path.join(outdir, 'server', 'index.js'));
console.log('Static frontend built in dist/client with a Sites worker entrypoint.');
