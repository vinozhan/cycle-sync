import { useState, useCallback } from 'react';
import api from '../services/api';

const useRewards = () => {
  const [rewards, setRewards] = useState([]);
  const [reward, setReward] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRewards = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/rewards', { params });
      setRewards(data.data.items);
      setPagination(data.data.pagination);
      return data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch rewards');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReward = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/rewards/${id}`);
      setReward(data.data.reward);
      return data.data.reward;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reward');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserAchievements = useCallback(async (userId) => {
    const { data } = await api.get(`/users/${userId}/achievements`);
    return data.data.achievements;
  }, []);

  return {
    rewards,
    reward,
    pagination,
    loading,
    error,
    fetchRewards,
    fetchReward,
    fetchUserAchievements,
  };
};

export default useRewards;
