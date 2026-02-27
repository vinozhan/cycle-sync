import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { HiExclamationTriangle, HiMapPin, HiTrash, HiPencil, HiCheckCircle } from 'react-icons/hi2';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import toast from 'react-hot-toast';
import useReports from '../hooks/useReports';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { formatDate } from '../utils/formatters';
import { getErrorMessage } from '../utils/validators';
import { SEVERITY_OPTIONS, REPORT_STATUS_OPTIONS, REPORT_CATEGORIES, AUTO_RESOLVE_THRESHOLD, POINTS } from '../utils/constants';
import '../utils/leafletSetup';
import { hazardIcon } from '../utils/leafletSetup';

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { report, loading, fetchReport, deleteReport, confirmReport } = useReports();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

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

  const handleConfirm = async (status) => {
    setConfirmLoading(true);
    try {
      await confirmReport(id, status);
      await fetchReport(id);
      toast.success('Confirmation recorded');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setConfirmLoading(false);
    }
  };

  const confirmations = report?.confirmations || [];
  const stillExistsCount = confirmations.filter((c) => c.status === 'still_exists').length;
  const resolvedCount = confirmations.filter((c) => c.status === 'resolved').length;
  const userConfirmation = user
    ? confirmations.find((c) => (c.user?._id || c.user) === user._id)
    : null;
  const canConfirm =
    isAuthenticated &&
    !isOwner &&
    report?.status !== 'resolved' &&
    report?.status !== 'dismissed';

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

  const hasLocation = report.location?.lat && report.location?.lng;
  const markerPosition = hasLocation ? [report.location.lat, report.location.lng] : null;

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

      {/* Map */}
      {hasLocation && (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200">
          <MapContainer
            center={markerPosition}
            zoom={15}
            scrollWheelZoom={false}
            className="h-[300px] w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={markerPosition} icon={hazardIcon}>
              <Popup>
                <span className="font-medium">{report.title}</span>
                <br />
                <span className="text-xs capitalize text-gray-500">{report.severity} &middot; {getCategoryLabel(report.category)}</span>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      )}

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

        {hasLocation && (
          <p className="mt-1 text-xs text-gray-400">
            {report.location.lat.toFixed(6)}, {report.location.lng.toFixed(6)}
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

      {/* Community Confirmation */}
      {canConfirm && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">Community Verification</h3>
          <p className="mt-1 text-sm text-gray-500">Has this hazard been resolved?</p>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <HiExclamationTriangle className="h-5 w-5 text-amber-500" />
                <span className="text-2xl font-bold text-amber-700">{stillExistsCount}</span>
              </div>
              <p className="mt-1 text-sm text-amber-600">Still Exists</p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <HiCheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold text-green-700">{resolvedCount}</span>
              </div>
              <p className="mt-1 text-sm text-green-600">Resolved</p>
            </div>
          </div>

          {resolvedCount > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Auto-resolve progress</span>
                <span>{resolvedCount} / {AUTO_RESOLVE_THRESHOLD}</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${Math.min((resolvedCount / AUTO_RESOLVE_THRESHOLD) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <Button
              variant={userConfirmation?.status === 'still_exists' ? 'primary' : 'outline'}
              onClick={() => handleConfirm('still_exists')}
              loading={confirmLoading}
              disabled={confirmLoading}
              className="flex-1"
            >
              Still Exists
            </Button>
            <Button
              variant={userConfirmation?.status === 'resolved' ? 'primary' : 'outline'}
              onClick={() => handleConfirm('resolved')}
              loading={confirmLoading}
              disabled={confirmLoading}
              className="flex-1"
            >
              Mark Resolved
            </Button>
          </div>

          {userConfirmation && (
            <p className="mt-3 text-sm text-gray-600">
              <HiCheckCircle className="mr-1 inline h-4 w-4 text-emerald-500" />
              You confirmed: <span className="font-medium">{userConfirmation.status === 'still_exists' ? 'Still Exists' : 'Resolved'}</span>
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">+{POINTS.REPORT_CONFIRMED} points for community verification</p>
        </div>
      )}

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
