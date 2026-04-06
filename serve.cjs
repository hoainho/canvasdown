const http = require('http')
const fs = require('fs')
const path = require('path')

const root = __dirname
const PORT = 3847
const mimes = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.png':  'image/png',
  '.json': 'application/json',
  '.map':  'application/json',
  '.ts':   'text/plain',
}

http.createServer((req, res) => {
  let fp = path.join(root, decodeURIComponent(req.url.split('?')[0]))
  if (!fs.existsSync(fp)) { res.writeHead(404); return res.end('Not found') }
  if (fs.statSync(fp).isDirectory()) fp = path.join(fp, 'index.html')
  res.writeHead(200, {
    'Content-Type': mimes[path.extname(fp)] || 'text/plain',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache',
  })
  fs.createReadStream(fp).pipe(res)
}).listen(PORT, '0.0.0.0', () => {
  console.log(`canvasdown demo → http://localhost:${PORT}/demo/index.html`)
})
