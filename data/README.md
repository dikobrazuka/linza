# Данные проекта

Сырые измерения не редактировать вручную. Любая обработка должна выполняться отдельным скриптом/файлом.

## Структура

```text
data/
  README.md
  raw/
    YYYY-MM-DD_experiment_name/
  processed/
  plots/
  templates/
```

## Формат основного экспериментального CSV

Рекомендуемые поля:

```csv
timestamp,configuration,run_number,direction,distance_m,raw_signal,filtered_signal,threshold,detected,angle_deg,notes
```

### configuration

Допустимые значения:

- `EMPTY`
- `BASELINE`
- `LENS`
- `REFLECTOR_ONLY`
- `LENS_NO_REFLECTOR`

### direction

- `APPROACH`
- `RECEDE`
- `STATIC`

## Метаданные каждого эксперимента

В папке серии должен быть `meta.md`:

```text
Дата:
Место:
Оператор:
Частота радара:
Модель радара:
Питание:
Версия линзы:
Git commit модели:
Материал:
Профиль печати:
Масса линзы:
Габарит:
Высота радара:
Высота цели:
Длина трассы:
Шаг/метки расстояния:
Порог обнаружения:
Описание обработки:
Температура/условия:
Изменения относительно предыдущего опыта:
```

## Файлы моделирования

Для результатов Meep сохранять:

```text
simulation_name/
  config.json
  fields.h5
  focus.csv
  backscatter.csv
  angle_sweep.csv
  plots/
  notes.md
```

## Основные итоговые таблицы

### Дальность

| configuration | direction | n | median_range_m | mean_range_m | std_m |
|---|---|---:|---:|---:|---:|

### Сигнал

| distance_m | baseline_median | lens_median | delta_dB |
|---:|---:|---:|---:|

### Угол

| angle_deg | baseline | lens | gain_dB |
|---:|---:|---:|---:|

## Правила

1. Raw-файлы никогда не перезаписывать.
2. Каждой новой линзе присваивать версию: `LENS_V1`, `LENS_V2`.
3. Каждой серии экспериментов — отдельная папка.
4. Любой график должен иметь ссылку на исходный CSV.
5. В итоговом отчёте использовать только данные, которые можно восстановить из репозитория.
