import Discord from 'discord.js';
import { Command } from '../Command';
import { Footer } from '../custom/Footer';
import { formateDate } from '../custom/commonFunctions';
import config from '../config';

export const Userinfo: Command = {
  name: 'userinfo',
  description: 'Displays member information',
  descriptionLocalizations: {
    ru: 'Выводит информацию об участнике',
    uk: 'Виводить інформацію про користувача',
  },
  options: [
    {
      name: 'member',
      nameLocalizations: {
        ru: 'участник',
        uk: 'користувач',
      },
      type: Discord.ApplicationCommandOptionType.User,
      description: 'Investigated member',
      descriptionLocalizations: {
        ru: 'Исследуемый участник',
        uk: 'Досліджуваний користувач',
      },
      required: true,
    },
  ],
  type: Discord.ApplicationCommandType.ChatInput,
  run: async (
    client: Discord.Client,
    interaction: Discord.CommandInteraction
  ) => {
    const member = interaction.options.get('member', true)
      .member as Discord.GuildMember;
    if (!member) {
      return interaction.followUp({
        content: 'Укажите корректного участника!',
        ephemeral: true,
      });
    }
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
          value:
            `**Пользователь:** *${Discord.userMention(user.id)}*\n` +
            `**ID:** *${user.id}*\n` +
            `**Создан:** *${formateDate(user.createdAt)}*`,
        },
        {
          name: ':map: На этом сервере:',
          value:
            `**Присоединился:** *${formateDate(member.joinedAt as Date)}*\n` +
            `**Роли:** *${member.roles.cache
              .map((r) => Discord.roleMention(r.id))
              .slice(0, -1)
              .join(' • ')}*`,
        },
      ],
      footer: new Footer(interaction),
    };
    interaction.followUp({
      embeds: [userinfoEmbed],
    });
  },
};
