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
  X
} from 'lucide-react';
import { updateIssueStage, closeIssueWithToken } from '../services/db';

export default function RepOperationsDesk({
  issues = [],
  vaults = [],
  currentUser,
  onSelectVaultToReply
}) {
  const [activeSubTab, setActiveSubTab] = useState('triage'); // 'triage' | 'vaults'
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Status edit modal state
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStage, setNewStage] = useState('in_progress');
  const [resolutionNote, setResolutionNote] = useState('');
  const [targetFixDate, setTargetFixDate] = useState('');

  // Close Issue Modal state
  const [isClosingIssue, setIsClosingIssue] = useState(false);
  const [closeResolutionNote, setCloseResolutionNote] = useState('');
  const [isOperating, setIsOperating] = useState(false);
  const [opError, setOpError] = useState(null);
  const [opSuccess, setOpSuccess] = useState(null);

  // Requisition Indent Simulation Toast
  const [indentToast, setIndentToast] = useState(null);

  // Rep Filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');

  const filteredIssues = issues.filter((issue) => {
    const matchesCat = categoryFilter === 'all' || issue.category === categoryFilter;
    const matchesStage = stageFilter === 'all' || issue.stage === stageFilter;
    return matchesCat && matchesStage;
  });

  const activeIssuesCount = issues.filter((i) => !i.isClosed).length;
  const criticalCount = issues.filter((i) => (i.urgency === 'critical' || i.urgency === 'elevated') && !i.isClosed).length;

  const handleOpenEdit = (issue) => {
    setSelectedIssue(issue);
    setNewStage(issue.stage || 'in_progress');
    setResolutionNote(issue.resolutionNotes || '');
    setTargetFixDate(issue.targetFixDate || '');
    setOpError(null);
    setIsEditingStatus(true);
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!selectedIssue) return;

    try {
      setIsOperating(true);
      setOpError(null);
      await updateIssueStage(selectedIssue.id, newStage, resolutionNote, targetFixDate, currentUser);
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

  const handleOpenCloseModal = (issue) => {
    setSelectedIssue(issue);
    setCloseResolutionNote(issue.resolutionNotes || '');
    setOpError(null);
    setIsClosingIssue(true);
  };

  const handleConfirmClose = async (e) => {
    e.preventDefault();
    if (!selectedIssue) return;

    if (!closeResolutionNote.trim()) {
      setOpError('Resolution notes are required before issuing the official CLOSED stamp.');
      return;
    }

    try {
      setIsOperating(true);
      setOpError(null);
      await closeIssueWithToken(selectedIssue.id, closeResolutionNote.trim(), currentUser);
      setOpSuccess(`Issue ${selectedIssue.id} officially closed and transferred to the Resolved Archive.`);
      setTimeout(() => setOpSuccess(null), 5000);
      setIsClosingIssue(false);
    } catch (err) {
      console.error('Error closing issue:', err);
      setOpError(err.message || 'Failed to close issue.');
    } finally {
      setIsOperating(false);
    }
  };

  const handleGenerateIndent = (issue) => {
    const indentId = `IND-GECP-${Math.floor(1000 + Math.random() * 9000)}`;
    setIndentToast({
      indentId,
      title: issue.title,
      lab: issue.lab,
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
              <span>Representative Operations Desk</span>
            </div>

            {/* Desktop Main Heading: 36-44px */}
            <h1 className="text-3xl sm:text-[38px] font-extrabold tracking-tight text-navy-900 leading-tight">
              Department Triage & Action Console
            </h1>

            {/* Body Text: 15-16px */}
            <p className="text-[15px] sm:text-[16px] text-slate-700 font-normal leading-relaxed">
              Official management console for the ECE Student Association Representative. Triage laboratory breakdowns, log resolution progress, issue formal indents, and close verified issues.
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

        {/* Live Metrics */}
        <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[13px] text-slate-500 font-medium">Active Pipeline</div>
            <div className="text-2xl sm:text-[26px] font-bold text-navy-900 tracking-tight mt-1 font-mono">
              {activeIssuesCount}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[13px] text-slate-500 font-medium">Critical Attention</div>
            <div className="text-2xl sm:text-[26px] font-bold text-rose-700 tracking-tight mt-1 font-mono">
              {criticalCount}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[13px] text-slate-500 font-medium">Confidential Inquiries</div>
            <div className="text-2xl sm:text-[26px] font-bold text-navy-900 tracking-tight mt-1 font-mono">
              {vaults.length}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="text-[13px] text-slate-500 font-medium">Portal Security</div>
            <div className="text-2xl sm:text-[26px] font-bold text-teal-700 tracking-tight mt-1 font-mono">
              Enforced
            </div>
          </div>
        </div>
      </div>

      {/* Subtab Navigation */}
      <div className="flex border-b border-slate-200 text-[13px] font-semibold">
        <button
          onClick={() => setActiveSubTab('triage')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeSubTab === 'triage'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          Public Triage Queue ({issues.length})
        </button>
        <button
          onClick={() => setActiveSubTab('vaults')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeSubTab === 'vaults'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          Confidential Welfare Responses ({vaults.length})
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

      {/* SUBTAB 1: Public Triage Queue */}
      {activeSubTab === 'triage' ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="font-bold text-navy-900 text-[15px]">
              Active Community Wall Complaints
            </div>
            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[13px] text-slate-700 outline-none"
              >
                <option value="all">All Categories</option>
                <option value="lab">Laboratories</option>
                <option value="classroom">Classroom AV</option>
                <option value="facility">Facilities</option>
                <option value="academics">Academics</option>
              </select>

              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[13px] text-slate-700 outline-none"
              >
                <option value="all">All Stages</option>
                <option value="reported">Reported</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-4">Case ID</th>
                  <th className="p-4">Issue Title & Location</th>
                  <th className="p-4">Urgency</th>
                  <th className="p-4">Stage</th>
                  <th className="p-4">+1 Votes</th>
                  <th className="p-4 text-right">Rep Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px]">
                {filteredIssues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 whitespace-nowrap font-mono text-[12px]">
                      <div className="font-bold text-navy-900">{issue.id.slice(0, 10)}</div>
                      <div className="text-slate-400 text-[11px]">
                        {new Date(issue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    </td>
                    <td className="p-4 max-w-sm">
                      <div className="font-bold text-navy-900 line-clamp-1 text-[14px]">
                        {issue.title}
                      </div>
                      <div className="text-[12px] text-slate-500 line-clamp-1 mt-0.5">
                        {issue.lab} • {issue.studentName}
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          issue.urgency === 'critical'
                            ? 'bg-rose-100 text-rose-800'
                            : issue.urgency === 'elevated'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {issue.urgency.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[12px] capitalize">
                        {issue.stage.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap font-mono font-bold text-teal-700 text-[14px]">
                      +{issue.upvotesCount || 0}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* Lab Indent */}
                        <button
                          onClick={() => handleGenerateIndent(issue)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-[12px] font-medium transition-colors"
                          title="Generate Department Requisition Slip"
                        >
                          Lab Indent
                        </button>

                        {/* Update Stage */}
                        <button
                          onClick={() => handleOpenEdit(issue)}
                          className="px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 text-[12px] font-semibold transition-colors shadow-xs"
                        >
                          Update Stage
                        </button>

                        {/* Close Issue Stamp Action */}
                        <button
                          onClick={() => handleOpenCloseModal(issue)}
                          className="px-3 py-1.5 rounded-lg border-2 border-red-600 text-red-600 hover:bg-red-50 text-[12px] font-extrabold uppercase tracking-wide transition-colors"
                          title="Officially close issue and move to Resolved Archive"
                        >
                          Close Issue
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredIssues.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 text-[14px]">
                      No active issues match the selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* SUBTAB 2: Confidential Student Requests */
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h3 className="text-[16px] font-bold text-navy-900 mb-1">
              Confidential Student Welfare Responses
            </h3>
            <p className="text-[14px] text-slate-600 font-normal">
              Directly review student welfare, medical leave condonation, and internal marks inquiries. You can reply straight into their secure 2-way thread.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vaults.map((vault) => (
              <div
                key={vault.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-navy-900 text-white uppercase">
                      {vault.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-[12px]">
                      <span className="font-bold text-navy-900">
                        {vault.authorName || vault.subjectRoll}
                      </span>
                      <span className="font-mono text-slate-500 font-semibold">
                        ({vault.subjectRoll})
                      </span>
                      {vault.semester && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-50 text-teal-800 border border-teal-200">
                          {vault.semester}
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="text-[16px] font-bold text-navy-900 mb-1">
                    {vault.title}
                  </h4>

                  <div className="text-[12px] text-slate-500 font-mono mb-2">
                    Student: {vault.authorEmail}
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[13px] text-slate-600 mb-4 line-clamp-3 leading-relaxed">
                    {vault.messagesCount || 1} messages in secure channel
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">
                    {new Date(vault.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() => onSelectVaultToReply(vault.id)}
                    className="px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white font-semibold text-[13px] flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open Advisory Thread</span>
                  </button>
                </div>
              </div>
            ))}

            {vaults.length === 0 && (
              <div className="col-span-2 p-8 text-center text-[14px] text-slate-400 bg-white border border-dashed border-slate-200 rounded-2xl">
                No active confidential welfare inquiries pending reply.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: Update Issue Lifecycle Stage */}
      {isEditingStatus && selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-2xl p-6 sm:p-7 shadow-2xl border border-slate-200 text-left">
            <h3 className="text-[20px] font-bold text-navy-900 mb-1">
              Update Issue Lifecycle Stage
            </h3>
            <p className="text-[13px] text-slate-500 mb-4">
              {selectedIssue.id} • {selectedIssue.title}
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
                  placeholder="e.g. Lab tech replaced faulty BNC probe; verified 1kHz calibration square wave..."
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

      {/* MODAL 2: Close Issue Stamp Confirmation */}
      {isClosingIssue && selectedIssue && (
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
              Confirm Official Issue Closure
            </h3>
            <p className="text-[14px] text-slate-600 leading-relaxed font-normal mb-4">
              Closing an issue applies the formal department <strong>CLOSED token</strong> and removes the card from the active Community Complaint Wall. The complaint, resolution details, and discussion will be permanently preserved in the <strong>Resolved Issues Archive</strong>.
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
    </div>
  );
}
