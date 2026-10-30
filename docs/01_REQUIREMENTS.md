# Требования и критерии успеха

## 1. Конечная конструкция для защиты

- расчётная частота: `24 GHz`;
- габарит `<=80 mm`;
- масса `<=300 g`;
- пассивная конструкция;
- primary manufacturing route: photopolymer continuous radial sheet-gyroid;
- Meep — основной full-wave solver.

Current strict-scaled reference from physical V1:

- `D=25.0 mm`;
- `R=12.5 mm`;
- `a=1.5625 mm`.

## 2. Physical validation

Current physical V1 candidate:

- `f=5.0 GHz`;
- `D=120 mm`;
- `R=60 mm`;
- `a=7.5 mm`;
- available setup to ~6 GHz;
- start distance `1.0–1.5 m`.

Because `D/lambda0≈2`, this diameter must pass the numerical diameter gate before full print.

## 3. Main metric

`K_sigma=sigma_test/sigma_baseline`.

Success target:

`K_sigma>=10`;
`Delta_sigma_dB>=+10 dB`.

## 4. Mandatory evidence

- own DE-10 epsilon/tan(delta) @~5 GHz;
- cured density/shrinkage;
- real gyroid printability limits;
- measured epsilon_eff(rho,f);
- focus position/spot;
- angular response;
- repeatability;
- anisotropy;
- material-loss sensitivity;
- seam sensitivity;
- model vs experiment comparison;
- 24-GHz prediction with dispersion/manufacturability sensitivity.

## 5. Pre-print gates

Full physical lens may be printed only after both gates pass:

### RF gate

Compare at least `D=120/150/180/240 mm` in Meep and select the smallest passing diameter.

### Material gate

Recalculate full-lens polymer volume/mass using T2/T3/T4 and confirm available DE-10 reserve is sufficient.

Current provisional Ø120 mass estimate: about `356–366 g` cured resin depending on clamp assumptions.

## 6. Completion criteria

1. T1-T4 closed.
2. M0-M8 reproducible.
3. Diameter selected by RF gate.
4. Material budget passes.
5. Tech segment passes wash/cure/geometry checks.
6. Physical 5-GHz lens printed and measured.
7. Experimental `K_sigma` quantified.
8. Meep reproduces physical trend.
9. M10 strict 5/24 scaling calculated.
10. Defense package clearly separates measured 5-GHz evidence from calculated 24-GHz prediction.
