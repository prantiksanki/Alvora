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
      <label htmlFor={name} className="block text-sm font-medium text-gray-400 mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
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
        className={`w-full bg-white/5 border text-white rounded-xl px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
          Icon ? 'pl-9' : ''
        } ${
          error
            ? 'border-red-500/50 focus:ring-red-500/50'
            : 'border-white/10 focus:ring-violet-500/50 focus:border-violet-500/50'
        } ${className}`}
        {...props}
      />
    </div>
    {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
  </div>
);

export default Input;
