'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const orders = require('./lib/orders');
const { products, campaign } = require('./lib/catalog');

const PORT = Number(process.env.PORT || 4620);
const PUBLIC_DIR = path.join(__dirname, 'public');

let failMode = process.env.FAIL_CHECKOUT === '1';

function log(...args) {
  console.log(new Date().toISOString(), ...args);
}

function json(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  });
  res.end(data);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) req.destroy();
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendFile(res, filePath, status) {
  fs.readFile(filePath, (err, data) => {
    if (err) return json(res, 404, { error: 'not_found' });
    const types = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.svg': 'image/svg+xml',
    };
    res.writeHead(status || 200, { 'Content-Type': types[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
}

function serveStatic(req, res) {
  const urlPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const safePath = path.normalize(urlPath).replace(/^(\.\.[\\/])+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    return sendFile(res, path.join(PUBLIC_DIR, '404.html'), 404);
  }
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      if (path.extname(filePath) === '' || path.extname(filePath) === '.html') {
        return sendFile(res, path.join(PUBLIC_DIR, '404.html'), 404);
      }
      return json(res, 404, { error: 'not_found' });
    }
    sendFile(res, filePath, 200);
  });
}

const server = http.createServer(async (req, res) => {
  const { method, url } = req;
  const route = url.split('?')[0];
  log(method, route, failMode ? '[FAIL_MODE]' : '');

  try {
    if (method === 'GET' && route === '/api/products') {
      return json(res, 200, { products });
    }

    if (method === 'GET' && route === '/api/campaign') {
      return json(res, 200, { campaign });
    }

    if (method === 'GET' && route === '/api/orders') {
      return json(res, 200, { orders: orders.allOrders() });
    }

    if (method === 'POST' && route === '/api/checkout') {
      const body = await readBody(req);
      const items = Array.isArray(body.items) ? body.items : [];
      if (items.length === 0) return json(res, 400, { error: 'empty_cart' });
      if (failMode) return json(res, 500, { error: 'payments_unavailable' });
      let subtotalCents = 0;
      const lineItems = [];
      for (const it of items) {
        const product = products.find((p) => p.sku === it.sku);
        if (!product) return json(res, 400, { error: 'unknown_sku', sku: it.sku });
        const qty = Math.max(1, Number(it.qty) || 1);
        subtotalCents += product.priceCents * qty;
        lineItems.push({ sku: product.sku, name: product.name, priceCents: product.priceCents, qty });
      }
      const discountCents = campaign.active ? Math.round((subtotalCents * campaign.discountPct) / 100) : 0;
      const totalCents = subtotalCents - discountCents;
      const result = orders.createOrder({
        items: lineItems,
        subtotalCents,
        discountCents,
        totalCents,
        campaignId: campaign.active ? campaign.id : null,
      });
      return json(res, 201, { ok: true, order: result.order });
    }

    // Campaign landing route is registered from config, the single source of truth.
    if (method === 'GET' && campaign.active && route === campaign.landingPath) {
      return sendFile(res, path.join(PUBLIC_DIR, 'campaign.html'), 200);
    }

    // Demo tooling only: simulates the payment/order backend being unavailable.
    if (route === '/api/_debug/failmode') {
      if (method === 'GET') return json(res, 200, { failMode });
      if (method === 'POST') {
        const body = await readBody(req);
        failMode = Boolean(body.on);
        log('failMode set to', failMode);
        return json(res, 200, { failMode });
      }
    }

    if (route.startsWith('/api/')) return json(res, 404, { error: 'not_found' });
    return serveStatic(req, res);
  } catch (err) {
    log('ERROR', err.message);
    return json(res, 500, { error: 'internal_error' });
  }
});

server.listen(PORT, () => {
  log(`Northpeak storefront demo listening on http://localhost:${PORT}`);
});
