import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Button from '../common/Button';
import ConfirmDialog from '../common/ConfirmDialog';
import Pagination from '../common/Pagination';
import SearchBar from '../common/SearchBar';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import { getErrorMessage } from '../../utils/validators';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState({ open: false, userId: null, action: null });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.search = search;
      const res = await api.get('/users', { params });
      setUsers(res.data.data.items || res.data.data.users || []);
      setPagination(res.data.data.pagination);
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const handleDeactivate = async () => {
    try {
      await api.delete(`/users/${confirm.userId}`);
      toast.success('User deactivated');
      setConfirm({ open: false, userId: null, action: null });
      fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleReactivate = async (userId) => {
    try {
      await api.patch(`/users/${userId}/reactivate`);
      toast.success('User reactivated');
      fetchUsers();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">User Management</h2>
        <SearchBar
          placeholder="Search users..."
          onSearch={(q) => { setSearch(q); setPage(1); }}
          className="w-64"
        />
      </div>

      {loading ? (
        <LoadingSpinner size="md" className="mt-8" />
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
              <tr>
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Role</th>
                <th className="pb-3 pr-4">Points</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Joined</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="py-3 pr-4 font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="py-3 pr-4 text-gray-500">{user.email}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 pr-4">{user.totalPoints}</td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-500">{formatDate(user.createdAt)}</td>
                  <td className="py-3">
                    {user.isActive ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirm({ open: true, userId: user._id, action: 'deactivate' })}
                      >
                        Deactivate
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReactivate(user._id)}
                      >
                        Reactivate
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={setPage} />

      <ConfirmDialog
        isOpen={confirm.open}
        onClose={() => setConfirm({ open: false, userId: null, action: null })}
        onConfirm={handleDeactivate}
        title="Deactivate User"
        message="This user will no longer be able to log in. You can reactivate them later."
        confirmLabel="Deactivate"
      />
    </div>
  );
};

export default UserManagement;
