import React, { useState } from 'react';
import { Sliders, User, ShieldCheck, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { DEMO_USERS } from '../data/mockData';

export default function DemoSwitcher({ currentUser, onSwitchUser }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 text-left">
      {/* Popover Menu */}
      {isOpen && (
        <div className="mb-2 w-72 bg-[#0D0D10] border border-white/[0.12] rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl animate-fadeIn text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08]">
            <span className="font-semibold text-white text-xs flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-zinc-400" />
              Demo Persona Switcher
            </span>
            <span className="text-[10px] text-zinc-500 bg-white/[0.06] px-2 py-0.5 rounded-full">
              Reviewer Dock
            </span>
          </div>

          <div className="space-y-1.5">
            {DEMO_USERS.map((user) => {
              const isSelected = currentUser?.email.toLowerCase() === user.email.toLowerCase();
              return (
                <button
                  key={user.email}
                  onClick={() => {
                    onSwitchUser(user);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-white text-zinc-950 border-white font-medium shadow-sm'
                      : 'bg-white/[0.02] text-zinc-300 border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="font-medium flex items-center gap-1.5">
                      {user.role === 'representative' ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-current" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-current" />
                      )}
                      {user.name}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </div>
                  <div className={`text-[11px] font-mono ${isSelected ? 'text-zinc-700' : 'text-zinc-500'}`}>
                    {user.email}
                  </div>
                  <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-zinc-800' : 'text-zinc-400'}`}>
                    {user.description}
                  </div>
                </button>
              );
            })}

            {/* Guest / Logged Out Option */}
            <button
              onClick={() => {
                onSwitchUser(null);
                setIsOpen(false);
              }}
              className={`w-full p-2.5 rounded-xl border text-left transition-all ${
                !currentUser
                  ? 'bg-white text-zinc-950 border-white font-medium shadow-sm'
                  : 'bg-white/[0.02] text-zinc-400 border-dashed border-white/[0.08] hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span>Guest / Logged Out Mode</span>
                {!currentUser && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Floating Pill Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-white/[0.12] text-zinc-200 text-xs shadow-lg hover:border-white/[0.25] transition-all backdrop-blur-md"
      >
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        <span className="font-mono text-[11px]">
          {currentUser ? (
            currentUser.role === 'representative' ? 'REP: ECE-DESK' : currentUser.rollNumber
          ) : (
            'GUEST MODE'
          )}
        </span>
        {isOpen ? <ChevronDown className="w-3 h-3 text-zinc-400" /> : <ChevronUp className="w-3 h-3 text-zinc-400" />}
      </button>
    </div>
  );
}
