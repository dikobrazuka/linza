# Справочник проекта с нуля

Этот файл — точка входа для человека, который впервые открыл проект.

## 1. Что строим

Проект исследует аддитивно изготовленную GRIN/Luneburg-структуру с радиально меняющейся эффективной диэлектрической проницаемостью.

Идеальный профиль:

`epsilon_r(r) = 2 - (r/R)^2`.

В центре `epsilon_r=2`, у поверхности `epsilon_r=1`.

## 2. Почему возникает фокус

Для немагнитного диэлектрика:

`n ≈ sqrt(epsilon_r)`.

Радиальный профиль создаёт пространственную фазовую задержку: части волнового фронта проходят через области с разным `n`, поэтому плоская падающая волна преобразуется в сходящуюся и фокусируется у противоположной поверхности.

## 3. Зачем отражатель

Линза концентрирует поле около фокальной области. Металлический reflector возвращает энергию обратно через линзу; на обратном пути линза снова формирует фронт, что может увеличить обратное рассеяние к источнику.

## 4. Что такое RCS / ЭПР

Рабочая метрика:

`K_sigma = sigma_test / sigma_baseline`.

Цель:

`K_sigma >= 10`.

В dB:

`Delta_sigma_dB = 10*log10(K_sigma) >= +10 dB`.

## 5. Почему не подходит обычный однородный шар

Однородный материал имеет почти постоянную `epsilon_r`, а Luneburg требует пространственного закона `2 ->1`.

Используется смесь фотополимера и воздуха. Меняя локальную долю материала `rho`, меняем `epsilon_eff`.

Ключевая цепочка:

`geometry -> volume fraction -> epsilon_eff`.

`infill %` нельзя автоматически считать `epsilon_eff`.

## 6. Effective medium

Если characteristic scale микроструктуры достаточно мал относительно локальной длины волны, структуру можно описывать эффективной средой.

Для 5 GHz:

`lambda0 ≈59.96 mm`.

В центре Luneburg:

`lambda ≈ lambda0/sqrt(2) ≈42.4 mm`.

Поэтому nominal `a=7.5 mm` проверяется через explicit unit-cell/coupon simulations и реальные RF-coupons, а не принимается на веру.

## 7. Зачем 6/8/11-zone модели

Это benchmark для оценки ошибки дискретизации continuous profile.

Финальная физическая цель проекта — continuous GRIN, а не зональная конструкция.

## 8. Непрерывный градиент

Основная photopolymer geometry:

`rho = rho(r)`

и sheet-gyroid:

`|G(x,y,z)| <= h(r)`.

Цепочка:

`epsilon_target(r) -> rho(r) -> h(r) -> 3D geometry`.

Период `a` номинально постоянный, а локальная доля материала меняется через `h(r)`.

## 9. Почему задача трёхмерная

`r = sqrt(x^2+y^2+z^2)`.

Поверхности одинаковой `epsilon` — сферические. MSLA/DLP остаётся послойной технологией, но печатает сечения уже заранее рассчитанного 3D radial field.

## 10. Технология изготовления

### PRIMARY — photopolymer MSLA/DLP

Текущий material candidate: **HARZ DE-10**.

Преимущества:

- настоящий 3D radial gradient задаётся geometry;
- подходит для TPMS;
- можно делать две открытые полусферы для washing/post-cure.

Критические данные:

- `epsilon_solid(f)`;
- `tan(delta)(f)`;
- `epsilon_eff(rho,f)`;
- shrinkage;
- printable `rho_min/rho_max`.

### R&D — FDM / PLA Aero / LW-PLA

Сохраняются как альтернативные ветки, но не входят в critical path первого MVP.

## 11. Почему две полусферы

Закрытая пористая сфера плохо промывается и post-cure внутри. Две открытые полусферы позволяют контролировать wash, trapped resin и внутреннюю геометрию. Шов затем учитывается в Meep.

## 12. Анизотропия

Идеальная модель предполагает изотропную effective medium. Реальная структура может дать:

`epsilon_x != epsilon_y != epsilon_z`.

Поэтому T4/M7 должны проверить representative orientations.

## 13. Канонический масштабный эксперимент

Физически измеряем:

`D=240 mm @5 GHz`.

Доступный измерительный тракт работает примерно до 6 GHz.

Для расчёта на 24 GHz все линейные размеры масштабируются:

`k=5/24=0.2083333`.

Получаем:

- `D=50.0 mm @24 GHz`;
- `R=25.0 mm`;
- `a=1.5625 mm` при `a=7.5 mm` на 5 GHz.

При строгом подобии сохраняются `D/lambda`, `a/lambda`, `r/R` и нормированная geometry.

Не сохраняются автоматически material dispersion, losses, roughness, minimum feature и absolute RCS in m².

Старая пара `Ø240 @5 -> Ø80 @15` больше не является основной.

Подробно: `docs/10_SCALING_5_TO_24.md`.

## 14. Что делает Meep

Лестница:

1. M0 background;
2. M1 numerical reference;
3. M2 homogeneous sphere;
4. M3 ideal continuous Luneburg;
5. M4 loss sensitivity;
6. M5 zoned benchmark;
7. M6 homogenized manufacturable GRIN;
8. M7 explicit gyroid unit-cell/coupon;
9. M8 reduced explicit validation;
10. M9 5-GHz final lens + reflector;
11. M10 scaled Ø50 @24 GHz.

## 15. Что нужно знать о материале

Минимум:

- solid `epsilon_r/tan(delta)` около 5 GHz;
- cured density;
- shrinkage;
- actual gyroid volume fraction;
- measured `epsilon_eff(rho,f)`;
- repeatability;
- anisotropy.

Manufacturer data DE-10 @10 GHz — provisional input, не замена собственному T1/T4.

## 16. Как читать репозиторий

1. `PROJECT_MEMORY.md` — текущее состояние;
2. `decisions/README.md` — решения и superseding history;
3. `README.md` — формальная цель;
4. `docs/10_SCALING_5_TO_24.md` — канонический scaling;
5. `docs/07_CALCULATION_WORKFLOW.md` — расчётная лестница;
6. `docs/08_DE10_SPDR_T1_PROTOCOL.md` — T1;
7. `docs/09_DE10_GYROID_T2_T3_PROTOCOL.md` — T2/T3;
8. `docs/04_NEXT_ACTIONS.md` — текущий critical path;
9. `simulation/*` — расчёты и geometry;
10. `experiment/*` — физическая методика.

## 17. Главный принцип

`ideal physics -> material measurement -> manufacturable geometry -> 5-GHz experiment -> model validation -> 5/24 scaling -> 24-GHz prediction`.

Для защиты нужно ясно разделять **что измерено физически на 5 GHz** и **что рассчитано для 24 GHz**.
