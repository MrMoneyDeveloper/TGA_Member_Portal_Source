import 'iconify-icon';
import './styles.css';
import { publicConfig } from './config.js';
import { assessmentQuestions, chatTopics, demoMembers, demoUsers, initialDocuments } from './data.js';
import { destroyViewEffects, flipCard, initialiseViewEffects } from './effects.js';
import {
  applicationContent,
  assessmentContent,
  chatContent,
  escapeHtml,
  guideContent,
  loginTemplate,
  memberDetailContent,
  memberRows,
  paymentContent,
  portalTemplate,
  privacyContent,
  publicRoutes,
  publicTemplate,
  termsContent,
  uploadContent
} from './templates.js';

const app = document.querySelector('#app');
const siteDialog = document.querySelector('#site-dialog');
const siteDialogTitle = document.querySelector('#site-dialog-title');
const siteDialogContent = document.querySelector('#site-dialog-content');
const noticeDialog = document.querySelector('#notice-dialog');
const noticeDialogTitle = document.querySelector('#notice-dialog-title');
const noticeDialogContent = document.querySelector('#notice-dialog-content');
const toastRegion = document.querySelector('#toast-region');

const storage = {
  get(key, fallback = null) {
    try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch { /* Device storage may be unavailable. */ }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch { /* Device storage may be unavailable. */ }
  }
};

function storedDocuments() {
  try {
    const parsed = JSON.parse(storage.get('tga-documents', 'null'));
    return Array.isArray(parsed) ? parsed : [...initialDocuments];
  } catch { return [...initialDocuments]; }
}

const storedResult = storage.get('tga-test-result');
const normalizePath = (path = '/') => {
  const normalized = `/${String(path).replace(/^\/+|\/+$/g, '')}`;
  return normalized === '//' ? '/' : normalized;
};
const initialPath = normalizePath(window.location.pathname);
const initialScreen = initialPath === '/login' || initialPath === '/portal' ? 'login' : 'public';
const state = {
  screen: initialScreen,
  publicPath: initialScreen === 'public' ? initialPath : '/',
  authenticated: false,
  role: 'member',
  active: 'overview',
  memberQuery: '',
  memberStatus: 'All statuses',
  members: demoMembers.map((member) => ({ ...member })),
  documents: storedDocuments(),
  testResult: storedResult === null ? null : Number(storedResult)
};

if (initialPath === '/portal') window.history.replaceState(null, '', '/login');

function filteredMembers() {
  const query = state.memberQuery.trim().toLowerCase();
  return state.members.filter((member) => {
    const matchesQuery = `${member.name} ${member.email} ${member.id} ${member.province}`.toLowerCase().includes(query);
    return matchesQuery && (state.memberStatus === 'All statuses' || member.status === state.memberStatus);
  });
}

function bindDialogBehaviour(dialog, triggerSelector) {
  dialog.addEventListener('close', () => {
    if (!siteDialog.open && !noticeDialog.open && !document.querySelector('#portal-mobile-dialog')?.open) document.body.classList.remove('dialog-open');
    document.querySelector(triggerSelector)?.setAttribute('aria-expanded', 'false');
  });
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
}

function updatePageMetadata() {
  const route = publicRoutes[state.publicPath];
  const metadata = state.screen === 'portal'
    ? { title: `${state.role === 'admin' ? 'Administrator' : 'Member'} portal | The Gun Association`, description: 'TGA stakeholder demonstration portal.' }
    : state.screen === 'login'
      ? { title: 'Member login | The Gun Association', description: 'Access the TGA stakeholder demonstration member and administrator portals.' }
      : route || { title: 'Page not found | The Gun Association', description: 'The requested TGA prototype page could not be found.' };

  document.title = metadata.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', metadata.description);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', metadata.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', metadata.description);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', metadata.title);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', metadata.description);

  if (publicConfig.siteUrl && state.screen === 'public' && route) {
    const canonicalUrl = `${publicConfig.siteUrl}${state.publicPath === '/' ? '/' : state.publicPath}`;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.append(canonical);
    }
    canonical.href = canonicalUrl;
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonicalUrl);
  }
}

function restorePublicPosition(focusMain, preserveScroll) {
  if (state.screen !== 'public') return;
  window.requestAnimationFrame(() => {
    const heading = document.querySelector('#main-content h1');
    if (focusMain) heading?.focus({ preventScroll: true });
    const hash = decodeURIComponent(window.location.hash.slice(1));
    const target = hash ? document.getElementById(hash) : null;
    if (target) target.scrollIntoView({ block: 'start', behavior: 'instant' });
    else if (!preserveScroll) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  });
}

function render({ preserveScroll = false, focusMain = false } = {}) {
  destroyViewEffects();
  if (state.screen === 'public') app.innerHTML = publicTemplate(state.publicPath, publicConfig.demoMode);
  if (state.screen === 'login') app.innerHTML = loginTemplate(storage.get('tga-remember-email', ''), publicConfig.demoMode);
  if (state.screen === 'portal') app.innerHTML = portalTemplate(state, filteredMembers());
  document.body.dataset.screen = state.screen;
  updatePageMetadata();
  if (state.screen !== 'public' && !preserveScroll) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  initialiseViewEffects(state.screen);
  restorePublicPosition(focusMain, preserveScroll);
  const drawer = document.querySelector('#portal-mobile-dialog');
  if (drawer) bindDialogBehaviour(drawer, '[data-action="open-portal-menu"]');
}

function updateHistory(path, replace = false) {
  window.history[replace ? 'replaceState' : 'pushState'](null, '', path);
}

function navigatePublic(href = '/', { replace = false, focusMain = true } = {}) {
  const url = new URL(href, window.location.href);
  state.screen = 'public';
  state.publicPath = normalizePath(url.pathname);
  state.active = 'overview';
  updateHistory(`${state.publicPath}${url.hash}`, replace);
  render({ focusMain });
}

function navigateLogin({ replace = false, focusMain = true } = {}) {
  state.screen = 'login';
  updateHistory('/login', replace);
  render();
  if (focusMain) window.requestAnimationFrame(() => document.querySelector('#main-content h1, #main-content h2')?.focus?.({ preventScroll: true }));
}

function showDialog(title, content) {
  siteDialogTitle.textContent = title;
  siteDialogContent.innerHTML = content;
  siteDialog.showModal();
  document.body.classList.add('dialog-open');
}

function showNotice(title, content) {
  noticeDialogTitle.textContent = title;
  noticeDialogContent.innerHTML = content;
  noticeDialog.showModal();
  document.body.classList.add('dialog-open');
}

function closeDialog(dialog = siteDialog) {
  if (dialog.open) dialog.close();
}

function toast(message, tone = 'info') {
  toastRegion.textContent = message;
  toastRegion.dataset.tone = tone;
  toastRegion.classList.add('show');
  window.clearTimeout(toastRegion.timer);
  toastRegion.timer = window.setTimeout(() => toastRegion.classList.remove('show'), 3600);
}

function setFormError(form, message) {
  const error = form.querySelector('[data-form-error], .form-error');
  if (!error) return;
  error.textContent = message;
  error.hidden = !message;
  if (message) error.focus?.();
}

function openPortal(role) {
  state.role = role;
  state.active = role === 'admin' ? 'dashboard' : 'overview';
  state.screen = 'portal';
  state.authenticated = true;
  closeDialog();
  updateHistory('/portal');
  render();
}

function updateMemberTable() {
  const members = filteredMembers();
  const tbody = document.querySelector('#member-table-body');
  const count = document.querySelector('#member-result-count');
  if (tbody) tbody.innerHTML = memberRows(members);
  if (count) count.textContent = `${members.length} illustrative records shown`;
}

function exportMembers() {
  const headers = ['Member number', 'Name', 'Email', 'Province', 'Plan', 'Status', 'Expiry', 'Documents', 'Assessment'];
  const quote = (value) => `"${String(value).replaceAll('"', '""')}"`;
  const rows = filteredMembers().map((member) => [member.id, member.name, member.email, member.province, member.plan, member.status, member.expiry, member.documents, member.assessment]);
  const csv = [headers, ...rows].map((row) => row.map(quote).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'tga-illustrative-members.csv';
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  toast(`${rows.length} illustrative member records exported.`);
}

function chatReply(message) {
  const normalized = message.toLowerCase();
  const prohibited = ['build a gun', 'make a gun', 'weapon construction', 'bypass', 'illegal', 'shoot a person', 'hurt someone', 'tactical instruction', 'silencer', 'suppressor'];
  if (prohibited.some((term) => normalized.includes(term))) return 'I cannot help with illegal activity, weapon construction, evading firearm laws, violence or tactical instruction. For lawful requirements, contact the relevant authority or an appropriately qualified professional.';
  if (['legal', 'licence', 'license', 'appeal', 'saps', 'law', 'case'].some((term) => normalized.includes(term))) return 'I can provide only general portal guidance. Please contact an appropriately qualified professional or the relevant authority for case-specific legal or licensing advice.';
  const match = chatTopics.find(([topic]) => normalized.includes(topic.toLowerCase().split(' ')[0]));
  return match?.[1] || 'I can help with membership, renewals, documents, assessments, payments, training, portal support or consulting requests. This prototype does not send your question.';
}

document.addEventListener('click', (event) => {
  const actionTarget = event.target.closest('[data-action]');
  const action = actionTarget?.dataset.action;
  const routeTarget = event.target.closest('a[data-route]');

  if (routeTarget && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
    const url = new URL(routeTarget.href, window.location.href);
    if (url.origin === window.location.origin) {
      event.preventDefault();
      navigatePublic(`${url.pathname}${url.hash}`);
      return;
    }
  }

  if (event.target === siteDialog) closeDialog(siteDialog);
  if (event.target === noticeDialog) closeDialog(noticeDialog);
  if (event.target.closest('[data-close-dialog]')) closeDialog(siteDialog);
  if (event.target.closest('[data-close-notice]')) closeDialog(noticeDialog);

  if (action === 'home') { event.preventDefault(); navigatePublic('/'); }
  if (action === 'login') { closeDialog(); navigateLogin(); }
  if (action === 'logout') { state.authenticated = false; navigatePublic('/'); }
  if (action === 'apply') showDialog('Start a TGA application', applicationContent());
  if (action === 'privacy') showNotice('Prototype privacy and POPIA notice', privacyContent());
  if (action === 'terms') showNotice('Prototype terms', termsContent());
  if (action === 'guide') showDialog('Prototype guide', guideContent());
  if (action === 'forgot-password') showNotice('Password recovery is not connected', '<div class="information-modal"><p class="information-intro">A production service requires verified email delivery, secure reset tokens, expiry rules, audit events and abuse protection.</p><aside><strong>Demo access</strong><p>Use one of the stakeholder accounts shown on the login screen.</p></aside></div>');
  if (action === 'consulting') showNotice('Professional assistance', '<div class="information-modal"><p class="information-intro">Verified consultation, referral and booking details must be supplied by TGA before publication.</p><aside><strong>No request is sent</strong><p>This prototype does not collect or transmit consulting enquiries.</p></aside></div>');
  if (action === 'assessment') showDialog('Safety & Compliance Foundation', assessmentContent(assessmentQuestions));
  if (action === 'upload') showDialog('Upload a document', uploadContent());
  if (action === 'payment') showDialog('PayFast checkout preview', paymentContent());
  if (action === 'chat') showDialog('TGA prototype assistant', chatContent());
  if (action === 'simulate-payment') { closeDialog(); toast('Simulated payment completed successfully.', 'success'); }
  if (action === 'support') { document.querySelector('#portal-mobile-dialog')?.close(); toast('Prototype support request created. No message was sent.'); }
  if (action === 'notifications') toast('You have two illustrative portal notifications.');
  if (action === 'approve-document') toast('Prototype document approved.', 'success');
  if (action === 'request-changes') toast('Prototype change request recorded.');
  if (action === 'export-members') exportMembers();
  if (action === 'open-documents') { state.active = 'documents'; render(); }
  if (action === 'document-detail') showNotice('Document metadata', '<div class="information-modal"><p class="information-intro">Only demonstration metadata is available. No file content is stored or downloadable.</p></div>');

  if (action === 'toggle-public-menu') {
    const menu = document.querySelector('#public-mobile-menu');
    const willOpen = menu?.hidden;
    if (menu) menu.hidden = !willOpen;
    actionTarget.setAttribute('aria-expanded', String(Boolean(willOpen)));
    actionTarget.setAttribute('aria-label', willOpen ? 'Close website menu' : 'Open website menu');
  }
  if (event.target.closest('#public-mobile-menu a')) {
    const menu = document.querySelector('#public-mobile-menu');
    if (menu) menu.hidden = true;
    document.querySelector('[data-action="toggle-public-menu"]')?.setAttribute('aria-expanded', 'false');
  }

  const flipTarget = event.target.closest('[data-flip-card]');
  if (flipTarget) flipCard(flipTarget);

  if (action === 'toggle-password') {
    const input = actionTarget.closest('.password-field')?.querySelector('input');
    if (input) {
      const visible = input.type === 'text';
      input.type = visible ? 'password' : 'text';
      actionTarget.setAttribute('aria-label', visible ? 'Show password' : 'Hide password');
      actionTarget.innerHTML = `<iconify-icon icon="solar:${visible ? 'eye' : 'eye-closed'}-linear" aria-hidden="true"></iconify-icon>`;
    }
  }

  const demoRole = event.target.closest('[data-demo-role]');
  if (demoRole) {
    const account = demoUsers[demoRole.dataset.demoRole];
    const form = document.querySelector('#login-form');
    form.elements.email.value = account.email;
    form.elements.password.value = account.password;
    document.querySelectorAll('[data-demo-role]').forEach((button) => button.classList.toggle('selected', button === demoRole));
    form.querySelector('button[type="submit"]').focus();
    toast(`${account.label} credentials selected.`);
  }

  if (action === 'application-next') {
    const form = actionTarget.closest('form');
    const firstStep = form.querySelector('[data-form-step="1"]');
    const fields = [...firstStep.querySelectorAll('input,select')];
    const invalid = fields.find((field) => !field.checkValidity());
    if (invalid) { invalid.reportValidity(); invalid.focus(); return; }
    firstStep.hidden = true;
    form.querySelector('[data-form-step="2"]').hidden = false;
    form.dataset.step = '2';
    form.querySelectorAll('.stepper span')[1].classList.add('active');
    form.querySelector('[data-form-step="2"] select').focus();
  }
  if (action === 'application-back') {
    const form = actionTarget.closest('form');
    form.querySelector('[data-form-step="1"]').hidden = false;
    form.querySelector('[data-form-step="2"]').hidden = true;
    form.dataset.step = '1';
    form.querySelectorAll('.stepper span')[1].classList.remove('active');
    form.querySelector('[data-form-step="1"] input').focus();
  }

  const portalSection = event.target.closest('[data-portal-section]');
  if (portalSection) {
    state.active = portalSection.dataset.portalSection;
    document.querySelector('#portal-mobile-dialog')?.close();
    render();
  }
  if (action === 'open-portal-menu') {
    const drawer = document.querySelector('#portal-mobile-dialog');
    drawer?.showModal();
    actionTarget.setAttribute('aria-expanded', 'true');
    document.body.classList.add('dialog-open');
  }
  if (action === 'close-portal-menu') document.querySelector('#portal-mobile-dialog')?.close();

  const memberButton = event.target.closest('[data-member-id]');
  if (memberButton) {
    const member = state.members.find((item) => item.id === memberButton.dataset.memberId);
    if (member) showDialog('Member record', memberDetailContent(member));
  }

  const topicButton = event.target.closest('[data-chat-topic]');
  if (topicButton) {
    const input = document.querySelector('#chat-form textarea');
    input.value = topicButton.dataset.chatTopic;
    input.focus();
  }
});

document.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;

  if (form.id === 'login-form') {
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const data = new FormData(form);
    const email = String(data.get('email')).trim().toLowerCase();
    const password = String(data.get('password'));
    const role = Object.entries(demoUsers).find(([, account]) => account.email === email && account.password === password)?.[0];
    if (!role) { setFormError(form, 'Those details do not match either stakeholder demo account.'); return; }
    setFormError(form, '');
    if (data.get('remember')) storage.set('tga-remember-email', email); else storage.remove('tga-remember-email');
    openPortal(role);
  }

  if (form.id === 'application-form') {
    if (!form.checkValidity()) { form.reportValidity(); setFormError(form, 'Complete the required fields and accept the prototype privacy notice.'); return; }
    siteDialogTitle.textContent = 'Prototype application created';
    siteDialogContent.innerHTML = '<div class="success-state"><iconify-icon icon="solar:check-circle-bold" aria-hidden="true"></iconify-icon><h3>Application journey complete</h3><p>No information was transmitted or stored. Your illustrative reference is <strong>TGA-DEMO-2026-0722</strong>.</p><button class="button button--brass" data-action="login">Continue to demo login</button></div>';
  }

  if (form.id === 'assessment-form') {
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const data = new FormData(form);
    let score = 0;
    assessmentQuestions.forEach((question, index) => { if (Number(data.get(`question-${index}`)) === question[2]) score += 1; });
    state.testResult = Math.round((score / assessmentQuestions.length) * 100);
    storage.set('tga-test-result', String(state.testResult));
    closeDialog();
    render();
    toast(`Assessment submitted: ${state.testResult}%.`, state.testResult >= 80 ? 'success' : 'warning');
  }

  if (form.id === 'upload-form') {
    const data = new FormData(form);
    const file = data.get('file');
    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const allowedMime = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!(file instanceof File) || !file.name) { setFormError(form, 'Select a PDF, JPG or PNG file.'); return; }
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(extension) || !allowedMime.includes(file.type)) { setFormError(form, 'The selected file must be a valid PDF, JPG or PNG.'); return; }
    if (file.size > 5 * 1024 * 1024) { setFormError(form, 'The selected file is larger than 5 MB.'); return; }
    if (!data.get('uploadConsent')) { setFormError(form, 'Accept the local prototype-processing notice before continuing.'); return; }
    const record = { id: Date.now(), name: file.name, type: String(data.get('type')), date: new Intl.DateTimeFormat('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()), status: 'In review', size: `${(file.size / 1024 / 1024).toFixed(1)} MB` };
    state.documents.unshift(record);
    storage.set('tga-documents', JSON.stringify(state.documents));
    closeDialog();
    render();
    toast('Document metadata added for prototype review.', 'success');
  }

  if (form.id === 'profile-form') {
    if (!form.checkValidity()) { form.reportValidity(); return; }
    toast('Profile changes validated. Nothing was sent or stored.');
  }

  if (form.id === 'chat-form') {
    const data = new FormData(form);
    const message = String(data.get('message')).trim();
    if (!message) return;
    const transcript = document.querySelector('.chat-transcript');
    transcript.insertAdjacentHTML('beforeend', `<div class="chat-message chat-message--user">${escapeHtml(message)}</div><div class="chat-message chat-message--assistant">${escapeHtml(chatReply(message))}</div>`);
    form.reset();
    transcript.scrollTop = transcript.scrollHeight;
  }
});

document.addEventListener('input', (event) => {
  if (event.target.id === 'member-search') { state.memberQuery = event.target.value; updateMemberTable(); }
});

document.addEventListener('change', (event) => {
  if (event.target.id === 'member-status') { state.memberStatus = event.target.value; updateMemberTable(); }
  if (event.target.matches('#upload-form input[type="file"]')) {
    const file = event.target.files?.[0];
    const label = event.target.form.querySelector('[data-selected-file]');
    label.textContent = file ? `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} MB` : 'No file selected';
    setFormError(event.target.form, '');
  }
  if (event.target.matches('[data-update-member]')) {
    const member = state.members.find((item) => item.id === event.target.dataset.updateMember);
    if (member) {
      member.status = event.target.value;
      closeDialog();
      render();
      toast(`Member status changed to ${member.status}.`, 'success');
    }
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    const publicMenu = document.querySelector('#public-mobile-menu:not([hidden])');
    if (publicMenu) {
      publicMenu.hidden = true;
      document.querySelector('[data-action="toggle-public-menu"]')?.setAttribute('aria-expanded', 'false');
    }
    const portalDrawer = document.querySelector('#portal-mobile-dialog');
    if (portalDrawer?.open) {
      event.preventDefault();
      portalDrawer.close();
      document.querySelector('[data-action="open-portal-menu"]')?.focus();
    }
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 800) {
    document.querySelector('#portal-mobile-dialog')?.close();
    const menu = document.querySelector('#public-mobile-menu');
    if (menu) menu.hidden = true;
    document.body.classList.remove('dialog-open');
  }
});

window.addEventListener('popstate', () => {
  const path = normalizePath(window.location.pathname);
  if (path === '/login') {
    state.screen = 'login';
    render();
    return;
  }
  if (path === '/portal') {
    if (state.authenticated) {
      state.screen = 'portal';
      render();
    } else {
      navigateLogin({ replace: true });
    }
    return;
  }
  state.screen = 'public';
  state.publicPath = path;
  render({ focusMain: true });
});

bindDialogBehaviour(siteDialog, '[data-close-dialog]');
bindDialogBehaviour(noticeDialog, '[data-close-notice]');
render();
