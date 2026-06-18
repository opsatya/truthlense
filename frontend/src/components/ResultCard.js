import React from 'react';

const css = `
.result-card{border-radius:20px;padding:28px;box-shadow:0 4px 24px rgba(0,0,0,0.4);animation:slideUp .45s ease;margin-top:28px}
.result-fake{background:#111827;border:1.5px solid rgba(239,68,68,0.5);box-shadow:0 4px 32px rgba(239,68,68,0.1)}
.result-real{background:#111827;border:1.5px solid rgba(16,185,129,0.5);box-shadow:0 4px 32px rgba(16,185,129,0.1)}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.result-banner{display:flex;align-items:flex-start;gap:16px;margin-bottom:18px}
.result-icon{font-size:2.2rem;flex-shrink:0}
.result-badge{display:inline-block;padding:5px 16px;border-radius:100px;font-size:.8rem;font-weight:800;letter-spacing:.1em;font-family:'DM Mono',monospace}
.badge-fake{background:rgba(239,68,68,.15);color:#f87171;border:1px solid rgba(239,68,68,.3)}
.badge-real{background:rgba(16,185,129,.15);color:#34d399;border:1px solid rgba(16,185,129,.3)}
.result-meta{font-size:.82rem;color:#4a5a7a;margin-top:5px}
.r-divider{height:1px;background:#1e2d45;margin:16px 0}
.r-label{font-size:.75rem;font-weight:600;color:#4a5a7a;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px}
.cb-wrap{display:flex;align-items:center;gap:10px}
.cb-track{flex:1;height:8px;background:rgba(255,255,255,.06);border-radius:100px;overflow:hidden}
.cb-fill{height:100%;border-radius:100px;transition:width 1s ease}
.fill-fake{background:linear-gradient(90deg,#ef4444,#f97316)}
.fill-real{background:linear-gradient(90deg,#10b981,#06b6d4)}
.cb-val{font-family:'DM Mono',monospace;font-size:1rem;font-weight:600;min-width:48px;text-align:right;color:#e8f0fe}
.metrics{display:flex;gap:12px;margin-top:16px;flex-wrap:wrap}
.metric-chip{flex:1;min-width:130px;background:rgba(255,255,255,.03);border:1px solid #1e2d45;border-radius:12px;padding:14px 16px}
.m-label{display:block;font-size:.72rem;color:#4a5a7a;text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px}
.m-val{font-size:.95rem;font-weight:700}
.neg{color:#f87171}.pos{color:#34d399}.neu{color:#93c5fd}
.c-low{color:#f87171}.c-high{color:#34d399}.c-med{color:#fbbf24}.c-unk{color:#8899bb}
.r-summary{font-size:.9rem;color:#8899bb;line-height:1.7;background:rgba(255,255,255,.03);border-left:3px solid #3b82f6;padding:14px 16px;border-radius:0 12px 12px 0;margin-top:8px}
.news-check-box{margin-top:20px;background:rgba(255,255,255,.02);border:1px solid #1e2d45;border-radius:12px;padding:16px}
.nc-title{font-size:.82rem;font-weight:700;color:#e8f0fe;margin-bottom:10px}
.nc-verdict{display:inline-block;padding:3px 12px;border-radius:100px;font-size:.75rem;font-weight:700;margin-bottom:10px}
.nv-confirmed{background:rgba(16,185,129,.15);color:#34d399}
.nv-partial{background:rgba(251,191,36,.15);color:#fbbf24}
.nv-notfound{background:rgba(239,68,68,.15);color:#f87171}
.nv-unverified{background:rgba(139,92,246,.15);color:#c4b5fd}
.nv-unavail{background:rgba(74,90,122,.15);color:#8899bb}
.nc-articles{display:flex;flex-direction:column;gap:8px;margin-top:4px}
.nc-article{background:rgba(255,255,255,.03);border-radius:8px;padding:10px 12px}
.nc-art-title{font-size:.82rem;color:#e8f0fe;margin-bottom:3px}
.nc-art-meta{font-size:.75rem;color:#4a5a7a}
.nc-art-link{font-size:.75rem;color:#3b82f6;text-decoration:none}
.nc-art-link:hover{text-decoration:underline}`;

const sentimentClass = (s) => {
  if (!s) return 'neu';
  const l = s.toLowerCase();
  if (l.includes('negative')) return 'neg';
  if (l.includes('positive')) return 'pos';
  return 'neu';
};

const credClass = (c) => {
  if (!c) return 'c-unk';
  const l = c.toLowerCase();
  if (l.includes('low')) return 'c-low';
  if (l.includes('high')) return 'c-high';
  if (l.includes('medium')) return 'c-med';
  return 'c-unk';
};

const verdictClass = (v) => ({
  CONFIRMED:           'nv-confirmed',
  PARTIALLY_CONFIRMED: 'nv-partial',
  NOT_FOUND:           'nv-notfound',
  UNVERIFIED:          'nv-unverified',
  API_UNAVAILABLE:     'nv-unavail',
}[v] || 'nv-unavail');

const verdictLabel = (v) => ({
  CONFIRMED:           '✅ Confirmed by trusted sources',
  PARTIALLY_CONFIRMED: '⚠️ Partially confirmed',
  NOT_FOUND:           '🚨 Not found in any trusted source',
  UNVERIFIED:          '❓ Unverified',
  API_UNAVAILABLE:     'ℹ️ Live check unavailable (add NewsAPI key)',
}[v] || v);

export default function ResultCard({ result, onReset }) {
  if (!result) return null;
  const isFake = result.prediction?.toLowerCase().includes('fake');
  const conf   = result.confidence || '0%';
  const nc     = result.news_check;

  return (
    <>
      <style>{css}</style>
      <div className={`result-card ${isFake ? 'result-fake' : 'result-real'}`}>

        {/* Banner */}
        <div className="result-banner">
          <span className="result-icon">{isFake ? '⚠️' : '✅'}</span>
          <div>
            <span className={`result-badge ${isFake ? 'badge-fake' : 'badge-real'}`}>
              {isFake ? 'FAKE NEWS' : 'REAL NEWS'}
            </span>
            {result.source_domain && <p className="result-meta">Source: {result.source_domain}</p>}
            {result.extracted_title && <p className="result-meta">"{result.extracted_title}"</p>}
          </div>
        </div>

        <div className="r-divider" />

        {/* Confidence */}
        <div>
          <div className="r-label">Confidence Score</div>
          <div className="cb-wrap">
            <div className="cb-track">
              <div className={`cb-fill ${isFake ? 'fill-fake' : 'fill-real'}`} style={{ width: conf }} />
            </div>
            <span className="cb-val">{conf}</span>
          </div>
        </div>

        {/* Metrics */}
        <div className="metrics">
          <div className="metric-chip">
            <span className="m-label">Sentiment</span>
            <span className={`m-val ${sentimentClass(result.sentiment)}`}>{result.sentiment}</span>
          </div>
          <div className="metric-chip">
            <span className="m-label">Source Credibility</span>
            <span className={`m-val ${credClass(result.credibility)}`}>{result.credibility}</span>
          </div>
        </div>

        {/* Summary */}
        <div style={{ marginTop: '20px' }}>
          <div className="r-label">🤖 AI Summary</div>
          <div className="r-summary">{result.summary}</div>
        </div>

        {/* Live news check */}
        {nc && (
          <div className="news-check-box">
            <div className="nc-title">🔍 Live News Cross-Check</div>
            <span className={`nc-verdict ${verdictClass(nc.verdict)}`}>
              {verdictLabel(nc.verdict)}
            </span>
            {nc.matched_articles && nc.matched_articles.length > 0 && (
              <div className="nc-articles">
                {nc.matched_articles.map((a, i) => (
                  <div className="nc-article" key={i}>
                    <div className="nc-art-title">{a.title}</div>
                    <div className="nc-art-meta">{a.source} · {a.published?.slice(0, 10)}</div>
                    <a href={a.url} target="_blank" rel="noreferrer" className="nc-art-link">Read article →</a>
                  </div>
                ))}
              </div>
            )}
            {nc.verdict === 'API_UNAVAILABLE' && nc.note && (
              <div style={{ fontSize: '.78rem', color: '#4a5a7a', marginTop: '8px' }}>{nc.note}</div>
            )}
          </div>
        )}

        {onReset && (
          <button className="btn btn-secondary full-width mt-24" onClick={onReset} style={{ marginTop: '20px' }}>
            ↩ Analyze Another
          </button>
        )}
      </div>
    </>
  );
}
