# Фотофиксация

Фото нужны как доказательство последовательности разработки и воспроизводимости процесса.

## 1. Материал / T1

Обязательно:

1. упаковка/этикетка HARZ DE-10;
2. resin batch/expiry;
3. printer setup;
4. exposure calibration;
5. T1 plates S01-S04;
6. wash process;
7. post-cure setup;
8. 9-point thickness measurement;
9. весы/масса;
10. SPDR/VNA measurement setup;
11. sample inside fixture where permitted.

## 2. T2/T3

1. T2 solid coupons `20×20×10 mm`;
2. measurement X/Y/Z;
3. mass measurement;
4. T3 nine gyroid coupons;
5. top/bottom/side views каждого representative rho;
6. low-density failure, если есть;
7. high-density sheet fusion/trapped resin, если есть;
8. wash before/after;
9. post-cure;
10. final intact T3 series.

Фото отрицательных результатов не удалять.

## 3. T4

1. RF coupon geometry;
2. actual dimensions;
3. orientation marks;
4. sample in RF fixture/setup;
5. VNA/setup screen;
6. calibration setup;
7. repeat installation where practical.

## 4. TEST_LENS_5G_V1

Физический demonstrator:

- `D=240 mm`;
- `f=5 GHz`.

Обязательные кадры:

1. generated CAD/mesh;
2. slicer preview;
3. technological segment;
4. two open hemispheres;
5. internal gyroid structure;
6. washing interior;
7. post-cure;
8. alignment/seam;
9. reflector manufacturing;
10. assembled lens without reflector;
11. assembled lens + reflector;
12. actual diameter measurement around 240 mm;
13. actual mass.

Не требовать от этого demonstrator габарита `<=80 mm`: это ограничение конечной 24-GHz конструкции.

## 5. 5-GHz stand

Обязательно:

1. full stand;
2. VNA/setup model;
3. TX/RX antennas;
4. cable/calibration kit;
5. target support;
6. measured distance `2.5–3.0 m`;
7. TX/RX separation;
8. BACKGROUND;
9. HOLDER;
10. REFERENCE;
11. BASELINE;
12. LENS_NO_REFLECTOR;
13. LENS_REFLECTOR;
14. angle scale;
15. representative VNA trace/raw file screen;
16. repeat target placement.

Динамическая каретка/трасса не является обязательной частью основного количественного VNA-эксперимента.

## 6. FINAL_LENS_24G

Текущий статус: calculated prediction after scaling.

Для защиты сохранить:

1. 5-GHz validated geometry;
2. scaling equation `×5/24`;
3. CAD/mesh or section of scaled `D=50 mm`, `R=25 mm` geometry;
4. nominal scaled gyroid `a=1.5625 mm`;
5. Meep field maps @24 GHz;
6. RCS/backscatter plots;
7. material-dispersion sensitivity;
8. minimum-feature/manufacturability illustration.

Если Ø50-mm 24-GHz version физически не изготовлена, **не фотографировать другой объект так, будто это измеренный final sample**. Использовать честно подписанный CAD/render/Meep output.

## 7. Имена файлов

Шаблон:

`YYYY-MM-DD_STAGE_SAMPLE_VIEW.ext`

Примеры:

```text
2026-11-02_T1_DE10-S01_thickness.jpg
2026-11-04_T3_GYR-810_sideX.jpg
2026-11-10_LENS5G_upper_hemisphere_internal.jpg
2026-11-14_STAND5G_LENS_REFLECTOR_000.jpg
2026-11-20_M10_FINAL24G_fieldmap.png
```

## 8. index.md

Для каждого важного файла фиксировать:

- date;
- stage;
- sample/configuration;
- description;
- Git commit geometry/config;
- linked raw data/run;
- operator/author;
- notes.

## Главное правило

Фотографировать до разборки/изменения setup и сохранять отрицательные результаты. Фото должно позволять понять, **что именно было физически измерено на 5 GHz**, а что относится только к **24-GHz calculation**.
