import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Clock,
  Calendar,
  ChevronUp,
  MessageSquare,
  Send,
  User,
  ShieldCheck,
  CheckCircle2,
  FlaskConical,
  Tv,
  GraduationCap
} from 'lucide-react';
import StatusTracker from './StatusTracker';
import { subscribeComments, addPublicComment } from '../services/db';

export default function IssueDetailsModal({
  isOpen,
  issue,
  currentUser,
  hasUpvoted,
  onClose,
  onUpvote,
  onOpenAuth
}) {
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState(null);

  useEffect(() => {
    if (!isOpen || !issue?.id) return;
    const unsubscribe = subscribeComments(issue.id, (loadedComments) => {
      setComments(loadedComments);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isOpen, issue?.id]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !issue) return null;

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    if (!currentUser) {
      onOpenAuth();
      return;
    }

    try {
      setIsSubmittingComment(true);
      setCommentError(null);
      await addPublicComment(issue.id, commentInput.trim(), currentUser);
      setCommentInput('');
    } catch (err) {
      console.error('Error posting comment:', err);
      setCommentError(err.message || 'Failed to post observation.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="issue-modal-title"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-left flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 uppercase tracking-wide inline-flex items-center gap-1.5">
                {issue.category === 'lab' && <FlaskConical className="w-3.5 h-3.5 text-teal-600" />}
                {issue.category === 'classroom' && <Tv className="w-3.5 h-3.5 text-blue-600" />}
                {issue.category === 'facility' && <Building2 className="w-3.5 h-3.5 text-amber-600" />}
                {issue.category === 'academics' && <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />}
                <span>{issue.category}</span>
              </span>
              <span className="text-[13px] text-slate-600 flex items-center gap-1 font-medium">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{issue.lab}</span>
              </span>
            </div>

            {/* Modal Heading: 24-28px */}
            <h2 id="issue-modal-title" className="text-2xl sm:text-[26px] font-bold text-navy-900 tracking-tight leading-snug">
              {issue.title}
            </h2>

            {/* Metadata: 13-14px */}
            <div className="flex flex-wrap items-center gap-3 text-[13px] sm:text-[14px] text-slate-500">
              <span>Reported by: <strong className="text-navy-900">{issue.studentName || 'ECE Student'}</strong></span>
              <span>•</span>
              <span>
                {new Date(issue.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              <span>•</span>
              <span className="font-mono text-[12px] text-slate-400">ID: {issue.id}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-navy-900 hover:bg-slate-200 transition-colors shrink-0"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Detailed Problem Description: 15-16px */}
          <div>
            <h3 className="text-[13px] font-bold text-navy-900 uppercase tracking-wider mb-2">
              Problem Description
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[15px] sm:text-[16px] text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
              {issue.description}
            </div>
          </div>

          {/* Lifecycle Progress & Status Tracker */}
          <div>
            <h3 className="text-[13px] font-bold text-navy-900 uppercase tracking-wider mb-2">
              Lifecycle Progress
            </h3>
            <StatusTracker
              stage={issue.stage}
              isClosed={issue.isClosed}
              statusHistory={issue.statusHistory || []}
              resolutionNotes={issue.resolutionNotes}
              targetFixDate={issue.targetFixDate}
              assignedRep={issue.assignedRep}
              closedAt={issue.closedAt}
              compact={false}
            />
          </div>

          {/* Support Bar: +1 Affects Me */}
          <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-[14px] font-bold text-navy-900">
                Are you affected by this departmental issue?
              </div>
              <div className="text-[13px] text-slate-600 mt-0.5">
                Upvoting escalates shared priorities to the ECE Association representative and faculty.
              </div>
            </div>

            <button
              onClick={() => {
                if (!currentUser) onOpenAuth();
                else onUpvote(issue.id);
              }}
              className={`px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-2 shadow-xs transition-all duration-150 ${
                hasUpvoted
                  ? 'bg-teal-600 text-white hover:bg-teal-700'
                  : 'bg-white border border-slate-300 text-navy-900 hover:border-teal-500 hover:text-teal-700'
              }`}
            >
              <ChevronUp className={`w-4 h-4 ${hasUpvoted ? 'stroke-[3]' : 'stroke-[2]'}`} />
              <span>{hasUpvoted ? 'Affects You (+1 Recorded)' : '+1 Affects Me'}</span>
              <span className={`px-2 py-0.5 rounded-full font-mono text-[11px] ${hasUpvoted ? 'bg-teal-800 text-white' : 'bg-slate-100 text-navy-900'}`}>
                {issue.upvotesCount || 0}
              </span>
            </button>
          </div>

          {/* Observations & Comments Section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-navy-900 uppercase tracking-wider">
                Student Observations ({comments.length})
              </h3>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.length > 0 ? (
                comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 text-[14px] text-slate-700 shadow-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[12px] text-slate-500">
                      <span className="font-semibold text-navy-900 text-[13px]">
                        {c.authorName || 'ECE Student'}
                      </span>
                      <span className="font-mono text-[11px]">
                        {new Date(c.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="leading-relaxed font-normal whitespace-pre-wrap">{c.text}</p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-[13px] text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  No observations added yet. Be the first to share an update on this issue.
                </div>
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handlePostComment} className="space-y-2">
              {commentError && (
                <div className="text-[13px] text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                  {commentError}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder={
                    currentUser
                      ? 'Add an observation or test condition...'
                      : 'Sign in with your institutional ID to post observations'
                  }
                  disabled={!currentUser || isSubmittingComment}
                  className="flex-1 bg-white border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 rounded-xl px-4 py-2.5 text-[14px] text-navy-900 placeholder-slate-400 outline-none transition-all disabled:bg-slate-100"
                />
                <button
                  type="submit"
                  disabled={!currentUser || !commentInput.trim() || isSubmittingComment}
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-[13px] font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-[13px] font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
