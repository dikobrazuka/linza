from pathlib import Path
import math
import numpy as np
from tools.analyze_cdm324_if import analyze, read_adc

ROOT = Path(__file__).resolve().parents[1]

def test_three_designs_are_distinct():
    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    pla = (ROOT / "simulation/configs/PLA_200_5G.yaml").read_text(encoding="utf-8")
    de10 = (ROOT / "simulation/INPUTS_TEMPLATE.yaml").read_text(encoding="utf-8")
    assert "Ø200 мм относится только к PLA" in readme
    assert "diameter_mm: 200.0" in pla
    assert "physical_diameter_mm: 120.0" in de10
    assert "customer_diameter_mm: 80.0" in de10

def test_electrical_component_counts_and_gain():
    bom = (ROOT / "electronics/03_CDM324_PICO_BOM.csv").read_text(encoding="utf-8")
    assert "R1 R2 R4 R7,10k 1%,4" in bom
    assert "R5 R8,100k 1%,2" in bom
    assert "C2 C3 C4 C6,100nF ceramic,4" in bom
    assert math.isclose((1+100/10)**2, 121)
    assert math.isclose(1/(2*math.pi*3300*22e-9), 2192.0, rel_tol=.01)

def test_ideal_luneburg_diameter_calculations():
    lam_mm = 299792458 / 5e9 * 1000
    assert math.isclose(200/lam_mm, 3.3356, rel_tol=2e-4)
    assert math.isclose(2*(.2)**2/(lam_mm/1000), 1.3343, rel_tol=2e-4)
    assert math.isclose(200*5/24, 41.6666667, abs_tol=.00001)

def test_adc_analyzer_detects_tone():
    fs=10000
    n=4096
    x=np.arange(n)
    tone=200.0
    adc=(32768+5000*np.sin(2*np.pi*tone*x/fs))
    result=analyze(adc,fs,80,1800)
    assert abs(result["peak_hz"]-tone) <= fs/n
    assert result["clip_fraction"]==0
    assert result["ac_rms_v"]>0

def test_adc_csv_reader(tmp_path):
    f=tmp_path/"a.csv"
    f.write_text("BEGIN_CDM324_CSV\n# run_id=R\nsample_index,adc_u16\n0,32768\n1,33000\nEND_CDM324_CSV\n",encoding="utf8")
    assert np.array_equal(read_adc(f),np.array([32768,33000]))
