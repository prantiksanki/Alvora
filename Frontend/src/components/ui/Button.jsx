import { motion } from 'framer-motion';

const VARIANTS = {
  primary: 'bg-[#c9b99a] hover:bg-[#d4c5ab] active:bg-[#b8a88a] text-[#0d0c09] shadow-lg shadow-[#c9b99a]/20',
  secondary: 'bg-[#E1E0CC]/8 hover:bg-[#E1E0CC]/12 active:bg-[#E1E0CC]/16 text-[#E1E0CC] border border-[#E1E0CC]/15',
  ghost: 'hover:bg-[#E1E0CC]/5 active:bg-[#E1E0CC]/8 text-[#9c9a8e] hover:text-[#E1E0CC]',
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
