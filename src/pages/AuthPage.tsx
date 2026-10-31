import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogoSvg } from '../components/Navbar';
import {
  Lock,
  Mail,
  User as UserIcon,
  Globe,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  Sparkles,
  Eye,
  EyeOff,
  UserCheck,
  Compass,
  CheckCircle2,
  RefreshCw,
  LogOut,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const {
    user,
    login,
    register,
    verifyEmail,
    sendPasswordResetCode,
    confirmPasswordReset,
    loginAsDemo,
    loginAsGuest,
    logout,
    navigateTo,
    showToast,
  } = useAuth();

  // Mode: 'signin' | 'signup' | 'verify-email' | 'reset-request' | 'reset-confirm'
  const [authMode, setAuthMode] = useState<
    'signin' | 'signup' | 'verify-email' | 'reset-request' | 'reset-confirm'
  >('signin');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verification & reset code states
  const [verificationCode, setVerificationCode] = useState('');
  const [serverDemoCode, setServerDemoCode] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // UI state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // If already logged in as a registered user (not guest)
  if (user && !user.isGuest) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#073f3a] text-white grid place-items-center text-2xl mx-auto shadow-md">
          ✓
        </div>
        <h2 className="text-2xl font-extrabold text-[#172b2a]">You are signed in!</h2>
        <p className="text-xs text-[#6f7d79]">
          Logged in as <strong>{user.name}</strong> ({user.email}).
        </p>
        <div className="pt-4 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => navigateTo('profile')}
            className="bg-[#073f3a] hover:bg-[#063430] text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-sm transition-all"
          >
            Go to My Profile
          </button>
          <button
            onClick={() => navigateTo('home')}
            className="bg-white border border-[#e9e5dc] hover:bg-[#f7f3eb] text-[#172b2a] text-xs font-bold px-5 py-2.5 rounded-full transition-all"
          >
            Explore Home
          </button>
          <button
            onClick={logout}
            className="text-xs text-red-600 hover:text-red-700 font-semibold px-4 py-2.5 flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch Account / Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    const cleanEmail = email.trim();

    // 1. SIGN IN FLOW
    if (authMode === 'signin') {
      if (!cleanEmail || !password.trim()) {
        setErrorMsg('Please enter both email address and password.');
        setIsSubmitting(false);
        return;
      }
      if (!EMAIL_REGEX.test(cleanEmail)) {
        setErrorMsg('Please enter a valid email address (e.g. name@domain.com).');
        setIsSubmitting(false);
        return;
      }

      const res = await login(cleanEmail, password);
      if (res.success) {
        navigateTo('home');
      } else {
        setErrorMsg(res.error || 'Invalid email or password.');
      }
      setIsSubmitting(false);
      return;
    }

    // 2. SIGN UP FLOW
    if (authMode === 'signup') {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
        setIsSubmitting(false);
        return;
      }
      if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
        setErrorMsg('Please provide a valid email address.');
        setIsSubmitting(false);
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        setIsSubmitting(false);
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please verify your password.');
        setIsSubmitting(false);
        return;
      }

      const res = await register(name, cleanEmail, password, confirmPassword, preferredLanguage);
      if (res.success) {
        setServerDemoCode(res.verificationCode || '123456');
        setSuccessMsg(`Account created! A 6-digit verification code was sent to ${cleanEmail}.`);
        setAuthMode('verify-email');
      } else {
        setErrorMsg(res.error || 'Failed to create account.');
      }
      setIsSubmitting(false);
      return;
    }

    // 3. EMAIL VERIFICATION FLOW
    if (authMode === 'verify-email') {
      if (!verificationCode.trim()) {
        setErrorMsg('Please enter the 6-digit verification code.');
        setIsSubmitting(false);
        return;
      }

      const res = await verifyEmail(cleanEmail, verificationCode.trim());
      if (res.success) {
        showToast('Email verified successfully! Welcome to MyLocal Mate 🌺');
        navigateTo('profile');
      } else {
        setErrorMsg(res.error || 'Invalid verification code. Please check and try again.');
      }
      setIsSubmitting(false);
      return;
    }

    // 4. REQUEST RESET CODE FLOW
    if (authMode === 'reset-request') {
      if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
        setErrorMsg('Please enter your registered email address.');
        setIsSubmitting(false);
        return;
      }

      const res = await sendPasswordResetCode(cleanEmail);
      if (res.success) {
        setServerDemoCode(res.demoCode || '123456');
        setSuccessMsg(res.message || 'Verification code sent to your email.');
        setAuthMode('reset-confirm');
      } else {
        setErrorMsg(res.error || 'Failed to generate reset code.');
      }
      setIsSubmitting(false);
      return;
    }

    // 5. CONFIRM PASSWORD RESET FLOW
    if (authMode === 'reset-confirm') {
      if (!verificationCode.trim()) {
        setErrorMsg('Please enter the 6-digit verification code.');
        setIsSubmitting(false);
        return;
      }
      if (newPassword.length < 6) {
        setErrorMsg('New password must be at least 6 characters long.');
        setIsSubmitting(false);
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setErrorMsg('New passwords do not match. Please re-enter.');
        setIsSubmitting(false);
        return;
      }

      const res = await confirmPasswordReset(
        cleanEmail,
        verificationCode.trim(),
        newPassword,
        confirmNewPassword
      );
      if (res.success) {
        setSuccessMsg('Password reset successfully! You can now sign in with your new password.');
        setPassword('');
        setConfirmPassword('');
        setAuthMode('signin');
      } else {
        setErrorMsg(res.error || 'Password reset failed.');
      }
      setIsSubmitting(false);
      return;
    }
  };

  return (
    <div className="max-w-[520px] mx-auto px-4 py-10 sm:py-12">
      {/* Brand Header */}
      <div className="text-center mb-6 space-y-2">
        <div className="flex justify-center mb-2">
          <LogoSvg size={52} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172b2a] tracking-tight">
          {authMode === 'signin' && 'Welcome Back, Mate'}
          {authMode === 'signup' && 'Create Your Account'}
          {authMode === 'verify-email' && 'Verify Your Email'}
          {authMode === 'reset-request' && 'Reset Password'}
          {authMode === 'reset-confirm' && 'Enter Verification Code'}
        </h1>
        <p className="text-xs text-[#6f7d79] max-w-sm mx-auto">
          {authMode === 'signin' && 'Sign in to access your saved trips, favorites, and custom Malaysian travel preferences.'}
          {authMode === 'signup' && 'Sign up to personalize itineraries, sync favorites, and get local transit advice.'}
          {authMode === 'verify-email' && 'Enter the 6-digit code sent to your email to complete verification.'}
          {authMode === 'reset-request' && 'Enter your registered email to receive a secure verification code.'}
          {authMode === 'reset-confirm' && 'Verify your code and choose a secure new password.'}
        </p>
      </div>

      {/* Guest Mode Notification (if browsing as Guest) */}
      {user?.isGuest && (
        <div className="mb-4 bg-[#e8f5ed] border border-[#a8dec0] rounded-2xl p-3.5 text-xs text-[#174635] flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#20bf6b] flex-shrink-0" />
            <span>Currently browsing in <strong>Guest Mode</strong>.</span>
          </div>
          <button
            onClick={logout}
            className="text-[11px] font-bold text-[#073f3a] underline hover:no-underline"
          >
            Exit Guest
          </button>
        </div>
      )}

      {/* Main Auth Card */}
      <div className="bg-white border border-[#e9e5dc] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        {/* Top Mode Navigation Tabs */}
        {(authMode === 'signin' || authMode === 'signup') && (
          <div className="flex bg-[#f7f3eb] p-1 rounded-2xl border border-[#e9e5dc]">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                authMode === 'signin'
                  ? 'bg-white text-[#073f3a] shadow-xs'
                  : 'text-[#6f7d79] hover:text-[#172b2a]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                authMode === 'signup'
                  ? 'bg-white text-[#073f3a] shadow-xs'
                  : 'text-[#6f7d79] hover:text-[#172b2a]'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Quick Instant Access Options: Guest Mode & Demo */}
        {(authMode === 'signin' || authMode === 'signup') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* 1. Guest Mode Button */}
            <button
              type="button"
              onClick={loginAsGuest}
              className="bg-[#f0f7f3] hover:bg-[#e2f1e8] border border-[#a8dec0] text-[#073f3a] p-3 rounded-2xl text-left transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#28583d] bg-white px-2 py-0.5 rounded-full border border-[#c3e8d4]">
                  No Password
                </span>
                <Compass className="w-4 h-4 text-[#20bf6b] group-hover:rotate-45 transition-transform" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#172b2a]">Continue as Guest</div>
                <div className="text-[10px] text-[#6f7d79]">Explore all features instantly</div>
              </div>
            </button>

            {/* 2. Demo Student Account Button */}
            <button
              type="button"
              onClick={loginAsDemo}
              className="bg-[#faf8f3] hover:bg-[#f2ecde] border border-[#e9e5dc] text-[#172b2a] p-3 rounded-2xl text-left transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#825c00] bg-[#fff8e1] px-2 py-0.5 rounded-full border border-[#ffe082]">
                  Demo Student
                </span>
                <Sparkles className="w-4 h-4 text-[#ffc107]" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#172b2a]">Ahmad Daniel</div>
                <div className="text-[10px] text-[#6f7d79]">With preloaded itineraries</div>
              </div>
            </button>
          </div>
        )}

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-[#e9e5dc]"></div>
          <span className="flex-shrink mx-3 text-[11px] font-semibold text-[#9ca8a4] uppercase tracking-wider">
            {authMode === 'signin' ? 'Or sign in with email' : authMode === 'signup' ? 'Or register with email' : 'Verification'}
          </span>
          <div className="flex-grow border-t border-[#e9e5dc]"></div>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-800 text-xs p-3.5 rounded-xl flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-600" />
            <div className="space-y-1">
              <span className="leading-snug block">{successMsg}</span>
              {serverDemoCode && (
                <div className="mt-1 bg-white border border-green-300 rounded-lg p-2 text-[11px] text-[#174635] flex items-center justify-between">
                  <span>Fast testing code: <strong className="font-mono text-sm">{serverDemoCode}</strong></span>
                  <button
                    type="button"
                    onClick={() => setVerificationCode(serverDemoCode)}
                    className="bg-[#073f3a] text-white text-[10px] font-bold px-2 py-1 rounded"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* -------------------- SIGN UP: NAME FIELD -------------------- */}
          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-[#172b2a] mb-1.5">
                Full Name
              </label>
              <div className="flex items-center gap-2 bg-[#f7f3eb] rounded-xl px-3 py-2.5 border border-[#e9e5dc] focus-within:border-[#073f3a] focus-within:bg-white transition-all">
                <UserIcon className="w-4 h-4 text-[#6f7d79]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full bg-transparent border-0 outline-none text-xs text-[#172b2a]"
                />
              </div>
            </div>
          )}

          {/* -------------------- EMAIL FIELD (SIGN IN, SIGN UP, RESET REQUEST) -------------------- */}
          {(authMode === 'signin' || authMode === 'signup' || authMode === 'reset-request') && (
            <div>
              <label className="block text-xs font-bold text-[#172b2a] mb-1.5">
                Email Address
              </label>
              <div className="flex items-center gap-2 bg-[#f7f3eb] rounded-xl px-3 py-2.5 border border-[#e9e5dc] focus-within:border-[#073f3a] focus-within:bg-white transition-all">
                <Mail className="w-4 h-4 text-[#6f7d79]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu.my"
                  className="w-full bg-transparent border-0 outline-none text-xs text-[#172b2a]"
                />
              </div>
            </div>
          )}

          {/* -------------------- SIGN IN: PASSWORD -------------------- */}
          {authMode === 'signin' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#172b2a]">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('reset-request');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-[11px] font-semibold text-[#073f3a] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="flex items-center gap-2 bg-[#f7f3eb] rounded-xl px-3 py-2.5 border border-[#e9e5dc] focus-within:border-[#073f3a] focus-within:bg-white transition-all">
                <Lock className="w-4 h-4 text-[#6f7d79]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-0 outline-none text-xs text-[#172b2a]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#6f7d79] hover:text-[#172b2a] p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* -------------------- SIGN UP: PASSWORD & CONFIRM PASSWORD -------------------- */}
          {authMode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#172b2a] mb-1.5">
                  Create Password (min. 6 characters)
                </label>
                <div className="flex items-center gap-2 bg-[#f7f3eb] rounded-xl px-3 py-2.5 border border-[#e9e5dc] focus-within:border-[#073f3a] focus-within:bg-white transition-all">
                  <Lock className="w-4 h-4 text-[#6f7d79]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-transparent border-0 outline-none text-xs text-[#172b2a]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#6f7d79] hover:text-[#172b2a] p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172b2a] mb-1.5">
                  Confirm Password
                </label>
                <div className="flex items-center gap-2 bg-[#f7f3eb] rounded-xl px-3 py-2.5 border border-[#e9e5dc] focus-within:border-[#073f3a] focus-within:bg-white transition-all">
                  <Lock className="w-4 h-4 text-[#6f7d79]" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full bg-transparent border-0 outline-none text-xs text-[#172b2a]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-[#6f7d79] hover:text-[#172b2a] p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[11px] text-red-600 mt-1">Passwords do not match.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172b2a] mb-1.5">
                  Preferred Language
                </label>
                <div className="flex items-center gap-2 bg-[#f7f3eb] rounded-xl px-3 py-2.5 border border-[#e9e5dc] focus-within:border-[#073f3a] focus-within:bg-white transition-all">
                  <Globe className="w-4 h-4 text-[#6f7d79]" />
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full bg-transparent border-0 outline-none text-xs text-[#172b2a]"
                  >
                    <option value="English">English</option>
                    <option value="Malay">Malay (Bahasa Melayu)</option>
                    <option value="Indonesian">Indonesian (Bahasa Indonesia)</option>
                    <option value="Chinese">Chinese (中文)</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* -------------------- VERIFY EMAIL: 6-DIGIT CODE -------------------- */}
          {authMode === 'verify-email' && (
            <div className="space-y-3">
              <div className="bg-[#f7fbf8] border border-[#d2ecde] p-3 rounded-2xl text-xs text-[#174635]">
                Verification code dispatched for <strong>{email}</strong>.
              </div>
              <div>
                <label className="block text-xs font-bold text-[#172b2a] mb-1.5">
                  6-Digit Verification Code
                </label>
                <div className="flex items-center gap-2 bg-[#f7f3eb] rounded-xl px-3 py-2.5 border border-[#e9e5dc] focus-within:border-[#073f3a] focus-within:bg-white transition-all">
                  <KeyRound className="w-4 h-4 text-[#6f7d79]" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="e.g. 123456"
                    className="w-full bg-transparent border-0 outline-none text-sm font-mono tracking-widest text-[#172b2a]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* -------------------- RESET CONFIRM: CODE + NEW PASSWORDS -------------------- */}
          {authMode === 'reset-confirm' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#172b2a] mb-1.5">
                  6-Digit Verification Code
                </label>
                <div className="flex items-center gap-2 bg-[#f7f3eb] rounded-xl px-3 py-2.5 border border-[#e9e5dc] focus-within:border-[#073f3a] focus-within:bg-white transition-all">
                  <KeyRound className="w-4 h-4 text-[#6f7d79]" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter code"
                    className="w-full bg-transparent border-0 outline-none text-sm font-mono tracking-widest text-[#172b2a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172b2a] mb-1.5">
                  New Password (min. 6 characters)
                </label>
                <div className="flex items-center gap-2 bg-[#f7f3eb] rounded-xl px-3 py-2.5 border border-[#e9e5dc] focus-within:border-[#073f3a] focus-within:bg-white transition-all">
                  <Lock className="w-4 h-4 text-[#6f7d79]" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-transparent border-0 outline-none text-xs text-[#172b2a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172b2a] mb-1.5">
                  Confirm New Password
                </label>
                <div className="flex items-center gap-2 bg-[#f7f3eb] rounded-xl px-3 py-2.5 border border-[#e9e5dc] focus-within:border-[#073f3a] focus-within:bg-white transition-all">
                  <Lock className="w-4 h-4 text-[#6f7d79]" />
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full bg-transparent border-0 outline-none text-xs text-[#172b2a]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#ff5c7a] hover:bg-[#f04f6e] text-white text-xs font-bold py-3 rounded-full transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            <span>
              {authMode === 'signin' && 'Sign In'}
              {authMode === 'signup' && 'Verify & Create Account'}
              {authMode === 'verify-email' && 'Confirm Verification'}
              {authMode === 'reset-request' && 'Send Verification Code'}
              {authMode === 'reset-confirm' && 'Save New Password & Sign In'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Bottom Switcher Links */}
        <div className="pt-3 border-t border-[#f0eee8] text-center text-xs text-[#6f7d79] space-y-2">
          {authMode === 'reset-request' || authMode === 'reset-confirm' || authMode === 'verify-email' ? (
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-[#073f3a] font-bold hover:underline"
            >
              ← Back to Sign In
            </button>
          ) : authMode === 'signin' ? (
            <div>
              Don’t have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-[#073f3a] font-bold hover:underline"
              >
                Sign Up for free
              </button>
            </div>
          ) : (
            <div>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-[#073f3a] font-bold hover:underline"
              >
                Sign In here
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
