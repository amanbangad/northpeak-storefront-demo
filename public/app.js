'use strict';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const $ = (id) => document.getElementById(id);

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
  const grid = $('product-grid');
  grid.innerHTML = '';
  $('product-count').textContent = data.products.length + ' products';
  for (const p of data.products) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML =
      '<span class="cat">' + p.category + '</span>' +
      '<span class="name">' + p.name + '</span>' +
      '<span class="price">' + usd.format(p.priceCents / 100) + '</span>';
    grid.appendChild(card);
  }
}

loadProducts();
