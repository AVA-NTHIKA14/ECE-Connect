import React, { useState } from 'react';
import {
  Search,
  Plus,
  Radio,
  SlidersHorizontal,
  Flame,
  Clock,
  Layers,
  AlertCircle,
  Building2,
  CheckCircle2,
  Filter,
  X
} from 'lucide-react';
import IssueCard from './IssueCard';

export default function PublicWall({
  issues,
  currentUser,
  onUpvote,
  onAddComment,
  onOpenNewModal,
  onOpenRepTriage
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [sortBy, setSortBy] = useState('upvotes'); // 'upvotes' | 'recent' | 'urgency'

  // Filtering
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.lab.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (issue.equipmentCode &&
        issue.equipmentCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      categoryFilter === 'all' || issue.category === categoryFilter;

    const matchesStage =
      stageFilter === 'all' || issue.stage === stageFilter;

    return matchesSearch && matchesCategory && matchesStage;
  });

  // Sorting
  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (sortBy === 'upvotes') {
      return b.upvotes - a.upvotes;
    }
    if (sortBy === 'recent') {
      return new Date(b.reportedAt) - new Date(a.reportedAt);
    }
    if (sortBy === 'urgency') {
      const urgencyRank = { critical: 3, elevated: 2, normal: 1 };
      return (urgencyRank[b.urgency] || 0) - (urgencyRank[a.urgency] || 0);
    }
    return 0;
  });

  // Analytics
  const totalUpvotes = issues.reduce((acc, curr) => acc + curr.upvotes, 0);
  const activeCount = issues.filter((i) => i.stage !== 'resolved').length;
  const resolvedCount = issues.filter((i) => i.stage === 'resolved').length;

  return (
    <div className="space-y-7 text-left">
      {/* Sleek Hero & Metric Dashboard Header */}
      <div className="bg-[#0D0D10] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-xs font-medium text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>GECSKP ECE Department Grievance System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Department Community Wall
            </h1>
            <p className="text-sm text-zinc-400 font-normal leading-relaxed">
              Transparent, student-driven triage for laboratory equipment, classroom AV systems, and KTU academic timetable coordination. Click <span className="text-white font-medium">+1 Affects Me</span> to escalate shared departmental priorities.
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="shrink-0">
            <button
              onClick={onOpenNewModal}
              className="px-5 py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Report Department Issue</span>
            </button>
          </div>
        </div>

        {/* Linear-Style KPI Metric Cards */}
        <div className="mt-8 pt-6 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.05]">
            <div className="text-xs text-zinc-500 font-medium">Total Issues Logged</div>
            <div className="text-2xl font-semibold text-white tracking-tight mt-1 font-mono">
              {issues.length}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.05]">
            <div className="text-xs text-zinc-500 font-medium">Active In Pipeline</div>
            <div className="text-2xl font-semibold text-white tracking-tight mt-1 font-mono flex items-center gap-2">
              <span>{activeCount}</span>
              <span className="text-[10px] text-zinc-400 font-normal px-2 py-0.5 rounded-full bg-white/[0.06]">
                Pending
              </span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.05]">
            <div className="text-xs text-zinc-500 font-medium">Verified Resolved</div>
            <div className="text-2xl font-semibold text-white tracking-tight mt-1 font-mono">
              {resolvedCount}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.05]">
            <div className="text-xs text-zinc-500 font-medium">Collective +1 Weight</div>
            <div className="text-2xl font-semibold text-white tracking-tight mt-1 font-mono">
              {totalUpvotes}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Filter & Search Controls */}
      <div className="bg-[#0D0D10] border border-white/[0.08] rounded-xl p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by hardware tag, lab room, or issue description..."
            className="w-full bg-black/50 border border-white/[0.08] focus:border-white/30 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-zinc-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-black/50 border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-300 outline-none hover:border-white/20 focus:border-white/40 cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="lab">Laboratories</option>
            <option value="classroom">Classroom AV</option>
            <option value="facility">Department Facility</option>
            <option value="academics">KTU Academics</option>
          </select>

          {/* Stage Filter */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-black/50 border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-300 outline-none hover:border-white/20 focus:border-white/40 cursor-pointer"
          >
            <option value="all">All Stages</option>
            <option value="reported">Reported</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-black/50 border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-300 outline-none hover:border-white/20 focus:border-white/40 cursor-pointer"
          >
            <option value="upvotes">Sort: Most +1 Affects Me</option>
            <option value="urgency">Sort: Highest Urgency</option>
            <option value="recent">Sort: Most Recent</option>
          </select>
        </div>
      </div>

      {/* Grid of Issue Cards */}
      {sortedIssues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              currentUser={currentUser}
              onUpvote={onUpvote}
              onAddComment={onAddComment}
              onOpenRepTriage={onOpenRepTriage}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#0D0D10] border border-white/[0.08] rounded-2xl p-12 text-center space-y-3">
          <Radio className="w-8 h-8 text-zinc-600 mx-auto" />
          <h4 className="text-sm font-semibold text-white">
            No Department Issues Found
          </h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto font-normal">
            No active issues match the selected category or search filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setStageFilter('all');
            }}
            className="px-4 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-xs text-white transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
