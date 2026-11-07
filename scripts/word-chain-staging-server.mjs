import {createServer} from 'node:http';
import {readFileSync,existsSync,statSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
const root=resolve('public'),preview=resolve('review/word-chain-staging.html');
createServer((req,res)=>{
 let path;try{path=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);}catch{res.writeHead(400);res.end('Bad request');return;}
 const file=path==='/'?preview:resolve(root,'.'+path);
 if((file!==preview&&!file.startsWith(root+sep))||!existsSync(file)||!statSync(file).isFile()){res.writeHead(404);res.end('Not found');return;}
 const type={'.html':'text/html; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'}[extname(file)]??'application/octet-stream';
 res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});res.end(readFileSync(file));
}).listen(4335,'127.0.0.1',()=>console.log('Word Chain staging review: http://127.0.0.1:4335/'));
