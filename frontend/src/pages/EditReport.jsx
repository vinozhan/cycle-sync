import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useReports from '../hooks/useReports';
import useAuth from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import LocationPicker from '../components/common/LocationPicker';
import { REPORT_CATEGORIES, SEVERITY_OPTIONS } from '../utils/constants';
import { getErrorMessage } from '../utils/validators';

const EditReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { report, loading, fetchReport, updateReport } = useReports();
  const { user, isAdmin } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'pothole',
    severity: 'medium',
    location: { lat: '', lng: '' },
  });

  useEffect(() => {
    fetchReport(id);
  }, [id, fetchReport]);

  useEffect(() => {
    if (report) {
      setFormData({
        title: report.title || '',
        description: report.description || '',
        category: report.category || 'pothole',
        severity: report.severity || 'medium',
        location: {
          lat: report.location?.lat || '',
          lng: report.location?.lng || '',
        },
      });
    }
  }, [report]);

  const isOwner = user && report?.reportedBy?._id === user._id;

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;

  if (report && !isOwner && !isAdmin) {
    navigate('/reports');
    return null;
  }

  if (report && report.status !== 'open') {
    navigate(`/reports/${id}`);
    toast.error('Can only edit reports with open status');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        severity: formData.severity,
        location: {
          lat: Number(formData.location.lat),
          lng: Number(formData.location.lng),
        },
      };
      await updateReport(id, payload);
      toast.success('Report updated!');
      navigate(`/reports/${id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Edit Report</h1>
      <p className="mt-1 text-sm text-gray-500">Update your safety report</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <Input
          label="Title"
          id="title"
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
        />

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            name="description"
            required
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            >
              {REPORT_CATEGORIES.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="severity" className="block text-sm font-medium text-gray-700">Severity</label>
            <select
              id="severity"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            >
              {SEVERITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <LocationPicker
          label="Hazard Location (search or click on map)"
          value={formData.location}
          onChange={(coords) => setFormData({ ...formData, location: coords })}
        />

        <div className="flex gap-3">
          <Button type="submit" loading={submitting} className="flex-1">
            Save Changes
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate(`/reports/${id}`)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditReport;
