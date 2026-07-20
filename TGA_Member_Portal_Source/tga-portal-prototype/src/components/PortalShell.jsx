import { Brand } from './Brand.jsx';

export default function PortalShell({ role, active, setActive, onLogout, children }) {
  const memberItems = [
    ['overview', '▦', 'Overview'],
    ['documents', '▣', 'Documents'],
    ['assessments', '✓', 'Assessments'],
    ['payments', 'R', 'Payments'],
    ['profile', '○', 'My profile'],
  ];
  const adminItems = [
    ['dashboard', '▦', 'Dashboard'],
    ['members', '◎', 'Members'],
    ['reviews', '▣', 'Document reviews'],
    ['assessments', '✓', 'Assessments'],
    ['payments', 'R', 'Payments'],
  ];
  const items = role === 'admin' ? adminItems : memberItems;

  return (
    <div className="portal-shell">
      <aside className="portal-sidebar">
        <Brand compact />
        <span className="portal-role">{role === 'admin' ? 'Administrator portal' : 'Member portal'}</span>
        <nav>{items.map(([key, icon, label]) => <button key={key} className={active === key ? 'active' : ''} onClick={() => setActive(key)}><i>{icon}</i>{label}</button>)}</nav>
        <div className="sidebar-help"><span>Need help?</span><p>Use the TGA Assistant or contact the support team.</p><button onClick={() => window.alert('Demo support request created.')}>Contact support</button></div>
        <button className="logout-button" onClick={onLogout}>↪ Sign out</button>
      </aside>
      <div className="portal-main">
        <header className="portal-topbar">
          <div className="portal-mobile-brand"><Brand compact /></div>
          <div className="search-box">⌕ <input placeholder={role === 'admin' ? 'Search members or records' : 'Search your portal'} /></div>
          <div className="topbar-actions"><button className="notification-button">♢<i></i></button><div className="user-chip"><span>{role === 'admin' ? 'TK' : 'AD'}</span><div><strong>{role === 'admin' ? 'Titus Kalideen' : 'Anele Dlamini'}</strong><small>{role === 'admin' ? 'System administrator' : 'TGA-2026-1048'}</small></div></div></div>
        </header>
        <div className="portal-content">{children}</div>
      </div>
    </div>
  );
}
