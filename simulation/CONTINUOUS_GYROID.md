# Continuous Luneburg sheet-gyroid

Дата: 2026-10-30

## Цель

Сделать одну связную 3D TPMS-структуру, в которой локальная доля фотополимера меняется непрерывно с радиусом и реализует профиль классической линзы Люнеберга.

6/8/11-zone модели остаются benchmark, не final geometry.

## 1. Целевая электродинамика

`epsilon_target(r) = 2 - (r/R)^2`

`r = sqrt(x^2+y^2+z^2)`.

Для физического `TEST_LENS_5G_V1`:

- `R=120 mm`;
- `D=240 mm`;
- `f=5.0 GHz`;
- nominal `a=7.5 mm`.

Для scaled 24-GHz prediction:

- scale `5/24`;
- `R=25 mm`;
- `D=50 mm`;
- nominal `a=1.5625 mm`.

## 2. epsilon -> volume fraction

Нужна функция:

`epsilon_eff = F(rho)`

где `rho` — локальная объёмная доля cured DE-10.

До собственного T4 допускается provisional symmetric Bruggeman resin+air:

`rho*(eps_s-eps)/(eps_s+2eps) + (1-rho)*(1-eps)/(1+2eps) = 0`.

Текущий provisional material input — HARZ DE-10 manufacturer mean @10 GHz:

`eps_solid = 2.30318`.

Для center target `epsilon_eff=2`:

`rho_center ≈0.806`.

Это только предварительная оценка. После T4 генератор должен использовать measured CSV `rho,epsilon_eff` около 5 GHz.

У поверхности ideal profile требует `epsilon->1`, то есть математически `rho->0`. Реальная структура ограничивается экспериментальными `rho_min_print/rho_max_print` из T3.

## 3. TPMS-функция

Classic gyroid:

`G(x,y,z)=sin(kx)cos(ky)+sin(ky)cos(kz)+sin(kz)cos(kx)`.

`k=2*pi/a`.

Период `a` по радиусу не меняется в основной architecture. Градиент создаётся threshold, а не растяжением lattice.

## 4. Sheet gyroid

Material domain:

`|G(x,y,z)| <= h`.

Для continuous radial gradient:

`h=h(r)`.

Implicit field:

`S(x,y,z)=h(sqrt(x²+y²+z²))-|G(x,y,z)|`.

Material exists where:

`S>=0`.

Таким образом локальная volume fraction меняется непрерывно, без внутренних границ зон.

## 5. Полная цепочка

`r`

`-> epsilon_target(r)`

`-> rho_required(r)=F^-1(epsilon_target)`

`-> technological clamp from T3`

`-> h(r)=H^-1(rho_used)`

`-> implicit geometry`

`-> mesh`

`-> MSLA/DLP slicing`.

`H(h)` — численно рассчитанная зависимость sheet-gyroid volume fraction от threshold.

## 6. Почему sheet-gyroid

Основные причины:

- одна связная 3D structure;
- open communicating channels полезны для washing;
- более изотропная topology, чем oriented line/grid infill;
- `rho` управляется одним scalar threshold;
- обычный planar MSLA/DLP может изготовить заранее рассчитанную radial 3D geometry;
- удобно отдельно моделировать unit-cell physics.

Изотропность и homogenization должны быть подтверждены T4/M7.

## 7. Генератор

Файл:

`tools/continuous_luneburg_gyroid.py`.

Поддерживает:

- ideal Luneburg profile;
- provisional Bruggeman;
- measured calibration CSV `rho,epsilon_eff`;
- numerical `h <-> rho` calibration;
- continuous radial `h(r)`;
- upper/lower/full geometry;
- STL + radial profile CSV.

После T4 финальный workflow обязан использовать `--calibration-csv`.

## 8. Current nominal parameters

5-GHz MVP:

- `a=7.5 mm` nominal;
- `5/7.5/10 mm` — sensitivity sweep only;
- provisional `eps_solid=2.30318` from DE-10 @10 GHz;
- provisional `rho_min/rho_max` не считать process truth.

T3 determines:

- `rho_min_print`;
- `rho_max_print`;
- `h -> rho_actual`.

T4 determines:

- `rho_actual -> epsilon_eff(rho,f)`;
- effective loss;
- repeatability;
- anisotropy.

## 9. Meep comparison

Minimum:

1. M3 ideal continuous material function;
2. M6 homogenized manufacturable GRIN;
3. M7 explicit periodic gyroid/coupon;
4. M8 reduced explicit finite geometry;
5. 11-zone benchmark;
6. loss sensitivity;
7. cell-size sensitivity;
8. reflector M9.

Acceptance of homogenized model requires reasonable agreement with T4/M7 and no unacceptable lattice scattering/anisotropy.

## 10. Scaling 5 ->24 GHz

Ideal geometric scale:

`k=5/24=0.2083333`.

Nominal period:

`7.5 mm -> 1.5625 mm`.

The mathematical gyroid and normalized `rho(r/R)` remain the same under ideal scaling.

But physical manufacturability does NOT automatically scale:

- wall thickness also shrinks 4.8×;
- cure blur does not scale automatically;
- printer pixel/layer size does not scale;
- resin dispersion/loss changes with frequency.

Therefore `FINAL_LENS_24G` is a calculated prediction plus manufacturability sensitivity until physically manufactured/measured.

## 11. Главная оговорка

`Continuous` describes the mathematical field. The printed object is discretized by:

- mesh/voxel resolution;
- LCD/DLP pixel size;
- layer height;
- cure blur;
- minimum wall;
- washing/post-cure distortion.

The engineering question is whether these errors are small enough relative to the RF scale and whether measured `epsilon_eff(rho)` remains close to the designed radial law.
