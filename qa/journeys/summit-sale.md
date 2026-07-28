# Journey: Summit Sale shopping experience

Persona: customer shopping the Summit Sale on the Northpeak storefront.
Surface: http://localhost:4620

## Preconditions

1. Server running: `npm start`
2. For step 5, checkout failure mode ON (simulates the payment/order backend
   being unavailable): `POST /api/_debug/failmode` with `{"on":true}`

## Steps and evidence

| # | Step | Expected | Evidence |
|---|---|---|---|
| 1 | Open the storefront home page | Campaign banner matches the campaign config: name and discount claim agree with `GET /api/campaign` | `01-home.png` |
| 2 | Click the campaign call-to-action | Campaign landing page loads (no 404) | `02-campaign-link.png` |
| 3 | Add the Alpine Run Jacket to the cart | Cart shows the config discount applied and the discount line agrees with the banner claim | `03-cart.png` |
| 4 | Place the order (failure mode OFF), clicking Place order twice in quick succession | Exactly one order is created | `04-orders.png` |
| 5 | Turn failure mode ON and place another order | API returns 500; the UI must surface an error state, not an order confirmation; no order is created | `05-failed-checkout.png` plus network capture |

## Pass criteria

- The banner never claims a discount different from the campaign config.
- No internal link 404s.
- A retried or double-clicked checkout never creates duplicate orders.
- The UI never confirms an order that the API did not create.

## Evidence

Store artifacts under `qa/evidence/<yyyy-mm-dd>/` (gitignored). Record HTTP
statuses observed in steps 4 and 5 alongside the screenshots.
