# Academic Project Planning & Milestone Reasoning Agent

An intelligent, AI-powered academic project scheduling, milestone generation, and dependency reasoning assistant built specifically for university students, thesis researchers, and academic evaluation committees.

Going beyond a standard calendar or simple to-do list, this system employs **Directed Acyclic Graph (DAG) scheduling**, **Topological Sorting**, and **Critical Path Method (CPM)** to calculate early/late start boundaries, float/slack days, and simulate downstream schedule cascades.

---

## Architecture Overview

```
                      +---------------------------------------+
                      |       Modern React 19 Frontend       |
                      |  Vite + TypeScript + Vanilla Dark CSS |
                      +-------------------+-------------------+
                                          | HTTP / JSON API
                                          v
                      +-------------------+-------------------+
                      |      FastAPI Reasoning Backend        |
                      |   Python 3.10 + Pydantic v2 + CPM     |
                      +---------+-------------------+---------+
                                |                   |
                 +--------------v-----+       +-----v---------------+
                 |  NetworkX DAG /    |       | Historical Academic |
                 |  Topological CPM   |       | Benchmark Cohorts & |
                 |  Scheduling Engine |       | University Rubrics  |
                 +--------------------+       +---------------------+
```

---

## Key Modules & Capabilities

1. **Module 1: Academic Project Setup**
   - Project scope, complexity levels (Easy, Medium, Hard), team size, weekly commitments, and technology stack.
   - Upload & parse university guidelines or rubrics (`.pdf`, `.docx`, `.txt`).
   - Pre-loaded with the **30-Day Machine Learning Benchmark Scenario** (*Student Performance Prediction Using Machine Learning*).

2. **Module 2: Historical Timeline & Rubric Analysis**
   - Empirical comparison against synthetic historical academic projects with explicit data provenance disclosure.
   - Compares planned vs. actual days, tracks average slippage rates, and displays verified mitigation takeaways.

3. **Module 3: AI Milestone Generator**
   - Generates logically ordered, phased academic schedules.
   - Each milestone provides deliverables, acceptance standards, responsible members, and risk mitigation advice.

4. **Module 4: DAG Dependency Reasoning**
   - Interactive React Flow directed graph visualizing task nodes, dependency arrows, and glowing magenta critical path edges.
   - Topological sorting guarantees circular dependency prevention.

5. **Module 5: Schedule Validation & Delay Shock Testing**
   - Downstream cascade simulation: test what happens when a task (e.g. Data Preprocessing) is delayed by 3 days.
   - Explains whether delays are absorbed by slack float or if they push the final viva deadline.

6. **Module 6: Review Rubric Alignment**
   - Maps university grading criteria (Problem Formulation 15%, Literature Review 15%, Architecture 20%, Implementation 25%, Evaluation 15%, Thesis & Viva 10%) directly to milestone deliverables.

7. **Module 7: Interactive Dashboard**
   - KPI metrics, zero-slack bottlenecks, and team workload distribution pie charts.

8. **Module 8: Conversational AI Planning Assistant**
   - Context-aware engine that answers questions about Review 1 deliverables, critical paths, and schedule recovery strategies without generic placeholders.

9. **Settings & CSV Export**
   - Export full schedule timelines, task assignments, and critical path markers directly to CSV.

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Start Backend Server
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at: `http://127.0.0.1:8000/docs`

### 2. Start Frontend Server
```bash
cd frontend
npm install
npm run dev
```
Open `http://127.0.0.1:5173/` in your browser.

---

## Running Automated Tests

Run the backend Pytest test suite:
```bash
cd backend
python -m pytest tests/test_backend.py
```
Test suite validates:
- API health and sample project initialization
- Critical path calculations and topological ordering
- Circular dependency cycle detection
- 3-day downstream delay simulation and causal explanations
- Conversational assistant reasoning
