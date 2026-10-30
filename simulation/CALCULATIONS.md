# Расчёты TEST_LENS_5G_V1 -> FINAL_LENS_24G

## 1. Physical V1 @5 GHz

- `f=5.0 GHz`;
- `D=120 mm`;
- `R=60 mm`;
- `lambda0≈59.96 mm`;
- `D/lambda0≈2.00`;
- nominal gyroid `a=7.5 mm`.

At Luneburg center `epsilon=2`:

`lambda_center≈42.40 mm`.

`a/lambda0≈0.1251`;
`a/lambda_center≈0.1769`.

## 2. Strict-scaled @24 GHz

`k=5/24=0.2083333333`.

- `D_24=25.000 mm`;
- `R_24=12.500 mm`;
- `a_24=1.5625 mm`;
- `lambda0_24≈12.491 mm`;
- `D/lambda0≈2.00`.

## 3. Ideal profile

`epsilon_r(r)=2-(r/R)^2`.

For current V1 `R=60 mm`.

## 4. Provisional DE-10 / Bruggeman

Manufacturer @10 GHz:

`epsilon_solid=2.30318`.

Center target `epsilon=2` requires approximately:

`rho_center≈0.806`.

Numerically integrated ideal/unclamped volume-average solid fraction:

`rho_avg≈0.35818`.

Sphere envelope:

`V=4/3*pi*60^3=904,778.7 mm^3=904.78 cm^3`.

At provisional cured density `1.1 g/cm^3`:

- unclamped material mass `≈356.5 g`;
- with provisional `rho_min=0.12`, `rho_max=0.90`: `≈366.4 g`.

These are planning numbers only. Final calculation must use T2 density + T3 limits + T4 measured law.

## 5. Diameter gate

Current V1 is only `2 lambda0` in diameter. Compare before full print:

| D @5 GHz | D/lambda0 | strict-scaled D @24 GHz |
|---:|---:|---:|
| 120 mm | 2.00 | 25.0 mm |
| 150 mm | 2.50 | 31.25 mm |
| 180 mm | 3.00 | 37.5 mm |
| 240 mm | 4.00 | 50.0 mm |

Choose the smallest diameter that meets the RF objective with margin.

## 6. Far-field estimate

For `D=0.12 m`, `lambda≈0.05996 m`:

`R_ff≈2D^2/lambda≈0.48 m`.

Start physical measurements at `1.0–1.5 m`, then verify distance sensitivity and background/direct coupling.

## 7. Project metric

`K_sigma=sigma_test/sigma_baseline`.

Target:

`K_sigma>=10`;
`Delta_sigma_dB>=+10 dB`.

## 8. Reflector sweep

For full sphere:

`alpha=15/30/45/60/90 deg`.

Compare with hemisphere + ground plane.

## 9. Scaling

Absolute RCS under strict similarity:

`sigma_24/sigma_5≈(5/24)^2≈1/23.04`.

Volume/mass:

`m_24/m_5≈(5/24)^3≈1/110.592`.

Do not automatically transfer epsilon/loss/manufacturing tolerances from 5 to 24 GHz.
