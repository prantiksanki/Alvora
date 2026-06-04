const base = 'animate-pulse bg-white/8 rounded-lg';

const LoadingSkeleton = ({ className = '', height = 'h-4', width = 'w-full' }) => (
  <div className={`${base} ${height} ${width} ${className}`} />
);

LoadingSkeleton.Card = ({ className = '' }) => (
  <div className={`backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 ${className}`}>
    <div className="flex items-start justify-between mb-4">
      <div className={`${base} h-8 w-24 rounded-lg`} />
      <div className={`${base} h-10 w-10 rounded-xl`} />
    </div>
    <div className={`${base} h-6 w-32 mb-2`} />
    <div className={`${base} h-3 w-20`} />
  </div>
);

LoadingSkeleton.StatCard = ({ className = '' }) => (
  <div className={`backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 ${className}`}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className={`${base} h-3 w-20 mb-3`} />
        <div className={`${base} h-8 w-28 mb-2`} />
        <div className={`${base} h-3 w-16`} />
      </div>
      <div className={`${base} h-12 w-12 rounded-xl`} />
    </div>
  </div>
);

LoadingSkeleton.Text = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={`${base} h-3`}
        style={{ width: `${100 - i * 10}%` }}
      />
    ))}
  </div>
);

export default LoadingSkeleton;
