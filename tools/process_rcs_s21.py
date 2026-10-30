#!/usr/bin/env python3
"""Process VNA Touchstone S21 data into relative/absolute RCS metrics.

Core rules:
- complex background subtraction only;
- optional smooth time gate in the delay domain;
- relative metric: |S_test/S_baseline|^2;
- absolute calibration: sigma_ref * |S_dut/S_ref|^2.

Touchstone support is intentionally minimal but robust for project use:
- .s2p
- RI / MA / DB formats
- Hz/kHz/MHz/GHz units
- S-parameter data only
"""

from __future__ import annotations

import argparse
import csv
import math
from dataclasses import dataclass
from pathlib import Path

import numpy as np


@dataclass
class S2P:
    frequency_hz: np.ndarray
    s21: np.ndarray


def _pair_to_complex(a: float, b: float, fmt: str) -> complex:
    fmt = fmt.upper()
    if fmt == "RI":
        return complex(a, b)
    if fmt == "MA":
        return a * np.exp(1j * math.radians(b))
    if fmt == "DB":
        return 10.0 ** (a / 20.0) * np.exp(1j * math.radians(b))
    raise ValueError(f"Unsupported Touchstone data format: {fmt}")


def read_s2p(path: Path) -> S2P:
    unit_scale = {"HZ": 1.0, "KHZ": 1e3, "MHZ": 1e6, "GHZ": 1e9}
    unit = "GHZ"
    parameter = "S"
    fmt = "MA"
    rows: list[list[float]] = []
    pending: list[float] = []

    for raw in path.read_text(encoding="utf-8-sig", errors="replace").splitlines():
        line = raw.split("!", 1)[0].strip()
        if not line:
            continue
        if line.startswith("#"):
            tokens = line[1:].upper().split()
            if tokens:
                unit = tokens[0]
            if len(tokens) >= 2:
                parameter = tokens[1]
            for candidate in ("RI", "MA", "DB"):
                if candidate in tokens:
                    fmt = candidate
            continue
        if line.startswith("["):
            # Touchstone 2.0 metadata lines are ignored; numeric network data
            # are still parsed below when present in ordinary rows.
            continue
        pending.extend(float(x) for x in line.replace(",", " ").split())
        while len(pending) >= 9:
            rows.append(pending[:9])
            pending = pending[9:]

    if pending:
        raise ValueError(f"Incomplete Touchstone numeric row in {path}")
    if not rows:
        raise ValueError(f"No network data found in {path}")
    if parameter != "S":
        raise ValueError(f"Only S-parameter Touchstone files are supported, got {parameter}")
    if unit not in unit_scale:
        raise ValueError(f"Unsupported frequency unit: {unit}")

    # Touchstone 2-port order is S11, S21, S12, S22.
    freq = np.asarray([r[0] * unit_scale[unit] for r in rows], dtype=float)
    s21 = np.asarray([_pair_to_complex(r[3], r[4], fmt) for r in rows], dtype=complex)

    if np.any(np.diff(freq) <= 0):
        raise ValueError(f"Frequency grid must be strictly increasing: {path}")
    return S2P(freq, s21)


def require_same_grid(*datasets: S2P, rtol: float = 1e-12, atol_hz: float = 1e-6) -> np.ndarray:
    ref = datasets[0].frequency_hz
    for ds in datasets[1:]:
        if len(ds.frequency_hz) != len(ref) or not np.allclose(ds.frequency_hz, ref, rtol=rtol, atol=atol_hz):
            raise ValueError("Frequency grids do not match; interpolation is disabled for primary processing")
    return ref


def complex_background_subtract(target: np.ndarray, background: np.ndarray) -> np.ndarray:
    return np.asarray(target, dtype=complex) - np.asarray(background, dtype=complex)


def uniform_df_hz(freq_hz: np.ndarray) -> float:
    d = np.diff(freq_hz)
    if len(d) == 0:
        raise ValueError("Need at least two frequency points")
    df = float(np.mean(d))
    if not np.allclose(d, df, rtol=1e-6, atol=max(1e-6, abs(df) * 1e-9)):
        raise ValueError("Time gating requires a uniformly spaced frequency grid")
    return df


def raised_cosine_gate(time_s: np.ndarray, center_s: float, width_s: float, edge_fraction: float = 0.2) -> np.ndarray:
    if width_s <= 0:
        raise ValueError("gate width must be positive")
    if not (0.0 <= edge_fraction < 0.5):
        raise ValueError("edge_fraction must be in [0, 0.5)")
    distance = np.abs(time_s - center_s)
    half = width_s / 2.0
    flat_half = half * (1.0 - 2.0 * edge_fraction)
    w = np.zeros_like(time_s, dtype=float)
    w[distance <= flat_half] = 1.0
    taper = (distance > flat_half) & (distance < half)
    if np.any(taper):
        x = (distance[taper] - flat_half) / (half - flat_half)
        w[taper] = 0.5 * (1.0 + np.cos(np.pi * x))
    return w


def time_gate_spectrum(
    freq_hz: np.ndarray,
    spectrum: np.ndarray,
    center_ns: float,
    width_ns: float,
    edge_fraction: float = 0.2,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    df = uniform_df_hz(freq_hz)
    n = len(freq_hz)
    time_s = np.arange(n, dtype=float) / (n * df)
    impulse = np.fft.ifft(spectrum)
    gate = raised_cosine_gate(time_s, center_ns * 1e-9, width_ns * 1e-9, edge_fraction=edge_fraction)
    gated = np.fft.fft(impulse * gate)
    return gated, time_s, gate


def relative_rcs(test: np.ndarray, baseline: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    denominator = np.maximum(np.abs(baseline), 1e-300)
    ratio_mag = np.abs(test) / denominator
    k_sigma = ratio_mag**2
    delta_db = 20.0 * np.log10(np.maximum(ratio_mag, 1e-300))
    return k_sigma, delta_db


def load_reference_rcs(path: Path, frequency_hz: np.ndarray) -> np.ndarray:
    f, s = [], []
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        if not reader.fieldnames or "frequency_hz" not in reader.fieldnames or "sigma_ref_m2" not in reader.fieldnames:
            raise ValueError("REFERENCE_RCS.csv must contain frequency_hz,sigma_ref_m2")
        for row in reader:
            f.append(float(row["frequency_hz"]))
            s.append(float(row["sigma_ref_m2"]))
    f_arr = np.asarray(f, dtype=float)
    s_arr = np.asarray(s, dtype=float)
    if len(f_arr) != len(frequency_hz) or not np.allclose(f_arr, frequency_hz, rtol=1e-12, atol=1e-6):
        raise ValueError("Reference RCS frequency grid must exactly match Touchstone grid")
    if np.any(s_arr <= 0):
        raise ValueError("sigma_ref_m2 must be positive")
    return s_arr


def absolute_rcs(dut: np.ndarray, reference: np.ndarray, sigma_ref_m2: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    ratio = np.abs(dut) / np.maximum(np.abs(reference), 1e-300)
    sigma = sigma_ref_m2 * ratio**2
    dbsm = 10.0 * np.log10(np.maximum(sigma, 1e-300))
    return sigma, dbsm


def nearest_index(freq_hz: np.ndarray, target_hz: float) -> int:
    return int(np.argmin(np.abs(freq_hz - target_hz)))


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--background", type=Path, required=True)
    p.add_argument("--baseline", type=Path, required=True)
    p.add_argument("--test", type=Path, required=True)
    p.add_argument("--reference", type=Path, default=None)
    p.add_argument("--reference-rcs", type=Path, default=None)
    p.add_argument("--gate-center-ns", type=float, default=None)
    p.add_argument("--gate-width-ns", type=float, default=None)
    p.add_argument("--gate-edge-fraction", type=float, default=0.2)
    p.add_argument("--target-frequency-ghz", type=float, default=5.0)
    p.add_argument("--out", type=Path, required=True)
    args = p.parse_args()

    if (args.gate_center_ns is None) != (args.gate_width_ns is None):
        raise SystemExit("Specify both --gate-center-ns and --gate-width-ns, or neither")
    if (args.reference is None) != (args.reference_rcs is None):
        raise SystemExit("Absolute calibration requires both --reference and --reference-rcs")

    bg = read_s2p(args.background)
    baseline = read_s2p(args.baseline)
    test = read_s2p(args.test)
    datasets = [bg, baseline, test]
    reference = None
    if args.reference is not None:
        reference = read_s2p(args.reference)
        datasets.append(reference)
    freq = require_same_grid(*datasets)

    baseline_corr = complex_background_subtract(baseline.s21, bg.s21)
    test_corr = complex_background_subtract(test.s21, bg.s21)
    ref_corr = None if reference is None else complex_background_subtract(reference.s21, bg.s21)

    if args.gate_center_ns is not None:
        baseline_corr, _, _ = time_gate_spectrum(freq, baseline_corr, args.gate_center_ns, args.gate_width_ns, args.gate_edge_fraction)
        test_corr, _, _ = time_gate_spectrum(freq, test_corr, args.gate_center_ns, args.gate_width_ns, args.gate_edge_fraction)
        if ref_corr is not None:
            ref_corr, _, _ = time_gate_spectrum(freq, ref_corr, args.gate_center_ns, args.gate_width_ns, args.gate_edge_fraction)

    k_sigma, delta_db = relative_rcs(test_corr, baseline_corr)

    sigma_test = sigma_test_dbsm = None
    if ref_corr is not None:
        sigma_ref = load_reference_rcs(args.reference_rcs, freq)
        sigma_test, sigma_test_dbsm = absolute_rcs(test_corr, ref_corr, sigma_ref)

    args.out.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = [
        "frequency_hz",
        "baseline_corr_real",
        "baseline_corr_imag",
        "test_corr_real",
        "test_corr_imag",
        "K_sigma_test_vs_baseline",
        "delta_sigma_db_test_vs_baseline",
    ]
    if sigma_test is not None:
        fieldnames += ["sigma_test_m2", "sigma_test_dbsm"]

    with args.out.open("w", encoding="utf-8", newline="") as handle:
        w = csv.DictWriter(handle, fieldnames=fieldnames)
        w.writeheader()
        for i, f_hz in enumerate(freq):
            row = {
                "frequency_hz": f_hz,
                "baseline_corr_real": baseline_corr[i].real,
                "baseline_corr_imag": baseline_corr[i].imag,
                "test_corr_real": test_corr[i].real,
                "test_corr_imag": test_corr[i].imag,
                "K_sigma_test_vs_baseline": k_sigma[i],
                "delta_sigma_db_test_vs_baseline": delta_db[i],
            }
            if sigma_test is not None:
                row["sigma_test_m2"] = sigma_test[i]
                row["sigma_test_dbsm"] = sigma_test_dbsm[i]
            w.writerow(row)

    idx = nearest_index(freq, args.target_frequency_ghz * 1e9)
    print(f"nearest_frequency_hz={freq[idx]:.6f}")
    print(f"K_sigma={k_sigma[idx]:.6g}")
    print(f"delta_sigma_db={delta_db[idx]:.6f}")
    if sigma_test is not None:
        print(f"sigma_test_m2={sigma_test[idx]:.6g}")
        print(f"sigma_test_dbsm={sigma_test_dbsm[idx]:.6f}")
    print(args.out)


if __name__ == "__main__":
    main()
