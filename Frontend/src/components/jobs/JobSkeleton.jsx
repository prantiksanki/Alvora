const base = 'animate-pulse bg-white/8 rounded-lg';

const JobSkeleton = ({ className = '' }) => (
  <div className={`backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-5 ${className}`}>
    {/* Top row: logo + badge */}
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className={`${base} w-10 h-10 rounded-xl shrink-0`} />
        <div>
          <div className={`${base} h-3.5 w-28 mb-2`} />
          <div className={`${base} h-2.5 w-16`} />
        </div>
      </div>
      <div className={`${base} h-5 w-14 rounded-full`} />
    </div>
    {/* Title */}
    <div className={`${base} h-5 w-3/4 mb-3`} />
    {/* Tags row */}
    <div className="flex gap-2 mb-4">
      <div className={`${base} h-5 w-16 rounded-full`} />
      <div className={`${base} h-5 w-20 rounded-full`} />
      <div className={`${base} h-5 w-14 rounded-full`} />
    </div>
    {/* Description lines */}
    <div className={`${base} h-3 w-full mb-1.5`} />
    <div className={`${base} h-3 w-5/6 mb-4`} />
    {/* Bottom: time + button */}
    <div className="flex items-center justify-between">
      <div className={`${base} h-3 w-20`} />
      <div className={`${base} h-9 w-24 rounded-xl`} />
    </div>
  </div>
);

export default JobSkeleton;
