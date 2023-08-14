import Discord from 'discord.js';
import { Command } from '../Command';
import { formateDate } from '../../custom/commonFunctions';

export const Timeout: Command = {
  name: 'timeout',
  description: 'Times this guild member out',
  descriptionLocalizations: {
    ru: 'Глушит пользователя на указанное время',
    uk: 'Глушить користувача на вказаний час',
  },
  options: [
    {
      name: 'member',
      nameLocalizations: {
        ru: 'пользователь',
        uk: 'користувач',
      },
      type: Discord.ApplicationCommandOptionType.User,
      description: 'Member to be timed out',
      descriptionLocalizations: {
        ru: 'Участник, которого необходимо заглушить',
        uk: 'Користувач, якого потрібно заглушити',
      },
      required: true,
    },
    {
      name: 'timeout',
      nameLocalizations: {
        ru: 'время',
        uk: 'час',
      },
      type: Discord.ApplicationCommandOptionType.Number,
      description: 'Timeout time (in hours)',
      descriptionLocalizations: {
        ru: 'Время тишины (в часах)',
        uk: 'Час тиші (у годинах)',
      },
      minValue: 0.1,
      maxValue: 168,
      required: true,
    },
    {
      name: 'reason',
      nameLocalizations: {
        ru: 'причина',
        uk: 'причина',
      },
      type: Discord.ApplicationCommandOptionType.String,
      description: 'A reason for timeout',
      descriptionLocalizations: {
        ru: 'Причина тихого часа',
        uk: 'Причина тихої години',
      },
      required: false,
    },
  ],
  type: Discord.ApplicationCommandType.ChatInput,
  defaultMemberPermissions: Discord.PermissionsBitField.Flags.ModerateMembers,
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
    if (!member.moderatable) {
      return interaction.followUp({
        content: 'У меня недостаточно прав!',
        ephemeral: true,
      });
    }
    const timeout =
      (interaction.options.get('timeout', true).value as number) * 3.6e6;
    const reason = interaction.options.get('reason', false)?.value as string;
    await member.timeout(timeout, reason).catch((e) => console.log(e));
    const date = new Date(new Date().getTime() + timeout);
    return interaction.followUp(
      Discord.userMention(member.id) +
        ' успешно заглушен до ' +
        formateDate(date)
    );
  },
};
