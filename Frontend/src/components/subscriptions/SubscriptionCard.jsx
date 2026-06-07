import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Edit2, Save, X, Plus, Tag } from 'lucide-react';
import CompanySelector from './CompanySelector';
import Button from '../ui/Button';

const TagInput = ({ label, value = [], onChange, placeholder }) => {
  const [input, setInput] = useState('');

  const addTag = () => {
    const tag = input.trim();
    if (!tag || value.includes(tag) || value.length >= 50) return;
    onChange([...value, tag]);
    setInput('');
  };

  const removeTag = (tag) => onChange(value.filter((t) => t !== tag));

  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2 block">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        <AnimatePresence mode="popLayout">
          {value.map((tag) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/15 rounded-lg text-xs text-gray-300"
            >
              {tag}
              <button onClick={() => removeTag(tag)} className="text-gray-500 hover:text-white transition-colors">
                <X size={9} />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          placeholder={placeholder}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition-all"
        />
        <button
          onClick={addTag}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
};

const SubscriptionCard = ({ subscription, onSave, isSaving }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    companies: [],
    roles: [],
    locations: [],
    notificationPreferences: { websocket: true, email: false, push: false },
  });

  useEffect(() => {
    if (subscription) {
      setDraft({
        companies: subscription.companies || [],
        roles: subscription.roles || [],
        locations: subscription.locations || [],
        notificationPreferences: {
          websocket: subscription.notificationPreferences?.websocket ?? true,
          email: subscription.notificationPreferences?.email ?? false,
          push: subscription.notificationPreferences?.push ?? false,
        },
      });
    }
  }, [subscription]);

  const handleSave = async () => {
    await onSave(draft);
    setEditing(false);
  };

  const handleCancel = () => {
    // Reset to current subscription
    if (subscription) {
      setDraft({
        companies: subscription.companies || [],
        roles: subscription.roles || [],
        locations: subscription.locations || [],
        notificationPreferences: {
          websocket: subscription.notificationPreferences?.websocket ?? true,
          email: subscription.notificationPreferences?.email ?? false,
          push: subscription.notificationPreferences?.push ?? false,
        },
      });
    }
    setEditing(false);
  };

  const totalTracked = (draft.companies?.length || 0);

  return (
    <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.07)' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
            <Bell size={14} className="text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Job Alerts</p>
            <p className="text-xs text-gray-500">
              {totalTracked > 0 ? `Tracking ${totalTracked} compan${totalTracked === 1 ? 'y' : 'ies'}` : 'No companies followed'}
            </p>
          </div>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <Edit2 size={14} />
          </button>
        ) : (
          <button onClick={handleCancel} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <X size={14} />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!editing ? (
          <motion.div
            key="view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {draft.companies.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-xs text-gray-600 mb-3">Follow companies to get instant job alerts</p>
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 mx-auto"
                >
                  <Plus size={11} /> Follow companies
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Companies */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 mb-2">Following</p>
                  <div className="flex flex-wrap gap-1.5">
                    {draft.companies.slice(0, 8).map((c) => (
                      <span key={c} className="px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 rounded-lg text-xs text-violet-300">
                        {c}
                      </span>
                    ))}
                    {draft.companies.length > 8 && (
                      <span className="px-2 py-0.5 bg-white/5 rounded-lg text-xs text-gray-500">
                        +{draft.companies.length - 8}
                      </span>
                    )}
                  </div>
                </div>
                {/* Role keywords */}
                {draft.roles.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600 mb-2">Role keywords</p>
                    <div className="flex flex-wrap gap-1.5">
                      {draft.roles.map((r) => (
                        <span key={r} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400">
                          <Tag size={9} />
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {/* Companies */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2 block">
                Companies to follow
              </label>
              <CompanySelector
                value={draft.companies}
                onChange={(v) => setDraft((p) => ({ ...p, companies: v }))}
              />
              <p className="text-[10px] text-gray-600 mt-1">Use the company's ATS slug (e.g. "stripe", "shopify")</p>
            </div>

            <TagInput
              label="Role keywords"
              value={draft.roles}
              onChange={(v) => setDraft((p) => ({ ...p, roles: v }))}
              placeholder="e.g. backend, internship..."
            />

            <TagInput
              label="Locations"
              value={draft.locations}
              onChange={(v) => setDraft((p) => ({ ...p, locations: v }))}
              placeholder="e.g. remote, san francisco..."
            />

            {/* Notification prefs */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2 block">
                Notifications
              </label>
              <label className="flex items-center justify-between py-1.5 cursor-pointer">
                <span className="text-sm text-gray-400">Real-time alerts</span>
                <div
                  onClick={() => setDraft((p) => ({
                    ...p,
                    notificationPreferences: {
                      ...p.notificationPreferences,
                      websocket: !p.notificationPreferences.websocket,
                    },
                  }))}
                  className={`w-10 h-5 rounded-full cursor-pointer transition-all duration-200 relative ${
                    draft.notificationPreferences.websocket ? 'bg-violet-600' : 'bg-white/10'
                  }`}
                >
                  <div
                    className="w-3.5 h-3.5 bg-white rounded-full absolute transition-all duration-200"
                    style={{ top: '3px', left: draft.notificationPreferences.websocket ? '22px' : '3px' }}
                  />
                </div>
              </label>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                className="flex-1"
              >
                {isSaving ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={12} />
                )}
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button onClick={handleCancel} variant="secondary" size="sm">
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubscriptionCard;
