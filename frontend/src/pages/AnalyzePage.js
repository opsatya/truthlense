import React, { useState } from 'react';
import { analyzeNewsText } from '../services/api';
import ResultCard from '../components/ResultCard';
import Loader from '../components/Loader';

const SAMPLE = `Scientists claim to have developed a revolutionary new energy source that produces more power than it consumes using a simple water-based nano-catalyst. The technology, tested exclusively in a private laboratory, reportedly violates known laws of thermodynamics. Unnamed government officials have already expressed interest, though no peer-reviewed research has been published. Several social media influencers are calling it "the invention of the century" while mainstream scientists remain completely silent.`;

export default function AnalyzePage() {
  const [text,    setText]    = useState('');
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const MIN = 100;

  const handleAnalyze = async () => {
    if (text.trim().length < MIN) { setError(`Enter at least ${MIN} characters.`); return; }
    setError(''); setLoading(true); setResult(null);
    try {
      const data = await analyzeNewsText(text);
      setResult(data);
    } catch (e) {
      setError(e.message || 'Analysis failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setResult(null); setText(''); setError(''); };

  return (
    <div className="page-wrapper">
      <h1 className="page-title">Analyze News Text</h1>
      <p className="page-subtitle">Paste any news article. The AI checks writing patterns AND searches live news sources.</p>

      {!result && !loading && (
        <div className="card">
          <div className="form-group">
            <label className="form-label">News Article Text</label>
            <textarea
              className="form-textarea"
              placeholder="Paste the full news article text here..."
              value={text}
              rows={10}
              onChange={(e) => { setText(e.target.value); if (error) setError(''); }}
            />
            <div style={{ textAlign:'right', fontSize:'.78rem', marginTop:'5px', color: text.length >= MIN ? '#10b981' : '#f59e0b' }}>
              {text.length} characters {text.length < MIN && text.length > 0 && `(min ${MIN} required)`}
            </div>
          </div>
          {error && <div className="error-box">{error}</div>}
          <button className="btn btn-primary full-width" onClick={handleAnalyze} disabled={text.trim().length < MIN}>
            🔍 Analyze for Fake News
          </button>
          <button className="btn btn-secondary full-width mt-16" onClick={() => setText(SAMPLE)}>
            📄 Load Sample Article
          </button>
        </div>
      )}

      {loading && <Loader message="Analyzing + checking live news sources..." />}
      {result && !loading && <ResultCard result={result} onReset={handleReset} />}

      {!result && !loading && (
        <div className="card mt-24" style={{ background:'rgba(59,130,246,.04)', borderColor:'rgba(59,130,246,.2)' }}>
          <h4 style={{ fontSize:'.88rem', fontWeight:700, color:'#e8f0fe', marginBottom:'10px' }}>💡 Tips</h4>
          <div style={{ fontSize:'.82rem', color:'#8899bb', lineHeight:1.8 }}>
            → Include the full article body, not just the headline<br />
            → 300+ word articles give more accurate results<br />
            → Add your NewsAPI key in <code style={{color:'#06b6d4'}}>backend/ml/news_checker.py</code> for live verification
          </div>
        </div>
      )}
    </div>
  );
}
