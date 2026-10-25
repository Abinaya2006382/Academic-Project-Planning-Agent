import React, { useState } from 'react';
import { Project } from '../types';
import { api } from '../api';
import { Settings, Trash2, Download, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  project: Project;
  onProjectDeleted: () => void;
}

export const SettingsView: React.FC<Props> = ({ project, onProjectDeleted }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.deleteProject(project.id);
      onProjectDeleted();
    } catch (err: any) {
      setStatusMessage('Failed to delete project: ' + err.message);
      setIsDeleting(false);
    }
  };

  const handleExportCsv = () => {
    const url = api.getExportCsvUrl(project.id);
    window.open(url, '_blank');
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '28px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Settings size={22} style={{ color: '#818cf8' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Project Settings & Data Management</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Project Info Summary */}
        <div style={{ background: 'rgba(18, 24, 38, 0.7)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px' }}>Project Identity</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Identifier:</span> <span style={{ fontFamily: 'var(--font-mono)' }}>{project.id}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Created At:</span> <span>{new Date(project.created_at).toLocaleDateString()}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Category:</span> <span>{project.category}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Complexity:</span> <span>{project.complexity}</span>
            </div>
          </div>
        </div>

        {/* Data Export */}
        <div style={{ background: 'rgba(18, 24, 38, 0.7)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>Export Academic Schedule Data</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Download schedule spreadsheet with milestone timelines, dependency tags, task critical-path markers, and responsible team assignments.
          </p>
          <button onClick={handleExportCsv} className="btn btn-secondary">
            <Download size={16} /> Export Schedule to CSV (.csv)
          </button>
        </div>

        {/* Danger Zone */}
        <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f87171', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} /> Danger Zone
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Deleting this project permanently removes all milestone calculations, simulated delays, and rubric mappings from local persistent storage.
          </p>

          {!deleteConfirm ? (
            <button onClick={() => setDeleteConfirm(true)} className="btn btn-danger">
              <Trash2 size={16} /> Delete Academic Project
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button onClick={handleDelete} disabled={isDeleting} className="btn btn-danger">
                {isDeleting ? 'Deleting...' : 'Confirm Permanent Deletion'}
              </button>
              <button onClick={() => setDeleteConfirm(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          )}

          {statusMessage && (
            <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#f87171' }}>
              {statusMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
