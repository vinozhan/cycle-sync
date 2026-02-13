import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiPlus, HiExclamationTriangle, HiMapPin, HiPencil, HiTrash } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import useReports from '../hooks/useReports';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import FilterPanel from '../components/common/FilterPanel';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatDate } from '../utils/formatters';
import { getErrorMessage } from '../utils/validators';
import { SEVERITY_OPTIONS, REPORT_STATUS_OPTIONS, REPORT_CATEGORIES } from '../utils/constants';

const ReportsList = () => {
  const { reports, pagination, loading, fetchReports, deleteReport } = useReports();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ severity: '', status: '', page: 1 });
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const params = { page: filters.page };
    if (filters.severity) params.severity = filters.severity;
    if (filters.status) params.status = filters.status;
    fetchReports(params);
  }, [filters, fetchReports]);

  const getSeverityBadge = (severity) => {
    const opt = SEVERITY_OPTIONS.find((s) => s.value === severity);
    return opt ? opt.color : 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status) => {
    const opt = REPORT_STATUS_OPTIONS.find((s) => s.value === status);
    return opt ? opt.color : 'bg-gray-100 text-gray-800';
  };

  const getCategoryLabel = (category) => {
    return REPORT_CATEGORIES.find((c) => c.value === category)?.label || category;
  };

  const isOwner = (report) => user && report.reportedBy?._id === user._id;

  const handleDelete = async () => {
    try {
      await deleteReport(deleteId);
      toast.success('Report deleted');
      fetchReports({ page: filters.page, severity: filters.severity || undefined, status: filters.status || undefined });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Safety Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            Community-reported hazards and safety concerns
          </p>
        </div>
        {isAuthenticated && (
          <Link
            to="/reports/create"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <HiPlus className="h-4 w-4" /> New Report
          </Link>
        )}
      </div>

      {/* Filters */}
      <FilterPanel className="mt-6">
        <FilterPanel.Select
          label="Severity"
          value={filters.severity}
          onChange={(val) => setFilters({ ...filters, severity: val, page: 1 })}
          options={SEVERITY_OPTIONS}
          allLabel="All Severities"
        />
        <FilterPanel.Select
          label="Status"
          value={filters.status}
          onChange={(val) => setFilters({ ...filters, status: val, page: 1 })}
          options={REPORT_STATUS_OPTIONS}
          allLabel="All Statuses"
        />
      </FilterPanel>

      {/* Report cards */}
      {loading ? (
        <LoadingSpinner size="lg" className="mt-12" />
      ) : reports.length === 0 ? (
        <p className="mt-12 text-center text-gray-500">No reports found.</p>
      ) : (
        <>
          <div className="mt-6 space-y-3">
            {reports.map((report) => (
              <Link
                key={report._id}
                to={`/reports/${report._id}`}
                className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <HiExclamationTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{report.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{report.description}</p>

                      {report.location?.address && (
                        <p className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                          <HiMapPin className="h-3.5 w-3.5" /> {report.location.address}
                        </p>
                      )}

                      {report.route && (
                        <p className="mt-1 text-xs text-gray-400">
                          Route: {report.route.title || 'View Route'}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="flex-shrink-0 text-xs text-gray-400">{formatDate(report.createdAt)}</span>
                </div>
                <div className="mt-2 flex items-center text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                      {getCategoryLabel(report.category)}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 ${getSeverityBadge(report.severity)}`}>
                      {report.severity}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 ${getStatusBadge(report.status)}`}>
                      {report.status?.replace('_', ' ')}
                    </span>
                  </div>
                  {isAuthenticated && (isOwner(report) || isAdmin) && (
                    <div className="ml-auto flex items-center gap-1">
                      {isOwner(report) && report.status === 'open' && (
                        <button
                          onClick={(e) => { e.preventDefault(); navigate(`/reports/${report._id}/edit`); }}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-emerald-600"
                          title="Edit report"
                        >
                          <HiPencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.preventDefault(); setDeleteId(report._id); }}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                        title="Delete report"
                      >
                        <HiTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <Pagination
            pagination={pagination}
            onPageChange={(page) => setFilters({ ...filters, page })}
          />
        </>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Report"
        message="Are you sure you want to delete this report? This action cannot be undone."
        confirmLabel="Delete Report"
      />
    </div>
  );
};

export default ReportsList;
