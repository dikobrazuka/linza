# План проекта

## Phase A — material/process characterization

1. Lock DE-10 print/wash/post-cure process.
2. T1 solid epsilon/tan(delta) @~5 GHz.
3. T2 cured density/shrinkage.
4. T3 gyroid printability + rho_actual.
5. T4 gyroid epsilon_eff(rho,f) + repeatability/anisotropy.

## Phase B — numerical ladder

1. M0 background.
2. M1 numerical reference.
3. M2 homogeneous sphere control.
4. M3 ideal continuous Luneburg.
5. M4 loss sensitivity.
6. M5 zoned benchmark.
7. M6 manufacturable homogenized GRIN.
8. M7 explicit unit-cell/coupon gyroid.
9. M8 reduced explicit validation.

## Phase C — diameter gate

Current physical candidate:

- `D=120 mm`;
- `R=60 mm`;
- `f=5 GHz`.

Before full print compare:

`D=120 / 150 / 180 / 240 mm`.

Select smallest passing diameter based on K_sigma/focus/angular response/material mass.

## Phase D — final 5-GHz physical design

For selected passing diameter:

1. M9 reflector optimization.
2. Recompute material mass from T2/T3/T4.
3. Print technological segment.
4. Validate wash/cure/shrinkage/min-wall.
5. Print full physical lens.
6. Add selected reflector.

## Phase E — physical RF experiment

Current Ø120 case:

- far-field estimate `R_ff≈0.48 m`;
- start distance `1.0–1.5 m`.

Measure BACKGROUND/HOLDER/REFERENCE/BASELINE/LENS_NO_REFLECTOR/LENS+REFLECTOR with complex `.s2p`, repeatability and angular sweep.

## Phase F — model validation

Compare experiment vs Meep:

- frequency trend;
- angular trend;
- K_sigma;
- reflector effect;
- repeatability vs numerical uncertainty.

## Phase G — 24-GHz defense calculation

Strict scale factor:

`5/24`.

If Ø120 remains physical V1:

- `D_24=25 mm`;
- `R_24=12.5 mm`;
- `a_24=1.5625 mm`.

Run M10 with material-dispersion/loss/min-feature/seam sensitivity.

## Phase H — defense package

Separate explicitly:

- what was physically measured @5 GHz;
- what was validated numerically;
- what is predicted @24 GHz;
- what remains uncertain because of dispersion/manufacturing resolution.
