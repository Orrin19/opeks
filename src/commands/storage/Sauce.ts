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
  run: async (
    client: Discord.Client,
    interaction: Discord.CommandInteraction
  ) => {
    let imageURL = '';
    const attachment = interaction.options.get('image', false)?.attachment;
    if (!attachment) {
      imageURL = interaction.options.get('link', false)?.value as string;
      if (!imageURL) {
        await interaction.followUp({
          content: 'Пожалуйста, прикрепите изображение или введите ссылку',
          ephemeral: true,
        });
        return;
      }
    } else {
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
