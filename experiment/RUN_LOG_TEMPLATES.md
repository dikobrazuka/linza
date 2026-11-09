# Журналы опыта — как не потерять измерения

Все строки ниже — **пустые шаблоны**, не результаты.

## 1. Общие обязательные поля одного опыта

- ID линзы: PLA200_5G / DE10_120_5G / CUSTOMER80_24G.
- Версия STL/3MF/STEP, материал, серия печати, D_actual, mass_actual, шов/reflector.
- Имя оператора и дата; модель VNA/радар/firmware, частота/диапазон, номер calibration, номер кабеля.
- Геометрия TX/RX: расстояние к центру, TX-RX separation, yaw/pitch/polarization, материал стойки.
- State: BACKGROUND, HOLDER, REFERENCE, REFLECTOR_ONLY, LENS_NO_REFLECTOR, LENS_WITH_REFLECTOR; drone: BARE/HOLDER/LENS.
- Run index, independent repositioning (yes/no), raw Touchstone filename либо raw ADC CSV, baseline, фото и замечания.
- Для измерения RCS: статус фона, SNR, динамический диапазон, valid/invalid, причина исключения.

## 2. Как именовать файлы

Пример: `PLA200_20261112_P5_R2m50_YAW+00_REP03.s2p`.

Для Doppler: `CDM324_20261115_DRONE_HOLDER_RUN05_raw.csv`, метаданные отдельно. Допускать пробелы в именах не рекомендуется; даты ISO, единицы всегда указываются.

## 3. Нельзя

- Нельзя заменить реально измеренный complex S21 только скриншотом LogMag.
- Нельзя брать фон от другого дня/расположения и не описывать изменения.
- Нельзя усреднять в дБ **до** корректного выбора модели статистики.
- Нельзя объявить FFT пик 24-ГГц радарного IF проверенной абсолютной dBsm.
- Нельзя утверждать заказную Ø80/24 прошедшей по результатам Ø200/5 или Ø120/5.

Связанные CSV-шаблоны: `data/experiment/TEST_RUNS_TEMPLATE.csv`, `data/experiment/BUILD_QC_TEMPLATE.csv`, `data/experiment/ELECTRONICS_QC_TEMPLATE.csv`. Фактические данные поместить в самостоятельные файлы по названиям даты и run ID.
