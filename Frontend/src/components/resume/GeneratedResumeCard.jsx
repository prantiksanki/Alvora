import { motion } from 'framer-motion';
import { Download, Loader2, Sparkles, FileCheck, History, Clock } from 'lucide-react';

const ATSBadge = ({ score }) => {
  const color =
    score >= 80 ? 'text-green-400 border-green-500/40 bg-green-500/10' :
    score >= 60 ? 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10' :
                  'text-red-400 border-red-500/40 bg-red-500/10';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-bold border ${color}`}>
      {score}% ATS
    </span>
  );
};

const VersionRow = ({ resume, onDownload }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
    <div className="flex-1 min-w-0">
      <p className="text-sm text-white truncate">{resume.jobTitle || '—'}</p>
      <p className="text-xs text-gray-400">{resume.company || '—'} · <ATSBadge score={resume.atsScore || 0} /></p>
    </div>
    <div className="flex items-center gap-3 ml-4 shrink-0">
      <span className="text-xs text-gray-500 hidden sm:block">
        {new Date(resume.createdAt).toLocaleDateString()}
      </span>
      <button
        onClick={() => onDownload(resume._id)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
      >
        <Download size={12} />
        PDF
      </button>
    </div>
  </div>
);

const GeneratedResumeCard = ({ generatedResume, versions, loadingGenerate, loadingVersions, onGenerate, onDownload, jobDescription, canGenerate }) => (
  <div className="space-y-6">
    {/* Generate button */}
    <div className="flex flex-col items-start gap-4">
      <div className="text-sm text-gray-400">
        {canGenerate
          ? 'Everything is ready. Generate your tailored resume.'
          : 'Complete Steps 1–3 first (save resume, analyze GitHub, parse a job URL).'}
      </div>
      <button
        onClick={onGenerate}
        disabled={loadingGenerate || !canGenerate}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-lg transition-all"
      >
        {loadingGenerate ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Generating (this takes ~60s)…
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Generate Tailored Resume
          </>
        )}
      </button>

      {loadingGenerate && (
        <div className="text-xs text-gray-400 space-y-1">
          <p>· Matching your projects to job requirements…</p>
          <p>· Rewriting bullet points with ATS keywords…</p>
          <p>· Compiling LaTeX → PDF via Docker…</p>
        </div>
      )}
    </div>

    {/* Latest generated */}
    {generatedResume && (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-violet-900/30 to-indigo-900/30 border border-violet-500/30 rounded-xl p-5 space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileCheck size={18} className="text-violet-400" />
            <span className="font-semibold text-white">Resume Generated</span>
          </div>
          <ATSBadge score={generatedResume.atsScore || 0} />
        </div>

        <div className="text-sm text-gray-300">
          <span className="font-medium text-white">{generatedResume.jobTitle}</span>
          {generatedResume.company && <span className="text-gray-400"> at {generatedResume.company}</span>}
        </div>

        {generatedResume.selectedProjects?.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1.5">Projects Selected by AI</p>
            <div className="flex flex-wrap gap-1.5">
              {generatedResume.selectedProjects.map((name) => (
                <span key={name} className="text-xs px-2 py-0.5 bg-violet-500/20 text-violet-200 rounded-full">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => onDownload(generatedResume._id)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Download size={15} />
          {generatedResume.dockerUnavailable ? 'Download .tex (start Docker for PDF)' : 'Download PDF'}
        </button>
        {generatedResume.dockerUnavailable && (
          <p className="text-xs text-yellow-400">
            Docker Desktop is not running. Start it and regenerate to get a PDF.
          </p>
        )}
      </motion.div>
    )}

    {/* Version history */}
    {versions.length > 0 && (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <History size={15} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-300">Previous Resumes</h3>
        </div>
        <div className="bg-gray-800/60 border border-gray-700 rounded-xl px-4">
          {loadingVersions ? (
            <div className="py-6 flex justify-center">
              <Loader2 size={18} className="animate-spin text-gray-500" />
            </div>
          ) : (
            versions.map((v) => (
              <VersionRow key={v._id} resume={v} onDownload={onDownload} />
            ))
          )}
        </div>
      </div>
    )}
  </div>
);

export default GeneratedResumeCard;
