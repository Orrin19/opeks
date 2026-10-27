import Discord from 'discord.js';
import { TextParser } from '../TextParser';

interface WikiConfig {
  name: string;
  apiBase: string;
  articleBase: string;
}

const WIKIS: Record<string, WikiConfig> = {
  lamoraun: {
    name: 'lamoraun',
    apiBase: 'https://lamoraun.fandom.com/ru/api.php',
    articleBase: 'https://lamoraun.fandom.com/ru/wiki/',
  },
  stalker: {
    name: 'stalker',
    apiBase: 'https://stalker.fandom.com/ru/api.php',
    articleBase: 'https://stalker.fandom.com/ru/wiki/',
  },
};

const SERVER_WIKI_MAP: Record<string, string> = {
  '664491015914258452': 'lamoraun',
  '410837371299561473': 'stalker',
};

const WIKI_HEADERS = {
  'User-Agent': 'OpeksBot/1.0 (https://github.com/Orrin19/opeks)',
  Accept: 'application/json',
};

function parseInterwiki(raw: string): { prefix: string; title: string } | null {
  const idx = raw.indexOf(':');
  if (idx <= 0) return null;
  const prefix = raw.substring(0, idx).toLowerCase();
  if (!/^[a-z0-9-]{2,15}$/.test(prefix)) return null;
  const title = raw.substring(idx + 1).trim();
  if (!title) return null;
  return { prefix, title };
}

async function resolveLink(
  rawLink: string,
  wiki: WikiConfig,
): Promise<string | null> {
  const trimmed = rawLink.trim();
  if (!trimmed) return null;

  const interwiki = parseInterwiki(trimmed);
  if (interwiki) {
    try {
      const mapUrl = `${wiki.apiBase}?action=query&meta=siteinfo&siprop=interwikimap&format=json`;
      const mapRes = await fetch(mapUrl, { headers: WIKI_HEADERS });
      if (mapRes.ok) {
        const mapText = await mapRes.text();
        if (mapText.trim().startsWith('{')) {
          const mapData = JSON.parse(mapText);
          const interwikimap = mapData?.query?.interwikimap;
          if (Array.isArray(interwikimap)) {
            const entry = interwikimap.find(
              (iw: any) => iw.prefix?.toLowerCase() === interwiki.prefix,
            );
            if (entry?.url) {
              const targetTitle = encodeURIComponent(
                interwiki.title.replace(/ /g, '_'),
              );
              return entry.url.replace('$1', targetTitle);
            }
          }
        }
      }
    } catch {}
    return null;
  }

  const encodedTitle = encodeURIComponent(trimmed.replace(/ /g, '_'));
  const url = `${wiki.apiBase}?action=query&titles=${encodedTitle}&redirects&prop=info|revisions&rvprop=size&rvslots=main&inprop=url&format=json`;

  try {
    const res = await fetch(url, { headers: WIKI_HEADERS });
    if (!res.ok) return null;

    const text = await res.text();
    if (!text.trim().startsWith('{')) return null;

    const data = JSON.parse(text);
    const pages = data?.query?.pages;
    if (!pages) return null;

    const page = Object.values(pages)[0] as any;
    if (page?.invalid || page?.missing) return null;

    const size: number | undefined = page?.revisions?.[0]?.size;
    if (typeof size === 'number' && size <= 0) return null;
    if (!page?.revisions?.[0]) return null;

    if (page?.fullurl) {
      return page.fullurl;
    }

    const realTitle: string = page.title ?? trimmed;
    return `${wiki.articleBase}${encodeURIComponent(realTitle.replace(/ /g, '_'))}`;
  } catch {
    return null;
  }
}

export const WikiLinks: TextParser = {
  check: (message: Discord.Message, client: Discord.Client) => {
    if (!message.content.includes('[[') || !message.content.includes(']]')) {
      return false;
    }
    const guildId = message.guild?.id;
    if (!guildId) return false;
    return Boolean(SERVER_WIKI_MAP[guildId]);
  },

  run: async (message: Discord.Message, client: Discord.Client) => {
    const guildId = message.guild?.id;
    if (!guildId) return;

    const wikiKey = SERVER_WIKI_MAP[guildId];
    const wiki = WIKIS[wikiKey];
    if (!wiki) return;

    const rawLinks: string[] = [];
    const parts = message.content.split('[[');
    for (let i = 1; i < parts.length; i++) {
      const inner = parts[i].split(']]')[0];
      if (inner) rawLinks.push(inner);
    }

    if (rawLinks.length === 0) return;

    const resolved = await Promise.all(
      rawLinks.map((raw) => resolveLink(raw, wiki)),
    );

    const validUrls = resolved.filter((u): u is string => u !== null);
    if (validUrls.length === 0) return;

    const output = validUrls.map((u) => `<${u}>`).join('\n');

    await (message.channel as Discord.TextChannel).send(output);
  },
};
