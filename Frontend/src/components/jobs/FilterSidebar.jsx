import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react';

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/5 last:border-0 pb-4 mb-4 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full mb-2.5 text-left"
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">
          {title}
        </span>
        <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.15 }}>
          <ChevronDown size={12} className="text-gray-700" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
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
      className="w-3.5 h-3.5 rounded flex items-center justify-center transition-all duration-150 cursor-pointer shrink-0"
      style={{
        background: checked ? '#8b5cf6' : 'transparent',
        border: checked ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.15)',
      }}
    >
      {checked && (
        <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 10 8">
          <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
    <span className="text-xs text-gray-500 group-hover:text-gray-200 transition-colors">{label}</span>
  </label>
);

const REGIONS = [
  { label: '🇺🇸  United States', value: 'us'   },
  { label: '🇮🇳  India',         value: 'india' },
  { label: '🌍  Remote',         value: 'remote'},
  { label: '🇬🇧  United Kingdom', value: 'uk'   },
  { label: '🇨🇦  Canada',        value: 'canada'},
  { label: '🌐  Europe',         value: 'europe'},
  { label: '🌏  Asia Pacific',   value: 'apac'  },
];

const SOURCES = [
  { label: 'Greenhouse', value: 'greenhouse' },
  { label: 'Lever',      value: 'lever'       },
  { label: 'Ashby',      value: 'ashby'       },
  { label: 'Workday',    value: 'workday'     },
];

const EMPLOYMENT_TYPES = [
  { label: 'Full-time',  value: 'full_time'  },
  { label: 'Part-time',  value: 'part_time'  },
  { label: 'Contract',   value: 'contract'   },
  { label: 'Internship', value: 'internship' },
];

const inputCls = `w-full bg-white/4 border border-white/8 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600
  focus:outline-none focus:border-violet-500/40 transition-all`;

const FilterContent = ({ filters, onFilterChange, hasActiveFilters, onClose }) => (
  <div className="flex flex-col h-full">
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={13} className="text-violet-400" />
        <span className="text-xs font-semibold text-white">Filters</span>
        {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />}
      </div>
      {onClose && (
        <button onClick={onClose} className="md:hidden p-1 text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
          <X size={15} />
        </button>
      )}
    </div>

    <div className="flex-1 overflow-y-auto space-y-0">
      <FilterSection title="Search">
        <div className="relative">
          <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
          <input
            type="text"
            placeholder="Role, keyword…"
            defaultValue={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className={`${inputCls} pl-8`}
          />
        </div>
      </FilterSection>

      <FilterSection title="Company">
        <input
          type="text"
          placeholder="e.g. stripe, shopify…"
          defaultValue={filters.company}
          onChange={(e) => onFilterChange('company', e.target.value)}
          className={inputCls}
        />
      </FilterSection>

      <FilterSection title="Region">
        {REGIONS.map((r) => (
          <CheckOption
            key={r.value} label={r.label} value={r.value}
            checked={filters.region === r.value}
            onChange={(v, checked) => onFilterChange('region', checked ? v : '')}
          />
        ))}
      </FilterSection>

      <FilterSection title="Source" defaultOpen={false}>
        {SOURCES.map((s) => (
          <CheckOption
            key={s.value} label={s.label} value={s.value}
            checked={filters.source === s.value}
            onChange={(v, checked) => onFilterChange('source', checked ? v : '')}
          />
        ))}
      </FilterSection>

      <FilterSection title="Employment" defaultOpen={false}>
        {EMPLOYMENT_TYPES.map((t) => (
          <CheckOption
            key={t.value} label={t.label} value={t.value}
            checked={filters.employmentType === t.value}
            onChange={(v, checked) => onFilterChange('employmentType', checked ? v : '')}
          />
        ))}
      </FilterSection>

      <FilterSection title="Work Mode" defaultOpen={false}>
        <label
          className="flex items-center justify-between py-1.5 cursor-pointer"
          onClick={() => onFilterChange('remote', filters.remote === 'true' ? '' : 'true')}
        >
          <span className="text-xs text-gray-500">Remote only</span>
          <div
            className="w-9 h-4.5 rounded-full transition-all duration-200 relative shrink-0"
            style={{
              background: filters.remote === 'true' ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
              height: '18px', width: '36px',
            }}
          >
            <div
              className="w-3 h-3 bg-white rounded-full absolute transition-all duration-200"
              style={{ top: '3px', left: filters.remote === 'true' ? '21px' : '3px' }}
            />
          </div>
        </label>
      </FilterSection>
    </div>

    {hasActiveFilters && (
      <div className="mt-4 pt-4 border-t border-white/5">
        <button
          onClick={() => onFilterChange('__clear__', null)}
          className="w-full text-[11px] text-gray-600 hover:text-red-400 transition-colors py-1"
        >
          Clear all filters
        </button>
      </div>
    )}
  </div>
);

const FilterSidebar = ({ filters, onFilterChange, isOpen, onClose, hasActiveFilters, inline }) => {
  if (inline) {
    return (
      <FilterContent
        filters={filters}
        onFilterChange={onFilterChange}
        hasActiveFilters={hasActiveFilters}
        onClose={onClose}
      />
    );
  }

  return (
    <>
      {/* Desktop sticky */}
      <div className="hidden md:block w-56 shrink-0">
        <div
          className="sticky top-0 rounded-2xl p-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <FilterContent
            filters={filters}
            onFilterChange={onFilterChange}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40 md:hidden"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 p-5 md:hidden overflow-y-auto"
              style={{ background: '#111111', borderRight: '1px solid rgba(255,255,255,0.08)' }}
            >
              <FilterContent
                filters={filters}
                onFilterChange={onFilterChange}
                hasActiveFilters={hasActiveFilters}
                onClose={onClose}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FilterSidebar;
