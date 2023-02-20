/**
 * Detects if the current browser URL is using HTTPS.
 *
 * @returns {boolean}
 */
export function detectSecure () {
  const w = globalThis.window
  if (!w) return false
  return w.location.protocol === 'https:'
}
