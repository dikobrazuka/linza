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

Действия:

- [ ] Получить материал/срок отгрузки HARZ.
- [ ] Зафиксировать принтер, wash и post-cure process.
- [ ] Напечатать solid RF coupons.
- [ ] Измерить `epsilon_r` и `tan(delta)` около **5 GHz**.
- [ ] Не переносить 10-GHz значения в финальную модель без проверки.
- [ ] Сохранить raw measurement и обработанную таблицу в `data/materials/`.

## Приоритет №3 — gyroid calibration

Текущий nominal cell:

`a=7.5 mm`.

Comparison:

`5 / 7.5 / 10 mm`.

- [ ] Напечатать gyroid coupons `rho≈0.2/0.4/0.6/rho_center`.
- [ ] Для provisional HARZ `epsilon_solid=2.303` preliminary `rho_center≈0.806`.
- [ ] Измерить массу и фактическую volume fraction.
- [ ] Проверить min wall после wash/post-cure.
- [ ] Проверить trapped resin/channel closure.
- [ ] Измерить `epsilon_eff(rho)` около 5 ГГц.
- [ ] Выполнить M7 periodic unit-cell simulations.
- [ ] Проверить anisotropy X/Y/Z.
- [ ] Заменить Bruggeman в generator на measured interpolation.

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
3. Есть собственные 5-GHz solid-coupon data.
4. Есть measured `epsilon_eff(rho)` хотя бы для 4 gyroid densities.
5. M6/M7 согласуются достаточно для homogenized whole-lens workflow.
6. Reflector выбран по M9 sweep.
7. Напечатан TEST_LENS_5G_V1.
8. Получен экспериментальный `K_sigma(theta)`.
9. Meep воспроизводит физический тренд.
10. Есть prediction Ø80 @15 GHz и отдельный расчёт @24 GHz.
