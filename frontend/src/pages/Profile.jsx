import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { HiTrophy, HiMapPin, HiShieldCheck, HiStar, HiChartBar } from 'react-icons/hi2';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import { formatDate, formatDistance, formatRating } from '../utils/formatters';
import { REWARD_TIERS } from '../utils/constants';
import { getInitials } from '../utils/formatters';

const tabs = [
  { key: 'routes', label: 'Routes', icon: HiMapPin },
  { key: 'reports', label: 'Reports', icon: HiShieldCheck },
  { key: 'reviews', label: 'Reviews', icon: HiStar },
];

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const userId = id || currentUser?._id;

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [activeTab, setActiveTab] = useState('routes');
  const [content, setContent] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [userRes, statsRes, achievementsRes] = await Promise.all([
          api.get(`/users/${userId}`),
          api.get(`/users/${userId}/stats`),
          api.get(`/users/${userId}/achievements`),
        ]);
        setProfile(userRes.data.data.user);
        setStats(statsRes.data.data.stats);
        setAchievements(achievementsRes.data.data.achievements || []);
      } catch {
        // Silently handle
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const fetchContent = async () => {
      try {
        let res;
        if (activeTab === 'routes') {
          res = await api.get('/routes', { params: { createdBy: userId, page } });
        } else if (activeTab === 'reports') {
          res = await api.get('/reports', { params: { reportedBy: userId, page } });
        } else {
          res = await api.get('/reviews', { params: { reviewer: userId, page } });
        }
        setContent(res.data.data.items || []);
        setPagination(res.data.data.pagination);
      } catch {
        setContent([]);
      }
    };
    fetchContent();
  }, [userId, activeTab, page]);

  const getTierColor = (tier) =>
    REWARD_TIERS.find((t) => t.value === tier)?.color || 'text-gray-500';

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;
  if (!profile) return <p className="py-20 text-center text-gray-500">User not found.</p>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="flex items-center gap-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-700">
          {getInitials(profile.firstName, profile.lastName)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="text-sm text-gray-500">
            Member since {formatDate(profile.createdAt)}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <HiChartBar className="mx-auto h-6 w-6 text-emerald-600" />
          <p className="mt-1 text-xl font-bold text-gray-900">{profile.totalPoints || 0}</p>
          <p className="text-xs text-gray-500">Points</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <HiMapPin className="mx-auto h-6 w-6 text-blue-600" />
          <p className="mt-1 text-xl font-bold text-gray-900">{stats?.routesCreated || 0}</p>
          <p className="text-xs text-gray-500">Routes</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <HiShieldCheck className="mx-auto h-6 w-6 text-amber-600" />
          <p className="mt-1 text-xl font-bold text-gray-900">{stats?.reportsSubmitted || 0}</p>
          <p className="text-xs text-gray-500">Reports</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <HiStar className="mx-auto h-6 w-6 text-purple-600" />
          <p className="mt-1 text-xl font-bold text-gray-900">{stats?.reviewsWritten || 0}</p>
          <p className="text-xs text-gray-500">Reviews</p>
        </div>
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-900">Achievements</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {achievements.map((reward) => (
              <div
                key={reward._id}
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5"
              >
                <HiTrophy className={`h-4 w-4 ${getTierColor(reward.tier)}`} />
                <span className="text-sm font-medium text-gray-700">{reward.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content tabs */}
      <div className="mt-8 flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setPage(1); }}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-4 space-y-3">
        {content.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">No {activeTab} yet.</p>
        ) : (
          content.map((item) => (
            <div
              key={item._id}
              className="rounded-lg border border-gray-200 bg-white p-4"
            >
              <p className="font-medium text-gray-900">{item.title || item.comment || 'Untitled'}</p>
              <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                {item.difficulty && <span className="capitalize">{item.difficulty}</span>}
                {item.rating && (
                  <span className="flex items-center gap-0.5">
                    <HiStar className="h-3 w-3 text-yellow-500" /> {formatRating(item.rating)}
                  </span>
                )}
                {item.severity && <span className="capitalize">{item.severity}</span>}
                {item.distance && <span>{formatDistance(item.distance)}</span>}
                <span>{formatDate(item.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
};

export default Profile;
