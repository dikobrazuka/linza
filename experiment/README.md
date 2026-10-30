# Экспериментальный стенд — TEST_LENS_5G_V1 @5 GHz

## Цель

Физически проверить масштабную Luneburg/GRIN-конструкцию `TEST_LENS_5G_V1` на **5.0 GHz** доступным VNA/measurement setup до ~6 GHz, затем сопоставить experiment vs Meep и только после этого масштабировать validated geometry на **24 GHz**.

Физический эксперимент на 5 GHz нельзя выдавать за прямое измерение 24-GHz конструкции.

## Каноническая масштабная пара

Физический demonstrator:

- `D = 240 mm`;
- `R = 120 mm`;
- `f = 5.0 GHz`;
- nominal `a = 7.5 mm`.

Final calculated design:

- scale `k = 5/24 = 0.2083333`;
- `D = 50.0 mm`;
- `R = 25.0 mm`;
- `f = 24.0 GHz`;
- nominal `a = 1.5625 mm`.

Подробно: `docs/10_SCALING_5_TO_24.md`.

## Схема стенда

`VNA Port 1 -> TX antenna -> TARGET -> RX antenna -> VNA Port 2`

Используется complex `S21`.

## Антенны

Нужны 2 одинаковые направленные антенны, уверенно работающие около 5 GHz.

Требования:

- одинаковая polarization;
- фиксированная TX/RX geometry;
- обе направлены в target center;
- кабели после calibration не перемещать.

## Геометрия

Для `D=240 mm`, `f=5 GHz`:

`lambda0 ≈59.96 mm`.

Far-field estimate:

`R_ff ≈2D²/lambda ≈1.92 m`.

Рабочая стартовая distance:

`2.5–3.0 m`.

Target:

- на преимущественно dielectric support;
- center на одной высоте с antennas;
- крупный металл/людей убрать из основной диаграммы;
- положение stand отметить и не менять между runs.

## Конфигурации

1. `BACKGROUND` — target отсутствует;
2. `HOLDER` — только holder;
3. `REFERENCE` — известная/повторяемая metallic reference target;
4. `BASELINE` — formal project baseline;
5. `LENS_NO_REFLECTOR`;
6. `LENS_REFLECTOR`.

`REFERENCE != BASELINE` по смыслу.

## VNA / setup

Перед серией:

1. warm-up;
2. 2-port calibration;
3. record sweep/power/points/IFBW/averaging where available;
4. save complex `S21/.s2p`;
5. cables/antennas не менять между configurations.

Главное условие: `5.0 GHz` внутри usable band.

## Background subtraction

Complex:

`H_target(f)=S21_target(f)-S21_background(f)`.

Не заменять этим вычитанием dB magnitudes.

Time-domain gating применять только если usable bandwidth даёт достаточное range resolution.

## Relative metric

`K_sigma = |H_test|² / |H_baseline|²`.

`Delta_sigma_dB = 20*log10(|H_test|/|H_baseline|)`.

Цель:

`K_sigma>=10` <=> `Delta_sigma_dB>=+10 dB`.

Абсолютную ЭПР в `m²` заявлять только при корректной отдельной RCS calibration.

## Повторяемость

Для key configurations минимум 3 независимых target placements:

- BASELINE;
- LENS_NO_REFLECTOR;
- LENS_REFLECTOR;
- желательно REFERENCE.

## Angular sweep

Minimum:

`-30°...+30°`, step `5°`.

Preferred final:

`-60°...+60°`, step `5°`.

На каждом angle менять только target angle.

## Что сопоставляется с Meep

1. `Ø240 @5 GHz` physical measurement;
2. `Ø240 @5 GHz` M9;
3. measured vs simulated frequency/angular trend;
4. validated geometry scaled `×5/24`;
5. `Ø50 @24 GHz` M10 prediction.

Сравнивать:

- `K_sigma`;
- `Delta_sigma_dB`;
- angular response;
- frequency trend;
- reflector effect;
- focus where measured.

## Ограничения scaling

Strict similarity дополнительно требует контроля:

- `epsilon_r(f)`;
- `tan_delta(f)`;
- normalized cell dimensions;
- reflector geometry;
- seam;
- roughness/minimum wall/cure blur.

Поэтому итоговая формулировка:

> Экспериментальная верификация выполнена на масштабном демонстраторе Ø240 мм при 5 ГГц. После сопоставления физического результата с Meep все линейные размеры масштабированы в 4.8 раза, и рассчитана электромагнитно подобная конструкция Ø50 мм при 24 ГГц. 24-GHz результат является расчётным prediction и отдельно учитывает material/manufacturing sensitivity.

Полный executable stand protocol: `experiment/BUILD_MANUAL.md`.
