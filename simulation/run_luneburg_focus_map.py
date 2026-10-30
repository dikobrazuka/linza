#!/usr/bin/env python3
"""Compute a normalized 5-GHz Luneburg focus map in the x-z plane.

Workflow:
  1. empty-space run with a DFT field monitor at y=0;
  2. ideal Luneburg run with the identical source/cell/monitor;
  3. compute |E|^2_lens / |E|^2_empty;
  4. report focus position, surface offset, peak enhancement and transverse FWHM.

The source propagates approximately +x. For an ideal Luneburg lens the focus is
expected near the +x surface. The tool deliberately reports the result rather
than enforcing that expectation.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np

from simulation.run_ideal_luneburg_rcs import make_simulation, wavelength_mm


def electric_intensity(ex, ey, ez):
    return np.abs(ex) ** 2 + np.abs(ey) ** 2 + np.abs(ez) ** 2


def fwhm_from_profile(coord: np.ndarray, values: np.ndarray) -> float | None:
    coord = np.asarray(coord, dtype=float)
    values = np.asarray(values, dtype=float)
    if coord.ndim != 1 or values.ndim != 1 or coord.size != values.size:
        raise ValueError("coord/values must be same-length 1D arrays")
    if coord.size < 3 or not np.all(np.isfinite(values)):
        return None
    peak = float(np.max(values))
    if peak <= 0:
        return None
    mask = values >= 0.5 * peak
    idx = np.flatnonzero(mask)
    if idx.size < 2:
        return None
    return float(coord[idx[-1]] - coord[idx[0]])


def extract_focus_metrics(x, z, normalized_i, radius_mm: float):
    x = np.asarray(x, dtype=float)
    z = np.asarray(z, dtype=float)
    normalized_i = np.asarray(normalized_i, dtype=float)
    if normalized_i.shape != (x.size, z.size):
        raise ValueError("normalized intensity shape must be (len(x), len(z))")

    # Search downstream half and a modest region behind the lens.
    x_mask = (x >= 0.0) & (x <= radius_mm + 0.75 * radius_mm)
    z_mask = np.abs(z) <= radius_mm
    if not np.any(x_mask) or not np.any(z_mask):
        raise ValueError("focus ROI is empty")

    sub = normalized_i[np.ix_(x_mask, z_mask)]
    ix_local, iz_local = np.unravel_index(np.nanargmax(sub), sub.shape)
    ix = np.flatnonzero(x_mask)[ix_local]
    iz = np.flatnonzero(z_mask)[iz_local]
    profile_z = normalized_i[ix, :]

    return {
        "focus_x_mm": float(x[ix]),
        "focus_z_mm": float(z[iz]),
        "focus_offset_from_plus_surface_mm": float(x[ix] - radius_mm),
        "peak_normalized_E2": float(normalized_i[ix, iz]),
        "transverse_fwhm_mm": fwhm_from_profile(z, profile_z),
    }


def run_dft_case(mp, radius_mm, lambda_mm, resolution, fcen, fwidth, with_lens, run_periods):
    sim, _, _, _ = make_simulation(
        mp,
        radius_mm,
        lambda_mm,
        resolution,
        fcen,
        fwidth,
        with_lens=with_lens,
    )

    plane_half = radius_mm + 0.75 * lambda_mm
    dft = sim.add_dft_fields(
        [mp.Ex, mp.Ey, mp.Ez],
        fcen,
        0,
        1,
        center=mp.Vector3(),
        size=mp.Vector3(2.0 * plane_half, 0, 2.0 * plane_half),
    )
    sim.run(until_after_sources=run_periods / fcen)

    ex = np.asarray(sim.get_dft_array(dft, mp.Ex, 0))
    ey = np.asarray(sim.get_dft_array(dft, mp.Ey, 0))
    ez = np.asarray(sim.get_dft_array(dft, mp.Ez, 0))
    meta = sim.get_array_metadata(dft_cell=dft)
    x = np.asarray(meta.x, dtype=float)
    z = np.asarray(meta.z, dtype=float)
    sim.reset_meep()
    return x, z, electric_intensity(ex, ey, ez)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--diameter-mm", type=float, default=120.0)
    p.add_argument("--frequency-ghz", type=float, default=5.0)
    p.add_argument("--pixels-per-lambda", type=float, default=16.0)
    p.add_argument("--fwidth-fraction", type=float, default=0.20)
    p.add_argument("--run-periods", type=float, default=10.0)
    p.add_argument("--out-dir", type=Path, default=Path("simulation/results/focus_map"))
    args = p.parse_args()

    if args.diameter_mm <= 0 or args.frequency_ghz <= 0:
        raise SystemExit("diameter/frequency must be positive")
    if args.pixels_per_lambda < 8:
        raise SystemExit("pixels-per-lambda < 8 is not allowed for project runs")

    try:
        import meep as mp
    except ImportError as exc:
        raise SystemExit("Meep is not installed; use environment-meep.yml") from exc

    lam = wavelength_mm(args.frequency_ghz)
    fcen = 1.0 / lam
    fwidth = args.fwidth_fraction * fcen
    resolution = args.pixels_per_lambda / lam
    radius = args.diameter_mm / 2.0

    x0, z0, i0 = run_dft_case(mp, radius, lam, resolution, fcen, fwidth, False, args.run_periods)
    x1, z1, i1 = run_dft_case(mp, radius, lam, resolution, fcen, fwidth, True, args.run_periods)

    if not (np.array_equal(x0, x1) and np.array_equal(z0, z1)):
        raise RuntimeError("empty/lens DFT grids differ")

    floor = max(float(np.nanmax(i0)) * 1e-12, 1e-300)
    normalized = i1 / np.maximum(i0, floor)
    metrics = extract_focus_metrics(x1, z1, normalized, radius)
    metrics.update(
        {
            "diameter_mm": args.diameter_mm,
            "radius_mm": radius,
            "frequency_ghz": args.frequency_ghz,
            "lambda_mm": lam,
            "D_over_lambda": args.diameter_mm / lam,
            "pixels_per_lambda": args.pixels_per_lambda,
            "status": "IDEAL_CONTINUOUS_FOCUS_MAP",
        }
    )

    args.out_dir.mkdir(parents=True, exist_ok=True)
    tag = f"D{int(round(args.diameter_mm))}_PPL{int(round(args.pixels_per_lambda))}"
    npz_path = args.out_dir / f"{tag}_FOCUS.npz"
    json_path = args.out_dir / f"{tag}_FOCUS_META.json"
    np.savez_compressed(npz_path, x_mm=x1, z_mm=z1, normalized_E2=normalized, empty_E2=i0, lens_E2=i1)
    json_path.write_text(json.dumps(metrics, indent=2), encoding="utf-8")

    if mp.am_master():
        print(json.dumps(metrics, indent=2))
        print(npz_path)
        print(json_path)


if __name__ == "__main__":
    main()
