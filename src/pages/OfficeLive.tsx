import { motion } from 'framer-motion';
import { useDashboardData } from '@/hooks/useDashboardData';
import { OfficeLiveFullscreen } from './Index';

const OfficeLive = () => {
  const { data, isLoading, error } = useDashboardData();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_24%),radial-gradient(circle_at_85%_18%,_rgba(167,139,250,0.16),_transparent_18%),linear-gradient(180deg,#020617_0%,#030712_42%,#020617_100%)] text-white">
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <OfficeLiveFullscreen data={data} isLoading={isLoading} error={error} />
        </motion.div>
      </div>
    </div>
  );
};

export default OfficeLive;
