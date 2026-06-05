import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import Button from '../ui/Button';

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/8 last:border-0 pb-4 mb-4 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full mb-3 text-left group"
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors">
          {title}
        </span>
        <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.15 }}>
          <ChevronDown size={14} className="text-gray-600" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CheckOption = ({ label, value, checked, onChange }) => (
  <label className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
    <div
      onClick={() => onChange(value, !checked)}
      className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-150 cursor-pointer shrink-0 ${
        checked
          ? 'bg-violet-600 border-violet-600'
          : 'border-white/20 group-hover:border-white/40'
      }`}
    >
      {checked && (
        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
          <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
    <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">{label}</span>
  </label>
);

const SOURCES = [
  { label: 'Greenhouse', value: 'greenhouse' },
  { label: 'Lever', value: 'lever' },
  { label: 'Ashby', value: 'ashby' },
  { label: 'Workday', value: 'workday' },
];

const EMPLOYMENT_TYPES = [
  { label: 'Full-time', value: 'full_time' },
  { label: 'Part-time', value: 'part_time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Internship', value: 'internship' },
];

const FilterSidebar = ({ filters, onFilterChange, isOpen, onClose, hasActiveFilters }) => {
  const handleSearchChange = (e) => onFilterChange('search', e.target.value);
  const handleCompanyChange = (e) => onFilterChange('company', e.target.value);
  const handleSourceChange = (value, checked) =>
    onFilterChange('source', checked ? value : '');
  const handleEmploymentChange = (value, checked) =>
    onFilterChange('employmentType', checked ? value : '');
  const handleRemoteToggle = () =>
    onFilterChange('remote', filters.remote === 'true' ? '' : 'true');

  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-violet-400" />
          <span className="text-sm font-semibold text-white">Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-violet-400" />
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors md:hidden"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-0">
        {/* Search */}
        <FilterSection title="Search" defaultOpen={true}>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Role, keyword..."
              defaultValue={filters.search}
              onChange={handleSearchChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all"
            />
          </div>
        </FilterSection>

        {/* Company */}
        <FilterSection title="Company" defaultOpen={true}>
          <input
            type="text"
            placeholder="e.g. stripe, shopify..."
            defaultValue={filters.company}
            onChange={handleCompanyChange}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all"
          />
        </FilterSection>

        {/* Source */}
        <FilterSection title="Source">
          {SOURCES.map((s) => (
            <CheckOption
              key={s.value}
              label={s.label}
              value={s.value}
              checked={filters.source === s.value}
              onChange={handleSourceChange}
            />
          ))}
        </FilterSection>

        {/* Employment Type */}
        <FilterSection title="Employment Type">
          {EMPLOYMENT_TYPES.map((t) => (
            <CheckOption
              key={t.value}
              label={t.label}
              value={t.value}
              checked={filters.employmentType === t.value}
              onChange={handleEmploymentChange}
            />
          ))}
        </FilterSection>

        {/* Remote */}
        <FilterSection title="Work Mode">
          <label className="flex items-center justify-between py-1.5 cursor-pointer" onClick={handleRemoteToggle}>
            <span className="text-sm text-gray-400">Remote only</span>
            <div
              className={`w-10 h-5 rounded-full transition-all duration-200 relative shrink-0 ${
                filters.remote === 'true' ? 'bg-violet-600' : 'bg-white/10'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-all duration-200 ${
                  filters.remote === 'true' ? 'left-5' : 'left-0.75'
                }`}
                style={{ top: '3px', left: filters.remote === 'true' ? '22px' : '3px' }}
              />
            </div>
          </label>
        </FilterSection>
      </div>

      {/* Clear all */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-white/8">
          <button
            onClick={() => onFilterChange('__clear__', null)}
            className="w-full text-xs text-gray-500 hover:text-violet-400 transition-colors py-1.5"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );

  // Mobile: drawer overlay
  return (
    <>
      {/* Desktop: always visible sticky panel */}
      <div className="hidden md:block w-56 shrink-0">
        <div className="sticky top-0 bg-white/3 border border-white/8 rounded-2xl p-4">
          {content}
        </div>
      </div>

      {/* Mobile: slide-in drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40 md:hidden"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 bg-[#111118] border-r border-white/8 p-5 md:hidden overflow-y-auto"
            >
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FilterSidebar;
