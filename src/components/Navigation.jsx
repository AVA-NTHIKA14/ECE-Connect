import React from 'react';
import {
  LayoutGrid,
  Lock,
  LogOut,
  LogIn,
  Archive,
  FileText,
  ShieldCheck,
  User
} from 'lucide-react';
import { DEPARTMENT_INFO } from '../data/mockData';
import { isRepresentativeUser } from '../services/auth';

export default function Navigation({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenNewModal,
  publicIssuesCount = 0,
  confidentialCount = 0
}) {
  const isRep = isRepresentativeUser(currentUser);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand / Department Logo Lockup */}
        <div
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none shrink-0"
          onClick={() => setActiveTab('public')}
          title="ECE Connect — Government Engineering College Sreekrishnapuram Palakkad"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center overflow-hidden transition-all duration-200 group-hover:border-teal-500 shadow-xs">
            <img
              src="/logo.png"
              alt="Government Engineering College Sreekrishnapuram Palakkad Institutional Crest and Department of Electronics & Communication Engineering Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-[15px] sm:text-[17px] tracking-tight text-navy-900 group-hover:text-teal-700 transition-colors whitespace-nowrap">
                ECE Connect
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 whitespace-nowrap">
                GECP
              </span>
            </div>
            <span className="text-[12px] text-slate-500 hidden xl:block font-normal truncate max-w-[260px]">
              {DEPARTMENT_INFO.department}
            </span>
          </div>
        </div>

        {/* Central Navigation Tabs (Desktop) */}
        <nav
          aria-label="Department Navigation"
          className="hidden md:flex items-center p-1 bg-slate-100/90 border border-slate-200/90 rounded-full text-[13px] shrink-0"
        >
          {/* Community Complaint Wall */}
          <button
            onClick={() => setActiveTab('public')}
            aria-current={activeTab === 'public' ? 'page' : undefined}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all duration-150 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none ${
              activeTab === 'public'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-teal-600" />
            <span>Complaint Wall</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'public'
                  ? 'bg-teal-50 text-teal-800'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {publicIssuesCount}
            </span>
          </button>

          {/* My Complaints */}
          {currentUser && (
            <button
              onClick={() => setActiveTab('my_complaints')}
              aria-current={activeTab === 'my_complaints' ? 'page' : undefined}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all duration-150 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none ${
                activeTab === 'my_complaints'
                  ? 'bg-white text-navy-900 shadow-sm'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>My Complaints</span>
            </button>
          )}

          {/* Confidential Vault */}
          <button
            onClick={() => setActiveTab('confidential')}
            aria-current={activeTab === 'confidential' ? 'page' : undefined}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all duration-150 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none ${
              activeTab === 'confidential'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Confidential Vault</span>
            {currentUser && confidentialCount > 0 && (
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === 'confidential'
                    ? 'bg-navy-900 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {confidentialCount}
              </span>
            )}
          </button>

          {/* Archive */}
          <button
            onClick={() => setActiveTab('archive')}
            aria-current={activeTab === 'archive' ? 'page' : undefined}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all duration-150 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none ${
              activeTab === 'archive'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archive</span>
          </button>

          {/* Operations Desk (Rep only) */}
          {isRep && (
            <button
              onClick={() => setActiveTab('operations')}
              aria-current={activeTab === 'operations' ? 'page' : undefined}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all duration-150 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none ${
                activeTab === 'operations'
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'text-navy-900 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Rep Desk</span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            </button>
          )}
        </nav>

        {/* User Account / Ingress */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {currentUser ? (
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* User Identity */}
              <div className="hidden sm:flex flex-col text-right">
                <div className="text-[14px] font-bold text-navy-900 flex items-center justify-end gap-1">
                  {isRep && (
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                  )}
                  {currentUser.displayName || currentUser.rollNumber}
                </div>
                <div className="text-[12px] text-slate-500 font-mono">
                  {isRep ? 'ECE Representative (Official)' : currentUser.email}
                </div>
              </div>

              {/* Status Badge */}
              <div
                className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-bold whitespace-nowrap ${
                  isRep
                    ? 'bg-navy-900 text-white'
                    : 'bg-teal-50 border border-teal-200 text-teal-900'
                }`}
              >
                {isRep ? (
                  'REP'
                ) : (
                  <span>
                    {currentUser.semester ? `${currentUser.semester} • ` : ''}
                    {currentUser.rollNumber}
                  </span>
                )}
              </div>

              {/* Explicit Sign Out Button */}
              <button
                onClick={onLogout}
                aria-label="Sign out of institutional session"
                className="inline-flex items-center justify-center gap-1 sm:gap-1.5 h-8 sm:h-9 px-2 sm:px-3.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 hover:text-navy-900 text-[11px] sm:text-[13px] font-semibold tracking-normal shadow-2xs hover:shadow-xs transition-all duration-150 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#087F8C] focus-visible:outline-none whitespace-nowrap shrink-0"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-600 shrink-0" aria-hidden="true" />
                <span className="hidden xs:inline sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              aria-label="Sign In to ECE Connect"
              className="group inline-flex items-center justify-center gap-1.5 sm:gap-2 h-9 sm:h-10 px-3.5 sm:px-5 rounded-full bg-[#087F8C] hover:bg-[#06636E] text-white text-[13px] sm:text-[14px] font-semibold tracking-normal shadow-xs hover:shadow transition-all duration-150 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#087F8C] focus-visible:outline-none whitespace-nowrap shrink-0"
            >
              <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:translate-x-0.5 transition-transform duration-150" aria-hidden="true" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar with Lucide Icons */}
      <nav
        aria-label="Mobile Navigation"
        className="flex md:hidden overflow-x-auto border-t border-slate-200 px-2 py-1.5 gap-1.5 bg-slate-50 text-[12px] no-scrollbar"
      >
        <button
          onClick={() => setActiveTab('public')}
          aria-current={activeTab === 'public' ? 'page' : undefined}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold transition-all focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none ${
            activeTab === 'public'
              ? 'bg-white text-navy-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-navy-900'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5 text-teal-600" />
          <span>Complaint Wall</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-mono">
            {publicIssuesCount}
          </span>
        </button>

        {currentUser && (
          <button
            onClick={() => setActiveTab('my_complaints')}
            aria-current={activeTab === 'my_complaints' ? 'page' : undefined}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold transition-all focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none ${
              activeTab === 'my_complaints'
                ? 'bg-white text-navy-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>My Complaints</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('confidential')}
          aria-current={activeTab === 'confidential' ? 'page' : undefined}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold transition-all focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none ${
            activeTab === 'confidential'
              ? 'bg-white text-navy-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-navy-900'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Confidential Vault</span>
          {currentUser && confidentialCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-navy-900 text-white font-mono">
              {confidentialCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('archive')}
          aria-current={activeTab === 'archive' ? 'page' : undefined}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold transition-all focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none ${
            activeTab === 'archive'
              ? 'bg-white text-navy-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-navy-900'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          <span>Archive</span>
        </button>

        {isRep && (
          <button
            onClick={() => setActiveTab('operations')}
            aria-current={activeTab === 'operations' ? 'page' : undefined}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold transition-all focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none ${
              activeTab === 'operations'
                ? 'bg-navy-900 text-white shadow-xs'
                : 'text-navy-900 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Rep Desk</span>
          </button>
        )}
      </nav>
    </header>
  );
}
