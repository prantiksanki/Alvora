import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, BarChart3, Target, Settings, ChevronLeft, ChevronRight, LogOut, Sparkles, Swords, Calendar, Briefcase, LayoutGrid, Mail, CheckCircle, Zap, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEmails } from '../../hooks/useEmails';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { path: '/analytics', label: 'Analytics',    icon: BarChart3 },
  { path: '/insights',  label: 'Insights',     icon: Sparkles },
  { path: '/contests',  label: 'Contests',     icon: Swords },
  { path: '/daily',     label: 'Daily Problems', icon: BookOpen },
  { path: '/goals',     label: 'Goals',        icon: Target },
  { path: '/year',      label: 'Year in Code', icon: Calendar },
  { path: '/settings',  label: 'Settings',     icon: Settings },
  // Career section sentinel
  { type: 'section', label: 'Career' },
  { path: '/job-tracker',              label: 'Job Tracker',    icon: Briefcase  },
  { path: '/job-tracker/applications', label: 'Applications',   icon: LayoutGrid },
  { path: '/job-tracker/emails',       label: 'Email Accounts', icon: Mail       },
  // Job Intel section
  { type: 'section', label: 'Job Intel' },
  { path: '/live-jobs', label: 'Live Jobs', icon: Zap },
];

const Sidebar = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { accounts } = useEmails();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="hidden md:flex flex-col h-full border-r border-white/8 bg-[#111118] shrink-0 overflow-hidden"
    >
      {/* Logo area */}
      <div className={`flex items-center h-16 border-b border-white/8 px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.span
              key="logo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="text-lg font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent"
            >
              Alvora
            </motion.span>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors shrink-0"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          // Section header sentinel
          if (item.type === 'section') {
            return collapsed ? (
              <div key={`divider-${item.label}`} className="border-t border-white/8 mx-1 my-2" />
            ) : (
              <motion.div
                key={`section-${item.label}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-3 pt-4 pb-1"
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-600">
                  {item.label}
                </p>
              </motion.div>
            );
          }

          const { path, label, icon: Icon } = item;
          return (
            <div key={path}>
              <NavLink to={path}>
                {({ isActive }) => (
                  <motion.div
                    whileHover={{ x: collapsed ? 0 : 2 }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 border-l-2 ${
                      isActive
                        ? 'bg-violet-500/15 text-violet-400 border-violet-500'
                        : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent'
                    } ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? label : undefined}
                  >
                    <Icon size={18} className="shrink-0" />
                    <AnimatePresence mode="wait">
                      {!collapsed && (
                        <motion.span
                          key={label}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          transition={{ duration: 0.15 }}
                          className="text-sm font-medium whitespace-nowrap"
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </NavLink>

              {/* Connected email accounts shown under Email Accounts nav item */}
              {path === '/job-tracker/emails' && !collapsed && accounts.length > 0 && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-4 mt-0.5 space-y-0.5"
                  >
                    {accounts.map((account) => (
                      <div
                        key={account._id}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                        title={account.emailAddress}
                      >
                        <CheckCircle size={11} className="text-emerald-400 shrink-0" />
                        <span className="text-[11px] text-gray-500 truncate max-w-[140px]">
                          {account.emailAddress}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom user section */}
      <div className="border-t border-white/8 p-3">
        <div className={`flex items-center gap-3 mb-2 px-1 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {initials}
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                key="user-info"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-colors text-sm ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Sign out' : undefined}
        >
          <LogOut size={16} />
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                key="logout-label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
