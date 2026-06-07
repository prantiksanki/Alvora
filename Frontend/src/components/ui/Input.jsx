const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required,
  icon: Icon,
  className = '',
  ...props
}) => (
  <div className="w-full">
    {label && (
      <label htmlFor={name} className="block text-sm font-medium mb-2" style={{ color: '#9c9a8e' }}>
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6b6960' }}>
          <Icon size={16} />
        </div>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full bg-[#E1E0CC]/4 border text-[#E1E0CC] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
          Icon ? 'pl-9' : ''
        } ${
          error
            ? 'border-red-500/50 focus:ring-red-500/50'
            : 'border-[#E1E0CC]/10 focus:ring-[#c9b99a]/40 focus:border-[#c9b99a]/40'
        } ${className}`}
        {...props}
      />
    </div>
    {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
  </div>
);

export default Input;
