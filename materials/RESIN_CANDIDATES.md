# Low-loss photopolymer resins for GRIN/Luneburg lens

Updated: 2026-10-30

## Current MVP first choice — HARZ Labs DE-10 / dedicated dielectric material

Status: **primary MVP resin; 1 kg planned from current stock; own 5-GHz validation pending**.

Direct manufacturer measurements on 11 samples at **10 GHz**:

- mean `epsilon_r = 2.30318`;
- sample SD `≈0.06218`;
- range `2.187...2.384`;
- mean `tan(delta)=0.0024227`;
- sample SD `≈0.0003436`;
- range `0.00184...0.00310`.

Manufacturer confirmed 405-nm compatibility.

Current stock/procurement:

- up to `1.5 kg` available;
- packing `0.5 kg`;
- `7000 RUB / 0.5 kg`;
- expiry `12.01.2027`;
- project plan: `1.0 kg = 14 000 RUB`.

### Why this is #1

- local procurement;
- `epsilon_solid>2`;
- very low measured loss @10 GHz;
- preliminary Bruggeman center estimate `rho_center≈0.806`.

### Critical limitation

The supplied measurements are at `10 GHz`, while the physical demonstrator is tested around `5 GHz`.

Required current path:

1. T1: solid DE-10 `epsilon_r/tan(delta)` around 5 GHz;
2. T2: cured density/shrinkage;
3. T3: gyroid printability + actual volume fraction;
4. T4: measured `epsilon_eff(rho,f)` around 5 GHz;
5. replace provisional Bruggeman with measured interpolation;
6. validate `TEST_LENS_5G_V1`;
7. scale validated geometry `×5/24` and calculate Ø50-mm @24-GHz final design.

24-GHz material behavior must be treated with dispersion/loss sensitivity unless direct DE-10 data at 24 GHz are obtained.

## Reference / backup #1 — Arkema N3D-DIELEC731

Status: **strong imported reference and backup**.

Official data:

- `epsilon_r≈2.59 @10 GHz`;
- `tan(delta)≈0.0030 @10 GHz`;
- SLA/DLP/LCD compatible.

Published printed-process literature reported values around:

- `epsilon_r≈2.19`;
- `tan(delta)≈0.0028 @11 GHz`.

Datasheet and printed-process differences reinforce the need for own coupon measurements.

## Reference / backup #2 — Rogers Radix 2.8Dk

Official values:

- `epsilon_r≈2.8 @10 GHz`;
- `epsilon_r≈2.8 @24 GHz`;
- `tan(delta)≈0.0043 @10 GHz`;
- `tan(delta)≈0.0046 @24 GHz`.

Useful high-Dk backup, but filler rheology/sedimentation and higher loss make it less attractive for the first open-TPMS MVP.

## Other candidates

### EATA FSS Selective Resin / ELFM-0085

Vendor claim:

- `epsilon_r≈2.4 @20 GHz`;
- `tan(delta)≈0.0008`;
- 385–405 nm.

Status: interesting, insufficient independent validation.

### HARZ low-epsilon Dielectric

Reported:

- `epsilon_r≈1.628`;
- `tan(delta)≈0.00539`.

Useful only for research/outer-zone/multi-material/filler work because `epsilon_solid<2`.

### Anycubic Craftsman

Published microwave data suggest roughly:

- `epsilon_r≈2.66`;
- `tan(delta)≈0.03`.

Geometry/process fallback, too lossy for first RF choice.

## Filler R&D branch

TiO2 / SrTiO3 filling remains **R&D/backup**, not the current MVP route.

Do not complicate neat DE-10 unless a concrete trigger appears:

- insufficient `epsilon_solid`;
- unacceptable loss;
- unacceptable printability;
- supply problem;
- later need for custom higher-Dk formulation.

See `HARZ_TIO2_COMPOSITE.md`.

## Current decision

1. **HARZ DE-10** — primary.
2. **Arkema N3D-DIELEC731** — reference/backup.
3. **Rogers Radix 2.8Dk** — backup.
