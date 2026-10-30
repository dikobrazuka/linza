# Ближайшие действия — TEST_LENS_5G_V1

## Приоритет №1 — закрыть расчётную лестницу M0-M6

Главный маршрут: `docs/07_CALCULATION_WORKFLOW.md`.

- [ ] M0 — empty/background.
- [ ] M1 — numerical scattering reference + near-to-far validation.
- [ ] M2 — homogeneous sphere control.
- [ ] M3 — ideal continuous Luneburg Ø240 мм @5.0 ГГц, lossless.
- [ ] M4 — loss sensitivity.
- [ ] M5 — 11-zone benchmark; один раз сравнить 6/8-zone.
- [ ] M6 — homogenized manufacturable continuous GRIN.
- [ ] Закрыть resolution convergence.
- [ ] Для каждого run использовать копию `simulation/INPUTS_TEMPLATE.yaml`.

## Приоритет №2 — HARZ DE-10 как текущий MVP material candidate

Получены данные производителя на 10 ГГц по 11 образцам:

- mean `epsilon_r≈2.30318`;
- sample SD `≈0.06218`;
- range `2.187...2.384`;
- mean `tan(delta)≈0.0024227`;
- sample SD `≈0.0003436`;
- range `0.00184...0.00310`;
- 405 nm compatible.

Текущий статус закупки:

- пользователь готов приобрести `1.0 kg` DE-10 из имеющегося остатка;
- поставщик сообщил фасовку `0.5 kg`, цену `7000 RUB / 0.5 kg`, доступность до `1.5 kg`, срок годности текущей партии до `12.01.2027`;
- ожидается подтверждение оформления/оплаты/отправки.

### T1 — solid DE-10 @≈5 GHz

Исполняемый протокол:

`docs/08_DE10_SPDR_T1_PROTOCOL.md`

Зафиксировано:

- 4 пластины: `DE10-S01...S04`;
- размер каждой: `80.00 × 80.00 × 1.50 mm`;
- S01–S03 — основные, S04 — запасной;
- одна партия смолы, один принтер, один профиль, одинаковые wash/post-cure;
- после post-cure выдержка не менее 24 h;
- контроль толщины в 9 точках микрометром 0.001 mm;
- pre-screen: `1.40 < t_mean < 1.60 mm`, `delta_t <= 0.03 mm`, без трещин/пузырей/выраженного коробления;
- SPDR 5/5.1 GHz;
- 3 независимых физических образца × 3 установки = минимум 9 измерений;
- сохранить `epsilon_r`, `tan_delta`, resonance frequency, Q, temperature, actual thickness;
- raw и processed данные хранить в `data/materials/de10/`;
- `epsilon_r <= 2.00` → NO-GO для текущей resin+air Luneburg;
- `2.00 < epsilon_r < 2.15` → плохой технологический запас;
- `epsilon_r >= 2.15` → GO к gyroid calibration;
- `tan(delta)` оценивать через M4 loss-sensitivity, без произвольного hard threshold.

Действия:

- [ ] Получить DE-10 / оформить покупку 1 kg.
- [ ] Найти доступ к SPDR 5/5.1 GHz и подтвердить совместимость образца 80×80×1.50 mm с конкретным fixture.
- [ ] Зафиксировать `PROFILE_DE10_V1`.
- [ ] Напечатать S01–S04 по `docs/08_DE10_SPDR_T1_PROTOCOL.md`.
- [ ] Выполнить wash/post-cure по одному зафиксированному процессу.
- [ ] Выдержать образцы минимум 24 h.
- [ ] Измерить толщину/плоскостность/массу.
- [ ] Выполнить минимум 9 SPDR measurements.
- [ ] Получить собственные `epsilon_r` и `tan(delta)` около 5 GHz.
- [ ] Не переносить 10-GHz значения производителя в финальную модель без проверки.
- [ ] Сохранить raw measurement и обработанную таблицу в `data/materials/de10/`.

## Приоритет №3 — T2/T3: density, shrinkage и технологический диапазон gyroid

Исполняемый протокол:

`docs/09_DE10_GYROID_T2_T3_PROTOCOL.md`

Генератор uniform coupons:

`tools/uniform_sheet_gyroid_coupon.py`

### T2 — solid density / shrinkage

- [ ] Напечатать 5 solid coupons `20.00 × 20.00 × 10.00 mm`.
- [ ] После wash измерить X/Y/Z и массу.
- [ ] После post-cure + 24 h повторно измерить X/Y/Z и массу.
- [ ] Рассчитать `rho_solid_geom` по фактическому cured volume.
- [ ] Рассчитать shrinkage X/Y/Z.
- [ ] Требовать `CV(rho_solid_geom) <= 1.5%`; иначе повторить T2 до использования density в mass-based gyroid calibration.
- [ ] Если доступна лабораторная гидростатика, дополнительно получить ISO 1183-1 Method A / ASTM D792 reference density.

### T3 — uniform sheet-gyroid printability

Текущий nominal period:

`a = 7.5 mm`.

Базовый coupon:

`30.00 × 30.00 × 15.00 mm = 4 × 4 × 2 gyroid periods`.

Базовая серия:

- `rho=0.10`, `h≈0.155137`;
- `rho=0.15`, `h≈0.233275`;
- `rho=0.20`, `h≈0.310328`;
- `rho=0.30`, `h≈0.462674`;
- `rho=0.40`, `h≈0.619249`;
- `rho=0.50`, `h≈0.766812`;
- `rho=0.65`, `h≈0.987636`;
- `rho=0.81`, `h≈1.211042`;
- `rho=0.90`, `h≈1.329630`.

Действия:

- [ ] Сгенерировать 9 STL через `tools/uniform_sheet_gyroid_coupon.py`.
- [ ] До печати требовать `watertight=True` и `|rho_mesh_error| <= 2%`.
- [ ] Для low-density `rho=0.10/0.15` при необходимости уменьшить voxel до `0.05 mm`.
- [ ] Напечатать все 9 coupons одним профилем/ориентацией/process.
- [ ] Выполнить один wash protocol и фиксировать `mass_after_wash_0h` / `mass_after_wash_24h`.
- [ ] После post-cure + 24 h измерить массу и bounding X/Y/Z.
- [ ] Рассчитать `rho_actual_mass = mass / (rho_solid * V_env)` с `V_env=13.5 cm³`.
- [ ] Сравнивать прежде всего с `rho_mesh`, а не только с аналитическим `rho_target`.
- [ ] PASS calibration point: complete print + washable + mechanically intact + no massive sheet fusion + `|rho_actual-rho_mesh|/rho_mesh <= 5%`.
- [ ] Определить экспериментальные `rho_min_print` и `rho_max_print` только по PASS samples.
- [ ] Если граница PASS/FAIL между двумя точками — делать midpoint/bisection до `Δrho <= 0.025` либо до отсутствия практического смысла дальнейшего уточнения.
- [ ] Сохранить `h -> rho_mesh -> rho_actual` в `data/materials/de10/T3_GYROID_RESULT.csv`.

### RF calibration после T3

- [ ] Не печатать RF-waveguide coupons заранее.
- [ ] Сначала зафиксировать конкретный fixture/waveguide и его фактический internal aperture.
- [ ] После этого сделать отдельный T4 protocol для `epsilon_eff(rho,f)` по complex S-parameters.
- [ ] Выполнить M7 periodic unit-cell simulations.
- [ ] Проверить anisotropy X/Y/Z на выбранных density points.
- [ ] Заменить Bruggeman в continuous generator на measured interpolation.

Comparison period `5 / 7.5 / 10 mm` оставить как отдельный M7/RF sensitivity sweep после подтверждения технологической работоспособности nominal `a=7.5 mm`; не размножать physical coupons по трём периодам до необходимости.

## Приоритет №4 — reflector и whole-lens

После M6/M7:

- [ ] M9: full sphere + PEC cap.
- [ ] Cap sweep `15/30/45/60/90°`.
- [ ] Выбрать минимальный cap после насыщения прироста.
- [ ] Сравнить с hemisphere + ground plane.
- [ ] Снять `RCS(theta)` минимум до ±60°.
- [ ] Проверить seam sensitivity для двух полусфер.
- [ ] Проверить material-loss sensitivity.
- [ ] Требовать запас относительно +10 dB до печати полного V1.

## Приоритет №5 — изготовление V1

Основной manufacturing route уже выбран:

**photopolymer continuous radial sheet-gyroid / TPMS**.

- [ ] Сгенерировать финальную geometry с measured `epsilon_eff(rho)`.
- [ ] Разделить на две открытые полусферы.
- [ ] Добавить alignment features без существенного RF-возмущения.
- [ ] Напечатать технологический сегмент.
- [ ] Проверить washing/post-cure.
- [ ] Проверить размеры, массу, shrinkage, wall thickness.
- [ ] Напечатать полный TEST_LENS_5G_V1.
- [ ] Сделать выбранный металлический reflector.

## NanoVNA-стенд

- [ ] Подтвердить устойчивую работу NanoVNA-F V3 около 5 ГГц.
- [ ] Найти 2 одинаковые направленные антенны.
- [ ] Найти 2 одинаковых RF-кабеля.
- [ ] Жёсткая база TX/RX.
- [ ] Диэлектрическая стойка мишени.
- [ ] Поворотная платформа минимум ±60°.
- [ ] Дистанция: начать 2.5–3.0 м.
- [ ] 2-port calibration.
- [ ] BACKGROUND.
- [ ] HOLDER.
- [ ] REFERENCE target.
- [ ] BASELINE.
- [ ] LENS без reflector.
- [ ] LENS + reflector.
- [ ] Сохранять complex S21/.s2p.
- [ ] Повтор ключевых измерений минимум 3 раза.

## Масштабирование после валидации

- [ ] Сопоставить Meep Ø240 @5 GHz с физическим experiment.
- [ ] Масштабировать geometry 1:3.
- [ ] Рассчитать Ø80 @15 GHz.
- [ ] Отдельно рассчитать Ø80 @24 GHz.
- [ ] Учесть dispersion `epsilon/tan(delta)`.
- [ ] Не утверждать физическую проверку 15/24 GHz, если измерялся только 5-GHz prototype.

## R&D ветки, которые НЕ должны тормозить MVP

### PLA Aero / LW-PLA

- [ ] Сохранить как R&D branch.
- [ ] Позже: `T/flow/speed -> foam density -> epsilon`.
- [ ] Custom G-code только после первого photopolymer MVP.

### TiO2 / SrTiO3 filled resin

- [ ] Сохранять как material-development branch.
- [ ] Не легировать текущий HARZ DE-10, если neat material уже даёт `epsilon>2` и низкий loss, пока не появится конкретная причина.
- [ ] Возвращаться к filler branch, если нужно больше `epsilon_solid`, ниже loss, лучшая printability или контролируемая custom formulation.

## Минимальный результат текущей итерации

1. M0-M5 закрыты и воспроизводимы.
2. HARZ DE-10 получен или есть точный срок.
3. T1 закрыт: есть собственные 5-GHz solid-coupon data минимум по 3 физическим образцам.
4. T2 закрыт: есть measured cured-solid density и shrinkage.
5. T3 закрыт: определены `rho_min_print`, `rho_max_print`, `h -> rho_mesh -> rho_actual`.
6. Есть measured `epsilon_eff(rho)` минимум для выбранных RF calibration points.
7. M6/M7 согласуются достаточно для homogenized whole-lens workflow.
8. Reflector выбран по M9 sweep.
9. Напечатан TEST_LENS_5G_V1.
10. Получен экспериментальный `K_sigma(theta)` и Meep воспроизводит физический тренд.
11. Есть prediction Ø80 @15 GHz и отдельный расчёт @24 GHz.
