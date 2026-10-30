import math

from tools.scale_5_to_24 import scale_summary


def test_current_120mm_pair_scales_to_25mm():
    out = scale_summary(120.0, 7.5, mass_5_g=366.0)
    assert math.isclose(out["diameter_24_mm"], 25.0)
    assert math.isclose(out["radius_24_mm"], 12.5)
    assert math.isclose(out["cell_24_mm"], 1.5625)
    assert out["diameter_gate"] == "PASS"
    assert out["mass_gate"] == "PASS"


def test_min_wall_can_fail_even_when_size_and_mass_pass():
    out = scale_summary(
        120.0,
        7.5,
        mass_5_g=366.0,
        min_wall_5_mm=0.6,
        printer_min_wall_mm=0.15,
    )
    assert out["diameter_gate"] == "PASS"
    assert out["mass_gate"] == "PASS"
    assert out["min_wall_24_mm_strict_scaled"] == 0.125
    assert out["min_wall_gate"] == "FAIL"
