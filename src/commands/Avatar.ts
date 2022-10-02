import Discord from 'discord.js';
import { Command } from '../Command';

export const Avatar: Command = {
  name: 'avatar',
  description: 'Расчехляет аватар указанного пользователя.',
  options: [
    {
      name: 'участник',
      type: Discord.ApplicationCommandOptionType.Mentionable,
      description: 'Участник с интересным аватаром.',
      required: true,
    },
  ],
  type: Discord.ApplicationCommandType.ChatInput,
  run: async (
    client: Discord.Client,
    interaction: Discord.CommandInteraction
  ) => {
    const user = interaction.options.get('участник', true).user as Discord.User;
    return interaction.followUp(
      user.displayAvatarURL({
        size: 1024,
      })
    );
  },
};
