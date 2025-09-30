/**
 * Calculate estimated reading time for given content
 * @param content - The text content to analyze
 * @param wordsPerMinute - Average reading speed (default: 200 WPM)
 * @returns Estimated reading time in minutes (rounded up)
 *
 * @example
 * ```ts
 * const content = "Lorem ipsum dolor sit amet...";
 * const minutes = calculateReadingTime(content);
 * console.log(minutes); // 5
 * ```
 */
export function calculateReadingTime(
  content: string,
  wordsPerMinute: number = 200
): number {
  // Split content on whitespace and filter out empty strings
  const words = content
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
  const wordCount = words.length;

  // Calculate minutes and round up
  const minutes = Math.ceil(wordCount / wordsPerMinute);

  return minutes;
}

/**
 * Format reading time as a human-readable string
 * @param content - The text content to analyze
 * @param wordsPerMinute - Average reading speed (default: 200 WPM)
 * @returns Formatted string like "5 min read"
 *
 * @example
 * ```ts
 * const content = "Lorem ipsum dolor sit amet...";
 * const formatted = formatReadingTime(content);
 * console.log(formatted); // "5 min read"
 * ```
 */
export function formatReadingTime(
  content: string,
  wordsPerMinute: number = 200
): string {
  const minutes = calculateReadingTime(content, wordsPerMinute);
  return `${minutes} min read`;
}
