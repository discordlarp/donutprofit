// Custom Next.js server to support `node server.js` command
require('dotenv').config();
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

console.log('==============================================');
console.log('🍩 Starting DonutProfit Web Server...');
console.log(`Mode: ${dev ? 'development' : 'production'}`);
console.log(`Port: ${port}`);
console.log('==============================================');

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Sign in modal & verification API endpoints active.`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
