import math

from simulation.run_ideal_luneburg_rcs import (
    luneburg_epsilon_xyz,
    wavelength_mm,
)


def test_5ghz_wavelength():
    assert math.isclose(wavelength_mm(5.0), 59.9584916, rel_tol=1e-9)


def test_luneburg_center_surface_and_outside():
    R = 60.0
    assert math.isclose(luneburg_epsilon_xyz(0.0, 0.0, 0.0, R), 2.0)
    assert math.isclose(luneburg_epsilon_xyz(R, 0.0, 0.0, R), 1.0)
    assert math.isclose(luneburg_epsilon_xyz(R + 1.0, 0.0, 0.0, R), 1.0)


def test_luneburg_mid_radius():
    R = 60.0
    eps = luneburg_epsilon_xyz(0.5 * R, 0.0, 0.0, R)
    assert math.isclose(eps, 1.75, rel_tol=0, abs_tol=1e-12)
