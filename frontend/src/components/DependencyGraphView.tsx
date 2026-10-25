import React, { useMemo } from 'react';
import { Project } from '../types';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  applyNodeChanges, 
  applyEdgeChanges,
  Node,
  Edge,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network, Zap, AlertTriangle, ArrowRight } from 'lucide-react';

interface Props {
  project: Project;
}

export const DependencyGraphView: React.FC<Props> = ({ project }) => {
  const allTasks = useMemo(() => {
    return project.milestones.flatMap(m => m.tasks);
  }, [project]);

  // Build nodes & edges using topological layering
  const { nodes, edges } = useMemo(() => {
    const nodeList: Node[] = [];
    const edgeList: Edge[] = [];

    // Group tasks by their start_day_offset to arrange into columns
    const columns: Record<number, typeof allTasks> = {};
    allTasks.forEach(task => {
      const col = task.start_day_offset;
      if (!columns[col]) columns[col] = [];
      columns[col].push(task);
    });

    const sortedOffsets = Object.keys(columns).map(Number).sort((a, b) => a - b);
    const colSpacing = 260;
    const rowSpacing = 110;

    sortedOffsets.forEach((offset, colIdx) => {
      const tasksInCol = columns[offset];
      tasksInCol.forEach((task, rowIdx) => {
        const isCritical = task.is_critical_path;
        
        nodeList.push({
          id: task.id,
          position: { x: colIdx * colSpacing + 40, y: rowIdx * rowSpacing + 40 },
          data: { 
            label: (
              <div style={{ padding: '8px 12px', textAlign: 'left', minWidth: '180px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ 
                    fontSize: '0.65rem', 
                    fontWeight: 700, 
                    color: isCritical ? '#ec4899' : '#818cf8',
                    textTransform: 'uppercase' 
                  }}>
                    {task.id} &bull; {task.duration_days}d
                  </span>
                  {isCritical && (
                    <span style={{ 
                      fontSize: '0.6rem', 
                      background: 'rgba(236,72,153,0.2)', 
                      color: '#f472b6', 
                      padding: '2px 5px', 
                      borderRadius: '4px',
                      fontWeight: 700 
                    }}>
                      CRITICAL
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc', whiteSpace: 'normal', lineHeight: 1.3 }}>
                  {task.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{task.assigned_to}</span>
                  <span style={{ color: task.slack_days === 0 ? '#f472b6' : '#34d399' }}>
                    Slack: {task.slack_days}d
                  </span>
                </div>
              </div>
            ) 
          },
          style: {
            background: isCritical ? 'rgba(30, 20, 38, 0.95)' : 'rgba(18, 24, 38, 0.95)',
            border: isCritical ? '2px solid #ec4899' : '1px solid #334155',
            borderRadius: '10px',
            boxShadow: isCritical ? '0 0 15px rgba(236, 72, 153, 0.35)' : '0 4px 12px rgba(0, 0, 0, 0.4)',
            color: '#fff',
            width: 220
          }
        });

        // Edges
        task.dependencies.forEach(depId => {
          const isCriticalEdge = isCritical && allTasks.find(t => t.id === depId)?.is_critical_path;
          edgeList.push({
            id: `edge-${depId}-${task.id}`,
            source: depId,
            target: task.id,
            animated: isCriticalEdge,
            style: {
              stroke: isCriticalEdge ? '#ec4899' : '#475569',
              strokeWidth: isCriticalEdge ? 2.5 : 1.5
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: isCriticalEdge ? '#ec4899' : '#475569',
              width: 14,
              height: 14
            }
          });
        });
      });
    });

    return { nodes: nodeList, edges: edgeList };
  }, [allTasks]);

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '700px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div className="badge badge-primary" style={{ marginBottom: '6px' }}>Module 4: DAG Dependency Reasoning</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Interactive Task Dependency Graph</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Directed Acyclic Graph (DAG) visualizing zero-slack critical path (magenta glowing nodes) and parallel opportunities.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#ec4899', display: 'inline-block' }}></span>
            <span>Critical Path (0 Slack)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#334155', border: '1px solid #475569', display: 'inline-block' }}></span>
            <span>Flexible Task (Has Float)</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#0b0f19' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="#1e293b" gap={20} size={1} />
          <Controls style={{ background: '#182234', borderColor: '#334155', fill: '#fff' }} />
        </ReactFlow>
      </div>

      <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Tip: Scroll to zoom, drag to pan. Pink arrows indicate active critical paths that dictate project finish date.</span>
        <span style={{ color: '#a5b4fc' }}>Total Nodes: {nodes.length} &bull; Total Dependencies: {edges.length}</span>
      </div>
    </div>
  );
};
