import React, { useState } from 'react';
import {
  ShieldCheck,
  Wrench,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  ClipboardCheck,
  Building2,
  Archive,
  MessageSquare,
  X,
  Search,
  Globe,
  Lock,
  EyeOff,
  UserCheck,
  Share2,
  ArrowRight,
  Eye,
  Check,
  Filter
} from 'lucide-react';
import {
  updateIssueStage,
  closeIssueWithToken,
  updatePrivateGrievanceStage,
  closePrivateGrievanceWithToken,
  publishPrivateGrievanceToPublic
} from '../services/db';
import { LAB_FACILITIES } from '../data/mockData';

export default function RepOperationsDesk({
  issues = [],
  vaults = [],
  currentUser,
  onSelectVaultToReply
}) {
  // Master queue view: 'all' | 'public' | 'vaults'
  const [activeSubTab, setActiveSubTab] = useState('all');

  // Search and multi-dimensional filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all'); // 'all' | 'public' | 'private'

  // Selected item for modals
  const [selectedItem, setSelectedItem] = useState(null);

  // Status/Stage edit modal state
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStage, setNewStage] = useState('in_progress');
  const [resolutionNote, setResolutionNote] = useState('');
  const [targetFixDate, setTargetFixDate] = useState('');

  // Close Ticket Modal state
  const [isClosingIssue, setIsClosingIssue] = useState(false);
  const [closeResolutionNote, setCloseResolutionNote] = useState('');

  // Mark to View Public (Publish to Wall) Modal state
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishTitle, setPublishTitle] = useState('');
  const [publishDescription, setPublishDescription] = useState('');
  const [publishCategory, setPublishCategory] = useState('facility');
  const [publishLab, setPublishLab] = useState(LAB_FACILITIES[0]?.name || 'EC 1st Year Class');

  // Operation state & feedback
  const [isOperating, setIsOperating] = useState(false);
  const [opError, setOpError] = useState(null);
  const [opSuccess, setOpSuccess] = useState(null);

  // Requisition Indent Simulation Toast
  const [indentToast, setIndentToast] = useState(null);

  // Consolidated Unified Queue
  const allItems = [
    ...issues.map((i) => ({
      ...i,
      itemType: 'public',
      displayAuthor: i.studentName || 'ECE Student',
      displayRoll: i.authorEmail?.split('@')[0]?.toUpperCase() || 'STUDENT',
      isAnon: Boolean(i.hideIdentity || i.studentName?.includes('Anonymous')),
      locationOrTopic: i.lab || 'ECE Facility',
      engagementCount: i.upvotesCount || 0,
      engagementType: 'votes'
    })),
    ...vaults.map((v) => ({
      ...v,
      itemType: 'private',
      displayAuthor: v.isAnonymous ? 'Anonymous Student' : (v.authorName || v.subjectRoll || 'Student'),
      displayRoll: v.isAnonymous ? 'CONFIDENTIAL' : (v.subjectRoll || 'STUDENT'),
      isAnon: Boolean(v.isAnonymous),
      locationOrTopic: v.category ? v.category.toUpperCase() : 'WELFARE',
      engagementCount: v.messagesCount || 1,
      engagementType: 'messages'
    }))
  ].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  // Filtered List based on tab and filter controls
  const filteredItems = allItems.filter((item) => {
    // 1. Tab filter
    if (activeSubTab === 'public' && item.itemType !== 'public') return false;
    if (activeSubTab === 'vaults' && item.itemType !== 'private') return false;

    // 2. Visibility filter (within 'all' tab)
    if (visibilityFilter === 'public' && item.itemType !== 'public') return false;
    if (visibilityFilter === 'private' && item.itemType !== 'private') return false;

    // 3. Category filter
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;

    // 4. Stage filter
    if (stageFilter !== 'all') {
      const currentStage = item.stage || (item.isClosed ? 'closed' : 'reported');
      if (currentStage !== stageFilter) return false;
    }

    // 5. Urgency filter
    if (urgencyFilter !== 'all' && item.urgency !== urgencyFilter) return false;

    // 6. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchDesc = (item.description || item.initialMessage || '').toLowerCase().includes(q);
      const matchAuthor = item.displayAuthor?.toLowerCase().includes(q);
      const matchRoll = item.displayRoll?.toLowerCase().includes(q);
      const matchLoc = item.locationOrTopic?.toLowerCase().includes(q);
      const matchId = item.id?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchAuthor && !matchRoll && !matchLoc && !matchId) {
        return false;
      }
    }

    return true;
  });

  // Global Metrics
  const totalIssuesCount = allItems.length;
  const activePipelineCount = allItems.filter((i) => !i.isClosed).length;
  const criticalCount = allItems.filter((i) => (i.urgency === 'critical' || i.urgency === 'elevated') && !i.isClosed).length;
  const closedCount = allItems.filter((i) => i.isClosed).length;
  const publicCount = issues.length;
  const privateCount = vaults.length;

  // --- ACTIONS ---

  // 1. Open Stage Progression Modal
  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setNewStage(item.stage || 'in_progress');
    setResolutionNote(item.resolutionNotes || '');
    setTargetFixDate(item.targetFixDate || '');
    setOpError(null);
    setIsEditingStatus(true);
  };

  // Save Stage Progression
  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      setIsOperating(true);
      setOpError(null);

      if (selectedItem.itemType === 'public') {
        await updateIssueStage(selectedItem.id, newStage, resolutionNote, targetFixDate, currentUser);
      } else {
        await updatePrivateGrievanceStage(selectedItem.id, newStage, resolutionNote, targetFixDate, currentUser);
      }

      setOpSuccess(`Status successfully progressed to ${newStage.replace('_', ' ')}.`);
      setTimeout(() => setOpSuccess(null), 4000);
      setIsEditingStatus(false);
    } catch (err) {
      console.error('Error updating stage:', err);
      setOpError(err.message || 'Failed to update issue stage.');
    } finally {
      setIsOperating(false);
    }
  };

  // 2. Open Close Ticket Modal
  const handleOpenCloseModal = (item) => {
    setSelectedItem(item);
    setCloseResolutionNote(item.resolutionNotes || '');
    setOpError(null);
    setIsClosingIssue(true);
  };

  // Confirm Close Ticket with Token
  const handleConfirmClose = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (!closeResolutionNote.trim()) {
      setOpError('Resolution log notes are required before applying the official CLOSED stamp.');
      return;
    }

    try {
      setIsOperating(true);
      setOpError(null);

      if (selectedItem.itemType === 'public') {
        await closeIssueWithToken(selectedItem.id, closeResolutionNote.trim(), currentUser);
        setOpSuccess(`Public Issue ${selectedItem.id} officially closed and transferred to the Resolved Archive.`);
      } else {
        await closePrivateGrievanceWithToken(selectedItem.id, closeResolutionNote.trim(), currentUser);
        setOpSuccess(`Private Grievance ${selectedItem.id} officially closed and resolution log recorded.`);
      }

      setTimeout(() => setOpSuccess(null), 5000);
      setIsClosingIssue(false);
    } catch (err) {
      console.error('Error closing ticket:', err);
      setOpError(err.message || 'Failed to close ticket.');
    } finally {
      setIsOperating(false);
    }
  };

  // 3. Open "Mark to View Public" Modal
  const handleOpenPublishModal = (item) => {
    setSelectedItem(item);
    setPublishTitle(item.title || '');
    setPublishDescription(item.description || item.initialMessage || item.title || '');
    setPublishCategory(item.category === 'academics' ? 'academics' : 'facility');
    setPublishLab(LAB_FACILITIES[0]?.name || 'EC 1st Year Class');
    setOpError(null);
    setIsPublishModalOpen(true);
  };

  // Confirm Mark to View Public
  const handleConfirmPublish = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (!publishTitle.trim() || !publishDescription.trim()) {
      setOpError('Title and description are required to publish this issue publicly.');
      return;
    }

    try {
      setIsOperating(true);
      setOpError(null);

      await publishPrivateGrievanceToPublic(
        selectedItem.id,
        {
          title: publishTitle.trim(),
          description: publishDescription.trim(),
          category: publishCategory,
          lab: publishLab
        },
        currentUser
      );

      setOpSuccess(`Inquiry successfully published to Public Community Wall!`);
      setTimeout(() => setOpSuccess(null), 5000);
      setIsPublishModalOpen(false);
    } catch (err) {
      console.error('Error publishing issue publicly:', err);
      setOpError(err.message || 'Failed to publish issue to public wall.');
    } finally {
      setIsOperating(false);
    }
  };

  // 4. Lab Indent Generator
  const handleGenerateIndent = (item) => {
    const indentId = `IND-GECP-${Math.floor(1000 + Math.random() * 9000)}`;
    setIndentToast({
      indentId,
      title: item.title,
      lab: item.locationOrTopic || 'ECE Lab',
      recipient: "Lab Superintendent & HoD Dr. Vinod"
    });
    setTimeout(() => setIndentToast(null), 6000);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Executive Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-900 text-white text-[13px] font-semibold">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Department Representative Operations Desk</span>
            </div>

            {/* Desktop Main Heading */}
            <h1 className="text-3xl sm:text-[38px] font-extrabold tracking-tight text-navy-900 leading-tight">
              Unified Triage & Action Console
            </h1>

            {/* Body Text */}
            <p className="text-[15px] sm:text-[16px] text-slate-700 font-normal leading-relaxed">
              Consolidated management console for the ECE Student Association Representative. Review all public complaints and private confidential grievances in one queue, update stages, mark issues to view public, and issue official closure stamps.
            </p>
          </div>

          <div className="text-right text-[13px] text-slate-500 font-mono hidden sm:block shrink-0">
            <div className="text-navy-900 font-bold">{currentUser?.email}</div>
            <div className="text-teal-700 font-sans mt-0.5 font-medium flex items-center justify-end gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              Verified Representative Access
            </div>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[13px] text-slate-500 font-medium">All Issues Recorded</div>
            <div className="text-2xl sm:text-[26px] font-bold text-navy-900 tracking-tight mt-1 font-mono">
              {totalIssuesCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {publicCount} Public • {privateCount} Confidential
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[13px] text-slate-500 font-medium">Active Pipeline</div>
            <div className="text-2xl sm:text-[26px] font-bold text-teal-700 tracking-tight mt-1 font-mono">
              {activePipelineCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Requires triage or fix
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[13px] text-slate-500 font-medium">Critical Attention</div>
            <div className="text-2xl sm:text-[26px] font-bold text-rose-700 tracking-tight mt-1 font-mono">
              {criticalCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              High priority cases
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[13px] text-slate-500 font-medium">Formally Closed</div>
            <div className="text-2xl sm:text-[26px] font-bold text-navy-900 tracking-tight mt-1 font-mono">
              {closedCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Archived with tokens
            </div>
          </div>
        </div>
      </div>

      {/* Primary Queue Tabs */}
      <div className="flex border-b border-slate-200 text-[13px] font-semibold gap-1">
        <button
          onClick={() => setActiveSubTab('all')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'all'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          <span>All Inquiries (Unified Queue)</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-slate-100 text-slate-700">
            {allItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('public')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'public'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-teal-600" />
          <span>Public Wall Issues</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-slate-100 text-slate-700">
            {issues.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('vaults')}
          className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
            activeSubTab === 'vaults'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-navy-900" />
          <span>Confidential Welfare Grievances</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-slate-100 text-slate-700">
            {vaults.length}
          </span>
        </button>
      </div>

      {/* Feedback Toast */}
      {opSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[13px] flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{opSuccess}</span>
          </div>
          <button onClick={() => setOpSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Indent Toast */}
      {indentToast && (
        <div className="p-4 rounded-xl bg-navy-900 text-white shadow-lg flex items-center justify-between text-[13px] animate-fadeIn">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="w-5 h-5 text-teal-400 shrink-0" />
            <div>
              <div className="font-bold text-[14px]">
                Department Requisition Slip Dispatched // {indentToast.indentId}
              </div>
              <div className="text-slate-300 mt-0.5">
                Formal indent logged for "{indentToast.title}" in {indentToast.lab}. Forwarded to {indentToast.recipient}.
              </div>
            </div>
          </div>
          <button onClick={() => setIndentToast(null)} className="text-slate-400 hover:text-white px-2 py-1">
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Keyword Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, description, case ID, lab/room, or student roll number..."
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-600 rounded-xl pl-9 pr-4 py-2.5 text-[14px] text-navy-900 placeholder-slate-400 outline-none transition-all"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Visibility filter (in all tab) */}
            {activeSubTab === 'all' && (
              <select
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[13px] text-slate-700 outline-none"
              >
                <option value="all">All Visibility</option>
                <option value="public">Public Issues Only</option>
                <option value="private">Confidential Only</option>
              </select>
            )}

            {/* Category filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[13px] text-slate-700 outline-none"
            >
              <option value="all">All Categories</option>
              <option value="lab">Laboratories</option>
              <option value="classroom">Classroom AV</option>
              <option value="facility">Department Facility</option>
              <option value="academics">KTU Academics</option>
              <option value="attendance">Attendance Condonation</option>
              <option value="medical">Medical Review</option>
              <option value="welfare">Student Welfare</option>
              <option value="personal">Personal Advisory</option>
            </select>

            {/* Stage filter */}
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[13px] text-slate-700 outline-none"
            >
              <option value="all">All Lifecycle Stages</option>
              <option value="reported">Reported</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed / Archived</option>
            </select>

            {/* Urgency filter */}
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[13px] text-slate-700 outline-none"
            >
              <option value="all">All Urgency</option>
              <option value="critical">Critical</option>
              <option value="elevated">Elevated</option>
              <option value="normal">Normal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Unified Triage Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-navy-900 text-[15px]">
              {activeSubTab === 'all'
                ? 'Consolidated Department Inquiries'
                : activeSubTab === 'public'
                ? 'Public Complaint Wall Queue'
                : 'Confidential Welfare Inquiries'}
            </span>
            <span className="text-[12px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filteredItems.length} matching
            </span>
          </div>

          <div className="text-[12px] text-slate-500">
            Click <strong>Update Stage</strong> to mark progress, <strong>Mark to View Public</strong> to publish, or <strong>Close Ticket</strong> to archive.
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4">Channel & Case ID</th>
                <th className="p-4">Title, Topic & Complainant</th>
                <th className="p-4">Urgency</th>
                <th className="p-4">Stage / Status</th>
                <th className="p-4">Engagement</th>
                <th className="p-4 text-right">Rep Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px]">
              {filteredItems.map((item) => {
                const isPublic = item.itemType === 'public';
                const isItemClosed = Boolean(item.isClosed || item.stage === 'closed');
                const isPublishedGrievance = Boolean(item.isPubliclyViewable || item.publicIssueId);

                return (
                  <tr key={`${item.itemType}-${item.id}`} className="hover:bg-slate-50/70 transition-colors">
                    {/* Channel & Case ID */}
                    <td className="p-4 whitespace-nowrap font-mono text-[12px]">
                      <div className="flex items-center gap-1.5 mb-1">
                        {isPublic ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold uppercase tracking-wide">
                            <Globe className="w-3 h-3 text-teal-600" />
                            <span>Public</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-navy-900 text-white text-[10px] font-bold uppercase tracking-wide">
                            <Lock className="w-3 h-3 text-teal-300" />
                            <span>Confidential</span>
                          </span>
                        )}

                        {isPublishedGrievance && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold" title="Published to Community Complaint Wall">
                            <Share2 className="w-2.5 h-2.5 text-emerald-600" />
                            <span>On Wall</span>
                          </span>
                        )}
                      </div>

                      <div className="font-bold text-navy-900">{item.id.slice(0, 10)}</div>
                      <div className="text-slate-400 text-[11px]">
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>

                    {/* Title, Location/Topic & Complainant */}
                    <td className="p-4 max-w-md">
                      <div className="font-bold text-navy-900 line-clamp-1 text-[14px]">
                        {item.title}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[12px] text-slate-500 mt-1">
                        <span className="font-semibold px-2 py-0.2 rounded bg-slate-100 text-slate-700 uppercase text-[10px]">
                          {item.category}
                        </span>

                        <span>•</span>
                        <span className="truncate max-w-[150px]">{item.locationOrTopic}</span>
                        <span>•</span>

                        {/* Complainant Identification */}
                        {item.isAnon ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold">
                            <EyeOff className="w-3 h-3 text-slate-500" />
                            <span>Anonymous Student</span>
                          </span>
                        ) : (
                          <span className="font-medium text-navy-900">
                            {item.displayAuthor}{' '}
                            <code className="font-mono text-[11px] text-slate-500">
                              ({item.displayRoll})
                            </code>
                          </span>
                        )}
                      </div>

                      {item.resolutionNotes && (
                        <div className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md mt-1.5 line-clamp-1">
                          <strong className="font-bold">Log: </strong> {item.resolutionNotes}
                        </div>
                      )}
                    </td>

                    {/* Urgency */}
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          item.urgency === 'critical'
                            ? 'bg-rose-100 text-rose-800'
                            : item.urgency === 'elevated'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {(item.urgency || 'normal').toUpperCase()}
                      </span>
                    </td>

                    {/* Stage / Status */}
                    <td className="p-4 whitespace-nowrap">
                      {isItemClosed ? (
                        <span className="closed-stamp text-[10px] py-0.5 px-2">
                          CLOSED
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[12px] capitalize">
                          {item.stage ? item.stage.replace('_', ' ') : (item.status || 'Reported')}
                        </span>
                      )}
                    </td>

                    {/* Engagement Metric */}
                    <td className="p-4 whitespace-nowrap font-mono text-[13px]">
                      {isPublic ? (
                        <span className="font-bold text-teal-700">
                          +{item.engagementCount} votes
                        </span>
                      ) : (
                        <span className="text-slate-600">
                          {item.engagementCount} msgs
                        </span>
                      )}
                    </td>

                    {/* Rep Actions */}
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* 1. If Private: Jump to Advisory Chat */}
                        {!isPublic && (
                          <button
                            onClick={() => onSelectVaultToReply(item.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-navy-900 hover:bg-slate-200 text-[12px] font-semibold flex items-center gap-1 transition-colors"
                            title="Open confidential 2-way advisory chat thread"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Reply</span>
                          </button>
                        )}

                        {/* 2. If Private: Mark to View Public (Publish to Wall) */}
                        {!isPublic && !isPublishedGrievance && (
                          <button
                            onClick={() => handleOpenPublishModal(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 text-[12px] font-semibold flex items-center gap-1 transition-colors"
                            title="Publish this private grievance onto the Public Community Wall so students can track it"
                          >
                            <Share2 className="w-3.5 h-3.5 text-teal-600" />
                            <span>View Public</span>
                          </button>
                        )}

                        {/* 3. If Public: Lab Indent Generator */}
                        {isPublic && (
                          <button
                            onClick={() => handleGenerateIndent(item)}
                            className="px-2 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-[12px] font-medium transition-colors"
                            title="Generate Department Requisition Slip"
                          >
                            Indent
                          </button>
                        )}

                        {/* 4. Update Lifecycle Stage (Available for all) */}
                        {!isItemClosed && (
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 text-[12px] font-semibold transition-colors shadow-xs"
                            title="Advance milestone stage (Reported, Acknowledged, In Progress, Resolved)"
                          >
                            Update Stage
                          </button>
                        )}

                        {/* 5. Close Ticket Action (Available for all non-closed) */}
                        {!isItemClosed && (
                          <button
                            onClick={() => handleOpenCloseModal(item)}
                            className="px-3 py-1.5 rounded-lg border-2 border-red-600 text-red-600 hover:bg-red-50 text-[12px] font-extrabold uppercase tracking-wide transition-colors"
                            title="Formally issue official CLOSED stamp and transfer to archive"
                          >
                            Close Ticket
                          </button>
                        )}

                        {/* If already closed, indicate certified status */}
                        {isItemClosed && (
                          <span className="text-[12px] font-semibold text-slate-400 italic">
                            Archived
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 text-[14px]">
                    No inquiries match the current search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Update Issue Lifecycle Stage */}
      {isEditingStatus && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-2xl p-6 sm:p-7 shadow-2xl border border-slate-200 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase ${
                selectedItem.itemType === 'public' ? 'bg-teal-50 text-teal-800' : 'bg-navy-900 text-white'
              }`}>
                {selectedItem.itemType === 'public' ? 'Public Issue' : 'Confidential Grievance'}
              </span>
              <button onClick={() => setIsEditingStatus(false)} className="text-slate-400 hover:text-navy-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-[20px] font-bold text-navy-900 mb-1">
              Update Issue Lifecycle Stage
            </h3>
            <p className="text-[13px] text-slate-500 mb-4 line-clamp-1">
              {selectedItem.id} • {selectedItem.title}
            </p>

            {opError && (
              <div className="p-3 mb-3 rounded-xl bg-rose-50 border border-rose-200 text-[13px] text-rose-800">
                {opError}
              </div>
            )}

            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-navy-900 uppercase tracking-wide mb-2">
                  Select Lifecycle Stage *
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'reported', label: '1. Reported' },
                    { key: 'acknowledged', label: '2. Acknowledged' },
                    { key: 'in_progress', label: '3. In Progress' },
                    { key: 'resolved', label: '4. Resolved' },
                  ].map((s) => (
                    <button
                      type="button"
                      key={s.key}
                      onClick={() => setNewStage(s.key)}
                      className={`p-2.5 rounded-xl border text-left font-semibold text-[13px] transition-all ${
                        newStage === s.key
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-navy-900 uppercase tracking-wide mb-1.5">
                  Resolution Progress / Triage Note *
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Detail maintenance performed, superintendent review, replacement parts, or faculty decision..."
                  className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 rounded-xl p-3 text-[14px] text-navy-900 placeholder-slate-400 outline-none resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-navy-900 uppercase tracking-wide mb-1.5">
                  Target Resolution Date (Optional)
                </label>
                <input
                  type="date"
                  value={targetFixDate}
                  onChange={(e) => setTargetFixDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 rounded-xl px-3 py-2 text-[14px] text-navy-900 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingStatus(false)}
                  className="px-4 py-2 rounded-xl text-[13px] text-slate-600 hover:text-navy-900 border border-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isOperating}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-[13px] font-semibold shadow-xs transition-all disabled:opacity-50"
                >
                  {isOperating ? 'Saving...' : 'Save Progression'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Close Ticket / Stamp Confirmation */}
      {isClosingIssue && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-2xl p-6 sm:p-7 shadow-2xl border border-slate-200 text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="closed-stamp">
                OFFICIAL CLOSED TOKEN
              </div>
              <button onClick={() => setIsClosingIssue(false)} className="text-slate-400 hover:text-navy-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-[20px] font-bold text-navy-900 mb-1">
              Confirm Official Ticket Closure
            </h3>
            <p className="text-[14px] text-slate-600 leading-relaxed font-normal mb-4">
              Closing this ticket certifies completion and permanently archives the record. A formal <strong>CLOSED stamp</strong> will be applied and visible across student portals.
            </p>

            {opError && (
              <div className="p-3 mb-3 rounded-xl bg-rose-50 border border-rose-200 text-[13px] text-rose-800">
                {opError}
              </div>
            )}

            <form onSubmit={handleConfirmClose} className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-navy-900 uppercase tracking-wide mb-1.5">
                  Mandatory Final Resolution Log *
                </label>
                <textarea
                  rows={4}
                  required
                  value={closeResolutionNote}
                  onChange={(e) => setCloseResolutionNote(e.target.value)}
                  placeholder="Detail the technical fix completed, superintendent confirmation, replacement parts used, or faculty approval..."
                  className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-red-600 rounded-xl p-3 text-[14px] text-navy-900 placeholder-slate-400 outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[12px] text-slate-500">
                Recorded by: <strong className="text-navy-900">{currentUser?.email}</strong> (ECE Representative)
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsClosingIssue(false)}
                  className="px-4 py-2 rounded-xl text-[13px] text-slate-600 hover:text-navy-900 border border-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isOperating || !closeResolutionNote.trim()}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[13px] font-bold uppercase tracking-wider shadow-xs transition-all disabled:opacity-50"
                >
                  {isOperating ? 'Applying Closure...' : 'Confirm Closure & Archive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Mark to View Public (Publish Private to Community Wall) */}
      {isPublishModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-2xl p-6 sm:p-7 shadow-2xl border border-slate-200 text-left">
            <div className="flex items-center justify-between mb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-[12px] font-semibold text-teal-800">
                <Share2 className="w-3.5 h-3.5" />
                <span>Mark Status to View Public</span>
              </div>
              <button onClick={() => setIsPublishModalOpen(false)} className="text-slate-400 hover:text-navy-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-[20px] font-bold text-navy-900 mb-1">
              Publish Inquiry to Public Complaint Wall
            </h3>
            <p className="text-[13px] text-slate-600 leading-relaxed font-normal mb-4">
              Publishing allows the entire student community to follow this issue and indicate "+1 Affects Me" on the Community Wall.
            </p>

            {selectedItem.isAnon && (
              <div className="p-3 mb-4 rounded-xl bg-slate-100 border border-slate-300 text-[12px] text-slate-700 flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-navy-900 shrink-0" />
                <span>
                  <strong>Student Anonymity Preserved:</strong> The original student submitted anonymously. On the public wall, the author will strictly display as <code>ECE Student (Anonymous)</code>.
                </span>
              </div>
            )}

            {opError && (
              <div className="p-3 mb-3 rounded-xl bg-rose-50 border border-rose-200 text-[13px] text-rose-800">
                {opError}
              </div>
            )}

            <form onSubmit={handleConfirmPublish} className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-navy-900 uppercase tracking-wide mb-1.5">
                  Public Headline / Title *
                </label>
                <input
                  type="text"
                  required
                  value={publishTitle}
                  onChange={(e) => setPublishTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 rounded-xl px-4 py-2.5 text-[14px] text-navy-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-bold text-navy-900 uppercase tracking-wide mb-1.5">
                    Category *
                  </label>
                  <select
                    value={publishCategory}
                    onChange={(e) => setPublishCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 rounded-xl px-3 py-2 text-[14px] text-navy-900 outline-none"
                  >
                    <option value="facility">Department Facility</option>
                    <option value="lab">Laboratory Equipment</option>
                    <option value="classroom">Classroom AV</option>
                    <option value="academics">KTU Academics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-navy-900 uppercase tracking-wide mb-1.5">
                    Room / Facility Location *
                  </label>
                  <select
                    value={publishLab}
                    onChange={(e) => setPublishLab(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 rounded-xl px-3 py-2 text-[14px] text-navy-900 outline-none"
                  >
                    {LAB_FACILITIES.map((facility) => (
                      <option key={facility.id} value={facility.name}>
                        {facility.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-navy-900 uppercase tracking-wide mb-1.5">
                  Public Problem Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={publishDescription}
                  onChange={(e) => setPublishDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 rounded-xl p-3 text-[14px] text-navy-900 outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[13px] text-slate-600 hover:text-navy-900 border border-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isOperating}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-[13px] font-bold flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{isOperating ? 'Publishing...' : 'Publish to Community Wall'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
