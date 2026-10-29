# Initial gyroid cell-size sweep — TEST_LENS_5G

Date: 2026-10-29

Purpose: compare candidate sheet-gyroid periods `a = 5 / 7.5 / 10 mm` before spending time on full explicit Meep models.

Assumptions for this preliminary sweep:

- `f = 5 GHz`, so `lambda0 ~= 60 mm`;
- ideal Luneburg target `epsilon(r)=2-(r/R)^2`;
- preliminary printed-resin value `epsilon_solid=2.19`;
- temporary Bruggeman mixing law;
- current manufacturability clamp `rho_min=0.12`, `rho_max=0.90`;
- sheet gyroid `|G| <= h(r)`;
- feature-thickness values below are first-order local estimates near the gyroid midsurface, useful for comparing cell sizes, not final dimensional guarantees.

## Common dielectric result

Cell size does not change the required `rho(r)` in the homogenized model.

For `epsilon_solid=2.19`:

- center target `epsilon=2.0` requires `rho ~= 0.867`;
- `rho=0.12` corresponds to `epsilon_eff ~= 1.108`;
- with `rho_min=0.12`, the outermost approximately `5.5%` of radius is clamped away from the ideal `epsilon -> 1` law.

This clamp is a manufacturing limitation, not a property of Luneburg physics.

## Cell-size comparison

| cell a | a/lambda at eps=2 | a/lambda at edge | estimated wall at rho=0.12 | estimated wall at rho=0.20 | preliminary assessment |
|---:|---:|---:|---:|---:|---|
| 5.0 mm | 0.118 | 0.083 | ~0.20 mm | ~0.33 mm | strongest homogenization, hardest low-density printing/washing |
| 7.5 mm | 0.177 | 0.125 | ~0.29 mm | ~0.49 mm | current best compromise |
| 10.0 mm | 0.236 | 0.167 | ~0.39 mm | ~0.65 mm | easiest low-density geometry, but near lambda/4 at high-epsilon center |

Here `lambda` at the Luneburg center is approximated as `lambda0/sqrt(2) ~= 42.4 mm`.

## Interpretation

### 5 mm

Advantages:

- best subwavelength separation;
- most likely to behave as a smooth effective medium;
- closest to published GRIN gyroid work using 5-mm cells.

Problem:

- at very low volume fraction the sheet becomes extremely thin;
- the current `rho=0.12` outer region implies a characteristic wall around 0.2 mm by the local estimate;
- process blur, overcure, washing and mechanical damage become dominant.

Status: **EM reference / printability-risk candidate**.

### 7.5 mm

Advantages:

- still comfortably subwavelength at 5 GHz;
- low-density sheet thickness increases by 50% versus the 5-mm cell;
- should be easier to wash and post-cure while maintaining a useful effective-medium scale separation.

Status: **current first prototype candidate**.

### 10 mm

Advantages:

- much better minimum feature size;
- easier to reach low resin fraction without making walls ultrathin.

Risk:

- at the center `a/lambda ~=0.236`, already close to the commonly used `lambda/4` caution region;
- explicit-lattice scattering / spatial dispersion may become visible;
- must be checked directly in Meep rather than trusted as a homogenized material.

Status: **manufacturing-friendly comparison candidate**, not preferred until explicit EM simulation.

## Recommended next simulation matrix

Run for each `a = 5 / 7.5 / 10 mm`:

1. homogenized continuous Luneburg;
2. explicit continuous sheet-gyroid;
3. same reflector geometry;
4. `tan(delta)=0`, then realistic resin loss;
5. compare focus, backscatter/RCS gain, angular response and parasitic scattering.

Primary question:

> Does 7.5 mm preserve the RF behavior of the 5-mm structure while materially improving printable minimum features?

Secondary question:

> Does 10 mm produce measurable lattice scattering / anisotropy relative to the homogenized model?

## Manufacturing tests before full lens

Print small gyroid coupons at each cell size with at least:

- `rho=0.12`;
- `rho=0.20`;
- `rho=0.50`;
- `rho~=0.87`.

Check:

- survival after washing;
- actual wall thickness after cure;
- trapped resin / channel closure;
- mass-based actual volume fraction;
- dimensional error versus implicit model.

Then use the measured geometry, not nominal CAD values, for final `epsilon_eff(rho)` calibration.

## Current provisional selection

**Start with `a=7.5 mm` for the first continuous-gyroid photopolymer prototype.**

Keep 5 mm as EM-quality baseline and 10 mm as manufacturing-friendly upper comparison.
