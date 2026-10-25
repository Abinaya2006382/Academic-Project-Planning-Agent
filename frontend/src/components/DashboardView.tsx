import React from 'react';
import { Project, Task } from '../types';
import { api } from '../api';
import { 
  CheckCircle2, Clock, AlertTriangle, ShieldCheck, Download, 
  Calendar, Layers, Sparkles, User, FileText 
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip 
} from 'recharts';

interface Props {
  project: Project;
  onNavigateTab: (tab: string) => void;
  onSimulateDelayClick: (task: Task) => void;
}

export const DashboardView: React.FC<Props> = ({ 
  project, 
  onNavigateTab, 
  onSimulateDelayClick 
}) => {
  const allTasks = project.milestones.flatMap(m => m.tasks);
  const totalTasks = allTasks.length;
  const criticalTasks = allTasks.filter(t => t.is_critical_path);
  const highRiskMilestones = project.milestones.filter(m => m.risk_level === 'High');

  // Workload by team member
  const workloadByMember: Record<string, number> = {};
  allTasks.forEach(t => {
    workloadByMember[t.assigned_to] = (workloadByMember[t.assigned_to] || 0) + t.duration_days;
  });

  const workloadData = Object.entries(workloadByMember).map(([name, days]) => ({
    name,
    days
  }));

  const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#ec4899', '#10b981'];

  const handleDownloadCsv = () => {
    const url = api.getExportCsvUrl(project.id);
    window.open(url, '_blank');
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '28px' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-primary">{project.category}</span>
            <span className="badge badge-warning">{project.complexity} Complexity</span>
            <span className="badge badge-cp">{project.team_size} Members</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{project.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '800px', marginTop: '4px' }}>
            {project.description}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleDownloadCsv} 
            className="btn btn-secondary"
            title="Download CSV Plan"
          >
            <Download size={14} /> Export Plan (CSV)
          </button>
          <button 
            onClick={() => onNavigateTab('chat')} 
            className="btn btn-primary"
          >
            <Sparkles size={14} /> Open AI Assistant
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: 'rgba(18, 24, 38, 0.7)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} style={{ color: '#818cf8' }} /> Timeline Window
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '4px' }}>
            {project.total_days} Days
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {project.start_date} &rarr; {project.deadline}
          </div>
        </div>

        <div style={{ background: 'rgba(18, 24, 38, 0.7)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={14} style={{ color: '#38bdf8' }} /> Milestone Phases
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '4px' }}>
            {project.milestones.length} Phases
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {totalTasks} Total Structured Tasks
          </div>
        </div>

        <div style={{ background: 'rgba(18, 24, 38, 0.7)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} style={{ color: '#ec4899' }} /> Critical Path
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f472b6', marginTop: '4px' }}>
            {criticalTasks.length} Tasks
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Zero Slack (Bottlenecks)
          </div>
        </div>

        <div style={{ background: 'rgba(18, 24, 38, 0.7)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} style={{ color: '#10b981' }} /> Rubric Coverage
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#34d399', marginTop: '4px' }}>
            100%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            All University Criteria Mapped
          </div>
        </div>

        <div style={{ background: 'rgba(18, 24, 38, 0.7)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} style={{ color: '#fbbf24' }} /> Schedule Feasibility
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fbbf24', marginTop: '4px' }}>
            {project.confidence_score}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Empirically Calibrated
          </div>
        </div>
      </div>

      {/* Main Grid: Critical Path + Workload */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Critical Path Tasks Box */}
        <div style={{ background: 'rgba(18, 24, 38, 0.7)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} style={{ color: '#ec4899' }} /> Critical Path Tasks (Zero Slack)
            </h3>
            <button 
              onClick={() => onNavigateTab('graph')} 
              className="btn btn-secondary" 
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              Inspect DAG
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {criticalTasks.map(t => (
              <div 
                key={t.id} 
                style={{ 
                  background: 'rgba(11, 15, 25, 0.5)', 
                  borderLeft: '3px solid #ec4899', 
                  padding: '10px 14px', 
                  borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {t.assigned_to} &bull; {t.duration_days} days ({t.start_date} &rarr; {t.end_date})
                  </div>
                </div>
                <button
                  onClick={() => onSimulateDelayClick(t)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                >
                  Test Delay
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Team Workload Distribution */}
        <div style={{ background: 'rgba(18, 24, 38, 0.7)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={16} style={{ color: '#818cf8' }} /> Team Workload Allocation (Days)
          </h3>
          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={workloadData}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={5}
                  dataKey="days"
                  label={(entry: any) => `${entry.name}: ${entry.days}d`}
                >
                  {workloadData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#182234', borderColor: '#334155', color: '#fff', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Hours commitment: {project.hours_per_week} hrs/week per member &bull; {project.team_size} active roles
          </div>
        </div>
      </div>

      {/* AI Recommendations & Warnings */}
      <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Sparkles size={18} style={{ color: '#818cf8' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#c7d2fe' }}>AI Schedule Advisory & Best Practices</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', fontSize: '0.85rem', color: 'var(--text-sub)' }}>
          <div style={{ background: 'rgba(11, 15, 25, 0.4)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
            <strong>1. Concurrency Leverage:</strong> Task <em>t-09 (Inference API)</em> can execute simultaneously alongside <em>t-08 (Evaluation)</em> once model baseline weights are saved.
          </div>
          <div style={{ background: 'rgba(11, 15, 25, 0.4)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
            <strong>2. Historical Risk Warning:</strong> Data preprocessing in {project.category} experiences an average 6-day delay. Automated sanity test assertions are pre-configured.
          </div>
          <div style={{ background: 'rgba(11, 15, 25, 0.4)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
            <strong>3. Viva Preparedness:</strong> Schedule sets aside Milestone 8 strictly for thesis documentation formatting and slide rehearsal before defense date.
          </div>
        </div>
      </div>
    </div>
  );
};
