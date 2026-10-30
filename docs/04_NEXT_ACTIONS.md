# Ближайшие действия — упрощённый MVP

Дата: 2026-10-31

Основной принцип: **не превращать проект в отдельную научную программу**. Практика должна доказать работоспособность идеи минимальным числом шагов. Расширенные sweep/uncertainty/aniso/topology исследования оставить как optional appendix.

## Канон проекта

Физическая проверка:

- `f = 5.0 GHz`;
- `D = 120 mm`;
- `R = 60 mm`;
- `a = 7.5 mm`;
- measurement setup до ~6 GHz.

Расчётная версия после валидации:

- `f = 24 GHz`;
- scale `5/24`;
- при Ø120: `D = 25 mm`, `R = 12.5 mm`, `a = 1.5625 mm`.

## Приоритет №1 — материал

### T1 — solid DE-10

Сделать **3 пластины** примерно `80×80×1.5 mm` или размера, который реально требует лабораторная оснастка.

Получить около 5 ГГц:

- `epsilon_solid`;
- `tan_delta`.

Если три образца дают согласованный результат — расширенную серию не делать.

### T2 — cured density

Сделать **3 образца `20×20×10 mm`**.

После полного post-cure:

- измерить X/Y/Z;
- взвесить;
- получить cured density.

## Приоритет №2 — gyroid-калибровка

Базовый coupon:

- `30×30×15 mm`;
- `a=7.5 mm`.

Пять плотностей:

- `0.15`;
- `0.30`;
- `0.50`;
- `0.65`;
- `0.80`.

Для каждой:

- [ ] напечатать;
- [ ] промыть;
- [ ] post-cure;
- [ ] проверить отсутствие trapped resin;
- [ ] взвесить;
- [ ] вычислить фактическую volume fraction;
- [ ] измерить `epsilon_eff` около 5 ГГц.

Основной output:

`rho_actual -> epsilon_eff`.

Если крайняя плотность не печатается — рабочий диапазон просто ограничить ближайшей успешной точкой.

Не делать 9 плотностей, finite-length campaign, anisotropy matrix и физические дубликаты, если основной результат достаточно чистый.

## Приоритет №3 — расчёт Ø120

Идеальный профиль:

`epsilon(r)=2-(r/R)^2`.

По экспериментальной таблице построить:

`epsilon_target(r) -> rho(r) -> h(r)`.

Сгенерировать continuous sheet-gyroid Ø120.

### Обязательные расчёты

Всего три:

1. **Ideal Ø120** — поле + фокус + backscatter.
2. **Manufacturable Ø120** — measured `rho->epsilon`, реальные limits по плотности.
3. **Reflector sweep только 30/60/90°** — baseline reflector-only и lens+same reflector.

Если Ø120 уже показывает нормальный результат — mandatory diameter sweep 120/150/180/240 не делать.

Расширенный diameter gate оставить только как fallback, если Ø120 не даёт требуемого эффекта.

## Приоритет №4 — изготовление

Перед full print:

- [ ] проверить массу;
- [ ] проверить build volume;
- [ ] проверить минимальную стенку;
- [ ] убедиться, что каналы моются.

Затем:

- [ ] напечатать две открытые полусферы;
- [ ] wash;
- [ ] post-cure;
- [ ] взвесить;
- [ ] измерить итоговый D;
- [ ] собрать;
- [ ] поставить выбранный reflector.

Отдельный technological segment не обязателен, если gyroid calibration coupons уже содержат сопоставимые минимальные стенки и успешно промываются.

## Приоритет №5 — эксперимент 5 ГГц

Стенд:

`VNA Port 1 -> TX -> target -> RX -> VNA Port 2`.

Для Ø120 стартовая distance:

`1.0–1.5 m`.

Минимальный набор состояний:

1. `BACKGROUND`;
2. `REFERENCE` — металлическая sphere;
3. `BASELINE` — reflector only;
4. `TEST` — lens + reflector.

Для `BASELINE` и `TEST`:

- **3 независимых установки**;
- сохранять complex `.s2p`.

Главный результат:

`Delta_sigma_dB = 20 log10(|S21_test/S21_baseline|)`

после одинаковой complex background subtraction.

Цель:

`Delta_sigma_dB >= +10 dB`.

Angular sweep:

- сначала качественная центральная точка `0°`;
- потом, если времени хватает, `-30...+30°`, step `5°`.

## Приоритет №6 — 24 ГГц для защиты

После сопоставления 5-ГГц experiment vs model:

- [ ] масштабировать все линейные размеры ×`5/24`;
- [ ] при Ø120 получить Ø25 мм;
- [ ] рассчитать 24-ГГц модель;
- [ ] показать sensitivity к `epsilon/tan_delta`;
- [ ] проверить минимальную scaled wall;
- [ ] не выдавать 24-ГГц результат за физически измеренный.

## Теория для оформления

Основной файл:

`docs/16_THEORY_FOR_REPORT.md`.

В нём уже собраны:

- ЭПР/RCS;
- линза Люнеберга;
- профиль `epsilon(r)`;
- фазовая скорость и образование фокуса;
- роль reflector;
- effective medium;
- sheet-gyroid/TPMS;
- DE-10;
- dielectric loss;
- FDTD/Meep;
- scaling 5 ->24 GHz;
- ограничения метода;
- причинно-следственная цепочка для защиты.

## Optional / только если понадобится

Не входит в обязательный MVP:

- diameter sweep `120/150/180/240`;
- full reflector sweep `15/30/45/60/90`;
- extensive uncertainty budget;
- anisotropy campaign;
- topology comparison;
- 9-density calibration;
- full 24-GHz experiment;
- отдельный сложный автоматический report generator.

Инструменты можно оставить в репе как запас.

## Критический путь

`3 solid RF plates`

→ `3 density samples`

→ `5 gyroid RF coupons`

→ `rho_actual -> epsilon_eff`

→ `Ø120 continuous gyroid model`

→ `30/60/90° reflector comparison`

→ `print Ø120`

→ `BACKGROUND / REFERENCE / BASELINE / TEST @5 GHz`

→ `Delta_sigma_dB`

→ `scale ×5/24`

→ `24-GHz calculated result`.
