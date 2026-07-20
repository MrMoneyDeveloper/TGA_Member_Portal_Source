import { useEffect, useState } from 'react';
import PublicSite from './components/PublicSite.jsx';
import Login from './components/Login.jsx';
import MemberPortal from './components/MemberPortal.jsx';
import AdminPortal from './components/AdminPortal.jsx';
import { Modal } from './components/Modal.jsx';

export default function App() {
  const [screen, setScreen] = useState('public');
  const [applyOpen, setApplyOpen] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [screen]);

  const login = (role) => setScreen(role === 'admin' ? 'admin' : 'member');
  const logout = () => setScreen('public');

  return (
    <>
      {screen === 'public' && <PublicSite onLogin={() => setScreen('login')} onApply={() => setApplyOpen(true)} />}
      {screen === 'login' && <Login onLogin={login} onBack={() => setScreen('public')} />}
      {screen === 'member' && <MemberPortal onLogout={logout} />}
      {screen === 'admin' && <AdminPortal onLogout={logout} />}

      {applyOpen && <Modal title={applicationSubmitted ? 'Application received' : 'Start a TGA application'} onClose={() => { setApplyOpen(false); setApplicationSubmitted(false); }}>
        {applicationSubmitted ? <div className="success-state"><span>✓</span><h3>Thank you</h3><p>Your prototype application reference is <strong>TGA-APP-2026-0719</strong>.</p><button className="button button--gold button--block" onClick={() => { setApplyOpen(false); setApplicationSubmitted(false); setScreen('login'); }}>Continue to demo login</button></div> : <form className="modal-form" onSubmit={(event) => { event.preventDefault(); setApplicationSubmitted(true); }}><div className="two-column"><label>First name<input required /></label><label>Last name<input required /></label></div><label>Email address<input type="email" required /></label><label>Mobile number<input type="tel" required /></label><label>Membership interest<select><option>Standard membership</option><option>Professional membership</option><option>I need advice first</option></select></label><label className="check-label"><input type="checkbox" required /> I agree to the prototype privacy notice and consent to being contacted.</label><button className="button button--gold button--block">Create application</button><small>No information is transmitted or stored by this demonstration form.</small></form>}
      </Modal>}
    </>
  );
}
