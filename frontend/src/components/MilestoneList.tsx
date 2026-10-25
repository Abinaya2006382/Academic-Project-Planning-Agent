import React, { useState } from 'react';
import { Project, Task, Milestone } from '../types';
import { 
  CheckCircle2, Clock, Calendar, ArrowRight, ShieldAlert, Award, 
  ChevronDown, ChevronRight, User, AlertCircle 
} from 'lucide-react';

interface Props {
  project: Project;
  onSimulateDelayClick: (task: Task) => void;
}

export const MilestoneList: React.FC<Props> = ({ project, onSimulateDelayClick }) => {
  const [expandedMilestones, setExpandedMilestones] = useState<Record<string, boolean>>({
    'm-01': true,
    'm-03': true,
    'm-04': true
  });

  const toggleExpand = (id: string) => {
    setExpandedMilestones(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div className="badge badge-primary" style={{ marginBottom: '6px' }}>Module 3: AI Milestone Generator</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Generated Academic Milestones & Task DAG</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Personalized, logically ordered sequence computed via topological sort and CPM dependency reasoning.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="badge badge-cp" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
            {project.critical_path.length} Critical Path Tasks
          </div>
          <div className="badge badge-success" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
            {project.milestones.length} Strategic Phases
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {project.milestones.map((m, idx) => {
          const isExpanded = !!expandedMilestones[m.id];
          const hasCriticalTask = m.tasks.some(t => t.is_critical_path);

          return (
            <div
              key={m.id}
              style={{
                background: 'rgba(18, 24, 38, 0.7)',
                border: hasCriticalTask ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                transition: 'border-color 0.2s'
              }}
            >
              {/* Header */}
              <div
                onClick={() => toggleExpand(m.id)}
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: isExpanded ? 'rgba(255, 255, 255, 0.02)' : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  <span style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', 
                    background: hasCriticalTask ? 'var(--critical-path-bg)' : 'var(--primary-glow)',
                    color: hasCriticalTask ? '#f472b6' : '#818cf8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem'
                  }}>
                    {idx + 1}
                  </span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{m.name}</h3>
                      {m.review_stage && (
                        <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                          <Award size={10} /> {m.review_stage}
                        </span>
                      )}
                      {hasCriticalTask && (
                        <span className="badge badge-cp" style={{ fontSize: '0.7rem' }}>Critical Path</span>
                      )}
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
                      {m.description}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'right' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} /> Schedule Window
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {m.start_date} &rarr; {m.target_date}
                    </div>
                  </div>
                  <div style={{ minWidth: '70px' }}>
                    <span className={`badge ${m.risk_level === 'High' ? 'badge-danger' : m.risk_level === 'Medium' ? 'badge-warning' : 'badge-success'}`}>
                      {m.risk_level} Risk
                    </span>
                  </div>
                </div>
              </div>

              {/* Collapsible Content */}
              {isExpanded && (
                <div style={{ padding: '0 20px 20px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  {/* Phase metadata banner */}
                  <div style={{ 
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                    gap: '12px', background: 'rgba(11, 15, 25, 0.5)', padding: '12px 16px', 
                    borderRadius: 'var(--radius-sm)', margin: '14px 0' 
                  }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deliverable Required</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#38bdf8' }}>{m.deliverable}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Acceptance Standard</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)' }}>{m.acceptance_criteria}</div>
                    </div>
                    {m.mitigation && (
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ShieldAlert size={12} /> AI Mitigation Advice
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.mitigation}</div>
                      </div>
                    )}
                  </div>

                  {/* Tasks Table */}
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '8px 12px' }}>Task Name</th>
                          <th style={{ padding: '8px 12px' }}>Assigned</th>
                          <th style={{ padding: '8px 12px' }}>Duration</th>
                          <th style={{ padding: '8px 12px' }}>Dependencies</th>
                          <th style={{ padding: '8px 12px' }}>Slack</th>
                          <th style={{ padding: '8px 12px' }}>Critical Path</th>
                          <th style={{ padding: '8px 12px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {m.tasks.map(task => (
                          <tr key={task.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                            <td style={{ padding: '12px' }}>
                              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{task.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{task.description}</div>
                              {task.historical_benchmark_note && (
                                <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <AlertCircle size={11} /> {task.historical_benchmark_note}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '12px', color: 'var(--text-sub)', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <User size={12} style={{ color: '#818cf8' }} /> {task.assigned_to}
                              </div>
                            </td>
                            <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                              <span style={{ fontWeight: 600 }}>{task.duration_days} days</span>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {task.start_date} &rarr; {task.end_date}
                              </div>
                            </td>
                            <td style={{ padding: '12px' }}>
                              {task.dependencies.length > 0 ? (
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                  {task.dependencies.map(dep => (
                                    <span key={dep} className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                                      {dep}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>None (Start Node)</span>
                              )}
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span style={{ 
                                fontWeight: 600, 
                                color: task.slack_days === 0 ? '#ec4899' : '#10b981' 
                              }}>
                                {task.slack_days}d float
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>
                              {task.is_critical_path ? (
                                <span className="badge badge-cp" style={{ fontSize: '0.7rem' }}>YES (Zero Slack)</span>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Flexible</span>
                              )}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>
                              <button
                                onClick={() => onSimulateDelayClick(task)}
                                className="btn btn-secondary"
                                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                                title="Test what happens if this task is delayed"
                              >
                                Simulate Delay
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
