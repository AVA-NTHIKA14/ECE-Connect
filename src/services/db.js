// ECE Connect — Cloud Firestore Persistence & Real-time Subscriptions
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  runTransaction
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase.js';

// Local storage keys for offline/fallback mode when Firebase credentials are not provided
const STORAGE_PUBLIC_ISSUES = 'ece_connect_public_issues_v1';
const STORAGE_PRIVATE_GRIEVANCES = 'ece_connect_private_grievances_v1';
const STORAGE_VOTES = 'ece_connect_user_votes_v1';

function getLocal(key, defaultVal = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocal(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn('LocalStorage write failed:', err);
  }
}

// -------------------------------------------------------------
// PUBLIC COMMUNITY WALL ISSUES
// -------------------------------------------------------------

/**
 * Subscribe to active public issues (isClosed === false).
 */
export function subscribeActivePublicIssues(onData, onError) {
  if (!isFirebaseConfigured || !db) {
    const load = () => {
      const all = getLocal(STORAGE_PUBLIC_ISSUES, []);
      const active = all.filter((i) => !i.isClosed);
      onData(active);
    };
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }

  try {
    const q = query(
      collection(db, 'public_issues'),
      where('isClosed', '==', false)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const issues = snapshot.docs
          .map((d) => ({
            id: d.id,
            ...d.data()
          }))
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        // Sync with local cache
        try {
          const currentLocal = getLocal(STORAGE_PUBLIC_ISSUES, []);
          const merged = [...issues];
          currentLocal.forEach((item) => {
            if (!merged.find((m) => m.id === item.id)) {
              merged.push(item);
            }
          });
          setLocal(STORAGE_PUBLIC_ISSUES, merged);
        } catch (_) {}

        onData(issues);
      },
      (error) => {
        console.warn('Error listening to public issues in Firestore, using cache fallback:', error);
        const all = getLocal(STORAGE_PUBLIC_ISSUES, []);
        const active = all
          .filter((i) => !i.isClosed)
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        onData(active);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Firestore subscription error, using cache fallback:', err);
    const all = getLocal(STORAGE_PUBLIC_ISSUES, []);
    const active = all
      .filter((i) => !i.isClosed)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    onData(active);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Subscribe to resolved/archived public issues (isClosed === true).
 */
export function subscribeArchivedIssues(onData, onError) {
  if (!isFirebaseConfigured || !db) {
    const load = () => {
      const all = getLocal(STORAGE_PUBLIC_ISSUES, []);
      const archived = all.filter((i) => i.isClosed);
      onData(archived);
    };
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }

  try {
    const q = query(
      collection(db, 'public_issues'),
      where('isClosed', '==', true)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const issues = snapshot.docs
          .map((d) => ({
            id: d.id,
            ...d.data()
          }))
          .sort((a, b) => new Date(b.closedAt || b.createdAt || 0) - new Date(a.closedAt || a.createdAt || 0));
        onData(issues);
      },
      (error) => {
        console.warn('Error listening to archived issues in Firestore, using cache fallback:', error);
        const all = getLocal(STORAGE_PUBLIC_ISSUES, []);
        const archived = all
          .filter((i) => i.isClosed)
          .sort((a, b) => new Date(b.closedAt || b.createdAt || 0) - new Date(a.closedAt || a.createdAt || 0));
        onData(archived);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Firestore archive query error, using cache fallback:', err);
    const all = getLocal(STORAGE_PUBLIC_ISSUES, []);
    const archived = all
      .filter((i) => i.isClosed)
      .sort((a, b) => new Date(b.closedAt || b.createdAt || 0) - new Date(a.closedAt || a.createdAt || 0));
    onData(archived);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Create a new public department issue.
 */
export async function createPublicIssue(data, currentUser) {
  if (!currentUser) throw new Error('Authentication required to raise a complaint.');

  const now = new Date().toISOString();
  const issuePayload = {
    title: data.title.trim(),
    description: data.description.trim(),
    category: data.category || 'lab',
    lab: data.lab || 'ECE Department Facility',
    equipmentCode: (data.equipmentCode || 'GENERAL-ASSET').trim().toUpperCase(),
    urgency: data.urgency || 'normal',
    stage: 'reported',
    isClosed: false,
    upvotesCount: 1, // Author automatically supports their own submission
    commentsCount: 0,
    authorUid: currentUser.uid,
    authorEmail: currentUser.email,
    studentName: data.hideIdentity ? 'ECE Student (Anonymous)' : (currentUser.displayName || currentUser.rollNumber),
    createdAt: now,
    updatedAt: now,
    assignedRep: 'ece.rep@gecskp.ac.in',
    resolutionNotes: null,
    targetFixDate: null,
    statusHistory: [
      {
        stage: 'reported',
        note: 'Issue officially submitted to the ECE Department Community Wall.',
        updatedBy: currentUser.rollNumber || currentUser.email,
        updatedAt: now
      }
    ]
  };

  // Instant local cache sync for offline resiliency
  const localId = `PUB-${Date.now().toString(36).toUpperCase()}`;
  const localIssue = { id: localId, ...issuePayload };
  const all = getLocal(STORAGE_PUBLIC_ISSUES, []);
  setLocal(STORAGE_PUBLIC_ISSUES, [localIssue, ...all]);

  const userVotes = getLocal(STORAGE_VOTES, {});
  userVotes[`${localId}_${currentUser.uid}`] = true;
  setLocal(STORAGE_VOTES, userVotes);

  if (!isFirebaseConfigured || !db) {
    return localIssue;
  }

  try {
    // Real Cloud Firestore persistence
    const docRef = await addDoc(collection(db, 'public_issues'), issuePayload);

    // Record initial author vote in subcollection
    try {
      await setDoc(doc(db, 'public_issues', docRef.id, 'votes', currentUser.uid), {
        uid: currentUser.uid,
        votedAt: now
      });
    } catch (err) {
      console.warn('Could not record initial vote doc:', err);
    }

    return { id: docRef.id, ...issuePayload };
  } catch (firestoreErr) {
    console.warn('Firestore write failed, issue retained in local session:', firestoreErr);
    return localIssue;
  }
}

/**
 * Toggle +1 Affects Me vote for an issue.
 * Strictly permits 1 active vote per student.
 */
export async function toggleUpvote(issueId, currentUser) {
  if (!currentUser) throw new Error('Please sign in to indicate that this issue affects you.');

  if (!isFirebaseConfigured || !db) {
    const userVotes = getLocal(STORAGE_VOTES, {});
    const key = `${issueId}_${currentUser.uid}`;
    const hasVoted = Boolean(userVotes[key]);
    const all = getLocal(STORAGE_PUBLIC_ISSUES, []);

    let newCount = 0;
    const updated = all.map((issue) => {
      if (issue.id === issueId) {
        newCount = hasVoted ? Math.max(0, issue.upvotesCount - 1) : issue.upvotesCount + 1;
        return { ...issue, upvotesCount: newCount };
      }
      return issue;
    });

    if (hasVoted) {
      delete userVotes[key];
    } else {
      userVotes[key] = true;
    }
    setLocal(STORAGE_PUBLIC_ISSUES, updated);
    setLocal(STORAGE_VOTES, userVotes);
    return { hasVoted: !hasVoted, count: newCount };
  }

  // Real Firestore atomic transaction
  const voteDocRef = doc(db, 'public_issues', issueId, 'votes', currentUser.uid);
  const issueDocRef = doc(db, 'public_issues', issueId);

  return await runTransaction(db, async (transaction) => {
    const voteSnap = await transaction.get(voteDocRef);
    const issueSnap = await transaction.get(issueDocRef);

    if (!issueSnap.exists()) {
      throw new Error('Issue not found.');
    }

    const currentCount = issueSnap.data().upvotesCount || 0;

    if (voteSnap.exists()) {
      // Remove vote
      transaction.delete(voteDocRef);
      transaction.update(issueDocRef, {
        upvotesCount: Math.max(0, currentCount - 1),
        updatedAt: new Date().toISOString()
      });
      return { hasVoted: false, count: Math.max(0, currentCount - 1) };
    } else {
      // Add vote
      transaction.set(voteDocRef, {
        uid: currentUser.uid,
        votedAt: new Date().toISOString()
      });
      transaction.update(issueDocRef, {
        upvotesCount: currentCount + 1,
        updatedAt: new Date().toISOString()
      });
      return { hasVoted: true, count: currentCount + 1 };
    }
  });
}

/**
 * Check if the current user has upvoted a specific issue.
 */
export async function checkUserVote(issueId, currentUser) {
  if (!currentUser) return false;

  if (!isFirebaseConfigured || !db) {
    const userVotes = getLocal(STORAGE_VOTES, {});
    return Boolean(userVotes[`${issueId}_${currentUser.uid}`]);
  }

  try {
    const voteSnap = await getDoc(doc(db, 'public_issues', issueId, 'votes', currentUser.uid));
    return voteSnap.exists();
  } catch (err) {
    console.error('Error checking vote:', err);
    return false;
  }
}

/**
 * Add a comment or community observation to a public issue.
 */
export async function addPublicComment(issueId, text, currentUser) {
  if (!currentUser) throw new Error('Authentication required to post an observation.');
  if (!text || !text.trim()) throw new Error('Comment cannot be empty.');

  const now = new Date().toISOString();
  const commentPayload = {
    text: text.trim(),
    authorUid: currentUser.uid,
    authorEmail: currentUser.email,
    authorName: currentUser.displayName || currentUser.rollNumber,
    createdAt: now
  };

  if (!isFirebaseConfigured || !db) {
    const all = getLocal(STORAGE_PUBLIC_ISSUES, []);
    const updated = all.map((issue) => {
      if (issue.id === issueId) {
        const comments = issue.comments || [];
        return {
          ...issue,
          commentsCount: comments.length + 1,
          comments: [...comments, { id: `c-${Date.now()}`, ...commentPayload }]
        };
      }
      return issue;
    });
    setLocal(STORAGE_PUBLIC_ISSUES, updated);
    return { id: `c-${Date.now()}`, ...commentPayload };
  }

  // Real Firestore: Add to subcollection & increment commentsCount
  const commentRef = await addDoc(collection(db, 'public_issues', issueId, 'comments'), commentPayload);
  await updateDoc(doc(db, 'public_issues', issueId), {
    commentsCount: increment(1),
    updatedAt: now
  });

  return { id: commentRef.id, ...commentPayload };
}

/**
 * Subscribe to comments for a specific issue.
 */
export function subscribeComments(issueId, onData) {
  if (!isFirebaseConfigured || !db) {
    const all = getLocal(STORAGE_PUBLIC_ISSUES, []);
    const issue = all.find((i) => i.id === issueId);
    onData(issue?.comments || []);
    return () => {};
  }

  const q = query(
    collection(db, 'public_issues', issueId, 'comments'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));
    onData(comments);
  });
}

// -------------------------------------------------------------
// REPRESENTATIVE TRIAGE, STATUS UPDATES & CLOSURE
// -------------------------------------------------------------

/**
 * Update issue lifecycle stage (Reported -> Acknowledged -> In Progress -> Resolved).
 */
export async function updateIssueStage(issueId, newStage, note, targetFixDate, currentUser) {
  if (!currentUser || currentUser.role !== 'representative') {
    throw new Error('Unauthorized. Only verified student representatives can update issue stages.');
  }

  const now = new Date().toISOString();
  const historyEntry = {
    stage: newStage,
    note: note?.trim() || `Status updated to ${newStage.replace('_', ' ')}.`,
    updatedBy: currentUser.email,
    updatedAt: now
  };

  if (!isFirebaseConfigured || !db) {
    const all = getLocal(STORAGE_PUBLIC_ISSUES, []);
    const updated = all.map((issue) => {
      if (issue.id === issueId) {
        return {
          ...issue,
          stage: newStage,
          resolutionNotes: note?.trim() || issue.resolutionNotes,
          targetFixDate: targetFixDate || issue.targetFixDate,
          updatedAt: now,
          statusHistory: [...(issue.statusHistory || []), historyEntry]
        };
      }
      return issue;
    });
    setLocal(STORAGE_PUBLIC_ISSUES, updated);
    return;
  }

  const issueDocRef = doc(db, 'public_issues', issueId);
  const snap = await getDoc(issueDocRef);
  if (!snap.exists()) throw new Error('Issue does not exist.');

  const existingHistory = snap.data().statusHistory || [];
  await updateDoc(issueDocRef, {
    stage: newStage,
    resolutionNotes: note?.trim() || snap.data().resolutionNotes || '',
    targetFixDate: targetFixDate || snap.data().targetFixDate || null,
    updatedAt: now,
    statusHistory: [...existingHistory, historyEntry]
  });
}

/**
 * Close issue with official CLOSED stamp/token and move to archive.
 * Requires resolution notes.
 */
export async function closeIssueWithToken(issueId, resolutionNotes, currentUser) {
  if (!currentUser || currentUser.role !== 'representative') {
    throw new Error('Unauthorized. Only verified representatives can officially close issues.');
  }

  if (!resolutionNotes || !resolutionNotes.trim()) {
    throw new Error('Resolution log notes are mandatory before an issue can be formally closed.');
  }

  const now = new Date().toISOString();
  const historyEntry = {
    stage: 'closed',
    note: `[OFFICIALLY CLOSED] ${resolutionNotes.trim()}`,
    updatedBy: currentUser.email,
    updatedAt: now
  };

  if (!isFirebaseConfigured || !db) {
    const all = getLocal(STORAGE_PUBLIC_ISSUES, []);
    const updated = all.map((issue) => {
      if (issue.id === issueId) {
        return {
          ...issue,
          stage: 'closed',
          isClosed: true,
          closedAt: now,
          closedBy: currentUser.email,
          resolutionNotes: resolutionNotes.trim(),
          updatedAt: now,
          statusHistory: [...(issue.statusHistory || []), historyEntry]
        };
      }
      return issue;
    });
    setLocal(STORAGE_PUBLIC_ISSUES, updated);
    return;
  }

  const issueDocRef = doc(db, 'public_issues', issueId);
  const snap = await getDoc(issueDocRef);
  if (!snap.exists()) throw new Error('Issue not found.');

  const existingHistory = snap.data().statusHistory || [];
  await updateDoc(issueDocRef, {
    stage: 'closed',
    isClosed: true,
    closedAt: now,
    closedBy: currentUser.email,
    resolutionNotes: resolutionNotes.trim(),
    updatedAt: now,
    statusHistory: [...existingHistory, historyEntry]
  });
}

// -------------------------------------------------------------
// PRIVATE GRIEVANCES (CONFIDENTIAL VAULT)
// -------------------------------------------------------------

/**
 * Subscribe to confidential grievances accessible to currentUser.
 * Owners see their own; representatives see all.
 */
export function subscribeUserGrievances(currentUser, onData, onError) {
  if (!currentUser) {
    onData([]);
    return () => {};
  }

  const isRep = currentUser.role === 'representative';

  if (!isFirebaseConfigured || !db) {
    const load = () => {
      const all = getLocal(STORAGE_PRIVATE_GRIEVANCES, []);
      if (isRep) {
        onData(all);
      } else {
        const userOnly = all.filter(
          (g) => g.authorUid === currentUser.uid || g.authorEmail?.toLowerCase() === currentUser.email?.toLowerCase()
        );
        onData(userOnly);
      }
    };
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }

  try {
    let q;
    if (isRep) {
      q = query(collection(db, 'private_grievances'));
    } else {
      q = query(
        collection(db, 'private_grievances'),
        where('authorUid', '==', currentUser.uid)
      );
    }

    return onSnapshot(
      q,
      (snapshot) => {
        const grievances = snapshot.docs
          .map((d) => ({
            id: d.id,
            ...d.data()
          }))
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        // Sync with local cache for offline resiliency
        try {
          const currentLocal = getLocal(STORAGE_PRIVATE_GRIEVANCES, []);
          const merged = [...grievances];
          currentLocal.forEach((item) => {
            if (!merged.find((m) => m.id === item.id)) {
              if (item.authorUid === currentUser.uid || isRep) {
                merged.push(item);
              }
            }
          });
          setLocal(STORAGE_PRIVATE_GRIEVANCES, merged);
        } catch (_) {}

        onData(grievances);
      },
      (error) => {
        console.error('Error listening to private grievances in Firestore, using cache fallback:', error);
        const all = getLocal(STORAGE_PRIVATE_GRIEVANCES, []);
        const filtered = isRep
          ? all
          : all.filter((g) => g.authorUid === currentUser.uid || g.authorEmail?.toLowerCase() === currentUser.email?.toLowerCase());
        onData(filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.error('Private grievances query setup error, using cache fallback:', err);
    const all = getLocal(STORAGE_PRIVATE_GRIEVANCES, []);
    const filtered = isRep
      ? all
      : all.filter((g) => g.authorUid === currentUser.uid || g.authorEmail?.toLowerCase() === currentUser.email?.toLowerCase());
    onData(filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Create a new confidential private grievance.
 */
export async function createPrivateGrievance(data, currentUser) {
  if (!currentUser) throw new Error('Please sign in to submit a confidential grievance.');

  const now = new Date().toISOString();
  const studentName = currentUser.displayName || currentUser.rollNumber || 'Student';
  const grievancePayload = {
    title: data.title.trim(),
    category: data.category || 'welfare',
    urgency: data.urgency || 'normal',
    isAnonymous: false,
    status: 'active',
    stage: 'reported',
    isClosed: false,
    authorUid: currentUser.uid,
    authorEmail: currentUser.email,
    authorName: studentName,
    subjectRoll: currentUser.rollNumber || 'STUDENT',
    semester: currentUser.semester || null,
    createdAt: now,
    updatedAt: now,
    assignedRep: 'ece.rep@gecskp.ac.in',
    resolutionNotes: null,
    messagesCount: 1,
    statusHistory: [
      {
        stage: 'reported',
        note: `Confidential grievance submitted by ${studentName} (${currentUser.rollNumber || ''}).`,
        updatedBy: currentUser.rollNumber || currentUser.email,
        updatedAt: now
      }
    ]
  };

  const initialMessage = {
    senderUid: currentUser.uid,
    senderRole: 'student',
    senderLabel: `${studentName} (${currentUser.rollNumber || 'Student'})`,
    content: data.initialMessage.trim(),
    attachments: data.attachments || [],
    createdAt: now
  };

  // Always write to local storage as instant local cache
  const localId = `VAULT-${Date.now().toString(36).toUpperCase()}`;
  const localGrievance = {
    id: localId,
    ...grievancePayload,
    messages: [{ id: `msg-${Date.now()}`, ...initialMessage }]
  };
  const allLocal = getLocal(STORAGE_PRIVATE_GRIEVANCES, []);
  setLocal(STORAGE_PRIVATE_GRIEVANCES, [localGrievance, ...allLocal]);

  if (!isFirebaseConfigured || !db) {
    return localGrievance;
  }

  try {
    // Real Firestore: Create parent grievance and first message in subcollection
    const docRef = await addDoc(collection(db, 'private_grievances'), grievancePayload);
    await addDoc(collection(db, 'private_grievances', docRef.id, 'messages'), initialMessage);
    return { id: docRef.id, ...grievancePayload };
  } catch (firestoreErr) {
    console.warn('Firestore write failed, grievance saved in local cache:', firestoreErr);
    return localGrievance;
  }
}

/**
 * Subscribe to messages in a confidential grievance.
 */
export function subscribeGrievanceMessages(grievanceId, onData) {
  if (!isFirebaseConfigured || !db) {
    const all = getLocal(STORAGE_PRIVATE_GRIEVANCES, []);
    const g = all.find((item) => item.id === grievanceId);
    onData(g?.messages || []);
    return () => {};
  }

  try {
    const q = query(
      collection(db, 'private_grievances', grievanceId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }));
        onData(messages);
      },
      (err) => {
        console.warn('Error streaming messages from Firestore, using local cache:', err);
        const all = getLocal(STORAGE_PRIVATE_GRIEVANCES, []);
        const g = all.find((item) => item.id === grievanceId);
        onData(g?.messages || []);
      }
    );
  } catch (err) {
    console.warn('Firestore messages subscription setup failed, using local cache:', err);
    const all = getLocal(STORAGE_PRIVATE_GRIEVANCES, []);
    const g = all.find((item) => item.id === grievanceId);
    onData(g?.messages || []);
    return () => {};
  }
}

/**
 * Send reply message in a confidential grievance thread.
 */
export async function sendGrievanceMessage(grievanceId, content, currentUser, attachments = []) {
  if (!currentUser) throw new Error('Authentication required to send message.');
  if (!content || !content.trim()) throw new Error('Message cannot be empty.');

  const isRep = currentUser.role === 'representative';
  const now = new Date().toISOString();

  const msgPayload = {
    senderUid: currentUser.uid,
    senderRole: isRep ? 'rep' : 'student',
    senderLabel: isRep ? 'ECE Association Representative' : 'Student (Vault Owner)',
    content: content.trim(),
    attachments: attachments || [],
    createdAt: now
  };

  // Always update local storage cache immediately
  const all = getLocal(STORAGE_PRIVATE_GRIEVANCES, []);
  const updated = all.map((g) => {
    if (g.id === grievanceId) {
      const msgs = g.messages || [];
      return {
        ...g,
        updatedAt: now,
        messages: [...msgs, { id: `msg-${Date.now()}`, ...msgPayload }]
      };
    }
    return g;
  });
  setLocal(STORAGE_PRIVATE_GRIEVANCES, updated);

  if (!isFirebaseConfigured || !db) {
    return;
  }

  try {
    await addDoc(collection(db, 'private_grievances', grievanceId, 'messages'), msgPayload);
    try {
      await updateDoc(doc(db, 'private_grievances', grievanceId), {
        updatedAt: now,
        messagesCount: increment(1)
      });
    } catch (updateErr) {
      console.warn('Could not increment message count on parent:', updateErr);
    }
  } catch (err) {
    console.warn('Firestore message save failed, retained in local session:', err);
  }
}
