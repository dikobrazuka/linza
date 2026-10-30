# HARZ Dielectric + TiO2 composite branch

Date: 2026-10-30

Status: **active material-development candidate for local/Russia MVP**.

## Idea

Use HARZ Labs `Dielectric` as a low-loss photopolymer matrix and add TiO2 ceramic filler to raise the solid-material permittivity above 2 while preserving low RF loss as much as possible.

HARZ Labs reports for the neat Dielectric resin:

- `epsilon_r = 1.628`;
- `tan(delta) = 5.39e-3`;
- compatible with desktop LCD/DLP printers.

Source:
https://harzlabs.ru/support/test-program/about-program/

Important wording: this is a **ceramic-filled photopolymer composite**, not chemical doping in the semiconductor sense.

## Direct precedent

Malas et al. (Materials, 2019, DOI `10.3390/ma12233818`) demonstrated TiO2-filled vat-photopolymer feedstock and measured it at 2.5 GHz, 5 GHz and 12-18 GHz.

At nominal 5 GHz:

- neat resin: `epsilon* = 2.89 - j0.0197`;
- 20% w/v TiO2 composite: `epsilon* = 3.85 - j0.0321`.

Therefore approximately:

- neat `tan(delta) ~0.0068`;
- 20% w/v TiO2 `tan(delta) ~0.0083`.

This is important because TiO2 strongly increased epsilon while the dielectric loss rose only moderately in that formulation.

The same work printed 5/10/20% w/v TiO2/resin mixtures and used ~2% w/w dispersant relative to filler. The TiO2 powder was <100 nm; the 20% w/v feedstock had viscosity around `1.20 Pa*s` at low shear and was printable with sub-100-um feature resolution in their process.

Reference:
https://pmc.ncbi.nlm.nih.gov/articles/PMC6926829/

## Why this is attractive for our lens

Classic Luneburg requires:

`epsilon_target(r)=2-(r/R)^2`.

A neat matrix with `epsilon=1.628` cannot make the center (`epsilon=2`) by geometry alone. TiO2 solves this by lifting `epsilon_solid` above 2.

For a continuous sheet-gyroid it is actually preferable to target `epsilon_solid > 2`, not exactly 2, because the center should retain some open porosity for washing and printability.

Using a simple Bruggeman estimate for resin + air in the gyroid:

- if `epsilon_solid=2.2`, center `epsilon_eff=2` requires `rho_solid ~0.86`;
- `epsilon_solid=2.3` -> `rho_solid ~0.81`;
- `epsilon_solid=2.4` -> `rho_solid ~0.76`;
- `epsilon_solid=2.5` -> `rho_solid ~0.72`.

Therefore a practical composite target is roughly:

`epsilon_solid ~2.3...2.5`.

This leaves a printable/open center rather than requiring a completely solid core.

## First loading estimate

Using the effective-medium form used by Malas et al. with a high-epsilon TiO2 filler (`epsilon_f ~100`) gives only a rough first estimate for HARZ Dielectric:

- target `epsilon_composite ~2.0`: a few vol% TiO2;
- target `~2.3`: roughly 4-5 vol% TiO2;
- target `~2.5`: roughly 6 vol% TiO2.

For TiO2 density around `4.2 g/cm3` and resin density near `1.1 g/cm3`, these are broadly in the range of roughly `10-25 g TiO2 per 100 mL resin`, i.e. very close to the experimentally demonstrated `5/10/20% w/v` sweep.

These are NOT recipe values. Actual epsilon depends on particle phase, purity, agglomeration, interface, dispersion and post-cure.

## Rutile vs anatase and 405-nm problem

Rutile is attractive electromagnetically:

- microwave `epsilon_r` is commonly around 85-160 for single crystal / around 100 for dense ceramic;
- potentially very low intrinsic microwave loss when well processed.

But rutile has an optical absorption edge around `~410-413 nm`, which overlaps a typical `405 nm` MSLA/DLP source. It also has very high refractive index, so it strongly scatters curing light.

Anatase has an absorption edge around `<388-390 nm`, so it is less absorptive at 405 nm, though it still scatters strongly and generally has lower dielectric constant than rutile.

Therefore for a 405-nm desktop printer:

- pure rutile gives strongest RF leverage but may damage cure depth badly;
- anatase or a mixed anatase/rutile powder may be easier to cure;
- the optimum must be selected experimentally from working curves, not only RF permittivity.

## Main risks

1. TiO2 absorbs/scatters near-UV/405-nm light and reduces cure depth.
2. Resin exposure profile must be recalibrated after every filler concentration.
3. Nanoparticles agglomerate unless properly dispersed.
4. Sedimentation can create vertical dielectric gradients during a long print.
5. Viscosity rises with loading.
6. Poor dispersion can increase loss and mechanical defects.
7. TiO2 phase/purity strongly affects microwave loss.
8. Pigment-grade TiO2 with unknown coatings/additives should not be assumed equivalent to dielectric-grade powder.

## Suggested first experiment

Do NOT jump directly to a lens.

Prepare small batches of HARZ Dielectric with:

- 0% filler;
- 5% w/v TiO2;
- 10% w/v;
- 15% w/v;
- 20% w/v.

For each batch:

1. measure viscosity / observe sedimentation;
2. generate a 405-nm working curve (`cure depth vs exposure`);
3. print solid RF coupons;
4. use identical wash and post-cure;
5. measure `epsilon_r` and `tan(delta)` near 5 GHz;
6. choose the minimum TiO2 loading that gives `epsilon_solid >=2.3` with acceptable loss and printability;
7. only then print gyroid calibration coupons.

## Current opinion

This route is potentially very strong because it combines:

- a locally obtainable low-loss matrix;
- tunable solid permittivity;
- a single material formulation for the entire continuous gyroid;
- much faster procurement than Arkema/Rogers.

If `epsilon_solid ~2.3-2.5` and `tan(delta) <=~0.008` can be achieved reproducibly on a 405-nm printer, this composite becomes a serious competitor to imported RF resins for the 5-GHz MVP.
