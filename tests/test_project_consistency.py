from pathlib import Path

from tools.continuous_luneburg_gyroid import Config


ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_generator_defaults_match_current_physical_v1():
    cfg = Config()
    assert cfg.radius_mm == 60.0
    assert cfg.cell_mm == 7.5
    assert cfg.eps_solid == 2.30318


def test_root_readme_contains_current_canonical_sizes():
    text = read("README.md")
    assert "D_test = 120 mm" in text
    assert "R_test = 60 mm" in text
    assert "D_final = 25.0 mm" in text
    assert "R_final = 12.5 mm" in text


def test_input_template_contains_current_canonical_sizes():
    text = read("simulation/INPUTS_TEMPLATE.yaml")
    assert "physical_diameter_mm: 120.0" in text
    assert "physical_radius_mm: 60.0" in text
    assert "diameter_mm_strict_scaled: 25.0" in text
    assert "radius_mm_strict_scaled: 12.5" in text


def test_scaling_document_contains_current_pair():
    text = read("docs/10_SCALING_5_TO_24.md")
    assert "D_test=120 mm" in text
    assert "R_test=60 mm" in text
    assert "| D | 120 mm | 25.0 mm |" in text
    assert "| R | 60 mm | 12.5 mm |" in text
    assert "5/24" in text


def test_next_actions_links_required_gates():
    text = read("docs/04_NEXT_ACTIONS.md")
    assert "diameter gate" in text.lower()
    assert "material budget" in text.lower()
    assert "T4" in text
