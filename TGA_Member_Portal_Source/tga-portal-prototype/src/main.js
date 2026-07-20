import 'iconify-icon';
import './styles.css';
import {
  aboutPillars,
  assessmentQuestions,
  benefits,
  contactPlaceholders,
  demoMembers,
  faqs,
  initialDocuments,
  platformFeatures,
  reviews
} from './data.js';
import { destroyPublicEffects, flipCard, initialisePublicEffects, transitionChapter } from './effects.js';

const app = document.querySelector('#app');
const siteDialog = document.querySelector('#site-dialog');
const siteDialogTitle = document.querySelector('#site-dialog-title');
const siteDialogContent = document.querySelector('#site-dialog-content');
const noticeDialog = document.querySelector('#notice-dialog');
const noticeDialogTitle = document.querySelector('#notice-dialog-title');
const noticeDialogContent = document.querySelector('#notice-dialog-content');
const toastRegion = document.querySelector('#toast-region');

const state = {
  screen: 'public',
  role: 'member',
  active: 'overview',
  chapter: 'chapter-one',
  testResult: Number(localStorage.getItem('tga-test-result')) || null,
  members: structuredClone(demoMembers),
  documents: loadDocuments(),
  memberQuery: '',
  memberStatus: 'All statuses'
};

function loadDocuments() {
  try {
    const stored = JSON.parse(localStorage.getItem('tga-documents'));
    return Array.isArray(stored) ? stored : structuredClone(initialDocuments);
  } catch {
    return structuredClone(initialDocuments);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function brand(compact = false) {
  return `<a class="brand ${compact ? 'brand--compact' : ''}" href="#top" data-action="home" aria-label="The Gun Association home"><img src="/tga-mark.svg" alt="" width="46" height="46"><span><strong>The Gun Association</strong><small>Member platform</small></span></a>`;
}

function publicTemplate() {
  return `
    <div class="public-site" id="top">
      <header class="public-header">
        <div class="container-xxl public-nav">
          ${brand()}
          <nav class="public-links d-none d-xl-flex" aria-label="Main navigation">
            <a href="#about">About</a><a href="#platform">Platform</a><a href="#journey">Journey</a><a href="#gallery">Gallery</a><a href="#reviews">Reviews</a><a href="#membership">Membership</a><a href="#faq">FAQ</a>
          </nav>
          <div class="nav-actions d-flex align-items-center gap-2">
            <button class="button button--ghost d-none d-sm-inline-flex" data-action="login">Member login</button>
            <button class="button button--gold" data-action="apply">Apply now</button>
            <button class="nav-menu-button d-xl-none" type="button" data-action="toggle-public-menu" aria-expanded="false" aria-controls="public-mobile-menu" aria-label="Open main menu"><iconify-icon icon="solar:hamburger-menu-linear"></iconify-icon></button>
          </div>
        </div>
        <nav class="public-mobile-menu" id="public-mobile-menu" aria-label="Mobile navigation" hidden>
          <a href="#about">About</a><a href="#platform">Platform</a><a href="#journey">Journey</a><a href="#gallery">Gallery</a><a href="#reviews">Reviews</a><a href="#membership">Membership</a><a href="#faq">FAQ</a><a href="#contact">Contact</a>
          <button class="button button--outline-light" data-action="login">Member login</button>
        </nav>
      </header>

      <main id="main-content">
        <section class="hero-section position-relative overflow-hidden">
          <canvas class="hero-webgl" data-webgl-scene aria-hidden="true"></canvas>
          <div class="hero-orbit hero-orbit--one" aria-hidden="true"></div><div class="hero-orbit hero-orbit--two" aria-hidden="true"></div>
          <div class="container-xxl hero-grid row align-items-center g-5 position-relative">
            <div class="col-lg-7 hero-copy" data-reveal>
              <span class="eyebrow eyebrow--light">A modern association experience</span>
              <h1>Membership built around <em>clarity, responsibility</em> and connection.</h1>
              <p>TGA brings applications, documents, assessments, renewals and member support into one considered digital journey—from first enquiry to ongoing membership.</p>
              <div class="d-flex flex-wrap gap-3 mt-4">
                <button class="button button--gold button--large" data-action="apply">Start an application</button>
                <button class="button button--outline-light button--large" data-action="login">Open demo portal</button>
              </div>
              <div class="trust-row d-flex flex-wrap gap-4 mt-4"><span><iconify-icon icon="solar:shield-check-linear"></iconify-icon> Role-aware access</span><span><iconify-icon icon="solar:smartphone-linear"></iconify-icon> Mobile first</span><span><iconify-icon icon="solar:lock-keyhole-linear"></iconify-icon> POPIA-minded</span></div>
            </div>
            <div class="col-lg-5" data-reveal>
              <div class="hero-portal-card" data-parallax data-spotlight>
                <header><span class="live-dot"></span><small>Member experience preview</small><b>Active</b></header>
                <div class="preview-member"><span>AD</span><div><small>Welcome back</small><strong>Anele Dlamini</strong></div></div>
                <div class="preview-score"><span>Membership progress</span><strong>92%</strong><i><b style="width:92%"></b></i></div>
                <div class="preview-list"><span><iconify-icon icon="solar:check-circle-bold"></iconify-icon><b>Assessment passed</b><small>Requirement complete</small></span><span><iconify-icon icon="solar:document-add-linear"></iconify-icon><b>One document in review</b><small>Visible status updates</small></span><span><iconify-icon icon="solar:card-linear"></iconify-icon><b>Renewal ready</b><small>31 July 2027</small></span></div>
              </div>
            </div>
          </div>
          <a class="scroll-cue" href="#about"><span>Explore</span><i></i></a>
        </section>

        <section class="proof-strip" aria-label="Prototype highlights">
          <div class="container-xxl row g-0"><div class="col-6 col-lg-3"><strong>24/7</strong><span>Self-service access</span></div><div class="col-6 col-lg-3"><strong>1</strong><span>Unified member record</span></div><div class="col-6 col-lg-3"><strong>100%</strong><span>Digital application path</span></div><div class="col-6 col-lg-3"><strong>Live</strong><span>Status visibility</span></div></div>
        </section>

        <section class="section section--cream" id="about">
          <div class="container-xxl row g-5 align-items-start">
            <div class="col-lg-6 section-copy" data-reveal><span class="eyebrow">About The Gun Association</span><h2>Supporting responsible, informed and connected members.</h2><p>The Gun Association is a member-focused organisation dedicated to helping people navigate responsible firearm ownership, ongoing education and compliance with greater confidence.</p><p>TGA brings applications, documents, assessments, renewals and member support into one clear experience. When a matter needs case-specific advice, members are directed to appropriately qualified professionals.</p></div>
            <div class="col-lg-6 pillar-stack">${aboutPillars.map(([number, title, text]) => `<article class="pillar-card" data-reveal><span>${number}</span><div><h3>${title}</h3><p>${text}</p></div></article>`).join('')}</div>
          </div>
        </section>

        <section class="section" id="platform">
          <div class="container-xxl">
            <div class="section-heading" data-reveal><span class="eyebrow">Core platform</span><h2>One lightweight frontend. Six connected experiences.</h2><p>Select a card to reveal the implementation boundary behind the interface.</p></div>
            <div class="feature-grid">${platformFeatures.map((feature) => `<button class="flip-card" type="button" data-flip-card data-spotlight aria-pressed="false"><span class="flip-card__front"><iconify-icon icon="${feature.icon}"></iconify-icon><small>Explore capability</small><h3>${feature.title}</h3><p>${feature.text}</p><b>Flip card <iconify-icon icon="solar:refresh-circle-linear"></iconify-icon></b></span><span class="flip-card__back"><small>Prototype boundary</small><h3>${feature.title}</h3><p>${feature.detail}</p><b>Return to overview</b></span></button>`).join('')}</div>
          </div>
        </section>

        <section class="section benefits-section">
          <div class="container-xxl"><div class="section-heading section-heading--light" data-reveal><span class="eyebrow eyebrow--light">Built around members</span><h2>Practical value at every stage.</h2><p>A clearer, more connected experience from first application through annual renewal.</p></div><div class="benefit-grid">${benefits.map(([number, title, text]) => `<article data-reveal><span>${number}</span><h3>${title}</h3><p>${text}</p></article>`).join('')}</div></div>
        </section>

        <section class="section journey-section" id="journey">
          <div class="container-xxl">
            <div class="section-heading section-heading--left" data-reveal><span class="eyebrow">Two-part member journey</span><h2>From first decision to everyday support.</h2><p>The chapter system presents the public and logged-in experience as one continuous story.</p></div>
            <div class="chapter-tabs" role="tablist" aria-label="Member journey chapters"><button class="active" role="tab" aria-selected="true" aria-controls="chapter-one" data-chapter="chapter-one"><span>Part 01</span>Apply with clarity</button><button role="tab" aria-selected="false" aria-controls="chapter-two" data-chapter="chapter-two"><span>Part 02</span>Stay connected</button></div>
            <div class="chapter-stage">
              <article class="chapter-panel" id="chapter-one" role="tabpanel" data-chapter-panel><div><span class="chapter-number">01</span><h3>A guided application path</h3><p>Choose a membership path, understand requirements, submit documents and complete the assigned assessment with visible progress.</p><ol><li><b>Create an account</b><span>Capture contact details and choose a path.</span></li><li><b>Upload documents</b><span>Follow a clear, role-specific checklist.</span></li><li><b>Complete assessments</b><span>View rules, progress and results.</span></li></ol><button class="button button--dark" data-action="apply">Start an application</button></div><div class="chapter-visual rive-frame"><canvas data-rive-canvas data-rive-src="/assets/tga-journey.riv" width="720" height="520" aria-label="Animated application journey"></canvas><div class="rive-fallback" data-rive-fallback><span class="pulse-ring"><iconify-icon icon="solar:route-linear"></iconify-icon></span><strong>Journey animation ready</strong><small>Add the approved <code>tga-journey.riv</code> file to activate this canvas.</small></div></div></article>
              <article class="chapter-panel" id="chapter-two" role="tabpanel" data-chapter-panel hidden><div><span class="chapter-number">02</span><h3>A member record that keeps working</h3><p>Reach documents, payments, results, renewals and support through one responsive portal designed for mobile and desktop.</p><ol><li><b>See current status</b><span>Know what requires attention now.</span></li><li><b>Self-serve securely</b><span>Access records and receipts in one place.</span></li><li><b>Escalate appropriately</b><span>Connect with professional assistance when needed.</span></li></ol><button class="button button--gold" data-action="login">Open demo portal</button></div><div class="chapter-visual chapter-dashboard" aria-label="Portal connection illustration"><span class="orbital-node orbital-node--one">Documents</span><span class="orbital-node orbital-node--two">Payments</span><span class="orbital-node orbital-node--three">Support</span><div class="central-node"><img src="/tga-mark.svg" alt="" width="90" height="90"><strong>One member record</strong></div></div></article>
            </div>
          </div>
        </section>

        <section class="section gallery-section" id="gallery">
          <div class="container-xxl"><div class="section-heading section-heading--left" data-reveal><span class="eyebrow eyebrow--light">The TGA experience</span><h2>Responsibility looks different at every stage.</h2><p>Original prototype imagery; replace it with approved TGA photography before publication.</p></div><div class="gallery-grid"><figure class="gallery-card gallery-card--wide" data-reveal><img src="/images/responsible-training.png" loading="lazy" decoding="async" width="1536" height="1024" sizes="(max-width: 800px) 100vw, 66vw" alt="Instructor leading a responsible safety and compliance training session"><figcaption><span>01</span><div><strong>Education in practice</strong><small>Clear learning pathways and assessed understanding.</small></div></figcaption></figure><figure class="gallery-card" data-reveal><img src="/images/member-support.png" loading="lazy" decoding="async" width="1024" height="1536" sizes="(max-width: 800px) 100vw, 34vw" alt="Member receiving guidance from a professional support consultant"><figcaption><span>02</span><div><strong>Human support</strong><small>Appropriate escalation for complex questions.</small></div></figcaption></figure><figure class="gallery-card" data-reveal><img src="/images/digital-membership.png" loading="lazy" decoding="async" width="1536" height="1024" sizes="(max-width: 800px) 100vw, 50vw" alt="Member using a modern digital portal on a laptop"><figcaption><span>03</span><div><strong>Connected membership</strong><small>Records, progress and support in one view.</small></div></figcaption></figure></div></div>
        </section>

        <section class="section reviews-section" id="reviews"><div class="container-xxl"><div class="section-heading" data-reveal><span class="eyebrow">Member feedback</span><h2>A place for verified member experiences.</h2><p>These cards demonstrate the final review layout without inventing endorsements.</p></div><aside class="prototype-note" data-reveal><strong>Prototype content</strong><span>Replace every placeholder with a consented, verified member review before publishing.</span></aside><div class="review-grid">${reviews.map(([title, text]) => `<article data-reveal><header><span>Review placeholder</span><b aria-hidden="true">“</b></header><h3>${title}</h3><p>${text}</p><footer><i>MN</i><div><strong>Member name</strong><small>Membership type · Province</small></div></footer></article>`).join('')}</div></div></section>

        <section class="section" id="membership"><div class="container-xxl"><div class="section-heading" data-reveal><span class="eyebrow">Illustrative pricing</span><h2>Simple membership options.</h2><p>Pricing remains a stakeholder placeholder until TGA confirms the final model.</p></div><div class="pricing-grid"><article data-reveal><small>Standard</small><h3>R450 <span>/ year</span></h3><ul><li>Digital member profile</li><li>Document management</li><li>Core assessment access</li></ul><button class="button button--dark" data-action="apply">Choose Standard</button></article><article class="featured" data-reveal><b>Recommended</b><small>Professional</small><h3>R750 <span>/ year</span></h3><ul><li>Everything in Standard</li><li>Priority document review</li><li>Consulting request access</li></ul><button class="button button--gold" data-action="apply">Choose Professional</button></article></div></div></section>

        <section class="section faq-section" id="faq"><div class="container-xl"><div class="section-heading" data-reveal><span class="eyebrow">Frequently asked questions</span><h2>Useful information before you begin.</h2></div><div class="faq-list">${faqs.map(([question, answer]) => `<details data-reveal><summary><span>${question}</span><iconify-icon icon="solar:add-circle-linear"></iconify-icon></summary><p>${answer}</p></details>`).join('')}</div></div></section>

        <section class="section contact-section" id="contact"><div class="container-xxl"><div class="section-heading section-heading--light" data-reveal><span class="eyebrow eyebrow--light">Contact TGA</span><h2>Clear routes to the right support.</h2><p>The production website will direct visitors to verified TGA contact channels.</p></div><aside class="contact-note" data-reveal><strong>Details required</strong><span>TGA must confirm every email address, telephone number, availability window and booking route.</span></aside><div class="contact-grid">${contactPlaceholders.map(([number, title, text]) => `<article data-reveal><header><span>${number}</span><b>Details to be supplied</b></header><h3>${title}</h3><p>${text}</p><footer>TGA to confirm this channel</footer></article>`).join('')}</div></div></section>

        <section class="cta-section"><div class="container-xxl d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4"><div data-reveal><span class="eyebrow eyebrow--light">Ready to explore?</span><h2>Begin the journey or step inside the working portal.</h2></div><div class="d-flex flex-wrap gap-3"><button class="button button--gold button--large" data-action="apply">Start an application</button><button class="button button--outline-light button--large" data-action="login">Open demo portal</button></div></div></section>
      </main>

      <footer class="public-footer"><div class="container-xxl footer-layout">${brand(true)}<nav aria-label="Footer navigation"><a href="#about">About</a><a href="#journey">Journey</a><a href="#reviews">Reviews</a><a href="#faq">FAQ</a><a href="#contact">Contact</a><button data-action="privacy">Privacy</button><button data-action="guide">Prototype guide</button></nav><span>© 2026 The Gun Association</span><p><strong>Prototype only.</strong> Stakeholder-review frontend with simulated authentication, storage, payments, notifications, audio and support interactions.</p></div></footer>

      <aside class="audio-dock" aria-label="Journey audio player"><button class="audio-dock__toggle" data-action="toggle-audio-dock" aria-expanded="false" aria-controls="audio-controls"><iconify-icon icon="solar:music-note-3-linear"></iconify-icon><span>Journey audio</span></button><div id="audio-controls" hidden><span class="audio-status" data-audio-status>Approved MP3 tracks pending</span><button data-audio-track="/audio/part-1.mp3"><iconify-icon icon="solar:play-circle-linear"></iconify-icon> Part 1</button><button data-audio-track="/audio/part-2.mp3"><iconify-icon icon="solar:play-circle-linear"></iconify-icon> Part 2</button></div><audio id="journey-audio" preload="none"></audio></aside>
    </div>`;
}

function loginTemplate() {
  return `<main class="auth-page" id="main-content"><button class="back-button" data-action="home"><iconify-icon icon="solar:arrow-left-linear"></iconify-icon> Back to website</button><section class="auth-panel"><div>${brand()}<span class="prototype-pill">Interactive prototype</span></div><span class="eyebrow">Secure portal</span><h1>Welcome back.</h1><p>Sign in to explore the member or administrator experience.</p><form id="login-form" class="auth-form"><label>Email address<input name="email" type="email" value="member@tga.co.za" required autocomplete="username"></label><label>Password<input name="password" type="password" value="demo123" required autocomplete="current-password"></label><button class="button button--gold" type="submit">Sign in</button></form><div class="demo-access"><strong>Demo access</strong><button data-demo-role="member"><span>Member portal</span><code>member@tga.co.za / demo123</code></button><button data-demo-role="admin"><span>Admin portal</span><code>admin@tga.co.za / admin123</code></button></div><small>This static prototype uses demonstration credentials only. No real authentication occurs.</small></section><aside class="auth-art"><canvas data-webgl-scene aria-hidden="true"></canvas><div><span>“</span><h2>Membership administration without the paperwork bottleneck.</h2><p>Applications, documents, assessments and renewals in one clear workflow.</p></div></aside></main>`;
}

const portalItems = {
  member: [['overview', 'solar:widget-2-linear', 'Overview'], ['documents', 'solar:folder-with-files-linear', 'Documents'], ['assessments', 'solar:checklist-minimalistic-linear', 'Assessments'], ['payments', 'solar:card-linear', 'Payments'], ['profile', 'solar:user-circle-linear', 'My profile']],
  admin: [['dashboard', 'solar:widget-2-linear', 'Dashboard'], ['members', 'solar:users-group-rounded-linear', 'Members'], ['reviews', 'solar:folder-check-linear', 'Document reviews'], ['assessments', 'solar:checklist-minimalistic-linear', 'Assessments'], ['payments', 'solar:card-linear', 'Payments']]
};

function portalNav(role, mobile = false) {
  return `<nav class="portal-nav" aria-label="${mobile ? 'Mobile ' : ''}${role} portal navigation">${portalItems[role].map(([key, icon, label]) => `<button class="${state.active === key ? 'active' : ''}" data-portal-section="${key}" ${state.active === key ? 'aria-current="page"' : ''}><iconify-icon icon="${icon}"></iconify-icon>${label}</button>`).join('')}</nav>`;
}

function portalTemplate() {
  const role = state.role;
  const admin = role === 'admin';
  return `<div class="portal-shell"><aside class="portal-sidebar">${brand(true)}<span class="portal-role">${admin ? 'Administrator portal' : 'Member portal'}</span>${portalNav(role)}<div class="sidebar-help"><strong>Need help?</strong><p>Use the TGA Assistant or contact the support team.</p><button data-action="support">Contact support</button></div><button class="signout-button" data-action="logout"><iconify-icon icon="solar:logout-2-linear"></iconify-icon> Sign out</button></aside><div class="portal-main"><header class="portal-topbar"><button class="portal-menu-button" data-action="open-portal-menu" aria-label="Open portal navigation" aria-controls="portal-mobile-dialog"><iconify-icon icon="solar:hamburger-menu-linear"></iconify-icon></button><div class="portal-mobile-brand">${brand(true)}</div><label class="portal-search"><iconify-icon icon="solar:magnifer-linear"></iconify-icon><span class="visually-hidden">Search portal</span><input placeholder="${admin ? 'Search members or records' : 'Search your portal'}"></label><div class="user-chip"><span>${admin ? 'TK' : 'AD'}</span><div><strong>${admin ? 'Titus Kalideen' : 'Anele Dlamini'}</strong><small>${admin ? 'System administrator' : 'TGA-2026-1048'}</small></div></div></header><main class="portal-content" id="main-content">${admin ? adminPage() : memberPage()}</main></div><dialog class="portal-mobile-dialog" id="portal-mobile-dialog"><div><header>${brand(true)}<button class="icon-button" data-action="close-portal-menu" aria-label="Close portal navigation"><iconify-icon icon="solar:close-circle-linear"></iconify-icon></button></header><span class="portal-role">${admin ? 'Administrator portal' : 'Member portal'}</span>${portalNav(role, true)}<div class="sidebar-help"><strong>Need help?</strong><p>Use the TGA Assistant or contact the support team.</p><button data-action="support">Contact support</button></div><button class="signout-button" data-action="logout"><iconify-icon icon="solar:logout-2-linear"></iconify-icon> Sign out</button></div></dialog><button class="chat-launcher" data-action="chat" aria-label="Open TGA Assistant"><iconify-icon icon="solar:chat-round-dots-bold"></iconify-icon></button></div>`;
}

function pageHeading(eyebrow, title, copy, actionLabel = '+ Add member', action = 'notify') {
  return `<header class="page-heading"><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${copy}</p></div><button class="button button--gold" data-action="${action}">${actionLabel}</button></header>`;
}

function metric(icon, label, value, detail) {
  return `<article class="metric-card"><div><iconify-icon icon="${icon}"></iconify-icon><small>${label}</small></div><strong>${value}</strong><p>${detail}</p></article>`;
}

function statusBadge(status) {
  const key = String(status).toLowerCase().replaceAll(' ', '-');
  return `<span class="status-badge status-badge--${escapeHtml(key)}">${escapeHtml(status)}</span>`;
}

function memberPage() {
  const approved = state.documents.filter((item) => item.status === 'Approved').length;
  const pages = {
    overview: () => `${pageHeading('Member portal', 'Good evening, Anele', 'Here is your current membership and compliance status.', 'Complete next step', 'open-documents')}<div class="metric-grid">${metric('solar:verified-check-linear', 'Membership status', 'Active', 'Valid until 31 July 2027')}${metric('solar:chart-square-linear', 'Profile completion', '92%', 'Almost ready')}${metric('solar:folder-with-files-linear', 'Documents', `${approved}/${state.documents.length}`, 'One currently in review')}${metric('solar:checklist-minimalistic-linear', 'Assessment result', state.testResult ? `${state.testResult}%` : 'Not started', state.testResult >= 80 ? 'Requirement complete' : 'Pass mark: 80%')}</div><div class="portal-grid"><section class="panel panel--wide"><header><h2>Your progress</h2><span>3 of 4 complete</span></header><div class="journey-list"><article><i>✓</i><div><strong>Account and personal details</strong><p>Profile verified on 18 July 2026</p></div><span>Complete</span></article><article><i>✓</i><div><strong>Membership payment</strong><p>Professional annual membership</p></div><span>Complete</span></article><article><i>3</i><div><strong>Required assessment</strong><p>${state.testResult ? `Latest result: ${state.testResult}%` : 'Foundation assessment assigned'}</p></div><button data-action="assessment">${state.testResult ? 'Retake' : 'Start'}</button></article><article><i>4</i><div><strong>Document verification</strong><p>One compliance document is being reviewed</p></div><button data-action="open-documents">View</button></article></div></section><section class="panel member-card"><small>Digital membership card</small><img src="/tga-mark.svg" alt="" width="55" height="55"><span>Professional member</span><h2>Anele Dlamini</h2><p>TGA-2026-1048</p><b>Valid until 31 Jul 2027</b></section><section class="panel panel--wide"><header><h2>Recent activity</h2></header><div class="activity-list"><p><iconify-icon icon="solar:document-add-linear"></iconify-icon><span><strong>Competency certificate submitted</strong><small>Awaiting administrator review</small></span><time>19 Jul</time></p><p><iconify-icon icon="solar:check-circle-linear"></iconify-icon><span><strong>Profile photograph approved</strong><small>Format checks completed</small></span><time>19 Jul</time></p><p><iconify-icon icon="solar:card-linear"></iconify-icon><span><strong>Membership payment received</strong><small>Receipt TGA-PF-002841 generated</small></span><time>18 Jul</time></p></div></section></div>`,
    documents: () => `${pageHeading('Member portal', 'Your documents', 'Upload and track documents required for your membership.', '+ Upload document', 'upload')}<section class="panel"><header><div><h2>Document register</h2><p>Only safe file metadata is stored in this browser.</p></div></header><div class="document-grid">${state.documents.map((document) => `<article><span class="file-icon">${escapeHtml(document.name.split('.').at(-1).toUpperCase())}</span><div><h3>${escapeHtml(document.name)}</h3><p>${escapeHtml(document.type)} · ${escapeHtml(document.size)}</p><small>Submitted ${escapeHtml(document.date)}</small></div>${statusBadge(document.status)}</article>`).join('')}</div><button class="upload-dropzone" data-action="upload"><iconify-icon icon="solar:upload-linear"></iconify-icon><strong>Upload another document</strong><span>PDF, JPG or PNG up to 5 MB</span></button></section>`,
    assessments: () => `${pageHeading('Member portal', 'Assessments', 'Complete assigned tests and view your latest result.', state.testResult ? 'Retake assessment' : 'Start assessment', 'assessment')}<div class="assessment-layout"><section class="panel assessment-feature"><span class="prototype-pill">Required</span><h2>Safety & Compliance Foundation</h2><p>A short knowledge check covering safe handling principles, document compliance and escalation to authorised professionals.</p><div><span>5 questions</span><span>10 minutes</span><span>80% pass mark</span></div><button class="button button--gold" data-action="assessment">${state.testResult ? 'Retake assessment' : 'Start assessment'}</button></section><section class="panel result-card"><small>Latest result</small><strong>${state.testResult ? `${state.testResult}%` : '—'}</strong>${statusBadge(state.testResult >= 80 ? 'Passed' : state.testResult ? 'Not passed' : 'Not started')}<p>${state.testResult >= 80 ? 'Your requirement is complete.' : 'Complete the assessment to progress.'}</p></section></div>`,
    payments: () => `${pageHeading('Member portal', 'Payments and renewals', 'Manage your membership fee and access prototype receipts.', 'Pay now', 'payment')}<div class="payment-layout"><section class="panel invoice-card"><span>Annual membership</span><h2>Professional membership</h2><strong>R750.00</strong><p>Due 31 July 2027</p><button class="button button--gold" data-action="payment">Pay securely with PayFast</button><small>Demonstration checkout only.</small></section><section class="panel"><header><h2>Payment history</h2></header><div class="responsive-table"><table><thead><tr><th>Reference</th><th>Description</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead><tbody><tr><td>TGA-PF-002841</td><td>Professional annual membership</td><td>18 Jul 2026</td><td>R750.00</td><td>${statusBadge('Paid')}</td></tr><tr><td>TGA-PF-001902</td><td>Online assessment fee</td><td>04 Aug 2025</td><td>R150.00</td><td>${statusBadge('Paid')}</td></tr></tbody></table></div></section></div>`,
    profile: () => `${pageHeading('Member portal', 'My profile', 'Keep your details current and review communication preferences.', 'Save changes', 'save-profile')}<section class="panel profile-card"><div class="profile-avatar">AD</div><div><h2>Anele Dlamini</h2><p>Professional member · TGA-2026-1048</p></div><form id="profile-form" class="profile-form"><label>First name<input value="Anele"></label><label>Last name<input value="Dlamini"></label><label>Email address<input type="email" value="anele.dlamini@example.com"></label><label>Mobile number<input value="+27 82 555 0148"></label><label class="full-width">Residential address<input value="12 Example Road, Durban, KwaZulu-Natal"></label><label class="check-label full-width"><input type="checkbox" checked> Receive membership and compliance reminders by email</label></form></section>`
  };
  return pages[state.active]?.() || pages.overview();
}

function memberRows(members = state.members) {
  return members.map((member) => `<tr><td><div class="table-person"><span>${member.name.split(' ').map((part) => part[0]).join('')}</span><div><strong>${escapeHtml(member.name)}</strong><small>${escapeHtml(member.id)}</small></div></div></td><td>${escapeHtml(member.plan)}</td><td>${statusBadge(member.status)}</td><td>${member.documents} uploaded</td><td>${escapeHtml(member.assessment)}</td><td>${escapeHtml(member.expiry)}</td><td><button class="text-button" data-member-id="${escapeHtml(member.id)}">Open</button></td></tr>`).join('');
}

function adminPage() {
  const pages = {
    dashboard: () => `${pageHeading('Administrator portal', 'Operations dashboard', 'Monitor applications, renewals, assessments and document reviews.')}<div class="metric-grid">${metric('solar:users-group-rounded-linear', 'Total members', '1,284', '↑ 4.8% this month')}${metric('solar:user-plus-linear', 'Pending applications', '37', '12 require action today')}${metric('solar:folder-check-linear', 'Documents to review', '54', 'Oldest waiting: 2 days')}${metric('solar:card-linear', 'Payments this month', 'R94,650', '↑ 7.2% vs last month')}</div><div class="portal-grid"><section class="panel panel--wide"><header><h2>Membership growth</h2><span>Last 6 months</span></header><div class="bar-chart" aria-label="Membership growth chart">${[['Feb',48,16],['Mar',57,19],['Apr',64,23],['May',72,20],['Jun',81,29],['Jul',94,37]].map(([month,active,pending]) => `<div><span><i style="height:${active}%"></i><b style="height:${pending}%"></b></span><small>${month}</small></div>`).join('')}</div></section><section class="panel"><header><h2>Review queue</h2></header><div class="queue-list"><button data-portal-section="reviews"><iconify-icon icon="solar:folder-check-linear"></iconify-icon><span><strong>Identity documents</strong><small>18 awaiting review</small></span></button><button data-portal-section="members"><iconify-icon icon="solar:user-plus-linear"></iconify-icon><span><strong>New applications</strong><small>12 require a decision</small></span></button><button data-portal-section="payments"><iconify-icon icon="solar:card-linear"></iconify-icon><span><strong>Failed payments</strong><small>7 need follow-up</small></span></button></div></section><section class="panel panel--full"><header><h2>Recent applications</h2><button class="text-button" data-portal-section="members">View all members</button></header><div class="responsive-table"><table><thead><tr><th>Member</th><th>Plan</th><th>Status</th><th>Documents</th><th>Assessment</th><th>Expiry</th><th></th></tr></thead><tbody>${memberRows()}</tbody></table></div></section></div>`,
    members: () => `${pageHeading('Administrator portal', 'Member management', 'Search, review and update the complete TGA member register.')}<section class="panel"><div class="member-toolbar"><label><span class="visually-hidden">Search members</span><input id="member-search" placeholder="Search name, email or member number" value="${escapeHtml(state.memberQuery)}"></label><select id="member-status" aria-label="Filter by status"><option>All statuses</option><option ${state.memberStatus === 'Active' ? 'selected' : ''}>Active</option><option ${state.memberStatus === 'Pending review' ? 'selected' : ''}>Pending review</option><option ${state.memberStatus === 'Payment due' ? 'selected' : ''}>Payment due</option></select><button class="button button--soft" data-action="notify">Export CSV</button></div><div class="responsive-table"><table><thead><tr><th>Member</th><th>Plan</th><th>Status</th><th>Documents</th><th>Assessment</th><th>Expiry</th><th></th></tr></thead><tbody id="member-table-body">${memberRows(filteredMembers())}</tbody></table></div></section>`,
    reviews: () => `${pageHeading('Administrator portal', 'Document review queue', 'Process pending documents and maintain a clear approval trail.')}<section class="panel"><div class="review-list">${[['Megan Jacobs','TGA-2026-1047','Identity document'],['Thandiwe Ncube','TGA-2026-1043','Proof of address'],['Ryan Botha','TGA-2026-1039','Competency certificate']].map(([name,id,type]) => `<article><div class="table-person"><span>${name.split(' ').map((part) => part[0]).join('')}</span><div><strong>${name}</strong><small>${id}</small></div></div><div><strong>${type}</strong><small>PDF · prototype file</small></div><div class="review-actions"><button data-action="approve-document">Approve</button><button data-action="notify">Request changes</button></div></article>`).join('')}</div></section>`,
    assessments: () => `${pageHeading('Administrator portal', 'Assessment management', 'Track completion, results, pass rates and assigned tests.')}<div class="metric-grid metric-grid--three">${metric('solar:clipboard-list-linear', 'Assigned this month', '116', '89 completed')}${metric('solar:graph-up-linear', 'Average score', '86%', '↑ 3% improvement')}${metric('solar:check-circle-linear', 'Pass rate', '91%', '8 require a retake')}</div><section class="panel"><header><h2>Latest assessment results</h2></header><div class="responsive-table"><table><thead><tr><th>Member</th><th>Assessment</th><th>Score</th><th>Status</th></tr></thead><tbody>${state.members.filter((member) => member.assessment === 'Passed').map((member, index) => `<tr><td><strong>${member.name}</strong><small>${member.id}</small></td><td>Safety & Compliance Foundation</td><td>${[92,84,96,88][index]}%</td><td>${statusBadge('Passed')}</td></tr>`).join('')}</tbody></table></div></section>`,
    payments: () => `${pageHeading('Administrator portal', 'Payment management', 'Monitor simulated transactions, renewals and outstanding balances.')}<div class="metric-grid metric-grid--three">${metric('solar:card-2-linear', 'Successful payments', 'R94,650', '126 transactions')}${metric('solar:clock-circle-linear', 'Outstanding', 'R18,900', '31 member balances')}${metric('solar:danger-circle-linear', 'Failed / cancelled', '7', 'Follow-up required')}</div><section class="panel"><header><h2>Recent transactions</h2></header><div class="responsive-table"><table><thead><tr><th>Reference</th><th>Member</th><th>Description</th><th>Amount</th><th>Status</th></tr></thead><tbody>${state.members.slice(0,4).map((member,index) => `<tr><td>TGA-PF-00${2841-index}</td><td><strong>${member.name}</strong><small>${member.id}</small></td><td>${member.plan} annual membership</td><td>${member.plan === 'Professional' ? 'R750.00' : 'R450.00'}</td><td>${statusBadge(index === 3 ? 'Failed' : 'Paid')}</td></tr>`).join('')}</tbody></table></div></section>`
  };
  return pages[state.active]?.() || pages.dashboard();
}

function filteredMembers() {
  const query = state.memberQuery.toLowerCase();
  return state.members.filter((member) => `${member.name} ${member.email} ${member.id}`.toLowerCase().includes(query) && (state.memberStatus === 'All statuses' || member.status === state.memberStatus));
}

function render({ preserveScroll = false } = {}) {
  destroyPublicEffects();
  app.innerHTML = state.screen === 'public' ? publicTemplate() : state.screen === 'login' ? loginTemplate() : portalTemplate();
  document.body.dataset.screen = state.screen;
  if (!preserveScroll) window.scrollTo({ top: 0, left: 0 });
  if (state.screen === 'public' || state.screen === 'login') initialisePublicEffects();
  const portalDrawer = document.querySelector('#portal-mobile-dialog');
  if (portalDrawer) {
    portalDrawer.addEventListener('close', () => document.body.classList.remove('dialog-open'));
    portalDrawer.addEventListener('click', (event) => {
      if (event.target === portalDrawer) portalDrawer.close();
    });
  }
}

function showDialog(title, content) {
  siteDialogTitle.textContent = title;
  siteDialogContent.innerHTML = content;
  siteDialog.showModal();
  document.body.classList.add('dialog-open');
}

function closeDialog() {
  siteDialog.close();
  if (!noticeDialog.open) document.body.classList.remove('dialog-open');
}

function showNotice(title, content) {
  noticeDialogTitle.textContent = title;
  noticeDialogContent.innerHTML = content;
  noticeDialog.showModal();
  document.body.classList.add('dialog-open');
}

function closeNotice() {
  noticeDialog.close();
  if (!siteDialog.open) document.body.classList.remove('dialog-open');
}

function toast(message) {
  toastRegion.textContent = message;
  toastRegion.classList.add('show');
  window.clearTimeout(toastRegion.timer);
  toastRegion.timer = window.setTimeout(() => toastRegion.classList.remove('show'), 2800);
}

function privacyContent() {
  return `<div class="information-modal"><p class="information-intro">This notice explains how information is treated in this demonstration and outlines the intended direction for a production TGA service.</p><section><span>01</span><div><h3>What this demonstration does</h3><p>Information entered into the demonstration application form is not transmitted or stored. Uploaded file contents are not transferred or retained.</p></div></section><section><span>02</span><div><h3>Intended production handling</h3><p>A production service would use information for membership administration, document review, assessments, payments, renewals, support and required communications.</p></div></section><section><span>03</span><div><h3>POPIA-aligned controls</h3><p>Role-based access, private document storage, audit logging, retention, correction and deletion processes require confirmation by TGA and its legal advisers.</p></div></section><aside><strong>Draft wording</strong><p>This prototype notice is not legal advice and requires legal review before production use.</p></aside></div>`;
}

function guideContent() {
  return `<div class="guide-modal"><p>Use these walkthroughs during stakeholder review.</p><div><section><span>01</span><h3>Public application</h3><p>Start an application, complete the demonstration form, accept prototype consent and submit. Nothing is sent to a server.</p></section><section><span>02</span><h3>Member portal</h3><code>member@tga.co.za</code><code>demo123</code><p>Explore documents, assessments, payments and profile information.</p></section><section><span>03</span><h3>Administrator portal</h3><code>admin@tga.co.za</code><code>admin123</code><p>Explore members, document reviews, results and transactions.</p></section></div><aside><h3>Prototype limitations</h3><ul><li>Authentication and roles are simulated.</li><li>No backend database or private file store is connected.</li><li>Payments, receipts and notifications are simulated.</li><li>Audio, Rive and chatbot integrations use frontend-ready fallbacks.</li><li>Records, pricing and metrics are illustrative.</li></ul></aside></div>`;
}

function applicationContent() {
  return `<form id="application-form" class="dialog-form"><div class="row g-3"><label class="col-sm-6">First name<input name="firstName" required></label><label class="col-sm-6">Last name<input name="lastName" required></label></div><label>Email address<input name="email" type="email" required></label><label>Mobile number<input name="mobile" type="tel" required></label><label>Membership interest<select name="membership"><option>Standard membership</option><option>Professional membership</option><option>I need advice first</option></select></label><div class="consent-field"><label class="check-label"><input type="checkbox" required> I agree to the prototype privacy notice and consent to being contacted.</label><button class="text-button" type="button" data-action="privacy">Read prototype privacy notice</button></div><button class="button button--gold" type="submit">Create application</button><small>No information is transmitted or stored by this form.</small></form>`;
}

function assessmentContent() {
  return `<form id="assessment-form" class="assessment-form"><div class="test-meta"><span>5 questions</span><span>Pass mark: 80%</span></div>${assessmentQuestions.map(([question, options], index) => `<fieldset><legend><span>${index + 1}</span>${question}</legend>${options.map((option, optionIndex) => `<label><input type="radio" name="question-${index}" value="${optionIndex}" required>${option}</label>`).join('')}</fieldset>`).join('')}<button class="button button--gold" type="submit">Submit assessment</button></form>`;
}

function uploadContent() {
  return `<form id="upload-form" class="dialog-form"><label>Document type<select name="type" required><option>Identity</option><option>Address</option><option>Compliance</option><option>Profile</option><option>Other</option></select></label><label class="file-picker"><input name="file" type="file" accept=".pdf,.jpg,.jpeg,.png" required><iconify-icon icon="solar:upload-linear"></iconify-icon><strong>Select a file</strong><span>PDF, JPG or PNG up to 5 MB</span></label><aside>Production files require encryption, malware scanning, access control and private storage.</aside><button class="button button--gold" type="submit">Submit for review</button></form>`;
}

function paymentContent() {
  return `<div class="payment-dialog"><div><span>Professional annual membership</span><strong>R750.00</strong></div><p>The production build would redirect to PayFast’s secure checkout and validate the transaction server-side.</p><b>payfast <small>Secure payment gateway</small></b><button class="button button--gold" data-action="simulate-payment">Simulate successful payment</button><small>No card or banking details are requested.</small></div>`;
}

function memberDetailContent(member) {
  return `<div class="member-detail"><div class="table-person"><span>${member.name.split(' ').map((part) => part[0]).join('')}</span><div><h3>${escapeHtml(member.name)}</h3><p>${escapeHtml(member.id)} · ${escapeHtml(member.email)}</p></div></div><dl><div><dt>Membership plan</dt><dd>${escapeHtml(member.plan)}</dd></div><div><dt>Status</dt><dd>${statusBadge(member.status)}</dd></div><div><dt>Expiry</dt><dd>${escapeHtml(member.expiry)}</dd></div><div><dt>Documents</dt><dd>${member.documents} uploaded</dd></div><div><dt>Assessment</dt><dd>${escapeHtml(member.assessment)}</dd></div></dl><label>Update status<select data-update-member="${escapeHtml(member.id)}"><option ${member.status === 'Active' ? 'selected' : ''}>Active</option><option ${member.status === 'Pending review' ? 'selected' : ''}>Pending review</option><option ${member.status === 'Payment due' ? 'selected' : ''}>Payment due</option><option ${member.status === 'Suspended' ? 'selected' : ''}>Suspended</option></select></label></div>`;
}

document.addEventListener('click', async (event) => {
  const actionTarget = event.target.closest('[data-action]');
  const action = actionTarget?.dataset.action;

  if (event.target === siteDialog) closeDialog();
  if (event.target === noticeDialog) closeNotice();
  if (event.target.closest('[data-close-dialog]')) closeDialog();
  if (event.target.closest('[data-close-notice]')) closeNotice();

  if (action === 'home') { event.preventDefault(); state.screen = 'public'; render(); }
  if (action === 'login') { state.screen = 'login'; render(); }
  if (action === 'logout') { state.screen = 'public'; state.active = 'overview'; render(); }
  if (action === 'apply') showDialog('Start a TGA application', applicationContent());
  if (action === 'privacy') showNotice('Prototype privacy notice', privacyContent());
  if (action === 'guide') showDialog('Prototype guide', guideContent());
  if (action === 'assessment') showDialog('Safety & Compliance Foundation', assessmentContent());
  if (action === 'upload') showDialog('Upload a document', uploadContent());
  if (action === 'payment') showDialog('PayFast checkout preview', paymentContent());
  if (action === 'simulate-payment') { closeDialog(); toast('Demo payment completed successfully.'); }
  if (action === 'support') { document.querySelector('#portal-mobile-dialog')?.close(); toast('Demo support request created.'); }
  if (action === 'notify') toast('Prototype action completed.');
  if (action === 'approve-document') toast('Prototype document approved.');
  if (action === 'save-profile') { document.querySelector('#profile-form')?.requestSubmit(); }
  if (action === 'open-documents') { state.active = 'documents'; render(); }
  if (action === 'chat') showDialog('TGA Assistant', `<form id="chat-form" class="chat-dialog"><p>Ask about membership, documents, assessments or payments. Case-specific advice must be escalated.</p><label>Your question<textarea name="message" rows="4" required></textarea></label><button class="button button--gold">Send prototype question</button></form>`);

  if (action === 'toggle-public-menu') {
    const menu = document.querySelector('#public-mobile-menu');
    const open = menu.hidden;
    menu.hidden = !open;
    actionTarget.setAttribute('aria-expanded', String(open));
  }
  if (event.target.closest('#public-mobile-menu a')) {
    document.querySelector('#public-mobile-menu').hidden = true;
    document.querySelector('[data-action="toggle-public-menu"]')?.setAttribute('aria-expanded', 'false');
  }

  const flipTarget = event.target.closest('[data-flip-card]');
  if (flipTarget) flipCard(flipTarget);

  const chapterButton = event.target.closest('[data-chapter]');
  if (chapterButton) {
    const nextId = chapterButton.dataset.chapter;
    const current = document.querySelector('[data-chapter-panel]:not([hidden])');
    const next = document.querySelector(`#${nextId}`);
    transitionChapter(current, next);
    document.querySelectorAll('[data-chapter]').forEach((button) => { const active = button === chapterButton; button.classList.toggle('active', active); button.setAttribute('aria-selected', String(active)); });
    state.chapter = nextId;
  }

  if (action === 'toggle-audio-dock') {
    const controls = document.querySelector('#audio-controls');
    const open = controls.hidden;
    controls.hidden = !open;
    actionTarget.setAttribute('aria-expanded', String(open));
  }
  const audioTrack = event.target.closest('[data-audio-track]');
  if (audioTrack) {
    const status = document.querySelector('[data-audio-status]');
    try {
      const response = await fetch(audioTrack.dataset.audioTrack, { method: 'HEAD' });
      if (!response.ok) throw new Error('Missing audio');
      const audio = document.querySelector('#journey-audio');
      audio.src = audioTrack.dataset.audioTrack;
      await audio.play();
      status.textContent = `Playing ${audioTrack.textContent.trim()}`;
    } catch {
      status.textContent = 'Approved MP3 file required for this chapter';
    }
  }

  const demoRole = event.target.closest('[data-demo-role]');
  if (demoRole) { state.role = demoRole.dataset.demoRole; state.active = state.role === 'admin' ? 'dashboard' : 'overview'; state.screen = 'portal'; render(); }

  const portalSection = event.target.closest('[data-portal-section]');
  if (portalSection) { state.active = portalSection.dataset.portalSection; document.querySelector('#portal-mobile-dialog')?.close(); render(); }
  if (action === 'open-portal-menu') { const drawer = document.querySelector('#portal-mobile-dialog'); drawer.showModal(); document.body.classList.add('dialog-open'); }
  if (action === 'close-portal-menu') { document.querySelector('#portal-mobile-dialog')?.close(); document.body.classList.remove('dialog-open'); }

  const memberButton = event.target.closest('[data-member-id]');
  if (memberButton) { const member = state.members.find((item) => item.id === memberButton.dataset.memberId); showDialog('Member record', memberDetailContent(member)); }
});

document.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;
  if (form.id === 'login-form') {
    const data = new FormData(form);
    const email = String(data.get('email')).toLowerCase();
    const password = String(data.get('password'));
    state.role = email.startsWith('admin') || password === 'admin123' ? 'admin' : 'member';
    state.active = state.role === 'admin' ? 'dashboard' : 'overview';
    state.screen = 'portal';
    render();
  }
  if (form.id === 'application-form') {
    siteDialogContent.innerHTML = `<div class="success-state"><iconify-icon icon="solar:check-circle-bold"></iconify-icon><h3>Application received</h3><p>Your prototype reference is <strong>TGA-APP-2026-0720</strong>.</p><button class="button button--gold" data-action="login">Continue to demo login</button></div>`;
    siteDialogTitle.textContent = 'Application received';
  }
  if (form.id === 'assessment-form') {
    const data = new FormData(form);
    let score = 0;
    assessmentQuestions.forEach((question, index) => { if (Number(data.get(`question-${index}`)) === question[2]) score += 1; });
    state.testResult = Math.round((score / assessmentQuestions.length) * 100);
    localStorage.setItem('tga-test-result', String(state.testResult));
    closeDialog();
    render();
    toast(`Assessment submitted: ${state.testResult}%`);
  }
  if (form.id === 'upload-form') {
    const data = new FormData(form);
    const file = data.get('file');
    if (!(file instanceof File) || !file.name) return;
    if (file.size > 5 * 1024 * 1024) { toast('File must be smaller than 5 MB.'); return; }
    const documentRecord = { id: Date.now(), name: file.name, type: String(data.get('type')), date: new Intl.DateTimeFormat('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()), status: 'In review', size: `${(file.size / 1024 / 1024).toFixed(1)} MB` };
    state.documents.unshift(documentRecord);
    localStorage.setItem('tga-documents', JSON.stringify(state.documents));
    closeDialog();
    render();
    toast('Document submitted for prototype review.');
  }
  if (form.id === 'profile-form') toast('Profile changes saved in this demonstration.');
  if (form.id === 'chat-form') { form.querySelector('textarea').value = ''; toast('Prototype assistant request received.'); }
});

document.addEventListener('input', (event) => {
  if (event.target.id === 'member-search') {
    state.memberQuery = event.target.value;
    document.querySelector('#member-table-body').innerHTML = memberRows(filteredMembers());
  }
});

document.addEventListener('change', (event) => {
  if (event.target.id === 'member-status') {
    state.memberStatus = event.target.value;
    document.querySelector('#member-table-body').innerHTML = memberRows(filteredMembers());
  }
  if (event.target.matches('[data-update-member]')) {
    const member = state.members.find((item) => item.id === event.target.dataset.updateMember);
    member.status = event.target.value;
    closeDialog();
    render();
    toast(`Member status changed to ${member.status}.`);
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 800) {
    const drawer = document.querySelector('#portal-mobile-dialog');
    if (drawer?.open) drawer.close();
    document.body.classList.remove('dialog-open');
  }
});

siteDialog.addEventListener('close', () => { if (!noticeDialog.open) document.body.classList.remove('dialog-open'); });
noticeDialog.addEventListener('close', () => { if (!siteDialog.open) document.body.classList.remove('dialog-open'); });

render();
