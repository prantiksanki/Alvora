import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Code2, Trophy, BookOpen, Check, Flame, Star, Camera, User, MapPin, GraduationCap, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { formatLongDate } from '../utils/formatters';
import PageTransition from '../components/animations/PageTransition';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const PLATFORM_FIELDS = [
  { name: 'githubUsername',     label: 'GitHub',       placeholder: 'e.g. torvalds', icon: GitBranch, color: 'text-gray-300',   dot: 'bg-gray-400' },
  { name: 'leetcodeUsername',   label: 'LeetCode',     placeholder: 'e.g. neal_wu',  icon: Code2,     color: 'text-yellow-400', dot: 'bg-yellow-400' },
  { name: 'codeforcesUsername', label: 'Codeforces',   placeholder: 'e.g. tourist',  icon: Trophy,    color: 'text-blue-400',   dot: 'bg-blue-400' },
  { name: 'gfgUsername',        label: 'GeeksForGeeks',placeholder: 'e.g. username', icon: BookOpen,  color: 'text-green-400',  dot: 'bg-green-400' },
  { name: 'codechefUsername',   label: 'CodeChef',     placeholder: 'e.g. tourist',  icon: Flame,     color: 'text-orange-400', dot: 'bg-orange-400' },
  { name: 'atcoderUsername',    label: 'AtCoder',      placeholder: 'e.g. tourist',  icon: Star,      color: 'text-sky-300',    dot: 'bg-sky-300' },
];

const AVATAR_COLORS = [
  '#2563eb', '#7c3aed', '#db2777', '#dc2626',
  '#ea580c', '#ca8a04', '#16a34a', '#0891b2',
  '#475569', '#be185d',
];

function Section({ title, children }) {
  return (
    <div className="bg-[#111111] border border-white/6 rounded-2xl p-6">
      <p className="text-sm font-semibold text-white mb-5">{title}</p>
      {children}
    </div>
  );
}

function Field({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex items-center gap-2 w-36 shrink-0 pt-2.5">
        <Icon size={14} className="text-gray-500 shrink-0" />
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { profile, updateProfile, isLoading, isSaving } = useProfile();

  const [profileForm, setProfileForm] = useState({ name: '', bio: '', college: '', location: '', avatarColor: '#2563eb' });
  const [platformForm, setPlatformForm] = useState({ githubUsername: '', leetcodeUsername: '', codeforcesUsername: '', gfgUsername: '', codechefUsername: '', atcoderUsername: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        bio: user.bio || '',
        college: user.college || '',
        location: user.location || '',
        avatarColor: user.avatarColor || '#2563eb',
      });
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setPlatformForm({
        githubUsername: profile.githubUsername || '',
        leetcodeUsername: profile.leetcodeUsername || '',
        codeforcesUsername: profile.codeforcesUsername || '',
        gfgUsername: profile.gfgUsername || '',
        codechefUsername: profile.codechefUsername || '',
        atcoderUsername: profile.atcoderUsername || '',
      });
    }
  }, [profile]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateUser(profileForm);
      showToast('success', 'Profile updated successfully!');
    } catch {
      showToast('error', 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePlatforms = async (e) => {
    e.preventDefault();
    const result = await updateProfile(platformForm);
    if (result.success) {
      showToast('success', 'Profiles saved! Stats will update in a moment.');
    } else {
      showToast('error', result.error || 'Failed to save profiles');
    }
  };

  const initials = profileForm.name
    ? profileForm.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <PageTransition>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your profile and platform connections</p>
        </div>

        {/* Profile Section */}
        <Section title="Profile">
          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-6 pb-5 border-b border-white/5">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0 ring-4 ring-white/5"
                style={{ background: profileForm.avatarColor }}
              >
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Camera size={12} className="text-gray-500" />
                  <span className="text-xs text-gray-400 font-medium">Avatar Color</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setProfileForm((p) => ({ ...p, avatarColor: color }))}
                      className="w-7 h-7 rounded-full transition-transform hover:scale-110 ring-offset-2 ring-offset-[#111111]"
                      style={{
                        background: color,
                        outline: profileForm.avatarColor === color ? `2px solid ${color}` : '2px solid transparent',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Name */}
            <Field icon={User} label="Name">
              <Input
                value={profileForm.name}
                onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Your full name"
              />
            </Field>

            {/* Bio */}
            <Field icon={FileText} label="Bio">
              <textarea
                value={profileForm.bio}
                onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                placeholder="Tell others about yourself..."
                rows={3}
                maxLength={300}
                className="w-full bg-white/4 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-white/20 transition-colors"
              />
              <p className="text-[10px] text-gray-600 mt-1 text-right">{profileForm.bio.length}/300</p>
            </Field>

            {/* College */}
            <Field icon={GraduationCap} label="College">
              <Input
                value={profileForm.college}
                onChange={(e) => setProfileForm((p) => ({ ...p, college: e.target.value }))}
                placeholder="e.g. IIT Delhi"
              />
            </Field>

            {/* Location */}
            <Field icon={MapPin} label="Location">
              <Input
                value={profileForm.location}
                onChange={(e) => setProfileForm((p) => ({ ...p, location: e.target.value }))}
                placeholder="e.g. India"
              />
            </Field>

            {/* Account info row */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <div className="text-xs text-gray-600">
                <span className="text-gray-500">Email: </span>{user?.email}
                <span className="mx-3 text-gray-700">·</span>
                <span className="text-gray-500">Joined: </span>{formatLongDate(user?.createdAt || new Date())}
              </div>
              <Button type="submit" disabled={isSavingProfile}>
                {isSavingProfile ? 'Saving…' : <><Check size={14} /> Save Profile</>}
              </Button>
            </div>
          </form>
        </Section>

        {/* Platform Connections */}
        <Section title="Platform Connections">
          <p className="text-xs text-gray-500 mb-5 -mt-2">
            Stats are automatically synced every 6 hours once connected.
          </p>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-11 animate-pulse bg-white/5 rounded-xl" />
              ))}
            </div>
          ) : (
            <form onSubmit={handleSavePlatforms} className="space-y-4">
              {PLATFORM_FIELDS.map(({ name, label, placeholder, icon: Icon, color, dot }) => {
                const isConnected = platformForm[name]?.trim().length > 0;
                return (
                  <div key={name} className="flex items-center gap-4">
                    <div className="flex items-center gap-2.5 w-36 shrink-0">
                      <Icon size={15} className={color} />
                      <span className="text-sm text-gray-300">{label}</span>
                      <div className={`w-1.5 h-1.5 rounded-full ml-auto ${isConnected ? dot : 'bg-gray-700'}`} />
                    </div>
                    <Input
                      name={name}
                      value={platformForm[name]}
                      onChange={(e) => setPlatformForm((p) => ({ ...p, [name]: e.target.value }))}
                      placeholder={placeholder}
                      className="flex-1"
                    />
                  </div>
                );
              })}
              <div className="pt-2">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving…' : <><Check size={14} /> Save Connections</>}
                </Button>
              </div>
            </form>
          )}
        </Section>
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
