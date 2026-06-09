import { motion } from 'framer-motion';
import { GitBranch, RefreshCw, Loader2, Star, Code2 } from 'lucide-react';

const CATEGORY_COLOR = {
  ml:      'bg-purple-500/20 text-purple-300',
  web:     'bg-blue-500/20 text-blue-300',
  backend: 'bg-green-500/20 text-green-300',
  cli:     'bg-yellow-500/20 text-yellow-300',
  infra:   'bg-orange-500/20 text-orange-300',
  mobile:  'bg-pink-500/20 text-pink-300',
  other:   'bg-gray-500/20 text-gray-300',
};

const GitHubAnalysisCard = ({ analysis, loading, onAnalyze }) => {
  const isStale = analysis?.analyzedAt
    ? Date.now() - new Date(analysis.analyzedAt).getTime() > 6 * 24 * 60 * 60 * 1000
    : true;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          {analysis ? (
            <div className="text-sm text-gray-400">
              <span className="text-white font-medium">{analysis.username}</span>
              {' · '}
              <span className="text-violet-400">{analysis.repos?.length || 0} repos analyzed</span>
              {' · '}
              <span className={isStale ? 'text-yellow-400' : 'text-green-400'}>
                {isStale ? 'Stale (re-analyze for fresh data)' : 'Fresh'}
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              Deep-analyze your GitHub repositories so the AI can select the most relevant projects for each job.
            </p>
          )}
        </div>
        <button
          onClick={onAnalyze}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
        >
          {loading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <RefreshCw size={15} />
          )}
          {loading ? 'Analyzing…' : analysis ? 'Re-analyze' : 'Analyze Repos'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-3 py-6 text-gray-400">
          <Loader2 size={20} className="animate-spin text-violet-400" />
          <span className="text-sm">Fetching READMEs, language breakdowns, and dependencies… this takes ~30 seconds</span>
        </div>
      )}

      {analysis?.repos?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {analysis.repos.map((repo, i) => (
            <motion.div
              key={repo.name}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-gray-800 border border-gray-700 rounded-lg p-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <GitBranch size={14} className="text-gray-400 shrink-0" />
                  <span className="text-sm font-medium text-white truncate">{repo.name}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                  <Star size={11} />
                  {repo.stars || 0}
                </div>
              </div>

              {repo.summary && (
                <p className="text-xs text-gray-400 line-clamp-2">{repo.summary}</p>
              )}

              <div className="flex flex-wrap gap-1">
                {repo.category && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLOR[repo.category] || CATEGORY_COLOR.other}`}>
                    {repo.category}
                  </span>
                )}
                {(repo.skillTags || []).slice(0, 4).map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && !analysis && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <Code2 size={36} className="mb-3 opacity-30" />
          <p className="text-sm">Click "Analyze Repos" to get started</p>
        </div>
      )}
    </div>
  );
};

export default GitHubAnalysisCard;
