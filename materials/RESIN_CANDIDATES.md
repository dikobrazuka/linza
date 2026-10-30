# Low-loss photopolymer resins for GRIN/Luneburg lens

Updated: 2026-10-30

## Current MVP first choice — HARZ Labs DE-10 / dedicated dielectric material

Status: **primary MVP resin candidate, pending availability and own 5-GHz validation**.

Direct manufacturer measurements on 11 samples at **10 GHz**:

- mean `epsilon_r = 2.30318`;
- sample SD `≈0.06218`;
- range `2.187...2.384`;
- mean `tan(delta)=0.0024227`;
- sample SD `≈0.0003436`;
- range `0.00184...0.00310`.

Manufacturer confirmed 405-nm printability. Print/post-cure parameters depend on the specific equipment. Availability/production timing is being checked.

### Why this is currently #1 for the MVP

- local/Russian procurement is potentially much faster than Arkema/Rogers import;
- `epsilon_solid>2`, so a classic single-material Luneburg profile is possible through resin/air geometry;
- losses @10 GHz are excellent;
- preliminary Bruggeman estimate for center `epsilon_eff=2` gives `rho_center≈0.806`, leaving an open-cell center rather than requiring a solid core.

### Critical limitation

The supplied measurements are at `10 GHz`, while the physical prototype is tested around `5 GHz`.

Therefore before final full-lens manufacture:

1. print solid coupons with the exact intended process;
2. measure `epsilon_r/tan(delta)` around 5 GHz;
3. print gyroid coupons at several `rho`;
4. measure `epsilon_eff(rho)`;
5. replace all provisional mixing-law values with measured interpolation.

## Reference / backup #1 — Arkema N3D-DIELEC731

Status: **strong imported reference and backup**.

Official data:

- `epsilon_r≈2.59 @10 GHz`;
- `tan(delta)≈0.0030 @10 GHz`;
- SLA/DLP/LCD compatible;
- unfilled RF photopolymer.

Direct 2026 GRIN-lens literature used this resin with gyroid structures and reported printed-process values around:

- `epsilon_r≈2.19`;
- `tan(delta)≈0.0028 @11 GHz`.

This remains the strongest literature precedent for our architecture.

Important: datasheet and printed-process permittivity differ substantially, confirming that our own printed coupon measurements are mandatory for any resin.

## Reference / backup #2 — Rogers Radix 2.8Dk

Official values:

- `epsilon_r≈2.8 @10 GHz`;
- `epsilon_r≈2.8 @24 GHz`;
- `tan(delta)≈0.0043 @10 GHz`;
- `tan(delta)≈0.0046 @24 GHz`;
- ceramic-filled UV-curable SLA/DLP resin.

Useful as high-Dk backup but less attractive for our open TPMS because of filler rheology/sedimentation and somewhat higher loss.

## Other candidates

### EATA FSS Selective Resin / ELFM-0085

Vendor claim:

- `epsilon_r≈2.4 @20 GHz`;
- `tan(delta)≈0.0008`;
- 385–405 nm.

Status: interesting but insufficient independent validation.

### HARZ low-epsilon Dielectric

Reported:

- `epsilon_r≈1.628`;
- `tan(delta)≈0.00539`.

Useful for research, outer-zone or multi-material/filler work, but `epsilon_solid<2` means it cannot alone realize the center of a classic Luneburg lens.

### Anycubic Craftsman

Published microwave data suggest roughly:

- `epsilon_r≈2.66`;
- `tan(delta)≈0.03`.

Good fast geometry/process fallback, too lossy to be first RF choice.

## Filler R&D branch

TiO2 / SrTiO3 filling remains a research branch, not the current MVP route.

Because HARZ DE-10 already appears to provide `epsilon_solid>2` and very low loss, do **not** complicate the first MVP with ceramic filler unless a concrete problem appears:

- insufficient `epsilon_solid`;
- unacceptable printability;
- material unavailable;
- need for custom higher-Dk formulation.

See `HARZ_TIO2_COMPOSITE.md`.

## Current material decision

For fastest MVP:

1. **HARZ DE-10** — primary.
2. **Arkema N3D-DIELEC731** — reference/backup.
3. **Rogers Radix 2.8Dk** — backup.

Required validation is the same regardless of material:

`solid coupon -> 5-GHz epsilon/tanδ -> gyroid coupons -> measured epsilon_eff(rho) -> generator -> whole lens`.
