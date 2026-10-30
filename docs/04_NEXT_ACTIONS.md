# Ближайшие действия — TEST_LENS_5G_V1 -> FINAL_LENS_24G

## Каноническая схема

Физическая верификация:

- `f=5.0 GHz`;
- current preferred `D=120 mm`;
- `R=60 mm`;
- `lambda0≈59.96 mm`;
- `D/lambda0≈2.00`;
- nominal `a=7.5 mm`;
- measurement setup до ~6 GHz.

Strict-scaled 24-GHz reference при сохранении Ø120:

- scale `5/24=0.2083333`;
- `D=25.0 mm`;
- `R=12.5 mm`;
- `a=1.5625 mm`.

## Приоритет №1 — M0-M6

- [ ] M0 background.
- [ ] M1 numerical reference + near-to-far validation.
- [ ] M2 homogeneous sphere control.
- [ ] M3 ideal continuous Luneburg Ø120 @5 GHz, lossless.
- [ ] M4 loss sensitivity.
- [ ] M5 11-zone benchmark + one-time 6/8-zone comparison.
- [ ] M6 homogenized manufacturable continuous GRIN.
- [ ] Resolution convergence.

## Mandatory diameter gate

Документы:

- `simulation/DIAMETER_GATE.md`;
- `simulation/configs/DIAMETER_GATE_5G.yaml`.

Сравнить:

- `D=120 mm` current preferred;
- `D=150 mm`;
- `D=180 mm`;
- `D=240 mm` reference.

Outputs:

- peak `K_sigma`;
- `Delta_sigma_dB`;
- focus position/R;
- spot width/lambda;
- angular width;
- frequency response;
- numerical convergence;
- predicted cured mass.

Selection rule:

**выбрать минимальный D, который проходит RF + numerical + material + stand gates.**

Ø120 до этого имеет статус:

`PREFERRED / NOT YET RF-LOCKED`.

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

- [ ] Generate STL with `tools/uniform_sheet_gyroid_coupon.py`.
- [ ] Require `watertight=True` and `|rho_mesh_error|<=2%` before print.
- [ ] Determine measured `rho_min_print/rho_max_print`.
- [ ] Calculate `rho_actual` from measured cured density.

## Приоритет №4 — T4

Executable protocol:

`docs/12_T4_RF_GYROID_PROTOCOL.md`.

Data workspace:

`data/materials/de10/`.

### T4-0 — fixture gate

- [ ] Fill `data/materials/de10/T4_FIXTURE_CARD.md`.
- [ ] Record exact method / VNA / fixture / aperture / holder / calibration planes / deembedding / raw export.
- [ ] Until T4-0 is filled: **NO-CAD / NO-PRINT for RF coupons**.

### T4-1 — pilot

- [ ] After T3 choose representative mid density.
- [ ] If fixture allows, compare propagation length `2a=15 mm`, `3a=22.5 mm`, optional `4a=30 mm`.
- [ ] 3 independent insertions each.
- [ ] Check finite-length sensitivity, extraction stability and dynamic range.

### T4-2 — calibration series

- [ ] Minimum 5 PASS densities across printable range.
- [ ] Include low/mid/high and center-region density if printable.
- [ ] Minimum 2 physical duplicate coupons at representative mid/high points.
- [ ] Minimum 3 reinsertions per physical coupon.
- [ ] Save raw complex data.
- [ ] Repeatability and physical sample-to-sample reproducibility separately.
- [ ] Check anisotropy at minimum two densities.
- [ ] Produce `DE10_GYROID_EPS_CAL_5GHz.csv`.

Generator after T4:

- measured interior points define calibration;
- `rho=0 -> epsilon=1` added automatically;
- `rho=1 -> epsilon=epsilon_solid(T1)` added automatically;
- final manufacturing clamp still comes from T3.

## Приоритет №5 — M7-M9

- [ ] M7 explicit gyroid unit-cell/coupon.
- [ ] Validate against T4.
- [ ] a=5/7.5/10 mm sensitivity; nominal 7.5.
- [ ] M8 reduced explicit validation.
- [ ] Run diameter gate DG-B with measured manufacturable law.
- [ ] Lock smallest passing physical diameter.
- [ ] M9 whole selected-D lens + reflector.
- [ ] PEC cap sweep 15/30/45/60/90°.
- [ ] Compare full sphere + cap vs hemisphere + ground plane.
- [ ] Seam/loss sensitivity.

## Приоритет №6 — material budget before full print

Tool:

```bash
python tools/material_budget.py --diameters 120 150 180 240
```

Current provisional assumptions:

- `epsilon_solid=2.30318`;
- cured density `1.10 g/cm³`;
- no technological clamp;
- purchased resin `1000 g`;
- reserve `250 g`;
- usable lens budget `750 g`.

Reference result:

| D | cured mass | provisional material gate |
|---:|---:|---|
| 120 | ~356.5 g | PASS |
| 150 | ~696.3 g | PASS |
| 180 | ~1203.1 g | FAIL |
| 240 | ~2851.9 g | FAIL |

After T2/T3/T4 rerun with measured:

- cured density;
- rho_min/rho_max;
- measured epsilon law.

## Приоритет №7 — manufacture selected V1

Only after diameter + material GO:

- [ ] Generate measured-law geometry.
- [ ] Split into open hemispheres / manufacturing sections as required by real printer build volume.
- [ ] Add minimal alignment features.
- [ ] Print technological segment.
- [ ] Verify wash/post-cure/shrinkage/mass/min wall.
- [ ] Print full selected physical demonstrator.
- [ ] Manufacture selected reflector.

## Приоритет №8 — physical 5-GHz experiment

For current Ø120 candidate:

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
- [ ] Verify distance/background/direct-coupling sensitivity.
- [ ] Repeat stand gate if selected D differs from 120 mm.

## Приоритет №9 — M10 @24 GHz

After 5-GHz validation:

- [ ] Scale all linear dimensions ×`5/24`.
- [ ] If Ø120 retained: `D:120 ->25 mm`, `R:60 ->12.5 mm`, `a:7.5 ->1.5625 mm`.
- [ ] If another D wins diameter gate, regenerate scaled dimensions from that D.
- [ ] Run Meep @24 GHz.
- [ ] Material-dispersion sensitivity.
- [ ] Loss sensitivity.
- [ ] Manufacturability/min-wall sensitivity.
- [ ] Estimate mass.
- [ ] Do not claim physical 24-GHz validation.

## Automated quality checks

Run locally:

```bash
pytest -q
```

CI:

`.github/workflows/python-tests.yml`.

Regression checks include:

- gyroid box clipping + watertight mesh;
- measured calibration endpoints;
- full Luneburg epsilon mapping;
- Ø120 material budget;
- canonical dimensions across code/docs.

## Critical path summary

`T1 -> T2/T3 -> T4 -> M6/M7 -> diameter gate -> M8/M9 -> material-budget gate -> tech segment -> full print -> 5-GHz measurement -> M10 scaled @24 GHz`.
