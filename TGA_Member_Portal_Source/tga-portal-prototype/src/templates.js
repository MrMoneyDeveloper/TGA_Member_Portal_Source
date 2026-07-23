import {
  aboutPillars,
  chatTopics,
  contactPlaceholders,
  credibilityItems,
  faqs,
  imageAssets,
  journeySteps,
  membershipPlans,
  provinces,
  responsiblePrinciples,
  reviews,
  services
} from './data.js';

export const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const icon = (name) => `<iconify-icon icon="${name}" aria-hidden="true"></iconify-icon>`;
const weaponMark = (className = 'weapon-mark') => `<span class="${className}" aria-hidden="true">${icon('mdi:pistol')}<i></i><i></i><i></i></span>`;

export function picture(asset, className = '', eager = false) {
  const responsiveSizes = className.includes('hero-media') ? '100vw' : '(max-width: 800px) 100vw, 50vw';
  return `<picture class="${className}">
    <source type="image/avif" srcset="/images/tga/${asset.name}-640.avif 640w, /images/tga/${asset.name}-960.avif 960w, /images/tga/${asset.name}-1536.avif 1536w" sizes="${responsiveSizes}">
    <source type="image/webp" srcset="/images/tga/${asset.name}-640.webp 640w, /images/tga/${asset.name}-960.webp 960w, /images/tga/${asset.name}-1536.webp 1536w" sizes="${responsiveSizes}">
    <img src="/images/tga/${asset.name}-1536.jpg" srcset="/images/tga/${asset.name}-640.jpg 640w, /images/tga/${asset.name}-960.jpg 960w, /images/tga/${asset.name}-1536.jpg 1536w" sizes="${responsiveSizes}" width="1536" height="1024" alt="${escapeHtml(asset.alt)}" style="object-position:${asset.position}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
  </picture>`;
}

function logo(label = true) {
  return `<span class="brand"><img src="/tga-mark.svg" width="48" height="48" alt=""><span>${label ? '<strong>The Gun Association</strong><small>Member services prototype</small>' : ''}</span></span>`;
}

function sectionHeading(eyebrow, title, text, id = '') {
  return `<header class="section-heading" ${id ? `id="${id}"` : ''} data-reveal>${weaponMark('section-weapon-mark')}<span class="eyebrow">${eyebrow}</span><h2>${title}</h2>${text ? `<p>${text}</p>` : ''}</header>`;
}

export const publicRoutes = Object.freeze({
  '/': {
    label: 'Home',
    title: 'The Gun Association | Membership, Training and Compliance Support',
    description: 'Responsible ownership, professional support and secure digital member services for South Africa’s firearm community.'
  },
  '/about': {
    label: 'About TGA',
    title: 'About The Gun Association | Responsible Member Support',
    description: 'Learn how The Gun Association proposes to support responsible, informed and connected firearm-community members.'
  },
  '/membership': {
    label: 'Membership',
    title: 'TGA Membership | Benefits, Journey and Illustrative Plans',
    description: 'Explore the proposed TGA member journey, benefits and illustrative membership options.'
  },
  '/training': {
    label: 'Training',
    title: 'Training and Assessments | The Gun Association',
    description: 'Explore proposed firearm-safety learning pathways, competency information and online member assessments.'
  },
  '/resources': {
    label: 'Resources',
    title: 'Responsible Ownership and Compliance Resources | TGA',
    description: 'General resources for responsible ownership, secure storage, document handling, assessments and compliance support.'
  },
  '/contact': {
    label: 'Contact',
    title: 'Contact The Gun Association | Member and Professional Support',
    description: 'Find the proposed contact pathways for general enquiries, membership support and professional assistance.'
  }
});

const navigationLinks = Object.entries(publicRoutes).map(([path, route]) => [path, route.label]);
const serviceRoutes = ['/membership', '/training', '/training#assessments', '/resources#compliance', '/contact#professional-assistance', '/contact'];
const memberBenefits = [
  ['solar:user-id-linear', 'One member record', 'Keep membership administration and progress together in one clear experience.'],
  ['solar:route-linear', 'Visible requirements', 'Understand what is required, what is complete and what should happen next.'],
  ['solar:folder-open-linear', 'Self-service access', 'Reach documents, assessments, payments and receipts through the member portal.'],
  ['solar:chat-round-call-linear', 'Human escalation', 'Move from general support to appropriately qualified professional assistance when needed.']
];

function routeLink(path, label, currentPath, className = '') {
  const current = path === currentPath ? ' aria-current="page"' : '';
  return `<a href="${path}" data-route${current}${className ? ` class="${className}"` : ''}>${label}</a>`;
}

function publicNavigation(currentPath, mobile = false) {
  const links = navigationLinks.map(([path, label]) => routeLink(path, label, currentPath)).join('');
  if (mobile) {
    return `<nav class="mobile-navigation" aria-label="Mobile navigation">
      ${links}
      ${routeLink('/resources#assessments', 'Assessments', currentPath)}
      ${routeLink('/resources#compliance', 'Compliance', currentPath)}
      <button class="button button--outline" data-action="login">Member login</button><button class="button button--brass" data-action="apply">Join TGA</button>
    </nav>`;
  }
  return `<nav class="desktop-navigation" aria-label="Primary navigation">
    ${routeLink('/', 'Home', currentPath)}${routeLink('/about', 'About TGA', currentPath)}${routeLink('/membership', 'Membership', currentPath)}${routeLink('/training', 'Training', currentPath)}
    <details class="nav-dropdown"><summary ${currentPath === '/resources' ? 'aria-current="page"' : ''}>Resources ${icon('solar:alt-arrow-down-linear')}</summary><div><a href="/resources" data-route>Resources overview</a>${routeLink('/resources#assessments', 'Assessments', currentPath)}${routeLink('/resources#compliance', 'Compliance', currentPath)}${routeLink('/resources#ownership', 'Responsible ownership', currentPath)}${routeLink('/resources#faq', 'FAQ', currentPath)}</div></details>
    ${routeLink('/contact', 'Contact', currentPath)}
  </nav>`;
}

function publicHeader(currentPath, demoMode) {
  return `<div class="announcement" role="note"><div class="site-container"><span>Responsible ownership</span><span>Training</span><span>Compliance</span><span>Membership support</span>${demoMode ? '<b>Prototype for stakeholder review</b>' : ''}</div></div>
  <header class="public-header">
    <div class="site-container header-inner"><a href="/" data-route class="brand-link" aria-label="The Gun Association home">${logo()}</a> ${weaponMark('nav-weapon-mark')}
      ${publicNavigation(currentPath)}
      <div class="header-actions"><button class="text-action" data-action="login">Member login</button><button class="button button--brass" data-action="apply">Join TGA</button></div>
      <button class="menu-button" type="button" data-action="toggle-public-menu" aria-controls="public-mobile-menu" aria-expanded="false" aria-label="Open website menu">${icon('solar:hamburger-menu-linear')}</button>
    </div>
    <div id="public-mobile-menu" class="public-mobile-menu" hidden>${publicNavigation(currentPath, true)}</div>
  </header>`;
}

function publicFooter(demoMode) {
  return `<footer class="public-footer"><div class="site-container footer-weapon-line" aria-hidden="true">${icon('mdi:pistol')}<span></span>${icon('mdi:bullet')}${icon('mdi:bullet')}${icon('mdi:bullet')}</div><div class="site-container footer-grid"><div>${logo()}<p>A responsible, member-first digital experience${demoMode ? ' prototype for stakeholder review' : ''}.</p><p class="footer-responsibility">Safe handling, secure storage, ongoing training and lawful compliance remain the responsibility of every firearm owner.</p></div><nav aria-label="Footer navigation"><strong>Explore</strong>${navigationLinks.slice(1).map(([path, label]) => `<a href="${path}" data-route>${label}</a>`).join('')}<a href="/resources#faq" data-route>FAQ</a></nav><div><strong>${demoMode ? 'Prototype' : 'Information'}</strong><button data-action="privacy">Privacy & POPIA</button><button data-action="terms">Terms</button>${demoMode ? '<button data-action="guide">Prototype guide</button>' : ''}<p class="social-placeholder">${icon('solar:global-linear')} Social profiles to be supplied by TGA.</p></div></div><div class="site-container footer-bottom"><span>© 2026 The Gun Association. ${demoMode ? 'Prototype copy for review.' : 'All rights reserved.'}</span>${demoMode ? '<b>Authentication, storage, payments and notifications are simulated.</b>' : ''}</div></footer>`;
}

function pageHero(eyebrow, title, text, asset = null, actions = '') {
  return `<section class="page-hero"><div class="technical-grid" aria-hidden="true"></div><div class="site-container page-hero__grid ${asset ? '' : 'page-hero__grid--single'}"><div class="page-hero__copy" data-reveal><span class="eyebrow">${eyebrow}</span><h1 id="page-title" tabindex="-1">${title}</h1><p>${text}</p>${actions ? `<div class="page-hero__actions">${actions}</div>` : ''}</div>${asset ? `<div class="page-hero__media" data-reveal>${picture(asset, 'image-frame', true)}</div>` : ''}</div></section>`;
}

function closingCta(title = 'Begin the journey or explore the working portal.') {
  return `<section class="closing-cta"><div class="site-container"><span class="eyebrow">Ready for stakeholder review</span><h2>${title}</h2><div><button class="button button--brass" data-action="apply">Join TGA</button><button class="button button--glass" data-action="login">Access member portal</button><button class="text-button text-button--light" data-action="consulting">Contact firearm consulting</button></div></div></section>`;
}

function reviewCards(limit = reviews.length) {
  return `<div class="review-stack">${reviews.slice(0, limit).map(([title, text]) => `<article><span>Review placeholder</span><h3>${title}</h3><p>${text}</p><dl><div><dt>Member</dt><dd>To be verified</dd></div><div><dt>Membership</dt><dd>To be verified</dd></div><div><dt>Province</dt><dd>To be verified</dd></div></dl></article>`).join('')}</div>`;
}

function homePage() {
  return `<main id="main-content">
    <section class="hero" aria-labelledby="hero-title">${picture(imageAssets.hero, 'hero-media', true)}<div class="hero-shade"></div><canvas data-webgl-scene aria-hidden="true"></canvas><div class="technical-grid" aria-hidden="true"></div><div class="site-container hero-content"><div class="hero-copy" data-reveal><span class="eyebrow">South African member experience prototype</span><h1 id="hero-title" tabindex="-1">Responsible Ownership.<br><em>Professional Support.</em><br>One Trusted Association.</h1><p>Membership, training, assessments, compliance support and secure digital services for South Africa's firearm community.</p><div class="hero-weapon-rail" role="note">${icon('mdi:pistol')}<span>Precision <b>•</b> Discipline <b>•</b> Responsibility</span>${icon('mdi:bullet')}${icon('mdi:bullet')}${icon('mdi:bullet')}</div><div class="hero-actions"><button class="button button--brass" data-action="apply">Join TGA ${icon('solar:arrow-right-linear')}</button><button class="button button--glass" data-action="login">Access member portal</button></div><ul class="hero-trust" aria-label="Prototype trust indicators"><li>${icon('solar:shield-check-linear')} Responsible participation</li><li>${icon('solar:lock-keyhole-linear')} Privacy-led design</li><li>${icon('solar:map-point-linear')} South African context</li></ul></div></div></section>
    <section class="credibility" aria-label="Proposed service capabilities"><div class="site-container credibility-grid">${credibilityItems.map(([name, label]) => `<div>${icon(name)}<span>${label}</span></div>`).join('')}</div></section>
    <section class="section section--panel"><div class="site-container">${sectionHeading('Explore TGA', 'Focused support without the endless scroll.', 'Move directly to the membership, learning, document or professional-support information you need.')}<div class="service-preview-grid">${services.map((service, index) => `<a href="${serviceRoutes[index]}" data-route data-reveal><b>0${index + 1}</b>${icon(service.icon)}<h3>${service.title}</h3><p>${service.text}</p><span>Explore ${icon('solar:arrow-right-linear')}</span></a>`).join('')}</div></div></section>
    <section class="section journey-section"><div class="site-container home-journey"><div>${sectionHeading('Membership journey', 'A clear route from application to everyday support.', 'Start with a concise view of the journey, then explore every stage on the membership page.')}<ol class="journey-list journey-list--preview">${journeySteps.slice(0, 3).map(([number, title, text]) => `<li data-reveal><span>${number}</span><div><h3>${title}</h3><p>${text}</p></div></li>`).join('')}</ol><a class="button button--outline" href="/membership#journey" data-route>View the full member journey</a></div><div class="journey-visual" data-reveal><div data-rive-fallback><span class="target-rings" aria-hidden="true"></span>${icon('solar:route-linear')}<strong>Member journey</strong><small>Applications, documents, assessment, payment, approval and ongoing support.</small></div></div></div></section>
    <section class="section community-section community-section--preview"><div class="site-container community-grid"><div data-reveal>${picture(imageAssets.community, 'image-frame')}</div><div>${sectionHeading('Member feedback', 'A place for verified member experiences.', 'This preview demonstrates future social proof without presenting invented endorsements.')} ${reviewCards(1)}<p class="prototype-notice">Replace every placeholder with a consented, verified member review before publishing.</p><a class="text-button route-text-link" href="/about#reviews" data-route>View the complete review layout ${icon('solar:arrow-right-linear')}</a></div></div></section>
    ${closingCta()}
  </main>`;
}

function aboutPage() {
  return `<main id="main-content">${pageHero('About The Gun Association', 'Supporting responsible, informed and connected members.', 'The Gun Association is presented as a member-focused organisation helping people navigate responsible firearm ownership, ongoing education and compliance with greater confidence.', imageAssets.safety)}
    <section class="section about-section"><div class="site-container editorial-grid"><div>${sectionHeading('Our proposed role', 'Practical support with responsible boundaries.', 'Where a matter needs case-specific advice, members are directed to appropriately qualified professionals. The prototype makes no sales, accreditation or legal-guarantee claims.')}</div><div class="pillar-list">${aboutPillars.map(([number, title, text]) => `<article data-reveal><span>${number}</span><div><h3>${title}</h3><p>${text}</p></div></article>`).join('')}</div></div></section>
    <section class="section community-section" id="reviews"><div class="site-container community-grid"><div data-reveal>${picture(imageAssets.community, 'image-frame')}</div><div>${sectionHeading('Member community', 'A place for real member experiences.', 'Verified reviews can be added here once TGA has obtained consent and approved every claim.')} ${reviewCards()}<p class="prototype-notice">Replace every placeholder with a consented, verified member review before publishing.</p></div></div></section>
    ${closingCta('Join a clearer, more connected member experience.')}
  </main>`;
}

function membershipPage() {
  return `<main id="main-content">${pageHero('TGA membership', 'A clearer membership journey from application to ongoing support.', 'The prototype brings requirements, progress, documents, assessments and member support into one connected experience.', imageAssets.community, '<button class="button button--brass" data-action="apply">Start an application</button><button class="button button--glass" data-action="login">Open the demo portal</button>')}
    <section class="section"><div class="site-container">${sectionHeading('Member benefits', 'Less administration. More clarity.', 'The proposed member experience makes routine requirements easier to understand and complete.')}<div class="benefit-grid">${memberBenefits.map(([name, title, text]) => `<article data-reveal>${icon(name)}<h3>${title}</h3><p>${text}</p></article>`).join('')}</div></div></section>
    <section class="section journey-section" id="journey"><div class="site-container journey-layout"><div>${sectionHeading('Membership journey', 'Six visible steps with no guesswork.', 'Each stage shows what is needed, what has been completed and what should happen next.')}<ol class="journey-list" data-journey-list>${journeySteps.map(([number, title, text]) => `<li data-reveal><span>${number}</span><div><h3>${title}</h3><p>${text}</p></div></li>`).join('')}</ol></div><div class="journey-visual" data-reveal><canvas data-rive-canvas data-rive-src="/rive/tga-journey.riv" aria-label="Optional animated membership journey"></canvas><div data-rive-fallback><span class="target-rings" aria-hidden="true"></span>${icon('solar:route-linear')}<strong>Member journey</strong><small>Approved Rive artwork can replace this static technical illustration.</small></div></div></div></section>
    <section class="section section--panel" id="plans"><div class="site-container">${sectionHeading('Illustrative membership', 'Simple options for stakeholder review.', 'TGA must verify categories, eligibility, inclusions and all fees before publication.')}<div class="pricing-grid">${membershipPlans.map((plan) => `<article class="price-card ${plan.featured ? 'is-featured' : ''}" data-reveal>${plan.featured ? '<span class="prototype-badge">Featured prototype</span>' : ''}<p>${plan.name}</p><h3>${plan.price}</h3><small>${plan.period}</small><ul>${plan.items.map((item) => `<li>${icon('solar:check-circle-linear')}${item}</li>`).join('')}</ul><button class="button ${plan.featured ? 'button--brass' : 'button--outline'}" data-action="apply">Start an application</button></article>`).join('')}</div><p class="prototype-notice">Payments and prices are illustrative. No card or banking information is requested by this prototype.</p></div></section>
    ${closingCta('Choose a membership path or explore the working portal.')}
  </main>`;
}

function trainingPage() {
  return `<main id="main-content">${pageHero('Training and education', 'Build confidence through approved learning pathways.', 'The prototype demonstrates how verified training information, assigned assessments and results can be presented without implying unconfirmed accreditation.', imageAssets.assessment, '<button class="button button--brass" data-action="login">View member assessments</button>')}
    <section class="section"><div class="site-container split-feature__grid"><div>${sectionHeading('Learning pathways', 'Clear information before and after training.', 'Provider details, course availability and accreditation claims remain placeholders until TGA supplies verified information.')}<ul class="check-list"><li>${icon('solar:check-circle-linear')} Safety and competency information</li><li>${icon('solar:check-circle-linear')} Training-provider placeholders</li><li>${icon('solar:check-circle-linear')} Assessment progress and result history</li><li>${icon('solar:check-circle-linear')} Human support when guidance is required</li></ul></div><aside class="training-boundary" data-reveal>${icon('solar:shield-check-linear')}<h2>Responsible by design</h2><p>The site provides general learning and portal guidance. It does not provide tactical instruction, certification guarantees or case-specific legal advice.</p></aside></div></section>
    <section class="section section--panel" id="assessments"><div class="site-container assessment-callout"><div>${sectionHeading('Online assessments', 'Structured, visible and ready for TGA-approved content.', 'Members can complete an assigned foundation assessment, view the stated pass mark and retain a local demonstration result.')}<div class="progress-demo" aria-label="Illustrative assessment progress"><span><i style="width:72%"></i></span><div><strong>72% complete</strong><small>Illustrative progress only</small></div></div><button class="button button--brass" data-action="login">Open the demo portal</button></div><aside><span>ASSESSMENT 01</span><strong>Safety & Compliance Foundation</strong><p>5 demonstration questions · 80% pass mark</p>${icon('solar:clipboard-check-linear')}</aside></div></section>
    ${closingCta('Continue learning or open the member assessment experience.')}
  </main>`;
}

function resourcesPage() {
  return `<main id="main-content">${pageHero('Resources and compliance', 'Responsible information, document clarity and appropriate support.', 'Explore the prototype’s general guidance for assessments, compliance documents, secure storage and lawful participation.', imageAssets.storage)}
    <section class="section" id="compliance"><div class="site-container editorial-grid editorial-grid--reverse"><div class="editorial-media" data-reveal>${picture(imageAssets.consultation, 'image-frame')}<div class="media-note"><strong>Prototype privacy boundary</strong><span>No application or file contents are transmitted.</span></div></div><div>${sectionHeading('Compliance support', 'Documents handled with clarity and appropriate caution.', 'The member experience demonstrates document checklists, upload validation, visible review states and professional escalation. Production controls require security and legal approval.')}<div class="compliance-points"><article>${icon('solar:folder-security-linear')}<h3>Private by intent</h3><p>Encrypted storage, access control and malware scanning remain backend requirements.</p></article><article>${icon('solar:history-linear')}<h3>Visible review trail</h3><p>Members can understand document status, expiry and requested changes.</p></article></div><button class="text-button" data-action="privacy">Read the prototype privacy notice ${icon('solar:arrow-right-linear')}</button></div></div></section>
    <section class="section section--panel" id="assessments"><div class="site-container assessment-callout"><div>${sectionHeading('Assessment resources', 'Understand the demonstration assessment journey.', 'Approved questions, pass marks, validity periods and retake policies must be supplied by TGA before publication.')}<p class="resource-copy">The member portal demonstrates assigned assessments, visible progress, local results and administrator review.</p><a class="button button--outline" href="/training#assessments" data-route>Explore training and assessments</a></div><aside><span>GENERAL GUIDANCE</span><strong>Approved content required</strong><p>No accreditation or competency outcome is claimed.</p>${icon('solar:notebook-linear')}</aside></div></section>
    <section class="section ownership-section" id="ownership"><div class="site-container">${sectionHeading('Responsible ownership', 'Safety, secure storage and lawful participation come first.', 'The public experience promotes calm, responsible participation and directs authoritative questions to qualified professionals or relevant authorities.')}<div class="ownership-grid">${responsiblePrinciples.map(([name, title, text]) => `<article data-reveal>${icon(name)}<h3>${title}</h3><p>${text}</p></article>`).join('')}</div></div></section>
    <section class="section section--panel" id="faq"><div class="site-container faq-container">${sectionHeading('Frequently asked questions', 'Useful information before you begin.', 'General prototype guidance only. TGA must approve final requirements and wording.')}<div class="faq-list">${faqs.map(([question, answer]) => `<details><summary>${question}${icon('solar:add-circle-linear')}</summary><p>${answer}</p></details>`).join('')}</div></div></section>
    ${closingCta('Find the right information or ask for appropriate professional support.')}
  </main>`;
}

function contactPage() {
  return `<main id="main-content">${pageHero('Contact TGA', 'Clear routes to the right support.', 'Verified contact information has not yet been supplied. These placeholders show how future enquiries will be directed without inventing details.', null, '<button class="button button--brass" data-action="apply">Start an application</button><button class="button button--glass" data-action="login">Member login</button>')}
    <section class="section"><div class="site-container">${sectionHeading('Contact pathways', 'Choose the support route that fits your question.', 'Email addresses, telephone numbers and booking links remain pending TGA verification.')}<div class="contact-grid">${contactPlaceholders.map(([title, text], index) => `<article data-reveal><span>0${index + 1}</span><h3>${title}</h3><p>${text}</p><small>Contact details pending TGA approval</small></article>`).join('')}</div></div></section>
    <section class="section section--panel" id="professional-assistance"><div class="site-container contact-boundary">${sectionHeading('Professional assistance', 'General support stops where case-specific advice begins.', 'Members should be directed to appropriately qualified professionals or relevant authorities when an enquiry requires legal, licensing or other case-specific advice.')}<button class="button button--outline" data-action="consulting">View consulting placeholder</button></div></section>
    ${closingCta('Start an application, open the portal or find the right support route.')}
  </main>`;
}

function notFoundPage() {
  return `<main id="main-content">${pageHero('Page not found', 'That page is not part of this prototype.', 'Use the main navigation or return to the homepage to continue exploring The Gun Association member experience.', null, '<a class="button button--brass" href="/" data-route>Return home</a>')}</main>`;
}

const pageRenderers = Object.freeze({ '/': homePage, '/about': aboutPage, '/membership': membershipPage, '/training': trainingPage, '/resources': resourcesPage, '/contact': contactPage });

export function publicTemplate(path = '/', demoMode = true) {
  const page = pageRenderers[path]?.() || notFoundPage();
  return `<div class="public-site" id="top">${publicHeader(path, demoMode)}${page}${publicFooter(demoMode)}<button class="chat-launcher" type="button" data-action="chat" aria-label="Open TGA prototype assistant">${icon('solar:chat-round-dots-bold')}<span>Ask TGA</span></button></div>`;
}

export function loginTemplate(rememberedEmail = '', demoMode = true) {
  return `<main id="main-content" class="login-screen"><section class="login-visual">${picture(imageAssets.safety, 'login-image', true)}<div class="login-visual__shade"></div><a href="#top" data-action="home" class="login-brand">${logo()}</a><div><span class="eyebrow">Secure member services prototype</span><h1>Clarity and control,<br>from one member record.</h1><p>Access documents, assessments, payments and support through the demonstration portal.</p><ul><li>${icon('solar:shield-check-linear')} Privacy-led interface</li><li>${icon('solar:user-check-linear')} Role-specific experience</li><li>${icon('solar:lock-keyhole-linear')} No production data is stored</li></ul></div></section>
    <section class="login-panel"><button class="back-button" data-action="home">${icon('solar:arrow-left-linear')} Back to website</button><div class="login-card"><span class="eyebrow">Member access</span><h2>Welcome back.</h2><p>Sign in with one of the exact stakeholder demo accounts.</p><form id="login-form" novalidate>
      <label>Email address<span>*</span><input name="email" type="email" autocomplete="username" value="${escapeHtml(rememberedEmail || 'member@tga.co.za')}" required aria-describedby="login-error"></label>
      <label>Password<span>*</span><span class="password-field"><input name="password" type="password" autocomplete="current-password" value="${rememberedEmail ? '' : 'demo123'}" required minlength="7" aria-describedby="login-error"><button type="button" data-action="toggle-password" aria-label="Show password">${icon('solar:eye-linear')}</button></span></label>
      <div class="login-options"><label class="check-label"><input name="remember" type="checkbox" ${rememberedEmail ? 'checked' : ''}> Remember my email</label><button type="button" class="text-button" data-action="forgot-password">Forgot password?</button></div>
      <p class="form-error" id="login-error" role="alert" hidden></p><button class="button button--brass button--full" type="submit">Sign in ${icon('solar:login-2-linear')}</button>
    </form>
    ${demoMode ? '<div class="demo-accounts"><p>Stakeholder demo accounts</p><button data-demo-role="member"><strong>Member portal</strong><span>member@tga.co.za · demo123</span></button><button data-demo-role="admin"><strong>Administrator portal</strong><span>admin@tga.co.za · admin123</span></button></div>' : ''}
    <aside>${icon('solar:info-circle-linear')} This is not production authentication. Credentials and role checks run only in the browser.</aside></div></section></main>`;
}

const statusBadge = (status) => `<span class="status status--${status.toLowerCase().replaceAll(' ', '-').replaceAll('/', '-')}">${escapeHtml(status)}</span>`;
const initials = (name) => escapeHtml(name.split(' ').map((part) => part[0]).join('').slice(0, 2));

function metric(iconName, label, value, note) {
  return `<article class="metric-card" data-reveal>${icon(iconName)}<span>${label}</span><strong>${value}</strong><small>${note}</small></article>`;
}

function pageHeading(eyebrow, title, text, actions = '') {
  return `<header class="portal-page-heading"><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${text}</p></div>${actions}</header>`;
}

function memberNav(active) {
  return [['overview','solar:widget-2-linear','Overview'],['documents','solar:folder-with-files-linear','Documents'],['assessments','solar:clipboard-list-linear','Assessments'],['payments','solar:card-linear','Payments'],['profile','solar:user-id-linear','My profile']].map(([id, iconName, label]) => `<button data-portal-section="${id}" ${active === id ? 'class="active" aria-current="page"' : ''}>${icon(iconName)}<span>${label}</span></button>`).join('');
}

function adminNav(active) {
  return [['dashboard','solar:graph-up-linear','Dashboard'],['members','solar:users-group-rounded-linear','Members'],['reviews','solar:folder-check-linear','Document reviews'],['assessments','solar:clipboard-check-linear','Assessments'],['payments','solar:card-linear','Payments']].map(([id, iconName, label]) => `<button data-portal-section="${id}" ${active === id ? 'class="active" aria-current="page"' : ''}>${icon(iconName)}<span>${label}</span></button>`).join('');
}

function portalNavigation(state) {
  const nav = state.role === 'admin' ? adminNav(state.active) : memberNav(state.active);
  return `<nav aria-label="${state.role === 'admin' ? 'Administrator' : 'Member'} portal navigation">${nav}</nav><div class="sidebar-actions"><button data-action="support">${icon('solar:chat-round-call-linear')}<span>Contact support</span></button><button data-action="logout">${icon('solar:logout-2-linear')}<span>Sign out</span></button></div>`;
}

function memberOverview() {
  return `${pageHeading('Member portal', 'Good day, Anele', 'Here is the current state of your illustrative TGA membership.', '<button class="button button--brass" data-action="upload">Upload a document</button>')}
    <div class="portal-grid portal-grid--overview"><article class="membership-card"><iconify-icon class="member-card-pistol" icon="mdi:pistol" aria-hidden="true"></iconify-icon><span>THE GUN ASSOCIATION</span><small>Professional member</small><strong>Anele Dlamini</strong><p>TGA-2026-1048</p><div><b>ACTIVE</b><span>Valid to 31 July 2027</span></div></article><article class="status-card"><header><span>Membership status</span>${statusBadge('Active')}</header><div class="target-progress" style="--progress:82"><span>82%</span></div><h2>Almost complete</h2><p>One compliance document is still in review.</p><button class="text-button" data-action="open-documents">View documents ${icon('solar:arrow-right-linear')}</button></article></div>
    <div class="metric-grid">${metric('solar:folder-with-files-linear','Documents','4','3 approved · 1 in review')}${metric('solar:clipboard-check-linear','Latest assessment','92%','Foundation assessment passed')}${metric('solar:card-linear','Payments','Paid','Receipt TGA-PF-002841')}${metric('solar:calendar-linear','Renewal','31 Jul 2027','Reminder settings active')}</div>
    <div class="portal-content-grid"><section class="panel"><header><div><span class="eyebrow">Next actions</span><h2>Keep your record current</h2></div></header><div class="quick-actions"><button data-action="upload">${icon('solar:upload-linear')}<span><strong>Upload document</strong><small>Add a replacement or supporting record</small></span>${icon('solar:arrow-right-linear')}</button><button data-action="assessment">${icon('solar:clipboard-list-linear')}<span><strong>Complete assessment</strong><small>Open the five-question demonstration</small></span>${icon('solar:arrow-right-linear')}</button><button data-action="payment">${icon('solar:card-linear')}<span><strong>View payment demo</strong><small>Preview the simulated checkout</small></span>${icon('solar:arrow-right-linear')}</button></div></section><section class="panel"><header><div><span class="eyebrow">Recent activity</span><h2>Your latest updates</h2></div></header><ol class="activity-list"><li><span></span><div><strong>Compliance certificate submitted</strong><small>19 Jul 2026 · In review</small></div></li><li><span></span><div><strong>Foundation assessment passed</strong><small>18 Jul 2026 · 92%</small></div></li><li><span></span><div><strong>Annual payment recorded</strong><small>18 Jul 2026 · Simulated</small></div></li></ol></section></div>`;
}

function memberDocuments(state) {
  const rows = state.documents.map((doc) => `<tr><td data-label="Document"><strong>${escapeHtml(doc.name)}</strong><small>${escapeHtml(doc.type)}</small></td><td data-label="Submitted">${escapeHtml(doc.date)}</td><td data-label="Size">${escapeHtml(doc.size)}</td><td data-label="Status">${statusBadge(doc.status)}</td><td><button class="icon-button" data-action="document-detail" data-document-id="${doc.id}" aria-label="View ${escapeHtml(doc.name)}">${icon('solar:eye-linear')}</button></td></tr>`).join('');
  return `${pageHeading('Member portal', 'Documents', 'Upload and monitor the records connected to this demonstration membership.', '<button class="button button--brass" data-action="upload">Upload document</button>')}<section class="panel"><div class="panel-notice">${icon('solar:shield-check-linear')} <span><strong>Metadata-only prototype</strong> Selected file contents never leave this browser.</span></div><div class="responsive-table"><table><caption class="visually-hidden">Member document list</caption><thead><tr><th>Document</th><th>Submitted</th><th>Size</th><th>Status</th><th><span class="visually-hidden">Actions</span></th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
}

function memberAssessments(state) {
  const result = state.testResult;
  return `${pageHeading('Member portal', 'Assessments', 'Complete assigned learning checks and review your latest demonstration result.')}<div class="assessment-card"><div><span class="eyebrow">Assigned assessment</span><h2>Safety & Compliance Foundation</h2><p>Five general safety, document and escalation questions.</p><div class="assessment-meta"><span>${icon('solar:clock-circle-linear')} No time limit</span><span>${icon('solar:target-linear')} 80% pass mark</span><span>${icon('solar:restart-linear')} Demo retakes allowed</span></div><button class="button button--brass" data-action="assessment">${result === null ? 'Start assessment' : 'Retake assessment'}</button></div><aside><span class="target-progress target-progress--large" style="--progress:${result ?? 0}"><b>${result === null ? '—' : `${result}%`}</b></span><strong>${result === null ? 'Not attempted' : result >= 80 ? 'Passed' : 'Retake required'}</strong><small>Latest local result</small></aside></div><section class="panel"><header><h2>Assessment boundaries</h2></header><p>This five-question exercise is not accredited training, competency certification or legal advice. TGA must approve production content and rules.</p></section>`;
}

function memberPayments() {
  return `${pageHeading('Member portal', 'Payments', 'Review illustrative membership transactions and preview the payment journey.', '<button class="button button--brass" data-action="payment">Open payment demo</button>')}<div class="metric-grid metric-grid--three">${metric('solar:check-circle-linear','Current balance','R0.00','No illustrative amount due')}${metric('solar:receipt-linear','Latest receipt','R750.00','TGA-PF-002841')}${metric('solar:calendar-linear','Next renewal','31 Jul 2027','Reminder not yet connected')}</div><section class="panel"><header><h2>Transaction history</h2><span class="prototype-badge">Simulated</span></header><div class="responsive-table"><table><caption class="visually-hidden">Payment history</caption><thead><tr><th>Reference</th><th>Description</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead><tbody><tr><td data-label="Reference">TGA-PF-002841</td><td data-label="Description">Professional annual membership</td><td data-label="Date">18 Jul 2026</td><td data-label="Amount">R750.00</td><td data-label="Status">${statusBadge('Paid')}</td></tr></tbody></table></div></section>`;
}

function memberProfile() {
  return `${pageHeading('Member portal', 'My profile', 'Illustrative personal and communication information held in this browser view.')}<form class="panel profile-form" id="profile-form"><div class="form-grid"><label>First name<span>*</span><input name="firstName" value="Anele" required></label><label>Surname<span>*</span><input name="surname" value="Dlamini" required></label><label>Email address<span>*</span><input name="email" type="email" value="anele.dlamini@example.com" required></label><label>Mobile number<span>*</span><input name="mobile" type="tel" value="082 000 0000" required></label><label>Province<select name="province">${provinces.map((province) => `<option ${province === 'Gauteng' ? 'selected' : ''}>${province}</option>`).join('')}</select></label><label>Preferred communication<select name="communication"><option>Email</option><option>SMS</option><option>Telephone</option></select></label></div><label>Address<textarea name="address" rows="3">Illustrative address only — no real personal information.</textarea></label><div class="form-actions"><p>Changes are not sent to a server.</p><button class="button button--brass" type="submit">Save prototype profile</button></div></form>`;
}

function memberPage(state) {
  const pages = { overview: memberOverview, documents: () => memberDocuments(state), assessments: () => memberAssessments(state), payments: memberPayments, profile: memberProfile };
  return (pages[state.active] || pages.overview)();
}

export function memberRows(members) {
  if (!members.length) return '<tr><td colspan="7"><div class="empty-state"><strong>No matching members</strong><span>Clear the search or choose another status.</span></div></td></tr>';
  return members.map((member) => `<tr><td data-label="Member"><div class="table-person"><span>${initials(member.name)}</span><div><strong>${escapeHtml(member.name)}</strong><small>${escapeHtml(member.id)}</small></div></div></td><td data-label="Plan">${escapeHtml(member.plan)}</td><td data-label="Status">${statusBadge(member.status)}</td><td data-label="Documents">${member.documents}</td><td data-label="Assessment">${escapeHtml(member.assessment)}</td><td data-label="Expiry">${escapeHtml(member.expiry)}</td><td><button class="icon-button" data-member-id="${escapeHtml(member.id)}" aria-label="Open ${escapeHtml(member.name)} record">${icon('solar:arrow-right-up-linear')}</button></td></tr>`).join('');
}

function adminDashboard(state) {
  return `${pageHeading('Administrator portal', 'Operations dashboard', 'Illustrative association activity requiring review and follow-up.', '<button class="button button--outline" data-action="export-members">Export CSV</button>')}<div class="metric-grid">${metric('solar:users-group-rounded-linear','Total members','1,284','Illustrative records')}${metric('solar:user-check-linear','Active memberships','1,116','86.9% of total')}${metric('solar:hourglass-linear','Pending applications','37','12 need action today')}${metric('solar:folder-with-files-linear','Documents to review','54','Oldest waiting: 2 days')}</div><div class="portal-content-grid"><section class="panel"><header><div><span class="eyebrow">Membership status</span><h2>Current distribution</h2></div></header><div class="bar-chart" role="img" aria-label="Illustrative membership status distribution"><div style="--bar:87"><span>Active</span><i></i><b>1,116</b></div><div style="--bar:12"><span>Pending</span><i></i><b>94</b></div><div style="--bar:7"><span>Expired</span><i></i><b>74</b></div></div></section><section class="panel"><header><div><span class="eyebrow">Action queue</span><h2>Requires attention</h2></div></header><div class="queue-list"><button data-portal-section="reviews"><span>${icon('solar:folder-check-linear')}<b>Document reviews</b></span><strong>54</strong></button><button data-portal-section="members"><span>${icon('solar:user-plus-linear')}<b>New applications</b></span><strong>37</strong></button><button data-portal-section="payments"><span>${icon('solar:card-linear')}<b>Outstanding payments</b></span><strong>31</strong></button></div></section></div><section class="panel"><header><div><span class="eyebrow">Recent registrations</span><h2>Latest member records</h2></div><button class="text-button" data-portal-section="members">View all members</button></header><div class="responsive-table"><table><caption class="visually-hidden">Recent member records</caption><thead><tr><th>Member</th><th>Plan</th><th>Status</th><th>Documents</th><th>Assessment</th><th>Expiry</th><th><span class="visually-hidden">Actions</span></th></tr></thead><tbody>${memberRows(state.members.slice(0, 5))}</tbody></table></div></section>`;
}

function adminMembers(state, filteredMembers) {
  return `${pageHeading('Administrator portal', 'Member management', 'Search, filter, review and update illustrative member records.', '<button class="button button--brass" data-action="export-members">Export CSV</button>')}<section class="panel"><div class="table-toolbar"><label class="search-field">${icon('solar:magnifer-linear')}<span class="visually-hidden">Search members</span><input id="member-search" type="search" placeholder="Search name, email or member number" value="${escapeHtml(state.memberQuery)}"></label><label><span class="visually-hidden">Filter by status</span><select id="member-status"><option>All statuses</option>${['Active','Pending review','Payment due','Expired','Suspended'].map((status) => `<option ${state.memberStatus === status ? 'selected' : ''}>${status}</option>`).join('')}</select></label></div><p class="table-result-count" id="member-result-count">${filteredMembers.length} illustrative records shown</p><div class="responsive-table"><table><caption class="visually-hidden">Member management list</caption><thead><tr><th>Member</th><th>Plan</th><th>Status</th><th>Documents</th><th>Assessment</th><th>Expiry</th><th><span class="visually-hidden">Actions</span></th></tr></thead><tbody id="member-table-body">${memberRows(filteredMembers)}</tbody></table></div></section>`;
}

function adminReviews() {
  const reviewRows = [['Megan Jacobs','TGA-2026-1047','Identity document'],['Thandiwe Ncube','TGA-2026-1043','Proof of address'],['Ryan Botha','TGA-2026-1039','Competency certificate']];
  return `${pageHeading('Administrator portal', 'Document review queue', 'Process illustrative documents and maintain a visible review trail.')}<section class="panel"><div class="review-list">${reviewRows.map(([name,id,type]) => `<article><div class="table-person"><span>${initials(name)}</span><div><strong>${name}</strong><small>${id}</small></div></div><div><strong>${type}</strong><small>PDF · prototype metadata</small></div><div class="review-actions"><button class="button button--small button--brass" data-action="approve-document">Approve</button><button class="button button--small button--outline" data-action="request-changes">Request changes</button></div></article>`).join('')}</div></section>`;
}

function adminAssessments(state) {
  return `${pageHeading('Administrator portal', 'Assessment management', 'Track illustrative completion, results and assigned learning checks.')}<div class="metric-grid metric-grid--three">${metric('solar:clipboard-list-linear','Assigned this month','116','89 completed')}${metric('solar:graph-up-linear','Average score','86%','Illustrative result')}${metric('solar:check-circle-linear','Pass rate','91%','8 require a retake')}</div><section class="panel"><header><h2>Latest assessment results</h2></header><div class="responsive-table"><table><caption class="visually-hidden">Latest assessment results</caption><thead><tr><th>Member</th><th>Assessment</th><th>Score</th><th>Status</th></tr></thead><tbody>${state.members.filter((member) => member.assessment === 'Passed').slice(0,4).map((member,index) => `<tr><td data-label="Member"><strong>${member.name}</strong><small>${member.id}</small></td><td data-label="Assessment">Safety & Compliance Foundation</td><td data-label="Score">${[92,84,96,88][index]}%</td><td data-label="Status">${statusBadge('Passed')}</td></tr>`).join('')}</tbody></table></div></section>`;
}

function adminPayments(state) {
  return `${pageHeading('Administrator portal', 'Payment management', 'Monitor simulated transactions, renewals and outstanding balances.')}<div class="metric-grid metric-grid--three">${metric('solar:card-2-linear','Successful payments','R94,650','126 transactions')}${metric('solar:clock-circle-linear','Outstanding','R18,900','31 member balances')}${metric('solar:danger-circle-linear','Failed or cancelled','7','Follow-up required')}</div><section class="panel"><header><h2>Recent transactions</h2><span class="prototype-badge">Simulated</span></header><div class="responsive-table"><table><caption class="visually-hidden">Recent simulated transactions</caption><thead><tr><th>Reference</th><th>Member</th><th>Description</th><th>Amount</th><th>Status</th></tr></thead><tbody>${state.members.slice(0,4).map((member,index) => `<tr><td data-label="Reference">TGA-PF-00${2841-index}</td><td data-label="Member"><strong>${member.name}</strong><small>${member.id}</small></td><td data-label="Description">${member.plan} annual membership</td><td data-label="Amount">${member.plan === 'Professional' ? 'R750.00' : 'R450.00'}</td><td data-label="Status">${statusBadge(index === 3 ? 'Failed' : 'Paid')}</td></tr>`).join('')}</tbody></table></div></section>`;
}

function adminPage(state, filteredMembers) {
  const pages = { dashboard: () => adminDashboard(state), members: () => adminMembers(state, filteredMembers), reviews: adminReviews, assessments: () => adminAssessments(state), payments: () => adminPayments(state) };
  return (pages[state.active] || pages.dashboard)();
}

export function portalTemplate(state, filteredMembers) {
  const nav = portalNavigation(state);
  return `<div class="portal-shell"><aside class="portal-sidebar"><a class="brand-link" href="#" data-action="home">${logo()}</a><span class="portal-role">${state.role === 'admin' ? 'Administrator portal' : 'Member portal'}</span>${weaponMark('portal-weapon-mark')}${nav}</aside><header class="portal-topbar"><button class="menu-button" data-action="open-portal-menu" aria-expanded="false" aria-controls="portal-mobile-dialog" aria-label="Open portal menu">${icon('solar:hamburger-menu-linear')}</button>${logo(false)}${weaponMark('topbar-weapon-mark')}<div><button class="icon-button" data-action="notifications" aria-label="View prototype notifications">${icon('solar:bell-linear')}<span></span></button><span class="user-chip"><b>${state.role === 'admin' ? 'TG' : 'AD'}</b><small>${state.role === 'admin' ? 'TGA Administrator' : 'Anele Dlamini'}</small></span></div></header><main id="main-content" class="portal-main">${state.role === 'admin' ? adminPage(state, filteredMembers) : memberPage(state)}</main><dialog class="portal-drawer" id="portal-mobile-dialog" aria-label="Portal menu"><div><header>${logo()}<button class="icon-button" data-action="close-portal-menu" aria-label="Close portal menu">${icon('solar:close-circle-linear')}</button></header><span class="portal-role">${state.role === 'admin' ? 'Administrator portal' : 'Member portal'}</span>${weaponMark('portal-weapon-mark')}${nav}</div></dialog></div>`;
}

export function privacyContent() {
  return `<div class="information-modal"><p class="information-intro">This draft explains the demonstration boundary and intended production direction. It requires legal approval before publication.</p><section><span>01</span><div><h3>What this prototype does</h3><p>Application information is not transmitted or stored. Uploaded file contents are never transferred; safe display metadata can remain on this device.</p></div></section><section><span>02</span><div><h3>Intended production purpose</h3><p>Approved information would support membership administration, document review, assessments, payments, renewals, support and required communications.</p></div></section><section><span>03</span><div><h3>Required POPIA-aligned controls</h3><p>Role-based access, private storage, audit logging, retention, correction, deletion and incident processes must be designed and legally reviewed.</p></div></section><aside><strong>Draft — not legal advice</strong><p>TGA and its legal advisers must approve final wording, lawful bases, retention periods and data-subject processes.</p></aside></div>`;
}

export function termsContent() {
  return `<div class="information-modal"><p class="information-intro">Prototype terms placeholder for stakeholder review.</p><section><span>01</span><div><h3>Demonstration use</h3><p>All accounts, records, prices, results and transactions are illustrative and must not be treated as a live TGA service.</p></div></section><section><span>02</span><div><h3>No professional guarantee</h3><p>General portal guidance does not replace authoritative legal, licensing, training or case-specific professional advice.</p></div></section><section><span>03</span><div><h3>Approval required</h3><p>TGA must supply and legally approve production terms, acceptable-use rules, refund terms and membership conditions.</p></div></section></div>`;
}

export function guideContent() {
  return `<div class="guide-modal"><p>Suggested stakeholder walkthroughs for this static demonstration.</p><div><section><span>01</span><h3>Public application</h3><p>Choose Join TGA, complete both steps, review privacy consent and submit. Nothing is sent.</p></section><section><span>02</span><h3>Member portal</h3><code>member@tga.co.za</code><code>demo123</code><p>Explore documents, assessment, payment and profile states.</p></section><section><span>03</span><h3>Administrator portal</h3><code>admin@tga.co.za</code><code>admin123</code><p>Explore member filters, reviews, status changes and CSV export.</p></section></div><aside><h3>Prototype limitations</h3><ul><li>Authentication and roles are browser simulations.</li><li>No backend database or private file storage is connected.</li><li>Payments, receipts, notifications and support requests are simulated.</li><li>Rive loads only when approved artwork is supplied.</li><li>Records, pricing, metrics, reviews and contact details are illustrative.</li></ul></aside></div>`;
}

export function applicationContent(step = 1) {
  return `<form id="application-form" class="dialog-form application-form" data-step="${step}" novalidate><div class="stepper" aria-label="Application progress"><span class="active">1 <b>Applicant</b></span><i></i><span class="${step === 2 ? 'active' : ''}">2 <b>Membership</b></span></div><div class="application-step" data-form-step="1" ${step === 2 ? 'hidden' : ''}><div class="form-grid"><label>First name<span>*</span><input name="firstName" autocomplete="given-name" required></label><label>Surname<span>*</span><input name="surname" autocomplete="family-name" required></label><label>South African ID or passport<span>*</span><input name="identity" inputmode="text" minlength="6" required></label><label>Email address<span>*</span><input name="email" type="email" autocomplete="email" required></label><label>Mobile number<span>*</span><input name="mobile" type="tel" autocomplete="tel" required></label><label>Province<span>*</span><select name="province" required><option value="">Select a province</option>${provinces.map((province) => `<option>${province}</option>`).join('')}</select></label></div><div class="form-actions"><small>Fields marked * are required.</small><button type="button" class="button button--brass" data-action="application-next">Continue</button></div></div><div class="application-step" data-form-step="2" ${step === 1 ? 'hidden' : ''}><div class="form-grid"><label>Membership interest<span>*</span><select name="membership" required><option>Annual membership</option><option>Professional membership</option><option>I need advice first</option></select></label><label>Competency status<select name="competency"><option>Not supplied</option><option>In progress</option><option>Current</option><option>Expired</option></select></label><label>Firearm interest category<select name="interest"><option>Sport shooting</option><option>Hunting</option><option>Responsible ownership</option><option>Training and competency</option><option>Other</option></select></label><label>Preferred communication<select name="communication"><option>Email</option><option>SMS</option><option>Telephone</option></select></label></div><label class="check-label consent-field"><input name="consent" type="checkbox" required> I understand this is a prototype and accept the draft privacy notice.</label><button class="text-button" type="button" data-action="privacy">Read prototype privacy notice</button><p class="form-error" data-form-error role="alert" hidden></p><div class="form-actions"><button type="button" class="button button--outline" data-action="application-back">Back</button><button type="submit" class="button button--brass">Create prototype application</button></div></div><small>No information is transmitted or stored by this form.</small></form>`;
}

export function assessmentContent(questions) {
  return `<form id="assessment-form" class="assessment-form"><div class="test-meta"><span>${questions.length} questions</span><span>Pass mark: 80%</span><span>Prototype only</span></div>${questions.map(([question, options], index) => `<fieldset><legend><span>${index + 1}</span>${question}</legend>${options.map((option, optionIndex) => `<label><input type="radio" name="question-${index}" value="${optionIndex}" required>${option}</label>`).join('')}</fieldset>`).join('')}<button class="button button--brass" type="submit">Submit assessment</button></form>`;
}

export function uploadContent() {
  return `<form id="upload-form" class="dialog-form" novalidate><label>Document type<span>*</span><select name="type" required><option>Identity</option><option>Address</option><option>Compliance</option><option>Profile</option><option>Other</option></select></label><label class="file-picker"><input name="file" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" required><span>${icon('solar:upload-linear')}<strong>Select a file</strong><small>PDF, JPG or PNG · maximum 5 MB</small></span></label><p class="selected-file" data-selected-file aria-live="polite">No file selected</p><label class="check-label consent-field"><input name="uploadConsent" type="checkbox" required> I consent to this prototype processing the selected file locally for validation. File contents are not uploaded or retained.</label><p class="form-error" data-form-error role="alert" hidden></p><aside>${icon('solar:shield-check-linear')} Production requires encryption, malware scanning, access control, retention rules and private storage.</aside><button class="button button--brass" type="submit">Submit for prototype review</button></form>`;
}

export function paymentContent() {
  return `<div class="payment-dialog"><span class="prototype-badge">Simulated checkout</span><div><span>Professional annual membership</span><strong>R750.00</strong></div><p>A production service would create a PayFast request on the server, verify signatures and amounts, and process ITN callbacks idempotently.</p><b>PayFast-ready journey <small>No gateway is connected</small></b><button class="button button--brass" data-action="simulate-payment">Simulate successful payment</button><small>No card or banking details are requested.</small></div>`;
}

export function memberDetailContent(member) {
  return `<div class="member-detail"><div class="table-person"><span>${initials(member.name)}</span><div><h3>${escapeHtml(member.name)}</h3><p>${escapeHtml(member.id)} · ${escapeHtml(member.email)}</p></div></div><dl><div><dt>Membership plan</dt><dd>${escapeHtml(member.plan)}</dd></div><div><dt>Status</dt><dd>${statusBadge(member.status)}</dd></div><div><dt>Province</dt><dd>${escapeHtml(member.province)}</dd></div><div><dt>Expiry</dt><dd>${escapeHtml(member.expiry)}</dd></div><div><dt>Documents</dt><dd>${member.documents} uploaded</dd></div><div><dt>Assessment</dt><dd>${escapeHtml(member.assessment)}</dd></div></dl><label>Update prototype status<select data-update-member="${escapeHtml(member.id)}"><option ${member.status === 'Active' ? 'selected' : ''}>Active</option><option ${member.status === 'Pending review' ? 'selected' : ''}>Pending review</option><option ${member.status === 'Payment due' ? 'selected' : ''}>Payment due</option><option ${member.status === 'Expired' ? 'selected' : ''}>Expired</option><option ${member.status === 'Suspended' ? 'selected' : ''}>Suspended</option></select></label><p class="prototype-notice">This change affects browser memory only.</p></div>`;
}

export function chatContent() {
  return `<div class="chat-dialog"><p>Choose a topic or ask a general portal question. The assistant does not provide legal, tactical or case-specific advice.</p><div class="chat-topics">${chatTopics.map(([topic]) => `<button type="button" data-chat-topic="${escapeHtml(topic)}">${topic}</button>`).join('')}</div><div class="chat-transcript" aria-live="polite"><div class="chat-message chat-message--assistant">Hello. How can I help with the TGA prototype?</div></div><form id="chat-form"><label>Your question<textarea name="message" rows="3" required placeholder="Ask about membership, documents, assessments or payments"></textarea></label><button class="button button--brass" type="submit">Send question</button></form></div>`;
}
