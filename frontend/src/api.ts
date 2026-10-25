import { Project, ProjectCreateInput, DelaySimulationResult, HistoricalBenchmark } from './types';

const API_BASE = '/api';

export const api = {
  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${API_BASE}/projects`);
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  async getProject(id: string): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    if (!res.ok) throw new Error('Failed to fetch project');
    return res.json();
  },

  async createProject(input: ProjectCreateInput): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create project');
    }
    return res.json();
  },

  async deleteProject(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete project');
  },

  async getHistoricalAnalysis(category = 'AI/ML', complexity = 'Medium'): Promise<{
    benchmarks: HistoricalBenchmark;
    historical_cohort: any[];
    standard_rubrics: any[];
  }> {
    const res = await fetch(`${API_BASE}/historical-analysis?category=${encodeURIComponent(category)}&complexity=${encodeURIComponent(complexity)}`);
    if (!res.ok) throw new Error('Failed to fetch historical analysis');
    return res.json();
  },

  async simulateDelay(projectId: string, taskId: string, delayDays: number, reason?: string): Promise<DelaySimulationResult> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/simulate-delay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: taskId, delay_days: delayDays, reason })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to simulate delay');
    }
    return res.json();
  },

  async sendChatMessage(projectId: string | null, query: string): Promise<{
    reply: string;
    actions_taken: string[];
    schedule_updated: boolean;
    updated_project?: Project;
  }> {
    const res = await fetch(`${API_BASE}/assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId, query })
    });
    if (!res.ok) throw new Error('Failed to send assistant message');
    return res.json();
  },

  async parseGuidelines(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/projects/parse-guidelines`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Failed to upload document');
    return res.json();
  },

  getExportCsvUrl(projectId: string): string {
    return `${API_BASE}/projects/${projectId}/export-csv`;
  }
};
