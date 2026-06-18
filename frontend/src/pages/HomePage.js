import React from 'react';
import { useNavigate } from 'react-router-dom';

const css = `
.home-page{min-height:100vh}
.hero-section{position:relative;overflow:hidden;min-height:calc(100vh - 68px);display:flex;align-items:center;justify-content:center;padding:60px 24px}
.hero-glow{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;opacity:.2}
.glow-1{width:500px;height:500px;background:radial-gradient(circle,#3b82f6,transparent 70%);top:-100px;right:-100px}
.glow-2{width:400px;height:400px;background:radial-gradient(circle,#06b6d4,transparent 70%);bottom:-80px;left:-80px}
.hero-content{position:relative;z-index:1;max-width:720px;text-align:center}
.hero-badge{display:inline-block;background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.3);color:#3b82f6;padding:6px 18px;border-radius:100px;font-size:.82rem;font-weight:600;letter-spacing:.05em;margin-bottom:24px}
.hero-title{font-size:clamp(2.4rem,6vw,4rem);font-weight:800;line-height:1.1;color:#e8f0fe;letter-spacing:-.03em;margin-bottom:20px}
.hero-hl{background:linear-gradient(135deg,#3b82f6,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero-sub{font-size:1.1rem;color:#8899bb;line-height:1.8;max-width:560px;margin:0 auto 36px}
.hero-actions{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-bottom:48px}
.h-btn{padding:14px 32px;font-size:1rem}
.hero-stats{display:flex;align-items:center;justify-content:center;gap:32px;flex-wrap:wrap}
.s-num{font-size:1.6rem;font-weight:800;font-family:'DM Mono',monospace;color:#06b6d4}
.s-lbl{font-size:.78rem;color:#4a5a7a;text-transform:uppercase;letter-spacing:.06em;margin-top:2px}
.s-div{width:1px;height:36px;background:#1e2d45}
.feat-section{padding:64px 0;border-top:1px solid #1e2d45}
.sect-title{font-size:1.8rem;font-weight:800;color:#e8f0fe;margin-bottom:8px;text-align:center}
.sect-sub{text-align:center;color:#8899bb;margin-bottom:40px}
.feat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}
.feat-card{background:#111827;border:1px solid #1e2d45;border-radius:20px;padding:24px;transition:all .25s ease}
.feat-card:hover{border-color:#2a4a7a;transform:translateY(-4px)}
.feat-icon{font-size:1.8rem;display:block;margin-bottom:14px}
.feat-title{font-size:1rem;font-weight:700;color:#e8f0fe;margin-bottom:8px}
.feat-desc{font-size:.88rem;color:#8899bb;line-height:1.65}
.home-footer{text-align:center;padding:28px 24px;border-top:1px solid #1e2d45;color:#4a5a7a;font-size:.85rem}`;

const features = [
  { icon: '🧠', title: 'ML Pattern Detection', desc: 'Logistic Regression trained on 44,000 real + fake articles detects writing patterns instantly.' },
  { icon: '📡', title: 'Live News Cross-Check', desc: 'Every claim is searched in real-time across trusted sources like BBC, Reuters, NDTV.' },
  { icon: '📊', title: 'Confidence Score', desc: 'Percentage-based confidence from the ML model — not just a label.' },
  { icon: '🔗', title: 'URL Analysis', desc: 'Paste any news article URL — we fetch and analyze the full article automatically.' },
  { icon: '💬', title: 'Sentiment Analysis', desc: 'VADER-powered sentiment: positive, neutral, negative, or highly negative.' },
  { icon: '📈', title: 'Live Dashboard', desc: 'Track every analysis in real-time with interactive Recharts visualizations.' },
];

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <>
      <style>{css}</style>
      <div className="home-page">
        <section className="hero-section">
          <div className="hero-glow glow-1" />
          <div className="hero-glow glow-2" />
          <div className="hero-content">
            <div className="hero-badge">🔬 MCA Final Year Project · SPPU</div>
            <h1 className="hero-title">Detect Fake News<span className="hero-hl"> with AI</span></h1>
            <p className="hero-sub">TruthLens combines Machine Learning pattern detection with live news cross-checking to verify any news article or claim in real time.</p>
            <div className="hero-actions">
              <button className="btn btn-primary h-btn" onClick={() => navigate('/analyze')}>📋 Analyze News Text</button>
              <button className="btn btn-secondary h-btn" onClick={() => navigate('/analyze-url')}>🔗 Analyze a URL</button>
            </div>
            <div className="hero-stats">
              {[['98%','Accuracy'],['< 2s','Response'],['2 Layers','Detection'],['Live','News Check']].map(([n,l],i,a) => (
                <React.Fragment key={l}>
                  <div style={{textAlign:'center'}}><div className="s-num">{n}</div><div className="s-lbl">{l}</div></div>
                  {i < a.length-1 && <div className="s-div" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>
        <section className="feat-section">
          <div className="page-wrapper">
            <h2 className="sect-title">What This System Does</h2>
            <p className="sect-sub">Two-layer detection: ML patterns + live news verification</p>
            <div className="feat-grid">
              {features.map(({ icon, title, desc }) => (
                <div className="feat-card" key={title}>
                  <span className="feat-icon">{icon}</span>
                  <h3 className="feat-title">{title}</h3>
                  <p className="feat-desc">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <footer className="home-footer">Built with React · FastAPI · Scikit-learn · NewsAPI · MCA Final Year Project 2025</footer>
      </div>
    </>
  );
}
