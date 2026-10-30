# Контекст проекта

## Задача

Команда разрабатывает компактную пассивную GRIN/Luneburg-структуру для увеличения обратного радиолокационного рассеяния/ЭПР БПЛА.

## Ограничения эксперта

Для **конечной конструкции**:

- габарит `<=80 mm`;
- масса `<=300 g`;
- требуется увеличение обратного рассеяния/ЭПР ориентировочно `>=10x`;
- основное моделирование вести в **Meep**;
- нужен физический эксперимент, фотофиксация и воспроизводимая методика.

Важно: ограничение `<=80 mm` не относится к лабораторному масштабному 5-GHz демонстратору.

## Каноническая экспериментальная схема

Доступный измерительный тракт работает примерно до `6 GHz`, поэтому физическая проверка выполняется на:

- `f=5.0 GHz`;
- `D=240 mm`;
- `R=120 mm`.

Это `TEST_LENS_5G_V1` — масштабный лабораторный демонстратор.

После сопоставления Meep и эксперимента все линейные размеры масштабируются:

`k = 5/24 = 0.2083333`.

Расчётная версия для защиты:

- `f=24 GHz`;
- `D=50 mm`;
- `R=25 mm`;
- nominal gyroid period `a=1.5625 mm` при `a=7.5 mm` в 5-GHz модели.

Старая пара `Ø240 @5 GHz -> Ø80 @15 GHz` больше не является основной.

## Основная физика

Идеальный профиль классической Luneburg lens:

`epsilon_r(r)=2-(r/R)^2`.

Рабочая метрика:

`K_sigma = sigma_test/sigma_baseline`.

Цель:

`K_sigma>=10`, то есть `Delta_sigma_dB>=+10 dB`.

## Основной manufacturing route

Текущий MVP:

**photopolymer + continuous radial sheet-gyroid / TPMS**.

Основная цепочка:

`epsilon_target(r) -> rho(r) -> h(r) -> sheet-gyroid geometry`.

6/8/11-zone конструкции остаются benchmark/fallback, а не финальным target.

FDM / PLA Aero / LW-PLA — R&D branches.

## Материал

Primary candidate: **HARZ Labs DE-10**.

Manufacturer data @10 GHz:

- mean `epsilon_r=2.30318`;
- mean `tan(delta)=0.0024227`;
- 405 nm compatible.

Собственные 5-GHz measurements обязательны до финальной физической модели.

## Замкнутый цикл проекта

1. измерить solid DE-10 около 5 GHz;
2. измерить cured density/shrinkage;
3. определить печатаемый диапазон gyroid;
4. получить measured `epsilon_eff(rho,f)`;
5. закрыть Meep ladder M0-M9 на 5 GHz;
6. напечатать и измерить Ø240 @5 GHz;
7. сопоставить model vs experiment;
8. масштабировать geometry `×5/24`;
9. рассчитать Ø50 @24 GHz;
10. отдельно оценить dispersion и manufacturability 24-GHz версии;
11. оформить measured 5-GHz evidence + validated model + 24-GHz prediction для защиты.

Подробное scaling rule: `docs/10_SCALING_5_TO_24.md`.
