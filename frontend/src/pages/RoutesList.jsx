import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiPlus, HiMapPin, HiStar, HiCheckBadge } from 'react-icons/hi2';
import useRoutes from '../hooks/useRoutes';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import SearchBar from '../components/common/SearchBar';
import FilterPanel from '../components/common/FilterPanel';
import Button from '../components/common/Button';
import { formatDistance, formatDuration } from '../utils/formatters';
import { DIFFICULTY_OPTIONS, SURFACE_OPTIONS } from '../utils/constants';

const RoutesList = () => {
  const { routes, pagination, loading, fetchRoutes } = useRoutes();
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState({
    difficulty: '',
    surfaceType: '',
    search: '',
    sort: 'createdAt',
    page: 1,
  });

  useEffect(() => {
    const params = { page: filters.page, sort: filters.sort, order: 'desc' };
    if (filters.difficulty) params.difficulty = filters.difficulty;
    if (filters.surfaceType) params.surfaceType = filters.surfaceType;
    if (filters.search) params.search = filters.search;
    fetchRoutes(params);
  }, [filters, fetchRoutes]);

  const getDifficultyColor = (difficulty) => {
    return DIFFICULTY_OPTIONS.find((d) => d.value === difficulty)?.color || 'text-gray-600';
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cycling Routes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Discover safe and scenic cycling routes
          </p>
        </div>
        {isAuthenticated && (
          <Link to="/routes/create">
            <Button>
              <HiPlus className="h-4 w-4" /> New Route
            </Button>
          </Link>
        )}
      </div>

      {/* Search + Filters */}
      <div className="mt-6 space-y-3">
        <SearchBar
          placeholder="Search routes by name..."
          onSearch={(q) => updateFilter('search', q)}
          className="max-w-md"
        />
        <FilterPanel>
          <FilterPanel.Select
            label="Difficulty"
            value={filters.difficulty}
            onChange={(val) => updateFilter('difficulty', val)}
            options={DIFFICULTY_OPTIONS}
            allLabel="All Difficulties"
          />
          <FilterPanel.Select
            label="Surface"
            value={filters.surfaceType}
            onChange={(val) => updateFilter('surfaceType', val)}
            options={SURFACE_OPTIONS}
            allLabel="All Surfaces"
          />
          <FilterPanel.Select
            label="Sort"
            value={filters.sort}
            onChange={(val) => updateFilter('sort', val)}
            options={[
              { value: 'createdAt', label: 'Newest' },
              { value: 'averageRating', label: 'Top Rated' },
              { value: 'distance', label: 'Distance' },
            ]}
            allLabel="Sort By"
          />
        </FilterPanel>
      </div>

      {/* Route cards */}
      {loading ? (
        <LoadingSpinner size="lg" className="mt-12" />
      ) : routes.length === 0 ? (
        <p className="mt-12 text-center text-gray-500">No routes found.</p>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {routes.map((route) => (
              <Link
                key={route._id}
                to={`/routes/${route._id}`}
                className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600">
                    {route.title}
                  </h3>
                  {route.isVerified && (
                    <HiCheckBadge className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">{route.description}</p>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span className={`font-medium capitalize ${getDifficultyColor(route.difficulty)}`}>
                    {route.difficulty}
                  </span>
                  {route.surfaceType && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 capitalize">
                      {route.surfaceType}
                    </span>
                  )}
                  {route.distance > 0 && (
                    <span className="flex items-center gap-1">
                      <HiMapPin className="h-3.5 w-3.5" /> {formatDistance(route.distance)}
                    </span>
                  )}
                  {route.estimatedDuration > 0 && (
                    <span>{formatDuration(route.estimatedDuration)}</span>
                  )}
                  {route.reviewCount > 0 && (
                    <span className="flex items-center gap-1">
                      <HiStar className="h-3.5 w-3.5 text-yellow-500" />
                      {route.averageRating?.toFixed(1)} ({route.reviewCount})
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <Pagination
            pagination={pagination}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          />
        </>
      )}
    </div>
  );
};

export default RoutesList;
