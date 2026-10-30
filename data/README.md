# Данные проекта

Raw data не редактировать вручную и не перезаписывать. Любая обработка выполняется отдельным скриптом/файлом с сохранением связи с исходными данными.

## 1. Каноническая структура

```text
data/
  README.md
  materials/
    de10/
      T1_SPDR/
      T2_DENSITY_SHRINKAGE/
      T3_GYROID_PRINTABILITY/
      T4_GYROID_RF/
  experiments/
    TEST_LENS_5G_V1/
      raw/
      processed/
      plots/
      meta/
  simulations/
    M0/
    M1/
    ...
    M10/
```

## 2. T1 — solid DE-10

Минимальные raw/processed файлы:

```text
DE10_S01_THICKNESS.csv
DE10_S02_THICKNESS.csv
DE10_S03_THICKNESS.csv
DE10_SPDR_5GHz_RAW.csv
DE10_SPDR_5GHz_RESULT.csv
DE10_PRINT_PROFILE_V1.md
DE10_POSTPROCESS_V1.md
```

`DE10_SPDR_5GHz_RAW.csv` минимум:

```csv
sample,repeat,temperature_C,thickness_mm,resonance_frequency_Hz,Q,epsilon_r,tan_delta
```

## 3. T2 — cured density / shrinkage

Файл:

`DE10_T2_SOLID_DENSITY_SHRINKAGE.csv`

Минимум:

```csv
sample,mass_wash_g,mass_cured_g,X_wash_mm,Y_wash_mm,Z_wash_mm,X_cured_mm,Y_cured_mm,Z_cured_mm,rho_solid_geom_g_cm3,shrink_X_percent,shrink_Y_percent,shrink_Z_percent
```

## 4. T3 — gyroid printability

Файлы:

```text
GYROID_T3_COUPONS.csv
T3_GYROID_RESULT.csv
photos/
```

Минимум в processed result:

```csv
sample,rho_target,gyroid_h,rho_mesh,mass_cured_g,rho_actual_mass,rho_error_percent,X_cured_mm,Y_cured_mm,Z_cured_mm,wash_status,print_status,decision
```

## 5. T4 — gyroid RF calibration

Цель — получить measured:

`rho_actual -> epsilon_eff(rho,f), tan_delta_eff(rho,f)`.

Хранить:

- geometry/coupon metadata;
- actual dimensions;
- actual mass;
- `rho_actual`;
- orientation;
- raw instrument files;
- complex S-parameters `.s2p`, если метод их использует;
- extracted `epsilon_eff` / loss;
- repeatability results;
- anisotropy results.

Минимальная processed table:

```csv
sample,rho_actual,orientation,frequency_Hz,epsilon_eff_real,epsilon_eff_imag,tan_delta_eff,repeat_id,notes
```

Итоговый generator calibration file:

```csv
rho,epsilon_eff
...
```

Этот файл используется `tools/continuous_luneburg_gyroid.py --calibration-csv ...`.

## 6. Физический experiment TEST_LENS_5G_V1

Не использовать старую схему `raw_signal/threshold/detected` как основной формат. Основные данные — complex RF measurements около 5 GHz.

Конфигурации:

- `BACKGROUND`;
- `HOLDER`;
- `REFERENCE`;
- `BASELINE`;
- `LENS_NO_REFLECTOR`;
- `LENS_REFLECTOR`.

Основной raw-format:

`.s2p` или эквивалентный экспорт complex `S21(f)`.

Имена:

`YYYYMMDD_CONFIGURATION_ANGLE_RUN.s2p`.

Пример:

```text
20261105_BACKGROUND_000_R01.s2p
20261105_BASELINE_000_R01.s2p
20261105_LENS_REFLECTOR_010_R02.s2p
```

Минимальная metadata table:

```csv
file,configuration,run,angle_deg,distance_m,frequency_start_Hz,frequency_stop_Hz,points,polarization,target_mass_g,target_diameter_mm,notes
```

## 7. meta.md физической серии

```text
Date:
Location:
Operator:
VNA/setup model:
Firmware/software:
Sweep:
Points:
Power:
IFBW/averaging if available:
TX antenna:
RX antenna:
Cable IDs:
Calibration type/date:
Distance target m:
TX/RX geometry:
Target support:
Reference target:
Baseline definition:
Lens version:
Git commit geometry:
Material:
Print profile:
Wash/post-cure:
Lens mass:
Lens actual diameter:
Reflector geometry:
Temperature/conditions:
Changes from previous run:
```

## 8. Processed 5-GHz outputs

Хранить минимум:

```text
background_subtracted.csv
repeatability.csv
angle_sweep.csv
frequency_response.csv
K_sigma.csv
RESULT.md
```

Минимальная `K_sigma.csv`:

```csv
frequency_Hz,angle_deg,K_sigma,Delta_sigma_dB,baseline_run,test_run
```

Background subtraction выполняется в complex domain.

## 9. Meep data

Для каждого run:

```text
run_id/
  config.yaml
  fields.h5
  focus.csv
  backscatter.csv
  angle_sweep.csv
  convergence.csv
  RESULT.md
```

Обязательно сохранять Git commit кода/config.

## 10. M10 / FINAL_LENS_24G

24-GHz result хранить отдельно от физического эксперимента:

```text
data/simulations/M10_FINAL_LENS_24G/
```

Минимум:

- scaled geometry/config;
- `D=50 mm`, `R=25 mm`, nominal `a=1.5625 mm`;
- material scenario source;
- dispersion/loss sensitivity;
- manufacturability sensitivity;
- RCS/backscatter prediction;
- explicit note: `CALCULATED, NOT PHYSICALLY MEASURED AT 24 GHz`.

## 11. Правила

1. Raw files never overwrite.
2. Каждой серии — отдельная папка.
3. Каждый processed result должен ссылаться на raw input.
4. График должен восстанавливаться из data/script.
5. Не смешивать physical 5-GHz data и calculated 24-GHz data в одной колонке без явного source/status.
6. Любая финальная цифра защиты должна иметь путь: `raw -> processing -> result` или `config -> simulation -> result`.
