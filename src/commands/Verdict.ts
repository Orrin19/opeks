import type {
  Message,
  MessageContextMenuCommandInteraction,
  TextBasedChannel,
} from 'discord.js';
import { MessageContextCommand } from '../structures/MessageContextCommand';
import type { AppContext } from '../core/AppContext';
import { buildVerdictPrompt } from '../services/prompts';
import { DISCORD_CONTENT_LIMIT } from '../config/constants';

const MAX_CONTEXT_MESSAGES = 25;
const MAX_NOUNS = 5;
const DEFAULT_WIKI_KEY = 'lamoraun';

export class VerdictCommand extends MessageContextCommand {
  readonly name = 'Составить вердикт';

  constructor(private readonly ctx: AppContext) {
    super();
  }

  async run(
    interaction: MessageContextMenuCommandInteraction,
  ): Promise<void> {
    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply({ content: '🔍 Собираю данные...' });

    const targetMessage = interaction.targetMessage;
    const channel = interaction.channel;
    if (!channel?.isTextBased()) {
      await interaction.editReply('Команда работает только в текстовых каналах.');
      return;
    }

    const chatContext = await this.buildThreadContext(channel, targetMessage);
    const wikiContext = await this.collectWikiContext(targetMessage);

    try {
      await interaction.editReply({ content: '🧠 Генерирую вердикт...' });

      const prompt = buildVerdictPrompt({
        wikiContext,
        chatContext,
        author: targetMessage.author.username,
        content: targetMessage.content,
      });

      const verdict = await this.ctx.services.llm.chat(
        [{ role: 'user', content: prompt }],
        { temperature: 0.7 },
      );

      const finalContent =
        verdict.length > DISCORD_CONTENT_LIMIT
          ? verdict.substring(0, DISCORD_CONTENT_LIMIT) + '...'
          : verdict;

      await interaction.editReply({ content: finalContent });
    } catch (error) {
      this.ctx.logger.error('Verdict generation failed:', error);
      await interaction.editReply({
        content: '❌ Не удалось сгенерировать вердикт. Попробуйте позже.',
      });
    }
  }

  private async collectWikiContext(message: Message): Promise<string> {
    const wikiKey =
      this.ctx.services.wiki.getWikiKeyForGuild(message.guildId) ??
      DEFAULT_WIKI_KEY;
    const properNouns = this.extractPotentialProperNouns(message.content);

    const snippets: string[] = [];
    for (const term of properNouns.slice(0, MAX_NOUNS)) {
      const snippet = await this.ctx.services.wiki.getSnippet(term, wikiKey);
      if (snippet) snippets.push(snippet);
    }

    return snippets.length > 0
      ? snippets.join('\n\n')
      : 'Статьи по ключевым словам не найдены.';
  }

  private async buildThreadContext(
    channel: TextBasedChannel,
    startMessage: Message,
  ): Promise<string> {
    const visited = new Set<string>();
    const lines: string[] = [];
    let current: Message | null = startMessage;

    while (
      current &&
      !visited.has(current.id) &&
      lines.length < MAX_CONTEXT_MESSAGES
    ) {
      visited.add(current.id);
      lines.unshift(
        `${current.author.username}: ${current.content || '(вложение/эмбед)'}`,
      );

      const replyId: string | undefined = current.reference?.messageId;
      if (!replyId) break;

      try {
        const ref: Message | null = await channel.messages.fetch(replyId);
        current = ref;
      } catch {
        break;
      }
    }

    return lines.join('\n');
  }

  private extractPotentialProperNouns(text: string): string[] {
    const words = text
      .replace(/[.,;:!?()«»"“”\[\]—–\-]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 2);

    const properNouns: string[] = ['РВПИ:Список стран'];
    for (const word of words) {
      if (
        word[0] === word[0].toUpperCase() &&
        word !== word.toUpperCase() &&
        Number.isNaN(Number(word))
      ) {
        properNouns.push(word);
      }
    }
    return [...new Set(properNouns)];
  }
}
