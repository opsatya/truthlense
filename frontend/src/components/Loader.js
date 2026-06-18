import React from 'react';

const css = `
.loader-wrapper{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:16px}
.spinner{position:relative;width:72px;height:72px}
.ring{position:absolute;border-radius:50%;border:2px solid transparent;animation:spin linear infinite}
.ring-1{inset:0;border-top-color:#3b82f6;animation-duration:1s}
.ring-2{inset:10px;border-top-color:#06b6d4;animation-duration:1.5s;animation-direction:reverse}
.ring-3{inset:20px;border-top-color:#8b5cf6;animation-duration:2s}
.scanner-dot{position:absolute;top:50%;left:50%;width:10px;height:10px;background:#3b82f6;border-radius:50%;transform:translate(-50%,-50%);animation:pulse 1.2s ease-in-out infinite;box-shadow:0 0 12px #3b82f6}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:1}50%{transform:translate(-50%,-50%) scale(1.4);opacity:.6}}
.loader-message{font-size:1rem;font-weight:600;color:#e8f0fe}
.loader-sub{font-size:.85rem;color:#4a5a7a}`;

export default function Loader({ message = 'Analyzing...' }) {
  return (
    <>
      <style>{css}</style>
      <div className="loader-wrapper">
        <div className="spinner">
          <div className="ring ring-1" />
          <div className="ring ring-2" />
          <div className="ring ring-3" />
          <div className="scanner-dot" />
        </div>
        <p className="loader-message">{message}</p>
        <p className="loader-sub">AI is processing your request...</p>
      </div>
    </>
  );
}
