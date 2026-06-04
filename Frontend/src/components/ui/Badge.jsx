const VARIANTS = {
  easy: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  medium: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
  hard: 'bg-red-500/15 text-red-400 border border-red-500/20',
  active: 'bg-violet-500/15 text-violet-400 border border-violet-500/20',
  inactive: 'bg-gray-500/15 text-gray-400 border border-gray-500/20',
  github: 'bg-gray-500/15 text-gray-300 border border-gray-500/20',
  leetcode: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
  codeforces: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  gfg: 'bg-green-500/15 text-green-400 border border-green-500/20',
  codechef: 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
  atcoder: 'bg-sky-500/15 text-sky-300 border border-sky-500/20',
  greenhouse: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  lever: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20',
};

const Badge = ({ variant = 'active', children, className = '' }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${VARIANTS[variant] || VARIANTS.active} ${className}`}
  >
    {children}
  </span>
);

export default Badge;
