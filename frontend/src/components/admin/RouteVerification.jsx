import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiCheckCircle, HiMapPin } from 'react-icons/hi2';
import api from '../../services/api';
import Button from '../common/Button';
import Pagination from '../common/Pagination';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDate, formatDistance } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/validators';

const RouteVerification = () => {
  const [routes, setRoutes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/routes', { params: { page, limit: 10 } });
      setRoutes(res.data.data.items || []);
      setPagination(res.data.data.pagination);
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoutes(); }, [page]);

  const handleVerify = async (routeId) => {
    try {
      await api.patch(`/routes/${routeId}/verify`);
      toast.success('Route verified');
      fetchRoutes();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <LoadingSpinner size="md" className="mt-8" />;

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900">Route Verification</h2>
      <p className="mt-1 text-sm text-gray-500">Review and verify community-submitted routes</p>

      <div className="mt-4 space-y-3">
        {routes.map((route) => (
          <div
            key={route._id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="flex items-start gap-3">
              <HiMapPin className="mt-0.5 h-5 w-5 text-emerald-500" />
              <div>
                <Link
                  to={`/routes/${route._id}`}
                  className="font-medium text-gray-900 hover:text-emerald-600"
                >
                  {route.title}
                </Link>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                  <span className="capitalize">{route.difficulty}</span>
                  {route.distance && <span>{formatDistance(route.distance)}</span>}
                  <span>{route.reviewCount || 0} reviews</span>
                  <span>{formatDate(route.createdAt)}</span>
                </div>
              </div>
            </div>

            {route.isVerified ? (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                <HiCheckCircle className="h-4 w-4" /> Verified
              </span>
            ) : (
              <Button size="sm" onClick={() => handleVerify(route._id)}>
                Verify
              </Button>
            )}
          </div>
        ))}
      </div>

      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
};

export default RouteVerification;
