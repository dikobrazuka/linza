#!/usr/bin/env python3
"""
Continuous Luneburg sheet-gyroid generator.

Pipeline:
    epsilon_target(r) -> resin volume fraction rho(r)
    -> sheet-gyroid threshold h(r)
    -> implicit 3D solid
    -> marching cubes -> STL

Default dielectric mixing model: symmetric Bruggeman, resin + air.
The provisional default epsilon_solid=2.30318 is the HARZ DE-10 manufacturer
mean measured at 10 GHz. Replace it with own 5-GHz material data and use
measured epsilon_eff(rho) through --calibration-csv once T4 is complete.

Current physical demonstrator default:
    D = 120 mm, R = 60 mm, f = 5 GHz, a = 7.5 mm.
"""

from __future__ import annotations

import argparse
import csv
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Optional, Tuple

import numpy as np
from skimage.measure import marching_cubes
import trimesh


@dataclass
class Config:
    radius_mm: float = 60.0
    cell_mm: float = 7.5
    voxel_mm: float = 1.0
    eps_solid: float = 2.30318
    rho_min: float = 0.0
    rho_max: float = 1.0
    hemisphere: str = "upper"
    gyroid_samples: int = 96
    profile_samples: int = 241
    calibration_csv: Optional[Path] = None
    solid_density_g_cm3: Optional[float] = None
    out_stl: Path = Path("continuous_luneburg_gyroid.stl")
    out_profile: Optional[Path] = None
    profile_only: bool = False


def luneburg_epsilon(r_mm: np.ndarray, radius_mm: float) -> np.ndarray:
    q = np.clip(r_mm / radius_mm, 0.0, 1.0)
    return 2.0 - q * q


def bruggeman_rho_from_epsilon(eps_eff: np.ndarray, eps_solid: float) -> np.ndarray:
    e = np.asarray(eps_eff, dtype=np.float64)
    es = float(eps_solid)
    if es <= 1.0:
        raise ValueError("eps_solid must be > 1")
    if np.any(e < 1.0 - 1e-9) or np.any(e > es + 1e-9):
        raise ValueError("Requested epsilon is outside [1, eps_solid]")
    A = (es - e) / (es + 2.0 * e)
    B = (1.0 - e) / (1.0 + 2.0 * e)
    rho = -B / (A - B)
    return np.clip(rho, 0.0, 1.0)


def load_measured_calibration(path: Path, eps_solid: float) -> Tuple[np.ndarray, np.ndarray]:
    """Load rho->epsilon calibration and add physical air/solid endpoints.

    T4 coupons normally do not include rho=0 or rho=1. The Luneburg profile,
    however, reaches epsilon=1 at the surface and may require rho above the
    highest measured coupon before technological clipping. The physical
    endpoints are therefore added explicitly:
        rho=0 -> epsilon=1
        rho=1 -> epsilon=eps_solid from T1
    Measured interior points must remain strictly monotonic.
    """
    rows = []
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        names = {n.strip().lower(): n for n in (reader.fieldnames or [])}
        if "rho" not in names or "epsilon_eff" not in names:
            raise ValueError("Calibration CSV must contain columns: rho,epsilon_eff")
        for row in reader:
            rows.append((float(row[names["rho"]]), float(row[names["epsilon_eff"]])))

    if len(rows) < 2:
        raise ValueError("Calibration CSV needs at least two measured rows")

    rows.sort(key=lambda x: x[0])
    rho_m = np.asarray([x[0] for x in rows], dtype=np.float64)
    eps_m = np.asarray([x[1] for x in rows], dtype=np.float64)

    if np.any(rho_m <= 0.0) or np.any(rho_m >= 1.0):
        raise ValueError("Measured calibration rows must satisfy 0 < rho < 1; endpoints are added automatically")
    if np.any(np.diff(rho_m) <= 0):
        raise ValueError("Calibration rho values must be strictly increasing")
    if np.any(np.diff(eps_m) <= 0):
        raise ValueError("Calibration epsilon_eff values must be strictly increasing; smooth/fit noisy data first")
    if eps_m[0] <= 1.0:
        raise ValueError("Lowest measured epsilon_eff must be > 1")
    if eps_m[-1] >= eps_solid:
        raise ValueError("Highest measured epsilon_eff must be < eps_solid from T1")

    rho = np.r_[0.0, rho_m, 1.0]
    eps = np.r_[1.0, eps_m, float(eps_solid)]
    return rho, eps


def rho_from_epsilon(eps_eff: np.ndarray, eps_solid: float, calibration_csv: Optional[Path]) -> np.ndarray:
    if calibration_csv is None:
        return bruggeman_rho_from_epsilon(eps_eff, eps_solid)
    rho_tab, eps_tab = load_measured_calibration(calibration_csv, eps_solid)
    e = np.asarray(eps_eff, dtype=np.float64)
    if e.min() < 1.0 - 1e-9 or e.max() > eps_solid + 1e-9:
        raise ValueError("Target epsilon exceeds physical [1, eps_solid] range")
    return np.interp(e, eps_tab, rho_tab)


def gyroid_value(x: np.ndarray, y: np.ndarray, z: np.ndarray, cell_mm: float) -> np.ndarray:
    k = 2.0 * math.pi / cell_mm
    X, Y, Z = k * x, k * y, k * z
    return np.sin(X) * np.cos(Y) + np.sin(Y) * np.cos(Z) + np.sin(Z) * np.cos(X)


def calibrate_sheet_gyroid(samples: int = 96) -> Tuple[np.ndarray, np.ndarray]:
    u = np.linspace(0.0, 2.0 * math.pi, samples, endpoint=False, dtype=np.float32)
    sx, cx = np.sin(u), np.cos(u)
    G = (
        sx[:, None, None] * cx[None, :, None]
        + sx[None, :, None] * cx[None, None, :]
        + sx[None, None, :] * cx[:, None, None]
    ).astype(np.float32, copy=False)
    abs_g = np.sort(np.abs(G).ravel())
    h_grid = np.linspace(0.0, 1.6, 1601, dtype=np.float64)
    counts = np.searchsorted(abs_g, h_grid, side="right")
    rho_grid = counts.astype(np.float64) / abs_g.size
    keep = np.r_[True, np.diff(rho_grid) > 0]
    return h_grid[keep], rho_grid[keep]


def h_from_rho(rho: np.ndarray, h_grid: np.ndarray, rho_grid: np.ndarray) -> np.ndarray:
    return np.interp(np.asarray(rho, dtype=np.float64), rho_grid, h_grid)


def make_radial_profile(cfg: Config, h_grid: np.ndarray, rho_grid: np.ndarray):
    if not (0.0 <= cfg.rho_min <= cfg.rho_max <= 1.0):
        raise ValueError("Require 0 <= rho_min <= rho_max <= 1")

    r = np.linspace(0.0, cfg.radius_mm, cfg.profile_samples)
    eps_target = luneburg_epsilon(r, cfg.radius_mm)
    rho_raw = rho_from_epsilon(eps_target, cfg.eps_solid, cfg.calibration_csv)
    rho_used = np.clip(rho_raw, cfg.rho_min, cfg.rho_max)
    h_used = h_from_rho(rho_used, h_grid, rho_grid)

    if cfg.calibration_csv is None:
        e_lookup = np.linspace(1.0, cfg.eps_solid, 5001)
        r_lookup = bruggeman_rho_from_epsilon(e_lookup, cfg.eps_solid)
        eps_achieved = np.interp(rho_used, r_lookup, e_lookup)
    else:
        rho_tab, eps_tab = load_measured_calibration(cfg.calibration_csv, cfg.eps_solid)
        eps_achieved = np.interp(rho_used, rho_tab, eps_tab)

    return r, eps_target, rho_raw, rho_used, h_used, eps_achieved


def write_profile_csv(path: Path, r, eps_target, rho_raw, rho_used, h_used, eps_achieved):
    with path.open("w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["r_mm","r_over_R","epsilon_target","rho_required","rho_used","gyroid_h","epsilon_after_clamp"])
        R = float(r[-1])
        for rr, et, raw, used, hh, ea in zip(r, eps_target, rho_raw, rho_used, h_used, eps_achieved):
            w.writerow([rr, rr/R, et, raw, used, hh, ea])


def estimate_full_sphere_material(r_mm: np.ndarray, rho_used: np.ndarray, solid_density_g_cm3: Optional[float]):
    R = float(r_mm[-1])
    polymer_volume_mm3 = 4.0 * math.pi * float(np.trapezoid(rho_used * r_mm * r_mm, r_mm))
    envelope_volume_mm3 = 4.0 / 3.0 * math.pi * R**3
    average_rho = polymer_volume_mm3 / envelope_volume_mm3
    result = {
        "full_sphere_envelope_cm3": envelope_volume_mm3 / 1000.0,
        "full_sphere_polymer_cm3": polymer_volume_mm3 / 1000.0,
        "volume_average_rho": average_rho,
    }
    if solid_density_g_cm3 is not None:
        result["estimated_cured_mass_g"] = polymer_volume_mm3 / 1000.0 * solid_density_g_cm3
    return result


def build_scalar_field(cfg: Config, h_grid: np.ndarray, rho_grid: np.ndarray):
    R, v = cfg.radius_mm, cfg.voxel_mm
    extent = R + 2.0 * v
    axis = np.arange(-extent, extent + 0.5 * v, v, dtype=np.float32)
    x, y, z = axis[:, None, None], axis[None, :, None], axis[None, None, :]
    r = np.sqrt(x*x + y*y + z*z, dtype=np.float32)
    eps = np.where(r <= R, luneburg_epsilon(r, R), 1.0)
    rho = np.clip(
        rho_from_epsilon(eps, cfg.eps_solid, cfg.calibration_csv),
        cfg.rho_min,
        cfg.rho_max,
    )
    h = h_from_rho(rho, h_grid, rho_grid).astype(np.float32)
    G = gyroid_value(x, y, z, cfg.cell_mm).astype(np.float32)
    field = np.minimum(h - np.abs(G), (R-r).astype(np.float32))
    if cfg.hemisphere == "upper":
        field = np.minimum(field, z.astype(np.float32))
    elif cfg.hemisphere == "lower":
        field = np.minimum(field, (-z).astype(np.float32))
    elif cfg.hemisphere != "full":
        raise ValueError("hemisphere must be upper, lower, or full")
    origin = np.array([axis[0], axis[0], axis[0]], dtype=np.float64)
    return field, origin


def field_to_mesh(field, origin, voxel_mm):
    verts, faces, normals, _ = marching_cubes(
        field,
        level=0.0,
        spacing=(voxel_mm,)*3,
        allow_degenerate=False,
    )
    verts += origin[None, :]
    mesh = trimesh.Trimesh(
        vertices=verts,
        faces=faces,
        vertex_normals=normals,
        process=False,
    )
    mesh.remove_unreferenced_vertices()
    return mesh


def parse_args() -> Config:
    p = argparse.ArgumentParser()
    p.add_argument("--radius", type=float, default=60.0)
    p.add_argument("--cell", type=float, default=7.5)
    p.add_argument("--voxel", type=float, default=1.0)
    p.add_argument("--eps-solid", type=float, default=2.30318)
    p.add_argument("--rho-min", type=float, default=0.0, help="set from T3 for final manufacturing geometry")
    p.add_argument("--rho-max", type=float, default=1.0, help="set from T3 for final manufacturing geometry")
    p.add_argument("--hemisphere", choices=["upper","lower","full"], default="upper")
    p.add_argument("--gyroid-samples", type=int, default=96)
    p.add_argument("--profile-samples", type=int, default=241)
    p.add_argument("--calibration-csv", type=Path, default=None)
    p.add_argument("--solid-density", type=float, default=None, help="cured solid density in g/cm^3 from T2")
    p.add_argument("--out", type=Path, default=Path("continuous_luneburg_gyroid.stl"))
    p.add_argument("--profile-out", type=Path, default=None)
    p.add_argument("--profile-only", action="store_true")
    a = p.parse_args()
    return Config(
        radius_mm=a.radius,
        cell_mm=a.cell,
        voxel_mm=a.voxel,
        eps_solid=a.eps_solid,
        rho_min=a.rho_min,
        rho_max=a.rho_max,
        hemisphere=a.hemisphere,
        gyroid_samples=a.gyroid_samples,
        profile_samples=a.profile_samples,
        calibration_csv=a.calibration_csv,
        solid_density_g_cm3=a.solid_density,
        out_stl=a.out,
        out_profile=a.profile_out,
        profile_only=a.profile_only,
    )


def main():
    cfg = parse_args()
    h_grid, rho_grid = calibrate_sheet_gyroid(cfg.gyroid_samples)
    profile = make_radial_profile(cfg, h_grid, rho_grid)
    profile_path = cfg.out_profile or cfg.out_stl.with_name(cfg.out_stl.stem + "_profile.csv")
    write_profile_csv(profile_path, *profile)

    estimate = estimate_full_sphere_material(profile[0], profile[3], cfg.solid_density_g_cm3)
    print(profile_path)
    for key, value in estimate.items():
        print(f"{key}={value:.6g}")

    if cfg.profile_only:
        return

    field, origin = build_scalar_field(cfg, h_grid, rho_grid)
    mesh = field_to_mesh(field, origin, cfg.voxel_mm)
    mesh.export(cfg.out_stl)
    print(cfg.out_stl)
    print("watertight=", mesh.is_watertight)


if __name__ == "__main__":
    main()
