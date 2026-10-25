export interface Task {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  start_day_offset: number;
  end_day_offset: number;
  start_date?: string;
  end_date?: string;
  dependencies: string[];
  priority: 'High' | 'Medium' | 'Low';
  assigned_to: string;
  rubric_criteria_ids: string[];
  deliverable: string;
  acceptance_criteria: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  is_critical_path: boolean;
  slack_days: number;
  risk_level: 'Low' | 'Medium' | 'High';
  mitigation?: string;
  historical_benchmark_note?: string;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  phase: string;
  start_date?: string;
  target_date?: string;
  start_day_offset: number;
  end_day_offset: number;
  tasks: Task[];
  review_stage?: string;
  deliverable: string;
  acceptance_criteria: string;
  related_rubric_ids: string[];
  risk_level: string;
  mitigation: string;
  completion_percentage: number;
}

export interface RubricMapping {
  criterion_id: string;
  criterion_name: string;
  weight: number;
  status: 'Covered' | 'Partially Covered' | 'Missing';
  associated_milestones: string[];
  associated_tasks: string[];
  required_deliverables: string[];
  produced_deliverables: string[];
  corrective_actions?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  start_date: string;
  deadline: string;
  total_days: number;
  team_size: number;
  hours_per_week: number;
  complexity: string;
  tech_stack: string[];
  deliverables: string[];
  review_stages: number;
  constraints: string[];
  unavailable_dates: string[];
  milestones: Milestone[];
  rubric_mappings: RubricMapping[];
  critical_path: string[];
  confidence_score: number;
  confidence_rationale: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectCreateInput {
  title: string;
  description: string;
  category: string;
  start_date: string;
  deadline: string;
  team_size: number;
  hours_per_week: number;
  complexity: string;
  tech_stack: string[];
  deliverables: string[];
  review_stages: number;
  constraints: string[];
  unavailable_dates: string[];
  uploaded_guidelines_text?: string;
}

export interface HistoricalBenchmark {
  sample_size: number;
  data_provenance: string;
  avg_planned_days: number;
  avg_actual_days: number;
  avg_slippage_percentage: number;
  frequent_bottlenecks: string[];
  category_matched: string;
  sample_projects: any[];
}

export interface DelaySimulationResult {
  original_finish_date: string;
  new_finish_date: string;
  deadline: string;
  is_deadline_violated: boolean;
  affected_tasks: string[];
  critical_path_affected: boolean;
  explanation: string;
  recommended_mitigations: string[];
  updated_milestones: Milestone[];
}
