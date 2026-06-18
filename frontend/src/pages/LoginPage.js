import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const css = `
.auth-wrapper{min-height:calc(100vh - 68px);display:flex;align-items:center;justify-content:center;padding:24px}
.auth-card{width:100%;max-width:420px;background:rgba(17,24,39,0.7);backdrop-filter:blur(24px);border:1px solid var(--border);border-radius:var(--radius-lg);padding:40px 36px 36px;box-shadow:var(--shadow);position:relative;overflow:hidden;animation:authFadeIn .5s ease}
.auth-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--gradient-btn);border-radius:var(--radius-lg) var(--radius-lg) 0 0}
@keyframes authFadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.auth-icon-wrap{width:56px;height:56px;border-radius:14px;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.2);display:flex;align-items:center;justify-content:center;margin:0 auto 24px}
.auth-title{font-size:1.5rem;font-weight:700;color:var(--text-primary);text-align:center;margin-bottom:6px;letter-spacing:-0.02em}
.auth-subtitle{font-size:0.9rem;color:var(--text-secondary);text-align:center;margin-bottom:28px;line-height:1.5}
.auth-form-group{margin-bottom:20px}
.auth-label{display:block;font-size:0.8rem;font-weight:600;color:var(--text-secondary);margin-bottom:8px;letter-spacing:0.06em;text-transform:uppercase}
.auth-input-wrap{position:relative}
.auth-input{width:100%;background:rgba(255,255,255,0.03);border:1.5px solid var(--border);border-radius:10px;color:var(--text-primary);font-family:var(--font-main);font-size:0.925rem;padding:12px 16px;transition:var(--transition);outline:none}
.auth-input:focus{border-color:var(--accent-blue);background:rgba(59,130,246,0.04);box-shadow:0 0 0 3px rgba(59,130,246,0.1)}
.auth-input::placeholder{color:var(--text-muted)}
.auth-input-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none}
.auth-input.has-icon{padding-left:42px}
.auth-toggle-pw{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--text-muted);cursor:pointer;padding:4px;display:flex;align-items:center;transition:color .2s}
.auth-toggle-pw:hover{color:var(--text-secondary)}
.auth-btn{width:100%;padding:13px 24px;border:none;border-radius:10px;background:var(--gradient-btn);color:#fff;font-family:var(--font-main);font-size:0.95rem;font-weight:600;cursor:pointer;transition:var(--transition);margin-top:8px;position:relative;overflow:hidden}
.auth-btn:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(59,130,246,0.35)}
.auth-btn:active{transform:translateY(0)}
.auth-btn:disabled{opacity:0.55;cursor:not-allowed;transform:none!important}
.auth-btn .btn-loader{width:18px;height:18px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:authSpin .6s linear infinite;display:inline-block;vertical-align:middle;margin-right:8px}
@keyframes authSpin{to{transform:rotate(360deg)}}
.auth-error{display:flex;align-items:center;gap:10px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);color:#f87171;border-radius:10px;padding:12px 16px;font-size:0.875rem;margin-bottom:20px;animation:authShake .4s ease}
@keyframes authShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-4px)}40%,80%{transform:translateX(4px)}}
.auth-divider{display:flex;align-items:center;gap:16px;margin:28px 0 24px;color:var(--text-muted);font-size:0.8rem;text-transform:uppercase;letter-spacing:0.08em}
.auth-divider::before,.auth-divider::after{content:'';flex:1;height:1px;background:var(--border)}
.auth-footer{text-align:center;font-size:0.9rem;color:var(--text-secondary)}
.auth-footer a{color:var(--accent-blue);text-decoration:none;font-weight:600;transition:color .2s}
.auth-footer a:hover{color:var(--accent-cyan)}
`;

const LockIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{color:'var(--accent-blue)'}}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const KeyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const res = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.access_token);
        navigate('/dashboard');
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (err) {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-icon-wrap">
            <LockIcon />
          </div>
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Log in to your TruthLens account to view your past analyses</p>

          {error && (
            <div className="auth-error">
              <AlertIcon />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="auth-form-group">
              <label className="auth-label" htmlFor="login-username">Username</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><UserIcon /></span>
                <input
                  id="login-username"
                  className="auth-input has-icon"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="auth-form-group">
              <label className="auth-label" htmlFor="login-password">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><KeyIcon /></span>
                <input
                  id="login-password"
                  className="auth-input has-icon"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  className="auth-toggle-pw"
                  onClick={() => setShowPw(!showPw)}
                  tabIndex={-1}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading && <span className="btn-loader" />}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="auth-divider">or</div>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </>
  );
}
