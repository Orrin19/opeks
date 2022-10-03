import Discord from 'discord.js';
import { Command } from '../Command';
import { Footer } from '../custom/Footer';
import config from '../config';

export const Serverinfo: Command = {
  name: 'serverinfo',
  description: 'Выводит информацию о сервере.',
  type: Discord.ApplicationCommandType.ChatInput,
  run: async (
    client: Discord.Client,
    interaction: Discord.CommandInteraction
  ) => {
    const guild = interaction.guild as Discord.Guild;
    const guildOwner = guild.members.cache.get(
      guild.ownerId
    ) as Discord.GuildMember;
    if (!guildOwner)
      return console.log('guildOwner not found', guild.ownerId, guildOwner);
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
          value: `
          **Название:** *${guild.name}*
          **ID:** *${guild.id}*
          **Создан:** *${
            guild.createdAt.toLocaleDateString('ru', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric',
            }) as string
          }*
          **Владелец:** *${guildOwner.user.username}*
        `,
        },
        {
          name: ':mens: Участники:',
          value: `
          **Количество участников:** *${guild.memberCount}*
          **Количество ролей:** *${guild.roles.cache.size}*
          **Вы присоединились:** *${
            (
              interaction.member as Discord.GuildMember
            ).joinedAt?.toLocaleDateString('ru', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric',
            }) as string
          }*
        `,
        },
      ],
      footer: new Footer(interaction),
    };
    interaction.followUp({
      embeds: [serverinfoEmbed],
    });
  },
};
