# LINZA — аддитивная линза Люнеберга для БПЛА

Рабочий репозиторий команды «Градиент».

## Цель проекта

Разработать компактную пассивную GRIN/Luneburg-структуру для увеличения обратного радиолокационного рассеяния/ЭПР БПЛА и подтвердить расчёт физическим масштабным экспериментом.

## Каноническая схема проекта

### Физическая верификация

`TEST_LENS_5G_V1`:

- `f_test = 5.0 GHz`;
- `D_test = 240 mm`;
- `R_test = 120 mm`;
- доступный измерительный тракт работает до ~6 GHz;
- физический эксперимент выполняется около 5 GHz;
- основной manufacturing route: **photopolymer continuous radial sheet-gyroid / TPMS**;
- материал-кандидат: **HARZ Labs DE-10**;
- nominal gyroid period: `a_test = 7.5 mm`.

### Расчётная версия для защиты

Основная финальная точка:

- `f_final = 24.0 GHz`;
- все линейные размеры масштабируются коэффициентом `5/24 = 0.2083333`;
- `D_final = 240 * 5/24 = 50.0 mm`;
- `R_final = 25.0 mm`;
- `a_final = 7.5 * 5/24 = 1.5625 mm`.

Ограничение эксперта `<=80 mm / <=300 g` относится к **конечной конструкции**, а не к лабораторному 5-GHz демонстратору. Ø50 мм автоматически удовлетворяет ограничению по габариту.

Старая цепочка `Ø240 @5 GHz -> Ø80 @15 GHz` больше не является основной. 15 GHz можно использовать только как необязательную промежуточную расчётную точку.

Подробно: [`docs/10_SCALING_5_TO_24.md`](docs/10_SCALING_5_TO_24.md).

## Целевая физика

Идеальный профиль классической сферической линзы Люнеберга:

`epsilon_r(r)=2-(r/R)^2`.

Главная проектная метрика:

`K_sigma = sigma_test/sigma_baseline`.

Цель:

`K_sigma >= 10`, то есть `Delta_sigma_dB >= +10 dB`.

6/8/11-zone модели используются только как benchmark. Финальный target — **continuous GRIN**.

## Материал

Primary MVP candidate: **HARZ Labs DE-10**.

Данные производителя по 11 образцам на 10 GHz:

- mean `epsilon_r = 2.30318`;
- range `2.187...2.384`;
- mean `tan(delta)=0.0024227`;
- range `0.00184...0.00310`;
- 405 nm compatible.

Для физической 5-GHz модели собственное измерение материала около 5 GHz обязательно.

Предварительно при `epsilon_solid=2.30318` Bruggeman даёт для центра `epsilon_eff=2` около `rho_center=0.806`.

TiO2/SrTiO3 filling, PLA Aero/LW-PLA и другие FDM-варианты — **R&D / backup**, не критический путь первого MVP.

## Текущий экспериментальный маршрут

1. T1 — solid DE-10: `epsilon_r`, `tan(delta)` около 5 GHz.
2. T2 — cured density и shrinkage.
3. T3 — технологический диапазон sheet-gyroid и `h -> rho_actual`.
4. T4 — measured `epsilon_eff(rho,f)` для gyroid около 5 GHz.
5. M0-M9 — Meep: ideal -> loss -> benchmark -> manufacturable GRIN -> reflector.
6. Печать `TEST_LENS_5G_V1` Ø240 mm.
7. Физическое измерение около 5 GHz на доступном тракте до ~6 GHz.
8. Сопоставление experiment vs Meep.
9. Масштабирование всех линейных размеров `×5/24`.
10. Расчёт `FINAL_LENS_24G` Ø50 mm @24 GHz с отдельной sensitivity по материалу/дисперсии/технологичности.

## Meep

Фиксированная лестница:

`M0 background -> M1 numerical reference -> M2 homogeneous control -> M3 ideal continuous -> M4 loss sensitivity -> M5 zoned benchmark -> M6 homogenized manufacturable continuous -> M7 explicit unit cell/coupon -> M8 reduced explicit validation -> M9 final lens + reflector -> M10 scaled Ø50 @24 GHz`.

Главный input template:

`simulation/INPUTS_TEMPLATE.yaml`.

## Физический стенд

Основной тракт:

`VNA Port 1 -> TX antenna -> TARGET -> RX antenna -> VNA Port 2`.

Для `D=240 mm`, `f=5 GHz`:

`lambda0 ≈ 59.96 mm`;

`R_ff ≈ 2D^2/lambda ≈ 1.92 m`.

Рабочая стартовая дистанция: **2.5–3.0 m**.

Сохранять complex `S21/.s2p`, BACKGROUND, HOLDER, REFERENCE, BASELINE, LENS_NO_REFLECTOR, LENS+REFLECTOR.

## Основные документы

- [`PROJECT_MEMORY.md`](PROJECT_MEMORY.md) — текущее состояние;
- [`decisions/README.md`](decisions/README.md) — журнал решений;
- [`docs/04_NEXT_ACTIONS.md`](docs/04_NEXT_ACTIONS.md) — ближайшие действия;
- [`docs/07_CALCULATION_WORKFLOW.md`](docs/07_CALCULATION_WORKFLOW.md) — расчётный маршрут;
- [`docs/08_DE10_SPDR_T1_PROTOCOL.md`](docs/08_DE10_SPDR_T1_PROTOCOL.md) — T1;
- [`docs/09_DE10_GYROID_T2_T3_PROTOCOL.md`](docs/09_DE10_GYROID_T2_T3_PROTOCOL.md) — T2/T3;
- [`docs/10_SCALING_5_TO_24.md`](docs/10_SCALING_5_TO_24.md) — канонический scaling 5->24 GHz;
- [`simulation/CONTINUOUS_GYROID.md`](simulation/CONTINUOUS_GYROID.md) — continuous gyroid;
- [`experiment/README.md`](experiment/README.md) — физический эксперимент.

## Главное правило

**5 GHz = физическая верификация. 24 GHz = расчётная конечная версия для защиты. Не смешивать эти два уровня и не выдавать 24-GHz конструкцию за физически измеренную.**
