# Расчётный маршрут — TEST_LENS_5G_V1 -> FINAL_LENS_24G

Дата: 2026-10-31

## 0. Current canonical parameters

Physical candidate:

- `f=5.0 GHz`;
- `D=120 mm`;
- `R=60 mm`;
- `a=7.5 mm`;
- `lambda0≈59.96 mm`;
- `D/lambda0≈2.00`.

Strict-scaled 24-GHz reference:

- `k=5/24`;
- `D=25.0 mm`;
- `R=12.5 mm`;
- `a=1.5625 mm`.

Ideal profile:

`epsilon_target(r)=2-(r/R)^2`.

Project target:

`K_sigma>=10` or `Delta_sigma_dB>=+10 dB`.

## 1. Inputs

Each run must define:

- frequency;
- D/R;
- gyroid a;
- material epsilon/loss;
- rho_min/rho_max;
- seam;
- reflector geometry;
- polarization/angle;
- numerical resolution/PML/padding;
- baseline definition.

Use `simulation/INPUTS_TEMPLATE.yaml`.

## 2. Model ladder

### M0 — background

Validate source/domain/PML/numerical reflections.

### M1 — numerical reference

Known/simple scatterer for normalization and near-to-far validation.

### M2 — homogeneous sphere control

Use same D as active candidate.

### M3 — ideal continuous Luneburg

Current primary run: `D=120 mm`, lossless, no reflector.

Outputs: focus position, -3/-6 dB spot, field maps.

### M4 — loss sensitivity

Before T1: `tan_delta=0 / 0.0025 / 0.005 / 0.01 / 0.02`.

After T1: measured value + uncertainty.

### M5 — zoned benchmark

11 zones primary benchmark; 6/8 one-time comparison.

### M6 — homogenized manufacturable continuous GRIN

`epsilon_target -> rho_required -> clamp -> epsilon_realized`.

Before T4: provisional Bruggeman.
After T4: measured/interpolated law primary.

### M7 — explicit gyroid unit-cell/coupon

Validate epsilon_eff, anisotropy, lattice scattering and a/lambda sensitivity against T4.

### M8 — reduced explicit validation

Representative finite slab/sector for homogenization and edge effects.

### Diameter gate — mandatory before M9/full print

Run the same ideal/measured-law architecture for:

`D=120 / 150 / 180 / 240 mm` at 5 GHz.

For each store:

- `D/lambda0`;
- peak `K_sigma`;
- `Delta_sigma_dB`;
- focus position;
- spot width;
- angular response;
- estimated material mass.

Select the **smallest passing diameter**.

Current preferred candidate is Ø120 due material feasibility, but it is not allowed to bypass this gate.

### M9 — selected physical lens + reflector

Start with current candidate Ø120 only if diameter gate passes.

Reflector sweep:

`15/30/45/60/90 deg` PEC cap; compare hemisphere + ground plane.

Outputs: K_sigma(f,theta), loss/seam/reflector sensitivity.

### M10 — strict-scaled 24-GHz prediction

After experiment-vs-Meep validation:

`L_24=L_5*(5/24)`.

For current Ø120 case:

- `D=25 mm`;
- `R=12.5 mm`;
- `a=1.5625 mm`.

Run dispersion/loss/min-feature/seam sensitivity. M10 is prediction, not measurement.

## 3. Material mapping

Priority:

1. T4 measured `rho -> epsilon_eff`;
2. validated M7 retrieval;
3. Bruggeman provisional only.

Measured-calibration generator rule:

- T4 CSV contains interior measured points `0<rho<1`;
- generator adds physical endpoints automatically:
  - `rho=0 -> epsilon=1`;
  - `rho=1 -> epsilon=epsilon_solid(T1)`;
- manufacturing clamp comes separately from T3.

## 4. Material budget

For current Ø120 preliminary DE-10 model:

- envelope `904.78 cm3`;
- volume-average rho `≈0.358`;
- mass `≈356 g` unclamped at 1.1 g/cm3;
- `≈366 g` with provisional rho_min=0.12.

Before full print, recompute with T2 density + T3 limits + T4 law.

## 5. Physical stand

For D=120 mm @5 GHz:

`R_ff≈0.48 m`.

Start at `1.0–1.5 m`; verify sensitivity at multiple distances.

Measure complex `.s2p` for BACKGROUND/HOLDER/REFERENCE/BASELINE/LENS_NO_REFLECTOR/LENS+REFLECTOR.

## 6. Numerical convergence

Do not close a model without resolution sweep.

Current gate:

- `Delta_sigma_dB` change <0.5 dB;
- focus-position change <1% R.

## 7. Fixed order

1. T1.
2. T2/T3.
3. M0-M5 in parallel.
4. T4.
5. M6/M7.
6. M8.
7. Diameter gate.
8. M9 selected diameter.
9. Material-budget gate.
10. Tech segment.
11. Full physical print.
12. 5-GHz experiment.
13. Validate model vs experiment.
14. M10 24-GHz prediction.
