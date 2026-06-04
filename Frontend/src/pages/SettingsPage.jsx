import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Code2, Trophy, BookOpen, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { formatLongDate } from '../utils/formatters';
import PageTransition from '../components/animations/PageTransition';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const PLATFORM_FIELDS = [
  { name: 'githubUsername', label: 'GitHub', placeholder: 'e.g. torvalds', icon: GitBranch, color: 'text-gray-300', dot: 'bg-gray-400' },
  { name: 'leetcodeUsername', label: 'LeetCode', placeholder: 'e.g. neal_wu', icon: Code2, color: 'text-yellow-400', dot: 'bg-yellow-400' },
  { name: 'codeforcesUsername', label: 'Codeforces', placeholder: 'e.g. tourist', icon: Trophy, color: 'text-blue-400', dot: 'bg-blue-400' },
  { name: 'gfgUsername', label: 'GeeksForGeeks', placeholder: 'e.g. username', icon: BookOpen, color: 'text-green-400', dot: 'bg-green-400' },
  { name: 'codechefUsername', label: 'CodeChef', placeholder: 'e.g. tourist', icon: Trophy, color: 'text-orange-400', dot: 'bg-orange-400' },
  { name: 'atcoderUsername', label: 'AtCoder', placeholder: 'e.g. tourist', icon: Code2, color: 'text-sky-300', dot: 'bg-sky-300' },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { profile, updateProfile, isLoading, isSaving } = useProfile();
  const [form, setForm] = useState({ githubUsername: '', leetcodeUsername: '', codeforcesUsername: '', gfgUsername: '', codechefUsername: '', atcoderUsername: '' });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (profile) {
      setForm({
        githubUsername: profile.githubUsername || '',
        leetcodeUsername: profile.leetcodeUsername || '',
        codeforcesUsername: profile.codeforcesUsername || '',
        gfgUsername: profile.gfgUsername || '',
        codechefUsername: profile.codechefUsername || '',
        atcoderUsername: profile.atcoderUsername || '',
      });
    }
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    const result = await updateProfile(form);
    if (result.success) {
      setToast({ type: 'success', message: 'Profiles saved! Stats will update in a moment.' });
    } else {
      setToast({ type: 'error', message: result.error || 'Failed to save profiles' });
    }
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <p className="text-gray-400 text-sm mt-1">Manage your account and platform connections</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account info */}
          <Card>
            <p className="text-sm font-semibold text-white mb-4">Account Info</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center text-lg font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-white">{user?.name}</p>
                  <p className="text-sm text-gray-400">{user?.email}</p>
                </div>
              </div>
              <div className="border-t border-white/8 pt-3 text-xs text-gray-500 space-y-1">
                <p>Member since: <span className="text-gray-300">{formatLongDate(user?.createdAt || new Date())}</span></p>
              </div>
            </div>
          </Card>

          {/* Appearance placeholder */}
          <Card>
            <p className="text-sm font-semibold text-white mb-4">Appearance</p>
            <div className="flex items-center justify-center h-20 text-center">
              <p className="text-sm text-gray-500">Theme & appearance settings<br />coming soon</p>
            </div>
          </Card>
        </div>

        {/* Platform connections */}
        <Card>
          <p className="text-sm font-semibold text-white mb-2">Platform Connections</p>
          <p className="text-xs text-gray-400 mb-6">
            Stats are automatically synced every 6 hours once connected.
          </p>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse bg-white/5 rounded-xl" />
              ))}
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              {PLATFORM_FIELDS.map(({ name, label, placeholder, icon: Icon, color, dot }) => {
                const isConnected = form[name]?.trim().length > 0;
                return (
                  <div key={name} className="flex items-center gap-4">
                    <div className="flex items-center gap-2.5 w-36 shrink-0">
                      <Icon size={16} className={color} />
                      <span className="text-sm text-gray-300">{label}</span>
                      <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? dot : 'bg-gray-600'}`} />
                    </div>
                    <Input
                      name={name}
                      value={form[name]}
                      onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))}
                      placeholder={placeholder}
                      className="flex-1"
                    />
                  </div>
                );
              })}

              <div className="pt-2">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving…' : (
                    <>
                      <Check size={15} />
                      Save Connections
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.25 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium shadow-xl ${
              toast.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/15 border-red-500/30 text-red-400'
            }`}
          >
            <Check size={15} />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
