#!/usr/bin/env python3
"""Analyze diameter-gate convergence CSV and produce a machine-readable decision.

This tool does NOT invent the project baseline. It evaluates only what the
ideal DG-A sweep can prove:
- numerical convergence at the highest two resolutions;
- backscatter RCS trend versus diameter;
- smallest diameter whose highest-resolution result lies within a selectable
  dB penalty of the best simulated diameter.

The formal +10 dB project K_sigma gate still belongs to DG-B/M9 once the
reflector-only baseline is defined.
"""

from __future__ import annotations

import argparse
import csv
import json
from collections import defaultdict
from pathlib import Path


def read_rows(path: Path):
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
    if not rows:
        raise ValueError("Empty diameter-gate summary")
    return rows


def analyze(rows, convergence_gate_db: float, max_penalty_from_best_db: float):
    grouped = defaultdict(list)
    for row in rows:
        grouped[float(row["diameter_mm"])].append(row)

    per_diameter = []
    for d, items in sorted(grouped.items()):
        items.sort(key=lambda r: float(r["pixels_per_lambda"]))
        if len(items) < 2:
            raise ValueError(f"Diameter {d:g} mm has fewer than two resolutions")
        hi = items[-1]
        prev = items[-2]
        rcs_hi = float(hi["backscatter_rcs_dbsm"])
        rcs_prev = float(prev["backscatter_rcs_dbsm"])
        conv_delta = rcs_hi - rcs_prev
        per_diameter.append(
            {
                "diameter_mm": d,
                "D_over_lambda": float(hi["D_over_lambda"]),
                "highest_pixels_per_lambda": float(hi["pixels_per_lambda"]),
                "backscatter_rcs_dbsm_highest_resolution": rcs_hi,
                "convergence_delta_db": conv_delta,
                "convergence_pass": abs(conv_delta) < convergence_gate_db,
                "strict_scaled_D_24GHz_mm": float(hi["strict_scaled_D_24GHz_mm"]),
            }
        )

    converged = [r for r in per_diameter if r["convergence_pass"]]
    if not converged:
        return {
            "status": "NO_GO_NUMERICAL_CONVERGENCE",
            "convergence_gate_db": convergence_gate_db,
            "max_penalty_from_best_db": max_penalty_from_best_db,
            "diameters": per_diameter,
            "selected_diameter_mm": None,
        }

    best_rcs = max(r["backscatter_rcs_dbsm_highest_resolution"] for r in converged)
    for r in per_diameter:
        r["penalty_from_best_db"] = best_rcs - r["backscatter_rcs_dbsm_highest_resolution"]
        r["ideal_size_gate_pass"] = (
            r["convergence_pass"] and r["penalty_from_best_db"] <= max_penalty_from_best_db
        )

    passing = [r for r in per_diameter if r["ideal_size_gate_pass"]]
    selected = min(passing, key=lambda r: r["diameter_mm"]) if passing else None

    return {
        "status": "IDEAL_SIZE_CANDIDATE_FOUND" if selected else "NO_GO_IDEAL_SIZE_PENALTY",
        "scope": "DG-A ideal continuous lossless only; not formal project K_sigma gate",
        "convergence_gate_db": convergence_gate_db,
        "max_penalty_from_best_db": max_penalty_from_best_db,
        "best_converged_backscatter_rcs_dbsm": best_rcs,
        "selected_diameter_mm": None if selected is None else selected["diameter_mm"],
        "selected_strict_scaled_D_24GHz_mm": None if selected is None else selected["strict_scaled_D_24GHz_mm"],
        "diameters": per_diameter,
    }


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--input", type=Path, default=Path("simulation/results/diameter_gate/DIAMETER_GATE_IDEAL_CONVERGENCE.csv"))
    p.add_argument("--convergence-gate-db", type=float, default=0.5)
    p.add_argument(
        "--max-penalty-from-best-db",
        type=float,
        default=3.0,
        help="project screening choice for DG-A only; does not replace +10 dB K_sigma requirement",
    )
    p.add_argument("--out", type=Path, default=Path("simulation/results/diameter_gate/DIAMETER_GATE_IDEAL_DECISION.json"))
    args = p.parse_args()

    result = analyze(read_rows(args.input), args.convergence_gate_db, args.max_penalty_from_best_db)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(json.dumps(result, indent=2))
    print(args.out)


if __name__ == "__main__":
    main()
