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

This branch is still useful for either case, but the dielectric target must come from the selected EM design rather than being hard-coded from the material capability.

## 3. Material behavior

For colorFabb LW-PLA, manufacturer guidance indicates:

- low-temperature printing gives little or no foaming;
- active foaming becomes significant around the 220-230 C region depending on process settings;
- strong expansion occurs roughly in the 240-250 C range on representative machines;
- expansion depends on **temperature, speed and flow**, not temperature alone;
- the manufacturer demonstrates nearly 3x volume expansion and very large flow reduction in highly foamed conditions.

Therefore the correct process variable is not simply `T(r)` but a calibrated process map:

`rho_bulk = F(T, Q, v, layer_height, nozzle, material_batch, cooling, thermal_history)`.

Sources:

- https://colorfabb.com/3d-printing-lightweight-pla-parts
- https://support.colorfabb.com/hc/en-150/articles/360003022978-How-to-print-with-LW-PLA
- https://colorfabb.com/media/datasheets/tds/colorfabb/TDS_E_ColorFabb_LW-PLA.pdf

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

The exact values such as `190 C -> 250 C` and `100% -> 40% flow` are **not fixed design values**. They are only initial calibration ranges. Manufacturer data suggest a practical LW-PLA calibration should cover roughly `200-260 C` and determine the usable flow for the specific printer.

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
7. emit continuous G-code coordinates and extrusion;
8. emit thermal commands only at a spatial scale compatible with hotend dynamics.

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

- potentially no explicit lattice / TPMS is required;
- the gradient exists inside the deposited material itself;
- could produce an effectively much finer material scale than a 5-10 mm lattice;
- direct G-code gives full control over the radial law;
- FDM equipment is readily available.

## 9. Main risks

1. `epsilon_eff` may not be a stable single-valued function of nominal temperature.
2. Foaming may produce anisotropic / spatially irregular cellular structure.
3. Hotend thermal inertia may blur the intended radial profile.
4. Material residence time and path speed change expansion.
5. Density can vary by printer, nozzle, batch and moisture state.
6. Foaming may increase RF loss even if it lowers epsilon.
7. Inter-layer interfaces and strand orientation remain FDM anisotropy sources.
8. Repeated thermal transitions can make full-sphere production extremely slow.

## 10. Decision status

Do **not** discard.

Keep as an independent experimental route that could become very strong if the measured relationship

`epsilon_eff = f(rho_bulk)`

is smooth and low-loss and the process map

`rho_bulk = F(T,Q,v,...)`

is repeatable.

### Trigger to promote this branch

Promote from deferred to active if simple LW-PLA coupons demonstrate:

- a broad repeatable density range;
- a useful dielectric range covering most of `epsilon=1...2` for classic Luneburg;
- acceptable `tan(delta)` near 5 GHz;
- temperature/flow transitions whose spatial blur is small compared with the lens gradient length scale.

### First experiment

Before writing a complete lens G-code generator:

1. print a temperature/flow calibration matrix;
2. measure actual density;
3. select 5-8 distinct density states;
4. characterize RF properties;
5. only then fit continuous inverse functions and generate a radial gradient test coupon.
