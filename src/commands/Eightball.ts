import {
  ApplicationCommandOptionType,
  type ApplicationCommandOptionData,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { ChatInputCommand } from '../structures/ChatInputCommand';
import type { AppContext } from '../core/AppContext';
import { buildFooter } from '../utils/embed';
import { getRandomInt } from '../utils/random';
import { EIGHTBALL_BASE_URL, EIGHTBALL_IMAGE_COUNT } from '../config/constants';

export class EightballCommand extends ChatInputCommand {
  readonly name = '8ball';
  readonly description = 'Asks 8ball for an answer';
  readonly descriptionLocalizations = {
    ru: 'Спрашивает ответ у 8ball',
    uk: 'Запитує відповідь у 8ball',
  };
  readonly options: ApplicationCommandOptionData[] = [
    {
      name: 'question',
      nameLocalizations: { ru: 'вопрос', uk: 'питання' },
      type: ApplicationCommandOptionType.String,
      description: 'Ask your question',
      descriptionLocalizations: {
        ru: 'Задайте свой вопрос',
        uk: 'Поставте своє питання',
      },
      required: true,
    },
  ];

  constructor(private readonly ctx: AppContext) {
    super();
  }

  async run(interaction: ChatInputCommandInteraction): Promise<void> {
    const question = interaction.options.getString('question', true);
    const ballEmbed = {
      color: this.ctx.config.lineColor,
      title: `Вопрос от ${interaction.member?.user.username}:`,
      description: question,
      image: {
        url: `${EIGHTBALL_BASE_URL}/${getRandomInt(0, EIGHTBALL_IMAGE_COUNT - 1)}.png`,
      },
      footer: buildFooter(interaction.client),
    };

    await interaction.followUp({ embeds: [ballEmbed] });
  }
}
