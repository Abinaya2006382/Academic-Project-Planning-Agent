import React, { useState } from 'react';
import { ProjectCreateInput } from '../types';
import { api } from '../api';
import { Sparkles, Calendar, Users, Cpu, FileUp, AlertTriangle, ArrowRight, Layers, CheckCircle2 } from 'lucide-react';

interface Props {
  onProjectCreated: (projectId: string) => void;
}

export const ProjectWizard: React.FC<Props> = ({ onProjectCreated }) => {
  const today = new Date().toISOString().split('T')[0];
  const defaultDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [form, setForm] = useState<ProjectCreateInput>({
    title: '',
    description: '',
    category: 'AI/ML',
    start_date: today,
    deadline: defaultDeadline,
    team_size: 3,
    hours_per_week: 20,
    complexity: 'Medium',
    tech_stack: ['Python', 'Scikit-Learn', 'FastAPI'],
    deliverables: ['SRS Document', 'Cleaned Dataset', 'Trained Model', 'Evaluation Report', 'Thesis PDF'],
    review_stages: 3,
    constraints: ['Resource constraints on training GPU quota'],
    unavailable_dates: []
  });

  const [techInput, setTechInput] = useState('');
  const [deliverableInput, setDeliverableInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadStatus('Analyzing uploaded rubric / guidelines document...');
      const res = await api.parseGuidelines(file);
      setUploadStatus(`Extracted ${res.detected_academic_elements.length} criteria from ${file.name}`);
      setForm(prev => ({
        ...prev,
        uploaded_guidelines_text: res.summary,
        deliverables: Array.from(new Set([...prev.deliverables, ...res.detected_academic_elements.map((e: string) => `${e} Submission`)]))
      }));
    } catch (err: any) {
      setUploadStatus('Failed to parse document: ' + err.message);
    }
  };

  const handleAddTech = () => {
    if (techInput.trim() && !form.tech_stack.includes(techInput.trim())) {
      setForm({ ...form, tech_stack: [...form.tech_stack, techInput.trim()] });
      setTechInput('');
    }
  };

  const handleAddDeliverable = () => {
    if (deliverableInput.trim() && !form.deliverables.includes(deliverableInput.trim())) {
      setForm({ ...form, deliverables: [...form.deliverables, deliverableInput.trim()] });
      setDeliverableInput('');
    }
  };

  const loadSampleScenario = () => {
    setForm({
      title: 'Student Performance Prediction Using Machine Learning',
      description: 'An AI/ML academic initiative to forecast academic attrition and exam risk by analyzing student interaction logs, LMS metrics, and historical performance.',
      category: 'AI/ML',
      start_date: today,
      deadline: defaultDeadline,
      team_size: 3,
      hours_per_week: 20,
      complexity: 'Medium',
      tech_stack: ['Python', 'Scikit-Learn', 'FastAPI', 'React', 'PostgreSQL', 'Pandas'],
      deliverables: ['SRS Document', 'Cleaned Dataset', 'Trained ML Model', 'Evaluation Metrics Report', 'Web Demo', 'Final Thesis PDF'],
      review_stages: 3,
      constraints: ['GPU cloud quota limits', 'Review 1 scheduled in 10 days'],
      unavailable_dates: [new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Please provide a project title');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const created = await api.createProject(form);
      onProjectCreated(created.id);
    } catch (err: any) {
      setError(err.message || 'Error creating project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <div className="badge badge-primary" style={{ marginBottom: '8px' }}>
            <Sparkles size={12} /> Module 1: AI Project Creation Wizard
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Initialize Academic Project Plan</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Configure your academic requirements, team capacity, and review deadlines to generate a DAG-based milestone schedule.
          </p>
        </div>
        <button
          type="button"
          onClick={loadSampleScenario}
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', borderColor: 'var(--primary)' }}
        >
          <Sparkles size={14} style={{ color: '#818cf8' }} /> Load 30-Day ML Sample Scenario
        </button>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Project Title</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Student Performance Prediction Using Machine Learning"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Objective & Scope Description</label>
          <textarea
            className="textarea"
            rows={3}
            placeholder="Outline research questions, engineering objectives, and target problem statement..."
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Project Category</label>
            <select
              className="select"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
            >
              <option value="AI/ML">AI / Machine Learning</option>
              <option value="Data Science">Data Science & Analytics</option>
              <option value="Web Development">Full-Stack Web App</option>
              <option value="IoT">IoT & Embedded Systems</option>
              <option value="Research">Academic Research / Thesis</option>
              <option value="Other">Other Engineering Project</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Complexity Level</label>
            <select
              className="select"
              value={form.complexity}
              onChange={e => setForm({ ...form, complexity: e.target.value })}
            >
              <option value="Easy">Easy (Standard implementation)</option>
              <option value="Medium">Medium (Moderate ablation / novel features)</option>
              <option value="Hard">Hard (High algorithmic or hardware complexity)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Team Size</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                min={1}
                max={10}
                className="input"
                value={form.team_size}
                onChange={e => setForm({ ...form, team_size: parseInt(e.target.value) || 1 })}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>members</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Commitment / Member</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                min={5}
                max={60}
                className="input"
                value={form.hours_per_week}
                onChange={e => setForm({ ...form, hours_per_week: parseInt(e.target.value) || 20 })}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>hrs/week</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Project Start Date</label>
            <input
              type="date"
              className="input"
              value={form.start_date}
              onChange={e => setForm({ ...form, start_date: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Final Viva / Submission Deadline</label>
            <input
              type="date"
              className="input"
              value={form.deadline}
              onChange={e => setForm({ ...form, deadline: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Evaluation Checkpoints</label>
            <select
              className="select"
              value={form.review_stages}
              onChange={e => setForm({ ...form, review_stages: parseInt(e.target.value) || 3 })}
            >
              <option value={2}>2 Reviews (Midterm + Final Viva)</option>
              <option value={3}>3 Reviews (Review 1, 2, + Final Viva)</option>
              <option value={4}>4 Reviews (Weekly / Bi-weekly Milestones)</option>
            </select>
          </div>
        </div>

        {/* Tech stack & Deliverables */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Technology Stack</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                className="input"
                placeholder="e.g. PyTorch, React, Docker..."
                value={techInput}
                onChange={e => setTechInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTech(); } }}
              />
              <button type="button" onClick={handleAddTech} className="btn btn-secondary">Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {form.tech_stack.map(tech => (
                <span key={tech} className="badge badge-primary" style={{ cursor: 'pointer' }} onClick={() => setForm({ ...form, tech_stack: form.tech_stack.filter(t => t !== tech) })}>
                  {tech} &times;
                </span>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Key Deliverables</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                className="input"
                placeholder="e.g. Model Weights, Test Suite..."
                value={deliverableInput}
                onChange={e => setDeliverableInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddDeliverable(); } }}
              />
              <button type="button" onClick={handleAddDeliverable} className="btn btn-secondary">Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {form.deliverables.map(deliv => (
                <span key={deliv} className="badge badge-success" style={{ cursor: 'pointer' }} onClick={() => setForm({ ...form, deliverables: form.deliverables.filter(d => d !== deliv) })}>
                  {deliv} &times;
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Guidelines / Rubric Upload */}
        <div style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileUp size={16} style={{ color: 'var(--primary)' }} /> Upload University Rubric or Project Guidelines (.pdf, .docx, .txt)
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                AI parses evaluation weights and injects required deliverables into the milestone DAG.
              </p>
            </div>
            <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
              Browse File
              <input type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          </div>
          {uploadStatus && (
            <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
              {uploadStatus}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ padding: '12px 28px', fontSize: '1rem' }}
          >
            {isSubmitting ? 'Reasoning & Generating Schedule...' : 'Generate AI Milestone Schedule'}
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};
