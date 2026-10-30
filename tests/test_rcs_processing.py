from pathlib import Path

import numpy as np

from tools.process_rcs_s21 import (
    S2P,
    absolute_rcs,
    complex_background_subtract,
    read_s2p,
    relative_rcs,
    require_same_grid,
)
from simulation.analyze_diameter_gate import analyze


def test_complex_background_subtraction_not_magnitude_subtraction():
    target = np.array([1 + 1j])
    bg = np.array([1 - 1j])
    corrected = complex_background_subtract(target, bg)
    assert corrected[0] == 2j
    assert abs(corrected[0]) == 2.0


def test_relative_rcs_is_square_of_amplitude_ratio():
    baseline = np.array([1 + 0j, 2 + 0j])
    test = np.array([np.sqrt(10) + 0j, 4 + 0j])
    k, db = relative_rcs(test, baseline)
    assert np.allclose(k, [10.0, 4.0])
    assert np.allclose(db, [10.0, 20 * np.log10(2.0)])


def test_absolute_rcs_reference_ratio():
    dut = np.array([2 + 0j])
    ref = np.array([1 + 0j])
    sigma_ref = np.array([0.01])
    sigma, dbsm = absolute_rcs(dut, ref, sigma_ref)
    assert np.allclose(sigma, [0.04])
    assert np.allclose(dbsm, [10 * np.log10(0.04)])


def test_touchstone_s21_order_is_s11_s21_s12_s22(tmp_path: Path):
    p = tmp_path / "x.s2p"
    p.write_text(
        "# GHz S RI R 50\n"
        # f, S11=(1,0), S21=(2,3), S12=(4,5), S22=(6,7)
        "5.0 1 0 2 3 4 5 6 7\n",
        encoding="utf-8",
    )
    d = read_s2p(p)
    assert np.allclose(d.frequency_hz, [5e9])
    assert d.s21[0] == 2 + 3j


def test_grid_mismatch_is_rejected():
    a = S2P(np.array([1.0, 2.0]), np.array([1 + 0j, 1 + 0j]))
    b = S2P(np.array([1.0, 2.1]), np.array([1 + 0j, 1 + 0j]))
    try:
        require_same_grid(a, b)
    except ValueError as exc:
        assert "Frequency grids do not match" in str(exc)
    else:
        raise AssertionError("mismatched grids must be rejected")


def gate_row(d, ppl, rcs):
    return {
        "diameter_mm": str(d),
        "D_over_lambda": str(d / 60.0),
        "pixels_per_lambda": str(ppl),
        "backscatter_rcs_dbsm": str(rcs),
        "strict_scaled_D_24GHz_mm": str(d * 5 / 24),
    }


def test_diameter_analyzer_rejects_unconverged_smallest_case():
    rows = [
        gate_row(120, 16, -10.0),
        gate_row(120, 20, -8.0),  # 2 dB change -> fail convergence
        gate_row(150, 16, -5.1),
        gate_row(150, 20, -5.0),
        gate_row(180, 16, -4.1),
        gate_row(180, 20, -4.0),
    ]
    result = analyze(rows, convergence_gate_db=0.5, max_penalty_from_best_db=3.0)
    assert result["selected_diameter_mm"] == 150.0
    d120 = next(x for x in result["diameters"] if x["diameter_mm"] == 120.0)
    assert d120["convergence_pass"] is False
    assert d120["ideal_size_gate_pass"] is False
