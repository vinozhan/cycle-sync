import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg font-bold text-emerald-600">CycleSync</h3>
            <p className="mt-2 text-sm text-gray-500">
              Promoting sustainable cycling with safe routes and community rewards.
              Aligned with UN SDG 11.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700">Explore</h4>
            <ul className="mt-2 space-y-1">
              <li><Link to="/routes" className="text-sm text-gray-500 hover:text-emerald-600">Routes</Link></li>
              <li><Link to="/reports" className="text-sm text-gray-500 hover:text-emerald-600">Safety Reports</Link></li>
              <li><Link to="/rewards" className="text-sm text-gray-500 hover:text-emerald-600">Rewards</Link></li>
              <li><Link to="/dashboard" className="text-sm text-gray-500 hover:text-emerald-600">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700">About</h4>
            <ul className="mt-2 space-y-1">
              <li>
                <a
                  href="https://sdgs.un.org/goals/goal11"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-emerald-600"
                >
                  UN SDG 11
                </a>
              </li>
              <li><Link to="/rewards" className="text-sm text-gray-500 hover:text-emerald-600">Community Rewards</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700">Account</h4>
            <ul className="mt-2 space-y-1">
              <li><Link to="/login" className="text-sm text-gray-500 hover:text-emerald-600">Login</Link></li>
              <li><Link to="/register" className="text-sm text-gray-500 hover:text-emerald-600">Sign Up</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} CycleSync. Built for UN SDG 11: Sustainable Cities and Communities.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
