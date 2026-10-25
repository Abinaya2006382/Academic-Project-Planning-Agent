import React from 'react';
import { Project } from '../types';
import { Sparkles, Calendar, ArrowRight, ShieldCheck, Cpu, GitBranch, Award, Layers } from 'lucide-react';

interface Props {
  onStartNewProject: () => void;
  onExploreDemo: () => void;
}

export const LandingView: React.FC<Props> = ({ onStartNewProject, onExploreDemo }) => {
  return (
    <div className="animate-fade-in" style={{ padding: '40px 0', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <div className="badge badge-primary" style={{ marginBottom: '16px', padding: '6px 14px' }}>
          <Sparkles size={14} /> AI-Powered Academic Engineering & Research Copilot
        </div>
        <h1 style={{ fontSize: '3.2rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '20px' }}>
          Academic Project Planning & <br />
          <span className="gradient-text">Milestone Reasoning Agent</span>
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: '750px', margin: '0 auto 32px auto' }}>
          Far beyond static to-do lists. Generates realistic, dependency-aware milestone schedules, calculates critical paths with topological sort, and validates deliverables against university review rubrics.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <button
            onClick={onExploreDemo}
            className="btn btn-primary"
            style={{ padding: '14px 28px', fontSize: '1rem' }}
          >
            <Sparkles size={18} /> Explore 30-Day ML Benchmark Demo
          </button>
          <button
            onClick={onStartNewProject}
            className="btn btn-secondary"
            style={{ padding: '14px 28px', fontSize: '1rem' }}
          >
            Create New Academic Plan <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Feature Pillar Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '60px' }}>
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--primary-glow)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <GitBranch size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>DAG & Critical Path Reasoning</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>
            Topological sorting prevents impossible circular dependencies, computes float/slack, and isolates tasks where delays push back the final submission date.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Award size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Review Rubric Alignment</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>
            Cross-checks deliverables against grading criteria (Literature Review, System Architecture, Testing & Final Viva) to prevent missing evaluation requirements.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <ShieldCheck size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Historical Benchmark Validation</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>
            Calibrates schedules against real-world delay patterns (e.g. data preprocessing bottlenecks) with clearly documented synthetic benchmark provenance.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Cpu size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>Downstream Shock Simulation</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>
            Simulate delays (e.g., dataset prep delayed by 3 days) and immediately observe how downstream dependent tasks shift and whether your deadline is breached.
          </p>
        </div>
      </div>
    </div>
  );
};
