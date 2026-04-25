import type {
  Alert,
  Approval,
  AutomationRun,
  CommandCenterDataset,
  Crew,
  Customer,
  CustomerCommunication,
  CustomerRisk,
  DocumentResource,
  Estimate,
  Expense,
  IntegrationHealth,
  InsuranceClaim,
  Invoice,
  Job,
  Lead,
  MarketingSource,
  MaterialOrder,
  OwnerActionItem,
  Payment,
  ProductionStage,
  Proposal,
  ReviewRequest,
  RoofSystem,
  Supplement,
  TeamMember,
  Vendor,
} from './types';

const productionStages: ProductionStage[] = [
  { id: 'lead', name: 'Lead', thresholdDays: 2 },
  { id: 'inspection-booked', name: 'Inspection Booked', thresholdDays: 2 },
  { id: 'inspection-complete', name: 'Inspection Complete', thresholdDays: 2 },
  { id: 'estimate-drafting', name: 'Estimate Drafting', thresholdDays: 3 },
  { id: 'proposal-sent', name: 'Proposal Sent', thresholdDays: 4 },
  { id: 'sold', name: 'Sold', thresholdDays: 3 },
  { id: 'deposit-needed', name: 'Deposit Needed', thresholdDays: 3 },
  { id: 'supplement-insurance', name: 'Supplement / Insurance', thresholdDays: 14 },
  { id: 'material-ordered', name: 'Material Ordered', thresholdDays: 5 },
  { id: 'scheduled', name: 'Scheduled', thresholdDays: 5 },
  { id: 'in-production', name: 'In Production', thresholdDays: 7 },
  { id: 'final-inspection', name: 'Final Inspection', thresholdDays: 3 },
  { id: 'invoice-sent', name: 'Invoice Sent', thresholdDays: 7 },
  { id: 'paid', name: 'Paid', thresholdDays: 2 },
  { id: 'closed', name: 'Closed', thresholdDays: 2 },
  { id: 'warranty-follow-up', name: 'Warranty / Follow-Up', thresholdDays: 14 },
];

const roofSystems: RoofSystem[] = [
  {
    id: 'shingle',
    name: 'Shingle',
    averageSalePrice: 16500,
    averageCostPerSquare: 355,
    averageLaborPerSquare: 118,
    averageMaterialCost: 8350,
    averageGrossMargin: 0.34,
    averageNetMargin: 0.22,
    commonChangeOrders: ['Decking replacement', 'Ventilation upgrade'],
    commonSupplementOpportunities: ['Starter/hip-ridge code add', 'Ice/water shield'],
    commonProductionIssues: ['Backordered accessory colors', 'Underlayment variance'],
    bestCrewIds: ['crew-1'],
    callbackFrequency: 0.04,
  },
  {
    id: 'tile',
    name: 'Tile',
    averageSalePrice: 42200,
    averageCostPerSquare: 612,
    averageLaborPerSquare: 185,
    averageMaterialCost: 20750,
    averageGrossMargin: 0.31,
    averageNetMargin: 0.19,
    commonChangeOrders: ['Fascia replacement', 'Underlayment scope increase'],
    commonSupplementOpportunities: ['High-profile tile reset', 'Detach/reset solar'],
    commonProductionIssues: ['Broken matching tile sourcing', 'Lift schedule conflicts'],
    bestCrewIds: ['crew-2'],
    callbackFrequency: 0.06,
  },
  {
    id: 'foam-coating',
    name: 'Foam + Coating',
    averageSalePrice: 28750,
    averageCostPerSquare: 488,
    averageLaborPerSquare: 162,
    averageMaterialCost: 13780,
    averageGrossMargin: 0.36,
    averageNetMargin: 0.24,
    commonChangeOrders: ['Parapet repair', 'Drain detail upgrade'],
    commonSupplementOpportunities: ['Ponding water remedy', 'Walk pad add'],
    commonProductionIssues: ['Weather windows', 'Moisture content recheck'],
    bestCrewIds: ['crew-3'],
    callbackFrequency: 0.03,
  },
  {
    id: 'tpo-iso',
    name: 'TPO + ISO',
    averageSalePrice: 51900,
    averageCostPerSquare: 705,
    averageLaborPerSquare: 214,
    averageMaterialCost: 25980,
    averageGrossMargin: 0.29,
    averageNetMargin: 0.18,
    commonChangeOrders: ['Taper package', 'Curb rebuild'],
    commonSupplementOpportunities: ['Cover board', 'Additional insulation'],
    commonProductionIssues: ['Mechanical curb coordination', 'Material staging'],
    bestCrewIds: ['crew-4'],
    callbackFrequency: 0.05,
  },
];

const teamMembers: TeamMember[] = [
  { id: 'tm-1', name: 'Matthew Griffin', role: 'Owner', responseHours: 4, qualityScore: 98, escalationCount: 9 },
  { id: 'tm-2', name: 'Kali Najah', role: 'Sales Rep', responseHours: 2, qualityScore: 91, escalationCount: 3 },
  { id: 'tm-3', name: 'Brianna Holt', role: 'CSR', responseHours: 1, qualityScore: 88, escalationCount: 2 },
  { id: 'tm-4', name: 'Luis Romero', role: 'Production Manager', responseHours: 3, qualityScore: 86, escalationCount: 4 },
  { id: 'tm-5', name: 'Dani Flores', role: 'Supplement Coordinator', responseHours: 5, qualityScore: 84, escalationCount: 6 },
  { id: 'tm-6', name: 'Nora Bennett', role: 'Bookkeeping/Finance', responseHours: 4, qualityScore: 94, escalationCount: 1 },
  { id: 'tm-7', name: 'Alicia Webb', role: 'Admin', responseHours: 2, qualityScore: 89, escalationCount: 2 },
];

const customers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Carlos Acosta',
    businessUnit: 'Roof Doctors',
    address: '2140 E La Jolla Dr',
    city: 'Tempe, AZ',
    phone: '(602) 555-0144',
    email: 'carlos.acosta@example.com',
    journeyStage: 'Production Complete',
    salesRepId: 'tm-2',
    productionManagerId: 'tm-4',
    lastContactAt: '2026-04-24T20:00:00Z',
    nextContactAt: '2026-04-25T17:00:00Z',
    sentiment: 'positive',
    riskLevel: 'low',
    reviewRequestStatus: 'sent',
    ownerAttention: false,
  },
  {
    id: 'cust-2',
    name: 'Elizabeth Seidell',
    businessUnit: 'Roof Doctors',
    address: '8721 S Desert Wash Ln',
    city: 'Queen Creek, AZ',
    phone: '(602) 555-0182',
    email: 'eseidell@example.com',
    journeyStage: 'Job Preparation',
    salesRepId: 'tm-1',
    productionManagerId: 'tm-4',
    lastContactAt: '2026-04-21T22:00:00Z',
    nextContactAt: '2026-04-25T16:00:00Z',
    sentiment: 'neutral',
    riskLevel: 'high',
    reviewRequestStatus: 'not_sent',
    ownerAttention: true,
  },
  {
    id: 'cust-3',
    name: 'Ken Humphreys',
    businessUnit: 'Build Doctors',
    address: '401 W Gila Bend Hwy',
    city: 'Florence, AZ',
    phone: '(520) 555-0106',
    email: 'ken.h@example.com',
    journeyStage: 'Inspection Booked',
    salesRepId: 'tm-2',
    lastContactAt: '2026-04-22T18:30:00Z',
    nextContactAt: '2026-04-25T15:00:00Z',
    sentiment: 'neutral',
    riskLevel: 'medium',
    reviewRequestStatus: 'not_sent',
    ownerAttention: false,
  },
  {
    id: 'cust-4',
    name: 'Vivian Harris',
    businessUnit: 'Build Doctors',
    address: '12621 W Monte Vista Rd',
    city: 'Goodyear, AZ',
    phone: '(623) 555-0128',
    email: 'viv.harris@example.com',
    journeyStage: 'Estimate Sent',
    salesRepId: 'tm-2',
    lastContactAt: '2026-04-18T19:00:00Z',
    nextContactAt: '2026-04-25T19:30:00Z',
    sentiment: 'negative',
    riskLevel: 'high',
    reviewRequestStatus: 'not_sent',
    ownerAttention: true,
  },
  {
    id: 'cust-5',
    name: 'Monroe Dental Plaza',
    businessUnit: 'Roof Doctors',
    address: '510 S Val Vista Dr',
    city: 'Mesa, AZ',
    phone: '(480) 555-0177',
    email: 'facilities@monroedental.example.com',
    journeyStage: 'Contract Signed',
    salesRepId: 'tm-1',
    productionManagerId: 'tm-4',
    lastContactAt: '2026-04-23T21:15:00Z',
    nextContactAt: '2026-04-25T18:00:00Z',
    sentiment: 'positive',
    riskLevel: 'medium',
    reviewRequestStatus: 'not_sent',
    ownerAttention: false,
  },
  {
    id: 'cust-6',
    name: 'Patricia Bowman',
    businessUnit: 'Roof Doctors',
    address: '10984 N 82nd Pl',
    city: 'Scottsdale, AZ',
    phone: '(480) 555-0133',
    email: 'pbowman@example.com',
    journeyStage: 'Invoice / Payment',
    salesRepId: 'tm-2',
    productionManagerId: 'tm-4',
    lastContactAt: '2026-04-20T18:00:00Z',
    nextContactAt: '2026-04-25T14:00:00Z',
    sentiment: 'negative',
    riskLevel: 'critical',
    reviewRequestStatus: 'not_sent',
    ownerAttention: true,
  },
];

const leads: Lead[] = [
  { id: 'lead-1', customerId: 'cust-3', sourceId: 'source-1', createdAt: '2026-04-20T16:00:00Z', status: 'booked', bookingStatus: 'booked', valuePotential: 2700, leakageRisk: false, assignedTo: 'tm-3' },
  { id: 'lead-2', customerId: 'cust-4', sourceId: 'source-3', createdAt: '2026-04-16T17:30:00Z', status: 'proposal_sent', bookingStatus: 'booked', valuePotential: 8600, leakageRisk: true, assignedTo: 'tm-3' },
  { id: 'lead-3', customerId: 'cust-5', sourceId: 'source-4', createdAt: '2026-04-18T15:45:00Z', status: 'sold', bookingStatus: 'booked', valuePotential: 51900, leakageRisk: false, assignedTo: 'tm-3' },
  { id: 'lead-4', customerId: 'cust-6', sourceId: 'source-2', createdAt: '2026-04-12T18:00:00Z', status: 'sold', bookingStatus: 'booked', valuePotential: 18400, leakageRisk: false, assignedTo: 'tm-3' },
  { id: 'lead-5', customerId: 'cust-2', sourceId: 'source-5', createdAt: '2026-04-08T18:00:00Z', status: 'sold', bookingStatus: 'booked', valuePotential: 7974, leakageRisk: false, assignedTo: 'tm-3' },
  { id: 'lead-6', customerId: 'cust-1', sourceId: 'source-2', createdAt: '2026-04-02T15:00:00Z', status: 'sold', bookingStatus: 'booked', valuePotential: 22570, leakageRisk: false, assignedTo: 'tm-3' },
];

const inspections = [
  { id: 'insp-1', customerId: 'cust-3', leadId: 'lead-1', scheduledAt: '2026-04-25T17:00:00Z', inspectorId: 'tm-2', status: 'scheduled', notes: 'Foam patch investigation and patio tie-in' },
  { id: 'insp-2', customerId: 'cust-4', leadId: 'lead-2', scheduledAt: '2026-04-17T17:30:00Z', completedAt: '2026-04-17T19:15:00Z', inspectorId: 'tm-2', status: 'completed', notes: 'Tile underlayment scope with patio leak crossover' },
];

const estimates: Estimate[] = [
  { id: 'est-1', customerId: 'cust-3', inspectionId: 'insp-1', roofSystemId: 'foam-coating', status: 'draft', amount: 2700, createdAt: '2026-04-24T19:00:00Z', dueAt: '2026-04-25T23:00:00Z', salesRepId: 'tm-2' },
  { id: 'est-2', customerId: 'cust-4', inspectionId: 'insp-2', roofSystemId: 'tile', status: 'sent', amount: 8600, createdAt: '2026-04-18T18:00:00Z', sentAt: '2026-04-19T17:00:00Z', dueAt: '2026-04-22T18:00:00Z', salesRepId: 'tm-2' },
  { id: 'est-3', customerId: 'cust-5', roofSystemId: 'tpo-iso', status: 'approved', amount: 51900, createdAt: '2026-04-19T16:00:00Z', sentAt: '2026-04-20T20:00:00Z', salesRepId: 'tm-1' },
  { id: 'est-4', customerId: 'cust-6', roofSystemId: 'shingle', status: 'approved', amount: 18400, createdAt: '2026-04-13T15:00:00Z', sentAt: '2026-04-14T16:00:00Z', salesRepId: 'tm-2' },
];

const proposals: Proposal[] = [
  { id: 'prop-1', customerId: 'cust-4', estimateId: 'est-2', status: 'follow_up_due', sentAt: '2026-04-19T17:00:00Z', followUpAt: '2026-04-22T18:00:00Z', contractValue: 8600 },
  { id: 'prop-2', customerId: 'cust-5', estimateId: 'est-3', status: 'won', sentAt: '2026-04-20T20:00:00Z', contractValue: 51900 },
  { id: 'prop-3', customerId: 'cust-6', estimateId: 'est-4', status: 'won', sentAt: '2026-04-14T16:00:00Z', contractValue: 18400 },
];

const jobs: Job[] = [
  {
    id: 'job-1',
    customerId: 'cust-1',
    stage: 'Final Inspection',
    contractAmount: 22570.22,
    soldDate: '2026-04-05T18:00:00Z',
    roofSystemId: 'shingle',
    salesRepId: 'tm-2',
    productionManagerId: 'tm-4',
    crewId: 'crew-1',
    scheduledDate: '2026-04-23T14:00:00Z',
    materialStatus: 'delivered',
    laborStatus: 'complete',
    permitStatus: 'approved',
    hoaStatus: 'not_needed',
    bottleneck: 'Warranty packet and invoice closeout',
    daysInStage: 3,
    forecastGrossMargin: 0.33,
    netProfitEstimate: 0.22,
    riskLevel: 'low',
    depositRequired: 5000,
    depositCollected: 5000,
    ownerId: 'tm-4',
  },
  {
    id: 'job-2',
    customerId: 'cust-2',
    stage: 'Supplement / Insurance',
    contractAmount: 7973.91,
    soldDate: '2026-04-10T16:00:00Z',
    roofSystemId: 'tile',
    salesRepId: 'tm-1',
    productionManagerId: 'tm-4',
    crewId: 'crew-2',
    materialStatus: 'not_ordered',
    laborStatus: 'unassigned',
    permitStatus: 'pending',
    hoaStatus: 'pending',
    bottleneck: 'Appraisal follow-up and customer reassurance',
    daysInStage: 16,
    forecastGrossMargin: 0.27,
    netProfitEstimate: 0.18,
    riskLevel: 'high',
    depositRequired: 2000,
    depositCollected: 0,
    ownerId: 'tm-1',
  },
  {
    id: 'job-3',
    customerId: 'cust-5',
    stage: 'Deposit Needed',
    contractAmount: 51900,
    soldDate: '2026-04-21T17:00:00Z',
    roofSystemId: 'tpo-iso',
    salesRepId: 'tm-1',
    productionManagerId: 'tm-4',
    crewId: 'crew-4',
    materialStatus: 'not_ordered',
    laborStatus: 'unassigned',
    permitStatus: 'pending',
    hoaStatus: 'not_needed',
    bottleneck: 'Deposit and material color approval',
    daysInStage: 4,
    forecastGrossMargin: 0.24,
    netProfitEstimate: 0.17,
    riskLevel: 'medium',
    depositRequired: 12000,
    depositCollected: 0,
    ownerId: 'tm-1',
  },
  {
    id: 'job-4',
    customerId: 'cust-6',
    stage: 'Invoice Sent',
    contractAmount: 18400,
    soldDate: '2026-04-14T16:30:00Z',
    roofSystemId: 'shingle',
    salesRepId: 'tm-2',
    productionManagerId: 'tm-4',
    crewId: 'crew-1',
    scheduledDate: '2026-04-20T14:00:00Z',
    materialStatus: 'delivered',
    laborStatus: 'complete',
    permitStatus: 'approved',
    hoaStatus: 'not_needed',
    bottleneck: 'Final payment and complaint recovery',
    daysInStage: 6,
    forecastGrossMargin: 0.18,
    netProfitEstimate: 0.12,
    riskLevel: 'critical',
    depositRequired: 5000,
    depositCollected: 5000,
    ownerId: 'tm-1',
  },
];

const insuranceClaims: InsuranceClaim[] = [
  {
    id: 'claim-1',
    customerId: 'cust-2',
    carrier: 'State Farm',
    claimNumber: 'SF-AZ-448201',
    adjuster: 'Jared Bloom',
    stage: 'appraisal',
    originalRCV: 15420,
    originalACV: 11880,
    depreciationRecoverable: 3540,
    deductible: 2500,
    customerOutOfPocket: 0,
    lastContactDate: '2026-04-21T22:00:00Z',
    nextActionDate: '2026-04-25T16:00:00Z',
    assignedOwnerId: 'tm-5',
    agingDays: 24,
    riskLevel: 'high',
    mortgageCheckStatus: 'pending',
  },
  {
    id: 'claim-2',
    customerId: 'cust-5',
    carrier: 'Travelers',
    claimNumber: 'TRV-330918',
    adjuster: 'Melissa Grant',
    stage: 'pending_supplement',
    originalRCV: 43800,
    originalACV: 32700,
    depreciationRecoverable: 11100,
    deductible: 5000,
    customerOutOfPocket: 3100,
    lastContactDate: '2026-04-23T21:15:00Z',
    nextActionDate: '2026-04-25T18:00:00Z',
    assignedOwnerId: 'tm-5',
    agingDays: 17,
    riskLevel: 'medium',
    mortgageCheckStatus: 'not_applicable',
  },
];

const supplements: Supplement[] = [
  { id: 'supp-1', claimId: 'claim-1', requestedAmount: 6320, approvedAmount: 0, submittedAt: '2026-04-09T18:00:00Z', status: 'pending', agingDays: 16, customerUpdateNeeded: true, adjusterFollowUpNeeded: true },
  { id: 'supp-2', claimId: 'claim-2', requestedAmount: 4820, approvedAmount: 2100, submittedAt: '2026-04-12T17:00:00Z', status: 'partial', agingDays: 13, customerUpdateNeeded: true, adjusterFollowUpNeeded: false },
];

const payments: Payment[] = [
  { id: 'pay-1', customerId: 'cust-1', jobId: 'job-1', type: 'final', amount: 17570.22, dueDate: '2026-04-26T00:00:00Z', status: 'due' },
  { id: 'pay-2', customerId: 'cust-2', jobId: 'job-2', type: 'deposit', amount: 2000, dueDate: '2026-04-18T00:00:00Z', status: 'past_due' },
  { id: 'pay-3', customerId: 'cust-5', jobId: 'job-3', type: 'deposit', amount: 12000, dueDate: '2026-04-24T00:00:00Z', status: 'past_due' },
  { id: 'pay-4', customerId: 'cust-6', jobId: 'job-4', type: 'final', amount: 13400, dueDate: '2026-04-23T00:00:00Z', status: 'past_due' },
];

const invoices: Invoice[] = [
  { id: 'inv-1', customerId: 'cust-1', jobId: 'job-1', amount: 22570.22, dueDate: '2026-04-30T00:00:00Z', status: 'sent', sentDate: '2026-04-24T21:00:00Z' },
  { id: 'inv-2', customerId: 'cust-6', jobId: 'job-4', amount: 18400, dueDate: '2026-04-23T00:00:00Z', status: 'past_due', sentDate: '2026-04-20T20:00:00Z' },
];

const expenses: Expense[] = [
  { id: 'exp-1', jobId: 'job-1', category: 'material', amount: 8400, date: '2026-04-21T00:00:00Z', vendorId: 'vendor-1', variable: true },
  { id: 'exp-2', jobId: 'job-1', category: 'labor', amount: 2950, date: '2026-04-23T00:00:00Z', variable: true },
  { id: 'exp-3', jobId: 'job-2', category: 'overhead', amount: 680, date: '2026-04-20T00:00:00Z', variable: false },
  { id: 'exp-4', jobId: 'job-3', category: 'permit', amount: 325, date: '2026-04-24T00:00:00Z', variable: true },
  { id: 'exp-5', jobId: 'job-4', category: 'material', amount: 9100, date: '2026-04-18T00:00:00Z', vendorId: 'vendor-2', variable: true },
  { id: 'exp-6', jobId: 'job-4', category: 'labor', amount: 3400, date: '2026-04-21T00:00:00Z', variable: true },
];

const vendors: Vendor[] = [
  { id: 'vendor-1', name: 'ABC Supply', balanceDue: 18400, nextDeliveryDate: '2026-04-26T16:00:00Z', status: 'watch' },
  { id: 'vendor-2', name: 'Beacon Roofing', balanceDue: 9200, nextDeliveryDate: '2026-04-25T15:00:00Z', status: 'healthy' },
  { id: 'vendor-3', name: 'Foam Depot', balanceDue: 6100, nextDeliveryDate: '2026-04-29T16:00:00Z', status: 'risk' },
];

const materialOrders: MaterialOrder[] = [
  { id: 'mo-1', jobId: 'job-3', vendorId: 'vendor-1', orderDate: '2026-04-24T15:00:00Z', status: 'draft', amount: 21800 },
  { id: 'mo-2', jobId: 'job-4', vendorId: 'vendor-2', orderDate: '2026-04-17T17:00:00Z', deliveryDate: '2026-04-20T12:00:00Z', status: 'delivered', amount: 9100 },
];

const crews: Crew[] = [
  { id: 'crew-1', name: 'Desert Ridge Shingle', roofSystemIds: ['shingle'], capacityScore: 82, laborRate: 118, callbackRate: 0.03, averageInstallDuration: 2.2, qualityScore: 93 },
  { id: 'crew-2', name: 'Tile Precision', roofSystemIds: ['tile'], capacityScore: 68, laborRate: 185, callbackRate: 0.06, averageInstallDuration: 4.1, qualityScore: 88 },
  { id: 'crew-3', name: 'Foam Masters', roofSystemIds: ['foam-coating'], capacityScore: 75, laborRate: 162, callbackRate: 0.02, averageInstallDuration: 2.8, qualityScore: 95 },
  { id: 'crew-4', name: 'Commercial White Cap', roofSystemIds: ['tpo-iso'], capacityScore: 61, laborRate: 214, callbackRate: 0.05, averageInstallDuration: 5.3, qualityScore: 87 },
];

const agents = [
  { id: 'agent-1', name: 'Ryan Carter', role: 'Main Operator', status: 'active', currentTask: 'Owner queue prioritization', lastAction: 'Drafted intervention shortlist', lastHeartbeat: '2026-04-25T08:09:00Z', costPlaceholder: '$42.10 / mo' },
  { id: 'agent-2', name: 'Nora Bennett', role: 'Finance Ops', status: 'idle', currentTask: 'Cash forecast placeholder ready', lastAction: 'Flagged AR pressure items', lastHeartbeat: '2026-04-25T07:50:00Z', costPlaceholder: '$11.60 / mo' },
  { id: 'agent-3', name: 'Owen Mercer', role: 'Builder', status: 'active', currentTask: 'Command center scaffolding', lastAction: 'Prepared UI extension path', lastHeartbeat: '2026-04-25T08:11:00Z', costPlaceholder: '$19.80 / mo' },
  { id: 'agent-4', name: 'Miles Turner', role: 'Ops', status: 'awaiting_review', currentTask: 'Approval queue validation', lastAction: 'Surfaced stuck supplement cases', lastHeartbeat: '2026-04-25T07:41:00Z', costPlaceholder: '$8.20 / mo' },
  { id: 'agent-5', name: 'Browser Agent', role: 'External Read Only', status: 'failed', currentTask: 'AccuLynx session check placeholder', lastAction: 'Needs authenticated session', lastHeartbeat: '2026-04-24T19:10:00Z', costPlaceholder: '$0.00 / mo' },
];

const agentTasks = [
  { id: 'agtask-1', agentId: 'agent-1', title: 'Compile owner intervention list', status: 'completed', createdAt: '2026-04-25T07:00:00Z', completedAt: '2026-04-25T08:00:00Z' },
  { id: 'agtask-2', agentId: 'agent-2', title: 'Draft 30/60/90 cash forecast', status: 'in_progress', createdAt: '2026-04-25T06:30:00Z' },
  { id: 'agtask-3', agentId: 'agent-4', title: 'Resolve supplement aging queue', status: 'blocked', createdAt: '2026-04-24T19:30:00Z' },
  { id: 'agtask-4', agentId: 'agent-5', title: 'Verify AccuLynx dashboard access', status: 'blocked', createdAt: '2026-04-24T15:30:00Z' },
];

const approvals: Approval[] = [
  { id: 'appr-1', title: 'Patricia Bowman final payment concession', category: 'customer_money', status: 'pending', requestedBy: 'tm-6', requestedAt: '2026-04-25T07:10:00Z', amountImpact: 1800, relatedCustomerId: 'cust-6', requiresMatthewApproval: true },
  { id: 'appr-2', title: 'Elizabeth Seidell appraisal communication language', category: 'insurance_representation', status: 'pending', requestedBy: 'tm-5', requestedAt: '2026-04-24T18:00:00Z', relatedCustomerId: 'cust-2', requiresMatthewApproval: true },
  { id: 'appr-3', title: 'Monroe Dental contract deposit exception', category: 'pricing_exception', status: 'pending', requestedBy: 'tm-1', requestedAt: '2026-04-24T20:00:00Z', amountImpact: 4000, relatedCustomerId: 'cust-5', requiresMatthewApproval: true },
];

const automationRuns: AutomationRun[] = [
  { id: 'run-1', name: 'Customer update draft queue', status: 'running', lastRunAt: '2026-04-25T08:05:00Z', nextAction: 'Needs human review for Patricia Bowman' },
  { id: 'run-2', name: 'Supplement aging monitor', status: 'failed', lastRunAt: '2026-04-25T07:44:00Z', nextAction: 'Re-run after claim adapter exists' },
  { id: 'run-3', name: 'Daily memory backup', status: 'success', lastRunAt: '2026-04-25T06:00:00Z', nextAction: 'Next run at 18:00' },
  { id: 'run-4', name: 'Approval digest', status: 'waiting', lastRunAt: '2026-04-25T05:30:00Z', nextAction: 'Hold until Matthew decisions clear' },
];

const customerCommunications: CustomerCommunication[] = [
  { id: 'comm-1', customerId: 'cust-2', channel: 'call', direction: 'outbound', sentiment: 'neutral', date: '2026-04-21T22:00:00Z', summary: 'Reviewed appraisal status and promised update after carrier callback.' },
  { id: 'comm-2', customerId: 'cust-4', channel: 'text', direction: 'inbound', sentiment: 'negative', date: '2026-04-24T18:10:00Z', summary: 'Customer frustrated by silence after estimate and wants direct answer today.' },
  { id: 'comm-3', customerId: 'cust-6', channel: 'call', direction: 'inbound', sentiment: 'negative', date: '2026-04-24T20:30:00Z', summary: 'Complained about cleanup and withheld final payment pending owner callback.' },
  { id: 'comm-4', customerId: 'cust-1', channel: 'text', direction: 'outbound', sentiment: 'positive', date: '2026-04-24T20:00:00Z', summary: 'Sent completion photos and warranty packet notice.' },
];

const customerRisks: CustomerRisk[] = [
  { id: 'risk-1', customerId: 'cust-2', reason: 'No customer update in 3+ days while supplement lane is aging', riskLevel: 'high', daysSinceUpdate: 3, ownerAttention: true },
  { id: 'risk-2', customerId: 'cust-4', reason: 'Negative sentiment and proposal follow-up overdue', riskLevel: 'high', daysSinceUpdate: 7, ownerAttention: true },
  { id: 'risk-3', customerId: 'cust-6', reason: 'Complaint plus final payment past due', riskLevel: 'critical', daysSinceUpdate: 5, ownerAttention: true },
];

const reviewRequests: ReviewRequest[] = [
  { id: 'review-1', customerId: 'cust-1', sentAt: '2026-04-24T20:15:00Z', status: 'sent' },
  { id: 'review-2', customerId: 'cust-6', status: 'not_sent' },
];

const marketingSources: MarketingSource[] = [
  { id: 'source-1', name: 'Referral', leads: 14, bookedInspections: 11, sales: 7, spend: 1200, grossProfit: 68400, averageTicket: 18200 },
  { id: 'source-2', name: 'Google LSA', leads: 28, bookedInspections: 19, sales: 8, spend: 9300, grossProfit: 79250, averageTicket: 16100 },
  { id: 'source-3', name: 'Dope Marketing', leads: 21, bookedInspections: 9, sales: 3, spend: 7800, grossProfit: 18900, averageTicket: 11800 },
  { id: 'source-4', name: 'CallRail Organic', leads: 18, bookedInspections: 13, sales: 6, spend: 2900, grossProfit: 54100, averageTicket: 17400 },
  { id: 'source-5', name: 'Insurance Referral', leads: 9, bookedInspections: 8, sales: 5, spend: 900, grossProfit: 46300, averageTicket: 21200 },
];

const documentResources: DocumentResource[] = [
  { id: 'doc-1', title: 'CSR Handbook', section: 'CSR handbook', type: 'SOP', updatedAt: '2026-04-18T16:00:00Z', owner: 'Alicia Webb' },
  { id: 'doc-2', title: 'Insurance Claim Script - Homeowner', section: 'Insurance claim scripts', type: 'Script', updatedAt: '2026-04-21T15:00:00Z', owner: 'Matthew Griffin' },
  { id: 'doc-3', title: 'Production Change Order SOP', section: 'Production SOPs', type: 'SOP', updatedAt: '2026-04-20T17:00:00Z', owner: 'Luis Romero' },
  { id: 'doc-4', title: 'Supplement Follow-Up Cadence', section: 'Supplement SOPs', type: 'Guide', updatedAt: '2026-04-23T19:00:00Z', owner: 'Dani Flores' },
  { id: 'doc-5', title: 'Owner Approval Rules', section: 'OpenClaw agent instructions', type: 'Guide', updatedAt: '2026-04-24T18:00:00Z', owner: 'Ryan Carter' },
  { id: 'doc-6', title: 'Customer Lifecycle Rules', section: 'Customer lifecycle rules', type: 'Guide', updatedAt: '2026-04-24T20:00:00Z', owner: 'Ryan Carter' },
];

const integrationHealth: IntegrationHealth[] = [
  { id: 'int-1', name: 'AccuLynx', status: 'watch', lastSync: '2026-04-25T07:30:00Z', health: 'Read-only browser path approved; authenticated production session still missing.', dataAvailable: ['job list placeholder', 'claim notes placeholder'], errors: ['No saved authenticated session'], nextRecommendedAction: 'Establish safe session persistence pattern before live adapter wiring.' },
  { id: 'int-2', name: 'QuickBooks Online', status: 'watch', lastSync: '2026-04-25T06:40:00Z', health: 'Finance adapter shell only.', dataAvailable: ['cash forecast placeholder', 'AR/AP placeholder'], errors: ['No live sync yet'], nextRecommendedAction: 'Map chart-of-accounts and AR/AP views into adapter contract.' },
  { id: 'int-3', name: 'CompanyCam', status: 'healthy', lastSync: '2026-04-24T21:00:00Z', health: 'Placeholder ready for photo-link references.', dataAvailable: ['photo album placeholder'], errors: [], nextRecommendedAction: 'Add mock album references per job.' },
  { id: 'int-4', name: 'CallRail', status: 'watch', lastSync: '2026-04-25T05:55:00Z', health: 'Call queue placeholder only.', dataAvailable: ['missed call placeholder'], errors: ['No ingestion adapter'], nextRecommendedAction: 'Define call summary schema and transcript handoff.' },
  { id: 'int-5', name: 'OpenClaw Gateway', status: 'healthy', lastSync: '2026-04-25T08:11:00Z', health: 'Runtime connected and delivering agent status.', dataAvailable: ['agent roster', 'automation runs', 'approval placeholders'], errors: [], nextRecommendedAction: 'Wire token/cost and cron status into dashboard views.' },
  { id: 'int-6', name: 'Twilio / Voice Layer', status: 'watch', lastSync: '2026-04-25T07:52:00Z', health: 'Phone agent working; richer call analytics still placeholder.', dataAvailable: ['webhook status placeholder', 'call summary placeholder'], errors: [], nextRecommendedAction: 'Add last call outcome and escalation feed once schema is finalized.' },
  { id: 'int-7', name: 'Convex / Database', status: 'offline', health: 'No active dashboard data store adapter yet.', dataAvailable: [], errors: ['No persistence layer wired'], nextRecommendedAction: 'Stand up typed command center repository adapters before live integration.' },
];

export const commandCenterData: CommandCenterDataset = {
  customers,
  leads,
  inspections,
  estimates,
  proposals,
  productionStages,
  roofSystems,
  jobs,
  insuranceClaims,
  supplements,
  payments,
  invoices,
  expenses,
  vendors,
  materialOrders,
  crews,
  teamMembers,
  agents,
  agentTasks,
  approvals,
  automationRuns,
  customerCommunications,
  customerRisks,
  reviewRequests,
  marketingSources,
  documentResources,
  integrationHealth,
};

const customerMap = new Map(customers.map((customer) => [customer.id, customer]));
const teamMap = new Map(teamMembers.map((member) => [member.id, member]));
const roofSystemMap = new Map(roofSystems.map((system) => [system.id, system]));
const vendorMap = new Map(vendors.map((vendor) => [vendor.id, vendor]));
const claimMap = new Map(insuranceClaims.map((claim) => [claim.id, claim]));

export const ownerActionItems: OwnerActionItem[] = [
  {
    id: 'owner-1',
    title: 'Call Patricia Bowman before final payment dispute hardens',
    reason: 'Complaint + possible 1-star risk + margin already under target.',
    priority: 'critical',
    dueAt: '2026-04-25T15:00:00Z',
    owner: 'Matthew Griffin',
    relatedEntity: 'Patricia Bowman / job-4',
    nextRecommendedAction: 'Owner call, approve recovery credit ceiling, set same-day resolution plan.',
  },
  {
    id: 'owner-2',
    title: 'Approve appraisal communication path for Elizabeth Seidell',
    reason: 'Sensitive insurance representations and stalled supplement aging.',
    priority: 'high',
    dueAt: '2026-04-25T16:00:00Z',
    owner: 'Matthew Griffin',
    relatedEntity: 'Elizabeth Seidell / claim-1',
    nextRecommendedAction: 'Review draft language and approve what can be promised to customer and carrier.',
  },
  {
    id: 'owner-3',
    title: 'Decide Monroe Dental deposit exception',
    reason: 'Large commercial contract sitting sold but not converted to cash.',
    priority: 'high',
    dueAt: '2026-04-25T17:00:00Z',
    owner: 'Matthew Griffin',
    relatedEntity: 'Monroe Dental Plaza / job-3',
    nextRecommendedAction: 'Approve or reject revised deposit terms so material ordering can start.',
  },
  {
    id: 'owner-4',
    title: 'Choose salvage path for Vivian Harris',
    reason: 'Negative sentiment with follow-up leakage and reputation risk.',
    priority: 'medium',
    dueAt: '2026-04-25T19:30:00Z',
    owner: 'Matthew Griffin',
    relatedEntity: 'Vivian Harris / prop-1',
    nextRecommendedAction: 'Decide: close out, owner-save attempt, or nurture with controlled cadence.',
  },
];

export const alerts: Alert[] = [
  {
    id: 'alert-1',
    title: 'Customer not updated in 3+ days',
    description: 'Elizabeth Seidell has gone 3 days without update while supplement/appraisal lane is aging.',
    priority: 'high',
    status: 'open',
    relatedType: 'customer',
    relatedId: 'cust-2',
    ageLabel: '3d',
  },
  {
    id: 'alert-2',
    title: 'Completed job not fully invoiced / collected',
    description: 'Patricia Bowman is complete, invoiced, and past due with complaint risk attached.',
    priority: 'critical',
    status: 'open',
    relatedType: 'finance',
    relatedId: 'job-4',
    ageLabel: '6d',
  },
  {
    id: 'alert-3',
    title: 'Supplement pending over 14 days',
    description: 'Elizabeth Seidell supplement request has been pending for 16 days with no approved amount yet.',
    priority: 'high',
    status: 'open',
    relatedType: 'claim',
    relatedId: 'supp-1',
    ageLabel: '16d',
  },
  {
    id: 'alert-4',
    title: 'Proposal sent but no structured follow-up',
    description: 'Vivian Harris proposal is in follow-up due status with negative sentiment and no owner-confirmed next path.',
    priority: 'high',
    status: 'open',
    relatedType: 'customer',
    relatedId: 'prop-1',
    ageLabel: '7d',
  },
  {
    id: 'alert-5',
    title: 'Sold job missing deposit',
    description: 'Monroe Dental Plaza is sold with zero deposit collected and materials not ordered.',
    priority: 'high',
    status: 'open',
    relatedType: 'job',
    relatedId: 'job-3',
    ageLabel: '4d',
  },
  {
    id: 'alert-6',
    title: 'Job below 20% net margin',
    description: 'Patricia Bowman is projecting ~12% net margin after actual labor/material variance.',
    priority: 'critical',
    status: 'open',
    relatedType: 'job',
    relatedId: 'job-4',
    ageLabel: 'active',
  },
  {
    id: 'alert-7',
    title: 'OpenClaw agent missed heartbeat',
    description: 'Browser Agent has stale heartbeat and still lacks safe authenticated session for production reads.',
    priority: 'medium',
    status: 'watching',
    relatedType: 'agent',
    relatedId: 'agent-5',
    ageLabel: '13h',
  },
  {
    id: 'alert-8',
    title: 'Integration sync failed / unavailable',
    description: 'Convex/database layer is still offline, so command center data is mock-only and non-persistent.',
    priority: 'medium',
    status: 'watching',
    relatedType: 'integration',
    relatedId: 'int-7',
    ageLabel: 'current',
  },
];

export function findCustomer(customerId: string) {
  return customerMap.get(customerId);
}

export function findTeamMember(memberId?: string) {
  if (!memberId) return undefined;
  return teamMap.get(memberId);
}

export function findRoofSystem(roofSystemId: string) {
  return roofSystemMap.get(roofSystemId);
}

export function findVendor(vendorId?: string) {
  if (!vendorId) return undefined;
  return vendorMap.get(vendorId);
}

export function findClaim(claimId: string) {
  return claimMap.get(claimId);
}
