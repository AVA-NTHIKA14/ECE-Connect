/**
 * ECE Connect — Security & Input Sanitization Utilities
 * Protects against Cross-Site Scripting (XSS), script execution,
 * HTML injection, control character abuse, and oversized payloads.
 */

/**
 * Escapes HTML characters to prevent DOM-based XSS when rendered as text.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Strips HTML tags, script blocks, style blocks, and dangerous inline event handlers.
 * @param {string} str
 * @returns {string}
 */
export function stripDangerousTags(str) {
  if (!str || typeof str !== 'string') return '';

  return str
    // Remove script, style, iframe, object, embed tags and their contents
    .replace(/<(script|style|iframe|object|embed|applet)[^>]*>[\s\S]*?<\/\1>/gi, '')
    // Remove self-closing or unclosed tags of the same types
    .replace(/<(script|style|iframe|object|embed|applet)[^>]*>/gi, '')
    // Neutralize javascript: pseudoprotocol
    .replace(/javascript\s*:/gi, '')
    // Neutralize vbscript: pseudoprotocol
    .replace(/vbscript\s*:/gi, '')
    // Neutralize data: URLs for HTML/JS
    .replace(/data:(text\/html|application\/javascript)[^"'>]*/gi, '')
    // Remove inline event handlers like onclick=, onerror=, onload=, etc.
    .replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    // Strip remaining HTML tags
    .replace(/<[^>]*>/g, '');
}

/**
 * Sanitizes single-line user input (titles, codes, short strings).
 * Strips newlines, HTML tags, controls, and caps the maximum length.
 *
 * @param {string} input - User-provided input string.
 * @param {number} maxLength - Maximum allowable characters (default: 120).
 * @returns {string} Sanitized string.
 */
export function sanitizeTitle(input, maxLength = 120) {
  if (!input || typeof input !== 'string') return '';
  const cleaned = stripDangerousTags(input)
    // Replace newlines/tabs with a single space
    .replace(/[\r\n\t]+/g, ' ')
    // Remove non-printable control characters
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim();

  return cleaned.slice(0, maxLength);
}

/**
 * Sanitizes multi-line user input (descriptions, advisory messages, notes).
 * Preserves structural paragraph breaks while neutralizing HTML, scripts, and injection payloads.
 *
 * @param {string} input - User-provided multi-line text.
 * @param {number} maxLength - Maximum allowable characters (default: 3000).
 * @returns {string} Sanitized multi-line string.
 */
export function sanitizeMultiline(input, maxLength = 3000) {
  if (!input || typeof input !== 'string') return '';
  const cleaned = stripDangerousTags(input)
    // Normalize Windows CRLF to standard LF
    .replace(/\r\n/g, '\n')
    // Remove control characters except standard whitespace (tab, newline)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();

  return cleaned.slice(0, maxLength);
}

/**
 * Sanitizes lab rooms, classroom codes, or equipment identifiers.
 * Permits only alphanumeric characters, spaces, hyphens, and parentheses.
 *
 * @param {string} input
 * @param {number} maxLength
 * @returns {string}
 */
export function sanitizeRoomOrCode(input, maxLength = 60) {
  if (!input || typeof input !== 'string') return '';
  const cleaned = stripDangerousTags(input)
    .replace(/[^a-zA-Z0-9\s\-().,/]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned.slice(0, maxLength);
}

/**
 * Validates institutional student email format.
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmailPattern(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  // Institutional domain check
  return /^[a-z0-9._%+-]+@gecskp\.ac\.in$/i.test(trimmed);
}
