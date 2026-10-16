import React, { useState } from 'react';
import {
  ChevronUp,
  MessageSquare,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  Cpu,
  Send,
  Wrench,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const STAGES = [
  { key: 'reported', label: 'Reported' },
  { key: 'acknowledged', label: 'Acknowledged' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
];

export default function IssueCard({
  issue,
  currentUser,
  onUpvote,
  onAddComment,
  onOpenRepTriage
}) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isUpvoteAnimating, setIsUpvoteAnimating] = useState(false);

  const hasUpvoted = currentUser
    ? issue.upvotedBy.includes(currentUser.email)
    : false;

  const currentStageIndex = STAGES.findIndex((s) => s.key === issue.stage);

  const handleUpvoteClick = () => {
    setIsUpvoteAnimating(true);
    setTimeout(() => setIsUpvoteAnimating(false), 200);
    onUpvote(issue.id);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(issue.id, newComment.trim());
    setNewComment('');
  };

  const isRep = currentUser?.role === 'representative';

  return (
    <div className="bg-[#0D0D10] border border-white/[0.08] hover:border-white/[0.18] rounded-2xl p-5 sm:p-6 transition-all duration-200 text-left flex flex-col justify-between group shadow-sm hover:shadow-glow-sm">
      <div>
        {/* Top Metadata Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Badge */}
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-zinc-300">
              {issue.category === 'lab' && 'Laboratory'}
              {issue.category === 'classroom' && 'Classroom AV'}
              {issue.category === 'facility' && 'Dept Facility'}
              {issue.category === 'academics' && 'KTU Academics'}
            </span>

            {/* Hardware Tag */}
            {issue.equipmentCode && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-900 border border-white/[0.1] text-zinc-300 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-zinc-400" />
                {issue.equipmentCode}
              </span>
            )}

            {/* Location */}
            <span className="text-[11px] text-zinc-400 flex items-center gap-1 font-normal">
              <Building2 className="w-3 h-3 text-zinc-500" />
              {issue.lab}
            </span>
          </div>

          {/* Urgency Badge */}
          <div>
            {issue.urgency === 'critical' && (
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white text-zinc-950 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 animate-ping" />
                Critical
              </span>
            )}
            {issue.urgency === 'elevated' && (
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/[0.1] text-zinc-200 border border-white/[0.2]">
                Elevated
              </span>
            )}
            {issue.urgency === 'normal' && (
              <span className="text-[11px] text-zinc-400 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
                Normal
              </span>
            )}
          </div>
        </div>

        {/* Issue Title */}
        <h3 className="text-base font-semibold text-white tracking-tight leading-snug mb-2 group-hover:text-zinc-100 transition-colors">
          {issue.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-zinc-400 leading-relaxed font-normal mb-5">
          {issue.description}
        </p>

        {/* Modern Connected Milestone Stepper */}
        <div className="bg-black/30 border border-white/[0.06] rounded-xl p-3.5 mb-4">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2.5">
            <span className="text-zinc-400 font-medium">Lifecycle Status</span>
            <span className="text-white font-medium">
              {STAGES[currentStageIndex]?.label}
            </span>
          </div>

          {/* Timeline Nodes & Connecting Bar */}
          <div className="relative flex items-center justify-between">
            {/* Background Track Line */}
            <div className="absolute left-2 right-2 top-2 h-0.5 bg-zinc-800 -z-0" />
            
            {/* Active Track Progress Line */}
            <div
              className="absolute left-2 top-2 h-0.5 bg-white transition-all duration-300 -z-0"
              style={{
                width: `${(currentStageIndex / (STAGES.length - 1)) * 96}%`,
              }}
            />

            {STAGES.map((stage, idx) => {
              const isPassed = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div key={stage.key} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isPassed
                        ? 'bg-white text-zinc-950 shadow-sm'
                        : 'bg-zinc-900 border border-zinc-700 text-zinc-600'
                    }`}
                  >
                    {isPassed ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
                    ) : (
                      <div className="w-1 h-1 rounded-full bg-zinc-700" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] mt-1.5 transition-colors whitespace-nowrap ${
                      isCurrent
                        ? 'text-white font-semibold'
                        : isPassed
                        ? 'text-zinc-300'
                        : 'text-zinc-600'
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verified Resolution Notes */}
        {issue.resolutionNotes && (
          <div className="bg-zinc-900/70 border border-white/[0.08] rounded-xl p-3.5 text-xs mb-4">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
              <span className="flex items-center gap-1.5 text-zinc-200 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                Department Resolution Log
              </span>
              {issue.targetFixDate && (
                <span className="text-zinc-500 flex items-center gap-1 font-mono text-[10px]">
                  <Calendar className="w-3 h-3" />
                  Target: {issue.targetFixDate}
                </span>
              )}
            </div>
            <p className="text-zinc-300 text-xs leading-relaxed font-normal pl-3 border-l border-white/20 mt-1.5">
              {issue.resolutionNotes}
            </p>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-white/[0.08] text-xs">
          {/* Reporter details */}
          <div className="text-[11px] text-zinc-400">
            By <span className="text-zinc-200 font-medium">{issue.studentName}</span>
            <span className="mx-1.5 text-zinc-600">•</span>
            <span>{new Date(issue.reportedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Discussion Button */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white transition-colors text-xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
              <span>{issue.comments?.length || 0}</span>
            </button>

            {/* "+1 Affects Me" Upvote Button (ProductHunt/Linear style) */}
            <button
              onClick={handleUpvoteClick}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                hasUpvoted
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 border border-white/[0.1]'
              } ${isUpvoteAnimating ? 'scale-95' : ''}`}
              title="Indicate that this issue affects your coursework"
            >
              <ChevronUp
                className={`w-3.5 h-3.5 transition-transform ${
                  hasUpvoted ? 'stroke-[3]' : 'stroke-[2]'
                }`}
              />
              <span>+1 Affects Me</span>
              <span
                className={`px-1.5 py-0.2 rounded font-mono text-[10px] ${
                  hasUpvoted ? 'bg-zinc-900 text-white' : 'bg-white/[0.1] text-zinc-300'
                }`}
              >
                {issue.upvotes}
              </span>
            </button>

            {/* Triage action for Rep */}
            {isRep && (
              <button
                onClick={() => onOpenRepTriage(issue)}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white text-white hover:text-zinc-950 border border-white/[0.12] text-xs font-medium transition-colors flex items-center gap-1"
              >
                <Wrench className="w-3 h-3" />
                <span>Triage</span>
              </button>
            )}
          </div>
        </div>

        {/* Expandable Comments Drawer */}
        {showComments && (
          <div className="mt-3.5 pt-3.5 border-t border-white/[0.06] space-y-3">
            <div className="text-[11px] font-medium text-zinc-400">
              Student Observations ({issue.comments?.length || 0})
            </div>

            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {issue.comments && issue.comments.length > 0 ? (
                issue.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-zinc-300"
                  >
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
                      <span className="text-zinc-200 font-medium">{comment.name}</span>
                      <span>{comment.time}</span>
                    </div>
                    <p className="font-normal leading-relaxed">{comment.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500 italic">
                  No observations added yet.
                </p>
              )}
            </div>

            {/* Post comment input */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  currentUser
                    ? 'Add an observation...'
                    : 'Sign in to add observation'
                }
                disabled={!currentUser}
                className="flex-1 bg-black/60 border border-white/[0.12] rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-white/40 outline-none disabled:opacity-40"
              />
              <button
                type="submit"
                disabled={!currentUser || !newComment.trim()}
                className="px-3 py-1.5 bg-white text-zinc-950 hover:bg-zinc-200 rounded-lg text-xs font-medium flex items-center gap-1 disabled:opacity-30 transition-colors"
              >
                <Send className="w-3 h-3" />
                <span>Post</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
