#!/usr/bin/env python3
"""Process one Pico single-shot CDM324 IF CSV exported from serial.

Input includes header 'sample_index,adc_u16' and excludes BEGIN/END marker lines
(those can be left in: the parser ignores nonmatching rows).
WARNING: frequency axis assumes Fs exactly configured; reject data if overrun>0.
This computes VOLTAGE amplitude spectra, not radar RCS.
Dependencies: numpy only.
"""
from __future__ import annotations
import argparse
import csv
from pathlib import Path
import numpy as np

ADC_FULL_SCALE_V = 3.3
ADC_MAX = 65535.0

def read_adc(path: Path) -> np.ndarray:
    samples: list[int] = []
    found = False
    with path.open(encoding="utf-8-sig", newline="") as f:
        for row in csv.reader(f):
            if len(row) == 2 and row[0].strip() == "sample_index":
                found = True
                continue
            if found and len(row) == 2:
                try:
                    i, raw = int(row[0].strip()), int(row[1].strip())
                except ValueError:
                    continue
                if i != len(samples) or not 0 <= raw <= 65535:
                    raise ValueError(f"Bad sample index or ADC count: {row}")
                samples.append(raw)
    if not samples:
        raise ValueError("No ADC samples. Export serial text containing 'sample_index,adc_u16'.")
    return np.asarray(samples, dtype=np.float64)

def analyze(data: np.ndarray, fs: float, low: float, high: float) -> dict:
    if len(data) < 32 or fs <= 0 or not (0 <= low < high < fs / 2):
        raise ValueError("Need at least 32 samples and valid fs/band below Nyquist")
    volts = data / ADC_MAX * ADC_FULL_SCALE_V
    clip_fraction = float(np.mean((data <= 5) | (data >= 65530)))
    centered = volts - np.mean(volts)
    rms_v = float(np.sqrt(np.mean(centered ** 2)))
    n = len(centered)
    window = np.hanning(n)
    fft = np.fft.rfft(centered * window)
    freq = np.fft.rfftfreq(n, 1 / fs)
    # Correct for coherent window gain; amplitude spectrum, not integrated noise power.
    amplitude = 2 * np.abs(fft) / window.sum()
    amplitude[0] /= 2
    if n % 2 == 0:
        amplitude[-1] /= 2
    mask = (freq >= low) & (freq <= high)
    peak_hz = float(freq[mask][np.argmax(amplitude[mask])])
    peak_v = float(amplitude[mask].max())
    return {
        "fs_hz": fs, "N": n, "dc_mean_v": float(np.mean(volts)),
        "ac_rms_v": rms_v, "clip_fraction": clip_fraction,
        "selected_band_hz": (low, high), "peak_hz": peak_hz,
        "peak_amplitude_v": peak_v,
    }

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("input_csv", type=Path)
    p.add_argument("--fs", type=float, default=10000.0)
    p.add_argument("--low-hz", type=float, default=80.0)
    p.add_argument("--high-hz", type=float, default=1800.0)
    args = p.parse_args()
    result = analyze(read_adc(args.input_csv), args.fs, args.low_hz, args.high_hz)
    for k, value in result.items():
        print(f"{k}: {value}")
    if result["clip_fraction"] > 0:
        print("WARNING: ADC close to supply rails; measured amplitude may be invalid")
    print("INFO: This is one analog IF voltage snapshot, NOT calibrated RCS")

if __name__ == "__main__":
    main()
