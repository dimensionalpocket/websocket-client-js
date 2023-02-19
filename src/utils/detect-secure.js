/**
 * Detects if the current browser URL is using HTTPS.
 *
 * @returns {boolean}
 */
export function detectSecure () {
  // @ts-ignore
  const window = globalThis.window
  if (!window) return false
  return window.location.protocol === 'https:'
}
