import { useState, useCallback } from 'react';
import api from '../services/api';

const useRides = () => {
  const [rides, setRides] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [rideStats, setRideStats] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRides = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/rides', { params });
      setRides(data.data.items);
      setPagination(data.data.pagination);
      return data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch rides');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActiveRide = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api.get('/rides/active');
      setActiveRide(data.data.ride);
      return data.data.ride;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch active ride');
      throw err;
    }
  }, []);

  const fetchRideStats = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api.get('/rides/stats');
      setRideStats(data.data.stats);
      return data.data.stats;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch ride stats');
      throw err;
    }
  }, []);

  const startRide = async (routeId) => {
    const { data } = await api.post('/rides/start', { route: routeId });
    setActiveRide(data.data.ride);
    return data.data.ride;
  };

  const completeRide = async (rideId) => {
    const { data } = await api.patch(`/rides/${rideId}/complete`);
    setActiveRide(null);
    return data.data.ride;
  };

  const cancelRide = async (rideId) => {
    const { data } = await api.patch(`/rides/${rideId}/cancel`);
    setActiveRide(null);
    return data.data.ride;
  };

  return {
    rides,
    activeRide,
    rideStats,
    pagination,
    loading,
    error,
    fetchRides,
    fetchActiveRide,
    fetchRideStats,
    startRide,
    completeRide,
    cancelRide,
  };
};

export default useRides;
