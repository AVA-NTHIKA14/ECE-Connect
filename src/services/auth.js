// ECE Connect — Authentication Service & Institutional Validation
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase.js';

// Configurable student email regex pattern
// Default institutional student pattern:
// S7 (2023): pkd23ec001@gecskp.ac.in to pkd23ec075@gecskp.ac.in
// S5 (2024): pkd24ec001@gecskp.ac.in to pkd24ec075@gecskp.ac.in
// S3 (2025): pkd25ec001@gecskp.ac.in to pkd25ec075@gecskp.ac.in
// S1 (2026): pkd26ec001@gecskp.ac.in to pkd26ec075@gecskp.ac.in
const rawEnvRegex = typeof import.meta !== 'undefined' && import.meta.env
  ? import.meta.env.VITE_STUDENT_EMAIL_REGEX
  : undefined;

// Sanitize potential double-escaped backslashes from .env files
const sanitizedEnvRegex = rawEnvRegex ? rawEnvRegex.replace(/\\\\/g, '\\') : undefined;

export const STUDENT_EMAIL_REGEX = sanitizedEnvRegex
  ? new RegExp(sanitizedEnvRegex, 'i')
  : /^pkd(2[3-6]|2x)ec0(0[1-9]|[1-6][0-9]|7[0-5])@gecskp\.ac\.in$/i;

// Official representative and departmental emails
export const OFFICIAL_REPRESENTATIVE_EMAIL = 'ece.rep@gecskp.ac.in';
export const OFFICIAL_STAFF_EMAILS = [
  OFFICIAL_REPRESENTATIVE_EMAIL,
  'hod.ece@gecskp.ac.in',
  'staff.ece@gecskp.ac.in'
];

/**
 * Normalizes email by trimming whitespace and converting to lowercase.
 */
export function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Validates whether an email matches the exact institutional student naming pattern.
 */
export function validateStudentEmail(email) {
  const normalized = normalizeEmail(email);
  return STUDENT_EMAIL_REGEX.test(normalized);
}

/**
 * Strictly verifies whether a user holds authorized ECE Department Representative credentials.
 */
export function isRepresentativeUser(user) {
  if (!user) return false;
  const email = normalizeEmail(user.email);
  return user.role === 'representative' && (email === OFFICIAL_REPRESENTATIVE_EMAIL || email === 'hod.ece@gecskp.ac.in');
}

/**
 * Extracts batch, semester, and academic year information for registered ECE students.
 */
export function getStudentBatchInfo(email) {
  const normalized = normalizeEmail(email);
  const match = normalized.match(/^pkd(2[3-6]|2x)ec0(0[1-9]|[1-6][0-9]|7[0-5])@/i);
  if (!match) return null;
  const batchCode = match[1].toLowerCase();
  const rollSuffix = match[2];
  
  const batchMap = {
    '23': { semester: 'S7', label: 'Semester 7 (Final Year)', batchYear: '2023–2027' },
    '24': { semester: 'S5', label: 'Semester 5 (Third Year)', batchYear: '2024–2028' },
    '25': { semester: 'S3', label: 'Semester 3 (Second Year)', batchYear: '2025–2029' },
    '26': { semester: 'S1', label: 'Semester 1 (First Year)', batchYear: '2026–2030' },
    '2x': { semester: 'UG', label: 'ECE Student', batchYear: 'UG Batch' }
  };

  const info = batchMap[batchCode] || { semester: 'UG', label: 'ECE Student', batchYear: 'UG Batch' };
  return {
    ...info,
    batchCode,
    rollNumberSuffix: rollSuffix
  };
}

/**
 * Checks if the email belongs to the institutional domain @gecskp.ac.in
 */
export function isInstitutionalDomain(email) {
  const normalized = normalizeEmail(email);
  return normalized.endsWith('@gecskp.ac.in');
}

/**
 * Determines if the email is an authorized institutional user (student or staff).
 */
export function isValidInstitutionalEmail(email) {
  const normalized = normalizeEmail(email);
  if (!isInstitutionalDomain(normalized)) return false;
  return validateStudentEmail(normalized) || OFFICIAL_STAFF_EMAILS.includes(normalized);
}

/**
 * Extracts student roll number from standardized email.
 */
export function extractRollNumber(email) {
  const normalized = normalizeEmail(email);
  const match = normalized.match(/^([a-z0-9]+)@/);
  return match ? match[1].toUpperCase() : 'STUDENT';
}

/**
 * Fetch role for authenticated user.
 * Strictly assigns 'representative' ONLY to the verified representative email.
 */
export async function fetchUserRole(uid, email) {
  const normalized = normalizeEmail(email);
  if (normalized === OFFICIAL_REPRESENTATIVE_EMAIL) {
    return 'representative';
  }
  return 'student';
}

/**
 * Sign up a new institutional student with Firebase Authentication.
 */
export async function signUpStudent(email, password, fullName) {
  const normalized = normalizeEmail(email);

  if (!isInstitutionalDomain(normalized)) {
    throw new Error('Only official Government Engineering College Sreekrishnapuram Palakkad (GECP) institutional accounts (@gecskp.ac.in) are allowed.');
  }

  if (normalized === OFFICIAL_REPRESENTATIVE_EMAIL) {
    throw new Error('The official representative account is managed by department administration. Please use the Representative Portal to sign in.');
  }

  if (!validateStudentEmail(normalized)) {
    throw new Error(
      'Invalid Student Email format. Email must match an authorized ECE batch: pkd23ec001-pkd23ec075 (S7), pkd24ec001-pkd24ec075 (S5), pkd25ec001-pkd25ec075 (S3), or pkd26ec001-pkd26ec075 (S1) @gecskp.ac.in.'
    );
  }

  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not yet configured. Please supply VITE_FIREBASE_* variables in your environment.');
  }

  const userCredential = await createUserWithEmailAndPassword(auth, normalized, password);
  const user = userCredential.user;

  // Set display name & batch info
  const rollNumber = extractRollNumber(normalized);
  const batchInfo = getStudentBatchInfo(normalized);
  const displayName = fullName?.trim() || `Student ${rollNumber}`;
  await updateProfile(user, { displayName });

  // Send email verification
  try {
    await sendEmailVerification(user);
  } catch (_) {
    // Non-blocking verification notification
  }

  // Create initial user document in Firestore
  if (db) {
    try {
      await setDoc(doc(db, 'users', user.uid), {
        email: normalized,
        displayName,
        rollNumber,
        semester: batchInfo?.semester || null,
        batchYear: batchInfo?.batchYear || null,
        role: 'student',
        createdAt: new Date().toISOString()
      }, { merge: true });
    } catch (_) {
      // Non-blocking firestore profile cache
    }
  }

  return user;
}

/**
 * Sign in student with institutional roll number email and password.
 */
export async function signInUser(email, password) {
  const normalized = normalizeEmail(email);

  if (!isInstitutionalDomain(normalized)) {
    throw new Error('Access is restricted to official Government Engineering College Sreekrishnapuram Palakkad (GECP) accounts (@gecskp.ac.in).');
  }

  if (normalized === OFFICIAL_REPRESENTATIVE_EMAIL) {
    throw new Error('Representative Account: Please switch to the "Representative Portal" tab to authenticate with your representative passkey.');
  }

  if (!validateStudentEmail(normalized)) {
    throw new Error('Invalid Student ID format. Roll email must match an active ECE batch (e.g. pkd24ec023@gecskp.ac.in).');
  }

  if (!isFirebaseConfigured || !auth) {
    // Offline / Demo student fallback session
    const roll = extractRollNumber(normalized);
    const batchInfo = getStudentBatchInfo(normalized);
    const studentUser = {
      uid: `local_student_${roll.toLowerCase()}`,
      email: normalized,
      displayName: `Student ${roll}`,
      rollNumber: roll,
      semester: batchInfo?.semester || null,
      semesterLabel: batchInfo?.label || null,
      batchYear: batchInfo?.batchYear || null,
      role: 'student',
      emailVerified: true
    };
    setStoredUser(studentUser);
    customAuthListeners.forEach((cb) => cb(studentUser));
    return studentUser;
  }

  const userCredential = await signInWithEmailAndPassword(auth, normalized, password);
  return userCredential.user;
}

/**
 * Secure Authentication for Department Representative.
 * Strictly restricts access to ece.rep@gecskp.ac.in with valid passkey/password.
 * Student accounts are categorically rejected.
 */
export async function signInAsRepresentative(email, passkey) {
  const normalized = normalizeEmail(email);

  if (normalized !== OFFICIAL_REPRESENTATIVE_EMAIL) {
    throw new Error(
      `Access Denied: Only the official ECE Department Representative (${OFFICIAL_REPRESENTATIVE_EMAIL}) is authorized to enter this portal. Student accounts must use the Student Portal.`
    );
  }

  if (!passkey || !passkey.trim()) {
    throw new Error('Representative Security Passkey is required.');
  }

  const envPasskey = typeof import.meta !== 'undefined' && import.meta.env?.VITE_REP_PASSKEY
    ? import.meta.env.VITE_REP_PASSKEY.trim()
    : '';

  if (!envPasskey) {
    throw new Error('Representative passkey is not configured in environment variables.');
  }

  const trimmed = passkey.trim();

  let authUser = null;
  if (isFirebaseConfigured && auth) {
    try {
      const cred = await signInWithEmailAndPassword(auth, normalized, trimmed);
      authUser = cred.user;
    } catch (firebaseErr) {
      if (firebaseErr.code === 'auth/user-not-found' && trimmed === envPasskey) {
        try {
          const newCred = await createUserWithEmailAndPassword(auth, normalized, trimmed);
          await updateProfile(newCred.user, { displayName: 'ECE Association Representative' });
          authUser = newCred.user;
        } catch (_) {}
      } else if (trimmed !== envPasskey) {
        throw new Error('Invalid Representative Security Passkey or Password. Access denied.');
      }
    }
  } else {
    if (trimmed !== envPasskey) {
      throw new Error('Invalid Representative Security Passkey. Access denied.');
    }
  }

  const repUser = {
    uid: authUser?.uid || 'rep_gecskp_association_officer',
    email: OFFICIAL_REPRESENTATIVE_EMAIL,
    displayName: 'ECE Association Representative',
    rollNumber: 'ECE-REP',
    semester: 'S7',
    semesterLabel: 'Semester 7 (Final Year)',
    batchYear: '2023–2027',
    role: 'representative',
    emailVerified: true,
    rawUser: authUser
  };

  setStoredUser(repUser);
  customAuthListeners.forEach((cb) => cb(repUser));
  return repUser;
}

/**
 * Resend verification email to current user.
 */
export async function resendVerificationEmail(user) {
  if (!user) throw new Error('No active user session.');
  await sendEmailVerification(user);
}

/**
 * Send password reset email.
 */
export async function sendPasswordReset(email) {
  const normalized = normalizeEmail(email);
  if (!isValidInstitutionalEmail(normalized)) {
    throw new Error('Please provide a valid @gecskp.ac.in institutional email.');
  }
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase credentials are not configured.');
  }
  await sendPasswordResetEmail(auth, normalized);
}

const STORAGE_AUTH_USER = 'ece_connect_active_auth_user';

function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_AUTH_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredUser(user) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_AUTH_USER);
    }
  } catch (_) {}
}

const customAuthListeners = new Set();

/**
 * Sign out user and wipe cached session.
 */
export async function signOutUser() {
  setStoredUser(null);
  customAuthListeners.forEach((cb) => cb(null));
  if (auth) {
    try {
      await signOut(auth);
    } catch (_) {}
  }
}

/**
 * Subscribe to auth state changes with session persistence and strict role assignment.
 */
export function onAuthChange(callback) {
  customAuthListeners.add(callback);

  // If a stored session exists, notify listener immediately
  const stored = getStoredUser();
  if (stored) {
    callback(stored);
  }

  if (!auth) {
    if (!stored) callback(null);
    return () => customAuthListeners.delete(callback);
  }

  const unsub = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      const currentStored = getStoredUser();
      if (!currentStored) callback(null);
      return;
    }

    try {
      const role = await fetchUserRole(user.uid, user.email);
      const batchInfo = getStudentBatchInfo(user.email);
      const enhancedUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || (role === 'representative' ? 'ECE Association Representative' : extractRollNumber(user.email)),
        rollNumber: role === 'representative' ? 'ECE-REP' : extractRollNumber(user.email),
        semester: batchInfo?.semester || (role === 'representative' ? 'S7' : null),
        semesterLabel: batchInfo?.label || (role === 'representative' ? 'Semester 7 (Final Year)' : null),
        batchYear: batchInfo?.batchYear || (role === 'representative' ? '2023–2027' : null),
        role,
        emailVerified: user.emailVerified,
        rawUser: user
      };
      setStoredUser(enhancedUser);
      callback(enhancedUser);
    } catch (_) {
      const isRep = normalizeEmail(user.email) === OFFICIAL_REPRESENTATIVE_EMAIL;
      const batchInfo = getStudentBatchInfo(user.email);
      const fallbackUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || (isRep ? 'ECE Association Representative' : extractRollNumber(user.email)),
        rollNumber: isRep ? 'ECE-REP' : extractRollNumber(user.email),
        semester: batchInfo?.semester || null,
        semesterLabel: batchInfo?.label || null,
        batchYear: batchInfo?.batchYear || null,
        role: isRep ? 'representative' : 'student',
        emailVerified: user.emailVerified,
        rawUser: user
      };
      setStoredUser(fallbackUser);
      callback(fallbackUser);
    }
  });

  return () => {
    customAuthListeners.delete(callback);
    unsub();
  };
}
