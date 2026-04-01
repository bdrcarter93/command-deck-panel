import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, Columns3, ScrollText, MessageSquare, Video, Cpu, Shield } from 'lucide-react';
import Header from '@/components/Header';
import CommandDeck from '@/components/CommandDeck';
import AgentProfiles from '@/components/AgentProfiles';
import TaskBoard from '@/components/TaskBoard';
import AILog from '@/components/AILog';
import Council from '@/components/Council';
import MeetingIntelligence from '@/components/MeetingIntelligence';
import SessionDetails from '@/components/SessionDetails';
import SystemStatus from '@/components/SystemStatus';

const tabs = [
  { id: 'deck', label: 'Command Deck', icon: LayoutDashboard },
  { id: 'agents', label: 'Agents', icon: Users },
  { id: 'tasks', label: 'Task Board', icon: Columns3 },
  { id: 'sessions', label: 'Sessions', icon: Cpu },
  { id: 'system', label: 'System', icon: Shield },
  { id: 'log', label: 'AI Log', icon: ScrollText },
  { id: 'council', label: 'Council', icon: MessageSquare },
  { id: 'meetings', label: 'Meetings', icon: Video },
];

const tabContent: Record<string, React.ReactNode> = {
  deck: <CommandDeck />,
  agents: <AgentProfiles />,
  tasks: <TaskBoard />,
  sessions: <SessionDetails />,
  system: <SystemStatus />,
  log: <AILog />,
  council: <Council />,
  meetings: <MeetingIntelligence />,
};

const Index = () => {
  const [activeTab, setActiveTab] = useState('deck');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-4">
        <Header />

        <div className="glass-card p-1.5 flex gap-1 overflow-x-auto">
          {tabs.map((tab, i) => (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
              }`}
            >
              <tab.icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {tabContent[activeTab]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Index;
