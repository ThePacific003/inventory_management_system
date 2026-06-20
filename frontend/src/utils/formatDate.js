/**
 * Formats an ISO date string into a human-readable format.
 * e.g. "Jun 11, 2026, 2:26 PM"
 */
export function formatDate(isoString) {
  if (!isoString) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}
