import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, BarChart3, Sparkles, Briefcase, Settings } from 'lucide-react';

const TABS = [
  { path: '/dashboard',    label: 'Home',      icon: LayoutDashboard },
  { path: '/analytics',    label: 'Analytics', icon: BarChart3 },
  { path: '/insights',     label: 'Insights',  icon: Sparkles },
  { path: '/job-tracker',  label: 'Jobs',      icon: Briefcase },
  { path: '/settings',     label: 'Settings',  icon: Settings },
];

const MobileNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden h-16 bg-[#111118]/90 backdrop-blur-xl border-t border-white/8 flex items-center justify-around px-2 z-50">
      {TABS.map(({ path, label, icon: Icon }) => {
        const active = pathname === path;
        return (
          <Link key={path} to={path} className="flex-1">
            <motion.div
              whileTap={{ scale: 0.85 }}
              className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-colors ${
                active ? 'text-violet-400' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
              {active && (
                <motion.div
                  layoutId="mobile-active"
                  className="absolute bottom-2 w-1 h-1 rounded-full bg-violet-400"
                />
              )}
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileNav;
