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
  GraduationCap,
  Loader2,
  AlertCircle
} from 'lucide-react';
import StatusTracker from './StatusTracker';
import { subscribeComments, addPublicComment } from '../services/db';
import { sanitizeMultiline } from '../utils/security';

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
    const cleanComment = sanitizeMultiline(commentInput);
    if (!cleanComment) return;

    if (!currentUser) {
      onOpenAuth();
      return;
    }

    try {
      setIsSubmittingComment(true);
      setCommentError(null);
      await addPublicComment(issue.id, cleanComment, currentUser);
      setCommentInput('');
    } catch (err) {
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
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 uppercase tracking-wide inline-flex items-center gap-1.5">
                {issue.category === 'lab' && <FlaskConical className="w-3.5 h-3.5 text-teal-600" aria-hidden="true" />}
                {issue.category === 'classroom' && <Tv className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />}
                {issue.category === 'facility' && <Building2 className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />}
                {issue.category === 'academics' && <GraduationCap className="w-3.5 h-3.5 text-indigo-600" aria-hidden="true" />}
                <span>{issue.category}</span>
              </span>
              <span className="text-sm text-slate-600 flex items-center gap-1 font-medium">
                <Building2 className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>{issue.lab}</span>
              </span>
            </div>

            {/* Modal Heading: 24-28px */}
            <h2 id="issue-modal-title" className="text-2xl sm:text-[26px] font-bold text-navy-900 tracking-tight leading-snug">
              {issue.title}
            </h2>

            {/* Metadata: 13-14px */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
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
              <span className="font-mono text-xs text-slate-500">ID: {issue.id}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-navy-900 hover:bg-slate-200 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            aria-label="Close details"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Detailed Problem Description */}
          <section aria-labelledby="problem-heading">
            <h3 id="problem-heading" className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">
              Problem Description
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-base text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
              {issue.description}
            </div>
          </section>

          {/* Lifecycle Progress & Status Tracker */}
          <section aria-labelledby="lifecycle-heading">
            <h3 id="lifecycle-heading" className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">
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
          </section>

          {/* Support Bar: +1 Affects Me */}
          <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-navy-900">
                Are you affected by this departmental issue?
              </div>
              <div className="text-sm text-slate-600 mt-0.5">
                Upvoting escalates shared priorities to the ECE Association representative and faculty.
              </div>
            </div>

            <button
              onClick={() => {
                if (!currentUser) onOpenAuth();
                else onUpvote(issue.id);
              }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-xs transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                hasUpvoted
                  ? 'bg-teal-600 text-white hover:bg-teal-700'
                  : 'bg-white border border-slate-300 text-navy-900 hover:border-teal-500 hover:text-teal-700'
              }`}
            >
              <ChevronUp className={`w-4 h-4 ${hasUpvoted ? 'stroke-[3]' : 'stroke-[2]'}`} aria-hidden="true" />
              <span>{hasUpvoted ? 'Affects You (+1 Recorded)' : '+1 Affects Me'}</span>
              <span className={`px-2 py-0.5 rounded-full font-mono text-xs ${hasUpvoted ? 'bg-teal-800 text-white' : 'bg-slate-100 text-navy-900'}`}>
                {issue.upvotesCount || 0}
              </span>
            </button>
          </div>

          {/* Observations & Comments Section */}
          <section aria-labelledby="observations-heading" className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 id="observations-heading" className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                Student Observations ({comments.length})
              </h3>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.length > 0 ? (
                comments.map((c) => (
                  <article
                    key={c.id}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 text-base text-slate-700 shadow-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-navy-900 text-sm">
                        {c.authorName || 'ECE Student'}
                      </span>
                      <span className="font-mono text-xs">
                        {new Date(c.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="leading-relaxed font-normal whitespace-pre-wrap">{c.text}</p>
                  </article>
                ))
              ) : (
                <div className="p-6 text-center text-sm text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  No observations added yet. Be the first to share an update on this issue.
                </div>
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handlePostComment} className="space-y-2">
              {commentError && (
                <div role="alert" className="text-sm text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />
                  <span>{commentError}</span>
                </div>
              )}
              <div className="flex gap-2">
                <label htmlFor="observation-input" className="sr-only">
                  Add an observation or test condition
                </label>
                <input
                  id="observation-input"
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder={
                    currentUser
                      ? 'Add an observation or test condition...'
                      : 'Sign in with your institutional ID to post observations'
                  }
                  disabled={!currentUser || isSubmittingComment}
                  className="flex-1 bg-white border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 rounded-xl px-4 py-2.5 text-base text-navy-900 placeholder-slate-400 outline-none transition-all disabled:bg-slate-100 focus-visible:ring-2 focus-visible:ring-teal-600"
                />
                <button
                  type="submit"
                  disabled={!currentUser || !commentInput.trim() || isSubmittingComment}
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                >
                  {isSubmittingComment ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Post</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
