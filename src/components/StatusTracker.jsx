import React from 'react';
import {
  FileText,
  Eye,
  Wrench,
  CheckCircle2,
  Archive,
  Calendar,
  Clock
} from 'lucide-react';

export const STAGES = [
  { key: 'reported', label: 'Reported', step: 1, icon: FileText, desc: 'Registered' },
  { key: 'acknowledged', label: 'Acknowledged', step: 2, icon: Eye, desc: 'Under review' },
  { key: 'in_progress', label: 'In Progress', step: 3, icon: Wrench, desc: 'Technician action' },
  { key: 'resolved', label: 'Resolved', step: 4, icon: CheckCircle2, desc: 'Complete' },
];

export default function StatusTracker({
  stage = 'reported',
  isClosed = false,
  statusHistory = [],
  resolutionNotes = null,
  targetFixDate = null,
  assignedRep = null,
  closedAt = null,
  compact = false
}) {
  const currentStageIndex = STAGES.findIndex((s) => s.key === stage);
  const isArchived = isClosed || stage === 'closed';

  return (
    <div className="space-y-3 text-left">
      {/* 4-Stage Connected Milestone Stepper */}
      <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3 sm:p-4">
        <div className="flex items-center justify-between text-[13px] mb-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-navy-900">Current Status:</span>
            <span className="font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full text-[12px]">
              {isArchived ? 'Officially Closed & Archived' : (STAGES[currentStageIndex]?.label || 'Under Triage')}
            </span>
          </div>

          {isArchived && (
            <div className="closed-stamp">
              CLOSED
            </div>
          )}
        </div>

        {/* Progress Stepper Bar */}
        <div className="relative flex items-center justify-between px-2">
          {/* Background Track Line */}
          <div className="absolute left-6 right-6 top-3.5 h-1 bg-slate-200 -z-0" />

          {/* Active Filled Progress Line */}
          <div
            className="absolute left-6 top-3.5 h-1 bg-teal-600 transition-all duration-300 -z-0"
            style={{
              width: `${
                isArchived
                  ? 100
                  : currentStageIndex >= 0
                  ? (currentStageIndex / (STAGES.length - 1)) * 90
                  : 0
              }%`,
            }}
          />

          {STAGES.map((s, idx) => {
            const isCompleted = isArchived || idx < currentStageIndex;
            const isCurrent = !isArchived && idx === currentStageIndex;
            const Icon = s.icon;

            return (
              <div key={s.key} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 text-xs font-semibold ${
                    isCurrent
                      ? 'bg-teal-600 text-white ring-4 ring-teal-100 shadow-xs'
                      : isCompleted
                      ? 'bg-navy-900 text-white shadow-xs'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                  aria-label={`Stage ${s.step}: ${s.label}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="text-center mt-1.5">
                  <div
                    className={`text-[10px] sm:text-[12px] font-semibold leading-tight ${
                      isCurrent
                        ? 'text-teal-700'
                        : isCompleted
                        ? 'text-navy-900'
                        : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </div>
                  <div className="text-[10px] text-slate-400 hidden sm:block mt-0.5">
                    Stage {s.step}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Non-compact mode: Detailed resolution log and chronological audit history */}
      {!compact && (
        <div className="space-y-3">
          {/* Resolution Notes Box */}
          {resolutionNotes && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-navy-900">
              <div className="flex items-center justify-between mb-1.5 font-bold text-emerald-950 text-[13px]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Official Resolution Summary
                </span>
                {targetFixDate && (
                  <span className="text-slate-500 font-mono text-[12px] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Target: {targetFixDate}
                  </span>
                )}
              </div>
              <p className="text-slate-800 text-[14px] leading-relaxed font-normal pl-3 border-l-2 border-emerald-400">
                {resolutionNotes}
              </p>
            </div>
          )}

          {/* Chronological Status Audit Trail */}
          {statusHistory && statusHistory.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="font-bold text-navy-900 mb-2.5 flex items-center gap-1.5 text-[14px]">
                <Clock className="w-4 h-4 text-teal-600" />
                Progress Timeline ({statusHistory.length})
              </div>
              <div className="space-y-3 border-l-2 border-slate-200 pl-3.5 ml-1.5">
                {statusHistory.map((entry, idx) => (
                  <div key={idx} className="relative pb-1">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-teal-600 border-2 border-white shadow-xs" />
                    <div className="flex items-center justify-between text-[12px] text-slate-500 mb-0.5">
                      <span className="font-bold text-navy-900 capitalize text-[13px]">
                        {entry.stage.replace('_', ' ')}
                      </span>
                      <span className="font-mono text-[11px]">
                        {new Date(entry.updatedAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-slate-700 text-[13px] leading-relaxed">
                      {entry.note}
                    </p>
                    {entry.updatedBy && (
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Updated by {entry.updatedBy}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
