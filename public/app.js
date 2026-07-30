'use strict';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const $ = (id) => document.getElementById(id);

let products = [];
let campaign = null;
let cart = {};

function showToast(message) {
  const el = $('toast');
  el.textContent = message;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 3200);
}

function showError(message) {
  const el = $('error-banner');
  el.textContent = message;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 4200);
}

async function loadProducts() {
  const res = await fetch('/api/products');
  const data = await res.json();
  products = data.products;
  const grid = $('product-grid');
  grid.innerHTML = '';
  $('product-count').textContent = products.length + ' products';
  for (const p of products) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML =
      '<span class="cat">' + p.category + '</span>' +
      '<span class="name">' + p.name + '</span>' +
      '<span class="price">' + usd.format(p.priceCents / 100) + '</span>';
    const actions = document.createElement('div');
    actions.className = 'actions';
    const btn = document.createElement('button');
    btn.className = 'btn primary small';
    btn.textContent = 'Add to cart';
    btn.addEventListener('click', () => addToCart(p.sku));
    actions.appendChild(btn);
    card.appendChild(actions);
    grid.appendChild(card);
  }
}

async function loadCampaign() {
  const res = await fetch('/api/campaign');
  const data = await res.json();
  campaign = data.campaign;
}

function addToCart(sku) {
  cart[sku] = (cart[sku] || 0) + 1;
  renderCart();
}

function cartItems() {
  return Object.entries(cart).map(([sku, qty]) => ({ sku, qty }));
}

function renderCart() {
  const lines = $('cart-lines');
  const summary = $('cart-summary');
  lines.innerHTML = '';
  let subtotal = 0;
  for (const { sku, qty } of cartItems()) {
    const p = products.find((x) => x.sku === sku);
    if (!p) continue;
    subtotal += p.priceCents * qty;
    const row = document.createElement('div');
    row.className = 'cart-line';
    row.innerHTML =
      '<span>' + p.name + ' x' + qty + '</span>' +
      '<span>' + usd.format((p.priceCents * qty) / 100) + '</span>';
    lines.appendChild(row);
  }
  if (subtotal === 0) {
    summary.innerHTML = '<p class="status-line">Cart is empty.</p>';
    return;
  }
  const discount = campaign && campaign.active ? Math.round((subtotal * campaign.discountPct) / 100) : 0;
  const total = subtotal - discount;
  summary.innerHTML =
    '<div class="cart-line"><span>Subtotal</span><span>' + usd.format(subtotal / 100) + '</span></div>' +
    (discount > 0
      ? '<div class="cart-line deal"><span>' + campaign.name + ' (' + campaign.discountPct + '%)</span><span>-' + usd.format(discount / 100) + '</span></div>'
      : '') +
    '<div class="cart-line total"><span>Total</span><span>' + usd.format(total / 100) + '</span></div>';
}

async function loadOrders() {
  const res = await fetch('/api/orders');
  const data = await res.json();
  const list = $('orders-list');
  list.innerHTML = '';
  if (data.orders.length === 0) {
    list.innerHTML = '<p class="status-line">No orders yet.</p>';
    return;
  }
  for (const o of data.orders.slice().reverse()) {
    const row = document.createElement('div');
    row.className = 'order-row';
    row.innerHTML =
      '<span class="mono">' + o.id + '</span>' +
      '<span>' + o.items.reduce((n, it) => n + it.qty, 0) + ' items</span>' +
      '<span>' + usd.format(o.totalCents / 100) + '</span>';
    list.appendChild(row);
  }
}

async function placeOrder() {
  const items = cartItems();
  if (items.length === 0) {
    showError('Your cart is empty.');
    return;
  }
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  showToast('Order confirmed! Thank you for shopping Northpeak.');
  cart = {};
  renderCart();
  loadOrders();
}

$('place-order').addEventListener('click', placeOrder);

(async function init() {
  await loadCampaign();
  await loadProducts();
  renderCart();
  loadOrders();
})();
