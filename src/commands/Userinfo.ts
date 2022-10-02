import Discord from 'discord.js';
import { Command } from '../Command';
import { Footer } from '../custom/Footer';
import config from '../config';

export const Userinfo: Command = {
  name: 'userinfo',
  description: 'Выводит информацию об участнике.',
  options: [
    {
      name: 'участник',
      type: Discord.ApplicationCommandOptionType.Mentionable,
      description: 'Исследуемый объект',
      required: true,
    },
  ],
  type: Discord.ApplicationCommandType.ChatInput,
  run: async (
    client: Discord.Client,
    interaction: Discord.CommandInteraction
  ) => {
    const member = interaction.options.get('участник', true)
      .member as Discord.GuildMember;
    const user = member.user;
    const nickname = member.nickname || user.username;
    const userinfoEmbed: Discord.APIEmbed = {
      color: Number(config.LINE_COLOR),
      title: 'Информация о пользователе',
      thumbnail: {
        url: (user as Discord.User).displayAvatarURL({
          size: 1024,
        }) as string,
      },
      fields: [
        {
          name: ':globe_with_meridians: Основные данные:',
          value: `
            **Имя:** *${user.username}#${user.discriminator}*
            **ID:** *${user.id}*
            **Создан:** *${
              user.createdAt.toLocaleDateString('ru', {
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
        {
          name: ':map: На этом сервере:',
          value: `
            **Никнейм:** *${nickname}*
            **Присоединился:** *${
              member.joinedAt?.toLocaleDateString('ru', {
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
      embeds: [userinfoEmbed],
    });
  },
};
