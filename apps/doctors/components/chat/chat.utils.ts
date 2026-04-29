/**
 * Formats a timestamp into a relative time string (e.g., "now", "5m", "2h", "1d", "Jan 1").
 * Used primarily in the conversation list to show how long ago the last message was sent.
 * 
 * @param timestamp - The Unix timestamp in milliseconds to format
 * @returns A formatted relative time string
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;

  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/**
 * Generates up to two initials from a name string.
 * (e.g., "John Doe" -> "JD", "Alice" -> "A")
 * 
 * @param name - The full name to get initials from
 * @returns A string containing the initials in uppercase
 */
export function getInitials(name: string): string {
  if (!name) return "";
  
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Formats a timestamp into a short time string (e.g., "10:30 AM").
 * Used in message bubbles to show when a message was sent.
 * 
 * @param timestamp - The Unix timestamp in milliseconds to format
 * @returns A formatted time string
 */
export function formatMessageTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}
