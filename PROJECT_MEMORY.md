# PROJECT MEMORY — LINZA

Актуальное состояние проекта. Обновлять после каждого существенного изменения направления, даже если решение ещё не финальное.

**Срез:** 2026-10-30

## 1. Что мы делаем

Цель — компактная пассивная GRIN/Luneburg-структура для увеличения обратного радиолокационного рассеяния/ЭПР БПЛА.

Конечные ограничения проекта:

- габарит: `<= 80 mm`;
- масса: `<= 300 g`;
- рабочий диапазон конечной конструкции: `8–24 GHz`;
- рабочая цель: `K_sigma >= 10`, то есть `Delta sigma >= +10 dB` относительно явно выбранного baseline;
- основной полно-волновой расчёт: Meep.

Доступный NanoVNA ограничивает прямой физический эксперимент, поэтому основной scaling-pair:

- физический прототип: `D=240 mm @ 5.0 GHz`;
- электромагнитно подобная конечная геометрия: `D=80 mm @ 15 GHz`;
- `24 GHz` остаётся отдельной расчётной точкой.

## 2. Физическая идея

Идеальный профиль линзы Люнеберга:

`epsilon_r(r) = 2 - (r/R)^2`.

Ключевой переход проекта:

`epsilon_target(r) -> effective material -> manufacturable geometry -> measured RCS`.

Нельзя считать `infill % == epsilon_eff`. Нужна связь между локальной геометрией/долей материала и эффективной диэлектрической проницаемостью.

## 3. Главный производственный приоритет на MVP

**Основной путь: photopolymer + continuous radial sheet-gyroid / TPMS.**

PLA Aero / LW-PLA остаётся более сложной R&D-веткой и не должна задерживать первый измеряемый прототип.

Основная геометрия:

`epsilon_target(r) -> rho(r) -> h(r) -> sheet-gyroid implicit geometry`.

Стартовый период TPMS:

`a = 7.5 mm`, с обязательным сравнением `5 / 7.5 / 10 mm`.

## 4. Текущий материал-кандидат MVP

Новый сильный локальный кандидат — **HARZ Labs DE-10 / отдельный dielectric material**.

Получены реальные данные производителя по 11 образцам на `10 GHz`:

- mean `epsilon_r = 2.30318`;
- sample SD `≈0.06218`;
- range `2.187...2.384`;
- mean `tan(delta)=0.0024227`;
- sample SD `≈0.0003436`;
- range `0.00184...0.00310`.

Производитель подтвердил работу на `405 nm`.

Статус отгрузки уточняется.

Это очень хороший кандидат для MVP, потому что:

- `epsilon_solid >2`, поэтому классический центр Luneburg достижим одной смолой + воздухом;
- потери @10 GHz низкие;
- материал локально доступнее Arkema/Rogers;
- для `epsilon_solid≈2.303` Bruggeman даёт preliminary `rho_center≈0.806` для `epsilon_eff=2`, то есть центр может оставаться open-cell.

Ограничение: значения измерены на `10 GHz`. Для финальной физической модели на 5 GHz требуется собственная characterization около 5 GHz.

Arkema N3D-DIELEC731 остаётся сильным reference/backup. Rogers Radix 2.8Dk — второй импортный backup.

## 5. Ветки изготовления

### A. Photopolymer continuous sheet-gyroid / TPMS

Статус: **PRIMARY / MVP critical path**.

Главные задачи:

- получить HARZ DE-10;
- напечатать solid dielectric coupons;
- измерить `epsilon_solid` и `tan(delta)` около 5 GHz;
- напечатать gyroid coupons на нескольких `rho`;
- получить measured `epsilon_eff(rho)`;
- обновить generator;
- напечатать две открытые полусферы;
- собрать и испытать.

### B. PLA Aero / LW-PLA thermal-gradient GRIN

Статус: **R&D / second priority**.

Физически интересен, но требует process-development:

- `T/flow/speed -> foam density`;
- `foam density -> epsilon/tan(delta)`;
- hotend dynamics;
- custom Python G-code;
- возможно hybrid microfoaming + macro-porosity.

### C. Continuous FDM / OrcaSlicer

Статус: experimental reserve.

### D. Zoned 6/8/11

Статус: benchmark / fallback.

### E. Non-planar spherical FDM

Статус: deferred research.

### F. Volumetric photopolymerization

Статус: future research.

## 6. Расчётный workflow теперь зафиксирован

Главный файл:

`docs/07_CALCULATION_WORKFLOW.md`.

Правило: не выбирать модель вручную. Считать следующую незакрытую модель по лестнице:

`M0 background -> M1 numerical reference -> M2 homogeneous control -> M3 ideal continuous -> M4 loss sensitivity -> M5 zoned benchmark -> M6 homogenized manufacturable continuous -> M7 explicit unit cell -> M8 reduced explicit validation -> M9 final lens + reflector -> M10 scaled final geometry`.

Главный input template:

`simulation/INPUTS_TEMPLATE.yaml`.

Multi-scale принцип:

- explicit microgeometry считать на unit-cell/coupon уровне;
- whole-lens reflector/RCS считать на homogenized measured `epsilon_realized(r)`;
- полный explicit Ø240-mm gyroid не является первым обязательным расчётом.

## 7. Что пока НЕ доказано

- что HARZ DE-10 сохраняет те же `epsilon/tan(delta)` около 5 GHz;
- что Bruggeman достаточно точен для gyroid;
- что `a=7.5 mm` оптимален;
- что TPMS достаточно изотропен;
- что технологический `rho_min/rho_max` совпадает с текущими provisional значениями;
- что +10 dB достигается после учёта реальных потерь, шва и reflector;
- что scaling 5 ->15/24 GHz не ломается дисперсией материала.

## 8. Ближайший MVP-цикл

1. Получить HARZ DE-10.
2. Напечатать solid coupons с фиксированным post-cure.
3. Измерить `epsilon_r/tan(delta)` около 5 GHz.
4. Параллельно закрыть M0-M5 в Meep.
5. Напечатать gyroid calibration coupons `rho≈0.2/0.4/0.6/rho_center`.
6. Получить measured `epsilon_eff(rho)`.
7. Закрыть M6-M8.
8. Сделать reflector sweep M9.
9. Напечатать TEST_LENS_5G_V1.
10. NanoVNA experiment.
11. Сопоставить experiment vs Meep.
12. Масштабировать Ø80 @15 GHz.
13. Отдельно рассчитать Ø80 @24 GHz.

## 9. Правило фиксации хода мысли

Сохранять не только финальные решения, но и альтернативы, причины отказа, условия возврата и данные, которые могут изменить решение.
