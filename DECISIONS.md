# Decision log

Append-only, newest last. Detailed rationale belongs in an ADR under `docs/adr/`
(note: `docs/` itself is the Vue build output).

## 2026-11-12 - Fix scientific-correctness bugs against bioRad before refactoring
**What:** Fixed the confirmed bugs found by comparing CROW with bioRad 0.12.0 (eta offset, bird total, shrinking window, stale responses, BirdTAM cap, time zones, axes, tooltip, alpha) and now keep layers with a NaN sd_vvp, as bioRad does.
**Why:** The upcoming characterisation tests must lock in correct science, not known bugs; real Wideumont data and bioRad outputs are the reference.
**Rejected:** A two-layer suite pinning current behaviour plus `test.failing` correctness tests - simpler to fix first and keep a single suite.
