import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Globe,
  Lock,
  AlertTriangle,
  ChevronRight,
  ArrowLeft,
  Building2,
  EyeOff,
  UserCheck,
  Loader2
} from 'lucide-react';
import { LAB_FACILITIES } from '../data/mockData';
import { sanitizeTitle, sanitizeMultiline } from '../utils/security';

export default function NewIssueModal({
  isOpen,
  onClose,
  onSubmitPublic,
  onSubmitPrivate,
  currentUser,
  initialMode = null
}) {
  // Step 1: Mode Selection ('public' | 'private' | null)
  const [reportingMode, setReportingMode] = useState(initialMode);
  const [confirmedPrivacy, setConfirmedPrivacy] = useState(false);
  const [warnSwitchMode, setWarnSwitchMode] = useState(false);
  const [pendingModeSwitch, setPendingModeSwitch] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (initialMode) {
        setReportingMode(initialMode);
      } else {
        setReportingMode(null);
      }
    }
  }, [isOpen, initialMode]);

  // Common Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('normal');

  // Public Specific Fields
  const [publicCategory, setPublicCategory] = useState('lab');
  const [labId, setLabId] = useState(LAB_FACILITIES[0]?.name || 'EC 1st Year Class');
  const [hidePublicIdentity, setHidePublicIdentity] = useState(true); // Complainant identity hidden by default

  // Private Specific Fields
  const [privateCategory, setPrivateCategory] = useState('attendance');
  const [hidePrivateIdentity, setHidePrivateIdentity] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setReportingMode(null);
    setConfirmedPrivacy(false);
    setTitle('');
    setDescription('');
    setUrgency('normal');
    setPublicCategory('lab');
    setLabId(LAB_FACILITIES[0]?.name || 'EC 1st Year Class');
    setHidePublicIdentity(true);
    setPrivateCategory('attendance');
    setHidePrivateIdentity(false);
    setFormError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSelectMode = (mode) => {
    if (reportingMode && reportingMode !== mode && (title.trim() || description.trim())) {
      setPendingModeSwitch(mode);
      setWarnSwitchMode(true);
      return;
    }
    setReportingMode(mode);
    setConfirmedPrivacy(false);
  };

  const confirmModeSwitch = () => {
    setReportingMode(pendingModeSwitch);
    setWarnSwitchMode(false);
    setPendingModeSwitch(null);
    setConfirmedPrivacy(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const cleanTitle = sanitizeTitle(title);
    const cleanDesc = sanitizeMultiline(description);

    if (!cleanTitle || !cleanDesc) {
      setFormError('Please complete all mandatory title and description fields.');
      return;
    }

    if (!confirmedPrivacy) {
      setFormError('Please review and check the privacy confirmation before submission.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (reportingMode === 'public') {
        await onSubmitPublic({
          title: cleanTitle,
          description: cleanDesc,
          category: publicCategory,
          lab: labId,
          urgency,
          hideIdentity: hidePublicIdentity
        });
      } else {
        await onSubmitPrivate({
          title: cleanTitle,
          initialMessage: cleanDesc,
          category: privateCategory,
          urgency,
          isAnonymous: hidePrivateIdentity
        });
      }
      handleClose();
    } catch (err) {
      setFormError(err.message || 'An error occurred while saving your report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-issue-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-left flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-800 mb-1">
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Grievance Reporting Portal</span>
            </div>
            <h2 id="new-issue-modal-title" className="text-2xl sm:text-[26px] font-bold text-navy-900 tracking-tight">
              {reportingMode === null
                ? 'Select Grievance Classification'
                : reportingMode === 'public'
                ? 'Public Department Issue'
                : 'Private Confidential Grievance'}
            </h2>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-navy-900 hover:bg-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            aria-label="Close grievance portal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          
          {/* STEP 1: Two Distinct Options */}
          {reportingMode === null ? (
            <div className="space-y-4">
              <p className="text-base text-slate-700 leading-relaxed font-normal">
                To protect student confidentiality and route concerns properly, choose the reporting channel for your concern:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                
                {/* Option A: Public Department Issue */}
                <button
                  type="button"
                  onClick={() => handleSelectMode('public')}
                  className="p-5 rounded-2xl border-2 border-slate-200 hover:border-teal-600 hover:bg-teal-50/20 text-left cursor-pointer transition-all flex flex-col justify-between group shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Globe className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-navy-900 group-hover:text-teal-700 transition-colors">
                        Public Department Issue
                      </h3>
                      <span className="text-xs font-semibold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full mt-1 inline-block">
                        Visible to ECE Community
                      </span>
                    </div>
                    <p className="text-base text-slate-600 leading-relaxed font-normal">
                      Report a shared issue affecting classrooms, laboratories, equipment, facilities, or academic coordination. Your issue appears on the Community Wall so other students can follow its progress and indicate that they are affected.
                    </p>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-600 space-y-1">
                      <strong className="text-navy-900 font-semibold block text-sm">Common Examples:</strong>
                      <ul className="list-disc pl-4 space-y-0.5">
                        <li>Classroom projector not working / HDMI faults</li>
                        <li>Laboratory equipment broken or uncalibrated</li>
                        <li>Water leakage / electrical switchboard faults</li>
                        <li>KTU internal exam or timetable clashes</li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-teal-700">
                    <span>Select Public Report</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </div>
                </button>

                {/* Option B: Private Grievance */}
                <button
                  type="button"
                  onClick={() => handleSelectMode('private')}
                  className="p-5 rounded-2xl border-2 border-slate-200 hover:border-navy-900 hover:bg-slate-50 text-left cursor-pointer transition-all flex flex-col justify-between group shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-navy-50 border border-navy-200 text-navy-900 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Lock className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-navy-900 group-hover:text-navy-800 transition-colors">
                        Private Grievance
                      </h3>
                      <span className="text-xs font-semibold text-navy-800 bg-slate-200 px-2.5 py-0.5 rounded-full mt-1 inline-block">
                        Restricted Access • Confidential
                      </span>
                    </div>
                    <p className="text-base text-slate-600 leading-relaxed font-normal">
                      Raise a personal, sensitive, or individual concern privately. Your complaint and conversation will not appear on the Community Wall, public search, or public statistics.
                    </p>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-600 space-y-1">
                      <strong className="text-navy-900 font-semibold block text-sm">Protected Topics:</strong>
                      <ul className="list-disc pl-4 space-y-0.5">
                        <li>Medical duty leave &amp; KTU attendance shortage</li>
                        <li>Internal exam mark re-totaling disputes</li>
                        <li>Emergency book-bank or welfare assistance</li>
                        <li>Personal student advisory or sensitive concerns</li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-navy-900">
                    <span>Select Private Grievance</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </div>
                </button>

              </div>
            </div>
          ) : (
            /* STEP 2: Detail Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Mode Indicator & Switch Warning */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {reportingMode === 'public' ? (
                    <Globe className="w-4 h-4 text-teal-600 shrink-0" aria-hidden="true" />
                  ) : (
                    <Lock className="w-4 h-4 text-navy-900 shrink-0" aria-hidden="true" />
                  )}
                  <div className="text-sm">
                    <span className="font-bold text-navy-900">
                      {reportingMode === 'public' ? 'Public Community Report' : 'Private Confidential Grievance'}
                    </span>
                    <span className="text-slate-500 ml-2">
                      ({reportingMode === 'public' ? 'Visible to students on wall' : 'Restricted to representative & owner'})
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectMode(reportingMode === 'public' ? 'private' : 'public')}
                  className="text-sm text-teal-700 hover:underline font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded px-1"
                >
                  Switch to {reportingMode === 'public' ? 'Private' : 'Public'}
                </button>
              </div>

              {/* Mode Switch Warning Banner */}
              {warnSwitchMode && (
                <div role="alert" className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden="true" />
                    <span>Confirm Visibility Mode Change</span>
                  </div>
                  <p className="leading-relaxed">
                    You have entered content into a <strong>{reportingMode.toUpperCase()}</strong> report. Switching to <strong>{pendingModeSwitch?.toUpperCase()}</strong> changes where this data is stored and who can read it. Do you want to proceed?
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={confirmModeSwitch}
                      className="px-3 py-1.5 rounded-lg bg-amber-700 text-white font-semibold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-800"
                    >
                      Yes, Switch Mode
                    </button>
                    <button
                      type="button"
                      onClick={() => setWarnSwitchMode(false)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-800 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Headline / Title */}
              <div>
                <label htmlFor="issue-title" className="block text-xs font-bold text-navy-900 uppercase tracking-wide mb-1.5">
                  {reportingMode === 'public' ? 'Issue Headline *' : 'Subject / Topic *'}
                </label>
                <input
                  id="issue-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    reportingMode === 'public'
                      ? 'e.g. CRO Bench 03 ground fault & signal drift'
                      : 'e.g. S5 KTU Medical duty leave condonation query'
                  }
                  className="w-full bg-white border border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 rounded-xl px-4 py-2.5 text-base text-navy-900 placeholder-slate-400 outline-none"
                />
              </div>

              {/* Category & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="issue-category" className="block text-xs font-bold text-navy-900 uppercase tracking-wide mb-1.5">
                    Category *
                  </label>
                  {reportingMode === 'public' ? (
                    <select
                      id="issue-category"
                      value={publicCategory}
                      onChange={(e) => setPublicCategory(e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-teal-600 rounded-xl px-3 py-2.5 text-base text-navy-900 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-600"
                    >
                      <option value="lab">Laboratory Equipment</option>
                      <option value="classroom">Classroom AV / Projector</option>
                      <option value="facility">Department Facility / Power</option>
                      <option value="academics">KTU Academics / Timetable</option>
                    </select>
                  ) : (
                    <select
                      id="issue-category"
                      value={privateCategory}
                      onChange={(e) => setPrivateCategory(e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-navy-900 rounded-xl px-3 py-2.5 text-base text-navy-900 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-navy-900"
                    >
                      <option value="attendance">KTU Attendance Shortage &amp; Condonation</option>
                      <option value="academics">Internal Marks Re-totaling &amp; Verification</option>
                      <option value="medical">Medical Certificate &amp; Leave Review</option>
                      <option value="welfare">Emergency Financial Aid &amp; Book-Bank</option>
                      <option value="personal">Personal Student Welfare &amp; Support</option>
                    </select>
                  )}
                </div>

                <div>
                  <span className="block text-xs font-bold text-navy-900 uppercase tracking-wide mb-1.5">
                    Urgency Level *
                  </span>
                  <div className="grid grid-cols-3 gap-2" role="group" aria-label="Urgency level selector">
                    {[
                      { key: 'normal', label: 'Normal' },
                      { key: 'elevated', label: 'Elevated' },
                      { key: 'critical', label: 'Critical' },
                    ].map((u) => (
                      <button
                        type="button"
                        key={u.key}
                        aria-pressed={urgency === u.key}
                        onClick={() => setUrgency(u.key)}
                        className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all ${
                          urgency === u.key
                            ? 'bg-navy-900 text-white border-navy-900 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600`}
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Public Specific: Location / Room Selection */}
              {reportingMode === 'public' && (
                <div>
                  <label htmlFor="issue-lab" className="block text-xs font-bold text-navy-900 uppercase tracking-wide mb-1.5">
                    Classroom / Laboratory Room *
                  </label>
                  <select
                    id="issue-lab"
                    value={labId}
                    onChange={(e) => setLabId(e.target.value)}
                    className="w-full bg-white border border-slate-300 focus:border-teal-600 rounded-xl px-3.5 py-2.5 text-base text-navy-900 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-600"
                  >
                    {LAB_FACILITIES.map((facility) => (
                      <option key={facility.id} value={facility.name}>
                        {facility.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Description / Initial Message */}
              <div>
                <label htmlFor="issue-description" className="block text-xs font-bold text-navy-900 uppercase tracking-wide mb-1.5">
                  {reportingMode === 'public' ? 'Detailed Problem Description *' : 'Confidential Message to Representative *'}
                </label>
                <textarea
                  id="issue-description"
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    reportingMode === 'public'
                      ? 'Describe symptoms, test conditions, specific bench number, or error codes. Avoid including unnecessary personal or sensitive information.'
                      : 'Provide details regarding your medical dates, course codes, or circumstance. This message is encrypted and restricted to the student representative.'
                  }
                  className="w-full bg-white border border-slate-300 focus:border-teal-600 rounded-xl p-3 text-base text-navy-900 placeholder-slate-400 outline-none resize-none leading-relaxed focus-visible:ring-2 focus-visible:ring-teal-600"
                />
              </div>

              {/* Privacy Setting Toggle */}
              {reportingMode === 'public' ? (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <label htmlFor="hide-public-id" className="flex items-center gap-2 cursor-pointer flex-1 mr-3">
                    {hidePublicIdentity ? <EyeOff className="w-4 h-4 text-teal-600" aria-hidden="true" /> : <UserCheck className="w-4 h-4 text-slate-500" aria-hidden="true" />}
                    <span className="text-sm text-slate-700">
                      Hide student identity on Community Wall (Anonymous posting)
                    </span>
                  </label>
                  <input
                    id="hide-public-id"
                    type="checkbox"
                    checked={hidePublicIdentity}
                    onChange={(e) => setHidePublicIdentity(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-600"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Anonymous Toggle for Private Grievance */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <label htmlFor="hide-private-id" className="flex items-center gap-2.5 cursor-pointer flex-1 mr-3">
                      {hidePrivateIdentity ? (
                        <EyeOff className="w-4 h-4 text-navy-900 shrink-0" aria-hidden="true" />
                      ) : (
                        <UserCheck className="w-4 h-4 text-teal-600 shrink-0" aria-hidden="true" />
                      )}
                      <div>
                        <span className="text-sm font-semibold text-navy-900 block">
                          Submit Anonymously to Representative
                        </span>
                        <span className="text-xs text-slate-500 block">
                          Mask your name, KTU roll number, and email from the representative triage desk
                        </span>
                      </div>
                    </label>
                    <input
                      id="hide-private-id"
                      type="checkbox"
                      checked={hidePrivateIdentity}
                      onChange={(e) => setHidePrivateIdentity(e.target.checked)}
                      className="w-4 h-4 text-navy-900 rounded cursor-pointer shrink-0 ml-3 focus-visible:ring-2 focus-visible:ring-teal-600"
                    />
                  </div>

                  {hidePrivateIdentity ? (
                    <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-300 text-sm text-slate-700 flex items-center gap-2.5">
                      <EyeOff className="w-4 h-4 text-navy-900 shrink-0" aria-hidden="true" />
                      <div className="leading-relaxed">
                        <strong className="text-navy-900 font-semibold">Identity Masked:</strong> You will appear as{' '}
                        <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold text-navy-900">
                          Anonymous Student
                        </code>{' '}
                        to the department representative. You can still chat privately in this vault and receive direct guidance.
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <div className="flex items-center gap-2 text-navy-900 font-semibold text-sm">
                        <UserCheck className="w-4 h-4 text-teal-600 shrink-0" aria-hidden="true" />
                        <span>Verified Complainant Identification:</span>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 flex flex-wrap items-center gap-x-4 gap-y-1.5 shadow-2xs">
                        <span>
                          <strong className="text-navy-900">Student:</strong> {currentUser?.displayName || currentUser?.rollNumber}
                        </span>
                        <span>
                          <strong className="text-navy-900">Roll No:</strong>{' '}
                          <code className="font-mono font-bold text-navy-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {currentUser?.rollNumber}
                          </code>
                        </span>
                        {currentUser?.semester && (
                          <span>
                            <strong className="text-navy-900">Batch:</strong>{' '}
                            <span className="font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 text-xs">
                              {currentUser?.semester}
                            </span>
                          </span>
                        )}
                        <span>
                          <strong className="text-navy-900">Email:</strong> {currentUser?.email}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-normal">
                        This inquiry is confidential and not published on the Community Wall. Your verified student identity is directly shared with the Department Representative so they can inspect official records.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Final Privacy Confirmation Required Checkbox */}
              <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 space-y-1">
                <label htmlFor="confirm-privacy" className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    id="confirm-privacy"
                    type="checkbox"
                    checked={confirmedPrivacy}
                    onChange={(e) => setConfirmedPrivacy(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded mt-0.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-600"
                    required
                  />
                  <span className="text-sm text-navy-900 leading-relaxed font-medium">
                    I confirm that I understand this complaint will be{' '}
                    <strong className="underline">
                      {reportingMode === 'public'
                        ? 'publicly displayed on the ECE Community Complaint Wall'
                        : 'stored as a private, restricted grievance'}
                    </strong>
                    , and I have omitted any unintended sensitive personal data.
                  </span>
                </label>
              </div>

              {/* Form Feedback */}
              {formError && (
                <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Form Actions */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setReportingMode(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-navy-900 text-sm font-medium flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                >
                  <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Back to Options</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !confirmedPrivacy}
                    className={`px-5 py-2.5 rounded-xl text-white text-base font-semibold flex items-center gap-2 shadow-xs transition-all focus-visible:outline-none focus-visible:ring-2 ${
                      reportingMode === 'public'
                        ? 'bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-teal-600'
                        : 'bg-navy-900 hover:bg-navy-800 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-navy-900'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" aria-hidden="true" />
                        <span>{reportingMode === 'public' ? 'Post to Complaint Wall' : 'Submit Private Grievance'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
