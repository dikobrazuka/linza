# T2/T3 — DE-10: плотность, усадка и технологический диапазон sheet-gyroid

Дата: 2026-10-30

Статус: готово к исполнению после T1 или параллельно с ним после фиксации `PROFILE_DE10_V1`.

Цель:

1. Получить фактическую плотность полностью отверждённого DE-10 и усадку после wash/post-cure.
2. Проверить, какие локальные volume fraction реально печатаются, промываются и сохраняют геометрию для sheet-gyroid с периодом `a=7.5 mm`.
3. Получить соответствие `rho_target -> h -> rho_actual` до RF-измерений `epsilon_eff(rho)`.

---

## T2. Сплошной DE-10: плотность и усадка

### T2.1. Образцы

Изготовить 5 одинаковых solid-coupons:

- `DENS-S01`;
- `DENS-S02`;
- `DENS-S03`;
- `DENS-S04`;
- `DENS-S05`.

CAD-геометрия каждого:

- `20.00 × 20.00 × 10.00 mm`;
- сплошное тело;
- без фасок;
- без отверстий;
- без надписей на измеряемых поверхностях.

CAD envelope volume:

`V_CAD = 4000.00 mm³ = 4.00000 cm³`.

Печатать одним `PROFILE_DE10_V1`, одной ориентацией и одинаковым post-process.

### T2.2. До wash

После снятия с платформы удалить supports одинаковым способом, если supports использовались. Не шлифовать измеряемые поверхности.

Для каждого образца записать:

- `sample_id`;
- `print_orientation`;
- `layer_height`;
- `exposure`;
- `support/contact strategy`.

### T2.3. После wash, до post-cure

После полного высыхания измерить X/Y/Z в 3 положениях по каждой оси.

Записать:

- `X_wash_mean`;
- `Y_wash_mean`;
- `Z_wash_mean`;
- `mass_wash_g`.

Весы: `0.001 g` или лучше.

### T2.4. После post-cure

Выдержать одинаковый post-cure для всех 5 образцов.

Через 24 h измерить повторно:

- X: 3 измерения;
- Y: 3 измерения;
- Z: 3 измерения;
- mass: 3 повторных взвешивания без перестановки тары/режима весов.

Результаты:

`X_cured_mean`, `Y_cured_mean`, `Z_cured_mean`, `mass_cured_g`.

### T2.5. Усадка

По каждой оси:

`shrink_X_percent = 100 * (X_cured_mean - 20.00) / 20.00`

`shrink_Y_percent = 100 * (Y_cured_mean - 20.00) / 20.00`

`shrink_Z_percent = 100 * (Z_cured_mean - 10.00) / 10.00`

Также считать изменение именно от washed-state:

`postcure_delta_X = 100 * (X_cured_mean - X_wash_mean) / X_wash_mean`

и аналогично Y/Z.

### T2.6. Плотность cured solid

Основной проектный метод: геометрическая плотность по фактическим размерам.

`V_cured_cm3 = X_cured_mean * Y_cured_mean * Z_cured_mean / 1000`

`rho_solid_geom = mass_cured_g / V_cured_cm3`.

Дополнительно, если доступна лабораторная гидростатика/плотномер, измерить density по ISO 1183-1 Method A / ASTM D792 и сохранить как более качественный reference. Не смешивать две методики в одной колонке.

Итог:

- mean `rho_solid_geom` по 5 образцам;
- SD;
- CV;
- mean shrink X/Y/Z;
- SD shrink X/Y/Z.

Проектный критерий повторяемости:

- `CV(rho_solid_geom) <= 1.5%` — PASS;
- `CV > 1.5%` — проверить post-cure, размеры, пузыри/voids и повторить T2 до использования массы для rho_actual.

Файл:

`data/materials/de10/DE10_T2_SOLID_DENSITY_SHRINKAGE.csv`

---

## T3. Uniform sheet-gyroid: технологический диапазон

### T3.1. Базовая геометрия

Период:

`a = 7.5 mm`.

Coupon envelope:

`30.00 × 30.00 × 15.00 mm`.

Это специально выбрано как целое число периодов:

- X: `30 / 7.5 = 4` периода;
- Y: `30 / 7.5 = 4` периода;
- Z: `15 / 7.5 = 2` периода.

Таким образом сравнение массы и volume fraction не загрязняется разным обрезанием неполных unit cells.

Sheet-gyroid:

`G = sin(kx)cos(ky) + sin(ky)cos(kz) + sin(kz)cos(kx)`

`k = 2*pi/a`

материал существует при

`|G| <= h`.

### T3.2. Серия образцов

Изготовить 9 uniform-density coupons:

| ID | rho_target | h по текущей H(h)=rho калибровке |
|---|---:|---:|
| `GYR-100` | 0.10 | 0.155137 |
| `GYR-150` | 0.15 | 0.233275 |
| `GYR-200` | 0.20 | 0.310328 |
| `GYR-300` | 0.30 | 0.462674 |
| `GYR-400` | 0.40 | 0.619249 |
| `GYR-500` | 0.50 | 0.766812 |
| `GYR-650` | 0.65 | 0.987636 |
| `GYR-810` | 0.81 | 1.211042 |
| `GYR-900` | 0.90 | 1.329630 |

`rho=0.81` включена специально как приблизительная центральная density для provisional DE-10 `epsilon_solid≈2.30`.

Значения `h` вычислены тем же численным методом, что используется в `tools/continuous_luneburg_gyroid.py`: sampling `96³`, threshold grid `0...1.6` step `0.001` и interpolation `rho -> h`.

### T3.3. Генерация STL

Использовать:

`tools/uniform_sheet_gyroid_coupon.py`.

Команда для всей базовой серии:

```bash
python tools/uniform_sheet_gyroid_coupon.py \
  --size-x 30 \
  --size-y 30 \
  --size-z 15 \
  --cell 7.5 \
  --rho 0.10 0.15 0.20 0.30 0.40 0.50 0.65 0.81 0.90 \
  --voxel 0.075 \
  --out-dir artifacts/T3_gyroid_coupons
```

Для `rho=0.10` и `rho=0.15`, если сетка `0.075 mm` даёт грубую/рваную mesh или rho_mesh error >2%, регенерировать только эти два STL с:

`--voxel 0.05`.

Генератор обязан создать:

- 9 STL;
- `GYROID_T3_COUPONS.csv`;
- для каждого STL записать `rho_target`, `h`, mesh volume, `rho_mesh`, error, watertight.

До печати проверить:

- `watertight = True`;
- `abs(rho_mesh_error_percent) <= 2%`.

Если нет — STL не печатать; уменьшить voxel и пересчитать.

### T3.4. Ориентация и печать

Все 9 coupons печатать:

- один принтер;
- одна бутылка/партия DE-10;
- `PROFILE_DE10_V1`;
- одинаковая ориентация;
- одинаковый support strategy;
- одинаковая мойка;
- одинаковый post-cure.

Ориентация координат geometry должна быть сохранена. Обозначить print-Z в карте серии.

Не печатать ID/текст внутри RF/gyroid geometry. ID вести по позиции на платформе и индивидуальным контейнерам после снятия.

### T3.5. Первичная оценка расхода смолы

Envelope volume одного coupon:

`30 × 30 × 15 = 13,500 mm³ = 13.5 cm³`.

Идеальный polymer volume:

`V_polymer = rho_target * 13.5 cm³`.

При `rho_solid≈1.1 g/cm³` ориентировочная масса 9 coupons суммарно:

`~60 g`.

Фактический расчёт выполнить после T2 по measured `rho_solid` и mesh volume из `GYROID_T3_COUPONS.csv`.

### T3.6. Контроль сразу после печати

Для каждого coupon зафиксировать:

- полностью ли сформирована структура;
- есть ли оторванные sheet-участки;
- есть ли слипшиеся соседние поверхности;
- видимая остаточная жидкая смола;
- локальные закрытые каналы;
- трещины/деформации после снятия.

Фотографии минимум:

- top;
- bottom;
- side X;
- side Y.

### T3.7. Wash protocol

Главная цель — проверить, реально ли open gyroid промывается на каждой density.

Для всех samples использовать один wash protocol.

Минимум записать:

- wash liquid;
- concentration;
- bath temperature;
- ultrasonic/agitation yes/no;
- wash #1 duration;
- wash #2 duration;
- drying duration;
- orientation during wash.

После wash:

1. дать жидкости стечь одинаковое время;
2. высушить до отсутствия видимой жидкости;
3. взвесить `mass_after_wash_0h`;
4. оставить на 24 h при одинаковых условиях;
5. взвесить `mass_after_wash_24h`.

Расчёт:

`wash_mass_change_percent = 100 * (m_24h - m_0h) / m_0h`.

Если масса заметно продолжает падать после визуально завершённой мойки, образец не считать полностью очищенным.

### T3.8. Post-cure и масса

После wash/dry выполнить один post-cure protocol.

После post-cure выдержать 24 h.

Взвесить каждый coupon 3 раза и записать `mass_cured_g`.

### T3.9. Фактическая volume fraction по массе

Использовать measured `rho_solid` из T2.

Envelope volume:

`V_env = 13.5 cm³`.

Расчёт:

`rho_actual_mass = mass_cured_g / (rho_solid * 13.5)`.

Ошибка относительно CAD target:

`rho_error_percent = 100 * (rho_actual_mass - rho_target) / rho_target`.

Также сравнить с `rho_mesh`, а не только с аналитическим `rho_target`:

`rho_mesh_error_real_percent = 100 * (rho_actual_mass - rho_mesh) / rho_mesh`.

Основной критерий геометрической реализации:

- `abs(rho_actual_mass - rho_mesh) / rho_mesh <= 5%` → PASS;
- `5...10%` → CONDITIONAL: проверить trapped resin/overcure и повторяемость;
- `>10%` → FAIL для calibration point.

### T3.10. Размер envelope после cure

Измерить фактический bounding size X/Y/Z каждого coupon минимум в 3 местах.

Считать:

`shrink_X`, `shrink_Y`, `shrink_Z` относительно 30/30/15 mm.

Проверить, согласуется ли усадка с T2 solid coupons.

### T3.11. PASS/FAIL по печатаемости

Для каждой density выставить один статус:

`PASS`, `FAIL_LOW_DENSITY`, `FAIL_HIGH_DENSITY`, `FAIL_WASH`, `FAIL_GEOMETRY`, `REPEAT`.

PASS требует одновременно:

1. complete print;
2. после wash нет видимой trapped resin;
3. структура не разрушается при обычном обращении;
4. нет массового слипания соседних sheets;
5. `abs(rho_actual_mass - rho_mesh)/rho_mesh <= 5%`;
6. размеры могут быть измерены и воспроизводимы.

Не задавать заранее `rho_min_print=0.12` или `rho_max_print=0.90`. После T3 они определяются только экспериментально.

Результат:

`rho_min_print = минимальная PASS density`.

`rho_max_print = максимальная PASS density`.

### T3.12. Дополнительный boundary refinement

Если граница PASS/FAIL находится между двумя tested density, напечатать midpoint.

Примеры:

- `0.10 FAIL`, `0.15 PASS` → дополнительный `rho=0.125`;
- `0.81 PASS`, `0.90 FAIL` → дополнительный `rho=0.855`.

Повторять bisection до диапазона неопределённости не более `Δrho=0.025` либо пока технологический смысл дальнейшего уточнения отсутствует.

### T3.13. Что сохранить

STL/geometry:

`artifacts/T3_gyroid_coupons/`.

Raw data:

`data/materials/de10/T3_GYROID_RAW.csv`.

Processed:

`data/materials/de10/T3_GYROID_RESULT.csv`.

Минимальные колонки processed:

```text
sample_id
rho_target
gyroid_h
rho_mesh
mesh_volume_mm3
mass_cured_g
rho_solid_g_cm3
rho_actual_mass
rho_error_vs_mesh_percent
X_cured_mm
Y_cured_mm
Z_cured_mm
wash_mass_change_percent
trapped_resin
sheet_fusion
mechanical_integrity
status
```

Итог T3:

- `rho_min_print`;
- `rho_max_print`;
- таблица `h -> rho_mesh -> rho_actual`;
- список density points, которые разрешено использовать для следующего RF-теста `epsilon_eff(rho)`.

---

## Следующий этап после T3

Не печатать RF-waveguide coupons заранее.

Сначала зафиксировать конкретный measurement fixture / waveguide у лаборатории и его фактический внутренний aperture. Затем сгенерировать RF-coupons строго под эту оснастку, сохранив gyroid phase и целое число периодов там, где это возможно.

T4 будет отдельным протоколом: `epsilon_eff(rho,f)` по complex S-parameters.
