import Discord from 'discord.js';
import { Command } from '../Command';
import { Footer } from '../custom/Footer';
import { formateDate } from '../custom/commonFunctions';
import config from '../config';

export const Serverinfo: Command = {
  name: 'serverinfo',
  description: 'Displays information about the guild',
  descriptionLocalizations: {
    ru: 'Выводит информацию о сервере',
    uk: 'Видає інформацію о сервер',
  },
  type: Discord.ApplicationCommandType.ChatInput,
  run: async (
    client: Discord.Client,
    interaction: Discord.CommandInteraction
  ) => {
    const guild = interaction.guild as Discord.Guild;
    const serverinfoEmbed: Discord.APIEmbed = {
      color: Number(config.LINE_COLOR),
      title: 'Информация о сервере',
      thumbnail: {
        url: guild.iconURL({
          size: 1024,
        }) as string,
      },
      fields: [
        {
          name: ':globe_with_meridians: Основные данные:',
          value:
            `**Название:** *${guild.name}*\n` +
            `**ID:** *${guild.id}*\n` +
            `**Создан:** *${formateDate(guild.createdAt)}*\n` +
            `**Владелец:** *${Discord.userMention(guild.ownerId)}*`,
        },
        {
          name: ':mens: Участники:',
          value:
            `**Количество участников:** *${guild.memberCount}*\n` +
            `**Количество ролей:** *${guild.roles.cache.size}*\n` +
            `**Вы присоединились:** *${formateDate(
              (interaction.member as Discord.GuildMember).joinedAt as Date
            )}*`,
        },
      ],
      footer: new Footer(interaction),
    };
    interaction.followUp({
      embeds: [serverinfoEmbed],
    });
  },
};
