import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, GitBranch, Link, Sparkles, Check } from 'lucide-react';

import { useResume } from '../hooks/useResume';
import MasterResumeUpload  from '../components/resume/MasterResumeUpload';
import GitHubAnalysisCard  from '../components/resume/GitHubAnalysisCard';
import JobUrlInput         from '../components/resume/JobUrlInput';
import GeneratedResumeCard from '../components/resume/GeneratedResumeCard';

const STEPS = [
  { id: 1, label: 'Master Resume', icon: FileText,  description: 'Upload your full resume once' },
  { id: 2, label: 'GitHub Analysis', icon: GitBranch, description: 'Deep-scan your repositories' },
  { id: 3, label: 'Job URL',       icon: Link,     description: 'Paste any job posting URL' },
  { id: 4, label: 'Generate',      icon: Sparkles, description: 'AI tailors + compiles PDF' },
];

const StepIndicator = ({ steps, current, completed, onSelect }) => (
  <div className="flex gap-2 sm:gap-4 mb-8 overflow-x-auto pb-1">
    {steps.map((step) => {
      const done   = completed.has(step.id);
      const active = current === step.id;
      const Icon   = step.icon;
      return (
        <button
          key={step.id}
          onClick={() => onSelect(step.id)}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap
            ${active  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : ''}
            ${done && !active ? 'bg-gray-800 text-green-400 border border-green-500/30' : ''}
            ${!active && !done ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : ''}
          `}
        >
          {done && !active ? <Check size={14} className="shrink-0" /> : <Icon size={14} className="shrink-0" />}
          <span className="hidden sm:block">{step.label}</span>
          <span className="block sm:hidden">{step.id}</span>
        </button>
      );
    })}
  </div>
);

const ResumeTailorPage = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const {
    masterResume, githubAnalysis, jobDescription, generatedResume, versions,
    loadingMaster, loadingGithub, loadingJob, loadingGenerate, loadingVersions,
    fetchMasterResume, saveMasterResume,
    fetchGitHubAnalysis, analyzeGitHub,
    scrapeJob, generateResume,
    fetchVersions, downloadResume,
  } = useResume();

  useEffect(() => {
    fetchMasterResume();
    fetchGitHubAnalysis();
    fetchVersions();
  }, []);

  useEffect(() => {
    const c = new Set();
    if (masterResume)   c.add(1);
    if (githubAnalysis) c.add(2);
    if (jobDescription) c.add(3);
    if (generatedResume) c.add(4);
    setCompletedSteps(c);
  }, [masterResume, githubAnalysis, jobDescription, generatedResume]);

  const handleSaveMaster = async (text) => {
    await saveMasterResume(text);
    setActiveStep(2);
  };

  const handleAnalyzeGitHub = async () => {
    await analyzeGitHub();
    setActiveStep(3);
  };

  const handleScrapeJob = async (url) => {
    await scrapeJob(url);
    setActiveStep(4);
  };

  const handleGenerate = async () => {
    if (!jobDescription?._id) return;
    await generateResume(jobDescription._id);
    await fetchVersions();
  };

  const canGenerate = !!(masterResume && githubAnalysis && jobDescription);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">AI Resume Tailor</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Paste a job URL — the AI selects your best matching projects from GitHub and generates a PDF resume tailored for ATS.
          </p>
        </div>

        <StepIndicator
          steps={STEPS}
          current={activeStep}
          completed={completedSteps}
          onSelect={setActiveStep}
        />

        {/* Step panels */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
          >
            {/* Step header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center">
                {(() => { const Icon = STEPS[activeStep - 1].icon; return <Icon size={16} className="text-violet-400" />; })()}
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">{STEPS[activeStep - 1].label}</h2>
                <p className="text-xs text-gray-400">{STEPS[activeStep - 1].description}</p>
              </div>
            </div>

            {activeStep === 1 && (
              <MasterResumeUpload
                masterResume={masterResume}
                loading={loadingMaster}
                onSave={handleSaveMaster}
              />
            )}

            {activeStep === 2 && (
              <GitHubAnalysisCard
                analysis={githubAnalysis}
                loading={loadingGithub}
                onAnalyze={handleAnalyzeGitHub}
              />
            )}

            {activeStep === 3 && (
              <JobUrlInput
                jobDescription={jobDescription}
                loading={loadingJob}
                onScrape={handleScrapeJob}
              />
            )}

            {activeStep === 4 && (
              <GeneratedResumeCard
                generatedResume={generatedResume}
                versions={versions}
                loadingGenerate={loadingGenerate}
                loadingVersions={loadingVersions}
                onGenerate={handleGenerate}
                onDownload={downloadResume}
                jobDescription={jobDescription}
                canGenerate={canGenerate}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Quick-nav next step hint */}
        {activeStep < 4 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setActiveStep((s) => Math.min(s + 1, 4))}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Skip to Step {activeStep + 1} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeTailorPage;
