import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { emailService } from '../../services/emailService';
import { formatRelativeTime } from '../../utils/formatters';

const TimelineEvent = ({ event, isLast = false, emailAccountId }) => {
  const [expanded, setExpanded] = useState(false);
  const [fullBody, setFullBody] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const canExpand = !!(event.snippet || (event.gmailMessageId && emailAccountId));

  const toggle = async () => {
    // Fetch full body on first expand
    if (!expanded && fullBody === null && event.gmailMessageId && emailAccountId) {
      setIsLoading(true);
      setExpanded(true);
      try {
        const { body } = await emailService.getEmailBody(emailAccountId, event.gmailMessageId);
        setFullBody(body || event.snippet || '');
      } catch {
        setFullBody(event.snippet || ''); // graceful fallback
      } finally {
        setIsLoading(false);
      }
    } else {
      setExpanded((v) => !v);
    }
  };

  return (
    <div className="relative pl-6 pb-4">
      {/* Vertical connector line */}
      {!isLast && (
        <div className="absolute left-[4px] top-3 bottom-0 w-px bg-white/10" />
      )}

      {/* Timeline dot */}
      <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-violet-500 border-2 border-[#111118]" />

      {/* Subject */}
      <p className="text-sm font-medium text-white leading-tight line-clamp-1">
        {event.emailSubject || '(No subject)'}
      </p>

      {/* Sender */}
      <p className="text-xs text-gray-400 mt-0.5 truncate">{event.emailSender}</p>

      {/* Status + timestamp + confidence */}
      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
        {event.detectedStatus && (
          <StatusBadge status={event.detectedStatus} size="sm" />
        )}
        <span className="text-xs text-gray-500">
          {event.receivedAt ? formatRelativeTime(event.receivedAt) : ''}
        </span>
        {typeof event.confidence === 'number' && event.confidence < 80 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20 font-medium">
            {event.confidence}% confident
          </span>
        )}
      </div>

      {/* Snippet preview (collapsed) or full body (expanded) */}
      {canExpand && (
        <>
          {/* Collapsed: show 2-line snippet */}
          {!expanded && event.snippet && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2 italic leading-relaxed">
              {event.snippet}
            </p>
          )}

          {/* Expanded: full body with smooth height animation */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <Loader2 size={12} className="animate-spin text-violet-400" />
                    <span>Loading email content...</span>
                  </div>
                ) : (
                  <div className="mt-2 rounded-lg overflow-hidden border border-white/10">
                    {fullBody && fullBody.trimStart().startsWith('<') ? (
                      // HTML email — render in a sandboxed iframe (white bg, scripts blocked)
                      <iframe
                        srcDoc={fullBody}
                        sandbox="allow-same-origin"
                        title="Email content"
                        className="w-full bg-white rounded-lg"
                        style={{ height: '320px', border: 'none', display: 'block' }}
                        onLoad={(e) => {
                          try {
                            const doc = e.target.contentDocument;
                            if (doc?.body) {
                              const h = Math.min(480, doc.body.scrollHeight + 24);
                              e.target.style.height = `${h}px`;
                            }
                          } catch {}
                        }}
                      />
                    ) : (
                      // Plain-text email
                      <div className="max-h-72 overflow-y-auto bg-white/3 p-3 pr-2">
                        <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {fullBody || event.snippet || '(No content available)'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle button */}
          <button
            onClick={toggle}
            className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-violet-400 hover:text-violet-300 transition-colors"
          >
            {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            {expanded ? 'Show less' : 'Show more'}
          </button>
        </>
      )}
    </div>
  );
};

export default TimelineEvent;
