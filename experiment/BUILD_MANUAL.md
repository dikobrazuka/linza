# BUILD MANUAL — физический стенд TEST_LENS_5G_V1 @5 GHz

Цель: воспроизводимо измерить относительное обратное рассеяние масштабного демонстратора `D=240 mm` около `5.0 GHz` на доступном VNA/measurement setup до ~6 GHz.

24-GHz конструкция здесь НЕ измеряется. Она рассчитывается после валидации 5-GHz модели.

## 0. Схема

`VNA Port 1 -> TX antenna -> TARGET -> RX antenna -> VNA Port 2`

Основной режим — статический quasi-monostatic / bi-static with small TX-RX separation.

Сохранять **complex S21**.

## 1. Что должно быть до сборки

Обязательно:

1. 2-port VNA/measurement setup, устойчиво работающий около `5 GHz`, верхняя частота порядка `6 GHz`;
2. 2 одинаковые направленные антенны около 5 GHz;
3. 2 RF-кабеля;
4. calibration kit под используемые разъёмы;
5. adapters;
6. экспорт complex data / `.s2p`.

Желательно:

- максимально широкий usable sweep вокруг 5 GHz;
- averaging;
- time-domain export/gating или возможность сделать IFFT offline.

## 2. Геометрия мишени

Физический demonstrator:

- `D = 240 mm`;
- `R = 120 mm`.

Для `f=5 GHz`:

`lambda0 ≈59.96 mm`.

Far-field estimate:

`R_ff = 2D²/lambda ≈1.92 m`.

Стартовая дистанция:

`2.5–3.0 m` от phase-center/antenna reference до центра target.

## 3. Стойка target

Требования:

- преимущественно диэлектрическая;
- минимальная площадь материала около линзы;
- выдерживает линзу Ø240 mm + reflector;
- repeatable mounting;
- центр rotation совпадает с центром линзы.

Рекомендуемая архитектура:

- стеклопластиковая/PVC стойка;
- тяжёлое основание вне основной scattering zone;
- печатный adapter;
- removable target interface.

## 4. Поворотный узел

Минимум:

- range `-60°...+60°` желательно;
- минимум обязательного sweep `-30°...+30°`;
- scale step `5°`;
- люфт минимальный;
- ось rotation через центр target.

## 5. TX/RX base

Обе антенны закрепить на одной жёсткой базе.

Требования:

- одинаковая polarization;
- обе направлены в один target center;
- геометрия не меняется между runs;
- separation TX/RX минимально возможный без физического перекрытия apertures;
- separation записать в metadata.

Не фиксировать старое значение `100–150 mm`: использовать минимальный реально возможный разнос конкретных антенн и измерить его.

## 6. Подготовка RF-тракта

1. Прогреть VNA/стенд согласно инструкции прибора; если отдельного требования нет — минимум 30 min.
2. Подключить cable 1 -> Port 1.
3. Подключить cable 2 -> Port 2.
4. Выполнить 2-port calibration на calibration planes, максимально близких к входам антенн.
5. Подключить TX/RX antennas.
6. Зафиксировать кабели.
7. После calibration не перемещать/перегибать кабели без необходимости.
8. Записать model/serial/firmware/software/calibration type.

## 7. Юстировка

1. Отметить target center.
2. Выставить target center на `2.5–3.0 m`.
3. Выставить антенны и target center на одной высоте.
4. Направить TX на center.
5. Направить RX на center.
6. Проверить одинаковую polarization.
7. Убрать людей/металл из основной диаграммы.
8. Зафиксировать антенны/стойки на полу метками.
9. Поставить крупную металлическую test plate/reference и убедиться, что complex S21 заметно отличается от BACKGROUND.

Если reference target неотличим от background — линзу не измерять; сначала исправить stand/dynamic range/geometry.

## 8. Sweep

Не придумывать полосу за пределами реального прибора/антенн.

Обязательное условие:

- `5.0 GHz` внутри usable band.

Использовать максимально широкую общую полосу setup around 5 GHz, чтобы улучшить time resolution.

Если прибор позволяет, стартовая установка:

- points: максимально разумное число, предпочтительно `>=1001`;
- source power: фиксированная для всей серии;
- IFBW: минимально разумная без чрезмерного времени;
- averaging: фиксированное, предпочтительно `>=8`, если доступно;
- measurement: complex `S21`.

Все фактические settings записать. Не выдавать примерные settings за обязательные возможности NanoVNA.

## 9. Конфигурации

Не менять антенны/кабели/стойки между configurations.

### 9.1 BACKGROUND

Target отсутствует.

Save:

`YYYYMMDD_BACKGROUND_000_R01.s2p`.

### 9.2 HOLDER

Только target holder.

Save:

`..._HOLDER_000_R01.s2p`.

### 9.3 REFERENCE

Known/repeatable metallic reference target.

Это контроль работоспособности/при необходимости абсолютной calibration, не project baseline.

Save:

`..._REFERENCE_000_R01.s2p`.

### 9.4 BASELINE

Конфигурация, относительно которой формально оценивается `K_sigma`.

Baseline определить ДО серии и не менять задним числом.

Save:

`..._BASELINE_000_R01.s2p`.

### 9.5 LENS_NO_REFLECTOR

Ø240-mm dielectric/GRIN lens without metallic reflector.

Save:

`..._LENS_NO_REFLECTOR_000_R01.s2p`.

### 9.6 LENS_REFLECTOR

Ø240-mm lens + selected reflector.

Save:

`..._LENS_REFLECTOR_000_R01.s2p`.

## 10. Повторяемость

Для ключевых configurations минимум 3 повторных установки:

- BASELINE;
- LENS_NO_REFLECTOR;
- LENS_REFLECTOR;
- REFERENCE желательно также 3.

Между repeats:

1. снять target;
2. поставить заново;
3. не менять антенны/кабели;
4. записать новый raw file.

## 11. Background subtraction

Работать с complex values:

`H_target(f) = S21_target(f) - S21_background(f)`.

Нельзя делать:

`S21_target_dB - S21_background_dB`

как замену complex subtraction.

## 12. Time-domain gating

Применять только если usable sweep даёт достаточное range resolution.

Pipeline:

1. complex frequency data;
2. window if required;
3. IFFT;
4. identify target echo by delay/range;
5. gate target response;
6. FFT back;
7. apply same gate logic to baseline/test/reference.

Если bandwidth недостаточна — явно указать это как limitation, а не рисовать искусственно узкий gate.

## 13. Relative gain

После одинаковой обработки:

`H_B = corrected BASELINE`;

`H_T = corrected LENS_REFLECTOR`.

Relative metric:

`K_sigma = |H_T|² / |H_B|²`.

In dB:

`Delta_sigma_dB = 20*log10(|H_T|/|H_B|)`.

Target:

`K_sigma >=10` <=> `Delta_sigma_dB >= +10 dB`.

Абсолютную `sigma` в `m²` вычислять только при корректной RCS calibration/reference methodology.

## 14. Frequency result

Не отчёт только в одной точке.

Сохранять:

`K_sigma(f)` и `Delta_sigma_dB(f)` на usable sweep around 5 GHz.

Главная report point:

`5.000 GHz` или фактическая заранее зафиксированная центральная частота setup.

## 15. Angular sweep

Минимальный mandatory sweep:

`-30°...+30°`, step `5°`.

Это 13 angles.

Для выбранной финальной geometry желательно:

`-60°...+60°`, step `5°`.

На каждом angle:

1. rotate target only;
2. не перемещать stand;
3. save separate `.s2p`;
4. calculate same processed metric.

## 16. Фокусировочный тест без reflector

Перед окончательным RCS conclusion желательно отдельно подтвердить, что сама линза фокусирует.

Использовать `LENS_NO_REFLECTOR` и field/probe scan при доступной методике.

Цель:

- locate focus near opposite surface;
- compare with Meep M3/M6;
- отделить ошибку lens from reflector error.

Если setup не позволяет near-field scan, это отмечается как optional test, а не обязательное условие RCS measurement.

## 17. Что фотографировать

Обязательно:

1. VNA/setup model;
2. antennas;
3. calibration kit;
4. full stand;
5. measured distance `2.5–3.0 m`;
6. TX/RX separation;
7. target support;
8. BACKGROUND condition;
9. REFERENCE;
10. BASELINE;
11. LENS_NO_REFLECTOR;
12. LENS_REFLECTOR;
13. angle scale;
14. lens dimensions/mass;
15. reflector geometry.

## 18. Gate готовности стенда

До установки final lens должны выполняться:

- stable BACKGROUND;
- known HOLDER contribution;
- REFERENCE clearly differs from BACKGROUND;
- repeatability after target re-installation acceptable;
- 5 GHz inside usable band;
- complex raw data export works;
- target distance/geometry recorded;
- cable positions stable.

## 19. Что НЕ является текущей схемой

Не использовать как текущий primary stand:

- 24.125-GHz physical setup;
- WR-42 horns;
- Ø80-mm physical lens test;
- 2.0-m geometry рассчитанную для старого 24-GHz объекта;
- HB100/RCWL/CDM324/Arduino Doppler scheme.

## 20. Связь с 24 GHz

После 5-GHz experiment:

1. validate Meep M9 vs physical data;
2. freeze validated geometry;
3. scale all linear dimensions `×5/24`;
4. get `D=50 mm`, `R=25 mm`, nominal `a=1.5625 mm`;
5. run M10 @24 GHz;
6. report 24-GHz result as **calculated prediction**, not physical measurement.

See `docs/10_SCALING_5_TO_24.md`.
