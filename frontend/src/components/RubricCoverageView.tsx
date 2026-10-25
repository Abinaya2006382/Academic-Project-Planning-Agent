import React from 'react';
import { Project, RubricMapping } from '../types';
import { Award, CheckCircle2, AlertTriangle, XCircle, ArrowRight, ShieldAlert } from 'lucide-react';

interface Props {
  project: Project;
}

export const RubricCoverageView: React.FC<Props> = ({ project }) => {
  const coveredCount = project.rubric_mappings.filter(r => r.status === 'Covered').length;
  const partialCount = project.rubric_mappings.filter(r => r.status === 'Partially Covered').length;
  const missingCount = project.rubric_mappings.filter(r => r.status === 'Missing').length;

  const totalPoints = project.rubric_mappings.reduce((sum, r) => sum + r.weight, 0);
  const coveredPoints = project.rubric_mappings
    .filter(r => r.status === 'Covered')
    .reduce((sum, r) => sum + r.weight, 0);
  const coveragePercent = Math.round((coveredPoints / (totalPoints || 100)) * 100);

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <div className="badge badge-primary" style={{ marginBottom: '6px' }}>Module 6: Academic Rubric Alignment</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Review Rubric & Evaluation Criteria Coverage</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Ensures university grading rubrics, thesis criteria, and presentation deliverables are mapped to concrete milestones.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="badge badge-success" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
            {coveragePercent}% Rubric Marks Secured
          </div>
        </div>
      </div>

      {/* Summary Score Bar */}
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px', marginBottom: '28px' 
      }}>
        <div style={{ background: 'rgba(18, 24, 38, 0.7)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fully Covered Criteria</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={24} /> {coveredCount}
          </div>
        </div>

        <div style={{ background: 'rgba(18, 24, 38, 0.7)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Partially Covered (Needs Checkpoint)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={24} /> {partialCount}
          </div>
        </div>

        <div style={{ background: 'rgba(18, 24, 38, 0.7)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Missing Criteria (Viva Risk)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: missingCount > 0 ? '#f87171' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <XCircle size={24} /> {missingCount}
          </div>
        </div>
      </div>

      {/* Rubric Mapping Table */}
      <div style={{ overflowX: 'auto', background: 'rgba(18, 24, 38, 0.6)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '14px 16px' }}>Rubric Criterion</th>
              <th style={{ padding: '14px 16px' }}>Weight</th>
              <th style={{ padding: '14px 16px' }}>Coverage Status</th>
              <th style={{ padding: '14px 16px' }}>Required Deliverables</th>
              <th style={{ padding: '14px 16px' }}>Scheduled Phase & Tasks</th>
              <th style={{ padding: '14px 16px' }}>AI Recommended Action</th>
            </tr>
          </thead>
          <tbody>
            {project.rubric_mappings.map(r => {
              const statusClass = 
                r.status === 'Covered' ? 'badge-success' : 
                r.status === 'Partially Covered' ? 'badge-warning' : 'badge-danger';

              return (
                <tr key={r.criterion_id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>{r.criterion_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {r.criterion_id}</div>
                  </td>
                  <td style={{ padding: '16px', fontWeight: 700, color: '#818cf8', whiteSpace: 'nowrap' }}>
                    {r.weight}% Marks
                  </td>
                  <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                    <span className={`badge ${statusClass}`}>{r.status}</span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {r.required_deliverables.map((deliv, i) => (
                        <span key={i} style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                          &bull; {deliv}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 500 }}>
                      {r.associated_milestones.join(', ') || 'None scheduled'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Tasks: {r.associated_tasks.length > 0 ? r.associated_tasks.slice(0, 2).join('; ') : 'No direct task linked'}
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-sub)', fontSize: '0.8rem' }}>
                    {r.corrective_actions}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
