#!/usr/bin/env python3
"""Quantify how rho_min/rho_max manufacturing clamps distort a Luneburg profile.

This tool uses the same dielectric mapping as continuous_luneburg_gyroid.py and
reports radial/volume-weighted error metrics. It is intended to be rerun after
T3 updates rho_min_print/rho_max_print and after T4 supplies measured
rho<->epsilon calibration.
"""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path

import numpy as np

from tools.continuous_luneburg_gyroid import (
    bruggeman_rho_from_epsilon,
    load_measured_calibration,
    luneburg_epsilon,
    rho_from_epsilon,
)


def epsilon_from_rho(rho: np.ndarray, eps_solid: float, calibration_csv: Path | None):
    rho = np.asarray(rho, dtype=float)
    if calibration_csv is None:
        e = np.linspace(1.0, eps_solid, 20001)
        r = bruggeman_rho_from_epsilon(e, eps_solid)
        return np.interp(rho, r, e)
    rho_tab, eps_tab = load_measured_calibration(calibration_csv, eps_solid)
    return np.interp(rho, rho_tab, eps_tab)


def analyze(
    radius_mm: float,
    eps_solid: float,
    rho_min: float,
    rho_max: float,
    calibration_csv: Path | None = None,
    samples: int = 20001,
):
    if radius_mm <= 0:
        raise ValueError("radius must be positive")
    if not (0.0 <= rho_min <= rho_max <= 1.0):
        raise ValueError("Require 0 <= rho_min <= rho_max <= 1")

    r = np.linspace(0.0, radius_mm, samples)
    q = r / radius_mm
    eps_target = luneburg_epsilon(r, radius_mm)
    rho_required = rho_from_epsilon(eps_target, eps_solid, calibration_csv)
    rho_used = np.clip(rho_required, rho_min, rho_max)
    eps_used = epsilon_from_rho(rho_used, eps_solid, calibration_csv)
    eps_error = eps_used - eps_target

    # Spherical volume weighting: dV proportional to r^2 dr.
    w = q * q
    den = float(np.trapezoid(w, q))
    rms_eps = float(np.sqrt(np.trapezoid(eps_error * eps_error * w, q) / den))
    mean_abs_eps = float(np.trapezoid(np.abs(eps_error) * w, q) / den)

    low_mask = rho_required < rho_min
    high_mask = rho_required > rho_max
    low_volume_fraction = float(np.trapezoid(low_mask.astype(float) * w, q) / den)
    high_volume_fraction = float(np.trapezoid(high_mask.astype(float) * w, q) / den)

    # Volume-average resin fractions, useful for material estimates.
    avg_rho_required = float(np.trapezoid(rho_required * w, q) / den)
    avg_rho_used = float(np.trapezoid(rho_used * w, q) / den)

    # Radius at which clipping begins/ends, expressed as r/R.
    low_indices = np.flatnonzero(low_mask)
    high_indices = np.flatnonzero(high_mask)
    low_clip_inner_q = float(q[low_indices[0]]) if low_indices.size else None
    high_clip_outer_q = float(q[high_indices[-1]]) if high_indices.size else None

    summary = {
        "radius_mm": radius_mm,
        "diameter_mm": 2.0 * radius_mm,
        "eps_solid": eps_solid,
        "rho_min": rho_min,
        "rho_max": rho_max,
        "calibration_csv": str(calibration_csv) if calibration_csv else None,
        "max_abs_epsilon_error": float(np.max(np.abs(eps_error))),
        "volume_weighted_rms_epsilon_error": rms_eps,
        "volume_weighted_mean_abs_epsilon_error": mean_abs_eps,
        "low_density_clipped_volume_fraction": low_volume_fraction,
        "high_density_clipped_volume_fraction": high_volume_fraction,
        "total_clipped_volume_fraction": low_volume_fraction + high_volume_fraction,
        "volume_average_rho_required": avg_rho_required,
        "volume_average_rho_used": avg_rho_used,
        "low_density_clip_starts_r_over_R": low_clip_inner_q,
        "high_density_clip_extends_to_r_over_R": high_clip_outer_q,
    }
    rows = [
        {
            "r_mm": float(rr),
            "r_over_R": float(qq),
            "epsilon_target": float(et),
            "rho_required": float(rq),
            "rho_used": float(ru),
            "epsilon_used": float(eu),
            "epsilon_error": float(er),
            "low_clipped": bool(lc),
            "high_clipped": bool(hc),
        }
        for rr, qq, et, rq, ru, eu, er, lc, hc in zip(
            r, q, eps_target, rho_required, rho_used, eps_used, eps_error, low_mask, high_mask
        )
    ]
    return summary, rows


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--radius-mm", type=float, default=60.0)
    p.add_argument("--eps-solid", type=float, default=2.30318)
    p.add_argument("--rho-min", type=float, required=True)
    p.add_argument("--rho-max", type=float, required=True)
    p.add_argument("--calibration-csv", type=Path, default=None)
    p.add_argument("--samples", type=int, default=20001)
    p.add_argument("--out-prefix", type=Path, default=Path("profile_clamp"))
    args = p.parse_args()

    summary, rows = analyze(
        args.radius_mm,
        args.eps_solid,
        args.rho_min,
        args.rho_max,
        args.calibration_csv,
        args.samples,
    )

    csv_path = args.out_prefix.with_suffix(".csv")
    json_path = args.out_prefix.with_suffix(".json")
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    with csv_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    json_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    print(json.dumps(summary, indent=2))
    print(csv_path)
    print(json_path)


if __name__ == "__main__":
    main()
