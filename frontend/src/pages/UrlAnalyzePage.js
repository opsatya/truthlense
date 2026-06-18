import React, { useState } from 'react';
import { analyzeNewsUrl } from '../services/api';
import ResultCard from '../components/ResultCard';
import Loader from '../components/Loader';

const EXAMPLES = [
  'https://www.bbc.com/news/world-us-canada-68656485',
  'https://www.ndtv.com/india-news',
  'https://timesofindia.indiatimes.com/india',
];

export default function UrlAnalyzePage() {
  const [url,     setUrl]     = useState('');
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const isValid = (u) => { try { const p = new URL(u); return p.protocol === 'http:' || p.protocol === 'https:'; } catch { return false; } };

  const handleAnalyze = async () => {
    if (!isValid(url.trim())) { setError('Enter a valid URL starting with http:// or https://'); return; }
    setError(''); setLoading(true); setResult(null);
    try {
      const data = await analyzeNewsUrl(url.trim());
      setResult(data);
    } catch (e) {
      setError(e.message || 'Failed to fetch or analyze the URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setResult(null); setUrl(''); setError(''); };

  return (
    <div className="page-wrapper">
      <h1 className="page-title">Analyze News URL</h1>
      <p className="page-subtitle">Paste a news article URL — we fetch the full article and verify it live.</p>

      {!result && !loading && (
        <div className="card">
          <div className="form-group">
            <label className="form-label">News Article URL</label>
            <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
              <span style={{ position:'absolute', left:'14px', fontSize:'1rem' }}>🔗</span>
              <input
                type="url"
                className="form-input"
                style={{ paddingLeft:'38px' }}
                placeholder="https://www.example.com/news/article"
                value={url}
                onChange={(e) => { setUrl(e.target.value); if (error) setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              />
            </div>
          </div>
          {error && <div className="error-box">{error}</div>}
          <button className="btn btn-primary full-width" onClick={handleAnalyze} disabled={!url.trim()}>
            🔍 Fetch & Analyze Article
          </button>
          <div style={{ marginTop:'18px', borderTop:'1px solid #1e2d45', paddingTop:'16px' }}>
            <p style={{ fontSize:'.75rem', color:'#4a5a7a', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'10px' }}>Try an example</p>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {EXAMPLES.map((ex) => (
                <button key={ex} onClick={() => setUrl(ex)}
                  style={{ background:'rgba(255,255,255,.04)', border:'1px solid #1e2d45', color:'#8899bb', padding:'4px 12px', borderRadius:'100px', fontSize:'.75rem', cursor:'pointer', fontFamily:'DM Mono,monospace' }}>
                  {new URL(ex).hostname}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginTop:'20px', background:'rgba(6,182,212,.04)', border:'1px solid rgba(6,182,212,.15)', borderRadius:'12px', padding:'16px', fontSize:'.82rem', color:'#8899bb', lineHeight:1.8 }}>
            <strong style={{ color:'#e8f0fe' }}>How it works:</strong><br />
            1. Backend fetches the article from the URL<br />
            2. BeautifulSoup extracts the article body text<br />
            3. ML model analyzes the text<br />
            4. NewsAPI cross-checks against trusted sources<br />
            <span style={{ color:'#4a5a7a' }}>Note: Some sites block automated access — use Text Analyzer for those.</span>
          </div>
        </div>
      )}

      {loading && <Loader message="Fetching article + running live analysis..." />}
      {result && !loading && <ResultCard result={result} onReset={handleReset} />}
    </div>
  );
}
