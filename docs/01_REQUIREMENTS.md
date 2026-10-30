# Требования и критерии успеха

## 1. Конечная конструкция для защиты

- расчётная частота: **24 GHz**;
- максимальный габарит: **80 mm**;
- максимальная масса: **300 g**;
- конструкция пассивная;
- основной manufacturing route: **photopolymer continuous radial sheet-gyroid / TPMS**;
- FDM / PLA Aero / LW-PLA — R&D, не критический путь;
- основной full-wave инструмент: **Meep**.

Текущая строго масштабированная версия от физического 5-GHz демонстратора имеет:

- `D_final=50.0 mm`;
- `R_final=25.0 mm`;
- `a_final=1.5625 mm`;
- scale `5/24`.

## 2. Физическая экспериментальная верификация

Физический демонстратор не обязан удовлетворять ограничению `<=80 mm`, потому что это масштабная лабораторная модель.

`TEST_LENS_5G_V1`:

- `f=5.0 GHz`;
- `D=240 mm`;
- `R=120 mm`;
- nominal `a=7.5 mm`;
- измерительный тракт до ~6 GHz;
- стартовая дистанция `2.5–3.0 m`.

Физически измеряется 5-GHz модель. 24-GHz результат — расчётная prediction после валидации Meep на 5 GHz.

## 3. Основной показатель

`K_sigma = sigma_test / sigma_baseline`.

Цель:

`K_sigma >= 10`.

В dB:

`Delta_sigma_dB = 10*log10(K_sigma) >= +10 dB`.

Reference target и project baseline не смешивать.

## 4. Обязательные дополнительные показатели

- focus position;
- focal spot size;
- `epsilon_r/tan(delta)` материала около 5 GHz;
- measured `epsilon_eff(rho,f)` gyroid;
- repeatability;
- anisotropy;
- angular response;
- material-loss sensitivity;
- seam sensitivity;
- model vs experiment mismatch;
- масса/габарит 24-GHz design prediction;
- оценка технологичности scaled geometry.

## 5. Честность сравнения

Baseline и test должны иметь одинаковые:

- положение;
- держатель;
- высоту;
- расстояние;
- ориентацию;
- настройки VNA;
- положение кабелей/антенн.

## 6. Критерий завершения текущей итерации

1. T1: собственные `epsilon_r/tan(delta)` DE-10 около 5 GHz.
2. T2: cured density/shrinkage.
3. T3: реальные `rho_min_print/rho_max_print` и `h -> rho_actual`.
4. T4: measured `epsilon_eff(rho,f)` около 5 GHz.
5. M0-M9 воспроизводимы в Meep.
6. Напечатан и измерен `TEST_LENS_5G_V1` Ø240 mm @5 GHz.
7. Получен `K_sigma` и model-vs-experiment comparison.
8. Все линейные размеры масштабированы `×5/24`.
9. Выполнен M10 для Ø50 mm @24 GHz.
10. Для 24 GHz явно разделены: рассчитанное, измеренное на 5 GHz и неизвестное из-за dispersion/manufacturability.
11. Есть фотофиксация, raw data, итоговый отчёт и презентация.
