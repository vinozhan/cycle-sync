import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }
      const { data } = await api.get('/auth/me');
      setUser(data.data.user);
    } catch {
      localStorage.removeItem('accessToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('accessToken', data.data.accessToken);
    setUser(data.data.user);
    return data;
  };

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('accessToken', data.data.accessToken);
    setUser(data.data.user);
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  };

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    register,
    login,
    logout,
    fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
