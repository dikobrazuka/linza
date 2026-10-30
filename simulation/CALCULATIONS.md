# Расчёты TEST_LENS_5G_V1 -> FINAL_LENS_24G

## 1. Физический demonstrator @5 GHz

- `f = 5.0 GHz`;
- `D = 240 mm`;
- `R = 120 mm`;
- `lambda0 = c/f ≈ 59.96 mm`;
- `D/lambda0 ≈ 4.00`;
- nominal gyroid period `a = 7.5 mm`.

В центре ideal Luneburg:

`epsilon=2`;

`lambda_center = lambda0/sqrt(2) ≈ 42.40 mm`.

Для nominal cell:

- `a/lambda0 ≈ 0.1251`;
- `a/lambda_center ≈ 0.1769`.

## 2. Строго подобная 24-GHz версия

Scale:

`k = f_5/f_24 = 5/24 = 0.2083333333`.

Все линейные размеры:

`L_24 = L_5 * k`.

Получаем:

- `f_24 = 24.0 GHz`;
- `lambda0_24 ≈ 12.491 mm`;
- `D_24 = 50.000 mm`;
- `R_24 = 25.000 mm`;
- `a_24 = 1.5625 mm`;
- `D/lambda0 ≈ 4.00`;
- `a/lambda0 ≈ 0.1251`.

Это текущая финальная расчётная версия для защиты.

## 3. Идеальный профиль

`epsilon_r(r)=2-(r/R)^2`.

Профиль зависит от `r/R`, поэтому одинаков для 5- и 24-GHz геометрически подобных версий при одинаковой material law.

Для 5-GHz `R=120 mm`:

- center: `epsilon_r=2`;
- surface: `epsilon_r=1`.

## 4. 11-zone benchmark @5 GHz

`dr = 120/11 = 10.90909 mm`.

| zone | r_start mm | r_end mm | r_mid mm | epsilon_target |
|---:|---:|---:|---:|---:|
| 1 | 0.00 | 10.91 | 5.45 | 1.998 |
| 2 | 10.91 | 21.82 | 16.36 | 1.981 |
| 3 | 21.82 | 32.73 | 27.27 | 1.948 |
| 4 | 32.73 | 43.64 | 38.18 | 1.899 |
| 5 | 43.64 | 54.55 | 49.09 | 1.833 |
| 6 | 54.55 | 65.45 | 60.00 | 1.750 |
| 7 | 65.45 | 76.36 | 70.91 | 1.651 |
| 8 | 76.36 | 87.27 | 81.82 | 1.535 |
| 9 | 87.27 | 98.18 | 92.73 | 1.403 |
| 10 | 98.18 | 109.09 | 103.64 | 1.254 |
| 11 | 109.09 | 120.00 | 114.55 | 1.089 |

11-zone — benchmark, не финальная geometry.

## 5. Provisional DE-10 / Bruggeman

Manufacturer mean @10 GHz:

`epsilon_solid = 2.30318`.

До T4 используем symmetric Bruggeman только как preliminary law.

Для center target `epsilon_eff=2`:

`rho_center ≈ 0.806`.

После T4 этот mapping заменить measured `rho -> epsilon_eff`.

Не использовать старую линейную формулу `fill=(epsilon-1)/(epsilon_solid-1)` как primary design law.

## 6. Nominal gyroid period

Current nominal @5 GHz:

`a=7.5 mm`.

Research sensitivity:

`a=5 / 7.5 / 10 mm`.

При ideal scaling на 24 GHz:

| a @5 GHz | a @24 GHz |
|---:|---:|
| 5.0 mm | 1.04167 mm |
| 7.5 mm | 1.56250 mm |
| 10.0 mm | 2.08333 mm |

Технологичность этих scaled feature sizes должна оцениваться отдельно.

## 7. Reflector sweep

Для full sphere:

`alpha = 15°, 30°, 45°, 60°, 90°`.

После выбора лучшего cap сравнить с hemisphere + PEC ground plane.

Reflector dimensions для M10 масштабируются `×5/24` как ideal baseline.

## 8. Far field @5 GHz

`D=0.24 m`;

`lambda≈0.05996 m`.

`R_ff ≈ 2D²/lambda ≈ 1.92 m`.

Стартовая measurement distance:

`2.5–3.0 m`.

## 9. Критерий проекта

`K_sigma = sigma_test/sigma_baseline`.

Target:

`K_sigma>=10`.

`Delta_sigma_dB=10*log10(K_sigma)>=+10 dB`.

## 10. Scaling абсолютной ЭПР

При строгом electromagnetic similarity:

`k=5/24`.

Абсолютная RCS approximately scales as area:

`sigma_24/sigma_5 ≈ k²`.

`k² = 25/576 ≈0.0434028`.

То есть:

`sigma_24 ≈ sigma_5 / 23.04`.

Это относится к абсолютной ЭПР геометрически подобных объектов при идеальных material assumptions. `K_sigma` как относительная метрика может приблизительно сохраняться для подобных baseline/test configurations.

## 11. Scaling массы

При одинаковой material density и относительной volume fraction:

`m_24/m_5 ≈ k³`.

`k³ = 125/13824 ≈0.00904225`.

`m_24 ≈ m_5 /110.592`.

Это геометрическая оценка, не гарантия реальной массы после изменения minimum feature/process.

## 12. Что нельзя переносить автоматически 5 ->24 GHz

- `epsilon_r(f)`;
- `tan_delta(f)`;
- surface roughness;
- cure blur;
- minimum wall;
- seam;
- process errors;
- absolute RCS without scaling law and material similarity.

Поэтому M10 должен содержать material-dispersion/loss/manufacturability sensitivity.
