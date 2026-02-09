import { useState, useCallback } from 'react';
import api from '../services/api';

const useReports = () => {
  const [reports, setReports] = useState([]);
  const [report, setReport] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/reports', { params });
      setReports(data.data.items);
      setPagination(data.data.pagination);
      return data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reports');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReport = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/reports/${id}`);
      setReport(data.data.report);
      return data.data.report;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createReport = async (reportData) => {
    const { data } = await api.post('/reports', reportData);
    return data.data.report;
  };

  const updateReport = async (id, reportData) => {
    const { data } = await api.put(`/reports/${id}`, reportData);
    return data.data.report;
  };

  const deleteReport = async (id) => {
    await api.delete(`/reports/${id}`);
  };

  const updateReportStatus = async (id, status, adminNotes) => {
    const { data } = await api.patch(`/reports/${id}/status`, {
      status,
      adminNotes,
    });
    return data.data.report;
  };

  return {
    reports,
    report,
    pagination,
    loading,
    error,
    fetchReports,
    fetchReport,
    createReport,
    updateReport,
    deleteReport,
    updateReportStatus,
  };
};

export default useReports;
