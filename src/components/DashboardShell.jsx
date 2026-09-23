/**
 * DashboardShell.jsx
 * Shared top navigation wrapper for all authenticated dashboard pages.
 * Shows the user's role, name, and a logout button.
 */
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from './Toast';
import { useAppContext } from '../context/AppContext';

const ROLE_META = {
  farmer:    { label: 'Farmer Portal',     color: '#0D7A51', bg: '#E6F4EF', icon: '🧑‍🌾' },
  buyer:     { label: 'Buyer Dashboard',   color: '#2563EB', bg: '#EFF6FF', icon: '🏢'   },
  logistics: { label: 'Logistics & Admin', color: '#7C3AED', bg: '#F5F3FF', icon: '🚚'   },
};

export default function DashboardShell({ children }) {
  const { user, logout } = useAuth();
  const { toasts }       = useAppContext();
  const navigate         = useNavigate();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  const meta = ROLE_META[user?.role] || ROLE_META.farmer;

  return (
    <div className="min-h-screen bg-[#F0F4F2] font-sans">

      {/* ── Top Nav Bar ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: meta.color }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 2a9 9 0 0 1 9 9c0 4.97-9 13-9 13S3 15.97 3 11a9 9 0 0 1 9-9z"/>
                <circle cx="12" cy="11" r="3"/>
              </svg>
            </div>
            <span className="font-extrabold text-gray-900 text-[1rem] tracking-tight">KisanConnect</span>
            <span className="hidden sm:inline text-[0.72rem] font-bold px-2.5 py-1 rounded-full border"
              style={{ background: meta.bg, color: meta.color, borderColor: `${meta.color}25` }}>
              {meta.icon} {meta.label}
            </span>
          </div>

          {/* Right: User info + Logout */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[0.82rem] font-bold text-gray-900 leading-tight">{user?.name}</p>
              <p className="text-[0.68rem] text-gray-500">{user?.role}</p>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ background: meta.color }}>
              {user?.name?.[0] || '?'}
            </div>
            <button
              id="logout-btn"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[0.78rem] font-semibold text-gray-600 border border-gray-200 bg-gray-50 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Logout
            </button>
          </div>

        </div>
      </header>

      {/* ── Page content ── */}
      <main className="max-w-[900px] mx-auto px-6 py-6">
        {children}
      </main>

      {/* ── Toasts ── */}
      <Toast toasts={toasts} />
    </div>
  );
}
