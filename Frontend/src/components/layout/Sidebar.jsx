import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, LogOut, CheckCircle2,
  BarChart2, FlaskConical, Trophy, CalendarCheck2, SlidersHorizontal,
  FolderKanban, ClipboardList, Inbox, RadioTower, FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEmails } from '../../hooks/useEmails';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard',     icon: BarChart2       },
  { path: '/insights',  label: 'Insights',      icon: FlaskConical    },
  { path: '/contests',  label: 'Contests',      icon: Trophy          },
  { path: '/daily',     label: 'Daily Problems',icon: CalendarCheck2  },
  { path: '/settings',  label: 'Settings',      icon: SlidersHorizontal },
  { type: 'section', label: 'Career' },
  { path: '/job-tracker',              label: 'Job Tracker',    icon: FolderKanban  },
  { path: '/job-tracker/applications', label: 'Applications',   icon: ClipboardList },
  { path: '/job-tracker/emails',       label: 'Email Accounts', icon: Inbox         },
  { type: 'section', label: 'Job Intel' },
  { path: '/live-jobs', label: 'Live Jobs',     icon: RadioTower },
  { path: '/resume',    label: 'Resume Tailor', icon: FileText   },
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
      className="hidden md:flex flex-col h-full border-r border-white/6 bg-black shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-white/6 px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.span
              key="logo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="text-lg font-bold text-white"
            >
              Alvora
            </motion.span>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className="text-gray-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors shrink-0"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          if (item.type === 'section') {
            return collapsed ? (
              <div key={`divider-${item.label}`} className="border-t border-white/6 mx-1 my-2" />
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
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-white/8 text-white'
                        : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
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
                        <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                        <span className="text-[11px] text-gray-600 truncate max-w-35">
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
      <div className="border-t border-white/6 p-3">
        <div className={`flex items-center gap-3 mb-2 px-1 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
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
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-colors text-sm ${collapsed ? 'justify-center' : ''}`}
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
