# DE-10 data workspace

Здесь хранится только фактическая измерительная информация по HARZ DE-10 и производственным образцам.

## Структура

```text
data/materials/de10/
├── T4_FIXTURE_CARD.md
├── T4_SERIES.csv
├── DE10_T2_SOLID_DENSITY_SHRINKAGE.csv
├── DE10_GYROID_EPS_CAL_5GHz.csv
├── t1/
│   ├── raw/
│   └── processed/
├── t3/
│   ├── geometry/
│   ├── mass/
│   └── photos/
└── t4/
    ├── raw/
    ├── processed/
    └── geometry/
```

Git не хранит пустые каталоги, поэтому подкаталоги появляются вместе с первыми данными.

## Правила

- `raw` никогда не перезаписывать processed-данными;
- filenames должны включать sample ID и repeat ID;
- единицы измерения указывать в заголовках колонок;
- T1/T2/T3/T4 должны ссылаться на commit SHA генератора/протокола, если geometry или processing зависит от кода;
- данные производителя @10 GHz не смешивать с собственными @5 GHz в одной колонке без явного поля `source/frequency`;
- после T4 primary calibration file: `DE10_GYROID_EPS_CAL_5GHz.csv`.
