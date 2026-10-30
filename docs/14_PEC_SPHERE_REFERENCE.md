# PEC sphere calibration reference

Дата: 2026-10-31

## 1. Назначение

Для absolute RCS calibration физического 5-GHz стенда использовать металлическую сферу с рассчитанной monostatic RCS `sigma_ref(f)`.

Нельзя автоматически подставлять `sigma=pi*a^2`, потому что это optical-limit approximation. При конечном размере `ka` в диапазоне 4–6 GHz сфера может находиться в Rayleigh/Mie/resonance region.

## 2. Расчёт

Используется PEC Mie-series backscatter solution.

Size parameter:

`x = k*a = 2*pi*a/lambda`.

Normalized monostatic RCS:

`sigma/(pi*a^2) = 4/x^2 * |sum((-1)^n (n+1/2)(a_n-b_n))|^2`.

PEC coefficients:

`a_n = -[x j_n(x)]' / [x h_n^(1)(x)]'`

`b_n = -j_n(x) / h_n^(1)(x)`.

Tool:

`tools/pec_sphere_rcs.py`.

## 3. Output

Primary calibration contract:

`frequency_hz,sigma_ref_m2`

Additional diagnostic columns:

- `sigma_ref_dbsm`;
- `size_parameter_x`;
- `normalized_rcs_sigma_over_pi_a2`;
- `optical_pi_a2_m2`;
- `mie_minus_optical_db`.

## 4. Example

For a known physical sphere diameter `D_sphere`:

```bash
python tools/pec_sphere_rcs.py \
  --diameter-mm D_sphere \
  --start-ghz 4 \
  --stop-ghz 6 \
  --points 1601 \
  --out data/experiment/5ghz/REFERENCE_RCS.csv
```

Do not invent `D_sphere`; measure the actual metal sphere diameter with calipers/micrometer and record it in `RUN_META.json`.

## 5. Verification gates

Before using the file for absolute calibration:

1. actual sphere diameter measured and recorded;
2. conductor is effectively metallic/PEC at 5 GHz;
3. sphere is mechanically isolated from a large conductive support as much as practical;
4. sphere position equals DUT reference position;
5. frequency grid covers the measured VNA grid;
6. calculated curve is visually inspected for Mie resonances;
7. optical approximation is shown only as a comparison, never as the primary calibration unless `ka` is demonstrably in the asymptotic regime.

## 6. Cross-checks

Unit tests shall verify:

- Rayleigh limit scales as approximately `9*x^4` for `x << 1`;
- high-frequency `sigma/(pi*a^2) -> 1`;
- `sigma > 0` on the full project frequency range.

## 7. Sources

The implementation follows standard PEC sphere Mie-series scattering relations. NIST/NASA benchmark literature treats the metallic sphere as a canonical RCS standard and explicitly shows the Rayleigh, Mie/resonance and optical regions rather than assuming `pi*a^2` at all frequencies.
