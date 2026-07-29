# Droid QA Report - Northpeak Storefront

**PR:** {pr_title}
**Target:** {environment} ({base_url})
**Scope:** {apps_tested} (routed from the PR diff)
**Overall:** {PASS | FAIL | BLOCKED}

## Results

| # | Flow | Expected | Observed | Result | Evidence |
|---|------|----------|----------|--------|----------|
| 1 | {flow_name} | {expected} | {observed} | {PASS/FAIL/BLOCKED} | {evidence_ref} |

## Failures

For each failing flow, include:

- **What the shopper sees:** the user-facing symptom.
- **Expected vs actual:** the concrete mismatch.
- **Evidence:** path to the screenshot or captured response under `qa-evidence/`.

## Notes

- Tooling used (browser vs HTTP-only), and anything skipped or degraded.
- Suggested follow-ups (failure learning).
