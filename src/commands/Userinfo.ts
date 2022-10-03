import Discord from 'discord.js';
import { Command } from '../Command';
import { Footer } from '../custom/Footer';
import { formateDate } from '../custom/commonFunctions';
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
            **Пользователь:** *${Discord.userMention(user.id)}*
            **ID:** *${user.id}*
            **Создан:** *${formateDate(user.createdAt)}*
          `,
        },
        {
          name: ':map: На этом сервере:',
          value: `
            **Присоединился:** *${formateDate(member.joinedAt as Date)}*
            **Роли:** *${member.roles.cache
              .map((r) => Discord.roleMention(r.id))
              .slice(0, -1)
              .join(' • ')}*
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
