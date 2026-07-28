# Northpeak Storefront Demo: Agent Guide

## Project

Retail storefront demo: the Northpeak Sportswear shop (static frontend in
`public/`) and a simplified checkout/order API (`server.js` + `lib/orders.js`,
a stand-in for the order service behind the legacy Java OMS). Zero runtime
dependencies; Node built-ins only.

Domain: customers browse the catalog, campaign pricing comes from the campaign
config, and checkout creates orders. Campaign creative, discount claims, and
links must always derive from `lib/catalog.js`, the single source of truth.

## Commands

- Start: `npm start` then open http://localhost:4620
- Test: `npm test`
- Checkout failure toggle (demo tooling): `POST /api/_debug/failmode` with body
  `{"on":true}`, or start the server with `FAIL_CHECKOUT=1`

## Engineering standards

- Every order mutation must use an idempotency key; checkout must be safe to
  retry without creating duplicate orders.
- Campaign creative, discount claims, and campaign links must come from the
  campaign config, never hard-coded in markup or scripts.
- Every internal link must resolve to a registered route; no dead links ship.
- Never log payment card data or customer PII.
- Avoid unbounded queries in request paths.
- Keep the project dependency-free; use Node built-ins only.
