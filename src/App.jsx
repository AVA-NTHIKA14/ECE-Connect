import React, { useState } from 'react';
import ZeroGravityCanvas from './components/ZeroGravityCanvas';
import Navigation from './components/Navigation';
import AuthModal from './components/AuthModal';
import PublicWall from './components/PublicWall';
import NewIssueModal from './components/NewIssueModal';
import ConfidentialVault from './components/ConfidentialVault';
import RepOperationsDesk from './components/RepOperationsDesk';
import DemoSwitcher from './components/DemoSwitcher';
import {
  INITIAL_PUBLIC_ISSUES,
  INITIAL_CONFIDENTIAL_VAULTS,
  DEMO_USERS,
  DEPARTMENT_INFO
} from './data/mockData';

export default function App() {
  // Authentication & Session State
  // Defaulting to the standard student for immediate interactive demonstration
  const [currentUser, setCurrentUser] = useState(DEMO_USERS[0]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Tab State: 'public' | 'confidential' | 'operations'
  const [activeTab, setActiveTab] = useState('public');

  // Issues and Vaults State
  const [issues, setIssues] = useState(INITIAL_PUBLIC_ISSUES);
  const [vaults, setVaults] = useState(INITIAL_CONFIDENTIAL_VAULTS);

  // Modals
  const [isNewIssueOpen, setIsNewIssueOpen] = useState(false);

  // Handle +1 Affects Me Upvoting
  const handleUpvote = (issueId) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === issueId) {
          const userHasUpvoted = issue.upvotedBy.includes(currentUser.email);
          const newUpvotedBy = userHasUpvoted
            ? issue.upvotedBy.filter((e) => e !== currentUser.email)
            : [...issue.upvotedBy, currentUser.email];
          const newUpvotes = userHasUpvoted
            ? Math.max(0, issue.upvotes - 1)
            : issue.upvotes + 1;

          return {
            ...issue,
            upvotes: newUpvotes,
            upvotedBy: newUpvotedBy,
          };
        }
        return issue;
      })
    );
  };

  // Add Comment / Community Observation to Public Issue
  const handleAddComment = (issueId, text) => {
    const commentObj = {
      id: `c-${Date.now()}`,
      author: currentUser ? currentUser.email : 'anonymous@gecskp.ac.in',
      name: currentUser ? currentUser.name : 'Student Observer',
      time: 'Just now',
      text
    };

    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === issueId) {
          return {
            ...issue,
            comments: [...(issue.comments || []), commentObj]
          };
        }
        return issue;
      })
    );
  };

  // Create New Public Grievance
  const handleCreatePublicIssue = (newIssueData) => {
    const newId = `GECSKP-PUB-${100 + issues.length + 1}`;
    const formattedIssue = {
      ...newIssueData,
      id: newId
    };

    setIssues((prev) => [formattedIssue, ...prev]);
  };

  // Dispatch message in Confidential 2-Way Chat Thread
  const handleSendVaultMessage = (vaultKey, messageObj) => {
    setVaults((prev) =>
      prev.map((vault) => {
        if (vault.vaultKey === vaultKey) {
          return {
            ...vault,
            messages: [...vault.messages, messageObj]
          };
        }
        return vault;
      })
    );
  };

  // Create New Confidential Vault
  const handleCreateVault = (newVaultObj) => {
    setVaults((prev) => [newVaultObj, ...prev]);
  };

  // Rep Desk: Update Stage
  const handleUpdateIssueStage = (issueId, stage) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === issueId) {
          return { ...issue, stage };
        }
        return issue;
      })
    );
  };

  // Rep Desk: Update Resolution Log & Target Fix Date
  const handleUpdateIssueResolution = (issueId, notes, targetFixDate) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === issueId) {
          return {
            ...issue,
            resolutionNotes: notes,
            targetFixDate: targetFixDate || issue.targetFixDate
          };
        }
        return issue;
      })
    );
  };

  // Switch User handler via Demo Switcher
  const handleSwitchUser = (user) => {
    setCurrentUser(user);
    if (!user && activeTab === 'operations') {
      setActiveTab('public');
    } else if (user?.role !== 'representative' && activeTab === 'operations') {
      setActiveTab('public');
    }
  };

  // Rep clicking to respond to a vault from operations desk
  const handleSelectVaultToReply = (vaultKey) => {
    setActiveTab('confidential');
  };

  return (
    <div className="relative min-h-screen bg-[#09090B] text-zinc-100 font-sans antialiased overflow-x-hidden selection:bg-white selection:text-black">
      {/* Background Zero-G Orbital Particle Canvas */}
      <ZeroGravityCanvas />

      {/* Subtle Top Ambient Lighting & Grid */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-white/[0.035] via-white/[0.01] to-transparent rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none opacity-25 z-0" />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={() => {
            setCurrentUser(null);
            if (activeTab === 'operations') setActiveTab('public');
          }}
          publicIssuesCount={issues.length}
          confidentialCount={vaults.length}
        />

        {/* Dynamic Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'public' && (
            <PublicWall
              issues={issues}
              currentUser={currentUser}
              onUpvote={handleUpvote}
              onAddComment={handleAddComment}
              onOpenNewModal={() => {
                if (!currentUser) {
                  setIsAuthOpen(true);
                } else {
                  setIsNewIssueOpen(true);
                }
              }}
              onOpenRepTriage={(issue) => {
                if (currentUser?.role === 'representative') {
                  setActiveTab('operations');
                }
              }}
            />
          )}

          {activeTab === 'confidential' && (
            <ConfidentialVault
              vaults={vaults}
              currentUser={currentUser}
              onSendMessage={handleSendVaultMessage}
              onCreateVault={handleCreateVault}
              onOpenAuth={() => setIsAuthOpen(true)}
            />
          )}

          {activeTab === 'operations' && currentUser?.role === 'representative' && (
            <RepOperationsDesk
              issues={issues}
              vaults={vaults}
              currentUser={currentUser}
              onUpdateIssueStage={handleUpdateIssueStage}
              onUpdateIssueResolution={handleUpdateIssueResolution}
              onSelectVaultToReply={handleSelectVaultToReply}
            />
          )}
        </main>

        {/* Clean Institutional Footer */}
        <footer className="border-t border-white/[0.08] bg-black/60 py-8 px-4 sm:px-6 lg:px-8 text-xs text-zinc-500 font-sans">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/10 p-1 flex items-center justify-center shadow-sm overflow-hidden shrink-0">
                <img
                  src="/logo.png"
                  alt="ECE GEC PKD Logo"
                  className="w-full h-full object-contain filter invert brightness-125 contrast-125"
                />
              </div>
              <div>
                <div className="text-zinc-200 font-medium text-xs">
                  ECE Connect • {DEPARTMENT_INFO.shortInstitution}
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5 font-normal">
                  {DEPARTMENT_INFO.department} • {DEPARTMENT_INFO.institution}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-zinc-500">
              <span>KTU Affiliated (PKD)</span>
              <span>•</span>
              <span>Palakkad, Kerala</span>
              <span>•</span>
              <span className="text-zinc-400">Department Grievance & Facility Portal</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Institutional Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'representative') {
            setActiveTab('operations');
          }
        }}
      />

      {/* New Public Grievance Modal */}
      <NewIssueModal
        isOpen={isNewIssueOpen}
        onClose={() => setIsNewIssueOpen(false)}
        onSubmit={handleCreatePublicIssue}
        currentUser={currentUser}
      />

      {/* Reviewer / Evaluator Demo Switcher Dock */}
      <DemoSwitcher
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
      />
    </div>
  );
}
