import os
import json
import uuid
import datetime
from typing import List, Dict, Any, Tuple
from app.models import (
    ProjectCreateRequest, ProjectModel, MilestoneModel, TaskModel, RubricMapping
)
from app.scheduler import SchedulingEngine
from app.historical_service import get_standard_rubrics, get_historical_benchmarks

class MilestoneGenerator:
    """
    Reasoning engine that derives structured phases, tasks, and rubric mappings
    tailored to project category, constraints, team size, and review stages.
    """

    @staticmethod
    def get_template_milestones(category: str, duration_days: int) -> List[Dict[str, Any]]:
        # Scale default duration proportions
        scale = max(0.5, duration_days / 30.0)

        if category == "AI/ML" or category == "Data Science":
            return [
                {
                    "phase": "Problem Definition & Requirements",
                    "name": "Problem Definition & Scoping",
                    "desc": "Establish objective, formulate research question, identify target datasets, and specify accuracy/F1 evaluation metrics.",
                    "review_stage": "Review 0 / Kickoff",
                    "deliverable": "Problem Formulation & Scope Document",
                    "acceptance": "Approved proposal with clearly defined problem formulation and benchmark references.",
                    "rubric_ids": ["rub-01"],
                    "risk_level": "Low",
                    "mitigation": "Review with faculty guide early to prevent scope creep.",
                    "tasks": [
                        {
                            "id": "t-01",
                            "name": "Stakeholder Requirements & Scope Analysis",
                            "desc": "Formulate core problem statement, project scope boundaries, and measurable performance benchmarks.",
                            "duration": max(2, int(3 * scale)),
                            "deps": [],
                            "priority": "High",
                            "rubric_ids": ["rub-01"],
                            "deliverable": "Project Scope Document",
                            "acceptance": "Approved by project supervisor",
                            "assigned_to": "Alice (Lead)"
                        },
                        {
                            "id": "t-02",
                            "name": "Dataset Identification & Acquisition Feasibility",
                            "desc": "Source academic/public datasets (e.g. Kaggle/UCI/MIMIC) and verify licensing and completeness.",
                            "duration": max(2, int(2 * scale)),
                            "deps": ["t-01"],
                            "priority": "High",
                            "rubric_ids": ["rub-01"],
                            "deliverable": "Dataset License & Ingestion Report",
                            "acceptance": "Raw CSV/images downloaded and sample inspection verified",
                            "assigned_to": "Bob (Data Eng)"
                        }
                    ]
                },
                {
                    "phase": "Literature Survey & Prior Art",
                    "name": "Literature Review & Baseline Analysis",
                    "desc": "Review peer-reviewed literature, compare classical vs deep learning approaches, and document existing benchmarks.",
                    "review_stage": "Review 1",
                    "deliverable": "Comprehensive Literature Survey Chapter & Comparison Matrix",
                    "acceptance": "At least 10 relevant peer-reviewed papers cataloged with pros, cons, and performance numbers.",
                    "rubric_ids": ["rub-02"],
                    "risk_level": "Low",
                    "mitigation": "Focus on high-impact journal papers and standard reproducible baselines.",
                    "tasks": [
                        {
                            "id": "t-03",
                            "name": "Taxonomy of SOTA Models & Prior Art Survey",
                            "desc": "Examine state-of-the-art architectures in literature and summarize their accuracy, precision, and limitations.",
                            "duration": max(2, int(3 * scale)),
                            "deps": ["t-01"],
                            "priority": "Medium",
                            "rubric_ids": ["rub-02"],
                            "deliverable": "Literature Synthesis Matrix",
                            "acceptance": "Comparative table with 10+ cited IEEE/ACM/NeurIPS papers",
                            "assigned_to": "Charlie (Researcher)"
                        }
                    ]
                },
                {
                    "phase": "Data Preparation & EDA",
                    "name": "Data Cleaning & Exploratory Data Analysis",
                    "desc": "Address missing values, outliers, imbalanced distributions, and compute correlation matrices.",
                    "review_stage": "Review 1",
                    "deliverable": "Cleaned Dataset & Exploratory Analysis Visualizations",
                    "acceptance": "Zero unhandled nulls, documented feature distributions, and stratified train-test splits created.",
                    "rubric_ids": ["rub-04"],
                    "risk_level": "High",
                    "mitigation": "Historically the #1 delay cause (avg +6 days). Script automated sanity assertions early.",
                    "tasks": [
                        {
                            "id": "t-04",
                            "name": "Data Preprocessing & Cleaning Pipeline",
                            "desc": "Handle missing values, label encoding, normalization, and outlier removal.",
                            "duration": max(2, int(4 * scale)),
                            "deps": ["t-02"],
                            "priority": "High",
                            "rubric_ids": ["rub-04"],
                            "deliverable": "Preprocessed Dataset Artifact",
                            "acceptance": "100% clean data verified by automated profiling check",
                            "assigned_to": "Bob (Data Eng)",
                            "historical_benchmark_note": "Historical benchmark alert: 70% of ML projects encounter delay in this phase."
                        },
                        {
                            "id": "t-05",
                            "name": "Exploratory Data Analysis & Feature Correlation",
                            "desc": "Generate correlation heatmaps, feature histograms, and class distribution charts.",
                            "duration": max(2, int(3 * scale)),
                            "deps": ["t-04"],
                            "priority": "Medium",
                            "rubric_ids": ["rub-04"],
                            "deliverable": "EDA Report with Visual Charts",
                            "acceptance": "Clear visual justification for feature retention or elimination",
                            "assigned_to": "Charlie (Researcher)"
                        }
                    ]
                },
                {
                    "phase": "Feature Engineering & Model Training",
                    "name": "Model Architecture & Baseline Training",
                    "desc": "Extract domain-specific features, implement predictive model pipelines, and run training cycles.",
                    "review_stage": "Review 2",
                    "deliverable": "Trained Model Checkpoints and Training Loss Curves",
                    "acceptance": "Converged loss curves, reproducible random seeds, and checkpoint weights saved.",
                    "rubric_ids": ["rub-03", "rub-04"],
                    "risk_level": "Medium",
                    "mitigation": "Use cloud GPU credits or run lightweight local baselines before heavy training.",
                    "tasks": [
                        {
                            "id": "t-06",
                            "name": "Feature Engineering & Dimensionality Reduction",
                            "desc": "Construct interaction features, apply scaling, and evaluate PCA or feature importances.",
                            "duration": max(2, int(3 * scale)),
                            "deps": ["t-05"],
                            "priority": "High",
                            "rubric_ids": ["rub-04"],
                            "deliverable": "Feature Pipeline Transformer",
                            "acceptance": "Validated feature space without data leakage",
                            "assigned_to": "Bob (Data Eng)"
                        },
                        {
                            "id": "t-07",
                            "name": "Model Training & Hyperparameter Tuning",
                            "desc": "Train baseline models (e.g. Random Forest, XGBoost) and advanced neural models using cross-validation.",
                            "duration": max(2, int(4 * scale)),
                            "deps": ["t-06"],
                            "priority": "High",
                            "rubric_ids": ["rub-04"],
                            "deliverable": "Trained Model Weights (.pkl / .pt)",
                            "acceptance": "Cross-validation score surpassing predefined baseline baseline",
                            "assigned_to": "Alice (Lead)"
                        }
                    ]
                },
                {
                    "phase": "Evaluation & Validation",
                    "name": "Model Evaluation & Optimization",
                    "desc": "Evaluate models on held-out test sets using ROC-AUC, Precision-Recall, F1-Score, and confusion matrix.",
                    "review_stage": "Review 2",
                    "deliverable": "Model Performance Benchmark Report",
                    "acceptance": "Statistically sound evaluation metrics exceeding literature benchmark threshold.",
                    "rubric_ids": ["rub-05"],
                    "risk_level": "Medium",
                    "mitigation": "Calculate confidence intervals and test for class imbalance bias.",
                    "tasks": [
                        {
                            "id": "t-08",
                            "name": "Rigorous Evaluation & Metric Analysis",
                            "desc": "Compute accuracy, precision, recall, F1, ROC-AUC, and error distribution.",
                            "duration": max(2, int(3 * scale)),
                            "deps": ["t-07"],
                            "priority": "High",
                            "rubric_ids": ["rub-05"],
                            "deliverable": "Confusion Matrix & Evaluation Notebook",
                            "acceptance": "Metric curves demonstrating superior performance over naive baseline",
                            "assigned_to": "Charlie (Researcher)"
                        }
                    ]
                },
                {
                    "phase": "Application & Interface",
                    "name": "Interactive Application & Inference API",
                    "desc": "Build a student/reviewer-facing user interface and REST inference API for model interaction.",
                    "review_stage": "Review 3 / Final",
                    "deliverable": "Interactive Web Application & Inference Service",
                    "acceptance": "Working UI with sub-second prediction response on sample inputs.",
                    "rubric_ids": ["rub-03", "rub-04"],
                    "risk_level": "Low",
                    "mitigation": "Parallelizable task: UI design can start alongside evaluation.",
                    "tasks": [
                        {
                            "id": "t-09",
                            "name": "Inference API & Backend Service",
                            "desc": "Wrap model in FastAPI endpoint with input validation and schema enforcement.",
                            "duration": max(2, int(3 * scale)),
                            "deps": ["t-07"], # Can run in parallel with t-08!
                            "priority": "Medium",
                            "rubric_ids": ["rub-03"],
                            "deliverable": "REST API Endpoint",
                            "acceptance": "Tested endpoints with 200 OK responses on test payloads",
                            "assigned_to": "Bob (Data Eng)"
                        },
                        {
                            "id": "t-10",
                            "name": "Interactive Web UI & Demo Frontend",
                            "desc": "Implement web frontend allowing reviewers to submit features and view prediction probabilities.",
                            "duration": max(2, int(3 * scale)),
                            "deps": ["t-09"],
                            "priority": "Medium",
                            "rubric_ids": ["rub-04"],
                            "deliverable": "Web Application Demo",
                            "acceptance": "Responsive, functional interface for live viva demonstration",
                            "assigned_to": "Alice (Lead)"
                        }
                    ]
                },
                {
                    "phase": "Testing & Quality Assurance",
                    "name": "End-to-End System Testing & Robustness",
                    "desc": "Execute stress tests, edge case validations, and sanity checks on boundary values.",
                    "review_stage": "Review 3",
                    "deliverable": "System Test Suite & Execution Logs",
                    "acceptance": "Zero critical crashes, handles missing inputs gracefully.",
                    "rubric_ids": ["rub-05"],
                    "risk_level": "Low",
                    "mitigation": "Automate unit tests with Pytest.",
                    "tasks": [
                        {
                            "id": "t-11",
                            "name": "System Integration & Robustness Tests",
                            "desc": "Verify inference under edge-case inputs and simulate network lag.",
                            "duration": max(2, int(2 * scale)),
                            "deps": ["t-08", "t-10"],
                            "priority": "Medium",
                            "rubric_ids": ["rub-05"],
                            "deliverable": "Test Execution Report",
                            "acceptance": "100% test pass rate across predefined 20 validation scenarios",
                            "assigned_to": "Charlie (Researcher)"
                        }
                    ]
                },
                {
                    "phase": "Documentation & Presentation",
                    "name": "Final Thesis, Documentation & Viva Presentation",
                    "desc": "Author comprehensive project report formatted to university guidelines, architecture diagrams, and slide deck.",
                    "review_stage": "Final Viva",
                    "deliverable": "Final Project Thesis (PDF), Presentation Slide Deck & GitHub Repo",
                    "acceptance": "Formatted academic document signed off by guide with presentation deck.",
                    "rubric_ids": ["rub-06"],
                    "risk_level": "Low",
                    "mitigation": "Draft thesis sections incrementally as each milestone finishes.",
                    "tasks": [
                        {
                            "id": "t-12",
                            "name": "Project Thesis Compilation & Documentation",
                            "desc": "Write executive summary, system architecture, methodology, results, and conclusion.",
                            "duration": max(2, int(4 * scale)),
                            "deps": ["t-11"],
                            "priority": "High",
                            "rubric_ids": ["rub-06"],
                            "deliverable": "Final Academic Report (PDF)",
                            "acceptance": "Complete report matching university thesis guidelines",
                            "assigned_to": "Alice (Lead)"
                        },
                        {
                            "id": "t-13",
                            "name": "Viva Presentation Slide Deck & Demonstration Prep",
                            "desc": "Prepare concise slide deck (15-20 slides) highlighting motivation, novel contributions, results, and live demo script.",
                            "duration": max(1, int(2 * scale)),
                            "deps": ["t-12"],
                            "priority": "High",
                            "rubric_ids": ["rub-06"],
                            "deliverable": "Slide Deck & Demo Video/Script",
                            "acceptance": "Rehearsed 15-minute presentation ready for evaluation panel",
                            "assigned_to": "Team"
                        }
                    ]
                }
            ]
        else:
            # Generic / Web / IoT project template
            return [
                {
                    "phase": "Problem Definition & Requirements",
                    "name": "Requirements Specification & Architecture Planning",
                    "desc": "Define system requirements, target personas, use case diagrams, and technology stack selection.",
                    "review_stage": "Review 0 / Kickoff",
                    "deliverable": "Software Requirements Specification (SRS) Document",
                    "acceptance": "Documented functional and non-functional requirements approved by mentor.",
                    "rubric_ids": ["rub-01"],
                    "risk_level": "Low",
                    "mitigation": "Lock scope early.",
                    "tasks": [
                        {
                            "id": "t-01",
                            "name": "Requirements Gathering & Use Case Modeling",
                            "desc": "Define actor roles, core user stories, and acceptance boundaries.",
                            "duration": max(2, int(3 * scale)),
                            "deps": [],
                            "priority": "High",
                            "rubric_ids": ["rub-01"],
                            "deliverable": "SRS Document",
                            "acceptance": "Signed off requirements document",
                            "assigned_to": "Lead"
                        }
                    ]
                },
                {
                    "phase": "Literature Survey & Architecture Design",
                    "name": "Comparative Study & System Architecture",
                    "desc": "Survey design patterns, compare backend frameworks, and design relational database schemas.",
                    "review_stage": "Review 1",
                    "deliverable": "System Architecture & Schema Design Diagrams",
                    "acceptance": "Entity-relationship diagrams, API contracts, and component hierarchy.",
                    "rubric_ids": ["rub-02", "rub-03"],
                    "risk_level": "Low",
                    "mitigation": "Design for modularity and high cohesion.",
                    "tasks": [
                        {
                            "id": "t-02",
                            "name": "Architecture Design & Schema Modeling",
                            "desc": "Draft ER diagram, database migrations, and REST/GraphQL schemas.",
                            "duration": max(2, int(4 * scale)),
                            "deps": ["t-01"],
                            "priority": "High",
                            "rubric_ids": ["rub-03"],
                            "deliverable": "Database Schemas & API Blueprint",
                            "acceptance": "Normalized 3NF relational schema verified",
                            "assigned_to": "Architect"
                        }
                    ]
                },
                {
                    "phase": "Core Implementation",
                    "name": "Core Module Implementation & Integration",
                    "desc": "Implement business logic, persistent data stores, and user interface workflows.",
                    "review_stage": "Review 2",
                    "deliverable": "Working Application Alpha Release",
                    "acceptance": "Core CRUD operations and user authentication verified.",
                    "rubric_ids": ["rub-04"],
                    "risk_level": "Medium",
                    "mitigation": "Break features into small testable pull requests.",
                    "tasks": [
                        {
                            "id": "t-03",
                            "name": "Backend Service & Data Layer",
                            "desc": "Implement core REST services and database repository layers.",
                            "duration": max(3, int(6 * scale)),
                            "deps": ["t-02"],
                            "priority": "High",
                            "rubric_ids": ["rub-04"],
                            "deliverable": "Backend API Service",
                            "acceptance": "All endpoints return proper status codes and data",
                            "assigned_to": "Backend Dev"
                        },
                        {
                            "id": "t-04",
                            "name": "Frontend Client & State Integration",
                            "desc": "Build responsive UI screens and connect to backend APIs.",
                            "duration": max(3, int(5 * scale)),
                            "deps": ["t-02"], # can run concurrently with backend scaffolding
                            "priority": "High",
                            "rubric_ids": ["rub-04"],
                            "deliverable": "Frontend Web Application",
                            "acceptance": "Seamless user interaction and error states",
                            "assigned_to": "Frontend Dev"
                        }
                    ]
                },
                {
                    "phase": "Testing & Security Audit",
                    "name": "System Testing & Security Verification",
                    "desc": "Execute integration tests, automated unit test suites, and load testing.",
                    "review_stage": "Review 3",
                    "deliverable": "Automated Test Suite & Security Audit Report",
                    "acceptance": "Code coverage > 80% with zero high-severity vulnerabilities.",
                    "rubric_ids": ["rub-05"],
                    "risk_level": "Low",
                    "mitigation": "Use test runners in continuous integration.",
                    "tasks": [
                        {
                            "id": "t-05",
                            "name": "Integration & User Acceptance Testing",
                            "desc": "Perform end-to-end user scenario testing and bug remediation.",
                            "duration": max(2, int(4 * scale)),
                            "deps": ["t-03", "t-04"],
                            "priority": "High",
                            "rubric_ids": ["rub-05"],
                            "deliverable": "Test Execution Logs",
                            "acceptance": "Passing tests across all critical user paths",
                            "assigned_to": "QA Dev"
                        }
                    ]
                },
                {
                    "phase": "Documentation & Viva",
                    "name": "Final Thesis & Review Defense",
                    "desc": "Finalize project documentation, deployment runbooks, and defense slide deck.",
                    "review_stage": "Final Viva",
                    "deliverable": "Complete Project Report & Presentation Slides",
                    "acceptance": "Bound documentation ready for committee inspection.",
                    "rubric_ids": ["rub-06"],
                    "risk_level": "Low",
                    "mitigation": "Rehearse presentation with faculty advisor.",
                    "tasks": [
                        {
                            "id": "t-06",
                            "name": "Final Report Compilation & Defense Deck",
                            "desc": "Write final project thesis and assemble presentation slide deck.",
                            "duration": max(2, int(4 * scale)),
                            "deps": ["t-05"],
                            "priority": "High",
                            "rubric_ids": ["rub-06"],
                            "deliverable": "Final Project Thesis & Slides",
                            "acceptance": "Submitted to university committee",
                            "assigned_to": "Team"
                        }
                    ]
                }
            ]

    @classmethod
    def generate_project_plan(cls, req: ProjectCreateRequest) -> ProjectModel:
        project_id = f"proj-{uuid.uuid4().hex[:8]}"
        
        # Calculate calendar duration
        start_d = datetime.datetime.strptime(req.start_date, "%Y-%m-%d").date()
        end_d = datetime.datetime.strptime(req.deadline, "%Y-%m-%d").date()
        total_days = max(1, (end_d - start_d).days)

        raw_milestone_templates = cls.get_template_milestones(req.category, total_days)

        # Build raw tasks
        all_tasks: List[TaskModel] = []
        for m_idx, m_tmpl in enumerate(raw_milestone_templates):
            for t_raw in m_tmpl["tasks"]:
                task = TaskModel(
                    id=t_raw["id"],
                    name=t_raw["name"],
                    description=t_raw["desc"],
                    duration_days=t_raw["duration"],
                    dependencies=t_raw["deps"],
                    priority=t_raw.get("priority", "Medium"),
                    assigned_to=t_raw.get("assigned_to", "Team"),
                    rubric_criteria_ids=t_raw.get("rubric_ids", []),
                    deliverable=t_raw.get("deliverable", ""),
                    acceptance_criteria=t_raw.get("acceptance", ""),
                    historical_benchmark_note=t_raw.get("historical_benchmark_note")
                )
                all_tasks.append(task)

        # Run Scheduling Engine (Topological sort & Critical Path)
        scheduler = SchedulingEngine(
            start_date=req.start_date,
            deadline=req.deadline,
            unavailable_dates=req.unavailable_dates
        )

        scheduled_tasks, critical_path, metrics = scheduler.compute_critical_path_and_schedule(all_tasks)
        task_lookup = {t.id: t for t in scheduled_tasks}

        # Build structured milestones with updated task schedules
        milestones: List[MilestoneModel] = []
        for m_idx, m_tmpl in enumerate(raw_milestone_templates):
            m_tasks = [task_lookup[t["id"]] for t in m_tmpl["tasks"] if t["id"] in task_lookup]
            if m_tasks:
                m_start_offset = min(t.start_day_offset for t in m_tasks)
                m_end_offset = max(t.end_day_offset for t in m_tasks)
                m_start_date = min(t.start_date for t in m_tasks)
                m_end_date = max(t.end_date for t in m_tasks)
            else:
                m_start_offset = 0
                m_end_offset = 0
                m_start_date = req.start_date
                m_end_date = req.deadline

            milestone = MilestoneModel(
                id=f"m-{m_idx + 1:02d}",
                name=m_tmpl["name"],
                description=m_tmpl["desc"],
                phase=m_tmpl["phase"],
                start_date=m_start_date,
                target_date=m_end_date,
                start_day_offset=m_start_offset,
                end_day_offset=m_end_offset,
                tasks=m_tasks,
                review_stage=m_tmpl.get("review_stage"),
                deliverable=m_tmpl.get("deliverable", ""),
                acceptance_criteria=m_tmpl.get("acceptance", ""),
                related_rubric_ids=m_tmpl.get("rubric_ids", []),
                risk_level=m_tmpl.get("risk_level", "Low"),
                mitigation=m_tmpl.get("mitigation", ""),
                completion_percentage=0.0
            )
            milestones.append(milestone)

        # Rubric Coverage Mapping
        standard_rubrics = get_standard_rubrics()
        rubric_mappings: List[RubricMapping] = []
        for crit in standard_rubrics:
            crit_id = crit["id"]
            associated_tasks = [t for t in scheduled_tasks if crit_id in t.rubric_criteria_ids]
            associated_milestones = [m for m in milestones if crit_id in m.related_rubric_ids]

            produced_delivs = [t.deliverable for t in associated_tasks if t.deliverable]
            req_delivs = crit.get("deliverables", [])

            if len(associated_tasks) >= 2:
                status = "Covered"
                action = "Criteria fully addressed in scheduling and deliverables."
            elif len(associated_tasks) == 1:
                status = "Partially Covered"
                action = f"Consider adding an additional verification checkpoint for {crit['name']}."
            else:
                status = "Missing"
                action = f"CRITICAL: No scheduled tasks produce {crit['name']}. Add dedicated milestone."

            rubric_mappings.append(RubricMapping(
                criterion_id=crit_id,
                criterion_name=crit["name"],
                weight=crit["weight"],
                status=status,
                associated_milestones=[m.name for m in associated_milestones],
                associated_tasks=[t.name for t in associated_tasks],
                required_deliverables=req_delivs,
                produced_deliverables=produced_delivs,
                corrective_actions=action
            ))

        # Calculate Confidence Score based on historical comparison and schedule tightness
        benchmarks = get_historical_benchmarks(req.category, req.complexity)
        buffer_days = metrics["days_buffer_or_overdue"]
        if buffer_days < 0:
            confidence = 45
            rationale = f"Negative slack ({buffer_days} days). Planned duration exceeds deadline by {abs(buffer_days)} days."
        elif buffer_days == 0:
            confidence = 68
            rationale = "Zero margin for error. Any delay in critical-path tasks will cause deadline violation."
        elif buffer_days < 4:
            confidence = 78
            rationale = f"Tight schedule with only {buffer_days} buffer days. Historical projects in {req.category} show typical delays of {benchmarks['avg_slippage_percentage']}%."
        else:
            confidence = 92
            rationale = f"Solid plan with {buffer_days} days buffer. Adequately accounts for data cleaning and testing delays."

        now_str = datetime.datetime.now().isoformat()
        return ProjectModel(
            id=project_id,
            title=req.title,
            description=req.description,
            category=req.category,
            start_date=req.start_date,
            deadline=req.deadline,
            total_days=total_days,
            team_size=req.team_size,
            hours_per_week=req.hours_per_week,
            complexity=req.complexity,
            tech_stack=req.tech_stack,
            deliverables=req.deliverables,
            review_stages=req.review_stages,
            constraints=req.constraints,
            unavailable_dates=req.unavailable_dates,
            milestones=milestones,
            rubric_mappings=rubric_mappings,
            critical_path=critical_path,
            confidence_score=confidence,
            confidence_rationale=rationale,
            created_at=now_str,
            updated_at=now_str
        )
