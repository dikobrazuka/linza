# Расчёты и моделирование — Meep

Основной solver: **Meep**.

## Current physical candidate

`TEST_LENS_5G_V1`:

- `f=5.0 GHz`;
- `D=120 mm`;
- `R=60 mm`;
- `a=7.5 mm`;
- `D/lambda0≈2.0`.

Strict-scaled reference @24 GHz:

- `D=25 mm`;
- `R=12.5 mm`;
- `a=1.5625 mm`.

## Model ladder

`M0 -> M1 -> M2 -> M3 -> M4 -> M5 -> M6 -> M7 -> M8 -> diameter gate -> M9 -> experiment -> M10`.

Diameter gate before full print:

`120 / 150 / 180 / 240 mm` at 5 GHz.

Ø240 is reference only, not current V1.

## Material

HARZ DE-10 provisional manufacturer data @10 GHz:

- epsilon `2.30318` mean;
- tan(delta) `0.0024227` mean.

Own T1/T4 @5 GHz mandatory.

## Gyroid

Sheet geometry:

`|G|<=h(r)`.

Nominal `a=7.5 mm`; sensitivity `5/7.5/10 mm`.

Measured T4 calibration is primary after available; Bruggeman only provisional.

## Material balance

Current Ø120 preliminary:

- envelope `904.78 cm3`;
- mass ~`356 g` unclamped;
- ~`366 g` with provisional rho_min=0.12 at 1.1 g/cm3.

Recompute after T2/T3/T4.

## Key files

- `CALCULATIONS.md`;
- `CONTINUOUS_GYROID.md`;
- `GYROID_CELL_SWEEP.md`;
- `INPUTS_TEMPLATE.yaml`;
- `../docs/07_CALCULATION_WORKFLOW.md`.
