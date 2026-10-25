import React, { useMemo } from 'react';
import { Project } from '../types';
import { Calendar, AlertCircle } from 'lucide-react';

interface Props {
  project: Project;
}

export const GanttTimelineView: React.FC<Props> = ({ project }) => {
  const allTasks = useMemo(() => {
    return project.milestones.flatMap(m => m.tasks);
  }, [project]);

  const maxDay = useMemo(() => {
    return Math.max(project.total_days, ...allTasks.map(t => t.end_day_offset));
  }, [project, allTasks]);

  // Create markers for days (e.g. Day 0, Day 5, Day 10...)
  const dayMarkers = useMemo(() => {
    const markers = [];
    const step = maxDay <= 20 ? 2 : maxDay <= 45 ? 5 : 10;
    for (let d = 0; d <= maxDay; d += step) {
      markers.push(d);
    }
    return markers;
  }, [maxDay]);

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div className="badge badge-primary" style={{ marginBottom: '6px' }}>Interactive Gantt Timeline</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Project Schedule & Milestone Gantt</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Visualizes concurrency, start-to-finish dates, and critical milestones across the {project.total_days}-day academic timeline.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '8px', borderRadius: '2px', background: '#ec4899', display: 'inline-block' }}></span>
            <span>Critical Task</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '8px', borderRadius: '2px', background: '#6366f1', display: 'inline-block' }}></span>
            <span>Standard Task</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '8px', borderRadius: '2px', background: 'rgba(16, 185, 129, 0.4)', display: 'inline-block' }}></span>
            <span>Available Slack</span>
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto', background: 'rgba(11, 15, 25, 0.6)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
        <div style={{ minWidth: '850px' }}>
          {/* Header Axis */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '12px' }}>
            <div style={{ width: '240px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Task & Phase
            </div>
            <div style={{ flex: 1, position: 'relative', height: '20px' }}>
              {dayMarkers.map(day => (
                <div
                  key={day}
                  style={{
                    position: 'absolute',
                    left: `${(day / maxDay) * 100}%`,
                    transform: 'translateX(-50%)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)'
                  }}
                >
                  Day {day}
                </div>
              ))}
            </div>
          </div>

          {/* Milestone and Task rows */}
          {project.milestones.map(m => (
            <div key={m.id} style={{ marginBottom: '14px' }}>
              <div style={{ 
                fontSize: '0.8rem', 
                fontWeight: 700, 
                color: '#818cf8', 
                padding: '4px 0', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                borderBottom: '1px dashed rgba(255,255,255,0.05)'
              }}>
                <span>{m.name}</span>
                {m.review_stage && (
                  <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>{m.review_stage}</span>
                )}
              </div>

              {m.tasks.map(t => {
                const leftPercent = (t.start_day_offset / maxDay) * 100;
                const widthPercent = (t.duration_days / maxDay) * 100;
                const slackPercent = (t.slack_days / maxDay) * 100;

                return (
                  <div 
                    key={t.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      height: '36px', 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.02)' 
                    }}
                  >
                    <div style={{ width: '240px', paddingRight: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 500, color: t.is_critical_path ? '#f472b6' : 'var(--text-sub)' }}>
                        {t.name}
                      </span>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {t.assigned_to} &bull; {t.duration_days}d
                      </div>
                    </div>

                    <div style={{ flex: 1, position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
                      {/* Grid guideline lines */}
                      {dayMarkers.map(day => (
                        <div
                          key={day}
                          style={{
                            position: 'absolute',
                            left: `${(day / maxDay) * 100}%`,
                            top: 0,
                            bottom: 0,
                            borderLeft: '1px dashed rgba(255, 255, 255, 0.05)',
                            pointerEvents: 'none'
                          }}
                        />
                      ))}

                      {/* Slack float bar */}
                      {t.slack_days > 0 && (
                        <div
                          style={{
                            position: 'absolute',
                            left: `${leftPercent + widthPercent}%`,
                            width: `${slackPercent}%`,
                            height: '14px',
                            background: 'rgba(16, 185, 129, 0.2)',
                            border: '1px dashed rgba(16, 185, 129, 0.5)',
                            borderRadius: '3px'
                          }}
                          title={`Float Slack: ${t.slack_days} days`}
                        />
                      )}

                      {/* Main Task Bar */}
                      <div
                        style={{
                          position: 'absolute',
                          left: `${leftPercent}%`,
                          width: `${Math.max(1.5, widthPercent)}%`,
                          height: '22px',
                          background: t.is_critical_path
                            ? 'linear-gradient(90deg, #ec4899 0%, #db2777 100%)'
                            : 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)',
                          borderRadius: '4px',
                          boxShadow: t.is_critical_path ? '0 0 10px rgba(236, 72, 153, 0.4)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 8px',
                          color: '#fff',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          cursor: 'pointer'
                        }}
                        title={`${t.name} (${t.start_date} to ${t.end_date}) - Duration: ${t.duration_days} days`}
                      >
                        {widthPercent > 5 ? `${t.duration_days}d` : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
