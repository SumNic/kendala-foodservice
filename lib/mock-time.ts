/**
 * Utility for mocking `Date` during testing.
 *
 * Usage: append `?mockTime=2026-04-06T13:00:00` to the URL.
 *
 * Both server and client code should call `getMockDate()` instead of `new Date()`
 * so the mocked time is respected everywhere.
 */

function getMockTimeFromQuery(): Date | null {
  // Works in browser
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search)
    const mock = params.get("mockTime")
    if (mock) {
      const d = new Date(mock)
      if (!isNaN(d.getTime())) return d
    }
  }
  return null
}

/**
 * Return either the mocked Date (if `?mockTime=...` is present) or the real current Date.
 *
 * ```ts
 * const now = getMockDate()
 * const hours = now.getHours()
 * ```
 */
export function getMockDate(): Date {
  const mocked = getMockTimeFromQuery()
  return mocked ?? new Date()
}

/**
 * Returns a human-readable label for UI hints (optional).
 * `undefined` means real time is in use.
 */
export function getMockTimeLabel(): string | undefined {
  const mocked = getMockTimeFromQuery()
  return mocked ? mocked.toISOString() : undefined
}
