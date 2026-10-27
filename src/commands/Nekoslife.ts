import {
  ApplicationCommandOptionType,
  type ApplicationCommandOptionData,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { ChatInputCommand } from '../structures/ChatInputCommand';
import type { AppContext } from '../core/AppContext';
import { buildFooter } from '../utils/embed';
import type { NekosCategory } from '../services';

const CATEGORIES: readonly NekosCategory[] = [
  'smug',
  'baka',
  'tickle',
  'slap',
  'poke',
  'pat',
  'neko',
  'nekoGif',
  'meow',
  'lizard',
  'kiss',
  'hug',
  'foxGirl',
  'feed',
  'cuddle',
  'kemonomimi',
  'holo',
  'woof',
  'wallpaper',
  'goose',
  'gecg',
  'avatar',
  'waifu',
];

export class NekoslifeCommand extends ChatInputCommand {
  readonly name = 'nekos-life';
  readonly description = 'Gets cute image';
  readonly descriptionLocalizations = {
    ru: 'Добывает красивую картинку',
    uk: 'Добуває красиву картинку',
  };
  readonly options: ApplicationCommandOptionData[] = [
    {
      name: 'request',
      nameLocalizations: { ru: 'запрос', uk: 'запит' },
      type: ApplicationCommandOptionType.String,
      description: 'Image request',
      descriptionLocalizations: {
        ru: 'Запрос картинки',
        uk: 'Запит картинки',
      },
      choices: CATEGORIES.map((category) => ({
        name: category,
        value: category,
      })),
      required: true,
    },
  ];

  constructor(private readonly ctx: AppContext) {
    super();
  }

  async run(interaction: ChatInputCommandInteraction): Promise<void> {
    const request = interaction.options.getString(
      'request',
      true,
    ) as NekosCategory;

    try {
      const image = await this.ctx.services.nekos.getImage(request);
      const nekoEmbed = {
        color: this.ctx.config.lineColor,
        image: { url: image.url },
        footer: buildFooter(interaction.client),
      };
      await interaction.followUp({ embeds: [nekoEmbed] });
    } catch {
      await interaction.followUp({
        content: 'Возникла ошибка при выполнении команды',
        ephemeral: true,
      });
    }
  }
}
