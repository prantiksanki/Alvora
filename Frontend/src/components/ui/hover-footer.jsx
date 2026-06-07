import React, { useRef, useEffect, useState } from 'react';
import { Mail, Globe, MapPin, GitBranch, Send, Link } from 'lucide-react';

export function TextHoverEffect({ text, className }) {
  const svgRef = useRef(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: '50%', cy: '50%' });
  const [dashOffset, setDashOffset] = useState(1000);

  useEffect(() => {
    if (svgRef.current && cursor.x !== null && cursor.y !== null) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100;
      const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100;
      setMaskPosition({ cx: `${cxPercentage}%`, cy: `${cyPercentage}%` });
    }
  }, [cursor]);

  // Drive stroke draw-on via CSS animation using a ref
  useEffect(() => {
    const raf = requestAnimationFrame(() => setDashOffset(0));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 300 100"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      style={{ cursor: 'pointer', userSelect: 'none' }}
      className={className || ''}
    >
      <defs>
        <linearGradient id="alvoraTextGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c9b99a" />
          <stop offset="25%" stopColor="#a8956e" />
          <stop offset="50%" stopColor="#E1E0CC" />
          <stop offset="75%" stopColor="#c9b99a" />
          <stop offset="100%" stopColor="#8a7355" />
        </linearGradient>

        <radialGradient
          id="alvoraRevealMask"
          gradientUnits="userSpaceOnUse"
          r="25%"
          cx={maskPosition.cx}
          cy={maskPosition.cy}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </radialGradient>

        <mask id="alvoraTextMask">
          <rect x="0" y="0" width="100%" height="100%" fill="url(#alvoraRevealMask)" />
        </mask>
      </defs>

      {/* Faint outline — shows on hover */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        stroke="rgba(225,224,204,0.4)"
        fill="none"
        style={{
          fontFamily: 'helvetica, sans-serif',
          fontSize: '72px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        {text}
      </text>

      {/* Stroke draw-on via CSS transition */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        stroke="#c9b99a"
        fill="none"
        strokeDasharray="1000"
        strokeDashoffset={dashOffset}
        style={{
          fontFamily: 'helvetica, sans-serif',
          fontSize: '72px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          transition: 'stroke-dashoffset 4s ease-in-out',
        }}
      >
        {text}
      </text>

      {/* Gradient reveal on hover via mask */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="0.3"
        stroke="url(#alvoraTextGradient)"
        fill="none"
        mask="url(#alvoraTextMask)"
        style={{
          fontFamily: 'helvetica, sans-serif',
          fontSize: '72px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
        }}
      >
        {text}
      </text>
    </svg>
  );
}

export function FooterBackgroundGradient() {
  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none"
      style={{
        background:
          'radial-gradient(125% 125% at 50% 10%, rgba(15,15,17,0.4) 50%, rgba(201,185,154,0.08) 100%)',
      }}
    />
  );
}

export default function HoverFooter() {
  const footerLinks = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#' },
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Job Tracker', href: '/tracker' },
        { label: 'Analytics', href: '#' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#' },
        { label: 'Sign Up', href: '/signup', pulse: true },
        { label: 'Sign In', href: '/login' },
      ],
    },
  ];

  const contactInfo = [
    { icon: <Mail size={16} />, text: 'hello@alvora.dev', href: 'mailto:hello@alvora.dev' },
    { icon: <Globe size={16} />, text: 'alvora.dev', href: '#' },
    { icon: <MapPin size={16} />, text: 'India' },
  ];

  const socialLinks = [
    { icon: <GitBranch size={18} />, label: 'GitHub', href: '#' },
    { icon: <Send size={18} />, label: 'Twitter', href: '#' },
    { icon: <Link size={18} />, label: 'LinkedIn', href: '#' },
  ];

  return (
    <footer
      className="relative overflow-hidden"
      style={{ backgroundColor: '#0d0c09', borderTop: '1px solid rgba(225,224,204,0.08)' }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12">

          {/* Brand */}
          <div className="flex flex-col gap-4">
            <span className="text-3xl font-bold" style={{ color: '#c9b99a' }}>Alvora</span>
            <p className="text-sm leading-relaxed" style={{ color: '#6b6960' }}>
              Open source developer analytics platform. Track your coding journey across every platform in one place.
            </p>
          </div>

          {/* Link columns */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-base font-semibold mb-5" style={{ color: '#E1E0CC' }}>
                {section.title}
              </h4>
              <ul className="flex flex-col gap-3">
                {section.links.map((link) => (
                  <li key={link.label} className="relative">
                    <a
                      href={link.href}
                      className="text-sm transition-colors duration-200"
                      style={{ color: '#6b6960' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#c9b99a')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#6b6960')}
                    >
                      {link.label}
                    </a>
                    {link.pulse && (
                      <span
                        className="absolute top-1 right-0 w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ backgroundColor: '#c9b99a' }}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="text-base font-semibold mb-5" style={{ color: '#E1E0CC' }}>Contact</h4>
            <ul className="flex flex-col gap-4">
              {contactInfo.map((item, i) => (
                <li key={i} className="flex items-center gap-3" style={{ color: '#6b6960' }}>
                  <span style={{ color: '#c9b99a' }}>{item.icon}</span>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-sm transition-colors duration-200"
                      style={{ color: '#6b6960' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#c9b99a')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#6b6960')}
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span className="text-sm">{item.text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(225,224,204,0.08)', margin: '0 0 24px' }} />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-5">
            {socialLinks.map(({ icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="transition-colors duration-200"
                style={{ color: '#6b6960' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#c9b99a')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#6b6960')}
              >
                {icon}
              </a>
            ))}
          </div>
          <p className="text-sm" style={{ color: '#6b6960' }}>
            &copy; {new Date().getFullYear()} Alvora. All rights reserved.
          </p>
        </div>
      </div>

      {/* Large hover text — desktop only */}
      <div className="hidden lg:flex h-48 items-center justify-center -mb-8">
        <TextHoverEffect text="Alvora" />
      </div>

      <FooterBackgroundGradient />
    </footer>
  );
}
