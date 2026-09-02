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
    <div className="min-h-screen bg-[#F0F4F2] font-sans">
      <TopNav />
      <StatusBar isSolverRunning={isSolverRunning} routeBadge={routeBadge} />

      <main className="max-w-[1600px] mx-auto px-6 py-5">
        <div className="grid gap-5 items-start" style={{ gridTemplateColumns: '30fr 35fr 35fr' }}>

          {/* LEFT — Farmer */}
          <div style={paneStyle('farmer')}>
            <FarmerPane
              voiceCrop={voiceCrop}
              voiceQty={voiceQty}
              clearVoice={() => { setVoiceCrop(null); setVoiceQty(null); }}
              onVoice={() => setVoiceOpen(true)}
              onEdit={() => setPriceOpen(true)}
            />
          </div>

          {/* MID — Buyer */}
          <div style={paneStyle('buyer')}>
            <BuyerPane />
          </div>

          {/* RIGHT — Logistics */}
          <div style={paneStyle('logistics')}>
            <LogisticsPane
              loadPct={loadPct}
              loadKg={loadKg}
              routeBadge={routeBadge}
              onRunSolver={() => setSolverRunning(true)}
            />
          </div>

        </div>
      </main>

      {/* ── Overlays ── */}
      {isVoiceOpen && (
      <VoiceOverlay
          onClose={() => setVoiceOpen(false)}
          onRecognized={(c, q) => {
            setVoiceCrop(c);
            setVoiceQty(q);
            setVoiceOpen(false);
            const cropText = c ? c.charAt(0).toUpperCase() + c.slice(1) : null;
            const parts = [q ? `${q} kg` : null, cropText].filter(Boolean);
            addToast(`🎙️ Recognized: "${parts.length ? parts.join(' ') : 'voice input'}" — fields filled!`, 'success');
          }}
        />
      )}
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
