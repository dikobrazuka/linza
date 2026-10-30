# BUILD MANUAL — TEST_LENS_5G_V1 @5 GHz

## 0. Target

Current physical V1 candidate:

- `D=120 mm`;
- `R=60 mm`;
- `f=5.0 GHz`;
- nominal gyroid `a=7.5 mm`.

Do not build/measure the full lens before the diameter gate passes in Meep.

## 1. RF chain

`VNA Port 1 -> TX antenna -> TARGET -> RX antenna -> VNA Port 2`.

Need:

1. 2-port setup stable around 5 GHz;
2. 2 identical directional antennas;
3. 2 RF cables;
4. calibration kit;
5. adapters;
6. complex `.s2p` export.

## 2. Geometry

At 5 GHz:

`lambda0≈59.96 mm`.

For D=120 mm:

`R_ff≈2D²/lambda≈0.48 m`.

Use starting target distance:

`1.0 m`.

Then repeat a reference configuration at:

- `1.25 m`;
- `1.50 m`.

If result changes strongly with distance/background/direct coupling, do not lock the final geometry yet.

## 3. Target stand

- dielectric/low-scatter support;
- rotation axis through target center;
- repeatable removable target interface;
- minimal material near target;
- stable base.

## 4. TX/RX base

- antennas rigidly fixed;
- same polarization;
- both aimed at target center;
- minimum practical separation without aperture overlap;
- record actual separation.

## 5. Calibration and setup

1. Warm up instrument.
2. 2-port calibration at cable ends / defined reference planes.
3. Connect antennas.
4. Fix cables mechanically.
5. Do not move cables between runs.
6. Record sweep, points, source power, IFBW/averaging if available.

## 6. Stand validation before lens

Measure:

1. BACKGROUND;
2. HOLDER;
3. metallic REFERENCE.

REFERENCE must produce a clear repeatable change relative to BACKGROUND.

If not, stop and fix alignment/dynamic range/background before measuring the lens.

## 7. Main configurations

Save separate complex files for:

- BACKGROUND;
- HOLDER;
- REFERENCE;
- BASELINE;
- LENS_NO_REFLECTOR;
- LENS_REFLECTOR.

Repeat key target placements at least 3 times.

## 8. Processing

Complex background subtraction:

`H_target=S21_target-S21_background`.

Relative metric:

`K_sigma=|H_test|²/|H_baseline|²`.

`Delta_sigma_dB=20*log10(|H_test|/|H_baseline|)`.

Project target:

`Delta_sigma_dB>=+10 dB`.

Use time-domain gating only if sweep bandwidth gives useful range resolution.

## 9. Angular sweep

Minimum:

`-30...+30 deg`, step `5 deg`.

Preferred final:

`-60...+60 deg`, step `5 deg`.

Move only target angle.

## 10. Distance sensitivity

At minimum perform REFERENCE and final LENS_REFLECTOR at:

- 1.0 m;
- 1.25 m;
- 1.5 m.

Goal: confirm measured gain is not an artifact of one room standing-wave geometry.

## 11. Diameter gate prerequisite

Before printing current Ø120 lens, Meep must compare:

`120 / 150 / 180 / 240 mm`.

Select smallest passing diameter based on:

- K_sigma;
- focus;
- angular response;
- loss sensitivity;
- material mass.

If Ø120 fails, update this manual to the selected diameter before manufacturing.

## 12. 24-GHz scaling

If Ø120 passes and is physically validated:

strict-scaled reference @24 GHz:

- `D=25 mm`;
- `R=12.5 mm`;
- `a=1.5625 mm`.

This is a calculated prediction, not a directly measured 24-GHz result.
