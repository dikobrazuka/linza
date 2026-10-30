# Diameter gate — выбор физического диаметра на 5 ГГц

Дата: 2026-10-31

Цель: не принимать `D=120 mm` только из-за экономии смолы. Выбрать минимальный диаметр, который одновременно проходит RF- и material-gate.

## 1. Кандидаты

Считать одинаковым workflow:

- `D = 120 mm`, `R = 60 mm`, `D/lambda0 ≈2.00`;
- `D = 150 mm`, `R = 75 mm`, `D/lambda0 ≈2.50`;
- `D = 180 mm`, `R = 90 mm`, `D/lambda0 ≈3.00`;
- `D = 240 mm`, `R = 120 mm`, `D/lambda0 ≈4.00`.

`f=5.0 GHz`, `lambda0≈59.958 mm`.

Nominal gyroid period для manufacturable branch:

`a=7.5 mm`.

Machine-readable config:

`simulation/configs/DIAMETER_GATE_5G.yaml`.

## 2. Сначала ideal continuous, потом manufacturable

Diameter gate выполнять в два шага.

### DG-A — ideal continuous Luneburg

Для каждого D:

- `epsilon(r)=2-(r/R)^2`;
- lossless;
- одинаковая нормированная reflector geometry;
- одинаковая polarization/incidence;
- одинаковая resolution в пересчёте на `pixels/lambda`, а не фиксированный px/mm без проверки.

Цель: понять фундаментальную потерю эффекта при уменьшении electrical size.

### DG-B — manufacturable homogenized model

После DG-A повторить только для прошедших кандидатов:

- measured/provisional DE-10 loss;
- technological `rho_min/rho_max`;
- `epsilon_realized(r)`;
- selected reflector;
- seam sensitivity.

До T1-T4 использовать только provisional values и помечать run как provisional.

## 3. Обязательные outputs

Для каждого диаметра сохранить:

- `focus_position_mm`;
- `focus_position_over_R`;
- `spot_size_3dB_mm`;
- `spot_size_3dB_over_lambda`;
- `K_sigma_peak`;
- `Delta_sigma_dB_peak`;
- angular response;
- angular width where `Delta_sigma_dB >= +10 dB`, если такая область есть;
- frequency response минимум в текущем usable 5-GHz window;
- resolution-convergence result;
- estimated cured resin mass.

Файл summary:

`simulation/results/diameter_gate/DIAMETER_GATE_RESULT.csv`.

Минимальные колонки:

```text
diameter_mm,D_over_lambda,model,delta_sigma_peak_db,K_sigma_peak,focus_over_R,spot_3dB_over_lambda,angle_width_ge_10dB_deg,estimated_cured_mass_g,numerical_pass,rf_pass,material_pass,decision
```

## 4. Numerical gate

Run не принимать, пока при следующем resolution:

- `|Delta_sigma_dB(new)-Delta_sigma_dB(old)| < 0.5 dB`;
- `|focus_new-focus_old| < 0.01 R`.

## 5. RF gate

Рабочая цель проекта:

`Delta_sigma_dB >= +10 dB` относительно зафиксированного project baseline.

Для выбора диаметра недостаточно одного узкого peak. Сохранить также angular/frequency width.

Пока baseline окончательно не зафиксирован, diameter gate можно использовать как сравнительный ranking, но нельзя ставить окончательный PASS по проектному +10 dB.

## 6. Material gate

Текущий provisional расчёт при:

- `epsilon_solid=2.30318`;
- symmetric Bruggeman;
- cured density `1.10 g/cm³`;
- без technological clamp;

даёт:

| D | avg rho | cured mass |
|---:|---:|---:|
| 120 mm | 0.3582 | ~356.5 g |
| 150 mm | 0.3582 | ~696.3 g |
| 180 mm | 0.3582 | ~1203.1 g |
| 240 mm | 0.3582 | ~2851.9 g |

При 1 kg закупленной смолы временно резервировать минимум `250 g` под T1-T4, технологические тесты и потери.

Provisional usable mass for full lens:

`750 g`.

Следовательно до measured T2/T3/T4:

- `D=120` — material PASS;
- `D=150` — material PASS, но почти без большого запаса;
- `D=180` — FAIL;
- `D=240` — FAIL.

После T2/T3/T4 пересчитать через:

`tools/material_budget.py`.

## 7. Selection rule

Выбрать **минимальный D**, который одновременно:

1. прошёл numerical convergence;
2. сохраняет достаточный RF effect/угловую ширину;
3. проходит material budget после measured T2/T3/T4;
4. физически помещается в выбранный manufacturing split/build volume;
5. проходит измерительный stand dynamic-range check.

Current preferred candidate:

`D=120 mm`.

Но до выполнения DG-A/DG-B статус:

`PREFERRED / NOT YET RF-LOCKED`.

## 8. Scaling к 24 ГГц

После выбора физического D:

`D_24 = D_5 * 5/24`.

Для текущих кандидатов:

- 120 -> 25.0 mm;
- 150 -> 31.25 mm;
- 180 -> 37.5 mm;
- 240 -> 50.0 mm.

Scaling на 24 ГГц выполнять только после фиксации выбранного 5-GHz geometry и валидации model vs experiment.
