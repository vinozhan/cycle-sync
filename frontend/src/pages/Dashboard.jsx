import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiTrophy, HiMapPin, HiShieldCheck, HiStar, HiChartBar, HiPlus, HiBolt, HiGlobeAlt } from 'react-icons/hi2';
import useAuth from '../hooks/useAuth';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
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
    { label: 'Total Points', value: stats?.totalPoints || 0, icon: HiChartBar, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Rides Completed', value: stats?.ridesCompleted || 0, icon: HiBolt, color: 'text-cyan-600 bg-cyan-50' },
    { label: 'CO2 Saved', value: `${(stats?.co2Saved || 0).toFixed(1)} kg`, icon: HiGlobeAlt, color: 'text-green-600 bg-green-50' },
    { label: 'Routes Created', value: stats?.routesCreated || 0, icon: HiMapPin, color: 'text-blue-600 bg-blue-50' },
    { label: 'Reports Filed', value: stats?.reportsSubmitted || 0, icon: HiShieldCheck, color: 'text-amber-600 bg-amber-50' },
    { label: 'Reviews Written', value: stats?.reviewsWritten || 0, icon: HiStar, color: 'text-purple-600 bg-purple-50' },
    { label: 'Total Distance', value: formatDistance(stats?.totalDistance || 0), icon: HiMapPin, color: 'text-teal-600 bg-teal-50' },
    { label: 'Achievements', value: achievements.length, icon: HiTrophy, color: 'text-yellow-600 bg-yellow-50' },
  ];

  const getTierColor = (tier) => {
    return REWARD_TIERS.find((t) => t.value === tier)?.color || 'text-gray-600';
  };

  const isNewUser = !stats?.routesCreated && !stats?.reportsSubmitted && !stats?.reviewsWritten && !stats?.ridesCompleted && achievements.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">
        Welcome, {user?.firstName}!
      </h1>
      <p className="mt-1 text-sm text-gray-500">Your cycling dashboard</p>

      {/* New user welcome state */}
      {isNewUser && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-lg font-semibold text-emerald-800">Welcome to CycleSync!</h2>
          <p className="mt-1 text-sm text-emerald-700">
            Get started by creating your first route, reporting a hazard, or exploring community routes. Every contribution earns you points and achievements!
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/routes/create">
              <Button size="sm"><HiPlus className="h-4 w-4" /> Create Route</Button>
            </Link>
            <Link to="/reports/create">
              <Button variant="secondary" size="sm"><HiPlus className="h-4 w-4" /> Report Hazard</Button>
            </Link>
            <Link to="/routes">
              <Button variant="outline" size="sm">Explore Routes</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Quick Actions */}
      <div className="mt-10">
        <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Link
            to="/routes/create"
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <HiMapPin className="h-8 w-8 text-blue-600" />
            <h3 className="mt-3 font-semibold text-gray-900 group-hover:text-emerald-600">Create Route</h3>
            <p className="mt-1 text-sm text-gray-500">Share a new cycling route with the community</p>
          </Link>
          <Link
            to="/reports/create"
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <HiShieldCheck className="h-8 w-8 text-amber-600" />
            <h3 className="mt-3 font-semibold text-gray-900 group-hover:text-emerald-600">Report Hazard</h3>
            <p className="mt-1 text-sm text-gray-500">Alert cyclists about road hazards and dangers</p>
          </Link>
          <Link
            to="/routes"
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <HiStar className="h-8 w-8 text-purple-600" />
            <h3 className="mt-3 font-semibold text-gray-900 group-hover:text-emerald-600">Explore Routes</h3>
            <p className="mt-1 text-sm text-gray-500">Discover community-rated cycling routes</p>
          </Link>
        </div>
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
