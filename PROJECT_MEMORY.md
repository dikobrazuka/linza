# PROJECT MEMORY — LINZA

Актуальное состояние проекта. Этот файл — главный краткий источник истины. При конфликте со старыми документами приоритет у более нового решения в `decisions/README.md` и у этого файла.

**Срез:** 2026-10-30

## 1. Цель

Компактная пассивная GRIN/Luneburg-структура для увеличения обратного радиолокационного рассеяния/ЭПР БПЛА.

Конечные требования эксперта:

- габарит конечной конструкции `<=80 mm`;
- масса конечной конструкции `<=300 g`;
- расчётная рабочая точка для защиты: **24 GHz**;
- рабочая цель: `K_sigma >=10`, то есть `Delta_sigma >= +10 dB` относительно явно выбранного baseline;
- основной full-wave инструмент: **Meep**.

## 2. Канонический multi-scale маршрут

Доступный измерительный тракт работает примерно до 6 GHz. Поэтому физическая проверка выполняется на 5 GHz.

### Физический демонстратор

`TEST_LENS_5G_V1`:

- `f_test=5.0 GHz`;
- `D_test=240 mm`;
- `R_test=120 mm`;
- `lambda0≈59.96 mm`;
- `D/lambda0≈4.00`;
- nominal gyroid period `a_test=7.5 mm`.

### Расчётная конечная версия для защиты

Геометрически подобная точка:

- `f_final=24.0 GHz`;
- linear scale `k=5/24=0.2083333`;
- `D_final=50.0 mm`;
- `R_final=25.0 mm`;
- `a_final=1.5625 mm`;
- все остальные линейные размеры: `L_24=L_5*(5/24)`.

Старая основная пара `Ø240 @5 GHz <-> Ø80 @15 GHz` **отменена**. 15 GHz допускается только как необязательная промежуточная research-point.

## 3. Физическая идея

Идеальный профиль классической линзы Люнеберга:

`epsilon_r(r)=2-(r/R)^2`.

Ключевой переход:

`epsilon_target(r) -> rho(r) -> h(r) -> sheet-gyroid geometry -> measured electromagnetic response`.

Нельзя считать `infill % == epsilon_eff`.

## 4. Основной manufacturing route

**PRIMARY / MVP critical path:** photopolymer + continuous radial sheet-gyroid / TPMS.

Основная структура:

- постоянный период `a`;
- непрерывный threshold `h(r)`;
- две открытые полусферы как основной manufacturing concept для washing/post-cure;
- финальная связь `rho -> epsilon_eff` должна быть измерена.

FDM / PLA Aero / LW-PLA / Orca / non-planar FDM — R&D branches, не должны тормозить MVP.

## 5. Материал

Primary MVP candidate: **HARZ Labs DE-10**.

Данные производителя по 11 образцам @10 GHz:

- mean `epsilon_r=2.30318`;
- sample SD `≈0.06218`;
- range `2.187...2.384`;
- mean `tan(delta)=0.0024227`;
- sample SD `≈0.0003436`;
- range `0.00184...0.00310`;
- 405 nm compatible.

Статус закупки:

- доступно до `1.5 kg` текущей партии;
- фасовка `0.5 kg`;
- цена `7000 RUB / 0.5 kg`;
- срок годности текущей партии до `12.01.2027`;
- план закупки: `1.0 kg`.

Ограничение: 10-GHz данные нельзя автоматически переносить на 5 или 24 GHz.

Для физической модели обязательны собственные 5-GHz measurements.

Для 24-GHz расчёта при отсутствии собственных данных использовать sensitivity/dispersion scenarios и явно маркировать результат как prediction.

Preliminary Bruggeman для `epsilon_solid=2.30318` даёт `rho_center≈0.806` для `epsilon_eff=2`.

## 6. Испытания материала и структуры

### T1 — solid DE-10

`docs/08_DE10_SPDR_T1_PROTOCOL.md`

- 4 plates `80×80×1.50 mm`;
- 3 main + 1 spare;
- SPDR around 5/5.1 GHz;
- минимум 9 independent placements/measurements;
- outputs: measured `epsilon_r`, `tan_delta`.

### T2 — cured density / shrinkage

`docs/09_DE10_GYROID_T2_T3_PROTOCOL.md`

- 5 solid coupons `20×20×10 mm`;
- measured cured density;
- shrinkage X/Y/Z.

### T3 — gyroid printability / actual volume fraction

- nominal `a=7.5 mm`;
- coupons `30×30×15 mm = 4×4×2 periods`;
- densities: `0.10/0.15/0.20/0.30/0.40/0.50/0.65/0.81/0.90`;
- determine `rho_min_print`, `rho_max_print`;
- measure `h -> rho_mesh -> rho_actual`.

### T4 — RF calibration of gyroid

После T3:

- measure `epsilon_eff(rho,f)` around 5 GHz;
- preserve complex S-parameters where method permits;
- validate anisotropy/repeatability;
- replace Bruggeman with measured interpolation.

## 7. Расчётный workflow

Главный файл: `docs/07_CALCULATION_WORKFLOW.md`.

Лестница:

`M0 background -> M1 numerical reference -> M2 homogeneous control -> M3 ideal continuous -> M4 loss sensitivity -> M5 zoned benchmark -> M6 homogenized manufacturable GRIN -> M7 explicit unit cell/coupon -> M8 reduced explicit validation -> M9 5-GHz final lens + reflector -> M10 scaled Ø50 @24 GHz`.

Multi-scale rule:

- explicit microgeometry — unit-cell/coupon scale;
- whole-lens reflector/RCS — homogenized measured `epsilon_realized(r)`;
- полный explicit Ø240-mm gyroid не обязателен для MVP.

## 8. Эксперимент

Физический эксперимент:

- frequency around `5.0 GHz`;
- available VNA/measurement setup to ~6 GHz;
- two-port TX/RX geometry;
- `D=240 mm`;
- far-field estimate `R_ff≈1.92 m`;
- start distance `2.5–3.0 m`;
- save complex `S21/.s2p`;
- record BACKGROUND / HOLDER / REFERENCE / BASELINE / LENS_NO_REFLECTOR / LENS+REFLECTOR;
- repeat key measurements minimum 3 times.

Main metric:

`K_sigma = sigma_test / sigma_baseline`.

Target:

`K_sigma>=10` or `Delta_sigma_dB>=+10 dB`.

## 9. Что не доказано

- DE-10 `epsilon/tan(delta)` at 5 GHz;
- DE-10 dispersion toward 24 GHz;
- exact measured `epsilon_eff(rho)` of our gyroid;
- optimal `a=7.5 mm`;
- gyroid isotropy;
- final technological `rho_min/rho_max`;
- reflector optimum;
- final +10 dB after losses/seam/manufacturing;
- physical manufacturability of the strictly scaled `a=1.5625 mm` 24-GHz version.

## 10. Current critical path

1. Obtain DE-10.
2. Lock `PROFILE_DE10_V1`.
3. Close T1.
4. Close T2/T3.
5. Close M0-M5 in parallel.
6. Run T4 and get measured `epsilon_eff(rho)`.
7. Close M6-M8.
8. Optimize reflector M9.
9. Print `TEST_LENS_5G_V1`.
10. Physical 5-GHz experiment.
11. Match Meep to experiment.
12. Scale all linear dimensions by `5/24`.
13. Run final Ø50 @24 GHz Meep prediction/sensitivity.
14. Prepare protection package: measured 5-GHz evidence + validated model + 24-GHz scaled calculation + explicit limitations.

## 11. Governance rule

После любого изменения ключевой частоты, масштаба, материала или manufacturing route:

1. добавить superseding decision в `decisions/README.md`;
2. обновить `PROJECT_MEMORY.md`;
3. обновить `README.md`;
4. найти старые значения по всей репе;
5. только после consistency-pass считать репу актуализированной.
