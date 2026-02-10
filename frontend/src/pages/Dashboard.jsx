import { useEffect, useState } from 'react';
import { HiTrophy, HiMapPin, HiShieldCheck, HiStar, HiChartBar } from 'react-icons/hi2';
import useAuth from '../hooks/useAuth';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDistance } from '../utils/formatters';
import { REWARD_TIERS } from '../utils/constants';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, achievementsRes] = await Promise.all([
          api.get(`/users/${user._id}/stats`),
          api.get(`/users/${user._id}/achievements`),
        ]);
        setStats(statsRes.data.data.stats);
        setAchievements(achievementsRes.data.data.achievements || []);
      } catch {
        // Silently handle
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  if (loading) return <LoadingSpinner size="lg" className="min-h-screen" />;

  const statCards = [
    { label: 'Total Points', value: user?.totalPoints || 0, icon: HiChartBar, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Routes Created', value: stats?.routesCreated || 0, icon: HiMapPin, color: 'text-blue-600 bg-blue-50' },
    { label: 'Reports Filed', value: stats?.reportsSubmitted || 0, icon: HiShieldCheck, color: 'text-amber-600 bg-amber-50' },
    { label: 'Reviews Written', value: stats?.reviewsWritten || 0, icon: HiStar, color: 'text-purple-600 bg-purple-50' },
    { label: 'Total Distance', value: formatDistance(stats?.totalDistance || 0), icon: HiMapPin, color: 'text-teal-600 bg-teal-50' },
    { label: 'Achievements', value: achievements.length, icon: HiTrophy, color: 'text-yellow-600 bg-yellow-50' },
  ];

  const getTierColor = (tier) => {
    return REWARD_TIERS.find((t) => t.value === tier)?.color || 'text-gray-600';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">
        Welcome, {user?.firstName}!
      </h1>
      <p className="mt-1 text-sm text-gray-500">Your cycling dashboard</p>

      {/* Stats Grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="mt-10">
        <h2 className="text-lg font-bold text-gray-900">Achievements</h2>
        {achievements.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">
            No achievements yet. Start contributing to earn badges!
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((reward) => (
              <div
                key={reward._id}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <HiTrophy className={`h-8 w-8 ${getTierColor(reward.tier)}`} />
                <div>
                  <p className="font-medium text-gray-900">{reward.name}</p>
                  <p className="text-xs text-gray-500">{reward.description}</p>
                  <span className={`text-xs font-medium capitalize ${getTierColor(reward.tier)}`}>
                    {reward.tier}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
