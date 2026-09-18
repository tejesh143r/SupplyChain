const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');

process.env.API_KEY = 'test-api-key';
process.env.CORS_ORIGINS = 'http://allowed.example';

const app = require('../server');

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const req = http.request({
        hostname: address.address,
        port: address.port,
        path,
        method: options.method || 'GET',
        headers: {
          ...(options.body ? { 'content-type': 'application/json' } : {}),
          ...(options.headers || {}),
        },
      }, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          server.close();
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null,
          });
        });
      });
      req.on('error', (error) => {
        server.close();
        reject(error);
      });
      if (options.body) req.write(JSON.stringify(options.body));
      req.end();
    });
  });
}

test('health endpoint remains public', async () => {
  const response = await request('/api/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'healthy');
});

test('mutating endpoints reject missing API keys', async () => {
  const response = await request('/api/v1/products/register', {
    method: 'POST',
    body: { productName: 'Test', category: 'Pharma' },
  });
  assert.equal(response.status, 401);
  assert.equal(response.body.error, 'Valid API key is required');
});

test('authenticated requests still validate their payloads', async () => {
  const response = await request('/api/v1/products/register', {
    method: 'POST',
    headers: { 'x-api-key': 'test-api-key' },
    body: { productName: 'Test' },
  });
  assert.equal(response.status, 400);
  assert.match(response.body.error, /productName and category/);
});

test('configured origins receive CORS headers', async () => {
  const response = await request('/api/health', {
    headers: { origin: 'http://allowed.example' },
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers['access-control-allow-origin'], 'http://allowed.example');
});
