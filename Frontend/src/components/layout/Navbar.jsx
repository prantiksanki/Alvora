import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Menu, LogOut, Settings, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/settings': 'Settings',
  '/insights': 'AI Insights',
  '/contests': 'Contests',
  '/daily': 'Daily Problems',
  '/job-tracker': 'Job Tracker',
  '/job-tracker/applications': 'Applications',
  '/job-tracker/emails': 'Email Accounts',
  '/live-jobs': 'Live Jobs',
};

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const { unreadCount, notifications, fetchNotifications, markAllRead } = useNotifications();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/6 bg-black/90 backdrop-blur-md shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden text-[#9c9a8e] hover:text-[#E1E0CC] p-1.5 rounded-lg hover:bg-[#E1E0CC]/5 transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base font-semibold text-[#E1E0CC] hidden md:block">
          {PAGE_TITLES[pathname] || 'Alvora'}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen((v) => !v); if (!notifOpen) fetchNotifications(); }}
            className="relative text-[#9c9a8e] hover:text-[#E1E0CC] p-2 rounded-lg hover:bg-[#E1E0CC]/5 transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#c9b99a] text-[9px] font-bold text-[#0d0c09] flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 backdrop-blur-xl bg-[#0f0f0f]/95 border border-[#E1E0CC]/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#E1E0CC]/8">
                  <p className="text-sm font-semibold text-[#E1E0CC]">Notifications</p>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-[#c9b99a] hover:text-[#E1E0CC] flex items-center gap-1">
                      <Check size={11} /> Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-center py-6" style={{ color: '#6b6960' }}>No notifications yet</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n._id} className={`px-4 py-3 border-b border-[#E1E0CC]/5 last:border-0 ${!n.read ? 'bg-[#c9b99a]/5' : ''}`}>
                        <p className="text-sm text-[#E1E0CC]">{n.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#6b6960' }}>{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2.5 hover:bg-[#E1E0CC]/5 rounded-xl px-2 py-1.5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#c9b99a] flex items-center justify-center text-xs font-bold text-[#0d0c09]">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-[#E1E0CC] leading-tight">{user?.name}</p>
              <p className="text-xs leading-tight" style={{ color: '#9c9a8e' }}>{user?.email}</p>
            </div>
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-48 backdrop-blur-xl bg-[#0f0f0f]/95 border border-[#E1E0CC]/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50"
              >
                <button
                  onClick={() => { navigate('/settings'); setDropdownOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#b8b5a8] hover:text-[#E1E0CC] hover:bg-[#E1E0CC]/5 transition-colors"
                >
                  <Settings size={15} />
                  Settings
                </button>
                <div className="border-t border-[#E1E0CC]/8" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
