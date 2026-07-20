import { useMemo, useState } from 'react';
import PortalShell from './PortalShell.jsx';
import { demoMembers } from '../data.js';
import { Modal } from './Modal.jsx';
import Chatbot from './Chatbot.jsx';

function StatusBadge({ children }) {
  const key = String(children).toLowerCase().replaceAll(' ', '-');
  return <span className={`status-badge status-badge--${key}`}>{children}</span>;
}

export default function AdminPortal({ onLogout }) {
  const [active, setActive] = useState('dashboard');
  const [members, setMembers] = useState(demoMembers);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All statuses');
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState('');

  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2600); };

  const filtered = useMemo(() => members.filter((member) => {
    const matchesQuery = `${member.name} ${member.email} ${member.id}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === 'All statuses' || member.status === status;
    return matchesQuery && matchesStatus;
  }), [members, query, status]);

  const setMemberStatus = (id, newStatus) => {
    setMembers((current) => current.map((member) => member.id === id ? { ...member, status: newStatus } : member));
    setSelected((current) => current?.id === id ? { ...current, status: newStatus } : current);
    notify(`Member status changed to ${newStatus}.`);
  };

  const pageMeta = ({
    dashboard: ['Operations dashboard', 'Monitor applications, renewals, assessments and document reviews.'],
    members: ['Member management', 'Search, review and update the complete TGA member register.'],
    reviews: ['Document review queue', 'Process pending documents and maintain a clear approval trail.'],
    assessments: ['Assessment management', 'Track completion, results, pass rates and assigned tests.'],
    payments: ['Payment management', 'Monitor PayFast transactions, renewals and outstanding balances.'],
  })[active];

  return (
    <PortalShell role="admin" active={active} setActive={setActive} onLogout={onLogout}>
      <div className="page-heading"><div><span className="eyebrow">Administrator portal</span><h1>{pageMeta[0]}</h1><p>{pageMeta[1]}</p></div><button className="button button--gold" onClick={() => notify('New member invitation created (demo).')}>+ Add member</button></div>

      {active === 'dashboard' && (
        <>
          <div className="metric-grid">
            <article className="metric-card"><div><span className="metric-icon">◎</span><small>Total members</small></div><strong>1,284</strong><p className="positive">↑ 4.8% this month</p></article>
            <article className="metric-card"><div><span className="metric-icon">◷</span><small>Pending applications</small></div><strong>37</strong><p>12 require action today</p></article>
            <article className="metric-card"><div><span className="metric-icon">▣</span><small>Documents to review</small></div><strong>54</strong><p>Oldest waiting: 2 days</p></article>
            <article className="metric-card"><div><span className="metric-icon">R</span><small>Payments this month</small></div><strong>R94,650</strong><p className="positive">↑ 7.2% vs last month</p></article>
          </div>

          <div className="dashboard-grid admin-dashboard-grid">
            <section className="panel panel--span-2">
              <header className="panel-header"><div><h2>Membership growth</h2><p>Active and pending members over the last six months.</p></div><select><option>Last 6 months</option></select></header>
              <div className="chart" aria-label="Membership growth bar chart">{[
                ['Feb', 48, 16], ['Mar', 57, 19], ['Apr', 64, 23], ['May', 72, 20], ['Jun', 81, 29], ['Jul', 94, 37],
              ].map(([month, activeValue, pendingValue]) => <div className="chart-column" key={month}><div className="chart-bars"><i style={{ height: `${activeValue}%` }}></i><b style={{ height: `${pendingValue}%` }}></b></div><span>{month}</span></div>)}</div>
              <div className="chart-legend"><span><i className="legend-active"></i>Active members</span><span><i className="legend-pending"></i>Pending applications</span></div>
            </section>

            <section className="panel"><header className="panel-header"><div><h2>Review queue</h2><p>Items requiring administrator action.</p></div></header><div className="queue-list"><button onClick={() => setActive('reviews')}><span className="queue-icon">▣</span><div><strong>Identity documents</strong><small>18 awaiting review</small></div><b>›</b></button><button onClick={() => setActive('reviews')}><span className="queue-icon">✓</span><div><strong>Compliance records</strong><small>26 awaiting review</small></div><b>›</b></button><button onClick={() => setActive('members')}><span className="queue-icon">◎</span><div><strong>New applications</strong><small>12 require a decision</small></div><b>›</b></button><button onClick={() => setActive('payments')}><span className="queue-icon">R</span><div><strong>Failed payments</strong><small>7 need follow-up</small></div><b>›</b></button></div></section>

            <section className="panel panel--span-3">
              <header className="panel-header"><div><h2>Recent applications</h2><p>Latest member records received.</p></div><button className="text-button" onClick={() => setActive('members')}>View all members</button></header>
              <MemberTable members={members.slice(0, 5)} onSelect={setSelected} />
            </section>
          </div>
        </>
      )}

      {active === 'members' && (
        <section className="panel">
          <div className="member-toolbar"><div className="search-box search-box--table">⌕ <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, email or member number" /></div><select value={status} onChange={(event) => setStatus(event.target.value)}><option>All statuses</option><option>Active</option><option>Pending review</option><option>Payment due</option></select><button className="button button--soft" onClick={() => notify('Member register export prepared (demo).')}>Export CSV</button></div>
          <MemberTable members={filtered} onSelect={setSelected} />
          <div className="table-footer"><span>Showing {filtered.length} of {members.length} prototype members</span><div><button disabled>←</button><button className="active">1</button><button disabled>→</button></div></div>
        </section>
      )}

      {active === 'reviews' && (
        <section className="panel">
          <header className="panel-header"><div><h2>Pending documents</h2><p>Review evidence before changing a member’s status.</p></div><select><option>Oldest first</option><option>Newest first</option></select></header>
          <div className="review-list">
            {[
              ['Megan Jacobs', 'TGA-2026-1047', 'Identity document', 'PDF · 1.4 MB', 'Submitted 2 hours ago'],
              ['Thandiwe Ncube', 'TGA-2026-1043', 'Proof of address', 'PDF · 0.9 MB', 'Submitted 5 hours ago'],
              ['Ryan Botha', 'TGA-2026-1039', 'Competency certificate', 'PDF · 2.3 MB', 'Submitted yesterday'],
            ].map(([name, id, type, file, date]) => <article key={id}><div className="review-person"><span>{name.split(' ').map((part) => part[0]).join('')}</span><div><strong>{name}</strong><small>{id}</small></div></div><div><strong>{type}</strong><small>{file}</small></div><time>{date}</time><div className="review-actions"><button onClick={() => notify(`${type} approved.`)}>Approve</button><button onClick={() => notify('Review note requested (demo).')}>Request changes</button><button className="icon-button">⋮</button></div></article>)}
          </div>
        </section>
      )}

      {active === 'assessments' && (
        <div className="metric-and-table"><div className="metric-grid metric-grid--three"><article className="metric-card"><small>Assigned this month</small><strong>116</strong><p>89 completed</p></article><article className="metric-card"><small>Average score</small><strong>86%</strong><p className="positive">↑ 3% improvement</p></article><article className="metric-card"><small>Pass rate</small><strong>91%</strong><p>8 members require a retake</p></article></div><section className="panel"><header className="panel-header"><div><h2>Assessment results</h2><p>Latest completed attempts.</p></div><button className="button button--soft" onClick={() => notify('Assessment assignment created (demo).')}>Assign test</button></header><div className="responsive-table"><table><thead><tr><th>Member</th><th>Assessment</th><th>Score</th><th>Completed</th><th>Status</th></tr></thead><tbody>{members.filter((member) => member.assessment === 'Passed').map((member, index) => <tr key={member.id}><td><strong>{member.name}</strong><small>{member.id}</small></td><td>Safety & Compliance Foundation</td><td>{[92, 84, 96, 88][index] || 88}%</td><td>{['19 Jul 2026', '18 Jul 2026', '17 Jul 2026'][index] || '16 Jul 2026'}</td><td><StatusBadge>Passed</StatusBadge></td></tr>)}</tbody></table></div></section></div>
      )}

      {active === 'payments' && (
        <div className="metric-and-table"><div className="metric-grid metric-grid--three"><article className="metric-card"><small>Successful payments</small><strong>R94,650</strong><p className="positive">126 transactions</p></article><article className="metric-card"><small>Outstanding</small><strong>R18,900</strong><p>31 member balances</p></article><article className="metric-card"><small>Failed / cancelled</small><strong>7</strong><p>Follow-up required</p></article></div><section className="panel"><header className="panel-header"><div><h2>Recent transactions</h2><p>PayFast payment events for the prototype.</p></div><button className="button button--soft" onClick={() => notify('Transaction export prepared (demo).')}>Export report</button></header><div className="responsive-table"><table><thead><tr><th>Reference</th><th>Member</th><th>Description</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead><tbody>{members.slice(0, 4).map((member, index) => <tr key={member.id}><td>TGA-PF-00{2841 - index}</td><td><strong>{member.name}</strong><small>{member.id}</small></td><td>{index === 3 ? 'Assessment fee' : `${member.plan} annual membership`}</td><td>{member.plan === 'Professional' ? 'R750.00' : 'R450.00'}</td><td>{18 - index} Jul 2026</td><td><StatusBadge>{index === 3 ? 'Failed' : 'Paid'}</StatusBadge></td></tr>)}</tbody></table></div></section></div>
      )}

      {selected && <Modal title="Member record" onClose={() => setSelected(null)}><div className="member-detail"><div className="member-detail-head"><span>{selected.name.split(' ').map((part) => part[0]).join('')}</span><div><h3>{selected.name}</h3><p>{selected.id} · {selected.email}</p></div></div><dl><div><dt>Membership plan</dt><dd>{selected.plan}</dd></div><div><dt>Status</dt><dd><StatusBadge>{selected.status}</StatusBadge></dd></div><div><dt>Expiry</dt><dd>{selected.expiry}</dd></div><div><dt>Documents</dt><dd>{selected.documents} uploaded</dd></div><div><dt>Assessment</dt><dd>{selected.assessment}</dd></div></dl><label>Update status<select value={selected.status} onChange={(event) => setMemberStatus(selected.id, event.target.value)}><option>Active</option><option>Pending review</option><option>Payment due</option><option>Suspended</option></select></label><button className="button button--dark button--block" onClick={() => notify('Member note added (demo).')}>Add administrator note</button></div></Modal>}

      <Chatbot />
      {toast && <div className="toast">✓ {toast}</div>}
    </PortalShell>
  );
}

function MemberTable({ members, onSelect }) {
  return <div className="responsive-table"><table><thead><tr><th>Member</th><th>Plan</th><th>Status</th><th>Documents</th><th>Assessment</th><th>Expiry</th><th></th></tr></thead><tbody>{members.map((member) => <tr key={member.id}><td><div className="table-person"><span>{member.name.split(' ').map((part) => part[0]).join('')}</span><div><strong>{member.name}</strong><small>{member.id}</small></div></div></td><td>{member.plan}</td><td><StatusBadge>{member.status}</StatusBadge></td><td>{member.documents} uploaded</td><td>{member.assessment}</td><td>{member.expiry}</td><td><button className="text-button" onClick={() => onSelect(member)}>Open</button></td></tr>)}</tbody></table></div>;
}
