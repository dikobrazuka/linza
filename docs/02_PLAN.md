# План разработки — TEST_LENS_5G_V1 -> FINAL_LENS_24G

## Этап 1. Физический масштабный демонстратор

Зафиксировано:

- `f_test = 5.0 GHz`;
- `D_test = 240 mm`;
- `R_test = 120 mm`;
- `a_test = 7.5 mm` nominal;
- доступный измерительный тракт до ~6 GHz.

Цель этого образца — физически проверить GRIN/reflector концепцию, material law и Meep около 5 GHz.

## Этап 2. Meep ladder на 5 GHz

Порядок:

1. M0 background;
2. M1 numerical reference;
3. M2 homogeneous sphere;
4. M3 ideal continuous Luneburg;
5. M4 loss sensitivity;
6. M5 11-zone benchmark + один раз 6/8-zone comparison;
7. M6 homogenized manufacturable continuous GRIN;
8. M7 explicit periodic gyroid unit cell/coupon;
9. M8 reduced explicit gyroid validation;
10. M9 final 5-GHz lens + reflector;
11. M10 scaled `Ø50 mm @24 GHz`.

Использовать `docs/07_CALCULATION_WORKFLOW.md` и config на основе `simulation/INPUTS_TEMPLATE.yaml`.

## Этап 3. Материал — HARZ DE-10

Primary MVP material.

Manufacturer @10 GHz:

- mean `epsilon_r=2.30318`;
- mean `tan(delta)=0.0024227`;
- 11 samples;
- 405 nm compatible.

До full lens закрыть:

1. T1 — solid `epsilon_r/tan(delta)` около 5 GHz;
2. T2 — cured density/shrinkage;
3. T3 — `rho_min_print/rho_max_print`, `h -> rho_actual`;
4. T4 — measured `epsilon_eff(rho,f)` около 5 GHz;
5. replace provisional Bruggeman by measured interpolation.

## Этап 4. Continuous sheet-gyroid

Основной manufacturing route:

**photopolymer continuous radial sheet-gyroid / TPMS**.

Nominal:

`a=7.5 mm` @5 GHz.

Research sweep:

`5 / 7.5 / 10 mm`.

Две открытые полусферы — основной manufacturing concept для washing/post-cure.

До full lens проверить:

- min wall;
- rho range;
- washability;
- shrinkage;
- mass-based volume fraction;
- anisotropy;
- seam influence.

## Этап 5. Reflector

M9:

- сначала `full sphere + PEC cap`;
- cap sweep `15/30/45/60/90°`;
- затем comparison с `hemisphere + PEC ground plane`.

## Этап 6. Физический стенд 5 GHz

- VNA/measurement setup до ~6 GHz;
- 2 одинаковые направленные антенны около 5 GHz;
- общая жёсткая база TX/RX;
- диэлектрическая стойка;
- distance `2.5–3.0 m`;
- 2-port calibration;
- complex `S21/.s2p`;
- BACKGROUND;
- HOLDER;
- REFERENCE;
- BASELINE;
- LENS_NO_REFLECTOR;
- LENS+REFLECTOR;
- минимум 3 repeat ключевых measurements.

## Этап 7. Сопоставление experiment vs Meep

Сравнить:

- focus;
- relative RCS/backscatter gain;
- angular response;
- frequency response around 5 GHz;
- repeatability;
- discrepancy model vs experiment.

M9 считается подтверждённым только после сравнения с физикой.

## Этап 8. Масштабирование на 24 GHz

После 5-GHz validation:

`k = 5/24 = 0.2083333`.

Все линейные размеры:

`L_24 = L_5 * 5/24`.

Итого:

- `D_24 = 50.0 mm`;
- `R_24 = 25.0 mm`;
- `a_24 = 1.5625 mm`.

В M10 выполнить 24-GHz Meep prediction с:

- scaled geometry;
- material-dispersion sensitivity;
- tan(delta) sensitivity;
- technological-resolution sensitivity.

Не заявлять, что 24-GHz конструкция физически измерена.

## Этап 9. Пакет для защиты

Должно быть:

1. theory + ideal Luneburg;
2. material characterization;
3. measured gyroid calibration;
4. 5-GHz physical experiment;
5. Meep reproduction of 5-GHz trend;
6. scaling proof `5 ->24 GHz`;
7. Ø50-mm 24-GHz calculation;
8. explicit limitations: dispersion, printability, scaled feature size;
9. фотофиксация и raw data.

## R&D, не тормозящий MVP

- PLA Aero / LW-PLA;
- Orca continuous FDM;
- TiO2/SrTiO3 filled resin;
- non-planar/multi-axis FDM;
- volumetric photopolymerization.
