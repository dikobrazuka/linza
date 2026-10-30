#!/usr/bin/env python3
"""Generate exact monostatic RCS of a perfectly conducting sphere.

Uses the PEC Mie-series backscatter solution:

    sigma/(pi*a^2) = 4/x^2 * |sum_{n=1}^inf (-1)^n (n+1/2) (a_n-b_n)|^2

with
    x = 2*pi*a/lambda,
    a_n = -[x j_n(x)]' / [x h_n^(1)(x)]',
    b_n = -j_n(x) / h_n^(1)(x).

This is the correct reference in the Rayleigh/Mie/resonance region. The optical
approximation sigma = pi*a^2 is reported only as a comparison column.

Primary project output contract:
    frequency_hz,sigma_ref_m2

References are documented in docs/14_PEC_SPHERE_REFERENCE.md.
"""

from __future__ import annotations

import argparse
import csv
import math
from pathlib import Path

import numpy as np
from scipy.special import spherical_jn, spherical_yn


C0 = 299_792_458.0


def mie_order_limit(x: float) -> int:
    """Conservative finite-order truncation for real positive size parameter."""
    if x <= 0:
        raise ValueError("size parameter x must be positive")
    return max(1, int(math.ceil(x + 4.0 * x ** (1.0 / 3.0) + 2.0)))


def pec_mie_coefficients(x: float, nmax: int | None = None):
    if x <= 0:
        raise ValueError("size parameter x must be positive")
    if nmax is None:
        nmax = mie_order_limit(x)
    n = np.arange(1, nmax + 1, dtype=int)

    jn = spherical_jn(n, x)
    yn = spherical_yn(n, x)
    jnp = spherical_jn(n, x, derivative=True)
    ynp = spherical_yn(n, x, derivative=True)

    hn = jn + 1j * yn
    hnp = jnp + 1j * ynp

    # Derivative of x*j_n(x) and x*h_n(x).
    d_xjn = jn + x * jnp
    d_xhn = hn + x * hnp

    a_n = -d_xjn / d_xhn
    b_n = -jn / hn
    return n, a_n, b_n


def normalized_monostatic_rcs(x: float, nmax: int | None = None) -> float:
    """Return sigma/(pi*a^2) for a PEC sphere."""
    n, a_n, b_n = pec_mie_coefficients(x, nmax=nmax)
    series = np.sum(((-1.0) ** n) * (n + 0.5) * (a_n - b_n))
    return float((4.0 / (x * x)) * abs(series) ** 2)


def pec_sphere_rcs(radius_m: float, frequency_hz: float) -> dict[str, float]:
    if radius_m <= 0 or frequency_hz <= 0:
        raise ValueError("radius and frequency must be positive")
    wavelength_m = C0 / frequency_hz
    x = 2.0 * math.pi * radius_m / wavelength_m
    norm = normalized_monostatic_rcs(x)
    optical = math.pi * radius_m * radius_m
    sigma = norm * optical
    return {
        "frequency_hz": float(frequency_hz),
        "wavelength_m": wavelength_m,
        "diameter_m": 2.0 * radius_m,
        "radius_m": radius_m,
        "size_parameter_x": x,
        "mie_order_limit": mie_order_limit(x),
        "normalized_rcs_sigma_over_pi_a2": norm,
        "sigma_ref_m2": sigma,
        "sigma_ref_dbsm": 10.0 * math.log10(sigma),
        "optical_pi_a2_m2": optical,
        "mie_to_optical_ratio": norm,
        "mie_minus_optical_db": 10.0 * math.log10(norm),
    }


def frequency_grid(start_ghz: float, stop_ghz: float, points: int) -> np.ndarray:
    if start_ghz <= 0 or stop_ghz <= start_ghz:
        raise ValueError("Require 0 < start < stop")
    if points < 2:
        raise ValueError("points must be >= 2")
    return np.linspace(start_ghz * 1e9, stop_ghz * 1e9, points)


def write_reference_csv(rows: list[dict[str, float]], path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--diameter-mm", type=float, required=True)
    p.add_argument("--start-ghz", type=float, default=4.0)
    p.add_argument("--stop-ghz", type=float, default=6.0)
    p.add_argument("--points", type=int, default=1601)
    p.add_argument("--out", type=Path, default=Path("REFERENCE_RCS.csv"))
    args = p.parse_args()

    if args.diameter_mm <= 0:
        raise SystemExit("--diameter-mm must be positive")

    radius_m = args.diameter_mm * 1e-3 / 2.0
    rows = [
        pec_sphere_rcs(radius_m, f)
        for f in frequency_grid(args.start_ghz, args.stop_ghz, args.points)
    ]
    write_reference_csv(rows, args.out)

    center = min(rows, key=lambda r: abs(r["frequency_hz"] - 5.0e9))
    print(args.out)
    print(f"diameter_mm={args.diameter_mm:.6g}")
    print(f"sigma_5GHz_m2={center['sigma_ref_m2']:.9g}")
    print(f"sigma_5GHz_dbsm={center['sigma_ref_dbsm']:.6f}")
    print(f"mie_minus_optical_5GHz_db={center['mie_minus_optical_db']:+.6f}")


if __name__ == "__main__":
    main()
