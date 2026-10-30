#!/usr/bin/env python3
"""Ideal continuous Luneburg RCS runner for the 5-GHz diameter gate.

This follows the Meep near-to-far scattered-field workflow:
  1. empty normalization run;
  2. save incident near2far data and incident intensity;
  3. rerun with the spatial Luneburg epsilon profile;
  4. subtract incident near fields with load_minus_near2far_data;
  5. evaluate far fields and convert differential cross section to RCS.

Meep references:
- Python Simulation epsilon_func/material_function:
  https://meep.readthedocs.io/en/latest/Python_User_Interface/
- Differential/Radar Cross Section tutorial:
  https://meep.readthedocs.io/en/latest/Python_Tutorials/Basics/#differentialradar-cross-section

Units:
  1 Meep length unit = 1 mm.
  Therefore frequency is expressed in 1/mm: f_meep = 1/lambda_mm.

This script intentionally starts with the ideal lossless M3/DG-A problem.
Reflector, measured T4 law, loss, seam and technological clamp belong to
later DG-B/M6-M9 runs.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
from pathlib import Path

import numpy as np


C_MM_PER_NS = 299.792458


def wavelength_mm(frequency_ghz: float) -> float:
    return C_MM_PER_NS / frequency_ghz


def luneburg_epsilon_xyz(x: float, y: float, z: float, radius_mm: float) -> float:
    r2 = x * x + y * y + z * z
    if r2 > radius_mm * radius_mm:
        return 1.0
    return 2.0 - r2 / (radius_mm * radius_mm)


def poynting_from_farfield(ff) -> np.ndarray:
    # Meep tutorial convention: conjugate E, not H.
    E = np.asarray([np.conj(ff[0]), np.conj(ff[1]), np.conj(ff[2])], dtype=np.complex128)
    H = np.asarray([ff[3], ff[4], ff[5]], dtype=np.complex128)
    return np.real(np.cross(E, H))


def make_near2far_regions(mp, half_extent: float):
    h = half_extent
    side = 2.0 * h
    return [
        mp.Near2FarRegion(center=mp.Vector3(x=-h), size=mp.Vector3(0, side, side), weight=+1),
        mp.Near2FarRegion(center=mp.Vector3(x=+h), size=mp.Vector3(0, side, side), weight=-1),
        mp.Near2FarRegion(center=mp.Vector3(y=-h), size=mp.Vector3(side, 0, side), weight=+1),
        mp.Near2FarRegion(center=mp.Vector3(y=+h), size=mp.Vector3(side, 0, side), weight=-1),
        mp.Near2FarRegion(center=mp.Vector3(z=-h), size=mp.Vector3(side, side, 0), weight=+1),
        mp.Near2FarRegion(center=mp.Vector3(z=+h), size=mp.Vector3(side, side, 0), weight=-1),
    ]


def make_simulation(
    mp,
    radius_mm: float,
    lambda_mm: float,
    resolution_px_per_mm: float,
    fcen: float,
    fwidth: float,
    with_lens: bool,
):
    pml = 0.50 * lambda_mm
    air_gap = 0.35 * lambda_mm
    near_gap = 0.20 * lambda_mm

    near_half = radius_mm + near_gap
    interior_half = near_half + air_gap
    cell_half = interior_half + pml
    cell_side = 2.0 * cell_half

    source_x = -interior_half + 0.10 * lambda_mm
    source_side = 2.0 * interior_half

    source = mp.Source(
        mp.GaussianSource(fcen, fwidth=fwidth, is_integrated=True),
        component=mp.Ez,
        center=mp.Vector3(source_x, 0, 0),
        size=mp.Vector3(0, source_side, source_side),
    )

    kwargs = dict(
        resolution=resolution_px_per_mm,
        cell_size=mp.Vector3(cell_side, cell_side, cell_side),
        boundary_layers=[mp.PML(thickness=pml)],
        sources=[source],
        k_point=mp.Vector3(),
    )

    if with_lens:
        def eps_func(p):
            return luneburg_epsilon_xyz(p.x, p.y, p.z, radius_mm)

        kwargs["epsilon_func"] = eps_func

    sim = mp.Simulation(**kwargs)
    return sim, near_half, source_x, source_side


def run_case(args):
    try:
        import meep as mp
    except ImportError as exc:
        raise SystemExit(
            "Meep Python package is not installed. Use a Meep/conda environment; "
            "the normal project CI intentionally does not install Meep."
        ) from exc

    lam = wavelength_mm(args.frequency_ghz)
    fcen = 1.0 / lam
    fwidth = args.fwidth_fraction * fcen
    resolution = args.pixels_per_lambda / lam
    radius = args.diameter_mm / 2.0

    # ---------- normalization / incident field ----------
    sim0, near_half, source_x, source_side = make_simulation(
        mp,
        radius,
        lam,
        resolution,
        fcen,
        fwidth,
        with_lens=False,
    )

    n2f0 = sim0.add_near2far(fcen, 0, 1, *make_near2far_regions(mp, near_half))

    flux_x = source_x + 0.15 * lam
    input_flux_monitor = sim0.add_flux(
        fcen,
        0,
        1,
        mp.FluxRegion(
            center=mp.Vector3(flux_x, 0, 0),
            size=mp.Vector3(0, 2.0 * near_half, 2.0 * near_half),
        ),
    )

    run_after_sources = args.run_periods / fcen
    sim0.run(until_after_sources=run_after_sources)

    input_flux = float(mp.get_fluxes(input_flux_monitor)[0])
    if not np.isfinite(input_flux) or input_flux <= 0:
        raise RuntimeError(f"Invalid incident flux: {input_flux}")

    incident_n2f = sim0.get_near2far_data(n2f0)
    sim0.reset_meep()

    # ---------- scattering run ----------
    sim, near_half2, _, _ = make_simulation(
        mp,
        radius,
        lam,
        resolution,
        fcen,
        fwidth,
        with_lens=True,
    )
    if not math.isclose(near_half, near_half2, rel_tol=0, abs_tol=1e-12):
        raise RuntimeError("Normalization/scattering near-field boxes differ")

    n2f = sim.add_near2far(fcen, 0, 1, *make_near2far_regions(mp, near_half))
    sim.load_minus_near2far_data(n2f, incident_n2f)
    sim.run(until_after_sources=run_after_sources)

    aperture_area = (2.0 * near_half) ** 2
    incident_intensity = input_flux / aperture_area

    ff_r = args.farfield_radius_lambda * lam
    angles_deg = np.arange(args.angle_start_deg, args.angle_stop_deg + 0.5 * args.angle_step_deg, args.angle_step_deg)

    rows = []
    for angle_deg in angles_deg:
        theta = math.radians(float(angle_deg))
        rhat = np.array([math.cos(theta), 0.0, math.sin(theta)], dtype=float)
        point = ff_r * mp.Vector3(rhat[0], rhat[1], rhat[2])
        ff = sim.get_farfield(n2f, point)
        P = poynting_from_farfield(ff)
        Pr = float(np.dot(P, rhat))
        diff_cs_mm2 = ff_r**2 * Pr / incident_intensity
        rcs_mm2 = 4.0 * math.pi * diff_cs_mm2
        rows.append(
            {
                "angle_deg": float(angle_deg),
                "poynting_radial": Pr,
                "diff_cross_section_mm2": diff_cs_mm2,
                "rcs_mm2": rcs_mm2,
                "rcs_m2": rcs_mm2 * 1e-6,
                "rcs_dbsm": 10.0 * math.log10(max(rcs_mm2 * 1e-6, 1e-300)),
            }
        )

    back = min(rows, key=lambda r: abs(r["angle_deg"] - 180.0))

    metadata = {
        "model": "ideal_continuous_luneburg_lossless",
        "frequency_ghz": args.frequency_ghz,
        "lambda_mm": lam,
        "diameter_mm": args.diameter_mm,
        "radius_mm": radius,
        "D_over_lambda": args.diameter_mm / lam,
        "pixels_per_lambda": args.pixels_per_lambda,
        "resolution_px_per_mm": resolution,
        "nearfield_half_extent_mm": near_half,
        "farfield_radius_lambda": args.farfield_radius_lambda,
        "run_periods_after_source": args.run_periods,
        "incident_flux": input_flux,
        "incident_intensity": incident_intensity,
        "backscatter_angle_deg_selected": back["angle_deg"],
        "backscatter_rcs_mm2": back["rcs_mm2"],
        "backscatter_rcs_dbsm": back["rcs_dbsm"],
        "status": "M3_DG_A_IDEAL_ONLY",
    }

    args.out_dir.mkdir(parents=True, exist_ok=True)
    tag = f"D{int(round(args.diameter_mm))}_PPL{int(round(args.pixels_per_lambda))}"

    csv_path = args.out_dir / f"{tag}_RCS.csv"
    with csv_path.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)

    json_path = args.out_dir / f"{tag}_META.json"
    json_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

    if mp.am_master():
        print(json.dumps(metadata, indent=2))
        print(csv_path)
        print(json_path)


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--diameter-mm", type=float, default=120.0)
    p.add_argument("--frequency-ghz", type=float, default=5.0)
    p.add_argument("--pixels-per-lambda", type=float, default=16.0)
    p.add_argument("--fwidth-fraction", type=float, default=0.20)
    p.add_argument("--run-periods", type=float, default=10.0)
    p.add_argument("--farfield-radius-lambda", type=float, default=1000.0)
    p.add_argument("--angle-start-deg", type=float, default=0.0)
    p.add_argument("--angle-stop-deg", type=float, default=180.0)
    p.add_argument("--angle-step-deg", type=float, default=5.0)
    p.add_argument("--out-dir", type=Path, default=Path("simulation/results/ideal_luneburg_rcs"))
    return p.parse_args()


def main():
    args = parse_args()
    if args.diameter_mm <= 0 or args.frequency_ghz <= 0:
        raise SystemExit("diameter/frequency must be positive")
    if args.pixels_per_lambda < 8:
        raise SystemExit("pixels-per-lambda < 8 is not allowed for project runs")
    run_case(args)


if __name__ == "__main__":
    main()
