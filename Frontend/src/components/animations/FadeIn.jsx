import { motion } from 'framer-motion';

const containerVariants = (stagger, delay) => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const FadeIn = ({ children, stagger = 0.08, delay = 0, className = '' }) => (
  <motion.div
    variants={containerVariants(stagger, delay)}
    initial="hidden"
    animate="show"
    className={className}
  >
    {children}
  </motion.div>
);

FadeIn.Item = ({ children, className = '' }) => (
  <motion.div variants={itemVariants} className={className}>
    {children}
  </motion.div>
);

export default FadeIn;
