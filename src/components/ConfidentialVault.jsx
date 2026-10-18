import React, { useState, useEffect } from 'react';
import {
  Lock,
  ShieldCheck,
  Send,
  Plus,
  EyeOff,
  UserCheck,
  FileText,
  Clock,
  LogIn,
  CheckCircle2,
  Calendar,
  MessageSquare,
  ArrowLeft,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import {
  subscribeUserGrievances,
  subscribeGrievanceMessages,
  sendGrievanceMessage
} from '../services/db';
import { isRepresentativeUser } from '../services/auth';
import { sanitizeMultiline } from '../utils/security';

export default function ConfidentialVault({
  currentUser,
  onOpenAuth,
  onOpenNewModal
}) {
  const [grievances, setGrievances] = useState([]);
  const [selectedGrievanceId, setSelectedGrievanceId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingGrievances, setIsLoadingGrievances] = useState(true);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'
  const [chatError, setChatError] = useState(null);

  const isRep = isRepresentativeUser(currentUser);

  // Subscribe to accessible grievances
  useEffect(() => {
    if (!currentUser) {
      setGrievances([]);
      setIsLoadingGrievances(false);
      return;
    }

    setIsLoadingGrievances(true);
    const unsubscribe = subscribeUserGrievances(
      currentUser,
      (data) => {
        setGrievances(data);
        setIsLoadingGrievances(false);
        if (data.length > 0) {
          if (!selectedGrievanceId || !data.some((d) => d.id === selectedGrievanceId)) {
            setSelectedGrievanceId(data[0].id);
          }
        } else {
          setSelectedGrievanceId(null);
        }
      },
      () => {
        setIsLoadingGrievances(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  // Subscribe to messages in active grievance
  useEffect(() => {
    if (!selectedGrievanceId) {
      setMessages([]);
      return;
    }

    const unsubscribe = subscribeGrievanceMessages(selectedGrievanceId, (msgs) => {
      setMessages(msgs);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedGrievanceId]);

  const activeGrievance = grievances.find((g) => g.id === selectedGrievanceId) || grievances[0];

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setChatError(null);
    const cleaned = sanitizeMultiline(chatInput);
    if (!cleaned || !activeGrievance || !currentUser) return;

    try {
      setIsSending(true);
      await sendGrievanceMessage(activeGrievance.id, cleaned, currentUser);
      setChatInput('');
    } catch {
      setChatError('Could not send message. Please verify authorization and try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Not signed in state
  if (!currentUser) {
    return (
      <section aria-labelledby="vault-auth-heading" className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-navy-900 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-7 h-7" aria-hidden="true" />
        </div>
        <h2 id="vault-auth-heading" className="text-2xl font-bold text-navy-900 tracking-tight">
          Confidential Student Welfare Vault
        </h2>
        <p className="text-base text-slate-700 leading-relaxed font-normal">
          The Confidential Vault is a restricted advisory channel between authenticated students and the authorized ECE Department Representative. Please sign in with your verified GECP institutional account to view or raise private matters.
        </p>
        <div className="pt-2">
          <button
            onClick={onOpenAuth}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-base inline-flex items-center gap-2 shadow-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
          >
            <LogIn className="w-4 h-4" aria-hidden="true" />
            <span>Sign In to Access Vault</span>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="vault-heading" className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-50 border border-navy-200 text-xs font-semibold text-navy-900">
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Restricted 1-on-1 Student Welfare &amp; Academic Advisory Channel</span>
            </div>

            {/* Main Desktop Heading: 36-44px */}
            <h1 id="vault-heading" className="text-3xl sm:text-[38px] font-extrabold tracking-tight text-navy-900 leading-tight">
              Confidential Welfare Vault
            </h1>

            {/* Body Text: 16px minimum */}
            <p className="text-base text-slate-700 font-normal leading-relaxed">
              A private channel directly with the ECE Association Representative. Discuss medical attendance condonations, internal re-evaluation discrepancies, and welfare support in complete confidence.
            </p>
          </div>

          <div className="w-full sm:w-auto shrink-0">
            <button
              onClick={() => onOpenNewModal('private')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-semibold text-base flex items-center justify-center gap-2 shadow-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900 focus-visible:ring-offset-2"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
              <span>Raise Private Grievance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Master-Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar: Active Private Grievances */}
        <aside aria-label="Confidential grievances list" className={`lg:col-span-4 space-y-3 ${mobileView === 'chat' ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between text-sm font-bold text-navy-900">
              <h2>{isRep ? 'All Authorized Grievances' : 'Your Confidential Grievances'}</h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {grievances.length}
              </span>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {isLoadingGrievances ? (
                <div className="p-6 text-center text-sm text-slate-500">Loading cases...</div>
              ) : grievances.length > 0 ? (
                grievances.map((g) => {
                  const isSelected = activeGrievance && activeGrievance.id === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => {
                        setSelectedGrievanceId(g.id);
                        setMobileView('chat');
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-teal-50 border-teal-500 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                          {g.category}
                        </span>
                        {g.isAnonymous ? (
                          <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <EyeOff className="w-3 h-3 text-slate-500" aria-hidden="true" />
                            <span>Anonymous</span>
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-700 truncate max-w-[160px]">
                            {g.authorName || g.subjectRoll}
                          </span>
                        )}
                      </div>

                      <div className="font-bold text-navy-900 text-base line-clamp-1 mb-1">
                        {g.title}
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-mono font-medium">
                          {g.isAnonymous ? (isRep ? 'ANONYMOUS' : `${g.subjectRoll} (Masked)`) : g.subjectRoll}
                        </span>
                        <span>{new Date(g.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-6 text-center text-sm text-slate-600 bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
                  <div className="font-medium text-navy-900">No confidential cases on record.</div>
                  <p className="text-sm text-slate-500 leading-normal">
                    Submit a private academic or welfare inquiry to connect with the representative.
                  </p>
                  <button
                    onClick={() => onOpenNewModal('private')}
                    className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-sm font-semibold transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                    <span>File Private Inquiry</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Right Pane: 2-Way Encrypted Chat Stream */}
        <section aria-label="Grievance dialogue details" className={`lg:col-span-8 ${mobileView === 'list' ? 'hidden lg:block' : 'block'}`}>
          {/* Mobile Back Button */}
          <div className="lg:hidden mb-3">
            <button
              onClick={() => setMobileView('list')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-medium shadow-2xs hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" aria-hidden="true" />
              <span>Back to Cases List ({grievances.length})</span>
            </button>
          </div>
          {activeGrievance ? (
            <div className="bg-white border border-slate-200 rounded-2xl flex flex-col h-[600px] shadow-sm overflow-hidden">
              
              {/* Chat Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-navy-900 text-white">
                      CONFIDENTIAL
                    </span>
                    {activeGrievance.isAnonymous && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 flex items-center gap-1">
                        <EyeOff className="w-3 h-3 text-slate-600" aria-hidden="true" />
                        <span>ANONYMOUS</span>
                      </span>
                    )}
                    <span className="text-slate-300">•</span>
                    <span className="text-sm font-bold text-navy-900">
                      {activeGrievance.isAnonymous
                        ? (isRep ? 'Anonymous Student' : `${currentUser.displayName || currentUser.rollNumber} (Masked to Rep)`)
                        : (activeGrievance.authorName || activeGrievance.subjectRoll || 'Student')}
                    </span>
                    <span className="font-mono text-xs text-navy-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-bold">
                      {activeGrievance.isAnonymous
                        ? (isRep ? 'CONFIDENTIAL' : `${currentUser.rollNumber}`)
                        : activeGrievance.subjectRoll}
                    </span>
                    {!activeGrievance.isAnonymous && activeGrievance.semester && (
                      <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded">
                        {activeGrievance.semester}
                      </span>
                    )}
                    <span className="text-xs text-slate-500 font-mono">
                      {activeGrievance.isAnonymous
                        ? (isRep ? '[Identity Protected]' : `(${activeGrievance.authorEmail})`)
                        : `(${activeGrievance.authorEmail})`}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-navy-900 tracking-tight">
                    {activeGrievance.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {activeGrievance.isClosed ? (
                    <span className="closed-stamp text-xs py-0.5 px-2.5">
                      CLOSED
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 font-semibold text-xs capitalize">
                      Status: {activeGrievance.stage ? activeGrievance.stage.replace('_', ' ') : (activeGrievance.status || 'Active')}
                    </span>
                  )}
                </div>
              </div>

              {activeGrievance.resolutionNotes && (
                <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-200 text-sm text-emerald-950 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="font-bold">Official Resolution Note: </span>
                    <span>{activeGrievance.resolutionNotes}</span>
                  </div>
                </div>
              )}

              {/* Chat Error Banner */}
              {chatError && (
                <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center justify-between gap-2 mx-4 mt-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" aria-hidden="true" />
                    <span>{chatError}</span>
                  </div>
                  <button
                    onClick={() => setChatError(null)}
                    aria-label="Dismiss error"
                    className="text-red-500 hover:text-red-700 p-0.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              )}

              {/* Chat Messages */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                {messages.map((msg) => {
                  const isRepSender = msg.senderRole === 'rep';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isRepSender ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-2 mb-1 text-xs text-slate-500 font-normal">
                        <span className="font-semibold text-navy-900">
                          {msg.senderLabel}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-xs">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div
                        className={`max-w-xl p-4 rounded-2xl text-base leading-relaxed whitespace-pre-wrap shadow-xs ${
                          isRepSender
                            ? 'bg-navy-900 text-white rounded-tl-sm'
                            : 'bg-white text-navy-900 border border-slate-200 rounded-tr-sm'
                        }`}
                      >
                        <p>{msg.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Composer */}
              <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <label htmlFor="confidential-chat-input" className="sr-only">
                    {isRep ? 'Type representative advisory reply' : 'Reply in confidential advisory channel'}
                  </label>
                  <input
                    id="confidential-chat-input"
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={
                      isRep
                        ? 'Type representative advisory reply...'
                        : 'Reply in this confidential advisory channel...'
                    }
                    className="flex-1 bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 rounded-xl px-4 py-2.5 text-base text-navy-900 placeholder-slate-400 outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                  />

                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isSending}
                    className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center gap-1.5 shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-14 text-center space-y-4 shadow-sm flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shadow-2xs">
                <Lock className="w-7 h-7" aria-hidden="true" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h4 className="text-xl font-bold text-navy-900 tracking-tight">
                  {grievances.length === 0 ? 'Your Vault is Currently Empty' : 'No Case Selected'}
                </h4>
                <p className="text-base text-slate-600 leading-relaxed font-normal">
                  {grievances.length === 0
                    ? 'No confidential student welfare grievances are on record under your student identity. You can raise a private inquiry directly with the ECE Association Representative.'
                    : 'Select a grievance case from the list on the left to review messages and reply.'}
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => onOpenNewModal('private')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#087F8C] hover:bg-[#06636E] text-white font-semibold text-base shadow-xs hover:shadow transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087F8C] focus-visible:ring-offset-2"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                  <span>Raise Private Grievance</span>
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
