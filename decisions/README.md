# Журнал инженерных решений

Старые решения не удалять: заменённые решения помечать `SUPERSEDED`.

## D-001 — конечный габарит и масса

Конечная конструкция для защиты: `<=80 mm`, `<=300 g`.

## D-002 — full-wave solver

Основной инструмент: **Meep**.

## D-003 — динамический сценарий

Если нужен натурный dynamic demo: движение по оси радара; боковой пролёт не основной сценарий.

## D-004 — критерий ×10

`K_sigma=sigma_test/sigma_baseline>=10`, то есть `+10 dB` по ЭПР/мощности. Reference target и project baseline — разные сущности.

## D-005 — количественный стенд

HB100/RCWL/CDM324/LD2410/Arduino не использовать как основной способ доказать ×10. Нужен complex reproducible RF measurement.

## D-006 — доступный измерительный диапазон

Physical RF validation around `5 GHz`; доступный measurement setup работает примерно до `6 GHz`.

## D-007 — 5 -> 15 GHz

`SUPERSEDED by D-021`.

Историческая пара: `Ø240 @5 -> Ø80 @15`.

## D-008 — similarity scaling

Принцип сохраняется: при строгом electromagnetic similarity абсолютная RCS приблизительно масштабируется как площадь, относительный `K_sigma` может сохраняться для подобных baseline/test geometries.

## D-009 — zoned models

6/8/11-zone — benchmark/fallback, не финальная geometry. 11-zone — основной zoned benchmark.

## D-010 — Luneburg law

`epsilon_r(r)=2-(r/R)^2`.

## D-011 — старый lattice nominal

`SUPERSEDED by D-020/D-024`.

## D-012 — reflector candidates

Сравнивать full sphere + PEC cap и hemisphere + ground plane; reflector size выбирать параметрически.

## D-013 — 5-GHz physical stand

`VNA Port1 -> TX -> TARGET -> RX -> Port2`, complex S21, BACKGROUND/HOLDER/REFERENCE/project configurations.

## D-014 — старая 5->15 формулировка

`SUPERSEDED by D-021`.

## D-015 — continuous GRIN target

Финальный target — continuous radial permittivity profile; zones только benchmark.

## D-016 — Orca/FDM continuous route

R&D / reserve.

## D-017 — non-planar FDM

Deferred R&D.

## D-018 — photopolymer radial TPMS

MSLA/DLP photopolymer route — primary MVP manufacturing route.

## D-019 — preserve negative branches

Исторические/R&D ветки сохранять с причиной, ограничениями и условиями возврата.

## D-020 — continuous sheet-gyroid

Primary geometry:

`G=sin(kx)cos(ky)+sin(ky)cos(kz)+sin(kz)cos(kx)`

`|G|<=h(r)`

Pipeline:

`epsilon_target -> rho -> h -> implicit geometry`.

## D-021 — 5 ->24 GHz scaling

Physical validation at 5 GHz; final defense calculation at 24 GHz. Linear scaling `k=5/24`.

Числа первоначально были записаны для Ø240 physical case; **size values superseded by D-025**, scaling law remains valid.

## D-022 — HARZ DE-10 primary MVP resin

Neat HARZ DE-10 primary. Manufacturer @10 GHz: mean `epsilon_r=2.30318`, mean `tan_delta=0.0024227`; own 5-GHz T1/T4 mandatory. Fillers R&D only.

## D-023 — physical calibration before full lens

Before full lens: T1 solid epsilon/loss -> T2 density/shrinkage -> T3 printability/rho_actual -> T4 gyroid epsilon_eff(rho,f).

## D-024 — nominal gyroid period

Nominal `a=7.5 mm` @5 GHz. Research sweep `5/7.5/10 mm`. Strict scaling to 24 GHz gives `a=1.5625 mm`.

---

## D-025 — current physical V1 diameter = 120 mm

**Дата:** 2026-10-31

**Решение:** заменить Ø240-mm physical V1 на **Ø120 mm @5 GHz** для первого полного photopolymer demonstrator.

Current physical V1:

- `f=5.0 GHz`;
- `D=120 mm`;
- `R=60 mm`;
- `lambda0≈59.96 mm`;
- `D/lambda0≈2.00`;
- nominal `a=7.5 mm`.

Strict-scaled 24-GHz reference:

- `k=5/24`;
- `D=25.0 mm`;
- `R=12.5 mm`;
- `a=1.5625 mm`.

**Причина:** material balance. Ø240 full sphere по provisional DE-10 law требует порядка нескольких килограммов cured resin и не совместим с planned 1-kg procurement. Для Ø120 provisional estimate составляет около `356 g` cured resin ideal/unclamped и около `366 g` при provisional `rho_min=0.12`, `rho_solid=1.1 g/cm³`.

**Критическое ограничение:** Ø120 = примерно `2 lambda0`, поэтому его RF performance нельзя считать достаточной автоматически.

До full print выполнить diameter gate:

- Ø120 current candidate;
- Ø150 comparison;
- Ø180 comparison;
- Ø240 historical/reference.

Сравнить `K_sigma`, `Delta_sigma_dB`, focus, spot width и angular response.

Если Ø120 не проходит objective с запасом, увеличить diameter до минимального passing value **до печати полной линзы**.

Far-field estimate for Ø120 @5 GHz:

`R_ff≈0.48 m`.

Start measurement distance:

`1.0–1.5 m`, затем проверить sensitivity/background/direct coupling.

---

## D-026 — code/calibration corrections after audit

**Дата:** 2026-10-31

1. `uniform_sheet_gyroid_coupon.py`: исправить broadcasting/box clipping и гарантировать closed marching-cubes envelope.
2. `continuous_luneburg_gyroid.py`: measured T4 CSV должен работать при отсутствии measured rho=0/1 coupons; физические endpoints добавляются автоматически:
   - `rho=0 -> epsilon=1`;
   - `rho=1 -> epsilon=epsilon_solid(T1)`.
3. Final manufacturing clamp всё равно задаётся measured `rho_min_print/rho_max_print` из T3.
4. Generator должен уметь оценивать full-sphere polymer volume/mass до печати.

## Governance rule

После изменения frequency/diameter/material/manufacturing route:

1. новое/superseding decision;
2. PROJECT_MEMORY + README;
3. full-repo consistency pass;
4. update experiment/simulation/budget/code;
5. smoke-test executable code;
6. только после этого считать репу актуальной.
