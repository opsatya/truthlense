import React, { useState, useEffect, useContext } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const css = `
.navbar{position:fixed;top:0;left:0;right:0;z-index:1000;height:68px;background:rgba(10,14,26,0.9);backdrop-filter:blur(16px);border-bottom:1px solid #1e2d45;transition:all .25s ease}
.navbar-scrolled{background:rgba(10,14,26,0.97);box-shadow:0 4px 24px rgba(0,0,0,0.4)}
.navbar-inner{max-width:1100px;margin:0 auto;height:100%;display:flex;align-items:center;justify-content:space-between;padding:0 24px}
.navbar-brand{display:flex;align-items:center;gap:10px;text-decoration:none;font-size:1.25rem;font-weight:800;color:#e8f0fe;letter-spacing:-.02em}
.brand-accent{color:#06b6d4}
.nav-links{display:flex;align-items:center;gap:4px;list-style:none}
.nav-link{color:#8899bb;text-decoration:none;font-size:.9rem;font-weight:500;padding:7px 14px;border-radius:8px;transition:all .25s ease}
.nav-link:hover{color:#e8f0fe;background:rgba(255,255,255,0.05)}
.nav-link.active{color:#3b82f6;background:rgba(59,130,246,0.1)}
.hamburger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:4px}
.hamburger span{display:block;width:24px;height:2px;background:#8899bb;border-radius:2px;transition:all .25s ease}
.hamburger-open span:nth-child(1){transform:rotate(45deg) translate(5px,5px)}
.hamburger-open span:nth-child(2){opacity:0}
.hamburger-open span:nth-child(3){transform:rotate(-45deg) translate(5px,-5px)}
@media(max-width:700px){
  .hamburger{display:flex}
  .nav-links{display:none;position:absolute;top:68px;left:0;right:0;background:rgba(10,14,26,0.98);flex-direction:column;padding:16px 24px 24px;gap:4px;border-bottom:1px solid #1e2d45}
  .nav-links.nav-open{display:flex}
  .nav-link{width:100%;padding:12px 16px;font-size:1rem}
}`;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { token, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    ['/', 'Home'],
    ['/analyze', 'Analyze Text'],
    ['/analyze-url', 'Analyze URL'],
    ['/dashboard', 'Dashboard']
  ];

  if (!token) {
    navItems.push(['/login', 'Login']);
  }

  useEffect(() => { setMenuOpen(false); }, [location]);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <>
      <style>{css}</style>
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-inner">
          <NavLink to="/" className="navbar-brand">
            🛡️ Truth<span className="brand-accent">Lens</span>
          </NavLink>
          <ul className={`nav-links ${menuOpen ? 'nav-open' : ''}`}>
            {navItems.map(([to, label]) => (
              <li key={to}>
                <NavLink to={to} end={to === '/'} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>{label}</NavLink>
              </li>
            ))}
            {token && (
              <li>
                <button onClick={handleLogout} className="nav-link" style={{background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit'}}>Logout</button>
              </li>
            )}
          </ul>
          <button className={`hamburger ${menuOpen ? 'hamburger-open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>
    </>
  );
}
