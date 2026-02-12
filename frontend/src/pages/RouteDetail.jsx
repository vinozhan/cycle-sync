import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { HiStar, HiMapPin, HiTrash, HiPencil } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import useRoutes from '../hooks/useRoutes';
import useReviews from '../hooks/useReviews';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import RouteMap from '../components/routes/RouteMap';
import WeatherWidget from '../components/routes/WeatherWidget';
import { formatDate, formatDistance, formatDuration, formatRating } from '../utils/formatters';
import { getErrorMessage } from '../utils/validators';

const RouteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { route, loading, fetchRoute, deleteRoute } = useRoutes();
  const { reviews, fetchReviews, createReview, deleteReview } = useReviews();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [reviewDeleteId, setReviewDeleteId] = useState(null);

  useEffect(() => {
    fetchRoute(id);
    fetchReviews({ route: id, limit: 50 });
  }, [id, fetchRoute, fetchReviews]);

  const isOwner = user && route?.createdBy?._id === user._id;

  const handleDelete = async () => {
    try {
      await deleteRoute(id);
      toast.success('Route deleted');
      navigate('/routes');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleReviewDelete = async () => {
    try {
      await deleteReview(reviewDeleteId);
      toast.success('Review deleted');
      fetchReviews({ route: id, limit: 50 });
      fetchRoute(id);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setReviewDeleteId(null);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createReview({ route: id, ...reviewForm });
      toast.success('Review submitted! +10 points');
      setReviewForm({ rating: 5, comment: '' });
      fetchRoute(id);
      fetchReviews({ route: id, limit: 50 });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;
  if (!route) return <p className="py-20 text-center text-gray-500">Route not found.</p>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{route.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Created by {route.createdBy?.firstName} {route.createdBy?.lastName} &middot;{' '}
            {formatDate(route.createdAt)}
            {route.isVerified && (
              <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                Verified
              </span>
            )}
          </p>
        </div>
        {(isOwner || isAdmin) && (
          <div className="flex gap-2">
            <Link to={`/routes/${id}/edit`}>
              <Button variant="outline" size="sm">
                <HiPencil className="h-4 w-4" /> Edit
              </Button>
            </Link>
            <Button variant="danger" size="sm" onClick={() => setDeleteConfirm(true)}>
              <HiTrash className="h-4 w-4" /> Delete
            </Button>
          </div>
        )}
      </div>

      {/* Map */}
      <RouteMap route={route} className="mt-6" />

      {/* Weather Widget */}
      <div className="mt-4">
        <WeatherWidget routeId={id} />
      </div>

      {/* Details */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-gray-700">{route.description}</p>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <span className="text-xs text-gray-500">Difficulty</span>
            <p className="font-medium capitalize text-gray-900">{route.difficulty}</p>
          </div>
          {route.distance && (
            <div>
              <span className="text-xs text-gray-500">Distance</span>
              <p className="font-medium text-gray-900">{formatDistance(route.distance)}</p>
            </div>
          )}
          {route.estimatedDuration && (
            <div>
              <span className="text-xs text-gray-500">Duration</span>
              <p className="font-medium text-gray-900">{formatDuration(route.estimatedDuration)}</p>
            </div>
          )}
          <div>
            <span className="text-xs text-gray-500">Surface</span>
            <p className="font-medium capitalize text-gray-900">{route.surfaceType || 'N/A'}</p>
          </div>
        </div>

        {route.elevationGain > 0 && (
          <div className="mt-3">
            <span className="text-xs text-gray-500">Elevation Gain</span>
            <p className="font-medium text-gray-900">{route.elevationGain} m</p>
          </div>
        )}

        {route.averageRating > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <HiStar className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold">{formatRating(route.averageRating)}</span>
            <span className="text-sm text-gray-500">({route.reviewCount} reviews)</span>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-900">Reviews</h2>

        {isAuthenticated && (
          <form onSubmit={handleReviewSubmit} className="mt-4 rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, rating: n })}
                    className="transition-transform hover:scale-110"
                  >
                    <HiStar
                      className={`h-6 w-6 ${
                        n <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              placeholder="Share your experience..."
              rows={3}
              className="mt-3 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
            <Button type="submit" loading={submitting} className="mt-3">
              Submit Review
            </Button>
          </form>
        )}

        <div className="mt-4 space-y-3">
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500">No reviews yet. Be the first!</p>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {review.reviewer?.firstName} {review.reviewer?.lastName}
                    </span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <HiStar
                          key={n}
                          className={`h-3.5 w-3.5 ${
                            n <= review.rating ? 'text-yellow-400' : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    {review.isEdited && (
                      <span className="text-xs text-gray-400">(edited)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                    {user && (review.reviewer?._id === user._id || isAdmin) && (
                      <button
                        onClick={() => setReviewDeleteId(review._id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <HiTrash className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                {review.comment && (
                  <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Route"
        message="This will permanently delete this route and all associated data."
        confirmLabel="Delete Route"
      />

      <ConfirmDialog
        isOpen={!!reviewDeleteId}
        onClose={() => setReviewDeleteId(null)}
        onConfirm={handleReviewDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review?"
        confirmLabel="Delete Review"
      />
    </div>
  );
};

export default RouteDetail;
