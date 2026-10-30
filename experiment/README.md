# Экспериментальный стенд — TEST_LENS_5G_V1 @5 GHz

## Цель

Физически проверить current V1 на `5.0 GHz` доступным measurement setup до ~6 GHz и сопоставить результат с Meep.

## Current physical target

- `D=120 mm`;
- `R=60 mm`;
- `a=7.5 mm`;
- `D/lambda0≈2.00`.

Ø240 mm остаётся только reference/comparison case.

Strict-scaled 24-GHz reference:

- `D=25.0 mm`;
- `R=12.5 mm`;
- `a=1.5625 mm`.

## Stand

`VNA Port 1 -> TX antenna -> TARGET -> RX antenna -> VNA Port 2`.

Measure complex `S21`.

## Geometry

At 5 GHz:

`lambda0≈59.96 mm`.

For D=120 mm:

`R_ff≈2D²/lambda≈0.48 m`.

Start distance:

`1.0–1.5 m`.

Check at minimum 1.0 / 1.25 / 1.5 m before final series to ensure result is not dominated by direct TX-RX coupling or room background.

## Configurations

1. BACKGROUND;
2. HOLDER;
3. REFERENCE;
4. BASELINE;
5. LENS_NO_REFLECTOR;
6. LENS_REFLECTOR.

`REFERENCE != BASELINE`.

## Processing

Complex subtraction:

`H_target(f)=S21_target(f)-S21_background(f)`.

Relative metric:

`K_sigma=|H_test|²/|H_baseline|²`.

`Delta_sigma_dB=20*log10(|H_test|/|H_baseline|)`.

Target:

`K_sigma>=10` <=> `Delta_sigma_dB>=+10 dB`.

Time-domain gating only if usable sweep bandwidth gives useful range resolution.

## Repeatability

Key configurations: minimum 3 independent target placements.

Angular sweep:

- minimum `-30...+30°`, step `5°`;
- preferred final `-60...+60°`, step `5°`.

## Diameter gate before manufacturing

Because current V1 is only ~2 wavelengths across, compare M9-style models for:

`D=120 / 150 / 180 / 240 mm`.

Full Ø120 print only after it demonstrates adequate focus/backscatter performance with margin.

## Final scaling statement

Physical evidence: Ø120 @5 GHz.

Strict-scaled prediction after model validation: Ø25 @24 GHz.

Do not claim physical validation at 24 GHz.
