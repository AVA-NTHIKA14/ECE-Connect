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
// Covers:
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
export const OFFICIAL_STAFF_EMAILS = [
  'ece.rep@gecskp.ac.in',
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
 * Allowed:
 *  - pkd23ec001 to pkd23ec075 (S7)
 *  - pkd24ec001 to pkd24ec075 (S5)
 *  - pkd25ec001 to pkd25ec075 (S3)
 *  - pkd26ec001 to pkd26ec075 (S1)
 */
export function validateStudentEmail(email) {
  const normalized = normalizeEmail(email);
  return STUDENT_EMAIL_REGEX.test(normalized);
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
 * E.g. pkd23ec045@gecskp.ac.in -> PKD23EC045
 */
export function extractRollNumber(email) {
  const normalized = normalizeEmail(email);
  const match = normalized.match(/^([a-z0-9]+)@/);
  return match ? match[1].toUpperCase() : 'STUDENT';
}

/**
 * Fetch role for authenticated user from Firestore /roles/{uid} or /users/{uid}.
 */
export async function fetchUserRole(uid, email) {
  const normalized = normalizeEmail(email);
  if (!db) {
    if (OFFICIAL_STAFF_EMAILS.includes(normalized)) return 'representative';
    return 'student';
  }

  try {
    // 1. Check secure role registry: /roles/{uid}
    const roleDocRef = doc(db, 'roles', uid);
    const roleSnap = await getDoc(roleDocRef);
    if (roleSnap.exists()) {
      return roleSnap.data().role || 'student';
    }

    // 2. Fallback check for designated staff emails during bootstrap
    if (OFFICIAL_STAFF_EMAILS.includes(normalized)) {
      return 'representative';
    }

    // 3. Check user profile doc: /users/{uid}
    const userDocRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists() && userSnap.data().role) {
      return userSnap.data().role;
    }

    return 'student';
  } catch (error) {
    console.error('Error fetching user role:', error);
    if (OFFICIAL_STAFF_EMAILS.includes(normalized)) return 'representative';
    return 'student';
  }
}

/**
 * Sign up a new institutional student with Firebase Authentication.
 */
export async function signUpStudent(email, password, fullName) {
  const normalized = normalizeEmail(email);

  if (!isInstitutionalDomain(normalized)) {
    throw new Error('Only official Government Engineering College Sreekrishnapuram Palakkad (GECP) institutional accounts (@gecskp.ac.in) are allowed.');
  }

  if (!validateStudentEmail(normalized) && !OFFICIAL_STAFF_EMAILS.includes(normalized)) {
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
  } catch (verifyErr) {
    console.warn('Verification email dispatch failed:', verifyErr);
  }

  // Create initial user document in Firestore
  if (db) {
    try {
      const isRep = OFFICIAL_STAFF_EMAILS.includes(normalized);
      await setDoc(doc(db, 'users', user.uid), {
        email: normalized,
        displayName,
        rollNumber,
        semester: batchInfo?.semester || null,
        batchYear: batchInfo?.batchYear || null,
        role: isRep ? 'representative' : 'student',
        createdAt: new Date().toISOString()
      }, { merge: true });
    } catch (dbErr) {
      console.error('Failed to create user record in Firestore:', dbErr);
    }
  }

  return user;
}

/**
 * Sign in existing user with institutional email and password.
 */
export async function signInUser(email, password) {
  const normalized = normalizeEmail(email);

  if (!isInstitutionalDomain(normalized)) {
    throw new Error('Access is restricted to official Government Engineering College Sreekrishnapuram Palakkad (GECP) accounts (@gecskp.ac.in).');
  }

  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase credentials are not configured. Please supply .env values.');
  }

  const userCredential = await signInWithEmailAndPassword(auth, normalized, password);
  return userCredential.user;
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

/**
 * Sign out user.
 */
export async function signOutUser() {
  if (auth) {
    await signOut(auth);
  }
}

/**
 * Subscribe to Firebase auth state changes.
 */
export function onAuthChange(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(null);
      return;
    }

    try {
      const role = await fetchUserRole(user.uid, user.email);
      const batchInfo = getStudentBatchInfo(user.email);
      const enhancedUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || extractRollNumber(user.email),
        rollNumber: extractRollNumber(user.email),
        semester: batchInfo?.semester || null,
        semesterLabel: batchInfo?.label || null,
        batchYear: batchInfo?.batchYear || null,
        role,
        emailVerified: user.emailVerified,
        rawUser: user
      };
      callback(enhancedUser);
    } catch (err) {
      console.error('Error enriching user session:', err);
      const batchInfo = getStudentBatchInfo(user.email);
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || extractRollNumber(user.email),
        rollNumber: extractRollNumber(user.email),
        semester: batchInfo?.semester || null,
        semesterLabel: batchInfo?.label || null,
        batchYear: batchInfo?.batchYear || null,
        role: 'student',
        emailVerified: user.emailVerified,
        rawUser: user
      });
    }
  });
}
