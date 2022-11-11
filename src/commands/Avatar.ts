import Discord from 'discord.js';
import { Command } from '../Command';

export const Avatar: Command = {
  name: 'avatar',
  description: "Shows the specified user's avatar",
  descriptionLocalizations: {
    ru: 'Расчехляет аватар указанного пользователя',
    uk: 'Розчехляє аватар вказаного користувача',
  },
  options: [
    {
      name: 'user',
      nameLocalizations: {
        ru: 'пользователь',
        uk: 'користувач',
      },
      type: Discord.ApplicationCommandOptionType.Mentionable,
      description: 'User with an interesting avatar',
      descriptionLocalizations: {
        ru: 'Пользователь с интересным аватаром',
        uk: 'Користувач із цікавим аватаром',
      },
      required: true,
    },
  ],
  type: Discord.ApplicationCommandType.ChatInput,
  run: async (
    client: Discord.Client,
    interaction: Discord.CommandInteraction
  ) => {
    const user = interaction.options.get('user', true).user as Discord.User;
    if (!user) {
      return interaction.followUp({
        content: 'Укажите корректного пользователя!',
        ephemeral: true,
      });
    }
    return interaction.followUp(
      user.displayAvatarURL({
        size: 1024,
      })
    );
  },
};
