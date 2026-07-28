export const demoUsers = Object.freeze({
  member: { email: 'member@tga.co.za', password: 'demo123', label: 'Member portal' },
  admin: { email: 'admin@tga.co.za', password: 'admin123', label: 'Administrator portal' }
});

export const imageAssets = Object.freeze({
  hero: { name: 'hero-range-training', alt: 'Adult members receiving responsible firearm-safety instruction at a controlled South African shooting range', position: '70% center' },
  safety: { name: 'responsible-safety-instruction', alt: 'Civilian instructor demonstrating safe firearm handling to adult learners', position: 'center' },
  storage: { name: 'secure-firearm-storage', alt: 'Responsible owner securing a firearm in a locked steel safe', position: 'center' },
  assessment: { name: 'competency-assessment-training', alt: 'Adult members completing a supervised firearm-safety competency assessment', position: 'center' },
  consultation: { name: 'compliance-document-consultation', alt: 'Member and consultant reviewing a compliance checklist in a private office', position: 'center' },
  community: { name: 'member-community-event', alt: 'Five South African adult members talking together at a responsible clay-target shooting range', position: 'center', width: 1536, height: 1014 }
});

export const credibilityItems = [
  ['solar:shield-check-linear', 'Secure member portal'],
  ['solar:clipboard-check-linear', 'Online assessments'],
  ['solar:document-text-linear', 'Compliance support'],
  ['solar:card-linear', 'Simulated PayFast journeys'],
  ['solar:folder-security-linear', 'Document management'],
  ['solar:chat-round-call-linear', 'Professional escalation']
];

export const cinematicPanels = [
  ['Built around members', 'Access membership information, renewals, resources and support from one central platform.'],
  ['Training and development', 'Discover training opportunities and resources designed to support responsible ownership.'],
  ['Secure digital access', 'Manage your profile, documents and association activity through a protected member experience.'],
  ['A connected community', 'Stay informed through association announcements, events and member updates.']
];

export const cinematicCallouts = [
  'Digital Membership',
  'Training Resources',
  'Document Management',
  'Event Access',
  'Member Support',
  'Secure Profile'
];

export const aboutPillars = [
  ['01', 'Responsible participation', 'Encouraging safe, lawful and informed participation across the firearm community.'],
  ['02', 'Practical member support', 'Making membership, records, renewals and everyday administration easier to understand.'],
  ['03', 'Education and guidance', 'Connecting members to clear learning pathways and appropriately qualified support.']
];

export const services = [
  { icon: 'solar:user-id-linear', title: 'Membership management', text: 'Applications, membership status, renewals and one connected member record.', detail: 'A clearer administrative journey helps members see requirements and progress without repeated capture.' },
  { icon: 'solar:diploma-linear', title: 'Competency and training', text: 'Information pathways for safety learning, competency and approved training support.', detail: 'Training providers, course availability and accreditation claims require confirmation by TGA.' },
  { icon: 'solar:clipboard-list-linear', title: 'Online assessments', text: 'Assigned tests, visible pass marks, results and administrator review workflows.', detail: 'Assessment content, validity periods and retake policies remain configurable before production.' },
  { icon: 'solar:folder-with-files-linear', title: 'Compliance documents', text: 'Guided uploads, expiry awareness, review states and replacement history.', detail: 'Production requires encrypted private storage, malware scanning and role-based access.' },
  { icon: 'solar:case-minimalistic-linear', title: 'Firearm consulting', text: 'A clear route from general process help to appropriately qualified professionals.', detail: 'The portal does not provide legal guarantees or case-specific professional advice.' },
  { icon: 'solar:chat-round-dots-linear', title: 'Member support', text: 'Practical help with membership, documents, assessments, payments and portal access.', detail: 'Approved knowledge and human escalation would be governed by TGA in production.' }
];

export const journeySteps = [
  ['01', 'Apply', 'Choose an illustrative membership path and provide the required applicant details.'],
  ['02', 'Submit documents', 'Use the guided checklist to add identity and supporting compliance records.'],
  ['03', 'Complete assessment', 'Finish the assigned safety and compliance assessment where applicable.'],
  ['04', 'Make payment', 'Continue to the simulated PayFast-style payment step.'],
  ['05', 'Receive review', 'Follow the visible administrator review state and any requested actions.'],
  ['06', 'Access services', 'Use documents, results, receipts, renewals and support from one portal.']
];

export const responsiblePrinciples = [
  ['solar:shield-check-linear', 'Firearm safety', 'Treat every firearm as loaded, maintain a safe direction and follow approved range procedures.'],
  ['solar:safe-2-linear', 'Secure storage', 'Prevent unauthorised access with appropriate secure storage and controlled access to keys or combinations.'],
  ['solar:diploma-linear', 'Ongoing training', 'Maintain skills and understanding through suitable instruction and regular responsible practice.'],
  ['solar:document-text-linear', 'Lawful compliance', 'Keep applicable records current and seek authoritative guidance when requirements are unclear.'],
  ['solar:users-group-rounded-linear', 'Responsible community', 'Promote calm, respectful and safety-led participation in sport, hunting and association activities.']
];

export const reviews = [
  ['Membership experience', 'Verified member feedback about joining TGA and managing an ongoing membership will be placed here.'],
  ['Application journey', 'Verified feedback about the application, document and assessment journey will be placed here.'],
  ['Support and guidance', 'Verified feedback about receiving general support and appropriate professional escalation will be placed here.']
];

export const membershipPlans = [
  { name: 'Annual membership', price: 'R450', period: 'illustrative annual fee', featured: false, items: ['Digital member record', 'Document checklist', 'Assessment access', 'Renewal reminders'] },
  { name: 'Professional membership', price: 'R750', period: 'illustrative annual fee', featured: true, items: ['Everything in Annual', 'Expanded document record', 'Priority support routing', 'Consulting-request pathway'] },
  { name: 'Courses & assessments', price: 'Quoted', period: 'subject to approved offering', featured: false, items: ['Training information', 'Assigned assessments', 'Result history', 'Provider details when verified'] }
];

export const faqs = [
  ['Who can apply for membership?', 'Membership categories and eligibility requirements must be confirmed by TGA. The options and fees shown in this prototype are illustrative.'],
  ['Which documents will I need?', 'Requirements depend on the selected membership path. The portal demonstrates a checklist and review state for identity, address and applicable compliance records.'],
  ['How do online assessments work?', 'Members complete assigned questions, see the applicable pass mark and receive a simulated result. Content, attempts and validity periods require TGA approval.'],
  ['How will renewals and payments work?', 'The proposed service supports fees, renewals and receipts through a secure checkout. Payments are simulated and no banking details are collected.'],
  ['How will personal information be handled?', 'Application data is not transmitted by this prototype. Production requires role-based access, private storage, retention rules, audit logging and legally approved POPIA-aligned controls.'],
  ['Does the portal provide legal or professional advice?', 'No. It provides general membership and process guidance. Case-specific matters must be referred to an appropriately qualified professional or relevant authority.']
];

export const contactPlaceholders = [
  ['General enquiries', 'Verified public email and telephone details must be supplied by TGA before publication.'],
  ['Membership support', 'Verified support channels, operating hours and escalation details must be supplied by TGA.'],
  ['Professional assistance', 'Verified consultation, referral and booking details must be supplied by TGA.']
];

export const demoMembers = [
  { id: 'TGA-2026-1048', name: 'Anele Dlamini', email: 'anele.dlamini@example.com', plan: 'Professional', status: 'Active', expiry: '31 Jul 2027', documents: 4, assessment: 'Passed', province: 'Gauteng' },
  { id: 'TGA-2026-1047', name: 'Megan Jacobs', email: 'megan.jacobs@example.com', plan: 'Annual', status: 'Pending review', expiry: 'Not issued', documents: 3, assessment: 'Passed', province: 'Western Cape' },
  { id: 'TGA-2026-1046', name: 'Thabo Mokoena', email: 'thabo.mokoena@example.com', plan: 'Professional', status: 'Active', expiry: '15 Jun 2027', documents: 5, assessment: 'Passed', province: 'Limpopo' },
  { id: 'TGA-2026-1045', name: 'Candice Naidoo', email: 'candice.naidoo@example.com', plan: 'Annual', status: 'Payment due', expiry: '25 Jul 2026', documents: 4, assessment: 'Not started', province: 'KwaZulu-Natal' },
  { id: 'TGA-2026-1044', name: 'Bongani Khumalo', email: 'bongani.khumalo@example.com', plan: 'Annual', status: 'Active', expiry: '09 May 2027', documents: 4, assessment: 'Passed', province: 'Mpumalanga' },
  { id: 'TGA-2026-1043', name: 'Thandiwe Ncube', email: 'thandiwe.ncube@example.com', plan: 'Professional', status: 'Expired', expiry: '30 Jun 2026', documents: 5, assessment: 'Passed', province: 'Free State' }
];

export const assessmentQuestions = [
  ['What is the safest default assumption when handling a firearm?', ['It is unloaded if the magazine is removed', 'It is loaded until personally verified otherwise', 'It is safe when pointed downward', 'It is safe when the safety is engaged'], 1],
  ['Which action best helps prevent unauthorised access?', ['Keeping it out of sight', 'Using appropriate locked secure storage', 'Leaving it in a locked vehicle', 'Separating only the magazine'], 1],
  ['What should a member do when a required document expires?', ['Ignore it until contacted', 'Follow the approved renewal and replacement process', 'Delete the old record only', 'Create a second member account'], 1],
  ['Who should provide final guidance on a legal or licensing matter?', ['An anonymous forum user', 'An appropriately qualified professional or relevant authority', 'Any experienced member', 'A social media chatbot'], 1],
  ['What is the correct response to a lost compliance document?', ['Wait for renewal season', 'Report it promptly and follow the approved replacement process', 'Use another member\'s copy', 'Edit an old digital copy'], 1]
];

export const initialDocuments = [
  { id: 1, name: 'Identity document.pdf', type: 'Identity', date: '18 Jul 2026', status: 'Approved', size: '1.2 MB' },
  { id: 2, name: 'Proof of address.pdf', type: 'Address', date: '18 Jul 2026', status: 'Approved', size: '0.8 MB' },
  { id: 3, name: 'Competency certificate.pdf', type: 'Compliance', date: '19 Jul 2026', status: 'In review', size: '2.1 MB' },
  { id: 4, name: 'Profile photograph.jpg', type: 'Profile', date: '19 Jul 2026', status: 'Approved', size: '0.5 MB' }
];

export const chatTopics = [
  ['Membership', 'Membership categories, prices and eligibility in this prototype are illustrative. Start an application to view the demonstrated journey.'],
  ['Renewals', 'The member portal shows a renewal date, outstanding actions and a simulated payment step.'],
  ['Documents', 'The prototype accepts PDF, JPG and PNG files up to 5 MB and keeps display metadata only on this device.'],
  ['Assessments', 'Open Assessments in the member portal to complete the Safety & Compliance Foundation demonstration.'],
  ['Payments', 'Payments are simulated. A production PayFast integration must be created and verified on a secure server.'],
  ['Training', 'TGA must supply verified course, provider, accreditation and booking information before publication.'],
  ['Portal support', 'Use the support action in the portal to demonstrate an escalation request. No message is sent.'],
  ['Consulting', 'Case-specific matters require an appropriately qualified professional. Verified booking details must be supplied by TGA.']
];

export const provinces = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'];
