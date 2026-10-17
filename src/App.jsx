import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import AuthModal from './components/AuthModal';
import PublicWall from './components/PublicWall';
import NewIssueModal from './components/NewIssueModal';
import ConfidentialVault from './components/ConfidentialVault';
import RepOperationsDesk from './components/RepOperationsDesk';
import ResolvedArchive from './components/ResolvedArchive';
import MyComplaints from './components/MyComplaints';
import IssueDetailsModal from './components/IssueDetailsModal';
import { DEPARTMENT_INFO } from './data/mockData';
import { onAuthChange, signOutUser } from './services/auth';
import {
  subscribeActivePublicIssues,
  subscribeUserGrievances,
  createPublicIssue,
  createPrivateGrievance,
  toggleUpvote,
  checkUserVote
} from './services/db';
import { isFirebaseConfigured } from './services/firebase';
import { AlertCircle, Info, ExternalLink } from 'lucide-react';

export default function App() {
  // Session State from Firebase Auth
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Tab State: 'public' | 'my_complaints' | 'confidential' | 'archive' | 'operations'
  const [activeTab, setActiveTab] = useState('public');

  // Issues & Grievances State (Real-time Firestore)
  const [issues, setIssues] = useState([]);
  const [isIssuesLoading, setIsIssuesLoading] = useState(true);
  const [issuesError, setIssuesError] = useState(null);

  const [vaults, setVaults] = useState([]);

  // Upvote Tracking dictionary: { [issueId]: boolean }
  const [userVotes, setUserVotes] = useState({});

  // Modals
  const [isNewIssueOpen, setIsNewIssueOpen] = useState(false);
  const [newIssueInitialMode, setNewIssueInitialMode] = useState(null);
  const [selectedIssueForModal, setSelectedIssueForModal] = useState(null);

  // 1. Subscribe to Firebase Authentication (Runs once on mount)
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Dedicated role protection effect
  useEffect(() => {
    if ((!currentUser || currentUser.role !== 'representative') && activeTab === 'operations') {
      setActiveTab('public');
    }
  }, [currentUser, activeTab]);

  // 2. Subscribe to Active Public Issues
  useEffect(() => {
    setIsIssuesLoading(true);
    const unsubscribe = subscribeActivePublicIssues(
      (loadedIssues) => {
        setIssues(loadedIssues);
        setIsIssuesLoading(false);
      },
      (err) => {
        console.error('Error in public issues stream:', err);
        setIssuesError(err);
        setIsIssuesLoading(false);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 3. Subscribe to Confidential Grievances (for currentUser)
  useEffect(() => {
    if (!currentUser) {
      setVaults([]);
      return;
    }

    const unsubscribe = subscribeUserGrievances(
      currentUser,
      (loadedVaults) => {
        setVaults(loadedVaults);
      },
      (err) => {
        console.error('Error loading confidential grievances:', err);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  // 4. Update User Votes state when currentUser or issues change
  useEffect(() => {
    if (!currentUser || issues.length === 0) {
      setUserVotes({});
      return;
    }

    let isMounted = true;
    const fetchVotes = async () => {
      const votesMap = {};
      for (const issue of issues) {
        const hasVoted = await checkUserVote(issue.id, currentUser);
        votesMap[issue.id] = hasVoted;
      }
      if (isMounted) setUserVotes(votesMap);
    };

    fetchVotes();
    return () => {
      isMounted = false;
    };
  }, [currentUser, issues]);

  // Handle +1 Upvoting
  const handleUpvote = async (issueId) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    try {
      const result = await toggleUpvote(issueId, currentUser);
      setUserVotes((prev) => ({
        ...prev,
        [issueId]: result.hasVoted
      }));
    } catch (err) {
      console.error('Failed to toggle upvote:', err);
      alert(err.message || 'Error recording upvote.');
    }
  };

  // Submit Public Concern
  const handleCreatePublicIssue = async (newIssueData) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    await createPublicIssue(newIssueData, currentUser);
  };

  // Submit Private Grievance
  const handleCreatePrivateGrievance = async (newGrievanceData) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    await createPrivateGrievance(newGrievanceData, currentUser);
    setActiveTab('confidential');
  };

  // Sign Out Handler
  const handleLogout = async () => {
    await signOutUser();
    setCurrentUser(null);
    if (activeTab === 'operations' || activeTab === 'my_complaints') {
      setActiveTab('public');
    }
  };

  // Helper to open new issue modal with requested mode
  const handleOpenNewIssue = (mode = null) => {
    if (!currentUser) {
      setIsAuthOpen(true);
    } else {
      setNewIssueInitialMode(mode);
      setIsNewIssueOpen(true);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FAF9F6] text-[#102A56] font-sans antialiased bg-noticeboard-pattern selection:bg-[#087F8C] selection:text-white flex flex-col justify-between">
      
      {/* Configuration Advisory Banner (Displayed only if Firebase environment variables are not yet set) */}
      {!isFirebaseConfigured && (
        <aside
          aria-label="Configuration Alert"
          className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-900"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Firebase Setup Required:</strong> To enable real-time Cloud Firestore & production Firebase Auth, copy <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env.example</code> to <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env.local</code> and provide your Firebase project credentials.
              </span>
            </div>
            <a
              href="https://console.firebase.google.com"
              target="_blank"
              rel="noreferrer"
              className="font-bold underline text-amber-950 inline-flex items-center gap-1 shrink-0"
            >
              <span>Firebase Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </aside>
      )}

      {/* Main App Container */}
      <div className="relative flex flex-col flex-1">
        {/* Navigation Bar */}
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
          onOpenNewModal={() => handleOpenNewIssue(null)}
          publicIssuesCount={issues.length}
          confidentialCount={vaults.length}
        />

        {/* Dynamic Content Views */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* VIEW 1: Community Complaint Wall */}
          {activeTab === 'public' && (
            <PublicWall
              issues={issues}
              isLoading={isIssuesLoading}
              error={issuesError}
              currentUser={currentUser}
              userVotes={userVotes}
              onUpvote={handleUpvote}
              onOpenNewModal={() => handleOpenNewIssue('public')}
              onOpenRepTriage={(issue) => {
                if (currentUser?.role === 'representative') {
                  setActiveTab('operations');
                }
              }}
              onOpenAuth={() => setIsAuthOpen(true)}
            />
          )}

          {/* VIEW 2: My Personal Complaints */}
          {activeTab === 'my_complaints' && (
            <MyComplaints
              currentUser={currentUser}
              publicIssues={issues}
              privateGrievances={vaults}
              onSelectPublicIssue={(issue) => setSelectedIssueForModal(issue)}
              onSelectPrivateGrievance={(g) => {
                setActiveTab('confidential');
              }}
              onOpenNewModal={() => handleOpenNewIssue(null)}
              onOpenAuth={() => setIsAuthOpen(true)}
            />
          )}

          {/* VIEW 3: Confidential Vault */}
          {activeTab === 'confidential' && (
            <ConfidentialVault
              currentUser={currentUser}
              onOpenAuth={() => setIsAuthOpen(true)}
              onOpenNewModal={(mode) => handleOpenNewIssue(mode || 'private')}
            />
          )}

          {/* VIEW 4: Resolved Issues Archive */}
          {activeTab === 'archive' && (
            <ResolvedArchive
              currentUser={currentUser}
              onOpenAuth={() => setIsAuthOpen(true)}
            />
          )}

          {/* VIEW 5: Representative Operations Desk (Protected) */}
          {activeTab === 'operations' && currentUser?.role === 'representative' && (
            <RepOperationsDesk
              issues={issues}
              vaults={vaults}
              currentUser={currentUser}
              onSelectVaultToReply={() => setActiveTab('confidential')}
            />
          )}
        </main>

        {/* Professional Light Theme Institutional Footer */}
        <footer className="border-t border-slate-200 bg-white py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 font-sans mt-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-xs">
                <img
                  src="/logo.png"
                  alt="ECE GEC PKD Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="text-navy-900 font-bold text-xs">
                  ECE Connect • {DEPARTMENT_INFO.shortInstitution}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 font-normal">
                  {DEPARTMENT_INFO.department} • {DEPARTMENT_INFO.institution}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500">
              <span className="font-semibold text-navy-900">APJ Abdul Kalam Technological University (KTU)</span>
              <span>•</span>
              <span>Palakkad, Kerala</span>
              <span>•</span>
              <span className="text-teal-700 font-medium">Department Grievance & Facility Portal</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Institutional Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          if (user) {
            setCurrentUser(user);
          }
          setIsAuthOpen(false);
        }}
      />

      {/* Dual Public/Private Reporting Modal */}
      <NewIssueModal
        isOpen={isNewIssueOpen}
        onClose={() => setIsNewIssueOpen(false)}
        onSubmitPublic={handleCreatePublicIssue}
        onSubmitPrivate={handleCreatePrivateGrievance}
        currentUser={currentUser}
        initialMode={newIssueInitialMode}
      />

      {/* Issue Details Modal */}
      {selectedIssueForModal && (
        <IssueDetailsModal
          isOpen={Boolean(selectedIssueForModal)}
          issue={selectedIssueForModal}
          currentUser={currentUser}
          hasUpvoted={Boolean(userVotes[selectedIssueForModal.id])}
          onClose={() => setSelectedIssueForModal(null)}
          onUpvote={handleUpvote}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      )}
    </div>
  );
}
