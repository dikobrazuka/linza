import math

import pytest

from simulation.run_reflector_sweep import is_in_cap_shell, lens_eps_with_shell, make_simulation


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


def test_shell_replaces_only_outer_layer_inside_fixed_diameter():
    assert math.isclose(lens_eps_with_shell(0, 0, 0, 40, 1.2, 1.4), 2.0)
    assert math.isclose(lens_eps_with_shell(38.7, 0, 0, 40, 1.2, 1.4), 2 - (38.7 / 40) ** 2)
    assert lens_eps_with_shell(38.8, 0, 0, 40, 1.2, 1.4) == 1.4
    assert lens_eps_with_shell(40, 0, 0, 40, 1.2, 1.4) == 1.4
    assert lens_eps_with_shell(40.01, 0, 0, 40, 1.2, 1.4) == 1.0


def test_no_shell_preserves_original_profile():
    assert math.isclose(lens_eps_with_shell(39, 0, 0, 40), 2 - (39 / 40) ** 2)
    assert lens_eps_with_shell(40, 0, 0, 40) == 1.0


@pytest.mark.parametrize("thickness,epsilon", [(-1, 1.4), (40, 1.4), (1.2, None), (1.2, float('nan')), (1.2, 0.9)])
def test_invalid_shell_is_rejected(thickness, epsilon):
    with pytest.raises(ValueError):
        lens_eps_with_shell(0, 0, 0, 40, thickness, epsilon)


def test_reflector_only_baseline_does_not_include_shell():
    class FakeMeep:
        Ez = 'Ez'
        metal = 'metal'
        air = 'air'
        Vector3 = staticmethod(lambda *args: args)
        GaussianSource = staticmethod(lambda *args, **kwargs: ('gaussian', args, kwargs))
        Source = staticmethod(lambda *args, **kwargs: ('source', args, kwargs))
        PML = staticmethod(lambda **kwargs: ('pml', kwargs))
        Medium = staticmethod(lambda **kwargs: kwargs)
        Simulation = staticmethod(lambda **kwargs: kwargs)

    from types import SimpleNamespace
    point = SimpleNamespace(x=0, y=39, z=0)
    kwargs = (FakeMeep, 40, 12.5, 5, 0.08, 0.016, 60, 1)
    baseline, *_ = make_simulation(*kwargs, False, 1.2, 1.4)
    test, *_ = make_simulation(*kwargs, True, 1.2, 1.4)
    assert baseline['material_function'](point) == 'air'
    assert test['material_function'](point) == {'epsilon': 1.4}
