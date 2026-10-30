# Repository consistency audit — corrected

Original audit date: 2026-10-30
Correction pass: 2026-10-31

## Why this file was corrected

The first audit was not sufficient. A second engineering audit found real problems that text-only consistency checks missed:

1. Ø240 physical V1 was materially infeasible with planned 1-kg DE-10 procurement.
2. `uniform_sheet_gyroid_coupon.py` contained a NumPy broadcasting bug in box clipping.
3. `continuous_luneburg_gyroid.py` could fail with measured T4 calibration because the Luneburg profile reaches epsilon=1 while measured coupon CSV would normally not include rho=0/epsilon=1.
4. The audit relied too much on GitHub code search, which returned incomplete/empty results and cannot be trusted alone for consistency proof.

## Current canonical state

Physical candidate:

- `f=5 GHz`;
- `D=120 mm`;
- `R=60 mm`;
- `a=7.5 mm`;
- `D/lambda0≈2.0`.

Strict-scaled 24-GHz reference:

- `D=25 mm`;
- `R=12.5 mm`;
- `a=1.5625 mm`.

Ø120 must pass the diameter gate before full print.

## Material balance correction

Current provisional Ø120 numbers:

- sphere envelope: `904.78 cm3`;
- ideal Bruggeman volume-average rho: `≈0.358`;
- cured resin: `≈356 g` at 1.1 g/cm3 without clamp;
- `≈366 g` with provisional rho_min=0.12.

Ø240 is no longer current physical V1; it remains comparison/reference only.

## Code corrections

### tools/uniform_sheet_gyroid_coupon.py

Corrected:

- invalid `np.minimum.reduce` over differently-shaped broadcast arrays;
- box clipping now uses pairwise broadcasting;
- padded outside samples added so marching cubes can close the clipped envelope;
- actual grid spacing saved to output CSV.

### tools/continuous_luneburg_gyroid.py

Corrected:

- default radius `120 -> 60 mm`;
- measured calibration now adds physical endpoints automatically:
  - `rho=0 -> epsilon=1`;
  - `rho=1 -> epsilon=epsilon_solid`;
- T3 clamp is independent of measured interpolation;
- generator reports full-sphere polymer volume and optional cured mass;
- default rho clamp is `0..1` until measured T3 values are explicitly supplied.

Local logic smoke-test passed for:

- coupon box broadcasting;
- measured interpolation endpoint behavior.

A full cloned CLI smoke-test could not be run in the container because outbound DNS to GitHub was unavailable; this limitation is recorded rather than hidden.

## Diameter gate

Before full manufacture compare:

`D=120 / 150 / 180 / 240 mm`.

Select the smallest passing diameter based on:

- K_sigma;
- Delta_sigma_dB;
- focus position;
- spot width;
- angular response;
- material mass.

## Active files updated in correction pass

- `README.md`
- `PROJECT_MEMORY.md`
- `decisions/README.md`
- `docs/00_CONTEXT.md`
- `docs/01_REQUIREMENTS.md`
- `docs/02_PLAN.md`
- `docs/03_TEAM.md`
- `docs/04_NEXT_ACTIONS.md`
- `docs/05_BEGINNER_GUIDE.md`
- `docs/07_CALCULATION_WORKFLOW.md`
- `docs/10_SCALING_5_TO_24.md`
- `budget/README.md`
- `experiment/README.md`
- `experiment/BUILD_MANUAL.md`
- `simulation/README.md`
- `simulation/CALCULATIONS.md`
- `simulation/CONTINUOUS_GYROID.md`
- `simulation/INPUTS_TEMPLATE.yaml`
- `photo_log/README.md`
- `tools/continuous_luneburg_gyroid.py`
- `tools/uniform_sheet_gyroid_coupon.py`

## Files intentionally not diameter-dependent

- T1 protocol;
- T2/T3 coupon protocol;
- material candidate/reference documents;
- historical design-space/R&D documents.

## Current source-of-truth order

1. newest non-superseded decision;
2. `PROJECT_MEMORY.md`;
3. root `README.md`;
4. `docs/04_NEXT_ACTIONS.md`;
5. stage-specific protocol;
6. historical/R&D docs.

## Governance rule

An update is not complete until:

1. engineering decision updated;
2. source-of-truth docs updated;
3. active instructions updated;
4. material/geometry arithmetic checked;
5. code smoke-tested where executable;
6. a second post-change consistency pass is performed.
