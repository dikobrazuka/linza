import math

import numpy as np

from simulation.run_luneburg_focus_map import fwhm_from_profile, extract_focus_metrics
from tools.analyze_profile_clamp import analyze
from tools.pec_sphere_rcs import normalized_monostatic_rcs, pec_sphere_rcs


def test_pec_sphere_rayleigh_limit():
    # PEC sphere Rayleigh backscatter: sigma/(pi*a^2) ~ 9*x^4.
    for x in [0.02, 0.05, 0.1]:
        exact = normalized_monostatic_rcs(x)
        approx = 9.0 * x**4
        assert math.isclose(exact, approx, rel_tol=0.03)


def test_pec_sphere_optical_limit():
    # At large size parameter the monostatic RCS approaches pi*a^2.
    for x in [50.0, 100.0]:
        exact = normalized_monostatic_rcs(x)
        assert abs(exact - 1.0) < 0.02


def test_pec_sphere_rcs_positive_at_5ghz():
    out = pec_sphere_rcs(radius_m=0.05, frequency_hz=5e9)
    assert out["sigma_ref_m2"] > 0
    assert np.isfinite(out["sigma_ref_dbsm"])


def test_clamp_analyzer_no_clamp_is_zero_error():
    summary, _ = analyze(
        radius_mm=60.0,
        eps_solid=2.30318,
        rho_min=0.0,
        rho_max=1.0,
        samples=2001,
    )
    assert summary["total_clipped_volume_fraction"] == 0.0
    assert summary["max_abs_epsilon_error"] < 1e-8
    assert summary["volume_weighted_rms_epsilon_error"] < 1e-8


def test_clamp_analyzer_low_density_clips_outer_volume():
    summary, _ = analyze(
        radius_mm=60.0,
        eps_solid=2.30318,
        rho_min=0.20,
        rho_max=1.0,
        samples=4001,
    )
    assert 0.0 < summary["low_density_clipped_volume_fraction"] < 1.0
    assert summary["high_density_clipped_volume_fraction"] == 0.0
    assert summary["volume_average_rho_used"] > summary["volume_average_rho_required"]
    assert summary["low_density_clip_starts_r_over_R"] is not None


def test_fwhm_simple_profile():
    z = np.linspace(-5, 5, 101)
    v = np.exp(-(z / 2.0) ** 2)
    width = fwhm_from_profile(z, v)
    assert width is not None
    assert 3.0 < width < 3.6


def test_focus_metric_extraction():
    x = np.linspace(-80, 100, 181)
    z = np.linspace(-60, 60, 121)
    X, Z = np.meshgrid(x, z, indexing="ij")
    field = 1.0 + 9.0 * np.exp(-((X - 61.0) / 4.0) ** 2 - (Z / 8.0) ** 2)
    metrics = extract_focus_metrics(x, z, field, radius_mm=60.0)
    assert abs(metrics["focus_x_mm"] - 61.0) <= 1.0
    assert abs(metrics["focus_z_mm"]) <= 1.0
    assert metrics["peak_normalized_E2"] > 9.0
    assert metrics["transverse_fwhm_mm"] is not None
