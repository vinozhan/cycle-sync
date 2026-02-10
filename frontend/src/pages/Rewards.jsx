import { useEffect, useState } from 'react';
import { HiTrophy, HiCheckBadge } from 'react-icons/hi2';
import useRewards from '../hooks/useRewards';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import FilterPanel from '../components/common/FilterPanel';
import { REWARD_TIERS } from '../utils/constants';

const CATEGORY_OPTIONS = [
  { value: 'distance', label: 'Distance' },
  { value: 'routes', label: 'Routes' },
  { value: 'reports', label: 'Reports' },
  { value: 'reviews', label: 'Reviews' },
  { value: 'streak', label: 'Streak' },
  { value: 'special', label: 'Special' },
];

const Rewards = () => {
  const { rewards, pagination, loading, fetchRewards, fetchUserAchievements } = useRewards();
  const { user, isAuthenticated } = useAuth();
  const [userAchievements, setUserAchievements] = useState([]);
  const [filters, setFilters] = useState({ category: '', tier: '', page: 1 });

  useEffect(() => {
    const params = { page: filters.page };
    if (filters.category) params.category = filters.category;
    if (filters.tier) params.tier = filters.tier;
    fetchRewards(params);
  }, [filters, fetchRewards]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserAchievements(user._id).then(setUserAchievements).catch(() => {});
    }
  }, [isAuthenticated, user, fetchUserAchievements]);

  const earnedIds = new Set(userAchievements.map((a) => a._id));

  const getTierColor = (tier) => {
    return REWARD_TIERS.find((t) => t.value === tier)?.color || 'text-gray-500';
  };

  const getTierBg = (tier) => {
    const map = {
      bronze: 'bg-amber-50 border-amber-200',
      silver: 'bg-gray-50 border-gray-200',
      gold: 'bg-yellow-50 border-yellow-200',
      platinum: 'bg-indigo-50 border-indigo-200',
    };
    return map[tier] || 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rewards Catalogue</h1>
        <p className="mt-1 text-sm text-gray-500">
          Earn badges and achievements by contributing to the community
        </p>
      </div>

      {/* User progress */}
      {isAuthenticated && (
        <div className="mt-6 flex items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <HiTrophy className="h-8 w-8 text-emerald-600" />
          <div>
            <p className="font-semibold text-emerald-800">
              {userAchievements.length} Achievement{userAchievements.length !== 1 && 's'} Earned
            </p>
            <p className="text-sm text-emerald-600">{user?.totalPoints || 0} total points</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <FilterPanel className="mt-6">
        <FilterPanel.Select
          label="Category"
          value={filters.category}
          onChange={(val) => setFilters({ ...filters, category: val, page: 1 })}
          options={CATEGORY_OPTIONS}
          allLabel="All Categories"
        />
        <FilterPanel.Select
          label="Tier"
          value={filters.tier}
          onChange={(val) => setFilters({ ...filters, tier: val, page: 1 })}
          options={REWARD_TIERS}
          allLabel="All Tiers"
        />
      </FilterPanel>

      {/* Rewards grid */}
      {loading ? (
        <LoadingSpinner size="lg" className="mt-12" />
      ) : rewards.length === 0 ? (
        <p className="mt-12 text-center text-gray-500">No rewards found.</p>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rewards.map((reward) => {
              const earned = earnedIds.has(reward._id);
              return (
                <div
                  key={reward._id}
                  className={`relative rounded-xl border p-5 transition ${
                    earned ? getTierBg(reward.tier) : 'border-gray-200 bg-white'
                  } ${earned ? '' : 'opacity-75'}`}
                >
                  {earned && (
                    <HiCheckBadge className="absolute right-3 top-3 h-6 w-6 text-emerald-500" />
                  )}
                  <HiTrophy className={`h-10 w-10 ${getTierColor(reward.tier)}`} />
                  <h3 className="mt-3 font-semibold text-gray-900">{reward.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{reward.description}</p>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className={`font-medium capitalize ${getTierColor(reward.tier)}`}>
                      {reward.tier}
                    </span>
                    <span className="text-gray-400">{reward.pointsAwarded} pts</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    {reward.category} &middot; {reward.earnedBy?.length || 0} earned
                  </p>
                </div>
              );
            })}
          </div>

          <Pagination
            pagination={pagination}
            onPageChange={(page) => setFilters({ ...filters, page })}
          />
        </>
      )}
    </div>
  );
};

export default Rewards;
