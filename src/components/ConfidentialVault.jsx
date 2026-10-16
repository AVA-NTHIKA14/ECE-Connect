import React, { useState } from 'react';
import {
  Lock,
  KeyRound,
  ShieldCheck,
  Send,
  Plus,
  Paperclip,
  Eye,
  EyeOff,
  UserCheck,
  FileText,
  Clock,
  Search,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';

export default function ConfidentialVault({
  vaults,
  currentUser,
  onSendMessage,
  onCreateVault,
  onOpenAuth
}) {
  const [selectedVaultKey, setSelectedVaultKey] = useState(
    vaults.length > 0 ? vaults[0].vaultKey : null
  );
  const [lookupKeyInput, setLookupKeyInput] = useState('');
  const [lookupError, setLookupError] = useState(null);

  // New Vault Form state
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('attendance');
  const [newIsAnonymous, setNewIsAnonymous] = useState(true);
  const [initialMessage, setInitialMessage] = useState('');
  const [newPriority, setNewPriority] = useState('normal');

  // Chat input
  const [chatInput, setChatInput] = useState('');
  const [attachedFileName, setAttachedFileName] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const isRep = currentUser?.role === 'representative';

  // Filter accessible vaults
  const visibleVaults = vaults.filter((v) => {
    if (isRep) return true;
    if (currentUser && v.authorEmail.toLowerCase() === currentUser.email.toLowerCase()) return true;
    if (v.vaultKey === selectedVaultKey) return true;
    return false;
  });

  const activeVault = vaults.find((v) => v.vaultKey === selectedVaultKey) || visibleVaults[0];

  const handleKeyLookup = (e) => {
    e.preventDefault();
    setLookupError(null);
    const cleaned = lookupKeyInput.trim().replace(/^vault-/i, '').trim();
    const found = vaults.find((v) => v.vaultKey === cleaned);

    if (found) {
      setSelectedVaultKey(found.vaultKey);
      setIsCreatingNew(false);
      setLookupKeyInput('');
    } else {
      setLookupError(`Key "${cleaned}" was not found. Please verify the 6-digit key.`);
    }
  };

  const handleCreateVaultSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !initialMessage.trim()) return;

    // Generate random 6-digit key
    const generatedKey = Math.floor(100000 + Math.random() * 900000).toString();

    const newVaultObj = {
      vaultKey: generatedKey,
      title: newTitle.trim(),
      category: newCategory,
      isAnonymous: newIsAnonymous,
      authorEmail: currentUser ? currentUser.email : 'pkd22ec045@gecskp.ac.in',
      createdAt: new Date().toISOString(),
      status: 'active',
      priority: newPriority,
      subjectRoll: newIsAnonymous
        ? 'Anonymous Student (Key Protected)'
        : (currentUser ? currentUser.rollNumber : 'PKD22EC045'),
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'student',
          senderLabel: newIsAnonymous
            ? 'Student (Vault Owner)'
            : (currentUser ? `${currentUser.name} [${currentUser.rollNumber}]` : 'Student [PKD22EC045]'),
          timestamp: new Date().toISOString(),
          content: initialMessage.trim(),
          attachments: attachedFileName ? [attachedFileName] : []
        }
      ]
    };

    onCreateVault(newVaultObj);
    setSelectedVaultKey(generatedKey);
    setIsCreatingNew(false);
    setNewTitle('');
    setInitialMessage('');
    setAttachedFileName(null);
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeVault) return;

    const senderRole = isRep ? 'rep' : 'student';
    const senderLabel = isRep
      ? 'ECE Association Representative'
      : activeVault.isAnonymous
      ? 'Student (Vault Owner)'
      : (currentUser ? `${currentUser.name} [${currentUser.rollNumber}]` : 'Student');

    onSendMessage(activeVault.vaultKey, {
      id: `msg-${Date.now()}`,
      sender: senderRole,
      senderLabel,
      timestamp: new Date().toISOString(),
      content: chatInput.trim(),
      attachments: attachedFileName ? [attachedFileName] : []
    });

    setChatInput('');
    setAttachedFileName(null);
  };

  const handleSimulateAttachment = () => {
    const samples = [
      'Medical_Certificate_Taluk_Hospital.pdf',
      'KTU_Annexure_IV_Condonation_Form.pdf',
      'Series_Exam_Mark_Verification_Scan.jpg'
    ];
    const picked = samples[Math.floor(Math.random() * samples.length)];
    setAttachedFileName(picked);
  };

  const handleCopyKey = (key) => {
    navigator.clipboard?.writeText(key);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="space-y-7 text-left">
      {/* Header Banner */}
      <div className="bg-[#0D0D10] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-xs font-medium text-zinc-300">
              <Lock className="w-3.5 h-3.5 text-zinc-300" />
              <span>Private 1-on-1 Welfare & Academic Advisory Channel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Confidential Student Welfare Vault
            </h1>
            <p className="text-sm text-zinc-400 font-normal leading-relaxed">
              Direct, encrypted channel with the ECE Association Representative. Discuss attendance condonations, internal re-evaluation, and personal welfare with optional <span className="text-white font-medium">Anonymous 6-Digit Vault Protection</span>.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => {
                setIsCreatingNew(true);
                setLookupError(null);
              }}
              className="px-5 py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Open New Confidential Vault</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace (Master-Detail Pane) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar: Key Retrieval + Vault Sessions */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* 6-Digit Key Unlock Card */}
          <div className="bg-[#0D0D10] border border-white/[0.08] rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-200 mb-2">
              <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
              <span>Access with 6-Digit Key</span>
            </div>
            <form onSubmit={handleKeyLookup} className="flex gap-2">
              <input
                type="text"
                value={lookupKeyInput}
                onChange={(e) => setLookupKeyInput(e.target.value)}
                placeholder="e.g. 849201"
                maxLength={8}
                className="flex-1 bg-black/50 border border-white/[0.08] focus:border-white/30 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-zinc-500 outline-none uppercase"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-white/[0.08] hover:bg-white text-zinc-200 hover:text-zinc-950 rounded-lg text-xs font-medium transition-colors border border-white/[0.08]"
              >
                Unlock
              </button>
            </form>
            {lookupError && (
              <div className="mt-2 text-[11px] text-zinc-300 bg-black/60 border border-white/10 p-2 rounded-lg flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>{lookupError}</span>
              </div>
            )}
            <p className="text-[11px] text-zinc-500 mt-2 font-normal leading-normal">
              Enter your vault code to resume an ongoing private conversation without revealing your identity.
            </p>
          </div>

          {/* Active Vaults List */}
          <div className="bg-[#0D0D10] border border-white/[0.08] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
              <span className="text-zinc-200">
                {isRep ? 'All Active Vaults' : 'Your Vault Sessions'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-300">
                {visibleVaults.length}
              </span>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {visibleVaults.map((vault) => {
                const isSelected = activeVault && activeVault.vaultKey === vault.vaultKey && !isCreatingNew;
                return (
                  <button
                    key={vault.vaultKey}
                    onClick={() => {
                      setSelectedVaultKey(vault.vaultKey);
                      setIsCreatingNew(false);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 text-xs ${
                      isSelected
                        ? 'bg-white text-zinc-950 border-white shadow-sm'
                        : 'bg-white/[0.02] text-zinc-300 border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-zinc-900 text-white'
                            : 'bg-white/[0.08] text-zinc-300'
                        }`}
                      >
                        KEY: {vault.vaultKey}
                      </span>
                      <span
                        className={`text-[10px] font-medium ${
                          isSelected ? 'text-zinc-600' : 'text-zinc-500'
                        }`}
                      >
                        {vault.isAnonymous ? 'Anonymous' : 'Named'}
                      </span>
                    </div>

                    <div
                      className={`font-medium text-xs line-clamp-1 mb-1 ${
                        isSelected ? 'text-zinc-950' : 'text-zinc-100'
                      }`}
                    >
                      {vault.title}
                    </div>

                    <div
                      className={`text-[11px] line-clamp-1 font-normal ${
                        isSelected ? 'text-zinc-600' : 'text-zinc-400'
                      }`}
                    >
                      {vault.messages[vault.messages.length - 1]?.content}
                    </div>
                  </button>
                );
              })}

              {visibleVaults.length === 0 && (
                <div className="p-5 text-center text-xs text-zinc-500 border border-dashed border-white/[0.08] rounded-xl font-normal">
                  No active confidential vault. Click "Open New Confidential Vault" or enter your 6-digit key above.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Pane: New Vault Creation OR Active 2-Way Chat Console */}
        <div className="lg:col-span-8">
          {isCreatingNew ? (
            /* Creation Form */
            <div className="bg-[#0D0D10] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/[0.08]">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 mb-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-white" />
                    <span>Confidential Submission</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white tracking-tight">
                    Initialize Private Vault Session
                  </h3>
                </div>
                <button
                  onClick={() => setIsCreatingNew(false)}
                  className="text-xs font-medium text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/[0.08] transition-colors"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleCreateVaultSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Subject / Concern Topic *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. S5 Medical duty leave condonation query"
                    className="w-full bg-black/50 border border-white/[0.08] focus:border-white/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Welfare Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-black/50 border border-white/[0.08] focus:border-white/30 rounded-xl px-3 py-2.5 text-xs text-zinc-300 outline-none cursor-pointer"
                    >
                      <option value="attendance">KTU Attendance Shortage & Condonation</option>
                      <option value="academics">Internal Marks Re-totaling / Verification</option>
                      <option value="medical">Medical Duty Certificate Review</option>
                      <option value="welfare">Emergency Financial Aid & Book-Bank</option>
                      <option value="personal">Personal Student Welfare & Support</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Identity Privacy Setting
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setNewIsAnonymous(true)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                          newIsAnonymous
                            ? 'bg-white text-zinc-950 border-white shadow-sm'
                            : 'bg-white/[0.03] text-zinc-400 border-white/[0.08]'
                        }`}
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Anonymous</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewIsAnonymous(false)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                          !newIsAnonymous
                            ? 'bg-white text-zinc-950 border-white shadow-sm'
                            : 'bg-white/[0.03] text-zinc-400 border-white/[0.08]'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Include Roll Number</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Confidential Message to Representative *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={initialMessage}
                    onChange={(e) => setInitialMessage(e.target.value)}
                    placeholder="Describe your situation in detail. Include relevant course codes, hospital dates, or specific questions. This conversation is encrypted and restricted to the student representative."
                    className="w-full bg-black/50 border border-white/[0.08] focus:border-white/30 rounded-xl p-3 text-xs text-white placeholder-zinc-500 outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Simulated Attachment */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs text-zinc-300">
                      {attachedFileName || 'Attach Medical Certificate / Mark Sheet (PDF/JPG)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSimulateAttachment}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-xs text-white transition-colors"
                  >
                    {attachedFileName ? 'Change' : '+ Attach Document'}
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-zinc-500">
                    A unique 6-digit access key will be generated for you.
                  </span>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-medium flex items-center gap-2 shadow-sm transition-all"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Create Vault & Dispatch</span>
                  </button>
                </div>
              </form>
            </div>
          ) : activeVault ? (
            /* Active 2-Way Chat Stream */
            <div className="bg-[#0D0D10] border border-white/[0.08] rounded-2xl flex flex-col h-[640px] shadow-sm overflow-hidden">
              
              {/* Chat Header */}
              <div className="p-4 sm:p-5 border-b border-white/[0.08] bg-black/40 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-white text-zinc-950">
                      KEY: {activeVault.vaultKey}
                    </span>
                    <button
                      onClick={() => handleCopyKey(activeVault.vaultKey)}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                      title="Copy 6-digit key"
                    >
                      {copySuccess ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3" />}
                      <span>{copySuccess ? 'Copied' : 'Copy Key'}</span>
                    </button>
                    <span className="text-zinc-600">•</span>
                    <span className="text-xs text-zinc-400">
                      {activeVault.isAnonymous ? 'Anonymous Session' : `Author: ${activeVault.subjectRoll}`}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    {activeVault.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] text-zinc-300">
                    Status: {activeVault.status}
                  </span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                {activeVault.messages.map((msg) => {
                  const isRepSender = msg.sender === 'rep';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isRepSender ? 'items-start' : 'items-end'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1 text-[11px] text-zinc-500 font-normal">
                        <span
                          className={`font-medium ${
                            isRepSender ? 'text-zinc-200' : 'text-zinc-300'
                          }`}
                        >
                          {msg.senderLabel}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div
                        className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                          isRepSender
                            ? 'bg-zinc-900 border border-white/[0.1] text-zinc-200 rounded-tl-sm'
                            : 'bg-white text-zinc-950 font-normal rounded-tr-sm shadow-sm'
                        }`}
                      >
                        <p>{msg.content}</p>

                        {/* File Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-current/15 space-y-1">
                            {msg.attachments.map((file, i) => (
                              <div
                                key={i}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono ${
                                  isRepSender
                                    ? 'bg-black/40 text-zinc-300 border border-white/[0.08]'
                                    : 'bg-zinc-200 text-zinc-900'
                                }`}
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>{file}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Composer */}
              <div className="p-3 sm:p-4 border-t border-white/[0.08] bg-black/40">
                {attachedFileName && (
                  <div className="mb-2 px-3 py-1 rounded-lg bg-white/[0.08] border border-white/[0.12] text-xs text-white flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-zinc-400" />
                      {attachedFileName}
                    </span>
                    <button
                      onClick={() => setAttachedFileName(null)}
                      className="text-zinc-400 hover:text-white text-xs"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <form onSubmit={handleSendReply} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSimulateAttachment}
                    title="Attach medical certificate or document"
                    className="p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-zinc-400 hover:text-white transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={
                      isRep
                        ? 'Type representative advisory reply...'
                        : 'Reply to representative in this encrypted channel...'
                    }
                    className="flex-1 bg-black/60 border border-white/[0.08] focus:border-white/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none"
                  />

                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-40 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-[#0D0D10] border border-white/[0.08] rounded-2xl p-12 text-center space-y-3">
              <Lock className="w-8 h-8 text-zinc-600 mx-auto" />
              <h4 className="text-sm font-semibold text-white">
                No Vault Active
              </h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto font-normal">
                Select an active conversation on the left or create a new confidential submission.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
