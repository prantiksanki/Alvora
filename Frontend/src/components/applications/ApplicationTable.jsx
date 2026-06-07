import { ChevronUp, ChevronDown, ChevronsUpDown, Briefcase } from 'lucide-react';
import ApplicationRow from './ApplicationRow';

const COLUMNS = [
  { key: 'company',     label: 'Company',      sortable: true  },
  { key: 'role',        label: 'Role',         sortable: true  },
  { key: 'status',      label: 'Status',       sortable: true  },
  { key: 'appliedDate', label: 'Applied',      sortable: true  },
  { key: 'lastUpdated', label: 'Updated',      sortable: false },
  { key: 'source',      label: 'Source',       sortable: false },
  { key: 'actions',     label: '',             sortable: false },
];

const SortIcon = ({ column, sortBy, sortOrder }) => {
  if (!column.sortable) return null;
  if (sortBy !== column.key) return <ChevronsUpDown size={12} className="text-gray-600" />;
  return sortOrder === 'asc'
    ? <ChevronUp size={12} className="text-violet-400" />
    : <ChevronDown size={12} className="text-violet-400" />;
};

const ApplicationTable = ({
  applications,
  isLoading,
  onRowClick,
  onEdit,
  onDelete,
  sortBy,
  sortOrder,
  onSort,
}) => {
  const handleSort = (column) => {
    if (!column.sortable) return;
    if (sortBy === column.key) {
      onSort(column.key, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(column.key, 'desc');
    }
  };

  const isEmpty = !isLoading && applications.length === 0;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px]">
        {/* Sticky header */}
        <thead>
          <tr className="border-b border-white/8 bg-white/2.5">
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col)}
                className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 select-none ${
                  col.sortable ? 'cursor-pointer hover:text-gray-300' : ''
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {col.label}
                  <SortIcon column={col} sortBy={sortBy} sortOrder={sortOrder} />
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <ApplicationRow key={i} isLoading />
              ))
            : isEmpty
            ? (
              <tr>
                <td colSpan={COLUMNS.length} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 rounded-2xl bg-white/5">
                      <Briefcase size={28} className="text-gray-600" />
                    </div>
                    <p className="text-gray-400 font-medium">No applications found</p>
                    <p className="text-gray-600 text-sm">Try adjusting your filters or add your first application</p>
                  </div>
                </td>
              </tr>
            )
            : applications.map((app) => (
              <ApplicationRow
                key={app._id}
                application={app}
                onClick={onRowClick}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          }
        </tbody>
      </table>
    </div>
  );
};

export default ApplicationTable;
