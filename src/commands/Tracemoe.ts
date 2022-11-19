import Discord from 'discord.js';
import { TraceMoe } from 'trace.moe.ts';
import { Command } from '../Command';
import { Footer } from '../custom/Footer';
import config from '../config';

export const Tracemoe: Command = {
  name: 'trace-moe',
  description: 'Finds anime by frame from there',
  descriptionLocalizations: {
    ru: 'Находит аниме по кадру оттуда',
    uk: 'Знаходить аніме по кадру звідти',
  },
  options: [
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
      required: true,
    },
  ],
  type: Discord.ApplicationCommandType.ChatInput,
  run: async (
    client: Discord.Client,
    interaction: Discord.CommandInteraction
  ) => {
    const api = new TraceMoe();
    const link = interaction.options.get('link', true)?.value as string;
    const request = await api.fetchAnime(link);
    if (request.error)
      return interaction.followUp({
        content: 'Введите корректную ссылку на изображение!',
        ephemeral: true,
      });
    const nekoEmbed: Discord.APIEmbed = {
      title: 'trace.moe',
      color: Number(config.LINE_COLOR),
      fields: [
        { name: 'Ближайшее совпадение', value: request.result[0].filename },
        {
          name: 'Эпизод',
          value: request.result[0].episode as unknown as string,
        },
        {
          name: 'Сходство',
          value: (request.result[0].similarity * 100).toFixed(2) + ' %',
        },
      ],
      image: { url: request.result[0].image },
      footer: new Footer(interaction),
    };
    return await interaction.followUp({
      embeds: [nekoEmbed],
    });
  },
};
