import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useReports from '../hooks/useReports';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LocationPicker from '../components/common/LocationPicker';
import { REPORT_CATEGORIES, SEVERITY_OPTIONS } from '../utils/constants';
import { getErrorMessage } from '../utils/validators';

const CreateReport = () => {
  const navigate = useNavigate();
  const { createReport } = useReports();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'pothole',
    severity: 'medium',
    location: { lat: '', lng: '' },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.location.lat || !formData.location.lng) {
      toast.error('Please select a location on the map');
      return;
    }

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
      await createReport(payload);
      toast.success('Report submitted! +5 points');
      navigate('/reports');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Submit Safety Report</h1>
      <p className="mt-1 text-sm text-gray-500">Help fellow cyclists stay safe</p>

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

        {/* Location Map Picker */}
        <LocationPicker
          label="Hazard Location (search or click on map)"
          value={formData.location}
          onChange={(coords) => setFormData({ ...formData, location: coords })}
        />

        <Button type="submit" loading={submitting} className="w-full">
          Submit Report
        </Button>
      </form>
    </div>
  );
};

export default CreateReport;
