# LINZA — аддитивная линза Люнеберга для БПЛА

Рабочий репозиторий команды «Градиент».

## Цель проекта

Разработать пассивную GRIN/Luneburg-структуру для увеличения обратного радиолокационного рассеяния/ЭПР и подтвердить расчёт физическим масштабным экспериментом.

## Каноническая схема проекта

### Физическая верификация

`TEST_LENS_5G_V1`:

- `f_test = 5.0 GHz`;
- `D_test = 120 mm`;
- `R_test = 60 mm`;
- `lambda0 ≈ 59.96 mm`;
- `D/lambda0 ≈ 2.00`;
- доступный измерительный тракт работает до ~6 GHz;
- основной manufacturing route: **photopolymer continuous radial sheet-gyroid / TPMS**;
- материал: **HARZ Labs DE-10**;
- nominal gyroid period: `a_test = 7.5 mm`.

Ø240 mm больше не является рабочим физическим V1. Он остаётся только историческим/reference case для сравнения влияния электрического размера.

### Расчётная версия для защиты

После валидации Meep по 5-GHz эксперименту используется строгий frequency scaling:

`k = 5/24 = 0.2083333`.

Для `D_test=120 mm`:

- `f_final = 24.0 GHz`;
- `D_final = 25.0 mm`;
- `R_final = 12.5 mm`;
- `a_final = 1.5625 mm`.

Это **strict-scaled reference**. Для защиты 24-GHz результат является расчётным prediction; material dispersion и технологичность scaled geometry анализируются отдельно.

## Целевая физика

Идеальный профиль классической сферической линзы Люнеберга:

`epsilon_r(r)=2-(r/R)^2`.

Главная проектная метрика:

`K_sigma = sigma_test/sigma_baseline`.

Цель:

`K_sigma >= 10`, то есть `Delta_sigma_dB >= +10 dB`.

6/8/11-zone модели используются только как benchmark. Финальный target — **continuous GRIN**.

## Материал

Primary MVP: **HARZ Labs DE-10**.

Manufacturer data по 11 образцам @10 GHz:

- mean `epsilon_r = 2.30318`;
- range `2.187...2.384`;
- mean `tan(delta)=0.0024227`;
- range `0.00184...0.00310`;
- 405 nm compatible.

До финальной 5-GHz модели обязательны собственные T1/T4 measurements.

Preliminary Bruggeman при `epsilon_solid=2.30318`:

- `rho_center≈0.806`;
- volume-average `rho≈0.358` для ideal unclamped sphere.

Для `D=120 mm` envelope volume ≈`904.78 cm³`; provisional cured DE-10 mass ≈`356 g` без технологического clamp, ≈`366 g` при provisional `rho_min=0.12` и `rho_solid=1.1 g/cm³`.

Это предварительный material-balance; после T2/T3/T4 пересчитать measured values.

## Текущий маршрут

1. T1 — solid DE-10 `epsilon_r/tan(delta)` около 5 GHz.
2. T2 — cured density + shrinkage.
3. T3 — gyroid printability + `rho_actual`.
4. T4 — measured `epsilon_eff(rho,f)` около 5 GHz.
5. M0-M8 — численная валидация.
6. M9 — **Ø120 mm @5 GHz** lens + reflector.
7. Перед full print подтвердить, что Ø120 при `D≈2λ` всё ещё даёт достаточный focus/RCS gain.
8. Напечатать и измерить Ø120 physical V1.
9. Сопоставить experiment vs Meep.
10. M10 — strict scale `×5/24` → `Ø25 mm @24 GHz`.

## Физический стенд

`VNA Port 1 -> TX antenna -> TARGET -> RX antenna -> VNA Port 2`.

Для `D=120 mm`, `f=5 GHz`:

`R_ff ≈ 2D²/lambda ≈ 0.48 m`.

Стартовая рабочая дистанция: **1.0–1.5 m**, затем проверить sensitivity к distance/background.

Сохранять complex `S21/.s2p`, BACKGROUND, HOLDER, REFERENCE, BASELINE, LENS_NO_REFLECTOR, LENS+REFLECTOR.

## Основные документы

- `PROJECT_MEMORY.md` — source of truth;
- `decisions/README.md` — инженерные решения;
- `docs/04_NEXT_ACTIONS.md` — ближайшие действия;
- `docs/07_CALCULATION_WORKFLOW.md` — расчётный маршрут;
- `docs/08_DE10_SPDR_T1_PROTOCOL.md` — T1;
- `docs/09_DE10_GYROID_T2_T3_PROTOCOL.md` — T2/T3;
- `docs/10_SCALING_5_TO_24.md` — scaling;
- `simulation/CONTINUOUS_GYROID.md` — continuous gyroid;
- `experiment/README.md` — физический эксперимент.

## Главное правило

**5 GHz / Ø120 mm = физическая верификация. 24 GHz / Ø25 mm = strict-scaled расчётная reference-версия. Не выдавать 24-GHz результат за физически измеренный.**
