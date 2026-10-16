import React from 'react';
import {
  Radio,
  Lock,
  Terminal,
  LogOut,
  LogIn,
  Sliders,
  ChevronDown,
  User,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { DEPARTMENT_INFO } from '../data/mockData';

export default function Navigation({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onLogout,
  publicIssuesCount,
  confidentialCount
}) {
  const isRep = currentUser?.role === 'representative';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-black/75 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo Lockup */}
        <div
          className="flex items-center gap-3.5 cursor-pointer group select-none"
          onClick={() => setActiveTab('public')}
          title="ECE Connect — GEC Sreekrishnapuram"
        >
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/15 p-1 flex items-center justify-center overflow-hidden transition-all duration-200 group-hover:border-white/35 group-hover:scale-[1.02] shadow-sm">
            <img
              src="/logo.png"
              alt="ECE GEC PKD Logo"
              className="w-full h-full object-contain filter invert brightness-125 contrast-125"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[15px] tracking-tight text-white group-hover:text-zinc-200 transition-colors">
                ECE Connect
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/[0.08] text-zinc-300 border border-white/[0.08] tracking-wide">
                GECSKP
              </span>
            </div>
            <span className="text-[11px] text-zinc-400 hidden sm:block font-normal">
              Dept. of Electronics & Communication Engineering
            </span>
          </div>
        </div>

        {/* Central Segmented Pill Navigation */}
        <nav className="flex items-center p-1 bg-zinc-900/70 border border-white/[0.08] rounded-full shadow-inner">
          {/* Stream A: Public Community Wall */}
          <button
            onClick={() => setActiveTab('public')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              activeTab === 'public'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Community Wall</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'public'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white/[0.08] text-zinc-400'
              }`}
            >
              {publicIssuesCount}
            </span>
          </button>

          {/* Stream B: Confidential Vault */}
          <button
            onClick={() => setActiveTab('confidential')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              activeTab === 'confidential'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Confidential Vault</span>
            {currentUser && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === 'confidential'
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white/[0.08] text-zinc-400'
                }`}
              >
                {confidentialCount}
              </span>
            )}
          </button>

          {/* Stream C: Representative Operations Desk (Only if unlocked) */}
          {isRep && (
            <button
              onClick={() => setActiveTab('operations')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                activeTab === 'operations'
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-white bg-white/[0.08] hover:bg-white/[0.14]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Operations Desk</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </button>
          )}
        </nav>

        {/* User Account / Ingress */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2.5">
              {/* User Identity Pill */}
              <div className="hidden sm:flex flex-col text-right">
                <div className="text-xs font-medium text-white flex items-center justify-end gap-1.5">
                  {currentUser.role === 'representative' && (
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" />
                  )}
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  {currentUser.rollNumber} • {currentUser.role === 'representative' ? 'Official Rep' : currentUser.batch}
                </div>
              </div>

              {/* Status Badge */}
              <div className="px-2.5 py-1 rounded-full bg-zinc-900 border border-white/[0.1] text-[11px] font-mono text-zinc-300">
                {currentUser.role === 'representative' ? 'REP' : currentUser.rollNumber}
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                title="Sign out of institutional session"
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.05] hover:bg-white/[0.12] border border-white/[0.08] text-zinc-400 hover:text-white transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-medium transition-all shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In with GECSKP</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
