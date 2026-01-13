import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Home, Zap, ShoppingBag, Settings, User } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Updates from './pages/Updates';
import Store from './pages/Store';

function App() {
  return (
    <Router>
      <div className="app-shell" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        {/* Sidebar */}
        <nav className="glass-panel" style={{
          width: '240px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          borderRight: '1px solid var(--glass-border)',
          position: 'fixed',
          height: '100vh',
          zIndex: 10
        }}>
          <div className="brand" style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '-1px' }}>
              MY <span style={{ color: 'var(--accent-primary)' }}>KEMET</span>
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <NavLinkItem to="/" icon={<Home size={20} />} label="Tableau de bord" />
            <NavLinkItem to="/updates" icon={<Zap size={20} />} label="Mises à jour" />
            <NavLinkItem to="/store" icon={<ShoppingBag size={20} />} label="Kemet Store" />
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <NavLinkItem to="/profile" icon={<User size={20} />} label="Profil" />
            <NavLinkItem to="/settings" icon={<Settings size={20} />} label="Réglages" />
          </div>
        </nav>

        {/* Main Content */}
        <main style={{ marginLeft: '240px', flex: 1, padding: '32px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/updates" element={<Updates />} />
            <Route path="/store" element={<Store />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

const NavLinkItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    style={({ isActive }) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: 'var(--radius-sm)',
      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
      background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
      textDecoration: 'none',
      transition: 'all 0.2s ease',
      fontSize: '14px',
      fontWeight: 500
    })}
  >
    {icon}
    {label}
  </NavLink>
);

export default App;
