import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useRef, useCallback } from 'react';

function TiltCard({ children, className = '', padding = 'p-6', gradient = false, onClick, style: styleProp, ...props }) {
  const ref = useRef(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 300, damping: 30, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-6, 6]);
  const translateX = useTransform(smoothX, [-0.5, 0.5], [-3, 3]);
  const translateY = useTransform(smoothY, [-0.5, 0.5], [-3, 3]);

  const highlightBg = useTransform(
    [smoothX, smoothY],
    ([x, y]) =>
      `radial-gradient(ellipse 60% 40% at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(201,185,154,0.13) 0%, transparent 60%)`
  );

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        x: translateX,
        y: translateY,
        transformStyle: 'preserve-3d',
        perspective: 800,
        boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,185,154,0.08)',
        background: 'rgba(225,224,204,0.05)',
        border: '1px solid rgba(201,185,154,0.15)',
        ...styleProp,
      }}
      whileHover={{
        y: -10,
        boxShadow:
          '0 20px 60px rgba(0,0,0,0.55), 0 0 40px rgba(201,185,154,0.18), 0 0 80px rgba(201,185,154,0.08), 0 0 0 1px rgba(201,185,154,0.28)',
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
      }}
      className={[
        'backdrop-blur-xl',
        'rounded-2xl relative overflow-hidden',
        'cursor-pointer',
        'transition-[background-color] duration-300',
        padding,
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {/* Static edge lighting — top-left warm light source */}
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          background:
            'linear-gradient(135deg, rgba(201,185,154,0.10) 0%, rgba(201,185,154,0.03) 40%, transparent 60%)',
        }}
      />

      {/* Dynamic highlight following cursor */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{ background: highlightBg }}
      />

      {gradient && (
        <div className="absolute inset-0 bg-linear-to-br from-[#c9b99a]/5 to-transparent pointer-events-none rounded-2xl" />
      )}

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

const Card = ({
  children,
  className = '',
  padding = 'p-6',
  hover = false,
  gradient = false,
  onClick,
  style,
  ...props
}) => {
  if (hover || onClick) {
    return (
      <TiltCard
        className={className}
        padding={padding}
        gradient={gradient}
        onClick={onClick}
        style={style}
        {...props}
      >
        {children}
      </TiltCard>
    );
  }

  return (
    <div
      className={[
        'backdrop-blur-xl',
        'rounded-2xl relative overflow-hidden',
        padding,
        className,
      ].filter(Boolean).join(' ')}
      style={{
        background: 'rgba(225,224,204,0.05)',
        border: '1px solid rgba(201,185,154,0.15)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,185,154,0.06)',
        ...style,
      }}
      {...props}
    >
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(201,185,154,0.08) 0%, transparent 50%)',
        }}
      />
      {gradient && (
        <div className="absolute inset-0 bg-linear-to-br from-[#c9b99a]/5 to-transparent pointer-events-none rounded-2xl" />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default Card;
