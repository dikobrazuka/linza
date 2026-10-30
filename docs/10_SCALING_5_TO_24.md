# Каноническое масштабирование: 5 ГГц эксперимент -> 24 ГГц расчёт

Дата: 2026-10-31

## 1. Physical V1

Current physical candidate:

- `f_test=5.0 GHz`;
- `D_test=120 mm`;
- `R_test=60 mm`;
- `a_test=7.5 mm`;
- `lambda0≈59.96 mm`;
- `D/lambda0≈2.00`.

Ø120 должен пройти diameter gate в Meep до full print.

## 2. Strict frequency scaling

`k=f_test/f_final=5/24=0.2083333333`.

Все линейные размеры:

`L_24=L_5*(5/24)`.

Для current V1:

| parameter | 5 GHz physical | 24 GHz strict-scaled |
|---|---:|---:|
| f | 5.0 GHz | 24.0 GHz |
| D | 120 mm | 25.0 mm |
| R | 60 mm | 12.5 mm |
| gyroid a | 7.5 mm | 1.5625 mm |

## 3. Что сохраняется при ideal similarity

- `D/lambda`;
- `a/lambda`;
- `r/R`;
- ideal `epsilon(r/R)`;
- normalized reflector geometry;
- normalized angular behavior в идеальном случае.

## 4. Что НЕ переносится автоматически

- `epsilon_r(f)`;
- `tan_delta(f)`;
- roughness;
- minimum printable wall;
- cure blur;
- seam/gap;
- actual manufactured geometry.

Поэтому M10 @24 GHz = prediction/sensitivity, не physical validation.

## 5. RCS and mass scaling

`k=5/24`.

Approximate absolute RCS scaling under strict similarity:

`sigma_24/sigma_5≈k²≈1/23.04`.

Volume/mass geometric scaling:

`m_24/m_5≈k³≈1/110.592`.

Relative metric `K_sigma` may approximately preserve for geometrically similar baseline/test cases if material similarity holds.

## 6. Current material balance @5 GHz

For Ø120 sphere:

- envelope volume `≈904.78 cm³`;
- provisional Bruggeman volume-average rho `≈0.358`;
- cured resin estimate `≈356 g` at `rho_solid=1.1 g/cm³` without clamp;
- `≈366 g` with provisional `rho_min=0.12`.

Exact value must be recalculated after T2/T3/T4.

## 7. Diameter gate

Because `D≈2 lambda0`, full Ø120 print is allowed only after comparison against larger references:

`D=120 / 150 / 180 / 240 mm`.

Compare:

- peak `K_sigma`;
- `Delta_sigma_dB`;
- focus position;
- spot width;
- angular response.

If Ø120 does not meet the RF objective with margin, use the smallest passing diameter instead.

## 8. Defense wording

> Физическая верификация выполняется на 5-GHz demonstrator. Current V1 diameter is 120 mm, selected for material and experimental feasibility. After experiment-vs-Meep validation the geometry is scaled by 5/24; the strict-scaled 24-GHz reference has D=25 mm. Material dispersion and manufacturability at 24 GHz are treated separately.

## 9. Superseded sizes

- `Ø240 @5 -> Ø50 @24` is historical/reference after D-025;
- `Ø240 @5 -> Ø80 @15` is superseded;
- current working pair is `Ø120 @5 -> Ø25 @24`, subject to diameter GO before full print.
