---
name: qa-web
description: Web QA sub-skill for the Northpeak storefront. Drives the storefront as a shopper (campaign landing, cart, checkout) and verifies the four critical flows. Invoked by the qa orchestrator when public/, server.js, or lib/ change.
---

# QA - Web (Northpeak Storefront)

Test the storefront the way a shopper would, and prove each critical flow with
evidence. The base URL comes from the qa `config.yaml` (CI: `http://localhost:4620`).

## Tooling

Prefer **agent-browser** for real user-perspective evidence:

```bash
agent-browser open http://localhost:4620
agent-browser snapshot -i            # discover interactive elements (@e1, @e2, ...)
agent-browser click @e3
agent-browser screenshot qa-evidence/home.png
```

**Fallback (if agent-browser or Chrome is unavailable):** verify the same
behavior over HTTP with `curl` and inspect the served HTML / JSON. The report
must still record a real PASS/FAIL for every flow; note that visual evidence was
captured over HTTP instead of the browser.

Create the evidence directory first: `mkdir -p qa-evidence`.

## Source of truth

Read the campaign config once and reuse it:

```bash
curl -s http://localhost:4620/api/campaign
# -> { active, id, discountPct, landingPath, ... }
```

Expected values come from this config and the campaign brief, NOT from the
page markup.

## Flow 1 - Campaign creative integrity (discount claim)

**Expected:** the hero banner's discount claim equals `campaign.discountPct`.

1. Read `discountPct` from `/api/campaign`.
2. Open the home page; read the hero banner headline.
3. Compare the percentage shown on the page to `discountPct`.

**FAIL** if the banner advertises a different discount than the config.
Evidence: `qa-evidence/home-hero.png` plus the banner text vs `discountPct`.

## Flow 2 - Campaign CTA link resolves

**Expected:** the hero call-to-action points at `campaign.landingPath` and that
URL resolves (HTTP 200), landing on the campaign page (not the 404 page).

1. Find the primary hero CTA `href` on the home page.
2. Navigate to it (or `curl -s -o /dev/null -w "%{http_code}"` it).
3. Separately confirm `campaign.landingPath` itself resolves.

**FAIL** if the CTA href returns 404 or differs from `campaign.landingPath`.
Evidence: `qa-evidence/cta-target.png` and the HTTP status of the CTA href.

## Flow 3 - Checkout double-submit safety

**Expected:** submitting the same cart twice creates exactly one order.

1. Ensure failmode is off: `curl -s -X POST http://localhost:4620/api/_debug/failmode -H "Content-Type: application/json" -d '{"on":false}'`.
2. Record baseline: `curl -s http://localhost:4620/api/orders` (count).
3. Add a product to the cart, then place the order twice in quick succession
   (double-click the place-order button, or send two identical checkout requests).
4. Re-read `/api/orders`.

**FAIL** if the order count increases by more than one for a single shopper
action. Evidence: `qa-evidence/orders-after-double-submit.png` and before/after counts.

## Flow 4 - Checkout failure handling

**Expected:** when checkout fails (HTTP 500), the UI shows an error, never a
confirmation, and no order is created.

1. Force failure: `curl -s -X POST http://localhost:4620/api/_debug/failmode -H "Content-Type: application/json" -d '{"on":true}'`.
2. Record baseline order count from `/api/orders`.
3. Add a product and click place-order. Observe the UI: error message vs a
   success/confirmation toast.
4. Re-read `/api/orders` to confirm nothing was created.
5. Reset: post `{"on":false}` to `/api/_debug/failmode`.

**FAIL** if the UI shows a success/confirmation state, or if an order was created
despite the 500. Evidence: `qa-evidence/checkout-failure.png`.

## Reporting

Return one row per flow to the orchestrator: expected, observed, PASS/FAIL/BLOCKED,
and the evidence path. Keep application code untouched.
