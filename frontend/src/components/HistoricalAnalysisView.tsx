import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { HistoricalBenchmark } from '../types';
import { 
  History, TrendingUp, AlertTriangle, CheckCircle2, 
  ExternalLink, BarChart, BookOpen, Layers 
} from 'lucide-react';
import { 
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';

export const HistoricalAnalysisView: React.FC = () => {
  const [data, setData] = useState<{
    benchmarks: HistoricalBenchmark;
    historical_cohort: any[];
    standard_rubrics: any[];
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('AI/ML');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.getHistoricalAnalysis(selectedCategory, 'Medium');
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = data?.historical_cohort.map(p => ({
    name: p.title.length > 25 ? p.title.substring(0, 22) + '...' : p.title,
    Planned: p.planned_days,
    Actual: p.actual_days,
    Delay: p.delay_days
  })) || [];

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <div className="badge badge-primary" style={{ marginBottom: '6px' }}>Module 2: Historical Academic Analysis</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Historical Project Timelines & Rubric Benchmarks</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Empirical baseline analysis from completed academic capstones and peer engineering cohorts.
          </p>
        </div>

        <div>
          <select
            className="select"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            style={{ fontSize: '0.85rem' }}
          >
            <option value="AI/ML">AI / Machine Learning Projects</option>
            <option value="Web Development">Full-Stack Web Projects</option>
            <option value="IoT">IoT / Embedded Hardware</option>
            <option value="Research">Academic Research / Thesis</option>
          </select>
        </div>
      </div>

      {/* Provenance Disclosure Notice */}
      <div style={{ 
        background: 'rgba(99, 102, 241, 0.1)', 
        border: '1px solid rgba(99, 102, 241, 0.3)', 
        padding: '12px 16px', 
        borderRadius: 'var(--radius-sm)', 
        marginBottom: '24px', 
        fontSize: '0.8rem', 
        color: '#a5b4fc',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <BookOpen size={16} />
        <span>
          <strong>Provenance Transparency:</strong> {data?.benchmarks.data_provenance || 'Curated benchmark cohort with clear provenance.'}
        </span>
      </div>

      {/* Aggregate Stats */}
      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div style={{ background: 'rgba(18, 24, 38, 0.7)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Average Planned Duration</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#818cf8' }}>
              {data.benchmarks.avg_planned_days} days
            </div>
          </div>

          <div style={{ background: 'rgba(18, 24, 38, 0.7)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Average Actual Completion</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f59e0b' }}>
              {data.benchmarks.avg_actual_days} days
            </div>
          </div>

          <div style={{ background: 'rgba(18, 24, 38, 0.7)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Average Slippage Rate</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#ec4899' }}>
              +{data.benchmarks.avg_slippage_percentage}%
            </div>
          </div>

          <div style={{ background: 'rgba(18, 24, 38, 0.7)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Analyzed Benchmark Sample</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#34d399' }}>
              {data.benchmarks.sample_size} Projects
            </div>
          </div>
        </div>
      )}

      {/* Comparison Chart */}
      <div style={{ background: 'rgba(18, 24, 38, 0.7)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Planned vs Actual Completion Timeline</h3>
        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#26334d" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} interval={0} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip 
                contentStyle={{ background: '#182234', borderColor: '#334155', color: '#fff', borderRadius: '8px' }} 
              />
              <Legend />
              <Bar dataKey="Planned" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Actual" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Frequent Bottlenecks & Lessons Learned */}
      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div style={{ background: 'rgba(18, 24, 38, 0.7)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <AlertTriangle size={16} /> Recurring Bottlenecks in {selectedCategory}
            </div>
            <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-sub)' }}>
              {data.benchmarks.frequent_bottlenecks.map((bn, i) => (
                <li key={i}>{bn}</li>
              ))}
            </ul>
          </div>

          <div style={{ background: 'rgba(18, 24, 38, 0.7)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <CheckCircle2 size={16} /> Verified Mitigation Takeaways
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.historical_cohort.map((p, idx) => (
                <div key={idx} style={{ fontSize: '0.8rem', background: 'rgba(11, 15, 25, 0.4)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontWeight: 600, color: '#f8fafc' }}>{p.title}</div>
                  <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>"{p.lessons_learned}"</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
