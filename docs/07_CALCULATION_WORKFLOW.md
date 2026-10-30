# Расчётный маршрут — TEST_LENS_5G_V1 -> FINAL_LENS_24G

Дата: 2026-10-30

Цель: один фиксированный порядок расчётов без повторного выбора «что считать дальше».

---

## 0. Канонические параметры

### Физическая верификация

- `f_test = 5.0 GHz`;
- `D_test = 240 mm`;
- `R_test = 120 mm`;
- `lambda0_test = c/f ≈ 59.96 mm`;
- `D/lambda0 ≈ 4.00`;
- nominal gyroid period `a_test = 7.5 mm`;
- доступный измерительный тракт до ~6 GHz.

### Финальная расчётная точка для защиты

- `f_final = 24.0 GHz`;
- linear scale `k = 5/24 = 0.2083333`;
- `D_final = 50.0 mm`;
- `R_final = 25.0 mm`;
- `a_final = 1.5625 mm`;
- любой линейный размер `L_24 = L_5 * 5/24`.

Старая основная цепочка `Ø240 @5 -> Ø80 @15` отменена. 15 GHz допускается только как необязательная промежуточная точка.

### Идеальный профиль

`epsilon_target(r) = 2 - (r/R)^2`.

### Цель по ЭПР

`K_sigma = sigma_test/sigma_baseline >= 10`.

`Delta_sigma_dB = 10*log10(K_sigma) >= +10 dB`.

### Manufacturing route

**Photopolymer + continuous radial sheet-gyroid / TPMS.**

FDM / PLA Aero / LW-PLA — R&D.

---

# 1. Входы каждого расчёта

Перед run копировать `simulation/INPUTS_TEMPLATE.yaml` в отдельный config.

Обязательные входы:

## Geometry

- `f`;
- `D`, `R`;
- gyroid `a`;
- `rho_min`, `rho_max`;
- seam geometry;
- reflector geometry;
- incidence angle/polarization.

## Material

- `epsilon_solid(f)`;
- `tan_delta(f)`;
- frequency of measurement;
- measured `epsilon_eff(rho,f)` если уже есть T4;
- cured density;
- shrinkage;
- post-cure process.

## Experiment

- baseline definition;
- target distance;
- TX/RX antennas;
- VNA sweep;
- reference target;
- holder;
- target orientation.

---

# 2. Материал-кандидат

HARZ DE-10 manufacturer data @10 GHz, 11 samples:

- mean `epsilon_r = 2.30318`;
- range `2.187...2.384`;
- mean `tan(delta)=0.0024227`;
- range `0.00184...0.00310`;
- 405 nm compatible.

Эти значения допустимы только как provisional sensitivity input.

Для финальной 5-GHz модели использовать собственный T1/T4.

Для 24-GHz M10 при отсутствии измеренных DE-10 data использовать dispersion/loss sensitivity и маркировать результат как prediction.

---

# 3. Фиксированная лестница моделей

## M0 — background

Пустой domain/стенд без lens и baseline object.

Проверить:

- PML;
- source;
- domain size;
- numerical reflections;
- field normalization.

## M1 — numerical reference

Простой scatterer с известной/проверяемой response.

Цель:

- validate near-to-far;
- normalization;
- resolution convergence.

## M2 — homogeneous sphere control

`D=240 mm`, constant epsilon.

Контроль кода, не финальная design.

## M3 — ideal continuous Luneburg, lossless

`epsilon(r)=2-(r/R)^2`.

Без reflector.

Outputs:

- focus position;
- focus intensity;
- -3/-6 dB spot size;
- field maps.

## M4 — ideal continuous + loss sensitivity

До own T1:

- `tan_delta = 0`;
- `0.0025`;
- `0.005`;
- `0.01`;
- `0.02`.

После T1 — measured value + uncertainty range.

## M5 — zoned benchmark

Основной zoned benchmark: `11 zones`.

6 и 8 zones — один convergence comparison.

Не использовать zoned model как final physical target по умолчанию.

## M6 — homogenized manufacturable continuous GRIN

Основная whole-lens инженерная модель.

Pipeline:

`epsilon_target(r)`

`-> rho_required(r)`

`-> technological clamp [rho_min,rho_max]`

`-> epsilon_realized(r)`.

До T4 можно использовать Bruggeman только временно.

После T4:

**только measured/interpolated `epsilon_eff(rho,f)` как primary law.**

## M7 — explicit periodic gyroid/coupon

Моделировать реальную explicit TPMS geometry на unit-cell/coupon scale.

Задачи:

- compare with measured T4;
- retrieve/check `epsilon_eff(rho)`;
- anisotropy;
- lattice scattering;
- `a/lambda` sensitivity;
- loss.

Nominal `a=7.5 mm`.

Research sweep `a=5/7.5/10 mm`.

## M8 — reduced explicit gyroid validation

Небольшой representative slab/sector с explicit walls.

Проверить:

- homogenization validity;
- edge effects;
- seam/local defects;
- finite-array effects.

Полный explicit Ø240-mm gyroid не обязателен.

## M9 — final 5-GHz lens + reflector

Whole-lens homogenized measured GRIN.

Сначала:

`full sphere + PEC cap`.

Cap half-angle sweep:

`15/30/45/60/90°`.

После выбора — compare с:

`hemisphere + PEC ground plane`.

Outputs:

- `K_sigma(f,theta)`;
- `Delta_sigma_dB(f,theta)`;
- focus;
- material-loss sensitivity;
- seam sensitivity;
- reflector sensitivity.

M9 считается физически валидированным только после сравнения с 5-GHz experiment.

## M10 — scaled final geometry @24 GHz

Только после M9 + experiment validation.

Scale:

`k = 5/24`.

Geometry:

- `D=50.0 mm`;
- `R=25.0 mm`;
- `a=1.5625 mm`;
- reflector dimensions `×5/24`;
- seam/geometric features `×5/24` как ideal scaling baseline.

Run separately:

1. ideal scaled material assumption;
2. epsilon dispersion sensitivity;
3. tan(delta) sensitivity;
4. geometric-resolution/manufacturability sensitivity;
5. seam/min-feature sensitivity.

M10 = prediction, не physical measurement.

---

# 4. Расчёт geometry: шаг за шагом

## 4.1 Базовые длины @5 GHz

`lambda0 = c/f ≈59.96 mm`.

В центре Luneburg:

`lambda_min ≈ lambda0/sqrt(2) ≈42.40 mm`.

Для nominal `a=7.5 mm`:

- `a/lambda0 ≈0.1251`;
- `a/lambda_min ≈0.1769`.

## 4.2 Ideal radial profile

Создать grid `r=0...R`.

Для каждой точки:

`epsilon_target = 2-(r/R)^2`.

Сохранять:

- `r_mm`;
- `r_over_R`;
- `epsilon_target`.

## 4.3 Проверить solid material

Для classic single-material resin+air Luneburg необходимо:

`epsilon_solid > 2`.

Если `epsilon_solid<=2`, центр `epsilon_eff=2` недостижим через dilution with air.

## 4.4 Временный epsilon -> rho

Priority:

1. measured T4 `rho -> epsilon_eff`;
2. validated M7 retrieval;
3. Bruggeman only provisional.

Symmetric Bruggeman:

`rho*(eps_s-eps)/(eps_s+2eps) + (1-rho)*(1-eps)/(1+2eps) = 0`.

Для `eps_s=2.30318`, `eps=2`:

`rho_center ≈0.806`.

## 4.5 rho -> gyroid threshold h

Gyroid:

`G = sin(kx)cos(ky)+sin(ky)cos(kz)+sin(kz)cos(kx)`.

`k=2*pi/a`.

Sheet solid:

`|G|<=h`.

`rho(h)` вычислять численно на unit cell, затем invert interpolation:

`h(r)=H^-1(rho(r))`.

## 4.6 Technological clamp

Из T3 получить:

- `rho_min_print`;
- `rho_max_print`.

Использовать:

`rho_used = clip(rho_required,rho_min_print,rho_max_print)`.

После T4:

`epsilon_realized = F_measured(rho_used)`.

Сохранять:

`Delta_epsilon(r)=epsilon_realized-epsilon_target`.

## 4.7 Full-lens manufacturing geometry

До full print проверить:

- min wall;
- washability;
- trapped resin;
- shrinkage;
- mass;
- seam;
- alignment features.

Основной manufacturing concept: две открытые полусферы.

---

# 5. Экспериментальная привязка

## T1

Solid DE-10 `epsilon_r/tan_delta` около 5 GHz.

## T2

Cured density/shrinkage.

## T3

Gyroid printability + actual volume fraction.

## T4

Measured gyroid `epsilon_eff(rho,f)` + repeatability/anisotropy.

После T4 M6/M7 пересчитать.

---

# 6. Physical 5-GHz stand

Target:

`D=240 mm`.

Far field estimate:

`R_ff≈2D²/lambda≈1.92 m`.

Start distance:

`2.5–3.0 m`.

Measure:

- BACKGROUND;
- HOLDER;
- REFERENCE;
- BASELINE;
- LENS_NO_REFLECTOR;
- LENS+REFLECTOR.

Save complex `S21/.s2p`.

Repeat key configurations >=3 times with re-installation.

Background subtraction must be complex, not subtraction of dB magnitudes.

---

# 7. Model validation gate

Перед scaling на 24 GHz должно быть показано, что Meep reproduces физический 5-GHz trend:

- frequency response;
- angular response;
- relative gain `K_sigma`;
- reflector effect.

Рабочий numerical convergence gate:

- `Delta_sigma_dB` changes < `0.5 dB` при дальнейшем resolution increase;
- focus position changes < `1% R`.

Experimental repeatability хранить отдельно от numerical convergence.

---

# 8. Scaling 5 ->24 GHz

`k=5/24=0.2083333`.

Сохраняются при ideal similarity:

- `D/lambda`;
- `a/lambda`;
- `r/R`;
- normalized reflector geometry;
- normalized angular pattern в идеальном случае.

Не сохраняются автоматически:

- `epsilon_r(f)`;
- `tan_delta(f)`;
- roughness;
- minimum printable wall;
- cure blur;
- absolute RCS in m².

Approximate RCS area scaling:

`sigma_24/sigma_5 ≈ k² = 1/23.04`.

Volume/mass geometric scaling:

`m_24/m_5 ≈ k³ = 1/110.592`, если material/volume fraction similar.

Подробно: `docs/10_SCALING_5_TO_24.md`.

---

# 9. Порядок действий без выбора

1. lock DE-10 process;
2. T1;
3. T2/T3;
4. параллельно M0-M5;
5. T4;
6. rerun M6/M7 with measured law;
7. M8;
8. M9 reflector optimization;
9. print full TEST_LENS_5G_V1;
10. physical 5-GHz experiment;
11. validate M9 vs experiment;
12. freeze validated 5-GHz geometry;
13. scale all linear dimensions `×5/24`;
14. run M10 @24 GHz;
15. prepare defense package.

Если возникает вопрос «что считать дальше?» — следующий незакрытый пункт этого списка.
