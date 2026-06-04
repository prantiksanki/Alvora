import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';

const STATUS_VALUES = [
  'Applied', 'OA_Received', 'Interview_Scheduled', 'Next_Round',
  'Offer', 'Rejected', 'Withdrawn', 'Ghosted', 'Waitlist', 'Recruiter_Outreach',
];

const STATUS_LABELS = {
  Applied: 'Applied',
  OA_Received: 'OA Received',
  Interview_Scheduled: 'Interview Scheduled',
  Next_Round: 'Next Round',
  Offer: 'Offer',
  Rejected: 'Rejected',
  Withdrawn: 'Withdrawn',
  Ghosted: 'Ghosted',
  Waitlist: 'Waitlist',
  Recruiter_Outreach: 'Recruiter Outreach',
};

const DEFAULT_FORM = {
  company: '',
  role: '',
  status: 'Applied',
  appliedDate: '',
  notes: '',
  tags: '',
};

const ApplicationModal = ({ isOpen, mode = 'add', application = null, onClose, onSave }) => {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && application) {
        setForm({
          company: application.company || '',
          role: application.role || '',
          status: application.status || 'Applied',
          appliedDate: application.appliedDate
            ? new Date(application.appliedDate).toISOString().slice(0, 10)
            : '',
          notes: application.notes || '',
          tags: (application.tags || []).join(', '),
        });
      } else {
        setForm(DEFAULT_FORM);
      }
    }
  }, [isOpen, mode, application]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.company.trim() || !form.role.trim()) {
      toast.error('Company and role are required');
      return;
    }
    setIsSaving(true);
    try {
      const data = {
        company: form.company.trim(),
        role: form.role.trim(),
        status: form.status,
        appliedDate: form.appliedDate ? new Date(form.appliedDate).toISOString() : undefined,
        notes: form.notes.trim(),
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };
      await onSave(data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save application');
    } finally {
      setIsSaving(false);
    }
  };

  const selectClasses =
    'w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-lg backdrop-blur-xl bg-gray-900/95 border border-white/10 rounded-2xl p-6 shadow-2xl shadow-black/60"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-violet-500/15">
                    <Plus size={16} className="text-violet-400" />
                  </div>
                  <h2 className="text-base font-semibold text-white">
                    {mode === 'edit' ? 'Edit Application' : 'Add Application'}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Company + Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Company *"
                    placeholder="e.g. Google"
                    value={form.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    required
                  />
                  <Input
                    label="Role *"
                    placeholder="e.g. Software Engineer"
                    value={form.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    required
                  />
                </div>

                {/* Status + Applied Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                      className={selectClasses}
                    >
                      {STATUS_VALUES.map((s) => (
                        <option key={s} value={s} className="bg-gray-900">
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Applied Date</label>
                    <input
                      type="date"
                      value={form.appliedDate}
                      onChange={(e) => handleChange('appliedDate', e.target.value)}
                      className={`${selectClasses} [color-scheme:dark]`}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Referral, recruiter contact, interview notes..."
                    rows={3}
                    className={`${selectClasses} resize-none`}
                  />
                </div>

                {/* Tags */}
                <Input
                  label="Tags (comma-separated)"
                  placeholder="e.g. SWE, Internship, Remote"
                  value={form.tags}
                  onChange={(e) => handleChange('tags', e.target.value)}
                />

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Add Application'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ApplicationModal;
