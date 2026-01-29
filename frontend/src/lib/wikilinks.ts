/**
 * Wiki link parsing and transformation utilities
 * Supports [[document title]] syntax for inter-document linking
 */

// Regex pattern to match [[...]] wiki links
// Captures the content between [[ and ]]
const WIKILINK_PATTERN = /\[\[([^\]]+)\]\]/g;

/**
 * Represents a parsed wiki link with its position in the text
 */
export interface WikiLink {
  /** The title of the linked document */
  title: string;
  /** Start position in the original text */
  start: number;
  /** End position in the original text */
  end: number;
  /** The full match including brackets */
  fullMatch: string;
}

/**
 * Extracts all wiki links from content
 * @param content - The markdown content to parse
 * @returns Array of WikiLink objects with title and position information
 */
export function extractWikiLinks(content: string): WikiLink[] {
  const links: WikiLink[] = [];
  const pattern = new RegExp(WIKILINK_PATTERN.source, 'g');

  for (const match of content.matchAll(pattern)) {
    const title = match[1].trim();
    if (title) {
      links.push({
        title,
        start: match.index ?? 0,
        end: (match.index ?? 0) + match[0].length,
        fullMatch: match[0],
      });
    }
  }

  return links;
}

/**
 * Gets unique document titles from wiki links
 * @param content - The markdown content to parse
 * @returns Array of unique document titles
 */
export function getUniqueWikiLinkTitles(content: string): string[] {
  const links = extractWikiLinks(content);
  const uniqueTitles = [...new Set(links.map((link) => link.title))];
  return uniqueTitles;
}

/**
 * Transforms wiki links in content to markdown links
 * @param content - The markdown content to transform
 * @param titleToId - Map of document titles to their IDs
 * @returns Content with wiki links converted to markdown links
 */
export function transformWikiLinksToMarkdown(
  content: string,
  titleToId: Map<string, string>
): string {
  return content.replace(WIKILINK_PATTERN, (_match, title: string) => {
    const trimmedTitle = title.trim();
    const documentId = titleToId.get(trimmedTitle);

    if (documentId) {
      // Convert to a link that navigates to the editor with the document
      return `[${trimmedTitle}](/editor?id=${documentId})`;
    }

    // If document doesn't exist, keep the wiki link syntax but style it as broken
    return `[${trimmedTitle}](#not-found)`;
  });
}

/**
 * Checks if a position in text is within a wiki link
 * @param content - The text content
 * @param position - Cursor position
 * @returns The wiki link at position, or null if not in a wiki link
 */
export function getWikiLinkAtPosition(content: string, position: number): WikiLink | null {
  const links = extractWikiLinks(content);
  return links.find((link) => position >= link.start && position <= link.end) || null;
}

/**
 * Checks if cursor is in wiki link input mode (after typing [[)
 * @param content - The text content
 * @param cursorPosition - Current cursor position
 * @returns Object with isActive flag and partial query if in wiki link mode
 */
export function getWikiLinkInputState(
  content: string,
  cursorPosition: number
): { isActive: boolean; query: string; startPosition: number } {
  // Look backwards from cursor position to find [[
  const textBeforeCursor = content.substring(0, cursorPosition);

  // Find the last [[ before cursor
  const lastOpenBrackets = textBeforeCursor.lastIndexOf('[[');

  if (lastOpenBrackets === -1) {
    return { isActive: false, query: '', startPosition: -1 };
  }

  // Check if there's a ]] between [[ and cursor (completed link)
  const textBetween = textBeforeCursor.substring(lastOpenBrackets);
  if (textBetween.includes(']]')) {
    return { isActive: false, query: '', startPosition: -1 };
  }

  // Extract the partial query after [[
  const query = textBeforeCursor.substring(lastOpenBrackets + 2);

  // Don't activate if there's a newline in the query (multi-line not supported)
  if (query.includes('\n')) {
    return { isActive: false, query: '', startPosition: -1 };
  }

  return {
    isActive: true,
    query,
    startPosition: lastOpenBrackets,
  };
}

/**
 * Inserts a wiki link at the current position, replacing any partial input
 * @param content - The text content
 * @param cursorPosition - Current cursor position
 * @param title - The document title to link to
 * @returns Object with new content and new cursor position
 */
export function insertWikiLink(
  content: string,
  cursorPosition: number,
  title: string
): { content: string; cursorPosition: number } {
  const state = getWikiLinkInputState(content, cursorPosition);

  if (!state.isActive) {
    // Not in wiki link mode, just insert at cursor
    const wikiLink = `[[${title}]]`;
    const newContent =
      content.substring(0, cursorPosition) + wikiLink + content.substring(cursorPosition);
    return {
      content: newContent,
      cursorPosition: cursorPosition + wikiLink.length,
    };
  }

  // Replace from [[ to cursor position with the complete wiki link
  const wikiLink = `[[${title}]]`;
  const newContent =
    content.substring(0, state.startPosition) + wikiLink + content.substring(cursorPosition);

  return {
    content: newContent,
    cursorPosition: state.startPosition + wikiLink.length,
  };
}
