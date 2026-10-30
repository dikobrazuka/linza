#!/usr/bin/env python3
"""Strict geometric scaling checker from the validated 5-GHz demonstrator to 24 GHz.

All linear dimensions scale by k=f5/f24. Areas scale by k^2 and masses/volumes
by k^3 if density and relative volume fraction are unchanged.

This tool does NOT claim dielectric similarity. It only checks geometry/mass and
flags the need for separate material-dispersion and minimum-feature validation.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def scale_summary(
    diameter_5_mm: float,
    cell_5_mm: float,
    mass_5_g: float | None = None,
    min_wall_5_mm: float | None = None,
    frequency_5_ghz: float = 5.0,
    frequency_24_ghz: float = 24.0,
    final_diameter_limit_mm: float = 80.0,
    final_mass_limit_g: float = 300.0,
    printer_min_wall_mm: float | None = None,
):
    if diameter_5_mm <= 0 or cell_5_mm <= 0:
        raise ValueError("diameter/cell must be positive")
    if frequency_5_ghz <= 0 or frequency_24_ghz <= 0:
        raise ValueError("frequencies must be positive")

    k = frequency_5_ghz / frequency_24_ghz
    out = {
        "frequency_5_ghz": frequency_5_ghz,
        "frequency_24_ghz": frequency_24_ghz,
        "linear_scale_k": k,
        "diameter_5_mm": diameter_5_mm,
        "diameter_24_mm": diameter_5_mm * k,
        "radius_24_mm": diameter_5_mm * k / 2.0,
        "cell_5_mm": cell_5_mm,
        "cell_24_mm": cell_5_mm * k,
        "diameter_limit_mm": final_diameter_limit_mm,
        "diameter_gate": "PASS" if diameter_5_mm * k <= final_diameter_limit_mm else "FAIL",
        "material_similarity_status": "NOT_PROVEN_SEPARATE_DISPERSION_ANALYSIS_REQUIRED",
    }

    if mass_5_g is not None:
        if mass_5_g < 0:
            raise ValueError("mass must be nonnegative")
        m24 = mass_5_g * k**3
        out.update(
            {
                "mass_5_g": mass_5_g,
                "mass_24_g_strict_similarity": m24,
                "mass_limit_g": final_mass_limit_g,
                "mass_gate": "PASS" if m24 <= final_mass_limit_g else "FAIL",
            }
        )

    if min_wall_5_mm is not None:
        if min_wall_5_mm <= 0:
            raise ValueError("min wall must be positive")
        t24 = min_wall_5_mm * k
        out["min_wall_5_mm"] = min_wall_5_mm
        out["min_wall_24_mm_strict_scaled"] = t24
        if printer_min_wall_mm is not None:
            if printer_min_wall_mm <= 0:
                raise ValueError("printer minimum wall must be positive")
            out["printer_min_wall_mm"] = printer_min_wall_mm
            out["min_wall_gate"] = "PASS" if t24 >= printer_min_wall_mm else "FAIL"
        else:
            out["min_wall_gate"] = "UNKNOWN_PRINTER_LIMIT_REQUIRED"

    return out


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--diameter-5-mm", type=float, default=120.0)
    p.add_argument("--cell-5-mm", type=float, default=7.5)
    p.add_argument("--mass-5-g", type=float, default=None, help="use measured/final predicted 5-GHz cured mass")
    p.add_argument("--min-wall-5-mm", type=float, default=None, help="use T3/CAD minimum printable wall")
    p.add_argument("--printer-min-wall-mm", type=float, default=None, help="24-GHz manufacturing process limit")
    p.add_argument("--diameter-limit-mm", type=float, default=80.0)
    p.add_argument("--mass-limit-g", type=float, default=300.0)
    p.add_argument("--out", type=Path, default=None)
    args = p.parse_args()

    out = scale_summary(
        diameter_5_mm=args.diameter_5_mm,
        cell_5_mm=args.cell_5_mm,
        mass_5_g=args.mass_5_g,
        min_wall_5_mm=args.min_wall_5_mm,
        final_diameter_limit_mm=args.diameter_limit_mm,
        final_mass_limit_g=args.mass_limit_g,
        printer_min_wall_mm=args.printer_min_wall_mm,
    )
    text = json.dumps(out, indent=2)
    print(text)
    if args.out is not None:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(text + "\n", encoding="utf-8")
        print(args.out)


if __name__ == "__main__":
    main()
