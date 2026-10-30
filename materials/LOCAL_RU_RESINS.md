# Russia / Kazan photopolymer shortlist for RF MVP

Updated: 2026-10-30

Goal: find materials that can be obtained quickly in Russia/Kazan while keeping RF loss low and `epsilon_solid>2` for a single-material classic Luneburg profile.

## 1. HARZ Labs DE-10 / dedicated dielectric material — current local #1

Status: **primary local MVP candidate**.

Manufacturer supplied direct measurements of 11 samples at **10 GHz**:

- `epsilon_r`: 2.367, 2.187, 2.252, 2.345, 2.266, 2.358, 2.308, 2.346, 2.275, 2.384, 2.247;
- mean `epsilon_r = 2.30318`;
- sample SD `≈0.06218`;
- range `2.187...2.384`;
- `tan(delta)`: 0.00226, 0.00253, 0.00253, 0.00218, 0.00258, 0.00254, 0.00215, 0.00184, 0.00275, 0.00219, 0.00310;
- mean `tan(delta)=0.0024227`;
- sample SD `≈0.0003436`;
- range `0.00184...0.00310`.

Manufacturer also confirmed 405-nm printability. Availability/production timing is being checked.

Why this is now the best local route:

- `epsilon_solid>2`, so a single resin + air structure can realize the entire classic Luneburg range `2 -> 1`;
- mean `tan(delta)` @10 GHz is lower than the nominal values of many imported RF resins;
- local procurement may remove the main MVP schedule risk.

Important limitation:

- final prototype is tested around 5 GHz, while supplied data are at 10 GHz;
- own solid-coupon characterization around 5 GHz remains mandatory.

Preliminary Bruggeman estimate for center `epsilon_eff=2` with `epsilon_solid=2.30318`:

`rho_center≈0.806`.

So the center can remain open-cell rather than fully solid.

## 2. HARZ Labs Dielectric, epsilon≈1.628

Status: **secondary low-epsilon research material**.

Published/test-program values:

- `epsilon_r=1.628`;
- `tan(delta)=5.39e-3`.

This material is low-loss but cannot alone realize the classic Luneburg center `epsilon=2` because its solid permittivity is below 2.

Keep only for:

- multi-material research;
- outer-zone studies;
- filler-composite experiments.

It is no longer the primary local candidate.

## 3. Anycubic DLP Craftsman

Status: geometry/process fallback.

Published microwave data suggest roughly:

- `epsilon_r≈2.66`;
- `tan(delta)≈0.03`.

Easy to obtain and sufficient for geometry tests, but much lossier than HARZ DE-10.

## 4. HARZ Industrial ABS

Published around 10 GHz:

- `epsilon_r≈2.20`;
- `tan(delta)≈0.0218`.

Can realize the center but is much lossier than DE-10.

## 5. Imported references

### Arkema N3D-DIELEC731

Still an excellent RF reference/backup.

Typical values:

- official `epsilon_r≈2.59 @10 GHz`;
- official `tan(delta)≈0.0030 @10 GHz`;
- printed-process literature reported lower `epsilon_r` near 2.19 and `tan(delta)≈0.0028 @11 GHz`.

### Rogers Radix 2.8Dk

Backup:

- `epsilon_r≈2.8`;
- `tan(delta)≈0.0043 @10 GHz`.

## 6. Current local ranking

For a single-material classic Luneburg MVP:

1. **HARZ DE-10 / dedicated dielectric material** — current #1.
2. Arkema N3D-DIELEC731 — imported reference/backup.
3. Rogers Radix 2.8Dk — imported backup.
4. Anycubic Craftsman — fast geometry/process fallback.
5. HARZ Industrial ABS — local but lossy fallback.

## 7. Current action

- obtain DE-10;
- lock printer + wash + post-cure process;
- print solid coupons;
- measure `epsilon_r/tan(delta)` around 5 GHz;
- print gyroid coupons at multiple `rho`;
- measure `epsilon_eff(rho)`;
- feed measured interpolation into `tools/continuous_luneburg_gyroid.py`.
