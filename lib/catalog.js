'use strict';

const products = [
  { sku: 'NP-JKT-01', name: 'Alpine Run Jacket', priceCents: 18900, category: 'Outerwear' },
  { sku: 'NP-SHO-02', name: 'Summit Trail Shoe', priceCents: 13900, category: 'Footwear' },
  { sku: 'NP-TEE-03', name: 'Ridge Training Tee', priceCents: 3500, category: 'Apparel' },
  { sku: 'NP-SHT-04', name: 'Basecamp Short', priceCents: 5500, category: 'Apparel' },
  { sku: 'NP-BAG-05', name: 'Crag 22L Pack', priceCents: 9900, category: 'Gear' },
  { sku: 'NP-CAP-06', name: 'Windline Cap', priceCents: 2900, category: 'Accessories' },
];

// Single source of truth for campaign creative, discount math, and links.
const campaign = {
  id: 'summit-sale',
  name: 'Summit Sale',
  discountPct: 20,
  active: true,
  landingPath: '/campaign/summit-sale',
};

module.exports = { products, campaign };
