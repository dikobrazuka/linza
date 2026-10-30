# Executable pipeline — LINZA

Дата: 2026-10-31

Этот файл связывает расчёт, изготовление и эксперимент в одну последовательность команд.

## 1. Material / geometry calibration

### T1

Protocol:

`docs/08_DE10_SPDR_T1_PROTOCOL.md`

Output:

- own `epsilon_solid(f)`;
- `tan_delta(f)` around 5 GHz.

### T2/T3

Protocol:

`docs/09_DE10_GYROID_T2_T3_PROTOCOL.md`

Generate T3 coupons:

```bash
python tools/uniform_sheet_gyroid_coupon.py \
  --size-x 30 --size-y 30 --size-z 15 \
  --cell 7.5 \
  --rho 0.10 0.15 0.20 0.30 0.40 0.50 0.65 0.81 0.90 \
  --voxel 0.075 \
  --out-dir artifacts/T3_gyroid_coupons
```

Outputs:

- `rho_min_print`;
- `rho_max_print`;
- cured solid density;
- shrinkage;
- measured `rho_actual`.

### Clamp impact

After T3:

```bash
python tools/analyze_profile_clamp.py \
  --rho-min <T3_RHO_MIN> \
  --rho-max <T3_RHO_MAX> \
  --out-prefix simulation/results/clamp/CLAMP_120
```

After T4 add:

```bash
  --calibration-csv data/materials/de10/DE10_GYROID_EPS_CAL_5GHz.csv
```

Outputs include:

- clipped volume fraction;
- max `epsilon` error;
- volume-weighted RMS `epsilon` error;
- ideal vs manufacturable average rho.

## 2. T4 effective dielectric calibration

Protocol:

`docs/12_T4_RF_GYROID_PROTOCOL.md`

Mandatory fixture gate:

`data/materials/de10/T4_FIXTURE_CARD.md`

Final output:

`data/materials/de10/DE10_GYROID_EPS_CAL_5GHz.csv`

Do not generate T4 RF coupon CAD before exact fixture geometry is known.

## 3. Material budget

```bash
python tools/material_budget.py \
  --diameters 120 150 180 240
```

After T2/T3 replace provisional density/clamps with measured values.

## 4. Ideal diameter gate

Meep environment:

```bash
conda env create -f environment-meep.yml
conda activate linza-meep
```

Ideal sweep:

```bash
python simulation/run_diameter_gate.py \
  --diameters 120 150 180 240 \
  --ppl 12 16 20
```

Analyze:

```bash
python simulation/analyze_diameter_gate.py
```

Select the smallest diameter that passes numerical + RF + material + stand gates.

## 5. Focus map

For the current Ø120 candidate:

```bash
python simulation/run_luneburg_focus_map.py \
  --diameter-mm 120 \
  --frequency-ghz 5 \
  --pixels-per-lambda 16
```

Outputs:

- `focus_x_mm`;
- focus offset from +surface;
- `peak_normalized_E2`;
- transverse FWHM;
- `.npz` field map.

This is the physical explanation layer for the defense: the lens reshapes phase and focuses the incident wave near the opposite surface.

## 6. Reflector sweep

```bash
python simulation/run_reflector_sweep.py \
  --diameter-mm 120 \
  --cap-half-angle-deg 15 30 45 60 90 \
  --cap-thickness-mm 1.0 \
  --pixels-per-lambda 16
```

For each cap:

- `BASELINE = reflector-only`;
- `TEST = ideal lens + identical reflector`;
- calculate `K_sigma`;
- calculate `Delta_sigma_dB`.

Do not lock reflector geometry from this ideal sweep alone. Repeat after T4/clamp/loss implementation.

## 7. Final gyroid geometry

After T1/T2/T3/T4:

```bash
python tools/continuous_luneburg_gyroid.py \
  --radius 60 \
  --cell 7.5 \
  --eps-solid <T1_EPS> \
  --rho-min <T3_RHO_MIN> \
  --rho-max <T3_RHO_MAX> \
  --calibration-csv data/materials/de10/DE10_GYROID_EPS_CAL_5GHz.csv \
  --solid-density <T2_DENSITY> \
  --out artifacts/TEST_LENS_5G_V1_upper.stl
```

Generate both hemispheres separately as required by the manufacturing plan.

## 8. Calibration sphere

Measure actual sphere diameter, then:

```bash
python tools/pec_sphere_rcs.py \
  --diameter-mm <MEASURED_SPHERE_DIAMETER> \
  --start-ghz 4 \
  --stop-ghz 6 \
  --points 1601 \
  --out data/experiment/5ghz/REFERENCE_RCS.csv
```

Protocol:

`docs/14_PEC_SPHERE_REFERENCE.md`

## 9. Physical RCS processing

Protocol:

`docs/13_RCS_S21_PROCESSING.md`

Relative:

```bash
python tools/process_rcs_s21.py \
  --background BACKGROUND.s2p \
  --baseline BASELINE.s2p \
  --test LENS_REFLECTOR.s2p \
  --gate-center-ns <MEASURED> \
  --gate-width-ns <MEASURED> \
  --out RCS_RELATIVE.csv
```

Absolute adds:

```bash
  --reference REFERENCE.s2p \
  --reference-rcs data/experiment/5ghz/REFERENCE_RCS.csv
```

## 10. 24-GHz strict scaling

```bash
python tools/scale_5_to_24.py \
  --diameter-5-mm <SELECTED_D5> \
  --cell-5-mm 7.5 \
  --mass-5-g <FINAL_MASS_5> \
  --min-wall-5-mm <MEASURED_OR_CAD_MIN_WALL> \
  --printer-min-wall-mm <24G_PROCESS_LIMIT>
```

Checks:

- final diameter <=80 mm;
- strict-scaled mass <=300 g;
- strict-scaled minimum wall against manufacturing capability.

Material similarity is explicitly marked as NOT PROVEN and requires separate 24-GHz dispersion/loss sensitivity.

## 11. Quality control

```bash
python -m pytest -q
```

GitHub Actions:

`.github/workflows/python-tests.yml`

Do not call the repo current if CI is red.
