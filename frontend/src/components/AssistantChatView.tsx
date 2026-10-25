import React, { useState } from 'react';
import { Project } from '../types';
import { api } from '../api';
import { 
  Bot, Send, Sparkles, RefreshCw, AlertTriangle, 
  CheckCircle2, Clock, Terminal, HelpCircle 
} from 'lucide-react';

interface Props {
  project: Project | null;
  onScheduleUpdated: (updatedProj: Project) => void;
}

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  actions?: string[];
  timestamp: string;
}

export const AssistantChatView: React.FC<Props> = ({ project, onScheduleUpdated }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: project 
        ? `Hello! I am your **Academic Project Planning & Milestone Reasoning Agent**. I have loaded **${project.title}** (${project.total_days} days, ${project.milestones.length} milestones).\n\nAsk me questions about critical paths, downstream delay cascading, rubric coverage, or deadline optimization!`
        : `Hello! I am your **Academic Project Planning & Milestone Reasoning Agent**. Please select or create a project to get started with schedule reasoning.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickPrompts = [
    "What should we complete before the first review?",
    "Our dataset preparation is delayed by three days. Update our schedule.",
    "Which tasks are on the critical path?",
    "Does our plan cover every review rubric criterion?",
    "How can we finish before the deadline without reducing testing time?"
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setIsLoading(true);

    try {
      const res = await api.sendChatMessage(project?.id || null, textToSend);
      const assistantMsg: ChatMessage = {
        sender: 'assistant',
        text: res.reply,
        actions: res.actions_taken,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);

      if (res.schedule_updated && res.updated_project) {
        onScheduleUpdated(res.updated_project);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: `⚠️ **Error communicating with Reasoning Agent:** ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '750px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div className="badge badge-primary" style={{ marginBottom: '6px' }}>Module 8: Contextual AI Planning Assistant</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Conversational Schedule & Reasoning Copilot</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Directly connected to project DAG parameters, CPM graph, and university rubric evaluation matrix.
          </p>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '12px' }}>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            disabled={isLoading}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
          >
            <Sparkles size={12} style={{ color: '#818cf8' }} /> {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Stream */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px', 
        padding: '16px', 
        background: 'rgba(11, 15, 25, 0.6)', 
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)' 
      }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%'
            }}
          >
            <div
              style={{
                background: m.sender === 'user' 
                  ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' 
                  : 'rgba(24, 34, 52, 0.9)',
                border: m.sender === 'user' ? 'none' : '1px solid #26334d',
                color: '#f8fafc',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {m.text}
              </div>

              {m.actions && m.actions.length > 0 && (
                <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', color: '#38bdf8' }}>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Terminal size={12} /> Executed Engine Operations:
                  </div>
                  {m.actions.map((act, i) => (
                    <div key={i} style={{ color: '#94a3b8', marginTop: '2px' }}>&bull; {act}</div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ 
              fontSize: '0.7rem', 
              color: 'var(--text-muted)', 
              marginTop: '4px', 
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start' 
            }}>
              {m.timestamp}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8', fontSize: '0.85rem' }}>
            <RefreshCw size={14} className="animate-spin" /> Reasoning through dependency network...
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form 
        onSubmit={e => { e.preventDefault(); handleSend(); }} 
        style={{ display: 'flex', gap: '10px', marginTop: '16px' }}
      >
        <input
          type="text"
          className="input"
          placeholder="Ask a question or simulate schedule adjustments (e.g., 'Delay t-04 by 3 days')..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="btn btn-primary"
          style={{ padding: '0 20px' }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
