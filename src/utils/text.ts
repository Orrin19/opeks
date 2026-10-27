/** Strips MediaWiki markup down to plain text. */
export const cleanWikitext = (raw: string): string =>
  raw
    .replace(/{{[^}]*}}/g, '')
    .replace(/\[\[([^\]|]*?)\]\]/g, '$1')
    .replace(/\[\[[^\]|]*\|([^\]]*?)\]\]/g, '$1')
    .replace(/==+[^=]+==+/g, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/\n+/g, '\n')
    .replace(/^\s+|\s+$/g, '');

/** Truncates text to `maxChars`, cutting at a word boundary and appending "...". */
export const truncate = (text: string, maxChars: number): string =>
  text.length > maxChars ? text.substring(0, maxChars).replace(/\s+\S*$/, '') + '...' : text;
