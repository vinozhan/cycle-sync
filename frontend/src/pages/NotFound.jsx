import { Link } from 'react-router-dom';
import { HiMapPin, HiShieldCheck, HiTrophy } from 'react-icons/hi2';

const NotFound = () => {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center px-4 text-center">
      {/* Bicycle SVG icon */}
      <svg
        className="h-24 w-24 text-emerald-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1}
      >
        <circle cx="5.5" cy="17.5" r="3.5" />
        <circle cx="18.5" cy="17.5" r="3.5" />
        <path d="M5.5 17.5l4-9h5l2 4.5m-7-4.5L12 6h3" />
        <path d="M15.5 8.5l3 9" />
      </svg>

      <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
        Looks like you took a wrong turn
      </h1>
      <p className="mt-2 text-gray-500">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-700"
      >
        Back to Home
      </Link>

      <div className="mt-10 flex flex-wrap justify-center gap-6">
        <Link to="/routes" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-emerald-600">
          <HiMapPin className="h-4 w-4" /> Browse Routes
        </Link>
        <Link to="/reports" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-emerald-600">
          <HiShieldCheck className="h-4 w-4" /> Safety Reports
        </Link>
        <Link to="/rewards" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-emerald-600">
          <HiTrophy className="h-4 w-4" /> Rewards
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
