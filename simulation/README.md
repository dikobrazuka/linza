# Расчёты и моделирование — Meep

Основной full-wave инструмент проекта — **Meep**.

Главный workflow:

`docs/07_CALCULATION_WORKFLOW.md`.

Canonical run template:

`simulation/INPUTS_TEMPLATE.yaml`.

## 1. Физически валидируемый объект

`TEST_LENS_5G_V1`:

- `f=5.0 GHz`;
- `D=240 mm`;
- `R=120 mm`;
- `lambda0≈59.96 mm`;
- nominal `a=7.5 mm`.

Физический setup работает примерно до 6 GHz.

## 2. Финальный расчёт для защиты

После validation M9 vs physical experiment:

`k=5/24=0.2083333`.

`FINAL_LENS_24G`:

- `f=24.0 GHz`;
- `D=50.0 mm`;
- `R=25.0 mm`;
- nominal `a=1.5625 mm`.

Это M10 prediction, не physical 24-GHz measurement.

Старая main pair `Ø80 @15 GHz` отменена.

## 3. Material scenario

Primary material: HARZ DE-10.

Manufacturer @10 GHz, 11 samples:

- mean `epsilon_r=2.30318`;
- range `2.187...2.384`;
- mean `tan(delta)=0.0024227`;
- range `0.00184...0.00310`.

Until T1/T4 these are provisional sensitivity inputs only.

Final 5-GHz M6-M9 must use own measured data.

M10 @24 GHz must include material-dispersion/loss sensitivity if direct 24-GHz DE-10 data are unavailable.

## 4. Fixed model ladder

1. `M0` — background;
2. `M1` — numerical scattering reference;
3. `M2` — homogeneous sphere control;
4. `M3` — ideal continuous Luneburg, lossless;
5. `M4` — loss sensitivity;
6. `M5` — 11-zone benchmark + one 6/8-zone comparison;
7. `M6` — homogenized manufacturable continuous GRIN;
8. `M7` — explicit periodic gyroid/coupon;
9. `M8` — reduced explicit validation;
10. `M9` — validated 5-GHz whole lens + reflector;
11. `M10` — scaled Ø50-mm @24-GHz prediction.

## 5. Multi-scale rule

Do not start with full explicit Ø240-mm gyroid.

- **micro:** explicit unit-cell/coupon -> `epsilon_eff(rho)`, anisotropy, lattice scattering, loss;
- **macro:** whole lens -> homogenized measured `epsilon_realized(r)`.

Full explicit whole lens is optional validation only if compute resources permit.

## 6. Gyroid

`G=sin(kx)cos(ky)+sin(ky)cos(kz)+sin(kz)cos(kx)`.

`k=2*pi/a`.

Sheet material:

`|G|<=h(r)`.

Pipeline:

`epsilon_target(r) -> rho(r) -> h(r) -> geometry`.

Nominal 5-GHz period:

`a=7.5 mm`.

Sensitivity only:

`5 / 7.5 / 10 mm`.

## 7. Reflector

M9 first architecture:

`full sphere + PEC cap`.

Cap half-angle sweep:

`15/30/45/60/90 deg`.

Then compare with:

`hemisphere + PEC ground plane`.

## 8. Outputs per run

Save:

- config YAML;
- focus position;
- -3/-6 dB spot size where relevant;
- complex scattered response;
- `K_sigma(f,theta)`;
- `Delta_sigma_dB(f,theta)`;
- loss sensitivity;
- resolution convergence;
- raw fields/data;
- `RESULT.md`.

Main metric:

`K_sigma>=10` <=> `Delta_sigma_dB>=+10 dB`.

## 9. Numerical convergence

Current gate:

- `Delta_sigma_dB` changes `<0.5 dB` after resolution increase;
- focus position changes `<1% R`.

## 10. M10 requirements

M10 cannot be just a geometry scale command.

Run at least:

1. ideal scaled material assumption;
2. epsilon dispersion sensitivity;
3. tan(delta) sensitivity;
4. min-feature/manufacturability sensitivity;
5. seam sensitivity.

Every M10 result must be marked `CALCULATED_PREDICTION` unless physically tested at 24 GHz later.
