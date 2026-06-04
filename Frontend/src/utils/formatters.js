export function formatNumber(n) {
  if (!n && n !== 0) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

export function formatShortDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatLongDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatRelativeTime(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export const PLATFORM_COLORS = {
  github: {
    text: 'text-gray-300',
    bg: 'bg-gray-500/15',
    border: 'border-gray-500/20',
    accent: '#9ca3af',
  },
  leetcode: {
    text: 'text-yellow-400',
    bg: 'bg-yellow-500/15',
    border: 'border-yellow-500/20',
    accent: '#eab308',
  },
  codeforces: {
    text: 'text-blue-400',
    bg: 'bg-blue-500/15',
    border: 'border-blue-500/20',
    accent: '#3b82f6',
  },
  gfg: {
    text: 'text-green-400',
    bg: 'bg-green-500/15',
    border: 'border-green-500/20',
    accent: '#22c55e',
  },
};

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
