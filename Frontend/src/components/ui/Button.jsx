import { motion } from 'framer-motion';

const VARIANTS = {
  primary: 'bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white shadow-lg shadow-violet-500/25',
  secondary: 'bg-white/10 hover:bg-white/15 active:bg-white/20 text-white border border-white/10',
  ghost: 'hover:bg-white/5 active:bg-white/10 text-gray-400 hover:text-white',
  danger: 'bg-red-600/80 hover:bg-red-500 active:bg-red-700 text-white',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled,
  type = 'button',
  className = '',
  ...props
}) => (
  <motion.button
    type={type}
    onClick={onClick}
    disabled={disabled}
    whileTap={{ scale: disabled ? 1 : 0.97 }}
    className={`font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    {...props}
  >
    {children}
  </motion.button>
);

export default Button;
