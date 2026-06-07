import { Pencil, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatShortDate, formatRelativeTime } from '../../utils/formatters';

const SkeletonCell = ({ width = 'w-24' }) => (
  <div className={`h-4 bg-white/8 rounded animate-pulse ${width}`} />
);

const ApplicationRow = ({ application, onClick, onEdit, onDelete, isLoading }) => {
  if (isLoading) {
    return (
      <tr className="border-b border-white/5">
        <td className="px-4 py-3"><SkeletonCell width="w-32" /></td>
        <td className="px-4 py-3"><SkeletonCell width="w-40" /></td>
        <td className="px-4 py-3"><SkeletonCell width="w-20" /></td>
        <td className="px-4 py-3"><SkeletonCell width="w-20" /></td>
        <td className="px-4 py-3"><SkeletonCell width="w-16" /></td>
        <td className="px-4 py-3"><SkeletonCell width="w-16" /></td>
        <td className="px-4 py-3" />
      </tr>
    );
  }

  return (
    <tr
      onClick={() => onClick(application._id)}
      className="border-b border-white/5 hover:bg-white/3 transition-colors cursor-pointer group"
    >
      {/* Company */}
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-white truncate max-w-[160px]">
          {application.company}
        </p>
      </td>

      {/* Role */}
      <td className="px-4 py-3">
        <p className="text-sm text-gray-300 truncate max-w-[180px]">{application.role}</p>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge status={application.status} />
      </td>

      {/* Applied Date */}
      <td className="px-4 py-3">
        <span className="text-sm text-gray-400">
          {application.appliedDate ? formatShortDate(application.appliedDate) : '—'}
        </span>
      </td>

      {/* Last Updated */}
      <td className="px-4 py-3">
        <span className="text-sm text-gray-500">
          {application.lastUpdated ? formatRelativeTime(application.lastUpdated) : '—'}
        </span>
      </td>

      {/* Source */}
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
          application.isManual
            ? 'bg-gray-400/10 text-gray-400 border-gray-400/20'
            : 'bg-violet-400/10 text-violet-400 border-violet-400/20'
        }`}>
          {application.isManual ? 'Manual' : 'Email'}
        </span>
      </td>

      {/* Actions (visible on row hover) */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(application); }}
            className="p-1.5 rounded-lg text-gray-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
            title="Edit"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(application._id); }}
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ApplicationRow;
