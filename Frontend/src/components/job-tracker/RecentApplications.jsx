import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import StatusBadge from '../applications/StatusBadge';
import { formatRelativeTime } from '../../utils/formatters';

const RecentApplications = ({ applications = [], isLoading, onRowClick }) => {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-white">Recent Applications</p>
        <Link to="/job-tracker/applications">
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs">
            View All
            <ArrowRight size={12} />
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2.5">
              <div className="space-y-1.5">
                <div className="h-3.5 w-32 bg-white/8 rounded animate-pulse" />
                <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
              </div>
              <div className="h-6 w-20 bg-white/5 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-500">No applications yet</p>
          <p className="text-xs text-gray-600 mt-1">Add your first application to get started</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {applications.slice(0, 8).map((app) => (
            <motion.div
              key={app._id}
              whileHover={{ x: 2 }}
              transition={{ duration: 0.15 }}
              onClick={() => onRowClick(app._id)}
              className="flex items-center justify-between py-3 cursor-pointer hover:bg-white/[0.02] -mx-6 px-6 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{app.company}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{app.role}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <StatusBadge status={app.status} size="sm" />
                <span className="text-xs text-gray-600 hidden sm:block">
                  {app.appliedDate ? formatRelativeTime(app.appliedDate) : ''}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default RecentApplications;
