import React, { useState } from 'react';
import {
  Search,
  Plus,
  LayoutGrid,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Inbox
} from 'lucide-react';
import IssueCard from './IssueCard';
import IssueDetailsModal from './IssueDetailsModal';
import { DEPARTMENT_INFO } from '../data/mockData';

export default function PublicWall({
  issues = [],
  isLoading = false,
  error = null,
  currentUser,
  userVotes = {},
  onUpvote,
  onOpenNewModal,
  onOpenRepTriage,
  onOpenAuth
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'upvotes' | 'urgency'
  const [selectedIssueForModal, setSelectedIssueForModal] = useState(null);

  // Filtering (Active public issues only)
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.lab?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;
    const matchesStage = stageFilter === 'all' || issue.stage === stageFilter;

    return matchesSearch && matchesCategory && matchesStage;
  });

  // Sorting
  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (sortBy === 'upvotes') {
      return (b.upvotesCount || 0) - (a.upvotesCount || 0);
    }
    if (sortBy === 'recent') {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
    if (sortBy === 'urgency') {
      const rank = { critical: 3, elevated: 2, normal: 1 };
      return (rank[b.urgency] || 0) - (rank[a.urgency] || 0);
    }
    return 0;
  });

  // Accurate Live Metrics from persisted issues
  const totalUpvotes = issues.reduce((acc, curr) => acc + (curr.upvotesCount || 0), 0);
  const activeCount = issues.filter((i) => i.stage !== 'resolved' && !i.isClosed).length;
  const resolvedCount = issues.filter((i) => i.stage === 'resolved' || i.isClosed).length;

  return (
    <section aria-labelledby="wall-heading" className="space-y-6 text-left">
      {/* Complaint Wall Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[13px] font-semibold text-teal-800">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              <span>GECP ECE Department Complaint Wall</span>
            </div>

            {/* Desktop Main Heading: 36-44px */}
            <h1 id="wall-heading" className="text-3xl sm:text-[38px] font-extrabold tracking-tight text-navy-900 leading-tight">
              ECE Complaint Wall
            </h1>

            {/* Body Text: minimum 16px (1rem) */}
            <p className="text-base text-slate-800 leading-relaxed font-normal">
              A transparent, student-driven grievance wall for issues affecting laboratories, classroom facilities, and academic scheduling at {DEPARTMENT_INFO.institution}. Support shared concerns with <span className="font-semibold text-teal-700">+1 Affects Me</span> to escalate priorities to department representatives and faculty.
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="w-full sm:w-auto shrink-0">
            <button
              onClick={onOpenNewModal}
              aria-label="Raise new department concern on the Complaint Wall"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[15px] flex items-center justify-center gap-2 shadow-sm transition-all duration-150 hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-600 focus-visible:outline-none active:scale-[0.99]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
              <span>Raise Department Concern</span>
            </button>
          </div>
        </div>

        {/* Cohesive Stats Overview Bar */}
        <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[12px] sm:text-[13px] text-slate-500 font-medium">Active Concerns</div>
            <div className="text-2xl sm:text-[26px] font-bold text-navy-900 tracking-tight mt-1 font-mono">
              {isLoading ? '...' : issues.length}
            </div>
          </div>
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[12px] sm:text-[13px] text-slate-500 font-medium">In Resolution</div>
            <div className="text-2xl sm:text-[26px] font-bold text-teal-700 tracking-tight mt-1 font-mono flex items-center gap-2">
              <span>{isLoading ? '...' : activeCount}</span>
              <span className="text-[10px] sm:text-[11px] text-teal-800 font-semibold px-2 py-0.5 rounded-full bg-teal-100 font-sans">
                Active
              </span>
            </div>
          </div>
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[12px] sm:text-[13px] text-slate-500 font-medium">Verified Resolved</div>
            <div className="text-2xl sm:text-[26px] font-bold text-navy-900 tracking-tight mt-1 font-mono">
              {isLoading ? '...' : resolvedCount}
            </div>
          </div>
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[12px] sm:text-[13px] text-slate-500 font-medium">Student Upvotes</div>
            <div className="text-2xl sm:text-[26px] font-bold text-navy-900 tracking-tight mt-1 font-mono">
              {isLoading ? '...' : totalUpvotes}
            </div>
          </div>
        </div>
      </div>

      {/* Filter, Search & Sort Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        {/* Search Bar */}
        <div className="relative flex-1">
          <label htmlFor="search-issues" className="sr-only">
            Search grievances by classroom, lab room, or problem description
          </label>
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" aria-hidden="true" />
          <input
            id="search-issues"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by classroom, lab room, or problem description..."
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 rounded-lg pl-9 pr-8 py-2 text-[14px] text-navy-900 placeholder-slate-400 outline-none transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              aria-label="Clear search input"
              className="absolute right-3 top-2.5 text-slate-400 hover:text-navy-900 p-1 rounded focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:flex md:flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="w-full md:w-auto">
            <label htmlFor="filter-category" className="sr-only">Filter by Department Category</label>
            <select
              id="filter-category"
              aria-label="Filter issues by department category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-700 outline-none hover:border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="lab">Laboratories</option>
              <option value="classroom">Classroom AV</option>
              <option value="facility">Department Facility</option>
              <option value="academics">KTU Academics</option>
            </select>
          </div>

          {/* Stage Filter */}
          <div className="w-full md:w-auto">
            <label htmlFor="filter-stage" className="sr-only">Filter by Resolution Stage</label>
            <select
              id="filter-stage"
              aria-label="Filter issues by resolution stage"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-700 outline-none hover:border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 cursor-pointer"
            >
              <option value="all">All Stages</option>
              <option value="reported">Reported</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="w-full md:w-auto">
            <label htmlFor="sort-issues" className="sr-only">Sort department issues</label>
            <select
              id="sort-issues"
              aria-label="Sort department issues"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-700 outline-none hover:border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 cursor-pointer"
            >
              <option value="recent">Sort: Most Recent</option>
              <option value="upvotes">Sort: Most +1 Affects Me</option>
              <option value="urgency">Sort: Highest Urgency</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
          <div className="text-[16px] font-semibold text-navy-900">Loading Community Complaint Wall...</div>
          <p className="text-[14px] text-slate-500">Retrieving live grievances from Cloud Firestore</p>
        </div>
      )}

      {/* Cloud Sync Advisory Banner */}
      {!isLoading && error && (
        <div className="p-4 sm:p-5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-[14px] flex items-start gap-3 shadow-2xs animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-left">
            <div className="font-bold text-[14px] text-amber-950">
              Firestore Cloud Sync Notice: {error.message || 'Missing permissions'}
            </div>
            <p className="text-[14px] text-amber-900 leading-relaxed font-normal">
              Showing grievances from your local session. To enable live cloud synchronization across all student devices, publish the rules in your <strong>Firebase Console &gt; Firestore Database &gt; Rules</strong> tab.
            </p>
          </div>
        </div>
      )}

      {/* Grid of Pinned Cards: 2 Columns on Desktop, 1 on Mobile */}
      {!isLoading && (
        sortedIssues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                currentUser={currentUser}
                hasUpvoted={Boolean(userVotes[issue.id])}
                onUpvote={onUpvote}
                onSelectIssue={(clickedIssue) => setSelectedIssueForModal(clickedIssue)}
                onOpenRepTriage={onOpenRepTriage}
              />
            ))}
          </div>
        ) : (
          /* Genuine Empty State */
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
            <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-[18px] font-bold text-navy-900">
              No issues reported yet. Be the first to raise a concern.
            </h4>
            <p className="text-base text-slate-700 max-w-md mx-auto font-normal leading-relaxed">
              The ECE Community Complaint Wall is live and transparent. Raise any issues affecting laboratory equipment, lecture hall projectors, or timetable clashes.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenNewModal}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[14px] inline-flex items-center gap-2 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Raise First Concern</span>
              </button>
            </div>
          </div>
        )
      )}

      {/* Detailed Modal View */}
      {selectedIssueForModal && (
        <IssueDetailsModal
          isOpen={Boolean(selectedIssueForModal)}
          issue={selectedIssueForModal}
          currentUser={currentUser}
          hasUpvoted={Boolean(userVotes[selectedIssueForModal.id])}
          onClose={() => setSelectedIssueForModal(null)}
          onUpvote={onUpvote}
          onOpenAuth={onOpenAuth}
        />
      )}
    </section>
  );
}
