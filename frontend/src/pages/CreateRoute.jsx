import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useRoutes from '../hooks/useRoutes';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LocationPicker from '../components/common/LocationPicker';
import { DIFFICULTY_OPTIONS, SURFACE_OPTIONS } from '../utils/constants';
import { getErrorMessage } from '../utils/validators';

const CreateRoute = () => {
  const navigate = useNavigate();
  const { createRoute } = useRoutes();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'moderate',
    surfaceType: 'paved',
    distance: '',
    estimatedDuration: '',
    startPoint: ['', ''],
    endPoint: ['', ''],
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.startPoint[0] === '' || formData.startPoint[1] === '') {
      toast.error('Please select a start point on the map');
      return;
    }
    if (formData.endPoint[0] === '' || formData.endPoint[1] === '') {
      toast.error('Please select an end point on the map');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        surfaceType: formData.surfaceType,
        distance: formData.distance ? Number(formData.distance) : undefined,
        estimatedDuration: formData.estimatedDuration ? Number(formData.estimatedDuration) : undefined,
        startPoint: {
          type: 'Point',
          coordinates: formData.startPoint.map(Number),
        },
        endPoint: {
          type: 'Point',
          coordinates: formData.endPoint.map(Number),
        },
      };
      const route = await createRoute(payload);
      toast.success('Route created!');
      navigate(`/routes/${route._id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Create New Route</h1>

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

        {/* Start Point Map Picker */}
        <LocationPicker
          label="Start Point (search or click on map)"
          value={formData.startPoint}
          onChange={(coords) => setFormData({ ...formData, startPoint: coords })}
        />

        {/* End Point Map Picker */}
        <LocationPicker
          label="End Point (search or click on map)"
          value={formData.endPoint}
          onChange={(coords) => setFormData({ ...formData, endPoint: coords })}
        />

        <Button type="submit" loading={submitting} className="w-full">
          Create Route
        </Button>
      </form>
    </div>
  );
};

export default CreateRoute;
