# T4 — RF-калибровка sheet-gyroid: `rho -> epsilon_eff(rho,f)` около 5 ГГц

Дата: 2026-10-31

Статус: **не печатать RF-coupons до заполнения T4-0 по реальной оснастке**.

Цель: получить собственную экспериментальную связь

`rho_actual -> epsilon_eff(f), tan_delta_eff(f)`

для той же DE-10 sheet-gyroid geometry, которая используется в линзе.

После T4 measured law становится primary input для M6/M7 и `tools/continuous_luneburg_gyroid.py`. Bruggeman остаётся только reference/comparison.

---

# T4-0. Сначала зафиксировать реальную измерительную оснастку

До CAD/STL заполнить файл:

`data/materials/de10/T4_FIXTURE_CARD.md`

Шаблон:

```text
method: WAVEGUIDE / FREE_SPACE / OTHER
VNA_model:
VNA_frequency_range:
fixture_model:
usable_frequency_range:
calibration_method:
reference_planes:
deembedding:
extraction_algorithm:
fixture_internal_width_mm:
fixture_internal_height_mm:
sample_holder_depth_mm:
max_sample_length_mm:
required_sample_clearance_mm:
TX_RX_or_port_geometry:
software_name_version:
raw_export_format:
operator_notes:
```

Обязательно получить **фактические**, а не номинально угаданные размеры holder/aperture.

Если метод transmission-line / waveguide:

- sample должен соответствовать реальному поперечному сечению holder;
- отдельно зафиксировать, как исключается/оценивается air gap;
- reference planes должны быть известны;
- сохранить complex `S11/S21/S12/S22`, если setup это позволяет.

Если free-space:

- зафиксировать размер illuminated spot;
- расстояния antennas/sample;
- calibration/reference plate procedure;
- time-gating/windowing;
- sample lateral size выбирать по реальному beam footprint, а не по WR-187 dimensions.

**Размер T4 coupon до заполнения T4-0 не фиксирован.**

---

# T4-1. Preconditions

До T4 должны существовать:

## T1

- measured `epsilon_solid_5GHz`;
- measured `tan_delta_solid_5GHz`;
- locked `PROFILE_DE10_V1`;
- locked wash/post-cure.

## T2

- cured solid density `rho_solid_g_cm3`;
- shrinkage X/Y/Z.

## T3

- `rho_min_print`;
- `rho_max_print`;
- mapping `rho_target -> h -> rho_mesh -> rho_actual`;
- confirmed washability;
- orientation record.

Если T1-T3 ещё provisional, T4 run маркировать `PROVISIONAL`, не использовать как final manufacturing calibration.

---

# T4-2. Выбор density points

После T3 выбрать **минимум 5 PASS-плотностей**, распределённых по всему реально печатаемому диапазону.

Обязательно включить:

1. low density — ближайшую практическую точку к `rho_min_print`;
2. low-mid;
3. mid;
4. high-mid;
5. high/center-region — ближайшую PASS-точку к density, требуемой для `epsilon_eff≈2`.

До measured T4 central reference по provisional DE-10:

`rho_center≈0.806`.

Не заставлять серию содержать `rho=0.81`, если T3 показал, что такая структура не воспроизводится.

Пример только при PASS всего диапазона:

`0.20 / 0.35 / 0.50 / 0.65 / 0.81`.

Фактическая серия должна быть записана в:

`data/materials/de10/T4_SERIES.csv`.

Колонки:

```text
sample_id,rho_target,h,rho_mesh,rho_actual,orientation,fixture_length_mm,status
```

---

# T4-3. Pilot по толщине / числу периодов

Нельзя автоматически считать старое предположение `L=15 mm = 2a` оптимальным.

На одной representative mid-density точке выполнить pilot по propagation length, если fixture позволяет:

- `L=2a = 15.0 mm`;
- `L=3a = 22.5 mm`;
- опционально `L=4a = 30.0 mm`.

Поперечные размеры — строго по T4-0 fixture.

Цели pilot:

- проверить finite-cell/boundary sensitivity;
- проверить phase ambiguity / resonant artifacts выбранного extraction method;
- определить минимальную длину, при которой extracted `epsilon_eff` стабилизируется;
- убедиться, что insertion loss остаётся в dynamic range стенда.

Для каждой длины минимум 3 independent insertions.

Выбор рабочей длины T4:

- extracted `epsilon_eff` не меняется более чем на проектные `2%` между двумя соседними допустимыми длинами;
- нет очевидного branch jump extraction;
- repeatability достаточна;
- сигнал остаётся измеримым.

`2%` здесь — **project gate**, не стандартный универсальный предел.

Если fixture не позволяет length sweep, ограничение явно записать и оценить finite-size effect через M7.

---

# T4-4. Генерация RF-coupons

После T4-0/T4-3 для каждой выбранной density:

1. взять measured/validated `h` из T3;
2. использовать `a=7.5 mm`;
3. сохранить gyroid orientation относительно propagation direction;
4. поперечные размеры брать из T4-0;
5. propagation length брать из T4-3;
6. не добавлять текст/ID внутрь RF aperture;
7. ID вести через упаковку, карту позиции и external tab только если tab полностью вне RF aperture.

Для каждого STL до печати сохранить:

- exact bounding box;
- mesh volume;
- `rho_mesh`;
- watertight status;
- generator commit SHA.

---

# T4-5. Количество физических образцов

Минимальная серия:

- 5 density points × 1 physical coupon;
- key mid-density duplicate ×1;
- key high/center-region duplicate ×1.

Итого минимум:

`7 physical RF coupons`.

Для каждого физического coupon:

`3 independent removals/reinsertions`.

Минимум measurement states при 7 coupons:

`21 insertions` + empty/reference checks.

Если повторяемость плохая — добавить physical duplicates, а не только повторно мерить один и тот же coupon.

---

# T4-6. Manufacturing control каждого RF-coupon

После cure и conditioning записать:

- mass `0.001 g`;
- exact dimensions;
- actual propagation length;
- T2-based `rho_actual_mass`;
- shrinkage;
- orientation;
- visible trapped resin;
- sheet fusion;
- damage;
- фото всех сторон.

Coupon не использовать как calibration point, если он FAIL по T3-критериям или имеет trapped resin / повреждённую geometry.

---

# T4-7. Измерительная последовательность

Перед серией:

1. warm-up instrument/setup;
2. выполнить calibration согласно T4-0;
3. сохранить empty/reference state;
4. записать ambient temperature;
5. зафиксировать кабели/fixture.

Для каждого coupon:

1. insertion #1;
2. сохранить raw complex data;
3. полностью вынуть coupon;
4. insertion #2;
5. полностью вынуть;
6. insertion #3.

После каждых нескольких coupons повторять empty/reference check, чтобы видеть drift.

Порядок densities желательно перемешать, а не всегда low->high, если это не мешает fixture workflow.

---

# T4-8. Raw data

Хранить в:

`data/materials/de10/t4/raw/`.

Имена:

```text
T4_GYR_R020_A_R1.s2p
T4_GYR_R020_A_R2.s2p
T4_GYR_R020_A_R3.s2p
...
T4_EMPTY_START.s2p
T4_EMPTY_END.s2p
T4_REFERENCE_START.s2p
T4_REFERENCE_END.s2p
```

Если instrument export не Touchstone — сохранять оригинальный native/raw format плюс CSV export.

Не сохранять только screenshot magnitude.

---

# T4-9. Extraction

Сохранять отдельно:

1. **RAW S-parameters**;
2. **processed/deembedded S-parameters**;
3. **retrieved material parameters**.

Не переписывать raw files после deembedding.

Processed table минимум:

```text
sample_id
rho_actual
orientation
repeat
frequency_Hz
epsilon_real
epsilon_imag
tan_delta
method
fixture
processing_version
```

Для transmission-line method дополнительно сохранять:

- branch-selection / unwrap settings;
- sample length used in calculation;
- reference-plane/deembedding settings.

---

# T4-10. Repeatability

Для каждой density в рабочем band вычислить:

- mean `epsilon_real(f)`;
- SD;
- CV;
- mean `tan_delta(f)`;
- SD;
- insertion-to-insertion spread.

Отдельно сравнить physical duplicates.

Repeatability одного coupon и sample-to-sample reproducibility — **две разные метрики**.

---

# T4-11. Anisotropy

На минимум двух representative densities:

- mid;
- high/center-region;

проверить минимум две ориентации gyroid относительно propagation/polarization, если geometry/fixture позволяет.

Если M7 или measurement показывает заметную anisotropy, final lens model не должен использовать scalar `epsilon_eff` без отдельного обоснования.

---

# T4-12. Итоговая calibration curve

Финальный файл:

`data/materials/de10/DE10_GYROID_EPS_CAL_5GHz.csv`.

Минимум:

```text
rho,epsilon_eff,tan_delta,epsilon_SD,tan_delta_SD,frequency_Hz,orientation,physical_samples,insertions_per_sample
```

Для generator требуется минимум monotonic fit/table:

```text
rho,epsilon_eff
```

Если raw measured points немонотонны из-за noise:

- raw points не удалять;
- fit делать отдельным processed file;
- указать algorithm/version;
- не подавать noisy non-monotonic raw table напрямую в generator.

---

# T4-13. PASS / FAIL

T4 PASS только если:

1. fixture/calibration fully documented;
2. raw complex data сохранены;
3. coupon geometry/mass/rho_actual известны;
4. finite-length effect проверен measurement или M7;
5. repeatability quantified;
6. минимум 5 usable density points;
7. high-density point достигает требуемой области `epsilon_eff≈2` либо явно показано, что classic Luneburg center недостижим;
8. processed law можно воспроизводимо подать в generator.

Если maximum measured `epsilon_eff < 2`:

**NO-GO для точного classic Luneburg center с текущим printable gyroid range**, даже если solid DE-10 имеет `epsilon_solid>2`.

---

# T4-14. Что идёт дальше

После T4:

1. обновить `simulation/INPUTS_TEMPLATE.yaml` measured values;
2. пересчитать M6;
3. выполнить M7 и сравнить explicit model с T4;
4. выставить measured `rho_min/rho_max`;
5. запустить diameter gate на manufacturable model;
6. только после этого фиксировать full-lens geometry.
