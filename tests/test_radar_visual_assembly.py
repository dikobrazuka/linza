"""Radar visual assembly: visual reference must agree with electrical manual."""
import json
from pathlib import Path
import re
import shutil
import subprocess
import pytest

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
SOURCE = ROOT / "electronics/05_BUILD_CDM324_STEP_BY_STEP.md"

def test_radar_32_actions_match_manual():
    raw = SOURCE.read_text(encoding="utf-8")
    visual = json.loads((SITE / "data/radar-assembly.json").read_text(encoding="utf-8"))
    steps = [step for stage in visual["stages"] for step in stage["steps"]]
    numbers = [step["number"] for step in steps]
    assert numbers == list(range(1, 33))
    assert len(visual["stages"]) == 8
    for step in steps:
        token = rf"\*\*Действие\s+{step['number']:02d}(?:\s+\([^)]*\))?\.\*\*"
        assert re.search(token, raw), f"Manual does not have step {step['number']}"
        assert step["text"].strip()
    assert visual["status"] == "UNVERIFIED_HARDWARE"
    assert "VCC/GND/IF" in visual["warning"]

def test_visual_pin_names_and_cdm324_stop_gate():
    html = (SITE / "radar.html").read_text(encoding="utf-8")
    js = (SITE / "radar.js").read_text(encoding="utf-8")
    css = (SITE / "radar.css").read_text(encoding="utf-8")
    assert '<svg id="opa-svg"' in html and '<svg id="pico-svg"' in html
    assert "A / B / C — НЕ VCC / GND / IF" in html
    assert "Pico pin 36" in html and "pin 31" in html
    assert "radar-assembly.json" in js
    assert "linza-radar-assembly-checked-v1" in js
    assert "pinHelp" in js and "chooseNet" in js
    assert "@media(max-width:650px)" in css
    assert "HARDWARE NOT TESTED" not in html or "не испытана" in html
    for p in ["site/index.html","site/board.html"]:
        assert "./radar.html" in (ROOT / p).read_text(encoding="utf-8")

def test_radar_json_net_names_and_pins():
    data = json.loads((SITE / "data/radar-assembly.json").read_text(encoding="utf-8"))
    nets = {x["id"] for x in data["nets"]}
    assert {"3V3","GND","VREF","INA","FBA","OUTA","INB","FBB","OUTB","ADC","RADAR"} == nets
    actual = {s["id"] for stage in data["stages"] for s in stage["steps"]}
    assert len(actual) == 32

@pytest.mark.skipif(shutil.which("node") is None, reason="NodeJS unavailable")
def test_radar_javascript_syntax():
    completed = subprocess.run(["node", "--check", str(SITE / "radar.js")], capture_output=True, text=True)
    assert completed.returncode == 0, completed.stderr
