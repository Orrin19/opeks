import {
  ApplicationCommandOptionType,
  GuildMember,
  PermissionsBitField,
  userMention,
  type ApplicationCommandOptionData,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { ChatInputCommand } from '../structures/ChatInputCommand';
import { formatDate, hoursToMs } from '../utils/time';
import { TIMEOUT_MAX_HOURS, TIMEOUT_MIN_HOURS } from '../config/constants';

export class TimeoutCommand extends ChatInputCommand {
  readonly name = 'timeout';
  readonly description = 'Times this guild member out';
  readonly descriptionLocalizations = {
    ru: 'Глушит пользователя на указанное время',
    uk: 'Глушить користувача на вказаний час',
  };
  readonly defaultMemberPermissions = PermissionsBitField.Flags.ModerateMembers;
  readonly options: ApplicationCommandOptionData[] = [
    {
      name: 'member',
      nameLocalizations: { ru: 'пользователь', uk: 'користувач' },
      type: ApplicationCommandOptionType.User,
      description: 'Member to be timed out',
      descriptionLocalizations: {
        ru: 'Участник, которого необходимо заглушить',
        uk: 'Користувач, якого потрібно заглушити',
      },
      required: true,
    },
    {
      name: 'timeout',
      nameLocalizations: { ru: 'время', uk: 'час' },
      type: ApplicationCommandOptionType.Number,
      description: 'Timeout time (in hours)',
      descriptionLocalizations: {
        ru: 'Время тишины (в часах)',
        uk: 'Час тиші (у годинах)',
      },
      minValue: TIMEOUT_MIN_HOURS,
      maxValue: TIMEOUT_MAX_HOURS,
      required: true,
    },
    {
      name: 'reason',
      nameLocalizations: { ru: 'причина', uk: 'причина' },
      type: ApplicationCommandOptionType.String,
      description: 'A reason for timeout',
      descriptionLocalizations: {
        ru: 'Причина тихого часа',
        uk: 'Причина тихої години',
      },
      required: false,
    },
  ];

  async run(interaction: ChatInputCommandInteraction): Promise<void> {
    const member = interaction.options.getMember('member');
    if (!(member instanceof GuildMember)) {
      await interaction.followUp({
        content: 'Укажите корректного участника!',
        ephemeral: true,
      });
      return;
    }
    if (!member.moderatable) {
      await interaction.followUp({
        content: 'У меня недостаточно прав!',
        ephemeral: true,
      });
      return;
    }

    const hours = interaction.options.getNumber('timeout', true);
    const timeoutMs = hoursToMs(hours);
    const reason = interaction.options.getString('reason') ?? undefined;

    await member.timeout(timeoutMs, reason);
    const date = new Date(Date.now() + timeoutMs);
    await interaction.followUp(`${userMention(member.id)} успешно заглушен до ${formatDate(date)}`);
  }
}
