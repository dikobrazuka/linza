#!/usr/bin/env python3
"""Sweep a conformal PEC spherical-cap reflector on an ideal Luneburg lens.

Incident propagation is approximately +x. The ideal Luneburg focus is near the
+x surface, therefore the PEC cap is centered on the +x axis.

For each cap half-angle:
    BASELINE = PEC cap only
    TEST     = ideal Luneburg lens + identical PEC cap

Both scattering states use the same empty-space incident near2far data. The
project metric is:
    K_sigma = sigma_TEST / sigma_BASELINE
    Delta_sigma_dB = sigma_TEST_dBsm - sigma_BASELINE_dBsm

This is an ideal M9 precursor. Measured T4 law, loss, clamp, seam and physical
support are not included here.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
from pathlib import Path

import numpy as np

from simulation.run_ideal_luneburg_rcs import (
    make_near2far_regions,
    poynting_from_farfield,
    wavelength_mm,
)


DEFAULT_ANGLES = [15.0, 30.0, 45.0, 60.0, 90.0]


def is_in_cap_shell(x: float, y: float, z: float, radius_mm: float, thickness_mm: float, half_angle_deg: float) -> bool:
    r = math.sqrt(x*x + y*y + z*z)
    if r <= 0:
        return False
    if abs(r - radius_mm) > thickness_mm / 2.0:
        return False
    cos_theta = x / r
    return cos_theta >= math.cos(math.radians(half_angle_deg))


def luneburg_eps(x: float, y: float, z: float, radius_mm: float) -> float:
    r2 = x*x + y*y + z*z
    if r2 > radius_mm*radius_mm:
        return 1.0
    return 2.0 - r2/(radius_mm*radius_mm)


def make_simulation(mp, radius_mm, lambda_mm, resolution, fcen, fwidth, cap_angle_deg, cap_thickness_mm, include_lens):
    pml = 0.50 * lambda_mm
    air_gap = 0.35 * lambda_mm
    near_gap = 0.20 * lambda_mm
    object_radius = radius_mm + cap_thickness_mm / 2.0
    near_half = object_radius + near_gap
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

    def material_func(p):
        if is_in_cap_shell(p.x, p.y, p.z, radius_mm, cap_thickness_mm, cap_angle_deg):
            return mp.metal
        if include_lens:
            eps = luneburg_eps(p.x, p.y, p.z, radius_mm)
            if eps > 1.0:
                return mp.Medium(epsilon=eps)
        return mp.air

    sim = mp.Simulation(
        resolution=resolution,
        cell_size=mp.Vector3(cell_side, cell_side, cell_side),
        boundary_layers=[mp.PML(thickness=pml)],
        sources=[source],
        material_function=material_func,
        extra_materials=[mp.metal],
        eps_averaging=True,
        k_point=mp.Vector3(),
    )
    return sim, near_half, source_x


def run_empty(mp, radius_mm, cap_thickness_mm, lam, resolution, fcen, fwidth, run_periods):
    # Empty normalization uses the exact same cell/monitor dimensions as cap runs.
    pml = 0.50 * lam
    air_gap = 0.35 * lam
    near_gap = 0.20 * lam
    near_half = radius_mm + cap_thickness_mm/2.0 + near_gap
    interior_half = near_half + air_gap
    cell_half = interior_half + pml
    cell_side = 2.0 * cell_half
    source_x = -interior_half + 0.10 * lam
    source_side = 2.0 * interior_half

    source = mp.Source(
        mp.GaussianSource(fcen, fwidth=fwidth, is_integrated=True),
        component=mp.Ez,
        center=mp.Vector3(source_x, 0, 0),
        size=mp.Vector3(0, source_side, source_side),
    )
    sim = mp.Simulation(
        resolution=resolution,
        cell_size=mp.Vector3(cell_side, cell_side, cell_side),
        boundary_layers=[mp.PML(thickness=pml)],
        sources=[source],
        k_point=mp.Vector3(),
    )
    n2f = sim.add_near2far(fcen, 0, 1, *make_near2far_regions(mp, near_half))
    flux_x = source_x + 0.15 * lam
    flux = sim.add_flux(
        fcen, 0, 1,
        mp.FluxRegion(center=mp.Vector3(flux_x), size=mp.Vector3(0, 2*near_half, 2*near_half)),
    )
    sim.run(until_after_sources=run_periods/fcen)
    input_flux = float(mp.get_fluxes(flux)[0])
    if not np.isfinite(input_flux) or input_flux <= 0:
        raise RuntimeError(f"Invalid incident flux {input_flux}")
    incident = sim.get_near2far_data(n2f)
    sim.reset_meep()
    return incident, input_flux, near_half


def run_state(mp, radius_mm, cap_angle_deg, cap_thickness_mm, lam, resolution, fcen, fwidth, run_periods, incident, input_flux, include_lens, farfield_radius_lambda):
    sim, near_half, _ = make_simulation(
        mp, radius_mm, lam, resolution, fcen, fwidth,
        cap_angle_deg, cap_thickness_mm, include_lens,
    )
    n2f = sim.add_near2far(fcen, 0, 1, *make_near2far_regions(mp, near_half))
    sim.load_minus_near2far_data(n2f, incident)
    sim.run(until_after_sources=run_periods/fcen)

    ff_r = farfield_radius_lambda * lam
    # Incident wave travels +x, monostatic backscatter is toward -x.
    rhat = np.array([-1.0, 0.0, 0.0])
    ff = sim.get_farfield(n2f, ff_r * mp.Vector3(-1, 0, 0))
    p = poynting_from_farfield(ff)
    pr = float(np.dot(p, rhat))
    incident_intensity = input_flux / ((2.0*near_half)**2)
    diff_cs_mm2 = ff_r**2 * pr / incident_intensity
    rcs_mm2 = 4.0 * math.pi * diff_cs_mm2
    sim.reset_meep()
    return max(rcs_mm2, 1e-300)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--diameter-mm", type=float, default=120.0)
    p.add_argument("--frequency-ghz", type=float, default=5.0)
    p.add_argument("--cap-half-angle-deg", nargs="+", type=float, default=DEFAULT_ANGLES)
    p.add_argument("--cap-thickness-mm", type=float, default=1.0)
    p.add_argument("--pixels-per-lambda", type=float, default=16.0)
    p.add_argument("--fwidth-fraction", type=float, default=0.20)
    p.add_argument("--run-periods", type=float, default=10.0)
    p.add_argument("--farfield-radius-lambda", type=float, default=1000.0)
    p.add_argument("--out", type=Path, default=Path("simulation/results/reflector/REFLECTOR_SWEEP.csv"))
    args = p.parse_args()

    if args.cap_thickness_mm <= 0:
        raise SystemExit("cap thickness must be positive")
    if any(a <= 0 or a > 180 for a in args.cap_half_angle_deg):
        raise SystemExit("cap half-angles must satisfy 0 < angle <= 180")

    try:
        import meep as mp
    except ImportError as exc:
        raise SystemExit("Meep is not installed; use environment-meep.yml") from exc

    lam = wavelength_mm(args.frequency_ghz)
    fcen = 1.0/lam
    fwidth = args.fwidth_fraction*fcen
    resolution = args.pixels_per_lambda/lam
    radius = args.diameter_mm/2.0

    incident, input_flux, _ = run_empty(
        mp, radius, args.cap_thickness_mm, lam, resolution, fcen, fwidth, args.run_periods
    )

    rows = []
    for angle in args.cap_half_angle_deg:
        baseline = run_state(
            mp, radius, angle, args.cap_thickness_mm, lam, resolution, fcen, fwidth,
            args.run_periods, incident, input_flux, False, args.farfield_radius_lambda,
        )
        test = run_state(
            mp, radius, angle, args.cap_thickness_mm, lam, resolution, fcen, fwidth,
            args.run_periods, incident, input_flux, True, args.farfield_radius_lambda,
        )
        k_sigma = test/baseline
        rows.append({
            "diameter_mm": args.diameter_mm,
            "frequency_ghz": args.frequency_ghz,
            "cap_half_angle_deg": angle,
            "cap_thickness_mm": args.cap_thickness_mm,
            "pixels_per_lambda": args.pixels_per_lambda,
            "baseline_reflector_only_rcs_mm2": baseline,
            "test_lens_plus_reflector_rcs_mm2": test,
            "K_sigma": k_sigma,
            "Delta_sigma_dB": 10.0*math.log10(k_sigma),
            "project_target_pass": k_sigma >= 10.0,
        })

    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)

    best = max(rows, key=lambda r: r["Delta_sigma_dB"])
    print(json.dumps({"best": best, "output": str(args.out)}, indent=2))


if __name__ == "__main__":
    main()
