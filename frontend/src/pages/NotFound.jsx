import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-extrabold text-gray-200">404</h1>
      <p className="mt-4 text-lg font-semibold text-gray-900">Page not found</p>
      <p className="mt-1 text-sm text-gray-500">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
