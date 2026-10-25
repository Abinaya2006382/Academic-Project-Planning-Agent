import os
import io
import datetime
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from typing import List, Optional

from app.models import (
    ProjectCreateRequest, ProjectModel, DelaySimulationRequest,
    DelaySimulationResponse, ChatRequest, ChatResponse
)
from app.milestone_generator import MilestoneGenerator
from app.storage import project_store
from app.historical_service import get_historical_benchmarks, get_standard_rubrics, load_historical_data
from app.scheduler import SchedulingEngine
from app.assistant import AssistantService

app = FastAPI(
    title="Academic Project Planning & Milestone Reasoning Agent API",
    version="1.0.0",
    description="Backend API for DAG-based academic project scheduling, rubric mapping, and milestone reasoning."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from contextlib import asynccontextmanager

def ensure_sample_project():
    projects = project_store.get_all()
    if not any(p.get("id") == "sample-student-ml-30d" for p in projects):
        today = datetime.date.today()
        deadline = today + datetime.timedelta(days=30)
        sample_req = ProjectCreateRequest(
            title="Student Performance Prediction Using Machine Learning",
            description="An end-to-end machine learning system to predict student examination outcomes and detect at-risk students using behavioral indicators, engagement logs, and demographic features.",
            category="AI/ML",
            start_date=today.strftime("%Y-%m-%d"),
            deadline=deadline.strftime("%Y-%m-%d"),
            team_size=3,
            hours_per_week=20,
            complexity="Medium",
            tech_stack=["Python", "Scikit-Learn", "FastAPI", "React", "PostgreSQL", "Pandas"],
            deliverables=["SRS Document", "Cleaned Dataset", "Trained ML Model", "Evaluation Metrics Report", "Web Application", "Final Thesis PDF"],
            review_stages=3,
            constraints=["Limited GPU quota for grid search", "Final Viva scheduled in Week 4"],
            unavailable_dates=[(today + datetime.timedelta(days=14)).strftime("%Y-%m-%d")]
        )
        sample_project = MilestoneGenerator.generate_project_plan(sample_req)
        sample_project.id = "sample-student-ml-30d"
        project_store.save(sample_project)

@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_sample_project()
    yield

app = FastAPI(
    title="Academic Project Planning & Milestone Reasoning Agent API",
    version="1.0.0",
    description="Backend API for DAG-based academic project scheduling, rubric mapping, and milestone reasoning.",
    lifespan=lifespan
)

ensure_sample_project()

@app.get("/api/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.datetime.now().isoformat()}

# Project endpoints
@app.get("/api/projects", response_model=List[ProjectModel])
def list_projects():
    projects = project_store.get_all()
    return projects

@app.get("/api/projects/{project_id}", response_model=ProjectModel)
def get_project(project_id: str):
    p = project_store.get(project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    return p

@app.post("/api/projects", response_model=ProjectModel)
def create_project(req: ProjectCreateRequest):
    try:
        project = MilestoneGenerator.generate_project_plan(req)
        project_store.save(project)
        return project
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: str):
    success = project_store.delete(project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted successfully"}

# Historical analysis & benchmarks
@app.get("/api/historical-analysis")
def get_historical_analysis(category: Optional[str] = "AI/ML", complexity: Optional[str] = "Medium"):
    benchmarks = get_historical_benchmarks(category, complexity)
    raw_data = load_historical_data()
    return {
        "benchmarks": benchmarks,
        "historical_cohort": raw_data.get("historical_projects", []),
        "standard_rubrics": get_standard_rubrics()
    }

# Delay simulation & schedule reasoning
@app.post("/api/projects/{project_id}/simulate-delay", response_model=DelaySimulationResponse)
def simulate_delay(project_id: str, req: DelaySimulationRequest):
    p_data = project_store.get(project_id)
    if not p_data:
        raise HTTPException(status_code=404, detail="Project not found")

    project = ProjectModel(**p_data)
    all_tasks = [t for m in project.milestones for t in m.tasks]
    target_task = next((t for t in all_tasks if t.id == req.task_id), None)
    if not target_task:
        raise HTTPException(status_code=404, detail=f"Task {req.task_id} not found in project")

    scheduler = SchedulingEngine(
        start_date=project.start_date,
        deadline=project.deadline,
        unavailable_dates=project.unavailable_dates
    )

    original_scheduled_tasks, orig_cp, orig_metrics = scheduler.compute_critical_path_and_schedule(all_tasks)
    updated_tasks, new_cp, new_metrics = scheduler.simulate_task_delay(all_tasks, req.task_id, req.delay_days)

    task_map = {t.id: t for t in updated_tasks}
    updated_milestones = []
    for m in project.milestones:
        m_copy = m.model_copy()
        m_copy.tasks = [task_map[t.id] for t in m.tasks if t.id in task_map]
        if m_copy.tasks:
            m_copy.start_date = min(t.start_date for t in m_copy.tasks)
            m_copy.target_date = max(t.end_date for t in m_copy.tasks)
        updated_milestones.append(m_copy)

    # Affected downstream tasks
    affected = [t.name for t in updated_tasks if t.id != req.task_id and t.start_date != next(ot.start_date for ot in original_scheduled_tasks if ot.id == t.id)]

    is_cp = target_task.is_critical_path
    explanation = (
        f"Simulating a {req.delay_days}-day delay on '{target_task.name}' shifts its completion date. "
        + (f"Since '{target_task.name}' is on the critical path, downstream dependent tasks ({', '.join(affected[:3]) if affected else 'subsequent phases'}) are pushed by {req.delay_days} days. " if is_cp else f"Since '{target_task.name}' had slack, the project buffer absorbed part of the delay. ")
        + (f"CRITICAL WARNING: The revised completion date ({new_metrics['scheduled_finish_date']}) exceeds the deadline ({project.deadline}) by {abs(new_metrics['days_buffer_or_overdue'])} days!" if new_metrics["is_over_deadline"] else f"The revised completion date ({new_metrics['scheduled_finish_date']}) remains within the deadline buffer ({new_metrics['days_buffer_or_overdue']} days remaining).")
    )

    mitigations = [
        "Reallocate team members from non-critical tasks to expedite the delayed task.",
        "Execute documentation and demo UI drafting concurrently during model training.",
        "Deploy lightweight pre-trained baselines for intermediate milestone reviews."
    ]

    # Save updated schedule to store
    project.milestones = updated_milestones
    project.critical_path = new_cp
    project_store.save(project)

    return DelaySimulationResponse(
        original_finish_date=orig_metrics["scheduled_finish_date"],
        new_finish_date=new_metrics["scheduled_finish_date"],
        deadline=project.deadline,
        is_deadline_violated=new_metrics["is_over_deadline"],
        affected_tasks=affected,
        critical_path_affected=is_cp,
        explanation=explanation,
        recommended_mitigations=mitigations,
        updated_milestones=updated_milestones
    )

# AI Planning Assistant chat
@app.post("/api/assistant/chat", response_model=ChatResponse)
def assistant_chat(req: ChatRequest):
    project = None
    if req.project_id:
        p_data = project_store.get(req.project_id)
        if p_data:
            project = ProjectModel(**p_data)

    reply, actions, updated, new_proj = AssistantService.process_query(project, req.query)
    if updated and new_proj:
        project_store.save(new_proj)

    return ChatResponse(
        reply=reply,
        actions_taken=actions,
        schedule_updated=updated,
        updated_project=new_proj
    )

# Document upload parsing (guidelines / rubric)
@app.post("/api/projects/parse-guidelines")
async def parse_guidelines(file: UploadFile = File(...)):
    contents = await file.read()
    filename = file.filename.lower()
    text = ""
    try:
        text = contents.decode("utf-8", errors="ignore")
    except Exception:
        text = f"Uploaded document: {file.filename} (Binary document ingested)"

    # Extract requirements keywords
    extracted_keywords = []
    for kw in ["literature review", "methodology", "dataset", "ablation", "f1-score", "accuracy", "presentation", "srs", "architecture"]:
        if kw in text.lower():
            extracted_keywords.append(kw.title())

    return {
        "filename": file.filename,
        "filesize": len(contents),
        "detected_academic_elements": extracted_keywords or ["Literature Review", "Implementation", "Testing", "Documentation"],
        "summary": f"Successfully parsed {file.filename}. Extracted academic requirements mapped to Rubric Evaluator."
    }

# CSV Export
@app.get("/api/projects/{project_id}/export-csv")
def export_csv(project_id: str):
    p_data = project_store.get(project_id)
    if not p_data:
        raise HTTPException(status_code=404, detail="Project not found")

    project = ProjectModel(**p_data)
    output = io.StringIO()
    output.write("Milestone,Task ID,Task Name,Assigned To,Duration (Days),Start Date,End Date,Dependencies,Critical Path,Deliverable\n")
    for m in project.milestones:
        for t in m.tasks:
            output.write(f'"{m.name}","{t.id}","{t.name}","{t.assigned_to}",{t.duration_days},"{t.start_date}","{t.end_date}","{";".join(t.dependencies)}",{"Yes" if t.is_critical_path else "No"},"{t.deliverable}"\n')

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={project.title.replace(' ', '_')}_schedule.csv"}
    )
