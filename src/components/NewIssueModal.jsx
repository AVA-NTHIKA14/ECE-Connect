import React, { useState } from 'react';
import { X, Plus, AlertTriangle, Cpu, Building2, Layers, Check } from 'lucide-react';
import { LAB_FACILITIES } from '../data/mockData';

export default function NewIssueModal({ isOpen, onClose, onSubmit, currentUser }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('lab');
  const [labId, setLabId] = useState(LAB_FACILITIES[0].name);
  const [equipmentCode, setEquipmentCode] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('normal');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newIssue = {
      title: title.trim(),
      category,
      lab: labId,
      equipmentCode: equipmentCode.trim().toUpperCase() || 'GENERAL-ASSET',
      description: description.trim(),
      urgency,
      stage: 'reported',
      reportedBy: currentUser ? currentUser.email : 'pkd22ec045@gecskp.ac.in',
      studentName: currentUser ? currentUser.name : 'Adithya R. (S5 ECE)',
      reportedAt: new Date().toISOString(),
      upvotes: 1,
      upvotedBy: currentUser ? [currentUser.email] : ['pkd22ec045@gecskp.ac.in'],
      resolutionNotes: null,
      assignedRep: 'ece.rep@gecskp.ac.in',
      targetFixDate: null,
      comments: []
    };

    onSubmit(newIssue);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#0D0D10] border border-white/[0.12] rounded-2xl p-6 sm:p-7 shadow-2xl text-left overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-xs font-medium text-zinc-300 mb-2">
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Public Community Report</span>
          </div>
          <h2 className="text-xl font-semibold text-white tracking-tight">
            Report Department Grievance
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-normal leading-relaxed">
            Report a faulty laboratory instrument, classroom AV issue, or academic clash to the community wall.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Issue Headline */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Issue Headline *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CRO Bench 04 Timebase calibration drift"
              className="w-full bg-black/50 border border-white/[0.08] focus:border-white/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none"
            />
          </div>

          {/* Category & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-black/50 border border-white/[0.08] focus:border-white/30 rounded-xl px-3 py-2.5 text-xs text-zinc-300 outline-none cursor-pointer"
              >
                <option value="lab">Laboratory Equipment</option>
                <option value="classroom">Classroom AV / Projector</option>
                <option value="facility">Department Facility / Power</option>
                <option value="academics">KTU Academics / Timetable</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Urgency Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'normal', label: 'Normal' },
                  { key: 'elevated', label: 'Elevated' },
                  { key: 'critical', label: 'Critical' },
                ].map((u) => (
                  <button
                    type="button"
                    key={u.key}
                    onClick={() => setUrgency(u.key)}
                    className={`py-2 px-1 text-xs font-medium rounded-xl border transition-all ${
                      urgency === u.key
                        ? 'bg-white text-zinc-950 font-semibold border-white shadow-sm'
                        : 'bg-white/[0.03] text-zinc-400 border-white/[0.08] hover:text-white'
                    }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Location & Hardware Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Location / Lab Room
              </label>
              <select
                value={labId}
                onChange={(e) => setLabId(e.target.value)}
                className="w-full bg-black/50 border border-white/[0.08] focus:border-white/30 rounded-xl px-3 py-2.5 text-xs text-zinc-300 outline-none cursor-pointer"
              >
                {LAB_FACILITIES.map((facility) => (
                  <option key={facility.id} value={facility.name}>
                    {facility.name} ({facility.room})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Hardware / Asset Tag
              </label>
              <input
                type="text"
                value={equipmentCode}
                onChange={(e) => setEquipmentCode(e.target.value)}
                placeholder="e.g. GECSKP-COMM-DSO-04"
                className="w-full bg-black/50 border border-white/[0.08] focus:border-white/30 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-zinc-500 uppercase outline-none"
              />
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Technical Description & Symptoms *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe symptoms, test conditions, specific bench number, or error codes..."
              className="w-full bg-black/50 border border-white/[0.08] focus:border-white/30 rounded-xl p-3 text-xs text-white placeholder-zinc-500 outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Reporter note */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-xs text-zinc-400 flex items-center justify-between">
            <span>
              Author:{' '}
              <span className="text-zinc-200 font-medium">
                {currentUser ? currentUser.name : 'Adithya R. (PKD22EC045)'}
              </span>
            </span>
            <span className="text-zinc-500 text-[11px]">Visible on Public Wall</span>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/[0.08] text-zinc-300 hover:text-white text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-medium flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post to Community Wall</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
