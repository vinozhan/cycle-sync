import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense } from 'react';
import AuthProvider from './context/AuthContext';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const RoutesList = lazy(() => import('./pages/RoutesList'));
const RouteDetail = lazy(() => import('./pages/RouteDetail'));
const CreateRoute = lazy(() => import('./pages/CreateRoute'));
const EditRoute = lazy(() => import('./pages/EditRoute'));
const ReportsList = lazy(() => import('./pages/ReportsList'));
const ReportDetail = lazy(() => import('./pages/ReportDetail'));
const CreateReport = lazy(() => import('./pages/CreateReport'));
const EditReport = lazy(() => import('./pages/EditReport'));
const Rewards = lazy(() => import('./pages/Rewards'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const NotFound = lazy(() => import('./pages/NotFound'));

const SuspenseFallback = () => <LoadingSpinner size="lg" className="min-h-screen" />;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: '0.5rem', fontSize: '0.875rem' },
            }}
          />
          <Suspense fallback={<SuspenseFallback />}>
            <Routes>
              <Route element={<Layout />}>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/routes" element={<RoutesList />} />
                <Route path="/routes/:id" element={<RouteDetail />} />
                <Route path="/reports" element={<ReportsList />} />
                <Route path="/reports/:id" element={<ReportDetail />} />
                <Route path="/rewards" element={<Rewards />} />

                {/* Protected (cyclist + admin) */}
                <Route path="/routes/create" element={<ProtectedRoute><CreateRoute /></ProtectedRoute>} />
                <Route path="/routes/:id/edit" element={<ProtectedRoute><EditRoute /></ProtectedRoute>} />
                <Route path="/reports/create" element={<ProtectedRoute><CreateReport /></ProtectedRoute>} />
                <Route path="/reports/:id/edit" element={<ProtectedRoute><EditReport /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                {/* Admin only */}
                <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
