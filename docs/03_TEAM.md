# Командные задачи

## RF / modelling

- M0-M8 reproducible Meep ladder.
- Diameter gate: `120/150/180/240 mm` @5 GHz.
- Select smallest passing D.
- M9 reflector optimization for selected D.
- Experiment-vs-Meep validation.
- M10 strict 5/24 scaling to 24 GHz.

## Material / process

- DE-10 process lock.
- T1 solid epsilon/tan(delta).
- T2 density/shrinkage.
- T3 gyroid printability/rho_actual.
- T4 epsilon_eff(rho,f), repeatability, anisotropy.

## CAD / manufacturing

Current physical candidate:

- `D=120 mm`, `R=60 mm`;
- `a=7.5 mm`;
- two open hemispheres preferred.

Do not release full-print STL before diameter gate + material-budget gate.

After GO:

1. measured-law geometry;
2. alignment features;
3. technological segment;
4. full physical lens;
5. selected reflector.

## Experiment

For current Ø120 case:

- start distance `1.0–1.5 m`;
- complex S21;
- BACKGROUND/HOLDER/REFERENCE/BASELINE/LENS_NO_REFLECTOR/LENS+REFLECTOR;
- minimum 3 reinstall repeats;
- angular sweep.

## Documentation

Keep explicit separation:

- measured 5-GHz data;
- numerical validation;
- strict-scaled 24-GHz prediction;
- manufacturing/dispersion limitations.
