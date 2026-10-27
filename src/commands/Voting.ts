import {
  ApplicationCommandOptionType,
  type APIEmbed,
  type ApplicationCommandOptionData,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { ChatInputCommand } from '../structures/ChatInputCommand';
import type { AppContext } from '../core/AppContext';
import { buildFooter } from '../utils/embed';
import { buildChoiceOptions } from './options';

const VOTE_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '0️⃣'] as const;

const OPTION_COUNT = 10;

export class VotingCommand extends ChatInputCommand {
  readonly name = 'voting';
  readonly description = 'Creates a vote';
  readonly descriptionLocalizations = {
    ru: 'Создаёт голосование',
    uk: 'Створює голосування',
  };
  readonly options: ApplicationCommandOptionData[] = [
    {
      name: 'description',
      nameLocalizations: { ru: 'описание', uk: 'опис' },
      type: ApplicationCommandOptionType.String,
      description: 'Voting description',
      descriptionLocalizations: {
        ru: 'Описание голосования',
        uk: 'Опис голосування',
      },
      required: true,
    },
    ...buildChoiceOptions(OPTION_COUNT),
    {
      name: 'image',
      nameLocalizations: { ru: 'изображение', uk: 'зображення' },
      type: ApplicationCommandOptionType.Attachment,
      description: 'Image for a voting',
      descriptionLocalizations: {
        ru: 'Изображение для голосования',
        uk: 'Зображення голосування',
      },
      required: false,
    },
  ];

  constructor(private readonly ctx: AppContext) {
    super();
  }

  async run(interaction: ChatInputCommandInteraction): Promise<void> {
    const description = interaction.options.getString('description', true);
    const image = interaction.options.getAttachment('image');

    const variables = Array.from({ length: OPTION_COUNT }, (_, i) => {
      const option = interaction.options.getString(`option_${i + 1}`);
      return option ? `${VOTE_EMOJIS[i]} ${option}` : null;
    }).filter((value): value is string => value !== null);

    const voteEmbed: APIEmbed = {
      color: this.ctx.config.lineColor,
      title: 'Голосование',
      description,
      fields: variables.length > 0 ? [{ name: 'Варианты', value: variables.join('\n') }] : [],
      footer: buildFooter(interaction.client),
    };

    if (image) voteEmbed.image = { url: image.url };

    const message = await interaction.followUp({ embeds: [voteEmbed] });
    for (let i = 0; i < variables.length; i++) {
      await message.react(VOTE_EMOJIS[i]);
    }
  }
}
