import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, User, Mail, ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { DzinoponaLogo } from '../components/DzinoponaLogo';

export const AuthView: React.FC = () => {
  const { authStatus, login, bootstrapAdmin, navigateTo, checkAuthStatus } = useCms();

  // Form states
  const [isBootstrap, setIsBootstrap] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Bootstrap fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If user is already authenticated, redirect to /admin
    if (authStatus.isAuthenticated) {
      navigateTo('admin');
      return;
    }

    // If no admin exists in system, default to bootstrap mode
    if (authStatus.hasAdmin === false) {
      setIsBootstrap(true);
    } else {
      setIsBootstrap(false);
    }
  }, [authStatus.hasAdmin, authStatus.isAuthenticated, navigateTo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!identifier.trim() || !password) {
      setError('Please provide your username/email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(identifier.trim(), password);
      if (result.success) {
        setSuccessMsg('Authentication successful. Redirecting to CMS Dashboard...');
        setTimeout(() => {
          navigateTo('admin');
        }, 400);
      } else {
        setError(result.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!fullName.trim() || !username.trim() || !email.trim() || !password) {
      setError('All fields are required to provision the first administrator.');
      return;
    }

    if (username.trim().length < 3) {
      setError('Username must contain at least 3 characters.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await bootstrapAdmin({
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (result.success) {
        setSuccessMsg('Master administrator provisioned. Launching CMS Dashboard...');
        setTimeout(() => {
          navigateTo('admin');
        }, 500);
      } else {
        setError(result.error || 'Bootstrap failed. An administrator may already exist.');
        await checkAuthStatus();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete administrator bootstrap.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111c13] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-[#ede8d8] selection:text-[#18261b]">
      {/* Background architectural glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#1d3522] via-[#111c13] to-[#0a110b] pointer-events-none opacity-80" />

      {/* Top Bar with Return Link */}
      <div className="absolute top-6 left-6 z-20">
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className="inline-flex items-center gap-2 text-xs font-medium text-[#abb8ad] hover:text-[#faf9f5] transition-colors bg-[#18281b]/80 border border-white/10 px-3 py-1.5 rounded-lg"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Public Website</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brandmark */}
        <div className="flex justify-center mb-4">
          <DzinoponaLogo size="xl" variant="emblem" />
        </div>

        <h2 className="text-center text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#faf9f5]">
          {isBootstrap ? 'First-Admin Provisioning' : 'CMS Administrator Access'}
        </h2>
        <p className="mt-1.5 text-center text-xs sm:text-sm text-[#95a898]">
          {isBootstrap
            ? 'Dzinopona Farms internal content management initialization'
            : 'Authorized personnel and administrative editors only'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-[#18261b] border border-white/15 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 text-[#f5f2e8]">
          {/* Bootstrap Notice */}
          {isBootstrap && (
            <div className="mb-6 p-4 rounded-xl bg-[#2a3c2e] border border-[#44624b] text-xs text-[#d8e2da] space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-[#e5a952]">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>One-Time System Initialization</span>
              </div>
              <p className="leading-relaxed text-[11.5px] text-[#c2d1c5]">
                No administrator account exists yet. Complete this form to establish the primary administrator credentials. This bootstrap procedure will permanently lock once finished.
              </p>
            </div>
          )}

          {/* Feedback messages */}
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-950/80 border border-red-800/80 text-xs text-red-200 flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-xs text-emerald-200 flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Login Form */}
          {!isBootstrap ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#abb8ad] mb-1.5">
                  Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7b8e7e]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="admin or user@dzinoponafarms.co.zw"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#111c13] border border-white/20 text-[#faf9f5] placeholder-[#5c7060] text-sm focus:outline-hidden focus:border-[#e5a952] focus:ring-1 focus:ring-[#e5a952] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#abb8ad] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7b8e7e]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg bg-[#111c13] border border-white/20 text-[#faf9f5] placeholder-[#5c7060] text-sm focus:outline-hidden focus:border-[#e5a952] focus:ring-1 focus:ring-[#e5a952] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7b8e7e] hover:text-[#faf9f5]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-[#e5a952] hover:bg-[#d4973f] text-[#142217] font-semibold text-sm rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to CMS Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* First-Admin Bootstrap Form */
            <form onSubmit={handleBootstrap} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#abb8ad] mb-1.5">
                  Administrator Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Master Administrator"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#111c13] border border-white/20 text-[#faf9f5] placeholder-[#5c7060] text-sm focus:outline-hidden focus:border-[#e5a952] focus:ring-1 focus:ring-[#e5a952] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#abb8ad] mb-1.5">
                  Admin Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7b8e7e]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin or director"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#111c13] border border-white/20 text-[#faf9f5] placeholder-[#5c7060] text-sm focus:outline-hidden focus:border-[#e5a952] focus:ring-1 focus:ring-[#e5a952] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#abb8ad] mb-1.5">
                  Official Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7b8e7e]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@dzinoponafarms.co.zw"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#111c13] border border-white/20 text-[#faf9f5] placeholder-[#5c7060] text-sm focus:outline-hidden focus:border-[#e5a952] focus:ring-1 focus:ring-[#e5a952] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#abb8ad] mb-1.5">
                    Password (min 8)
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2.5 rounded-lg bg-[#111c13] border border-white/20 text-[#faf9f5] placeholder-[#5c7060] text-sm focus:outline-hidden focus:border-[#e5a952] focus:ring-1 focus:ring-[#e5a952] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#abb8ad] mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2.5 rounded-lg bg-[#111c13] border border-white/20 text-[#faf9f5] placeholder-[#5c7060] text-sm focus:outline-hidden focus:border-[#e5a952] focus:ring-1 focus:ring-[#e5a952] transition-colors"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-[#e5a952] hover:bg-[#d4973f] text-[#142217] font-semibold text-sm rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isLoading ? 'Provisioning Master Admin...' : 'Create Master Administrator'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Institutional footer in card */}
          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-[11px] text-[#768b7a]">
            <span>Dzinopona Farms CMS v1.2</span>
            <span>Zero-Trust Route Isolation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
