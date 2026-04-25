import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const dataDirs = [path.join(projectRoot, 'public', 'data'), path.join(projectRoot, 'dist', 'data')].filter((dir) => fs.existsSync(dir));
const writableDirs = dataDirs.length > 0 ? dataDirs : [path.join(projectRoot, 'public', 'data')];

const [, , command, ...args] = process.argv;

if (!command) {
  console.error('Usage: ./update-hq.sh <chat|feed|status|task> ...');
  process.exit(1);
}

for (const dir of writableDirs) fs.mkdirSync(dir, { recursive: true });

const readJson = (fileName, fallback) => {
  const primary = path.join(writableDirs[0], fileName);
  if (!fs.existsSync(primary)) return structuredClone(fallback);
  return JSON.parse(fs.readFileSync(primary, 'utf8'));
};

const writeJson = (fileName, value) => {
  const content = `${JSON.stringify(value, null, 2)}\n`;
  for (const dir of writableDirs) {
    fs.writeFileSync(path.join(dir, fileName), content, 'utf8');
  }
};

const defaults = {
  agents: [],
  tasks: [],
  feed: [],
  chat: [],
};

const agents = readJson('agents.json', defaults.agents);
const tasks = readJson('tasks.json', defaults.tasks);
const feed = readJson('feed.json', defaults.feed);
const chat = readJson('chat.json', defaults.chat);

const now = new Date().toISOString();

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `item-${Date.now()}`;

const pickColor = (value) => {
  const palette = ['#10b981', '#38bdf8', '#a78bfa', '#f59e0b', '#fb7185', '#22c55e', '#60a5fa', '#f97316'];
  let sum = 0;
  for (const char of value) sum += char.charCodeAt(0);
  return palette[sum % palette.length];
};

const ensureAgent = (name) => {
  const found = agents.find((agent) => agent.name.toLowerCase() === name.toLowerCase());
  if (found) return found;
  const created = {
    id: slugify(name),
    name,
    role: 'Unassigned Agent',
    status: 'idle',
    color: pickColor(name),
    currentTask: 'Awaiting assignment',
  };
  agents.push(created);
  return created;
};

const normalizePriority = (value) => {
  const normalized = value.toLowerCase();
  if (normalized === 'high' || normalized === 'medium' || normalized === 'low') return normalized;
  throw new Error('Priority must be one of: high, medium, low');
};

const normalizeStatus = (value) => {
  const normalized = value.toLowerCase();
  const map = {
    assigned: 'assigned',
    'in-progress': 'in-progress',
    'in progress': 'in-progress',
    progress: 'in-progress',
    review: 'review',
    done: 'done',
    complete: 'done',
    completed: 'done',
  };
  if (!map[normalized]) throw new Error('Task status must be Assigned, In Progress, Review, or Done');
  return map[normalized];
};

const inferChatType = (message) => {
  const lower = message.toLowerCase();
  if (lower.includes('alert') || lower.includes('blocked') || lower.includes('urgent')) return 'alert';
  if (lower.includes('done') || lower.includes('review') || lower.includes('task')) return 'task';
  return 'update';
};

switch (command) {
  case 'chat': {
    const [agentName, message] = args;
    if (!agentName || !message) throw new Error('Usage: ./update-hq.sh chat "agent" "message"');
    ensureAgent(agentName);
    chat.push({
      id: `chat-${Date.now()}`,
      agent: agentName,
      message,
      type: inferChatType(message),
      timestamp: now,
    });
    writeJson('chat.json', chat);
    break;
  }
  case 'feed': {
    const [agentName, message, priority] = args;
    if (!agentName || !message || !priority) throw new Error('Usage: ./update-hq.sh feed "agent" "message" "priority"');
    ensureAgent(agentName);
    feed.unshift({
      id: `feed-${Date.now()}`,
      agent: agentName,
      message,
      priority: normalizePriority(priority),
      timestamp: now,
    });
    writeJson('feed.json', feed.slice(0, 200));
    break;
  }
  case 'status': {
    const [agentName, status] = args;
    if (!agentName || !status) throw new Error('Usage: ./update-hq.sh status "agent" "working|idle|review|blocked|offline"');
    const agent = ensureAgent(agentName);
    agent.status = status.toLowerCase();
    writeJson('agents.json', agents);
    break;
  }
  case 'task': {
    const [agentName, title, statusInput] = args;
    if (!agentName || !title || !statusInput) throw new Error('Usage: ./update-hq.sh task "agent" "title" "status"');
    const status = normalizeStatus(statusInput);
    const agent = ensureAgent(agentName);
    agent.currentTask = title;
    const existing = tasks.find((task) => task.assignee.toLowerCase() === agentName.toLowerCase() && task.title.toLowerCase() === title.toLowerCase());
    if (existing) {
      existing.status = status;
      existing.timestamps.updatedAt = now;
      if (status === 'in-progress' && !existing.timestamps.startedAt) existing.timestamps.startedAt = now;
      if (status === 'done') existing.timestamps.completedAt = now;
    } else {
      tasks.unshift({
        id: `task-${Date.now()}`,
        title,
        description: title,
        status,
        assignee: agentName,
        priority: 'medium',
        timestamps: {
          createdAt: now,
          updatedAt: now,
          ...(status === 'in-progress' ? { startedAt: now } : {}),
          ...(status === 'done' ? { completedAt: now } : {}),
        },
      });
    }
    writeJson('agents.json', agents);
    writeJson('tasks.json', tasks);
    break;
  }
  default:
    throw new Error(`Unknown command: ${command}`);
}

console.log(`Updated HQ data via ${command}.`);
