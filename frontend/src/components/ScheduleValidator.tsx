import React, { useState } from 'react';
import { Project, DelaySimulationResult, Task } from '../types';
import { api } from '../api';
import { 
  AlertTriangle, CheckCircle2, ShieldCheck, ArrowRight, 
  HelpCircle, Sparkles, RefreshCw, BarChart2 
} from 'lucide-react';

interface Props {
  project: Project;
  onScheduleUpdated: (updatedProj: Project) => void;
  selectedTaskForDelay?: Task | null;
}

export const ScheduleValidator: React.FC<Props> = ({ 
  project, 
  onScheduleUpdated, 
  selectedTaskForDelay 
}) => {
  const allTasks = project.milestones.flatMap(m => m.tasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    selectedTaskForDelay ? selectedTaskForDelay.id : (allTasks[3]?.id || allTasks[0]?.id || '')
  );
  const [delayDays, setDelayDays] = useState<number>(3);
  const [reason, setReason] = useState<string>('Unforeseen dataset imbalance and dirty annotations');
  const [simulationResult, setSimulationResult] = useState<DelaySimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunSimulation = async () => {
    if (!selectedTaskId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.simulateDelay(project.id, selectedTaskId, delayDays, reason);
      setSimulationResult(res);
      // Fetch updated project
      const updated = await api.getProject(project.id);
      onScheduleUpdated(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to simulate delay');
    } finally {
      setIsLoading(false);
    }
  };

  const confidenceColor = 
    project.confidence_score >= 85 ? '#10b981' : 
    project.confidence_score >= 65 ? '#f59e0b' : '#ef4444';

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <div className="badge badge-primary" style={{ marginBottom: '6px' }}>Module 5: Schedule Validation & Stress Testing</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Schedule Robustness & Delay Simulation</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Empirical validation against completed project patterns and interactive downstream delay propagation engine.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Confidence Card */}
        <div style={{ background: 'rgba(18, 24, 38, 0.7)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Schedule Confidence Metric</span>
            <span className="badge" style={{ background: `${confidenceColor}22`, color: confidenceColor, border: `1px solid ${confidenceColor}55` }}>
              {project.confidence_score >= 80 ? 'High Confidence' : 'Moderate Buffer'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: confidenceColor }}>
              {project.confidence_score}%
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>feasibility rating</span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', lineHeight: 1.4, marginBottom: '14px' }}>
            {project.confidence_rationale}
          </p>

          <div style={{ background: 'rgba(11, 15, 25, 0.6)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <strong>Validation Basis:</strong> Evaluated using critical path slack distribution, category complexity multipliers, and empirical delay rates from historical academic project cohorts.
          </div>
        </div>

        {/* Delay Simulation Trigger Panel */}
        <div style={{ background: 'rgba(18, 24, 38, 0.7)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Simulate Task Delay & Schedule Shock</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Select Task to Delay
              </label>
              <select
                className="select"
                value={selectedTaskId}
                onChange={e => setSelectedTaskId(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              >
                {allTasks.map(t => (
                  <option key={t.id} value={t.id}>
                    [{t.id}] {t.name} {t.is_critical_path ? '(CRITICAL)' : `(${t.slack_days}d slack)`}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Days Delayed
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  className="input"
                  value={delayDays}
                  onChange={e => setDelayDays(parseInt(e.target.value) || 1)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Blocker Reason
                </label>
                <input
                  type="text"
                  className="input"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={isLoading}
              className="btn btn-primary"
              style={{ marginTop: '8px', width: '100%' }}
            >
              {isLoading ? 'Computing Topological Downstream Cascade...' : `Test ${delayDays}-Day Delay Scenario`}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Simulation Result Presentation */}
      {simulationResult && (
        <div style={{
          background: simulationResult.is_deadline_violated ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
          border: simulationResult.is_deadline_violated ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {simulationResult.is_deadline_violated ? (
                <AlertTriangle size={24} style={{ color: '#ef4444' }} />
              ) : (
                <CheckCircle2 size={24} style={{ color: '#10b981' }} />
              )}
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: simulationResult.is_deadline_violated ? '#fca5a5' : '#86efac' }}>
                {simulationResult.is_deadline_violated ? 'Deadline Violated — Schedule Overdue' : 'Delay Absorbed by Project Buffer'}
              </h3>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Project Target: <strong>{simulationResult.deadline}</strong>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Original Finish Date</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{simulationResult.original_finish_date}</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>New Finish Date</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: simulationResult.is_deadline_violated ? '#f87171' : '#34d399' }}>
                {simulationResult.new_finish_date}
              </div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Critical Path Affected</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: simulationResult.critical_path_affected ? '#ec4899' : '#a5b4fc' }}>
                {simulationResult.critical_path_affected ? 'YES (Zero Slack Impact)' : 'NO (Non-critical Slack Used)'}
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: '16px' }}>
            <strong>Causal Explanation:</strong> {simulationResult.explanation}
          </div>

          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24', marginBottom: '8px' }}>
              AI Prescribed Countermeasures & Recovery Actions:
            </div>
            <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-sub)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {simulationResult.recommended_mitigations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
