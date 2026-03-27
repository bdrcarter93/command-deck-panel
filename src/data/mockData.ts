export interface Agent {
  id: string;
  name: string;
  emoji: string;
  subtitle: string;
  type: string;
  role: string;
  status: 'active' | 'idle' | 'error' | 'offline';
  accentColor: string;
  tasksCompleted: number;
  accuracy: number;
  skills: string[];
  currentActivity: string;
  lastSeen: string;
}

export const agents: Agent[] = [
  {
    id: 'alpha',
    name: 'Agent Alpha',
    emoji: '🤖',
    subtitle: 'Your lead AI engineer',
    type: 'Code Agent',
    role: 'Lead Engineer',
    status: 'active',
    accentColor: '#10b981',
    tasksCompleted: 342,
    accuracy: 98.7,
    skills: ['TypeScript', 'React', 'Python', 'DevOps', 'Code Review'],
    currentActivity: 'Refactoring auth module',
    lastSeen: 'just now',
  },
  {
    id: 'dispatch',
    name: 'Dispatch Bot',
    emoji: '📋',
    subtitle: 'Operations coordinator',
    type: 'Coordinator',
    role: 'Operations Director',
    status: 'idle',
    accentColor: '#f59e0b',
    tasksCompleted: 189,
    accuracy: 95.2,
    skills: ['Task Routing', 'Scheduling', 'Priority Management', 'Reporting'],
    currentActivity: 'Waiting for new tasks',
    lastSeen: '2m ago',
  },
  {
    id: 'audit',
    name: 'Audit Bot',
    emoji: '🛡️',
    subtitle: 'Compliance & quality',
    type: 'Quality Agent',
    role: 'Compliance Officer',
    status: 'active',
    accentColor: '#06b6d4',
    tasksCompleted: 256,
    accuracy: 99.1,
    skills: ['Code Audit', 'Security Scan', 'Compliance', 'Documentation'],
    currentActivity: 'Scanning PR #87 for vulnerabilities',
    lastSeen: 'just now',
  },
];

export interface ActivityItem {
  id: string;
  agentEmoji: string;
  agentName: string;
  action: string;
  timestamp: string;
}

export const recentActivity: ActivityItem[] = [
  { id: '1', agentEmoji: '🤖', agentName: 'Agent Alpha', action: 'Completed refactoring of auth module', timestamp: '2m ago' },
  { id: '2', agentEmoji: '🛡️', agentName: 'Audit Bot', action: 'Flagged 2 security issues in PR #87', timestamp: '5m ago' },
  { id: '3', agentEmoji: '📋', agentName: 'Dispatch Bot', action: 'Reassigned 3 tasks to Agent Alpha', timestamp: '12m ago' },
  { id: '4', agentEmoji: '🤖', agentName: 'Agent Alpha', action: 'Deployed hotfix v2.3.1 to staging', timestamp: '18m ago' },
  { id: '5', agentEmoji: '🛡️', agentName: 'Audit Bot', action: 'Completed compliance scan — all clear', timestamp: '25m ago' },
  { id: '6', agentEmoji: '📋', agentName: 'Dispatch Bot', action: 'Created daily standup summary', timestamp: '32m ago' },
  { id: '7', agentEmoji: '🤖', agentName: 'Agent Alpha', action: 'Merged PR #85 — dashboard redesign', timestamp: '45m ago' },
  { id: '8', agentEmoji: '🛡️', agentName: 'Audit Bot', action: 'Generated weekly compliance report', timestamp: '1h ago' },
];

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskColumn = 'todo' | 'doing' | 'needs-input' | 'done';

export interface Task {
  id: string;
  title: string;
  assignee: string;
  priority: TaskPriority;
  progress?: number;
  column: TaskColumn;
}

export const initialTasks: Task[] = [
  { id: 't1', title: 'Set up CI/CD pipeline', assignee: '🤖', priority: 'high', column: 'todo' },
  { id: 't2', title: 'Write API documentation', assignee: '🛡️', priority: 'medium', column: 'todo' },
  { id: 't3', title: 'Design onboarding flow', assignee: '📋', priority: 'low', column: 'todo' },
  { id: 't4', title: 'Refactor auth module', assignee: '🤖', priority: 'urgent', progress: 80, column: 'doing' },
  { id: 't5', title: 'Scan PR #87 for vulns', assignee: '🛡️', priority: 'high', progress: 45, column: 'doing' },
  { id: 't6', title: 'Review pricing strategy', assignee: '📋', priority: 'medium', column: 'needs-input' },
  { id: 't7', title: 'Clarify deploy schedule', assignee: '🤖', priority: 'high', column: 'needs-input' },
  { id: 't8', title: 'Migrate DB to v3 schema', assignee: '🤖', priority: 'high', column: 'done' },
  { id: 't9', title: 'Compliance report Q1', assignee: '🛡️', priority: 'medium', column: 'done' },
  { id: 't10', title: 'Onboard new team member', assignee: '📋', priority: 'low', column: 'done' },
];

export type LogCategory = 'observation' | 'general' | 'reminder' | 'fyi';

export interface LogEntry {
  id: string;
  agentEmoji: string;
  agentName: string;
  category: LogCategory;
  message: string;
  timestamp: string;
}

export const logEntries: LogEntry[] = [
  { id: 'l1', agentEmoji: '🤖', agentName: 'Agent Alpha', category: 'observation', message: 'Auth module has 3 redundant middleware layers. Recommend consolidation.', timestamp: '3m ago' },
  { id: 'l2', agentEmoji: '🛡️', agentName: 'Audit Bot', category: 'fyi', message: 'New CVE published for dependency lodash@4.17.20. Current project uses 4.17.21 — not affected.', timestamp: '8m ago' },
  { id: 'l3', agentEmoji: '📋', agentName: 'Dispatch Bot', category: 'reminder', message: 'Sprint review meeting in 2 hours. 3 tasks still in progress.', timestamp: '15m ago' },
  { id: 'l4', agentEmoji: '🤖', agentName: 'Agent Alpha', category: 'general', message: 'Deployed hotfix v2.3.1 to staging. All tests passing.', timestamp: '22m ago' },
  { id: 'l5', agentEmoji: '🛡️', agentName: 'Audit Bot', category: 'observation', message: 'API response times increased 12% over last 24h. Monitoring.', timestamp: '35m ago' },
  { id: 'l6', agentEmoji: '📋', agentName: 'Dispatch Bot', category: 'fyi', message: 'Task queue is empty. All agents are available for new assignments.', timestamp: '42m ago' },
  { id: 'l7', agentEmoji: '🤖', agentName: 'Agent Alpha', category: 'reminder', message: 'PR #85 has been open for 48h. Consider reviewing or closing.', timestamp: '1h ago' },
  { id: 'l8', agentEmoji: '🛡️', agentName: 'Audit Bot', category: 'general', message: 'Weekly compliance scan complete. 0 critical issues found.', timestamp: '1h ago' },
  { id: 'l9', agentEmoji: '🤖', agentName: 'Agent Alpha', category: 'observation', message: 'Database query N+1 detected in /api/users endpoint. Should batch queries.', timestamp: '2h ago' },
  { id: 'l10', agentEmoji: '📋', agentName: 'Dispatch Bot', category: 'general', message: 'Daily task summary: 8 completed, 3 in progress, 2 blocked.', timestamp: '3h ago' },
];

export interface CouncilMessage {
  agentEmoji: string;
  agentName: string;
  messageNumber: number;
  content: string;
  timestamp: string;
}

export interface CouncilSession {
  id: string;
  question: string;
  status: 'active' | 'completed' | 'pending';
  participants: { emoji: string; name: string; sent: number; limit: number; status: 'done' | 'pending' | 'active' }[];
  messages: CouncilMessage[];
}

export const councilSessions: CouncilSession[] = [
  {
    id: 'c1',
    question: 'Should we migrate the auth system from JWT to session-based tokens?',
    status: 'completed',
    participants: [
      { emoji: '🤖', name: 'Agent Alpha', sent: 3, limit: 3, status: 'done' },
      { emoji: '🛡️', name: 'Audit Bot', sent: 3, limit: 3, status: 'done' },
      { emoji: '📋', name: 'Dispatch Bot', sent: 2, limit: 3, status: 'done' },
    ],
    messages: [
      { agentEmoji: '🤖', agentName: 'Agent Alpha', messageNumber: 1, content: 'JWTs are stateless and scale better for our microservices architecture. However, revocation is painful.', timestamp: '2h ago' },
      { agentEmoji: '🛡️', agentName: 'Audit Bot', messageNumber: 1, content: 'Session tokens give us immediate revocation — critical for compliance. JWT blacklists add complexity.', timestamp: '2h ago' },
      { agentEmoji: '📋', agentName: 'Dispatch Bot', messageNumber: 1, content: 'From an ops perspective, session stores add infrastructure overhead. Redis would be needed.', timestamp: '1h ago' },
      { agentEmoji: '🤖', agentName: 'Agent Alpha', messageNumber: 2, content: 'Compromise: short-lived JWTs (5min) with refresh tokens stored server-side. Best of both worlds.', timestamp: '1h ago' },
      { agentEmoji: '🛡️', agentName: 'Audit Bot', messageNumber: 2, content: 'Agreed. Short-lived JWTs with server-side refresh meets our security requirements.', timestamp: '55m ago' },
    ],
  },
  {
    id: 'c2',
    question: 'What testing strategy should we adopt for the new dashboard features?',
    status: 'active',
    participants: [
      { emoji: '🤖', name: 'Agent Alpha', sent: 2, limit: 3, status: 'active' },
      { emoji: '🛡️', name: 'Audit Bot', sent: 1, limit: 3, status: 'pending' },
      { emoji: '📋', name: 'Dispatch Bot', sent: 0, limit: 3, status: 'pending' },
    ],
    messages: [
      { agentEmoji: '🤖', agentName: 'Agent Alpha', messageNumber: 1, content: 'I recommend a testing pyramid: 70% unit, 20% integration, 10% E2E. Vitest for unit, Playwright for E2E.', timestamp: '30m ago' },
      { agentEmoji: '🛡️', agentName: 'Audit Bot', messageNumber: 1, content: 'Add mutation testing to catch gaps. Stryker has good TypeScript support.', timestamp: '20m ago' },
      { agentEmoji: '🤖', agentName: 'Agent Alpha', messageNumber: 2, content: 'Good call on mutation testing. We should also add visual regression tests for the dashboard components.', timestamp: '10m ago' },
    ],
  },
];

export type MeetingType = 'standup' | 'sales' | 'interview' | 'all-hands' | '1-on-1' | 'planning' | 'team' | 'external';

export interface ActionItem {
  task: string;
  assignee: string;
  done: boolean;
}

export interface Meeting {
  id: string;
  type: MeetingType;
  title: string;
  date: string;
  duration_minutes: number;
  duration_display: string;
  attendees: string[];
  summary: string;
  action_items: ActionItem[];
  ai_insights: string;
  meeting_type: MeetingType;
  sentiment: 'positive' | 'neutral' | 'negative';
  has_external_participants: boolean;
  external_domains: string[];
  fathom_url: string | null;
  share_url: string | null;
}

export const meetings: Meeting[] = [
  {
    id: 'm1', type: 'standup', title: 'Weekly Standup with Engineering', date: '2026-03-25T10:00:00Z',
    duration_minutes: 30, duration_display: '30m', attendees: ['Alice', 'Bob', 'Charlie'],
    summary: '**Sprint Progress**\n\nBackend API is 80% complete. Frontend dashboard redesign merged. Two blockers identified:\n- Auth module needs refactoring\n- CI pipeline intermittent failures',
    action_items: [
      { task: 'Review PR #42', assignee: 'Alice', done: false },
      { task: 'Update API docs', assignee: 'Bob', done: true },
    ],
    ai_insights: '30 min meeting with 3 attendees. Key topic: sprint progress review.',
    meeting_type: 'standup', sentiment: 'positive', has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
  {
    id: 'm2', type: 'standup', title: 'Daily Standup — Frontend Team', date: '2026-03-24T09:00:00Z',
    duration_minutes: 15, duration_display: '15m', attendees: ['Diana', 'Eve'],
    summary: 'Quick sync on component library updates. All on track.',
    action_items: [{ task: 'Publish Storybook', assignee: 'Diana', done: false }],
    ai_insights: '15 min standup. No blockers reported.',
    meeting_type: 'standup', sentiment: 'positive', has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
  {
    id: 'm3', type: 'sales', title: 'Demo Call with Acme Corp', date: '2026-03-23T14:00:00Z',
    duration_minutes: 45, duration_display: '45m', attendees: ['Alice', 'Frank', 'Grace (Acme)'],
    summary: '**Product Demo**\n\nShowed dashboard analytics and AI agent features. Acme very interested in the compliance module. Requested enterprise pricing.',
    action_items: [
      { task: 'Send enterprise pricing', assignee: 'Alice', done: false },
      { task: 'Prepare compliance demo', assignee: 'Frank', done: false },
    ],
    ai_insights: '45 min demo. High engagement from Acme. Follow-up needed.',
    meeting_type: 'sales', sentiment: 'positive', has_external_participants: true, external_domains: ['acme.com'], fathom_url: 'https://fathom.video/demo', share_url: 'https://share.example.com/m3',
  },
  {
    id: 'm4', type: 'sales', title: 'Follow-up with Globex Industries', date: '2026-03-20T11:00:00Z',
    duration_minutes: 60, duration_display: '1h', attendees: ['Bob', 'Hank (Globex)', 'Ivy (Globex)'],
    summary: 'Discussed integration requirements. Globex needs SSO and custom reporting. Timeline: Q2 delivery.',
    action_items: [
      { task: 'Draft SOW for Globex', assignee: 'Bob', done: true },
      { task: 'Schedule technical deep-dive', assignee: 'Bob', done: false },
    ],
    ai_insights: '1h call with external stakeholders. Contract discussion phase.',
    meeting_type: 'sales', sentiment: 'neutral', has_external_participants: true, external_domains: ['globex.com'], fathom_url: null, share_url: null,
  },
  {
    id: 'm5', type: 'interview', title: 'Technical Interview — Senior Engineer', date: '2026-03-22T15:00:00Z',
    duration_minutes: 60, duration_display: '1h', attendees: ['Charlie', 'Diana', 'Candidate'],
    summary: 'Strong candidate. Excellent system design skills. Some gaps in frontend testing knowledge.',
    action_items: [
      { task: 'Submit interview scorecard', assignee: 'Charlie', done: false },
    ],
    ai_insights: '1h interview. Candidate rated 4/5 overall.',
    meeting_type: 'interview', sentiment: 'positive', has_external_participants: true, external_domains: [], fathom_url: null, share_url: null,
  },
  {
    id: 'm6', type: 'all-hands', title: 'March All-Hands Meeting', date: '2026-03-18T16:00:00Z',
    duration_minutes: 90, duration_display: '1h 30m', attendees: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'],
    summary: '**Q1 Review**\n\nRevenue up 23%. New product launch on track. Hiring 5 new engineers in Q2. Company retreat planned for June.',
    action_items: [
      { task: 'Publish Q1 report', assignee: 'Alice', done: true },
      { task: 'Open engineering roles', assignee: 'Frank', done: false },
    ],
    ai_insights: '90 min all-hands. Positive sentiment. Major announcements made.',
    meeting_type: 'all-hands', sentiment: 'positive', has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
  {
    id: 'm7', type: '1-on-1', title: '1-on-1: Alice & Bob', date: '2026-03-21T10:00:00Z',
    duration_minutes: 30, duration_display: '30m', attendees: ['Alice', 'Bob'],
    summary: 'Career development discussion. Bob interested in moving to team lead role. Set goals for Q2.',
    action_items: [
      { task: 'Draft Bob\'s development plan', assignee: 'Alice', done: false },
    ],
    ai_insights: '30 min 1-on-1. Career growth focused.',
    meeting_type: '1-on-1', sentiment: 'positive', has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
  {
    id: 'm8', type: '1-on-1', title: '1-on-1: Charlie & Diana', date: '2026-03-19T14:00:00Z',
    duration_minutes: 25, duration_display: '25m', attendees: ['Charlie', 'Diana'],
    summary: 'Discussed project priorities and workload balancing. Diana taking on more frontend ownership.',
    action_items: [],
    ai_insights: '25 min 1-on-1. Workload discussion.',
    meeting_type: '1-on-1', sentiment: 'neutral', has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
  {
    id: 'm9', type: 'planning', title: 'Q2 Sprint Planning', date: '2026-03-17T09:00:00Z',
    duration_minutes: 120, duration_display: '2h', attendees: ['Alice', 'Bob', 'Charlie', 'Eve'],
    summary: '**Sprint Planning**\n\nPlanned 3 sprints for Q2. Key epics: Dashboard v2, API v3, Mobile app MVP. Estimated 180 story points total.',
    action_items: [
      { task: 'Create Jira epics', assignee: 'Eve', done: true },
      { task: 'Assign sprint leads', assignee: 'Alice', done: false },
      { task: 'Set up sprint boards', assignee: 'Charlie', done: true },
    ],
    ai_insights: '2h planning session. 3 epics defined, 180 story points estimated.',
    meeting_type: 'planning', sentiment: 'positive', has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
  {
    id: 'm10', type: 'team', title: 'Design Review — Dashboard v2', date: '2026-03-16T13:00:00Z',
    duration_minutes: 45, duration_display: '45m', attendees: ['Diana', 'Eve', 'Frank'],
    summary: 'Reviewed Figma mocks for dashboard v2. Approved dark theme. Requested changes to chart colors.',
    action_items: [
      { task: 'Update chart color palette', assignee: 'Diana', done: false },
      { task: 'Export final assets', assignee: 'Eve', done: false },
    ],
    ai_insights: '45 min design review. Dark theme approved.',
    meeting_type: 'team', sentiment: 'positive', has_external_participants: false, external_domains: [], fathom_url: null, share_url: null,
  },
];
