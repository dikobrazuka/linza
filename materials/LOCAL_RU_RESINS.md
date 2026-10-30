# Russia / Kazan photopolymer shortlist for RF MVP

Updated: 2026-10-30

Goal: materials obtainable in Russia/Kazan with low RF loss and `epsilon_solid>2` for a single-material classic Luneburg profile.

## 1. HARZ Labs DE-10 / dedicated dielectric material — current local #1

Status: **primary local MVP material; 1 kg planned from current stock; own 5-GHz validation pending**.

Manufacturer supplied direct measurements of 11 samples at **10 GHz**:

- `epsilon_r`: 2.367, 2.187, 2.252, 2.345, 2.266, 2.358, 2.308, 2.346, 2.275, 2.384, 2.247;
- mean `epsilon_r = 2.30318`;
- sample SD `≈0.06218`;
- range `2.187...2.384`;
- `tan(delta)`: 0.00226, 0.00253, 0.00253, 0.00218, 0.00258, 0.00254, 0.00215, 0.00184, 0.00275, 0.00219, 0.00310;
- mean `tan(delta)=0.0024227`;
- sample SD `≈0.0003436`;
- range `0.00184...0.00310`.

Manufacturer confirmed 405-nm compatibility.

Current procurement information:

- current stock up to `1.5 kg`;
- packing `0.5 kg`;
- `7000 RUB / 0.5 kg`;
- expiry `12.01.2027`;
- project plan: buy `1.0 kg = 14 000 RUB`.

Why this is the best local route:

- `epsilon_solid>2`, so resin + air can cover classic Luneburg center-to-edge range in principle;
- mean loss @10 GHz is low;
- local procurement removes import risk;
- preliminary Bruggeman center estimate with `epsilon_solid=2.30318`: `rho_center≈0.806`.

Critical limitation:

- supplied dielectric data are at 10 GHz;
- physical demonstrator is validated around 5 GHz;
- own T1/T4 are mandatory;
- 24-GHz final design remains a calculation with material-dispersion sensitivity unless 24-GHz DE-10 data are obtained.

## 2. HARZ Labs Dielectric, epsilon≈1.628

Status: **secondary low-epsilon R&D material**.

Published/test-program values:

- `epsilon_r=1.628`;
- `tan(delta)=5.39e-3`.

Cannot alone realize classic Luneburg center `epsilon=2`.

Keep only for:

- multi-material research;
- outer-zone studies;
- filler-composite experiments.

## 3. Anycubic DLP Craftsman

Status: geometry/process fallback.

Published microwave data suggest roughly:

- `epsilon_r≈2.66`;
- `tan(delta)≈0.03`.

Easy to obtain, but much lossier than DE-10.

## 4. HARZ Industrial ABS

Published around 10 GHz:

- `epsilon_r≈2.20`;
- `tan(delta)≈0.0218`.

Can realize the center but is much lossier than DE-10.

## 5. Imported references

### Arkema N3D-DIELEC731

Reference/backup:

- official `epsilon_r≈2.59 @10 GHz`;
- official `tan(delta)≈0.0030 @10 GHz`;
- printed-process literature reported `epsilon_r≈2.19`, `tan(delta)≈0.0028 @11 GHz`.

### Rogers Radix 2.8Dk

Backup:

- `epsilon_r≈2.8`;
- `tan(delta)≈0.0043 @10 GHz`.

## 6. Current ranking

1. **HARZ DE-10** — primary MVP.
2. Arkema N3D-DIELEC731 — imported reference/backup.
3. Rogers Radix 2.8Dk — imported backup.
4. Anycubic Craftsman — geometry/process fallback.
5. HARZ Industrial ABS — local lossy fallback.

## 7. Current action

`DE-10 -> T1 solid 5-GHz characterization -> T2 density/shrinkage -> T3 gyroid printability -> T4 measured epsilon_eff(rho) -> generator -> TEST_LENS_5G_V1 -> validated Meep -> Ø50 @24 GHz calculation`.
