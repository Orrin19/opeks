import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  type ApplicationCommandOptionData,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { ChatInputCommand } from '../structures/ChatInputCommand';
import type { AppContext } from '../core/AppContext';
import { buildFooter } from '../utils/embed';
import { formatDuration } from '../utils/time';
import { COLLECTOR_TTL_MS } from '../config/constants';

const VIDEO_BUTTON_ID = 'videoButton';

export class TracemoeCommand extends ChatInputCommand {
  readonly name = 'trace-moe';
  readonly description = 'Finds anime by frame from there';
  readonly descriptionLocalizations = {
    ru: 'Находит аниме по кадру оттуда',
    uk: 'Знаходить аніме по кадру звідти',
  };
  readonly options: ApplicationCommandOptionData[] = [
    {
      name: 'link',
      nameLocalizations: { ru: 'ссылка', uk: 'посилання' },
      type: ApplicationCommandOptionType.String,
      description: 'Image link',
      descriptionLocalizations: {
        ru: 'Ссылка на изображение',
        uk: 'Посилання на зображення',
      },
      required: true,
    },
  ];

  constructor(private readonly ctx: AppContext) {
    super();
  }

  async run(interaction: ChatInputCommandInteraction): Promise<void> {
    const link = interaction.options.getString('link', true);
    const request = await this.ctx.services.traceMoe.fetchAnime(link);

    if (!request || request.error || request.result.length === 0) {
      await interaction.followUp({
        content: 'Введите корректную ссылку на изображение!',
        ephemeral: true,
      });
      return;
    }

    const result = request.result[0];
    const isAdult = result.anilist?.isAdult;
    const title =
      result.anilist?.title?.english ||
      result.anilist?.title?.romaji ||
      result.anilist?.title?.native ||
      '~ Не удалось найти название ~';

    const embed = {
      title: 'Поиск аниме по кадру',
      color: this.ctx.config.lineColor,
      fields: [
        { name: 'Название', value: (isAdult ? '🔞 ' : '') + title },
        {
          name: 'Сходство',
          value: `${(result.similarity * 100).toFixed(2)} %`,
        },
        {
          name: 'Время',
          value: `${formatDuration(result.from)}–${formatDuration(result.to)}`,
        },
      ],
      image: { url: result.image },
      footer: buildFooter(interaction.client),
    };

    if (result.episode) {
      embed.fields.splice(1, 0, {
        name: 'Эпизод',
        value: String(result.episode),
      });
    }

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel('Смотреть видеофрагмент')
        .setStyle(ButtonStyle.Primary)
        .setCustomId(VIDEO_BUTTON_ID),
    );

    const reply = await interaction.followUp({
      embeds: [embed],
      components: [row],
    });

    const collector = reply.createMessageComponentCollector({
      filter: (i) => i.customId === VIDEO_BUTTON_ID && i.user.id === interaction.user.id,
      time: COLLECTOR_TTL_MS,
    });

    collector.on('collect', async (i) => {
      await i.deferUpdate();
      await reply.edit({ components: [] }).catch(() => undefined);
      if (i.channel?.isSendable()) {
        await i.channel.send({ files: [result.video] }).catch(() => undefined);
      }
    });

    collector.on('end', async () => {
      await reply.edit({ components: [] }).catch(() => undefined);
    });
  }
}
