import { Send, Clock, Users, PartyPopper } from 'lucide-react';
import FadeIn from '../animations/FadeIn';
import StatCard from '../dashboard/StatCard';
import LoadingSkeleton from '../ui/LoadingSkeleton';

const buildStats = (stats) => {
  const total = stats?.total ?? 0;

  const activeStatuses = ['Applied', 'OA_Received', 'Interview_Scheduled', 'Next_Round'];
  const interviewStatuses = ['Interview_Scheduled', 'Next_Round'];

  const getCount = (statusList) =>
    (stats?.byStatus ?? [])
      .filter((s) => statusList.includes(s._id))
      .reduce((sum, s) => sum + s.count, 0);

  const inProgress = getCount(activeStatuses);
  const interviews = getCount(interviewStatuses);
  const offers = (stats?.byStatus ?? []).find((s) => s._id === 'Offer')?.count ?? 0;

  return [
    { title: 'Total Applied',  value: total,       icon: Send,        iconColor: 'violet'  },
    { title: 'In Progress',    value: inProgress,  icon: Clock,       iconColor: 'cyan'    },
    { title: 'Interviews',     value: interviews,  icon: Users,       iconColor: 'yellow'  },
    { title: 'Offers',         value: offers,      icon: PartyPopper, iconColor: 'emerald' },
  ];
};

const JobStatsGrid = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <LoadingSkeleton.StatCard key={i} />
        ))}
      </div>
    );
  }

  const statItems = buildStats(stats);

  return (
    <FadeIn stagger={0.08} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat) => (
        <FadeIn.Item key={stat.title}>
          <StatCard {...stat} />
        </FadeIn.Item>
      ))}
    </FadeIn>
  );
};

export default JobStatsGrid;
