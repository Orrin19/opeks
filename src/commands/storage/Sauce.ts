import Discord from 'discord.js';
import sagiri from 'sagiri';
import { Command } from '../Command';
import { Footer } from '../../custom/Footer';
import config from '../../config';

export const Sauce: Command = {
  name: 'sauce',
  description: 'Finds anime art from pixiv, twitter, etc',
  descriptionLocalizations: {
    ru: 'Находит аниме-арт из pixiv, twitter, других ресурсов',
    uk: 'Знаходить аніме-арт з pixiv, twitter, інших ресурсів',
  },
  options: [
    {
      name: 'image',
      nameLocalizations: {
        ru: 'изображение',
        uk: 'зображення',
      },
      type: Discord.ApplicationCommandOptionType.Attachment,
      description: 'Attach your image',
      descriptionLocalizations: {
        ru: 'Прикрепите своё изображение',
        uk: 'Прикріпіть своє зображення',
      },
      required: false,
    },
    {
      name: 'link',
      nameLocalizations: {
        ru: 'ссылка',
        uk: 'посилання',
      },
      type: Discord.ApplicationCommandOptionType.String,
      description: 'Image link',
      descriptionLocalizations: {
        ru: 'Ссылка на изображение',
        uk: 'Посилання на зображення',
      },
      required: false,
    },
  ],
  type: Discord.ApplicationCommandType.ChatInput,
  runChatInput: async (
    client: Discord.Client,
    interaction: Discord.ChatInputCommandInteraction
  ) => {
    let imageURL: string | null = '';
    const attachment = interaction.options.getAttachment('image');
    if (!attachment) {
      let imageURL = interaction.options.getString('link');
      if (!imageURL) {
        await interaction.followUp({
          content: 'Пожалуйста, прикрепите изображение или введите ссылку',
          ephemeral: true,
        });
        return;
      }
    } else {
      if (
        attachment.contentType?.split('/')[0] !== 'image' ||
        attachment.contentType.includes('svg+xml') ||
        attachment.contentType.includes('vnd') ||
        attachment.contentType.includes('tiff')
      ) {
        await interaction.followUp({
          content: 'Пожалуйста, прикрепите изображение',
          ephemeral: true,
        });
        return;
      }
      imageURL = attachment!.url;
    }
    const apiClient = sagiri(config.SAUCE_TOKEN);
    const results = await apiClient(imageURL);
    const result = results[0];

    const embed: Discord.APIEmbed = {
      color: Number(config.LINE_COLOR),
      image: { url: result.thumbnail },
      fields: [
        {
          name: 'Источник',
          value: result.site,
        },
        {
          name: 'Автор',
          value: result.authorName || 'Неизвестен',
        },
        {
          name: 'Процент схожести',
          value: result.similarity + '%',
        },
        {
          name: 'Ссылка',
          value: result.url,
        },
      ],
      footer: new Footer(interaction),
    };

    await interaction.followUp({
      embeds: [embed],
    });
  },
};
