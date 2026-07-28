'use strict';

// Simplified stand-in for the order service behind the legacy Java OMS.
// Idempotency contract: callers must supply an idempotencyKey for every
// order mutation (see AGENTS.md standards); the module dedupes on that key.

const orders = [];
const seenKeys = new Set();

function createOrder({ items, subtotalCents, discountCents, totalCents, campaignId, idempotencyKey }) {
  if (idempotencyKey) {
    if (seenKeys.has(idempotencyKey)) {
      return { created: false, reason: 'duplicate_idempotency_key' };
    }
    seenKeys.add(idempotencyKey);
  }
  const order = {
    id: 'ord_' + String(orders.length + 1).padStart(5, '0'),
    items,
    subtotalCents,
    discountCents,
    totalCents,
    campaignId: campaignId || null,
    placedAt: new Date().toISOString(),
  };
  orders.push(order);
  return { created: true, order };
}

function allOrders() {
  return orders.slice();
}

module.exports = { createOrder, allOrders };
