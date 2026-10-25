import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.scheduler import SchedulingEngine
from app.models import TaskModel

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_list_projects():
    res = client.get("/api/projects")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    assert data[0]["id"] == "sample-student-ml-30d"

def test_cpm_and_cycle_prevention():
    engine = SchedulingEngine(start_date="2026-10-01", deadline="2026-10-31")
    t1 = TaskModel(id="1", name="Task 1", description="", duration_days=3, dependencies=[])
    t2 = TaskModel(id="2", name="Task 2", description="", duration_days=4, dependencies=["1"])
    t3 = TaskModel(id="3", name="Task 3", description="", duration_days=2, dependencies=["2"])

    scheduled, cp, metrics = engine.compute_critical_path_and_schedule([t1, t2, t3])
    assert len(cp) == 3
    assert metrics["total_project_days"] == 9

    # Test cycle detection
    t1_bad = TaskModel(id="1", name="Task 1", description="", duration_days=3, dependencies=["3"])
    with pytest.raises(ValueError):
        engine.compute_critical_path_and_schedule([t1_bad, t2, t3])

def test_delay_simulation():
    res = client.post("/api/projects/sample-student-ml-30d/simulate-delay", json={
        "task_id": "t-04",
        "delay_days": 3,
        "reason": "Data cleaning blocker"
    })
    assert res.status_code == 200
    data = res.json()
    assert "explanation" in data
    assert len(data["recommended_mitigations"]) > 0

def test_assistant_chat():
    res = client.post("/api/assistant/chat", json={
        "project_id": "sample-student-ml-30d",
        "query": "Which tasks are on the critical path?"
    })
    assert res.status_code == 200
    data = res.json()
    assert "Critical Path Analysis" in data["reply"]
