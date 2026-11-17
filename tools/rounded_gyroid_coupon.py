#!/usr/bin/env python3
"""Uniform sheet-gyroid coupon, with rounded corners in the XY plane.

The requested fraction is calibrated on an infinite periodic unit cell. The
finite coupon can have a different fraction; check the exported mesh volume.
There are intentionally no walls or skins, to avoid hidden added plastic.
"""
from __future__ import annotations

import argparse
import math
from pathlib import Path

import numpy as np
import trimesh
from skimage.measure import marching_cubes

from tools.continuous_luneburg_gyroid import calibrate_sheet_gyroid, gyroid_value, h_from_rho


def build_coupon(width: float, height: float, corner: float, cell: float,
                 voxel: float, fraction: float) -> trimesh.Trimesh:
    if width <= 0 or height <= 0 or cell <= 0 or voxel <= 0:
        raise ValueError('Dimensions, cell and voxel must be positive')
    if not 0 < corner <= width / 2 or not 0 < fraction < 1:
        raise ValueError('Invalid corner radius or volume fraction')
    n = math.ceil((width / 2) / voxel) + 2
    xy = (np.arange(-n, n, dtype=np.float32) + 0.5) * voxel
    # Offset the samples to keep z=0 and z=height away from the voxel grid.
    z = (np.arange(-1, math.ceil(height / voxel) + 2, dtype=np.float32) + 0.37) * voxel
    x, y, zz = xy[:, None, None], xy[None, :, None], z[None, None, :]
    h_grid, rho_grid = calibrate_sheet_gyroid()
    h = float(h_from_rho(fraction, h_grid, rho_grid))
    G = gyroid_value(x, y, zz, cell).astype(np.float32)
    field = (h - np.abs(G)) * (cell / (2 * math.pi * math.sqrt(3)))
    qx = np.abs(x) - (width / 2 - corner)
    qy = np.abs(y) - (width / 2 - corner)
    rounded_sdf = np.sqrt(np.maximum(qx, 0)**2 + np.maximum(qy, 0)**2) + np.minimum(np.maximum(qx, qy), 0) - corner
    field = np.minimum(field, -rounded_sdf)
    field = np.minimum(field, np.minimum(zz, height - zz)).astype(np.float32)
    vertices, faces, _, _ = marching_cubes(field, level=0, spacing=(voxel,) * 3, allow_degenerate=False)
    vertices += np.array([xy[0], xy[0], z[0]])
    mesh = trimesh.Trimesh(vertices=vertices, faces=faces, process=False)
    mesh.remove_unreferenced_vertices()
    if mesh.volume < 0:
        mesh.invert()
    return mesh


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--width', type=float, default=120)
    parser.add_argument('--height', type=float, default=10)
    parser.add_argument('--corner', type=float, default=5)
    parser.add_argument('--cell', type=float, default=12)
    parser.add_argument('--voxel', type=float, default=0.4)
    parser.add_argument('--fraction', type=float, default=0.5)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    mesh = build_coupon(args.width, args.height, args.corner, args.cell, args.voxel, args.fraction)
    mesh.export(args.out)
    del mesh
    mesh = trimesh.load(args.out, force='mesh')
    envelope = (args.width**2 - (4 - math.pi) * args.corner**2) * args.height
    print(f'file={args.out}\nbounds_mm={mesh.bounds}\nvolume_mm3={mesh.volume:.3f}')
    print(f'volume_fraction={mesh.volume / envelope:.6f}\nfaces={len(mesh.faces)}')
    print(f'watertight={mesh.is_watertight}\nwinding={mesh.is_winding_consistent}')
    if not mesh.is_watertight or not mesh.is_winding_consistent or mesh.volume <= 0:
        raise RuntimeError('Exported STL failed validation')


if __name__ == '__main__':
    main()

