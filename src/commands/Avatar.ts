import {
  ApplicationCommandOptionType,
  type ApplicationCommandOptionData,
  type ChatInputCommandInteraction,
} from 'discord.js';
import { ChatInputCommand } from '../structures/ChatInputCommand';

export class AvatarCommand extends ChatInputCommand {
  readonly name = 'avatar';
  readonly description = "Shows the specified member's avatar";
  readonly descriptionLocalizations = {
    ru: 'Расчехляет аватар указанного участника',
    uk: 'Розчехляє аватар вказаного користувача',
  };
  readonly options: ApplicationCommandOptionData[] = [
    {
      name: 'member',
      nameLocalizations: { ru: 'участник', uk: 'користувач' },
      type: ApplicationCommandOptionType.User,
      description: 'Member with an interesting avatar',
      descriptionLocalizations: {
        ru: 'Участник с интересным аватаром',
        uk: 'Користувач із цікавим аватаром',
      },
      required: true,
    },
  ];

  async run(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('member', true);
    await interaction.followUp(user.displayAvatarURL({ size: 1024 }));
  }
}
