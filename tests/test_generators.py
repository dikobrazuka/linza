import csv
import math
from pathlib import Path

import numpy as np

from tools.continuous_luneburg_gyroid import (
    load_measured_calibration,
    rho_from_epsilon,
)
from tools.material_budget import average_rho, build_rows
from tools.uniform_sheet_gyroid_coupon import (
    build_field,
    calibrate_sheet_gyroid,
    field_to_mesh,
    h_from_rho,
)


def test_measured_calibration_adds_air_and_solid_endpoints(tmp_path: Path):
    p = tmp_path / "calibration.csv"
    with p.open("w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["rho", "epsilon_eff"])
        w.writerow([0.20, 1.18])
        w.writerow([0.50, 1.48])
        w.writerow([0.81, 2.00])

    rho, eps = load_measured_calibration(p, eps_solid=2.30318)

    assert rho[0] == 0.0
    assert eps[0] == 1.0
    assert rho[-1] == 1.0
    assert eps[-1] == 2.30318
    assert np.all(np.diff(rho) > 0)
    assert np.all(np.diff(eps) > 0)


def test_measured_calibration_can_map_full_luneburg_range(tmp_path: Path):
    p = tmp_path / "calibration.csv"
    with p.open("w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["rho", "epsilon_eff"])
        w.writerow([0.20, 1.18])
        w.writerow([0.50, 1.48])
        w.writerow([0.81, 2.00])

    target = np.array([1.0, 1.1, 1.5, 2.0])
    rho = rho_from_epsilon(target, 2.30318, p)

    assert rho[0] == 0.0
    assert np.all(np.diff(rho) > 0)
    assert rho[-1] < 1.0


def test_uniform_coupon_field_broadcasts_and_mesh_is_watertight():
    h_grid, rho_grid = calibrate_sheet_gyroid(samples=48)
    h = h_from_rho(0.50, h_grid, rho_grid)

    field, origin, spacing = build_field(
        size_x=7.5,
        size_y=7.5,
        size_z=7.5,
        cell_mm=7.5,
        h=h,
        voxel_mm=0.75,
    )

    assert field.ndim == 3
    assert all(n > 3 for n in field.shape)
    assert np.isfinite(field).all()

    mesh = field_to_mesh(field, origin, spacing)
    assert mesh.vertices.shape[0] > 0
    assert mesh.faces.shape[0] > 0
    assert mesh.is_watertight


def test_material_budget_120mm_matches_reference():
    avg = average_rho(
        eps_solid=2.30318,
        rho_min=0.0,
        rho_max=1.0,
        samples=100_001,
    )
    assert math.isclose(avg, 0.35818, rel_tol=3e-4)

    rows = build_rows(
        diameters_mm=[120.0],
        eps_solid=2.30318,
        solid_density_g_cm3=1.10,
        rho_min=0.0,
        rho_max=1.0,
        available_resin_g=1000.0,
        reserve_g=250.0,
    )
    row = rows[0]

    assert math.isclose(row["estimated_cured_mass_g"], 356.5, abs_tol=0.5)
    assert row["material_gate"] == "PASS"
    assert math.isclose(row["strict_scaled_D_24GHz_mm"], 25.0, abs_tol=1e-9)


def test_material_budget_rejects_180_and_240_with_750g_usable():
    rows = build_rows(
        diameters_mm=[120.0, 150.0, 180.0, 240.0],
        eps_solid=2.30318,
        solid_density_g_cm3=1.10,
        rho_min=0.0,
        rho_max=1.0,
        available_resin_g=1000.0,
        reserve_g=250.0,
    )
    gates = {r["diameter_mm"]: r["material_gate"] for r in rows}

    assert gates[120.0] == "PASS"
    assert gates[150.0] == "PASS"
    assert gates[180.0] == "FAIL"
    assert gates[240.0] == "FAIL"
