# LINZA — аддитивная линза Люнеберга для БПЛА

Рабочий репозиторий команды «Градиент».

## Цель проекта

Разработать пассивную GRIN/Luneburg-структуру для увеличения обратного радиолокационного рассеяния/ЭПР и подтвердить расчёт физическим масштабным экспериментом.

## Каноническая схема проекта

**Уточнение 02.11.2026 (D-027): заказная линза имеет целевой диаметр 80 мм; рабочая частота проекта — 24 ГГц. Размеры и частоту опытов выбирает команда.**

[Наглядное объяснение: линза, анимация, стенд и методика](site/explain.html).

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

Ø120 — текущий preferred physical V1, но до full print он обязан пройти `simulation/DIAMETER_GATE.md` против 150/180/240 mm.

### Расчётная версия для защиты

После валидации Meep по 5-GHz эксперименту выполняется **отдельный расчёт заказной Ø80 мм / 24 ГГц**, включая дисперсию, потери, период ячейки и отражатель.

Вспомогательная проверка строгого подобия использует strict frequency scaling:

`k = 5/24 = 0.2083333`.

Для `D_test=120 mm`:

- `f_final = 24.0 GHz`;
- `D_scaled = 25.0 mm`;
- `R_scaled = 12.5 mm`;
- `a_scaled = 1.5625 mm`.

Значения выше относятся к strict-scaled reference Ø25 мм, не к заказной Ø80 мм. Для строгого аналога Ø80 мм / 24 ГГц на 5 ГГц потребовался бы Ø384 мм; такой опыт не обязателен. 24-GHz результат — расчётный prediction; material dispersion и технологичность анализируются отдельно.

## Целевая физика

Идеальный профиль:

`epsilon_r(r)=2-(r/R)^2`.

Главная проектная метрика:

`K_sigma = sigma_test/sigma_baseline`.

Цель:

`K_sigma >= 10`, то есть `Delta_sigma_dB >= +10 dB`.

6/8/11-zone модели — benchmark. Финальный target — **continuous GRIN**.

## Материал

**Защитный корпус (D-028):** FusRock PLA-Aero Pro, две полусферы FDM; пользовательский старт 245–250 °C, flow 0.30, две стенки около 1.2 мм. Эта толщина и RF-свойства требуют T5 проверки. DE-10 остаётся материалом внутреннего гироида, его поры заполняет воздух. В Ø80 мм входит оболочка; при 1.2 мм внутренний Ø77.6 мм без зазора. `epsilon=1.4` — пример сценария, не измерение.

Primary MVP: **HARZ Labs DE-10**.

Manufacturer data по 11 образцам @10 GHz:

- mean `epsilon_r = 2.30318`;
- range `2.187...2.384`;
- mean `tan(delta)=0.0024227`;
- range `0.00184...0.00310`;
- 405 nm compatible.

До финальной 5-GHz модели обязательны T1/T4 measurements.

Preliminary Bruggeman при `epsilon_solid=2.30318`:

- `rho_center≈0.806`;
- volume-average `rho≈0.358` для ideal unclamped sphere.

Для `D=120 mm`:

- envelope `≈904.78 cm³`;
- provisional cured DE-10 mass `≈356.5 g`;
- при provisional `rho_min=0.12`: `≈366.4 g`.

После T2/T3/T4 пересчитывать через:

```bash
python tools/material_budget.py
```

## Текущий маршрут

1. T1 — solid DE-10 `epsilon_r/tan(delta)` около 5 GHz.
2. T2 — cured density + shrinkage.
3. T3 — gyroid printability + `rho_actual`.
4. T4 — measured `epsilon_eff(rho,f)` около 5 GHz.
4a. T5 — PLA-Aero Pro: контроль печати/толщины/плотности, RF-образцы после согласования оснастки и сравнение сборки с корпусом/без него.
5. M0-M8 — numerical validation.
6. Diameter gate 120/150/180/240.
7. M9 — выбранный 5-GHz diameter + reflector.
8. Material-budget gate.
9. Technological segment.
10. Full physical print + 5-GHz experiment.
11. Model-vs-experiment validation.
12. M10 — заказная Ø80 мм / 24 ГГц; strict scale `×5/24` — вспомогательная модель подобия.

## Физический стенд

`VNA Port 1 -> TX antenna -> TARGET -> RX antenna -> VNA Port 2`.

Для `D=120 mm`, `f=5 GHz`:

`R_ff≈0.48 m`.

Стартовая рабочая distance: **1.0–1.5 m**, затем проверить sensitivity к distance/background/direct coupling.

Сохранять complex `S21/.s2p`, BACKGROUND, HOLDER, REFERENCE, BASELINE, LENS_NO_REFLECTOR, LENS+REFLECTOR.

## Основные документы

- `PROJECT_MEMORY.md` — source of truth;
- `decisions/README.md` — инженерные решения;
- `docs/04_NEXT_ACTIONS.md` — ближайшие действия;
- `docs/07_CALCULATION_WORKFLOW.md` — расчётный маршрут;
- `docs/08_DE10_SPDR_T1_PROTOCOL.md` — T1;
- `docs/09_DE10_GYROID_T2_T3_PROTOCOL.md` — T2/T3;
- `docs/12_T4_RF_GYROID_PROTOCOL.md` — полный T4;
- `docs/13_RCS_S21_PROCESSING.md` — VNA S21 -> relative/absolute RCS processing;
- `docs/18_PLA_AERO_SHELL_T5_PROTOCOL.md` — корпус PLA-Aero Pro, реальные тесты и sensitivity оболочки;
- `docs/10_SCALING_5_TO_24.md` — scaling;
- `simulation/DIAMETER_GATE.md` — diameter selection gate;
- `simulation/configs/DIAMETER_GATE_5G.yaml` — machine-readable diameter gate;
- `simulation/CONTINUOUS_GYROID.md` — continuous gyroid;
- `experiment/README.md` — физический experiment;
- `data/materials/de10/` — T1-T4 raw/processed workspace.

## Tools

- `tools/continuous_luneburg_gyroid.py` — final radial gyroid generator;
- `tools/uniform_sheet_gyroid_coupon.py` — T3 uniform coupons;
- `tools/material_budget.py` — resin mass/material gate;
- `tools/process_rcs_s21.py` — complex background subtraction, optional time gate, relative/absolute RCS;
- `simulation/analyze_diameter_gate.py` — convergence + smallest acceptable ideal-size candidate.

## Meep / diameter gate

Meep ставится отдельно в его рабочее окружение. Обычный CI его не устанавливает.

Один ideal continuous run:

```bash
python simulation/run_ideal_luneburg_rcs.py \
  --diameter-mm 120 \
  --frequency-ghz 5 \
  --pixels-per-lambda 16
```

Полный DG-A sweep:

```bash
python simulation/run_diameter_gate.py \
  --diameters 120 150 180 240 \
  --ppl 12 16 20
```

Сначала посмотреть команды без запуска:

```bash
python simulation/run_diameter_gate.py --dry-run
```

После sweep:

```bash
python simulation/analyze_diameter_gate.py
```

Runner использует официальный Meep scattered-field workflow:

`empty normalization -> incident near2far -> load_minus_near2far_data -> far field -> RCS`.

DG-A — только **ideal lossless Luneburg**. Он не заменяет M9 и не доказывает проектный `+10 dB` относительно formal baseline.

## Physical RCS processing

Relative result from Touchstone files:

```bash
python tools/process_rcs_s21.py \
  --background BACKGROUND.s2p \
  --baseline BASELINE.s2p \
  --test LENS_REFLECTOR.s2p \
  --gate-center-ns <MEASURED> \
  --gate-width-ns <MEASURED> \
  --out RCS_RELATIVE.csv
```

Rules:

- background subtraction only in complex form;
- no dB/magnitude subtraction;
- same frequency grid required;
- `K_sigma=|S_test/S_baseline|^2`;
- `Delta_sigma_dB=20log10|S_test/S_baseline|`;
- absolute dBsm only with valid `REFERENCE_RCS.csv`.

Do not substitute `pi*r^2` as an exact sphere calibration value unless the optical-limit approximation has been justified for that sphere/frequency.

## Quality gates

Regression tests:

```bash
pytest -q
```

CI:

`.github/workflows/python-tests.yml`.

Tests cover:

- measured calibration endpoints;
- full Luneburg epsilon range mapping;
- gyroid coupon box clipping/watertight mesh;
- material budget reference values;
- canonical project dimensions across code/docs;
- ideal Luneburg profile math;
- Touchstone S21 ordering;
- complex background subtraction;
- relative/absolute RCS equations;
- diameter-gate convergence rejection.

## Главное правило

**Заказная линза: Ø80 мм / 24 ГГц. 5 GHz / Ø120 mm — текущий экспериментальный кандидат. 24 GHz / Ø25 mm — только strict-scaled reference этого кандидата. Не выдавать прогноз Ø80 мм или другой 24-GHz result за физически измеренный.**
