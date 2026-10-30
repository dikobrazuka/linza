# LINZA — аддитивная линза Люнеберга для БПЛА

Рабочий репозиторий команды «Градиент».

## Цель проекта

Разработать, изготовить и экспериментально проверить компактный пассивный радиолокационный отражатель на основе 3D-печатной линзы Люнеберга для БПЛА.

## Ограничения конечной конструкции

- максимальный габарит образца: **80 мм**;
- максимальная масса: **300 г**;
- рабочий диапазон проекта: **8–24 ГГц**;
- основной manufacturing route MVP: **photopolymer continuous sheet-gyroid / TPMS**;
- FDM / PLA Aero / LW-PLA: **R&D branch**, не критический путь MVP;
- моделирование: **Meep**;
- рабочая цель: прирост обратного рассеяния/ЭПР **не менее 10 раз**, то есть **+10 dB**, относительно явно выбранной baseline-конфигурации.

## Текущая экспериментальная стратегия

### TEST_LENS_5G_V1

- физическая частота: **5.0 ГГц**;
- диаметр: **240 мм**;
- радиус: **120 мм**;
- масштаб относительно конечной конструкции: **3:1**;
- электромагнитно подобный конечный вариант: **Ø80 мм @15 ГГц**;
- 24 ГГц — отдельная расчётная точка;
- 6/8/11 зон — benchmark;
- основной target — **continuous GRIN**;
- основной printable candidate — **continuous radial sheet-gyroid**;
- reflector architectures: `full sphere + metal cap` и `hemisphere + metal ground plane`.

## Текущий материал-кандидат

Сильнейший локальный MVP-кандидат сейчас — **HARZ Labs DE-10 / dielectric material**.

По данным производителя на 10 ГГц, 11 образцов:

- mean `epsilon_r ≈2.30318`;
- range `2.187...2.384`;
- mean `tan(delta)≈0.0024227`;
- range `0.00184...0.00310`;
- 405 нм поддерживается.

Это provisional material scenario. Для финального 5-ГГц прототипа нужна собственная characterization около 5 ГГц.

Arkema N3D-DIELEC731 остаётся reference/backup material. Rogers Radix 2.8Dk — импортный backup.

## Профиль линзы

Идеальный профиль:

`epsilon_r(r)=2-(r/R)^2`.

Для HARZ DE-10 с preliminary `epsilon_solid≈2.303` временная Bruggeman-оценка даёт для центра `epsilon_eff=2`:

`rho_center≈0.806`.

Финальная связь `rho -> epsilon_eff` должна быть получена из measured coupons или explicit unit-cell retrieval.

## Расчётный порядок

Не выбирать модель вручную. Идти по фиксированной лестнице из `docs/07_CALCULATION_WORKFLOW.md`:

`M0 background -> M1 numerical reference -> M2 homogeneous control -> M3 ideal continuous -> M4 loss sensitivity -> M5 zoned benchmark -> M6 homogenized manufacturable continuous -> M7 explicit unit cell -> M8 reduced explicit validation -> M9 final lens + reflector -> M10 scaled final geometry`.

Главный input template:

`simulation/INPUTS_TEMPLATE.yaml`.

Multi-scale правило:

- micro: explicit unit-cell / coupon;
- macro: whole-lens homogenized measured GRIN;
- полный explicit Ø240-mm gyroid не нужен первым расчётом.

## Физический эксперимент

Основной тракт:

`NanoVNA Port 1 -> TX antenna -> TARGET -> RX antenna -> NanoVNA Port 2`.

Рабочая стартовая дистанция для Ø240 мм @5 ГГц:

**2.5–3 м**.

Сохранять complex `S21(f)` и выполнять background subtraction.

Главная метрика:

`K_sigma = sigma_test/sigma_baseline`.

Цель:

`K_sigma>=10`, то есть `Delta_sigma_dB>=+10 dB`.

## Структура репозитория

Начинать отсюда:

- [`PROJECT_MEMORY.md`](PROJECT_MEMORY.md) — актуальное состояние;
- [`docs/07_CALCULATION_WORKFLOW.md`](docs/07_CALCULATION_WORKFLOW.md) — **главный пошаговый расчётный маршрут**;
- [`simulation/INPUTS_TEMPLATE.yaml`](simulation/INPUTS_TEMPLATE.yaml) — canonical inputs для каждого run;
- [`simulation/README.md`](simulation/README.md) — актуальная Meep-структура;
- [`simulation/CALCULATIONS.md`](simulation/CALCULATIONS.md) — базовые числа TEST_LENS_5G_V1;
- [`simulation/CONTINUOUS_GYROID.md`](simulation/CONTINUOUS_GYROID.md) — математика continuous gyroid;
- [`simulation/GYROID_CELL_SWEEP.md`](simulation/GYROID_CELL_SWEEP.md) — 5/7.5/10-mm sweep;
- [`materials/LOCAL_RU_RESINS.md`](materials/LOCAL_RU_RESINS.md) — локальные смолы;
- [`materials/RESIN_CANDIDATES.md`](materials/RESIN_CANDIDATES.md) — RF resin shortlist;
- [`materials/HARZ_TIO2_COMPOSITE.md`](materials/HARZ_TIO2_COMPOSITE.md) — filler R&D branch;
- [`docs/06_DESIGN_SPACE_AND_REASONING.md`](docs/06_DESIGN_SPACE_AND_REASONING.md) — дерево инженерных веток;
- [`docs/04_NEXT_ACTIONS.md`](docs/04_NEXT_ACTIONS.md) — ближайшие действия;
- [`experiment/README.md`](experiment/README.md) — эксперимент;
- [`decisions/README.md`](decisions/README.md) — журнал решений.

## Основной цикл

**material coupon -> measured dielectric law -> unit-cell validation -> whole-lens homogenized Meep -> reflector sweep -> print V1 -> NanoVNA experiment -> validate @5 GHz -> scale Ø80 @15 GHz -> separate 24-GHz calculation**
