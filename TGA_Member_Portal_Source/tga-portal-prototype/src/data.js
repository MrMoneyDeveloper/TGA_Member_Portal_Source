export const demoMembers = [
  {
    id: 'TGA-2026-1048',
    name: 'Anele Dlamini',
    email: 'anele.dlamini@example.com',
    plan: 'Professional',
    status: 'Active',
    expiry: '2027-07-31',
    documents: 4,
    assessment: 'Passed',
  },
  {
    id: 'TGA-2026-1047',
    name: 'Megan Jacobs',
    email: 'megan.jacobs@example.com',
    plan: 'Standard',
    status: 'Pending review',
    expiry: '—',
    documents: 3,
    assessment: 'Passed',
  },
  {
    id: 'TGA-2026-1046',
    name: 'Thabo Mokoena',
    email: 'thabo.mokoena@example.com',
    plan: 'Professional',
    status: 'Active',
    expiry: '2027-06-15',
    documents: 5,
    assessment: 'Passed',
  },
  {
    id: 'TGA-2026-1045',
    name: 'Candice Naidoo',
    email: 'candice.naidoo@example.com',
    plan: 'Standard',
    status: 'Payment due',
    expiry: '2026-07-25',
    documents: 4,
    assessment: 'Not started',
  },
  {
    id: 'TGA-2026-1044',
    name: 'Bongani Khumalo',
    email: 'bongani.khumalo@example.com',
    plan: 'Standard',
    status: 'Active',
    expiry: '2027-05-09',
    documents: 4,
    assessment: 'Passed',
  },
];

export const assessmentQuestions = [
  {
    question: 'What is the safest default assumption when handling a firearm?',
    options: [
      'It is unloaded if the magazine is removed',
      'It is loaded until personally verified otherwise',
      'It is safe when pointed downward',
      'It is safe when the safety is engaged',
    ],
    answer: 1,
  },
  {
    question: 'Which action best protects unauthorised people from access?',
    options: [
      'Keeping it out of sight',
      'Storing it in a locked, compliant safe',
      'Leaving it in a locked vehicle',
      'Separating only the magazine',
    ],
    answer: 1,
  },
  {
    question: 'What should a member do when a compliance document expires?',
    options: [
      'Ignore it until contacted',
      'Upload a renewed document and notify the association',
      'Delete the old record only',
      'Create a second member account',
    ],
    answer: 1,
  },
  {
    question: 'Who should provide final advice on a legal or licensing matter?',
    options: [
      'An anonymous forum user',
      'A qualified, authorised professional or relevant authority',
      'Any member with more than one year of experience',
      'A social media chatbot',
    ],
    answer: 1,
  },
  {
    question: 'What is the correct response to a lost membership or compliance document?',
    options: [
      'Wait for renewal season',
      'Report it promptly and request the approved replacement process',
      'Use another member’s copy',
      'Edit an old digital copy',
    ],
    answer: 1,
  },
];

export const chatbotAnswers = [
  {
    keywords: ['join', 'membership', 'register'],
    response:
      'You can start with the online application, upload the required documents, complete the assessment, and then pay the applicable membership fee.',
  },
  {
    keywords: ['document', 'upload', 'id', 'proof'],
    response:
      'The prototype accepts PDF, JPG, and PNG files up to 5 MB. Production requirements should be confirmed by the TGA compliance team.',
  },
  {
    keywords: ['test', 'assessment', 'exam'],
    response:
      'Open Assessments in the member portal. Your result is saved to this browser for demonstration purposes.',
  },
  {
    keywords: ['payment', 'payfast', 'fee', 'price'],
    response:
      'Payments are represented by a PayFast-style demo flow. Live payments require server-side signing, merchant credentials, and transaction notification validation.',
  },
  {
    keywords: ['consult', 'firearm consulting', 'help'],
    response:
      'The chatbot can answer portal questions. Legal, licensing, or case-specific advice must be escalated to an authorised TGA consultant.',
  },
];
