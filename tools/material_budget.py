#!/usr/bin/env python3
"""Estimate cured resin volume/mass for a spherical Luneburg GRIN.

Default model is provisional symmetric Bruggeman for HARZ DE-10 + air.
The script is intentionally independent of trimesh/skimage so it can run
before geometry generation and be used as a procurement/full-print gate.

Examples:
    python tools/material_budget.py
    python tools/material_budget.py --diameters 120 150 180 240 --rho-min 0.12
    python tools/material_budget.py --solid-density 1.08 --rho-min 0.18 --rho-max 0.82
"""

from __future__ import annotations

import argparse
import csv
import math
from pathlib import Path

import numpy as np


DEFAULT_DIAMETERS = [120.0, 150.0, 180.0, 240.0]


def bruggeman_rho_from_epsilon(eps_eff: np.ndarray, eps_solid: float) -> np.ndarray:
    e = np.asarray(eps_eff, dtype=np.float64)
    es = float(eps_solid)
    if es <= 1.0:
        raise ValueError("eps_solid must be > 1")
    if np.any(e < 1.0 - 1e-12) or np.any(e > es + 1e-12):
        raise ValueError("Requested epsilon is outside [1, eps_solid]")
    A = (es - e) / (es + 2.0 * e)
    B = (1.0 - e) / (1.0 + 2.0 * e)
    return np.clip(-B / (A - B), 0.0, 1.0)


def average_rho(
    eps_solid: float,
    rho_min: float,
    rho_max: float,
    samples: int = 200_001,
) -> float:
    if not (0.0 <= rho_min <= rho_max <= 1.0):
        raise ValueError("Require 0 <= rho_min <= rho_max <= 1")
    q = np.linspace(0.0, 1.0, samples, dtype=np.float64)
    eps_target = 2.0 - q * q
    rho = bruggeman_rho_from_epsilon(eps_target, eps_solid)
    rho = np.clip(rho, rho_min, rho_max)
    # Volume average over a sphere: 3 * integral_0^1 rho(q) q^2 dq.
    return float(3.0 * np.trapezoid(rho * q * q, q))


def sphere_envelope_cm3(diameter_mm: float) -> float:
    if diameter_mm <= 0:
        raise ValueError("diameter must be positive")
    r_mm = diameter_mm / 2.0
    return (4.0 / 3.0 * math.pi * r_mm**3) / 1000.0


def build_rows(
    diameters_mm: list[float],
    eps_solid: float,
    solid_density_g_cm3: float,
    rho_min: float,
    rho_max: float,
    available_resin_g: float,
    reserve_g: float,
):
    avg_rho = average_rho(eps_solid, rho_min, rho_max)
    usable_g = max(0.0, available_resin_g - reserve_g)
    rows = []
    for d in diameters_mm:
        env = sphere_envelope_cm3(d)
        polymer_cm3 = env * avg_rho
        cured_mass_g = polymer_cm3 * solid_density_g_cm3
        rows.append(
            {
                "diameter_mm": d,
                "radius_mm": d / 2.0,
                "D_over_lambda_at_5GHz": d / 59.9584916,
                "envelope_cm3": env,
                "volume_average_rho": avg_rho,
                "polymer_cm3": polymer_cm3,
                "estimated_cured_mass_g": cured_mass_g,
                "available_resin_g": available_resin_g,
                "reserved_for_coupons_and_losses_g": reserve_g,
                "usable_for_lens_g": usable_g,
                "mass_margin_g": usable_g - cured_mass_g,
                "material_gate": "PASS" if cured_mass_g <= usable_g else "FAIL",
                "strict_scaled_D_24GHz_mm": d * 5.0 / 24.0,
            }
        )
    return rows


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--diameters", nargs="+", type=float, default=DEFAULT_DIAMETERS)
    p.add_argument("--eps-solid", type=float, default=2.30318)
    p.add_argument("--solid-density", type=float, default=1.10, help="g/cm^3; replace with T2")
    p.add_argument("--rho-min", type=float, default=0.0, help="replace with T3")
    p.add_argument("--rho-max", type=float, default=1.0, help="replace with T3")
    p.add_argument("--available-resin", type=float, default=1000.0, help="g")
    p.add_argument(
        "--reserve",
        type=float,
        default=250.0,
        help="g reserved for T1-T4, technology samples and process losses",
    )
    p.add_argument("--csv", type=Path, default=None)
    args = p.parse_args()

    rows = build_rows(
        args.diameters,
        args.eps_solid,
        args.solid_density,
        args.rho_min,
        args.rho_max,
        args.available_resin,
        args.reserve,
    )

    print(
        "D_mm,D/lambda,avg_rho,polymer_cm3,cured_mass_g,usable_g,margin_g,gate,D24_mm"
    )
    for r in rows:
        print(
            f"{r['diameter_mm']:.1f},"
            f"{r['D_over_lambda_at_5GHz']:.3f},"
            f"{r['volume_average_rho']:.5f},"
            f"{r['polymer_cm3']:.1f},"
            f"{r['estimated_cured_mass_g']:.1f},"
            f"{r['usable_for_lens_g']:.1f},"
            f"{r['mass_margin_g']:.1f},"
            f"{r['material_gate']},"
            f"{r['strict_scaled_D_24GHz_mm']:.3f}"
        )

    if args.csv is not None:
        args.csv.parent.mkdir(parents=True, exist_ok=True)
        with args.csv.open("w", encoding="utf-8", newline="") as f:
            w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
            w.writeheader()
            w.writerows(rows)
        print(args.csv)


if __name__ == "__main__":
    main()
