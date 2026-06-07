import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const TextRevealByWord = ({ text, className = '' }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const words = text.split(' ');

  return (
    <div ref={targetRef} className={`relative z-0 h-[250vh] ${className}`}>
      <div className="sticky top-0 mx-auto flex h-screen max-w-5xl items-center px-8 md:px-16">
        <p
          className="flex flex-wrap gap-y-2 text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            return (
              <Word key={i} progress={scrollYProgress} range={[start, end]}>
                {word}
              </Word>
            );
          })}
        </p>
      </div>
    </div>
  );
};

const Word = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span className="relative mx-1 lg:mx-2">
      <span className="absolute" style={{ color: 'rgba(225,224,204,0.15)' }}>{children}</span>
      <motion.span style={{ opacity, color: '#E1E0CC' }}>{children}</motion.span>
    </span>
  );
};

export { TextRevealByWord };
