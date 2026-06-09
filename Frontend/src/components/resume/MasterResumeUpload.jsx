import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Loader2 } from 'lucide-react';

const MasterResumeUpload = ({ masterResume, loading, onSave }) => {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (masterResume?.rawText) setText(masterResume.rawText);
  }, [masterResume]);

  const handleSave = async () => {
    await onSave(text);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const contact = masterResume?.structured?.contactInfo;
  const projectCount = masterResume?.structured?.projects?.length || 0;
  const expCount = masterResume?.structured?.experience?.length || 0;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Paste your resume (plain text or LaTeX)
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your entire resume here — education, experience, projects, skills..."
          className="w-full h-64 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-gray-200 placeholder-gray-500 resize-y focus:outline-none focus:border-violet-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          The AI will parse your resume to extract structured data. Education and experience are kept exactly as-is; projects and skills are enhanced per job.
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={loading || !text.trim()}
        className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : saved ? (
          <CheckCircle size={16} className="text-green-400" />
        ) : (
          <FileText size={16} />
        )}
        {loading ? 'Parsing…' : saved ? 'Saved!' : 'Parse & Save Resume'}
      </button>

      {masterResume && contact && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/60 border border-gray-700 rounded-lg p-4 space-y-2"
        >
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Parsed Preview</p>
          {contact.name && (
            <p className="text-white font-semibold">{contact.name}</p>
          )}
          <div className="flex flex-wrap gap-2 text-xs text-gray-400">
            {contact.email && <span>{contact.email}</span>}
            {contact.github && <span>GitHub: {contact.github}</span>}
          </div>
          <div className="flex gap-4 text-xs text-gray-400 pt-1">
            <span className="text-violet-400 font-medium">{expCount} Experience{expCount !== 1 ? 's' : ''}</span>
            <span className="text-violet-400 font-medium">{projectCount} Project{projectCount !== 1 ? 's' : ''}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MasterResumeUpload;
