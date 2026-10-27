import {
  ApplicationCommandOptionType,
  type ApplicationCommandOptionData,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { ChatInputCommand } from '../structures/ChatInputCommand';
import type { AppContext } from '../core/AppContext';
import { buildFooter } from '../utils/embed';

const isImageContentType = (contentType: string | null): boolean => {
  if (!contentType) return false;
  return (
    contentType.startsWith('image/') &&
    !contentType.includes('svg+xml') &&
    !contentType.includes('vnd') &&
    !contentType.includes('tiff')
  );
};

export class SauceCommand extends ChatInputCommand {
  readonly name = 'sauce';
  readonly description = 'Finds anime art from pixiv, twitter, etc';
  readonly descriptionLocalizations = {
    ru: 'Находит аниме-арт из pixiv, twitter, других ресурсов',
    uk: 'Знаходить аніме-арт з pixiv, twitter, інших ресурсів',
  };
  readonly options: ApplicationCommandOptionData[] = [
    {
      name: 'image',
      nameLocalizations: { ru: 'изображение', uk: 'зображення' },
      type: ApplicationCommandOptionType.Attachment,
      description: 'Attach your image',
      descriptionLocalizations: {
        ru: 'Прикрепите своё изображение',
        uk: 'Прикріпіть своє зображення',
      },
      required: false,
    },
    {
      name: 'link',
      nameLocalizations: { ru: 'ссылка', uk: 'посилання' },
      type: ApplicationCommandOptionType.String,
      description: 'Image link',
      descriptionLocalizations: {
        ru: 'Ссылка на изображение',
        uk: 'Посилання на зображення',
      },
      required: false,
    },
  ];

  constructor(private readonly ctx: AppContext) {
    super();
  }

  async run(interaction: ChatInputCommandInteraction): Promise<void> {
    const attachment = interaction.options.getAttachment('image');
    const link = interaction.options.getString('link');

    let imageUrl: string;
    if (attachment) {
      if (!isImageContentType(attachment.contentType)) {
        await interaction.followUp({
          content: 'Пожалуйста, прикрепите изображение',
          ephemeral: true,
        });
        return;
      }
      imageUrl = attachment.url;
    } else if (link) {
      imageUrl = link;
    } else {
      await interaction.followUp({
        content: 'Пожалуйста, прикрепите изображение или введите ссылку',
        ephemeral: true,
      });
      return;
    }

    try {
      const result = await this.ctx.services.sauce.search(imageUrl);
      if (!result) {
        await interaction.followUp({
          content: 'Ничего не найдено.',
          ephemeral: true,
        });
        return;
      }

      const embed = {
        color: this.ctx.config.lineColor,
        image: { url: result.thumbnail },
        fields: [
          { name: 'Источник', value: result.site },
          { name: 'Автор', value: result.authorName || 'Неизвестен' },
          { name: 'Процент схожести', value: `${result.similarity}%` },
          { name: 'Ссылка', value: result.url },
        ],
        footer: buildFooter(interaction.client),
      };

      await interaction.followUp({ embeds: [embed] });
    } catch (error) {
      this.ctx.logger.warn('Sauce lookup failed:', error);
      await interaction.followUp({
        content: 'Возникла ошибка при выполнении команды',
        ephemeral: true,
      });
    }
  }
}
