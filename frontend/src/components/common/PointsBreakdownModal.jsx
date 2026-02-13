import { HiMapPin, HiShieldCheck, HiStar, HiBolt, HiTrophy } from 'react-icons/hi2';
import Modal from './Modal';
import { POINTS } from '../../utils/constants';

const PointsBreakdownModal = ({ isOpen, onClose, stats, achievements }) => {
  const rows = [
    {
      icon: HiMapPin,
      label: 'Routes Created',
      count: stats?.routesCreated || 0,
      perItem: POINTS.ROUTE_CREATED,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      icon: HiShieldCheck,
      label: 'Reports Submitted',
      count: stats?.reportsSubmitted || 0,
      perItem: POINTS.REPORT_SUBMITTED,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      icon: HiStar,
      label: 'Reviews Written',
      count: stats?.reviewsWritten || 0,
      perItem: POINTS.REVIEW_WRITTEN,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      icon: HiBolt,
      label: 'Rides Completed',
      count: stats?.ridesCompleted || 0,
      perItem: POINTS.RIDE_COMPLETED,
      color: 'text-cyan-600 bg-cyan-50',
    },
  ];

  const activityTotal = rows.reduce((sum, r) => sum + r.count * r.perItem, 0);
  const achievementPoints = (stats?.totalPoints || 0) - activityTotal;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Points Breakdown" size="md">
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${row.color}`}>
                <row.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{row.label}</p>
                <p className="text-xs text-gray-500">
                  {row.count} × {row.perItem} pts
                </p>
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-900">{row.count * row.perItem}</p>
          </div>
        ))}

        {/* Achievement rewards */}
        <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg text-yellow-600 bg-yellow-50">
              <HiTrophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Achievement Rewards</p>
              <p className="text-xs text-gray-500">
                {achievements?.length || 0} achievements
              </p>
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-900">{Math.max(0, achievementPoints)}</p>
        </div>

        {/* Total */}
        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center justify-between px-4">
            <p className="text-base font-bold text-gray-900">Total Points</p>
            <p className="text-lg font-bold text-emerald-600">{stats?.totalPoints || 0}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PointsBreakdownModal;
