import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Info,
  RefreshCw,
  Send
} from 'lucide-react';
import {
  signInUser,
  signUpStudent,
  sendPasswordReset,
  resendVerificationEmail,
  validateStudentEmail,
  isInstitutionalDomain,
  normalizeEmail,
  OFFICIAL_STAFF_EMAILS,
  signInAsRepDemo
} from '../services/auth';
import { DEPARTMENT_INFO } from '../data/mockData';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  // 'signin' | 'signup' | 'forgot' | 'verify_pending'
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [unverifiedUser, setUnverifiedUser] = useState(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setAuthMode('signin');
    onClose();
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const normalized = normalizeEmail(email);
    if (!normalized) {
      setErrorMessage('Please enter your institutional email.');
      return;
    }

    if (!isInstitutionalDomain(normalized)) {
      setErrorMessage(
        'External domain not allowed. Access is restricted to Government Engineering College Sreekrishnapuram Palakkad (GECP) institutional accounts (@gecskp.ac.in).'
      );
      return;
    }

    setIsLoading(true);
    try {
      const user = await signInUser(normalized, password);
      // Check email verification status
      if (!user.emailVerified && !OFFICIAL_STAFF_EMAILS.includes(normalized)) {
        setUnverifiedUser(user);
        setAuthMode('verify_pending');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Authentication successful! Welcome to ECE Connect.');
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(user);
        handleClose();
      }, 700);
    } catch (err) {
      console.error('Sign-in error:', err);
      let msg = err.message || 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Incorrect password or institutional email combination.';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'No student account found with this institutional email. Please sign up first.';
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickRepLogin = () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const repUser = signInAsRepDemo();
      setSuccessMessage('Authenticated as ECE Department Representative!');
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(repUser);
        handleClose();
      }, 500);
    } catch (err) {
      setErrorMessage('Failed to sign in as representative.');
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const normalized = normalizeEmail(email);
    if (!normalized) {
      setErrorMessage('Institutional email is required.');
      return;
    }

    // Strict student pattern enforcement
    const isStudent = validateStudentEmail(normalized);
    const isStaff = OFFICIAL_STAFF_EMAILS.includes(normalized);

    if (!isStudent && !isStaff) {
      setErrorMessage(
        'Invalid Student ID format. Roll email must match an active ECE batch: S7 (pkd23ec001-075), S5 (pkd24ec001-075), S3 (pkd25ec001-075), or S1 (pkd26ec001-075) @gecskp.ac.in.'
      );
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await signUpStudent(normalized, password, fullName);
      setUnverifiedUser(user);
      setAuthMode('verify_pending');
      setSuccessMessage('Account created! A verification link has been dispatched to your institutional inbox.');
    } catch (err) {
      console.error('Sign-up error:', err);
      let msg = err.message || 'Registration failed.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this institutional email already exists. Please sign in.';
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const normalized = normalizeEmail(email);
    if (!normalized) {
      setErrorMessage('Please enter your @gecskp.ac.in institutional email.');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordReset(normalized);
      setSuccessMessage('Password reset instructions have been sent to your email.');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to dispatch reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedUser) return;
    try {
      await resendVerificationEmail(unverifiedUser);
      setSuccessMessage('A fresh verification link has been sent to your inbox.');
    } catch (err) {
      setErrorMessage('Failed to resend verification email.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-left">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs shrink-0">
              <img
                src="/logo.png"
                alt="GECP College Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-[17px] font-bold text-navy-900 tracking-tight leading-tight">
                {authMode === 'forgot'
                  ? 'Reset Password'
                  : authMode === 'signup'
                  ? 'Activate Student ID'
                  : 'Institutional Sign In'}
              </h2>
              <div className="text-[12px] text-slate-500 font-normal">
                {DEPARTMENT_INFO.institution}
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            aria-label="Close authentication dialog"
            className="p-2 rounded-xl text-slate-400 hover:text-navy-900 hover:bg-slate-200 transition-colors focus-visible:ring-2 focus-visible:ring-[#087F8C] focus-visible:outline-none"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 space-y-5">
          
          {/* Feedback messages */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-[13px] text-rose-800 flex items-start gap-2.5 animate-fadeIn"
            >
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[13px] text-emerald-800 flex items-start gap-2.5 animate-fadeIn"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="leading-relaxed font-medium">{successMessage}</div>
            </div>
          )}

          {/* FORM: Sign In */}
          {authMode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label
                  htmlFor="signin-email"
                  className="block text-[13px] font-bold text-navy-900 uppercase tracking-wide mb-1.5"
                >
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
                  <input
                    id="signin-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pkd24ec023@gecskp.ac.in"
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-navy-900 placeholder-slate-400 outline-none transition-all font-mono"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="signin-password"
                    className="text-[13px] font-bold text-navy-900 uppercase tracking-wide"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[12.5px] text-[#087F8C] hover:underline font-semibold focus-visible:outline-none focus-visible:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
                  <input
                    id="signin-password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-navy-900 placeholder-slate-400 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 px-5 bg-[#087F8C] hover:bg-[#06636E] disabled:opacity-50 text-white rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#087F8C] focus-visible:outline-none active:scale-[0.99]"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-[12.5px] text-slate-500">
                First time accessing ECE Connect?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-semibold text-[#087F8C] hover:underline focus-visible:outline-none focus-visible:underline"
                >
                  Activate Student Account
                </button>
              </div>

              {/* 1-Click Fast Representative Access */}
              <div className="pt-3 border-t border-slate-200 space-y-1.5">
                <button
                  type="button"
                  onClick={handleQuickRepLogin}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99]"
                >
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>1-Click Sign In as Department Representative</span>
                </button>
                <div className="text-[11px] text-slate-500 text-center font-mono">
                  Official Ingress: ece.rep@gecskp.ac.in (Role: Representative)
                </div>
              </div>
            </form>
          )}

          {/* FORM: Sign Up */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label
                  htmlFor="signup-name"
                  className="block text-[13px] font-bold text-navy-900 uppercase tracking-wide mb-1.5"
                >
                  Student Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
                  <input
                    id="signup-name"
                    type="text"
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-navy-900 placeholder-slate-400 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-email"
                  className="block text-[13px] font-bold text-navy-900 uppercase tracking-wide mb-1.5"
                >
                  Institutional Email (@gecskp.ac.in)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
                  <input
                    id="signup-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pkd25ec045@gecskp.ac.in"
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-navy-900 placeholder-slate-400 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-[13px] font-bold text-navy-900 uppercase tracking-wide mb-1.5"
                >
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
                  <input
                    id="signup-password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-navy-900 placeholder-slate-400 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 px-5 bg-[#087F8C] hover:bg-[#06636E] disabled:opacity-50 text-white rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#087F8C] focus-visible:outline-none active:scale-[0.99]"
              >
                {isLoading ? (
                  <span>Registering...</span>
                ) : (
                  <>
                    <span>Activate Account</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-[12.5px] text-slate-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-semibold text-[#087F8C] hover:underline focus-visible:outline-none focus-visible:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* FORM: Forgot Password */}
          {authMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="text-[14px] text-slate-600 leading-relaxed font-normal">
                Enter your registered GECP institutional email. We will send a secure password reset link to your official inbox.
              </div>

              <div>
                <label
                  htmlFor="forgot-email"
                  className="block text-[13px] font-bold text-navy-900 uppercase tracking-wide mb-1.5"
                >
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pkd24ec023@gecskp.ac.in"
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-navy-900 placeholder-slate-400 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-[13px] text-slate-600 hover:text-navy-900 font-semibold focus-visible:outline-none focus-visible:underline"
                >
                  Back to Sign In
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="h-10 px-5 bg-[#087F8C] hover:bg-[#06636E] text-white rounded-xl text-[14px] font-semibold shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#087F8C] focus-visible:outline-none active:scale-[0.99]"
                >
                  {isLoading ? 'Dispatching...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          )}

          {/* SCREEN: Email Verification Required */}
          {authMode === 'verify_pending' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-[18px] font-bold text-navy-900">
                Institutional Email Verification Required
              </h3>
              <p className="text-[14px] text-slate-600 leading-relaxed font-normal">
                A verification link was dispatched to <strong>{email}</strong>. Per GECP departmental security policies, verify ownership of this institutional account before accessing the grievance portal.
              </p>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleResendVerification}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-navy-900 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Resend Verification Link</span>
                </button>

                <button
                  onClick={() => {
                    setAuthMode('signin');
                  }}
                  className="text-[13px] text-teal-700 hover:underline font-semibold py-1"
                >
                  Back to Sign In (After verifying in your inbox)
                </button>
              </div>
            </div>
          )}

          {/* Institutional Security Notice */}
          <div className="pt-4 border-t border-slate-100 text-[12px] text-slate-400 text-center leading-normal">
            Institutional authentication powered by Firebase Auth. Unauthorized external access is restricted by Cloud Firestore security rules.
          </div>
        </div>
      </div>
    </div>
  );
}
