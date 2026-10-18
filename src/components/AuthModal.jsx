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
  Send,
  KeyRound,
  Loader2
} from 'lucide-react';
import {
  signInUser,
  signUpStudent,
  sendPasswordReset,
  resendVerificationEmail,
  validateStudentEmail,
  isInstitutionalDomain,
  normalizeEmail,
  OFFICIAL_REPRESENTATIVE_EMAIL,
  signInAsRepresentative
} from '../services/auth';
import { DEPARTMENT_INFO } from '../data/mockData';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  // 'student' | 'rep'
  const [portalType, setPortalType] = useState('student');
  
  // Student Auth Modes: 'signin' | 'signup' | 'forgot' | 'verify_pending'
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Representative Security Key State
  const [repPasskey, setRepPasskey] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [unverifiedUser, setUnverifiedUser] = useState(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setAuthMode('signin');
    setRepPasskey('');
    onClose();
  };

  const handleStudentSignIn = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const normalized = normalizeEmail(email);
    if (!normalized) {
      setErrorMessage('Please enter your institutional student email.');
      return;
    }

    if (normalized === OFFICIAL_REPRESENTATIVE_EMAIL) {
      setErrorMessage('Representative Account: Please switch to the "Representative Portal" tab to authenticate with your representative security passkey.');
      return;
    }

    if (!isInstitutionalDomain(normalized)) {
      setErrorMessage(
        'External domain not allowed. Access is restricted to Government Engineering College Sreekrishnapuram Palakkad institutional accounts (@gecskp.ac.in).'
      );
      return;
    }

    setIsLoading(true);
    try {
      const user = await signInUser(normalized, password);
      if (!user.emailVerified) {
        setUnverifiedUser(user);
        setAuthMode('verify_pending');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Student authentication successful! Welcome to ECE Connect.');
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(user);
        handleClose();
      }, 600);
    } catch (err) {
      let msg = err.message || 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Incorrect password or institutional email combination.';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'No student account found with this institutional email. Please activate your account first.';
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepresentativeSignIn = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!repPasskey.trim()) {
      setErrorMessage('Representative Security Passkey is required.');
      return;
    }

    setIsLoading(true);
    try {
      const repUser = await signInAsRepresentative(OFFICIAL_REPRESENTATIVE_EMAIL, repPasskey.trim());
      setSuccessMessage('Representative verified! Opening Department Operations Desk...');
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(repUser);
        handleClose();
      }, 700);
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Invalid representative credentials.');
    } finally {
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

    if (normalized === OFFICIAL_REPRESENTATIVE_EMAIL) {
      setErrorMessage('The representative account is officially provisioned. Please switch to the Representative Portal to log in.');
      return;
    }

    const isStudent = validateStudentEmail(normalized);
    if (!isStudent) {
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
      const user = await signUpStudent(normalized, password, fullName.trim());
      setUnverifiedUser(user);
      setAuthMode('verify_pending');
      setSuccessMessage('Account created! A verification link has been dispatched to your institutional inbox.');
    } catch (err) {
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
      setSuccessMessage('Password reset instructions have been sent to your institutional email.');
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
    } catch {
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
                alt="Government Engineering College Sreekrishnapuram Palakkad Official Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-lg font-bold text-navy-900 tracking-tight leading-tight">
                {portalType === 'rep'
                  ? 'Representative Portal'
                  : authMode === 'forgot'
                  ? 'Reset Password'
                  : authMode === 'signup'
                  ? 'Activate Student ID'
                  : 'Student Portal'}
              </h2>
              <div className="text-xs text-slate-500 font-normal">
                {DEPARTMENT_INFO.institution}
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            aria-label="Close authentication dialog"
            className="p-2 rounded-xl text-slate-400 hover:text-navy-900 hover:bg-slate-200 transition-colors focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 space-y-4">
          
          {/* Dual Ingress Portal Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold" role="tablist" aria-label="Authentication portal selector">
            <button
              type="button"
              role="tab"
              aria-selected={portalType === 'student'}
              onClick={() => {
                setPortalType('student');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                portalType === 'student'
                  ? 'bg-white text-navy-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
              <span>Student Portal</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={portalType === 'rep'}
              onClick={() => {
                setPortalType('rep');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900 ${
                portalType === 'rep'
                  ? 'bg-navy-900 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" aria-hidden="true" />
              <span>Representative Portal</span>
            </button>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-800 flex items-start gap-2.5 animate-fadeIn"
            >
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-start gap-2.5 animate-fadeIn"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="leading-relaxed font-medium">{successMessage}</div>
            </div>
          )}

          {/* ============================================================ */}
          {/* REPRESENTATIVE PORTAL (RESTRICTED ACCESS) */}
          {/* ============================================================ */}
          {portalType === 'rep' && (
            <form onSubmit={handleRepresentativeSignIn} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 text-sm leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-900">
                  <Lock className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
                  <span>Restricted Access: Department Representative Only</span>
                </div>
                Access is strictly restricted to the official ECE Department Representative. Student accounts cannot log in through this portal.
              </div>

              <div>
                <label htmlFor="rep-ingress-email" className="block text-xs font-bold text-navy-900 uppercase tracking-wide mb-1.5">
                  Official Representative Ingress ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
                  <input
                    id="rep-ingress-email"
                    type="email"
                    readOnly
                    value={OFFICIAL_REPRESENTATIVE_EMAIL}
                    className="w-full bg-slate-100 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-base text-navy-900 font-mono cursor-not-allowed select-none font-semibold"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="rep-passkey" className="block text-xs font-bold text-navy-900 uppercase tracking-wide mb-1.5">
                  Representative Security Passkey *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
                  <input
                    id="rep-passkey"
                    type="password"
                    required
                    value={repPasskey}
                    onChange={(e) => setRepPasskey(e.target.value)}
                    placeholder="Enter representative security key"
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-navy-900 focus:ring-2 focus:ring-navy-900/20 rounded-xl pl-10 pr-4 py-2.5 text-base text-navy-900 placeholder-slate-400 outline-none transition-all"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !repPasskey.trim()}
                className="w-full h-11 px-5 bg-navy-900 hover:bg-navy-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-base font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900 focus-visible:ring-offset-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-teal-400" aria-hidden="true" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-teal-400" aria-hidden="true" />
                    <span>Authenticate as Representative</span>
                  </>
                )}
              </button>

              <div className="text-xs text-slate-500 text-center font-mono">
                Only authenticated representatives can triage grievances, update stages, and close tickets.
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* STUDENT PORTAL (ENROLLED STUDENTS ONLY) */}
          {/* ============================================================ */}
          {portalType === 'student' && authMode === 'signin' && (
            <form onSubmit={handleStudentSignIn} className="space-y-4">
              <div>
                <label
                  htmlFor="signin-email"
                  className="block text-xs font-bold text-navy-900 uppercase tracking-wide mb-1.5"
                >
                  Student Institutional Email
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
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 rounded-xl pl-10 pr-4 py-2.5 text-base text-navy-900 placeholder-slate-400 outline-none transition-all font-mono"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="signin-password"
                    className="text-xs font-bold text-navy-900 uppercase tracking-wide"
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
                    className="text-xs text-[#087F8C] hover:underline font-semibold focus-visible:outline-none focus-visible:underline"
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
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 rounded-xl pl-10 pr-4 py-2.5 text-base text-navy-900 placeholder-slate-400 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 px-5 bg-[#087F8C] hover:bg-[#06636E] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-base font-semibold flex items-center justify-center gap-2 shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#087F8C] focus-visible:outline-none active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In as Student</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
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
            </form>
          )}

          {/* FORM: Sign Up */}
          {portalType === 'student' && authMode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label
                  htmlFor="signup-name"
                  className="block text-xs font-bold text-navy-900 uppercase tracking-wide mb-1.5"
                >
                  Student Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
                  <input
                    id="signup-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aravind K"
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 rounded-xl pl-10 pr-4 py-2.5 text-base text-navy-900 placeholder-slate-400 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-email"
                  className="block text-xs font-bold text-navy-900 uppercase tracking-wide mb-1.5"
                >
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
                  <input
                    id="signup-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pkd24ec023@gecskp.ac.in"
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 rounded-xl pl-10 pr-4 py-2.5 text-base text-navy-900 placeholder-slate-400 outline-none transition-all font-mono"
                  />
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Format: pkd(23-26)ec(001-075)@gecskp.ac.in
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-xs font-bold text-navy-900 uppercase tracking-wide mb-1.5"
                >
                  Create Password (min. 6 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
                  <input
                    id="signup-password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 rounded-xl pl-10 pr-4 py-2.5 text-base text-navy-900 placeholder-slate-400 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 px-5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-base font-semibold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Activate Student Account</span>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
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
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* FORM: Forgot Password */}
          {portalType === 'student' && authMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-base text-slate-600">
                Enter your GECP student email to receive a password recovery link.
              </p>
              <div>
                <label htmlFor="forgot-email" className="block text-xs font-bold text-navy-900 uppercase tracking-wide mb-1.5">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pkd24ec023@gecskp.ac.in"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-base text-navy-900 font-mono outline-none focus:border-teal-600 focus-visible:ring-2 focus-visible:ring-teal-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-base font-semibold flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send Recovery Link</span>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className="text-xs text-slate-600 hover:underline font-semibold focus-visible:outline-none focus-visible:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* FORM: Email Verification Pending */}
          {portalType === 'student' && authMode === 'verify_pending' && (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-navy-900">Verification Link Dispatched</h3>
              <p className="text-base text-slate-600 leading-relaxed">
                A verification email was sent to your institutional inbox. Please verify your address to access student features.
              </p>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleResendVerification}
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                >
                  <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Resend Verification Email</span>
                </button>
                <button
                  onClick={() => setAuthMode('signin')}
                  className="text-xs text-[#087F8C] hover:underline font-semibold mt-2 focus-visible:outline-none focus-visible:underline"
                >
                  Return to Sign In
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
