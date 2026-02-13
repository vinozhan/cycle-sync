import { useState } from 'react';
import { HiUsers, HiShieldCheck, HiMapPin, HiTrophy } from 'react-icons/hi2';
import UserManagement from '../components/admin/UserManagement';
import RouteVerification from '../components/admin/RouteVerification';
import ReportModeration from '../components/admin/ReportModeration';
import RewardManager from '../components/admin/RewardManager';

const tabs = [
  { key: 'users', label: 'Users', icon: HiUsers, component: UserManagement },
  { key: 'reports', label: 'Reports', icon: HiShieldCheck, component: ReportModeration },
  { key: 'routes', label: 'Routes', icon: HiMapPin, component: RouteVerification },
  { key: 'rewards', label: 'Rewards', icon: HiTrophy, component: RewardManager },
];

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');

  const ActiveComponent = tabs.find((t) => t.key === activeTab)?.component;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};

export default AdminPanel;
