import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pencil, Trash2, Mail, User, Tag, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from './StatusBadge';
import TimelineEvent from './TimelineEvent';
import { applicationService } from '../../services/applicationService';
import { formatLongDate, formatRelativeTime } from '../../utils/formatters';

const STATUS_VALUES = [
  'Applied', 'OA_Received', 'Interview_Scheduled', 'Next_Round',
  'Offer', 'Rejected', 'Withdrawn', 'Ghosted', 'Waitlist', 'Recruiter_Outreach',
];

const STATUS_LABELS = {
  Applied: 'Applied', OA_Received: 'OA Received', Interview_Scheduled: 'Interview Scheduled',
  Next_Round: 'Next Round', Offer: 'Offer', Rejected: 'Rejected',
  Withdrawn: 'Withdrawn', Ghosted: 'Ghosted', Waitlist: 'Waitlist',
  Recruiter_Outreach: 'Recruiter Outreach',
};

const ApplicationDrawer = ({ applicationId, onClose, onEdit, onDelete }) => {
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!applicationId) return;
    setIsLoading(true);
    setApplication(null);
    applicationService
      .getApplication(applicationId)
      .then(setApplication)
      .catch(() => toast.error('Failed to load application details'))
      .finally(() => setIsLoading(false));
  }, [applicationId]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (!application || isUpdating) return;
    setIsUpdating(true);
    try {
      const updated = await applicationService.updateApplication(application._id, { status: newStatus });
      setApplication((prev) => ({ ...prev, status: updated.status }));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!application) return;
    if (!window.confirm(`Delete application for ${application.company}?`)) return;
    try {
      await applicationService.deleteApplication(application._id);
      onDelete(application._id);
      onClose();
      toast.success('Application deleted');
    } catch {
      toast.error('Failed to delete application');
    }
  };

  const selectClasses =
    'bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all';

  return (
    <AnimatePresence>
      {applicationId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 bg-[#111118] border-l border-white/10 flex flex-col overflow-hidden"
          >
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">

              {/* Sticky header */}
              <div className="sticky top-0 bg-[#111118] border-b border-white/8 px-6 py-4 z-10">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {isLoading ? (
                      <>
                        <div className="h-6 w-40 bg-white/8 rounded animate-pulse mb-1.5" />
                        <div className="h-4 w-56 bg-white/5 rounded animate-pulse" />
                      </>
                    ) : application ? (
                      <>
                        <h2 className="text-xl font-bold text-white truncate">{application.company}</h2>
                        <p className="text-sm text-gray-400 mt-0.5 truncate">{application.role}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <StatusBadge status={application.status} />
                          {application.appliedDate && (
                            <span className="text-xs text-gray-500">
                              Applied {formatLongDate(application.appliedDate)}
                            </span>
                          )}
                        </div>
                      </>
                    ) : null}
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors shrink-0 mt-0.5"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {isLoading && (
                <div className="px-6 py-4 space-y-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-4 bg-white/5 rounded animate-pulse" style={{ width: `${60 + i * 10}%` }} />
                  ))}
                </div>
              )}

              {application && (
                <>
                  {/* Quick actions */}
                  <div className="px-6 py-3 border-b border-white/5 flex items-center gap-3 flex-wrap">
                    <select
                      value={application.status}
                      onChange={handleStatusChange}
                      disabled={isUpdating}
                      className={selectClasses}
                    >
                      {STATUS_VALUES.map((s) => (
                        <option key={s} value={s} className="bg-gray-900">
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => onEdit(application)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors"
                    >
                      <Pencil size={13} />
                      Edit
                    </button>

                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 border border-red-400/20 transition-colors ml-auto"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>

                  {/* Info grid */}
                  <div className="px-6 py-4 grid grid-cols-2 gap-4 border-b border-white/5">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-1">Applied</p>
                      <p className="text-sm text-gray-300">
                        {application.appliedDate ? formatLongDate(application.appliedDate) : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-1">Last Update</p>
                      <p className="text-sm text-gray-300">
                        {application.lastUpdated ? formatRelativeTime(application.lastUpdated) : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-1">Source</p>
                      <div className="flex items-center gap-1.5">
                        {application.isManual
                          ? <><User size={12} className="text-gray-400" /><span className="text-sm text-gray-300">Manual</span></>
                          : <><Mail size={12} className="text-violet-400" /><span className="text-sm text-gray-300">Email</span></>
                        }
                      </div>
                    </div>
                    {application.sourceEmail && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-1">From</p>
                        <p className="text-xs text-gray-400 truncate">{application.sourceEmail}</p>
                      </div>
                    )}
                    {application.recruiterName && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-1">Recruiter</p>
                        <p className="text-sm text-gray-300 truncate">{application.recruiterName}</p>
                      </div>
                    )}
                    {application.interviewDate && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-1">Interview</p>
                        <p className="text-sm text-gray-300">{formatLongDate(application.interviewDate)}</p>
                      </div>
                    )}
                    {application.oaDeadline && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-1">OA Deadline</p>
                        <p className="text-sm text-amber-400">{formatLongDate(application.oaDeadline)}</p>
                      </div>
                    )}
                    {application.meetingLink && (
                      <div className="col-span-2">
                        <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-1">Meeting Link</p>
                        <a
                          href={application.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-violet-400 hover:text-violet-300 truncate block"
                        >
                          {application.meetingLink}
                        </a>
                      </div>
                    )}
                    {/* AI extraction badge */}
                    {application.extractedBy === 'ai' && (
                      <div className="col-span-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-400/10 text-teal-400 border border-teal-400/20">
                          <Sparkles size={9} />
                          AI Extracted
                          {application.aiConfidence && (
                            <span className="text-teal-500">· {application.aiConfidence}% confident</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {application.tags && application.tags.length > 0 && (
                    <div className="px-6 py-4 border-b border-white/5">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Tag size={12} className="text-gray-500" />
                        <p className="text-[10px] uppercase tracking-wider text-gray-600">Tags</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {application.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-gray-400 border border-white/10"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="px-6 py-4 border-b border-white/5">
                    <p className="text-xs font-semibold text-white mb-2">Notes</p>
                    {application.notes ? (
                      <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">
                        {application.notes}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600 italic">No notes yet — edit to add some.</p>
                    )}
                  </div>

                  {/* Email timeline */}
                  <div className="px-6 py-4">
                    <p className="text-xs font-semibold text-white mb-4">Email History</p>
                    {application.emailEvents && application.emailEvents.length > 0 ? (
                      <div className="border-l-2 border-white/10 ml-1.5">
                        {application.emailEvents.map((event, idx) => (
                          <TimelineEvent
                            key={event._id || idx}
                            event={event}
                            isLast={idx === application.emailEvents.length - 1}
                            emailAccountId={application.emailAccountId}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-600 py-2">
                        <Mail size={14} />
                        <span>No emails tracked for this application</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ApplicationDrawer;
