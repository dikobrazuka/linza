# LW-PLA thermal-gradient GRIN branch

Date: 2026-10-29

Status: **deferred experimental branch / alternative manufacturing concept**.

This file preserves the idea even if the photopolymer TPMS branch remains the main path.

## 1. Core idea

Use active-foaming FDM filament (LW-PLA or similar) as a locally variable dielectric material.

Instead of changing lattice geometry to change `epsilon_eff`, change the amount of gas generated inside the extruded polymer by changing process conditions.

Conceptual chain:

`r -> epsilon_target(r) -> target bulk density rho_bulk(r) -> printing state [T, flow, speed] -> foamed polymer -> epsilon_eff(r)`.

The key hypothesis is that lower bulk density caused by foaming lowers the effective dielectric permittivity because the printed strand becomes a polymer/air composite.

This must be measured; it is not valid to assume a universal direct `temperature -> epsilon` law.

## 2. Important correction to the target epsilon

For the **classic Luneburg lens** used elsewhere in this project:

`epsilon_target(r) = 2 - (r/R)^2`,

so the center target is `epsilon=2`, not `2.5-3.0`.

A core `epsilon ~2.5-3.0` would correspond to a different / modified GRIN law and must be treated as a separate lens design.

Important distinction: **material permittivity is not the same as target lens permittivity.** Dense PLA can have `epsilon_r ~2.6-2.8` or higher while the classic Luneburg center still targets `epsilon_eff=2`. In that case the material must already be partially foamed/porous at the center.

## 3. Material behavior

For colorFabb LW-PLA, manufacturer guidance indicates:

- low-temperature printing gives little or no foaming;
- active foaming becomes significant around the 220-230 C region depending on process settings;
- strong expansion occurs roughly in the 240-250 C range on representative machines;
- expansion depends on **temperature, speed and flow**, not temperature alone;
- the manufacturer demonstrates nearly 3x volume expansion and very large flow reduction in highly foamed conditions.

Therefore the correct process variable is not simply `T(r)` but a calibrated process map:

`rho_bulk = F(T, Q, v, layer_height, nozzle, material_batch, cooling, thermal_history)`.

Manufacturer sources:

- https://colorfabb.com/3d-printing-lightweight-pla-parts
- https://support.colorfabb.com/hc/en-150/articles/360003022978-How-to-print-with-LW-PLA
- https://colorfabb.com/media/datasheets/tds/colorfabb/TDS_E_ColorFabb_LW-PLA.pdf

## 3A. Direct dielectric measurements of foamed PLA — very important

A 2026 PhD thesis by Valentin Daniel Paccoia reports dielectric characterization of foamed PLA as a function of extrusion temperature.

Measured values:

| T, C | porosity | epsilon_r | tan(delta) |
|---:|---:|---:|---:|
| 200 | 0.06 | 2.60 | 0.010 |
| 210 | 0.07 | 2.57 | 0.007 |
| 220 | 0.26 | 2.17 | 0.004 |
| 230 | 0.51 | 1.72 | 0.004 |
| 240 | 0.59 | 1.58 | 0.003 |
| 250 | 0.59 | 1.55 | 0.003 |
| 260 | 0.60 | 1.59 | 0.003 |

The lowest-porosity sample at 200 C still contained about 6% air and measured `epsilon_r=2.60`. Fitting effective-medium models gave an estimated pure-PLA permittivity of approximately `epsilon_PLA=2.74`. The thesis notes consistency with published values around `2.71-2.75` for dense printed PLA.

This directly confirms the original intuition that dense PLA/LW-PLA can start around `epsilon ~2.6-2.8` and that active foaming can push it substantially downward.

Source:

Valentin Daniel Paccoia, *Development of Chipless RFID Sensors on 3D-Printed Biocompatible Substrates for Environmental Monitoring*, PhD thesis, University of Perugia, 2026, Chapter 5, dielectric characterization of foamed PLA.

### Critical consequence for our Luneburg profile

This data makes the LW-PLA branch **more credible**, but also exposes its main limit.

Classic Luneburg requires:

`epsilon_target(r) = 2 - (r/R)^2`

which spans:

`2.0 -> 1.0`.

The measured foaming-only range in the cited experiment is approximately:

`2.60 -> 1.55`.

Therefore:

- the material can easily cross the required center value `epsilon=2`;
- dense/unfoamed material is actually *too high* for the classic Luneburg center;
- the center should use a partially foamed state;
- **foaming alone did not reach epsilon close to 1** in that process.

For the ideal Luneburg law, `epsilon=1.55` occurs at:

`r/R = sqrt(2 - 1.55) = 0.671`.

So with that measured material/process, foaming alone can approximately cover the inner `67%` of lens radius. The outer `33%` of radius requires `epsilon < 1.55` and therefore likely needs additional macroscopic air fraction / geometry control.

This suggests a new **hybrid route**:

`inner region: continuous microcellular foaming control`

`outer region: foaming + geometric porosity / sparse lattice / controlled gaps`

or, more generally:

`epsilon_target -> [foam porosity + macro-geometry porosity]`.

This hybrid may be stronger than either plain LW-PLA or plain infill alone.

### Approximate center condition

Using the measured points, the classic center target `epsilon=2` lies between the 220 C (`2.17`) and 230 C (`1.72`) states. A naive linear interpolation gives a temperature around `224 C`, but this must **not** be treated as a final print setting because the response depends on flow, speed, residence time and hotend dynamics.

The correct workflow is to measure our own process map.

## 4. Original direct-G-code concept

### Geometry

For every toolpath point:

`r = sqrt((x-x0)^2 + (y-y0)^2 + (z-z0)^2)`.

The script maps `r` to the required material state.

Initial path concept:

- conventional planar Z layers;
- concentric rings around the lens axis;
- inside-to-outside order within a layer.

### Process mapping

Original conceptual mapping:

- dense / low-foam state near the core;
- strongly foamed / low-density state toward the surface;
- simultaneous compensation of extrusion flow because foamed material expands.

After the dielectric data above, this wording must be refined for classic Luneburg:

- the center should **not** be fully dense if dense PLA has `epsilon > 2`;
- the process should start from whatever partially foamed state produces `epsilon_eff ~2`;
- foaming should increase continuously outward until the material reaches its minimum achievable `epsilon`;
- beyond that radius, geometry must introduce additional air if the target continues toward `epsilon=1`.

The exact values such as `190 C -> 250 C` and `100% -> 40% flow` are **not fixed design values**. They are only initial calibration ranges.

## 5. Direct G-code generator architecture

Suggested Python pipeline:

1. generate layer contour / concentric path;
2. sample each path by arc length;
3. calculate 3D radius `r` at every sample;
4. calculate `epsilon_target(r)`;
5. use measured inverse calibration to get target bulk density:
   `rho_bulk_target = F_epsilon^-1(epsilon_target)`;
6. use process calibration to choose temperature / flow / speed:
   `[T,Q,v] = F_process^-1(rho_bulk_target)`;
7. when `epsilon_target` falls below the minimum achievable by foam alone, introduce a second geometry variable controlling macroscopic air fraction;
8. emit continuous G-code coordinates and extrusion;
9. emit thermal commands only at a spatial scale compatible with hotend dynamics.

## 6. Major issue: hotend thermal inertia

The original idea of using `M109` for every density ring is robust conceptually but probably too slow and too discrete.

Problems:

- hotend temperature cannot change instantaneously;
- the melt already inside the heat zone represents previous thermal history;
- foaming depends on residence time as well as nominal setpoint;
- every `M109` stop creates a seam / dwell / oozing event;
- cooling from high-foam to dense state every layer could dominate print time.

Therefore a more advanced implementation should compare:

### Mode A — discrete thermal rings

- print one radial band;
- park on purge tower;
- wait for stable temperature;
- purge melt corresponding to previous state;
- return and print next band.

Advantages: easy to calibrate and understand.

Disadvantages: very slow, many discontinuities.

### Mode B — continuous thermal trajectory

- use `M104` setpoint ramps rather than stopping at every ring;
- model thermal lag;
- compensate setpoint spatially in advance;
- preferably print a continuous spiral rather than separate rings.

Potentially much smoother, but requires system identification of the hotend response.

### Mode C — hold temperature and vary flow/speed

Because active foaming depends on flow and residence time too, it may be possible to keep the hotend near one strongly foaming temperature and vary effective density mainly through flow/speed.

This could be significantly easier than repeatedly heating/cooling the hotend and should be experimentally tested.

## 7. Required calibration

This branch requires two independent maps.

### A. Process -> physical density

Print calibration specimens over a grid such as:

- temperature: 200 / 210 / 220 / 230 / 240 / 250 / 260 C;
- flow: multiple values around the usable range;
- at fixed speed/nozzle/layer height first.

Measure:

- mass;
- external volume;
- bulk density;
- strand / wall dimensions;
- repeatability.

### B. Physical density -> dielectric properties

At selected densities, measure near the project frequency:

- `epsilon_eff`;
- `tan(delta)`.

The useful engineering chain is then:

`epsilon_target -> bulk density -> process parameters`,

not simply

`epsilon_target -> nozzle temperature`.

## 8. Why this branch is attractive

- potentially no explicit lattice / TPMS is required in the inner part of the lens;
- the gradient exists inside the deposited material itself;
- could produce an effectively much finer material scale than a 5-10 mm lattice;
- direct G-code gives full control over the radial law;
- measured literature data already demonstrate a large `epsilon` tuning range;
- measured loss tangent in the cited foamed-PLA work fell from about `0.010` to about `0.003` as foaming increased, which is promising for RF use;
- FDM equipment is readily available.

## 9. Main risks

1. `epsilon_eff` may not be a stable single-valued function of nominal temperature.
2. Foaming may produce anisotropic / spatially irregular cellular structure.
3. Hotend thermal inertia may blur the intended radial profile.
4. Material residence time and path speed change expansion.
5. Density can vary by printer, nozzle, batch and moisture state.
6. Loss tangent must be re-measured on our exact material/process despite promising literature data.
7. Inter-layer interfaces and strand orientation remain FDM anisotropy sources.
8. Repeated thermal transitions can make full-sphere production extremely slow.
9. Foaming alone may bottom out around `epsilon~1.5-1.6`, leaving the outer Luneburg region unrealized without additional geometry porosity.

## 10. Decision status

Do **not** discard.

The 2026 dielectric measurements upgrade this from a speculative idea to a **physically supported experimental branch**.

The most interesting current form is a hybrid continuous medium:

`inner radius: process-controlled microfoaming`

`outer radius: microfoaming + continuously increasing macro-porosity`.

### Trigger to promote this branch

Promote from deferred to active if our own LW-PLA coupons demonstrate:

- reproducible `epsilon ~2` center state;
- smooth controllable decrease toward the high-foaming limit;
- acceptable `tan(delta)` around 5 GHz;
- a manufacturable hybrid method for the outer `epsilon < ~1.55` region;
- thermal/process transition blur small relative to the lens gradient length scale.

### First experiment

Before writing a complete lens G-code generator:

1. print a temperature/flow calibration matrix;
2. measure actual density;
3. select 5-8 distinct density states;
4. characterize RF properties;
5. determine minimum `epsilon` achievable by foam alone;
6. test hybrid foam + macro-porosity coupons below that value;
7. only then fit continuous inverse functions and generate a radial gradient test coupon.
