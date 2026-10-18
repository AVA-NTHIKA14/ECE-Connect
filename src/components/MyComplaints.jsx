import React, { useState } from 'react';
import {
  FileText,
  Lock,
  Globe,
  Clock,
  CheckCircle2,
  ChevronRight,
  Plus,
  LogIn,
  Inbox,
  EyeOff
} from 'lucide-react';

export default function MyComplaints({
  currentUser,
  publicIssues = [],
  privateGrievances = [],
  onSelectPublicIssue,
  onSelectPrivateGrievance,
  onOpenNewModal,
  onOpenAuth
}) {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'public' | 'private'

  if (!currentUser) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-navy-900 flex items-center justify-center mx-auto">
          <FileText className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-navy-900">Sign In to Track Your Complaints</h2>
        <p className="text-[15px] text-slate-700 leading-relaxed font-normal">
          Log in with your official GECP institutional ID to track the real-time resolution progress of your public issues and private grievances.
        </p>
        <div className="pt-2">
          <button
            onClick={onOpenAuth}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[14px] inline-flex items-center gap-2 shadow-xs transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to View Complaints</span>
          </button>
        </div>
      </div>
    );
  }

  // Filter student's own public issues
  const myPublic = publicIssues.filter(
    (issue) => issue.authorUid === currentUser.uid || issue.authorEmail?.toLowerCase() === currentUser.email?.toLowerCase()
  );

  // Private grievances owned by student
  const myPrivate = privateGrievances.filter(
    (g) => g.authorUid === currentUser.uid || g.authorEmail?.toLowerCase() === currentUser.email?.toLowerCase()
  );

  const combined = [
    ...myPublic.map((p) => ({ ...p, itemType: 'public' })),
    ...myPrivate.map((g) => ({ ...g, itemType: 'private' }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filtered = combined.filter((item) => {
    if (filterType === 'public') return item.itemType === 'public';
    if (filterType === 'private') return item.itemType === 'private';
    return true;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[13px] font-semibold text-slate-700">
              <FileText className="w-3.5 h-3.5" />
              <span>Personal Tracking Dashboard</span>
            </div>

            {/* Desktop Main Heading: 36-44px */}
            <h1 className="text-3xl sm:text-[38px] font-extrabold tracking-tight text-navy-900 leading-tight">
              My Complaints & Inquiries
            </h1>

            {/* Body Text: 15-16px */}
            <p className="text-[15px] sm:text-[16px] text-slate-700 font-normal leading-relaxed">
              Consolidated tracking for issues you have reported. Review active progress, check representative responses, and inspect resolved complaints.
            </p>
          </div>

          <div className="w-full sm:w-auto shrink-0">
            <button
              onClick={onOpenNewModal}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[15px] flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Raise New Issue</span>
            </button>
          </div>
        </div>

        {/* Counts */}
        <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[12px] sm:text-[13px] text-slate-500 font-medium">Total Raised by You</div>
            <div className="text-2xl sm:text-[26px] font-bold text-navy-900 font-mono mt-1">
              {combined.length}
            </div>
          </div>
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[12px] sm:text-[13px] text-slate-500 font-medium">Public Community Issues</div>
            <div className="text-2xl sm:text-[26px] font-bold text-teal-700 font-mono mt-1">
              {myPublic.length}
            </div>
          </div>
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80 col-span-2 sm:col-span-1">
            <div className="text-[12px] sm:text-[13px] text-slate-500 font-medium">Confidential Grievances</div>
            <div className="text-2xl sm:text-[26px] font-bold text-navy-900 font-mono mt-1">
              {myPrivate.length}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto no-scrollbar border-b border-slate-200 text-[13px] font-semibold gap-1">
        <button
          onClick={() => setFilterType('all')}
          className={`pb-3 px-3 sm:px-4 border-b-2 whitespace-nowrap transition-all ${
            filterType === 'all'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          All Complaints ({combined.length})
        </button>
        <button
          onClick={() => setFilterType('public')}
          className={`pb-3 px-3 sm:px-4 border-b-2 whitespace-nowrap transition-all ${
            filterType === 'public'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          Complaint Wall Issues ({myPublic.length})
        </button>
        <button
          onClick={() => setFilterType('private')}
          className={`pb-3 px-3 sm:px-4 border-b-2 whitespace-nowrap transition-all ${
            filterType === 'private'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          Confidential Grievances ({myPrivate.length})
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((item) => {
            const isPublic = item.itemType === 'public';
            return (
              <div
                key={`${item.itemType}-${item.id}`}
                onClick={() => {
                  if (isPublic) onSelectPublicIssue(item);
                  else onSelectPrivateGrievance(item);
                }}
                className="noticeboard-card p-5 border border-slate-200 hover:border-teal-500 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {isPublic ? (
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        Public Issue
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-navy-50 text-navy-900 border border-navy-200 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Confidential Grievance
                      </span>
                    )}

                    {(item.isAnonymous || item.hideIdentity || item.studentName?.includes('Anonymous')) && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                        <EyeOff className="w-3 h-3 text-slate-500" />
                        <span>Anonymous</span>
                      </span>
                    )}

                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                      {item.category}
                    </span>

                    <span className="text-[12px] text-slate-400 font-mono">
                      {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Title: 18-20px */}
                  <h3 className="text-[18px] sm:text-[19px] font-bold text-navy-900 group-hover:text-teal-700 transition-colors">
                    {item.title}
                  </h3>

                  {/* Body text: 15-16px */}
                  <p className="text-[15px] text-slate-700 line-clamp-1 font-normal">
                    {item.description || item.initialMessage}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-[13px] capitalize">
                    {item.stage ? item.stage.replace('_', ' ') : (item.status || 'Active')}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-teal-50 text-slate-400 group-hover:text-teal-700 flex items-center justify-center transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
            <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-[18px] font-bold text-navy-900">
              No Complaints Recorded
            </h4>
            <p className="text-[14px] text-slate-500 max-w-sm mx-auto font-normal">
              You haven't submitted any complaints under this filter yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
