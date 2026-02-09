import { useState, useCallback } from 'react';
import api from '../services/api';

const useRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [route, setRoute] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRoutes = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/routes', { params });
      setRoutes(data.data.items);
      setPagination(data.data.pagination);
      return data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch routes');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoute = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/routes/${id}`);
      setRoute(data.data.route);
      return data.data.route;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch route');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createRoute = async (routeData) => {
    const { data } = await api.post('/routes', routeData);
    return data.data.route;
  };

  const updateRoute = async (id, routeData) => {
    const { data } = await api.put(`/routes/${id}`, routeData);
    return data.data.route;
  };

  const deleteRoute = async (id) => {
    await api.delete(`/routes/${id}`);
  };

  const fetchNearby = async (lat, lng, radius) => {
    const { data } = await api.get('/routes/nearby', {
      params: { lat, lng, radius },
    });
    return data.data.routes;
  };

  return {
    routes,
    route,
    pagination,
    loading,
    error,
    fetchRoutes,
    fetchRoute,
    createRoute,
    updateRoute,
    deleteRoute,
    fetchNearby,
  };
};

export default useRoutes;
