import json
import os
from typing import Dict, Any, List

DATA_FILE = os.path.join(os.path.dirname(__file__), "data", "historical_projects.json")

def load_historical_data() -> Dict[str, Any]:
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"historical_projects": [], "standard_rubrics": []}

def get_historical_benchmarks(category: str, complexity: str) -> Dict[str, Any]:
    data = load_historical_data()
    projects = data.get("historical_projects", [])
    matched = [p for p in projects if p.get("category") == category]
    if not matched:
        matched = projects

    avg_planned = sum(p.get("planned_days", 30) for p in matched) / len(matched) if matched else 30
    avg_actual = sum(p.get("actual_days", 35) for p in matched) / len(matched) if matched else 35
    avg_delay = sum(p.get("delay_days", 5) for p in matched) / len(matched) if matched else 5

    common_bottlenecks = []
    for p in matched:
        common_bottlenecks.extend(p.get("key_bottlenecks", []))

    return {
        "sample_size": len(matched),
        "data_provenance": "Curated Synthetic Benchmark Cohort (Clearly labeled sample data for academic planning research)",
        "avg_planned_days": round(avg_planned, 1),
        "avg_actual_days": round(avg_actual, 1),
        "avg_slippage_percentage": round((avg_actual - avg_planned) / avg_planned * 100, 1),
        "frequent_bottlenecks": common_bottlenecks[:5],
        "category_matched": category,
        "sample_projects": matched
    }

def get_standard_rubrics() -> List[Dict[str, Any]]:
    data = load_historical_data()
    standard_rubrics = data.get("standard_rubrics", [])
    if standard_rubrics:
        return standard_rubrics[0].get("criteria", [])
    return []
