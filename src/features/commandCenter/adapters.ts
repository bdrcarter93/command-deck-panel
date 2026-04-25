import { alerts, commandCenterData, ownerActionItems } from './mockData';
import type { Alert, CommandCenterDataset, OwnerActionItem } from './types';

export interface CommandCenterAdapter<T> {
  key: string;
  label: string;
  description: string;
  fetch: () => Promise<T>;
}

const mockDelay = <T,>(value: T, delayMs = 60) => new Promise<T>((resolve) => setTimeout(() => resolve(value), delayMs));

export const customerAdapter: CommandCenterAdapter<CommandCenterDataset['customers']> = {
  key: 'customers',
  label: 'Customer Records',
  description: 'Replace with AccuLynx/CRM customer adapter later.',
  fetch: () => mockDelay(commandCenterData.customers),
};

export const financeAdapter: CommandCenterAdapter<Pick<CommandCenterDataset, 'payments' | 'invoices' | 'expenses'>> = {
  key: 'finance',
  label: 'Finance Snapshot',
  description: 'Prepared for QuickBooks and internal ledger adapters.',
  fetch: () => mockDelay({
    payments: commandCenterData.payments,
    invoices: commandCenterData.invoices,
    expenses: commandCenterData.expenses,
  }),
};

export const insuranceAdapter: CommandCenterAdapter<Pick<CommandCenterDataset, 'insuranceClaims' | 'supplements'>> = {
  key: 'insurance',
  label: 'Insurance & Supplements',
  description: 'Prepared for AccuLynx + supplement workflow sync.',
  fetch: () => mockDelay({
    insuranceClaims: commandCenterData.insuranceClaims,
    supplements: commandCenterData.supplements,
  }),
};

export const operationsAdapter: CommandCenterAdapter<Pick<CommandCenterDataset, 'jobs' | 'materialOrders' | 'vendors' | 'crews'>> = {
  key: 'operations',
  label: 'Production Operations',
  description: 'Prepared for production board, ABC Supply, and crew scheduling data.',
  fetch: () => mockDelay({
    jobs: commandCenterData.jobs,
    materialOrders: commandCenterData.materialOrders,
    vendors: commandCenterData.vendors,
    crews: commandCenterData.crews,
  }),
};

export const automationAdapter: CommandCenterAdapter<Pick<CommandCenterDataset, 'agents' | 'agentTasks' | 'approvals' | 'automationRuns' | 'integrationHealth'>> = {
  key: 'automation',
  label: 'OpenClaw Automation',
  description: 'Prepared for OpenClaw runtime, logs, cron, and approval queue surfaces.',
  fetch: () => mockDelay({
    agents: commandCenterData.agents,
    agentTasks: commandCenterData.agentTasks,
    approvals: commandCenterData.approvals,
    automationRuns: commandCenterData.automationRuns,
    integrationHealth: commandCenterData.integrationHealth,
  }),
};

export const documentAdapter: CommandCenterAdapter<CommandCenterDataset['documentResources']> = {
  key: 'documents',
  label: 'Documents / SOP Library',
  description: 'Prepared for Drive, Obsidian, or internal docs source.',
  fetch: () => mockDelay(commandCenterData.documentResources),
};

export const alertAdapter: CommandCenterAdapter<Alert[]> = {
  key: 'alerts',
  label: 'Alert Engine',
  description: 'Mock alert output replacing future real-time business rules.',
  fetch: () => mockDelay(alerts),
};

export const ownerQueueAdapter: CommandCenterAdapter<OwnerActionItem[]> = {
  key: 'owner-queue',
  label: 'Owner Queue',
  description: 'Focused Matthew-level attention queue.',
  fetch: () => mockDelay(ownerActionItems),
};

export async function getCommandCenterDataset(): Promise<CommandCenterDataset> {
  return mockDelay(commandCenterData);
}
