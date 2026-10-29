# PROJECT MEMORY — LINZA

Актуальное состояние проекта. Обновлять после каждого существенного изменения направления, даже если решение ещё не финальное.

**Срез:** 2026-10-29

## 1. Что мы делаем

Цель — компактная пассивная GRIN/Luneburg-структура для увеличения обратного радиолокационного рассеяния/ЭПР БПЛА.

Конечные ограничения проекта:

- габарит: `<= 80 mm`;
- масса: `<= 300 g`;
- рабочий диапазон конечной конструкции: `8–24 GHz`;
- рабочая цель: `K_sigma >= 10`, то есть `Delta sigma >= +10 dB` относительно явно выбранного baseline;
- основной полно-волновой расчёт: Meep.

Доступный NanoVNA ограничивает прямой физический эксперимент, поэтому основной scaling-pair:

- физический прототип: `D=240 mm @ 5.0 GHz`;
- электромагнитно подобная конечная геометрия: `D=80 mm @ 15 GHz`;
- `24 GHz` остаётся отдельной расчётной точкой.

## 2. Физическая идея

Идеальный профиль линзы Люнеберга:

`epsilon_r(r) = 2 - (r/R)^2`.

Ключевой переход проекта:

`epsilon_target(r) -> effective material -> manufacturable geometry -> measured RCS`.

Нельзя считать `infill % == epsilon_eff`. Нужна связь между локальной геометрией/долей материала и эффективной диэлектрической проницаемостью.

## 3. Главный производственный приоритет на MVP

**Основной путь сейчас: photopolymer + continuous radial sheet-gyroid / TPMS.**

Причина — не утверждение, что это окончательно лучший физический вариант, а минимизация времени до первого измеряемого MVP.

Для photopolymer route основные неопределённости сосредоточены в трёх шагах:

1. достать низкопотерную RF-смолу;
2. измерить/подтвердить её `epsilon_r` и `tan(delta)` на наших частотах;
3. напечатать заранее рассчитанную continuous 3D-геометрию и испытать её.

После этого можно быстро сравнить эксперимент с Meep и понять, работает ли сама концепция линзы/reflector.

Текущий основной кандидат смолы: **Arkema N3D-DIELEC731**. Резервный: **Rogers Radix 2.8Dk**.

Основная геометрия photopolymer-ветки:

`epsilon_target(r) -> rho(r) -> h(r) -> sheet-gyroid implicit geometry`.

Стартовый кандидат периода TPMS: `a = 7.5 mm`, при обязательном сравнении `5 / 7.5 / 10 mm`.

## 4. Ветки изготовления

### A. Photopolymer continuous sheet-gyroid / TPMS

Статус: **PRIMARY / MVP critical path**.

Почему сейчас основной:

- градиент задаётся заранее математической геометрией;
- не нужно динамически управлять материалом во время печати;
- обычный MSLA/DLP слайсер может печатать готовую 3D radial geometry;
- уже есть литературный аналог GRIN gyroid на N3D-DIELEC731;
- быстрый путь к циклу `print -> measure -> compare with Meep`.

Главные задачи:

- получить смолу;
- сделать dielectric coupon;
- определить реальный `epsilon_solid` и `tan(delta)`;
- построить calibration `rho -> epsilon_eff`;
- напечатать две открытые полусферы continuous gyroid;
- собрать и испытать.

### B. PLA Aero / LW-PLA thermal-gradient GRIN

Статус: **R&D branch / SECOND PRIORITY**.

Физически очень интересный путь и потенциально может дать более тонкий continuous material gradient, чем TPMS.

Но для него перед полноценной линзой требуется больше process-development:

- calibration `T / flow / speed -> foam density`;
- calibration `foam density -> epsilon_eff / tan(delta)`;
- учёт тепловой инерции хотэнда;
- управление transitions в реальном времени;
- custom Python G-code generator;
- возможно hybrid `microfoaming + macro-porosity` для внешней части, где требуется `epsilon -> 1`.

Поэтому эта ветка **не отменяется**, но не должна задерживать photopolymer MVP.

Вернуться к ней после первого рабочего RF-прототипа либо параллельно только если есть свободное время на material/process calibration.

### C. Непрерывная плотность в обычном FDM / OrcaSlicer

Статус: **experimental / reserve**.

Python slicing pipeline доказал, что `rho(r)` можно переносить в geometry на этапе slicing. Первый square-hole pattern — proof of concept, не финальная RF-структура.

### D. Дискретные радиальные зоны

Статус: **benchmark / fallback**.

6/8/11-zone нужны для сравнения с continuous ideal и как простой запасной manufacturing route.

### E. Непланарный spherical FDM

Статус: **deferred research**.

Физически соответствует radial isosurfaces, но 3-axis FDM имеет overhang/collision ограничения у экватора.

### F. Volumetric / tomographic photopolymerization

Статус: **future research**.

Не нужен для MVP.

## 5. Текущая иерархия моделей

Сравнивать:

1. homogeneous sphere — контроль;
2. ideal continuous Luneburg — эталон;
3. 6-zone;
4. 8-zone;
5. 11-zone;
6. homogenized continuous photopolymer GRIN;
7. explicit continuous sheet-gyroid geometry;
8. выбранная конструкция + reflector;
9. позже — LW-PLA / PLA Aero thermal-gradient branch.

## 6. Что пока НЕ доказано

Не считать установленным без моделирования/измерения:

- что 11 зон оптимальны;
- что photopolymer будет окончательно лучше PLA Aero;
- что datasheet `epsilon_r` совпадёт с нашей напечатанной/post-cured смолой;
- что Bruggeman достаточно точно описывает `rho -> epsilon_eff`;
- что 7.5-mm gyroid оптимален;
- что выбранная TPMS геометрия достаточно изотропна;
- что `+10 dB` достигаются без оптимизации reflector;
- что scaling 5 -> 15/24 GHz сохраняется при реальных дисперсионных свойствах материала.

## 7. Ближайший MVP-цикл

1. Получить **N3D-DIELEC731** или ближайший доступный low-loss RF photopolymer.
2. Напечатать solid dielectric coupons с фиксированным post-cure.
3. Измерить `epsilon_r` и `tan(delta)` около 5 GHz.
4. Напечатать TPMS calibration coupons на нескольких `rho`.
5. Получить экспериментальную `epsilon_eff(rho)`.
6. Обновить continuous gyroid generator этой калибровкой.
7. Прогнать Meep: ideal vs homogenized vs explicit gyroid.
8. Напечатать TEST_LENS_5G continuous photopolymer prototype.
9. Провести NanoVNA/RCS experiment.
10. Только после рабочего MVP решать, стоит ли вкладывать время в более сложный PLA Aero process-control route.

## 8. Правило фиксации хода мысли

В репозитории хранить не только финальные решения.

При каждой существенной развилке фиксировать:

- идея;
- зачем её рассматривали;
- физические преимущества;
- технологические ограничения;
- почему ветка принята / отложена / отвергнута;
- что должно измениться, чтобы к ней вернуться;
- какие расчёты или эксперименты могут опровергнуть текущее решение.

См. `docs/06_DESIGN_SPACE_AND_REASONING.md` и `decisions/README.md`.
