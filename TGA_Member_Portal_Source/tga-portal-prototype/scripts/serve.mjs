import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('dist/client');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.avif':'image/avif','.png':'image/png','.woff2':'font/woff2','.woff':'font/woff','.txt':'text/plain'};
createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}try{if(!(await stat(file)).isFile())file=path.join(root,'index.html');}catch{if(path.extname(file)){res.writeHead(404).end();return;}file=path.join(root,'index.html');}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.writeHead(500).end();}}).listen(Number(process.env.PORT||5173),'127.0.0.1',()=>console.log('POC preview: http://127.0.0.1:5173'));
