// ECE Connect — Cloud Firestore Persistence, Real-time Subscriptions & Offline/Demo Resiliency
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  increment,
  runTransaction
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase.js';

// Local storage keys for offline/demo/fallback mode
const STORAGE_PUBLIC_ISSUES = 'ece_connect_public_issues_v1';
const STORAGE_PRIVATE_GRIEVANCES = 'ece_connect_private_grievances_v1';
const STORAGE_VOTES = 'ece_connect_user_votes_v1';

// Seed sample issues for realistic department operations
const DEFAULT_SEED_ISSUES = [
  {
    id: 'PUB-ECE-101',
    title: 'CRO Channel 2 Signal Distortion on Bench 4',
    description: 'During frequency modulation experiments, Channel 2 shows 15% DC baseline drift and erratic trigger synchronization. Affects S5 hardware lab sessions.',
    category: 'lab',
    lab: 'Analog Circuit Lab',
    equipmentCode: 'CRO-ACL-04',
    urgency: 'elevated',
    stage: 'in_progress',
    isClosed: false,
    upvotesCount: 7,
    commentsCount: 1,
    authorUid: 'pkd24ec012_uid',
    authorEmail: 'pkd24ec012@gecskp.ac.in',
    studentName: 'Aravind K (PKD24EC012)',
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    assignedRep: 'ece.rep@gecskp.ac.in',
    resolutionNotes: 'Superintendent notified. Replacement probe kit ordered under Requisition IND-2026-089.',
    targetFixDate: '2026-10-25',
    statusHistory: [
      {
        stage: 'reported',
        note: 'Issue reported to ECE Community Wall.',
        updatedBy: 'pkd24ec012@gecskp.ac.in',
        updatedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString()
      },
      {
        stage: 'acknowledged',
        note: 'Bench verified by Department Representative.',
        updatedBy: 'ece.rep@gecskp.ac.in',
        updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
      },
      {
        stage: 'in_progress',
        note: 'Replacement probe kit ordered under Requisition IND-2026-089.',
        updatedBy: 'ece.rep@gecskp.ac.in',
        updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
      }
    ],
    comments: [
      {
        id: 'c-seed-1',
        text: 'Observed the same during AM detector circuit testing on Friday afternoon.',
        authorUid: 'pkd24ec035_uid',
        authorEmail: 'pkd24ec035@gecskp.ac.in',
        authorName: 'Sneha P (PKD24EC035)',
        createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'PUB-ECE-102',
    title: 'Digital Storage Oscilloscope Power Supply Trip',
    description: 'Master DSO unit on Central Test Bench trips whenever input voltage exceeds 12V P-P. Lab assistant advised safety shutdown until inspected.',
    category: 'lab',
    lab: 'Digital Circuits Lab',
    equipmentCode: 'DSO-DCL-01',
    urgency: 'critical',
    stage: 'acknowledged',
    isClosed: false,
    upvotesCount: 14,
    commentsCount: 0,
    authorUid: 'pkd23ec008_uid',
    authorEmail: 'pkd23ec008@gecskp.ac.in',
    studentName: 'Rahul Menon (PKD23EC008)',
    createdAt: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    assignedRep: 'ece.rep@gecskp.ac.in',
    resolutionNotes: 'Service technician scheduled for on-site diagnostic.',
    targetFixDate: '2026-10-22',
    statusHistory: [
      {
        stage: 'reported',
        note: 'Reported by Final Year student.',
        updatedBy: 'pkd23ec008@gecskp.ac.in',
        updatedAt: new Date(Date.now() - 16 * 3600 * 1000).toISOString()
      },
      {
        stage: 'acknowledged',
        note: 'Tagged critical priority. Lab assistant notified.',
        updatedBy: 'ece.rep@gecskp.ac.in',
        updatedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'PUB-ECE-103',
    title: 'Projector HDMI Input Failing in 3rd Year EC Classroom',
    description: 'Ceiling projector flickers and loses sync after 10 minutes of presentation. Seminar and guest lectures affected.',
    category: 'facility',
    lab: '3rd Year EC Class',
    equipmentCode: 'PRJ-3EC-01',
    urgency: 'normal',
    stage: 'reported',
    isClosed: false,
    upvotesCount: 5,
    commentsCount: 0,
    authorUid: 'pkd24ec045_uid',
    authorEmail: 'pkd24ec045@gecskp.ac.in',
    studentName: 'ECE Student (Anonymous)',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    assignedRep: 'ece.rep@gecskp.ac.in',
    resolutionNotes: null,
    targetFixDate: null,
    statusHistory: [
      {
        stage: 'reported',
        note: 'Submitted anonymously via student portal.',
        updatedBy: 'Anonymous Student',
        updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
      }
    ]
  }
];

const DEFAULT_SEED_GRIEVANCES = [
  {
    id: 'VAULT-ECE-001',
    title: 'Discrepancy in S5 DSP Practical Internal Marks Allocation',
    category: 'academics',
    urgency: 'elevated',
    isAnonymous: true,
    status: 'acknowledged',
    stage: 'acknowledged',
    isClosed: false,
    authorUid: 'pkd24ec021_uid',
    authorEmail: 'anonymous@confidential.gecskp',
    realAuthorEmail: 'pkd24ec021@gecskp.ac.in',
    authorName: 'Anonymous Student',
    subjectRoll: 'CONFIDENTIAL',
    semester: null,
    createdAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    assignedRep: 'ece.rep@gecskp.ac.in',
    resolutionNotes: 'Representative verified mark sheets with Lab Faculty In-charge.',
    messagesCount: 2,
    statusHistory: [
      {
        stage: 'reported',
        note: 'Confidential grievance submitted anonymously.',
        updatedBy: 'Anonymous Student',
        updatedAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString()
      },
      {
        stage: 'acknowledged',
        note: 'Representative verified mark sheets with Lab Faculty In-charge.',
        updatedBy: 'ece.rep@gecskp.ac.in',
        updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
      }
    ],
    messages: [
      {
        id: 'msg-seed-1',
        senderUid: 'pkd24ec021_uid',
        senderRole: 'student',
        senderLabel: 'Anonymous Student (Vault Owner)',
        content: 'Respected representative, during the DSP simulation exam on Tuesday, our batch was evaluated on a different problem statement rubric than communicated. Could you please request HOD clarification?',
        attachments: [],
        createdAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString()
      },
      {
        id: 'msg-seed-2',
        senderUid: 'rep_gecskp_association_officer',
        senderRole: 'rep',
        senderLabel: 'ECE Association Representative',
        content: 'Acknowledged. We spoke with the faculty in charge today. A revised moderation rubric will be published on Monday notice board.',
        attachments: [],
        createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'VAULT-ECE-002',
    title: 'Department Library Reading Room Air Circulation & Evening Access',
    category: 'welfare',
    urgency: 'normal',
    isAnonymous: false,
    status: 'reported',
    stage: 'reported',
    isClosed: false,
    authorUid: 'pkd23ec045_uid',
    authorEmail: 'pkd23ec045@gecskp.ac.in',
    realAuthorEmail: 'pkd23ec045@gecskp.ac.in',
    authorName: 'Karthik R (PKD23EC045)',
    subjectRoll: 'PKD23EC045',
    semester: 'S7',
    createdAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    assignedRep: 'ece.rep@gecskp.ac.in',
    resolutionNotes: null,
    messagesCount: 1,
    statusHistory: [
      {
        stage: 'reported',
        note: 'Confidential grievance submitted by Karthik R (PKD23EC045).',
        updatedBy: 'PKD23EC045',
        updatedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString()
      }
    ],
    messages: [
      {
        id: 'msg-seed-3',
        senderUid: 'pkd23ec045_uid',
        senderRole: 'student',
        senderLabel: 'Karthik R (Student)',
        content: 'Request to keep the ECE departmental reading room open until 6:30 PM during university exam month. Currently closed at 4:30 PM with staff exit.',
        attachments: [],
        createdAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString()
      }
    ]
  }
];

// Reactive internal pub-sub listeners for real-time local updates
const changeListeners = new Set();

export function addChangeListener(cb) {
  changeListeners.add(cb);
  return () => {
    changeListeners.delete(cb);
  };
}

function broadcastChange(type = 'all') {
  changeListeners.forEach((cb) => {
    try {
      cb(type);
    } catch (e) {
      console.warn('Change listener notification warning:', e);
    }
  });
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('ece_connect_data_sync', { detail: { type } }));
    } catch (_) {}
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_PUBLIC_ISSUES || e.key === STORAGE_PRIVATE_GRIEVANCES) {
      broadcastChange(e.key);
    }
  });
}

function getLocal(key, defaultVal = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      if (key === STORAGE_PUBLIC_ISSUES && defaultVal.length === 0) {
        localStorage.setItem(key, JSON.stringify(DEFAULT_SEED_ISSUES));
        return [...DEFAULT_SEED_ISSUES];
      }
      if (key === STORAGE_PRIVATE_GRIEVANCES && defaultVal.length === 0) {
        localStorage.setItem(key, JSON.stringify(DEFAULT_SEED_GRIEVANCES));
        return [...DEFAULT_SEED_GRIEVANCES];
      }
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function setLocal(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    broadcastChange(key);
  } catch (err) {
    console.warn('LocalStorage write failed:', err);
  }
}

/**
 * Reconciles remote Firestore snapshot issues with local cache.
 * Preserves local status overrides (e.g. stage updates, closures, local issues).
 */
function mergePublicIssues(firestoreIssues = []) {
  const localIssues = getLocal(STORAGE_PUBLIC_ISSUES, []);
  const map = new Map();

  firestoreIssues.forEach((item) => {
    map.set(item.id, item);
  });

  localIssues.forEach((localItem) => {
    const existing = map.get(localItem.id);
    if (!existing) {
      map.set(localItem.id, localItem);
    } else {
      const localTime = new Date(localItem.updatedAt || localItem.createdAt || 0).getTime();
      const serverTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
      // Keep local version if modified recently or if closed locally
      if (localTime >= serverTime || (localItem.isClosed && !existing.isClosed)) {
        map.set(localItem.id, { ...existing, ...localItem });
      }
    }
  });

  const merged = Array.from(map.values());
  try {
    localStorage.setItem(STORAGE_PUBLIC_ISSUES, JSON.stringify(merged));
  } catch (_) {}
  return merged;
}

/**
 * Reconciles remote Firestore snapshot grievances with local cache.
 */
function mergePrivateGrievances(firestoreGrievances = []) {
  const localGrievances = getLocal(STORAGE_PRIVATE_GRIEVANCES, []);
  const map = new Map();

  firestoreGrievances.forEach((item) => {
    map.set(item.id, item);
  });

  localGrievances.forEach((localItem) => {
    const existing = map.get(localItem.id);
    if (!existing) {
      map.set(localItem.id, localItem);
    } else {
      const localTime = new Date(localItem.updatedAt || localItem.createdAt || 0).getTime();
      const serverTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
      if (localTime >= serverTime || (localItem.isClosed && !existing.isClosed)) {
        map.set(localItem.id, { ...existing, ...localItem });
      }
    }
  });

  const merged = Array.from(map.values());
  try {
    localStorage.setItem(STORAGE_PRIVATE_GRIEVANCES, JSON.stringify(merged));
  } catch (_) {}
  return merged;
}

// -------------------------------------------------------------
// PUBLIC COMMUNITY WALL ISSUES
// -------------------------------------------------------------

/**
 * Subscribe to active public issues (isClosed === false).
 */
export function subscribeActivePublicIssues(onData, onError) {
  let lastServerIssues = [];

  const emit = () => {
    const merged = mergePublicIssues(lastServerIssues);
    const active = merged
      .filter((i) => !i.isClosed)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    onData(active);
  };

  // Immediate initial load
  emit();
  const unlistenLocal = addChangeListener(() => emit());

  if (!isFirebaseConfigured || !db) {
    return () => unlistenLocal();
  }

  try {
    const q = query(
      collection(db, 'public_issues'),
      where('isClosed', '==', false)
    );

    const unsubFirestore = onSnapshot(
      q,
      (snapshot) => {
        lastServerIssues = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }));
        emit();
      },
      (error) => {
        console.warn('Firestore active public issues subscription notice, using cache fallback:', error);
        emit();
        if (onError) onError(error);
      }
    );

    return () => {
      unlistenLocal();
      unsubFirestore();
    };
  } catch (err) {
    console.warn('Firestore subscription error, using cache fallback:', err);
    emit();
    if (onError) onError(err);
    return () => unlistenLocal();
  }
}

/**
 * Subscribe to resolved/archived public issues (isClosed === true).
 */
export function subscribeArchivedIssues(onData, onError) {
  let lastServerIssues = [];

  const emit = () => {
    const merged = mergePublicIssues(lastServerIssues);
    const archived = merged
      .filter((i) => i.isClosed)
      .sort((a, b) => new Date(b.closedAt || b.createdAt || 0) - new Date(a.closedAt || a.createdAt || 0));
    onData(archived);
  };

  emit();
  const unlistenLocal = addChangeListener(() => emit());

  if (!isFirebaseConfigured || !db) {
    return () => unlistenLocal();
  }

  try {
    const q = query(
      collection(db, 'public_issues'),
      where('isClosed', '==', true)
    );

    const unsubFirestore = onSnapshot(
      q,
      (snapshot) => {
        lastServerIssues = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }));
        emit();
      },
      (error) => {
        console.warn('Firestore archive query notice, using cache fallback:', error);
        emit();
        if (onError) onError(error);
      }
    );

    return () => {
      unlistenLocal();
      unsubFirestore();
    };
  } catch (err) {
    console.warn('Firestore archive query error, using cache fallback:', err);
    emit();
    if (onError) onError(err);
    return () => unlistenLocal();
  }
}

/**
 * Subscribe to all public issues (both active and closed) for representative triage.
 */
export function subscribeAllPublicIssues(onData, onError) {
  let lastServerIssues = [];

  const emit = () => {
    const merged = mergePublicIssues(lastServerIssues);
    const sorted = merged.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    onData(sorted);
  };

  emit();
  const unlistenLocal = addChangeListener(() => emit());

  if (!isFirebaseConfigured || !db) {
    return () => unlistenLocal();
  }

  try {
    const q = query(collection(db, 'public_issues'));

    const unsubFirestore = onSnapshot(
      q,
      (snapshot) => {
        lastServerIssues = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }));
        emit();
      },
      (error) => {
        console.warn('Firestore all issues notice, using cache fallback:', error);
        emit();
        if (onError) onError(error);
      }
    );

    return () => {
      unlistenLocal();
      unsubFirestore();
    };
  } catch (err) {
    console.warn('Firestore subscription error for all issues, using cache fallback:', err);
    emit();
    if (onError) onError(err);
    return () => unlistenLocal();
  }
}

/**
 * Create a new public department issue.
 */
export async function createPublicIssue(data, currentUser) {
  if (!currentUser) throw new Error('Authentication required to raise a complaint.');

  const now = new Date().toISOString();
  const isAnonymous = Boolean(data.hideIdentity);
  const studentName = isAnonymous ? 'ECE Student (Anonymous)' : (currentUser.displayName || currentUser.rollNumber);

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
    studentName,
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

  // Instant local cache sync for offline/demo resiliency
  const localId = `PUB-${Date.now().toString(36).toUpperCase()}`;
  const localIssue = { id: localId, ...issuePayload };
  const all = getLocal(STORAGE_PUBLIC_ISSUES, []);
  setLocal(STORAGE_PUBLIC_ISSUES, [localIssue, ...all]);

  const userVotes = getLocal(STORAGE_VOTES, {});
  userVotes[`${localId}_${currentUser.uid}`] = true;
  setLocal(STORAGE_VOTES, userVotes);

  if (!isFirebaseConfigured || !db || !auth?.currentUser) {
    return localIssue;
  }

  try {
    const docRef = await addDoc(collection(db, 'public_issues'), issuePayload);
    try {
      await addDoc(collection(db, 'public_issues', docRef.id, 'votes'), {
        uid: currentUser.uid,
        votedAt: now
      });
    } catch (_) {}
    return { id: docRef.id, ...issuePayload };
  } catch (firestoreErr) {
    console.warn('Firestore write notice, issue safely retained in local session:', firestoreErr);
    return localIssue;
  }
}

/**
 * Toggle +1 Affects Me vote for an issue.
 * Strictly permits 1 active vote per student.
 */
export async function toggleUpvote(issueId, currentUser) {
  if (!currentUser) throw new Error('Please sign in to indicate that this issue affects you.');

  const userVotes = getLocal(STORAGE_VOTES, {});
  const key = `${issueId}_${currentUser.uid}`;
  const hasVoted = Boolean(userVotes[key]);
  const all = getLocal(STORAGE_PUBLIC_ISSUES, []);

  let newCount = 0;
  const updated = all.map((issue) => {
    if (issue.id === issueId) {
      newCount = hasVoted ? Math.max(0, (issue.upvotesCount || 1) - 1) : (issue.upvotesCount || 0) + 1;
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

  if (!isFirebaseConfigured || !db || !auth?.currentUser) {
    return { hasVoted: !hasVoted, count: newCount };
  }

  // Attempt real Firestore transaction if authenticated in Firebase Auth
  try {
    const voteDocRef = doc(db, 'public_issues', issueId, 'votes', currentUser.uid);
    const issueDocRef = doc(db, 'public_issues', issueId);

    return await runTransaction(db, async (transaction) => {
      const voteSnap = await transaction.get(voteDocRef);
      const issueSnap = await transaction.get(issueDocRef);

      if (!issueSnap.exists()) {
        return { hasVoted: !hasVoted, count: newCount };
      }

      const currentCount = issueSnap.data().upvotesCount || 0;

      if (voteSnap.exists()) {
        transaction.delete(voteDocRef);
        transaction.update(issueDocRef, {
          upvotesCount: Math.max(0, currentCount - 1),
          updatedAt: new Date().toISOString()
        });
        return { hasVoted: false, count: Math.max(0, currentCount - 1) };
      } else {
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
  } catch (err) {
    console.warn('Firestore vote transaction notice, vote safely recorded in local session:', err);
    return { hasVoted: !hasVoted, count: newCount };
  }
}

/**
 * Check if the current user has upvoted a specific issue.
 */
export async function checkUserVote(issueId, currentUser) {
  if (!currentUser) return false;

  const userVotes = getLocal(STORAGE_VOTES, {});
  const localVoted = Boolean(userVotes[`${issueId}_${currentUser.uid}`]);

  if (!isFirebaseConfigured || !db || !auth?.currentUser) {
    return localVoted;
  }

  try {
    const voteSnap = await getDoc(doc(db, 'public_issues', issueId, 'votes', currentUser.uid));
    return voteSnap.exists() || localVoted;
  } catch (err) {
    return localVoted;
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
    id: `c-${Date.now()}`,
    text: text.trim(),
    authorUid: currentUser.uid,
    authorEmail: currentUser.email,
    authorName: currentUser.displayName || currentUser.rollNumber,
    createdAt: now
  };

  const all = getLocal(STORAGE_PUBLIC_ISSUES, []);
  const updated = all.map((issue) => {
    if (issue.id === issueId) {
      const comments = issue.comments || [];
      return {
        ...issue,
        commentsCount: (issue.commentsCount || comments.length) + 1,
        comments: [...comments, commentPayload]
      };
    }
    return issue;
  });
  setLocal(STORAGE_PUBLIC_ISSUES, updated);

  if (!isFirebaseConfigured || !db || !auth?.currentUser) {
    return commentPayload;
  }

  try {
    const commentRef = await addDoc(collection(db, 'public_issues', issueId, 'comments'), commentPayload);
    try {
      await updateDoc(doc(db, 'public_issues', issueId), {
        commentsCount: increment(1),
        updatedAt: now
      });
    } catch (_) {}
    return { id: commentRef.id, ...commentPayload };
  } catch (err) {
    console.warn('Firestore comment write notice, retained in local session:', err);
    return commentPayload;
  }
}

/**
 * Subscribe to comments for a specific issue.
 */
export function subscribeComments(issueId, onData) {
  const emitLocal = () => {
    const all = getLocal(STORAGE_PUBLIC_ISSUES, []);
    const issue = all.find((i) => i.id === issueId);
    onData(issue?.comments || []);
  };

  emitLocal();
  const unlistenLocal = addChangeListener(() => emitLocal());

  if (!isFirebaseConfigured || !db) {
    return () => unlistenLocal();
  }

  try {
    const q = query(
      collection(db, 'public_issues', issueId, 'comments'),
      orderBy('createdAt', 'asc')
    );

    const unsubFirestore = onSnapshot(
      q,
      (snapshot) => {
        const comments = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }));
        if (comments.length > 0) {
          onData(comments);
        } else {
          emitLocal();
        }
      },
      (err) => {
        console.warn('Comments Firestore subscription notice, using local cache:', err);
        emitLocal();
      }
    );

    return () => {
      unlistenLocal();
      unsubFirestore();
    };
  } catch (err) {
    console.warn('Comments query setup notice, using local fallback:', err);
    emitLocal();
    return () => unlistenLocal();
  }
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

  // Always update local cache immediately
  const all = getLocal(STORAGE_PUBLIC_ISSUES, []);
  let found = false;
  const updated = all.map((issue) => {
    if (issue.id === issueId) {
      found = true;
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

  if (!found) {
    updated.unshift({
      id: issueId,
      stage: newStage,
      resolutionNotes: note?.trim() || '',
      targetFixDate: targetFixDate || null,
      updatedAt: now,
      statusHistory: [historyEntry]
    });
  }

  setLocal(STORAGE_PUBLIC_ISSUES, updated);

  // Attempt Firestore sync safely
  if (isFirebaseConfigured && db) {
    try {
      const issueDocRef = doc(db, 'public_issues', issueId);
      const snap = await getDoc(issueDocRef);
      if (snap.exists()) {
        const existingHistory = snap.data().statusHistory || [];
        await updateDoc(issueDocRef, {
          stage: newStage,
          resolutionNotes: note?.trim() || snap.data().resolutionNotes || '',
          targetFixDate: targetFixDate || snap.data().targetFixDate || null,
          updatedAt: now,
          statusHistory: [...existingHistory, historyEntry]
        });
      }
    } catch (firestoreErr) {
      console.warn('Firestore stage update notice, change safely retained in local storage:', firestoreErr);
      // Fails gracefully without throwing into UI modal
    }
  }
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

  // Always update local cache immediately
  const all = getLocal(STORAGE_PUBLIC_ISSUES, []);
  let found = false;
  const updated = all.map((issue) => {
    if (issue.id === issueId) {
      found = true;
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

  if (!found) {
    updated.unshift({
      id: issueId,
      stage: 'closed',
      isClosed: true,
      closedAt: now,
      closedBy: currentUser.email,
      resolutionNotes: resolutionNotes.trim(),
      updatedAt: now,
      statusHistory: [historyEntry]
    });
  }

  setLocal(STORAGE_PUBLIC_ISSUES, updated);

  // Attempt Firestore sync safely
  if (isFirebaseConfigured && db) {
    try {
      const issueDocRef = doc(db, 'public_issues', issueId);
      const snap = await getDoc(issueDocRef);
      if (snap.exists()) {
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
    } catch (firestoreErr) {
      console.warn('Firestore ticket closure notice, change safely retained in local storage:', firestoreErr);
      // Fails gracefully without throwing into UI modal
    }
  }
}

// -------------------------------------------------------------
// PRIVATE GRIEVANCES (CONFIDENTIAL VAULT)
// -------------------------------------------------------------

/**
 * Subscribe to confidential grievances accessible to currentUser.
 * Complainant owners see their own; representatives see all.
 */
export function subscribeUserGrievances(currentUser, onData, onError) {
  if (!currentUser) {
    onData([]);
    return () => {};
  }

  const isRep = currentUser.role === 'representative';
  let lastServerGrievances = [];

  const emit = () => {
    const merged = mergePrivateGrievances(lastServerGrievances);
    const filtered = isRep
      ? merged
      : merged.filter(
          (g) => g.authorUid === currentUser.uid || g.authorEmail?.toLowerCase() === currentUser.email?.toLowerCase()
        );
    const sorted = filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    onData(sorted);
  };

  emit();
  const unlistenLocal = addChangeListener(() => emit());

  if (!isFirebaseConfigured || !db) {
    return () => unlistenLocal();
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

    const unsubFirestore = onSnapshot(
      q,
      (snapshot) => {
        lastServerGrievances = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }));
        emit();
      },
      (error) => {
        console.warn('Firestore private grievances subscription notice, using cache fallback:', error);
        emit();
        if (onError) onError(error);
      }
    );

    return () => {
      unlistenLocal();
      unsubFirestore();
    };
  } catch (err) {
    console.warn('Private grievances query setup notice, using cache fallback:', err);
    emit();
    if (onError) onError(err);
    return () => unlistenLocal();
  }
}

/**
 * Create a new confidential private grievance.
 */
export async function createPrivateGrievance(data, currentUser) {
  if (!currentUser) throw new Error('Please sign in to submit a confidential grievance.');

  const now = new Date().toISOString();
  const isAnonymous = Boolean(data.isAnonymous);
  const studentName = isAnonymous ? 'Anonymous Student' : (currentUser.displayName || currentUser.rollNumber || 'Student');
  const subjectRoll = isAnonymous ? 'CONFIDENTIAL' : (currentUser.rollNumber || 'STUDENT');

  const grievancePayload = {
    title: data.title.trim(),
    category: data.category || 'welfare',
    urgency: data.urgency || 'normal',
    isAnonymous,
    status: 'active',
    stage: 'reported',
    isClosed: false,
    authorUid: currentUser.uid,
    authorEmail: isAnonymous ? 'anonymous@confidential.gecskp' : currentUser.email,
    realAuthorEmail: currentUser.email,
    authorName: studentName,
    subjectRoll,
    semester: isAnonymous ? null : (currentUser.semester || null),
    createdAt: now,
    updatedAt: now,
    assignedRep: 'ece.rep@gecskp.ac.in',
    resolutionNotes: null,
    messagesCount: 1,
    statusHistory: [
      {
        stage: 'reported',
        note: isAnonymous
          ? 'Confidential grievance submitted anonymously.'
          : `Confidential grievance submitted by ${studentName} (${currentUser.rollNumber || ''}).`,
        updatedBy: isAnonymous ? 'Anonymous Student' : (currentUser.rollNumber || currentUser.email),
        updatedAt: now
      }
    ]
  };

  const initialMessage = {
    senderUid: currentUser.uid,
    senderRole: 'student',
    senderLabel: isAnonymous ? 'Anonymous Student (Vault Owner)' : `${studentName} (${currentUser.rollNumber || 'Student'})`,
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

  if (!isFirebaseConfigured || !db || !auth?.currentUser) {
    return localGrievance;
  }

  try {
    const docRef = await addDoc(collection(db, 'private_grievances'), grievancePayload);
    try {
      await addDoc(collection(db, 'private_grievances', docRef.id, 'messages'), initialMessage);
    } catch (_) {}
    return { id: docRef.id, ...grievancePayload };
  } catch (firestoreErr) {
    console.warn('Firestore write notice, grievance saved in local cache:', firestoreErr);
    return localGrievance;
  }
}

/**
 * Subscribe to messages in a confidential grievance.
 */
export function subscribeGrievanceMessages(grievanceId, onData) {
  const emitLocal = () => {
    const all = getLocal(STORAGE_PRIVATE_GRIEVANCES, []);
    const g = all.find((item) => item.id === grievanceId);
    onData(g?.messages || []);
  };

  emitLocal();
  const unlistenLocal = addChangeListener(() => emitLocal());

  if (!isFirebaseConfigured || !db) {
    return () => unlistenLocal();
  }

  try {
    const q = query(
      collection(db, 'private_grievances', grievanceId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubFirestore = onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }));
        if (messages.length > 0) {
          onData(messages);
        } else {
          emitLocal();
        }
      },
      (err) => {
        console.warn('Firestore messages subscription notice, using local cache:', err);
        emitLocal();
      }
    );

    return () => {
      unlistenLocal();
      unsubFirestore();
    };
  } catch (err) {
    console.warn('Firestore messages subscription setup notice, using local cache:', err);
    emitLocal();
    return () => unlistenLocal();
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

  const localGrievances = getLocal(STORAGE_PRIVATE_GRIEVANCES, []);
  const currentG = localGrievances.find((g) => g.id === grievanceId);
  const isAnonGrievance = currentG?.isAnonymous === true;

  const senderLabel = isRep
    ? 'ECE Association Representative'
    : (isAnonGrievance ? 'Anonymous Student (Vault Owner)' : `${currentUser.displayName || currentUser.rollNumber} (Student)`);

  const msgPayload = {
    senderUid: currentUser.uid,
    senderRole: isRep ? 'rep' : 'student',
    senderLabel,
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
        messagesCount: (g.messagesCount || msgs.length) + 1,
        messages: [...msgs, { id: `msg-${Date.now()}`, ...msgPayload }]
      };
    }
    return g;
  });
  setLocal(STORAGE_PRIVATE_GRIEVANCES, updated);

  if (!isFirebaseConfigured || !db || !auth?.currentUser) {
    return;
  }

  try {
    await addDoc(collection(db, 'private_grievances', grievanceId, 'messages'), msgPayload);
    try {
      await updateDoc(doc(db, 'private_grievances', grievanceId), {
        updatedAt: now,
        messagesCount: increment(1)
      });
    } catch (_) {}
  } catch (err) {
    console.warn('Firestore message save notice, safely retained in local session:', err);
  }
}

/**
 * Update private grievance lifecycle stage (Reported -> Acknowledged -> In Progress -> Resolved).
 */
export async function updatePrivateGrievanceStage(grievanceId, newStage, note, targetFixDate, currentUser) {
  if (!currentUser || currentUser.role !== 'representative') {
    throw new Error('Unauthorized. Only verified representatives can update grievance stages.');
  }

  const now = new Date().toISOString();
  const historyEntry = {
    stage: newStage,
    note: note?.trim() || `Status updated to ${newStage.replace('_', ' ')}.`,
    updatedBy: currentUser.email,
    updatedAt: now
  };

  const all = getLocal(STORAGE_PRIVATE_GRIEVANCES, []);
  let found = false;
  const updated = all.map((g) => {
    if (g.id === grievanceId) {
      found = true;
      return {
        ...g,
        stage: newStage,
        status: newStage,
        resolutionNotes: note?.trim() || g.resolutionNotes,
        targetFixDate: targetFixDate || g.targetFixDate,
        updatedAt: now,
        statusHistory: [...(g.statusHistory || []), historyEntry]
      };
    }
    return g;
  });

  if (!found) {
    updated.unshift({
      id: grievanceId,
      stage: newStage,
      status: newStage,
      resolutionNotes: note?.trim() || '',
      targetFixDate: targetFixDate || null,
      updatedAt: now,
      statusHistory: [historyEntry]
    });
  }

  setLocal(STORAGE_PRIVATE_GRIEVANCES, updated);

  if (isFirebaseConfigured && db) {
    try {
      const gDocRef = doc(db, 'private_grievances', grievanceId);
      const snap = await getDoc(gDocRef);
      if (snap.exists()) {
        const existingHistory = snap.data().statusHistory || [];
        await updateDoc(gDocRef, {
          stage: newStage,
          status: newStage,
          resolutionNotes: note?.trim() || snap.data().resolutionNotes || '',
          targetFixDate: targetFixDate || snap.data().targetFixDate || null,
          updatedAt: now,
          statusHistory: [...existingHistory, historyEntry]
        });
      }
    } catch (firestoreErr) {
      console.warn('Firestore grievance stage update notice, change retained in local storage:', firestoreErr);
    }
  }
}

/**
 * Close a private grievance with official CLOSED token stamp.
 */
export async function closePrivateGrievanceWithToken(grievanceId, resolutionNotes, currentUser) {
  if (!currentUser || currentUser.role !== 'representative') {
    throw new Error('Unauthorized. Only verified representatives can close grievances.');
  }

  if (!resolutionNotes || !resolutionNotes.trim()) {
    throw new Error('Resolution log notes are mandatory before a ticket can be closed.');
  }

  const now = new Date().toISOString();
  const historyEntry = {
    stage: 'closed',
    note: `[OFFICIALLY CLOSED] ${resolutionNotes.trim()}`,
    updatedBy: currentUser.email,
    updatedAt: now
  };

  const all = getLocal(STORAGE_PRIVATE_GRIEVANCES, []);
  let found = false;
  const updated = all.map((g) => {
    if (g.id === grievanceId) {
      found = true;
      return {
        ...g,
        stage: 'closed',
        status: 'closed',
        isClosed: true,
        closedAt: now,
        closedBy: currentUser.email,
        resolutionNotes: resolutionNotes.trim(),
        updatedAt: now,
        statusHistory: [...(g.statusHistory || []), historyEntry]
      };
    }
    return g;
  });

  if (!found) {
    updated.unshift({
      id: grievanceId,
      stage: 'closed',
      status: 'closed',
      isClosed: true,
      closedAt: now,
      closedBy: currentUser.email,
      resolutionNotes: resolutionNotes.trim(),
      updatedAt: now,
      statusHistory: [historyEntry]
    });
  }

  setLocal(STORAGE_PRIVATE_GRIEVANCES, updated);

  if (isFirebaseConfigured && db) {
    try {
      const gDocRef = doc(db, 'private_grievances', grievanceId);
      const snap = await getDoc(gDocRef);
      if (snap.exists()) {
        const existingHistory = snap.data().statusHistory || [];
        await updateDoc(gDocRef, {
          stage: 'closed',
          status: 'closed',
          isClosed: true,
          closedAt: now,
          closedBy: currentUser.email,
          resolutionNotes: resolutionNotes.trim(),
          updatedAt: now,
          statusHistory: [...existingHistory, historyEntry]
        });
      }
    } catch (firestoreErr) {
      console.warn('Firestore grievance closure notice, change retained in local storage:', firestoreErr);
    }
  }
}

/**
 * Publish / Mark a private grievance to "View Public" (create a public community wall issue).
 * Strictly preserves student anonymity if isAnonymous is true.
 */
export async function publishPrivateGrievanceToPublic(grievanceId, publishData, currentUser) {
  if (!currentUser || currentUser.role !== 'representative') {
    throw new Error('Unauthorized. Only verified representatives can publish inquiries to the Community Wall.');
  }

  const now = new Date().toISOString();

  // Retrieve source grievance
  let sourceGrievance = null;
  const allPrivate = getLocal(STORAGE_PRIVATE_GRIEVANCES, []);
  sourceGrievance = allPrivate.find((g) => g.id === grievanceId);

  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'private_grievances', grievanceId));
      if (snap.exists()) {
        sourceGrievance = { id: snap.id, ...snap.data() };
      }
    } catch (_) {}
  }

  if (!sourceGrievance) throw new Error('Private grievance not found.');

  const isAnon = Boolean(sourceGrievance.isAnonymous || publishData.forceAnonymous);
  const studentName = isAnon ? 'ECE Student (Anonymous)' : (sourceGrievance.authorName || 'ECE Student');

  const publicPayload = {
    title: (publishData.title || sourceGrievance.title).trim(),
    description: (publishData.description || sourceGrievance.title).trim(),
    category: publishData.category || (sourceGrievance.category === 'academics' ? 'academics' : 'facility'),
    lab: publishData.lab || 'ECE Department Facility',
    equipmentCode: 'GENERAL-ASSET',
    urgency: sourceGrievance.urgency || 'normal',
    stage: sourceGrievance.stage || 'in_progress',
    isClosed: Boolean(sourceGrievance.isClosed),
    upvotesCount: 1,
    commentsCount: 0,
    authorUid: sourceGrievance.authorUid || currentUser.uid,
    authorEmail: isAnon ? 'anonymous@confidential.gecskp' : (sourceGrievance.authorEmail || currentUser.email),
    studentName,
    originGrievanceId: grievanceId,
    createdAt: now,
    updatedAt: now,
    assignedRep: 'ece.rep@gecskp.ac.in',
    resolutionNotes: sourceGrievance.resolutionNotes || null,
    targetFixDate: sourceGrievance.targetFixDate || null,
    statusHistory: [
      {
        stage: sourceGrievance.stage || 'in_progress',
        note: `Transferred to Public Community Wall by Department Representative for transparent resolution.`,
        updatedBy: currentUser.email,
        updatedAt: now
      }
    ]
  };

  // Add to public issues in local storage
  const localPubId = `PUB-${Date.now().toString(36).toUpperCase()}`;
  const localPubIssue = { id: localPubId, ...publicPayload };
  const allPub = getLocal(STORAGE_PUBLIC_ISSUES, []);
  setLocal(STORAGE_PUBLIC_ISSUES, [localPubIssue, ...allPub]);

  // Update source grievance in local storage
  const auditNote = {
    stage: sourceGrievance.stage || 'in_progress',
    note: `Published to Public Community Wall by ECE Representative.`,
    updatedBy: currentUser.email,
    updatedAt: now
  };
  const updatedPrivate = allPrivate.map((g) => {
    if (g.id === grievanceId) {
      return {
        ...g,
        isPubliclyViewable: true,
        publicIssueId: localPubId,
        updatedAt: now,
        statusHistory: [...(g.statusHistory || []), auditNote]
      };
    }
    return g;
  });
  setLocal(STORAGE_PRIVATE_GRIEVANCES, updatedPrivate);

  if (!isFirebaseConfigured || !db) {
    return localPubIssue;
  }

  try {
    const pubDocRef = await addDoc(collection(db, 'public_issues'), publicPayload);
    try {
      await updateDoc(doc(db, 'private_grievances', grievanceId), {
        isPubliclyViewable: true,
        publicIssueId: pubDocRef.id,
        updatedAt: now,
        statusHistory: [...(sourceGrievance.statusHistory || []), auditNote]
      });
    } catch (_) {}
    return { id: pubDocRef.id, ...publicPayload };
  } catch (err) {
    console.warn('Firestore publish notice, safely retained in local cache:', err);
    return localPubIssue;
  }
}
