'use strict';

const assert = require('assert');
const orders = require('../lib/orders');

const baseOrder = {
  items: [{ sku: 'NP-JKT-01', name: 'Alpine Run Jacket', priceCents: 18900, qty: 1 }],
  subtotalCents: 18900,
  discountCents: 3780,
  totalCents: 15120,
  campaignId: 'summit-sale',
};

// Same idempotency key creates exactly once.
const first = orders.createOrder({ ...baseOrder, idempotencyKey: 'key-1' });
const retry = orders.createOrder({ ...baseOrder, idempotencyKey: 'key-1' });
assert.strictEqual(first.created, true, 'first create should succeed');
assert.strictEqual(retry.created, false, 'retry with same key must not create');
assert.strictEqual(retry.reason, 'duplicate_idempotency_key');
assert.strictEqual(orders.allOrders().length, 1, 'exactly one order');

// Distinct keys create separately.
const second = orders.createOrder({ ...baseOrder, idempotencyKey: 'key-2' });
assert.strictEqual(second.created, true);
assert.strictEqual(orders.allOrders().length, 2);

// Orders carry the fields fulfillment and finance need.
const order = orders.allOrders()[0];
for (const field of ['id', 'items', 'subtotalCents', 'discountCents', 'totalCents', 'campaignId', 'placedAt']) {
  assert.ok(order[field] !== undefined, 'order missing field: ' + field);
}

console.log('orders tests passed');
