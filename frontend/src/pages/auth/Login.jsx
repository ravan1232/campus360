import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, getRoleDefaultPath } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import campusHeroImg from '../../assets/images/campus_hero.jpg';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  X,
  CheckCircle2,
  KeyRound
} from 'lucide-react';

const Login = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { user, isAuthenticated, login, logout } = useAuth();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = loginId.trim();
    const pass = password.trim();

    if (!id || !pass) {
      setErrorMsg('Please enter both your User ID / Email and password.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await login(id, pass);
      setLoading(false);

      if (res && res.success && res.user) {
        addToast(`Welcome back, ${res.user.name}!`, 'success', 'Sign In Successful');
        navigate(getRoleDefaultPath(res.user.role));
      } else {
        setErrorMsg(res?.message || 'Invalid institutional credentials. Please check and try again.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Unable to connect to the campus authentication service.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-blue-600 selection:text-white lg:grid lg:grid-cols-12">
      {/* LEFT COLUMN: HERO CANVAS (58% desktop) */}
      <section className="relative flex flex-col justify-between overflow-hidden bg-slate-950 p-6 sm:p-10 lg:col-span-7 lg:min-h-screen lg:p-14">
        {/* Background Image with Fallback and Multi-layer Gradient */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={campusHeroImg}
            alt="Campus 360 University Campus"
            className="h-full w-full object-cover object-center brightness-[0.88] contrast-[1.08] transition-transform duration-1000 ease-out hover:scale-105"
            onError={(e) => {
              if (e.target.src !== '/images/campus_hero.jpg') {
                e.target.src = '/images/campus_hero.jpg';
              }
            }}
          />
          {/* Cinematic lighting gradients with blue tone overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/30 to-slate-950/50" />
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-600/25 blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        </div>

        {/* Top Bar Branding */}
        <div className="relative z-10 flex items-center justify-between animate-[fade-up_0.5s_ease-out]">
          <div className="flex items-center gap-3.5">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 ring-2 ring-white/20 border border-white/20 backdrop-blur-xl shadow-xl shadow-black/40 transition-transform duration-300 hover:scale-105">
              <GraduationCap className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">Campus 360</span>
                <span className="rounded-md border border-blue-400/30 bg-blue-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-300 ring-1 ring-blue-400/30">
                  Enterprise
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-300">Unified Institutional Ecosystem</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2.5 rounded-full border border-white/20 bg-slate-950/60 px-4 py-1.5 text-xs font-medium text-slate-200 ring-1 ring-white/15 backdrop-blur-md shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
            </span>
            <span>Cloud v2.6 • All Systems Live</span>
          </div>
        </div>

        {/* Hero Headline & Value Props */}
        <div className="relative z-10 my-10 max-w-2xl lg:my-auto animate-[fade-up_0.6s_ease-out]">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/15 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-300 ring-1 ring-blue-500/30 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" /> Next-Generation Campus OS
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.08]">
            Intelligence for the <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-200 bg-clip-text text-transparent">connected</span> institution.
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-200 sm:text-base">
            Synchronizing academic administration, biometric QR gate passes, real-time GPS fleet telemetry, and bursar reconciliations under one frictionless system.
          </p>

          {/* Live Campus Highlights Grid with crisp borders & hover animations */}
          <div className="mt-8 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            <div className="group relative rounded-2xl border-2 border-white/15 bg-white/[0.08] p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/60 hover:bg-white/[0.14] hover:shadow-xl hover:shadow-blue-500/20">
              <div className="text-xl font-black text-white sm:text-2xl transition-colors group-hover:text-blue-300">1,240+</div>
              <div className="text-[11px] font-semibold text-slate-300">Enrolled Scholars</div>
            </div>

            <div className="group relative rounded-2xl border-2 border-white/15 bg-white/[0.08] p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/60 hover:bg-white/[0.14] hover:shadow-xl hover:shadow-blue-500/20">
              <div className="text-xl font-black text-blue-400 sm:text-2xl transition-colors group-hover:text-blue-300">99.2%</div>
              <div className="text-[11px] font-semibold text-slate-300">Daily Attendance</div>
            </div>

            <div className="group relative rounded-2xl border-2 border-white/15 bg-white/[0.08] p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/60 hover:bg-white/[0.14] hover:shadow-xl hover:shadow-blue-500/20">
              <div className="text-xl font-black text-sky-300 sm:text-2xl transition-colors group-hover:text-sky-200">Route 14</div>
              <div className="text-[11px] font-semibold text-slate-300">Live GPS Fleet</div>
            </div>

            <div className="group relative rounded-2xl border-2 border-white/15 bg-white/[0.08] p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/60 hover:bg-white/[0.14] hover:shadow-xl hover:shadow-blue-500/20">
              <div className="text-xl font-black text-indigo-300 sm:text-2xl transition-colors group-hover:text-indigo-200">Instant</div>
              <div className="text-[11px] font-semibold text-slate-300">QR Gate Passes</div>
            </div>
          </div>
        </div>

        {/* Hero Footer Badges */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-5 text-xs text-slate-300 animate-[fade-up_0.7s_ease-out]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-400" />
            <span>256-Bit SSL/TLS Encryption • ISO 27001 Certified • FERPA & GDPR Compliant</span>
          </div>
          <div className="text-slate-400">© 2026 Campus 360 Inc.</div>
        </div>
      </section>

      {/* RIGHT COLUMN: FOCUSED LOGIN ID & PASSWORD FORM (42% desktop) */}
      <section className="relative flex flex-col justify-between bg-slate-50 px-6 py-10 dark:bg-slate-950 sm:px-10 lg:col-span-5 lg:min-h-screen lg:px-12 lg:py-14">
        <div className="mx-auto my-auto w-full max-w-md animate-[fade-up_0.5s_cubic-bezier(0.16,1,0.3,1)_both]">
          {/* Active Session Notification (If already logged in) */}
          {isAuthenticated && user && (
            <div className="mb-6 overflow-hidden rounded-2xl border-2 border-blue-200 bg-blue-50/90 p-4 shadow-md shadow-blue-500/10 dark:border-blue-900/60 dark:bg-blue-950/50 transition-all duration-300 hover:border-blue-300">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-xs font-bold text-white shadow-md shadow-blue-600/30">
                    {user.name ? user.name[0] : 'U'}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-blue-950 dark:text-blue-100">
                      Active session: <span className="font-extrabold">{user.name}</span>
                    </p>
                    <p className="text-[11px] text-blue-700 dark:text-blue-300">
                      Role: <span className="font-semibold uppercase">{user.role || 'User'}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-lg px-2.5 py-1 text-[11px] font-bold text-blue-800 hover:bg-blue-200/70 dark:text-blue-200 dark:hover:bg-blue-900/60 transition"
                >
                  Sign Out
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2 pt-2.5 border-t border-blue-200/70 dark:border-blue-800/50">
                <button
                  type="button"
                  onClick={() => navigate(getRoleDefaultPath(user.role))}
                  className="group flex items-center gap-1.5 text-xs font-extrabold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
                >
                  <span>Continue to Workspace Portal</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          )}

          {/* Form Container with Proper Borders & Shadow */}
          <div className="rounded-3xl border-2 border-slate-200/90 bg-white p-6 shadow-xl shadow-slate-200/60 transition-all duration-300 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none dark:hover:border-slate-700 sm:p-8">
            {/* Form Header */}
            <div className="mb-7">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-500/20 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Secure Institutional Portal</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Sign In
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Enter your institutional Login ID or email and password to access your campus workspace.
              </p>
            </div>

            {/* Error Message Box */}
            {errorMsg && (
              <div className="mb-6 flex items-center gap-2.5 rounded-xl border-2 border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200 animate-[fade-up_0.2s_ease-out]">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <div className="flex-1">{errorMsg}</div>
                <button onClick={() => setErrorMsg('')} className="text-rose-500 hover:text-rose-700">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Login ID / Institutional Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="e.g. TEC-002, 001, or teacher@campus360.edu"
                    className="w-full rounded-xl border-2 border-slate-200 bg-slate-50/50 py-3.5 pl-10 pr-9 text-sm font-semibold text-slate-900 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:focus:bg-slate-900 dark:focus:border-blue-500"
                  />
                  {loginId && (
                    <button
                      type="button"
                      onClick={() => setLoginId('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border-2 border-slate-200 bg-slate-50/50 py-3.5 pl-10 pr-10 text-sm font-semibold text-slate-900 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:focus:bg-slate-900 dark:focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-0.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-2 border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
                  />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Remember this device
                  </span>
                </label>

                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                  <CheckCircle2 className="h-3 w-3 text-blue-500" />
                  Encrypted Session
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-between rounded-xl bg-blue-600 px-6 py-4 text-sm font-extrabold text-white shadow-lg shadow-blue-600/30 transition-all duration-300 hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
              >
                <span>{loading ? 'Verifying Credentials...' : 'Sign In to Workspace'}</span>
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/15 transition-transform duration-200 group-hover:translate-x-1 group-hover:bg-white/25">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer info */}
        <div className="mx-auto mt-8 w-full max-w-md border-t border-slate-200/80 pt-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <p>Campus 360 Enterprise ERP • Version 2.6.4 • Single Institutional Authority</p>
        </div>
      </section>
    </div>
  );
};

export default Login;
