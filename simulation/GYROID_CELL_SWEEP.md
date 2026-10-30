# Gyroid cell-size sensitivity — TEST_LENS_5G_V1

Date: 2026-10-30

Purpose: compare sheet-gyroid periods `a = 5 / 7.5 / 10 mm` around the current nominal `a=7.5 mm`.

This is a sensitivity study, not three equal manufacturing routes.

## Current assumptions before T4

- `f=5.0 GHz`;
- `lambda0≈59.96 mm`;
- ideal Luneburg `epsilon(r)=2-(r/R)^2`;
- provisional HARZ DE-10 manufacturer mean `epsilon_solid=2.30318 @10 GHz`;
- temporary Bruggeman only until measured T4;
- actual `rho_min_print/rho_max_print` must come from T3;
- sheet gyroid `|G|<=h(r)`.

For provisional `epsilon_solid=2.30318`:

- center target `epsilon=2` requires `rho_center≈0.806`.

Do not use old `rho_center≈0.867` from Arkema `epsilon_solid=2.19` as the current DE-10 estimate.

## RF scale

At center:

`lambda_center≈59.96/sqrt(2)=42.40 mm`.

| a | a/lambda0 | a/lambda_center | status |
|---:|---:|---:|---|
| 5.0 mm | 0.0834 | 0.1179 | strongest homogenization; smallest features |
| 7.5 mm | 0.1251 | 0.1769 | **current nominal** |
| 10.0 mm | 0.1668 | 0.2358 | easiest features; greatest lattice-scattering risk |

Feature-thickness estimates must be recomputed from actual `h/rho` and printer process; old wall estimates tied to provisional `rho_min=0.12` are not acceptance criteria.

## T3 manufacturing series

Before spending DE-10 on three cell periods, characterize nominal `a=7.5 mm` using the fixed T3 series:

`rho = 0.10 / 0.15 / 0.20 / 0.30 / 0.40 / 0.50 / 0.65 / 0.81 / 0.90`.

Coupon:

`30×30×15 mm = 4×4×2 periods` for `a=7.5 mm`.

T3 determines:

- `rho_min_print`;
- `rho_max_print`;
- washability;
- sheet fusion;
- actual volume fraction;
- shrinkage/geometry survival.

Do not automatically print the full 9-point series for `a=5` and `a=10` unless M7/T4 show that cell-size comparison is necessary.

## M7 sensitivity matrix

For selected representative densities after T3/T4, compare:

- low usable density;
- mid density around `rho≈0.4–0.5`;
- high/center density around `rho≈0.81`.

For each `a=5/7.5/10 mm` evaluate:

1. explicit unit-cell/coupon response;
2. retrieved/effective `epsilon_eff`;
3. anisotropy;
4. lattice scattering;
5. comparison with homogenized measured law;
6. loss sensitivity.

## Decision logic

### 5 mm

Use as EM-quality reference if 7.5-mm structure shows noticeable lattice effects.

Risk: lower absolute wall/feature size and harder photopolymer washing.

### 7.5 mm

**Nominal candidate for TEST_LENS_5G_V1.**

Chosen as current compromise between RF homogenization and manufacturability. It remains provisional until T3/T4/M7.

### 10 mm

Use as manufacturing-friendly comparison if T3 shows low-density walls are too fragile at 7.5 mm.

Risk: `a/lambda_center≈0.236`, so explicit effects may be stronger.

## 24-GHz scaling

If final 5-GHz geometry uses nominal `a=7.5 mm`, strict geometric scaling gives:

`a_24 = 7.5*(5/24) = 1.5625 mm`.

Other candidates scale to:

- `5.0 -> 1.04167 mm`;
- `10.0 -> 2.08333 mm`.

This preserves normalized RF scale but does **not** prove printability. Minimum wall/cure blur must be checked separately for FINAL_LENS_24G.

## Current selection

`a=7.5 mm` stays nominal until data demonstrate a reason to change it.
