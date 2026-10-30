# Расчёты и моделирование — Meep

Основной полно-волновой инструмент проекта — **Meep**.

Главный документ расчётной логики:

- `docs/07_CALCULATION_WORKFLOW.md` — фиксированный порядок моделей, входы, формулы, критерии PASS/FAIL.

Главный файл входов:

- `simulation/INPUTS_TEMPLATE.yaml` — копировать для каждого расчёта в `simulation/configs/`.

## Актуальный объект расчёта

`TEST_LENS_5G_V1`:

- `f = 5.0 GHz`;
- `D = 240 mm`;
- `R = 120 mm`;
- `lambda0 ≈ 60 mm`;
- physical scaling pair: `Ø80 mm @15 GHz`;
- `Ø80 mm @24 GHz` — отдельная расчётная точка.

Идеальный профиль:

`epsilon_r(r)=2-(r/R)^2`.

Основной manufacturing route MVP:

**photopolymer + continuous radial sheet-gyroid / TPMS**.

## Текущий материал-сценарий

HARZ DE-10, предварительно по данным производителя @10 GHz:

- 11 измеренных образцов;
- mean `epsilon_r ≈2.30318`;
- sample SD `≈0.06218`;
- range `2.187...2.384`;
- mean `tan(delta)≈0.0024227`;
- sample SD `≈0.0003436`;
- range `0.00184...0.00310`;
- 405 nm compatible по ответу производителя.

Это **provisional material scenario** для sensitivity/calculation. До финальной 5-GHz модели нужна собственная characterization около 5 GHz.

## Не выбирать модель вручную

Считать строго по лестнице:

1. `M0` — empty/background;
2. `M1` — numerical scattering reference;
3. `M2` — homogeneous sphere control;
4. `M3` — ideal continuous Luneburg, lossless;
5. `M4` — ideal continuous + loss sensitivity;
6. `M5` — 11-zone benchmark, плюс один раз 6/8-zone comparison;
7. `M6` — homogenized manufacturable continuous GRIN;
8. `M7` — explicit periodic gyroid unit cell/coupon;
9. `M8` — reduced explicit gyroid validation;
10. `M9` — whole lens + reflector;
11. `M10` — Ø80 mm @15 GHz и затем отдельный Ø80 mm @24 GHz.

Подробности: `docs/07_CALCULATION_WORKFLOW.md`.

## Multi-scale правило

Не начинать с полного explicit Ø240-mm gyroid.

Разделить расчёт:

- **micro scale:** explicit unit cell / coupon -> `epsilon_eff(rho)`, anisotropy, loss;
- **macro scale:** whole lens -> homogenized measured `epsilon_realized(r)`.

Полный explicit gyroid нужен только как дополнительная валидация при достаточных ресурсах.

## Gyroid

Основная implicit geometry:

`G = sin(kx)cos(ky)+sin(ky)cos(kz)+sin(kz)cos(kx)`

`k=2*pi/a`.

Sheet solid:

`|G|<=h(r)`.

Цепочка:

`epsilon_target(r) -> rho(r) -> h(r) -> geometry`.

Текущий cell sweep:

- `a=5 mm` — EM reference;
- `a=7.5 mm` — current first prototype candidate;
- `a=10 mm` — manufacturing-friendly upper comparison.

## Reflector

Первый whole-lens sweep:

`full sphere + PEC cap`.

Cap half-angle:

`15 / 30 / 45 / 60 / 90 deg`.

После выбора cap сравнить с:

`hemisphere + PEC ground plane`.

## Основные выходы

Для каждой модели сохранять:

- focus position;
- -3 dB / -6 dB spot size;
- complex scattered response;
- `K_sigma(theta)`;
- `Delta_sigma_dB(theta)`;
- material-loss sensitivity;
- resolution convergence;
- config YAML;
- raw data;
- `RESULT.md` с PASS/FAIL.

Главная проектная метрика:

`K_sigma = sigma_test/sigma_baseline`.

Цель:

`K_sigma>=10`, то есть `Delta_sigma_dB>=+10 dB`.

## Численная сходимость

Расчёт не считать закрытым без resolution sweep.

Текущий проектный gate:

- изменение `Delta_sigma_dB <0.5 dB` при дальнейшем повышении resolution;
- изменение focus position `<1% R`.

## Файлы

- `CALCULATIONS.md` — базовые числа TEST_LENS_5G_V1 и зональные benchmark;
- `CONTINUOUS_GYROID.md` — математика continuous sheet-gyroid;
- `GYROID_CELL_SWEEP.md` — 5/7.5/10-mm comparison;
- `INPUTS_TEMPLATE.yaml` — canonical run inputs;
- `../docs/07_CALCULATION_WORKFLOW.md` — основной алгоритм расчёта.
