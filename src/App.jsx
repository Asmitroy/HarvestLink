import { Navigate, Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ROLE_ROUTES } from './components/ProtectedRoute';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard  from './pages/BuyerDashboard';
import AdminDashboard  from './pages/AdminDashboard';

export default function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* ── Public Routes ── */}
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to={ROLE_ROUTES[user?.role] || '/dashboard/farmer'} replace />
            : <Login />
        }
      />

      {/* ── Protected Dashboard Routes ── */}
      <Route
        path="/dashboard/farmer"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/buyer"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <BuyerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRoles={['logistics']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* ── Root redirect ── */}
      <Route
        path="/"
        element={
          isAuthenticated
            ? <Navigate to={ROLE_ROUTES[user?.role] || '/dashboard/farmer'} replace />
            : <Navigate to="/login" replace />
        }
      />

      {/* ── 404 → redirect to login or own dashboard ── */}
      <Route
        path="*"
        element={
          isAuthenticated
            ? <Navigate to={ROLE_ROUTES[user?.role] || '/dashboard/farmer'} replace />
            : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}
