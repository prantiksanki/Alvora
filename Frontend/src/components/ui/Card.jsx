import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  padding = 'p-6',
  hover = false,
  gradient = false,
  onClick,
  ...props
}) => {
  const base = 'backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden';
  const hoverClasses = hover
    ? 'hover:border-white/20 hover:bg-white/8 transition-all duration-300 cursor-pointer'
    : '';

  if (hover || onClick) {
    return (
      <motion.div
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        onClick={onClick}
        className={`${base} ${hoverClasses} ${padding} ${className}`}
        {...props}
      >
        {gradient && (
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none" />
        )}
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`${base} ${padding} ${className}`} {...props}>
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none" />
      )}
      {children}
    </div>
  );
};

export default Card;
