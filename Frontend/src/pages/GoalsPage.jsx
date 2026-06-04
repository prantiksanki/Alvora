import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Target, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { goalsService } from '../services/goalsService';
import { formatLongDate } from '../utils/formatters';
import PageTransition from '../components/animations/PageTransition';
import FadeIn from '../components/animations/FadeIn';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ProgressBar from '../components/ui/ProgressBar';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';

const STATUS_BADGE = {
  active: 'active',
  completed: 'easy',
  behind: 'hard',
};

const STATUS_COLORS = {
  active: 'On Track',
  completed: 'Completed',
  behind: 'Behind',
};

const PROGRESS_COLORS = {
  active: 'violet',
  completed: 'emerald',
  behind: 'red',
};

const DEFAULT_FORM = { title: '', platform: 'leetcode', target: '', unit: 'problems', current: '0', deadline: '' };

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    goalsService.getGoals()
      .then(setGoals)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const activeGoals = goals.filter((g) => g.status !== 'completed');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  const handleAddGoal = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const created = await goalsService.createGoal({
        title: form.title,
        platform: form.platform,
        current: Number(form.current),
        target: Number(form.target),
        unit: form.unit,
        deadline: form.deadline || null,
        status: 'active',
      });
      setGoals((prev) => [created, ...prev]);
      setForm(DEFAULT_FORM);
      setShowModal(false);
    } catch {
      // keep modal open on error
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await goalsService.deleteGoal(id);
      setGoals((prev) => prev.filter((g) => g._id !== id));
    } catch {
      // silent
    }
  };

  const GoalCard = ({ goal }) => {
    const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
    return (
      <Card hover gradient>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-3">
            <p className="font-semibold text-white text-sm truncate">{goal.title}</p>
            {goal.deadline && (
              <p className="text-xs text-gray-500 mt-0.5">Due {formatLongDate(goal.deadline)}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={STATUS_BADGE[goal.status]}>{STATUS_COLORS[goal.status]}</Badge>
            <button
              onClick={() => handleDelete(goal._id)}
              className="text-gray-600 hover:text-red-400 transition-colors p-0.5"
              title="Delete goal"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Badge variant={goal.platform}>{goal.platform}</Badge>
        </div>

        <ProgressBar
          value={goal.current}
          max={goal.target}
          color={PROGRESS_COLORS[goal.status]}
          height="h-2"
          showPercent={false}
        />

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400">
            <span className="text-white font-medium">{goal.current.toLocaleString()}</span>
            {' / '}
            <span>{goal.target.toLocaleString()} {goal.unit}</span>
          </span>
          <span className="text-xs font-bold text-violet-400">{pct}%</span>
        </div>
      </Card>
    );
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Goals</h2>
            <p className="text-gray-400 text-sm mt-1">Track your coding milestones</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} />
            Add Goal
          </Button>
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <LoadingSkeleton.Card key={i} />)}
          </div>
        )}

        {/* Active goals */}
        {!isLoading && (
          <>
            <FadeIn stagger={0.06} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeGoals.map((goal) => (
                <FadeIn.Item key={goal._id}>
                  <GoalCard goal={goal} />
                </FadeIn.Item>
              ))}
            </FadeIn>

            {activeGoals.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 rounded-2xl bg-violet-500/10 mb-4">
                  <Target size={32} className="text-violet-400" />
                </div>
                <p className="text-white font-semibold mb-1">No active goals</p>
                <p className="text-gray-400 text-sm">Set a goal to stay motivated!</p>
              </div>
            )}

            {/* Completed goals accordion */}
            {completedGoals.length > 0 && (
              <div>
                <button
                  onClick={() => setShowCompleted((v) => !v)}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-3"
                >
                  {showCompleted ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  {completedGoals.length} Completed Goal{completedGoals.length !== 1 ? 's' : ''}
                </button>

                <AnimatePresence>
                  {showCompleted && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <FadeIn className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {completedGoals.map((goal) => (
                          <FadeIn.Item key={goal._id}>
                            <GoalCard goal={goal} />
                          </FadeIn.Item>
                        ))}
                      </FadeIn>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="w-full max-w-md backdrop-blur-xl bg-gray-900/95 border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Add New Goal</h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white p-1">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleAddGoal} className="space-y-4">
                  <Input
                    label="Goal Title"
                    name="title"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Reach 400 LeetCode solved"
                    required
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Platform</label>
                      <select
                        value={form.platform}
                        onChange={(e) => setForm((p) => ({ ...p, platform: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      >
                        <option value="leetcode">LeetCode</option>
                        <option value="codeforces">Codeforces</option>
                        <option value="github">GitHub</option>
                        <option value="gfg">GFG</option>
                      </select>
                    </div>
                    <Input
                      label="Unit"
                      name="unit"
                      value={form.unit}
                      onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
                      placeholder="problems"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Current"
                      name="current"
                      type="number"
                      value={form.current}
                      onChange={(e) => setForm((p) => ({ ...p, current: e.target.value }))}
                      placeholder="0"
                    />
                    <Input
                      label="Target"
                      name="target"
                      type="number"
                      value={form.target}
                      onChange={(e) => setForm((p) => ({ ...p, target: e.target.value }))}
                      placeholder="400"
                      required
                    />
                  </div>

                  <Input
                    label="Deadline (optional)"
                    name="deadline"
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
                  />

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={() => setShowModal(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSaving} className="flex-1">
                      {isSaving ? 'Saving…' : 'Save Goal'}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
