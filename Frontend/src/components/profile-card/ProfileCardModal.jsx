import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Copy, Check, TrendingUp, AlignLeft, AlignCenter, Palette } from 'lucide-react';
import html2canvas from 'html2canvas';

/* ── Themes ──────────────────────────────────────────────────────────────── */
const THEMES = [
  {
    id: 'midnight',
    name: 'Midnight',
    bg: 'linear-gradient(160deg, #0a0a0f 0%, #0f0f1a 50%, #0a0a0f 100%)',
    surface: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.08)',
    text: '#ffffff',
    subtext: '#6b7280',
    metaText: '#4b5563',
    accent: '#8b5cf6',
    glow: 'rgba(139,92,246,0.15)',
    topBar: 'linear-gradient(90deg, #8b5cf6, #06b6d4, #10b981)',
    preview: 'linear-gradient(135deg, #0a0a0f, #1a1a2e)',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    bg: 'linear-gradient(160deg, #0d1117 0%, #0f1923 40%, #091220 100%)',
    surface: 'rgba(6,182,212,0.06)',
    border: 'rgba(6,182,212,0.15)',
    text: '#e2f8ff',
    subtext: '#67a5b8',
    metaText: '#3d7080',
    accent: '#06b6d4',
    glow: 'rgba(6,182,212,0.18)',
    topBar: 'linear-gradient(90deg, #06b6d4, #8b5cf6, #06b6d4)',
    preview: 'linear-gradient(135deg, #0d1117, #0f1923)',
  },
  {
    id: 'ember',
    name: 'Ember',
    bg: 'linear-gradient(160deg, #0f0805 0%, #1a0f07 40%, #0f0805 100%)',
    surface: 'rgba(249,115,22,0.06)',
    border: 'rgba(249,115,22,0.15)',
    text: '#fff7ed',
    subtext: '#a06040',
    metaText: '#5a3520',
    accent: '#f97316',
    glow: 'rgba(249,115,22,0.18)',
    topBar: 'linear-gradient(90deg, #f97316, #ef4444, #eab308)',
    preview: 'linear-gradient(135deg, #0f0805, #1a0f07)',
  },
  {
    id: 'forest',
    name: 'Forest',
    bg: 'linear-gradient(160deg, #050f08 0%, #081a0d 40%, #050f08 100%)',
    surface: 'rgba(16,185,129,0.06)',
    border: 'rgba(16,185,129,0.15)',
    text: '#ecfdf5',
    subtext: '#4a8a6a',
    metaText: '#2d5540',
    accent: '#10b981',
    glow: 'rgba(16,185,129,0.18)',
    topBar: 'linear-gradient(90deg, #10b981, #06b6d4, #84cc16)',
    preview: 'linear-gradient(135deg, #050f08, #081a0d)',
  },
  {
    id: 'rose',
    name: 'Rose',
    bg: 'linear-gradient(160deg, #0f050a 0%, #1a0810 40%, #0f050a 100%)',
    surface: 'rgba(244,63,94,0.06)',
    border: 'rgba(244,63,94,0.15)',
    text: '#fff1f2',
    subtext: '#9a4060',
    metaText: '#5a2535',
    accent: '#f43f5e',
    glow: 'rgba(244,63,94,0.18)',
    topBar: 'linear-gradient(90deg, #f43f5e, #ec4899, #8b5cf6)',
    preview: 'linear-gradient(135deg, #0f050a, #1a0810)',
  },
  {
    id: 'galaxy',
    name: 'Galaxy',
    bg: 'linear-gradient(160deg, #060612 0%, #0d0b24 40%, #060612 100%)',
    surface: 'rgba(139,92,246,0.07)',
    border: 'rgba(139,92,246,0.18)',
    text: '#f0eeff',
    subtext: '#6b5fa0',
    metaText: '#3d3560',
    accent: '#a78bfa',
    glow: 'rgba(139,92,246,0.22)',
    topBar: 'linear-gradient(90deg, #a78bfa, #ec4899, #06b6d4)',
    preview: 'linear-gradient(135deg, #060612, #0d0b24)',
  },
  {
    id: 'arctic',
    name: 'Arctic',
    bg: 'linear-gradient(160deg, #f8fafc 0%, #f1f5f9 40%, #e8f0fe 100%)',
    surface: 'rgba(0,0,0,0.04)',
    border: 'rgba(0,0,0,0.08)',
    text: '#0f172a',
    subtext: '#64748b',
    metaText: '#94a3b8',
    accent: '#3b82f6',
    glow: 'rgba(59,130,246,0.12)',
    topBar: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)',
    preview: 'linear-gradient(135deg, #f8fafc, #e8f0fe)',
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    bg: 'linear-gradient(160deg, #09090b 0%, #18181b 40%, #09090b 100%)',
    surface: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.06)',
    text: '#fafafa',
    subtext: '#52525b',
    metaText: '#3f3f46',
    accent: '#e4e4e7',
    glow: 'rgba(255,255,255,0.06)',
    topBar: 'linear-gradient(90deg, #52525b, #a1a1aa, #52525b)',
    preview: 'linear-gradient(135deg, #09090b, #18181b)',
  },
];

const PLATFORM_CONFIG = {
  leetcode:   { label: 'LeetCode',   color: '#f59e0b', emoji: '💻' },
  codeforces: { label: 'Codeforces', color: '#3b82f6', emoji: '⚡' },
  github:     { label: 'GitHub',     color: '#a1a1aa', emoji: '🐙' },
  gfg:        { label: 'GFG',        color: '#22c55e', emoji: '📗' },
  codechef:   { label: 'CodeChef',   color: '#f97316', emoji: '🍴' },
  atcoder:    { label: 'AtCoder',    color: '#38bdf8', emoji: '🔷' },
};

const LEVEL_COLORS = {
  1: '#6b7280', 2: '#10b981', 3: '#3b82f6',
  4: '#8b5cf6', 5: '#f97316', 6: '#ef4444',
};

/* ── Card component ───────────────────────────────────────────────────────── */
export function ProfileCard({ user, overview = [], gamification = {}, cardRef, theme, themeId, align = 'center' }) {
  const t = theme || THEMES.find((x) => x.id === themeId) || THEMES[0];
  const { totalXP = 0, level = 1, levelName = 'Beginner', badges = [], isLoading: gamLoading = false } = gamification;
  const levelColor = LEVEL_COLORS[level] || LEVEL_COLORS[1];

  const getSnap = (p) => overview.find((s) => s.platform === p);
  const lc  = getSnap('leetcode');
  const cf  = getSnap('codeforces');
  const gh  = getSnap('github');
  const gfg = getSnap('gfg');
  const cc  = getSnap('codechef');
  const at  = getSnap('atcoder');

  const totalSolved = (lc?.solvedCount || 0) + (gfg?.solvedCount || 0) + (cc?.solvedCount || 0) + (cf?.solvedCount || 0) + (at?.solvedCount || 0);
  const streak      = Math.max(lc?.streak || 0, gfg?.streak || 0);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'PS';

  const platformRows = [];
  if (lc)  platformRows.push({ key: 'leetcode',   value: `${lc.solvedCount || 0} solved`,           sub: lc.streak ? `${lc.streak}d streak` : null });
  if (cf)  platformRows.push({ key: 'codeforces', value: `${cf.rating || 0} rating`,                sub: cf.extraData?.rank || null });
  if (gh)  platformRows.push({ key: 'github',     value: `${gh.extraData?.publicRepos || 0} repos`, sub: `${gh.extraData?.stars || 0} stars` });
  if (gfg) platformRows.push({ key: 'gfg',        value: `${gfg.solvedCount || 0} solved`,          sub: `score ${gfg.rating || 0}` });
  if (cc)  platformRows.push({ key: 'codechef',   value: `${cc.rating || 0} rating`,                sub: cc.extraData?.maxRating ? `max ${cc.extraData.maxRating}` : null });
  if (at)  platformRows.push({ key: 'atcoder',    value: `${at.rating || 0} rating`,                sub: `${at.contestCount || 0} contests` });

  const isCenter = align === 'center';

  return (
    <div ref={cardRef} style={{
      width: '360px',
      background: t.bg,
      borderRadius: '28px',
      border: `1px solid ${t.border}`,
      overflow: 'hidden',
      fontFamily: "'Inter', -apple-system, sans-serif",
      position: 'relative',
      boxShadow: `0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px ${t.border}`,
    }}>
      {/* Top gradient bar */}
      <div style={{ height: '3px', background: t.topBar }} />

      {/* Background glow orbs */}
      <div style={{
        position: 'absolute', top: '-40px', left: isCenter ? '50%' : '30%',
        transform: 'translateX(-50%)', width: '280px', height: '280px', borderRadius: '50%',
        background: `radial-gradient(circle, ${t.glow} 0%, transparent 65%)`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-60px', right: '-40px',
        width: '200px', height: '200px', borderRadius: '50%',
        background: `radial-gradient(circle, ${t.glow.replace('0.', '0.0')} 0%, transparent 65%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '28px 24px 24px' }}>

        {/* ── Profile header ── */}
        <div style={{
          display: 'flex',
          flexDirection: isCenter ? 'column' : 'row',
          alignItems: isCenter ? 'center' : 'flex-start',
          textAlign: isCenter ? 'center' : 'left',
          gap: isCenter ? '0' : '16px',
          marginBottom: '24px',
        }}>
          {/* Avatar */}
          <div style={{
            width: isCenter ? '80px' : '64px',
            height: isCenter ? '80px' : '64px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${user?.avatarColor || '#2563eb'}, ${t.accent})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: isCenter ? '28px' : '22px', fontWeight: '800', color: '#fff',
            flexShrink: 0,
            marginBottom: isCenter ? '14px' : '0',
            boxShadow: `0 0 0 3px ${t.surface}, 0 8px 32px ${user?.avatarColor || '#2563eb'}40`,
          }}>
            {initials}
          </div>

          <div style={{ flex: 1 }}>
            {/* Name */}
            <div style={{ fontSize: isCenter ? '22px' : '20px', fontWeight: '800', color: t.text, lineHeight: 1.2, marginBottom: '6px' }}>
              {user?.name || 'Developer'}
            </div>

            {/* Level badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '3px 10px', borderRadius: '20px', marginBottom: '8px',
              background: `${levelColor}20`, border: `1px solid ${levelColor}40`,
              fontSize: '10px', fontWeight: '700', color: levelColor, letterSpacing: '0.05em',
            }}>
              ✦ LVL {gamLoading ? '…' : level} · {gamLoading ? '…' : levelName}
            </div>

            {/* Bio + meta */}
            {user?.bio && (
              <div style={{ fontSize: '12px', color: t.subtext, marginBottom: '4px', lineHeight: 1.5 }}>
                {user.bio}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCenter ? 'center' : 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
              {user?.college  && <span style={{ fontSize: '10px', color: t.metaText }}>🎓 {user.college}</span>}
              {user?.location && <span style={{ fontSize: '10px', color: t.metaText }}>📍 {user.location}</span>}
            </div>
          </div>
        </div>

        {/* ── Stats pills ── */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[
            { val: gamLoading ? '…' : totalXP.toLocaleString(), label: 'XP',      color: t.accent,  bg: `${t.accent}15`, bdr: `${t.accent}30` },
            { val: `${streak}d`,                                  label: 'Streak',  color: '#10b981', bg: 'rgba(16,185,129,0.1)',  bdr: 'rgba(16,185,129,0.25)' },
            { val: totalSolved,                                    label: 'Solved',  color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', bdr: 'rgba(139,92,246,0.25)' },
          ].map(({ val, label, color, bg, bdr }) => (
            <div key={label} style={{
              flex: 1, borderRadius: '16px', padding: '13px 10px',
              textAlign: 'center', background: bg, border: `1px solid ${bdr}`,
            }}>
              <div style={{ fontSize: '19px', fontWeight: '900', color, lineHeight: 1, letterSpacing: '-0.02em' }}>
                {val}
              </div>
              <div style={{ fontSize: '9px', color: t.subtext, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: '600' }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Platform rows ── */}
        {platformRows.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '20px' }}>
            {platformRows.map(({ key, value, sub }) => {
              const meta = PLATFORM_CONFIG[key];
              return (
                <div key={key} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: '13px',
                  background: t.surface, border: `1px solid ${t.border}`,
                  backdropFilter: 'blur(8px)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '8px',
                      background: `${meta.color}18`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px',
                    }}>{meta.emoji}</div>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: t.text }}>{meta.label}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: meta.color }}>{value}</div>
                    {sub && <div style={{ fontSize: '9px', color: t.metaText, marginTop: '1px' }}>{sub}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Badges ── */}
        {badges.length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '9px', color: t.metaText, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '700', marginBottom: '8px' }}>
              Badges Earned
            </div>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {badges.slice(0, 5).map((b) => (
                <div key={b.badgeId} style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '3px 9px', borderRadius: '20px',
                  background: t.surface, border: `1px solid ${t.border}`,
                  fontSize: '10px', color: t.subtext,
                }}>
                  <span>{b.icon}</span><span>{b.name}</span>
                </div>
              ))}
              {badges.length > 5 && (
                <div style={{
                  padding: '3px 9px', borderRadius: '20px',
                  background: t.surface, border: `1px solid ${t.border}`,
                  fontSize: '10px', color: t.metaText,
                }}>+{badges.length - 5}</div>
              )}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: '14px', borderTop: `1px solid ${t.border}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{
              width: '16px', height: '16px', borderRadius: '4px',
              background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TrendingUp size={9} style={{ color: '#fff' }} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: '700', color: t.metaText, letterSpacing: '0.05em' }}>
              alvora.app
            </span>
          </div>
          <div style={{ fontSize: '9px', color: t.metaText }}>
            {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Theme swatch ────────────────────────────────────────────────────────── */
function ThemeSwatch({ theme, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '10px 12px', borderRadius: '12px', cursor: 'pointer',
      background: active ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
      border: active ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center', gap: '10px',
      transition: 'all 0.15s',
    }}>
      <div style={{
        width: '32px', height: '20px', borderRadius: '6px',
        background: theme.preview, flexShrink: 0,
        border: '1px solid rgba(255,255,255,0.1)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: theme.topBar }} />
      </div>
      <span style={{ fontSize: '12px', fontWeight: active ? '600' : '500', color: active ? '#fff' : '#9ca3af' }}>
        {theme.name}
      </span>
      {active && (
        <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: '#8b5cf6' }} />
      )}
    </button>
  );
}

/* ── Modal ───────────────────────────────────────────────────────────────── */
export default function ProfileCardModal({ isOpen, onClose, user, overview, gamification }) {
  const cardRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [themeId, setThemeId] = useState('midnight');
  const [align, setAlign] = useState('center');
  const [panel, setPanel] = useState('share'); // 'share' | 'theme' | 'layout'

  const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];

  const shareUrl = user?._id
    ? `${window.location.origin}/card/${user._id}?theme=${themeId}&align=${align}`
    : `${window.location.origin}/card`;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, backgroundColor: null, useCORS: true, logging: false,
        allowTaint: true,
      });
      const link = document.createElement('a');
      link.download = `${user?.name?.replace(/\s+/g, '_') || 'profile'}_alvora_card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { setCopied(false); }
  };

  const panelBtnStyle = (id) => ({
    flex: 1, padding: '7px 4px', borderRadius: '9px', cursor: 'pointer', border: 'none',
    fontSize: '11px', fontWeight: '600',
    background: panel === id ? 'rgba(255,255,255,0.1)' : 'transparent',
    color: panel === id ? '#ffffff' : '#6b7280',
    transition: 'all 0.15s',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
            background: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(20px)',
          }}
          onClick={onClose}
        >
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            ::-webkit-scrollbar { width: 4px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
          `}</style>

          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', maxHeight: '95vh' }}
          >

            {/* ── Card preview ── */}
            <motion.div
              key={themeId + align}
              initial={{ opacity: 0.6, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
            >
              <ProfileCard
                cardRef={cardRef}
                user={user}
                overview={overview}
                gamification={gamification}
                theme={theme}
                align={align}
              />
            </motion.div>

            {/* ── Right panel ── */}
            <div style={{
              width: '220px', flexShrink: 0,
              background: 'rgba(10,10,15,0.95)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              maxHeight: '95vh',
            }}>
              {/* Panel header */}
              <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff' }}>Profile Card</span>
                  <button onClick={onClose} style={{
                    width: '26px', height: '26px', borderRadius: '8px', cursor: 'pointer',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                    color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <X size={13} />
                  </button>
                </div>

                {/* Tab switcher */}
                <div style={{
                  display: 'flex', gap: '2px', padding: '3px',
                  background: 'rgba(255,255,255,0.04)', borderRadius: '11px',
                }}>
                  <button style={panelBtnStyle('theme')} onClick={() => setPanel('theme')}>
                    <Palette size={11} /> Theme
                  </button>
                  <button style={panelBtnStyle('layout')} onClick={() => setPanel('layout')}>
                    <AlignCenter size={11} /> Layout
                  </button>
                  <button style={panelBtnStyle('share')} onClick={() => setPanel('share')}>
                    <Copy size={11} /> Share
                  </button>
                </div>
              </div>

              {/* Scrollable panel body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>

                {/* ── Theme panel ── */}
                {panel === 'theme' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <p style={{ fontSize: '10px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600', marginBottom: '6px' }}>
                      Background Theme
                    </p>
                    {THEMES.map((t) => (
                      <ThemeSwatch
                        key={t.id}
                        theme={t}
                        active={themeId === t.id}
                        onClick={() => setThemeId(t.id)}
                      />
                    ))}
                  </div>
                )}

                {/* ── Layout panel ── */}
                {panel === 'layout' && (
                  <div>
                    <p style={{ fontSize: '10px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600', marginBottom: '10px' }}>
                      Profile Alignment
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {[
                        { id: 'center', label: 'Centered', desc: 'Avatar centered, full-width', icon: AlignCenter },
                        { id: 'left',   label: 'Side by side', desc: 'Avatar left, text right', icon: AlignLeft },
                      ].map(({ id, label, desc, icon: Icon }) => (
                        <button
                          key={id}
                          onClick={() => setAlign(id)}
                          style={{
                            width: '100%', padding: '12px', borderRadius: '12px', cursor: 'pointer',
                            background: align === id ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.03)',
                            border: align === id ? '1px solid rgba(139,92,246,0.35)' : '1px solid rgba(255,255,255,0.06)',
                            textAlign: 'left', display: 'flex', gap: '10px', alignItems: 'center',
                            transition: 'all 0.15s',
                          }}
                        >
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                            background: align === id ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Icon size={15} style={{ color: align === id ? '#a78bfa' : '#6b7280' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: align === id ? '#fff' : '#9ca3af' }}>{label}</div>
                            <div style={{ fontSize: '10px', color: '#4b5563', marginTop: '1px' }}>{desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div style={{ marginTop: '20px' }}>
                      <p style={{ fontSize: '10px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600', marginBottom: '10px' }}>
                        Active Theme
                      </p>
                      <div style={{
                        padding: '10px 12px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex', alignItems: 'center', gap: '10px',
                      }}>
                        <div style={{
                          width: '32px', height: '20px', borderRadius: '6px',
                          background: theme.preview, border: '1px solid rgba(255,255,255,0.1)',
                          position: 'relative', overflow: 'hidden',
                        }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: theme.topBar }} />
                        </div>
                        <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>{theme.name}</span>
                        <button onClick={() => setPanel('theme')} style={{
                          marginLeft: 'auto', fontSize: '10px', color: '#8b5cf6',
                          background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600',
                        }}>Change</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Share panel ── */}
                {panel === 'share' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Share link */}
                    <div>
                      <p style={{ fontSize: '10px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600', marginBottom: '8px' }}>
                        Share Link
                      </p>
                      <div style={{
                        padding: '10px 12px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                        fontSize: '10px', color: '#4b5563', wordBreak: 'break-all', lineHeight: '1.6',
                        marginBottom: '8px',
                      }}>
                        {shareUrl}
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleCopyLink}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                          padding: '10px', borderRadius: '11px', cursor: 'pointer', border: 'none',
                          background: copied ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.06)',
                          outline: copied ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.08)',
                          fontSize: '12px', fontWeight: '600',
                          color: copied ? '#34d399' : '#d1d5db',
                          transition: 'all 0.2s',
                        }}
                      >
                        {copied ? <Check size={13} /> : <Copy size={13} />}
                        {copied ? 'Copied!' : 'Copy Link'}
                      </motion.button>
                    </div>

                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

                    {/* Download */}
                    <div>
                      <p style={{ fontSize: '10px', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600', marginBottom: '8px' }}>
                        Save Image
                      </p>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleDownload}
                        disabled={downloading}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                          padding: '11px', borderRadius: '11px', border: 'none', cursor: 'pointer',
                          background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                          boxShadow: '0 4px 20px rgba(139,92,246,0.35)',
                          fontSize: '12px', fontWeight: '600', color: '#fff',
                          opacity: downloading ? 0.7 : 1, transition: 'opacity 0.2s',
                        }}
                      >
                        {downloading
                          ? <span style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                          : <Download size={13} />}
                        {downloading ? 'Saving…' : 'Download PNG'}
                      </motion.button>
                    </div>

                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

                    <p style={{ fontSize: '10px', color: '#374151', lineHeight: '1.7' }}>
                      Anyone with the link can view your card — no login needed. Share it in your resume, LinkedIn, or send it directly to recruiters.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
