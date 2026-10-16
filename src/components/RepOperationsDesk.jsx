import React, { useState } from 'react';
import {
  Terminal,
  Cpu,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Send,
  Wrench,
  Layers,
  Lock,
  MessageSquare,
  ClipboardCheck,
  Building2,
  ShieldCheck,
  X,
  ArrowRight
} from 'lucide-react';
import { DEPARTMENT_INFO } from '../data/mockData';

export default function RepOperationsDesk({
  issues,
  vaults,
  currentUser,
  onUpdateIssueStage,
  onUpdateIssueResolution,
  onSelectVaultToReply
}) {
  const [activeSubTab, setActiveSubTab] = useState('triage'); // 'triage' | 'vaults'
  const [selectedIssue, setSelectedIssue] = useState(issues[0] || null);

  // Status edit modal state
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStage, setNewStage] = useState('in_progress');
  const [resolutionNote, setResolutionNote] = useState('');
  const [targetFixDate, setTargetFixDate] = useState('');

  // Requisition simulation
  const [showIndentSuccess, setShowIndentSuccess] = useState(null);

  // Metrics
  const activeCount = issues.filter((i) => i.stage !== 'resolved').length;
  const criticalCount = issues.filter(
    (i) => (i.urgency === 'critical' || i.urgency === 'elevated') && i.stage !== 'resolved'
  ).length;
  const resolvedCount = issues.filter((i) => i.stage === 'resolved').length;
  const confidentialCount = vaults.length;

  const handleOpenEdit = (issue) => {
    setSelectedIssue(issue);
    setNewStage(issue.stage);
    setResolutionNote(issue.resolutionNotes || '');
    setTargetFixDate(issue.targetFixDate || '');
    setIsEditingStatus(true);
  };

  const handleSaveStatus = (e) => {
    e.preventDefault();
    if (!selectedIssue) return;

    onUpdateIssueStage(selectedIssue.id, newStage);
    onUpdateIssueResolution(selectedIssue.id, resolutionNote.trim(), targetFixDate);
    setIsEditingStatus(false);
  };

  const handleGenerateIndent = (issue) => {
    const indentId = `IND-GECSKP-${Math.floor(1000 + Math.random() * 9000)}`;
    setShowIndentSuccess({
      indentId,
      issueTitle: issue.title,
      lab: issue.lab,
      recipient: "Lab Superintendent & HoD Dr. Vinod"
    });
    setTimeout(() => setShowIndentSuccess(null), 5000);
  };

  return (
    <div className="space-y-7 text-left">
      {/* Executive Header Banner */}
      <div className="bg-[#0D0D10] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/[0.08] text-xs font-medium text-white border border-white/[0.1]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Representative Operations Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Department Triage & Action Console
            </h1>
            <p className="text-sm text-zinc-400 font-normal leading-relaxed">
              Authorized management console for the ECE Student Association Representative. Triage laboratory breakdowns, issue official indent requisitions to lab superintendents, and answer confidential student welfare queries.
            </p>
          </div>

          <div className="text-right text-xs text-zinc-400 font-mono hidden sm:block shrink-0">
            <div className="text-white font-medium">{currentUser?.email}</div>
            <div className="text-zinc-500 mt-0.5">Session: Verified Rep Desk</div>
          </div>
        </div>

        {/* Real-time KPI Metric Cards */}
        <div className="mt-8 pt-6 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.05]">
            <div className="text-xs text-zinc-500 font-medium">Active Pipeline</div>
            <div className="text-2xl font-semibold text-white tracking-tight mt-1 font-mono">
              {activeCount}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.05]">
            <div className="text-xs text-zinc-500 font-medium">Critical Attention</div>
            <div className="text-2xl font-semibold text-white tracking-tight mt-1 font-mono">
              {criticalCount}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.05]">
            <div className="text-xs text-zinc-500 font-medium">Verified Resolved</div>
            <div className="text-2xl font-semibold text-white tracking-tight mt-1 font-mono">
              {resolvedCount}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.05]">
            <div className="text-xs text-zinc-500 font-medium">Confidential Inquiries</div>
            <div className="text-2xl font-semibold text-white tracking-tight mt-1 font-mono">
              {confidentialCount}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.05] col-span-2 sm:col-span-1">
            <div className="text-xs text-zinc-500 font-medium">Avg Resolution Time</div>
            <div className="text-2xl font-semibold text-white tracking-tight mt-1 font-mono">
              24.8h
            </div>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-white/[0.08] text-xs font-medium">
        <button
          onClick={() => setActiveSubTab('triage')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeSubTab === 'triage'
              ? 'border-white text-white font-semibold'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Public Triage Queue ({issues.length})
        </button>
        <button
          onClick={() => setActiveSubTab('vaults')}
          className={`pb-3 px-4 border-b-2 transition-all ${
            activeSubTab === 'vaults'
              ? 'border-white text-white font-semibold'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Confidential Welfare Responses ({vaults.length})
        </button>
      </div>

      {/* Indent Dispatched Notification Toast */}
      {showIndentSuccess && (
        <div className="p-4 rounded-xl bg-zinc-900 border border-white/[0.15] text-white shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="w-5 h-5 text-white shrink-0" />
            <div>
              <div className="text-xs font-semibold">
                Official Department Requisition Slip Dispatched // {showIndentSuccess.indentId}
              </div>
              <div className="text-xs text-zinc-400">
                Formal indent logged for "{showIndentSuccess.issueTitle}" in {showIndentSuccess.lab}. Forwarded to {showIndentSuccess.recipient}.
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowIndentSuccess(null)}
            className="text-xs text-zinc-400 hover:text-white px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tab Contents */}
      {activeSubTab === 'triage' ? (
        /* Modern Table View */
        <div className="bg-[#0D0D10] border border-white/[0.08] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between text-xs">
            <span className="font-medium text-white">
              Public Department Triage Pipeline
            </span>
            <span className="text-zinc-500 font-normal">
              Click any row action to update status or file requisitions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] bg-black/40 text-zinc-400 text-[11px] font-medium">
                  <th className="p-4">Asset ID</th>
                  <th className="p-4">Issue Headline</th>
                  <th className="p-4">Urgency</th>
                  <th className="p-4">Stage</th>
                  <th className="p-4">+1 Votes</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {issues.map((issue) => (
                  <tr
                    key={issue.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4 whitespace-nowrap font-mono text-[11px]">
                      <div className="font-semibold text-white">{issue.id}</div>
                      <div className="text-zinc-500">{issue.equipmentCode}</div>
                    </td>
                    <td className="p-4 max-w-sm">
                      <div className="font-medium text-white line-clamp-1">
                        {issue.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                        {issue.lab} • {issue.studentName}
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          issue.urgency === 'critical'
                            ? 'bg-white text-zinc-950 font-semibold'
                            : issue.urgency === 'elevated'
                            ? 'bg-white/[0.1] text-white border border-white/[0.2]'
                            : 'bg-white/[0.04] text-zinc-400'
                        }`}
                      >
                        {issue.urgency.charAt(0).toUpperCase() + issue.urgency.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/60 border border-white/[0.1] text-zinc-300 text-[11px] capitalize">
                        {issue.stage.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap font-mono font-medium text-white">
                      +{issue.upvotes}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleGenerateIndent(issue)}
                          title="Generate Department Requisition Slip"
                          className="px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-300 hover:text-white text-xs transition-colors"
                        >
                          Lab Indent
                        </button>
                        <button
                          onClick={() => handleOpenEdit(issue)}
                          className="px-3 py-1.5 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-medium transition-colors"
                        >
                          Update Status
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Confidential Student Requests View */
        <div className="space-y-4">
          <div className="bg-[#0D0D10] border border-white/[0.08] rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-1">
              Confidential Student Welfare Responses
            </h3>
            <p className="text-xs text-zinc-400 font-normal">
              Directly review student welfare, medical leave condonation, and internal marks inquiries. You can reply straight into their secure 2-way thread.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vaults.map((vault) => (
              <div
                key={vault.vaultKey}
                className="bg-[#0D0D10] border border-white/[0.08] hover:border-white/[0.16] rounded-2xl p-5 flex flex-col justify-between transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-white text-zinc-950">
                      KEY: {vault.vaultKey}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {vault.isAnonymous ? 'Anonymous Student' : vault.subjectRoll}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white mb-2">
                    {vault.title}
                  </h4>

                  <div className="bg-black/40 border border-white/[0.06] rounded-xl p-3 text-xs text-zinc-300 mb-4 line-clamp-3 leading-relaxed">
                    "{vault.messages[vault.messages.length - 1]?.content}"
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] text-xs">
                  <span className="text-zinc-500 font-normal">
                    {vault.messages.length} messages
                  </span>
                  <button
                    onClick={() => onSelectVaultToReply(vault.vaultKey)}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open 2-Way Chat</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {isEditingStatus && selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#0D0D10] border border-white/[0.15] rounded-2xl p-6 sm:p-7 shadow-2xl text-left">
            <h3 className="text-base font-semibold text-white mb-1">
              Update Issue Lifecycle Stage
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              {selectedIssue.id} • {selectedIssue.title}
            </p>

            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">
                  Select Stage
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
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        newStage === s.key
                          ? 'bg-white text-zinc-950 font-semibold border-white shadow-sm'
                          : 'bg-white/[0.03] text-zinc-400 border-white/[0.08] hover:text-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Official Rep Resolution / Triage Log Note
                </label>
                <textarea
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="e.g. Lab tech replaced faulty BNC probe; verified 1kHz calibration square wave..."
                  className="w-full bg-black/50 border border-white/[0.08] focus:border-white/30 rounded-xl p-3 text-xs text-white placeholder-zinc-500 outline-none resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Target Resolution Date
                </label>
                <input
                  type="date"
                  value={targetFixDate}
                  onChange={(e) => setTargetFixDate(e.target.value)}
                  className="w-full bg-black/50 border border-white/[0.08] focus:border-white/30 rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingStatus(false)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white border border-white/[0.08] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-medium shadow-sm transition-all"
                >
                  Save Progression
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
