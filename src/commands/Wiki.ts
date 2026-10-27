import {
  ApplicationCommandOptionType,
  type ApplicationCommandOptionData,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { ChatInputCommand } from '../structures/ChatInputCommand';
import type { AppContext } from '../core/AppContext';
import { buildFooter } from '../utils/embed';
import { WIKI_SYSTEM_PROMPT, buildWikiPrompt } from '../services/prompts';
import { WIKIS } from '../config/constants';

const WIKI_CHOICES = Object.keys(WIKIS).map((key) => ({
  name: key,
  value: key,
}));

export class WikiCommand extends ChatInputCommand {
  readonly name = 'wiki';
  readonly description = 'Search a wiki and get an AI summary';
  readonly descriptionLocalizations = {
    ru: 'Поиск по вики с кратким ответом от ИИ',
    uk: 'Пошук по вікі з коротким описом від ШІ',
  };
  readonly options: ApplicationCommandOptionData[] = [
    {
      name: 'query',
      nameLocalizations: { ru: 'запрос', uk: 'запит' },
      type: ApplicationCommandOptionType.String,
      description: 'Search query (max 20 characters)',
      descriptionLocalizations: {
        ru: 'Поисковый запрос (до 20 символов)',
        uk: 'Пошуковий запит (до 20 символів)',
      },
      required: true,
      maxLength: 20,
    },
    {
      name: 'wiki',
      nameLocalizations: { ru: 'вики', uk: 'вікі' },
      type: ApplicationCommandOptionType.String,
      description: 'Wiki to search (required if server has no default)',
      descriptionLocalizations: {
        ru: 'Вики для поиска (обязательно, если у сервера нет вики по умолчанию)',
        uk: "Вікі для пошуку (обов'язково, якщо у сервера немає вікі за замовчуванням)",
      },
      required: false,
      choices: WIKI_CHOICES,
    },
  ];

  constructor(private readonly ctx: AppContext) {
    super();
  }

  async run(interaction: ChatInputCommandInteraction): Promise<void> {
    const query = interaction.options.getString('query', true);
    const wikiArg = interaction.options.getString('wiki');
    const wikiKey = wikiArg ?? this.ctx.services.wiki.getWikiKeyForGuild(interaction.guildId);

    if (!wikiKey) {
      await interaction.followUp(
        'Укажите вики через аргумент `/wiki вики:`, так как для этого сервера вики по умолчанию не задана.',
      );
      return;
    }

    const wiki = this.ctx.services.wiki.getWiki(wikiKey);
    if (!wiki) {
      await interaction.followUp(`Вики «${wikiKey}» не найдена.`);
      return;
    }

    const articles = await this.ctx.services.wiki.search(query, wikiKey);
    if (articles.length === 0) {
      await interaction.followUp(`По запросу «${query}» статьи в вики «${wiki.name}» не найдены.`);
      return;
    }

    try {
      const wikiContext = articles
        .map((article) => `=== ${article.title} ===\n${article.content}`)
        .join('\n\n');

      const prompt = buildWikiPrompt({
        wikiName: wiki.name,
        query,
        wikiContext,
      });

      const answer = await this.ctx.services.llm.chat(
        [
          { role: 'system', content: WIKI_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        { temperature: 0.35 },
      );

      const links = articles.map((article) => `[${article.title}](${article.url})`).join('\n');
      const imageUrl = articles.find((article) => article.imageUrl)?.imageUrl;

      const embed = {
        color: this.ctx.config.lineColor,
        title: query,
        description: answer,
        image: imageUrl ? { url: imageUrl } : undefined,
        fields: [{ name: 'Источники', value: links }],
        footer: buildFooter(interaction.client),
      };

      await interaction.followUp({ embeds: [embed] });
    } catch (error) {
      this.ctx.logger.error('Wiki answer generation failed:', error);
      await interaction.followUp('Не удалось получить ответ. Попробуйте позже.');
    }
  }
}
