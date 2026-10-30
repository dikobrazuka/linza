# PROJECT MEMORY — LINZA

Актуальное состояние проекта. При конфликте приоритет: newest non-superseded decision -> этот файл -> root README -> stage protocol.

**Срез:** 2026-10-31

## 1. Цель

Компактная пассивная GRIN/Luneburg-структура для увеличения обратного радиолокационного рассеяния/ЭПР.

Конечные требования:

- частота расчёта для защиты: `24 GHz`;
- габарит конечной конструкции `<=80 mm`;
- масса конечной конструкции `<=300 g`;
- целевой `K_sigma>=10` (`+10 dB` относительно формально выбранного baseline);
- основной full-wave инструмент: Meep.

## 2. Канонический multi-scale маршрут

Доступный измерительный тракт работает примерно до 6 GHz, поэтому физическая верификация выполняется на 5 GHz.

### Физический demonstrator

Current preferred `TEST_LENS_5G_V1`:

- `f_test=5.0 GHz`;
- `D_test=120 mm`;
- `R_test=60 mm`;
- `lambda0≈59.96 mm`;
- `D/lambda0≈2.00`;
- nominal gyroid period `a_test=7.5 mm`.

Ø120 ещё не RF-locked. Перед full print обязателен diameter gate `120/150/180/240 mm`.

### Strict-scaled 24-GHz reference

Если Ø120 выигрывает diameter gate:

`k=5/24=0.2083333`.

- `D_final=25.0 mm`;
- `R_final=12.5 mm`;
- `a_final=1.5625 mm`;
- `L_24=L_5*(5/24)`.

Если выбран другой D, scaled 24-GHz dimensions пересчитываются от него.

24-GHz результат — calculation/prediction, не physical measurement.

## 3. Физика

`epsilon_target(r)=2-(r/R)^2`.

Pipeline:

`epsilon_target -> rho -> h -> sheet-gyroid -> measured EM response`.

Volume fraction не равна dielectric permittivity; финальная связь — measured T4.

## 4. Manufacturing route

Primary MVP:

**HARZ DE-10 + MSLA/DLP + continuous radial sheet-gyroid**.

- nominal `a=7.5 mm` @5 GHz;
- continuous `h(r)`;
- open hemispheres/sections preferred for washing/post-cure;
- exact split must respect real printer build volume;
- FDM/PLA Aero/LW-PLA/fillers — R&D/backup.

## 5. DE-10

Manufacturer @10 GHz, 11 samples:

- mean `epsilon_r=2.30318`;
- mean `tan_delta=0.0024227`;
- 405 nm compatible.

Procurement:

- current stock up to `1.5 kg`;
- 0.5-kg pack = `7000 RUB`;
- planned purchase `1.0 kg`.

Own T1/T4 around 5 GHz mandatory.

Preliminary Bruggeman:

- center `rho≈0.806`;
- ideal volume-average `rho≈0.358`.

For `D=120 mm`:

- envelope volume `≈904.78 cm³`;
- provisional cured resin mass `≈356.5 g` ideal/unclamped at `rho_solid=1.1 g/cm³`;
- `≈366.4 g` with provisional `rho_min=0.12`;
- exact mass after T2/T3/T4.

Material-budget tool:

`tools/material_budget.py`.

Current provisional material comparison with 1 kg purchased and 250 g reserved:

- D120 ~356.5 g -> PASS;
- D150 ~696.3 g -> PASS, low margin;
- D180 ~1203.1 g -> FAIL;
- D240 ~2851.9 g -> FAIL.

## 6. Tests

### T1

`docs/08_DE10_SPDR_T1_PROTOCOL.md`

4 solid plates `80×80×1.50 mm`, three main + spare, SPDR around 5/5.1 GHz.

### T2

5 solid coupons `20×20×10 mm`; cured density + shrinkage.

### T3

`docs/09_DE10_GYROID_T2_T3_PROTOCOL.md`

Uniform sheet-gyroid coupons, `a=7.5 mm`, envelope `30×30×15 mm`, rho series `0.10/0.15/0.20/0.30/0.40/0.50/0.65/0.81/0.90`.

Determine real `rho_min_print/rho_max_print` and `h -> rho_actual`.

### T4

Executable protocol:

`docs/12_T4_RF_GYROID_PROTOCOL.md`.

Data workspace:

`data/materials/de10/`.

Before T4 RF-coupon CAD:

- fill `T4_FIXTURE_CARD.md`;
- exact fixture/aperture/calibration planes must be known;
- no guessed RF-coupon dimensions.

T4 series:

- minimum 5 densities across printable range;
- 2 physical duplicates at representative mid/high points;
- >=3 independent insertions per coupon;
- finite-length pilot if fixture allows;
- repeatability + sample-to-sample reproducibility + anisotropy;
- final `DE10_GYROID_EPS_CAL_5GHz.csv`.

## 7. Meep ladder

`M0 background -> M1 reference -> M2 homogeneous control -> M3 ideal continuous -> M4 loss -> M5 zoned benchmark -> M6 homogenized manufacturable GRIN -> M7 explicit unit cell/coupon -> M8 reduced explicit validation -> M9 selected-D @5 GHz + reflector -> M10 strict-scaled @24 GHz`.

Diameter gate:

- `simulation/DIAMETER_GATE.md`;
- `simulation/configs/DIAMETER_GATE_5G.yaml`.

Current candidate set:

`120 / 150 / 180 / 240 mm`.

Selection rule:

**smallest D passing numerical + RF + material + stand gates.**

Ideal DG-A runner:

`simulation/run_ideal_luneburg_rcs.py`.

Orchestrator:

`simulation/run_diameter_gate.py`.

DG-A uses Meep official scattered-field method: normalization -> subtract incident near fields -> far field -> RCS. It is ideal/lossless and does not replace M9 project-baseline comparison.

## 8. 5-GHz experiment

For current D120 candidate:

`R_ff≈2D²/lambda≈0.48 m`.

Starting stand distance:

`1.0–1.5 m`.

Measure complex `S21/.s2p` for:

- BACKGROUND;
- HOLDER;
- REFERENCE;
- BASELINE;
- LENS_NO_REFLECTOR;
- LENS+REFLECTOR.

Repeat key placements >=3.

Explicit stand gate before full experiment:

- direct TX-RX coupling not dominant;
- reference target clearly above background;
- result stable enough versus distance/background;
- dynamic range adequate around 5 GHz.

## 9. Code quality / CI

Generators:

- `tools/continuous_luneburg_gyroid.py`;
- `tools/uniform_sheet_gyroid_coupon.py`;
- `tools/material_budget.py`.

Known bugs already fixed:

- T3 `np.minimum.reduce` broadcast failure;
- open marching-cubes box boundary;
- measured calibration failing at Luneburg `epsilon->1` edge;
- canonical generator radius `120 -> 60 mm`.

Regression tests:

`tests/`.

CI:

`.github/workflows/python-tests.yml`.

CI must be green before calling code changes complete.

## 10. Known unknowns

- own DE-10 epsilon/tan(delta) @5 GHz;
- measured gyroid epsilon_eff(rho);
- real printability near low rho and rho≈0.81;
- whether Ø120 / D≈2λ is electromagnetically sufficient;
- formal baseline for final K_sigma;
- final reflector geometry;
- 24-GHz dispersion;
- physical manufacturability of a=1.5625 mm scaled geometry.

## 11. Critical path

1. Obtain DE-10.
2. Lock print/wash/cure process.
3. T1.
4. T2/T3.
5. M0-M5 in parallel.
6. T4.
7. M6/M7 measured-law validation.
8. DG-A/DG-B diameter gate.
9. Select physical D.
10. M8/M9 + reflector.
11. Material-budget gate with measured data.
12. Print technological segment.
13. Full physical V1 only after GO.
14. 5-GHz experiment and Meep comparison.
15. M10 strict scaling to 24 GHz.
16. Defense package: measured 5-GHz evidence + validated model + 24-GHz prediction + limitations.

## 12. Governance

After any change of frequency, diameter, material or manufacturing route:

1. superseding decision;
2. update PROJECT_MEMORY + README;
3. full-repo consistency search;
4. update active experiment/simulation/budget/code files;
5. executable code tests + CI green before calling the repo current.
