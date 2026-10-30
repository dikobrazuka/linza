#!/usr/bin/env python3
"""Run/aggregate the ideal 5-GHz diameter gate with Meep.

This orchestrates simulation/run_ideal_luneburg_rcs.py for several diameters
and resolutions, then writes a convergence summary. It intentionally evaluates
DG-A (ideal continuous Luneburg) only. Project K_sigma vs a formal baseline is
added later in M9/DG-B after baseline/reflector are fixed.

Examples:
    python simulation/run_diameter_gate.py --dry-run
    python simulation/run_diameter_gate.py --diameters 120 150 --ppl 12 16 20
"""

from __future__ import annotations

import argparse
import csv
import json
import subprocess
import sys
from pathlib import Path


DEFAULT_DIAMETERS = [120.0, 150.0, 180.0, 240.0]
DEFAULT_PPL = [12.0, 16.0, 20.0]


def tag(diameter_mm: float, ppl: float) -> str:
    return f"D{int(round(diameter_mm))}_PPL{int(round(ppl))}"


def command_for(
    python_exe: str,
    runner: Path,
    diameter_mm: float,
    ppl: float,
    frequency_ghz: float,
    out_dir: Path,
):
    return [
        python_exe,
        str(runner),
        "--diameter-mm",
        str(diameter_mm),
        "--frequency-ghz",
        str(frequency_ghz),
        "--pixels-per-lambda",
        str(ppl),
        "--out-dir",
        str(out_dir),
    ]


def load_meta(out_dir: Path, diameter_mm: float, ppl: float):
    path = out_dir / f"{tag(diameter_mm, ppl)}_META.json"
    if not path.exists():
        raise FileNotFoundError(path)
    return json.loads(path.read_text(encoding="utf-8"))


def summarize(diameters, ppls, out_dir: Path, convergence_gate_db: float):
    rows = []
    for d in diameters:
        previous = None
        for ppl in ppls:
            meta = load_meta(out_dir, d, ppl)
            rcs_dbsm = float(meta["backscatter_rcs_dbsm"])
            delta_from_previous = None if previous is None else rcs_dbsm - previous
            convergence_pass = None
            if previous is not None:
                convergence_pass = abs(delta_from_previous) < convergence_gate_db
            rows.append(
                {
                    "diameter_mm": d,
                    "D_over_lambda": meta["D_over_lambda"],
                    "pixels_per_lambda": ppl,
                    "backscatter_rcs_dbsm": rcs_dbsm,
                    "delta_from_previous_resolution_db": delta_from_previous,
                    "convergence_gate_db": convergence_gate_db,
                    "convergence_pass": convergence_pass,
                    "strict_scaled_D_24GHz_mm": d * 5.0 / 24.0,
                }
            )
            previous = rcs_dbsm
    return rows


def write_summary(rows, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--diameters", nargs="+", type=float, default=DEFAULT_DIAMETERS)
    p.add_argument("--ppl", nargs="+", type=float, default=DEFAULT_PPL, help="pixels per wavelength")
    p.add_argument("--frequency-ghz", type=float, default=5.0)
    p.add_argument("--convergence-gate-db", type=float, default=0.5)
    p.add_argument("--out-dir", type=Path, default=Path("simulation/results/diameter_gate/ideal"))
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--skip-existing", action="store_true")
    args = p.parse_args()

    if sorted(args.ppl) != args.ppl:
        raise SystemExit("--ppl values must be supplied in increasing order")
    if len(args.ppl) < 2:
        raise SystemExit("Need at least two resolutions for convergence")

    runner = Path(__file__).resolve().parent / "run_ideal_luneburg_rcs.py"
    args.out_dir.mkdir(parents=True, exist_ok=True)

    for d in args.diameters:
        for ppl in args.ppl:
            meta_path = args.out_dir / f"{tag(d, ppl)}_META.json"
            cmd = command_for(
                sys.executable,
                runner,
                d,
                ppl,
                args.frequency_ghz,
                args.out_dir,
            )
            print(" ".join(cmd), flush=True)
            if args.dry_run:
                continue
            if args.skip_existing and meta_path.exists():
                print(f"SKIP existing {meta_path}", flush=True)
                continue
            subprocess.run(cmd, check=True)

    if args.dry_run:
        return

    rows = summarize(
        args.diameters,
        args.ppl,
        args.out_dir,
        args.convergence_gate_db,
    )
    summary_path = args.out_dir.parent / "DIAMETER_GATE_IDEAL_CONVERGENCE.csv"
    write_summary(rows, summary_path)
    print(summary_path)


if __name__ == "__main__":
    main()
