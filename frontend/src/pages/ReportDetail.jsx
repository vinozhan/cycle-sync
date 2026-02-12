import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { HiExclamationTriangle, HiMapPin, HiTrash, HiPencil } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import useReports from '../hooks/useReports';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatDate } from '../utils/formatters';
import { getErrorMessage } from '../utils/validators';
import { SEVERITY_OPTIONS, REPORT_STATUS_OPTIONS, REPORT_CATEGORIES } from '../utils/constants';

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { report, loading, fetchReport, deleteReport } = useReports();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchReport(id);
  }, [id, fetchReport]);

  const isOwner = user && report?.reportedBy?._id === user._id;
  const canEdit = isOwner && report?.status === 'open';
  const canDelete = isOwner || isAdmin;

  const handleDelete = async () => {
    try {
      await deleteReport(id);
      toast.success('Report deleted');
      navigate('/reports');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

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

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;
  if (!report) return <p className="py-20 text-center text-gray-500">Report not found.</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <HiExclamationTriangle className="mt-1 h-6 w-6 flex-shrink-0 text-amber-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Reported by {report.reportedBy?.firstName} {report.reportedBy?.lastName} &middot;{' '}
              {formatDate(report.createdAt)}
            </p>
          </div>
        </div>
        {isAuthenticated && canDelete && (
          <div className="flex gap-2">
            {canEdit && (
              <Link to={`/reports/${id}/edit`}>
                <Button variant="outline" size="sm">
                  <HiPencil className="h-4 w-4" /> Edit
                </Button>
              </Link>
            )}
            <Button variant="danger" size="sm" onClick={() => setDeleteConfirm(true)}>
              <HiTrash className="h-4 w-4" /> Delete
            </Button>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-gray-700">{report.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
            {getCategoryLabel(report.category)}
          </span>
          <span className={`rounded-full px-3 py-1 text-sm ${getSeverityBadge(report.severity)}`}>
            {report.severity}
          </span>
          <span className={`rounded-full px-3 py-1 text-sm ${getStatusBadge(report.status)}`}>
            {report.status?.replace('_', ' ')}
          </span>
        </div>

        {report.location?.address && (
          <p className="mt-4 flex items-center gap-1 text-sm text-gray-500">
            <HiMapPin className="h-4 w-4" /> {report.location.address}
          </p>
        )}

        {report.route && (
          <p className="mt-2 text-sm text-gray-500">
            Route:{' '}
            <Link
              to={`/routes/${report.route._id || report.route}`}
              className="text-emerald-600 hover:underline"
            >
              {report.route.title || 'View Route'}
            </Link>
          </p>
        )}

        {report.adminNotes && (
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-800">Admin Notes</p>
            <p className="mt-1 text-sm text-blue-700">{report.adminNotes}</p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Link to="/reports" className="text-sm text-emerald-600 hover:underline">
          &larr; Back to Reports
        </Link>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Report"
        message="Are you sure you want to delete this report? This action cannot be undone."
        confirmLabel="Delete Report"
      />
    </div>
  );
};

export default ReportDetail;
