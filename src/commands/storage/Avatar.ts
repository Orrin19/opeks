import Discord from 'discord.js';
import { Command } from '../Command';

export const Avatar: Command = {
  name: 'avatar',
  description: "Shows the specified member's avatar",
  descriptionLocalizations: {
    ru: 'Расчехляет аватар указанного участника',
    uk: 'Розчехляє аватар вказаного користувача',
  },
  options: [
    {
      name: 'member',
      nameLocalizations: {
        ru: 'участник',
        uk: 'користувач',
      },
      type: Discord.ApplicationCommandOptionType.User,
      description: 'Member with an interesting avatar',
      descriptionLocalizations: {
        ru: 'Участник с интересным аватаром',
        uk: 'Користувач із цікавим аватаром',
      },
      required: true,
    },
  ],
  type: Discord.ApplicationCommandType.ChatInput,
  runChatInput: async (
    client: Discord.Client,
    interaction: Discord.ChatInputCommandInteraction
  ) => {
    const user = interaction.options.getUser('member', true);

    if (!user) {
      await interaction.followUp({
        content: 'Укажите корректного пользователя!',
        ephemeral: true,
      });
      return;
    }

    await interaction.followUp(
      user.displayAvatarURL({
        size: 1024,
      })
    );
  },
};
