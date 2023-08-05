import Discord from 'discord.js';
import { TraceMoe } from 'trace.moe.ts';
import { Command } from '../Command';
import { Footer } from '../custom/Footer';
import config from '../config';
import { getTime } from '../custom/commonFunctions';
import { SearchResponse } from 'trace.moe.ts/dist/structures/SearchResponse';

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
    const request = (await api
      .fetchAnime(link, { anilistInfo: true })
      .catch(console.error)) as SearchResponse;
    if (!request || request.error)
      return interaction.followUp({
        content: 'Введите корректную ссылку на изображение!',
        ephemeral: true,
      });
    const tmEmbed: Discord.APIEmbed = {
      title: 'Поиск аниме по кадру',
      color: Number(config.LINE_COLOR),
      fields: [
        {
          name: 'Название',
          value:
            (request.result[0].anilist.isAdult ? '🔞 ' : '') +
            (request.result[0].anilist.title.english
              ? request.result[0].anilist.title.english
              : request.result[0].anilist.title.romaji
              ? request.result[0].anilist.title.romaji
              : request.result[0].anilist.title.native
              ? request.result[0].anilist.title.native
              : '~ Не удалось найти название ~'),
        },
        {
          name: 'Сходство',
          value: (request.result[0].similarity * 100).toFixed(2) + ' %',
        },
        {
          name: 'Время',
          value:
            getTime(request.result[0].from) +
            '–' +
            getTime(request.result[0].to),
        },
      ],
      image: { url: request.result[0].image },
      footer: new Footer(interaction),
    };
    if (request.result[0].episode) {
      tmEmbed.fields?.splice(1, 0, {
        name: 'Эпизод',
        value: request.result[0].episode as unknown as string,
      });
    }
    const component =
      new Discord.ActionRowBuilder<Discord.ButtonBuilder>().addComponents(
        new Discord.ButtonBuilder()
          .setLabel('Смотреть видеофрагмент')
          .setStyle(Discord.ButtonStyle.Primary)
          .setCustomId('videoButton')
      );
    return await interaction
      .followUp({
        embeds: [tmEmbed],
        // components: [component],
      })
      .then((msg) => {
        const filter = (i: any) =>
          i.customId === 'videoButton' && i.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({
          filter,
          time: 60000,
        });
        collector.on('collect', async (_) => {
          await msg.edit({ components: [] });
          msg.channel?.send({ files: [request.result[0].video] });
        });
        collector.on('end', async (_) => {
          await msg.edit({ components: [] });
        });
      });
  },
};
