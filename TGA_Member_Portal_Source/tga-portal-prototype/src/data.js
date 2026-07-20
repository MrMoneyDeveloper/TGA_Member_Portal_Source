export const platformFeatures = [
  { icon: 'solar:user-id-linear', title: 'Member management', text: 'Profiles, subscriptions, membership status, renewals and one clear administrator view.', detail: 'One connected record reduces duplicate capture and gives each team member the same current view.' },
  { icon: 'solar:checklist-minimalistic-linear', title: 'Online assessments', text: 'Structured testing, scoring, attempt history and administrator review workflows.', detail: 'Assessment rules, content and validity periods remain configurable by TGA before production.' },
  { icon: 'solar:folder-with-files-linear', title: 'Secure documents', text: 'Guided uploads, expiry tracking, review states and downloadable member records.', detail: 'The production service requires private object storage, malware scanning and access-controlled links.' },
  { icon: 'solar:card-linear', title: 'Payment journeys', text: 'Membership fees, renewals, courses, receipts and future recurring-payment support.', detail: 'The draft demonstrates a PayFast-style flow without requesting or processing payment information.' },
  { icon: 'solar:chat-round-dots-linear', title: 'Digital assistance', text: 'Member support with escalation to qualified professionals for complex questions.', detail: 'General portal guidance stays separate from legal, licensing and case-specific professional advice.' },
  { icon: 'solar:history-linear', title: 'Audit-ready activity', text: 'Status history, approvals, test results, uploads and payment events in one place.', detail: 'A production audit log would be immutable, permission-aware and subject to approved retention rules.' }
];

export const aboutPillars = [
  ['01', 'Responsible participation', 'Encouraging a culture of safe, lawful and informed firearm ownership.'],
  ['02', 'Practical member support', 'Making applications, renewals, records and everyday administration easier to manage.'],
  ['03', 'Education and guidance', 'Providing clear learning pathways, assessments and access to approved support resources.']
];

export const benefits = [
  ['01', 'Less administration', 'Keep membership information, documents, results and receipts connected to one record.'],
  ['02', 'Visible progress', 'See what is complete, what is outstanding and which step needs attention next.'],
  ['03', 'Self-service access', 'Reach documents, assessments, payments and membership information from one portal.'],
  ['04', 'Human support', 'Escalate case-specific questions when an appropriately qualified professional is required.']
];

export const reviews = [
  ['Membership experience', 'Verified feedback about joining TGA and managing an ongoing membership will appear here.'],
  ['Application journey', 'Verified feedback about the application, document and assessment journey will appear here.'],
  ['Support and guidance', 'Verified feedback about receiving clear support and appropriate guidance will appear here.']
];

export const faqs = [
  ['Who can apply for membership?', 'Membership categories and eligibility requirements will be confirmed by TGA. The Standard and Professional options shown here remain illustrative.'],
  ['Which documents will I need?', 'Requirements depend on the selected membership path. The portal provides a clear checklist and visible review state for each submitted item.'],
  ['How do online assessments work?', 'Members complete assigned assessments, view the applicable pass mark and see their latest result. Content, retake rules and validity periods will be configured by TGA.'],
  ['How will renewals and payments work?', 'The proposed service supports fees, renewals and receipts through a secure checkout. Payments in this prototype are simulated and no banking details are collected.'],
  ['How will personal information be handled?', 'This demonstration form does not transmit or store application information. Production handling requires role-based access, private storage, audit logging and approved POPIA-aligned controls.'],
  ['Does the portal provide professional or legal advice?', 'The portal provides general membership and process guidance. Case-specific questions must be referred to an appropriately qualified professional.']
];

export const contactPlaceholders = [
  ['01', 'General enquiries', 'Verified public email and telephone details must be supplied by TGA before publication.'],
  ['02', 'Membership support', 'Verified member-support hours and contact channels must be supplied by TGA before publication.'],
  ['03', 'Professional assistance', 'Verified consultation and professional-referral details must be supplied by TGA before publication.']
];

export const demoMembers = [
  { id: 'TGA-2026-1048', name: 'Anele Dlamini', email: 'anele.dlamini@example.com', plan: 'Professional', status: 'Active', expiry: '2027-07-31', documents: 4, assessment: 'Passed' },
  { id: 'TGA-2026-1047', name: 'Megan Jacobs', email: 'megan.jacobs@example.com', plan: 'Standard', status: 'Pending review', expiry: '—', documents: 3, assessment: 'Passed' },
  { id: 'TGA-2026-1046', name: 'Thabo Mokoena', email: 'thabo.mokoena@example.com', plan: 'Professional', status: 'Active', expiry: '2027-06-15', documents: 5, assessment: 'Passed' },
  { id: 'TGA-2026-1045', name: 'Candice Naidoo', email: 'candice.naidoo@example.com', plan: 'Standard', status: 'Payment due', expiry: '2026-07-25', documents: 4, assessment: 'Not started' },
  { id: 'TGA-2026-1044', name: 'Bongani Khumalo', email: 'bongani.khumalo@example.com', plan: 'Standard', status: 'Active', expiry: '2027-05-09', documents: 4, assessment: 'Passed' }
];

export const assessmentQuestions = [
  ['What is the safest default assumption when handling a firearm?', ['It is unloaded if the magazine is removed', 'It is loaded until personally verified otherwise', 'It is safe when pointed downward', 'It is safe when the safety is engaged'], 1],
  ['Which action best protects unauthorised people from access?', ['Keeping it out of sight', 'Storing it in a locked, compliant safe', 'Leaving it in a locked vehicle', 'Separating only the magazine'], 1],
  ['What should a member do when a compliance document expires?', ['Ignore it until contacted', 'Upload a renewed document and notify the association', 'Delete the old record only', 'Create a second member account'], 1],
  ['Who should provide final advice on a legal or licensing matter?', ['An anonymous forum user', 'A qualified, authorised professional or relevant authority', 'Any experienced member', 'A social media chatbot'], 1],
  ['What is the correct response to a lost membership or compliance document?', ['Wait for renewal season', 'Report it promptly and follow the approved replacement process', 'Use another member’s copy', 'Edit an old digital copy'], 1]
];

export const initialDocuments = [
  { id: 1, name: 'Identity document.pdf', type: 'Identity', date: '18 Jul 2026', status: 'Approved', size: '1.2 MB' },
  { id: 2, name: 'Proof of address.pdf', type: 'Address', date: '18 Jul 2026', status: 'Approved', size: '0.8 MB' },
  { id: 3, name: 'Competency certificate.pdf', type: 'Compliance', date: '19 Jul 2026', status: 'In review', size: '2.1 MB' },
  { id: 4, name: 'Profile photograph.jpg', type: 'Profile', date: '19 Jul 2026', status: 'Approved', size: '0.5 MB' }
];
