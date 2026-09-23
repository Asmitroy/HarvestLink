import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_ROUTES } from './ProtectedRoute';

// ── Demo credentials for quick-login buttons ──
const DEMO_CREDENTIALS = {
  farmer:    { email: 'farmer@demo.com', password: 'farmer123', label: '🧑‍🌾 Login as Farmer', role: 'farmer'    },
  buyer:     { email: 'buyer@demo.com',  password: 'buyer123',  label: '🏢 Login as Buyer',   role: 'buyer'     },
  admin:     { email: 'admin@demo.com',  password: 'admin123',  label: '🚚 Login as Admin',    role: 'logistics' },
};

export default function Login() {
  const { login, isLoading, authError } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [localErr, setLocalErr] = useState('');
  const [activeDemo, setActiveDemo] = useState(null);

  // Where to redirect after successful login
  const from = location.state?.from?.pathname;

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    setLocalErr('');

    if (!email.trim() || !password.trim()) {
      setLocalErr('Please enter your email and password.');
      return;
    }

    try {
      const user = await login(email.trim(), password);
      // Redirect to the page they tried to visit; fall back to their dashboard
      navigate(from || ROLE_ROUTES[user.role] || '/dashboard/farmer', { replace: true });
    } catch (err) {
      setLocalErr(err.message);
    }
  }, [email, password, login, navigate, from]);

  const handleQuickLogin = useCallback(async (demoKey) => {
    const creds = DEMO_CREDENTIALS[demoKey];
    setEmail(creds.email);
    setPassword(creds.password);
    setActiveDemo(demoKey);
    setLocalErr('');

    try {
      const user = await login(creds.email, creds.password);
      navigate(ROLE_ROUTES[user.role] || '/dashboard/farmer', { replace: true });
    } catch (err) {
      setLocalErr(err.message);
    }
  }, [login, navigate]);

  const displayError = localErr || authError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a5c3a] via-[#0D7A51] to-[#1a9967] flex items-center justify-center p-4">

      {/* Background texture overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      <div className="relative w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Header Band */}
          <div className="bg-gradient-to-br from-[#0D7A51] to-[#0a5c3a] px-8 py-8 text-center">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M12 2a9 9 0 0 1 9 9c0 4.97-9 13-9 13S3 15.97 3 11a9 9 0 0 1 9-9z"/>
                  <circle cx="12" cy="11" r="3"/>
                </svg>
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-extrabold text-white tracking-tight leading-none">KisanConnect</h1>
                <p className="text-[0.72rem] text-white/70 font-medium tracking-widest uppercase">Agri Intelligence Platform</p>
              </div>
            </div>
            <p className="text-white/80 text-sm font-medium">Sign in to access your dashboard</p>
          </div>

          {/* Form Body */}
          <div className="px-8 py-7">

            {/* Error Banner */}
            {displayError && (
              <div className="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-[0.82rem] font-medium animate-fade-in">
                <svg className="shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {displayError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.75rem] font-bold text-gray-600 uppercase tracking-wider" htmlFor="login-email">
                  Email / Phone
                </label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="farmer@demo.com"
                    autoComplete="email"
                    className="w-full bg-gray-50 border-[1.5px] border-gray-200 rounded-xl pl-10 pr-4 py-3 text-[0.88rem] text-gray-900 placeholder-gray-400 outline-none focus:border-[#0D7A51] focus:ring-2 focus:ring-[#0D7A51]/10 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.75rem] font-bold text-gray-600 uppercase tracking-wider" htmlFor="login-password">
                  Password
                </label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full bg-gray-50 border-[1.5px] border-gray-200 rounded-xl pl-10 pr-4 py-3 text-[0.88rem] text-gray-900 placeholder-gray-400 outline-none focus:border-[#0D7A51] focus:ring-2 focus:ring-[#0D7A51]/10 transition-all"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl py-3.5 text-[0.95rem] font-bold text-white flex items-center justify-center gap-2.5 transition-all active:scale-[0.97] disabled:opacity-75 disabled:cursor-not-allowed mt-1"
                style={{ background: 'linear-gradient(135deg,#0F9361,#0D7A51)', boxShadow: '0 4px 18px rgba(13,122,81,0.35)' }}
              >
                {isLoading ? (
                  <>
                    <svg className="solver-ring w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    Signing in…
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                    Sign In to Dashboard
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <span className="flex-1 h-px bg-gray-200" />
              <span className="text-[0.72rem] text-gray-400 font-medium">Demo Quick Login</span>
              <span className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Quick Login Buttons */}
            <div className="flex flex-col gap-2.5">
              {Object.entries(DEMO_CREDENTIALS).map(([key, creds]) => (
                <button
                  key={key}
                  id={`quick-login-${key}`}
                  onClick={() => handleQuickLogin(key)}
                  disabled={isLoading}
                  className={`w-full rounded-2xl py-3 text-[0.85rem] font-bold flex items-center justify-between px-4 transition-all active:scale-[0.97] disabled:opacity-60 border-[1.5px] ${
                    activeDemo === key && isLoading
                      ? 'bg-[#E6F4EF] border-[#0D7A51] text-[#0D7A51]'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-[#0D7A51]/40 hover:bg-[#E6F4EF]/50 hover:text-[#0D7A51]'
                  }`}
                >
                  <span>{creds.label}</span>
                  <span className="text-[0.7rem] text-gray-400 font-normal">{creds.email}</span>
                </button>
              ))}
            </div>

          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-[0.72rem] text-gray-400">
              🔒 Secured with JWT · RBAC Authentication · © 2026 KisanConnect
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
