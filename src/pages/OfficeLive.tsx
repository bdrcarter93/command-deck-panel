import { Link } from 'react-router-dom';
import { ArrowLeft, MonitorCog } from 'lucide-react';
import AgentDeskMap from '@/components/AgentDeskMap';
import { useAgentHQData } from '@/hooks/useAgentHQData';

const OfficeLive = () => {
  const { data } = useAgentHQData();

  return (
    <div className="mission-shell min-h-screen text-white">
      <div className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mission-panel mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[28px] p-5">
          <div>
            <div className="mission-label flex items-center gap-2 text-[11px]">
              <MonitorCog className="h-4 w-4 text-[#75b7ff]" />
              Live agent floor
            </div>
            <h1 className="mission-heading mt-2 text-3xl font-semibold">MISSION CONTROL LIVE</h1>
            <p className="mission-subtext mt-2 text-sm">Full-screen desk layout in the same mission-control lane as your reference. We can layer in richer live-agent imagery next.</p>
          </div>
          <Link to="/" className="mission-button inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-[#f6bf8f] transition">
            <ArrowLeft className="h-4 w-4 text-[#75b7ff]" />
            Back to dashboard
          </Link>
        </div>

        <AgentDeskMap agents={data?.agents ?? []} tasks={data?.tasks ?? []} feed={data?.feed ?? []} />
      </div>
    </div>
  );
};

export default OfficeLive;
