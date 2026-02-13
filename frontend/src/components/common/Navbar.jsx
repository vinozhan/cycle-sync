import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { HiBars3, HiXMark } from 'react-icons/hi2';
import useAuth from '../../hooks/useAuth';
import { getInitials } from '../../utils/formatters';

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `relative px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'text-emerald-700 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:w-4/5 after:rounded-full after:bg-emerald-600'
        : 'text-gray-600 hover:text-gray-900'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-emerald-600">
          CycleSync
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/routes" className={linkClass}>Routes</NavLink>
          <NavLink to="/reports" className={linkClass}>Reports</NavLink>
          <NavLink to="/rewards" className={linkClass}>Rewards</NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={linkClass}>Admin</NavLink>
              )}
              <div className="ml-3 flex items-center gap-3 border-l border-gray-200 pl-3">
                <Link to="/profile" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-600">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                    {getInitials(user?.firstName, user?.lastName)}
                  </span>
                  {user?.firstName}
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="ml-3 flex items-center gap-2 border-l border-gray-200 pl-3">
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
        >
          {mobileOpen ? <HiXMark className="h-6 w-6" /> : <HiBars3 className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t border-gray-200 bg-white px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            <NavLink to="/routes" className={linkClass} onClick={() => setMobileOpen(false)}>Routes</NavLink>
            <NavLink to="/reports" className={linkClass} onClick={() => setMobileOpen(false)}>Reports</NavLink>
            <NavLink to="/rewards" className={linkClass} onClick={() => setMobileOpen(false)}>Rewards</NavLink>

            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" className={linkClass} onClick={() => setMobileOpen(false)}>Dashboard</NavLink>
                <NavLink to="/profile" className={linkClass} onClick={() => setMobileOpen(false)}>Profile</NavLink>
                {isAdmin && (
                  <NavLink to="/admin" className={linkClass} onClick={() => setMobileOpen(false)}>Admin</NavLink>
                )}
                <button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="mt-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100" onClick={() => setMobileOpen(false)}>Login</Link>
                <Link to="/register" className="rounded-lg bg-emerald-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-emerald-700" onClick={() => setMobileOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
