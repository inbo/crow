# Decision log

Append-only, newest last. Detailed rationale belongs in an ADR under `docs/adr/`
(note: `docs/` itself is the Vue build output).

## 2026-11-12 - Fix scientific-correctness bugs against bioRad before refactoring
**What:** Fixed the confirmed bugs found by comparing CROW with bioRad 0.12.0 (eta offset, bird total, shrinking window, stale responses, BirdTAM cap, time zones, axes, tooltip, alpha) and now keep layers with a NaN sd_vvp, as bioRad does.
**Why:** The upcoming characterisation tests must lock in correct science, not known bugs; real Wideumont data and bioRad outputs are the reference.
**Rejected:** A two-layer suite pinning current behaviour plus `test.failing` correctness tests - simpler to fix first and keep a single suite.

## 2026-11-12 - Characterisation tests as golden files on real Wideumont scenarios
**What:** Pin the data Home hands to each chart and what each chart draws, as CSV/JSON golden files (`npm run test:update-golden`), with runner/Vue-specific code isolated in `tests/unit/support.ts`.
**Why:** Make the Vue 3 / Vitest port and refactoring safe: any change to the shown science surfaces as a reviewable data diff, and the specs port by changing one file.
**Rejected:** Jest `.snap` snapshots and whole-HTML snapshots - their format and markup noise would churn during the port.

## 2026-11-18 - Move to Vite + Vitest before the Vue 3 port
**What:** Replaced vue-cli/webpack, Jest and Babel with Vite, Vitest and vue-tsc while still on Vue 2.7, and made the templates pass vue-tsc's template type check.
**Why:** Change the tooling alone first, so any golden-file difference can only come from tooling, and the Vue 3 / bootstrap-vue-next step is guarded by type-checked templates.
**Rejected:** Porting to Vue 3 first on vue-cli - it keeps the jest/ts-jest workaround chain and mixes tooling and framework changes in one diff.

## 2026-11-18 - Pinia instead of Vuex, native clipboard
**What:** Ported the two vuex-module-decorators stores to Pinia 2 (still on Vue 2.7) and replaced vue-clipboard2 with navigator.clipboard.writeText.
**Why:** Pinia is Vue 3's recommended store and runs on 2.7, so the Vue 3 step gets smaller; the decorators were behind the type-check workarounds, and the clipboard is one native call.
**Rejected:** Vuex 4 + vuex-module-decorators - keeps the decorator layer for two small stores.
