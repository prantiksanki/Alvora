import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Download, Copy, Check,
  Code2, Trophy, GitBranch, BookOpen, Flame, Star, TrendingUp,
} from 'lucide-react';
import html2canvas from 'html2canvas';

/* ── Platform config ─────────────────────────────────── */
const PLATFORM_META = {
  leetcode:   { label: 'LeetCode',      icon: Code2,    color: '#f59e0b', key: 'leetcode'   },
  codeforces: { label: 'Codeforces',    icon: Trophy,   color: '#3b82f6', key: 'codeforces' },
  github:     { label: 'GitHub',        icon: GitBranch,color: '#e5e7eb', key: 'github'     },
  gfg:        { label: 'GFG',           icon: BookOpen, color: '#22c55e', key: 'gfg'        },
  codechef:   { label: 'CodeChef',      icon: Flame,    color: '#f97316', key: 'codechef'   },
  atcoder:    { label: 'AtCoder',       icon: Star,     color: '#38bdf8', key: 'atcoder'    },
};

const LEVEL_COLORS = {
  1: '#6b7280', 2: '#10b981', 3: '#3b82f6',
  4: '#8b5cf6', 5: '#f97316', 6: '#ef4444',
};

/* ── The actual card (also exported for standalone page) ─ */
export function ProfileCard({ user, overview = [], gamification = {}, cardRef }) {
  const { totalXP = 0, level = 1, levelName = 'Beginner', badges = [] } = gamification;
  const levelColor = LEVEL_COLORS[level] || LEVEL_COLORS[1];

  /* Per-platform stats */
  const getSnap = (p) => overview.find((s) => s.platform === p);
  const lc  = getSnap('leetcode');
  const cf  = getSnap('codeforces');
  const gh  = getSnap('github');
  const gfg = getSnap('gfg');
  const cc  = getSnap('codechef');
  const at  = getSnap('atcoder');

  const totalSolved = (lc?.solvedCount || 0) + (gfg?.solvedCount || 0) + (cc?.solvedCount || 0);
  const cfRating    = cf?.rating || 0;
  const ghRepos     = gh?.extraData?.publicRepos || 0;
  const ghStars     = gh?.extraData?.stars || 0;
  const streak      = Math.max(lc?.streak || 0, gfg?.streak || 0);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'DE';

  const connectedPlatforms = Object.values(PLATFORM_META).filter((p) =>
    overview.some((s) => s.platform === p.key)
  );

  return (
    <div
      ref={cardRef}
      style={{
        width: '680px',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #0f0f0f 50%, #111111 100%)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, sans-serif",
        position: 'relative',
      }}
    >
      {/* Top gradient bar */}
      <div style={{
        height: '3px',
        background: `linear-gradient(90deg, ${levelColor}, #8b5cf6, #06b6d4, #10b981)`,
      }} />

      {/* Subtle grid pattern overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `radial-gradient(circle at 80% 20%, rgba(139,92,246,0.06) 0%, transparent 50%),
          radial-gradient(circle at 20% 80%, rgba(6,182,212,0.04) 0%, transparent 50%)`,
      }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '28px 32px 24px' }}>

        {/* ── Header row ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '24px' }}>

          {/* Avatar */}
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: user?.avatarColor || '#2563eb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', fontWeight: '800', color: '#fff',
            flexShrink: 0,
            boxShadow: `0 0 0 3px rgba(255,255,255,0.06), 0 0 32px ${user?.avatarColor || '#2563eb'}40`,
          }}>
            {initials}
          </div>

          {/* Name + bio */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#ffffff', lineHeight: 1.2 }}>
                {user?.name || 'Developer'}
              </h1>
              {/* Level badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '3px 10px', borderRadius: '20px',
                background: `${levelColor}18`, border: `1px solid ${levelColor}40`,
                fontSize: '11px', fontWeight: '700', color: levelColor, letterSpacing: '0.02em',
              }}>
                <span>LVL {level}</span>
                <span style={{ opacity: 0.7 }}>·</span>
                <span>{levelName}</span>
              </div>
            </div>

            {/* Location / college */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', flexWrap: 'wrap' }}>
              {user?.college && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#9ca3af' }}>
                  <span>🎓</span> {user.college}
                </span>
              )}
              {user?.location && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#9ca3af' }}>
                  <span>📍</span> {user.location}
                </span>
              )}
            </div>

            {user?.bio && (
              <p style={{
                margin: '8px 0 0', fontSize: '12px', color: '#6b7280', lineHeight: '1.5',
                overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>
                {user.bio}
              </p>
            )}
          </div>

          {/* XP block */}
          <div style={{
            textAlign: 'right', flexShrink: 0,
            padding: '10px 14px', borderRadius: '14px',
            background: `${levelColor}10`, border: `1px solid ${levelColor}25`,
          }}>
            <div style={{ fontSize: '22px', fontWeight: '900', color: levelColor, lineHeight: 1 }}>
              {totalXP.toLocaleString()}
            </div>
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              XP Points
            </div>
          </div>
        </div>

        {/* ── Key stats row ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px',
        }}>
          {[
            { label: 'Problems Solved', value: totalSolved, color: '#8b5cf6', emoji: '🧩' },
            { label: 'CF Rating',       value: cfRating || '—', color: '#3b82f6', emoji: '⚡' },
            { label: 'GitHub Repos',    value: ghRepos,    color: '#e5e7eb', emoji: '📦' },
            { label: 'Best Streak',     value: `${streak}d`, color: '#10b981', emoji: '🔥' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px', padding: '14px 12px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{stat.emoji}</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: stat.color, lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px', letterSpacing: '0.03em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Platform grid ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px',
        }}>
          {connectedPlatforms.slice(0, 6).map((meta) => {
            const snap = getSnap(meta.key);
            if (!snap) return null;

            const mainVal = meta.key === 'github'
              ? `${snap.extraData?.publicRepos || 0} repos`
              : meta.key === 'codeforces' || meta.key === 'codechef' || meta.key === 'atcoder'
              ? `${snap.rating || 0} rating`
              : `${snap.solvedCount || 0} solved`;

            const sub = meta.key === 'github'
              ? `${ghStars} ⭐`
              : meta.key === 'codeforces'
              ? snap.extraData?.rank || ''
              : meta.key === 'leetcode'
              ? `${snap.streak || 0}d streak`
              : '';

            return (
              <div key={meta.key} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: `${meta.color}08`,
                border: `1px solid ${meta.color}20`,
                borderRadius: '12px', padding: '10px 12px',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: `${meta.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <meta.icon size={16} style={{ color: meta.color }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '1px' }}>{meta.label}</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>{mainVal}</div>
                  {sub && <div style={{ fontSize: '10px', color: '#4b5563' }}>{sub}</div>}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Badges row ── */}
        {badges.length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '10px', color: '#4b5563', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600' }}>
              Badges Earned
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {badges.slice(0, 8).map((badge) => (
                <div key={badge.badgeId} title={badge.description} style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '4px 10px', borderRadius: '20px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  fontSize: '11px', color: '#d1d5db',
                }}>
                  <span style={{ fontSize: '13px' }}>{badge.icon}</span>
                  <span>{badge.name}</span>
                </div>
              ))}
              {badges.length > 8 && (
                <div style={{
                  padding: '4px 10px', borderRadius: '20px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  fontSize: '11px', color: '#6b7280',
                }}>
                  +{badges.length - 8} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '20px', height: '20px', borderRadius: '6px',
              background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TrendingUp size={11} style={{ color: '#fff' }} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.05em' }}>
              alvora.app
            </span>
          </div>

          {/* Mini platform dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {connectedPlatforms.map((p) => (
              <div key={p.key} title={p.label} style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: p.color, opacity: 0.7,
              }} />
            ))}
          </div>

          <div style={{ fontSize: '11px', color: '#4b5563' }}>
            {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Modal wrapper ───────────────────────────────────── */
export default function ProfileCardModal({ isOpen, onClose, user, overview, gamification }) {
  const cardRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `${user?.name?.replace(/\s+/g, '_') || 'profile'}_alvora_card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      // fallback: print
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/card`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center gap-5 max-w-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between w-full px-1">
              <div>
                <h2 className="text-lg font-bold text-white">Your Profile Card</h2>
                <p className="text-xs text-gray-500 mt-0.5">Share with recruiters, attach to applications</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/8 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Card preview — scrollable on small screens */}
            <div className="overflow-x-auto max-w-full">
              <ProfileCard
                cardRef={cardRef}
                user={user}
                overview={overview}
                gamification={gamification}
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 w-full">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                  boxShadow: '0 4px 20px rgba(139,92,246,0.35)',
                }}
              >
                {downloading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Download size={15} />
                )}
                {downloading ? 'Generating…' : 'Download PNG'}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: copied ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.06)',
                  border: copied ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.1)',
                  color: copied ? '#34d399' : '#9ca3af',
                }}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </motion.button>
            </div>

            <p className="text-[11px] text-gray-600 text-center">
              Download the PNG and attach it to your resume or LinkedIn · Share your link with anyone
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
