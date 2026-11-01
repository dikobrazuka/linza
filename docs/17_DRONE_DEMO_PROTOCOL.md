# FPV drone application demo — 5 GHz

Дата: 2026-11-01

## Роль дрона

Карбоновый FPV-дрон используется **не как основной критерий успеха линзы**, а как дополнительный прикладной демонстратор.

Основной controlled test проекта остаётся:

`reflector-only -> lens + identical reflector`.

Критерий `Kσ >= 10` / `Delta_sigma >= +10 dB` относится именно к этому isolated test.

FPV demo отвечает на другой вопрос:

> заметен ли эффект полного retroreflector assembly на реальном карбоновом БПЛА, у которого уже есть собственные сильные scattering centers?

Отрицательный результат допустим и интерпретируется как ограничение применения на данном airframe/геометрии, а не как автоматический провал основной концепции.

## Почему карбоновый FPV интересен

Carbon-fiber UAV обычно имеет более сильную собственную radar signature, чем сопоставимый пластиковый аппарат. Поэтому FPV frame создаёт более жёсткий фон для retroreflector.

Следствие:

- положительный эффект на таком объекте — сильный прикладной результат;
- слабый/нулевой эффект тоже полезен: можно показать, что собственное рассеяние карбоновой рамы и электроники маскирует вклад линзы.

## Дрон

Используется обычный FPV quadcopter, бесплатно предоставленный знакомым.

В смете:

`FPV drone = 0 RUB`.

До измерений записать:

- wheelbase;
- максимальный размер корпуса/пропеллеров;
- массу;
- материал рамы;
- battery installed yes/no;
- положение батареи;
- положение антенн;
- тип и положение пропеллеров.

## Только статический тест

Для основного VNA experiment:

- motors OFF;
- flight controller / VTX / ELRS / Wi-Fi / video transmitter OFF;
- желательно весь борт полностью обесточить;
- батарея либо всегда установлена, либо всегда снята — состояние не менять между comparative runs;
- propeller orientation фиксируется;
- дрон не летает во время VNA sweep.

Причина: движение, вращение винтов и работа передатчиков ухудшают когерентность и повторяемость S21.

## Проверка дальней зоны

Перед экспериментом измерить максимальный габарит **всей сборки FPV + линза**:

`D_max`.

На 5 GHz:

`lambda0 ≈ 59.96 mm`.

Оценка дальней зоны:

`R_ff ≈ 2 D_max^2 / lambda0`.

Примеры:

- D=200 mm -> R_ff≈1.33 m;
- D=250 mm -> R_ff≈2.08 m;
- D=300 mm -> R_ff≈3.00 m;
- D=350 mm -> R_ff≈4.09 m.

Обычный 5-inch FPV вместе с пропеллерами и Ø120-mm линзой может потребовать дистанцию порядка нескольких метров.

Если помещение не позволяет обеспечить `R >= R_ff`:

- всё равно можно выполнить **relative comparison** при абсолютно одинаковой geometry;
- но результат не называть строгой absolute far-field RCS;
- в отчёте обозначить его как `relative coherent scattering / relative RCS proxy`;
- absolute dBsm в таком режиме не делать главным результатом.

## Крепление линзы

Поскольку Ø120-mm 5-GHz demonstrator крупный и тяжёлый, этот тест не является flight payload validation.

Линза крепится статически к дрону через low-scatter adapter:

- foam;
- тонкий dielectric polymer;
- nylon line;
- минимум металла.

Optical axis линзы при 0° направляется на TX/RX.

Metallic cap находится на дальней от радара стороне sphere.

Крепление должно позволять снять/установить линзу без изменения положения самого дрона.

## Measurement states

### D0 — BACKGROUND

Стенд + support/turntable, без дрона.

### D1 — DRONE_BARE

FPV на holder:

- motors OFF;
- RF electronics OFF;
- одинаковое положение battery/props.

### D2 — DRONE_HOLDER

FPV + полный dielectric adapter для линзы, но без линзы.

Это отделяет влияние механического крепления.

### D3 — DRONE_LENS_REFLECTOR

FPV + тот же adapter + полный Ø120 Luneburg sphere + выбранный reflector cap.

### D4 — DRONE_REFLECTOR_ONLY — optional

Только если можно физически воспроизвести reflector/support без dielectric lens так, чтобы geometry была честной.

Если это неудобно — не изобретать искусственный baseline. Для UAV demo достаточно D1/D2/D3.

## Основные сравнения

Полный прикладной эффект:

`Delta_drone = 20 log10(|S_D3,corr / S_D1,corr|)`.

Вклад относительно holder:

`Delta_assembly = 20 log10(|S_D3,corr / S_D2,corr|)`.

Где:

`S_state,corr = S_state - S_background`

только в complex form.

Для drone demo **нет требования +10 dB**.

Записывается фактический результат и его repeatability.

## Центральная методика

Сначала только `0°`.

Для D1, D2, D3:

1. установить объект;
2. снять complex `.s2p`;
3. полностью снять объект с holder;
4. заново установить;
5. повторить минимум 3 раза.

Так измеряется чувствительность к repositioning.

## Angular sweep

Если 0° measurement стабильный:

- минимум `-60° ... +60°`;
- шаг `10°`;
- одинаковая convention по yaw;
- для каждого угла снять D1 и D3;
- D2 достаточно снять на ключевых углах `0°, ±30°, ±60°`.

Full `0...360°` sweep — optional.

## Reference sphere

До drone series:

1. BACKGROUND;
2. metallic reference sphere;
3. убедиться, что reference response уверенно выше background;
4. затем не менять RF geometry.

Reference sphere нужна для контроля стенда и, при корректной far-field/calibration geometry, для absolute RCS.

Для FPV demo primary metric остаётся relative change.

## Что сохранять

Для каждого run:

- raw `.s2p`;
- drone angle;
- state D0/D1/D2/D3;
- distance;
- antenna polarization;
- VNA settings;
- battery state;
- prop position;
- фото сборки;
- положение lens center относительно frame;
- reflector half-angle.

## Как интерпретировать результат

### Если enhancement большой

Вывод: retroreflector assembly заметно увеличивает coherent backscatter даже на фоне carbon-fiber FPV airframe.

### Если enhancement небольшой, но повторяемый

Вывод: эффект присутствует, но частично маскируется собственным scattering карбоновой рамы/электроники.

### Если enhancement статистически неразличим

Вывод: для данного FPV airframe, ориентации и 5-GHz demonstrator вклад retroreflector не выделяется над собственной UAV signature/positioning variation.

Это не отменяет isolated lens result.

### Если результат нестабилен

Сначала проверить:

- support scattering;
- distance;
- direct TX-RX coupling;
- repositioning;
- работающую электронику дрона;
- изменение prop/battery geometry;
- background drift.

## Источники

- UAV material/aspect dependence: IEEE Access, Analyzing Radar Cross Section Signatures of Diverse Drone Models at mmWave Frequencies, DOI 10.1109/ACCESS.2020.2979339.
- Stationary rotating UAV measurement methodology: Electronics 2022, 11, 2502.
- NIST coherent background separation for RCS measurements.
- NIST metal-sphere calibration for multipoint RCS measurements.
