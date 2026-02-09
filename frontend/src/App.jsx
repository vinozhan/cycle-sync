import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthProvider from './context/AuthContext';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages (lazy loaded)
import { lazy, Suspense } from 'react';
import LoadingSpinner from './components/common/LoadingSpinner';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const RoutesList = lazy(() => import('./pages/RoutesList'));
const RouteDetail = lazy(() => import('./pages/RouteDetail'));
const CreateRoute = lazy(() => import('./pages/CreateRoute'));
const ReportsList = lazy(() => import('./pages/ReportsList'));
const CreateReport = lazy(() => import('./pages/CreateReport'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const NotFound = lazy(() => import('./pages/NotFound'));

const SuspenseFallback = () => <LoadingSpinner size="lg" className="min-h-screen" />;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/routes" element={<RoutesList />} />
              <Route path="/routes/:id" element={<RouteDetail />} />
              <Route
                path="/routes/create"
                element={<ProtectedRoute><CreateRoute /></ProtectedRoute>}
              />
              <Route path="/reports" element={<ReportsList />} />
              <Route
                path="/reports/create"
                element={<ProtectedRoute><CreateReport /></ProtectedRoute>}
              />
              <Route
                path="/dashboard"
                element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
              />
              <Route
                path="/admin"
                element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>}
              />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
