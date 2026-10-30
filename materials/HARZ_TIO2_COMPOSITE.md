# HARZ Dielectric + TiO2 composite branch

Date: 2026-10-30

Status: **R&D / backup material branch. NOT on the critical path of the first MVP.**

## Current project decision

Primary MVP resin is **HARZ Labs DE-10**, not a custom TiO2-filled formulation.

Manufacturer DE-10 data @10 GHz:

- mean `epsilon_r = 2.30318`;
- mean `tan(delta) = 0.0024227`;
- 405 nm compatible.

Because neat DE-10 already has `epsilon_solid > 2` and low measured loss, the project should first complete T1-T4 and the 5-GHz demonstrator with neat DE-10.

Return to TiO2/SrTiO3 filling only if at least one concrete trigger appears:

1. DE-10 measured `epsilon_solid` near 5 GHz is insufficient;
2. DE-10 loss is unacceptable after M4/M9;
3. DE-10 cannot print/wash the required gyroid density range;
4. DE-10 supply becomes unavailable;
5. a higher-Dk custom formulation is explicitly required for a later design.

Do **not** add filler to the 1-kg DE-10 MVP batch by default.

## Idea preserved for R&D

Use a low-loss photopolymer matrix and add TiO2 ceramic filler to raise the solid-material permittivity while controlling RF loss and printability.

This is a **ceramic-filled photopolymer composite**, not chemical doping in the semiconductor sense.

A historical candidate matrix was HARZ Labs `Dielectric` with published/test-program values around:

- `epsilon_r = 1.628`;
- `tan(delta) = 5.39e-3`.

That neat material cannot alone realize the classic Luneburg center `epsilon=2` through resin+air geometry.

## Literature precedent

Malas et al. (Materials, 2019, DOI `10.3390/ma12233818`) demonstrated TiO2-filled vat-photopolymer feedstock and measured dielectric properties at 2.5 GHz, 5 GHz and 12–18 GHz.

At nominal 5 GHz in that specific formulation:

- neat resin: `epsilon* = 2.89 - j0.0197`;
- 20% w/v TiO2 composite: `epsilon* = 3.85 - j0.0321`.

Approximate loss tangents:

- neat `tan(delta) ~0.0068`;
- 20% w/v TiO2 `tan(delta) ~0.0083`.

Reference:
https://pmc.ncbi.nlm.nih.gov/articles/PMC6926829/

These values are literature precedent only and are not transferable to HARZ DE-10 without measurement.

## Why the branch remains interesting

Classic Luneburg requires:

`epsilon_target(r)=2-(r/R)^2`.

For continuous sheet-gyroid it is useful for `epsilon_solid` to be somewhat above 2 so the center remains porous/open.

Approximate Bruggeman examples:

- `epsilon_solid=2.2` -> center `rho~0.86`;
- `2.3` -> `rho~0.81`;
- `2.4` -> `rho~0.76`;
- `2.5` -> `rho~0.72`.

This is why a future custom material around `epsilon_solid~2.3...2.5` can be attractive.

## Main risks

1. TiO2 absorbs/scatters 405-nm curing light.
2. Exposure must be recalibrated for each filler loading.
3. Agglomeration.
4. Sedimentation during long prints.
5. Viscosity increase.
6. Additional dielectric loss from poor dispersion/interfaces.
7. TiO2 phase/purity/coatings materially affect behavior.
8. Filled resin can clog/close small TPMS channels through cure blur and sedimentation.

## If the branch is reactivated

Do not jump directly to a lens.

Suggested research sweep for a selected matrix:

- 0% filler;
- 5% w/v TiO2;
- 10% w/v;
- 15% w/v;
- 20% w/v.

For each formulation:

1. dispersion/sedimentation check;
2. viscosity;
3. 405-nm working curve;
4. solid RF coupons;
5. identical wash/post-cure;
6. `epsilon_r/tan(delta)` near the target frequency;
7. select minimum loading meeting the dielectric target;
8. only then gyroid coupons.

## Relation to current project

Current MVP path:

`neat DE-10 -> T1 -> T2/T3 -> T4 -> measured gyroid law -> TEST_LENS_5G_V1 -> validated Meep -> Ø50 @24 GHz calculation`.

TiO2/SrTiO3 is not allowed to delay this path.
