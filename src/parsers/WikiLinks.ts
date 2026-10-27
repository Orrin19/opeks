import type { Message } from 'discord.js';
import { TextParser } from '../structures/TextParser';
import type { AppContext } from '../core/AppContext';

const extractLinks = (content: string): string[] => {
  const rawLinks: string[] = [];
  const parts = content.split('[[');
  for (let i = 1; i < parts.length; i++) {
    const inner = parts[i].split(']]')[0];
    if (inner) rawLinks.push(inner);
  }
  return rawLinks;
};

export class WikiLinksParser extends TextParser {
  constructor(private readonly ctx: AppContext) {
    super();
  }

  matches(message: Message): boolean {
    if (!message.content.includes('[[') || !message.content.includes(']]')) {
      return false;
    }
    return Boolean(this.ctx.services.wiki.getWikiKeyForGuild(message.guild?.id));
  }

  async run(message: Message): Promise<void> {
    const guildId = message.guild?.id;
    if (!guildId) return;

    const wikiKey = this.ctx.services.wiki.getWikiKeyForGuild(guildId);
    if (!wikiKey) return;

    const rawLinks = extractLinks(message.content);
    if (rawLinks.length === 0) return;

    const resolved = await Promise.all(
      rawLinks.map((raw) => this.ctx.services.wiki.resolveLink(raw, wikiKey)),
    );
    const validUrls = resolved.filter((url): url is string => url !== null);
    if (validUrls.length === 0) return;

    const output = validUrls.map((url) => `<${url}>`).join('\n');
    const channel = message.channel;
    if (channel.isSendable()) {
      await channel.send(output);
    }
  }
}
