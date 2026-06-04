import { useState, useRef } from 'react';
import { X, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CompanySelector = ({ value = [], onChange, placeholder = 'Type company slug and press Enter' }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  const addCompany = (raw) => {
    const slug = raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (!slug || value.includes(slug) || value.length >= 50) return;
    onChange([...value, slug]);
    setInput('');
  };

  const removeCompany = (slug) => {
    onChange(value.filter((c) => c !== slug));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCompany(input);
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeCompany(value[value.length - 1]);
    }
  };

  return (
    <div
      className="min-h-12 flex flex-wrap gap-2 p-2.5 bg-white/5 border border-white/10 rounded-xl cursor-text focus-within:border-violet-500/50 transition-all"
      onClick={() => inputRef.current?.focus()}
    >
      <AnimatePresence mode="popLayout">
        {value.map((company) => (
          <motion.div
            key={company}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-violet-500/15 border border-violet-500/30 rounded-lg text-xs text-violet-300 font-medium shrink-0"
          >
            <Building2 size={10} className="shrink-0" />
            {company}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeCompany(company); }}
              className="hover:text-white transition-colors ml-0.5"
            >
              <X size={10} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : '+ Add company'}
        className="flex-1 min-w-24 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none py-0.5"
      />
    </div>
  );
};

export default CompanySelector;
