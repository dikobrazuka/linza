from simulation.run_reflector_sweep import is_in_cap_shell


def test_cap_is_centered_on_plus_x_surface():
    r = 60.0
    t = 1.0
    assert is_in_cap_shell(+r, 0.0, 0.0, r, t, 30.0)
    assert not is_in_cap_shell(-r, 0.0, 0.0, r, t, 30.0)


def test_cap_angle_boundary():
    r = 60.0
    t = 1.0
    # 60 deg from +x axis.
    x = r * 0.5
    y = r * (3.0 ** 0.5 / 2.0)
    assert is_in_cap_shell(x, y, 0.0, r, t, 60.0)
    assert not is_in_cap_shell(x, y, 0.0, r, t, 45.0)


def test_cap_requires_shell_radius():
    r = 60.0
    assert not is_in_cap_shell(50.0, 0.0, 0.0, r, 1.0, 90.0)
    assert not is_in_cap_shell(70.0, 0.0, 0.0, r, 1.0, 90.0)
