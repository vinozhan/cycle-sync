import { useState, useCallback } from 'react';
import api from '../services/api';

const useReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [review, setReview] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/reviews', { params });
      setReviews(data.data.items);
      setPagination(data.data.pagination);
      return data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reviews');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReview = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/reviews/${id}`);
      setReview(data.data.review);
      return data.data.review;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch review');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createReview = async (reviewData) => {
    const { data } = await api.post('/reviews', reviewData);
    return data.data.review;
  };

  const updateReview = async (id, reviewData) => {
    const { data } = await api.put(`/reviews/${id}`, reviewData);
    return data.data.review;
  };

  const deleteReview = async (id) => {
    await api.delete(`/reviews/${id}`);
  };

  return {
    reviews,
    review,
    pagination,
    loading,
    error,
    fetchReviews,
    fetchReview,
    createReview,
    updateReview,
    deleteReview,
  };
};

export default useReviews;
