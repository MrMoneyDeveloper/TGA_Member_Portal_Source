import 'iconify-icon';
import './styles.css';
import { publicConfig } from './config.js';
import { chatTopics } from './data.js';
import { createDemoApi, DEMO_ACCOUNTS } from './demo-api.js';
import { applicationContent, assessmentContent, loginTemplate, memberDetailContent, paymentContent, portalTemplate, uploadContent, reviewContent, assessmentConfigContent, date, money } from './portal-views.js';
import { destroyViewEffects, flipCard, initialiseViewEffects } from './effects.js';
import {
  chatContent,
  escapeHtml,
  guideContent,
  memberRows,
  privacyContent,
  publicRoutes,
  publicTemplate,
  termsContent
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

const api = createDemoApi();
const normalizePath = (path = '/') => '/' + String(path).replace(/^\/+|\/+$/g, '');
const initialPath = normalizePath(window.location.pathname);
const state = { screen: ['/login','/portal'].includes(initialPath)?'login':'public', publicPath: '/', authenticated:false, role:'member', active:'overview', memberQuery:'', memberStatus:'All statuses', members:[], documents:[], attempts:[], payments:[], assessments:[], notifications:[], history:[], audit:[], allowedSections:[], profile:null, user:null };
if (state.screen === 'public') state.publicPath = initialPath;
async function refreshPortal() {
  try {const snapshot=await api.snapshot();Object.assign(state,snapshot);state.members=state.members.map(m=>({...m,expiry:date(m.endDate)}));state.role=state.user.role==='member'?'member':'admin';if(!state.allowedSections.includes(state.active))state.active=state.allowedSections[0];state.error='';}
  catch(error){state.error=error.message;throw error;}
}
async function runAction(target,work) {
  if(target?.disabled)return;
  if(target) {target.disabled=true;target.setAttribute('aria-busy','true');}
  try {await work();}catch(error){toast(error.message,'warning');}
  finally {if(target){target.disabled=false;target.removeAttribute('aria-busy');}}
}
function downloadText(name,content,type='text/plain') {const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}

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

async function openPortal(user) {
  state.user = user;
  state.active = user.role === 'member' ? 'overview' : 'dashboard';
  await refreshPortal();
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

async function exportMembers() {
  const headers = ['Member number', 'Name', 'Email', 'Province', 'Plan', 'Status', 'Expiry', 'Documents', 'Assessment'];
  const quote = (value) => `"${String(value ?? '').replace(/^[=+@\-\t\r]/, (c) => "'" + c).replaceAll('"', '""')}"`;
  const records = await api.exportMembers();
  const rows = records.map((member) => [member.id, member.name, member.email, member.province, member.plan, member.status, date(member.endDate), member.documents, member.assessment]);
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

document.addEventListener('click', async (event) => {
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
  if (action === 'logout') await runAction(actionTarget,async()=>{await api.logout();state.authenticated=false;navigatePublic('/');});
  if (action === 'apply') showDialog('Start a demo application', applicationContent());
  if (action === 'privacy') showNotice('Sandbox privacy notice', privacyContent());
  if (action === 'terms') showNotice('Sandbox terms', termsContent());
  if (action === 'guide') showDialog('Client POC guide', guideContent());
  if (action === 'forgot-password') showDialog('Demo password reminder','<form id="recovery-form" class="dialog-form"><p>This POC uses public demo credentials. Enter your demo login email for a reminder.</p><label>Email<input type="email" name="email" required></label><p class="form-error" data-form-error role="alert" hidden></p><button type="submit" class="button button--brass">Show demo reminder</button></form>');
  if (action === 'consulting') showNotice('Professional assistance','<div class="information-modal"><p>Verified consultation and booking details must be supplied by TGA. No request is sent.</p></div>');
  if (action === 'assessment') await runAction(actionTarget,async()=>{const attempt=await api.startAssessment(actionTarget.dataset.assessmentId||state.assessments[0]?.id);showDialog(attempt.title,assessmentContent(attempt));});
  if (action === 'upload') showDialog('Upload a sample document',uploadContent());
  if (action === 'payment') await runAction(actionTarget,async()=>{const p=await api.checkout();showDialog('Mock payment checkout',paymentContent(p));});
  if (action === 'complete-payment') await runAction(actionTarget,async()=>{const p=await api.completePayment(actionTarget.dataset.paymentId,actionTarget.dataset.outcome);closeDialog();await refreshPortal();render();showNotice('Mock payment '+p.status,'<div class="success-state"><h3>'+escapeHtml(p.status)+'</h3><p>'+escapeHtml(p.reference)+' · '+money(p.amount)+'</p><p>No real money moved. The outcome is saved in Payment history.</p></div>');});
  if (action === 'chat') showDialog('TGA prototype assistant',chatContent());
  if (action === 'support') showDialog('Demo support request','<form id="support-form" class="dialog-form"><p>This records a local demo ticket. No message is sent to TGA.</p><label>Description<textarea name="message" required maxlength="1000"></textarea></label><p class="form-error" data-form-error role="alert" hidden></p><button class="button button--brass" type="submit">Create demo ticket</button></form>');
  if (action === 'notifications') showNotice('Notifications','<div class="information-modal">'+(state.notifications.map(n=>'<section><div><h3>'+escapeHtml(n.title.replaceAll('-',' '))+'</h3><p>'+escapeHtml(n.message)+'</p><small>'+date(n.createdUtc)+' · '+escapeHtml(n.status)+'</small></div></section>').join('')||'<p>No notifications yet.</p>')+'</div>');
  if (action === 'export-members') await runAction(actionTarget,exportMembers);
  if (action === 'open-documents') {state.active='documents';render();}
  if (action === 'reload-portal') await runAction(actionTarget,async()=>{await refreshPortal();render();});
  if (action === 'document-detail') await runAction(actionTarget,async()=>{const d=await api.document(actionTarget.dataset.documentId);showNotice('Demo document metadata','<div class="information-modal"><h3>'+escapeHtml(d.name)+'</h3><p>'+escapeHtml(d.type)+' · '+escapeHtml(d.status)+' · '+date(d.date)+'</p><p>'+escapeHtml(d.reason||'No review notes yet.')+'</p><p>Only metadata is stored. This download creates a fictional sample record, not the selected file.</p><button class="button button--outline" data-action="download-sample" data-document-id="'+escapeHtml(d.id)+'">Download demo record</button></div>');});
  if (action === 'download-sample') await runAction(actionTarget,async()=>{const d=await api.document(actionTarget.dataset.documentId);downloadText('TGA-DEMO-document.txt','TGA DEMONSTRATION RECORD\nNOT AN IDENTITY, LICENCE OR TRAINING DOCUMENT\n\nName: '+d.name+'\nType: '+d.type+'\nStatus: '+d.status+'\nReference: '+d.id+'\nNo original file contents are stored.');});
  if (action === 'review-document') {const d=state.documents.find(d=>d.id===actionTarget.dataset.documentId);if(d)showDialog('Review demo document',reviewContent(d));}
  if (action === 'assessment-config') {const a=state.assessments.find(a=>a.id===actionTarget.dataset.assessmentId);if(a)showDialog('Assessment demo rules',assessmentConfigContent(a));}
  if (action === 'receipt') {const p=state.payments.find(p=>p.id===actionTarget.dataset.paymentId);if(p)downloadText(p.reference+'.txt','TGA MOCK RECEIPT — NO MONEY MOVED\n'+p.reference+'\n'+p.description+'\n'+money(p.amount)+'\n'+p.status+'\n'+date(p.createdUtc));}
  if (action === 'certificate') {const a=state.attempts.find(a=>a.id===actionTarget.dataset.attemptId&&a.passed);if(a)downloadText('TGA-DEMO-certificate.txt','TGA DEMO / NON-ACCREDITED PARTICIPATION RECORD\nNot firearm competency, a licence or accredited training.\n\n'+state.profile.name+'\n'+a.title+'\nScore: '+a.percentage+'%\n'+date(a.submittedUtc)+'\nReference: '+a.id);}
  if (action === 'refund') showDialog('Simulate refund','<form id="refund-form" class="dialog-form" data-payment-id="'+escapeHtml(actionTarget.dataset.paymentId)+'"><p>No real money moves. Membership dates stay unchanged pending confirmed refund policy.</p><label>Reason<textarea name="reason" required maxlength="500"></textarea></label><p class="form-error" data-form-error role="alert" hidden></p><button type="submit" class="button button--brass">Record mock refund</button></form>');
  if (action === 'reset-demo') showDialog('Reset local demo records','<div class="information-modal"><p>This restores the original fictional records and removes changes made in this browser.</p><button class="button button--brass" data-action="confirm-reset">Restore demo fixtures</button><button class="button button--outline" data-close-dialog>Keep my changes</button></div>');
  if (action === 'confirm-reset') await runAction(actionTarget,async()=>{await api.reset();closeDialog();await refreshPortal();render();toast('Demo records restored.','success');});

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

  const demoAccount=event.target.closest('[data-demo-account]');
  if(demoAccount){const account=DEMO_ACCOUNTS[Number(demoAccount.dataset.demoAccount)];const form=document.querySelector('#login-form');form.elements.email.value=account.email;form.elements.password.value=account.password;form.querySelector('button[type="submit"]').focus();toast(account.label+' credentials selected.');}

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
    if(!state.allowedSections.includes(portalSection.dataset.portalSection))return;
    state.active = portalSection.dataset.portalSection;
    try {await refreshPortal();}catch(error){toast(error.message,'warning');}
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

  const memberButton = event.target.closest('button[data-member-id]');
  if (memberButton) {
    const member = state.members.find((item) => item.id === memberButton.dataset.memberId);
    if (member) showDialog('Member record', memberDetailContent(member,state));
  }

  const topicButton = event.target.closest('[data-chat-topic]');
  if (topicButton) {
    const input = document.querySelector('#chat-form textarea');
    input.value = topicButton.dataset.chatTopic;
    input.focus();
  }
});

document.addEventListener('submit', async (event) => {
  event.preventDefault();const form=event.target;
  if(form.id!=='chat-form') {
    if(!form.checkValidity()){form.reportValidity();return;}
    const submit=form.querySelector('button[type="submit"]');if(submit?.disabled)return;
    if(submit){submit.disabled=true;submit.setAttribute('aria-busy','true');}
    setFormError(form,'');const data=new FormData(form);const values=Object.fromEntries(data.entries());
    try {
      if(form.id==='login-form'){const user=await api.login(values.email,values.password);if(values.remember)storage.set('tga-remember-email',values.email);else storage.remove('tga-remember-email');await openPortal(user);}
      if(form.id==='application-form'){const result=await api.register(values);siteDialogTitle.textContent='Demo application created';siteDialogContent.innerHTML='<div class="success-state"><h3>Your demo login is ready</h3><p>Application '+escapeHtml(result.memberId)+' is waiting for administrator review.</p><p>Email: <strong>'+escapeHtml(result.email)+'</strong><br>Demo password: <strong>'+escapeHtml(result.password)+'</strong></p><p>Saved only in this browser. No information was sent to TGA.</p><button class="button button--brass" data-action="login">Continue to login</button></div>';}
      if(form.id==='profile-form'){await api.updateProfile(values);await refreshPortal();render();toast('Demo profile saved.','success');}
      if(form.id==='upload-form'){const file=data.get('file');if(!(file instanceof File)||!file.name)throw new Error('Select a sample file.');if(!values.uploadConsent)throw new Error('Accept local metadata processing.');await api.upload({name:file.name,type:values.type,mime:file.type,sizeBytes:file.size});closeDialog();await refreshPortal();render();toast('Document submitted for demo review.','success');}
      if(form.id==='assessment-form'){const answers=Object.fromEntries([...data.entries()].map(([key,value])=>[key,Number(value)]));const result=await api.submitAssessment(form.dataset.attemptId,answers);closeDialog();await refreshPortal();render();showNotice('Assessment result','<div class="success-state"><h3>'+result.percentage+'% · '+escapeHtml(result.status)+'</h3><p>Result saved. This is a demo learning check, not accredited training or firearm competency.</p></div>');}
      if(form.id==='membership-review-form'){await api.changeMembership(form.dataset.memberId,values.status,values.reason);closeDialog();await refreshPortal();render();toast('Membership decision saved.','success');}
      if(form.id==='document-review-form'){await api.reviewDocument(form.dataset.documentId,values.decision==='approve',values.reason);closeDialog();await refreshPortal();render();toast('Document review saved.','success');}
      if(form.id==='assessment-config-form'){await api.configureAssessment(form.dataset.assessmentId,{passMark:Number(values.passMark),maxAttempts:Number(values.maxAttempts),timeLimitMinutes:values.timeLimitMinutes?Number(values.timeLimitMinutes):null});closeDialog();await refreshPortal();render();toast('Demo assessment rules saved.','success');}
      if(form.id==='refund-form'){await api.refund(form.dataset.paymentId,values.reason);closeDialog();await refreshPortal();render();toast('Mock refund recorded.','success');}
      if(form.id==='recovery-form'){const result=await api.recover(values.email);siteDialogContent.innerHTML='<div class="information-modal"><p>'+ (result?'Public demo login: '+escapeHtml(result.email)+'<br>Password: <strong>'+escapeHtml(result.password)+'</strong>':'No demo account found. Choose an account from the login register.')+'</p><p>No email was sent.</p></div>';}
      if(form.id==='support-form'){const ticket=await api.support(values.message);closeDialog();await refreshPortal();render();toast('Demo ticket '+ticket.id+' recorded. No message sent.','success');}
    }catch(error){setFormError(form,error.message);toast(error.message,'warning');}
    finally {if(submit){submit.disabled=false;submit.removeAttribute('aria-busy');}}
    return;
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
async function restoreSession(){const user=await api.session();if(user&&initialPath==='/portal'){try{await openPortal(user);}catch(error){toast(error.message,'warning');navigateLogin({replace:true});}}}
restoreSession();
