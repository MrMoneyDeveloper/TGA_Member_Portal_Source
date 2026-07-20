import { useMemo, useState } from 'react';
import PortalShell from './PortalShell.jsx';
import { Modal } from './Modal.jsx';
import Chatbot from './Chatbot.jsx';
import { assessmentQuestions } from '../data.js';

const initialDocuments = [
  { id: 1, name: 'Identity document.pdf', type: 'Identity', date: '18 Jul 2026', status: 'Approved', size: '1.2 MB' },
  { id: 2, name: 'Proof of address.pdf', type: 'Address', date: '18 Jul 2026', status: 'Approved', size: '0.8 MB' },
  { id: 3, name: 'Competency certificate.pdf', type: 'Compliance', date: '19 Jul 2026', status: 'In review', size: '2.1 MB' },
  { id: 4, name: 'Profile photograph.jpg', type: 'Profile', date: '19 Jul 2026', status: 'Approved', size: '0.5 MB' },
];

function StatusBadge({ children }) {
  const key = String(children).toLowerCase().replaceAll(' ', '-');
  return <span className={`status-badge status-badge--${key}`}>{children}</span>;
}

export default function MemberPortal({ onLogout }) {
  const [active, setActive] = useState('overview');
  const [documents, setDocuments] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tga-documents')) || initialDocuments; } catch { return initialDocuments; }
  });
  const [uploadOpen, setUploadOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [answers, setAnswers] = useState({});
  const [testResult, setTestResult] = useState(() => Number(localStorage.getItem('tga-test-result')) || null);
  const [toast, setToast] = useState('');

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const uploadDocument = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const file = data.get('file');
    const type = String(data.get('type'));
    if (!(file instanceof File) || !file.name) return;
    if (file.size > 5 * 1024 * 1024) { notify('File must be smaller than 5 MB.'); return; }
    const newDocument = {
      id: Date.now(),
      name: file.name,
      type,
      date: new Intl.DateTimeFormat('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()),
      status: 'In review',
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
    };
    const next = [newDocument, ...documents];
    setDocuments(next);
    localStorage.setItem('tga-documents', JSON.stringify(next));
    setUploadOpen(false);
    notify('Document submitted for review.');
  };

  const submitTest = () => {
    if (Object.keys(answers).length !== assessmentQuestions.length) { notify('Please answer every question.'); return; }
    const score = assessmentQuestions.reduce((total, item, index) => total + (Number(answers[index]) === item.answer ? 1 : 0), 0);
    const percentage = Math.round((score / assessmentQuestions.length) * 100);
    setTestResult(percentage);
    localStorage.setItem('tga-test-result', String(percentage));
    setTestOpen(false);
    notify(`Assessment submitted: ${percentage}%`);
  };

  const pageMeta = useMemo(() => ({
    overview: ['Good evening, Anele', 'Here is your current membership and compliance status.'],
    documents: ['Your documents', 'Upload and track documents required for your membership.'],
    assessments: ['Assessments', 'Complete assigned tests and view your latest result.'],
    payments: ['Payments and renewals', 'Manage your membership fee and download receipts.'],
    profile: ['My profile', 'Keep your details current and review communication preferences.'],
  })[active], [active]);

  return (
    <PortalShell role="member" active={active} setActive={setActive} onLogout={onLogout}>
      <div className="page-heading"><div><span className="eyebrow">Member portal</span><h1>{pageMeta[0]}</h1><p>{pageMeta[1]}</p></div><button className="button button--gold" onClick={() => active === 'documents' ? setUploadOpen(true) : active === 'payments' ? setPaymentOpen(true) : setActive('documents')}>{active === 'documents' ? '+ Upload document' : active === 'payments' ? 'Pay now' : 'Complete next step'}</button></div>

      {active === 'overview' && (
        <>
          <div className="metric-grid metric-grid--member">
            <article className="metric-card"><div><span className="metric-icon">◎</span><small>Membership status</small></div><strong>Active</strong><p>Valid until 31 July 2027</p></article>
            <article className="metric-card"><div><span className="metric-icon">◔</span><small>Profile completion</small></div><strong>92%</strong><div className="progress"><span style={{ width: '92%' }}></span></div></article>
            <article className="metric-card"><div><span className="metric-icon">▣</span><small>Documents</small></div><strong>{documents.filter((item) => item.status === 'Approved').length}/{documents.length}</strong><p>{documents.filter((item) => item.status === 'In review').length} currently in review</p></article>
            <article className="metric-card"><div><span className="metric-icon">✓</span><small>Assessment result</small></div><strong>{testResult ? `${testResult}%` : 'Not started'}</strong><p>{testResult >= 80 ? 'Requirement completed' : 'Pass mark: 80%'}</p></article>
          </div>

          <div className="dashboard-grid">
            <section className="panel panel--span-2">
              <header className="panel-header"><div><h2>Your progress</h2><p>Complete these steps to keep your profile in good standing.</p></div><span>3 of 4 complete</span></header>
              <div className="journey-list">
                <div className="journey-item complete"><i>✓</i><div><strong>Account and personal details</strong><p>Profile verified on 18 July 2026</p></div><span>Complete</span></div>
                <div className="journey-item complete"><i>✓</i><div><strong>Membership payment</strong><p>Professional annual membership</p></div><span>Complete</span></div>
                <div className="journey-item complete"><i>✓</i><div><strong>Required assessment</strong><p>{testResult ? `Latest result: ${testResult}%` : 'Foundation assessment assigned'}</p></div><button onClick={() => setTestOpen(true)}>{testResult ? 'Retake' : 'Start'}</button></div>
                <div className="journey-item current"><i>4</i><div><strong>Document verification</strong><p>One compliance document is being reviewed</p></div><button onClick={() => setActive('documents')}>View</button></div>
              </div>
            </section>

            <section className="panel membership-card">
              <span className="membership-label">Digital membership card</span>
              <div className="member-card-visual"><div className="member-card-logo">TGA</div><span>PROFESSIONAL MEMBER</span><h3>Anele Dlamini</h3><p>TGA-2026-1048</p><div><small>Valid until</small><strong>31 JUL 2027</strong></div></div>
              <button className="button button--soft button--block" onClick={() => notify('Digital card download prepared (demo).')}>Download membership card</button>
            </section>

            <section className="panel panel--span-2">
              <header className="panel-header"><div><h2>Recent activity</h2><p>Updates to your member record.</p></div><button className="text-button">View all</button></header>
              <div className="activity-list">
                <div><i>▣</i><p><strong>Competency certificate submitted</strong><span>Document is awaiting administrator review</span></p><time>19 Jul</time></div>
                <div><i>✓</i><p><strong>Profile photograph approved</strong><span>Approved automatically after format checks</span></p><time>19 Jul</time></div>
                <div><i>R</i><p><strong>Membership payment received</strong><span>Receipt TGA-PF-002841 generated</span></p><time>18 Jul</time></div>
              </div>
            </section>

            <section className="panel contact-panel"><h2>Need professional assistance?</h2><p>Request help from the consulting team for case-specific questions.</p><button className="button button--dark button--block" onClick={() => notify('Consulting request sent (demo).')}>Request a consultation</button></section>
          </div>
        </>
      )}

      {active === 'documents' && (
        <section className="panel">
          <header className="panel-header"><div><h2>Document register</h2><p>Prototype uploads store file metadata in your browser only.</p></div><div className="table-tools"><select><option>All types</option><option>Identity</option><option>Compliance</option></select><select><option>All statuses</option><option>Approved</option><option>In review</option></select></div></header>
          <div className="document-grid">
            {documents.map((document) => <article className="document-card" key={document.id}><span className="file-icon">PDF</span><div><h3>{document.name}</h3><p>{document.type} · {document.size}</p><small>Submitted {document.date}</small></div><StatusBadge>{document.status}</StatusBadge><button className="icon-button" aria-label="Document options">⋮</button></article>)}
          </div>
          <button className="upload-dropzone" onClick={() => setUploadOpen(true)}><strong>＋ Upload another document</strong><span>PDF, JPG or PNG up to 5 MB</span></button>
        </section>
      )}

      {active === 'assessments' && (
        <div className="assessment-layout">
          <section className="panel assessment-feature"><span className="assessment-tag">Required</span><h2>Safety & Compliance Foundation</h2><p>A short knowledge check covering safe handling principles, document compliance, and escalation to authorised professionals.</p><div className="assessment-meta"><span>5 questions</span><span>10 minutes</span><span>80% pass mark</span></div><button className="button button--gold" onClick={() => { setAnswers({}); setTestOpen(true); }}>{testResult ? 'Retake assessment' : 'Start assessment'}</button></section>
          <section className="panel result-panel"><span>Latest result</span><strong>{testResult ? `${testResult}%` : '—'}</strong><StatusBadge>{testResult >= 80 ? 'Passed' : testResult ? 'Not passed' : 'Not started'}</StatusBadge><p>{testResult >= 80 ? 'Your requirement is complete.' : 'Complete the assessment to progress.'}</p></section>
        </div>
      )}

      {active === 'payments' && (
        <div className="payment-layout">
          <section className="panel invoice-card"><header><div><span>Annual membership</span><h2>Professional membership</h2></div><StatusBadge>Payment due</StatusBadge></header><div className="invoice-total"><small>Renewal amount</small><strong>R750.00</strong><span>Due 31 July 2027</span></div><button className="button button--gold button--block" onClick={() => setPaymentOpen(true)}>Pay securely with PayFast</button><p className="fine-print">Demo checkout only. No payment information is collected.</p></section>
          <section className="panel panel--span-2"><header className="panel-header"><div><h2>Payment history</h2><p>Receipts and transaction status.</p></div></header><div className="responsive-table"><table><thead><tr><th>Reference</th><th>Description</th><th>Date</th><th>Amount</th><th>Status</th><th></th></tr></thead><tbody><tr><td>TGA-PF-002841</td><td>Professional annual membership</td><td>18 Jul 2026</td><td>R750.00</td><td><StatusBadge>Paid</StatusBadge></td><td><button className="text-button" onClick={() => notify('Receipt download prepared (demo).')}>Receipt</button></td></tr><tr><td>TGA-PF-001902</td><td>Online assessment fee</td><td>04 Aug 2025</td><td>R150.00</td><td><StatusBadge>Paid</StatusBadge></td><td><button className="text-button">Receipt</button></td></tr></tbody></table></div></section>
        </div>
      )}

      {active === 'profile' && (
        <section className="panel profile-panel"><div className="profile-avatar">AD</div><div><h2>Anele Dlamini</h2><p>Professional member · TGA-2026-1048</p></div><form className="profile-form" onSubmit={(event) => { event.preventDefault(); notify('Profile changes saved.'); }}><label>First name<input defaultValue="Anele" /></label><label>Last name<input defaultValue="Dlamini" /></label><label>Email address<input defaultValue="anele.dlamini@example.com" /></label><label>Mobile number<input defaultValue="+27 82 555 0148" /></label><label className="full-width">Residential address<input defaultValue="12 Example Road, Durban, KwaZulu-Natal" /></label><label className="check-label full-width"><input type="checkbox" defaultChecked /> Receive membership and compliance reminders by email</label><div className="full-width"><button className="button button--gold">Save changes</button></div></form></section>
      )}

      {uploadOpen && <Modal title="Upload a document" onClose={() => setUploadOpen(false)}><form className="modal-form" onSubmit={uploadDocument}><label>Document type<select name="type" required><option>Identity</option><option>Address</option><option>Compliance</option><option>Profile</option><option>Other</option></select></label><label className="file-picker"><input name="file" type="file" accept=".pdf,.jpg,.jpeg,.png" required /><strong>Select a file</strong><span>PDF, JPG or PNG up to 5 MB</span></label><div className="notice-box">For the production system, files must be encrypted, malware-scanned, access-controlled, and stored outside the public web root.</div><button className="button button--gold button--block">Submit for review</button></form></Modal>}

      {paymentOpen && <Modal title="PayFast checkout preview" onClose={() => setPaymentOpen(false)}><div className="checkout-summary"><div><span>Professional annual membership</span><strong>R750.00</strong></div><p>You would be redirected to PayFast’s secure payment page in the production build.</p><div className="payfast-box"><strong>payfast</strong><span>Secure payment gateway</span></div><button className="button button--gold button--block" onClick={() => { setPaymentOpen(false); notify('Demo payment completed successfully.'); }}>Simulate successful payment</button><small>No card or banking details are requested in this prototype.</small></div></Modal>}

      {testOpen && <Modal title="Safety & Compliance Foundation" wide onClose={() => setTestOpen(false)}><div className="test-header"><span>5 questions</span><span>Pass mark: 80%</span></div><div className="question-list">{assessmentQuestions.map((item, index) => <fieldset key={item.question}><legend><span>{index + 1}</span>{item.question}</legend>{item.options.map((option, optionIndex) => <label key={option}><input type="radio" name={`question-${index}`} checked={Number(answers[index]) === optionIndex} onChange={() => setAnswers((current) => ({ ...current, [index]: optionIndex }))} />{option}</label>)}</fieldset>)}</div><button className="button button--gold button--block" onClick={submitTest}>Submit assessment</button></Modal>}

      <Chatbot />
      {toast && <div className="toast">✓ {toast}</div>}
    </PortalShell>
  );
}
