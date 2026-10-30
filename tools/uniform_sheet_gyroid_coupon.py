#!/usr/bin/env python3
"""Generate uniform-density sheet-gyroid calibration coupons.

Geometry:
    material = |G(x,y,z)| <= h
    G = sin(kx)cos(ky) + sin(ky)cos(kz) + sin(kz)cos(kx)

The threshold h is obtained from the same numerical H(h)=rho calibration
used by continuous_luneburg_gyroid.py. The coupon box should preferably
contain an integer number of gyroid periods in X/Y/Z.

Default T3 coupon:
    30 x 30 x 15 mm
    a = 7.5 mm -> 4 x 4 x 2 periods
"""

from __future__ import annotations

import argparse
import csv
import math
from pathlib import Path
from typing import Iterable, Tuple

import numpy as np
import trimesh
from skimage.measure import marching_cubes


DEFAULT_RHOS = [0.10, 0.15, 0.20, 0.30, 0.40, 0.50, 0.65, 0.81, 0.90]


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


def h_from_rho(rho: float, h_grid: np.ndarray, rho_grid: np.ndarray) -> float:
    if not (0.0 < rho < 1.0):
        raise ValueError("rho must be between 0 and 1")
    return float(np.interp(rho, rho_grid, h_grid))


def gyroid_value(x, y, z, cell_mm: float):
    k = 2.0 * math.pi / cell_mm
    X, Y, Z = k * x, k * y, k * z
    return (
        np.sin(X) * np.cos(Y)
        + np.sin(Y) * np.cos(Z)
        + np.sin(Z) * np.cos(X)
    )


def padded_axis_for_length(length_mm: float, voxel_mm: float) -> np.ndarray:
    """Return an axis with one sample outside each clipping-box face.

    The interior box is sampled with n cells and exact endpoints +/-L/2.
    The outside samples let marching cubes close the clipped surface instead
    of terminating at the array boundary.
    """
    if length_mm <= 0 or voxel_mm <= 0:
        raise ValueError("length and voxel must be positive")
    n = int(round(length_mm / voxel_mm))
    if n < 2:
        raise ValueError("voxel too large for coupon size")
    spacing = length_mm / n
    start = -length_mm / 2.0 - spacing
    stop = length_mm / 2.0 + spacing
    return np.linspace(start, stop, n + 3, dtype=np.float32)


def build_field(
    size_x: float,
    size_y: float,
    size_z: float,
    cell_mm: float,
    h: float,
    voxel_mm: float,
):
    ax = padded_axis_for_length(size_x, voxel_mm)
    ay = padded_axis_for_length(size_y, voxel_mm)
    az = padded_axis_for_length(size_z, voxel_mm)

    x = ax[:, None, None]
    y = ay[None, :, None]
    z = az[None, None, :]

    G = gyroid_value(x, y, z, cell_mm).astype(np.float32, copy=False)
    gyroid_field = h - np.abs(G)

    # Pairwise np.minimum broadcasts these differently-shaped arrays.
    # np.minimum.reduce([...]) does not and raises ValueError.
    box_field = np.minimum(
        size_x / 2.0 - np.abs(x),
        size_y / 2.0 - np.abs(y),
    )
    box_field = np.minimum(
        box_field,
        size_z / 2.0 - np.abs(z),
    ).astype(np.float32, copy=False)

    field = np.minimum(gyroid_field, box_field)

    origin = np.array([ax[0], ay[0], az[0]], dtype=np.float64)
    spacing = (
        float(ax[1] - ax[0]),
        float(ay[1] - ay[0]),
        float(az[1] - az[0]),
    )
    return field, origin, spacing


def field_to_mesh(field, origin, spacing):
    verts, faces, normals, _ = marching_cubes(
        field,
        level=0.0,
        spacing=spacing,
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


def rho_tag(rho: float) -> str:
    return f"rho{int(round(rho * 1000)):03d}"


def generate_one(
    rho: float,
    size_x: float,
    size_y: float,
    size_z: float,
    cell_mm: float,
    voxel_mm: float,
    h_grid,
    rho_grid,
    out_dir: Path,
    solid_density_g_cm3: float | None,
):
    h = h_from_rho(rho, h_grid, rho_grid)
    field, origin, spacing = build_field(
        size_x, size_y, size_z, cell_mm, h, voxel_mm
    )
    mesh = field_to_mesh(field, origin, spacing)

    name = f"GYR_{rho_tag(rho)}_{size_x:g}x{size_y:g}x{size_z:g}_a{cell_mm:g}.stl"
    path = out_dir / name
    mesh.export(path)

    envelope_mm3 = size_x * size_y * size_z
    mesh_volume_mm3 = abs(float(mesh.volume))
    rho_mesh = mesh_volume_mm3 / envelope_mm3
    predicted_mass_g = None
    if solid_density_g_cm3 is not None:
        predicted_mass_g = mesh_volume_mm3 / 1000.0 * solid_density_g_cm3

    return {
        "file": name,
        "rho_target": rho,
        "gyroid_h": h,
        "cell_mm": cell_mm,
        "size_x_mm": size_x,
        "size_y_mm": size_y,
        "size_z_mm": size_z,
        "voxel_requested_mm": voxel_mm,
        "spacing_x_mm": spacing[0],
        "spacing_y_mm": spacing[1],
        "spacing_z_mm": spacing[2],
        "envelope_mm3": envelope_mm3,
        "mesh_volume_mm3": mesh_volume_mm3,
        "rho_mesh": rho_mesh,
        "rho_mesh_error_percent": 100.0 * (rho_mesh - rho) / rho,
        "predicted_mass_g": predicted_mass_g,
        "watertight": bool(mesh.is_watertight),
    }


def parse_rhos(values: Iterable[str]) -> list[float]:
    out = []
    for value in values:
        for token in value.split(","):
            token = token.strip()
            if token:
                out.append(float(token))
    return out


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--size-x", type=float, default=30.0)
    p.add_argument("--size-y", type=float, default=30.0)
    p.add_argument("--size-z", type=float, default=15.0)
    p.add_argument("--cell", type=float, default=7.5)
    p.add_argument(
        "--rho",
        nargs="*",
        default=[str(x) for x in DEFAULT_RHOS],
        help="one or more rho values; comma-separated values are accepted",
    )
    p.add_argument(
        "--voxel",
        type=float,
        default=0.075,
        help="requested marching-cubes spacing in mm; use 0.05 for low rho if RAM permits",
    )
    p.add_argument("--gyroid-samples", type=int, default=96)
    p.add_argument("--solid-density", type=float, default=None, help="g/cm^3")
    p.add_argument("--out-dir", type=Path, default=Path("gyroid_coupons"))
    args = p.parse_args()

    rhos = parse_rhos(args.rho)
    if not rhos:
        raise ValueError("no rho values supplied")

    for rho in rhos:
        if not (0.0 < rho < 1.0):
            raise ValueError(f"rho={rho} must be between 0 and 1")

    for length, label in [
        (args.size_x, "size-x"),
        (args.size_y, "size-y"),
        (args.size_z, "size-z"),
    ]:
        periods = length / args.cell
        if abs(periods - round(periods)) > 1e-9:
            raise ValueError(
                f"{label}={length} mm is not an integer multiple of cell={args.cell} mm"
            )

    args.out_dir.mkdir(parents=True, exist_ok=True)
    h_grid, rho_grid = calibrate_sheet_gyroid(args.gyroid_samples)

    rows = []
    for rho in rhos:
        print(f"Generating rho={rho:.3f} ...", flush=True)
        row = generate_one(
            rho,
            args.size_x,
            args.size_y,
            args.size_z,
            args.cell,
            args.voxel,
            h_grid,
            rho_grid,
            args.out_dir,
            args.solid_density,
        )
        rows.append(row)
        print(
            f"  h={row['gyroid_h']:.6f}, mesh rho={row['rho_mesh']:.5f}, "
            f"error={row['rho_mesh_error_percent']:+.2f}%, watertight={row['watertight']}"
        )

    csv_path = args.out_dir / "GYROID_T3_COUPONS.csv"
    with csv_path.open("w", encoding="utf-8", newline="") as f:
        fieldnames = list(rows[0].keys())
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)

    print(csv_path)


if __name__ == "__main__":
    main()
