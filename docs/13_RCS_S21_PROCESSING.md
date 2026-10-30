# RCS processing: VNA S21 -> relative gain / absolute sigma

Дата: 2026-10-31

## 1. Цель

Одинаково обрабатывать физический 5-GHz эксперимент и не смешивать:

- raw `S21`;
- background-subtracted complex field;
- gated target response;
- relative RCS ratio `K_sigma`;
- absolute RCS `sigma`, если есть valid calibration target.

Главное правило: **никакого вычитания в dB или по модулю.** Вычитание фона выполняется только в комплексной форме.

## 2. Минимальный набор измерений

При неизменной геометрии стенда и одной VNA calibration:

1. `BACKGROUND.s2p` — target position пустая, holder removed if possible;
2. `HOLDER.s2p` — holder only;
3. `REFERENCE.s2p` — calibration target с известной/рассчитанной `sigma_ref(f)`;
4. `BASELINE.s2p` — reflector-only configuration;
5. `LENS_NO_REFLECTOR.s2p`;
6. `LENS_REFLECTOR.s2p`;
7. `REFERENCE_REPEAT.s2p`;
8. `BACKGROUND_REPEAT.s2p`.

Для key cases минимум 3 independent placements.

## 3. Частотная сетка

Все сравниваемые Touchstone-файлы должны иметь:

- одинаковые frequency points;
- одинаковый start/stop;
- одинаковое число точек;
- одинаковую VNA calibration;
- одинаковые cables/antennas/stand geometry.

Если сетки не совпадают — pipeline останавливается. Интерполяция complex S21 для primary result по умолчанию запрещена.

## 4. Complex background subtraction

Для каждого target state:

`S_corr(f) = S_target(f) - S_background(f)`.

То же самое для calibration target:

`S_ref,corr(f) = S_reference(f) - S_background(f)`.

Почему: RCS measurement является coherent field measurement. Background/clutter складываются с target field комплексно, поэтому magnitude-only subtraction физически неверен.

NIST отдельно рассматривает background subtraction как ключевую часть coherent RCS calibration/measurement; современные NIST RCS procedures также используют calibration target + background subtraction + delay gating.

## 5. Delay/time gate

Цель gate — отделить отклик target region от direct TX-RX coupling и удалённых multipath reflections.

Для равномерной frequency grid:

`df = f[i+1]-f[i]`.

Комплексный baseband impulse response:

`h(t) = IFFT(S_corr(f))`.

Временной шаг:

`dt = 1/(N*df)`.

Unambiguous delay window:

`T = 1/df`.

Gate задаётся в ns:

- `gate_center_ns` — ожидаемая задержка target path;
- `gate_width_ns` — ширина окна.

После умножения `h(t)` на плавное gate-window:

`S_gated(f) = FFT(h(t)*w(t))`.

### Важное ограничение

Если bandwidth слишком мал, range/time resolution недостаточна, чтобы разнести target и clutter. Gate не должен использоваться как способ «нарисовать» желаемый результат.

## 6. Relative RCS — основной проектный metric

Canonical baseline проекта:

**BASELINE = reflector-only** в той же позиции и ориентации.

Test:

**TEST = lens + reflector**.

После одинаковой background subtraction и одинакового time gate:

`K_sigma(f) = |S_TEST,gated(f) / S_BASELINE,gated(f)|^2`.

В dB:

`Delta_sigma_dB(f) = 20*log10(|S_TEST,gated/S_BASELINE,gated|)`.

Project target:

`K_sigma >= 10`

или

`Delta_sigma_dB >= +10 dB`.

Это относительный metric; calibration sphere для него не обязательна, но reference-repeat нужен для контроля drift.

## 7. Absolute RCS

Если calibration target имеет valid `sigma_ref(f)`:

`sigma_DUT(f) = sigma_ref(f) * |S_DUT,gated(f) / S_REF,gated(f)|^2`.

`RCS_dBsm = 10*log10(sigma_DUT / 1 m^2)`.

### Calibration sphere

Не использовать автоматически:

`sigma = pi*r^2`

как «точную» RCS сферы. Это optical-limit approximation. Для выбранной sphere @5 GHz сохранить отдельный файл `REFERENCE_RCS.csv` с рассчитанной exact/full-wave/Mie value versus frequency.

Required columns:

`frequency_hz,sigma_ref_m2`

## 8. Drift check

До принятия результата сравнить:

- `REFERENCE` vs `REFERENCE_REPEAT`;
- `BACKGROUND` vs `BACKGROUND_REPEAT`.

Минимум сохранять:

- complex difference;
- amplitude drift dB;
- phase drift deg;
- target frequency 5.0 GHz;
- full sweep plots/data.

Если reference drift сравним с заявленным `Delta_sigma_dB`, результат не считается доказательным.

## 9. Repeatability

Для каждого key state минимум 3 placements.

На 5.0 GHz сохранять:

- mean `Delta_sigma_dB`;
- standard deviation;
- min/max;
- raw values;
- position/orientation ID.

Нельзя усреднять dB до complex/background processing. Сначала каждый placement обрабатывается отдельно, потом агрегируется конечный scalar metric.

## 10. Angular sweep

Для каждого angle применяется та же схема:

`BACKGROUND(theta)` если background заметно меняется с поворотом,
или validated common background, если stand rotation не меняет environment.

Минимум:

`theta = -30...+30 deg`, step `5 deg`.

Preferred:

`-60...+60 deg`.

Основные outputs:

- `Delta_sigma_dB(theta)` @5 GHz;
- `sigma_dBsm(theta)` при absolute calibration;
- peak;
- angular width above selected threshold.

## 11. Data contract

Raw files:

`data/experiment/5ghz/raw/<run_id>/`

Processed:

`data/experiment/5ghz/processed/<run_id>/`

Per run сохранить:

- `BACKGROUND.s2p`;
- `REFERENCE.s2p`;
- `BASELINE.s2p`;
- `LENS_REFLECTOR.s2p`;
- `RUN_META.json`;
- `REFERENCE_RCS.csv` if absolute calibration is used;
- processed CSV outputs;
- gate parameters.

## 12. Processing tool

Use:

`tools/process_rcs_s21.py`.

Relative example:

```bash
python tools/process_rcs_s21.py \
  --background BACKGROUND.s2p \
  --baseline BASELINE.s2p \
  --test LENS_REFLECTOR.s2p \
  --gate-center-ns 6.7 \
  --gate-width-ns 2.0 \
  --out RCS_RELATIVE.csv
```

Absolute calibration adds:

```bash
  --reference REFERENCE.s2p \
  --reference-rcs REFERENCE_RCS.csv
```

`gate-center-ns` above is only syntax example, **not a project value**. Actual delay must come from measured time response / known path geometry.

## 13. PASS/FAIL

A physical RCS result is accepted only if:

1. frequency grids match;
2. background subtraction is complex;
3. gate is documented and sensitivity-checked;
4. key placements repeated >=3;
5. reference repeat demonstrates acceptable drift;
6. `Delta_sigma_dB` is reported relative to explicitly named baseline;
7. absolute dBsm is reported only when `sigma_ref(f)` is valid.
