import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HiTrophy, HiPlus } from 'react-icons/hi2';
import api from '../../services/api';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import Pagination from '../common/Pagination';
import LoadingSpinner from '../common/LoadingSpinner';
import { REWARD_TIERS } from '../../utils/constants';
import { getErrorMessage } from '../../utils/validators';

const CATEGORY_OPTIONS = ['distance', 'routes', 'reports', 'reviews', 'streak', 'special'];
const CRITERIA_TYPES = ['totalDistance', 'routesCreated', 'reportsSubmitted', 'reviewsWritten'];

const emptyForm = {
  name: '',
  description: '',
  icon: 'trophy',
  category: 'routes',
  criteria: { type: 'routesCreated', threshold: 1 },
  pointsAwarded: 50,
  tier: 'bronze',
};

const RewardManager = () => {
  const [rewards, setRewards] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState({ open: false, editing: false });
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const res = await api.get('/rewards', { params: { page } });
      setRewards(res.data.data.items || []);
      setPagination(res.data.data.pagination);
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRewards(); }, [page]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (modal.editing) {
        await api.put(`/rewards/${form._id}`, form);
        toast.success('Reward updated');
      } else {
        await api.post('/rewards', form);
        toast.success('Reward created');
      }
      setModal({ open: false, editing: false });
      setForm(emptyForm);
      fetchRewards();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/rewards/${deleteConfirm.id}`);
      toast.success('Reward deleted');
      setDeleteConfirm({ open: false, id: null });
      fetchRewards();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const openEdit = (reward) => {
    setForm({
      _id: reward._id,
      name: reward.name,
      description: reward.description,
      icon: reward.icon || 'trophy',
      category: reward.category,
      criteria: reward.criteria || { type: 'routesCreated', threshold: 1 },
      pointsAwarded: reward.pointsAwarded,
      tier: reward.tier,
    });
    setModal({ open: true, editing: true });
  };

  const getTierColor = (tier) =>
    REWARD_TIERS.find((t) => t.value === tier)?.color || 'text-gray-500';

  if (loading) return <LoadingSpinner size="md" className="mt-8" />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Reward Manager</h2>
          <p className="mt-1 text-sm text-gray-500">Create and manage achievements</p>
        </div>
        <Button
          onClick={() => { setForm(emptyForm); setModal({ open: true, editing: false }); }}
        >
          <HiPlus className="h-4 w-4" /> New Reward
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {rewards.map((reward) => (
          <div
            key={reward._id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="flex items-center gap-3">
              <HiTrophy className={`h-8 w-8 ${getTierColor(reward.tier)}`} />
              <div>
                <p className="font-medium text-gray-900">{reward.name}</p>
                <p className="text-xs text-gray-500">
                  {reward.category} &middot; {reward.tier} &middot;{' '}
                  {reward.pointsAwarded} pts &middot; {reward.earnedBy?.length || 0} earned
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(reward)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDeleteConfirm({ open: true, id: reward._id })}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Pagination pagination={pagination} onPageChange={setPage} />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modal.open}
        onClose={() => { setModal({ open: false, editing: false }); setForm(emptyForm); }}
        title={modal.editing ? 'Edit Reward' : 'Create Reward'}
      >
        <div className="space-y-4">
          <Input
            label="Name"
            id="reward-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tier</label>
              <select
                value={form.tier}
                onChange={(e) => setForm({ ...form, tier: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              >
                {REWARD_TIERS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Criteria Type</label>
              <select
                value={form.criteria.type}
                onChange={(e) =>
                  setForm({ ...form, criteria: { ...form.criteria, type: e.target.value } })
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              >
                {CRITERIA_TYPES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <Input
              label="Threshold"
              id="threshold"
              type="number"
              min="1"
              value={form.criteria.threshold}
              onChange={(e) =>
                setForm({ ...form, criteria: { ...form.criteria, threshold: Number(e.target.value) } })
              }
            />
          </div>
          <Input
            label="Points Awarded"
            id="points"
            type="number"
            min="0"
            value={form.pointsAwarded}
            onChange={(e) => setForm({ ...form, pointsAwarded: Number(e.target.value) })}
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => { setModal({ open: false, editing: false }); setForm(emptyForm); }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              {modal.editing ? 'Save Changes' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Reward"
        message="This reward will be deactivated. Users who earned it will keep their achievement."
        confirmLabel="Delete"
      />
    </div>
  );
};

export default RewardManager;
