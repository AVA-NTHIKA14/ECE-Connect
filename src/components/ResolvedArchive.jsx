import React, { useState, useEffect } from 'react';
import {
  Archive,
  Search,
  CheckCircle2,
  Calendar,
  Building2,
  Clock,
  Eye,
  Loader2,
  Inbox
} from 'lucide-react';
import { subscribeArchivedIssues } from '../services/db';
import IssueDetailsModal from './IssueDetailsModal';

export default function ResolvedArchive({
  currentUser,
  onOpenAuth
}) {
  const [archivedIssues, setArchivedIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setErrorMessage(null);
    const unsubscribe = subscribeArchivedIssues(
      (data) => {
        setArchivedIssues(data);
        setIsLoading(false);
      },
      () => {
        setErrorMessage('Unable to load archived records at this time. Please try refreshing or check back later.');
        setIsLoading(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const filtered = archivedIssues.filter((issue) =>
    issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.lab?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section aria-labelledby="archive-heading" className="space-y-6 text-left">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[13px] font-semibold text-slate-700">
            <Archive className="w-3.5 h-3.5" />
            <span>Permanent Department Repository</span>
          </div>

          <h1 id="archive-heading" className="text-3xl sm:text-[38px] font-extrabold tracking-tight text-navy-900 leading-tight">
            Resolved Issues Archive
          </h1>

          <p className="text-base text-slate-700 font-normal leading-relaxed">
            Historical repository of verified and closed grievances at GECP. Issues here have been formally resolved, inspected by lab superintendents, and certified closed by the ECE Association representative.
          </p>
        </div>

        {/* Metric */}
        <div className="mt-6 pt-5 border-t border-slate-200 flex items-center gap-6">
          <div>
            <div className="text-[13px] text-slate-500 font-medium">Total Formally Closed</div>
            <div className="text-2xl sm:text-[26px] font-bold text-navy-900 font-mono mt-0.5">
              {isLoading ? '...' : archivedIssues.length}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <div className="text-[13px] text-slate-500 font-medium">Archive State</div>
            <div className="text-[14px] font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Verified & Permanent
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 flex items-center justify-between shadow-sm">
        <div className="relative flex-1">
          <label htmlFor="archive-search" className="sr-only">
            Search archived issues by keyword, equipment code, or lab
          </label>
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
          <input
            id="archive-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search archived issues by keyword, equipment code, or lab..."
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-600 rounded-lg pl-9 pr-4 py-2 text-base text-navy-900 placeholder-slate-400 outline-none"
          />
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div role="alert" className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-3" role="status">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
          <div className="text-base font-semibold text-navy-900">Loading Archived Records...</div>
        </div>
      )}

      {/* Grid of Archived Cards */}
      {!isLoading && !errorMessage && (
        filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((issue) => (
              <article
                key={issue.id}
                className="noticeboard-card p-6 border border-slate-200 flex flex-col justify-between group transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                      {issue.category}
                    </span>
                    <div className="closed-stamp">
                      CLOSED
                    </div>
                  </div>

                  <h3
                    onClick={() => setSelectedIssue(issue)}
                    className="text-[18px] sm:text-[19px] font-bold text-navy-900 mb-2 cursor-pointer hover:text-teal-700 transition-colors"
                  >
                    {issue.title}
                  </h3>

                  <p className="text-base text-slate-700 leading-relaxed font-normal mb-4 line-clamp-2">
                    {issue.description}
                  </p>

                  {/* Resolution Summary */}
                  {issue.resolutionNotes && (
                    <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-slate-700 mb-4 space-y-1">
                      <div className="font-bold text-emerald-950 text-[12px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Formal Resolution Log
                      </div>
                      <p className="line-clamp-2 text-sm leading-relaxed">
                        {issue.resolutionNotes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-3.5 border-t border-slate-200 flex items-center justify-between text-[13px] text-slate-500">
                  <span className="font-mono text-[12px]">
                    Closed: {issue.closedAt ? new Date(issue.closedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Verified'}
                  </span>
                  <button
                    onClick={() => setSelectedIssue(issue)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-navy-900 font-semibold text-[13px] flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Record</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
            <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-[18px] font-bold text-navy-900">
              No Archived Issues Found
            </h4>
            <p className="text-sm text-slate-500 max-w-sm mx-auto font-normal">
              Closed issues will automatically move here once certified and closed by the student representative.
            </p>
          </div>
        )
      )}

      {/* Details Modal */}
      {selectedIssue && (
        <IssueDetailsModal
          isOpen={Boolean(selectedIssue)}
          issue={selectedIssue}
          currentUser={currentUser}
          hasUpvoted={false}
          onClose={() => setSelectedIssue(null)}
          onUpvote={() => {}}
          onOpenAuth={onOpenAuth}
        />
      )}
    </section>
  );
}
