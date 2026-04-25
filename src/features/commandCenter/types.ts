export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';
export type HealthStatus = 'healthy' | 'watch' | 'risk' | 'offline';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type BusinessUnit = 'Roof Doctors' | 'Build Doctors' | 'OpenClaw';
export type OwnerApprovalCategory =
  | 'customer_money'
  | 'pricing_exception'
  | 'contract'
  | 'legal_compliance'
  | 'insurance_representation'
  | 'unusual_promise'
  | 'high_risk_communication'
  | 'reputation_sensitive'
  | 'live_financial_record'
  | 'critical_system_setting'
  | 'external_action';

export interface Customer {
  id: string;
  name: string;
  businessUnit: BusinessUnit;
  address: string;
  city: string;
  phone: string;
  email: string;
  journeyStage:
    | 'New Lead'
    | 'Inspection Booked'
    | 'Inspection Completed'
    | 'Estimate Sent'
    | 'Contract Signed'
    | 'Job Preparation'
    | 'Production Scheduled'
    | 'Production Complete'
    | 'Invoice / Payment'
    | 'Review Request'
    | 'Warranty / Maintenance';
  salesRepId?: string;
  productionManagerId?: string;
  lastContactAt: string;
  nextContactAt?: string;
  sentiment: Sentiment;
  riskLevel: RiskLevel;
  reviewRequestStatus: 'not_sent' | 'sent' | 'received';
  ownerAttention: boolean;
}

export interface Lead {
  id: string;
  customerId: string;
  sourceId: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'booked' | 'inspection_complete' | 'estimate_pending' | 'proposal_sent' | 'sold' | 'lost';
  bookingStatus: 'unbooked' | 'booked' | 'reschedule_needed';
  valuePotential: number;
  leakageRisk: boolean;
  assignedTo: string;
}

export interface Inspection {
  id: string;
  customerId: string;
  leadId: string;
  scheduledAt: string;
  completedAt?: string;
  inspectorId: string;
  status: 'scheduled' | 'completed' | 'reschedule_needed';
  notes: string;
}

export interface Estimate {
  id: string;
  customerId: string;
  inspectionId?: string;
  roofSystemId: string;
  status: 'draft' | 'sent' | 'overdue' | 'approved' | 'lost';
  amount: number;
  createdAt: string;
  sentAt?: string;
  dueAt?: string;
  salesRepId: string;
}

export interface Proposal {
  id: string;
  customerId: string;
  estimateId: string;
  status: 'draft' | 'sent' | 'follow_up_due' | 'won' | 'lost';
  sentAt: string;
  followUpAt?: string;
  contractValue: number;
}

export interface ProductionStage {
  id: string;
  name:
    | 'Lead'
    | 'Inspection Booked'
    | 'Inspection Complete'
    | 'Estimate Drafting'
    | 'Proposal Sent'
    | 'Sold'
    | 'Deposit Needed'
    | 'Supplement / Insurance'
    | 'Material Ordered'
    | 'Scheduled'
    | 'In Production'
    | 'Final Inspection'
    | 'Invoice Sent'
    | 'Paid'
    | 'Closed'
    | 'Warranty / Follow-Up';
  thresholdDays: number;
}

export interface RoofSystem {
  id: string;
  name:
    | 'Shingle'
    | 'Tile'
    | 'Foam'
    | 'Coating'
    | 'Foam + Coating'
    | 'Scarify'
    | 'Standing Seam'
    | 'Stone Coated Steel'
    | 'Sand Cast'
    | 'Kiln Fired Clay Tile'
    | 'TPO'
    | 'TPO + ISO'
    | 'EPDM'
    | 'PVC'
    | 'Shake'
    | 'Wood Shingle';
  averageSalePrice: number;
  averageCostPerSquare: number;
  averageLaborPerSquare: number;
  averageMaterialCost: number;
  averageGrossMargin: number;
  averageNetMargin: number;
  commonChangeOrders: string[];
  commonSupplementOpportunities: string[];
  commonProductionIssues: string[];
  bestCrewIds: string[];
  callbackFrequency: number;
}

export interface Job {
  id: string;
  customerId: string;
  stage: ProductionStage['name'] | 'Contract Complete' | 'Material Selection Needed' | 'Waiting on Delivery' | 'Paid / Closed';
  contractAmount: number;
  soldDate: string;
  roofSystemId: string;
  salesRepId: string;
  productionManagerId?: string;
  crewId?: string;
  scheduledDate?: string;
  materialStatus: 'not_ordered' | 'ordered' | 'backordered' | 'delivered';
  laborStatus: 'unassigned' | 'assigned' | 'in_progress' | 'complete';
  permitStatus: 'not_needed' | 'pending' | 'approved';
  hoaStatus: 'not_needed' | 'pending' | 'approved';
  bottleneck: string;
  daysInStage: number;
  forecastGrossMargin: number;
  netProfitEstimate: number;
  riskLevel: RiskLevel;
  depositRequired: number;
  depositCollected: number;
  ownerId?: string;
}

export interface InsuranceClaim {
  id: string;
  customerId: string;
  carrier: string;
  claimNumber: string;
  adjuster: string;
  stage: 'inspection' | 'submitted' | 'pending_supplement' | 'approved' | 'denied' | 'appraisal';
  originalRCV: number;
  originalACV: number;
  depreciationRecoverable: number;
  deductible: number;
  customerOutOfPocket: number;
  lastContactDate: string;
  nextActionDate?: string;
  assignedOwnerId: string;
  agingDays: number;
  riskLevel: RiskLevel;
  mortgageCheckStatus: 'not_applicable' | 'pending' | 'received' | 'endorsed';
}

export interface Supplement {
  id: string;
  claimId: string;
  requestedAmount: number;
  approvedAmount: number;
  submittedAt: string;
  status: 'submitted' | 'pending' | 'approved' | 'denied' | 'partial';
  agingDays: number;
  customerUpdateNeeded: boolean;
  adjusterFollowUpNeeded: boolean;
}

export interface Payment {
  id: string;
  customerId: string;
  jobId?: string;
  type: 'deposit' | 'progress' | 'final' | 'insurance' | 'mortgage';
  amount: number;
  dueDate: string;
  receivedDate?: string;
  status: 'due' | 'received' | 'past_due';
}

export interface Invoice {
  id: string;
  customerId: string;
  jobId: string;
  amount: number;
  sentDate?: string;
  dueDate: string;
  paidDate?: string;
  status: 'draft' | 'sent' | 'paid' | 'past_due';
}

export interface Expense {
  id: string;
  jobId?: string;
  category: 'material' | 'labor' | 'overhead' | 'subcontractor' | 'permit' | 'other';
  amount: number;
  date: string;
  vendorId?: string;
  variable: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  balanceDue: number;
  nextDeliveryDate?: string;
  status: HealthStatus;
}

export interface MaterialOrder {
  id: string;
  jobId: string;
  vendorId: string;
  orderDate: string;
  deliveryDate?: string;
  status: 'draft' | 'ordered' | 'backordered' | 'delivered';
  amount: number;
}

export interface Crew {
  id: string;
  name: string;
  roofSystemIds: string[];
  capacityScore: number;
  laborRate: number;
  callbackRate: number;
  averageInstallDuration: number;
  qualityScore: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'CSR' | 'Sales Rep' | 'Production Manager' | 'Supplement Coordinator' | 'Admin' | 'Bookkeeping/Finance' | 'Owner';
  responseHours: number;
  qualityScore: number;
  escalationCount: number;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'failed' | 'awaiting_review';
  currentTask: string;
  lastAction: string;
  lastHeartbeat: string;
  costPlaceholder?: string;
}

export interface AgentTask {
  id: string;
  agentId: string;
  title: string;
  status: 'created' | 'in_progress' | 'completed' | 'blocked';
  createdAt: string;
  completedAt?: string;
}

export interface Approval {
  id: string;
  title: string;
  category: OwnerApprovalCategory;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  requestedAt: string;
  amountImpact?: number;
  relatedCustomerId?: string;
  requiresMatthewApproval: boolean;
}

export interface AutomationRun {
  id: string;
  name: string;
  status: 'success' | 'failed' | 'waiting' | 'running';
  lastRunAt: string;
  nextAction: string;
}

export interface CustomerCommunication {
  id: string;
  customerId: string;
  channel: 'call' | 'text' | 'email';
  direction: 'inbound' | 'outbound';
  sentiment: Sentiment;
  date: string;
  summary: string;
}

export interface CustomerRisk {
  id: string;
  customerId: string;
  reason: string;
  riskLevel: RiskLevel;
  daysSinceUpdate: number;
  ownerAttention: boolean;
}

export interface ReviewRequest {
  id: string;
  customerId: string;
  sentAt?: string;
  receivedAt?: string;
  status: 'not_sent' | 'sent' | 'received';
}

export interface MarketingSource {
  id: string;
  name: string;
  leads: number;
  bookedInspections: number;
  sales: number;
  spend: number;
  grossProfit: number;
  averageTicket: number;
}

export interface DocumentResource {
  id: string;
  title: string;
  section: string;
  type: 'SOP' | 'Template' | 'Script' | 'Guide';
  updatedAt: string;
  owner: string;
}

export interface IntegrationHealth {
  id: string;
  name: string;
  status: HealthStatus;
  lastSync?: string;
  health: string;
  dataAvailable: string[];
  errors: string[];
  nextRecommendedAction: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: 'open' | 'watching' | 'resolved';
  relatedType: 'customer' | 'job' | 'claim' | 'approval' | 'agent' | 'integration' | 'finance';
  relatedId: string;
  ageLabel: string;
}

export interface OwnerActionItem {
  id: string;
  title: string;
  reason: string;
  priority: Priority;
  dueAt: string;
  owner: string;
  relatedEntity: string;
  nextRecommendedAction: string;
}

export interface CommandCenterDataset {
  customers: Customer[];
  leads: Lead[];
  inspections: Inspection[];
  estimates: Estimate[];
  proposals: Proposal[];
  productionStages: ProductionStage[];
  roofSystems: RoofSystem[];
  jobs: Job[];
  insuranceClaims: InsuranceClaim[];
  supplements: Supplement[];
  payments: Payment[];
  invoices: Invoice[];
  expenses: Expense[];
  vendors: Vendor[];
  materialOrders: MaterialOrder[];
  crews: Crew[];
  teamMembers: TeamMember[];
  agents: Agent[];
  agentTasks: AgentTask[];
  approvals: Approval[];
  automationRuns: AutomationRun[];
  customerCommunications: CustomerCommunication[];
  customerRisks: CustomerRisk[];
  reviewRequests: ReviewRequest[];
  marketingSources: MarketingSource[];
  documentResources: DocumentResource[];
  integrationHealth: IntegrationHealth[];
}

export interface CommandCenterFilters {
  search: string;
  owner: string;
  stage: string;
  status: string;
  risk: string;
  roofSystem: string;
  salesRep: string;
  crew: string;
  leadSource: string;
  carrier: string;
  dateRange: 'today' | '7d' | '30d' | '90d';
}
