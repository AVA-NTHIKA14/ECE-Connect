import React, { useState } from 'react';
import { ShieldAlert, ArrowRight, X, KeyRound, Lock, Info, CheckCircle2 } from 'lucide-react';
import { DEMO_USERS } from '../data/mockData';

export const STUDENT_EMAIL_REGEX = /^pkd\d{2}ec\d{3}@gecskp\.ac\.in$/i;
export const WHITELISTED_STAFF_EMAILS = [
  'ece.rep@gecskp.ac.in',
  'hod.ece@gecskp.ac.in',
  'staff.ece@gecskp.ac.in'
];

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [errorType, setErrorType] = useState(null); // 'external_domain' | 'format_mismatch'
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleValidateAndLogin = (e) => {
    e?.preventDefault();
    setErrorMessage(null);
    setErrorType(null);

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setErrorMessage('Institutional email address is required.');
      setErrorType('format_mismatch');
      return;
    }

    // 1. Check for external forbidden domains (e.g., gmail, yahoo, outlook)
    const domainMatch = trimmedEmail.split('@')[1];
    if (domainMatch && domainMatch !== 'gecskp.ac.in') {
      setErrorType('external_domain');
      setErrorMessage(
        `External domain "@${domainMatch}" is not permitted. ECE Connect is restricted to Government Engineering College Sreekrishnapuram accounts (@gecskp.ac.in).`
      );
      return;
    }

    // 2. Validate against regex or whitelisted emails
    const isStudentFormat = STUDENT_EMAIL_REGEX.test(trimmedEmail);
    const isWhitelistedRep = WHITELISTED_STAFF_EMAILS.includes(trimmedEmail);

    if (!isStudentFormat && !isWhitelistedRep) {
      setErrorType('format_mismatch');
      setErrorMessage(
        'Invalid Student ID format. Roll email must match pattern "pkd<YY>ec<NNN>@gecskp.ac.in" (e.g. pkd22ec045@gecskp.ac.in).'
      );
      return;
    }

    // Passed validation
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);

      let userObj;
      if (isWhitelistedRep) {
        userObj = {
          email: trimmedEmail,
          role: 'representative',
          name: 'ECE Student Representative',
          rollNumber: 'REP-ECE-OFFICIAL',
          batch: 'Association Executive Council'
        };
      } else {
        const rollMatch = trimmedEmail.match(/^pkd(\d{2})ec(\d{3})@/i);
        const year = rollMatch ? rollMatch[1] : '22';
        const num = rollMatch ? rollMatch[2] : '045';
        const rollNumUpper = `PKD${year}EC${num}`;
        
        const existing = DEMO_USERS.find(u => u.email.toLowerCase() === trimmedEmail);
        userObj = existing || {
          email: trimmedEmail,
          role: 'student',
          name: `Student (${rollNumUpper})`,
          rollNumber: rollNumUpper,
          batch: `S${Number(year) === 22 ? '5' : Number(year) === 23 ? '3' : '7'} ECE`
        };
      }

      onLoginSuccess(userObj);
      onClose();
    }, 350);
  };

  const handleQuickFill = (sampleEmail) => {
    setEmail(sampleEmail);
    setErrorMessage(null);
    setErrorType(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0D0D10] border border-white/[0.12] rounded-2xl p-6 sm:p-7 shadow-2xl text-left overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-black border border-white/15 p-1 flex items-center justify-center shadow-sm">
              <img
                src="/logo.png"
                alt="ECE GEC PKD Logo"
                className="w-full h-full object-contain filter invert brightness-125 contrast-125"
              />
            </div>
            <div>
              <div className="text-sm font-semibold text-white tracking-tight">
                ECE Connect
              </div>
              <div className="text-xs text-zinc-400 font-normal">
                GEC Sreekrishnapuram
              </div>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-white tracking-tight">
            Institutional Sign In
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-normal leading-relaxed">
            Enter your official institutional credentials to access the community wall and confidential student welfare channels.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleValidateAndLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-2">
              Institutional Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) {
                    setErrorMessage(null);
                    setErrorType(null);
                  }
                }}
                placeholder="pkd22ec045@gecskp.ac.in"
                className="w-full bg-black/50 border border-white/[0.1] focus:border-white/40 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-zinc-500 outline-none transition-all"
                autoFocus
              />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1.5 flex items-center gap-1 font-normal">
              <Info className="w-3 h-3 inline" />
              Pattern: pkd[YY]ec[NNN]@gecskp.ac.in
            </p>
          </div>

          {/* Validation Feedback */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-black/60 border border-white/20 text-xs text-zinc-200 animate-fadeIn">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white text-[11px] mb-0.5">
                    {errorType === 'external_domain' ? 'External Domain Not Allowed' : 'Invalid Credential Format'}
                  </div>
                  <div className="leading-relaxed text-zinc-300 text-[11px]">{errorMessage}</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="text-xs">Authenticating...</span>
            ) : (
              <>
                <span>Sign In with Institutional ID</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Fill Presets */}
        <div className="mt-6 pt-5 border-t border-white/[0.08]">
          <div className="text-[11px] font-medium text-zinc-400 mb-2">
            Quick-Test Presets (Click to load):
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => handleQuickFill('pkd22ec045@gecskp.ac.in')}
              className="w-full text-left px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-300 flex items-center justify-between transition-colors"
            >
              <span>pkd22ec045@gecskp.ac.in</span>
              <span className="text-[10px] text-zinc-500 font-sans">Student (S5)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('ece.rep@gecskp.ac.in')}
              className="w-full text-left px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-300 flex items-center justify-between transition-colors"
            >
              <span>ece.rep@gecskp.ac.in</span>
              <span className="text-[10px] text-zinc-500 font-sans">Department Rep</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('student@gmail.com')}
              className="w-full text-left px-3 py-1.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-dashed border-white/[0.08] text-zinc-400 flex items-center justify-between transition-colors"
            >
              <span>student@gmail.com</span>
              <span className="text-[10px] text-zinc-500 font-sans">Test Domain Rejection</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
