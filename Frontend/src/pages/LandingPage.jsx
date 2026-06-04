import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GitBranch, Code2, Trophy, BookOpen, BarChart3, Target, Zap, ArrowRight } from 'lucide-react';
import PageTransition from '../components/animations/PageTransition';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Unified Dashboard',
    description: 'All your coding platforms in one beautiful dashboard. GitHub, LeetCode, Codeforces, and GFG — unified.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/15',
  },
  {
    icon: Zap,
    title: 'Auto Sync',
    description: 'Stats sync automatically every 6 hours. Wake up to fresh data and see your overnight progress.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/15',
  },
  {
    icon: Target,
    title: 'Goal Tracking',
    description: 'Set targets, track progress, stay motivated. Visualize your path from beginner to expert.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
  },
];

const PLATFORMS = [
  { icon: GitBranch, label: 'GitHub', color: 'text-gray-300', bg: 'bg-gray-500/15' },
  { icon: Code2, label: 'LeetCode', color: 'text-yellow-400', bg: 'bg-yellow-500/15' },
  { icon: Trophy, label: 'Codeforces', color: 'text-blue-400', bg: 'bg-blue-500/15' },
  { icon: BookOpen, label: 'GeeksForGeeks', color: 'text-green-400', bg: 'bg-green-500/15' },
];

const HERO_STATS = [
  { value: '4', label: 'Platforms Supported' },
  { value: '6h', label: 'Auto Sync Interval' },
  { value: '∞', label: 'History Tracked' },
];

function Section({ children, className = '' }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export default function LandingPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        {/* Fixed Nav */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5">
          <span className="text-xl font-bold bg-linear-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            Alvora
          </span>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 overflow-hidden">
          {/* Background blobs */}
          <motion.div
            animate={{ scale: [1, 1.12, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ repeat: Infinity, duration: 7 }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.18, 0.1] }}
            transition={{ repeat: Infinity, duration: 9, delay: 3 }}
            className="absolute top-1/3 right-1/4 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"
          />
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.08, 0.14, 0.08] }}
            transition={{ repeat: Infinity, duration: 11, delay: 5 }}
            className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-violet-400/10 rounded-full blur-3xl pointer-events-none"
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-500/30 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6"
            >
              <Zap size={12} />
              Open Source Progress Tracker
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
            >
              Track Every Line.{' '}
              <span className="bg-linear-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Grow Every Day.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="text-gray-400 text-lg max-w-xl mx-auto mb-10"
            >
              One dashboard for all your coding platforms. Visualize your journey, track streaks, and hit your goals.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
            >
              <Link to="/signup">
                <Button size="lg" className="min-w-44">
                  Start Tracking Free
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg" className="min-w-44">
                  Sign In
                </Button>
              </Link>
            </motion.div>

            {/* Hero stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex items-center justify-center gap-8 md:gap-16"
            >
              {HERO_STATS.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-3xl font-bold bg-linear-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                    {value}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Platform logos strip */}
        <Section className="py-16 px-6 border-y border-white/5">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-sm text-gray-500 mb-8 uppercase tracking-widest">Connects with</p>
            <div className="flex items-center justify-center gap-6 md:gap-10 flex-wrap">
              {PLATFORMS.map(({ icon: Icon, label, color, bg }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className={`p-2.5 rounded-xl ${bg}`}>
                    <Icon size={20} className={color} />
                  </div>
                  <span className="text-gray-300 font-medium text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Features */}
        <Section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Everything you need to{' '}
                <span className="bg-linear-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  level up
                </span>
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                Built for developers who want data-driven insights about their growth.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FEATURES.map(({ icon: Icon, title, description, color, bg }) => (
                <Card key={title} hover gradient className="p-6">
                  <div className={`p-3 rounded-xl ${bg} w-fit mb-4`}>
                    <Icon size={22} className={color} />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
                </Card>
              ))}
            </div>
          </div>
        </Section>

        {/* Fake dashboard preview */}
        <Section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-3">Your stats, beautifully visualized</h2>
              <p className="text-gray-400">See exactly how far you&apos;ve come</p>
            </div>

            {/* Mock dashboard preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-[#0a0a0f] z-10 pointer-events-none rounded-2xl" />
              <div className="absolute -inset-4 bg-violet-500/10 rounded-3xl blur-2xl" />
              <div className="relative backdrop-blur-md bg-white/3 border border-white/10 rounded-2xl p-6 overflow-hidden">
                {/* Mini stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Problems Solved', value: '561', color: 'text-violet-400' },
                    { label: 'Best Streak', value: '22d', color: 'text-orange-400' },
                    { label: 'CF Rating', value: '1456', color: 'text-blue-400' },
                    { label: 'GitHub Stars', value: '127', color: 'text-cyan-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white/5 border border-white/8 rounded-xl p-3">
                      <div className={`text-2xl font-bold ${color}`}>{value}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>
                {/* Mini chart placeholder */}
                <div className="bg-white/3 border border-white/8 rounded-xl p-4 flex items-end gap-1 h-20">
                  {[30, 50, 40, 70, 55, 80, 65, 90, 75, 85, 70, 95].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm"
                      style={{
                        height: `${h}%`,
                        background: `rgba(139,92,246,${0.3 + (h / 100) * 0.5})`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* CTA */}
        <Section className="py-24 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="relative">
              <div className="absolute -inset-8 bg-violet-500/10 rounded-3xl blur-2xl" />
              <Card className="relative p-10 border-violet-500/20">
                <h2 className="text-3xl font-bold text-white mb-3">Ready to level up?</h2>
                <p className="text-gray-400 mb-8">
                  Join developers who track their coding journey and grow faster.
                </p>
                <Link to="/signup">
                  <Button size="lg">
                    Create Free Account
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 text-center text-sm text-gray-600">
          <span className="bg-linear-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent font-semibold">
            Alvora
          </span>
          {' '}© {new Date().getFullYear()} — Open source developer analytics
        </footer>
      </div>
    </PageTransition>
  );
}
