import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useRoutes from '../hooks/useRoutes';
import useAuth from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { DIFFICULTY_OPTIONS, SURFACE_OPTIONS } from '../utils/constants';
import { getErrorMessage } from '../utils/validators';

const EditRoute = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { route, loading, fetchRoute, updateRoute } = useRoutes();
  const { user, isAdmin } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'moderate',
    surfaceType: 'paved',
    distance: '',
    estimatedDuration: '',
  });

  useEffect(() => {
    fetchRoute(id);
  }, [id, fetchRoute]);

  useEffect(() => {
    if (route) {
      setFormData({
        title: route.title || '',
        description: route.description || '',
        difficulty: route.difficulty || 'moderate',
        surfaceType: route.surfaceType || 'paved',
        distance: route.distance || '',
        estimatedDuration: route.estimatedDuration || '',
      });
    }
  }, [route]);

  const isOwner = user && route?.createdBy?._id === user._id;

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;
  if (route && !isOwner && !isAdmin) {
    navigate('/routes');
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
        ...formData,
        distance: formData.distance ? Number(formData.distance) : undefined,
        estimatedDuration: formData.estimatedDuration ? Number(formData.estimatedDuration) : undefined,
      };
      await updateRoute(id, payload);
      toast.success('Route updated!');
      navigate(`/routes/${id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Edit Route</h1>

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
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
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
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">Difficulty</label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            >
              {DIFFICULTY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="surfaceType" className="block text-sm font-medium text-gray-700">Surface</label>
            <select
              id="surfaceType"
              name="surfaceType"
              value={formData.surfaceType}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            >
              {SURFACE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Distance (km)"
            id="distance"
            name="distance"
            type="number"
            step="0.1"
            min="0"
            value={formData.distance}
            onChange={handleChange}
          />
          <Input
            label="Duration (min)"
            id="estimatedDuration"
            name="estimatedDuration"
            type="number"
            min="0"
            value={formData.estimatedDuration}
            onChange={handleChange}
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" loading={submitting} className="flex-1">
            Save Changes
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate(`/routes/${id}`)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditRoute;
