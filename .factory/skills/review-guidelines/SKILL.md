---
name: review-guidelines
description: Northpeak storefront review standards, applied to every PR review of this codebase.
---

Additional checks for this codebase. Treat violations as high severity and
reference the rule by name in the finding.

- Every order mutation must use an idempotency key. Any call to
  `orders.createOrder` without an `idempotencyKey`, or any checkout path that
  can create duplicate orders on retry or double-click, is a critical finding.
- Campaign creative, discount claims, and campaign links must come from the
  campaign config (`lib/catalog.js`). Hard-coded discount percentages, campaign
  copy, or campaign URLs in markup or scripts are a critical finding.
- Every internal link must resolve to a registered route. A link to a path the
  server does not serve is a critical finding.
- Never log payment card data or customer PII.
- Avoid unbounded queries in request paths.
