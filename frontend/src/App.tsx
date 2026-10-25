import React, { useState, useEffect } from 'react';
import { Project, Task } from './types';
import { api } from './api';
import { 
  Sparkles, Layers, GitBranch, Calendar, ShieldCheck, 
  BarChart2, Bot, PlusCircle, Settings, Home, History, 
  ChevronRight, RefreshCw, AlertCircle 
} from 'lucide-react';

import { LandingView } from './components/LandingView';
import { ProjectWizard } from './components/ProjectWizard';
import { MilestoneList } from './components/MilestoneList';
import { DependencyGraphView } from './components/DependencyGraphView';
import { GanttTimelineView } from './components/GanttTimelineView';
import { RubricCoverageView } from './components/RubricCoverageView';
import { ScheduleValidator } from './components/ScheduleValidator';
import { DashboardView } from './components/DashboardView';
import { AssistantChatView } from './components/AssistantChatView';
import { HistoricalAnalysisView } from './components/HistoricalAnalysisView';
import { SettingsView } from './components/SettingsView';

export const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Selected task to pre-fill delay simulation
  const [selectedTaskForDelay, setSelectedTaskForDelay] = useState<Task | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const list = await api.getProjects();
      setProjects(list);
      if (list.length > 0 && !activeProjectId) {
        setActiveProjectId(list[0].id);
      }
    } catch (err: any) {
      setError('Could not connect to backend engine: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  const handleProjectCreated = (newId: string) => {
    loadProjects();
    setActiveProjectId(newId);
    setActiveTab('dashboard');
  };

  const handleProjectUpdated = (updatedProj: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProj.id ? updatedProj : p));
  };

  const handleSimulateDelayClick = (task: Task) => {
    setSelectedTaskForDelay(task);
    setActiveTab('validator');
  };

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <header className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 100, padding: '12px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('landing')}>
            <div style={{ 
              width: '36px', height: '36px', borderRadius: '10px', 
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)'
            }}>
              <Sparkles size={20} color="#fff" />
            </div>
            <div>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Academic Planner & <span className="gradient-text">Milestone Agent</span>
              </span>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                DAG Dependency Engine &bull; CPM Optimization &bull; Rubric Alignment
              </div>
            </div>
          </div>

          {/* Project Selector & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {projects.length > 0 && (
              <select
                className="select"
                style={{ width: '260px', fontSize: '0.8rem', padding: '8px 12px' }}
                value={activeProjectId || ''}
                onChange={e => setActiveProjectId(e.target.value)}
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.total_days}d)
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setActiveTab('wizard')}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', padding: '8px 14px' }}
            >
              <PlusCircle size={15} /> New Project Plan
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="main-content">
        {/* Navigation Tabs Bar */}
        <div className="tabs-nav">
          <button
            className={`tab-btn ${activeTab === 'landing' ? 'active' : ''}`}
            onClick={() => setActiveTab('landing')}
          >
            <Home size={15} /> Overview
          </button>

          <button
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            disabled={!activeProject}
          >
            <BarChart2 size={15} /> Dashboard
          </button>

          <button
            className={`tab-btn ${activeTab === 'milestones' ? 'active' : ''}`}
            onClick={() => setActiveTab('milestones')}
            disabled={!activeProject}
          >
            <Layers size={15} /> AI Milestones & Tasks
          </button>

          <button
            className={`tab-btn ${activeTab === 'graph' ? 'active' : ''}`}
            onClick={() => setActiveTab('graph')}
            disabled={!activeProject}
          >
            <GitBranch size={15} /> Dependency DAG
          </button>

          <button
            className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
            disabled={!activeProject}
          >
            <Calendar size={15} /> Gantt Timeline
          </button>

          <button
            className={`tab-btn ${activeTab === 'rubric' ? 'active' : ''}`}
            onClick={() => setActiveTab('rubric')}
            disabled={!activeProject}
          >
            <ShieldCheck size={15} /> Rubric Coverage
          </button>

          <button
            className={`tab-btn ${activeTab === 'validator' ? 'active' : ''}`}
            onClick={() => setActiveTab('validator')}
            disabled={!activeProject}
          >
            <AlertCircle size={15} /> Delay Shock Testing
          </button>

          <button
            className={`tab-btn ${activeTab === 'historical' ? 'active' : ''}`}
            onClick={() => setActiveTab('historical')}
          >
            <History size={15} /> Historical Projects
          </button>

          <button
            className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <Bot size={15} /> AI Reasoning Assistant
          </button>

          <button
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            disabled={!activeProject}
          >
            <Settings size={15} /> Settings & Export
          </button>
        </div>

        {/* Global Loading / Error State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#818cf8' }}>
            <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
            <p>Connecting to AI Scheduling Engine...</p>
          </div>
        )}

        {error && !loading && (
          <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '16px', borderRadius: 'var(--radius-md)', color: '#fca5a5', marginBottom: '24px' }}>
            {error}
          </div>
        )}

        {/* Tab Routing */}
        {!loading && (
          <>
            {activeTab === 'landing' && (
              <LandingView
                onStartNewProject={() => setActiveTab('wizard')}
                onExploreDemo={() => {
                  const demo = projects.find(p => p.id === 'sample-student-ml-30d');
                  if (demo) setActiveProjectId(demo.id);
                  setActiveTab('dashboard');
                }}
              />
            )}

            {activeTab === 'wizard' && (
              <ProjectWizard onProjectCreated={handleProjectCreated} />
            )}

            {activeTab === 'dashboard' && activeProject && (
              <DashboardView
                project={activeProject}
                onNavigateTab={tab => setActiveTab(tab)}
                onSimulateDelayClick={handleSimulateDelayClick}
              />
            )}

            {activeTab === 'milestones' && activeProject && (
              <MilestoneList
                project={activeProject}
                onSimulateDelayClick={handleSimulateDelayClick}
              />
            )}

            {activeTab === 'graph' && activeProject && (
              <DependencyGraphView project={activeProject} />
            )}

            {activeTab === 'timeline' && activeProject && (
              <GanttTimelineView project={activeProject} />
            )}

            {activeTab === 'rubric' && activeProject && (
              <RubricCoverageView project={activeProject} />
            )}

            {activeTab === 'validator' && activeProject && (
              <ScheduleValidator
                project={activeProject}
                onScheduleUpdated={handleProjectUpdated}
                selectedTaskForDelay={selectedTaskForDelay}
              />
            )}

            {activeTab === 'historical' && (
              <HistoricalAnalysisView />
            )}

            {activeTab === 'chat' && (
              <AssistantChatView
                project={activeProject}
                onScheduleUpdated={handleProjectUpdated}
              />
            )}

            {activeTab === 'settings' && activeProject && (
              <SettingsView
                project={activeProject}
                onProjectDeleted={() => {
                  loadProjects();
                  setActiveTab('landing');
                }}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
