import { Brand } from './Brand.jsx';

export default function Login({ onLogin, onBack }) {
  const submit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') || '').trim().toLowerCase();
    const password = String(data.get('password') || '');
    const role = email.startsWith('admin') || password === 'admin123' ? 'admin' : 'member';
    onLogin(role);
  };

  return (
    <main className="auth-page">
      <button className="back-link" onClick={onBack}>← Back to website</button>
      <section className="auth-panel">
        <div className="auth-brand"><Brand /><span className="demo-pill">Interactive prototype</span></div>
        <div className="auth-copy">
          <span className="eyebrow">Secure portal</span>
          <h1>Welcome back</h1>
          <p>Sign in to manage membership, documents, assessments and payments.</p>
        </div>
        <form onSubmit={submit} className="auth-form">
          <label>Email address<input name="email" type="email" defaultValue="member@tga.co.za" required /></label>
          <label>Password<input name="password" type="password" defaultValue="demo123" required /></label>
          <div className="form-row"><label className="check-label"><input type="checkbox" /> Remember me</label><button type="button" className="text-button">Forgot password?</button></div>
          <button className="button button--gold button--block" type="submit">Sign in</button>
        </form>
        <div className="demo-credentials">
          <strong>Demo access</strong>
          <button onClick={() => onLogin('member')}><span>Member portal</span><code>member@tga.co.za / demo123</code></button>
          <button onClick={() => onLogin('admin')}><span>Admin portal</span><code>admin@tga.co.za / admin123</code></button>
        </div>
        <small className="security-note">This prototype uses demonstration credentials only. No real authentication or personal data is processed.</small>
      </section>
      <aside className="auth-aside">
        <div className="auth-quote"><span>“</span><h2>Membership administration without the paperwork bottleneck.</h2><p>Applications, documents, tests and renewals in one clear workflow.</p></div>
      </aside>
    </main>
  );
}
