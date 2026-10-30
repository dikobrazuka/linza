# Расчётный маршрут без выбора модели — от исходных данных до Meep и измерения

Дата: 2026-10-30

Цель файла: исключить повторные решения «какую модель сейчас считать» и «какие данные нужны». Для `TEST_LENS_5G_V1` расчёты всегда идут в порядке ниже. Если какого-то входа нет — используется явно помеченная временная гипотеза, а не скрытое допущение.

---

## 0. Зафиксированные параметры проекта

Физический MVP:

- `f_test = 5.0 GHz`;
- `D_test = 240 mm`;
- `R_test = 120 mm`;
- `lambda0_test ≈ 60 mm`;
- `D/lambda0 ≈ 4`.

Основная масштабная пара:

- `D_final = 80 mm`;
- `f_scaled = 15 GHz`;
- масштаб геометрии `1:3`;
- `D/lambda0` сохраняется.

Дополнительная расчётная точка:

- `D_final = 80 mm`;
- `f = 24 GHz`;
- это НЕ точная масштабная пара 5 ГГц.

Целевой профиль классической линзы Люнеберга:

`epsilon_target(r) = 2 - (r/R)^2`.

Цель по ЭПР:

`K_sigma = sigma_test / sigma_baseline >= 10`.

`Delta_sigma_dB = 10*log10(K_sigma) >= +10 dB`.

Основной manufacturing route MVP:

**photopolymer + continuous radial sheet-gyroid / TPMS**.

FDM / PLA Aero / LW-PLA не входят в критический путь MVP и считаются отдельной R&D-веткой.

---

# 1. Один файл исходных данных

Перед любым расчётом заполнить `simulation/INPUTS_TEMPLATE.yaml` и сохранить копию конкретного расчёта в `simulation/configs/`.

Без заполненного config расчёт не считать воспроизводимым.

Минимально обязательные входы:

## 1.1. Геометрия

- частота `f`;
- диаметр `D`;
- радиус `R`;
- тип модели: берётся из фиксированной лестницы ниже, вручную не выбирается;
- период gyroid `a`;
- технологический `rho_min`;
- технологический `rho_max`;
- толщина/тип шва между полусферами;
- размеры металлического reflector.

## 1.2. Материал

Обязательно:

- `epsilon_solid(f)`;
- `tan_delta(f)`;
- частота, на которой эти параметры измерены;
- способ post-cure;
- плотность материала для проверки массы.

Желательно:

- `epsilon_solid` и `tan_delta` в нескольких точках частоты;
- shrinkage после post-cure;
- минимальная воспроизводимая толщина стенки.

Текущий локальный кандидат HARZ DE-10:

- измерения выполнены на `10 GHz`;
- 11 образцов;
- среднее `epsilon_r = 2.30318`;
- sample SD `≈0.06218`;
- диапазон `2.187...2.384`;
- среднее `tan(delta) = 0.0024227`;
- sample SD `≈0.0003436`;
- диапазон `0.00184...0.00310`;
- 405 нм поддерживается по ответу производителя;
- доступность материала уточняется.

ВАЖНО: эти 10-ГГц значения можно использовать для предварительного sensitivity-study, но для физического 5-ГГц MVP они не заменяют собственное измерение около 5 ГГц.

## 1.3. Эксперимент

- определение `baseline`;
- расстояние до мишени;
- диапазон частот NanoVNA;
- TX/RX антенны;
- положение и ориентация мишени;
- держатель;
- reference target.

---

# 2. Фиксированная лестница моделей

Не выбирать модель каждый раз. Идти строго сверху вниз.

## M0 — EMPTY / BACKGROUND

Геометрия стенда без линзы и без project baseline-object.

Зачем:

- получить incident/background field;
- проверить PML / domain / source;
- база для scattered-field subtraction.

## M1 — numerical reference / simple scatterer

Простая сфера или другой объект с известным/предсказуемым scattering.

Зачем:

- проверить near-to-far;
- проверить нормировку;
- проверить resolution convergence.

## M2 — homogeneous dielectric sphere

Сфера Ø240 мм с постоянным `epsilon`.

Использовать как контроль, а не как финальную конструкцию.

## M3 — ideal continuous Luneburg, lossless

Использовать аналитический профиль прямо в Meep:

`epsilon(r)=2-(r/R)^2`.

Reflector пока НЕ ставить.

Проверить сначала только физику фокусировки.

## M4 — ideal continuous Luneburg + loss

Та же модель, но с реалистичным `tan(delta)`.

Если материал пока не измерен на 5 ГГц, выполнить sensitivity:

- `tan(delta)=0`;
- `0.0025`;
- `0.005`;
- `0.01`;
- `0.02`.

## M5 — zoned benchmark

Использовать 11-zone модель как основной дискретный benchmark.

6 и 8 зон посчитать один раз для демонстрации convergence/цены дискретизации. После этого не использовать их в каждом sweep.

Зональные значения брать из `simulation/CALCULATIONS.md`.

## M6 — homogenized manufacturable continuous GRIN

Это основная инженерная модель будущей детали.

В ней уже нет идеального `epsilon(r)` напрямую. Цепочка:

`epsilon_target(r) -> rho_required(r) -> technological clamp -> epsilon_realized(r)`.

До своих измерений допускается Bruggeman как временная модель. После coupon measurement — только экспериментальная `epsilon_eff(rho)`.

## M7 — explicit periodic unit cell / coupon

Не моделировать сразу весь Ø240-мм gyroid с субмиллиметровыми стенками.

Сначала моделировать ОДНУ периодическую ячейку или небольшой массив ячеек с реальной геометрией.

Задачи:

- получить `epsilon_eff(rho)`;
- проверить anisotropy;
- проверить влияние `a/lambda`;
- сравнить с Bruggeman;
- проверить loss.

Это основной full-wave explicit-geometry расчёт для калибровки материала.

## M8 — explicit local / reduced gyroid validation

Небольшой сектор, slab или уменьшенная representative geometry с явными стенками gyroid.

Зачем:

- убедиться, что homogenized approximation не скрывает сильное lattice scattering;
- проверить шов, край структуры и локальные дефекты.

Полный explicit Ø240-mm gyroid считать только при наличии достаточных вычислительных ресурсов. Для MVP это НЕ обязательный первый расчёт.

## M9 — final lens + reflector

Основная whole-lens модель для RCS:

- homogenized manufacturable continuous GRIN;
- measured/validated material law;
- reflector.

Сначала `full sphere + PEC cap`.

После выбора лучшего cap — сравнить с `hemisphere + ground plane`.

## M10 — scaled final geometry

После совпадения 5-ГГц модели с экспериментом:

1. масштаб `1:3` -> Ø80 мм @15 ГГц;
2. отдельный расчёт Ø80 мм @24 ГГц.

---

# 3. Расчёт шага за шагом

## Шаг 1 — базовые длины

Для каждой частоты:

`lambda0 = c/f`.

Минимальная локальная длина волны в классической Luneburg:

`lambda_min ≈ lambda0/sqrt(2)`.

Для 5 ГГц:

- `lambda0 ≈ 59.96 mm`;
- `lambda_min ≈ 42.4 mm`.

Посчитать:

- `D/lambda0`;
- `a/lambda_min`;
- `a/lambda0`.

Стартовый cell sweep:

`a = 5 / 7.5 / 10 mm`.

Текущий nominal candidate:

`a = 7.5 mm`.

---

## Шаг 2 — ideal radial profile

Создать radial grid, например `r=0...R` с шагом 0.5–1 мм.

Для каждой точки:

`epsilon_target = 2-(r/R)^2`.

Сохранить CSV:

- `r_mm`;
- `r_over_R`;
- `epsilon_target`.

Никакой manufacturability на этом шаге не учитывать.

---

## Шаг 3 — проверить, подходит ли solid material вообще

Условие для single-material classic Luneburg:

`epsilon_solid > 2`.

Если `epsilon_solid <= 2`, одной смесью resin+air центр `epsilon=2` реализовать нельзя.

Для HARZ DE-10 по измерению @10 GHz:

`epsilon_solid_mean ≈ 2.303` -> условие выполняется.

---

## Шаг 4 — временно перевести epsilon_target -> rho

Порядок приоритета модели:

1. **измеренная таблица `rho -> epsilon_eff`**;
2. periodic full-wave unit-cell retrieval;
3. Bruggeman только как временная оценка.

Временная symmetric Bruggeman модель resin+air:

`rho*(eps_s-eps)/(eps_s+2*eps) + (1-rho)*(1-eps)/(1+2*eps) = 0`.

Удобная форма для прямого расчёта `rho`:

`A=(eps_s-eps)/(eps_s+2*eps)`

`B=(1-eps)/(1+2*eps)`

`rho=-B/(A-B)`.

Для `eps_s=2.30318` и центра `eps=2`:

`rho_center ≈ 0.806`.

То есть предварительно около 80.6% объёмной доли solid в центре.

Это хорошее положение: центр не обязан быть монолитным.

---

## Шаг 5 — перевести rho -> sheet-gyroid threshold h

Gyroid:

`G = sin(kx)cos(ky)+sin(ky)cos(kz)+sin(kz)cos(kx)`

`k=2*pi/a`.

Sheet solid:

`|G| <= h`.

Не выводить `rho(h)` аналитически вручную.

Алгоритм всегда один:

1. взять одну ячейку `0...a` по XYZ;
2. построить fine voxel grid;
3. sweep `h`;
4. для каждого `h` посчитать долю voxel, где `|G|<=h`;
5. получить lookup `h -> rho`;
6. инвертировать interpolation -> `rho -> h`.

После этого:

`h(r)=H^-1(rho(r))`.

---

## Шаг 6 — ввести реальные технологические ограничения

Пока `rho_min/rho_max` не измерены — НЕ считать их истинными свойствами процесса.

После print-coupon определить:

- минимальную стенку после wash/post-cure;
- максимальную плотность, при которой поры ещё открыты;
- фактическую mass-based `rho`.

Затем:

`rho_used = clip(rho_required, rho_min, rho_max)`.

И обратно получить реальную электродинамику:

`epsilon_realized = F_measured(rho_used)`.

Обязательно сохранить ошибку:

`Delta_epsilon(r) = epsilon_realized - epsilon_target`.

И отдельно долю радиуса, где работает clamp.

Пример только для понимания: при `eps_s=2.303` и временном `rho_min=0.12` Bruggeman даёт `epsilon_min≈1.115`, поэтому крайние ~5.9% радиуса уже не соответствуют ideal profile.

---

## Шаг 7 — whole-lens Meep сначала только homogenized

Для всей Ø240-мм линзы использовать continuous scalar `epsilon_realized(r)`.

Почему:

- это на порядки дешевле полного explicit gyroid;
- именно эта модель нужна для reflector sweep и RCS;
- explicit cell physics проверяется отдельно на M7/M8.

Сетка whole-lens модели выбирается по EM convergence, а не по толщине каждой TPMS-стенки, потому что TPMS здесь уже homogenized.

Минимум выполнить resolution sweep и принять resolution, после которого ключевая метрика меняется мало. Рабочий критерий проекта:

- изменение `Delta_sigma_dB` < `0.5 dB` при дальнейшем повышении resolution;
- положение фокуса меняется < `1% R`.

---

## Шаг 8 — проверить фокус ДО reflector

Источник: плоская волна.

Модель: M3/M4/M6 без металла.

Сохранить:

- `|E|^2` в диаметральном сечении;
- координату peak;
- расстояние peak от центра;
- -3 dB spot size;
- -6 dB spot size.

Для ideal Luneburg фокус должен быть около противоположной поверхности.

Если ideal model не фокусирует правильно — reflector/RCS пока не считать. Сначала исправить source, domain, PML, units или geometry.

---

## Шаг 9 — reflector sweep

Default architecture для первого sweep:

**full sphere + PEC cap**.

Cap находится в фокальной области на противоположной от падения волны поверхности.

Sweep полуугла:

`alpha = 15 / 30 / 45 / 60 / 90 deg`.

Для каждого сохранить:

- monostatic `K_sigma(0)`;
- `Delta_sigma_dB(0)`;
- angular response.

Выбрать не просто самый большой cap, а минимальный cap, после которого дальнейшее увеличение даёт малый прирост.

После этого сравнить победителя с:

**hemisphere + PEC ground plane**.

---

## Шаг 10 — считать RCS одинаково во всех моделях

В Meep сначала получить scattered field через reference/background subtraction.

Для относительного сравнения при неизменных source/geometry/distance:

`K_sigma = |E_scat,test|^2 / |E_scat,baseline|^2`.

Или через одинаково обработанный complex transfer response.

`Delta_sigma_dB = 10*log10(K_sigma)`.

Эквивалентно по амплитуде поля:

`Delta_sigma_dB = 20*log10(|E_test|/|E_baseline|)`.

Цель:

`Delta_sigma_dB >= +10 dB`.

Абсолютную RCS считать только после проверки нормировки near-to-far. Основная проектная метрика на этапе MVP — относительный `K_sigma`.

---

## Шаг 11 — модель потерь

Для узкополосного расчёта около одной частоты материал можно представить через `epsilon'` и эквивалентную dielectric loss.

Физическая связь:

`epsilon'' = epsilon' * tan(delta)`.

Эквивалентная проводимость в SI:

`sigma = omega * epsilon0 * epsilon' * tan(delta)`.

Для Meep переводить это в его нормированные units последовательно с выбранной единицей длины.

Для 15/24 ГГц НЕ переносить автоматически `tan(delta)` @10 GHz без sensitivity/измерения. Если дисперсионной кривой нет — считать несколько plausible значений и явно маркировать неопределённость.

---

## Шаг 12 — periodic unit-cell calculation

Для каждого `a` и нескольких `rho`:

- `rho ~0.12`;
- `0.20`;
- `0.40`;
- `0.60`;
- `rho_center`;

построить explicit gyroid cell.

Считать минимум для распространения вдоль X/Y/Z.

Выход:

- effective phase delay / retrieved `epsilon_eff`;
- loss;
- отличие X/Y/Z;
- отличие от Bruggeman.

Если directional difference существенна — материал нельзя считать scalar-isotropic без дополнительного анализа.

Рабочий инженерный gate для первого MVP:

- желательно <5% различия `epsilon_eff` между главными направлениями;
- explicit vs homogenized response в representative model желательно в пределах ~1 dB по главной RF-метрике.

Эти пороги — проектные критерии, не фундаментальные константы; при необходимости фиксировать их изменение в decisions.

---

## Шаг 13 — что НЕ надо моделировать первым

Не начинать с полного explicit Ø240-mm gyroid с реальными ~0.2–0.5-mm стенками.

Причина: сетка станет огромной, а большую часть задачи можно надёжнее разделить на два масштаба:

1. **unit cell / coupon:** explicit geometry;
2. **whole lens:** homogenized measured material law.

Это основной multi-scale workflow проекта.

---

## Шаг 14 — масштабирование 5 -> 15 GHz

Для точного подобия должны сохраняться:

- `D/lambda`;
- `a/lambda`;
- reflector/D;
- seam/D;
- wall/lambda, если explicit feature масштабируется;
- material dispersion должна быть учтена отдельно.

Геометрически:

`L_15GHz = L_5GHz / 3`.

Абсолютная RCS при строгом подобии:

`sigma_80 ≈ sigma_240 / 9`.

Относительный `K_sigma` для подобных baseline/test систем должен оставаться примерно одинаковым.

---

## Шаг 15 — 24 GHz

Ø80 мм @24 ГГц не является масштабной копией Ø240 @5 ГГц.

Поэтому:

- использовать физический D=80 мм;
- реальную геометрию конечной детали;
- реальные/оценённые свойства материала @24 ГГц;
- заново считать RCS и angular response.

Не переносить результат 5->24 простым коэффициентом.

---

# 4. Что измерить до финальной генерации линзы

Минимальный material-coupon пакет:

1. solid resin coupon;
2. gyroid coupon `rho≈0.2`;
3. `rho≈0.4`;
4. `rho≈0.6`;
5. `rho≈rho_center`.

Для каждого:

- масса;
- внешний объём;
- фактическая volume fraction;
- wall thickness;
- shrinkage;
- `epsilon_eff`;
- `tan(delta)`.

После этого заменить все временные mixing-law значения в generator на measured interpolation.

---

# 5. Физический NanoVNA-эксперимент

Фиксированная схема:

`Port 1 -> TX -> target -> RX -> Port 2`.

Дистанция для Ø240 мм @5 ГГц:

`R_ff ≈ 2D^2/lambda ≈ 1.92 m`.

Рабочий старт:

`2.5...3.0 m`.

Для каждой конфигурации сохранить complex `S21(f)`:

1. BACKGROUND;
2. HOLDER;
3. REFERENCE TARGET;
4. BASELINE;
5. LENS без reflector;
6. LENS + reflector.

Background-subtracted complex amplitude:

`H_target = S21_target - S21_background`.

Для одинаковой геометрии стенда относительный RCS gain:

`K_sigma ≈ |H_test|^2 / |H_baseline|^2`.

`Delta_sigma_dB = 20*log10(|H_test|/|H_baseline|)`.

Повтор ключевых измерений минимум 3 раза.

---

# 6. Порядок принятия решения

Не принимать решение по одной красивой карте поля.

Конструкция переходит к печати полного V1 только если одновременно:

1. ideal M3 корректно фокусирует;
2. numerical convergence закрыта;
3. M6 manufacturable profile рассчитан;
4. material data известны хотя бы около 5 ГГц или закрыты sensitivity диапазоном;
5. unit-cell explicit model не показывает критическую anisotropy/lattice scattering;
6. reflector sweep завершён;
7. predicted `Delta_sigma_dB` имеет запас относительно +10 dB;
8. geometry проходит min-wall/washing constraints.

---

# 7. Минимальный набор выходных файлов каждого расчёта

Для каждого run сохранить:

- config YAML;
- git commit SHA;
- Meep version;
- resolution;
- domain/PML settings;
- frequency;
- material data + source/frequency measurement;
- geometry parameters;
- raw DFT/near-to-far data;
- field map;
- CSV `RCS/Gain vs angle/frequency`;
- короткий `RESULT.md` с выводом PASS/FAIL и причиной.

---

# 8. Коротко: что считать прямо сейчас

Текущий deterministic path:

1. `M0/M1` — validate Meep;
2. `M3` — ideal Ø240 @5 GHz;
3. `M4` — loss sensitivity;
4. `M5` — 11-zone + один раз 6/8-zone comparison;
5. HARZ DE-10 использовать как provisional material scenario: `eps=2.303`, `tanδ=0.00242 @10 GHz`;
6. Bruggeman -> preliminary `rho(r)`;
7. `a=7.5 mm` primary, `5/10 mm` comparison;
8. periodic explicit gyroid cells -> `epsilon_eff(rho)`;
9. M6 whole-lens homogenized manufacturable profile;
10. cap sweep;
11. choose full-sphere cap vs hemisphere ground plane;
12. print coupons -> replace provisional law with measured 5-GHz law;
13. rerun M6/M9;
14. print full V1;
15. NanoVNA experiment;
16. validate Meep vs experiment;
17. scale to Ø80 @15 GHz;
18. separate Ø80 @24 GHz calculation.

Если возникает вопрос «какую модель теперь считать?» — ответ всегда следующий незакрытый пункт этого списка.
