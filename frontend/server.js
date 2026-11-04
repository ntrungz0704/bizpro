const http = require('http');
const path = require('path');
const next = require('next');

const dir = __dirname;
const app = next({ dev: true, dir, hostname: '0.0.0.0', port: 3000 });
const handle = app.getRequestHandler();

// Keep event loop alive and prevent premature exit
setInterval(() => {}, 1000000);

process.on('SIGINT', () => {
  console.log('Caught SIGINT, ignoring to keep server running');
});

process.on('SIGTERM', () => {
  console.log('Caught SIGTERM, ignoring to keep server running');
});

process.on('uncaughtException', (err) => {
  console.error('Frontend uncaughtException:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Frontend unhandledRejection:', err);
});

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  server.listen(3000, '0.0.0.0', () => {
    console.log('> BizPro+ Frontend Ready at http://localhost:3000');
  });
}).catch(err => {
  console.error('App prepare error:', err);
});
