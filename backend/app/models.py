import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class RubricCriterion(BaseModel):
    id: str
    name: str
    weight: float
    description: str
    deliverables: List[str] = []
    phase: Optional[str] = None

class RubricMapping(BaseModel):
    criterion_id: str
    criterion_name: str
    weight: float
    status: str # "Covered", "Partially Covered", "Missing"
    associated_milestones: List[str] = []
    associated_tasks: List[str] = []
    required_deliverables: List[str] = []
    produced_deliverables: List[str] = []
    corrective_actions: Optional[str] = None

class TaskModel(BaseModel):
    id: str
    name: str
    description: str
    duration_days: int
    start_day_offset: int = 0
    end_day_offset: int = 0
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    dependencies: List[str] = []
    priority: str = "Medium" # "High", "Medium", "Low"
    assigned_to: str = "Team"
    rubric_criteria_ids: List[str] = []
    deliverable: str = ""
    acceptance_criteria: str = ""
    status: str = "pending" # "pending", "in_progress", "completed", "delayed"
    is_critical_path: bool = False
    slack_days: int = 0
    risk_level: str = "Low" # "Low", "Medium", "High"
    mitigation: Optional[str] = None
    historical_benchmark_note: Optional[str] = None

class MilestoneModel(BaseModel):
    id: str
    name: str
    description: str
    phase: str
    start_date: Optional[str] = None
    target_date: Optional[str] = None
    start_day_offset: int = 0
    end_day_offset: int = 0
    tasks: List[TaskModel] = []
    review_stage: Optional[str] = None # e.g. "Review 1", "Final Viva"
    deliverable: str = ""
    acceptance_criteria: str = ""
    related_rubric_ids: List[str] = []
    risk_level: str = "Low"
    mitigation: str = ""
    completion_percentage: float = 0.0

class ProjectCreateRequest(BaseModel):
    title: str
    description: str
    category: str # "AI/ML", "Web Development", "IoT", "Data Science", "Research", "Other"
    start_date: str # YYYY-MM-DD
    deadline: str # YYYY-MM-DD
    team_size: int = 3
    hours_per_week: int = 20
    complexity: str = "Medium" # "Easy", "Medium", "Hard"
    tech_stack: List[str] = []
    deliverables: List[str] = []
    review_stages: int = 3
    constraints: List[str] = []
    unavailable_dates: List[str] = []
    uploaded_guidelines_text: Optional[str] = None

class ProjectModel(BaseModel):
    id: str
    title: str
    description: str
    category: str
    start_date: str
    deadline: str
    total_days: int
    team_size: int
    hours_per_week: int
    complexity: str
    tech_stack: List[str]
    deliverables: List[str]
    review_stages: int
    constraints: List[str]
    unavailable_dates: List[str]
    milestones: List[MilestoneModel] = []
    rubric_mappings: List[RubricMapping] = []
    critical_path: List[str] = []
    confidence_score: int = 85
    confidence_rationale: str = ""
    created_at: str
    updated_at: str

class DelaySimulationRequest(BaseModel):
    task_id: str
    delay_days: int
    reason: Optional[str] = "Unforeseen technical blocker"

class DelaySimulationResponse(BaseModel):
    original_finish_date: str
    new_finish_date: str
    deadline: str
    is_deadline_violated: bool
    affected_tasks: List[str]
    critical_path_affected: bool
    explanation: str
    recommended_mitigations: List[str]
    updated_milestones: List[MilestoneModel]

class ChatRequest(BaseModel):
    project_id: Optional[str] = None
    query: str
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    reply: str
    actions_taken: List[str] = []
    schedule_updated: bool = False
    updated_project: Optional[ProjectModel] = None
