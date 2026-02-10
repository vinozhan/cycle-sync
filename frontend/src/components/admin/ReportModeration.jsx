import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HiExclamationTriangle } from 'react-icons/hi2';
import api from '../../services/api';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Pagination from '../common/Pagination';
import FilterPanel from '../common/FilterPanel';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import { SEVERITY_OPTIONS, REPORT_STATUS_OPTIONS } from '../../utils/constants';
import { getErrorMessage } from '../../utils/validators';

const ReportModeration = () => {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState({ open: false, report: null, status: '', notes: '' });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/reports', { params });
      setReports(res.data.data.items || []);
      setPagination(res.data.data.pagination);
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, [page, statusFilter]);

  const handleUpdateStatus = async () => {
    try {
      await api.patch(`/reports/${modal.report._id}/status`, {
        status: modal.status,
        adminNotes: modal.notes,
      });
      toast.success('Report status updated');
      setModal({ open: false, report: null, status: '', notes: '' });
      fetchReports();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const getSeverityColor = (severity) =>
    SEVERITY_OPTIONS.find((s) => s.value === severity)?.color || 'bg-gray-100 text-gray-800';

  const getStatusColor = (status) =>
    REPORT_STATUS_OPTIONS.find((s) => s.value === status)?.color || 'bg-gray-100 text-gray-800';

  if (loading) return <LoadingSpinner size="md" className="mt-8" />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Report Moderation</h2>
          <p className="mt-1 text-sm text-gray-500">Review and manage safety reports</p>
        </div>
        <FilterPanel>
          <FilterPanel.Select
            label="Status"
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setPage(1); }}
            options={REPORT_STATUS_OPTIONS}
            allLabel="All Statuses"
          />
        </FilterPanel>
      </div>

      <div className="mt-4 space-y-3">
        {reports.map((report) => (
          <div
            key={report._id}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <HiExclamationTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-medium text-gray-900">{report.title}</p>
                  <p className="mt-1 text-sm text-gray-500">{report.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className={`rounded-full px-2 py-0.5 ${getSeverityColor(report.severity)}`}>
                      {report.severity}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 ${getStatusColor(report.status)}`}>
                      {report.status?.replace('_', ' ')}
                    </span>
                    <span className="text-gray-400">
                      by {report.reportedBy?.firstName} &middot; {formatDate(report.createdAt)}
                    </span>
                  </div>
                  {report.adminNotes && (
                    <p className="mt-2 text-xs italic text-gray-400">
                      Admin: {report.adminNotes}
                    </p>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setModal({
                    open: true,
                    report,
                    status: report.status,
                    notes: report.adminNotes || '',
                  })
                }
              >
                Update
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Pagination pagination={pagination} onPageChange={setPage} />

      {/* Status Update Modal */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, report: null, status: '', notes: '' })}
        title="Update Report Status"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={modal.status}
              onChange={(e) => setModal({ ...modal, status: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            >
              {REPORT_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
            <textarea
              value={modal.notes}
              onChange={(e) => setModal({ ...modal, notes: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setModal({ open: false, report: null, status: '', notes: '' })}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReportModeration;
