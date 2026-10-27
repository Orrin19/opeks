import {
  GuildMember,
  userMention,
  type APIEmbed,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { ChatInputCommand } from '../structures/ChatInputCommand';
import type { AppContext } from '../core/AppContext';
import { buildFooter } from '../utils/embed';
import { formatDate } from '../utils/time';

export class ServerinfoCommand extends ChatInputCommand {
  readonly name = 'serverinfo';
  readonly description = 'Displays information about the guild';
  readonly descriptionLocalizations = {
    ru: 'Выводит информацию о сервере',
    uk: 'Видає інформацію о сервер',
  };

  constructor(private readonly ctx: AppContext) {
    super();
  }

  async run(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild;
    const member = interaction.member;
    if (!guild || !(member instanceof GuildMember)) {
      await interaction.followUp('Команда доступна только на сервере.');
      return;
    }

    const iconURL = guild.iconURL({ size: 1024 });
    const serverinfoEmbed: APIEmbed = {
      color: this.ctx.config.lineColor,
      title: 'Информация о сервере',
      thumbnail: iconURL ? { url: iconURL } : undefined,
      fields: [
        {
          name: ':globe_with_meridians: Основные данные:',
          value:
            `**Название:** *${guild.name}*\n` +
            `**ID:** *${guild.id}*\n` +
            `**Создан:** *${formatDate(guild.createdAt)}*\n` +
            `**Владелец:** *${userMention(guild.ownerId)}*`,
        },
        {
          name: ':mens: Участники:',
          value:
            `**Количество участников:** *${guild.memberCount}*\n` +
            `**Количество ролей:** *${guild.roles.cache.size}*\n` +
            `**Вы присоединились:** *${formatDate(
              member.joinedAt ?? new Date(0),
            )}*`,
        },
      ],
      footer: buildFooter(interaction.client),
    };

    await interaction.followUp({ embeds: [serverinfoEmbed] });
  }
}
