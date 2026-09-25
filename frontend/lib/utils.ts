export function extractMeetingCode(input: string): string {
  const trimmed = input.trim();
  try {
    const url = new URL(trimmed);
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      return pathParts[pathParts.length - 1];
    }
  } catch (e) {
    // Not a valid URL, treat as just the code
  }
  return trimmed;
}
