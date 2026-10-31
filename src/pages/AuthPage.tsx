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
  Eye,
  EyeOff,
  Compass,
  CheckCircle2,
  RefreshCw,
  LogOut,
  Check,
} from 'lucide-react';

// Official Brand SVGs
export const GoogleLogoSvg: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const FacebookLogoSvg: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export const AuthPage: React.FC = () => {
  const {
    user,
    login,
    register,
    verifyEmail,
    resendVerificationCode,
    loginWithSocial,
    sendPasswordResetCode,
    confirmPasswordReset,
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
  const [isResending, setIsResending] = useState(false);

  // Social Login Modal State
  const [socialModalProvider, setSocialModalProvider] = useState<'google' | 'facebook' | null>(null);
  const [socialEmail, setSocialEmail] = useState('nazyhaqula@gmail.com');
  const [socialName, setSocialName] = useState('Nazyha Qula');

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
          <Check className="w-8 h-8 stroke-[3]" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#172b2a]">You are signed in!</h2>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#e5f1dc] text-[#28583d]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>
            {user.authProvider === 'google' && 'Google Account (Pre-Verified)'}
            {user.authProvider === 'facebook' && 'Facebook Account (Pre-Verified)'}
            {(!user.authProvider || user.authProvider === 'email') && 'Email Verified Account'}
          </span>
        </div>
        <p className="text-xs text-[#6f7d79]">
          Signed in as <strong>{user.name}</strong> ({user.email}).
        </p>
        <div className="pt-4 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => navigateTo('profile')}
            className="bg-[#073f3a] hover:bg-[#063430] text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-sm transition-all cursor-pointer"
          >
            Go to My Profile
          </button>
          <button
            onClick={() => navigateTo('home')}
            className="bg-white border border-[#e9e5dc] hover:bg-[#f7f3eb] text-[#172b2a] text-xs font-bold px-5 py-2.5 rounded-full transition-all cursor-pointer"
          >
            Explore Home
          </button>
          <button
            onClick={logout}
            className="text-xs text-red-600 hover:text-red-700 font-semibold px-4 py-2.5 flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  // Handle Resending 6-Digit Email Verification Code
  const handleResendCode = async () => {
    if (!email.trim()) {
      setErrorMsg('Please enter your email address to receive a verification code.');
      return;
    }
    setIsResending(true);
    setErrorMsg(null);
    const res = await resendVerificationCode(email.trim());
    setIsResending(false);
    if (res.success) {
      if (res.verificationCode) setServerDemoCode(res.verificationCode);
      setSuccessMsg(res.message || 'Verification code resent! Check your inbox.');
    } else {
      setErrorMsg(res.error || 'Failed to resend code.');
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    const cleanEmail = email.trim();

    // 1. SIGN IN FLOW (With Mandatory Verification Guard)
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
      } else if (res.unverified) {
        // Enforce email verification if account is not verified yet
        setServerDemoCode(res.verificationCode || '123456');
        setErrorMsg('Email verification is required before signing in. We have sent a 6-digit code to your email.');
        setAuthMode('verify-email');
      } else {
        setErrorMsg(res.error || 'Invalid email or password.');
      }
      setIsSubmitting(false);
      return;
    }

    // 2. SIGN UP FLOW (Requires Mandatory Email Verification)
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
        setSuccessMsg(`Account created! A 6-digit verification code was sent to ${cleanEmail}. Please enter the code below to activate your account.`);
        // Must verify email before accessing account
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
        navigateTo('home');
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

  // Open Social Auth Dialog
  const openSocialModal = (provider: 'google' | 'facebook') => {
    setSocialModalProvider(provider);
    if (provider === 'google') {
      setSocialEmail('nazyhaqula@gmail.com');
      setSocialName('Nazyha Qula');
    } else {
      setSocialEmail('nazyha.qula@facebook.com');
      setSocialName('Nazyha Qula');
    }
  };

  const handleExecuteSocialLogin = async () => {
    if (!socialModalProvider) return;
    setIsSubmitting(true);
    const res = await loginWithSocial(socialModalProvider, {
      name: socialName,
      email: socialEmail,
    });
    setIsSubmitting(false);
    if (res.success) {
      setSocialModalProvider(null);
    } else {
      setErrorMsg(res.error || 'Social sign-in failed.');
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
        <p className="text-xs text-[#6f7d79] max-w-sm mx-auto leading-relaxed">
          {authMode === 'signin' && 'Sign in to access your saved trips, favorites, and Malaysian local insights.'}
          {authMode === 'signup' && 'Sign up to personalize itineraries, sync favorites, and get local transit advice.'}
          {authMode === 'verify-email' && 'Email verification is required for email registrations. Enter your 6-digit code below.'}
          {authMode === 'reset-request' && 'Enter your registered email to receive a secure password verification code.'}
          {authMode === 'reset-confirm' && 'Verify your code and choose a secure new password.'}
        </p>
      </div>

      {/* Guest Mode Notification (if browsing as Guest) */}
      {user?.isGuest && (
        <div className="mb-4 bg-[#e8f5ed] border border-[#a8dec0] rounded-2xl p-3.5 text-xs text-[#174635] flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#20bf6b] flex-shrink-0" />
            <span>Currently exploring in <strong>Guest Mode</strong>.</span>
          </div>
          <button
            onClick={logout}
            className="text-[11px] font-bold text-[#073f3a] underline hover:no-underline cursor-pointer"
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
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
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
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-white text-[#073f3a] shadow-xs'
                  : 'text-[#6f7d79] hover:text-[#172b2a]'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* -------------------- SOCIAL SIGN-IN OPTIONS (GOOGLE & FACEBOOK) -------------------- */}
        {(authMode === 'signin' || authMode === 'signup') && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#6f7d79]">
              <span className="uppercase tracking-wider">Fast Social Sign-In</span>
              <span className="text-[#20bf6b] font-semibold text-[10px] bg-[#eefaf3] px-2 py-0.5 rounded-full border border-[#c6eed7]">
                ✓ No Email Code Needed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Google Sign-In */}
              <button
                type="button"
                onClick={() => openSocialModal('google')}
                className="flex items-center justify-center gap-2.5 bg-white hover:bg-[#faf8f5] border border-[#e5e1d7] hover:border-[#172b2a] text-[#172b2a] py-3 px-3.5 rounded-2xl text-xs font-bold transition-all shadow-2xs group cursor-pointer"
              >
                <GoogleLogoSvg className="w-4 h-4 flex-shrink-0" />
                <span>Continue with Google</span>
              </button>

              {/* Facebook Sign-In */}
              <button
                type="button"
                onClick={() => openSocialModal('facebook')}
                className="flex items-center justify-center gap-2.5 bg-white hover:bg-[#f6f8fe] border border-[#e5e1d7] hover:border-[#1877F2] text-[#172b2a] py-3 px-3.5 rounded-2xl text-xs font-bold transition-all shadow-2xs group cursor-pointer"
              >
                <FacebookLogoSvg className="w-4 h-4 flex-shrink-0" />
                <span>Continue with Facebook</span>
              </button>
            </div>

            {/* Quick Guest Explorer Access */}
            <div className="pt-1">
              <button
                type="button"
                onClick={loginAsGuest}
                className="w-full bg-[#f4f9f6] hover:bg-[#eaf4ef] border border-[#cde8d8] text-[#174635] py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-[#20bf6b]" />
                <span>Or explore as Guest (no login required)</span>
              </button>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#e9e5dc]"></div>
              <span className="flex-shrink mx-3 text-[11px] font-semibold text-[#9ca8a4] uppercase tracking-wider">
                {authMode === 'signin' ? 'Or sign in with email' : 'Or register with email'}
              </span>
              <div className="flex-grow border-t border-[#e9e5dc]"></div>
            </div>
          </div>
        )}

        {/* Notice for Email Registration requirement */}
        {authMode === 'signup' && (
          <div className="bg-[#fff9ee] border border-[#fae2b8] p-3 rounded-2xl text-[11px] text-[#855300] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#d97706] flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Mandatory Email Verification:</strong> For your security, email registrations require entering a 6-digit confirmation code before login. (Login via Google or Facebook skips this step).
            </div>
          </div>
        )}

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
            <div className="space-y-1 flex-1">
              <span className="leading-snug block">{successMsg}</span>
              {serverDemoCode && (
                <div className="mt-1 bg-white border border-green-300 rounded-lg p-2 text-[11px] text-[#174635] flex items-center justify-between">
                  <span>
                    Simulated Email Inbox Code:{' '}
                    <strong className="font-mono text-sm tracking-wider text-[#073f3a] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {serverDemoCode}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setVerificationCode(serverDemoCode)}
                    className="bg-[#073f3a] hover:bg-[#063430] text-white text-[10px] font-bold px-2 py-1 rounded cursor-pointer transition-colors"
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
                  placeholder="e.g. Nazyha Qula"
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
                  placeholder="name@domain.com"
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
                  className="text-[11px] text-[#ff5c7a] hover:underline font-semibold cursor-pointer"
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
                  placeholder="Enter your password"
                  className="w-full bg-transparent border-0 outline-none text-xs text-[#172b2a]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#6f7d79] hover:text-[#172b2a] p-1 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* -------------------- SIGN UP: PASSWORDS & LANGUAGE -------------------- */}
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
                    className="text-[#6f7d79] hover:text-[#172b2a] p-1 cursor-pointer"
                    aria-label="Toggle password visibility"
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
                    className="text-[#6f7d79] hover:text-[#172b2a] p-1 cursor-pointer"
                    aria-label="Toggle confirm password visibility"
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
                    className="w-full bg-transparent border-0 outline-none text-xs text-[#172b2a] cursor-pointer"
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
            <div className="space-y-4">
              <div className="bg-[#f2f8f5] border border-[#c3e3d4] p-3.5 rounded-2xl text-xs text-[#174635] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#20bf6b]" />
                  <span>Mandatory Verification for Email Accounts</span>
                </div>
                <div className="text-[11px] text-[#4a6b5e]">
                  Enter the 6-digit confirmation code dispatched to <strong>{email || 'your email'}</strong> to activate your account.
                </div>
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
                    className="w-full bg-transparent border-0 outline-none text-base font-mono tracking-widest text-[#172b2a] text-center font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#6f7d79]">Didn’t receive the code?</span>
                <button
                  type="button"
                  disabled={isResending}
                  onClick={handleResendCode}
                  className="text-[#073f3a] hover:text-[#052b27] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                  <span>{isResending ? 'Resending...' : 'Resend Code'}</span>
                </button>
              </div>
            </div>
          )}

          {/* -------------------- RESET REQUEST: EMAIL FIELD -------------------- */}
          {authMode === 'reset-request' && (
            <div className="text-[11px] text-[#6f7d79]">
              We will send a 6-digit recovery code to your registered email address.
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
              {authMode === 'signin' && 'Sign In with Email'}
              {authMode === 'signup' && 'Create Account & Get Code'}
              {authMode === 'verify-email' && 'Verify Code & Sign In'}
              {authMode === 'reset-request' && 'Send Password Reset Code'}
              {authMode === 'reset-confirm' && 'Save Password & Sign In'}
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
              className="text-[#073f3a] font-bold hover:underline cursor-pointer"
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
                className="text-[#073f3a] font-bold hover:underline cursor-pointer"
              >
                Sign Up with Email
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
                className="text-[#073f3a] font-bold hover:underline cursor-pointer"
              >
                Sign In here
              </button>
            </div>
          )}
        </div>
      </div>

      {/* -------------------- SOCIAL AUTH DIALOG (GOOGLE / FACEBOOK) -------------------- */}
      {socialModalProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-[#e9e5dc]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {socialModalProvider === 'google' ? (
                  <GoogleLogoSvg className="w-5 h-5" />
                ) : (
                  <FacebookLogoSvg className="w-5 h-5" />
                )}
                <h3 className="text-base font-extrabold text-[#172b2a]">
                  Sign in with {socialModalProvider === 'google' ? 'Google' : 'Facebook'}
                </h3>
              </div>
              <button
                onClick={() => setSocialModalProvider(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#6f7d79]">
              Social accounts are automatically verified by {socialModalProvider === 'google' ? 'Google' : 'Facebook'}. No manual email confirmation code is required!
            </p>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-[#172b2a] mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={socialName}
                  onChange={(e) => setSocialName(e.target.value)}
                  className="w-full bg-[#f7f3eb] rounded-xl px-3 py-2 text-xs border border-[#e9e5dc] outline-none focus:border-[#073f3a]"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#172b2a] mb-1">
                  {socialModalProvider === 'google' ? 'Google Email' : 'Facebook Email'}
                </label>
                <input
                  type="email"
                  value={socialEmail}
                  onChange={(e) => setSocialEmail(e.target.value)}
                  className="w-full bg-[#f7f3eb] rounded-xl px-3 py-2 text-xs border border-[#e9e5dc] outline-none focus:border-[#073f3a]"
                  placeholder="your-email@example.com"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleExecuteSocialLogin}
                className="w-full bg-[#073f3a] hover:bg-[#052b27] text-white text-xs font-bold py-2.5 rounded-full shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>Confirm & Sign In Directly</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setSocialModalProvider(null)}
                className="text-xs text-[#6f7d79] hover:text-[#172b2a] font-semibold py-1.5 cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
