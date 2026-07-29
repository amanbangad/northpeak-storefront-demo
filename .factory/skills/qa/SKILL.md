---
name: qa
description: Behavioral QA orchestrator for the Northpeak storefront. Reads the PR diff, routes to affected app sub-skills, runs user-facing test flows, captures visual evidence, and writes a QA report. Use for pre-merge quality assurance of the storefront and checkout.
---

# QA Orchestrator

Run behavioral QA the way a real shopper would experience the site, then write a
structured report with pass / fail / blocked results and evidence.

## Inputs

- `config.yaml` (beside this file): environments, personas, apps, path patterns,
  and critical flows. Treat it as the single source of truth.
- `REPORT-TEMPLATE.md` (beside this file): the report format to fill in.

## Procedure

1. **Load config.** Read `config.yaml`. Resolve the target environment
   (`default_target`) and its base URL.
2. **Analyze the diff.** Run `git diff --name-only origin/main...HEAD`. Map the
   changed files to apps using each app's `path_patterns`.
3. **Scope the run.** Only execute sub-skills for affected apps. For this repo,
   changes under `public/`, `server.js`, or `lib/` route to the `qa-web`
   sub-skill (`.factory/skills/qa-web/SKILL.md`).
4. **Execute the sub-skill flows** against the running app. Follow each flow's
   steps and record the observed result versus the expected result.
5. **Capture evidence.** Save screenshots and any request/response details under
   `qa-evidence/`. Reference each evidence file from the report.
6. **Write the report.** Fill in `REPORT-TEMPLATE.md` and write it to
   `qa-report.md` at the repo root. Mark the overall run FAIL if any critical
   flow fails.

## Rules

- Never modify application code. QA observes and reports; it does not fix.
- Derive expected behavior from the campaign brief and the critical flows in
  `config.yaml`, not from the implementation.
- If a tool is unavailable, degrade gracefully (see the sub-skill fallback) and
  say so in the report rather than skipping the check.
