# Распределение задач на 3 человек — актуальная версия

## Человек 1 — Meep, теория, scaling и обработка

### Ответственность

- M0-M10;
- ideal continuous Luneburg;
- 6/8/11-zone benchmark;
- homogenized manufacturable GRIN;
- explicit gyroid unit-cell/coupon;
- reflector sweep;
- обработка complex S21/.s2p;
- comparison experiment vs Meep;
- scaling `5 ->24 GHz`.

### Ближайшие задачи

1. Закрыть M0-M5 для `Ø240 mm @5 GHz`.
2. Проверить `epsilon_r(r)=2-(r/R)^2`.
3. После T4 построить M6 по measured `epsilon_eff(rho)`.
4. Выполнить M7/M8 для gyroid.
5. Оптимизировать reflector в M9.
6. Подготовить обработку `.s2p`: complex background subtraction, time gating при достаточной полосе, repeatability.
7. Получить `K_sigma`, `Delta_sigma_dB`, `K_sigma(theta)`.
8. Сопоставить 5-GHz model vs experiment.
9. Масштабировать geometry `×5/24`.
10. Выполнить M10: `Ø50 mm @24 GHz` + material/technology sensitivity.

### Результат

- воспроизводимые Meep configs/results;
- focus maps;
- reflector geometry;
- `K_sigma(f,theta)`;
- model-vs-experiment comparison;
- расчётная 24-GHz версия Ø50 mm для защиты.

---

## Человек 2 — DE-10, gyroid, CAD и изготовление

### Ответственность

- HARZ DE-10;
- T1/T2/T3/T4 samples;
- `rho -> epsilon_eff`;
- continuous sheet-gyroid geometry;
- wash/post-cure;
- CAD/mesh;
- full 5-GHz demonstrator;
- reflector manufacturing;
- фото изготовления.

### Ближайшие задачи

1. Получить DE-10 и зафиксировать `PROFILE_DE10_V1`.
2. T1: изготовить 4 plates `80×80×1.50 mm`.
3. T2: изготовить 5 solid density/shrinkage samples `20×20×10 mm`.
4. T3: изготовить 9 gyroid coupons `30×30×15 mm`, nominal `a=7.5 mm`.
5. Получить `rho_min_print/rho_max_print` и `h -> rho_actual`.
6. Для T4 изготовить RF-coupons под конкретную методику измерения около 5 GHz.
7. Передать человеку 1 measured `epsilon_eff(rho,f)` и loss data.
8. После M9 сгенерировать финальную continuous geometry Ø240 mm.
9. Разделить на две открытые полусферы и проверить washability/seam.
10. Напечатать `TEST_LENS_5G_V1`.
11. Изготовить выбранный metallic reflector.
12. После scaling проверить технологические feature sizes 24-GHz версии (`a=1.5625 mm`).

### Результат

- T1/T2/T3/T4 samples и raw data;
- print/post-cure process;
- measured density/shrinkage;
- measured `epsilon_eff(rho)`;
- STL/mesh финального 5-GHz demonstrator;
- фото и dimensional QC.

---

## Человек 3 — 5-GHz измерительный стенд и эксперимент

### Ответственность

- доступный VNA/measurement setup до ~6 GHz;
- TX/RX антенны около 5 GHz;
- 2-port calibration;
- стенд Ø240 mm;
- complex S21;
- background/reference/baseline;
- angle sweep;
- repeatability;
- журнал эксперимента и смета.

### Ближайшие задачи

1. Зафиксировать точную модель VNA/установки и usable sweep около 5 GHz.
2. Проверить 2 одинаковые направленные антенны около 5 GHz.
3. Зафиксировать 2 кабеля, adapters и calibration kit.
4. Собрать TX/RX на общей жёсткой базе.
5. Сделать диэлектрическую стойку для Ø240-mm demonstrator.
6. Выставить дистанцию `2.5–3.0 m`.
7. Провести 2-port calibration.
8. Проверить REFERENCE target vs BACKGROUND.
9. Снять BACKGROUND/HOLDER/REFERENCE/BASELINE/LENS_NO_REFLECTOR/LENS+REFLECTOR.
10. Ключевые measurements повторить минимум 3 раза с переустановкой target.
11. Выполнить angular sweep минимум `-30...+30°`, шаг `5°`; для финальной геометрии желательно до ±60°.
12. Передать `.s2p` + журнал условий человеку 1.
13. Зафиксировать фото стенда, расстояния, антенн, target positions.

### Результат

- воспроизводимый 5-GHz stand;
- raw complex `.s2p`;
- metadata;
- repeatability;
- angular series;
- фото и смета.

---

## Точки синхронизации

### A. Material -> Meep

Человек 2 -> человек 1:

- `epsilon_solid/tan_delta` @~5 GHz;
- `rho_solid`;
- shrinkage;
- `rho_min_print/rho_max_print`;
- measured `epsilon_eff(rho,f)`;
- anisotropy/repeatability.

### B. Meep -> Manufacturing

Человек 1 -> человек 2:

- final `epsilon_realized(r)`;
- reflector geometry;
- required seam assumptions;
- target geometry for `TEST_LENS_5G_V1`.

### C. Manufacturing -> Stand

Человек 2 -> человек 3:

- BASELINE configuration;
- LENS_NO_REFLECTOR;
- LENS+REFLECTOR;
- actual dimensions/mass;
- orientation marks.

### D. Stand -> Processing

Человек 3 -> человек 1:

- BACKGROUND*.s2p;
- HOLDER*.s2p;
- REFERENCE*.s2p;
- BASELINE*.s2p;
- LENS_NO_REFLECTOR*.s2p;
- LENS_REFLECTOR*.s2p;
- журнал angle/distance/settings.

## Главное правило

Физически команда доказывает работу на `5 GHz / Ø240 mm`; для защиты показывает validated model и геометрически масштабированный расчёт `24 GHz / Ø50 mm`. Не смешивать эти два результата.
