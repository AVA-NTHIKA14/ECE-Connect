import React, { useState } from 'react';
import {
  ChevronUp,
  MessageSquare,
  Building2,
  Calendar,
  Wrench,
  Clock,
  Eye,
  CheckCircle2,
  AlertTriangle,
  FlaskConical,
  Tv,
  GraduationCap
} from 'lucide-react';
import StatusTracker from './StatusTracker';
import { isRepresentativeUser } from '../services/auth';

export default function IssueCard({
  issue,
  currentUser,
  hasUpvoted,
  onUpvote,
  onSelectIssue,
  onOpenRepTriage
}) {
  const [isUpvoteAnimating, setIsUpvoteAnimating] = useState(false);

  const handleUpvoteClick = (e) => {
    e.stopPropagation();
    setIsUpvoteAnimating(true);
    setTimeout(() => setIsUpvoteAnimating(false), 200);
    onUpvote(issue.id);
  };

  const isRep = isRepresentativeUser(currentUser);
  const latestHistory = issue.statusHistory && issue.statusHistory.length > 0
    ? issue.statusHistory[issue.statusHistory.length - 1]
    : null;

  return (
    <article
      aria-labelledby={`issue-card-title-${issue.id}`}
      className="noticeboard-card pin-accent p-5 sm:p-6 text-left flex flex-col justify-between group transition-all duration-200 border border-slate-200"
    >
      <div>
        {/* Top Metadata Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Tag with dedicated Lucide Icon */}
            <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide inline-flex items-center gap-1.5">
              {issue.category === 'lab' && (
                <>
                  <FlaskConical className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />
                  <span>Laboratory</span>
                </>
              )}
              {issue.category === 'classroom' && (
                <>
                  <Tv className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                  <span>Classroom AV</span>
                </>
              )}
              {issue.category === 'facility' && (
                <>
                  <Building2 className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                  <span>Dept Facility</span>
                </>
              )}
              {issue.category === 'academics' && (
                <>
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />
                  <span>KTU Academics</span>
                </>
              )}
            </span>

            {/* Location */}
            <span className="text-[13px] text-slate-600 flex items-center gap-1 font-medium">
              <Building2 className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>{issue.lab}</span>
            </span>
          </div>

          {/* Urgency Badge with Lucide Icon */}
          <div>
            {issue.urgency === 'critical' && (
              <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 shadow-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />
                <span>Critical</span>
              </span>
            )}
            {issue.urgency === 'elevated' && (
              <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                <span>Elevated</span>
              </span>
            )}
            {issue.urgency === 'normal' && (
              <span className="text-[12px] text-slate-600 px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                <span>Normal</span>
              </span>
            )}
          </div>
        </div>

        {/* Card Title (18-20px) */}
        <div
          onClick={() => onSelectIssue(issue)}
          className="cursor-pointer group/title"
          tabIndex={0}
          role="button"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onSelectIssue(issue);
            }
          }}
        >
          <h3 id={`issue-card-title-${issue.id}`} className="text-[18px] sm:text-[19px] font-bold text-navy-900 tracking-tight leading-snug mb-2 group-hover/title:text-teal-700 transition-colors">
            {issue.title}
          </h3>

          {/* Body Text (minimum 16px / 1rem) */}
          <p className="text-base text-slate-800 leading-relaxed font-normal mb-4 line-clamp-3">
            {issue.description}
          </p>
        </div>

        {/* Compact 4-Stage Progress Stepper */}
        <div className="mb-4">
          <StatusTracker
            stage={issue.stage}
            isClosed={issue.isClosed}
            compact={true}
          />
        </div>

        {/* Latest Activity / Update info */}
        {latestHistory && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-start gap-2 mb-4">
            <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
            <div className="line-clamp-2 text-[13px] leading-relaxed">
              <strong className="text-navy-900 font-semibold">Latest Update: </strong>
              {latestHistory.note}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer: Metadata & Actions */}
      <div className="pt-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
        {/* Reporter info: 13-14px */}
        <div className="text-[13px] text-slate-500 font-normal">
          Reported by <span className="font-semibold text-navy-900">{issue.studentName || 'ECE Student'}</span>
          <span className="mx-1.5 text-slate-300">•</span>
          <span>{new Date(issue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </div>

        {/* Card Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Details Button */}
          <button
            onClick={() => onSelectIssue(issue)}
            aria-label={`View complete details for ${issue.title}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-teal-600 focus-visible:outline-none"
            title="View complete details and comments"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            <span>Details</span>
          </button>

          {/* Comments count indicator */}
          <button
            onClick={() => onSelectIssue(issue)}
            aria-label={`View ${issue.commentsCount || 0} observations on ${issue.title}`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-teal-600 focus-visible:outline-none"
            title="Observations count"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            <span>{issue.commentsCount || 0}</span>
          </button>

          {/* +1 Affects Me button */}
          <button
            onClick={handleUpvoteClick}
            disabled={isUpvoteAnimating}
            aria-label={hasUpvoted ? `Remove +1 Affects Me vote for ${issue.title}` : `Vote +1 Affects Me for ${issue.title}`}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-150 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-teal-600 focus-visible:outline-none disabled:opacity-60 ${
              hasUpvoted
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white border border-slate-300 text-navy-900 hover:border-teal-500 hover:text-teal-700'
            } ${isUpvoteAnimating ? 'scale-95' : ''}`}
            title="Indicate that this issue affects your lab/coursework"
          >
            <ChevronUp
              className={`w-4 h-4 ${hasUpvoted ? 'stroke-[3]' : 'stroke-[2]'}`}
              aria-hidden="true"
            />
            <span className="hidden sm:inline">+1 Affects Me</span>
            <span
              className={`px-1.5 py-0.2 rounded font-mono text-[11px] ${
                hasUpvoted ? 'bg-teal-800 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {issue.upvotesCount || 0}
            </span>
          </button>

          {/* Rep Triage Button */}
          {isRep && (
            <button
              onClick={() => onOpenRepTriage(issue)}
              aria-label={`Official representative triage for ${issue.title}`}
              className="px-2.5 py-1.5 rounded-lg bg-navy-900 text-white hover:bg-navy-800 text-[13px] font-semibold flex items-center gap-1 transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-teal-600 focus-visible:outline-none"
            >
              <Wrench className="w-3 h-3 text-teal-400" aria-hidden="true" />
              <span>Triage</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
