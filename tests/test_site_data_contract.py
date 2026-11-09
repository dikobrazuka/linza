"""Site data source-of-truth contract: no unverified purchase/results presented as fact."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def load(name):
    return json.loads((ROOT / "site" / "data" / name).read_text(encoding="utf-8"))

def test_three_specimens_are_not_interchanged():
    p=load("project.json")
    d={x["id"]:(x["diameter_mm"],x["frequency_ghz"]) for x in p["specimens"]}
    assert d=={"pla200":(200,5),"de10_120":(120,5),"customer80":(80,24)}
    assert p["target"]["diameter_mm"]==80
    assert p["target"]["mass_limit_g"]==300
    assert all(x["status"]=="planned" for x in p["specimens"])

def test_cart_complete_and_arithmetic_is_not_doubled():
    p=load("procurement.json")
    rows=p["rows"]
    assert len(rows)==32
    assert len({x["id"] for x in rows})==32
    assert [x["original_row"] for x in rows]==list(range(1,33))
    assert sum(x["line_total_rub"] for x in rows)==p["planned_cart_total_rub"]==24267
    assert p["existing_resin_plan"]["estimated_cost_rub"]==14000
    assert p["in_cart_price_total_including_resin_plan_rub"]==38267
    assert all(x["status"]=="planned" and x["ordered_at"] is None and x["received_at"] is None for x in rows)
    assert all(x["source_url"].startswith("https://") for x in rows)

def test_actions_have_real_source_documents_and_ids():
    a=load("actions.json")["actions"]
    assert len(a)>=24
    assert len({x["id"] for x in a})==len(a)
    assert all(x["document"] and (ROOT / x["document"]).is_file() for x in a)
    assert all(x["status"] in {"planned","doing","blocked","done"} for x in a)
    assert all(x["steps"] and x["title"] for x in a)

def test_live_pages_use_repo_json():
    work=(ROOT/"site/work.js").read_text(encoding="utf-8")
    board=(ROOT/"site/board.html").read_text(encoding="utf-8")
    dash=(ROOT/"site/data-dashboard.js").read_text(encoding="utf-8")
    state=(ROOT/"site/site-state.js").read_text(encoding="utf-8")
    assert "app.load('actions')" in work and "app.load('project')" in work
    assert "app.load('procurement')" in dash and "app.load('actions')" in dash
    assert "fetch('./data/'+name+'.json'" in state
    assert "fallbackTasks" not in work
    assert "id=\"canonicalBudgetData\"" in board
    assert "id=\"canonicalActionsData\"" in board
    assert "data-dashboard.js" in board and "site-state.js" in board
    assert "linza-wbs-v1" in board and "linza-budget-v1" in board
