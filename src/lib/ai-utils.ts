/**
 * Sanitize an array of tags from AI output.
 * - Coerces each element to string
 * - Lowercases and trims
 * - Removes empty strings and tags longer than 50 characters
 * - Deduplicates
 * - Caps at 20 tags
 */
export function sanitizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];

  return [...new Set(
    tags
      .map(t => String(t).toLowerCase().trim())
      .filter(t => t.length > 0 && t.length <= 50)
  )].slice(0, 20);
}
