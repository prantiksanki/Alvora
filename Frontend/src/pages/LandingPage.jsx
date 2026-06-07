import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Target, Zap, ArrowRight } from 'lucide-react';
import PageTransition from '../components/animations/PageTransition';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { PrismaHero } from '../components/ui/prisma-hero';
import { Marquee } from '../components/ui/marquee';
import { SmokeBackground } from '../components/ui/spooky-smoke-animation';

/* ─── Platform logos ─────────────────────────────────────────────────────── */

const GitHubLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const LeetCodeLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/>
  </svg>
);

const CodeforcesLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M4.5 7.5A1.5 1.5 0 0 1 6 9v10.5A1.5 1.5 0 0 1 4.5 21h-3A1.5 1.5 0 0 1 0 19.5V9a1.5 1.5 0 0 1 1.5-1.5h3zm9-4.5A1.5 1.5 0 0 1 15 4.5v15a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 19.5v-15A1.5 1.5 0 0 1 10.5 3h3zm9 7.5A1.5 1.5 0 0 1 24 16.5v3A1.5 1.5 0 0 1 22.5 21h-3a1.5 1.5 0 0 1-1.5-1.5v-3a1.5 1.5 0 0 1 1.5-1.5h3z"/>
  </svg>
);

const GFGLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M21.45 14.315c-.143.28-.334.532-.565.745a3.691 3.691 0 0 1-1.104.695 4.51 4.51 0 0 1-1.706.268 4.44 4.44 0 0 1-1.56-.268 3.791 3.791 0 0 1-1.186-.735 3.31 3.31 0 0 1-.775-1.11 3.674 3.674 0 0 1-.268-1.43v-.457h7.22v-.763a5.878 5.878 0 0 0-.4-2.19 5.094 5.094 0 0 0-1.145-1.73 5.16 5.16 0 0 0-1.79-1.128 6.346 6.346 0 0 0-2.35-.403 6.181 6.181 0 0 0-2.403.457 5.847 5.847 0 0 0-1.91 1.26 5.602 5.602 0 0 0-1.24 1.9 6.25 6.25 0 0 0-.44 2.35v.688a6.035 6.035 0 0 0 .44 2.335 5.426 5.426 0 0 0 1.252 1.857 5.787 5.787 0 0 0 1.91 1.226 6.414 6.414 0 0 0 2.471.44 7.044 7.044 0 0 0 1.98-.268 5.917 5.917 0 0 0 1.64-.762 4.741 4.741 0 0 0 1.186-1.2 4.16 4.16 0 0 0 .63-1.565zm-10.99-3.218a3.2 3.2 0 0 1 .252-1.015 2.912 2.912 0 0 1 .627-.882 3.14 3.14 0 0 1 .976-.62 3.44 3.44 0 0 1 1.29-.228 3.336 3.336 0 0 1 1.264.228 2.9 2.9 0 0 1 .95.62 2.76 2.76 0 0 1 .6.882 3.02 3.02 0 0 1 .224 1.015zM2.55 14.315a4.16 4.16 0 0 0 .63 1.565 4.74 4.74 0 0 0 1.186 1.2 5.916 5.916 0 0 0 1.64.762 7.044 7.044 0 0 0 1.98.268 6.414 6.414 0 0 0 2.47-.44 5.787 5.787 0 0 0 1.91-1.226 5.426 5.426 0 0 0 1.252-1.857 6.035 6.035 0 0 0 .44-2.335v-.688a6.25 6.25 0 0 0-.44-2.35 5.602 5.602 0 0 0-1.24-1.9 5.847 5.847 0 0 0-1.91-1.26A6.181 6.181 0 0 0 8.065 5.6a6.346 6.346 0 0 0-2.35.403 5.16 5.16 0 0 0-1.79 1.128 5.094 5.094 0 0 0-1.145 1.73 5.878 5.878 0 0 0-.4 2.19v.763h7.22v.457a3.674 3.674 0 0 1-.268 1.43 3.31 3.31 0 0 1-.775 1.11 3.791 3.791 0 0 1-1.186.735 4.44 4.44 0 0 1-1.56.268 4.51 4.51 0 0 1-1.706-.268 3.691 3.691 0 0 1-1.104-.695 3.35 3.35 0 0 1-.565-.745zm3.77-3.218h-3.55a3.02 3.02 0 0 1 .224-1.015 2.76 2.76 0 0 1 .6-.882 2.9 2.9 0 0 1 .95-.62 3.336 3.336 0 0 1 1.264-.228 3.44 3.44 0 0 1 1.29.228 3.14 3.14 0 0 1 .976.62 2.912 2.912 0 0 1 .627.882 3.2 3.2 0 0 1 .252 1.015z"/>
  </svg>
);

const CodeChefLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M11.257.004a12.016 12.016 0 0 0-1.73.198C5.677 1.082 2.2 4.393 1.155 8.24c-.207.768-.27 1.265-.27 2.224 0 1.196.107 1.904.457 2.988.337 1.043.72 1.81 1.338 2.669l.286.392-.376.457c-.51.626-.96 1.491-1.229 2.362-.178.576-.213.843-.213 1.6 0 .78.034 1.012.234 1.625.596 1.826 2.033 3.12 3.92 3.543.496.11.609.117 1.613.106.974-.01 1.134-.025 1.597-.15 1.087-.293 2.017-.886 2.695-1.717l.304-.372.32.376c.68.798 1.594 1.376 2.648 1.688.454.135.613.15 1.598.15 1.01 0 1.13-.01 1.623-.107 1.903-.424 3.33-1.714 3.93-3.543.196-.613.233-.847.233-1.625 0-.757-.035-1.024-.213-1.6-.272-.877-.713-1.734-1.23-2.362l-.374-.457.285-.392c.618-.858 1.001-1.626 1.338-2.67.35-1.083.457-1.791.457-2.987 0-.96-.063-1.456-.27-2.224C21.735 4.42 18.292 1.12 14.435.208A9.785 9.785 0 0 0 11.257.004zm.725 1.459c.7.038 1.054.09 1.69.248 2.862.718 5.207 2.825 6.24 5.598.41 1.103.534 1.77.534 2.91 0 1.17-.13 1.88-.519 2.966-.301.837-.7 1.563-1.228 2.2l-.244.295.2.35c.592 1.038 1.04 2.35 1.04 3.065 0 1.688-1.036 3.083-2.634 3.553-.394.116-.497.127-1.346.127-.875 0-.944-.01-1.37-.135-.845-.248-1.554-.77-2.03-1.49l-.264-.398-.266.398c-.476.72-1.183 1.242-2.028 1.49-.427.126-.497.135-1.371.135-.85 0-.952-.01-1.347-.127-1.598-.47-2.633-1.865-2.633-3.553 0-.72.453-2.031 1.046-3.065l.198-.35-.244-.295a8.072 8.072 0 0 1-1.228-2.2c-.386-1.087-.518-1.797-.518-2.967 0-1.139.124-1.806.533-2.91 1.033-2.772 3.378-4.878 6.24-5.597.64-.16 1.085-.217 1.94-.243a15.46 15.46 0 0 1 .568.004zm-1.128 2.162a7.562 7.562 0 0 0-5.98 5.026c-.25.755-.34 1.375-.305 2.12.056 1.178.433 2.18 1.146 3.027l.234.278-.18.34c-.527 1.006-.868 2.107-.868 2.78 0 .954.574 1.768 1.49 2.11.385.144.456.154 1.108.154.68 0 .714-.007 1.017-.135.471-.196.893-.582 1.145-1.055l.173-.323.184.3c.375.614.877 1.003 1.495 1.153.255.062.438.075.921.062.576-.015.624-.025.939-.16.78-.334 1.257-1.035 1.257-1.857 0-.547-.272-1.4-.733-2.29l-.278-.53.287-.333c.74-.857 1.103-1.857 1.103-3.015 0-.6-.063-1.038-.24-1.62a7.565 7.565 0 0 0-5.915-5.032 7.734 7.734 0 0 0-1.0-.001z"/>
  </svg>
);

const AtCoderLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.4c5.302 0 9.6 4.298 9.6 9.6s-4.298 9.6-9.6 9.6S2.4 17.302 2.4 12 6.698 2.4 12 2.4zm-3.6 4.8v9.6h2.4V7.2H8.4zm6 0v9.6h-2.4V7.2h2.4z"/>
  </svg>
);

const PLATFORMS = [
  { Logo: GitHubLogo,     label: 'GitHub',       color: '#e6edf3', bg: 'bg-gray-500/15' },
  { Logo: LeetCodeLogo,   label: 'LeetCode',      color: '#ffa116', bg: 'bg-yellow-500/15' },
  { Logo: CodeforcesLogo, label: 'Codeforces',    color: '#3b82f6', bg: 'bg-blue-500/15' },
  { Logo: GFGLogo,        label: 'GeeksForGeeks', color: '#2f8d46', bg: 'bg-green-500/15' },
  { Logo: CodeChefLogo,   label: 'CodeChef',      color: '#f97316', bg: 'bg-orange-500/15' },
  { Logo: AtCoderLogo,    label: 'AtCoder',       color: '#a78bfa', bg: 'bg-purple-500/15' },
];

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


/* ─── Local atmospheric accent used between sections ─────────────────────── */
function GlowOrb({ side = 'left', intensity = 1, className = '' }) {
  const isLeft = side === 'left';
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute ${className}`}
      style={{
        width: '600px', height: '300px',
        [isLeft ? 'left' : 'right']: '-100px',
        background: `radial-gradient(ellipse at ${isLeft ? '30%' : '70%'} 50%, rgba(210,140,55,${(0.12 * intensity).toFixed(2)}) 0%, rgba(195,125,45,${(0.05 * intensity).toFixed(2)}) 40%, transparent 70%)`,
        filter: 'blur(50px)',
        animation: `float-mid ${12 + intensity * 3}s ease-in-out infinite`,
        animationDelay: isLeft ? '0s' : '-4s',
      }}
    />
  );
}

/* ─── Scroll-reveal section wrapper ─────────────────────────────────────── */
function Section({ children, className = '' }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ─── Landing page ───────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <PageTransition>
      {/* Persistent volumetric atmosphere */}
      {/* WebGL smoke atmosphere — fixed, full viewport, behind all content */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <SmokeBackground smokeColor="#c9a96e" />
      </div>

      <div
        className="min-h-screen text-[#E1E0CC] relative"
        style={{ zIndex: 2 }}
      >
        {/* Hero */}
        <PrismaHero />

        {/* ── Platform logos marquee ─────────────────────────────────── */}
        <section
          className="py-16 px-6 relative overflow-hidden"
          style={{
            borderTop: '1px solid rgba(201,185,154,0.08)',
            borderBottom: '1px solid rgba(201,185,154,0.08)',
            background: 'linear-gradient(to bottom, rgba(210,140,55,0.05) 0%, transparent 50%, rgba(210,140,55,0.05) 100%)',
          }}
        >
          <GlowOrb side="left" intensity={0.8} className="top-1/2 -translate-y-1/2" />
          <GlowOrb side="right" intensity={0.6} className="top-1/2 -translate-y-1/2" />

          <div className="max-w-4xl mx-auto relative">
            <p
              className="text-center text-xs mb-6 uppercase tracking-[0.25em]"
              style={{ color: 'rgba(201,185,154,0.40)' }}
            >
              Connects with
            </p>
          </div>

          <Marquee speed={40} pauseOnHover>
            {PLATFORMS.map(({ Logo, label, color, bg }) => (
              <div key={label} className="flex items-center gap-2.5 mx-10">
                <div
                  className={`p-2.5 rounded-xl ${bg}`}
                  style={{
                    color,
                    boxShadow: '0 0 12px rgba(201,185,154,0.06)',
                    border: '1px solid rgba(201,185,154,0.10)',
                  }}
                >
                  <Logo />
                </div>
                <span className="font-medium text-sm" style={{ color: 'rgba(201,185,154,0.65)' }}>
                  {label}
                </span>
              </div>
            ))}
          </Marquee>
        </section>

        {/* ── Features ──────────────────────────────────────────────── */}
        <Section className="py-28 px-6 relative overflow-hidden">
          <div className="fog-divider top-0" />
          <GlowOrb side="right" intensity={1.0} className="top-24" />

          <div className="max-w-5xl mx-auto relative">
            <div className="text-center mb-16">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-xs uppercase tracking-[0.25em] mb-4"
                style={{ color: 'rgba(201,185,154,0.45)' }}
              >
                Platform
              </motion.p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#E1E0CC] mb-4">
                Everything you need to{' '}
                <span style={{ color: '#c9b99a', textShadow: '0 0 30px rgba(201,185,154,0.3)' }}>
                  level up
                </span>
              </h2>
              <p className="max-w-xl mx-auto" style={{ color: '#9c9a8e' }}>
                Built for developers who want data-driven insights about their growth.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FEATURES.map(({ icon: Icon, title, description, color, bg }, index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: index * 0.10 }}
                  className="h-full"
                >
                  <Card hover gradient className="p-6 h-full">
                    <div
                      className={`p-3 rounded-xl ${bg} w-fit mb-5`}
                      style={{
                        boxShadow: '0 0 20px rgba(201,185,154,0.08)',
                        border: '1px solid rgba(201,185,154,0.12)',
                      }}
                    >
                      <Icon size={22} className={color} />
                    </div>
                    <h3 className="font-semibold mb-2" style={{ color: '#E1E0CC' }}>{title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: '#9c9a8e' }}>{description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Dashboard preview ─────────────────────────────────────── */}
        <Section className="py-20 px-6 relative overflow-hidden">
          <div className="fog-divider top-0" />
          <GlowOrb side="left" intensity={1.2} className="top-20" />

          <div className="max-w-4xl mx-auto relative">
            <div className="text-center mb-12">
              <h2
                className="text-3xl font-bold mb-3"
                style={{ color: '#E1E0CC', textShadow: '0 0 40px rgba(201,185,154,0.15)' }}
              >
                Your stats, beautifully visualized
              </h2>
              <p style={{ color: '#9c9a8e' }}>See exactly how far you&apos;ve come</p>
            </div>

            <div className="relative">
              {/* Ambient glow behind the panel */}
              <div
                className="absolute -inset-6 rounded-3xl"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(210,140,55,0.12) 0%, rgba(195,125,45,0.06) 50%, transparent 70%)',
                  filter: 'blur(30px)',
                  animation: 'cloud-pulse 7s ease-in-out infinite',
                }}
              />

              {/* Bottom content-fade */}
              <div
                className="absolute inset-x-0 bottom-0 h-32 rounded-b-2xl pointer-events-none z-10"
                style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(13,11,8,0.85) 100%)' }}
              />

              {/* Mock dashboard panel */}
              <div
                className="relative backdrop-blur-xl rounded-2xl p-6 overflow-hidden"
                style={{
                  background: 'rgba(225,224,204,0.04)',
                  border: '1px solid rgba(201,185,154,0.15)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,185,154,0.08)',
                }}
              >
                {/* Edge lighting */}
                <div
                  className="absolute inset-0 pointer-events-none rounded-2xl"
                  style={{ background: 'linear-gradient(135deg, rgba(201,185,154,0.08) 0%, transparent 50%)' }}
                />

                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 relative z-10">
                  {[
                    { label: 'Problems Solved', value: '561' },
                    { label: 'Best Streak', value: '22d' },
                    { label: 'CF Rating', value: '1456' },
                    { label: 'GitHub Stars', value: '127' },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="rounded-xl p-3"
                      style={{
                        background: 'rgba(201,185,154,0.05)',
                        border: '1px solid rgba(201,185,154,0.12)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      }}
                    >
                      <div
                        className="text-2xl font-bold"
                        style={{ color: '#c9b99a', textShadow: '0 0 20px rgba(201,185,154,0.25)' }}
                      >
                        {value}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: '#6b6960' }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Bar chart */}
                <div
                  className="rounded-xl p-4 flex items-end gap-1 h-20 relative z-10"
                  style={{
                    background: 'rgba(201,185,154,0.03)',
                    border: '1px solid rgba(201,185,154,0.08)',
                  }}
                >
                  {[30, 50, 40, 70, 55, 80, 65, 90, 75, 85, 70, 95].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm"
                      style={{
                        height: `${h}%`,
                        background: `linear-gradient(to top, rgba(201,185,154,${0.25 + (h / 100) * 0.5}), rgba(210,185,140,${0.5 + (h / 100) * 0.3}))`,
                        boxShadow: h > 75 ? '0 0 8px rgba(201,185,154,0.20)' : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ── CTA ───────────────────────────────────────────────────── */}
        <Section className="py-28 px-6 relative overflow-hidden">
          <div className="fog-divider top-0" />

          {/* Central cloud-pulse glow for the page climax */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 70% 80% at 50% 50%, rgba(210,140,55,0.09) 0%, rgba(195,125,45,0.04) 55%, transparent 70%)',
              filter: 'blur(20px)',
              animation: 'cloud-pulse 6s ease-in-out infinite',
            }}
          />

          <div className="max-w-2xl mx-auto text-center relative">
            {/* Outer glow behind card */}
            <div
              className="absolute -inset-10 rounded-3xl pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(210,140,55,0.14) 0%, rgba(195,125,45,0.06) 50%, transparent 65%)',
                filter: 'blur(40px)',
              }}
            />

            <Card
              className="relative p-10"
              style={{ borderColor: 'rgba(201,185,154,0.22)' }}
            >
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="text-xs uppercase tracking-[0.25em] mb-6"
                style={{ color: 'rgba(201,185,154,0.45)' }}
              >
                Get started
              </motion.p>
              <h2
                className="text-3xl font-bold mb-3"
                style={{ color: '#E1E0CC', textShadow: '0 0 40px rgba(201,185,154,0.20)' }}
              >
                Ready to level up?
              </h2>
              <p className="mb-8" style={{ color: '#9c9a8e' }}>
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
        </Section>

        {/* ── Footer ────────────────────────────────────────────────── */}
        <footer
          className="relative py-10 text-center text-sm overflow-hidden"
          style={{
            borderTop: '1px solid rgba(201,185,154,0.08)',
            color: '#6b6960',
            background: 'linear-gradient(to bottom, transparent 0%, rgba(210,140,55,0.06) 100%)',
          }}
        >
          <div
            className="absolute inset-x-0 top-0 h-32 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 50% 100% at 50% 0%, rgba(210,140,55,0.08) 0%, transparent 70%)',
              filter: 'blur(10px)',
            }}
          />
          <span
            className="font-semibold relative"
            style={{ color: '#c9b99a', textShadow: '0 0 20px rgba(201,185,154,0.25)' }}
          >
            Alvora
          </span>
          <span className="relative">
            {' '}© {new Date().getFullYear()} — Open source developer analytics
          </span>
        </footer>
      </div>
    </PageTransition>
  );
}
