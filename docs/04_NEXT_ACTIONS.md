# Ближайшие действия — TEST_LENS_5G_V1 -> FINAL_LENS_24G

## Каноническая схема

Физическая верификация:

- `f=5.0 GHz`;
- `D=120 mm`;
- `R=60 mm`;
- `lambda0≈59.96 mm`;
- `D/lambda0≈2.00`;
- nominal `a=7.5 mm`;
- measurement setup до ~6 GHz.

Strict-scaled 24-GHz reference:

- scale `5/24=0.2083333`;
- `D=25.0 mm`;
- `R=12.5 mm`;
- `a=1.5625 mm`.

## Приоритет №1 — M0-M6

- [ ] M0 background.
- [ ] M1 numerical reference + near-to-far validation.
- [ ] M2 homogeneous sphere control.
- [ ] M3 ideal continuous Luneburg **Ø120 @5 GHz**, lossless.
- [ ] M4 loss sensitivity.
- [ ] M5 11-zone benchmark + one-time 6/8-zone comparison.
- [ ] M6 homogenized manufacturable continuous GRIN.
- [ ] Resolution convergence.

### Mandatory diameter gate

До full print сравнить минимум:

- `D=120 mm` current V1;
- `D=150 mm` comparison;
- `D=180 mm` comparison;
- `D=240 mm` historical/reference.

Смотреть:

- peak `K_sigma`;
- `Delta_sigma_dB`;
- focus position;
- spot width;
- angular response.

**GO для Ø120:** если ideal/measured-law model показывает достаточный эффект с запасом относительно +10 dB.

**NO-GO:** если D≈2λ принципиально слишком мал — увеличить D до минимального passing diameter до печати.

## Приоритет №2 — T1 DE-10

Protocol: `docs/08_DE10_SPDR_T1_PROTOCOL.md`.

- [ ] Lock `PROFILE_DE10_V1`.
- [ ] Print `DE10-S01...S04`, `80×80×1.50 mm`.
- [ ] Identical wash/post-cure.
- [ ] 24 h conditioning.
- [ ] Thickness map.
- [ ] 3 physical samples ×3 placements minimum.
- [ ] Own `epsilon_r/tan_delta` around 5 GHz.

## Приоритет №3 — T2/T3

Protocol: `docs/09_DE10_GYROID_T2_T3_PROTOCOL.md`.

### T2

- [ ] 5 solid coupons `20×20×10 mm`.
- [ ] Cured density.
- [ ] Shrinkage X/Y/Z.

### T3

- nominal `a=7.5 mm`;
- coupon `30×30×15 mm`;
- rho series `0.10/0.15/0.20/0.30/0.40/0.50/0.65/0.81/0.90`.

- [ ] Generate STL with fixed `tools/uniform_sheet_gyroid_coupon.py`.
- [ ] Require `watertight=True` and `|rho_mesh_error|<=2%` before print.
- [ ] Determine measured `rho_min_print/rho_max_print`.
- [ ] Calculate `rho_actual` from measured cured density.

## Приоритет №4 — T4

Goal:

`rho -> epsilon_eff(rho,f), tan_delta_eff(rho,f)` around 5 GHz.

- [ ] Use same DE-10 process.
- [ ] Include low/mid/high and center-region point near `rho≈0.81`.
- [ ] Preserve actual mass/dimensions/rho/orientation.
- [ ] Minimum 3 placements for key samples.
- [ ] Repeatability + anisotropy.
- [ ] Fit monotonic measured calibration.
- [ ] Feed measured CSV to generator.

Generator rule after fix:

- measured interior points define calibration;
- physical endpoint `rho=0 -> epsilon=1` is added automatically;
- physical endpoint `rho=1 -> epsilon=epsilon_solid(T1)` is added automatically;
- final manufacturing clamp still comes from T3.

## Приоритет №5 — M7-M9

- [ ] M7 explicit gyroid unit-cell/coupon.
- [ ] Validate against T4.
- [ ] a=5/7.5/10 mm sensitivity; nominal 7.5.
- [ ] M8 reduced explicit validation.
- [ ] M9 whole **Ø120** lens + reflector.
- [ ] PEC cap sweep 15/30/45/60/90°.
- [ ] Compare full sphere + cap vs hemisphere + ground plane.
- [ ] Seam/loss sensitivity.

## Приоритет №6 — material budget before full print

For current Ø120 preliminary Bruggeman:

- sphere envelope `904.78 cm³`;
- ideal average rho `≈0.358`;
- provisional cured resin `≈356 g` at `1.1 g/cm³`;
- with provisional `rho_min=0.12`: `≈366 g`.

Before full print recalculate with:

- T1 epsilon;
- T2 cured density;
- T3 rho_min/rho_max;
- T4 measured epsilon_eff(rho).

Require:

`predicted full-lens cured mass + reserved process/coupon material < available DE-10 budget`.

## Приоритет №7 — manufacture Ø120 V1

Only after diameter + material GO:

- [ ] Generate measured-law geometry.
- [ ] Split into two open hemispheres.
- [ ] Add minimal alignment features.
- [ ] Print technological segment.
- [ ] Verify wash/post-cure/shrinkage/mass/min wall.
- [ ] Print full Ø120 demonstrator.
- [ ] Manufacture selected reflector.

## Приоритет №8 — physical 5-GHz experiment

For `D=120 mm`:

`R_ff≈0.48 m`.

Start distance:

`1.0–1.5 m`.

- [ ] Confirm stable setup at 5 GHz.
- [ ] 2 identical directional antennas.
- [ ] Fixed TX/RX base.
- [ ] BACKGROUND / HOLDER / REFERENCE / BASELINE / LENS_NO_REFLECTOR / LENS+REFLECTOR.
- [ ] Save complex `.s2p`.
- [ ] Repeat key placements >=3.
- [ ] Angular sweep minimum -30...+30° step 5°; preferred ±60°.
- [ ] Verify results are not dominated by direct TX-RX coupling/background.

## Приоритет №9 — M10 @24 GHz

After 5-GHz validation:

- [ ] Scale all linear dimensions ×`5/24`.
- [ ] `D: 120 -> 25 mm`.
- [ ] `R: 60 -> 12.5 mm`.
- [ ] `a: 7.5 -> 1.5625 mm`.
- [ ] Run Meep @24 GHz.
- [ ] Material-dispersion sensitivity.
- [ ] Loss sensitivity.
- [ ] Manufacturability/min-wall sensitivity.
- [ ] Estimate mass.
- [ ] Do not claim physical 24-GHz validation.

## Critical path summary

`T1 -> T2/T3 -> T4 -> M6/M7 -> diameter gate -> M8/M9 Ø120 -> material-budget gate -> tech segment -> full Ø120 print -> 5-GHz measurement -> M10 Ø25 @24 GHz`.
