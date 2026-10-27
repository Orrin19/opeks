import {
  SERVER_WIKI_MAP,
  WIKIS,
  WIKI_USER_AGENT,
  WIKI_SNIPPET_CHARS,
  WIKI_ARTICLE_CHARS,
  type WikiConfig,
} from '../config/constants';
import type { Logger } from '../core/Logger';
import { cleanWikitext, truncate } from '../utils/text';

export interface WikiArticle {
  title: string;
  content: string;
  url: string;
  imageUrl?: string;
}

interface WikiPage {
  title?: string;
  invalid?: boolean;
  missing?: boolean;
  fullurl?: string;
  thumbnail?: { source?: string };
  revisions?: Array<{
    size?: number;
    slots?: { main?: { '*': string } };
    '*': string;
  }>;
}

interface WikiQueryResponse {
  query?: { pages?: Record<string, WikiPage> };
}

interface WikiSearchResponse {
  error?: unknown;
  query?: { search?: Array<{ title: string }> };
}

interface InterwikiMapResponse {
  query?: { interwikimap?: Array<{ prefix?: string; url?: string }> };
}

const HEADERS = {
  'User-Agent': WIKI_USER_AGENT,
  Accept: 'application/json',
};

const parseInterwiki = (raw: string): { prefix: string; title: string } | null => {
  const idx = raw.indexOf(':');
  if (idx <= 0) return null;
  const prefix = raw.substring(0, idx).toLowerCase();
  if (!/^[a-z0-9-]{2,15}$/.test(prefix)) return null;
  const title = raw.substring(idx + 1).trim();
  if (!title) return null;
  return { prefix, title };
};

/**
 * Central access to the configured Fandom wikis. Consolidates the wiki logic
 * previously duplicated across `Wiki`, `WikiLinks` and `Verdict` commands.
 */
export class WikiService {
  constructor(private readonly logger: Logger) {}

  getWikiForGuild(guildId: string | null | undefined): WikiConfig | undefined {
    if (!guildId) return undefined;
    const key = SERVER_WIKI_MAP[guildId];
    return key ? WIKIS[key] : undefined;
  }

  getWiki(key: string | null | undefined): WikiConfig | undefined {
    return key ? WIKIS[key] : undefined;
  }

  getWikiKeyForGuild(guildId: string | null | undefined): string | undefined {
    return guildId ? SERVER_WIKI_MAP[guildId] : undefined;
  }

  listWikiKeys(): string[] {
    return Object.keys(WIKIS);
  }

  async fetchArticle(
    title: string,
    wikiKey: string,
    maxChars: number = WIKI_ARTICLE_CHARS,
  ): Promise<WikiArticle | null> {
    const wiki = WIKIS[wikiKey];
    if (!wiki) return null;

    try {
      const encodedTitle = encodeURIComponent(title);
      const url = `${wiki.apiBase}?action=query&prop=revisions%7Cpageimages&rvprop=content&rvslots=main&pithumbsize=1200&titles=${encodedTitle}&format=json`;

      const res = await fetch(url, { headers: HEADERS });
      if (!res.ok) return null;

      const text = await res.text();
      if (!text.trim().startsWith('{')) return null;

      const data = JSON.parse(text) as WikiQueryResponse;
      const pages = data?.query?.pages;
      if (!pages) return null;

      const page = Object.values(pages)[0];
      if (!page || page.invalid || page.missing) return null;

      const wikitext = page.revisions?.[0]?.slots?.main?.['*'] || page.revisions?.[0]?.['*'];
      if (typeof wikitext !== 'string' || wikitext.trim().length < 20) {
        return null;
      }

      const realTitle = page.title ?? title;
      const clean = truncate(cleanWikitext(wikitext), maxChars);
      if (clean.length < 30) return null;

      return {
        title: realTitle,
        content: clean,
        url: `${wiki.articleBase}${encodeURIComponent(realTitle.replace(/ /g, '_'))}`,
        imageUrl: page.thumbnail?.source,
      };
    } catch (error) {
      this.logger.warn(`WikiService.fetchArticle failed for "${title}":`, error);
      return null;
    }
  }

  async search(query: string, wikiKey: string, limit = 3): Promise<WikiArticle[]> {
    const wiki = WIKIS[wikiKey];
    if (!wiki) return [];

    const cleanQuery = query.trim().replace(/[^\p{L}\p{N}\s]/gu, '');
    if (!cleanQuery) return [];

    const encodedQuery = encodeURIComponent(cleanQuery);
    const searchUrl = `${wiki.apiBase}?action=query&list=search&srsearch=${encodedQuery}&format=json&utf8=1&srlimit=${limit}`;

    const [directArticle, searchRes] = await Promise.all([
      this.fetchArticle(cleanQuery, wikiKey),
      fetch(searchUrl, { headers: HEADERS }).catch(() => null),
    ]);

    const seen = new Set<string>();
    const results: WikiArticle[] = [];

    if (directArticle) {
      seen.add(directArticle.title.toLowerCase());
      results.push(directArticle);
    }

    try {
      if (!searchRes || !searchRes.ok) return results;

      const text = await searchRes.text();
      if (!text.trim().startsWith('{')) return results;

      const data = JSON.parse(text) as WikiSearchResponse;
      if (data?.error || !data?.query?.search?.length) return results;

      const fetched = await Promise.all(
        data.query.search.slice(0, limit).map((entry) => this.fetchArticle(entry.title, wikiKey)),
      );

      for (const article of fetched) {
        if (!article || seen.has(article.title.toLowerCase())) continue;
        seen.add(article.title.toLowerCase());
        results.push(article);
        if (results.length >= limit) break;
      }
    } catch {
      // Return whatever we already have.
    }

    return results;
  }

  /** Returns a single article snippet for a term (used by the Verdict command). */
  async getSnippet(term: string, wikiKey: string): Promise<string | null> {
    const wiki = WIKIS[wikiKey];
    if (!wiki) return null;

    const cleanTerm = term.trim().replace(/[^\p{L}\p{N}\s]/gu, '');
    if (!cleanTerm) return null;

    const encodedTerm = encodeURIComponent(cleanTerm);
    const searchUrl = `${wiki.apiBase}?action=query&list=search&srsearch=${encodedTerm}&format=json&utf8=1&srlimit=1`;

    try {
      const res = await fetch(searchUrl, { headers: HEADERS });
      if (!res.ok) return null;

      const text = await res.text();
      if (!text.trim().startsWith('{')) return null;

      const data = JSON.parse(text) as WikiSearchResponse;
      if (data?.error || !data?.query?.search?.[0]) return null;

      const title = data.query.search[0].title;
      const article = await this.fetchArticle(title, wikiKey, WIKI_SNIPPET_CHARS);
      return article ? `=== ${article.title} ===\n${article.content}` : null;
    } catch {
      return null;
    }
  }

  /** Resolves a `[[Link]]`/interwiki reference to a full article URL. */
  async resolveLink(rawLink: string, wikiKey: string): Promise<string | null> {
    const wiki = WIKIS[wikiKey];
    if (!wiki) return null;

    const trimmed = rawLink.trim();
    if (!trimmed) return null;

    const interwiki = parseInterwiki(trimmed);
    if (interwiki) {
      try {
        const mapUrl = `${wiki.apiBase}?action=query&meta=siteinfo&siprop=interwikimap&format=json`;
        const mapRes = await fetch(mapUrl, { headers: HEADERS });
        if (mapRes.ok) {
          const mapText = await mapRes.text();
          if (mapText.trim().startsWith('{')) {
            const mapData = JSON.parse(mapText) as InterwikiMapResponse;
            const interwikimap = mapData?.query?.interwikimap;
            if (Array.isArray(interwikimap)) {
              const entry = interwikimap.find(
                (iw) => iw.prefix?.toLowerCase() === interwiki.prefix,
              );
              if (entry?.url) {
                const targetTitle = encodeURIComponent(interwiki.title.replace(/ /g, '_'));
                return entry.url.replace('$1', targetTitle);
              }
            }
          }
        }
      } catch {
        // fall through to returning null
      }
      return null;
    }

    const encodedTitle = encodeURIComponent(trimmed.replace(/ /g, '_'));
    const url = `${wiki.apiBase}?action=query&titles=${encodedTitle}&redirects&prop=info|revisions&rvprop=size&rvslots=main&inprop=url&format=json`;

    try {
      const res = await fetch(url, { headers: HEADERS });
      if (!res.ok) return null;

      const text = await res.text();
      if (!text.trim().startsWith('{')) return null;

      const data = JSON.parse(text) as WikiQueryResponse;
      const pages = data?.query?.pages;
      if (!pages) return null;

      const page = Object.values(pages)[0];
      if (!page || page.invalid || page.missing) return null;

      const size = page.revisions?.[0]?.size;
      if (typeof size === 'number' && size <= 0) return null;
      if (!page.revisions?.[0]) return null;

      if (page.fullurl) return page.fullurl;

      const realTitle = page.title ?? trimmed;
      return `${wiki.articleBase}${encodeURIComponent(realTitle.replace(/ /g, '_'))}`;
    } catch {
      return null;
    }
  }
}
