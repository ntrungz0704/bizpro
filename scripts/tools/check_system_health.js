const http = require('http');

console.log('=== BIZPRO+ SYSTEM HEALTH DIAGNOSTICS ===');

async function checkUrl(url, label) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        const isOk = res.statusCode >= 200 && res.statusCode < 400;
        console.log(`[${isOk ? 'OK' : 'FAIL'}] ${label.padEnd(25)}: Status ${res.statusCode} (${data.length} bytes)`);
        resolve({ ok: isOk, statusCode: res.statusCode, data });
      });
    });
    req.on('error', (err) => {
      console.log(`[FAIL] ${label.padEnd(25)}: Connection error - ${err.message}`);
      resolve({ ok: false, error: err.message });
    });
    req.setTimeout(5000, () => {
      req.destroy();
      console.log(`[TIMEOUT] ${label.padEnd(25)}: Request timed out`);
      resolve({ ok: false, error: 'TIMEOUT' });
    });
  });
}

async function run() {
  await checkUrl('http://localhost/', 'Frontend (Web UI)');
  await checkUrl('http://localhost/api/health/live', 'Backend API (Liveness)');
  await checkUrl('http://localhost/api/health/ready', 'Database (PostgreSQL 16)');
  await checkUrl('http://127.0.0.1:9222/json/version', 'Chrome CDP Debugger');
  console.log('=========================================');
}

run();
