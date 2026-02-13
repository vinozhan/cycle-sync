import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiTrophy, HiMapPin, HiShieldCheck, HiStar, HiChartBar, HiPencil, HiFire, HiBolt } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import PointsBreakdownModal from '../components/common/PointsBreakdownModal';
import { formatDate, formatDateTime, formatDistance, formatDuration, formatRating, getInitials } from '../utils/formatters';
import { getErrorMessage } from '../utils/validators';
import { REWARD_TIERS } from '../utils/constants';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, setUser } = useAuth();
  const userId = id || currentUser?._id;
  const isOwnProfile = !id || id === currentUser?._id;

  const tabs = [
    { key: 'routes', label: 'Routes', icon: HiMapPin },
    { key: 'reports', label: 'Reports', icon: HiShieldCheck },
    { key: 'reviews', label: 'Reviews', icon: HiStar },
    ...(isOwnProfile ? [{ key: 'rides', label: 'Rides', icon: HiBolt }] : []),
  ];

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [activeTab, setActiveTab] = useState('routes');
  const [content, setContent] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [pointsModalOpen, setPointsModalOpen] = useState(false);

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', bio: '' });
  const [saving, setSaving] = useState(false);

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
        } else if (activeTab === 'rides') {
          res = await api.get('/rides', { params: { page } });
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

  const openEditModal = () => {
    setEditForm({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      bio: profile?.bio || '',
    });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/users/${userId}`, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        bio: editForm.bio,
      });
      const updatedUser = res.data.data.user;
      setProfile(updatedUser);
      if (isOwnProfile && setUser) {
        setUser(updatedUser);
      }
      toast.success('Profile updated');
      setEditOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;
  if (!profile) return <p className="py-20 text-center text-gray-500">User not found.</p>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="flex items-center gap-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700">
          {getInitials(profile.firstName, profile.lastName)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {profile.firstName} {profile.lastName}
            </h1>
            {isOwnProfile && (
              <button
                onClick={openEditModal}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <HiPencil className="h-4 w-4" />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Member since {formatDate(profile.createdAt)}
          </p>
          {profile.bio && (
            <p className="mt-1 text-sm text-gray-600">{profile.bio}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div
          onClick={() => setPointsModalOpen(true)}
          className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 text-center transition-colors hover:border-emerald-300"
        >
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
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <HiFire className="mx-auto h-6 w-6 text-orange-600" />
          <p className="mt-1 text-xl font-bold text-gray-900">{stats?.currentStreak || 0}</p>
          <p className="text-xs text-gray-500">Day Streak</p>
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
        ) : activeTab === 'rides' ? (
          content.map((ride) => {
            const statusColors = {
              completed: 'bg-green-100 text-green-800',
              cancelled: 'bg-red-100 text-red-800',
              active: 'bg-yellow-100 text-yellow-800',
            };
            return (
              <div key={ride._id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {ride.route ? (
                      <Link to={`/routes/${ride.route._id}`} className="font-medium text-emerald-600 hover:underline">
                        {ride.route.title}
                      </Link>
                    ) : (
                      <span className="font-medium text-gray-900">Unknown Route</span>
                    )}
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[ride.status] || 'bg-gray-100 text-gray-800'}`}>
                    {ride.status}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 sm:grid-cols-4">
                  <span>{formatDateTime(ride.startedAt || ride.createdAt)}</span>
                  {ride.distance != null && <span>{formatDistance(ride.distance)}</span>}
                  {ride.duration != null && <span>{formatDuration(ride.duration)}</span>}
                  {ride.co2Saved != null && <span>{ride.co2Saved.toFixed(2)} kg CO2</span>}
                </div>
                {ride.pointsEarned > 0 && (
                  <span className="mt-2 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    +{ride.pointsEarned} pts
                  </span>
                )}
              </div>
            );
          })
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

      {/* Edit Profile Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile">
        <div className="space-y-4">
          <Input
            label="First Name"
            id="editFirstName"
            value={editForm.firstName}
            onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
          />
          <Input
            label="Last Name"
            id="editLastName"
            value={editForm.lastName}
            onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
          />
          <div>
            <label htmlFor="editBio" className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              id="editBio"
              rows={3}
              maxLength={500}
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none"
            />
            <p className="mt-1 text-right text-xs text-gray-400">
              {editForm.bio.length} / 500
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSave} loading={saving}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      <PointsBreakdownModal
        isOpen={pointsModalOpen}
        onClose={() => setPointsModalOpen(false)}
        stats={stats}
        achievements={achievements}
      />
    </div>
  );
};

export default Profile;
