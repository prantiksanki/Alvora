import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Download, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import api from '../services/api';
import { ProfileCard } from '../components/profile-card/ProfileCardModal';

export default function PublicCardPage() {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const cardRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Theme + align from URL so shared links look the same for the recipient
  const themeId = searchParams.get('theme') || 'midnight';
  const align   = searchParams.get('align')  || 'center';

  useEffect(() => {
    api.get(`/public/card/${userId}`)
      .then(({ data }) => setData(data))
      .catch((e) => { if (e.response?.status === 404) setNotFound(true); })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, backgroundColor: null, useCORS: true, logging: false,
      });
      const link = document.createElement('a');
      link.download = `${data?.user?.name?.replace(/\s+/g, '_') || 'profile'}_alvora_card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#060608', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '36px', height: '36px', border: '3px solid rgba(139,92,246,0.15)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: '#060608', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ fontSize: '48px' }}>👤</div>
      <div style={{ fontSize: '18px', fontWeight: '600', color: '#6b7280' }}>Profile not found</div>
      <Link to="/" style={{ fontSize: '13px', color: '#8b5cf6', textDecoration: 'none' }}>← Go to Alvora</Link>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh', background: '#060608',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 16px', fontFamily: 'Inter, sans-serif',
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Branding */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '7px', textDecoration: 'none', marginBottom: '32px' }}>
        <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TrendingUp size={11} style={{ color: '#fff' }} />
        </div>
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#374151', letterSpacing: '0.05em' }}>alvora.app</span>
      </Link>

      {/* Card */}
      {data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <ProfileCard
            cardRef={cardRef}
            user={data.user}
            overview={data.overview}
            gamification={data.gamification}
            themeId={themeId}
            align={align}
          />
        </motion.div>
      )}

      {/* Save Image */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={handleDownload}
        disabled={downloading}
        style={{
          marginTop: '24px',
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '12px 28px', borderRadius: '14px', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
          boxShadow: '0 4px 20px rgba(139,92,246,0.3)',
          fontSize: '13px', fontWeight: '600', color: '#fff',
          opacity: downloading ? 0.6 : 1,
        }}
      >
        {downloading
          ? <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
          : <Download size={14} />}
        {downloading ? 'Saving…' : 'Save Image'}
      </motion.button>

      <p style={{ marginTop: '16px', fontSize: '11px', color: '#1f2937', textAlign: 'center' }}>
        Build your developer profile on{' '}
        <Link to="/" style={{ color: '#8b5cf6', textDecoration: 'none' }}>alvora.app</Link>
      </p>
    </div>
  );
}
