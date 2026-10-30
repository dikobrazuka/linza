# Полный consistency-audit репозитория LINZA

Дата: 2026-10-30

Причина: предыдущие актуализации были точечными и оставили старую ветку `5 GHz -> 15 GHz`, physical 24-GHz stand и FDM-MVP в нескольких файлах. Этот audit выполнен по полному дереву репозитория.

## Каноническая версия, относительно которой проверены файлы

Физическая верификация:

- `TEST_LENS_5G_V1`;
- `f=5.0 GHz`;
- `D=240 mm`;
- `R=120 mm`;
- nominal `a=7.5 mm`;
- measurement setup примерно до 6 GHz.

Финальная расчётная версия для защиты:

- `f=24.0 GHz`;
- scale `5/24=0.2083333`;
- `D=50.0 mm`;
- `R=25.0 mm`;
- nominal `a=1.5625 mm`.

Primary manufacturing route:

`HARZ DE-10 -> photopolymer continuous radial sheet-gyroid`.

FDM/PLA Aero/LW-PLA/TiO2 filler — R&D/backup.

## Проверка каждого файла

| Файл | Статус после аудита | Что сделано |
|---|---|---|
| `README.md` | UPDATED | canonical 5-GHz validation -> Ø50 @24-GHz calculation |
| `PROJECT_MEMORY.md` | UPDATED | заменён главный source of truth; добавлено governance rule |
| `budget/README.md` | UPDATED | убран обязательный 24-GHz VNA/WR-42; добавлен 5-GHz stand и DE-10 1 kg = 14k RUB |
| `data/README.md` | UPDATED | T1-T4 + complex `.s2p` + M0-M10; старый threshold/detected format убран из primary path |
| `decisions/README.md` | UPDATED | old D-007/D-014/D-011 marked superseded; D-021..D-024 added |
| `docs/00_CONTEXT.md` | UPDATED | clarified final <=80-mm limit vs physical Ø240 demonstrator |
| `docs/01_REQUIREMENTS.md` | UPDATED | removed mandatory FDM; final target 24 GHz Ø50 |
| `docs/02_PLAN.md` | UPDATED | replaced 5->15 route by 5->24 route |
| `docs/03_TEAM.md` | UPDATED | removed physical 24.125-GHz/Ø80/FDM assignments |
| `docs/04_NEXT_ACTIONS.md` | UPDATED | T1-T4, M0-M10, physical 5 GHz, M10 Ø50 @24 GHz |
| `docs/05_BEGINNER_GUIDE.md` | UPDATED | corrected scaling and primary manufacturing route |
| `docs/06_DESIGN_SPACE_AND_REASONING.md` | CHECKED / KEEP | historical design-space file; current primary photopolymer/gyroid and deferred FDM branches already represented; historical branches intentionally preserved |
| `docs/07_CALCULATION_WORKFLOW.md` | UPDATED | rewritten M0-M10; M10 = Ø50 @24 GHz |
| `docs/08_DE10_SPDR_T1_PROTOCOL.md` | CHECKED / KEEP | current T1 protocol; no obsolete 15/24-GHz physical path |
| `docs/09_DE10_GYROID_T2_T3_PROTOCOL.md` | CHECKED / KEEP | current T2/T3 protocol; nominal a=7.5 and current rho series |
| `docs/10_SCALING_5_TO_24.md` | NEW | canonical scaling rule and limitations |
| `experiment/BUILD_MANUAL.md` | UPDATED | completely rewritten from 24.125-GHz/WR-42/Ø80 to 5-GHz/Ø240 stand |
| `experiment/README.md` | UPDATED | physical 5 GHz -> calculated Ø50 @24 GHz |
| `materials/HARZ_TIO2_COMPOSITE.md` | UPDATED | downgraded from active MVP to R&D/backup behind neat DE-10 |
| `materials/LOCAL_RU_RESINS.md` | UPDATED | DE-10 stock/price/1-kg plan and 5->24 validation path |
| `materials/LWPLA_THERMAL_GRADIENT.md` | CHECKED / KEEP | explicitly deferred R&D; no conflict with primary route |
| `materials/RESIN_CANDIDATES.md` | UPDATED | current DE-10 procurement and T1-T4 path; filler R&D only |
| `photo_log/README.md` | UPDATED | T1-T4 + Ø240 physical demonstrator + calculated Ø50 @24; removed <=80-mm requirement from physical sample |
| `references/README.md` | CHECKED / KEEP | reference index; no active project-state conflict |
| `simulation/CALCULATIONS.md` | UPDATED | scale 5/24, Ø50 @24, a=7.5, DE-10 provisional, RCS scaling 1/23.04 |
| `simulation/CONTINUOUS_GYROID.md` | UPDATED | DE-10 eps 2.30318, rho_center≈0.806, a24=1.5625 |
| `simulation/GYROID_CELL_SWEEP.md` | UPDATED | removed Arkema 2.19 as active assumption; current T3 series/DE-10 |
| `simulation/INPUTS_TEMPLATE.yaml` | UPDATED | explicit physical validation and final_target sections; rho limits null until T3 |
| `simulation/README.md` | UPDATED | M10 Ø50 @24; old Ø80@15 main pair removed |
| `tools/continuous_luneburg_gyroid.py` | UPDATED | default provisional `eps_solid 2.19 -> 2.30318`; measured CSV still final path |
| `tools/uniform_sheet_gyroid_coupon.py` | CHECKED / KEEP | current T3 geometry and rho series; no scaling/material-route conflict |

## Старые значения: допустимые остаточные упоминания

Некоторые старые значения могут намеренно оставаться только в историческом контексте:

- `15 GHz` — допустимо только если явно сказано, что это старая/superseded или optional intermediate research point;
- `Ø80 mm` — допустимо как исходное ограничение эксперта `<=80 mm` или историческая superseded branch, но не как current physical sample;
- `FDM` — допустимо как R&D/history, но не primary MVP;
- `2.19` — допустимо только как literature value Arkema N3D-DIELEC731, не current DE-10 default;
- `24.125 GHz`, `WR-42`, `TARGET_CLAMP_80` — не должны оставаться как current physical stand requirements.

## Source-of-truth order после аудита

При конфликте читать в этом порядке:

1. `decisions/README.md` — newest non-superseded decision;
2. `PROJECT_MEMORY.md`;
3. `README.md`;
4. `docs/04_NEXT_ACTIONS.md`;
5. stage-specific protocol;
6. historical design-space/reference documents.

## Governance rule

Фраза «актуализировать GitHub» для этого проекта означает:

1. update decision;
2. update project memory;
3. update root README;
4. search full repository for obsolete values;
5. update every active instruction affected by the change;
6. preserve old branches only when explicitly marked historical/R&D/superseded;
7. perform a second consistency pass before declaring the repository updated.
