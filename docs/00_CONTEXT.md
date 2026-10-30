# Контекст проекта

## Задача

Компактная пассивная GRIN/Luneburg-структура для увеличения обратного радиолокационного рассеяния/ЭПР.

## Ограничения конечной конструкции

- final design `<=80 mm`;
- final mass `<=300 g`;
- target calculation frequency `24 GHz`;
- project objective `K_sigma>=10`;
- physical experiment + reproducible methodology;
- Meep as primary full-wave solver.

## Physical validation

Available measurement setup works to about 6 GHz, therefore physical validation is at 5 GHz.

Current physical V1:

- `D=120 mm`;
- `R=60 mm`;
- `f=5.0 GHz`;
- `a=7.5 mm`;
- `D/lambda0≈2.0`.

Ø240 is no longer current V1; it is retained only as an electrical-size comparison/reference.

## 24-GHz strict scaling

`k=5/24`.

Current strict-scaled reference:

- `D=25 mm`;
- `R=12.5 mm`;
- `a=1.5625 mm`.

24-GHz result is prediction, not direct measurement.

## Manufacturing route

Primary:

`HARZ DE-10 -> continuous radial sheet-gyroid -> MSLA/DLP`.

Pipeline:

`epsilon_target(r) -> rho(r) -> h(r) -> geometry`.

FDM/LW-PLA/fillers are R&D branches.

## Material feasibility

For Ø120 provisional Bruggeman:

- sphere envelope ≈904.78 cm³;
- average rho≈0.358;
- cured resin ≈356 g unclamped or ≈366 g with provisional rho_min=0.12 at density 1.1 g/cm³.

Exact mass is recalculated after T2/T3/T4.

## RF feasibility gate

Because Ø120 is only about 2 wavelengths across, full print is allowed only after Meep comparison against larger diameters. Current comparison set:

`120 / 150 / 180 / 240 mm`.

Choose the smallest diameter that still passes the RF objective with margin.

## Workflow

1. T1 solid DE-10.
2. T2 density/shrinkage.
3. T3 gyroid printability/rho_actual.
4. T4 epsilon_eff(rho,f).
5. M0-M8.
6. Diameter gate.
7. M9 current passing physical diameter.
8. Material-budget gate.
9. Tech segment.
10. Full physical print.
11. 5-GHz experiment.
12. Meep validation.
13. M10 strict 5/24 scaling.
