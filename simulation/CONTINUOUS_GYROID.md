# Continuous Luneburg sheet-gyroid

Current physical V1:

- `f=5 GHz`;
- `D=120 mm`;
- `R=60 mm`;
- nominal `a=7.5 mm`.

Strict-scaled 24-GHz reference:

- `D=25 mm`;
- `R=12.5 mm`;
- `a=1.5625 mm`.

## Target law

`epsilon_target(r)=2-(r/R)^2`.

## Sheet gyroid

`G=sin(kx)cos(ky)+sin(ky)cos(kz)+sin(kz)cos(kx)`

`k=2*pi/a`.

Material exists where:

`|G|<=h(r)`.

Pipeline:

`r -> epsilon_target -> rho_required -> h(r) -> implicit geometry`.

## Dielectric mapping

Before T4:

- symmetric Bruggeman only as provisional law;
- provisional DE-10 `epsilon_solid=2.30318` @10 GHz;
- center `rho≈0.806`.

After T4:

- primary law = measured/interpolated `epsilon_eff(rho,f)`;
- measured interior points are used with physical endpoints:
  - `rho=0 -> epsilon=1`;
  - `rho=1 -> epsilon=epsilon_solid(T1)`;
- technological clamp comes from T3 `rho_min_print/rho_max_print`.

## Current generator

`tools/continuous_luneburg_gyroid.py`.

Current defaults:

- radius `60 mm`;
- cell `7.5 mm`;
- provisional epsilon solid `2.30318`;
- rho clamp defaults `0..1` until T3 values are provided explicitly.

The generator also reports estimated full-sphere polymer volume and optional cured mass.

## Material feasibility @Ø120

Preliminary Bruggeman integration:

- sphere envelope `904.78 cm3`;
- average rho `≈0.358`;
- cured resin ~`356 g` unclamped at `1.1 g/cm3`;
- ~`366 g` with provisional `rho_min=0.12`.

Exact values after T2/T3/T4.

## Diameter caveat

Ø120 is only about `2 lambda0` across at 5 GHz. It must pass a diameter comparison against 150/180/240 mm before full manufacture.

## Meep comparison

Compare:

1. ideal continuous material;
2. homogenized measured-law GRIN;
3. explicit unit-cell/coupon gyroid;
4. reduced finite explicit gyroid;
5. diameter sensitivity;
6. reflector variants;
7. material-loss/seam sensitivity.
