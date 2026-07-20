import { Brand } from './Brand.jsx';

const features = [
  {
    icon: '◎',
    title: 'Member management',
    text: 'Profiles, subscriptions, membership status, renewal dates, and a complete administrator view.',
  },
  {
    icon: '✓',
    title: 'Online assessments',
    text: 'Structured testing, automatic scoring, attempt history, and administrator review workflows.',
  },
  {
    icon: '▣',
    title: 'Secure documents',
    text: 'Guided uploads, expiry tracking, review states, and downloadable member records.',
  },
  {
    icon: 'R',
    title: 'PayFast payments',
    text: 'Membership fees, renewals, courses, receipts, and future recurring-payment support.',
  },
  {
    icon: '✦',
    title: 'Digital assistance',
    text: 'A member support chatbot with handover to qualified consultants for complex questions.',
  },
  {
    icon: '⌁',
    title: 'Audit-ready activity',
    text: 'Status history, approvals, test results, uploads, and payment events in one place.',
  },
];

const tiers = [
  {
    name: 'Standard',
    price: 'R450',
    note: 'per year',
    bullets: ['Digital member profile', 'Document management', 'Core assessment access'],
  },
  {
    name: 'Professional',
    price: 'R750',
    note: 'per year',
    featured: true,
    bullets: ['Everything in Standard', 'Priority document review', 'Consulting request access'],
  },
];

export default function PublicSite({ onLogin, onApply }) {
  return (
    <div className="public-site">
      <header className="public-nav shell">
        <Brand />
        <nav aria-label="Main navigation">
          <a href="#features">Platform</a>
          <a href="#process">How it works</a>
          <a href="#membership">Membership</a>
        </nav>
        <div className="nav-actions">
          <button className="button button--ghost" onClick={onLogin}>Member login</button>
          <button className="button button--gold" onClick={onApply}>Apply now</button>
        </div>
      </header>

      <main>
        <section className="hero shell">
          <div className="hero-copy">
            <span className="eyebrow">A modern association platform</span>
            <h1>One trusted place for membership, compliance and support.</h1>
            <p>
              A streamlined digital experience for TGA members and administrators—from application and assessment through to document review and annual renewal.
            </p>
            <div className="hero-actions">
              <button className="button button--gold button--large" onClick={onApply}>Start an application</button>
              <button className="button button--dark button--large" onClick={onLogin}>Open demo portal</button>
            </div>
            <div className="trust-row">
              <span>✓ Role-based access</span>
              <span>✓ Mobile ready</span>
              <span>✓ POPIA-minded architecture</span>
            </div>
          </div>

          <div className="hero-panel" aria-label="Portal preview">
            <div className="preview-topbar">
              <div className="preview-dots"><i></i><i></i><i></i></div>
              <span>member.tga.co.za</span>
            </div>
            <div className="preview-layout">
              <aside>
                <div className="mini-mark">TGA</div>
                <span className="active">Overview</span>
                <span>Documents</span>
                <span>Assessments</span>
                <span>Payments</span>
              </aside>
              <div className="preview-content">
                <div className="welcome-line"><div><small>Welcome back</small><strong>Member dashboard</strong></div><b>Active</b></div>
                <div className="preview-cards"><div><small>Member number</small><strong>TGA-2026-1048</strong></div><div><small>Profile complete</small><strong>92%</strong></div></div>
                <div className="preview-progress"><span></span></div>
                <div className="preview-task"><i>✓</i><div><strong>Assessment passed</strong><small>Safety & compliance foundation</small></div></div>
                <div className="preview-task"><i>2</i><div><strong>Documents under review</strong><small>Estimated turnaround: 2 business days</small></div></div>
              </div>
            </div>
          </div>
        </section>

        <section className="proof-strip">
          <div className="shell proof-grid">
            <div><strong>24/7</strong><span>Self-service access</span></div>
            <div><strong>1</strong><span>Unified member record</span></div>
            <div><strong>100%</strong><span>Digital application path</span></div>
            <div><strong>Real-time</strong><span>Status visibility</span></div>
          </div>
        </section>

        <section className="section shell" id="features">
          <div className="section-heading">
            <span className="eyebrow">Core platform</span>
            <h2>Everything required for the first TGA release</h2>
            <p>Designed as a practical MVP that can grow into a full association CRM.</p>
          </div>
          <div className="feature-grid">
            {features.map((feature) => (
              <article className="feature-card" key={feature.title}>
                <span className="feature-icon">{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section--tint" id="process">
          <div className="shell split-section">
            <div className="section-heading section-heading--left">
              <span className="eyebrow">Member journey</span>
              <h2>Clear steps, visible progress</h2>
              <p>Members know exactly what is complete, what is outstanding, and who is reviewing their application.</p>
            </div>
            <div className="steps">
              {[
                ['01', 'Create an account', 'Capture contact details and choose a membership path.'],
                ['02', 'Upload documents', 'Submit required identity and compliance records.'],
                ['03', 'Complete assessments', 'Take assigned online tests and view results.'],
                ['04', 'Pay and activate', 'Complete a secure payment and receive confirmation.'],
              ].map(([number, title, text]) => (
                <div className="step" key={number}>
                  <span>{number}</span><div><h3>{title}</h3><p>{text}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section shell" id="membership">
          <div className="section-heading">
            <span className="eyebrow">Illustrative pricing</span>
            <h2>Simple membership options</h2>
            <p>Prices are placeholders for the prototype and can be changed in the production CMS.</p>
          </div>
          <div className="pricing-grid">
            {tiers.map((tier) => (
              <article className={`price-card ${tier.featured ? 'price-card--featured' : ''}`} key={tier.name}>
                {tier.featured && <span className="price-badge">Recommended</span>}
                <h3>{tier.name}</h3>
                <div className="price"><strong>{tier.price}</strong><span>{tier.note}</span></div>
                <ul>{tier.bullets.map((bullet) => <li key={bullet}>✓ {bullet}</li>)}</ul>
                <button className={`button ${tier.featured ? 'button--gold' : 'button--dark'}`} onClick={onApply}>Choose {tier.name}</button>
              </article>
            ))}
          </div>
        </section>

        <section className="cta-section">
          <div className="shell cta-inner">
            <div><span className="eyebrow eyebrow--light">Ready for review</span><h2>Explore the working portal prototype.</h2></div>
            <button className="button button--gold button--large" onClick={onLogin}>View member and admin demos</button>
          </div>
        </section>
      </main>

      <footer className="public-footer">
        <div className="shell footer-grid">
          <Brand compact />
          <p>Prototype for architecture and stakeholder review. Not a live membership or payment system.</p>
          <span>© 2026 The Gun Association</span>
        </div>
      </footer>
    </div>
  );
}
