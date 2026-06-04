import { motion } from 'framer-motion';

const OFFSETS = {
  left: { x: -24, y: 0 },
  right: { x: 24, y: 0 },
  up: { x: 0, y: -16 },
  down: { x: 0, y: 16 },
};

const SlideIn = ({ children, direction = 'left', delay = 0, className = '' }) => {
  const offset = OFFSETS[direction] || OFFSETS.left;
  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default SlideIn;
