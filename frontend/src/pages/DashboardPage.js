import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getDashboardStats } from '../services/api';
import Loader from '../components/Loader';

const PIE_COLORS = ['#ef4444','#10b981'];

const TT_STYLE = { background:'#111827', border:'1px solid #1e2d45', borderRadius:'8px', color:'#e8f0fe' };

const css = `
.dash-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:28px;flex-wrap:wrap;gap:12px}
.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:24px}
.stat-card{background:#111827;border:1px solid #1e2d45;border-radius:20px;padding:20px 22px;display:flex;align-items:center;gap:16px;transition:all .25s ease}
.stat-card:hover{border-color:#2a4a7a;transform:translateY(-2px)}
.sc-fake{border-color:rgba(239,68,68,.25);background:rgba(239,68,68,.04)}
.sc-real{border-color:rgba(16,185,129,.25);background:rgba(16,185,129,.04)}
.sc-icon{font-size:1.6rem;flex-shrink:0}
.sc-val{font-size:1.6rem;font-weight:800;font-family:'DM Mono',monospace;color:#e8f0fe;line-height:1}
.sc-label{font-size:.72rem;color:#4a5a7a;text-transform:uppercase;letter-spacing:.05em;margin-top:3px}
.charts-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;margin-bottom:24px}
.chart-title{font-size:.95rem;font-weight:700;color:#e8f0fe;margin-bottom:20px}
.rtable{width:100%;border-collapse:collapse;font-size:.85rem}
.rtable th{text-align:left;padding:8px 12px;font-size:.72rem;font-weight:600;color:#4a5a7a;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #1e2d45}
.rtable td{padding:10px 12px;border-bottom:1px solid rgba(30,45,69,.5);color:#8899bb}
.rtable tr:last-child td{border-bottom:none}
.tbadge{display:inline-block;padding:3px 10px;border-radius:100px;font-size:.72rem;font-weight:700}
.tbf{background:rgba(239,68,68,.12);color:#f87171;border:1px solid rgba(239,68,68,.25)}
.tbr{background:rgba(16,185,129,.12);color:#34d399;border:1px solid rgba(16,185,129,.25)}
.tconf{font-family:'DM Mono',monospace;font-weight:600;color:#e8f0fe!important}
.tid{font-family:'DM Mono',monospace;color:#4a5a7a!important;font-size:.78rem}
.tsrc{font-size:.78rem;color:#4a5a7a;font-family:'DM Mono',monospace}
.empty-state{text-align:center;padding:64px 24px}
.empty-icon{font-size:3rem;display:block;margin-bottom:16px}`;

export default function DashboardPage() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const fetchStats = async () => {
    setLoading(true); setError('');
    try { setStats(await getDashboardStats()); }
    catch (e) { setError(e.message || 'Failed to load dashboard.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return <div className="page-wrapper"><Loader message="Loading live dashboard..." /></div>;

  if (error) {
    if (error.toLowerCase().includes('log in') || error.toLowerCase().includes('unauthorized')) {
      return (
        <div className="page-wrapper">
          <style>{css}</style>
          <h1 className="page-title">Analytics Dashboard</h1>
          <div className="card empty-state">
            <span className="empty-icon">🔒</span>
            <h3 style={{ color:'#e8f0fe', marginBottom:'8px' }}>Authentication Required</h3>
            <p style={{ color:'#8899bb', marginBottom:'20px' }}>{error}</p>
            <a href="/login" className="btn btn-primary">Go to Login</a>
          </div>
        </div>
      );
    }
    return (
      <div className="page-wrapper">
        <style>{css}</style>
        <div className="error-box">{error}</div>
        <button className="btn btn-secondary mt-16" onClick={fetchStats}>Retry</button>
      </div>
    );
  }

  if (!stats || stats.total_analyzed === 0) return (
    <div className="page-wrapper">
      <style>{css}</style>
      <h1 className="page-title">Analytics Dashboard</h1>
      <div className="card empty-state">
        <span className="empty-icon">📊</span>
        <h3 style={{ color:'#e8f0fe', marginBottom:'8px' }}>No analyses yet</h3>
        <p style={{ color:'#8899bb' }}>Run your first analysis to see live data here.</p>
      </div>
    </div>
  );

  const pieData  = [{ name:'Fake News', value: stats.fake_count }, { name:'Real News', value: stats.real_count }];
  const barData  = stats.recent_analyses.map((r) => ({
    name:       `#${r.id}`,
    confidence: parseFloat(r.confidence),
    fill:       r.prediction === 'Fake News' ? '#ef4444' : '#10b981',
  }));

  return (
    <>
      <style>{css}</style>
      <div className="page-wrapper">
        <div className="dash-header">
          <div>
            <h1 className="page-title">Analytics Dashboard</h1>
            <p className="page-subtitle">Live data from your local database</p>
          </div>
          <button className="btn btn-secondary" onClick={fetchStats}>🔄 Refresh</button>
        </div>

        <div className="stats-grid">
          {[
            { icon:'📰', val: stats.total_analyzed, lbl:'Total Analyzed', cls:'' },
            { icon:'⚠️', val: stats.fake_count,     lbl:'Fake News',      cls:'sc-fake' },
            { icon:'✅', val: stats.real_count,     lbl:'Real News',      cls:'sc-real' },
            { icon:'📊', val: `${stats.fake_percentage}%`, lbl:'Fake Rate', cls:'' },
          ].map(({ icon, val, lbl, cls }) => (
            <div className={`stat-card ${cls}`} key={lbl}>
              <span className="sc-icon">{icon}</span>
              <div><div className="sc-val">{val}</div><div className="sc-label">{lbl}</div></div>
            </div>
          ))}
        </div>

        <div className="charts-grid">
          <div className="card">
            <div className="chart-title">Fake vs Real distribution</div>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={TT_STYLE} />
                <Legend formatter={(v) => <span style={{ color:'#8899bb', fontSize:'.83rem' }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="chart-title">Recent confidence scores</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} margin={{ top:8, right:8, left:-20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                <XAxis dataKey="name" tick={{ fill:'#8899bb', fontSize:11 }} axisLine={{ stroke:'#1e2d45' }} tickLine={false} />
                <YAxis domain={[0,100]} tick={{ fill:'#8899bb', fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [`${v}%`,'Confidence']} contentStyle={TT_STYLE} cursor={{ fill:'rgba(59,130,246,.06)' }} />
                <Bar dataKey="confidence" radius={[6,6,0,0]}>
                  {barData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="chart-title">Recent analyses</div>
          <div style={{ overflowX:'auto' }}>
            <table className="rtable">
              <thead>
                <tr><th>#</th><th>Prediction</th><th>Confidence</th><th>Sentiment</th><th>Source</th></tr>
              </thead>
              <tbody>
                {stats.recent_analyses.map((r) => (
                  <tr key={r.id}>
                    <td className="tid">{r.id}</td>
                    <td><span className={`tbadge ${r.prediction === 'Fake News' ? 'tbf' : 'tbr'}`}>{r.prediction}</span></td>
                    <td className="tconf">{r.confidence}</td>
                    <td>{r.sentiment}</td>
                    <td className="tsrc">{r.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
