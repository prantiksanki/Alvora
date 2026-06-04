const STATUS_CONFIG = {
  Applied: {
    label: 'Applied',
    classes: 'bg-blue-400/15 text-blue-400 border-blue-400/20',
    dot: 'bg-blue-400',
  },
  OA_Received: {
    label: 'OA',
    classes: 'bg-amber-400/15 text-amber-400 border-amber-400/20',
    dot: 'bg-amber-400',
  },
  Interview_Scheduled: {
    label: 'Interview',
    classes: 'bg-violet-400/15 text-violet-400 border-violet-400/20',
    dot: 'bg-violet-400',
  },
  Next_Round: {
    label: 'Next Round',
    classes: 'bg-cyan-400/15 text-cyan-400 border-cyan-400/20',
    dot: 'bg-cyan-400',
  },
  Offer: {
    label: 'Offer',
    classes: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/20',
    dot: 'bg-emerald-400',
  },
  Rejected: {
    label: 'Rejected',
    classes: 'bg-red-400/15 text-red-400 border-red-400/20',
    dot: 'bg-red-400',
  },
  Withdrawn: {
    label: 'Withdrawn',
    classes: 'bg-gray-400/15 text-gray-400 border-gray-400/20',
    dot: 'bg-gray-400',
  },
  Ghosted: {
    label: 'Ghosted',
    classes: 'bg-zinc-400/15 text-zinc-400 border-zinc-400/20',
    dot: 'bg-zinc-400',
  },
  Waitlist: {
    label: 'Waitlist',
    classes: 'bg-fuchsia-400/15 text-fuchsia-400 border-fuchsia-400/20',
    dot: 'bg-fuchsia-400',
  },
  Recruiter_Outreach: {
    label: 'Outreach',
    classes: 'bg-teal-400/15 text-teal-400 border-teal-400/20',
    dot: 'bg-teal-400',
  },
};

const StatusBadge = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    classes: 'bg-gray-400/15 text-gray-400 border-gray-400/20',
    dot: 'bg-gray-400',
  };

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-[10px] gap-1'
    : 'px-2.5 py-1 text-xs gap-1.5';

  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border shrink-0 ${sizeClasses} ${config.classes}`}
    >
      <span className={`rounded-full shrink-0 ${dotSize} ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
