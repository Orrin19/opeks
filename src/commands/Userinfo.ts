import {
  ApplicationCommandOptionType,
  GuildMember,
  roleMention,
  userMention,
  type ApplicationCommandOptionData,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { ChatInputCommand } from '../structures/ChatInputCommand';
import type { AppContext } from '../core/AppContext';
import { buildFooter } from '../utils/embed';
import { formatDate } from '../utils/time';

export class UserinfoCommand extends ChatInputCommand {
  readonly name = 'userinfo';
  readonly description = 'Displays member information';
  readonly descriptionLocalizations = {
    ru: 'Выводит информацию об участнике',
    uk: 'Виводить інформацію про користувача',
  };
  readonly options: ApplicationCommandOptionData[] = [
    {
      name: 'member',
      nameLocalizations: { ru: 'участник', uk: 'користувач' },
      type: ApplicationCommandOptionType.User,
      description: 'Investigated member',
      descriptionLocalizations: {
        ru: 'Исследуемый участник',
        uk: 'Досліджуваний користувач',
      },
      required: true,
    },
  ];

  constructor(private readonly ctx: AppContext) {
    super();
  }

  async run(interaction: ChatInputCommandInteraction): Promise<void> {
    const member = interaction.options.getMember('member');
    if (!(member instanceof GuildMember)) {
      await interaction.followUp({
        content: 'Укажите корректного участника!',
        ephemeral: true,
      });
      return;
    }

    const user = member.user;
    const userinfoEmbed = {
      color: this.ctx.config.lineColor,
      title: 'Информация о пользователе',
      thumbnail: {
        url: user.displayAvatarURL({ size: 1024 }),
      },
      fields: [
        {
          name: ':globe_with_meridians: Основные данные:',
          value:
            `**Пользователь:** *${userMention(user.id)}*\n` +
            `**ID:** *${user.id}*\n` +
            `**Создан:** *${formatDate(user.createdAt)}*`,
        },
        {
          name: ':map: На этом сервере:',
          value:
            `**Присоединился:** *${formatDate(member.joinedAt ?? new Date(0))}*\n` +
            `**Роли:** *${member.roles.cache
              .map((role) => roleMention(role.id))
              .slice(0, -1)
              .join(' • ')}*`,
        },
      ],
      footer: buildFooter(interaction.client),
    };

    await interaction.followUp({ embeds: [userinfoEmbed] });
  }
}
