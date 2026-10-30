# План разработки — TEST_LENS_5G_V1

## Этап 1. Масштабная модель

- `f = 5.0 GHz`;
- `D = 240 mm`;
- `R = 120 mm`;
- масштаб `3:1` относительно Ø80 мм;
- подобная конечная точка: `Ø80 mm @15 GHz`;
- `Ø80 mm @24 GHz` — отдельный расчёт.

## Этап 2. Meep по фиксированной лестнице

Не выбирать модель вручную. Использовать `docs/07_CALCULATION_WORKFLOW.md`.

Порядок:

1. M0 background;
2. M1 numerical reference;
3. M2 homogeneous sphere;
4. M3 ideal continuous Luneburg;
5. M4 loss sensitivity;
6. M5 11-zone benchmark + один раз 6/8-zone comparison;
7. M6 homogenized manufacturable continuous GRIN;
8. M7 explicit periodic gyroid unit cell;
9. M8 reduced explicit gyroid validation;
10. M9 final lens + reflector;
11. M10 Ø80 @15 GHz и отдельно @24 GHz.

Для каждого run использовать config на основе `simulation/INPUTS_TEMPLATE.yaml`.

## Этап 3. Материал — HARZ DE-10

Текущий primary local material candidate:

- mean `epsilon_r≈2.30318 @10 GHz`;
- mean `tan(delta)≈0.0024227 @10 GHz`;
- 11 измеренных образцов;
- 405 nm compatible.

Действия:

1. получить материал;
2. зафиксировать printer/wash/post-cure process;
3. напечатать solid coupons;
4. измерить `epsilon_r/tan(delta)` около 5 GHz;
5. напечатать gyroid coupons;
6. получить measured `epsilon_eff(rho)`;
7. заменить provisional Bruggeman measured interpolation.

## Этап 4. Photopolymer continuous gyroid

Основной manufacturing route MVP:

**continuous radial sheet-gyroid / TPMS**.

Стартовый period:

`a=7.5 mm`.

Comparison:

`5 / 7.5 / 10 mm`.

Сделать две открытые полусферы для washing/post-cure.

До full lens закрыть:

- min wall;
- rho_min/rho_max;
- shrinkage;
- mass-based volume fraction;
- anisotropy;
- seam influence.

## Этап 5. Reflector

Сначала:

`full sphere + PEC cap`.

Sweep:

`15/30/45/60/90°`.

После выбора сравнить с:

`hemisphere + PEC ground plane`.

## Этап 6. NanoVNA-стенд

- NanoVNA-F V3;
- две одинаковые направленные антенны около 5 ГГц;
- общая жёсткая база TX/RX;
- диэлектрическая стойка;
- поворотная платформа;
- distance 2.5–3 m;
- 2-port calibration;
- complex S21;
- background subtraction;
- reference target;
- baseline;
- angle sweep.

## Этап 7. Физический эксперимент

Минимальный набор:

1. BACKGROUND;
2. HOLDER;
3. REFERENCE target;
4. BASELINE;
5. LENS without reflector;
6. LENS + reflector.

Основная метрика:

`K_sigma = sigma_test/sigma_baseline`.

`Delta_sigma_dB = 10*log10(K_sigma)`.

Цель:

`Delta_sigma_dB >= +10 dB`.

## Этап 8. Масштабирование

После согласования 5-GHz experiment и Meep:

1. геометрия `1:3`;
2. Ø80 @15 GHz;
3. отдельно Ø80 @24 GHz;
4. учесть material dispersion.

## R&D после/параллельно MVP, если не мешает срокам

- PLA Aero / LW-PLA thermal-gradient;
- Orca continuous FDM;
- TiO2/SrTiO3 filled photopolymer;
- non-planar / multi-axis FDM;
- volumetric photopolymerization.

Эти ветки не должны задерживать первый photopolymer MVP.
