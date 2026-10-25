import datetime
from typing import List, Dict, Any, Tuple
import networkx as nx
from app.models import TaskModel, MilestoneModel

def parse_date(date_str: str) -> datetime.date:
    return datetime.datetime.strptime(date_str, "%Y-%m-%d").date()

def format_date(d: datetime.date) -> str:
    return d.strftime("%Y-%m-%d")

class SchedulingEngine:
    def __init__(self, start_date: str, deadline: str, unavailable_dates: List[str] = None):
        self.start_date = parse_date(start_date)
        self.deadline = parse_date(deadline)
        self.total_available_days = max(1, (self.deadline - self.start_date).days)
        self.unavailable_dates = set([parse_date(d) for d in (unavailable_dates or [])])

    def detect_cycles(self, tasks: List[TaskModel]) -> List[List[str]]:
        """Return cycles if any exist in the task dependency graph"""
        G = nx.DiGraph()
        for t in tasks:
            G.add_node(t.id)
            for dep in t.dependencies:
                G.add_edge(dep, t.id)
        try:
            cycles = list(nx.simple_cycles(G))
            return cycles
        except Exception:
            return []

    def compute_critical_path_and_schedule(
        self, 
        tasks: List[TaskModel]
    ) -> Tuple[List[TaskModel], List[str], Dict[str, Any]]:
        """
        Calculates Early Start (ES), Early Finish (EF), Late Start (LS), Late Finish (LF),
        Slack / Float, and Critical Path using CPM (Critical Path Method) and Topological Sorting.
        """
        cycles = self.detect_cycles(tasks)
        if cycles:
            raise ValueError(f"Circular dependency detected between tasks: {cycles}")

        task_dict = {t.id: t for t in tasks}
        G = nx.DiGraph()
        for t in tasks:
            G.add_node(t.id, duration=t.duration_days)
            for dep in t.dependencies:
                G.add_edge(dep, t.id)

        topo_order = list(nx.topological_sort(G))

        # Forward Pass (Early Start & Early Finish)
        es = {}
        ef = {}
        for node in topo_order:
            preds = list(G.predecessors(node))
            if not preds:
                es[node] = 0
            else:
                es[node] = max(ef[p] for p in preds)
            ef[node] = es[node] + task_dict[node].duration_days

        project_finish_day = max(ef.values()) if ef else 0

        # Backward Pass (Late Start & Late Finish)
        ls = {}
        lf = {}
        for node in reversed(topo_order):
            succs = list(G.successors(node))
            if not succs:
                lf[node] = project_finish_day
            else:
                lf[node] = min(ls[s] for s in succs)
            ls[node] = lf[node] - task_dict[node].duration_days

        # Identify Critical Path (Slack == 0)
        critical_path_ids = []
        updated_tasks = []

        for t in tasks:
            t_copy = t.model_copy()
            t_es = es[t.id]
            t_ef = ef[t.id]
            t_ls = ls[t.id]
            t_slack = max(0, t_ls - t_es)

            t_copy.start_day_offset = t_es
            t_copy.end_day_offset = t_ef
            t_copy.slack_days = t_slack
            t_copy.is_critical_path = (t_slack == 0)
            if t_copy.is_critical_path:
                critical_path_ids.append(t.id)

            # Map offsets to actual calendar dates
            t_start_cal = self._add_working_days(self.start_date, t_es)
            t_end_cal = self._add_working_days(self.start_date, t_ef)
            t_copy.start_date = format_date(t_start_cal)
            t_copy.end_date = format_date(t_end_cal)

            updated_tasks.append(t_copy)

        scheduled_finish_date = self._add_working_days(self.start_date, project_finish_day)
        is_over_deadline = scheduled_finish_date > self.deadline

        metrics = {
            "total_project_days": project_finish_day,
            "scheduled_finish_date": format_date(scheduled_finish_date),
            "target_deadline": format_date(self.deadline),
            "is_over_deadline": is_over_deadline,
            "days_buffer_or_overdue": (self.deadline - scheduled_finish_date).days,
            "critical_path_task_count": len(critical_path_ids),
        }

        return updated_tasks, critical_path_ids, metrics

    def _add_working_days(self, start: datetime.date, day_offset: int) -> datetime.date:
        """Calculates end date considering unavailable blackout dates"""
        curr = start
        added = 0
        while added < day_offset:
            curr += datetime.timedelta(days=1)
            if curr not in self.unavailable_dates:
                added += 1
        return curr

    def simulate_task_delay(
        self,
        tasks: List[TaskModel],
        delayed_task_id: str,
        delay_days: int
    ) -> Tuple[List[TaskModel], List[str], Dict[str, Any]]:
        """Simulates delaying a task and recomputes whole project network"""
        modified_tasks = []
        for t in tasks:
            t_copy = t.model_copy()
            if t.id == delayed_task_id:
                t_copy.duration_days += delay_days
                t_copy.status = "delayed"
            modified_tasks.append(t_copy)

        return self.compute_critical_path_and_schedule(modified_tasks)
