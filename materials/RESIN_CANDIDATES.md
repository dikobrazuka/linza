# Low-loss photopolymer resins for GRIN/Luneburg lens

Updated: 2026-10-29

## Current first choice — Arkema N3D-DIELEC731

Status: **primary resin candidate for photopolymer branch**.

Why it fits:

- explicitly intended for RF devices and Luneburg lenses;
- SLA / DLP / LCD compatible;
- unfilled resin: preferable for fine open-cell / TPMS geometry and avoids sedimentation of ceramic filler;
- official RF data: `epsilon_r = 2.59 @ 10 GHz`, `tan(delta) = 0.0030 @ 10 GHz`;
- viscosity: `1960 cP @25 C`;
- liquid density: `1.086 g/cm3`;
- Arkema gives starting print conditions for bottom-up DLP/LCD;
- independent literature has already used this resin for RF/GRIN structures.

Official Arkema TDS:
https://www.arkema.com/files/live/sites/shared_arkema/files/downloads/sartomer/N3XTDIMENSION%20TECH%20DATA%20SHEETS/TDS_N3D-DIELEC731.pdf

Arkema product family:
https://www.arkema.com/global/en/products/product-finder/product-range/sartomer/n3xt-dimension-3d-printing/

### Printing data from Arkema

TDS starting point:

- process: bottom-up DLP/LCD;
- wavelength tested: `385 nm`;
- layer: `50 um`;
- critical exposure `Ec = 3.4 mJ/cm2`;
- penetration depth `Dp = 3.5 mil`;
- example at 5 mW/cm2: ~4 s standard exposure;
- example at 12 mW/cm2: ~2 s standard exposure;
- cleaning: ethyl lactate, preferably two-stage bath, agitation/sonication;
- post-cure required.

These are starting parameters, not a guaranteed profile for every printer.

## Strongest direct evidence for our architecture

2026 Advanced Functional Materials paper:

**Romangsuriat et al., “Low-Profile, High-Gain GRIN RF Lenses via Multi-Material Vat Photopolymerization.”**
DOI: `10.1002/adfm.76457`

Why this paper matters:

- they used **Arkema N3D-DIELEC731**;
- they printed GRIN lenses with a **gyroid lattice**;
- printer for single-material lens: **Elegoo Mars 4 DLP**;
- operating/measurement band: `10–18 GHz`;
- measured neat-resin value in their process: approximately `epsilon_r = 2.19`, `tan(delta)=0.0028 @11 GHz`;
- gyroid chosen because its triply-periodic geometry gives near-isotropic homogenized behavior;
- unit cell `5 mm` was used;
- their study found a useful homogenization threshold around `lambda/4`;
- demonstrated smooth effective-permittivity tuning by changing lattice solidity;
- reported a practical single-material smooth lattice range roughly `epsilon_eff ~1.18...1.90` for their 5-mm geometry, with lower density limited by fragility and higher density by unresolved pores/capillary effects.

Paper:
https://advanced.onlinelibrary.wiley.com/doi/10.1002/adfm.76457

### Important discrepancy

Arkema datasheet gives `epsilon_r = 2.59 @10 GHz`, while the 2026 GRIN-lens paper reports about `2.19 @11 GHz` for neat N3D-DIELEC731 after their print/post-cure process.

Therefore **do not hard-code epsilon_solid from the datasheet**. Our own printed/post-cured material coupon must be characterized near the actual experiment frequency (~5 GHz).

This discrepancy materially changes the density needed at the Luneburg center:

- if `epsilon_solid ~2.59`, reaching `epsilon_eff=2.0` is relatively easy with a porous lattice;
- if `epsilon_solid ~2.19`, the central region must be close to solid.

## Independent validation of the older Arkema RF formulation

Older Arkema/Sartomer formulations PRO14729 / PRO14730 / PRO14731 have official values near:

- PRO14729: `epsilon_r=2.61`, `Df=0.0028 @10 GHz`;
- PRO14730: `epsilon_r=2.60`, `Df=0.0029 @10 GHz`;
- PRO14731: `epsilon_r=2.59`, `Df=0.0030 @10 GHz`.

A TNO / TU Eindhoven study independently characterized PRO14731 and measured about:

- `epsilon_r = 2.59`;
- `tan(delta) = 0.0031`;
- at `71.8 GHz`.

This supports that the material family remains genuinely low-loss at high RF/mmWave frequencies.

Reference:
P. Escobari Vargas et al., 2022 European Microwave Conference, DOI `10.23919/EuMC54642.2022.9924501`.

## Procurement status — 2026-10-29

### Route 1 — Carl ROTH / Europe

In March 2026 Carl ROTH announced that Arkema selected it as the **first European distribution partner for N3xtDimension 3D-printing resins**.

This is currently the most promising procurement route for a European purchase.

Public material:
https://www.pressebox.de/inaktiv/carl-roth-gmbh-co/3D-Printing-in-N3xtDimension/boxid/1288395

Carl ROTH:
https://www.carlroth.com

Current limitation: an indexed public product page / public price specifically for `N3D-DIELEC731` was not found. Treat this as a quote / availability inquiry rather than a confirmed stock item.

Ask specifically for:

- `N3xtDimension N3D-DIELEC731`;
- smallest available pack / sample size;
- 1 kg price if available;
- stock and lead time;
- shipping restrictions for liquid photopolymer;
- whether they can provide the latest TDS/SDS and recommended exposure parameters.

### Route 2 — Arkema direct / Sartomer EMEA

Arkema lists N3D-DIELEC731 as currently available in its N3xtDimension family and provides direct expert-contact / product-finder routes for Europe.

Product family:
https://www.arkema.com/global/en/products/product-finder/product-range/sartomer/n3xt-dimension-3d-printing/

EMEA product finder / samples:
https://emea.sartomer.arkema.com/cms/render/live/en/sites/sartomer_emea_arkema/home/product-finders.html

Use this route in parallel with Carl ROTH and ask for a **development/sample quantity**, because the project only needs enough resin for coupons and a first lens prototype.

### Route 3 — Arkema Boulder / US

Arkema's former Colorado Photopolymer Solutions site still lists N3D-DIELEC731 in the N3xtDimension catalog and states that the site supports online ordering, small-scale manufacture and packaging.

https://cpspolymers.com/

Use only if European supply fails because international shipping of photopolymer can complicate logistics.

## Second choice — Rogers Radix 2.8Dk Printable Dielectric

Status: **backup / comparison material**.

Official values:

- ceramic-filled UV-curable resin;
- SLA/DLP;
- `epsilon_r = 2.8 @10 GHz`;
- `epsilon_r = 2.8 @24 GHz`;
- `tan(delta) = 0.0043 @10 GHz`;
- `tan(delta) = 0.0046 @24 GHz`;
- advertised feature capability down to ~225 um;
- explicitly marketed for complex RF and GRIN dielectric parts.

Official product page:
https://www.rogerscorp.com/advanced-electronics-solutions/radix-printable-dielectric

Procurement advantage:

- Rogers explicitly exposes a **“Need a Sample?”** request path on the product page;
- use this immediately as a parallel backup request while searching for Arkema stock.

Why it is not first choice:

- loss is higher than N3D-DIELEC731;
- ceramic-filled system adds sedimentation / rheology / cleaning concerns for our open-cell lattice;
- our target maximum effective permittivity is only ~2, so we do not need the higher solid Dk badly enough to justify the filler unless manufacturing results prove otherwise.

## Third lead — EATA FSS Selective Resin / ELFM-0085

Vendor claims:

- fluorinated acrylate;
- `epsilon_r = 2.4 @20 GHz`;
- `tan(delta) = 0.0008`;
- 385–405 nm;
- viscosity ~400 cP.

Vendor page:
https://www.eataray.com/3dprint/fss-selective-resin-item-660.html

Status: **interesting but unverified**.

Reason not to use as MVP material yet:

- currently only vendor-page evidence found;
- no independent RF paper / recognized TDS / established distribution channel found in the search;
- the claimed `tan(delta)=0.0008` is excellent enough that it must be independently verified before trusting it.

Only consider after obtaining:

- formal TDS;
- SDS;
- measurement method and frequency details;
- sample;
- independent dielectric measurement.

## Rejected as primary candidate

### Ordinary Formlabs / generic resins

Typical RF loss is much worse. Literature and manufacturer data show common photopolymers often have `tan(delta)` around `0.01...0.06` depending on resin and frequency.

Use only as cheap geometry/process prototypes, not as the reference RF material.

### Promerus PDM-5061

Interesting dielectric data (`Dk ~2.28`, `Df ~0.0004 @50 GHz`) but it is described primarily as a low-viscosity thermally cured dispense/inkjet material, not a validated vat-photopolymer printing resin for our geometry. Keep as a materials-research lead, not current build material.

## Procurement priority

Run in parallel:

1. **Carl ROTH** — quote/stock request for N3D-DIELEC731.
2. **Arkema Sartomer EMEA** — sample/development quantity request for N3D-DIELEC731.
3. **Rogers** — sample request for Radix 2.8Dk as backup.

Do not wait for one route to fail before starting the next.

## Project-specific implication at 5 GHz

`lambda0 ~60 mm` at 5 GHz.

The 2026 GRIN study observed stable homogenized behavior when unit-cell size was below roughly `lambda/4` in its measurement setup. For our 5-GHz model this gives a generous geometric window.

Practical first sweep for photopolymer gyroid/TPMS:

- unit cell candidates: `5 / 7.5 / 10 mm`;
- wall/strut thickness sweep chosen to span approximately `epsilon_eff = 1.05...2.0`;
- explicitly model actual lattice in Meep before committing to effective-medium-only results.

A larger unit cell at 5 GHz may help us reach very low solid fractions without producing unprintably thin walls, while still remaining electrically sub-wavelength.

## Required validation before full lens

1. Obtain N3D-DIELEC731.
2. Print solid coupons with the exact intended post-cure.
3. Measure `epsilon_r` and `tan(delta)` around 5 GHz.
4. Print gyroid/TPMS calibration coupons at several volume fractions.
5. Measure `epsilon_eff(rho)` rather than assuming it.
6. Compare with Bruggeman / Maxwell-Garnett approximations and explicit Meep lattice simulations.
7. Select unit-cell size and printable density range.
8. Only then generate the continuous radial GRIN geometry.

## Current decision

**Photopolymer branch should start with Arkema N3D-DIELEC731.**

Rogers Radix 2.8Dk is the comparison/backup resin.
