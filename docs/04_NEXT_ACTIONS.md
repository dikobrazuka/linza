# Ближайшие действия — TEST_LENS_5G_V1 -> FINAL_LENS_24G

## Каноническая схема

Физическая верификация:

- `5.0 GHz`;
- `D=240 mm`;
- `R=120 mm`;
- nominal `a=7.5 mm`;
- доступный измерительный тракт до ~6 GHz.

Финальный расчёт для защиты:

- `24.0 GHz`;
- scale `5/24=0.2083333`;
- `D=50.0 mm`;
- `R=25.0 mm`;
- `a=1.5625 mm`.

Подробно: `docs/10_SCALING_5_TO_24.md`.

## Приоритет №1 — M0-M6 на 5 GHz

- [ ] M0 — empty/background.
- [ ] M1 — numerical reference + near-to-far validation.
- [ ] M2 — homogeneous sphere control.
- [ ] M3 — ideal continuous Luneburg Ø240 mm @5 GHz, lossless.
- [ ] M4 — loss sensitivity.
- [ ] M5 — 11-zone benchmark + один раз 6/8-zone comparison.
- [ ] M6 — homogenized manufacturable continuous GRIN.
- [ ] Закрыть resolution convergence.
- [ ] Каждый run хранить через config на основе `simulation/INPUTS_TEMPLATE.yaml`.

## Приоритет №2 — HARZ DE-10 / T1

Manufacturer @10 GHz, 11 samples:

- mean `epsilon_r=2.30318`;
- range `2.187...2.384`;
- mean `tan(delta)=0.0024227`;
- range `0.00184...0.00310`;
- 405 nm compatible.

Статус закупки:

- available current stock up to `1.5 kg`;
- packing `0.5 kg`;
- `7000 RUB / 0.5 kg`;
- expiry `12.01.2027`;
- planned purchase `1.0 kg`.

T1 protocol:

`docs/08_DE10_SPDR_T1_PROTOCOL.md`

- [ ] Зафиксировать `PROFILE_DE10_V1`.
- [ ] Напечатать `DE10-S01...S04`, `80×80×1.50 mm`.
- [ ] Одинаковые wash/post-cure.
- [ ] 24 h conditioning.
- [ ] 9-point thickness measurement.
- [ ] Минимум 3 physical samples ×3 independent placements.
- [ ] Получить own `epsilon_r/tan(delta)` около 5 GHz.
- [ ] Сохранить raw + processed в `data/materials/de10/`.

GO logic:

- `epsilon_r<=2.00` -> NO-GO current resin+air classic Luneburg;
- `2.00<epsilon_r<2.15` -> poor margin;
- `epsilon_r>=2.15` -> GO to gyroid calibration.

`tan(delta)` оценивать через M4, без произвольного hard threshold.

## Приоритет №3 — T2/T3

Protocol:

`docs/09_DE10_GYROID_T2_T3_PROTOCOL.md`

### T2

- [ ] 5 solid coupons `20×20×10 mm`.
- [ ] Measure washed/cured X/Y/Z + mass.
- [ ] Get cured density.
- [ ] Get shrinkage X/Y/Z.
- [ ] Require `CV(rho_solid)<=1.5%` before mass-based T3 calibration.

### T3

Nominal period:

`a=7.5 mm`.

Coupon:

`30×30×15 mm = 4×4×2 periods`.

Series:

`rho=0.10/0.15/0.20/0.30/0.40/0.50/0.65/0.81/0.90`.

- [ ] Generate 9 STL through `tools/uniform_sheet_gyroid_coupon.py`.
- [ ] Before print require `watertight=True`, `|rho_mesh_error|<=2%`.
- [ ] Print one process/orientation.
- [ ] Record washability/trapped resin/sheet fusion.
- [ ] Calculate `rho_actual_mass` after cure.
- [ ] PASS: printable + washable + intact + `|rho_actual-rho_mesh|/rho_mesh<=5%`.
- [ ] Determine experimental `rho_min_print/rho_max_print`.
- [ ] Refine boundaries by midpoint if needed.

## Приоритет №4 — T4: measured RF law of gyroid

Цель:

`rho -> epsilon_eff(rho,f), tan_delta_eff(rho,f)` около 5 GHz.

Правила:

- [ ] Использовать тот же DE-10 process, что T1-T3.
- [ ] Выбрать calibration densities после T3, обязательно включая low/mid/high и central-region point около `rho≈0.81`.
- [ ] Для каждого RF-coupon сохранить actual mass, actual dimensions, `rho_actual`, orientation.
- [ ] Сохранять complex S-parameters/raw instrument files там, где это позволяет метод.
- [ ] Минимум 3 independent placements для каждого ключевого sample.
- [ ] Проверить repeatability.
- [ ] Проверить anisotropy минимум на representative mid/high densities.
- [ ] Fit/interpolate measured `epsilon_eff(rho)`.
- [ ] Заменить Bruggeman в `continuous_luneburg_gyroid.py` measured CSV.
- [ ] Bruggeman оставить только как comparison.

Важно: размеры T4 RF-coupons задаются под реальную измерительную оснастку/метод и не должны придумыватьcя заранее.

## Приоритет №5 — M7-M9

- [ ] M7 explicit periodic gyroid unit-cell/coupon.
- [ ] Сравнить M7 с measured T4.
- [ ] Проверить `a=5/7.5/10 mm` только как sensitivity, nominal остаётся 7.5 mm.
- [ ] M8 reduced explicit validation.
- [ ] M9 whole lens + reflector.
- [ ] PEC cap sweep `15/30/45/60/90°`.
- [ ] Compare full sphere + cap vs hemisphere + ground plane.
- [ ] Seam sensitivity.
- [ ] Material-loss sensitivity.
- [ ] До full print требовать расчётный запас относительно +10 dB.

## Приоритет №6 — изготовление TEST_LENS_5G_V1

- [ ] Generate geometry from measured `epsilon_eff(rho)`.
- [ ] Split into two open hemispheres.
- [ ] Add minimal alignment features.
- [ ] Print technological segment first.
- [ ] Verify washing/post-cure/shrinkage/mass/min wall.
- [ ] Print full Ø240-mm demonstrator.
- [ ] Manufacture selected reflector.

## Приоритет №7 — физический 5-GHz experiment

- [ ] Confirm stable VNA/setup operation around 5 GHz.
- [ ] 2 identical directional antennas.
- [ ] Fixed TX/RX base.
- [ ] Low-scatter target support.
- [ ] Start distance `2.5–3.0 m`.
- [ ] 2-port calibration.
- [ ] BACKGROUND.
- [ ] HOLDER.
- [ ] REFERENCE.
- [ ] BASELINE.
- [ ] LENS_NO_REFLECTOR.
- [ ] LENS+REFLECTOR.
- [ ] Save complex `S21/.s2p`.
- [ ] Repeat key measurements >=3 times with target re-installation.
- [ ] Angle sweep minimum `-30...+30°` step `5°`; preferred final sweep to ±60°.

## Приоритет №8 — validate model vs experiment

- [ ] Compare 5-GHz Meep and measured frequency trend.
- [ ] Compare angular trend.
- [ ] Compare relative gain `K_sigma`.
- [ ] Record mismatch and update model assumptions.
- [ ] Freeze validated 5-GHz geometry/config before scaling.

## Приоритет №9 — M10 / 24-GHz defense calculation

После 5-GHz validation:

- [ ] Scale every linear dimension by `5/24`.
- [ ] `D: 240 -> 50 mm`.
- [ ] `R: 120 -> 25 mm`.
- [ ] `a: 7.5 -> 1.5625 mm`.
- [ ] Scale reflector and seam assumptions geometrically.
- [ ] Run Meep @24 GHz.
- [ ] Run material-dispersion sensitivity.
- [ ] Run tan(delta) sensitivity.
- [ ] Check manufacturability of scaled minimum features separately.
- [ ] Estimate final mass and verify `<300 g`.
- [ ] Do not claim physical 24-GHz validation.

## R&D not on critical path

- PLA Aero / LW-PLA;
- Orca continuous FDM;
- TiO2/SrTiO3 filled resin;
- non-planar/multi-axis FDM;
- volumetric photopolymerization.

## Минимальный результат текущей итерации

1. DE-10 obtained.
2. T1 closed.
3. T2/T3 closed.
4. T4 measured `epsilon_eff(rho)` obtained.
5. M0-M9 closed and reproducible.
6. TEST_LENS_5G_V1 printed and measured.
7. Meep reproduces the 5-GHz physical trend.
8. Experimental `K_sigma` quantified.
9. FINAL_LENS_24G scaled to Ø50 mm and calculated.
10. Protection package clearly separates measured 5-GHz evidence from 24-GHz prediction.
