import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, Loader2, CheckCircle, Building2, Briefcase } from 'lucide-react';

const JobUrlInput = ({ jobDescription, loading, onScrape }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) onScrape(url.trim());
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Link size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://company.com/careers/job-id"
            className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
          {loading ? 'Parsing…' : 'Parse Job'}
        </button>
      </form>

      <p className="text-xs text-gray-500">
        Works with Greenhouse, Lever, Ashby, Workday, LinkedIn, and most company career pages.
      </p>

      {loading && (
        <div className="flex items-center gap-3 py-4 text-gray-400">
          <Loader2 size={18} className="animate-spin text-violet-400" />
          <span className="text-sm">Scraping page and extracting job requirements…</span>
        </div>
      )}

      {jobDescription && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3"
        >
          <div className="flex items-start gap-3">
            <Building2 size={18} className="text-violet-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold">{jobDescription.title || 'Unknown Title'}</p>
              <p className="text-sm text-gray-400">{jobDescription.company || 'Unknown Company'}</p>
            </div>
          </div>

          {jobDescription.structured && (
            <div className="space-y-2.5 pt-1">
              {jobDescription.structured.requiredSkills?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">Required Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {jobDescription.structured.requiredSkills.map((s) => (
                      <span key={s} className="text-xs px-2 py-0.5 bg-red-500/15 text-red-300 border border-red-500/20 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {jobDescription.structured.preferredSkills?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">Preferred Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {jobDescription.structured.preferredSkills.map((s) => (
                      <span key={s} className="text-xs px-2 py-0.5 bg-blue-500/15 text-blue-300 border border-blue-500/20 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {jobDescription.structured.atsKeywords?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">ATS Keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {jobDescription.structured.atsKeywords.slice(0, 12).map((k) => (
                      <span key={k} className="text-xs px-2 py-0.5 bg-violet-500/15 text-violet-300 border border-violet-500/20 rounded-full">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 text-xs pt-1">
                {jobDescription.structured.roleType && (
                  <span className="text-gray-400">Role: <span className="text-gray-200 capitalize">{jobDescription.structured.roleType}</span></span>
                )}
                {jobDescription.structured.seniorityLevel && (
                  <span className="text-gray-400">Level: <span className="text-gray-200 capitalize">{jobDescription.structured.seniorityLevel}</span></span>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default JobUrlInput;
